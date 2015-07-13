/**
 * Helium combo list control.  
 * Documented in list.md.
**/
;(function(){
  var cssClass = he.util.cssClass;
  var AutocompleteList = he.controls.autocompleteList;
  var inherits = he.util.inherits;

  he.controls.comboList = ComboList;
  function ComboList(element, options){
    options = _.defaults(options, this.$defaults);
    AutocompleteList.call(this, element, options);

    var self = this;
    this.input.off('he:blur', this.__autocompleteBlurHandler);
    this.list.off('he:change', this.__autocompleteChangeHandler);

    this.list.on('he:change', function(e){
      if(self.$options.ajax){
        !this.val() && !options.ajax && this.reset([], { ajax: true });
        self.close();
      }
      // If the change came due to a list reset becaue of ajax, don't empty the input
      options.ajax || self.input.val(self.list.text() || "");
    });

    this.input.on('he:blur', function(e){
      var listText = self.list.text() || "";
      var inputText = self.input.el.value;

      if(!inputText){
        self.list.val(null);
      }
      else {
        var index = self.list.indexOfText(inputText);
        if(index === -1){
          self.list.val(null);
        }
        else {
          self.list.val(index, { index: true });
        }
      }
      self.close();
    });

    this.input.on('change', function(options){
      options.silent || self.trigger('change', options);
    });
  }

  ComboList.prototype = he.util.inherits(AutocompleteList.prototype, {
    get: function(){
      return this.input.get();
    },
    set: function(value, options){
      this.input.set(value, options);
    }
  });

  he.controls.comboList = ComboList;
})()
