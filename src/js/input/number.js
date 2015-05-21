/**  
 * Helium number input control. 
 * Documented in input.md.
 *  
 * The number input does as-you-type formatting  
 * of its displayed value, adding thousands separators as soon as you  
 * type a number with more than 3 digits. It also accepts only number keystrokes.
 *  
 * ### [Binds to]
 * - HTML <input> element 
 * 
 * ### [Requires]
 * - util/misc 
 * - util/dom
 * - input/basic
 *  
 * ### [Inherits]
 * - input.input
 *  
 * ### [Options] 
 * #### format 
 * Number. Default: `0`.  
 * The number of decimals to round to. If set to 0, the input will 
 * show only integers and return only integers as value. Otherwise 
 * it will always round its values to the specified precision.
 *  
 * #### negative 
 * Boolean. Default: `false`.   
 * If set to `true`, the input will allow negative values. 
 * 
 * #### value 
 * The initial text numeric value of the input.
 *  
 * ### [CSS classes] 
 * - he-number
**/
;(function(){
  var km = he.keymap;
  var cssClass = he.util.cssClass;
  var round = he.util.number.round;
  var pad = he.util.number.pad;
  var format = he.util.number.format;
  var parse = he.util.number.parse;
  
  var NumberInput = he.controls.number = function NumberInput(element, options, cfg){
    // Inherits from Input
    he.controls.input.call(this, element, _.defaults(options, this.$defaults));

    // Compile regexes
    this.$compile();
    
    // Bind the listeners
    this.$subscribe('keydown');
    
    this.on('he:keydown', function(e){
      var el = element;
      var which = e.which;
      
      // This keydown event was not invoked by typing
      if(!e || typeof e !== 'object' || !which) {
        return;
      }

      // This will allow arrow keys, cut, copy, paste actions.
      if(_.include(this._allowedKeys, which) || e.metaKey || e.ctrlKey) {
        return;
      }

      // 96-105 are numpad numbers
      if(which >= 96 && which <= 105) {
        which -= 48;
      }

      // 110 is the numpad decimal point, 190 is the period.
      if(which === km.NUMPAD_DECIMAL || which === km.PERIOD) {
        which = 46;
      }
      
      // Dash
      if(which === km.DASH){
        which = 45;
      }

      // 188 is the comma key, but the charcode for the comma in ASCII is 44
      if(which == km.COMMA) {
        which = 44;
      }
      
      // If we've gotten this far, this is a regular key pressed while shift is also pressed
      // We don't want to allow one of these !@#$%^&*()
      if(e.shiftKey){
        return e.preventDefault();
      }
      
      var ch = which === km.PERIOD ? '.' : String.fromCharCode(which);

      if( !this._reValidChar.test(ch) ){
        e.preventDefault();
        return;
      }

      var newValue    = "";
      var caretOffset = 1;
      var start       = el.selectionStart;
      var newStart    = el.selectionStart;
      var end         = el.selectionEnd;
      var value       = el.value.substr(0, start) + el.value.substr(end);

      // Disallow more than one dot   
      if(ch === this._dot && value.indexOf(ch) !== -1){
        return e.preventDefault();
      }

      // Auto-prepend zeros when the user hits '.' on an empty field
      if(ch === this._dot && value.length === 0){
        ch = '0' + this._dot;
        caretOffset += 1;
      }

      // Compensate caret position for removed commas
      var tmpStart = start;
      for(var i=0; i < start; i++){
        if( value[i] == this._comma ){
          tmpStart -= 1;
        }
        start = tmpStart;
      }
      
      // Disallow dashes not at the start
      if(ch === "-"){
        if(value.indexOf(ch) !== -1 || start !== 0){
          e.preventDefault();
        }
      }
      
      // Disallow leading zeros for the whole number part.
      if(ch === '0'){
        var testval = value.replace(this._re000Sep, '');
        testval = testval.substr(0, start) + ch + testval.substr(start);

        if(this._reLeading0s.test(testval)){
          return e.preventDefault();
        }
      }

      // Change the value of the field (add commas)
      value     = value.replace(this._re000Sep, '');
      value     = value.substr(0, start) + ch + value.substr(start);
      var parts = value.split(this._dot);
      var whole = parts[0];
      var deci  = parts[1];

      // Disallow typing in more decimals than allowed
      if(this.$options.format > 0 && deci && deci.length > this.$options.format){
        return e.preventDefault();
      }

      // Format the whole part with thousand separators
      var highOrder = whole.length % 3;
      for(var i=0; i<whole.length; ++i){
        if(i && (i - highOrder) % 3 === 0 && newValue !== "-"){
          newValue += this._comma;
          if(i < start + 1) {
            caretOffset += 1;
          }
        }
        newValue += whole[i];
      }

      // Append the decimal part. 
      // It might be an empty string so that's why we test for undefined.
      if(deci !== undefined) {
        newValue += this._dot + deci;
      }

      // We need to programatically limit the length since the input is value changes programatically
      if(this.$options.maxlength && newValue.length > this.$options.maxlength) {
        return e.preventDefault();
      }

      // Everything's OK. 
      // Apply the new value and move the selection to the correct place
      el.value = newValue;
      el.selectionStart = el.selectionEnd = start + caretOffset;

      // Prevent the default action, we already took care of it.
      e.preventDefault();
    });
  }
  
  var proto = he.controls.input.prototype;
  NumberInput.prototype = he.util.inherits(proto, {
    $defaults: _.defaults({
      format: 0
    }, proto.$defaults),
    
    $o: {
      negative: function(ctrl, prev){
        ctrl.$compile();
      },

      format: function(ctrl, prev){
        // Allow only numeric formats for now
        ctrl.$options.format = parseInt(ctrl.$options.format, 10);
        if(isNaN(ctrl.$options.format) || ctrl.$options.format < 0) {
          ctrl.$options.format = 0;
        }

        // Compile new rexeses and force a reformat
        ctrl.$compile();
        ctrl.el.value = ctrl.$format(ctrl.$value);
      }
    },
    
    $init: function(){
      cssClass(this.el, 'he-number');
    },

    // Compiles regexes needed for as-you-type formatting
    $compile: function $compile(thousandsSeparator, decimalPoint){
      var neg = this.$options.negative ? "\\-" : "";
      
      this._comma       = thousandsSeparator || ",";
      this._dot         = this.$options.format ? (decimalPoint || ".") : "*";
      this._allowedKeys = [37, 38, 39, 40, 27, 8, 46, 9];
      this._reLeading0s = new RegExp("^0[^\\" + this._dot + "]");
      this._reValidChar = new RegExp('[0-9\\' + this._dot + neg + ']');
      this._re000Sep    = new RegExp("\\" + this._comma, 'g');
    },

    // Returns the string representation of the current value
    $format: function $format(value){
      return value === null ? "" : format(value, this.$options.format);
    },

    // Converts any value to a number or null
    $sanitize: function $sanitize(value){
      var number = parse(value);
      return number === null ? null : this.$options.format ? round(number, this.$options.format) : Math.floor(number);      
    }
  });
})()
