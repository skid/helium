## he.mixins.disableable
Allows controls to be disabled/enabled by setting an option. Disabled controls lose user interactivity, but can still be manipulated programatically. If the control has a "label" option defined, the "he-disabled" class is also applied to the label.

### [Requires]
- util/dom 

### [Methods]

#### `disable(cssClass)` 
Sets the "disabled" option to true and optionally applies any passed css classes to the element. The "cssClass" argument can be a string or an array of strings. When the item is enabled any css classes added this way are removed. Adding css classes to disabled controls can be useful for indicating why the control is disabled (i.e. loading).
 
#### `enable()` 
Sets the "disabled" option to false.  Fires the "he:disable" event if the option changed.

### [Options]

#### "disabled" 
Boolean. Default: `false`.  
Setting this option to true will disable the control.
 
### [Events] 

#### "he:disable" 
Fired when the disable state of the contorl changes. Receives a single Object as an argument: `{ disabled: true|false }`


### [CSS classes]
- he-disable

---

## he.mixins.errored
Allows controls to be marked as erroneous (invalid) by setting an error message. Controls that are invalid apply a "he-error" CSS class and show the error message in a pop-over tooltip on mouseover. If the control has a "label" option defined, the "he-error" class is also applied to the label and a SVG error icon is appended to it. Example:

```js
myInput.option('error', 'Your input contains errors.');
```

### [Requires] 
- util/dom 
- util/box 
- util/icon 
 
### [Options]

#### "error" 
String. Default: `null`.
The error message to be shown in the pop-over tooltip. 

### [CSS classes] 
- **optional** he-error

---

## he.mixins.labeled
Allows controls to be aware of their label element.Controls that have a label element will apply styles to it when they are disabled or rendered invalid.

### [Requires]
- util/dom 

### [Options]

#### "label" 
HTMLElement|String. Default: `null`.  
Setting a string to this option will try to find an element with that ID. Setting an element to this option will make that element this control's label.

---

## he.mixins.tooltip
Allows controls to show pop-over tooltips. Example:

```js
var input = he('input', document.getElementById('my-input'), {
	tooltip: {
		content: "At least 8 characters",
		position: "after"
	}
});
```

### [Requires]
- util/box 
 
### [Methods]

#### `tooltipShow([options])`
Shows the tooltip. If options are passed, they are applied to the tooltip. To see what options are available, check the documentation on `he.util.popover()`

#### `tooltipHide()`
Hides the tooltip.

#### `tooltipToggle([options])`
Shows if hidden, hides if shown.

### [Options]

#### "tooltip" 
Object. Default: `null`.  
The configuration options for the tooltip. If the option is set to `null`,  
the tooltip is removed. To see the options available, check the documentation for `he.util.popover()`. 

---
