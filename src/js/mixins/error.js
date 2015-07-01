/**  
 * Mixin that allows marking contorls as erroneous (invalid). 
 * Documented in mixins.md.
**/
(function(){
  var cssClass = he.util.cssClass;
  var iconHTML = he.util.iconHTML;

  he.mixins.errored = {
    $o: {
      error: function(ctrl, prev){
        ctrl.$setError(ctrl.$options);
      }
    },

    $init: function(options){
      var self = this;

      // These handlers are attached either to the label or to the element itself.
      this.$errorHandlerOn = function(e){ self.$errorTooltip.show(); }
      this.$errorHandlerOff = function(e){ self.$errorTooltip.hide(); }
      this.$setError();
    },

    $setError: function(){
      var options = this.$options;
      var label = options.label;

      this.el.removeEventListener('mouseover', this.$errorHandlerOn);
      this.el.removeEventListener('mouseout', this.$errorHandlerOff);
      this.$errorTooltip && this.$errorTooltip.hide();

      if(options.error){
        if(!this.$errorTooltip) {
          this.$errorTooltip = new he.util.popover({ 
            anchor: this.el, 
            position: 'above', 
            cssClass: 'he-red he-tooltip' 
          });
        }
        this.$errorTooltip.setOptions({ content: options.error });
        this.el.addEventListener('mouseover', this.$errorHandlerOn);
        this.el.addEventListener('mouseout', this.$errorHandlerOff);
        cssClass(this.el, 'he-error');
        
        if(label){
          cssClass(label, 'he-error');
          if(!label.querySelector('svg')){
            label.innerHTML += iconHTML("error");
          }
        }
      }
      else {
        cssClass(this.el, null, 'he-error');
        
        if(label){
          cssClass(label, null, 'he-error');
          var icon = label.querySelector('svg');
          icon && label.removeChild(icon);
        }
      }
    }
  }
})();
