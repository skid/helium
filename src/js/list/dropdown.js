/**
 * Helium dropdown list control.  
 * Documented in list.md.
**/
;(function(){
  var km = he.keymap;
  var findUp = he.util.findUp;
  var allowed = [km.UP, km.DOWN, km.SPACE, km.ENTER, km.ESCAPE];
  var buttonOptions = ['disabled', 'label', 'tooltip', 'error'];
  var listOptions = ['template', 'filter', 'vget', 'tget', 'value', 'items', 'nullable'];

  he.controls.dropdownList = DropdownList;
  function DropdownList(element, options){
    options = _.defaults(options, this.$defaults);

    this.list = he('scrollList', document.createElement('div'), _.pick(options, listOptions));

    this.button = he('button', element, _.extend(_.pick(options, buttonOptions), { 
      text: this.list.val() ? this.list.text() : options.placeholder,
      icon: "menu-down",
      iconpos: "after"
    }));
    
    this.box = new he.util.box({ 
      element:    this.list.el, 
      anchor:     this.button.el,
      horizontal: 'left',
      vertical:   'below',
      vauto:      'max',
    })
    
    this.list.el.classList.add('he-box');
    this.list.el.removeAttribute('tabindex');

    this.button.el.classList.add('he-dropdown');
    this.button.$subscribe('blur');
    this.button.$subscribe('keydown');
    this.button.$subscribe('keypress');
    
    this.el = this.button.el;
    he.register(this, true);
    this.$options = {
      placeholder: options.placeholder,
      nullable: options.nullable
    }

    // Opens the dropdown list
    var self = this;
    this.button.on('click', function(){
      self.open();
    });
    
    this.button.on('he:blur', function(e){
      self.close();
    });
    
    this.button.on('he:keydown', function(e){
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
    
    this.button.on('he:keypress', function(e){
      self.list.trigger('he:keypress', e);
    });

    this.list.on('he:mousedown', function(e){
      // Prevents blurring of the button element
      // This listener is bound after the mousedown listener that changes 
      // the list's value therefore it doesn't interfere with normal operation.
      e.preventDefault();
      e.button === 0 && e.target.classList && e.target.classList.contains('he-list-item') && 
      (!e.target.classList || !e.target.classList.contains('he-optgroup')) && self.close();
    });

    this.list.on('he:change', function(options){
      self.button.option('text', (self.list.val() != null) ? self.list.text() : self.$options.placeholder);
      self.$nullable();
      options.silent || self.trigger('change', options);
    });
    
    this.list.on('he:reset', function(options){
      self.close();
      options.silent || this.trigger('reset');
    });
  }
  
  // Dropdown lists are composite controls. They don't have their own 
  // element or options, but instead they consist of a button and a scroll list 
  // to which they delegate their methods.
  var listMethods = he.util.delegateMethods('list', ['reset', 'indexOfText', 'indexOfValue', 'getItem', 'text', 'get', 'set', 'getIndex']);
  var buttonMethods = he.util.delegateMethods('button', ['tooltipShow', 'tooltipHide', 'tooltipToggle', 'disable', 'enable']);
  var proto = he.abstract.control.prototype;
  DropdownList.prototype = _.extend(listMethods, buttonMethods, proto, {
    $defaults: { 
      placeholder: " ",
      nullable: true
    },
    
    $o: {
      placeholder: function(ctrl, prev){},
      nullable: function(ctrl, prev){
        ctrl.$nullable();
        ctrl.list.option('nullable', ctrl.$options.nullable);
      }
    },
    
    $subscribe: function(){},
    $unsubscribe: function(){},
    
    $init: function(){
      this.$nullable();
    },
    
    $nullable: function(){
      var self = this;
      var nullable = this.$options.nullable;
      if(nullable && this.val() != null){
        this.button.option({ icon: "close", iconclick: function(){
          self.val(null);
        }});
      }
      else {
        this.button.option({ icon: "menu-down", iconclick: null });
      }
    },
    
    // Delegates the options to the correct subcontrol
    option: function(name, value){
      proto.option.call(this, name, value);

      if(buttonOptions.indexOf(name) > -1){
        return this.button.option(name, value);
      }
      else if(listOptions.indexOf(name) > -1){
        return this.list.option(name, value);
      }
    },
    
    setText: function(text){
      this.button.option('text', text ? text : (this.list.val() ? this.list.text() : this.$options.placeholder));
    },

    open: function(){
      // This hack prevents the pop-up list to be confined in a parent modal
      var modal;
      if(modal = findUp(this.el, 'class', 'he-modal')){
        this.box.setOptions({ parent: document.documentElement });
      }
      this.box.el.style.minWidth = this.el.offsetWidth + "px";
      if(this.box.show()){ 
        this.list.$focused && this.list.$scrollTo(this.list.$focused);
      }
    },

    close: function(){
      this.box.hide();
    }
  });
})()
