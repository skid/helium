/**  
 * Helium basic text input control. 
 * Documented in input.md. 
**/
;(function(){
  var cssClass = he.util.cssClass;
  var Input = he.controls.input = function Input(element, options, cfg){
    var opts = _.defaults(options, { placeholder: element.getAttribute('placeholder') }, this.$defaults);
    he.abstract.control.call(this, element, opts);
    
    // Sanitize input
    // We keep the value in a private attribute to avoid option-setting it
    this.$value = this.$sanitize('value' in options ? options.value : element.value);

    this.$subscribe('keyup');
    this.$subscribe('focus');
    this.$subscribe('blur');

    // !! This event only fires when we have $options.click and $options.icon
    this.on('he:click', function(){
      !this.$options.disabled && this.$options._btnHover && this.trigger('click');
    });

    // !! We are only subscribed to this event when we have $options.click and $options.icon
    this.on('he:mousemove', function(e){
      // FIXME: Possible performance problems
      var w = this.el.offsetWidth;
      var h = this.el.offsetHeight;
      var o = this.el.getBoundingClientRect();
      var s = getComputedStyle(this.el, null);
      var px = e.clientX;
      var py = e.clientY;
      
      if(this.$options.iconpos === 'after'){
        var htest = o.left + w >= px && o.left + w - parseInt(s.paddingRight, 10) <= px;
      }
      else {
        var htest = o.left <= px && o.left + parseInt(s.paddingLeft, 10) >= px;
      }

      if (htest && o.top <= py && o.top + h >= py){
        this.el.style.cursor = 'pointer';
        this.$options._btnHover = true;
      }
      else {
        this.el.style.cursor = '';
        this.$options._btnHover = false;
      }
    });

    this.on('he:focus', function(){
      this.$prevalue = this.el.value;
      this.$initial = this.$value;
    });

    this.on('he:keyup', function(){
      if(this.$prevalue !== this.el.value){
        this.$prevalue = this.el.value;
        this.trigger('he:type');
      }
    });

    this.on('he:type', function(){
      this.set(this.el.value, { _typing: true });
      this.trigger('type');
    });

    this.on('he:blur', function(){
      if(this.$initial !== this.$value){ 
        return this.trigger('he:change', { source: this });
      }
    });

    this.on('he:change', function(options){
      options = options || {};
      options.previous = this.$initial;
      
      // If the "_typing" flag was set, we don't want to update the $initial value
      // because we want to emulate the native change event that fires on blur.
      if(!options._typing) {
        this.$initial = this.$value;
        this.el.value = this.$format(this.$value);
      }

      if(options.silent || options._typing){
        return;
      }

      this.trigger('change', options);
    });
  };

  Input.prototype = he.util.inherits(he.abstract.control.prototype, he.mixins.disableable, he.mixins.errored, he.mixins.tooltip, he.mixins.labeled, {
    $defaults: {
      disabled: false,
      icon: null,
      iconpos: 'before',
      label: null,
      maxlength: 0,
      click: null,
      placeholder: ""
    },
    
    $o: {
      placeholder: function(ctrl, prev){
        ctrl.el.setAttribute('placeholder', ctrl.$options.placeholder);
      },
      icon: function(ctrl){
        ctrl.$clickable();
        ctrl.$setIcon(); 
      },
      click: function(ctrl){
        ctrl.$clickable();
        ctrl.$setIcon();
      },
      iconpos: function(ctrl){ 
        ctrl.$setIcon(); 
      },
      disabled: function(ctrl, prev){
        this.$super.disabled(ctrl, prev);
        ctrl.el.readOnly = !!ctrl.$options.disabled;
        ctrl.$setIcon();
      }
    },

    // When invoked it checks whether the input should be made 
    // clickable and adds or removes that functionality.
    $clickable: function(){
      if(this.$options.click && this.$options.icon){
        this.$subscribe('click');
        this.$subscribe('mousemove');
      }
      else {
        this.$unsubscribe('click');
        this.$unsubscribe('mousemove');
      }
    },

    $init: function(){
      cssClass(this.el, 'he-input');
      this.el.setAttribute('placeholder', this.$options.placeholder || "");
      
      // Remember the text typed into the input box (for firing type events)
      this.$prevalue = this.el.value = this.$format(this.$value);

      // Remember the inital value of the element (for firing change events)
      this.$initial = this.$value;

      this.$clickable();
      this.el.readOnly = !!this.$options.disabled;
      this.$setIcon();
      this.on('he:focus he:blur', function(){ 
        this.$setIcon(); 
      });
    },

    // Sets an icon as a background image to the input. 
    // Since we're using SVG icons as background images, we can't control their color 
    // through css, so we need to run this method each time they change.
    $setIcon: function(){
      var self = this;
      var icon = this.$options.icon;
      var pos  = this.$options.iconpos;
      var el   = this.el;

      // FIXME: Move this to a reqeustAnimationFrame
      setTimeout(function(){
        if(icon){
          if(pos === 'after'){
            el.style.paddingRight = '2.1em';
            el.style.paddingLeft = '';
            el.style.backgroundPosition = 'right 2px center';
          }
          else {
            el.style.paddingRight = '';
            el.style.paddingLeft = '2.1em';
            el.style.backgroundPosition = 'left 2px center';
          }
          el.style.backgroundSize = '1.4em 1.4em';
          el.style.backgroundRepeat = 'no-repeat';
          // Icons are always the same color as the border. Use 'border-bottom-color' as it's an atomic property.
          el.style.backgroundImage = he.util.iconBackground(icon, getComputedStyle(el, null).borderBottomColor);
        }
        else {
          el.style.backgroundImage = '';
          el.style.paddingRight = '';
          el.style.paddingLeft = '';
        }
      }, 20);
    },

    // Formats the value for display.
    $format: function(value){
      return value || ""; // null is shown as empty string
    },

    // Empty string is considered null.
    $sanitize: function(value){
      return value || null;
    },

    get: function() {
      return this.$value;
    },

    set: function(value, options) {
      var next = this.$sanitize(value);

      options = (options || {});
      options.previous = this.$value;

      if(next !== this.$value){
        // Setting the $prevalue to the $value will prevent 'type' events
        // to be fired on the 'keyup' event when we use set on the 'keydown' event.
        this.$prevalue = this.$value = next;
        this.trigger('he:change', options);
      }
      return this;
    }
  });
})()
