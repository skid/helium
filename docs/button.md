## Button
The simple button handles mostly click events. Example:  

```js
var btn = he('button', document.getElementById('my-button'), {
	icon: 'check',
	iconpos: 'after'
}).on('click', function(){ 
	alert('Button clicked!'); 
});
```

### [Data type]
Simple buttons have no value.

### [Binds to]
- HTML &lt;button&gt; element.

### [Requires]
- util.misc
- util.dom
- mixins.disable
- mixins.tooltip
- mixins.label
- control
 
### [Inherits]
- mixins.disable
- mixins.tooltip
- mixins.label
- mixins.error
- control
 
### [Methods]

### `val()`
This method is not used even though it's inherited. However, it **is** used by the checkbox and radio controls which extend the button.

### [Options] 

#### text
String. Default: `null`.  
The text displayed on the button. If omitted, it's the text content of the button HTMLElement.  
 
#### icon
String. Default: `null`.  
A name of a SVG icon that will be displayed on the button together with the text. Icon names that are not defined will be ignored.  
 
#### iconpos 
String ("before"|"after"). Default: `"before"`.  
The position of the icon. Can be placed before or after the text. If no valid icon is defined, this option is ignored.  
 
#### iconclick 
Function. Default: `null`.  
A function that is called when the button's icon is clicked. If this option is defined, clicking on the icon will supress the "click" event and the function defined as the option will be invoked instead.  
**BUGS:** Does not work in IE or Firefox because button's don't allow mouse events on child nodes. Will work if the button element is a &lt;div&gt; instead.
 
### [Events]

#### click
Triggered when the user clicks on the button, and the button is not disabled.  


### [CSS classes] 
- he-button

---

## Checkbox
The checkbox control replaces the HTML checkbox. The value type of the checkbox is Boolean. You can use the val(true/false) method to set the checkbox 
on or off. Example:  

```js
var check = he('checkbox', document.getElementById('my-checkbox'), {
	onIcon: 'check',
	offIcon: 'empty'
}).on('change', function(){ 
	alert('Checkbox is ' + this.val() ? "on" : "off"); 
});
```

### [Data type]
Boolean. The `true` value indicates that the checkbox is "on".

### [Binds to]
- HTML &lt;button&gt; element 

### [Requires]
- util/misc 
- util/dom 
- button/button
 
### [Inherits]
- button.button
 
### [Options] 

#### onIcon
String. Default: `"check-box"`.  
A name of a SVG icon for the ON state.  

#### offIcon
String. Default: `"check-box-blank"`.  
A name of a SVG icon for the OFF state. 
 
#### nullable
Boolean. Default: `true`.  
If set to false, the checkbox can only be turned off programatically (not by user interaction).
 
#### value
Boolean. Default: `false`.  
The initial value (state) of the checkbox.

### [Events]

#### change 
Triggered when the checkbox value (state) changes.

### [CSS classes] 
- **removed** he-button 
- he-checkbox

---

## Radio
The radio control replaces the HTML radio. The value type of the radio is Boolean. You can use the val(true/false) method to set the radio 
on or off. Just by itself, the only difference from a checkbox is the default icon. Example:  

```js
var radio = he('radio', document.getElementById('my-radio'), {});
```

### [Data Type]
Boolean. The `true` value indicates that the radio is "on".

### [Binds to]
- HTML &lt;button&gt; element 

### [Requires]
- util/misc
- button/checkbox 

### [Inherits]
- button.checkbox
 
### [Options] 

#### onIcon
String. Default: `"check-circle-blank"`.  

#### offIcon
String. Default: `"check-circle-outline-blank"`.  
 
#### nullable
Boolean. Default: `false`.  

--- 
