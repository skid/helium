## Grid
The grid is the most complex control in Helium. It is used to display and manage tabular data. It leverages on the other Helium controls to provide in-place editing of data taking into account the data types. Here's a rundown of the grid's features:

- Ability to bind to any data source or generator.
- Columns can have any data type, arrays and objects included.
- You can define templates for each individual cell.
- You can specify which cell can be edited and what widget to use.
- Resizable, filterable and hideable columns.
- Pagination and sorting.
- A fixed header

One distinguishing feature (well, more of a design decision) of the grid is the way it binds to the data source. The grid will always render the *entire* collection that it is bound to. So, to work with larger data sets, you will need to bind the grid to a specific subset of your entire data and later re-bind it to another subset when you want change a page. This approach only slightly complicates the pagination configuration and in turn greatly simplifies many implementation details. More about this in the examples below.

So let's start with an example data set and a simple grid configuration:

```js
// This is a very simple data set that is held entirely in memory
var DATA = [
	{ name: "Colombia", code: "CO", independence: "1810-07-20", capital: "Bogotá", id: 1 },
	{ name: "Croatia", code: "HR", independence: "1991-10-08", capital: "Zagreb", id: 2 },
	{ name: "Macedonia", code: "MK", independence: "1991-09-08", capital: "Skopje", id: 3 }
]
var grid = helium('grid', document.getElementById('some-div'), {
	data: DATA,
	config: {
		global: {
			pageSize: function(data){ return data.length },
			getRow: function(data, i){ return data[i]; },
			getCell: function(row, name){ return row[name]; }
		},
		rows: {
			
		},
		columns: [{
			name: "name",
			title: "Conutry"
		}, {
			name: "code",
			title: "ISO Alpha 2 code"
		}, {
			name: "independence",
			title: "Date of Independence"
		}, {
			name: "capital",
			title: "Capital City"
		}]	
	}
});
```
This is probably the simplest configuration of a grid that you can do. We are rendering the "name", "code", "independence" and "capital" columns of the data set which contains 3 items and there is no need for paging. The binding functions ("pageSize", "getRow" and "getCell") are just copies of the default ones, but serve to explain how data binding is defined.
 
### [Requires]  
- Pretty much all helium files...
 
### [Inherits] 
- grid.editing
- grid.filtering
- grid.resizing
- control 
 
### [Binds To] 
- HTML &lt;div&gt; element 
 
### [Options] 
The entire grid configuration is done through the options object or the "config" method. To begin with, there are 2 top-level options: "data" and "config".

#### "data" 
Iterable.  
This is the grid data source. It can by any iterable object, be it a simple array, a Backbone collection or even a generator. The grid will always render every member. This is an important point to have in mind when filtering or doing paginated results.

#### "config" 
Object.  
This is the grid's initial configuration. It's a fairly complex object and we will document each config option separately.

#### "config.global"  
Object.  
This object contains global configuration options - mostly functions that allow the grid to communicate with the data source or otherwise apply to the entire grid.

#### "config.global.autoHeight" 
Boolean. Default: `false`.  
Setting this option to `true` will force the grid to change its height whenever it renders in order to avoid displaying scrollbars. The default option assumes that the grid's element has a fixed height.
 
#### "config.global.wordBreak" 
Boolean. Default: `true`.  
Setting wordBreak to false will prevent text in the grid's cells to span multiple lines. If it overflows, it will be truncated with an ellipsis. This is done by adding the "he-wordbreak" class to the grid element.

###### data-binding functions

#### "config.global.dataSize"
Function. Default: `null`.  
It takes no arguments and it should return the number of elements in the **entire** data set. This option is only used if pagination is also used.

#### "config.global.pageSize" 
Function. Default: `function(data){ return data.length; }`.   
This function takes the current **bound** data set as the only argument and it should return the number of items in it. The difference from `dataSize()` is that `pageSize()` returns the number of items that should be rendered in the grid and `pageSize()` returns the total number of elements. The default implementation expects that the data source is a simple array.
 
#### "config.global.getRow" 
Function. Default: `function(data, i){ return data[i]; }`.  
This function takes the bound data source and an integer "i" as arguments. It should return the item at index "i". The default implementation expects that the data source is a simple array.
 
#### "config.global.getCell" 
Function. Default: `function(row, name){ return row[name]; }`.   
This function takes a data item (row) and a column name as arguments. It should return the value of the row for the requested column. The default implementation expects that the data source is a simple array of objects.
 
#### "config.global.reset" 
Function: Default: `a very complex function`.  
This is the last, and most important, data-binding function. It handles swapping-out the data page that is rendered by the grid. As we mentioned earlier, the grid is not aware of the entire data set, but only of a certain subset which it renders. In other words, it always renders all items. Sorting, filtering and pagination is done by re-binding a different dataset (called page) to the grid. 
Whenever the pagination, filters or sorting order changes, this function will be invoked with 2 arguments: "params" and "callback". The "params" argument is an object which is best documented in code:

```js
var params = {
	filters: {					// Filtering information object
		col1: {						// Each key is a column name, and references an object ...
			"~": "socks"		// ... which contains a comparator and a value
		},
		col2: {						// Here we want all col2 values ...
			">": 500,				// ... greater than 500 and ...
			"<": 10000      // ... and lesser than 10,000
		},
		col3: {           // And all col3 values ...
			"in": [1,4,6]		// ... which are equal to 1, 4 or 6
		}
	},
	sorting: [{ 				// Sorting information array
		name: 'col1', 		// The order matters because the grid supports 
		direction: 'asc'  // sorting by multiple columns
	},{ 
		name: 'col2', 		// The name of the column
		direction: 'desc' // The sort direction
	}],
	pagination: {				// Pagination information object contains 2 keys:
		size: 50,					// The page size
		page: 3						// The current page
	}
}
```
There are 4 filtering comparators:  

- "<" and ">" are returned if the column filter type is a number or a date.
- "~" is returned if the column filter type is a text input.
- "in" is used if the column filter type is a multiple select list.

Ultimately, how you handle these filter comparators depends on your implementation of the "reset()" function. As an example, here's an example how to bind the grid to a simple array.

```js
var DATA = [/* Some huge dataset accessible in the colosure */];
var PAGE_SIZE = 50; // The page size (just)
var FILTERED = DATA; // This will change as we filter and sort
var PAGE = DATA.slice(0, PAGE_SIZE);	// The initial page

config.global.dataSize = function(){
	return FILTERED.length;
}
config.global.pageSize = function(data){
	return data.length;
}
config.global.getRow = function(data, i){
	return data[i];
}
config.global.getCell = function(row, name){
	return row[name];
}
config.global.reset = function(params, callback){
  var filters  = params.filters;
  var sorting  = params.sorting;
  var pageSize = params.pagination.size;
  var page     = params.pagination.page;

  FILTERED = DATA.filter(function(item){
    for(var name in filters){
      if(name in item){
        var filter = filters[name];
        for(var cmp in filter){
          if(filter[cmp] == null){
            continue;
          }
					// Filter passes if it's contained in the value (case insensitive)
          if(cmp === "~" && item[name].toLowerCase().indexOf(filter[cmp].toLowerCase()) === -1){
            return false;
          }
          if(cmp === ">" && item[name] <= filter[cmp]){
            return false;
          }
          if(cmp === "<" && item[name] >= filter[cmp]){
            return false;
          }
          if(cmp === "in" && filter[cmp].length > 0 && filter[cmp].indexOf(item[name]) === -1){
            return false;
          }
        }
      }
    }
    return true;
  });

  FILTERED = FILTERED.sort(function(a, b){
    for(var i=0, ii=sorting.length; i<ii; ++i){
      var crit = sorting[i];
      var dir  = crit.direction;
      var name = crit.name;

      if((dir === "asc" && a[name] < b[name]) || (dir === "desc" && a[name] > b[name])){
        return -1;
      }
      else if((dir === "asc" && a[name] > b[name]) || (dir === "desc" && a[name] < b[name])){
        return 1;
      }
    }
    return 0;
  });

  // Pages are 1-indexed
  callback(PAGE = FILTERED.slice((page-1)*pageSize, page*pageSize));
}
```

#### "config.global.onEdit" 
Function. Default: `function(index, item, name, value, callback){}`.  
This function will be called when a cell in the grid has been edited. The function will receive the index of the edited item, the edited item, the name of the edited property, the new value and a callback. It should then update the original data source accordingly and call the "callback" argument (which is a function). The context of the function is the grid control. 
You should take note that the "index" is the index of the item in the **current page**. So if the data is paged and/or filtered - it will not correspond to the item's index in the original data set. That's why the entire item is passed as the second argument. Example:

```js
config.global.onEdit = function(index, item, name, value, callback){
  item[name] = value; // The item is passed by reference, so this is ok
  callback();
}
```

#### "config.global.pagination"
Object. Default: `{ element: null, size: 50, links: 7 }`.  
This object enables and controls grid pagination. If the "element" key is a valid HTML element, the pagination will be enabled and rendered in it. The "size" key controls the page size and the "links" key controls how many page links to show at once.


#### "config.rows" 
Object.  
This object contains configuration options that apply to entire rows. 

#### "config.rows.attrs" 
Object|Function. Default: `null`.  
This is an object of HTML attributes to be added to each row element. It can also be a function in which case it's evaluated with 2 arguments (item, index). The function should return an object with attributes. The "style" attribute will be expanded into valid css. Example:

```js
config.rows.attrs = function(item, index){
	// Color every third row blue
	return index % 3 ? {} : { style: { "background-color": "#ccf" } };
}
```

#### "config.columns"
Array. Default: `[]`.  
This is the most important configuration key. It defines the order of the columns, which of them are displayed and what they can do. It is an array of objects which stand for columns. The documentation on the object properties follows after this example config:

```js
// Very small grid with 2 columns
{ 
  global: {}, 
  rows: {}, 
  columns: [{ 
    name: "name", 
    title: "Name"
  },{  
    name: "job", 
    title: "Occupation"
  }]
}
```
 
#### "config.columns.name" 
String. Required.  
This is the name of the column's key. We assume that your data source is a collection of objects and they have named properties. In case you want to use a collection of arrays - the "name" can also represent the index at which the value can be found.

#### "config.columns.title"
String. Required.  
This is the title of the column that will be placed in the header.

#### "config.columns.typeInfo"  
String|Object. Default: `{ type: "text" }`.  
This is the type information about the column. If it's a simple string (say, "date") it will be automatically converted to `{ type: "date" }`. If omitted, the grid will assume it's text. It can have the following keys: 

- "type": Determines the type of the data. Can be: "text", "number", "date", "enum" or "boolean".
- "items": Used only if type == "enum". This is the list of possible choices for each column value.
- "tget": Used only if type == "enum". This is the text/label getter for a single item in the choices set. (see documentation on lists)
- "vget": Used only if type == "enum". This is the value getter for a single item in the choices set. (see documentation on lists)
- "format": Used only if type == "date" or "number". The number or date format that the grid will use when rendering data.

#### "config.columns.width"  
Number. Default: `null`.  
An optional initial width of the column, in pixels. If omitted the grid will first render the columns which have a defined width, then distribute any leftover horizontal space evenly to the other columns. The minimum column width is 50px.
 
#### "config.columns.resizable" 
Boolean. Default: `false`.  
If `true`, the column will be resizable by dragging the right edge of the header.
 
#### "config.columns.hideable" 
Boolean. Default: `true`.  
If `true`, the column will be hideable from the header's dropdown menu.
 
#### "config.columns.shown" 
Boolean. Default: `true`.  
Only makes sense if the column is hideable. It's initial "shown" state.

#### "config.columns.editable"
Function|Boolean. Default: `false`.  
If this is a function, it will be called for each row (item) and it will 
be passed 2 arguments, (item, index). It should return a boolean value which will determine if the particular cell is editable.

#### "config.columns.filterable" 
Boolean. Default: `false`.  
If set to `true`, the column will show a filter submenu when clicked on the header. 

#### "config.columns.sortable"  
Boolean. Default: `false`.  
If set to `true`, the column will show a "Sort ascending", "Sort descending" and "Clear sorting" options in the header menu.

#### "config.columns.editOptions" 
Function|Object. Default: `{ .. copied from the typeInfo option .. }`.  
If this is a function, it will be called for each row (item) and it will 
be passed 2 arguments, (item, index). It should return an object. Alternatively, you can set an object to this option and it will be used for the 
entire column. The object will be used as the configuration for the editing control. There is only one special key, "type", which will determine the control type. The rest of the editOptions depend on the control type you choose. Possible types are: 

- "text", a simple input control
- "number", a number control
- "date", a date control (configurable to show datepicker)
- "enum", a scroll list control
- "autocomplete", an autocomplete control (for larger choice sets)
- "boolean", a scroll list control with 2 options: True and False
- "custom", a custom control for editing, documented separately

Example:

```js
// When editing, use the "number" control with 5 decimals
editOptions: { 
  type: "number", 
  format: 5
}
```

#### "config.columns.filterOptions" 
Object. Default: `{ .. copied from the typeInfo object .. }`.  
Similar to the editOptions, this object will be used to configure the filtering controls. There is the required key, "type" and the rest will depend on the filter control type. Possible types are:

- "text", a simple input control
- "number", two number controls for filtering the higher and lower threshold
- "date", two date controls for filtering with "greater than" and "less than"
- "enum", a multiple-select scroll list control
- "boolean", a multiple-select scroll list control with 2 options: "Yes" and "No"

#### "config.columns.template"  
Function. Default: `null`.  
This function allows you to control what gets rendered in a specific cell. If omitted, the cell contents will be set to the raw data and (formatted accordingly if the data is a Date or Number).  
The function will receive 3 arguments: the item being rendered, its index and the original raw data value. The function should return a string of valid HTML or plain text. Example: 

```js
// Render 2 attributes in a single cell  
...
name: "price",
template: function(item, index, value){ 
	return "<b>Price:</b> " + item.price + " (" + item.priceInPercent + "%)";
}
...
```

#### "config.columns.actions"
Array[Object]. Default: `null`.  
This is a convenience option that will render some icons instead of the default cell contents. Clicking on the icons will emit an event which you can listen to and handle according to your needs. Check the "Events" section below. **Note:** Setting the action option will override the "template" option. Example: 
 
```js
actions: [{ 
  icon: "check", 
  event: "select",
}, { 
  icon: "trash", 
  event: "delete"
}]
```

#### "attrs"
Function|Object. Default: `null`.  
This works the same as the "row.attrs" option, except it allows you to control attributes pre individual cell. It's an object of HTML attributes to be added to each cell in the column. It can also be a function in which case it's evaluated with 2 arguments (item, index). The function should return an object with attributes. The "style" attribute will be expanded into valid css.


### [Methods]

#### `render()`
Renders the grid. This method is automatically called when the grid is first instantiated and when the pagination/sorting/filters change. The render() method is throttled to once overy 250ms since it's can be quite expensive.

#### `reset(page)`
Resets the grid data page with a new one. Not to be confused with the "config.global.reset" option, which is also a function, but can not a method of the grid.

#### `config(name, value)`
Updates configuration of the grid. This method can be used in serveral ways:

- Passing a name and a value wil set a single option.
- Passing an object of key:value pairs will set multiple options.
- Option names can be namespaced with dots.

Examples:

```js
// Change the global reset option
	grid.config("global.reset", function(opts, callback){ .... });
	// Disable editing to the first 2 columns
	grid.config({
		"columns.0.editable": false,
		"columns.1.editable": false
	})
```

#### `setFilter(columnIndex, cmp, val)`
Sets a filter value for the column at index "columnIndex" and comparator "cmp". If the "val" argument is `null`, the filter for that column and comparator is removed.

#### `setColumnWidth(columnIndex, val)`
Sets a width of the column at index "columnIndex" to "val" pixels. The minimum column width id 50px.

#### `goToPage(page)`
Sets the pagination page. This will call the "config.global.reset" handler and re-render the grid.
 
### [Events]

#### "action:<name>"
If you use the "config.columns.actions" option to render icons in a cell, clicking on these icons will trigger "action:&lt;name&gt;" events. See the documentation on "config.columns.actions".

### [CSS class]
- he-grid