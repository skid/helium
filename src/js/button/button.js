/**
 * Helium basic button control.
 * Documented in button.md.
**/
;(function(){
  var findUp = he.util.findUp;
  var cssClass = he.util.cssClass;
  var Button = he.controls.button = function Button(element, options){
    // Inherits from Control
    he.abstract.control.call(this, element, _.defaults(options, { text: element.textContent }, this.$defaults));

    // Button responds only to click events
    this.$subscribe('click');

    // When clicked, forward this event to public listeners
    this.on('he:click', function(e){
      // Firefox and safari dont focus buttons on click
      this.el.focus();
      if(_.isFunction(this.$options.iconclick) && findUp(e.target, 'tag', 'span')){
        return this.$options.iconclick.call(this);
      }
      this.$options.disabled || this.trigger('click');
    });
    
    // Adding the class here so it can be removed by the $init method of inherited classes
    // TODO: Should be somehow moved to $init
    cssClass(this.el, 'he-button');
  };

  var proto = he.abstract.control.prototype;
  Button.prototype = he.util.inherits(proto, he.mixins.disableable, he.mixins.tooltip, he.mixins.labeled, he.mixins.errored, {
    $defaults: {
      iconpos: 'before'
    },

    $o: {
      text: function(ctrl){ ctrl.$render(); },
      icon: function(ctrl){ ctrl.$render(); },
      iconpos: function(ctrl){ ctrl.$render(); },
      iconclick: function(){ /* noop */ },
    },

    $init: function(){
      this.$render();
    },

    /**
     * Renders the button's contents, along with an optional icon
    **/
    $render: function(){
      var text = this.$options.text || "";
      var icon = this.$options.icon ? ("<span>" + he.util.iconHTML(this.$options.icon) + "</span>") : "";

      // FIXME: Move to a delayed requestAnimationFrame
      this.el.innerHTML = (this.$options.iconpos === "after") ? (text + " " + icon) : (icon + " " + text);
      return this;
    }
  });
})()
