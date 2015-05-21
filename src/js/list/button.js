/**
 * Helium (he) button list.  
 * Documented in list.md.
**/
;(function(){
  he.controls.buttonList = ButtonList;
  function ButtonList(element, options){
    if(options.type === "radio"){
      options.onIcon = "check-circle-blank"; 
      options.offIcon = "check-circle-outline-blank";
      options.nullable = false;
      options.multiple = false;
    }
    he.abstract.list.call(this, element, _.defaults(options, this.$defaults));
    
    this.buttons = {};
    
    this.on('he:change', function(options){
      var buttons = this.buttons;
      _.each(options.added, function(i){
        buttons[i].val(true, { silent: true });
      });
      _.each(options.removed, function(i){
        buttons[i].val(false, { silent: true });
      });
    });
  }
  
  var proto = he.abstract.list.prototype;
  ButtonList.prototype = he.util.inherits(proto, he.mixins.disableable, he.mixins.errored, he.mixins.tooltip, he.mixins.labeled, {
    $defaults: _.defaults({
      type: 'checkbox',
      onIcon: 'check-box',
      offIcon: 'check-box-blank',
      multiple: true,
      nullable: true
    }, proto.$defaults),

    $o: { 
      type: function(ctrl, prev){
        var type = ctrl.$options.type;
        if(type === "radio"){
          ctrl.option({ onIcon: "check-circle-blank", offIcon: "check-circle-outline-blank", multiple: false, nullable: false });
        }
        else {
          ctrl.option({ onIcon: "check-box", offIcon: "check-box-blank", multiple: true, nullable: true });
        }
        ctrl.render();
      },
      onIcon: function(ctrl, prev){
        _.invoke(ctrl.buttons, 'option', 'onIcon', ctrl.$options.onIcon);
      },
      offIcon: function(ctrl, prev){
        _.invoke(ctrl.buttons, 'option', 'offIcon', ctrl.$options.offIcon);
      },
      disabled: function(ctrl, prev){
        if(!ctrl.$options.disabled !== !prev) {
          _.each(ctrl.buttons, function(btn){
            btn[ ctrl.$options.disabled ? 'disable' : 'enable' ]();
          });
        }
        ctrl.$setDisable(ctrl.$options.disabled, prev);
      }
    },
    
    $init: function(){
      this.render();
    },
    
    // Alternative render method
    $nextIndex: 0,
    nextButton: function(){
      var items = this.$items;
      var index = this.$nextIndex;
      var item = items[index];

      if(item === undefined){
        this.$nextIndex = 0;
        return null;
      }
      
      var self = this;
      var filter = this.$options.filter;
      var tget = this.$options.tget;
      var vget = this.$options.vget;
      var type = this.$options.type;
      var selection = this.$selection;
      var oldButton = this.buttons[index];
      
      
      if(vget(item) === undefined){
        this.$nextIndex++;
        return this.nextButton();
      }

      var element = document.createElement('button');
      var btn = he(type, element, {
        text: tget(item),
        value: index in selection,
        onIcon: this.$options.onIcon,
        offIcon: this.$options.offIcon,
        disabled: this.$options.disabled
      });
      btn.on('change', function(){
        self.set(index, { index: true, op: this.$value ? "add" : "remove" });
      });

      this.$nextIndex++;
      return this.buttons[index] = btn;
    },

    // Render method
    render: function(){
      _.each(this.buttons, function(button){
        he.unregister(button);
        button.el.parentElement && button.el.parentElement.removeChild(button.el);
      });
      var button; 
      var fragment = document.createDocumentFragment();
      while(button = this.nextButton()){
        fragment.appendChild(button.el);
      }
      this.el.appendChild(fragment);
    }
  });
})();
