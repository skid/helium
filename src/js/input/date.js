/**  
 * Helium (he) date input control.
 * Documented in input.md.
**/
;(function(){
  var cssClass = he.util.cssClass;
  var dparse = he.util.date.parse;
  var dformat = he.util.date.format;
  
  he.controls.date = DateInput;
  function DateInput(element, options){
    // Inherits from Input
    he.controls.input.call(this, element, _.defaults(options, this.$defaults));

    // Compile regexes
    this.$compile();
    
    // Bind listeners
    this.$subscribe('keydown');

    this.on('he:keydown', function (e){
      var el = element;

      // This keydown event was not invoked by typing
      if(!e || typeof e !== 'object' || !e.which) {
        return;
      }

      // This will allow arrow keys, cut, copy, paste actions.
      if(_.include(this._allowedKeys, e.which) || e.metaKey || e.ctrlKey) {
        return;
      }

      // 96-105 are numpad numbers
      if(e.which >= 96 && e.which <= 105) {
        e.which -= 48;
      }
      
      if(e.shiftKey){
        return e.preventDefault();
      }

      var ch = String.fromCharCode(e.which);
      if(!(/[0-9]/).test(ch) || (el.selectionStart !== undefined && el.selectionEnd - el.selectionStart === 0 && el.value.length === 10)) {
        e.preventDefault();
      }
    });
    
    this.on('he:focus', function(){
      this.open();
    });
    
    this.on('he:blur', function(){
      this.$prevalue = this.el.value = this.$format(this.$value);
      this.close();
    });
    
    this.on('he:change', function(options){
      // remember that he:change will fire on typing as well
      this.$calendar && this.$panel.isShown && this.$calendar.val(this.val());
    });
    
    this.$datepickerize(this.$options.datepicker);
  }
  
  var proto = he.controls.input.prototype;
  DateInput.prototype = he.util.inherits(proto, {
    $defaults: _.defaults({
      format: "ISO",
      datepicker: null
    }, proto.$defaults),

    $o: {
      datepicker: function(ctrl, prev){

        // It needs to contain datepicker properties
        if(!_.isPlainObject(ctrl.$options.datepicker)){
          ctrl.$options.datepicker = null;
        }
        if(_.isEqual(ctrl.$options.datepicker, prev)) {
          return;
        }
        ctrl.$datepickerize(ctrl.$options.datepicker);
      },
      
      format: function(ctrl, prev){
        // Allow only US, EU and ISO, with ISO as default
        if(ctrl.$options.format !== "EU" && ctrl.$options.format !== "US") {
          ctrl.$options.format = "ISO";
        }

        // Compile new rexeses and force a reformat
        ctrl.$compile();
        ctrl.el.value = ctrl.$format(ctrl.$value);
      }
    },

    $datepickerize: function(options){
      var self = this;

      if(!options && this.$calendar){
        // TODO: destroy it with he.unregister
      }
      else if(options && !this.$calendar){
        this.$panel = new he.util.popover(_.extend({
          anchor: options.anchor || this.el,
          parent: options.parent || document.body,
          position: options.position || 'below'
        }, options));
        
        this.$calendar = he('calendar', this.$panel.el, options);
        this.$calendar.on('he:mousedown', function(e){
          e.preventDefault(); // Prevents input from blurring when we click on datepicker
        });
        this.$calendar.on('he:change', function(options){
          self.val(this.val());
          self.close();
        });
      }
      else if(options){
        // modify it
        this.$calendar.option(options);
      }
    },

    open: function(){
      if(this.$panel && !this.$options.disabled){
        this.$calendar.val(this.val());
        this.$panel.show(); 
      }
    },
    
    close: function(){
      this.$panel && this.$panel.hide();
    },
    
    $init: function(){
      cssClass(this.el, 'he-date');
    },

    $compile: function(){
      var allowedKeys = [37, 38, 39, 40, 27, 8, 46, 9];
      
      if(this.$options.format === "ISO"){
        allowedKeys.push(he.keymap.DASH);
      }
      else if(this.$options.format === "US"){
        allowedKeys.push(he.keymap.SLASH);
      }
      else if(this.$options.format === "EU"){
        allowedKeys.push(he.keymap.NUMPAD_DECIMAL);
        allowedKeys.push(he.keymap.PERIOD);
      }

      this._allowedKeys = allowedKeys;
    },
    
    // Returns the string representation of the current value
    $format: function $format(value){
      return value === null ? "" : dformat(value, this.$options.format);
    },

    // Converts any values to a date or null
    $sanitize: function $sanitize(value){
      return value instanceof Date ? value : dparse(value, this.$options.format);
    }
  });
})()
