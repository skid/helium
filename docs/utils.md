## Utils
The `he.utils` namespace contains several utilities used by the Helium library. 

#### `he.util.getPositionInfo(anchor [, container])`
Returns a bunch of information about the size and positions of an element relative to its parent container or the document element.
The first argument, is the reference element (anchor). The second, optional, argument is the reference parent (container). If omitted the method will assume that the parent is the documentElement. The object returned contains the following keys: 

```js
{ 
  vHeight: 		"the clientHeight of the container (visible internal area) in pixels",
  vWidth: 		"the clientWidth of the container (visible internal area) in pixels",
  scrollTop: 	"the scrollTop of the container in pixels",
  scrollLeft: "the scrollLeft of the container in pixels",
  aHeight: 		"the offsetHeight of the anchor in pixels",
  aWidth: 		"the offsetWidth of the anchor in pixels",
  aTop: 			"pixels between the top edge of the anchor and the top edge of the container",
  aLeft: 			"pixels between the left edge of the anchor and the left edge of the container",
  aRight: 		"pixels between the right edge of the anchor and the right edge of the container",
  aBottom: 		"pixels between the bottom edge of the anchor and the bottom edge of the container"
} 
```

The aTop, aLeft, aRight and aBottom values measure the distance between the corresponding edges of the anchor and the container. For example, if the container is scrolled down, thus making the anchor scrolled out of view, `aTop` will have a negative value. This method is mainly used for positioning boxes inside scrollable containers. 

---

#### `he.util.inconHTML(name [, asNode, fill])`
The "name" argument is required and needs to be already defined in the Helium icon set. The function will return valid HTML for a SVG element with the requested icon. If the "asNode" argument is `true`, the function will return a SVG Node instead.


---

#### `iconBackground(name [, fill])`
Works the same as iconHTML, but instead returns a valid data url which can be used as a background image.


---
 
### `new he.util.Box(options)`
The Box class represents a container that can be positioned relative to another anchor element. It simplifies the positioning by allowng you to choose from among some common options. The box is instantiated by passing to it some options. The box is not rendered immediately, but is appended to the parent element when shown. The box HTML contents are set using `innerHTML` or `appendChild()`.

#### [Requires]
- core
- util/dom 

#### [Properties]

#### el
HTMLElement.  
The box element.

#### isShown
Boolean. Default: `false`.  
Indicates whether the box is shown and included in the DOM.  

#### [Options]

##### `element`
HTMLElement. Default: A new DIV is created.  
This is the box element. It can only be set when the class is instantiated. If omitted a new `<div>` element is created outside the DOM and you can access it with `box.el`

##### `anchor`
HTMLElement. Default: `document.body`
This is a HTMLElement which will be used as the reference to which the box will be positioned. By default it's the document element.
 
##### `parent` 
HTMLElement. Default: `document.body`
This is a HTMLElemnet in which the box will be placed. By default it's the document element.
 
##### `vertical`
Stirng. Default: `"top"`.  
This is a String which controls the vertical positioning of the box relative to the anchor. It can be one of the following: 
 
1. "top": the top edges of the anchor and the box are aligned
2. "bottom": the bottom edges of the anchor and the box are aligned  
3. "above": the bottom edge of the box and the top edge of the anchor are aligned 
4. "below": the top edge of the box and the bottom edge of the anchor are aligned 
5. "middle": the box will be vertically centered with the anchor 
 
This option can also have an offset defined in pixels or percentage of the box's height. Fore example: `{ vertical: "top + 10%" }`
 
##### `horizontal` 
Stirng. Default: `"center"`.  
This is a String which controls the horizontal positioning of the box relative to the anchor. It can be one of the following: 
 
1. "left": the left edges of the anchor and the box are aligned 
2. "right": the right edges of the anchor and the box are aligned  
3. "before": the right edge of the box and the left edge of the anchor are aligned 
4. "after": the left edge of the box and the right edge of the anchor are aligned  
5. "center": the box will be horizontally centered with the anchor
 
This option can also have an offset defined in pixels or percentage of the 
box's width. Fore example: `{ horizontal: "after + 10%" }`
 
##### `size` 
Stirng. Default: `null`.  
This is a string which controls the size of the box. It is `null` by default.
It can be one of: 
 
1. `parent`: the box will be made as big as the parent element. 
2. `anchor`: the box will be made as big as the anchor element.  
3. `null`: the box will have it's natural size

##### `hauto`
Stirng. Default: `""`.  
This option controls the positioning of the box in cases where it overflows the parent's visible horizontal area on the side on which it is shown (controlled by the "horizontal" option):

1. "opposite" - if there is enough space to fit the box on the opposite side then it will be placed there. ("left" is opposite of "right" and "before" is opposite of "after")
2. "" (default) - will do nothing, the box will overflow

##### `vauto`
Stirng. Default: `""`.  
This option controls the positioning of the box in cases where it overflows the parent's visible vertical area on the side on which it is shown (controlled by the "vertical" option):

1. "opposite" - if there is enough space to fit the box on the opposite side then it will be placed there. ("top" is opposite of "bottom" and "above" is opposite of "below")
2. "max" - if there is enough space to fit the box inside the parent, the box will be snapped to the parrents top or bottom edge. Otherwise, the box will be shrinked to cover the entire parent's height (scrollbars may appear).
3. "dropdown" - will alays attempt to place the box at the "bottom" vertical setting. If it does not fit, it will be shrinked. If shrinked to below 100px the box will be placed at the "above" vertical setting and shrinked to fit inside the space between the anchor's top and parent's top.
4. "" (default) - will do nothing, the box will overflow

##### `cssClass`
String. Default: `""`.  
A string or an array of classes to be added to the box element.


#### [Methods]

##### `setOptions(options)`
Sets options to the box. The "options" argument is explained in the section above.

##### `show()`
Shows the box by appending it to the DOM and adding to it a "he-shown" class. The method will return `true` if the box was not already shown and the action took place. If the box was already shown nothing happens and the method returns `false`

##### `hide()`
Shows the box by removing it from the DOM and removing the "he-shown" class. The method will return `true` if the box was shown and the action took place. If the box was already hidden nothing happens and the method returns `false`

#### [CSS class]
- he-box

---

### `new he.util.popover(options)`
The popover is a simple tooltip implementation based on the `Box()` class. It has some CSS to display a small arrow pointing towards the anchor element. It can be positioned above, below, before or after the anchor.  
Internally it creates a new `Box()` instance and sets its element to the popover's element. 

#### [Composed by]
- he.util.box

#### [Properties]

##### box
A reference to the Box() instance.

##### el
The popover's and it's box's HTML element.

#### [Options]

##### anchor
Passed over to the popover's Box. 
 
##### parent
Passed over to the popover's Box.

##### content
String|HTMLElement. Default: `""`.  
This is a HTMLElement or a string of valid HTML that will replace the popover's content

##### position
String. Default: `"above"`.  
This is a shortcut for positioning the popover's box. It's one of the following strings: "above", "below", "before" and "after" and it's relative to the anchor.

##### cssClass
String. Default: `""`.  
A css class to be added to the popover element.

#### [Methods]

##### `setOptions()`
Sets options to the popover. The "options" argument is explained in the section above.

#### `show()`
Delegated to the popover's box.

#### `hide()`
Delegated to the popover's box.

#### [CSS class]
- he-box
- he-arrow

---
