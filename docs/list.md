## List
This is an abstract control that is extended by all other list controls. It provides some basic facilities for working with selections from a set of choices.

A list is an ordered collection of items which are identified with at least 2 properties: a value and a label (text). The value of a list control is a subset (selection) of these items and it is not ordered. The list's value can be one of the following:

- For lists that allow multiple selection, the value is an array of the "value" properties of the selected items. An empty selection yields an empty array.
- For lists that allow only a single selection, the value is the "value" property of the selected item. Empty selections yield `null`.
 
The items need to be defined as an array of objects or an array of strings. For example:

```js
// As objects
var items = [{ 
  v: 1, 
  t: "One" 
},{ 
  v: 2, 
  t: "Two" 
}];
 
// As strings 
var items = ["One", "Two"];
```

In this example, the collection has two items with respective values 1 and 2. Their respective labels are "One" and "Two". The label (text property) is used to provide a human-readable text when rendering the item. The default key for the value property is "v" and for the text property is "t". Any other property apart from the value and text will be ignored by the list control so you can use the items to store additional data. The item values should be a primitive.

It is also possible to define items as simple strings, in which case the items themselves will be used as a value and text. 

Items that have no value, or their value is set to `undefined` will be rendered as a HTML optgroup label (unless prevented by a custom filter). These items will still have their own index, but will not be selectable. For example, for all practical purposes, the following collection has 5 items. 
 
```js
var items =[ 
  { t: "Argentina" }, 
  { t: "La Plata", v: 1 }, 
  { t: "Buenos Aires", v: 2 }, 
  { t: "Colombia" }, 
  { t: "Bogota", v: 3 }, 
  { t: "Medellin", v: 4 },  
  { t: "Cali", v: 5 }
]
```

### [Data type]
- Array for multiple select lists
- Mixed for single select lists

### [Requires]
- util/misc
- control
 
### [Inherits] 
- control 
 
### [Methods]

#### `render()`
This does nothing. It's overridden by controls that extend the list.
 
#### `reset(items [, options])` 
Replaces the list's item collection with a new one and triggers a "reset" event. If the list has a selection it will keep the selected values that can be found in the new item collection. If this lead to a different selection the list will also trigger a "change" event. Passing `{ silent: true }` as the options argument will prevent any events from being triggered.
 
#### `indexOfValue(value)` 
Returns the index of the item with the specified value property.
 
#### `indexOfText(text [, ignorecase, beginswith])`
Returns the index of the item with the specified text property. If "ignorecase" is `true`, the comparison will be case insensitive. if "beginswith" is `true`, it will match the first item whose text begins with the "text" argument.
 
#### `getItem(index)` 
Returns the item at the specified index in the collection.
  
#### `getIndex()` 
Returns the index(ices) of the currently selected item(s).

#### `text()` 
Returns an array that contains the text properties of the selected items. If the "multiple" option has been set to `false`, it will return a single text property. 
 
#### `val([value, options])` 
Unlike other controls, the getter/setter behaves differently here. If it's called without any arguments, the method will return the list's value, like usual. If it's passed the "value" argument, the list will try to set its selection to the passed value. The "value" arg can be either a single value or an array of values. In case the "multiple" option is set to `false`, passing 
an array will result in only the first element being used. Any values which can't be found in the list's item collection will be ignored. If no items can be found, the selection will be cleared. Finally, you can also pass `null` or `[]` to clear the list's selection. The third argument, "options", can be used to control how this method behaves. There are 3 options available: 
 
1. "op": Setting this to "add" will try to append the passed values to the current selection. Setting it to "remove" will try to remove the passed values from the current selection.
2. "index": Setting this to `true` will treat passed values as item indices instead of item values. 
3. "silent": Setting this to `true` will prevent the "change" event from triggering.


### [Options]

#### nullable 
Boolean. Default: `true`.  
Setting this option to `false` will prevent users to clear the list's selection. It can still be cleared programatically. 

#### multiple 
Boolean. Default: `false`.   
Setting this option to `true` will allow the list to have multiple items in its selection. It will also make the `val()` and `text()` methods to return arrays instead of single values. 

#### filter 
Function. Default: `null`.  
The filter is a function which receives a list item and is called each time an item is rendered. If the function returns a falsy value the item won't be rendered. The filter **does not** remove the item form the list's collection - it merely visually hides it. This means that a selection containing values of filtered-out items is still possible. Example:

```js
var list = he('scrollList', document.getElementById('my-list'), {
	items: [],
	filter: function(item, index){
		return index % 2; // Display every other item.
	}
})
```

#### vget 
Function. Default: `function(item){ return typeof item === "string" ? item : item.v; }`.  
This function is used by the list to get the items' value. The default "vget" function will look for an item's property named "v" or if the items are plain strings, it will just return them.

#### tget 
Function. Default: `function(item){ return typeof item === "string" ? item : item.t; }`.  
This function is used by the list to get the items' text. The default tget function will look for an item's property named "t" or if the items are plain strings, it will just return them.

### [Events]
IMPORTANT NOTE: Do not call "reset" or change the value of the list from within a reset/change handler. If you really must do that, wrap it in a _.defer or setTimeout.

#### "reset"
This event is triggered when the list's item collection is changed by calling the `reset()` method (unless silenced). The event handler is passed an "options" object which is the same "options" object that was passed to the `reset()` method.

#### "change" 
This event is triggered when the list's selection is changed (unless silenced). The handler will be passed an "options" object with contains the following keys:
- "added": An array of values added to the selection 
- "removed": An array of values removed from the selection

---

## Scroll list
The scroll list is the simplest list control. It displays its item collection in a box, stacked vertically. If the box is too small to fit all items, a scrollbar is displayed. Users can click on the items to select them and click again to deselect them. Scroll lists can be navigated with the keyboard and quick searches are also possible by typing the text of the desired item while 
the list element has focus. Example:

```js
var myList = he('scrollList', document.getElementById('my-list-div'), {
	nullable: false,
	multiple: true,
	items: [
		{ v: 1, t: "One" },
		{ v: 2, t: "Two" },
		{ v: 3, t: "Three" }
	],
	template: function(item){
		return "The number <strong>" + item.t + "</strong>";
	}
});
```

### [Binds to]  
- HTML &lt;div&gt; element

### [Requires] 
- util/dom 
- util/icons
- util/misc 
- mixins/disable 
- mixins/tooltip
- mixins/label 
- mixins/error 
- list/list 

### [Inherits] 
- mixins.disable 
- mixins.tooltip 
- mixins.label 
- mixins.error
- list 
 
### [Methods]

#### `render()` 
Renders the list items inside its element. It's called automatically when the control is initialized.

### [Options]

#### nullable
Boolean. Default: `false`.  
 
#### selectedIcon 
String. Default: `"check"`.  
The name of the icon shown on selected items. 
 
#### template 
Function. Default: `null`.   
If set, this function will be called instead of the `tget()` function each time an item is about to render. It will be passed a single argument - the item in question and it should output a string of valid HTML which will be placed inside the rendered item's box.
 
### [CSS classes] 
- he-scroll-list

---

## Button List
The button list is a replacement for a checkbox or a radio group. Since radio button groups behave like a non-nullable, single-select list and checkboxes behave like a nullable, multiple-select list, Helium provides a more convenient way to handle radio and checkbox controls.  

A button list is intended for really small item sets since the items are not placed in a scrollable container and take up a lot of space. By default, the items are lined up horizontally, but the default styles can be overridden. Example:

```js
var btnList = he('buttonList', document.getElementById('my-div'), {
	items: [{ v: "odd", t: "Odd" }, { v: "event", t: "Even" }],
	type: 'radio'
});
```

### [Binds to]  
- HTML &lt;div&gt; element

### [Requires] 
- util/misc 
- mixins/disable 
- mixins/tooltip
- mixins/label 
- mixins/error  
- button/checkbox 
- button/radio
- list/list 

### [Inherits] 
- mixins.disable 
- mixins.tooltip 
- mixins.label 
- mixins.error
- list 

### [Composed by]
The button list maintains a number of other helium controls.
 
#### button.checkbox 
The button list uses a checkbox button control for each item if it's type is set to "checkbox".
 
#### button.radio 
The button list uses a radio button control for each item if it's type is set to "radio".
 
### [Properties]

#### buttons  
Object. Read Only. Default: `{}`.  
This is an object that keeps references to the rendered buttons. The keys of the object are the indices of the respective collection items.

### [Methods] 
#### `render()`

Renders the list items inside its element. It's called automatically when the control is initialized.

### `nextButton()` 
This is an iterator that will return the next button control and, if needed, destroy the existing button control for the same item. It is used internally by the `render()` method but it can also be used to render the list's buttons in arbitrary locations on the page. To do this, the user would need to override the original render method. When there are no more buttons to return, the `nextButton()` method returns null and resets the internal counter to `0`. Exmaple: 
 
```js
// Render odd and even items in different containers.
var div1 = document.getElementById('div-1');
var div2 = document.getElementById('div-2');
btnList = he('buttonList', div1, { items: [{ v: "odd", t: "Odd" }, { v: "event", t: "Even" }] });
btnList.render = function(){
  // Remove the old buttons
  _.each(this.buttons, function(button){
    he.unregister(button);
    button.el.parentElement && button.el.parentElement.removeChild(button.el);
  });
  var f1 = document.createDocumentFragment();
  var f2 = document.createDocumentFragment();
  var button, i = 0;
  while(button = this.nextButton()){
    (++i % 2 ? f1 : f2).appendChild(button.el);
  }
  div1.innerHTML = div2.innerHTML = "";
  div1.appendChild(f1);
  div2.appendChild(f2);
}
```

### [Options] 
#### type
String ("checkbox"|"radio"). Default: `"checkbox"`.  
The type of the list. This is just a shortcut for setting the following 4 options at once: 

- "radio": `{ onIcon: "check-circle-blank", offIcon: "check-circle-outline-blank", multiple: false, nullable: false }`
- "checkbox": `{ onIcon: "check-box", offIcon: "check-box-blank", multiple: true, nullable: true }`
 
#### onIcon
String. Default: `"check-box"`.  
This is the icon shown for the on-state of the buttons. This option is automatically set to each rednered button.

#### offIcon 
String. Default: `"check-box-blank"`.  
This is the icon shown for the on-state of the buttons. This option is automatically set to each rednered button.

#### filter
The button list ignores the inherited "filter" option.

---

## Dropdown list
The dropdown list control is a replacement for the native HTML &lt;select&gt; element. Internally, it just combines a scroll list with a button. The scroll list is shown when the button is clicked and the selected value is displayed as the button's text. Dropdowns are always single-select lists. Example:

```js
var list = he('dropdownList', document.getElementById('my-button'), {
	items: [
		{ v: 1, t: "One" },
		{ v: 2, t: "Two" },
		{ v: 3, t: "Three" }
	]
});
list.on('change', function(){
	alert(this.val());
});
```
 
### [Binds to]  
- HTML &lt;button&gt; element

### [Requires] 
- util/box
- util/dom
- list/scroll
- button/button
 
### [Inherits] 
The dropdown control is composed by other controls, it does not inherit from any.

### [Composed by] 
- button  
- scrollList 
- util.box

### [Properties]

#### button
This is a standard Helium button that displays a "menu-down" icon. Its HTML element is shared with the dropdown's control.
 
#### list 
This is the scroll list control used for picking items. It is not visible until the button is clicked.
 
#### box
This is a util.box instance which controls the positioning of the scroll list's element.

### [Methods]
The dropdown list has all the methods of the button.button and list.scroll 
control. Internally, they are delegated to one or the other.

Methods delegated to the button:
- `tooltipShow()`  
- `tooltipHide()`
- `tooltipToggle()`
- `disable()`  
- `enable()`
 
Methods delegated to the scroll list:
- `reset()`  
- `indexOfText()`  
- `indexOfValue()` 
- `getItem()` 
- `text()` 
- `val()`
 
### `setText(text)`
Sets the text of the button to the "text" argument. This is useful when the dropdown's value is null, but you want to display something else instead of the placeholder. Calling `setText(null)` will clear the custom text.

#### `open()` 
Shows the scroll list above the button. This method is autmatically called when the button is clicked.

#### `close()`  
Hides the scroll list.

### [Options] 
As with methods, the dropdown list delegates options to its constituents. 

Options delegated to the button:
- disabled 
- label 
- tooltip 
- error 
 
Options delegated to the scroll list:
- template 
- filter 
- vget 
- tget 
- value 
- items 
 
#### nullable 
Boolean. Default: `false`.   
This option is delegated to the scroll list, with one additional detail. Nullable dropdowns that have a value (i.e. - can be cleared) show a little "X" icon instead of the standard downward-facing arrow. Clicking on this "X" will clear the list's selection. Clicking anywhere else on the button will show the list as usual. 

**Note**: The "x" icon does not work in Firefox and IE. To fix this, use a DIV element instead of a BUTTON element. FF/IE always set the event target to a button, regardless if they originated from a different element within the button.

#### placeholder
String. Default: `" "`.  
This is the text shown on the button when the list's selection is empty.

### [Events]

#### reset 
Works just like the list's "reset" event.

#### change
Works just like the list's "change" event.

---

## Autocomplete
The autocomplete control is essentially the same as the dropdown control, but it allows filtering of the displayed list. It is best used for large item collections where it's impractical to scroll over the entire list. Internally, it just combines a scroll list with a text input. The scroll list is shown when the user starts typing in the input, or the input's icon is clicked. Autocompletes are always single-select lists. Example:

```js
var list = he('autocompleteList', document.getElementById('my-input'), {
	items: [
		{ v: 1, t: "One" },
		{ v: 2, t: "Two" },
		{ v: 3, t: "Three" }
	]
});
```
 
### [Binds to]  
- HTML &lt;input&gt; element

### [Requires] 
- util/box 
- util/dom 
- util/dom
- list/scroll 
- input/input
 
### [Inherits] 
The dropdown contorl is composed by other controls, it does not inherit from any. 
 
### [Composed by] 
- input
- scrollList
- util.box
 
### [Properties]

#### input
This is a reference to the input used for typing. The input displays a "menu-down" icon which can be clicked.

#### list 
This is the scroll list control used for picking items. It is not visible until the input is clicked or enough characters were typed into it.

#### box
This is a util.box instance which controls the positioning of the scroll list's element.

### [Methods]
The autocomplete list has all the methods of the input.input and list.scroll 
control. Internally, they are delegated to one or the other.    

Methods delegated to the input:
- `tooltipShow()`  
- `tooltipHide()`
- `tooltipToggle()`
- `disable()`  
- `enable()`
 
Methods delegated to the scroll list:
- `reset()`  
- `indexOfText()`  
- `indexOfValue()` 
- `getItem()` 
- `text()` 
- `val()`

### `setText(text)`
Sets the text of the input to the "text" argument without changing the autocomplete's value. This is mostly useful when the autocomplete's value is null, but you want to display something else instead of the placeholder. Calling `setText(null)` will clear the text. 

#### `open()`
Shows the scroll list below the input. This method is autmatically called when the input is clicked or typed into.

#### `close()`  
Hides the scroll list.

### [Options] 
As with methods, the autocomplete control delegates options to its constituents. 

Options delegated to the input: 
- disabled 
- label 
- tooltip 
- error 
- placeholder 
 
Options delegated to the scroll list: 
- template
- filter
- vget
- tget
- value
- items
- nullable
 
#### ajax 
Function. Default: `null`.  
Setting a function for this option will make the autocomplete fetch its items through a callback. The function will be passed the string of characters in the autocomplete's input and a callback function which needs to be passed the new collection of items. The ajax call is entirely handled by the user. Example:  

```js
var xhr = null;
list = he('autocompleteList', document.getElmentById('input-1'), {
  ajax: function(str, callback){
    xhr && xhr.abort();
    xhr = $.getJSON('/filter-data', {data: { text: str }}).success(callback);
  }
});
```

#### maxresults 
Number. Default: `100`.  
Only used if the "ajax" option is used. The maximum number of returned items
by the ajax call that the autocomplete will agree to render. This should prevent huge and impractical collections from slowing down the DOM. 

#### minchars
Number. Default: 2.  
Only used if the "ajax" option is used. The minimum number of characters typed in the autocomplete's input before an ajax call is initiated.

### [Events]

#### reset 
Works just like the list's "reset" event.

#### change
Works just like the list's "change" event.
 
### [CSS classes] 
- he-dropdown 
- he-loading (if ajax loading)

---