/**  
 * Helium data grid.  
 * Documented in grid.md.
**/
;(function(){  
  var doc   = document;
  var docel = doc.documentElement;
  var evaluate = he.util.evaluate;
  var dformat = he.util.date.format;
  var iconHTML = he.util.iconHTML;
  var findUp = he.util.findUp;
  var cssClass = he.util.cssClass;
  
  /**  
   * This is the default grid configuration.
   * It's mixed in with the user's configuration where needed.
  **/
  var defaults = {
    global: {
      autoHeight: false,            // If true, the grid element will automatically grow to accomodate all rows
      wordBreak: true,              // If true, the cells won't have text-overflow ellipsis and rows will differ in height
      pagination: {                 // The pagination config
        element: null,
        size:    50,
        links:   7
      },

      dataSize: function(data){},   // A function used for getting the length of the entire datase
      pageSize: function(data){     // A function used for getting the length of the current page of the dataset
        return data.length;
      },
      getRow: function(data, i){    // A function used for getting the row with index "i" from the data
        return data[i];
      },
      getCell: function(row, name){ // A function used for getting the cell with name "name" from the data
        return row[name];
      },
      onEdit: function(rowIndex,    // A function called when a grid edit happens
        colName, value){ 
      },
      reset: function(colName, filters){ }
    },
    rows: {
      attrs: null,                  // If a function, should return html attributes for each row
    },
    column: {
      resizable: false,             // If a function/true will make column resizable
      sortable: null,               // If a function/true will make column sortable
      filterable: null,             // If a function/true will make column filterable
      editable: null,               // If a function/true will make cell editable
      show: true,                   // If a function/false will not show the column
      hideable: true,               // If a function/false will prevent the column from hiding
      typeInfo: {},                 
      filterOptions: {},            // A dict/function returning a dict - the type and options for the filter widget
      editOptions: {},              // A dict/function returning a dict -  the type and options for the edit widget
      actions: null,                // A dict/function returning a dict - the actions to be rendered in a cell
    }
  }
  
  // This is a helper function that will create 
  // HTML attributes from an Object. It also converts 
  // any objects at the "style" key into valid css.
  // TODO: optimize this, takes about 120ms for 10K iterations on a 5-item dict
  function makeattrs(attrs){
    if(!attrs) { return ""; }

    return _.map(attrs, function(val, key){
      if(key === "style"){
        return "style='" + _.map(val, function(val, key){
          return key + ":" + (typeof val === "number" ? val + "px" : val) + ";";
        }).join("") + "'";
      }
      else {
        return key + "='" + val + "'";
      }
    }).join(" ");
  }

  he.controls.grid = Grid;
  function Grid(element, options){
    var self = this;

    // Inherits from control
    he.abstract.control.call(this, element, _.defaults(options, {}));
    
    // A reference to the data source
    this.$data = options.data || [];
        
    // Keeps listeners that need to be detached upon render
    this.$events = {};
    
    // Keeps a reference to all header cell menus
    this.$menus = {};

    // Keeps a reference to the currently open menu
    this.$activeMenu = null;
    
    // Keeps the current pagination page
    this.$currentPage = 1;
    
    // Keeps the sorting state
    this.$sorting = {};
    
    // Keeps the filters state
    this.$filters = {};
    
    // Keeps the filter contorls
    this.$controls = {};
    
    // Set initial configuration
    this.$global = {};
    this.$rows = {};
    this.$cstate = {};
    this.config(_.merge({}, defaults, options.config));
    
    // Subscribe to delegated global events
    this.$subscribe('global:mousedown');
    this.$subscribe('global:mouseup');
    this.$subscribe('global:mousemove');
    this.$subscribe('global:click');

    // Open menu when clicking on the header icon
    this.on('global:click', function(e){
      if(this.el.contains(e.target)) {
        var target;
        // Check if menu was requested
        if(target = findUp(e.target, 'class', 'he-opts')) {
          return this.$openMenu(target);
        }
        else if(target = findUp(e.target, 'class', 'he-action-icon')){
          var row = findUp(target, 'class', 'he-row');
          var item = this.$global.getRow(this.$data, row.getAttribute('data-row'));
          return this.trigger('action:' + target.getAttribute('data-event'), item);
        }
      }
    });

    // Hide menus when scrolling the body
    this.on('he:scroll', function(e){
      this.$activeMenu && this.$activeMenu.close();
    });
  }

  Grid.prototype = he.util.inherits(he.abstract.control.prototype, he.mixins.gridEdit, he.mixins.gridFilter, he.mixins.gridResizing, {
    MIN_COL_WIDTH: 50,
    $o: {},

    $init: function(){
      var self = this;

      this.el.classList.add('he-grid');
      window.addEventListener('resize', _.debounce(function(){
        self.render();
      }, 250));
    },

    // Goes over the $cstate object and transforms 
    // some keys into more manageable data structures
    $prepareState: function(){
      this.$cstate.forEach(function(cstate){
        if(!_.isPlainObject(cstate.typeInfo)){
          cstate.typeInfo = { type: cstate.typeInfo || "text" }
        }
        var info = cstate.typeInfo;

        // For enums, prepare a quick-access map
        if(info.type === 'enum'){
          info.items = info.items || [];
          if(_.isFunction(info.tget) && _.isFunction(info.vget)){
            info.$valmap = {};
            for(var i=0, ii=info.items.length; i<ii; ++i){
              info.$valmap[info.vget(info.items[i])] = info.tget(info.items[i]);
            }
          }
        }
      });
    },
    
    // Attaches an event listener that can be removed later
    $addListener: function(target, event, cb){
      if(!(event in this.$events)){
        this.$events[event] = [];
      }
      this.$events[event].push({ target: target, cb: cb });
      target.addEventListener(event, cb);
    },

    // Removes event listeners
    $cleanup: function(){
      var lst, name;
      for(name in this.$events){
        while(lst = this.$events[name].shift()){
          lst.target.removeEventListener(name, lst.cb);
        }
      }
    },

    // Renders the contents of an action cell
    $renderActions: function(item, col){
      if(!col.actions) {
        return "";
      }
      return _.map(col.actions, function(a){ 
        return a.icon ? ("<span class='he-action-icon' data-event='" + a.event + "'>" + iconHTML(a.icon) + "</span>") : "";
      }).join("");
    },
    
    // Evaluates and returns the cell contents
    $getCellContent: function(item, colIndex, rowIndex){
      var cstate = this.$cstate[colIndex];
      var info = cstate.typeInfo;
      var value = this.$global.getCell(item, cstate.name);
      value == undefined && (value = "");
      
      switch(info.type){
        case "enum": 
          value = (value && info.$valmap) ? info.$valmap[value] : value;
          break;
        case "number": 
          value = typeof value === 'number' ? he.util.number.format(value, info.format || 0) : "";
          break;
        case "date": 
          value = value instanceof Date ? dformat(value, info.format || "ISO") : value;
          break;
        case "boolean":
          value = value ? iconHTML(info.icon || 'check') : "";
          break;
      }
      
      // Template functions have precedence
      if(_.isFunction(cstate.template)){
        return cstate.template(item, rowIndex, value);
      }
      
      return value == undefined ? "" : value;
    },

    // Renders the html for a single cell
    $renderCell: function(item, colIndex, rowIndex, innerHTML){
      var col = this.$cstate[colIndex];

      if(!col.show) {
        return "";
      }
      
      // Actions have precendence
      var content = col.actions ? this.$renderActions(item, col) : this.$getCellContent(item, colIndex, rowIndex);
      var editable = evaluate(col.editable, item, rowIndex) ? " he-editable" : "";
      var sortable = evaluate(col.sortable);
      var filter = evaluate(col.filter);
      var attrs = evaluate(col.attrs, item, rowIndex) || {};
      var cls = "he-cell" + editable;

      attrs.class ? (attrs.class += " " + cls) : (attrs.class = cls);
      attrs['data-col'] = colIndex;
      
      if(col.width){
        attrs.style || (attrs.style = {});
        attrs.style['min-width'] = attrs.style['width'] = col.width;
      }
      content = "<div class='he-cc'>" + content + "</div>";
      return innerHTML ? content : "<div " + makeattrs(attrs) + ">" + content + "</div>";
    },

    // Renders the html for a single row
    $renderRow: function(item, rowIndex){
      var size = this.$cstate.length;
      var html = "";
      var attrs = evaluate(this.$rows.attrs, item, rowIndex) || {};

      attrs.class ? (attrs.class += " he-row") : (attrs.class = "he-row");
      attrs['data-row'] = rowIndex;
      
      
      // This loops over each column in order
      for(var colIndex=0; colIndex < size; ++colIndex){
        html += this.$renderCell(item, colIndex, rowIndex);
      }
      return "<div " + makeattrs(attrs) + ">" + html + "</div>";
    },
    
    // Renders the header menu anchors
    $renderHeaderMenu: function(cstate){
      var sort      = evaluate(cstate.sortable);
      var sorting   = this.$sorting[cstate.name];
      var order     = !sorting ? "" : sorting.direction === 'asc' ? iconHTML('chevron-down') : iconHTML('chevron-up');
      var filter    = evaluate(cstate.filterable) && _.size(this.$filters[cstate.name]) ? iconHTML('filter') : "";
      var hideables = this.$getHideableCols();

      // There is nothing for the menu to do
      if(!filter && !sort && !_.size(hideables)){
        return "";
      }

      return "<div class='he-opts'>" + filter + order + iconHTML('menu-down') + "</div>";
    },
    
    // Renders the grid header
    $renderHeader: function(){
      var html = "";
      for(var i=0, ii=this.$cstate.length; i<ii; ++i){
        var cstate = this.$cstate[i];
        
        if(!cstate.show) {
          continue;
        }

        var resize = evaluate(cstate.resizable) ? " he-resize" : "";
        html +=
          "<div style='min-width:"+cstate.width+"px;width:"+cstate.width+"px;' class='he-cell' data-col='" + i + "'><div class='he-cc'>" + 
            (cstate.title || "") + "</div>" + this.$renderHeaderMenu(cstate) +
          "<div class='he-handle" + resize + "'></div></div>";
      }
      return "<div class='he-header-container'><div class='he-header'><div class='he-row'>" + html + "</div></div></div>";
    },

    // Renders the pagination controls
    $renderPagination: function(){
      var config = this.$global.pagination;

      // Update the data size
      var dataSize  = this.$global.dataSize();
      var pageSize  = this.$global.pagination.size;
      var current   = this.$currentPage;
      var total     = Math.ceil(dataSize/(pageSize || 1));
      var pageLinks = config.links;

      // No pagination for a single page
      if(total <= 1) {
        return "";
      }
      var links = Math.min(pageLinks, total);
      var i     = Math.min(Math.max(1, current - Math.floor(links / 2)), total - links + 1);
      var max   = i + links;
      var html  = "<div class='he-grid-pagination'>Page <input value='" + current + "'>&nbsp; of &nbsp;<strong>" + total + "</strong> &nbsp;&nbsp; ";
      
      for(; i < max; i++){
        html += "<a href='javascript:;' data-page='" + i + "' class='" + (i === current ? "he-active" : "") + "'>" + i + "</a>";
      }

      return html + "</div>";
    },
    
    // Renders the entire grid
    $render: function(){
      var self = this;

      // Remember the old scrollTop and scrollLeft so we can restore them
      var el = this.el;
      var body = el.querySelector('.he-table-container');
      var scrollpos = body ? { t: body.scrollTop, l: body.scrollLeft } : { t: 0, l: 0 };

      // Cleanup old event listeners
      this.$cleanup();
      
      // Get all shown columns from $cstate. Keep the original indices.
      var cstate = {};
      _.each(this.$cstate, function(col, index){
        col.show && (cstate[index] = col);
      });
      
      
      // Automatically distribute width to non-specified columns so that they take up 
      // the entire horizontal space
      var width = (body || el).scrollWidth - 15;
      var csvals = _.values(cstate);
      var nowidth = _.filter(csvals, function(cs){ return !cs.width; });
      var dist = _.sum(_.pluck(csvals, 'width'));
      var autow = Math.max(self.MIN_COL_WIDTH, Math.floor((width - dist)/nowidth.length));
      
      _.each(nowidth, function(nw){ 
        nw.width = autow; 
      });
      
      var getRow = this.$global.getRow;
      var header = this.$renderHeader();
      var body   = "";
      var length = this.$global.pageSize(this.$data);

      for(var i=0, ii=length; i<ii; ++i){
        body += this.$renderRow(getRow(this.$data, i), i);
      }
      
      this.$global.wordBreak ? cssClass(el, 'he-wordbreak') : cssClass(el, null, 'he-wordbreak');
      el.innerHTML = header + "<div class='he-table-container'><div class='he-table'>" + body + "</div></div>";
      
      // Render pagination and add listeners
      var pag = this.$global.pagination;
      if(pag.element){
        pag.element.innerHTML = this.$renderPagination();
        this.$addListener(pag.element, 'click', function(e){
          var link = findUp(e.target, 'attr', 'data-page');
          if(link){
            self.goToPage(parseInt(link.getAttribute('data-page'), 10));
          }
        });
        this.$addListener(pag.element, 'keypress', function(e){
          if(e.which === 13){
            var input = findUp(e.target, 'tag', 'input');
            if(input){
              self.goToPage(parseInt(input.value, 10) || 1);
            }
          }
        });
      }
      
      // The next section performs calculations and reflowing
      // ----------------------------------------------------
      var body = this.$elBody = el.querySelector('.he-table-container');
      var header = el.querySelector('.he-header-container');
      var thead = header.querySelector('.he-header');
      var tdata = body.querySelector('.he-table');

      // Now measure space and set heights if needed
      if(this.$global.autoHeight){
        el.style.height = (header.offsetHeight + body.offsetHeight) + "px";
      }
      else {
        body.style.height = (el.clientHeight - header.offsetHeight) + "px";
      }

      // Restore old scrollTop and scrollLeft
      scrollpos.t && (body.scrollTop = scrollpos.t);
      scrollpos.l && (header.scrollLeft = body.scrollLeft = scrollpos.l);

      // Attach event listeners to synchronize scrolling
      this.$addListener(body, 'scroll', function(e){
        // On scroll, remove any editing fields
        header.scrollLeft = body.scrollLeft;
        self.trigger('he:scroll', e);
      });
      
      // For some reason, attaching a listener to 'wheel' improves
      // the scrollLeft syncing of the header with the body
      this.$addListener(body, 'wheel', function(){});
      
      // Reattach all menus to their new anchors
      _.each(this.$menus, function(menu, colId){
        if(self.$cstate[colId].show) {
          menu.option('anchor', thead.querySelector('[data-col="' + colId + '"] .he-opts'));
        }
        else {
          menu.close();
        }
      });
    },

    // Apply/remove sorting to/from a column
    $sort: function(index, direction){
      var self    = this;
      var name    = this.$cstate[index].name;
      var sorting = this.$sorting;
      var old     = sorting[name];
      
      if(old) {
        if(direction === 'clear'){
          // Adjust the sorting orders for the removed one
          _.each(sorting, function(sort){ sort.order > old.order && (sort.order--); });
          delete sorting[name];
        }
        else if(old.direction !== direction){
          // Move the latest sorted column to the beginning
          _.each(sorting, function(sort){ sort.order < old.order && (sort.order++); });
          old.order = 0;
          old.direction = direction;
        }
      }
      else if(direction !== 'clear'){
        // Put the newly sorted column to the beginning
        _.each(sorting, function(sort){ sort.order++; });
        sorting[name] = {
          name: name,
          direction: direction,
          order: 0
        }
      }
      else {
        // Do nothing, no different sorting was requested
        return;
      }

      this.$global.reset && this.$global.reset.call(this, this.$getParams(), function(sorted){
        self.reset(sorted);
        self.render();
      });
    },
    
    /**  
     * Lazily creates and returns a helium scrollList 
     * control that contains all hideable columns.
     * It's used in the columns options menu.
    **/
    $getColumnsList: function(){
      if(this.$controls.columnsList) {
        return this.$controls.columnsList;
      }
      
      var self = this;
      var hideables = this.$getHideableCols()
      var columnsList = he('scrollList', doc.createElement('div'), { 
        items: hideables.map(function(col){
          return { t: col.title, v: col.name }
        }), 
        multiple: true, 
        nullable: hideables.length < _.size(this.$cstate)
      });

      columnsList.val(_.pluck(hideables, 'name'));
      columnsList.on('change', function(){
        var shown = this.val() || [];
        var changes = false;
      
        _.each(self.$cstate, function(cstate){
          if(!cstate.hideable){
            return;
          }
          if(cstate.show && !_.contains(shown, cstate.name)){
            cstate.show = false;
            changes = true;
          }
          else if(!cstate.show && _.contains(shown, cstate.name)){
            cstate.show = true;
            changes = true;
          }
        });
      
        _.defer(function(){
          changes && self.render();
        });
      });

      return this.$controls.columnsList = columnsList;
    },

    // Creates a menu for a header cell and caches it
    $createMenu: function(anchor, colIndex){
      var self = this;
      var cstate = this.$cstate[colIndex];
      var filterable = evaluate(cstate.filterable);
      var sortable = evaluate(cstate.sortable);
      var submenus = [];
      
      if(sortable){
        submenus.push({
          title: "Sort Ascending",
          icon: "chevron-down",
          action: 'sort-asc'
        },{
          title: "Sort Descending",
          icon: "chevron-up",
          action: 'sort-desc'
        },{
          title: "Clear Sorting",
          icon: "minus",
          action: "sort-clear"
        });
      }

      var columnsList = this.$getColumnsList();
      var columnsListIndex = null;
      var filtersIndex = null;

      if(filterable){
        filtersIndex = submenus.length;
        submenus.push({ title: "Filters", icon: 'filter', menu: [{ content:"" }] });
      }

      if(columnsList.$items.length){
        columnsListIndex = submenus.length;
        submenus.push({ title: "Show", menu: [{ content: "" }] });
      }

      // No menu here
      if(submenus.length === 0){
        return null;
      }
      var menu = he('menu', {
        anchor: anchor,
        parent: this.el.offsetParent,
        event: 'click',
        position: 'vertical',
        menu: submenus
      });

      // Since we are reusing the list of columns and the filter controls,
      // we originally create an empty 1-item submenu to house them, and 
      // we attach them before the menu opens.
      menu.on('submenu:willopen', function(submenu){
        var anchor = submenu.$options.anchor;
        var anchorIndex = anchor.getAttribute('he-item-index');
        var pi = he.util.getPositionInfo(anchor);

        if(!anchorIndex) {
          return;
        }
        
        // This is a deliberate usage of double equals
        if(anchorIndex == columnsListIndex){
          submenu.el.firstChild.appendChild(columnsList.el);
        }
        // This is a deliberate usage of double equals
        else if(anchorIndex == filtersIndex){
          var fc = self.$getFilterControls(colIndex);
          if(fc.type === "enum"){
            submenu.box.setOptions({ vauto: 'max' });
            submenu.box.el.style.overflowY = "auto";
          }
          submenu.el.firstChild.appendChild(fc.el);
        }
      });

      menu.on('close', function(){
        self.$activeMenu = null;
      });

      menu.on('open', function(){
        self.$activeMenu = menu;
      });
      
      menu.on('click', function(options){
        switch(options.item.action){
          case "sort-asc": self.$sort(colIndex, "asc"); break;
          case "sort-desc": self.$sort(colIndex, "desc"); break;
          case "sort-clear": self.$sort(colIndex, "clear"); break;
        }
      });
      
      return this.$menus[colIndex] = menu;
    },
    
    // Lazily creates a menu for a header cell and opens it
    $openMenu: function(anchor){
      var colIndex = anchor.parentElement.getAttribute('data-col');
      var menu = this.$menus[colIndex] || this.$createMenu(anchor, colIndex);
      if(menu){
        // Skip the opening click
        _.defer(function(){ menu.open(); });
      }
    },
    
    // Return a list of columns that can be hidden
    $getHideableCols: function(){
      return _.filter(this.$cstate, function(cstate){
        return evaluate(cstate.hideable);
      });
    },

    // Prepares an object of parameters that contain the 
    // filter, pagination and sorting state of the grid.
    $getParams: function(){
      return {
        filters: _.clone(this.$filters),
        sorting: _.map(_.sortBy(_.values(this.$sorting), 'order'), _.clone),
        pagination:  {
          page: this.$currentPage,
          size: this.$global.pagination.size
        },
      }
    },
    
    // Fetches and Renders the specified page
    goToPage: function(page){
      var self      = this;
      var dataSize  = this.$global.dataSize();
      var pageSize  = this.$global.pagination.size;
      var total     = Math.ceil(dataSize/(pageSize || 1));      
      this.$currentPage = Math.max(Math.min(total, page), 1);
      this.$global.reset && this.$global.reset.call(this, this.$getParams(), function(page){
        self.reset(page);
        self.render();
      });
    },
    
    // Sets a new data source
    reset: function(source){
      this.$data = source;
      this.render();
    },
    
    // Changes the grid configuration and re-renders it
    config: function(name, value){
      if(_.isPlainObject(name)){
        var config = name;
      }
      else {
        var config = {};
        config[name] = value;
      }
      
      var self = this;
      function traverseAndSet(options, obj){
        _.each(options, function(value, key){
          var path = key.split(".");
          var head = path.shift();
          var tail = path.join(".");
          var newObj = null;
          
          if(obj === self){
            if(key === "global"){
              self.$global = _.merge({}, defaults.global, self.$global, value);
            }
            else if(key === "rows"){
              self.$rows = _.merge({}, defaults.rows, self.$rows, value);
            }
            else if(key === "columns"){
              self.$cstate = _.map(value, function(col){
                return _.merge({}, defaults.column, col);
              });
              self.$prepareState();
            }
            
            if(!tail) {
              return;
            }
            
            if(head === "global"){
              newObj = self.$global;
            }
            else if(head === "rows"){
              newObj = self.$rows;
            }
            else if(head === "columns"){
              newObj = self.$cstate;
            }
          }
          else {
            newObj = obj[head];
          }

          if(tail){
            var newOptions = {};
            newOptions[tail] = value;
            newObj && traverseAndSet(newOptions, newObj);
          }
          else {
            obj[head] = value;
          }
        });
      }
      traverseAndSet(config, this);
      
      // Destroy the menus since they can be outdated
      _.invoke(this.$menus, 'close');
      _.invoke(this.$menus, 'destroy');
      this.$menus = {};
      setTimeout(function(){
        self.render();
      }, 250);
    }
  });

  // Throttle the render method so it doesn't happen too often
  Grid.prototype.render = _.throttle(Grid.prototype.$render, 250, { leading: true });  
})()
