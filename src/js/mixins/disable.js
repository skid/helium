/**  
 * Mixin that allows disabling.
 * Documented in mixins.md.
**/
(function(){
  var cssClass = he.util.cssClass;
  
  he.mixins.disableable = {
    $o: {
      disabled: function(ctrl, prev){
        ctrl.$setDisable(ctrl.$options.disabled, prev);
        ctrl.trigger('he:disable', { disabled: ctrl.$options.disabled });
      }
    },
    
    $init: function(options){
      this.$setDisable(options.disabled, null);
    },
    
    $setDisable: function(disabled, prev){
      var label = this.$options.label;
      
      if(disabled) {
        cssClass(this.el, 'he-disabled');
        this.el.hasAttribute('tabindex') && this.el.setAttribute('tabindex', '-1');
        label && cssClass(label, 'he-disabled');
        if(typeof disabled === "string" || _.isArray(disabled)){
          cssClass(this.el, disabled);
          label && cssClass(label, disabled);
        }
      }
      else {
        cssClass(this.el, null, 'he-disabled');
        this.el.hasAttribute('tabindex') && this.el.setAttribute('tabindex', '0');
        label && cssClass(label, null, 'he-disabled');
        if(typeof prev === "string" || _.isArray(prev)){
          cssClass(this.el, null, prev);
          label && cssClass(label, null, prev);
        }
      }
    },
    
    disable: function(cssClass){
      return this.option('disabled', cssClass || true);
    },

    enable: function(){
      return this.option('disabled', false);
    }
  }
})();
