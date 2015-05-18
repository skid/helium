/**  
 * Helium grid editing mixin.
 * 
 * ### [Requires] 
 * util/dom  
 * util/misc 
 * util/icon
 * 
 * ### [Options] 
 * The editing mixin enables the following options of the grid schema 
 * definition:  
**/
;(function(){
  /**  
   * Helium (he) grid editing.
   *  
   * @module mixins
   * @submodule mixins.gridEdit
  **/

  // A list of keys that have some special effect on edit controls
  var km = he.keymap;
  var editKeys = [km.DOWN, km.UP, km.LEFT, km.RIGHT, km.TAB, km.ESCAPE, km.ENTER];

  // Other shortcuts
  var doc = document;
  var docel = doc.documentElement;
  var scrollTo = he.util.scrollTo;
  var evaluate = he.util.evaluate;
  var cssClass = he.util.cssClass;
  var findUp = he.util.findUp;
  
  // Browsers fuck up. No way to stop scroll event from firing when
  // scrollTop or scrollLeft are changed
  var PREVENT_SCROLL = false;
  var CLEAR_TIMEOUT = 0;
  var EDIT_INITIATOR = null;
  var EDIT_START_TIMEOUT = 200;
  
  /**  
   * An object that manages the grid controls. 
   * Since we're using one instance of each grid control, this 
   * manager will grant usage of each one to different grid instances. 
   *  
   * @class GridEditControls 
   * @static
  **/
  var Controls = {
    $grid: null, 
    $control: null,
    $controls: {
      text:  he('input', doc.createElement('input'), {}),
      number: he('number', doc.createElement('input'), {}),
      enum: he('scrollList', cssClass(doc.createElement('div'), 'he-box'), { items: [], nullable: true }),
      date: he('date', doc.createElement('input'), { datepicker: { hauto: "opposite", vauto: "opposite" } }),
      autocomplete: he('autocompleteList', cssClass(doc.createElement('input'), 'he-box'), { items: [], nullable: true })
    },

    // A grid uses this method to request an edit control 
    // to be positioned in the correct place over it.
    request: function(grid, options, cell){
      // Use the DOM blur to avoid triggering it again when
      // we remove the control from the DOM
      // This will remove the control
      this.$control && this.$control.el.blur();
      
      var type = options.type;
      var control = this.$controls[type];
      var el = control.el;
      
      docel.appendChild(el);
      
      control.option(null);
      control.option(options);
      
      // Reset options, set new options and value
      if(type === 'enum' || type === 'autocomplete'){
        // Explicitly reset lists. The item set can't be controled 
        // as an option.
        control.option({ nullable: true, vget: options.vget, tget:options.tget });
        control.reset(options.items || []);
      }
      control.val(options.value, { silent: true });

      // Prevents calendar flicker
      if(type === 'date'){
        control.$calendar && control.$calendar.val(control.val());
      }

      // Position the control over the cell and show it
      var i = he.util.getPositionInfo(cell, docel);
      var top, left, bottom, right;
      var scrollbar = false;
      
      // Lists are positioned to cover the maximum vertical space
      // This code is copied over from he-list-dropdown.js
      control.$pbox.setOptions({ anchor: cell });
      control.$pbox.show();
      
      // It's ugly, but those scrollbars cover the content of the list
      type === 'enum' && (el.style.width = el.offsetWidth + 18 + "px");
      
      el.focus();
      if(type === 'enum'){
        control.$focusTo(_.keys(control.$selection)[0]);
        control.$scrollTo(control.$focused);
      }
      
      this.$grid = grid;
      this.$control = control;
    }
  };
  
  // We need to bind some events to the edit controls
  // This is done once at page load.
  _.each(Controls.$controls, function(ctrl, type){
    cssClass(ctrl.el, 'he-grid-control');
    ctrl.$subscribe('keydown');
    
    // Boxify the control
    ctrl.$pbox = new he.util.box({ 
      element: ctrl.el,
      horizontal: 'left',
      vertical: 'top',
      vauto: 'max'
    });
    
    // If a change event was fired, we also alert the grid
    // Note: The `change` events will fire before the he:blur event
    // because they are triggered by the he:blur handler bound
    // when the control was initialized.
    ctrl.on('change', function(options){
      Controls.$grid && Controls.$grid.$applyChange(ctrl.val());
    });
    
    // The "autocomplete" does not have "keydown" events.
    // They are handled by its "input" part.
    var widget = type === "autocomplete" ? ctrl.input : ctrl;
    
    // When the control blurs we always remove it
    widget.on('he:blur', function(e){
      ctrl.$pbox.hide();
      
      // Width and height are removed because chrome has a weird bug
      // when setting them from one value to another messes up the line-height
      widget.el.style.height = "";
      widget.el.style.width = "";
      
      Controls.$control = null;
      Controls.$grid.$edited = null;
      Controls.$grid = null;
    })

    // Handle blur for list-based controls
    if(type === 'enum'){
      ctrl.$subscribe('blur');
      ctrl.on('he:keydown', function(e){
        if(e.which === km.TAB) Controls.$grid.$editBegin(e.shiftKey ? [-1, -1] : [1, 1]);
        else if(e.which === km.LEFT) Controls.$grid.$editBegin([-1, 0]);
        else if(e.which === km.RIGHT) Controls.$grid.$editBegin([1, 0]);
        else if(e.which === km.ESCAPE) ctrl.el.blur();
        e.preventDefault();
      });
    }
    // Handle keyboard navigation for input-based controls
    else {
      // Input controls are sized to cover the cell
      ctrl.$pbox.setOptions({ size: "anchor" });
      
      // Input controls have special keydown commands
      widget.on('he:keydown', function(e){
        if(editKeys.indexOf(e.which) === -1 || e.altKEy || e.ctrlKey || e.metaKey || (e.shiftKey && e.which !== km.TAB)){
          return; // Allow modifier keys and all other keys, but capture shift+tab
        }

        // Allow navigation with arrow keys only if the caret is at the edge and there's no selection (inputs only)
        if(ctrl.el.tagName === 'INPUT'){
          var caret = ctrl.el.selectionStart;
          var selection = caret !== ctrl.el.selectionEnd;
          var len = ctrl.el.value.length;

          // The caret is not at the edge
          if(((selection || caret > 0) && e.which === km.LEFT) || ((selection || caret < len) && e.which === km.RIGHT)){
            return;
          }

          e.preventDefault();
          
          if(e.which === km.ESCAPE) ctrl.el.blur();
          else if(e.which === km.TAB) Controls.$grid.$editBegin(e.shiftKey ? [-1, -1] : [1, 1]);
          else if(e.which === km.ENTER && type !== "autocomplete") ctrl.el.blur();
          else if(e.which === km.DOWN && type !== "autocomplete") Controls.$grid.$editBegin([0, 1]);
          else if(e.which === km.UP && type !== "autocomplete") Controls.$grid.$editBegin([0, -1]);
          else if(e.which === km.LEFT) Controls.$grid.$editBegin([-1, 0]);
          else if(e.which === km.RIGHT) Controls.$grid.$editBegin([1, 0]);
        }
      });
    }
  });
  
  
  he.mixins.gridEdit = {
    $init: function(){
      this.$edited = null;
      
      // This code handles the cell editing
      // Cell editing is initiated when a user clicks on a cell that is editable.
      // However, the click needs to happen on the same cell (you can't mousdown 
      // on one cell and then mouseup on another), and the time between the
      // mousedown and mouseup event has to be less than 200 ms. This will allow
      // the users to select text without inadvertantly triggering the edit.
      this.$subscribe('mousedown');
      this.$subscribe('mouseup');
      this.on('he:mousedown', function(e){
        if(this.$edited) {
          return;
        }
        if(EDIT_INITIATOR = findUp(e.target, 'class', 'he-editable')){
          setTimeout(function(){ EDIT_INITIATOR = null; }, EDIT_START_TIMEOUT);
        }
      });
      this.on('he:mouseup', function(e){
        var cell = findUp(e.target, 'class', 'he-editable');
        if(cell && EDIT_INITIATOR && EDIT_INITIATOR === cell){
          
          this.$editBegin(cell);
        }
      });

      // Cancel editing if the body is scrolled.
      // This is a restriction which solves a lot of petty problems...
      this.on('he:scroll', function(){
        if(PREVENT_SCROLL) {
          return PREVENT_SCROLL = false; // derp
        }
        Controls.$control && Controls.$grid === this && Controls.$control.el.blur();
      });
      
      /**  
       * TODO: This is a bug in webkit/blink/gecko? 
       * The grid body scrolls up/down on keypress even though 
       * the body element is not focuseable or focused. 
       * To reporduce, make an overflow:auto element to show scrollbars, 
       * click on it and press up/down - it will scroll even though it's 
       * not FOCUSED and the event target is the body element
      **/
      this.$subscribe('global:keydown');
      this.on('global:keydown', function(e){
        (e.which === km.UP || e.which === km.DOWN) && e.preventDefault();
      });
    },

    /**  
     * Returns the next viable cell for editing relative to the 
     * currently edited one. 
     *  
     * @method $getNextEditableCell 
     * @private
     * @param {Array} coords A 2-element coordinate array which determines 
     * the location of the next editable cell. 
     *  [1, 0]:  Next editable cell in the current row 
     *  [0, 1]:  Next editable cell in the current column 
     *  [0,-1]:  Previous editable cell in the current column 
     *  [-1,0]:  Previous editable cell in the current row  
     *  [1, 1]:  Next editable cell in the grid (row-first search)
     *  [-1,-1]: Previous editable cell in the grid (row-first search)
     *   
     * @return {Mixed} A HTMLElement cell if found, otherwise null.
    **/
    $getNextEditableCell: function(coords){
      if(!this.$edited){
        return null;
      }

      var row, col;
      var cstate = this.$cstate;
      var colIndex = this.$edited.colIndex;
      var rowIndex = this.$edited.rowIndex;
      var getRow = this.$global.getRow;
      var newRowIndex;
      var newColIndex;
    
      function findInRow(row, rowIndex, startIndex, direction){
        for(var i = startIndex; (direction === 1 ? i < cstate.length : i >= 0); i += direction){
          var col = cstate[i];
          var type = (col.editOptions && col.editOptions.type) || col.typeInfo.type;
          if(evaluate(col.editable, row, rowIndex) && type !== 'boolean' && type !== 'custom'){
            return i;
          }
        }
        return null;
      }
    
      // Moving to next/previous column
      if(coords[0] && !coords[1]){
        row = this.$global.getRow(this.$data, rowIndex);
        newRowIndex = rowIndex;
        newColIndex = findInRow(row, rowIndex, colIndex + coords[0], coords[0]);
      }
      // Moving to next/previous row
      else if(coords[1] && !coords[0]){
        newColIndex = colIndex;
        rowIndex += coords[1];
        while(row = getRow(this.$data, rowIndex)){
          col = cstate[colIndex];
          if(evaluate(col.editable, row, rowIndex)){
            newRowIndex = rowIndex;
            break;
          }
          rowIndex += coords[1];
        }
      }
      // Moving to the next/previous cell, searching horizontally, then vertically
      else {
        var add = coords[0];
        while(row = getRow(this.$data, rowIndex)) {
          if((newColIndex = findInRow(row, rowIndex, colIndex + add, add)) !== null){
            break;
          }
          colIndex = add > 0 ? -1 : _.size(cstate);
          rowIndex += add;
        }
      }
      
      row = this.$elBody.querySelector('div[data-row="' + rowIndex + '"]');
      return row && row.querySelector('div[data-col="' + newColIndex + '"]');
    },

    // Places a control over a cell that can be edited and focuses on it. 
    $editBegin: function(cell){
      // Find next edit if needed, and quit if no cell was found or passed
      if(!(cell = _.isArray(cell) ? this.$getNextEditableCell(cell) : cell)){
        return;
      }

      var self = this;
      var rowIndex = parseInt(cell.parentNode.getAttribute('data-row'), 10);
      var colIndex = parseInt(cell.getAttribute('data-col'), 10);
      var row = this.$global.getRow(this.$data, rowIndex);
      var value = this.$global.getCell(row, this.$cstate[colIndex].name);
      var cstate = this.$cstate[colIndex];
      
      // Return if cell can't be edited
      if(!evaluate(cstate.editable, row)){
        return;
      }
      
      // Determine the widget used for editing
      var info = cstate.typeInfo;
      var options = _.extend({ value: value }, info, cstate.editOptions);
      
      if(options.type === 'enum' || options.type === 'autocomplete'){
        options.items = info.items;
        options.tget  = info.tget;
        options.vget  = info.vget;
      }
      else if(options.type === 'boolean'){
        // Boolean is a special case since we don't show a control
        this.$edited = {
          rowIndex: rowIndex,
          colIndex: colIndex,
          prevValue: value
        };
        this.$applyChange(!value);
        this.$edited = null;
        return;
      }
      else if(info.type === 'custom'){
        options.cell = cell;
      }

      // Scroll to the edited cell
      // Needs to be called before Controls.request to get the correct cell position
      PREVENT_SCROLL = true; // derp
      scrollTo(cell, this.$elBody);
    
      // For custom editing, call the function
      if(options.type === 'custom'){
        if(!_.isFunction(options.onEdit)){
          return;
        }
        options.cell = cell;
        options.onEdit(options, function(value){
          self.$applyChange(value);
          self.$edited = null;
        }, function(){
          self.$edited = null;
        });
      }
      // Request a control to be created and placed over the cell
      // This may trigger a call to $applyChange
      else {
        Controls.request(this, options, cell);
      }
      
      // Finally, remember the cell we're editing. This needs to come last.
      this.$edited = {
        rowIndex: rowIndex,
        colIndex: colIndex,
        prevValue: value
      };
    },
    
    /**  
     * Applies the change received from the changed control 
     * and terminates the editing process 
     *   
     * @method $applyChange 
     * @private
     * @param {Mixed} value The value to be set to the  
     * currently edited cell.
    **/
    $applyChange: function(value){
      var self = this;
      var rowIndex = this.$edited.rowIndex;
      var colIndex = this.$edited.colIndex;
      var cstate = this.$cstate[colIndex];
      var item = self.$global.getRow(self.$data, rowIndex);

      if(this.$global.onEdit){
        // Updates the HTML contents of the edited cell 
        function updateCell(){
          var row = self.$elBody.querySelector('div[data-row="' + rowIndex + '"]');
          var cell = row.querySelector('div[data-col="' + colIndex + '"]');
          cell.innerHTML = self.$renderCell(item, colIndex, rowIndex, true);
        }

        return this.$global.onEdit.call(this, rowIndex, item, cstate.name, value, function(){
          requestAnimationFrame(updateCell);
        });
      }
    }
  }
})()
