/**  
 * Helium grid resizing mixin. 
 * Adds methods and binds listeners to allow  
 * a grid instance to have resizable column widths. 
 *  
 * ### [Requires] 
 * - util/dom 
 *  
 * ### [Methods] 
 * #### `setColumnWidth(index, width)` 
 * Sets the width of the column with index "index" to "width" pixels 
 * then re-renders the grid. 
 *  
 * ### [Options] 
 * The resizing mixin enables the following options of the grid schema 
 * definition: 
 *  
 * #### column.resizable 
 * Function|Boolean. Default: `false`.  
 * If a function it is evaluated. Otherwise the boolean value is used. 
 * If it evaluates to a truthy value the column will be resizable.
**/
;(function(){
  var doc   = document;
  var docel = doc.documentElement;
  var ruler = he.util.cssClass(doc.createElement('div'), 'he-resize-ruler');

  he.mixins.gridResizing = {
    $init: function(){
      var resizing = null;
      var initialpos = null; 
      var delta = null;

      this.on('global:mousedown', _.throttle(function(e){
        if(this.el.contains(e.target) && e.target.classList && e.target.classList.contains('he-resize')){
          var cell = he.util.findUp(e.target, 'attr', 'data-col');
          resizing = cell.getAttribute('data-col');
          initialpos = e.clientX;
          ruler.style.height = this.el.clientHeight + "px";
          ruler.style.top = this.el.offsetTop + "px";
          ruler.style.left = e.clientX + "px";
          this.el.offsetParent.appendChild(ruler);
          
          document.body.style.MozUserSelect = "none";
          document.body.style.webkitUserSelect = "none";
        }
      }, 25));

      this.on('global:mousemove', function(e){
        if(resizing !== null){
          delta = e.clientX - initialpos;
          ruler.style.left = e.clientX + "px";
          e.preventDefault();
        }
      });

      this.on('global:mouseup', function(e){
        ruler.parentNode && ruler.parentNode.removeChild(ruler);
        if(resizing !== null && delta){
          this.setColumnWidth(resizing, this.$cstate[resizing].width + delta);
          document.body.style.MozUserSelect = "";
          document.body.style.webkitUserSelect = "";
        }
        resizing = initialpos = delta = null;
      });    
    },
    
    setColumnWidth: function(index, width){
      this.$cstate[index].width = Math.max(this.MIN_COL_WIDTH, width);
      this.render();
    }
  }
})()
