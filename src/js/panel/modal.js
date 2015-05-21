/**
 * Helium (he) modal utility.  
 * Documented in panel.md.
**/
;(function(){
  var doc = document;
  var docEl = doc.documentElement;
  var cssClass = he.util.cssClass;
  var km = he.keymap;
  
  he.util.overlay = {
    el: cssClass(doc.createElement('div'), 'he-overlay'),
    ref: 0,
    st: 0,
    show: function(){
      this.ref += 1;
      if(this.ref === 1){
        doc.body.appendChild(this.el);
        this.st = docEl.scrollTop || doc.body.scrollTop;
        cssClass(doc.body, 'noscroll');
        doc.body.style.top = -this.st + "px";
      }
    },
    hide: function(){
      this.ref -= 1;
      if(this.ref === 0){
        doc.body.removeChild(this.el);
        cssClass(doc.body, null, 'noscroll');
        doc.body.style.top = docEl.style.top = 0;
        doc.body.scrollTop = docEl.scrollTop = this.st;
      }
    }
  }

  he.controls.modal = Modal;
  function Modal(el, options){
    he.abstract.control.call(this, el, _.defaults(options, { 
      overlay: true,
      closeAnywhere: true,
      closeIcon: false
    }));
    
    this.isOpen = false;
    this.$subscribe('global:click');
    this.on('global:click', function(e){
      if(he.util.findUp(e.target, 'class', 'he-modal') !== this.el && this.$options.closeAnywhere){
        this.close();
      }
    });
  }

  Modal.prototype = he.util.inherits(he.abstract.control.prototype, {
    $o: {
      overlay: function(ctrl, prev){
        prev ? he.util.overlay.hide() : he.util.overlay.show();
      },
      closeAnywhere: function(){},
      closeIcon: function(ctrl, prev){ ctrl.$setIcon(); },
      focusOnFirst: function(){}
    },
    
    $position: function(){
      var pos = he.util.getPositionInfo(this.el);
      this.el.style.top = (pos.vHeight - pos.aHeight) / 2 + "px";
      this.el.style.left = (pos.vWidth - pos.aWidth) / 2 + "px";
      if(this.$icon){
        this.$icon.style.top = (parseInt(this.el.style.top, 10) || 0) + "px";
        this.$icon.style.left = (parseInt(this.el.style.left, 10) || 0) + pos.aWidth + 10 + "px";
      }
    },
    
    $init: function(){
      this.$setIcon();
      cssClass(this.el, 'he-modal');
    },
    
    $setIcon: function(){
      var self = this;

      if(this.$options.closeIcon){
        this.$icon = cssClass(document.createElement('span'), 'he-modal-close-icon');
        this.$icon.addEventListener('click', function(){
          self.close();
        });
        document.body.appendChild(this.$icon);
        if(this.isOpen) {
          this.$position();
          cssClass(this.$icon, 'he-shown');
        }
      }
      else {
        this.$icon && this.$icon.parentElement.removeChild(this.$icon);
        delete this.$icon;
      }
    },
    
    // Captures the tabbing order to cycle only on the controls
    // within the modal.
    $captureTab: function(focusOnFirst){
      this.$unbinder && this.$unbinder();

      // All amp elements within this modal that are focusable
      var controls = this.el.querySelectorAll('*[data-heid]');
      if(!controls.length){
        return;
      }

      var self = this;
      var first = controls[0];
      var last = controls[controls.length - 1];
      
      focusOnFirst && _.defer(function(){ 
        first.focus();
      });
      
      function handlerLast(e){
        if(e.which === km.TAB && !e.shiftKey){
          e.preventDefault();
          first.focus();
        }
      }
      last.addEventListener('keydown', handlerLast);
      
      function handlerFirst(e){
        if(e.which === km.TAB && e.shiftKey){
          e.preventDefault();
          last.focus();
        }
      }
      first.addEventListener('keydown', handlerFirst);

      this.$unbinder = function(){
        last.removeEventListener('keydown', handlerLast);
        first.removeEventListener('keydown', handlerFirst);
        self.$unbinder = null;
      }
    },
    open: function(){
      if(this.isOpen){
        return false;
      }

      var self = this;
      var isCancelled = false;
      this.trigger('willOpen', function cancel(){
        isCancelled = true;
      });
      
      if(isCancelled){
        return false;
      }
      
      // Deferred so it doesn't close from the click that opens it
      var args = ['open'].concat(_.toArray(arguments));
      _.defer(function(){
        self.$options.overlay && he.util.overlay.show();
        self.$position();
        self.isOpen = true;
        cssClass(self.el, 'he-modal-shown');
        self.$icon && cssClass(self.$icon, 'he-shown');
        self.$captureTab(self.$options.focusOnFirst);
        self.trigger.apply(self, args);
      });
      return true;
    },
    
    close: function(){
      if(this.isOpen){
        var self = this;
        var isCancelled = false;
        this.trigger('willClose', function cancel(){
          isCancelled = true;
        });
      
        if(isCancelled){
          return false;
        }
        
        var args = ['close'].concat(_.toArray(arguments));
        _.defer(function(){
          self.$options.overlay && he.util.overlay.hide();
          self.isOpen = false;
          cssClass(self.el, null, 'he-modal-shown');
          self.$icon && cssClass(self.$icon, null, 'he-shown');
          self.$unbinder && self.$unbinder();
          self.trigger.apply(self, args);
        });
        return true;
      }
      return false;
    }
  });
})()
