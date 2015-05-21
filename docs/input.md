## Input
The input control allows entering of plain text.

```js
var input = he('input', document.getElementById('my-input'), {
	icon: 'check',
	iconpos: 'after',
}).on('change', function(options){ 
	alert("Value changed from '" + options.previous + "' to '" + this.val() + "'"); 
});
```

### [Data type]
- String or null. Empty inputs always return `null`.
 
### [Binds to]
- HTML &lt;input&gt; element
- HTML &lt;textarea&gt; element

### [Requires]
- util/misc 
- util/dom
- util/icons
- mixins/disable 
- mixins/tooltip
- mixins/label 
- mixins/error 
- control

### [Inherits]
- mixins.disable 
- mixins.tooltip 
- mixins.label 
- mixins.error 
- control

### [Options]

#### maxlength  
Number. Default: `0`.  
Maximum length of characters allowed. This simply sets the HTML maxlength attribute.
 
#### placeholder
String. Default: `""`.  
The placeholder text shown in an empty input. This simply sets the HTML placeholder attribute. 

#### icon
String. Default: `null`.  
A name of a SVG icon. If it's a valid icon name, the input will display a background image of the icon in the color of the input's border.

#### iconpos 
String ("before"|"after"). Default: `"before"`.  
The position of the icon. Can be placed before or after the input's text. 
 
#### click 
Boolean. Default: `false`.  
This only works if the input is showing an icon. If set to true, the input will trigger a "click" event when the area of the icon is clicked.
 
#### value 
The initial value of the input.


### [Events] 
#### click 
Triggered when the user clicks on the input (on the area where the icon is placed). Only triggered if there is an icon defined and the "click" option is set to true.
 
#### change
Triggered when the input loses foucs and it's text is different from when the input gained focus the last time. Any attached handlers will receive a single argument, "options", unless the value was changed programatically and additional arguments were passed:

```js
input.on('change', function(options){
	this.val();       // The new value
	options.previous; // The previous value of the input
	options.source; 	// Reference to the input control
});
```

#### type 
Triggered when the user types into the input thus changing the text. The "type" event **will not** be triggered if the text did not change with the typing action (for instance, the user selects the letter "a" and replaces it with another "a"). Triggered after the native "keyup" event. 

**NOTE:** The value of the input obtained by `input.val()` will always reflect the current value of the input field, regardless of whether a "change" event was triggered.
 
### [CSS classes] 
- he-input

---

## Number
The number control allows entering numeric values. It does not accept typing anything else than numbers, commas and periods. It also performs as-you-type formatting of the number by adding thousands separators. Example:  

```js
var number = he('number', document.getElementById('my-number-input'), {
	format: 2,
	negative: true
}).on('change', function(options){ 
	alert("The input's value incremented by 2 is: " + this.val() + 2);
});
```

### [Data type]
- Number or null. Empty number inputs always return `null`.

### [Binds to]
- HTML &lt;input&gt; element

### [Requires]
- util/misc 
- util/dom
- input/basic
 
### [Inherits]
- input.input
 
### [Options]
#### format 
Number. Default: `0`.  
The number of decimals to round to. If set to 0, the input will show only integers and return only integers as value. Otherwise it will always round its values to the specified precision.
 
#### negative 
Boolean. Default: `false`.  
If set to `true`, the input will allow negative values and will allow the "-" character to be typed in.

#### value 
The initial numeric value of the input.
 
### [CSS classes] 
- he-number

---

## Calendar
This is a stand-alone datepicker control that has no input associated to display the value. Although it can be used by itself, it is usually combined with a date input to create a pop-up datepicker. Example:  

```js
// Weekends will have the "he-disabled" class added to them
var cal = he('calendar', document.getElementById('no-weekends'), {  
  onRenderDate: function(date){  
    return date.getDay() % 6 ? "" : "he-disabled";
  }
});
```

### [Data type]
- Date or null. If no date is selected, returns `null`.

### [Binds to]
- HTML &lt;div&gt; element 

### [Requires]
- util/misc 
- util/dom
- control
 
### [Inherits]
- control
 
### [Methods]

#### `showYear(year)`
Sets the selected year on the calendar. Does not change the calendar value. Accepts a single integer that denotes the desired year. 

#### `showMonth(month)`
Sets the selected month on the calendar. Does not change the calendar value or the showMonth option. Accepts a single integer that denotes the desired month where january === 0.
 
#### `pickDate(date)`
Accepts an integer denoting a date. It then combines it with the current shown year and shown month to construct a new date. This date is then set as the calendar's value. Ivoking this method is equivalent to clicking on the calendar dates.

### [Options]

#### cssClass 
String. Default: `"he-white"`.  
An optional css class to apply to the calendar element. You can also do that in the HTML definition of the element.
 
#### showMonth 
Date. Default: `this.value` or `new Date`.  
The calendar will position itself to the month of this date. If this option is not set, the calendar will position itself to the month of its date value. If is value is null, the calendar will position itself to whatever `new Date()` returns. 
 
#### onRenderDate 
Function. Default: `null`.  
If set, this function will be called each time a date field is rendered. The "this" context will be set to the calendar control and a single argument, the specific Date object will be passed. The function can return a css class to be added to the rendered date field. Example:

```js
// Weekends will have the "he-disabled" class added to them
var cal = he('calendar', document.getElementById('no-weekends'), {  
  onRenderDate: function(date){  
    return date.getDay() % 6 ? "" : "he-disabled";
  }
});
```

### [Events]

#### change 
Triggered when the calendar's value changes. Any attached handlers will receive a single argument, "options":

```js
calendar.on('change', function(options){
	this.val();       // The new value
	options.previous; // The previous value of the calendar
});
```

### [CSS classes] 
- he-calendar

--- 

## Date
The date control allows input of dates. The user can type in the dates or it can also be configured to show a pop-up datepicker (calendar). Example:  

```js
// Weekends will have the "he-disabled" class added to them
var cal = he('date', document.getElementById('my-date-input'), {  
  format: 'US',
	datepicker: { cssClass: 'blue' } // Show a datepicker with the "blue" class
});
```

### [Data type]
- Date or null. If the input is empty, returns `null`. 

### [Binds to]
- HTML &lt;input&gt; element 

### [Requires]
- util/misc 
- util/dom
- input/basic 
- input/calendar

### [Inherits]
- input.input
 
#### [Methods]

#### `open()`
If the datepicker is configured, opens the datepicker panel.

#### `close()`
If the datepicker is configured, closes the datepicker panel.

### [Options] 

#### format 
String. Default: `"ISO"`.  
The date format of the control. Currently there are 3 date formats 
supported by Helium: 

- "ISO" `yyyy-mm-dd`
- "EU" `dd.mm.yyyy`
- "US" `mm/dd/yyyy`

#### datepicker
Object. Default: `null`.  
These are the configuration options of the optional calendar sub-control. If set to `null`, the input won't show a datepicker when focused. Otherwise, the calendar will be shown as a pop-up. The positioning of the pop-up is also controlled with these options.  
Check the documentation for input.calendar and util.box.popover  
for details about the possible options. 

### [CSS classes] 
- he-date

---
