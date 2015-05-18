/**
 * Helium (He) - Business application form controls. 
 * Global namespace and he() function. 
**/
;(function(){
  var GUID  = 0;
  var CACHE = {};

  // Main Helium factory and namespace.
  // Use ONLY this to create new Helium elements. 
  // Calling it with 2 or 3 arguments will create a new helium control. 
  // Calling it with a single argument will return a reference to an existing helium control. 
  var he = Helium = function(type, element, options){
    if(!type) {
      return null;
    }

    // Trying to lookup an existing helium control
    if(element === undefined && options === undefined){
      var el = typeof type === "string" ? document.getElementById(type) : type;
      return CACHE[el.getAttribute('data-heparentid')];
    }
    // Trying to create a control that has no HTML element associated, like a menu
    else if(options === undefined){
      options = element;
    }
    else if(element.getAttribute('data-heid') in CACHE){
      throw new Error('Element is already initialized as a Helium control');
    }

    var controlClass;
    
    if(!(controlClass = he.controls[type])){
      throw new Error('Unrecognized control type: ' + type);
    }

    if(!_.isPlainObject(options)){
      options = {};
    }

    var control = new controlClass(element, options);
    
    // Run the init chain upwards
    // FIXME: Move this to RAF
    var sup = controlClass.prototype;
    do {
      sup.hasOwnProperty('$init') && sup.$init.call(control, control.$options);
    } while(sup = sup.$super);

    return control;
  };
  
  // Helium main configuration
  he.config = {
    thousandsSeparator: ',',
    decimalPoint: '.',
    dateFormat: 'ISO'
  }
  
  // Registers a helium control in the cache for 
  // access through the DOM
  he.register = function(control, asParent){
    CACHE[control.$id = ++GUID] = control;
    asParent || control.el.setAttribute('data-heid', control.$id);
    control.el.setAttribute('data-heparentid', control.$id);
  };
  
  // Unregisters a helium control removing it from the cache. 
  he.unregister = function(control, asParent){
    delete CACHE[control.$id];
    asParent || control.el.removeAttribute('data-heid');
    control.el.removeAttribute('data-heparentid');
  };
    
  // Namespaces for controls
  he.controls = {};
  
  // Namespace for abstract classes
  he.abstract = {};
  
  // Namespace for mixins
  he.mixins = {};

  // Namespace for various hepers
  he.util = {};

  // Global event listeners
  he.globalEvents = {
    'mousedown': [],
    'mouseup': [],
    'mousemove': [],
    'click': [],
    'keydown': [],
    'keyup': [],
    'keypress': [],
    'scroll': [],
    'dblclick': []
  };
 
  // A named map of key codes
  he.keymap = {
  	ALT:             18,
  	BACKSPACE:       8,
  	CAPS_LOCK:       20,
  	COMMA:           188,
  	COMMAND:         91,
  	WINDOWS:         91, // COMMAND
  	MENU:            93, // COMMAND_RIGHT
  	COMMAND_LEFT:    91, // COMMAND
  	COMMAND_RIGHT:   93,
  	CONTROL:         17,
  	DELETE:          46,
  	DOWN:            40,
  	END:             35,
  	ENTER:           13,
  	ESCAPE:          27,
  	HOME:            36,
  	INSERT:          45,
  	LEFT:            37,
  	NUMPAD_ADD:      107,
  	NUMPAD_DECIMAL:  110,
  	NUMPAD_DIVIDE:   111,
  	NUMPAD_ENTER:    108,
  	NUMPAD_MULTIPLY: 106,
  	NUMPAD_SUBTRACT: 109,
  	PAGE_DOWN:       34,
  	PAGE_UP:         33,
  	PERIOD:          190,
    SLASH:           191,
    DASH:            189,
  	RIGHT:           39,
  	SHIFT:           16,
  	SPACE:           32,
  	TAB:             9,
  	UP:              38
  };

  // Informs a registered Helium control about an UI event. Only events  
  // happening on DOM elements with the "data-heid" attribute are delegated. 
  var docel = document.documentElement;
  function delegateEvent(name){
    var hename = "he:" + name;

    document.documentElement.addEventListener(name, function(e){
      var ctrl, id, target = e.target;

      do {
        id = target.getAttribute && target.getAttribute('data-heid');
        if(id && (ctrl = CACHE[id]) && ctrl.$subscriptions.indexOf(name) > -1){
          ctrl.trigger(hename, e);
          break;
        }
        target = target.parentNode;
      } while(target && target !== docel);
    });
  }
  
  // Runs once at page load to attach global event listeners. 
  // Global event listeners allow controls to subscribe to events happening 
  // outside of their DOM element.
  function attachEvents(){
    Object.keys(he.globalEvents).forEach(function(name){
      document.addEventListener(name, function(e){
        _.each(he.globalEvents[name], function(id){
          var control;
          if(control = CACHE[id]){
            control.trigger("global:" + name, e);
            return;
          }
          // Control was removed
          delete CACHE[id];
        });
      });
    });

    delegateEvent('click');
    delegateEvent('keyup');
    delegateEvent('keydown');
    delegateEvent('mousemove');
    delegateEvent('mousedown');
    delegateEvent('mouseup');
    delegateEvent('keypress');
  }
  
  // Expose to global namespace
  window.he = he;
  
  // Attach delegates
  document.readyState !== 'loading' ? attachEvents() : document.addEventListener('DOMContentLoaded', attachEvents);
})()
