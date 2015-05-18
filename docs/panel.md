## Menu
**NOTE: The menu control is still in development**

The menu is an absolutely positioned box which can be shown relative to an anchor element. It provides a simple way to create pop-up menus and show them in different circumstances. The menu creates its own element and inserts it in the DOM when shown. Menus can also be hierarchically nested. Example:

```js
var trigger = he('button', document.getElementById('my-button'));
var menu = he('menu', {
  anchor: button.el,
  parent: button.el.offsetParent,
  event: 'click',
  position: 'vertical',
  menu: [
		{ title: "Open", icon: "open", action: "open-file" },
		{ title: "Save", icon: "save", action: "save-file" },
		{ title: "Open Recent", icon: "recent", menu: [
			{ title: "Groceries.txt", icon: "txt", action: "open-file" },
			{ title: "Groceries.txt", icon: "txt", action: "open-file" }
		]}
	]
});
```

### [Binds to]
- Nothing. Creates its own element.

### [Requires]
- util.box
- util.dom

### [Inherits]
- control

### [Properties]

#### box
This is a reference to the `he.util.Box()` instance that is used to position the menu.

### [Options]

#### anchor
HTMLElement.  
This option will set the anchor of the box. Check the docs on he.utils.Box.

#### parent
HTMLElement. Default: `document.body`.  
This option will set the parent container of the box. Check the docs on he.utils.Box.

#### position
String. Default: `"vertical"`.  
Determines if the menu is shown vertically below or horizontally after the anchor. Can be "vertical" or "horizontal".

#### menu
Array. Default: `[]`.  
This is an array of objects that will define the items shown in the menu. The objects have a few reserved keys that have a specific meaning, but you can use the rest to store additional information. These keys are:

- "icon": A name of a SVG icon to display.
- "title": A string to display as the title of the menu item.
- "content": A string of valid HTML or a function that returns valid HTML that will be used as the menu item contents. Overrides icon and title. If a function, it will be executed in the item's context.

### [Methods]

#### `open()`
if the menu was closed, opens it and returns `true`. Otherwise returns `false`

#### `close()`
if the menu was open, closes it and returns `true`. Otherwise returns `false`.

### [Events]

#### "submenu:willOpen"
Triggered before a submenu is open.

#### "submenu:willClose"
Triggered before a submenu is closed.

#### "submenu:open"
Triggered after a submenu is open.

#### "submenu:close"
Triggered after a submenu is closed.

#### "click"
Triggered when a menu item is clicked. The handler will receive a single argument that contains the original definition of the item that was clicked. Example:

```js
menu.on('click', function(options){
	// You can access the original item that
	// you passed to the menu configuration here
	var item = options.item;
});
```

### [CSS classes]
- he-menu

---


## Modal
The modal control is used to group controls and be shown on demand. Any helium controls inside the modal will be locked in a separate tabbing order, and as long as a modal is open, only those controls can be focused. 
 
By default, the modal is shown with an overlay. The overlay will subtly darken the background and prevent interaction with the rest of the page. Example:

```js
var modal1 = he('modal', document.getElementById('my-div'));
var trigger = he('button', document.getElementById('my-button'));
trigger.on('click', function(){
	modal1.open();
});
```

**Note:** When creating modal elements make sure you add the "he-modal" class to them right away to avoid them being shown before the Helium scripts are loaded and initiated.
 
### [Binds to]  
- Any HTML element that can have children

### [Requires] 
- util/box 
- util/dom 
- util/icons 
- control

### [Inherits] 
- control

### [Properties]

#### isOpen 
Boolean. Read Only.  
Indicates if the modal is open.

### [Methods]

####`open([...arguments...])` 
Opens the modal. Any arguments will be passed to the listeners of the "open" event.
 
#### `close([...arguments...])` 
Closes the modal. Any arguments will be passed to the listeners of the "close" event.

### [Options]

#### overlay  
Boolean. Default: `true`.  
If set to `true` the modal will show an overlay which blocks the background controls.

#### closeAnywhere  
Boolean. Default: `true`.  
If set to `true`, clicking anywhere besides the modal area will close the modal.

#### closeIcon 
Boolean. Default: `false`.   
If set to `true`, an small "close" icon will appear at the top-right corner of the modal.

### [Events] 
#### open  
Triggered when the modal opens. Receives any arguments passed to the "open()" method.

#### close  
Triggered when the modal closes. Receives any arguments passed to the "close()" method.

#### willOpen
Triggered when the modal is about ot open. The handler will be passed a single argument, which is a function. Calling this function wil cancel the open action and the modal will remain closed. Example: 

```js 
modal.on('willOpen', function(cancel){ 
  cancel(); // This modal will never open
}); 
```

#### willClose
Triggered when the modal is about ot open. The handler will be passed a single argument, which is a function. Calling this function wil cancel the close action and the modal will remain open. Example: 
 
```js 
modal.on('willClose', function(cancel){ 
  cancel(); // This modal will never close
}); 
``` 

### [CSS classes] 
- he-modal

---
