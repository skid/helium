/**  
 * Allows controls to be aware of their label element.  
 * Documented in mixins.md. 
**/
(function(){
  var cssClass = he.util.cssClass;
  
  he.mixins.labeled = {
    $o: {
      label: function(ctrl, prev){
        var label = ctrl.$options.label;

        if(label) {
          // The label must be a DOM element or a string
          if(typeof label === "string"){
            label = document.getElementById(label);
          }
          if(!_.isElement(label)){
            ctrl.$options.label = null;
          }
          // If we're already disabled, apply that class to the label
          else if(ctrl.$options.disabled) {
            cssClass(label, 'he-disabled');
          }
        }
        // Remove any disabled classes from the previous element
        if(_.isElement(prev)){
          prev.classList.contains('he-disabled') && cssClass(prev, null, 'he-disabled');
        }

        ctrl.$error && ctrl.$error();
      }
    }
  }
})();
