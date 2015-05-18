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
        ctrl.$error(ctrl.$options);
      }
    },

    $init: function(options){
      var self = this;

      // These handlers are attached either to the label
      // or to the element itself.
      self.$errorHandlerOn = function(e){
        self.$errorTooltip.show(); 
      }
      self.$errorHandlerOff = function(e){ 
        self.$errorTooltip.hide(); 
      }
      
      this.$error();
    },

    $error: function(){      
      // TODO: Move this to RAF
      var options = this.$options;
      var label = options.label;

      this.el.removeEventListener('mouseover', this.$errorHandlerOn);
      this.el.removeEventListener('mouseout', this.$errorHandlerOff);
      this.$errorTooltip && this.$errorTooltip.hide();

      if(options.error){
        if(!this.$errorTooltip) {
          this.$errorTooltip = new he.util.popover({ anchor: this.el, position: 'above', cssClass: 'he-red he-tooltip' });
        }
        this.$errorTooltip.setOptions({ content: options.error });

        if(label){
          cssClass(label, 'he-error');
          label.innerHTML += iconHTML("error");
        }
        this.el.addEventListener('mouseover', this.$errorHandlerOn);
        this.el.addEventListener('mouseout', this.$errorHandlerOff);
        cssClass(this.el, 'he-error');
      }
      else {
        if(label){
          cssClass(label, null, 'he-error');
          var icon = label.querySelector('svg');
          icon && label.removeChild(icon);
        }
        cssClass(this.el, null, 'he-error');
      }
    }
  }
})();
