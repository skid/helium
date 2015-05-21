/**
 * A popup menu control. 
 * Documented in panel.md.
**/
;(function(){
  var doc = document;
  
  he.controls.menu = Menu;
  function Menu(options){
    var self = this;

    this.box = new he.util.box({ 
      anchor: options.anchor, 
      parent: options.parent || (he.msie ? doc.body : doc.documentElement), 
      cssClass: 'he-menu',
      hauto: "opposite",
      vauto: "max"
    });
    he.abstract.control.call(this, this.box.el, _.defaults(options, { position: 'vertical' }));
    
    this.$parent = options.parentMenu;  // A reference to a possible parent menu
    this.$submenus = {};                // A map of submenus
    this.$openHandler = function(){     // Will be attached to the anchor
      self.open();
    }
    
    this.$setBoxPos(this.$options.position);
    this.$setHandler();
    this.create();
    
    this.$subscribe('global:mousedown');
    this.$subscribe('click');

    this.on('submenu:open', function(opened){
      _.each(this.$submenus, function(sub){ sub !== opened && sub.close(); });
    });

    this.on('open', function(){
      this.$parent && this.$parent.trigger('submenu:open', this);
    });

    this.on('close', function(){
      this.$parent && this.$parent.trigger('submenu:close', this);
      _.invoke(this.$submenus, 'close');
    });
    
    this.on('willopen', function(){
      this.$parent && this.$parent.trigger('submenu:willopen', this);
    });
    
    this.on('willclose', function(){
      this.$parent && this.$parent.trigger('submenu:willclose', this);
    });
    
    this.on('he:click', function(e){
      var item = he.util.findUp(e.target, 'class', 'he-menu-item');
      if(item){
        this.trigger('click', { item: this.$options.menu[item.getAttribute('he-item-index')] });
      }
    });
    
    this.on('global:mousedown', function(e){
      var me = he(he.util.findUp(e.target, 'class', 'he-menu'));
      
      // Check if we clicked on the menu or its submenus
      if(!me || !me.isSubmenuOf(this)){
        
        // We clicked outside the menu. Check if we maybe clicked on its anchor.
        var mi = he.util.findUp(e.target, 'class', 'he-menu-item');
        if(mi !== this.$options.anchor){
          return this.close();
        }
      }
    });
  }

  Menu.prototype = he.util.inherits(he.abstract.control.prototype, {
    $o: {
      anchor: function(ctrl, prev){
        ctrl.box.setOptions({ anchor: ctrl.$options.anchor });
        ctrl.$setHandler(prev, ctrl.$options.event);

        if(ctrl.box.isShown){
          he.util.cssClass(ctrl.box.options.anchor, 'he-menu-open');
        }
        else {
          he.util.cssClass(ctrl.box.options.anchor, null, 'he-menu-open');
        }
        ctrl.$reposition();
      },
      event: function(ctrl, prev){
        ctrl.$setHandler(ctrl.$options.anchor, prev);
      },
      position: function(ctrl, prev){
        ctrl.$setBoxPos(ctrl.$options.position);
      },
      menu: function(ctrl, prev){
        ctrl.create();
      }
    },

    // Repositions the menu's box to it's new anchor location. 
    // Also calls $reposition on child menus. 
    $reposition: function(){
      if(this.box.isShown){
        this.box.$position();
        _.each(this.$submenus, function(menu){
          menu.$reposition();
        });
      }
    },

    $setHandler: function(prevAnchor, prevEvent){
      var event = this.$options.event;
      var anchor = this.$options.anchor;
      if(prevEvent && prevAnchor && (prevEvent !== event || prevAnchor !== anchor)){
        prevAnchor.removeEventListener(prevEvent, this.$openHandler);
      }
      anchor.addEventListener(event, this.$openHandler);
    },

    $setBoxPos: function(pos){
      this.box.setOptions(
        pos === 'horizontal' 
        ? { horizontal: 'after', vertical: 'top', hauto: "opposite", vauto: "opposite" } 
        : { horizontal: 'left', vertical: 'below', hauto: "opposite", vauto: "opposite" }
      );
    },

    create: function(){
      // Close menu before recreating items
      this.close();

      // TODO: Existing items's contents need to be removed properly
      // because they can be reused and may have listeners attached.

      var items = this.$options.menu;
      var fragment = doc.createDocumentFragment();
      
      for(var i=0, ii=items.length; i<ii; i++){
        var item = items[i];
        var el = doc.createElement('div');
        el.classList.add('he-menu-item');
        el.setAttribute('he-item-index', i);

        if(_.isFunction(item.content)){
          var content = item.content();
        }
        else if(item.content != undefined) {
          content = item.content;
        }
        else {
          content = (item.icon ? he.util.iconHTML(item.icon) : "") + "<div class='he-title'>" + item.title + "</div>";
        }
        
        content instanceof HTMLElement ? el.appendChild(content) : (el.innerHTML = content);
        
        if('menu' in item){
          this.$submenus[i] = new Menu({ 
            anchor: el, 
            event: 'mouseover', 
            parentMenu: this, 
            position: 'horizontal',
            menu: item.menu
          });
          el.appendChild(he.util.iconHTML('menu-right', true));
        }
        
        fragment.appendChild(el);
      }

      this.el.appendChild(fragment);
    },
    
    // Unregisters the menu and all of its submenus
    destroy: function(){
      _.invoke(this.$submenus, 'destroy');
      this.$submenus = {};
      he.unregister(this);
    },
    
    isSubmenuOf: function(menu){
      var parent = this;
      do {
        if(parent === menu){
          return true;
        }
      } while(parent = parent.$parent);
      return false;
    },

    open: function(){
      if(this.box.isShown) {
        return;
      }
      this.trigger('willopen');
      this.box.show();
      he.util.cssClass(this.box.options.anchor, 'he-menu-open');
      this.trigger('open');
    },

    close: function(){
      if(this.box.isShown){
        this.trigger('willclose');
        this.box.hide();
        he.util.cssClass(this.box.options.anchor, null, 'he-menu-open');
        this.trigger('close');
      }
    }
  });
})()
