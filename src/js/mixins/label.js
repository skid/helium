/**  
 * Allows controls to be aware of their label element.  
 * Documented in mixins.md. 
**/
(function(){
  var cssClass = he.util.cssClass;

  he.mixins.labeled = {
    $o: {
      label: function(ctrl, prev){
        // Remove any disabled classes from the previous element
        if(_.isElement(prev)){
          prev.classList.contains('he-disabled') && cssClass(prev, null, 'he-disabled');
        }
        ctrl.setLabel();
      }
    },

    $setLabel: function(){
      var label = this.$options.label;
      if(label) {
        // The label must be a DOM element or a string
        if(typeof label === "string"){
          this.$options.label = label = document.getElementById(label);
        }
        if(!_.isElement(label)){
          this.$options.label = null;
        }
      }
    },

    $init: function(options){
      options.label && this.$setLabel();
    }
  }
})();
