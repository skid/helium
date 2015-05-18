/**
 * Helium base control class.
 * Documented in control.md.
**/
;(function(){
  var slice = [].slice;
  
  // Creates a new abstract control that takes care of basic stuff. 
  // All controls must inherit from this class as it provides an actual 
  // interface with a DOM element. 
  var Control = he.abstract.control = function Control(element, options){
    
    this.el = element;
    this.$subscriptions = [];
    this.$options = {};
    
    // Assign only the options that have handlers defined
    for(var k in options){
      if(k in this.$o) {
        this.$options[k] = options[k];
      }
    }

    // Register the contorl in the Helium cache
    he.register(this);
  }

  Control.prototype = {
    // Subscribe to delegated DOM events
    $subscribe: function(event){
      var self = this;
      
      // Subscribe to "global" events happening on any element
      if(event.indexOf("global") === 0){
        var subscriptions = he.globalEvents[event.split(":")[1]];
        if(subscriptions && subscriptions.indexOf(this.$id) === -1){
          subscriptions.push(this.$id);
        }
        return;
      }
      
      // Focus and Blur events don't bubble up normally
      // so we need to bind individual listeners.
      if(event === 'focus'){
        this.el.addEventListener('focus', function(e){ self.trigger('he:focus', e); });
      }
      else if(event === 'blur'){
        this.el.addEventListener('blur', function(e){ self.trigger('he:blur', e); });
      }
      else {
        this.$subscriptions.push(event);
        this.$subscriptions = _.uniq(this.$subscriptions);
      }
    },

    // Unsubscribe from DOM events
    $unsubscribe: function(event){
      // Unsubscribe from "global" events
      if(event.indexOf("global") === 0){
        var index, subscriptions = he.globalEvents[event.split(":")[1]];
        if(subscriptions && (index = subscriptions.indexOf(this.$id)) > -1){
          subscriptions.splice(index, 1);
        }
        return;
      }
      this.subscriptions = _.remove(this.$subscriptions, function(v){ return v === event; });
    },

    // This is the option-setter.  
    // Passing `null` for "name" will reset the options to their defaults.
    // Passing a single string for "name" will return the value for that option. 
    // Passing a name and a value will try to set the option with the same name. 
    // Passing a dict of options also works for setting. 
    option: function(name, value){
      var options, self = this;
      
      if(name === null){
        return this.option(this.$defaults || {});
      }
      else if(_.isPlainObject(name)){
        options = name;
      }
      else if(value === undefined){
        return this.$options[name];
      }
      else {
        options = {};
        options[name] = value;
      }

      _.each(options, function(value, name){
        var prev = self.$options[name];
        var meth = self.$o[name];
        
        // Can only set options that have defined handlers (even noops are OK)
        if(prev !== value && typeof meth === 'function'){
          self.$options[name] = value;
          meth.call(self.$o, self, prev);
        }
      });

      return this;
    },
    
    // A shortcut for getting/setting a value. Calling it with an argument 
    // will set the value. Calling it with no arguments will get a value, jQuery style. 
    // A second argument, options, is available when setting a value. The dict will be passed 
    // to any events triggered by calling this method. A special option "silent" can be 
    // set to "true" to prevent the control from firing "change" events.
    val: function(value, options){
      if(value === undefined){
        return _.isFunction(this.get) ? this.get() : this.option('value');
      }
      _.isFunction(this.set) ? this.set(value, options) : this.option('value', value);
      return this;
    },
    
    //
    // The following methods are shamelessly copied from Backbone.
    //
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    }
  };


  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };  
})()
