/**  
 * Helium grid filtering mixin.  
 * This mixin allows marking columns as "filterable". Filterable columns  
 * shown a menu with filter controls when clicked on the header.  
 * These filter controls are then used to set a filter value to a specific column.
 * 
 * Each time the filter values are changed, the `global.onFilter` method is called 
 * and the application can handle the filtering further. 
 *  
 * Columns that have a filter value show an icon on their header.
 * 
 * ### [Requires] 
 * util/dom  
 * util/misc 
 * util/icon
 *  
 * ### [Options] 
 * The filtering mixin enables the following options of the grid schema 
 * definition:  
 *  
 * #### `global.onFilter(colName, filters, callback)` 
 * Function. Default: `null`.   
 * This function should be defined by the user when the grid is initialized. 
 * It will be passed 3 arguments:  "colName" argument is the name of the  
 * column on which a filter was last set. The  "filters" argument  
 * is an object that contains all the active filters on each 
 * column as well as the latest one. It looks like this:
 * ```js  
 * { 
 *   columnName1: { 
 *     ">": 100, 
 *     "<": 200
 *   }, 
 *   columnName2: { 
 *     "~": "sec"
 *   }, 
 *   columnName3: {  
 *     "in": [1,2,3]
 *   }
 * }
 * ```
 * At the first level, the object keys are column names. Each key holds 
 * another object with one or more key:value pairs. There are 4 possible 
 * keys in these second-level objects: 
 *  
 * - ">": The filter should allow only values greater than this one 
 * - "<": The filter should allow only values lesser than this one  
 * - "~": The filter should allow only values that contain this text 
 * - "in": The filter should allow only values found in this array
 *  
 * The filtering algorithm is left entirely to the developer. It can be 
 * done in javascript or on the server backend. After the filters are applied, 
 * the "callback" parameter (which is a function) should be called. It  
 * accepts a single argument - the filtered collection. 
 *  
 * The grid will then bind itself to the new, filtered collection and 
 * re-render.
 * 
 * #### column.filterable 
 * Function|Boolean. Default: `false`.   
 * If a function it is evaluated. Otherwise the boolean value is used. 
 * If it evaluates to a truthy value the column will be filterable.
 * 
 * #### column.filterOptions 
 * Object. Default: `{}`.  
 * This option defines which filter controls will be used for each column 
 * and how they will be configured. Since each column has a specific type, 
 * different controls are used for filtering different types. Here is a 
 * list of possible keys for the "filterOptions" object: 
 *  
 * - Column type "text": any options applicable to the input.input control 
 * - Column type "number": any options applicable to the input.number control 
 * - Column type "date": any options applicable to the input.date control  
 * - Column type "enum": any options applicable to the list.scroll control
 * - Column type "boolean": any options applicable to the list.scroll control
 *  
 * The number and date filters will render 2 inputs, for specifying the ">" and "<" 
 * filters. The text will render a single input, bound to the "~" filter and the 
 * enum and boolean filters will render a list of the possible cell values and 
 * will specify the "in" filter. 
**/
;(function(){
  // Other shortcuts
  var doc = document;
  var evaluate = he.util.evaluate;
  var cssClass = he.util.cssClass;
  var iconHTML = he.util.iconHTML;

  // Simple input factory
  function createInput(type, operator, options, grid){
    var ctrl = he(type, doc.createElement('input'), options);

    // When the control is clicked apply the filter
    ctrl.$subscribe('keydown');
    ctrl.on('click', function(e){
      grid.setFilter(this.$fcIndex, operator, this.val());
    }).on('he:keydown', function(e){
      (e.which === 13) && grid.setFilter(this.$fcIndex, operator, this.val());
    });

    return ctrl;
  }

  he.mixins.gridFilter = {
    // Lazily creates, caches and returns the text filtering control
    $getTextFilter: function(colIndex){
      var cstate = this.$cstate[colIndex];
      var options = evaluate(cstate.filterOptions);

      // If we haven't already, initialize the text filter control
      if(!('textFilter' in this.$controls)){
        var container = cssClass(doc.createElement('div'), 'he-filter-controls');
        var row = cssClass(doc.createElement('div'), 'he-row');
        var opts = _.defaults(options, { 
          icon: 'check', 
          iconpos: 'after', 
          placeholder: 'Type here...', 
          click: true 
        });
        var ctrl = createInput('input', '~', opts, this);
        row.appendChild(iconHTML('alphabetical', true));
        row.appendChild(ctrl.el);
        container.appendChild(row);
        this.$controls.textFilter = [ ctrl ];
      }
      else {
        ctrl = this.$controls.textFilter[ 0 ];
      }

      ctrl.$fcIndex = colIndex;
      ctrl.val(this.$getFilter(colIndex, "~"));
      ctrl.$focused && ctrl.$scrollTo(ctrl.$focused);
      return ctrl.el.parentNode.parentNode;
    },
    
    // Lazily creates, caches and returns the date filtering control
    $getDateFilter: function(colIndex){
      var self = this;
      var cstate = this.$cstate[colIndex];
      var options = evaluate(cstate.filterOptions);

      // If we haven't already, initialize the text filter control
      if(!('dateFilter' in this.$controls)){
        var container = he.util.cssClass(doc.createElement('div'), 'he-filter-controls');
        var row1 = cssClass(doc.createElement('div'), 'he-row');
        var row2 = cssClass(doc.createElement('div'), 'he-row');
        var opts = _.defaults(options, { 
          icon: 'check', 
          iconpos: 'after', 
          placeholder: 'Select Date', 
          click: true,
          datepicker: { position: 'after', hauto: "opposite", vauto: "opposite", parent: container }
        });
        var ctrl1 = createInput('date', '>', opts, this);
        var ctrl2 = createInput('date', '<', opts, this);

        // When the control is clicked apply the filter
        row1.appendChild(iconHTML('chevron-right', true));
        row2.appendChild(iconHTML('chevron-left', true));
        row1.appendChild(ctrl1.el);
        row2.appendChild(ctrl2.el);
        container.appendChild(row1);
        container.appendChild(row2);
        self.$controls.dateFilter = [ctrl1, ctrl2];
      }
      else {
        ctrl1 = this.$controls.dateFilter[0];
        ctrl2 = this.$controls.dateFilter[1];
      }
      ctrl2.$fcIndex = ctrl1.$fcIndex = colIndex;
      ctrl1.val(this.$getFilter(colIndex, ">"));
      ctrl2.val(this.$getFilter(colIndex, "<"));
      return ctrl1.el.parentNode.parentNode;
    },
    
    // Lazily creates, caches and returns the number filtering control
    $getNumberFilter: function(colIndex){
      var self = this;
      var cstate = this.$cstate[colIndex];
      var options = evaluate(cstate.filterOptions);

      // If we haven't already, initialize the text filter control
      if(!('numberFilter' in this.$controls)){
        var container = he.util.cssClass(doc.createElement('div'), 'he-filter-controls');
        var row1 = cssClass(doc.createElement('div'), 'he-row');
        var row2 = cssClass(doc.createElement('div'), 'he-row');
        var opts = _.defaults(options, { 
          icon: 'check', 
          iconpos: 'after', 
          placeholder: 'Type here ...', 
          click: true,
          format: 0
        });
        var ctrl1 = createInput('number', '>', opts, this);
        var ctrl2 = createInput('number', '<', opts, this);

        // When the control is clicked apply the filter
        row1.appendChild(iconHTML('chevron-right', true));
        row2.appendChild(iconHTML('chevron-left', true));
        row1.appendChild(ctrl1.el);
        row2.appendChild(ctrl2.el);
        container.appendChild(row1);
        container.appendChild(row2);
        self.$controls.numberFilter = [ctrl1, ctrl2];
      }
      else {
        ctrl1 = this.$controls.numberFilter[0];
        ctrl2 = this.$controls.numberFilter[1];
      }
      ctrl2.$fcIndex = ctrl1.$fcIndex = colIndex;
      ctrl1.val(this.$getFilter(colIndex, ">"));
      ctrl2.val(this.$getFilter(colIndex, "<"));
      return ctrl1.el.parentNode.parentNode;
    },
    
    // Lazily creates, caches and returns the enum filtering control
    $getEnumFilter: function(colIndex){
      var cstate = this.$cstate[colIndex];
      var options = evaluate(cstate.filterOptions);
      var info = cstate.typeInfo;
      var self = this;

      // If we haven't already, initialize the text filter control
      if(!('enumFilter' in this.$controls)){
        var container = cssClass(doc.createElement('div'), 'he-filter-controls');
        var opts = _.defaults(options, {
          items: [],
          tget: info.tget,
          vget: info.vget,
          nullable: true,
          multiple: true
        });

        var ctrl = he('scrollList', container, opts).on('change', function(e){
          var val = this.val();
          self.setFilter(this.$fcIndex, "in", val.length ? val : null);
        });
        ctrl.el.style.maxHeight = "100%";
        this.$controls.enumFilter = [ctrl];
      }
      else {
        ctrl = this.$controls.enumFilter[0];
      }

      ctrl.$fcIndex = colIndex;
      ctrl.reset(info.items);
      ctrl.val(this.$getFilter(colIndex, "in"));
      return ctrl.el;
    },
    
    $getBooleanFilter: function(colIndex){
      var cstate = this.$cstate[colIndex];
      var options = evaluate(cstate.filterOptions);
      var info = cstate.typeInfo;
      var self = this;

      // If we haven't already, initialize the text filter control
      if(!('booleanFilter' in this.$controls)){
        var container = cssClass(doc.createElement('div'), 'he-filter-controls');
        var opts = _.defaults(options, {
          items: [{ v: true, t: "Yes" }, { v: false, t: "No" }],
          nullable: true,
          multiple: true
        });

        var ctrl = he('scrollList', container, opts).on('change', function(e){
          var val = this.val();
          self.setFilter(this.$fcIndex, "in", val.length ? val : null);
        });
        ctrl.el.style.maxHeight = "100%";
        this.$controls.booleanFilter = [ctrl];
      }
      else {
        ctrl = this.$controls.booleanFilter[0];
      }

      ctrl.$fcIndex = colIndex;
      ctrl.val(this.$getFilter(colIndex, "in"));
      return ctrl.el;
    },
    
    /**  
     * Lazily creates and returns a filtering control.  
     * Delegates to the correct method. 
     * 
     * @method @getFilterControls  
     * @param {number} colIndex The index of the column for which we want to filter 
     * @return {HTMLElement} The (parent) HTML element of the filter control.
     * This can be directly included in the DOM. 
     * @private
    **/
    $getFilterControls: function(colIndex){
      var cstate = this.$cstate[colIndex];
      var options = evaluate(cstate.filterOptions);

      switch(options.type || cstate.typeInfo.type){
        case "text": return { type: "text", el: this.$getTextFilter(colIndex) };
        case "number": return { type: "number", el: this.$getNumberFilter(colIndex) };
        case "date": return { type: "date", el: this.$getDateFilter(colIndex) };
        case "enum": return { type: "enum", el: this.$getEnumFilter(colIndex) };
        case "boolean": return { type: "boolean", el: this.$getBooleanFilter(colIndex) };
      }
    },
    
    // Gets the active filter value for a specific column and a compare operator.
    $getFilter: function(colIndex, cmp){
      var cstate = this.$cstate[colIndex];
      var f = this.$filters[cstate.name];
      return f ? (f[cmp] === undefined ? null : f[cmp]) : null;
    },
    
    // Sets/removes a filter for a specific column and a compare operator. 
    setFilter: function(colIndex, cmp, val){
      var self   = this;
      var name   = this.$cstate[colIndex].name;
      var filter = this.$filters[name];
      
      // No filters for column
      if(!filter){
        if(val == null){
          return; // Nothing changes
        }
        filter = this.$filters[name] = {};
        filter[cmp] = val;
      }
      // No filters for comparator
      else if(filter[cmp] == null){
        if(val == null){
          return; // Nothing changes
        }
        filter[cmp] = val;
      }
      // Filters exist
      else {
        if(filter[cmp] === val){
          return; // Nothing changes
        }
        // Removing the filter
        if(val == null){
          delete filter[cmp];
          if(_.size(filter) === 0){
            delete this.$filters[name];
          }
        }
        else {
          filter[cmp] = val;
        }
      }
      
      // Always set the current page to 1
      this.$currentPage = 1;
      
      if(this.$global.reset){
        this.$global.reset && this.$global.reset.call(this, this.$getParams(), function(filtered){
          self.reset(filtered);
          self.render();
        });
      }
    }
  }
})()
