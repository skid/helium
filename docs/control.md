## Control

This is the base abstract control class. 
It is inherited by most contorls.

### [Requires]
- core

### [Properties]

#### `el`
This is the reference to the plain old HTMLElement 
associated with this control.

### [Methods]

#### `option(name [, value])`
This method is used to get/set configuration options to the control. You can use this method in the following ways:

- Pass `null` as the only argument to reset the options to their defaults.
- Pass a single string for "name" to get the value for that option.
- Pass a name and a value to set the option with the same name.  
- Pass a dict to set multiple options.

```js
ctrl.option("disabled"); 												// returns true if disabled
ctrl.option("disabled", true); 									// disables the control
ctrl.option({ disabled: true, icon: "check" }); // set multiple options
ctrl.option(null); 															// reset to defaults
```

#### `val(value [, options])`
A shortcut method for getting/setting the value of a control. A second argument, options, is available when setting a value. This object will be passed to any events triggered by calling this method. You can use this method in the following ways:

- Pass an argument to set the value.  
- Pass no arguments to get the value.
- Pass a value and `{ silent: true }` for options to prevent "change" events from triggering
 
###### IMPORTANT:

In Helium, the controls have an associated value type. For example, text inputs return strings, number inputs return numbers, list-based controls return mixed arrays and date inputs return Date objects. Each control can also have an "empty" value which is always `null`, except in the case of list-based controls where it's an empty array. When setting a value, if an incorrect type is passed, the control will try to cast it to the correct one. If it fails, the value will be set to null. For example: 

```js
myNumberInput.val("100"); // Will be set to 100
myNumberInput.val("ABC"); // Will be set to null
```

#### `on(name, callback [, context])`
#### `off(name [, callback, context])`
#### `once(name, callback [, context])`
#### `trigger(name [...arguments])`

These are all event methods borrowed from Backbone. Please refer to Bacbone's documentation on [Events](http://backbonejs.org/#Events).

---
