/**
 * Helium scroll list. 
 * Documented in list.md.
**/
;(function(){
  var findUp = he.util.findUp;
  var iconHTML = he.util.iconHTML;
  var cssClass = he.util.cssClass;
  var km = he.keymap;
  var allowed = [km.UP, km.DOWN, km.SPACE, km.ENTER];

  var ScrollList = he.controls.scrollList = function ScrollList(element, options){
    he.abstract.list.call(this, element, _.defaults(options, this.$defaults));

    // The currently focused item
    this.$focused = null;
    
    // The quicksearch text and timeout
    this.$qs = "";
    this.$qsto = 0;
    
    this.$subscribe('mousedown');
    this.$subscribe('keypress');
    this.$subscribe('keydown');

    this.on('he:keydown', function(e){
      if(allowed.indexOf(e.which) > -1){
        switch(e.which){
        case km.UP:
          this.$focusTo("-");
          this.$scrollTo(this.$focused);
          break;
        case km.DOWN:
          this.$focusTo("+");
          this.$scrollTo(this.$focused);
          break;
        case km.SPACE:
        case km.ENTER:
          this.$focused && this.$clickSelect(this.$focused);
          break;
        }
        e.preventDefault();
      }
    });
    
    this.on('he:keypress', function(e){
      var self = this;
      var char = String.fromCharCode(e.which);
      if(char){
        this.$qs += char;
        clearTimeout(this.$qsto);
        this.$qsto = setTimeout(function(){
          self.$qs = "";
        }, 200);
        var ix = self.indexOfText(self.$qs, true, true);
        if(ix > -1){
          self.$focusTo(ix);
          self.$scrollTo(self.$focused);
        }
      }
    });

    this.on('he:mousedown', function(e){
      // Ignore all but left-button clicks
      if(e.button === 0){
        this.$clickSelect(e.target);
      }
      
      // Stupid IE11 does not focus on tabindex=0 divs when you click on their children...
      if(he.msie && !this.$options.disabled){
        var self = this;
        _.defer(function(){
          self.el.focus();
        });
      }
    });

    this.on('he:change', function(options){      
      this.$paintSelected(options.added, options.removed);
    });
  }

  var proto = he.abstract.list.prototype;
  ScrollList.prototype = he.util.inherits(proto, he.mixins.disableable, he.mixins.errored, he.mixins.tooltip, he.mixins.labeled, {
    $defaults: _.defaults({
      selectedIcon: 'check',
      multiple: false,
      nullable: false,
      template: null,
    }, proto.$defaults),
    
    $o: {
      selectedIcon: function(ctrl, prev){
        ctrl.$paintSelected(_.keys(ctrl.$selection), []);
      },
      template: function(ctrl, prev){
        ctrl.render();
      }
    },
    
    $init: function(){
      cssClass(this.el, "he-scroll-list");
      this.el.setAttribute('tabindex', "0");
      this.render();
    },

    // Handles clicking on an item element.    
    $clickSelect: function(target){
      var item = findUp(target, 'class', 'he-list-item');
      if(item && !item.classList.contains('he-optgroup')){
        var index = parseInt(item.getAttribute('data-index'), 10);
        this.set([ index ], { op: (index in this.$selection) ? "remove" : "add", index: true });
        this.$focusTo(index);
      }
    },
    
    // Sets the focus to the item at index "index". 
    // You can also pass the strings "+" / "-" instead and the function 
    // will find the next / previous visible item and focus on it.
    $focusTo: function(index){
      // If this.$focused is not null, we definitely have an item with the focused index in the DOM
      if(index === "+" || index === "-") {
        var sib = index === "+" ? "nextSibling" : "previousSibling";
        var next = this.$focused || this.el.querySelector('.he-list-item' + (index === "+" ? ":first-child" : ":last-child"));
        
        if(next && (this.$focused || next.classList.contains('he-hidden') || next.classList.contains('he-optgroup'))){
          while(next = next[sib]){
            if(!next.classList.contains('he-hidden') && !next.classList.contains('he-optgroup')){
              break;
            }
          }
        }
      }
      else {
        next = this.el.querySelector('.he-list-item[data-index="' + index + '"]');
      }

      // No focusable item was found
      if(this.$focused){
        cssClass(this.$focused, null, 'he-focused');
      }

      if(!next){
        this.$focused = null;
        return;
      }
      
      cssClass(next, 'he-focused');
      this.$focused = next;
    },
    
    // Scrolls the list so the item at index "index" comes into view.
    $scrollTo: function(index){
      if(index instanceof HTMLElement){
        he.util.scrollTo(index, this.el);
      }
      else if(typeof index === 'number') {
        he.util.scrollTo(this.el.querySelector('.he-list-item[data-index="' + index + '"]'), this.el);
      }
    },
    
    // Applies styles and background icon to selected items, 
    // and removes the same styles from deselected items.
    $paintSelected: function(added, removed){
      var el = this.el;
      var icon = this.$options.selectedIcon;      
      var nodes = this.el.childNodes;

      _.each(nodes, function(node){
        var index = parseInt(node.getAttribute('data-index'), 10);
        if(removed && removed.indexOf(index) > -1){
          // Deferred because other mousedown event listeners
          // may need the SVG as a target
          _.defer(function(){
            if(el.contains(node)){
              var svg = node.querySelector('svg:first-child');
              svg && node.removeChild(svg);
            }
          });
        }
        else if(added && added.indexOf(index) > -1){
          // Deferred because other mousedown event listeners
          // may need the SVG as a target
          _.defer(function(){
            if(el.contains(node)) {
              var svg = node.querySelector('svg:first-child');
              svg && node.removeChild(svg);
              node.insertBefore(iconHTML(icon, true), node.firstChild);
            }
          });
        }
      });
    },

    // Shows and hides items based on the filter value.
    // This is much faster than re-rendering the whole list.
    $filter: function(){
      // TODO: Move this to RAF
      var item, filter = this.$options.filter;
      var hidden = 0;
      
      for(var i=0, ii=this.$items.length; i<ii; ++i){
        item = this.$items[i];
        node = this.el.childNodes[i];
        
        if(filter && !filter(item)){
          cssClass(node, 'he-hidden');
          ++hidden;
          
        }
        else if(node.classList.contains('he-hidden')){
          cssClass(node, null, 'he-hidden');
        }
      }
      if(hidden){
        this.$focusTo(null);
      }
      this.trigger('he:filter', { hidden: hidden });
    },
    
    // Render the list
    render: function(){
      var self = this;
      var items = this.$items;
      var selection = this.$selection;
      var filter = this.$options.filter;
      var template = this.$options.template || this.$options.tget;
      var vget = this.$options.vget;
      var html = "";

      for(var i=0, ii=items.length; i<ii; i++){
        var item = items[i];
        var val = vget(item);        
        var hidden = filter && !filter(item) ? " he-hidden" : "";
        var selected = i in selection ? " he-selected" : "";
        
        // This is a group header
        if(val === undefined){
          html += "<div class='he-list-item he-optgroup'>" + template(item) + "</div>";
        }
        else {
          html += 
          "<div class='he-list-item" + hidden + selected + "' data-index='" + i + "'>" + 
            (selected ? iconHTML('check') : "") + template(items[i]) + 
          "</div>";
        }
      }

      // Remove any focused elements
      this.$focused = null;
      
      // TODO: Move to RAF
      this.el.innerHTML = html;
    }
  });
})()
