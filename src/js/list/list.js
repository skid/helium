/**
 * Helium list control base class.  
 * Documented in list.md.
**/
;(function(){    
  var List = he.abstract.list = function List(element, options){
    he.abstract.control.call(this, element, _.defaults(options, this.$defaults));
    
    this.$items = [];     // The items collection
    this.$selection = {}; // Keeps a map if index->value of selected items
    this.$text = null;    // The text value displayed in the control
    
    this.reset(options.items);
    this.set(options.value);
    
    this.on('he:reset', function(options){
      this.render();
      options.silent || this.trigger('reset');
    });
    
    this.on('he:change', function(options){
      options.silent || this.trigger('change', options);
    });
  }
  
  List.prototype = he.util.inherits(he.abstract.control.prototype, {
    $defaults: {
      nullable: true,
      multiple: false,
      vget: defaultVget,
      tget: defaultTget
    },

    $o: {
      nullable: function(){
        
      },
      multiple: function(ctrl, prev){
        if(ctrl.$options.multiple === false && _.size(ctrl.$selection) > 1){
          // Since multiple is already false, val() will return a single value
          ctrl.val(ctrl.val());
        }
      },
      filter: function(ctrl, prev){
        if(!_.isFunction(ctrl.$options.filter)){
          ctrl.$options.filter = null;
          _.isFunction(prev) && ctrl.$filter();
        }
        else {
          ctrl.$filter();
        }
      },
      vget: function(ctrl, prev){
        if(typeof ctrl.$options.vget !== "function"){
          ctrl.$options.vget = prev;
        }
      },
      tget: function(ctrl, prev){
        if(typeof ctrl.$options.tget !== "function"){
          ctrl.$options.tget = prev;
        }
      }
    },
    
    // noop, implemented in derived controls
    $filter: function(){},
    
    // noop, implemented in derived controls
    render: function(){},
    
    // Assigns a new set of items and discards the old one.
    // Values in the old $selection will be copied to the new one
    // if they can be found in the new set of items.
    // If any value from the old selection is discarded
    // a change event will be fired.
    reset: function(items, options){
      if(!_.isArray(items)){
        items = [items];
      }
      
      options || (options = {});
      
      var item, i=0;
      var vget = this.$options.vget;
      var selection = {};

      while(item = items[i++]){
        var value = vget(item);
        if(_.contains(this.$selection, value)){
          selection[i-1] = value;
        }
      }

      var diff = [];
      var n = _.values(selection);
      var o = _.values(this.$selection);
      
      // Apply the new selection
      this.$items = items;
      this.$selection = selection;
      this.trigger('he:reset', options);

      if(n.length !== o.length || (diff = _.difference(o, n)).length > 0){
        this.trigger('he:change', _.extend(options, { removed: diff, reset: true }));
      }
    },

    // Returns the index of the item whose value is passed
    indexOfValue: function(value){
      var items = this.$items;
      var vget  = this.$options.vget;
      for(var i=0, ii=items.length; i < ii; ++i){
        if(vget(items[i]) === value){
          return i;
        }
      }
      return -1;
    },

    // Returns the index of the item whose text is passed
    indexOfText: function(text, ignorecase, beginswith){
      var items = this.$items;
      var tget = this.$options.tget;
      var vget = this.$options.vget;
      var cmp = beginswith ? beginsWith : isSame;
      
      text = "" + text;
      for(var i=0, ii=items.length; i < ii; ++i){
        var t = ignorecase ? tget(items[i]).toLowerCase() : tget(items[i]);
        if(cmp(t, text)){
          if(vget(items[i]) !== undefined){
            return i;
          }
        }
      }
      return -1;
    },

    // Returns the item at index i 
    getItem: function(i){
      return this.$items[i];
    },
    
    // Returns the selected indices
    getIndex: function(){
      if(this.$options.multiple) {
        return _.keys(this.$selection);
      }
      var indices = _.keys(this.$selection);
      return indices.length ? parseInt(indices[0], 10) : -1;
    },

    // Returns the text of the selected items. 
    // In case the multiple option is false, returns a single value.
    text: function(){
      var self = this;
      var values = _.keys(this.$selection).sort().map(function(index){
        return self.$items[index];
      }).map(this.$options.tget);
      return this.$options.multiple ? values : values[0];
    },

    // Returns the values of the selected items. 
    // In case the multiple option is false, returns a single value.
    get: function(){
      var self = this;
      var values = _.keys(this.$selection).sort().map(function(index){
        return self.$items[index];
      }).map(this.$options.vget);
      return this.$options.multiple ? values : (values.length ? values[0] : null);
    },

    // Manipulates the list's selection.
    // The value can either be a single value, or an array of values. 
    // The options object can contain the following keys: 
    // Passing { op: "add" } will add the value(s) from the selection. 
    // Passing { op: "remove" } will remove the value(s) from the selection. 
    // Passing { index: true } will treat the value as the item's index 
    set: function(values, options){
      var self = this;
      options || (options = {});
      
      if(values === null){
        values = [];
      }
      else if(!_.isArray(values)) { 
        values = [values];
      }

      // Convert values to indices
      if(!options.index) {
        values = values.map(function(v){ 
          return self.indexOfValue(v); 
        });
      }

      values = _.uniq(values.filter(function(v){ 
        return !isNaN(v) && v > -1; 
      }));

      var selection;
      var indices = _.keys(this.$selection).map(function(index){ 
        return parseInt(index, 10);
      });

      if(options.op === "add"){
        selection = _.union(indices, values);
      }
      else if(options.op === "remove"){
        selection = _.difference(indices, values);
      }
      else {
        selection = values;
      }
      if(!this.$options.nullable && selection.length === 0){
        selection = indices;
      }
      if(!this.$options.multiple && selection.length > 1){
        selection = values.length ? [values[0]] : indices;
      }
      
      var items = this.$items;
      var vget = this.$options.vget;
      var added = _.difference(selection, indices);
      var removed = _.difference(indices, selection);

      if(added.length + removed.length){
        this.$selection = _.zipObject(selection, selection.map(function(index){ return vget(items[index]); }));
        this.trigger("he:change", _.extend({ added: added, removed: removed }, options));
      }

      return this;
    }
  });
  
  // Default getters
  function defaultVget(item){ return typeof item === "string" ? item : item.v; }
  function defaultTget(item){ return typeof item === "string" ? item : item.t; }
  
  // Comparator helpers
  function beginsWith(a, b){ return a.indexOf(b) === 0; };
  function isSame(a, b){ return a === b };
})()
