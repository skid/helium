/**  
 * Allows controls to show pop-over tooltips. 
 * Documented in mixins.md.
**/
(function(){
  var cssClass = he.util.cssClass;
  he.mixins.tooltip = {
    $o: {
      tooltip: function(ctrl, prev){
        ctrl.$tooltip();
      }
    },
    
    $init: function(){
      var self = this;

      // These handlers are attached either to the label
      // or to the element itself.
      this.$tooltipHandlerOn = function(e){
        // Don't show the tooltip if we have an error tooltip
        self.$options.error || self.$tooltipEl.show(); 
      }
      this.$tooltipHandlerOff = function(e){ 
        self.$tooltipEl.hide(); 
      }
      this.$tooltip();
    },
    
    $tooltip: function(){
      var options = this.$options.tooltip;

      // Always hide the tooltip when changing options
      this.el.removeEventListener('mouseover', this.$tooltipHandlerOn);
      this.el.removeEventListener('mouseout', this.$tooltipHandlerOff);
      this.tooltipHide();
      if(options){
        if(!this.$tooltipEl){
          this.$tooltipEl = new he.util.popover({ anchor: this.el, position: 'above', cssClass: 'he-tooltip' });
        }
        this.$tooltipEl.setOptions(options);
        this.el.addEventListener('mouseover', this.$tooltipHandlerOn);
        this.el.addEventListener('mouseout', this.$tooltipHandlerOff);
      }
      else {
        delete this.$tooltipEl;
      }
    },
    
    tooltipShow: function(options){
      this.option('tooltip', options || this.$options.tooltip || {});
      this.$tooltipEl && this.$tooltipEl.show();
    },

    tooltipHide: function(){
      this.$tooltipEl && this.$tooltipEl.hide();
    },

    tooltipToggle: function(options){
      this.$tooltipEl && this.$tooltipEl.needsRender ? this.tooltipShow(options) : this.tooltipHide();
    }
  }
})();
