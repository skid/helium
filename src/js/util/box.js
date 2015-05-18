/**  
 * Helium box utilities. 
 * Documented in utils.md. 
**/
(function(){
  // Parses vertical position directives
  var RE_VER = /^\s*(middle|top|bottom|above|below)\s*(([\+\-])\s*(\d+)(px|\%))?\s*$/;
  
  // Parses horizontal position directives
  var RE_HOR = /^\s*(center|left|right|before|after)\s*(([\+\-])\s*(\d+)(px|\%))?\s*$/;
  
  // Parses size directives
  var RE_SIZE = /^\s*(parent|content|anchor)\s*$/;

  // Shortcuts
  var doc = document;
  var docel = document.documentElement;
  var cssClass = he.util.cssClass;
  var scrollTo = he.util.scrollTo;
  
  he.util.getPositionInfo = getPositionInfo;
  function getPositionInfo(anchor, container){
    // The "viewport" is either the document element or the supplied offsetParent.
    var top, left, viewport = (!container || container === doc.body) ? docel : container;
    
    var topAdjust = 0;
    var leftAdjust = 0;
    
    // When a modal is open, the body element receives 'noscroll' class and
    // a value to its "top" style. This will compensate for that.
    if(container === doc.body){
      topAdjust = -parseInt(container.style.top, 10) || 0;
      leftAdjust = -parseInt(container.style.left, 10) || 0;
    }
    
    // If the viewport is the document, getBoundingClientRect
    // will give us exactly what we need.
    if(viewport === docel){
      var r = anchor.getBoundingClientRect();
      top = r.top;
      left = r.left;
    }
    // Otherwise we calculate the same position relative to the
    // scrollable offset parent.
    else {
      top = anchor.offsetTop - viewport.scrollTop;
      left = anchor.offsetLeft - viewport.scrollLeft;
    }

    return {
      // Viewport dimensions
      vHeight: viewport.clientHeight,
      vWidth: viewport.clientWidth,
    
      // Gecko returns scrollTop on body, Webkit on documentElement :/ 
      scrollTop: (viewport === docel) ? docel.scrollTop || doc.body.scrollTop : viewport.scrollTop,
      scrollLeft: (viewport === docel) ? docel.scrollLeft || doc.body.scrollLeft : viewport.scrollLeft,

      // Anchor dimensions and position relative to viewport
      aTop: top + topAdjust,
      aLeft: left + leftAdjust,
      aRight: viewport.clientWidth - (left + anchor.offsetWidth),
      aBottom: viewport.clientHeight - (top + anchor.offsetHeight),
      aHeight: anchor.offsetHeight,
      aWidth: anchor.offsetWidth
    };
  }
  
  he.util.box = Box;
  function Box(options){
    options || (options = {});
    
    this.el = cssClass(options.element || doc.createElement('div'), 'he-box');
    this.isShown = false;
    this.options = {};
    
    var anchor = options.anchor || docel;
    var parent = options.parent || anchor.offsetParent || docel;

    if(doc.body === parent) {
      parent = docel;
    }

    this.setOptions(_.defaults(options, {
      anchor: anchor,
      parent: parent,
      vertical: "center",
      horizontal: "center",
      size: "content",
      hauto: null,
      vauto: null
    }));
  }
  
  Box.prototype = {
    $parse: function(){
      var o = this.options;
      var v = ("" + o.vertical).match(RE_VER);
      var h = ("" + o.horizontal).match(RE_HOR);
      var s = ("" + o.size).match(RE_SIZE);
      return {
        top: v ? v[1] : "middle",
        topOffset: v && v[2] ? parseFloat(v[3] + v[4], 10) : 0,
        topUnit: v && v[5] ? v[5] : "px",
        left: h ? h[1] : "center",
        leftOffset: h && h[2] ? parseFloat(h[3] + h[4], 10) : 0,
        leftUnit: h && h[5] ? h[5] : "px",
        size: s ? s[0] : "content",
        hauto: o.hauto,
        vauto: o.vauto
      };
    },

    $position: function(){
      var anchor = this.options.anchor; 
      var parent = this.options.parent; 
      var params = this.$parse();
      var pos = getPositionInfo(anchor, parent);
      var el = this.el;
            
      // Reset the size
      el.style.height = "";
      el.style.width = "";
      
      // These are what we ultimately want to calculate
      var top, left, height, width;

      if(params.size === 'parent'){
        height = pos.vHeight;
        width = pos.vWidth;
        el.style.height = height + "px";
        el.style.width = width + "px";
      }
      else if(params.size === 'anchor'){
        height = pos.aHeight;
        width = pos.aWidth;
        el.style.height = height + "px";
        el.style.width = width + "px";
      }
      else {
        height = el.offsetHeight;
        width = el.offsetWidth;
      }
      
      function getTop(t){
        switch(t){
          case "top": return pos.aTop + st;
          case "bottom": return pos.aTop - (height - pos.aHeight) + st;
          case "above": return pos.aTop - height + st;
          case "below": return pos.aTop + pos.aHeight + st;
          case "middle": return pos.aTop + (pos.aHeight - height) / 2 + st;
        }
      }

      function getLeft(l){
        switch(l){
          case "left": return pos.aLeft + sl;
          case "right": return pos.aLeft - (width - pos.aWidth) + sl;
          case "before": return pos.aLeft - width + sl;
          case "after": return pos.aLeft + pos.aWidth + sl;
          case "center": return pos.aLeft + (pos.aWidth - width) / 2 + sl;
        }
      }
      
      var st = pos.scrollTop;
      var sl = pos.scrollLeft;
      var to = params.topOffset;
      var lo = params.leftOffset;
      var autoV = 0;
      var autoH = 0;
      params.topUnit === '%' && (to *= height/100);
      params.leftUnit === '%' && (lo *= width/100);
      
      top = getTop(params.top);
      left = getLeft(params.left);
      
      if(params.hauto === "opposite"){
        if(params.left === "before" && pos.aLeft < width - lo && pos.aRight >= width - lo){
          left = getLeft("after");
          autoH = "after";
          lo *= -1;
        }
        else if(params.left === "after" && pos.aRight < width + lo && pos.aLeft >= width + lo){
          left = getLeft("before");
          autoH = "before";
          lo *= -1;
        }
        if(params.left === "left" && pos.aRight + pos.aWidth < width - lo && pos.aLeft + pos.aWidth >= width - lo){
          left = getLeft("right");
          autoH = "right";
          lo *= -1;
        }
        else if(params.left === "right" && pos.aLeft + pos.aWidth < width + lo && pos.aRight + pos.aWidth >= width + lo){
          left = getLeft("left");
          autoH = "left";
          lo *= -1;
        }
      }

      if(params.vauto === "opposite"){
        if(params.top === "above" && pos.aTop < height - to && pos.aBottom >= height - to){
          top = getTop("below");
          autoV = "below";
          to *= -1;
        }
        else if(params.top === "below" && pos.aBottom < height + to && pos.aTop >= height + to){
          top = getTop("above");
          autoV = "above";
          to *= -1;
        }
        if(params.top === "top" && pos.aBottom + pos.aHeight < height - to && pos.aTop + pos.aHeight >= height - to){
          top = getTop("bottom");
          autoV = "bottom";
          to *= -1;
        }
        else if(params.top === "bottom" && pos.aTop + pos.aHeight < height + to && pos.aBottom + pos.aHeight >= height + to){
          top = getTop("top");
          autoV = "top";
          to *= -1;
        }
      }

      else if(params.vauto === "max"){
        to = 0; // No top offset on vauto:max
        if(height > pos.vHeight - 10) {
          parent === docel && cssClass(el, 'he-fixed');
          top = 5;
          el.style.height = pos.vHeight - 10 + "px";
        }
        else if(params.top === "top"){
          top = Math.min(pos.aTop, pos.vHeight - height - 5) + st;
        }
        else if(params.top === "below"){
          top = Math.min(pos.aTop + pos.aHeight + 5, pos.vHeight - height - 5) + st;
        }
        else if(params.top === "bottom"){
          top = Math.max(pos.aTop + pos.aHeight - height, 5) + st;
        }
        else if(params.top === "above"){
          top = Math.max(pos.aTop - height - 5, 5) + st;
        }
      }
      
      // Overwrites the "vertical" setting, always places "below" or "above"
      else if(params.vauto === "dropdown"){
        to = 0; // No top offset on vauto:dropdown
      
        // If there's more than 150px below the control, render the list there
        if(pos.aBottom > Math.min(height + 5, 100)){
          top = (pos.aTop + st + pos.aHeight + 5);
          el.style.height = 1 + Math.min(pos.aBottom - 10, height) + "px";
        }
        else {
          top = (pos.aTop + st - (height = 1 + Math.min(height, pos.aTop - 10)) - 5);
          el.style.height = height + "px";
        }

        if(pos.aWidth + pos.aRight > width + 5){
          left = pos.aLeft + sl;
          el.style.width = Math.max(pos.aWidth, width) + "px";
        }
        else {
          left = pos.aLeft + pos.scrollLeft;
          el.style.width = pos.aWidth + pos.aRight - 5 + "px";
        }
      }

      // This is used by the popover, to reposition the arrow
      this.$autoPositionCb && this.$autoPositionCb(autoV || params.top, autoH || params.left);

      el.style.top = (top + to) + "px";
      el.style.left = (left + lo) + "px";
    },

    // Sets the box options 
    setOptions: function(no, dirty){
      var oo = this.options;

      if('anchor' in no && oo.anchor !== no.anchor){
        oo.anchor = no.anchor || docel;
        dirty = true;
      }
      if('parent' in no && oo.parent !== no.parent){
        oo.parent = no.parent || docel;
        dirty = true;
      }
      if('vertical' in no && oo.vertical !== no.vertical){
        oo.vertical = no.vertical;
        dirty = true;
      }
      if('horizontal' in no && oo.horizontal !== no.horizontal){
        oo.horizontal = no.horizontal;
        dirty = true;
      }
      if('size' in no && oo.size !== no.size){
        oo.size = no.size;
        dirty = true;
      }
      if('hauto' in no && oo.hauto !== no.hauto){
        oo.hauto = no.hauto;
        dirty = true;
      }
      if('vauto' in no && oo.vauto !== no.vauto){
        oo.vauto = no.vauto;
        dirty = true;
      }
      if('cssClass' in no && no.cssClass !== oo.cssClass){
        cssClass(this.el, no.cssClass, oo.cssClass);
        oo.cssClass = no.cssClass;
      }

      this.isShown && dirty && this.$position();
    },

    // Shows the box
    show: function(){
      if(this.isShown){
        return false;
      }      
      // Add the box to the DOM so we can do calculations with it
      this.options.parent.appendChild(this.el);
      
      // Show the box, removed any position:fixed classes
      cssClass(this.el, 'he-shown', 'he-fixed');
      
      // Position the box (possibly adding a he-fixed class)
      this.$position();

      return this.isShown = true;
    },
    
    // Hides the box
    hide: function(){
      if(!this.isShown){
        return false;
      }
      cssClass(this.el, null, 'he-shown');
      this.options.parent.contains(this.el) && this.options.parent.removeChild(this.el);
      this.isShown = false;
      return true;
    }
  }

  
  // A popover is, simply put, a replacement for a tooltip.
  // It creates a box that has a small arrow pointing 
  // towards the anchor element. The popover can be also used to create 
  // pop-up menus or containers that are related to a specific anchor element.
  he.util.popover = Popover;
  function Popover(options){
    this.box = new Box({ 
      anchor: options.anchor, 
      parent: options.anchor.offsetParent,
      hauto: "opposite",
      vauto: "opposite"
    });
    
    this.el = this.box.el;
    this.options = {};

    this.setOptions(_.defaults(options || {}, {
      position: 'above'
    }));

    var self = this;
    
    // This is called by the box class to reposition the arrow
    this.box.$autoPositionCb = function(v, h){
      switch(self.options.position){
        case "above": case "below": 
          return self.box.setOptions({cssClass: 'he-arrow he-' + v + " " + (self.options.cssClass || "")});
        case "before": case "after": 
          return self.box.setOptions({cssClass: 'he-arrow he-' + h + " " + (self.options.cssClass || "")});
      }
    }
  }

  Popover.prototype = {
    setOptions: function(no){
      var oo = this.options;
      var dirty = false;
      var arrow = 8;
      
      if('cssClass' in no && oo.cssClass !== no.cssClass){
        oo.cssClass = no.cssClass;
      }
      
      if('position' in no && no.position !== oo.position){
        var p = oo.position = no.position;
        
        switch(p){
        case "above":
        case "below":
          oo.horizontal = "center";
          oo.vertical = p + (p === 'above' ? "-" : "+") + arrow + "px";
          break;
        case "before":
        case "after":
          oo.vertical = "middle";
          oo.horizontal = p + (p === 'before' ? "-" : "+") + arrow + "px";
          break;
        }
        dirty = true;
      }
      
      // Sets the content of the popoover.
      // Can be a document element or a simple string.
      if("content" in no && oo.content !== no.content){
        oo.content = no.content;
        dirty = true;
        
        if(typeof oo.content === "string"){
          this.el.innerHTML = oo.content;
        }
        else {
          this.el.innerHTML = "";
          this.el.appendChild(oo.content);
        }
      }

      // Override the css class
      this.box.setOptions(_.defaults({
        cssClass: 'he-arrow he-' + oo.position + " " + (oo.cssClass || "")
      }, oo, no), dirty);
    },
    
    show: function(){ this.box.show(); },
    hide: function(){ this.box.hide(); }
  }
})();