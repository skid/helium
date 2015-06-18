/**
 * Helium autocomplete list control.  
 * Documented in list.md.
**/
;(function(){
  var cssClass = he.util.cssClass;
  var km = he.keymap;
  var findUp = he.util.findUp;
  var allowed = [km.UP, km.DOWN, km.SPACE, km.ENTER, km.ESCAPE];
  var inputOptions = ['disabled', 'label', 'tooltip', 'placeholder', 'error', 'floatingLabel'];
  var listOptions = ['template', 'filter', 'vget', 'tget', 'value', 'items', 'nullable'];

  he.controls.autocompleteList = AutocompleteList;
  function AutocompleteList(element, options){
    options = _.defaults(options, this.$defaults);
    
    if(options.ajax){
      options.items = [];
    }

    this.list  = he('scrollList', document.createElement('div'), _.extend(_.pick(options, listOptions), { multiple: false }));
    this.input = he('input', element, _.extend(_.pick(options, inputOptions), {
      icon: "menu-down",
      iconpos: "after",
      click: true
    }));
    this.box = new he.util.box({
      element: this.list.el,
      anchor: this.input.el,
      vauto: "dropdown",
    });
    this.input.$subscribe('keydown');
    this.list.el.removeAttribute('tabindex');

    this.el = this.input.el;
    he.register(this, true);

    this.$options = {
      ajax: options.ajax,
      maxresults: options.maxresults,
      minchars: options.minchars
    };

    var self = this;
    this.list.on('he:change', function(options){
      if(self.$options.ajax){
        !this.val() && !options.ajax && this.reset([], { ajax: true });
        self.close();
      }
      // If the change came due to a list reset becaue of ajax, don't empty the input
      options.ajax || self.input.val(self.list.text() || "", { silent: true });
      options.silent || self.trigger('change', options);
    });
    
    this.list.on('he:reset', function(options){
      self.close();
      options.silent || this.trigger('reset');
    });

    this.list.on('he:filter', function(options){
      self.close();
      if(options.hidden < this.$items.length){
        // Don't open the list if there are no items to show
        self.open();
      }
    });
    
    this.input.on('click', function(){
      // We always want the full list shown on click
      self.list.option('filter', null);
      self.list.$items.length && self.open();
    });

    this.list.on('he:mousedown', function(e){
      // Prevents blurring of the input element
      // This listener is bound after the mousedown listener that changes 
      // the list's value therefore it doesn't interfere with normal operation.
      e.preventDefault();
      self.close();
    });

    this.input.on('he:blur', function(e){      
      var text = self.list.text() || "";
      var listval = self.list.val();
      var inputval = this.val();
      if(!inputval){
        if(self.list.$options.nullable){
          self.list.val(null);
        }
        else {
          this.val(text);
        }
      }
      else if(text !== inputval){
        var index = self.list.indexOfText(inputval, true);
        index > -1 ? self.list.val(index, { index: true }) : this.val(text);
      }
      self.close();
    });

    this.input.on('type', function(){
      var value = this.val();
      var ajax = self.$options.ajax;
      var input = this.el;
      
      // Special cases for ajax
      if(ajax){
        if(value && value.length >= self.$options.minchars){
          cssClass(input, 'he-loading');
          ajax(value, function(results){
            if(results.length <= self.$options.maxresults){
              cssClass(input, null, 'he-loading');
              results.length && self.list.reset(results, { ajax: true });
              results.length ? self.open() : self.close();
            }
          });
        }
      }
      else if(value){
        var tget = self.list.$options.tget;
        self.list.option('filter', function(item){
          return (tget(item) || "").toLowerCase().indexOf(value.toLowerCase()) === 0;
        });
      }
      else {
        self.list.option('filter', null);
        self.close();
      }
    });
    
    this.input.on('he:keydown', function(e){
      if(!self.box.isShown && e.which === km.DOWN && self.list.$items.length){
        self.open();
        self.list.trigger('he:keydown', e);
        return e.preventDefault();
      }

      if(self.box.isShown && allowed.indexOf(e.which) > -1) {
        if(e.which === km.ESCAPE){
          return self.close();
        }
        self.list.trigger('he:keydown', e);
        if(e.which === km.SPACE || e.which === km.ENTER){
          self.close();
        }
      }
    });
  }

  // Autocomplete lists are composite controls. They don't have their own 
  // element or options, but instead they consist of a input and a scroll list 
  // to which they delegate their methods.
  var listMethods = he.util.delegateMethods('list', ['reset', 'indexOfValue', 'indexOfText', 'getItem', 'text', 'get', 'set', 'getIndex']);
  var inputMethods = he.util.delegateMethods('input', ['tooltipShow', 'tooltipHide', 'disable', 'enable']);
  var proto = he.abstract.control.prototype;
  AutocompleteList.prototype = _.extend(listMethods, inputMethods, proto, {
    $defaults: {
      ajax: null,
      minchars: 2,
      maxresults: 100
    },

    $o: {
      ajax: function(){},
      minchars: function(){},
      maxresults: function(){}
    },
    
    $subscribe: function(){},
    $unsubscribe: function(){},
    
    $init: function(){
      this.list.el.classList.add('he-box');
      this.input.el.classList.add('he-dropdown');
    },
    
    option: function(name, value){
      proto.option.call(this, name, value);
      if(_.isPlainObject(name)){
        this.input.option(_.pick(name, inputOptions));
        this.list.option(_.pick(name, listOptions));
        return;
      }
      else if(inputOptions.indexOf(name) > -1){
        return this.input.option(name, value);
      }
      else if(listOptions.indexOf(name) > -1){
        return this.list.option(name, value);
      }
    },
    
    setText: function(text){
      this.input.val(text ? text : this.list.text() || "", { silent: true });
    },
    
    open: function(){
      // This hack prevents the pop-up list to be confined in a parent modal
      var modal;
      if(modal = findUp(this.el, 'class', 'he-modal')){
        this.box.setOptions({ parent: document.documentElement });
      }
      if(this.box.show()){ 
        this.list.$focused && this.list.$scrollTo(this.list.$focused);
      }      
    },

    close: function(){
      this.box.hide();
    }
  });
})()
