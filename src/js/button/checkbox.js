/**
 * Helium checkbox button control. 
 * Documented in button.md.
**/
;(function(){
  var cssClass = he.util.cssClass;

  var Checkbox = he.controls.checkbox = function Checkbox(element, options, cfg){
    // Inherits from Button
    he.controls.button.call(this, element, _.defaults(options, this.$defaults));
    
    this.on('he:click', function(){
      this.$options.disabled || this.val(this.$options.nullable ? !this.val() : true);
    });
    
    this.on('he:change', function(options){
      options.silent || this.trigger('change', options);
    });
    
    this.$value = !!options.value;
  };

  var proto = he.controls.button.prototype;
  Checkbox.prototype = he.util.inherits(proto, {
    $defaults: _.defaults({
      iconpos: 'before',
      onIcon: 'check-box',
      offIcon: 'check-box-blank',
      icon: 'check-box-blank',
      nullable: true
    }, proto.$defaults),

    $o: {
      onIcon: function(ctrl){ ctrl.$setIcon(); },
      offIcon: function(ctrl){ ctrl.$setIcon(); },
      nullable: function(ctrl){ /* only has effect on user clicks */ }
    },
    
    $init: function(){
      cssClass(this.el, null, 'he-button');
      cssClass(this.el, 'he-checkbox');
      this.$setIcon();
    },

    $setIcon: function(){
      this.option('icon', this.$value ? this.$options.onIcon : this.$options.offIcon);
    },
    
    get: function(){
      return this.$value;
    },
    
    set: function(checked, options){
      options = options || {};
      options.previous = this.get();

      this.$value = !!checked; // Sanitize input
      
      if(options.previous !== this.$value) {
        this.$setIcon();
        this.trigger('he:change', options);
      }
    }
  });
})()
