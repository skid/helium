/**  
 * Helium (he) radio button control. 
 * Documented in button.md.
**/
;(function(){
  var Radio = he.controls.radio = function Radio(element, options, cfg){
    he.controls.checkbox.call(this, element, _.defaults(options, this.$defaults));
  };

  Radio.prototype = he.util.inherits(he.controls.checkbox.prototype, {
    $defaults: _.defaults({
      onIcon:  'check-circle-blank',
      offIcon: 'check-circle-outline-blank',
      icon:    'check-circle-outline-blank',
      nullable: false
    }, he.controls.checkbox.prototype.$defaults)
  });
})()
