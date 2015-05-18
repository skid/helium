/**  
 * Helium DOM utilities.  
 * A collection of functions for DOM manipulation
 * 
 * ### [Requires]
 * - core
 *
**/
(function(){
  var docel = document.documentElement;
  
  /**  
   * Takes an array or a space-separated string of css classes 
   * and converts to an array. 
   *   
   * @param {Mixed} [arr] A the string or array to be converted 
   * @raturn {Array} 
  **/
  function toArray(arr){
    if(typeof arr === "string"){
      arr = arr.split(/\s+/);
    }
    else if(!_.isArray(arr)){
      arr = [];
    }
    return _.compact(arr);
  }
  
  /**  
   * A utility for setting and removing css classes to 
   * HTML elements.  
   * Note: This function can cause DOM reflows, so use 
   * it with caution.
   *  
   * @module util 
   * @mehtod cssClass
   * @param {HTMLElement} el The element in question 
   * @param {Mixed} add The string/array of classes to be added (null is equal to an empty string)
   * @param {Mixed} [remove] The string/array of classes to be removed (null is equal to an empty string) 
   * @return {HTMLElement} The same element
  **/
  he.util.cssClass = function cssClass(el, add, remove){
    add = toArray(add);
    remove = toArray(remove);
    
    _.each(_.difference(remove, add), function(rem){
      el.classList.contains(rem) && el.classList.remove(rem);
    });
    _.each(_.difference(add, remove), function(add){
      el.classList.contains(add) || el.classList.add(add);
    });
    return el;
  }

  /**  
   * A utility for finding the first ancestor of an  
   * HTML element that satisfies a certain condition.
   *  
   * @module util 
   * @mehtod findUp
   * @param {HTMLElement} el The original element
   * @param {String} attr An attribute type we are looking for in the ancestor.  
   * Can be: "class", "attr" or "id".
   * @param {String} val The value to compare to the attribute of each ancestor. 
   * If `attr="class"` then `val` is looked in each ancestor's classList. 
   * If `attr="attr"` then we look for the presence of an html attribute named `val` 
   * If `attr="id"` then the id attribute of each ancestor is checked. 
   * if `attr="tag"` then the tag name of each ancestor is checked.
   * @return {Mixed} Returns either the first matched. ancestor HTMLElement, or null
  **/
  he.util.findUp = function findUp(el, attr, val){
    if(attr === 'class'){
      do{ if(el.classList && el.classList.contains(val)) return el; } while (el !== docel && (el = el.parentNode));
    }
    else if(attr === 'attr'){
      do{ if(el.hasAttribute(val)) return el; } while (el !== docel && (el = el.parentNode));
    }
    else if(attr === 'id'){
      do{ if(el.id === val) return el; } while (el !== docel && (el = el.parentNode));
    }
    else if(attr === 'tag'){
      val = val.toLowerCase();
      do{ if(el.tagName.toLowerCase() === val) return el; } while (el !== docel && (el = el.parentNode));
    }
  }
  
  /**  
   * Scrolls a parent element to have the child  
   * completely in view. 
   *  
   * @method scrollTo 
   * @param {HTMLElement} child the child HTML element 
   * @param {HTMLElement} parent the parent HTML element
  **/
  he.util.scrollTo = function scrollTo(child, parent){
    var pbox = parent.getBoundingClientRect();
    var cbox = child.getBoundingClientRect();
    
    // Scrollbars
    var barH = parent.offsetHeight - parent.clientHeight;
    var barW = parent.offsetWidth - parent.clientWidth;

    parent.scrollTop += (cbox.top - pbox.top) < 0 
      ? cbox.top - pbox.top
      : pbox.bottom - barH - cbox.bottom < 0 
        ? cbox.bottom + barH - pbox.bottom
        : 0;

    parent.scrollLeft += (cbox.left - pbox.left) < 0 
      ? cbox.left - pbox.left
      : pbox.right - barW - cbox.right < 0
        ? cbox.right + barW - pbox.right
        : 0;
  }
})();