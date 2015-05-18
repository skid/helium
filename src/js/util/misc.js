/**
 * Helium misc utilities. Private.
 * Contains functions to work with dates, numbers and 
 * some internally used stuff. 
 *  
 * [Requires]
 * - core
**/
;(function(){  
  var gt999 = /(\d+)(\d{3})/;
  var re000comma = /,/g;
  var re000dot = /\./g;
  var slice = [].slice;
  var reFormats = {
    "ISO": /^(\d{2,4})-(\d{1,2})-(\d{1,2})$/,
    "EU": /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/,
    "US": /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/
  }
  
  /**  
   * Date utilities
   *  
   * @module util 
   * @submodule date 
  **/
  he.util.date = {
    /**  
     * Returns the days in the month of a specific Date object
     *  
     * @method getDaysInMonth
     * @param {Date} date The date in question.
     * @return {Number} The number of days in the date's month.
    **/
    getDaysInMonth: function(date){
      return [31, (this.isLeapYear(date) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][date.getMonth()];
    },

    /**  
     * Determines if a specific Date object's year is a leap year.
     *  
     * @method isLeapYear
     * @param {Date} date The date in question.
     * @return {Boolean} True if a leap year
    **/
    isLeapYear: function(date){
      var year = date.getFullYear();
      return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
    },
    
    /**  
     * Parses a string into a date object
     *  
     * @method parse
     * @param {Date} value The date in question. 
     * @param {String} format Can be one of "ISO" (default), "US" or "EU"
     * @return {Date} Returns a date or null if parsing failed
    **/
    parse: function(value, format) {
      var re, match, year, month, day;
    
      if(!(re = reFormats[format || "ISO"])){
        throw new Error("Date format not implemented. Use ISO, US or EU");
      }
      if(!(match = ("" + value).match(re))){
        return null;
      }
    	else if(format === "ISO") {
        year = parseInt(match[1], 10);
        month = parseInt(match[2], 10) - 1;
        day = parseInt(match[3], 10);
    	}
      else if(format === "US") {
        year = parseInt(match[3], 10);
        month = parseInt(match[1], 10) - 1;
        day = parseInt(match[2], 10);
      }
      else if(format === "EU") {
        year = parseInt(match[3], 10);
        month = parseInt(match[2], 10) - 1;
        day = parseInt(match[1], 10);
      }
    	return new Date(year, month, day);
    },
    
    /**  
     * Formats a date object in the chosen format
     *  
     * @method parse
     * @param {Date} value The date in question.
     * @param {String} format Can be one of "ISO" (default), "US" or "EU" 
     * @return {String} Returns a string 
     * @throws {TypeError}
    **/
    format: function(date, format) {
      var pad = he.util.number.pad;
      
      if(!(date instanceof Date)){
        throw TypeError("Date object required");
      }
    	if(format === "ISO") {
        return date.getFullYear() + '-' + pad(date.getMonth() + 1, 2) + '-' + pad(date.getDate(), 2);
    	}
      else if(format === "US") {
        return pad(date.getMonth() + 1, 2) + '/' + pad(date.getDate(), 2) + '/' + date.getFullYear();
      }
      else if(format === "EU") {
        return pad(date.getDate(), 2) + '.' + pad(date.getMonth() + 1, 2) + '.' + date.getFullYear();
      }
      else {
        throw new Error("Date format not implemented. Use ISO, US or EU");
      }
    	return date.toString();
    }
  }
  
  /**  
   * Number utilities
   *  
   * @module util 
   * @submodule number
  **/
  he.util.number = {
    /**
     * Formats a number to a string with a given precision.
     *  
     * @method format  
     * @param {Number} number The number to format
     * @param {Number} precision The number of decimal places 
     * @param {String} thousandsSeparator The thousands separator glyph, a comma by default 
     * @param {String} decimalPoint The decimal point glyph, a dot by default 
     * @return {String} The formatted number
    **/
    format: function(number, precision, thousandsSeparator, decimalPoint) {
      // The decimal point here is always "." because we used value.toFixed();
      var parts = number.toFixed(precision).split(".");
      while (gt999.test(parts[0])){
        parts[0] = parts[0].replace( gt999, '$1' + (thousandsSeparator || ",") + '$2' );
      }
      return parts[0] + (parts[1] ? (decimalPoint || ".") + parts[1] : "");
    },

    /**
     * Rounds a number to desired precision 
     *  
     * @method round 
     * @param {Number} number The number to round 
     * @param {Number} precision The number of decimals to round to 
     * @return {Number} The rounded number
    **/
    round: function(number, precision){
      var pow = Math.pow(10, precision || 2);
      return Math.round(number * pow) / pow;
    },

    /**
     * Left-pads a number to a given width with a given character. 
     *  
     * @method pad 
     * @param {Number} number The number to pad 
     * @param {Number} width The length of the output in characters 
     * @param {String} char The character(s) to pad with 
     * @return {String} the padded number
    **/
    pad: function(number, width, char) {
      var n = '' + number;
      return n.length >= width ? n : new Array(width - n.length + 1).join(char || '0') + n;
    },
    
    /**
     * Parses a string into a number taking into account thousands' separators.
     * Values that resolve to NaN will return null. 
     *  
     * @method parse 
     * @param {String} val The string to parse 
     * @param {String} thousandsSeparator The thousands separator glyph, a comma by default 
     * @param {String} decimalPoint The decimal point glyph, a dot by default 
     * @return {Number|null} The parsed number
    **/
    parse: function(val, thousandsSeparator, decimalPoint){
      thousandsSeparator = thousandsSeparator || he.config.thousandsSeparator;
      decimalPoint = decimalPoint || he.config.decimalPoint;
    
      // Don't compile a new regexp for the most common cases 
      var re000Sep = (thousandsSeparator === ',') 
        ? re000comma 
        : (thousandsSeparator === '.') 
          ? re000dot 
          : new RegExp("\\" + thousandsSeparator, 'g');
    
      val = ("" + val).replace(re000Sep, "");
      val = decimalPoint ? val.replace(decimalPoint, ".") : val;
      val = parseFloat(val, 10);

      return isNaN(val) ? null : val;
    }
  }
  
  /**  
   * Evaluates the first argument as a function, passing 
   * the other arguments as the function's arguments. 
   * If the first argument is not a function, returns its value.
   *  
   * @method evaluate 
   * @param {Mixed} A function and an optional list of arguments  
   * @return {Mixed} The result of the function
  **/
  he.util.evaluate = function evaluate(){
    return _.clone(_.isFunction(arguments[0]) ? arguments[0].apply(this, slice.call(arguments, 1)) : arguments[0]);
  }  
  
  /**  
   * Utility method for delegating methods to another control 
   * which is an attribute of "this" control. Used for 
   * compositing controls. 
   * 
   * @method delegateMethods 
   * @param {Control} sub The control to delegate to 
   * @param {Array} methods An array of method names 
   * @return {Object} an object of delegated named methods
  **/
  he.util.delegateMethods = function(sub, methods){
    return _.zipObject(methods, methods.map(function(method){
      return function(){
        var result = this[sub][method].apply(this[sub], arguments);
        if(result === this[sub]){
          return this;
        }
        return result;
      }
    }));
  }
  
  /**
   * Utility method for handling control inheritance
   * 
   * Returns a new object with all the properties of `dest` copied into it
   * and its prototype set to proto.
   * 
   * Any $o properties are also extended in a prototypical manner - the $o
   * property of `source` will have its prototype set to the $o property of `proto`
   * 
   * Also adds a `$super` property to `dest` which references the original prototype. 
   *  
   * If invoked with more than 2 arguments, the first 2 will be combined and used 
   * as a prototype for the next.  
   * 
   * @method inherits 
   * @param {Object} ...proto A number of prototypes that the "dest" object inherits from 
   * @param {Object} dest The destination object 
   * @return {Object} the dest object with a correct prototype chain
  **/
  he.util.inherits = function(proto, dest){
    var args = _.toArray(arguments);
    var proto = args.shift();
    var dest = args.shift();

    function Surrogate(){};
    Surrogate.prototype = proto;

    dest = _.extend(new Surrogate, dest, { $super: proto });

    // The options handler objects also inherit in a prototypical manner
    if(dest.hasOwnProperty('$o') && proto.$o){
      dest.$o = he.util.inherits(proto.$o, dest.$o);
    }
    
    if(args.length){
      args.unshift(dest);
      return he.util.inherits.apply(he, args);
    }

    return dest;
  }
})();
