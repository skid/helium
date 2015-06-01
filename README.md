# Helium

Helium is a UI controls library developed to address the lack of programmable APIs for native HTML controls. The library was developed while working on banking applications where a flexible set of controls let us shift focus from DOM manipulation with jQuery to programming business logic. Helium was made to make the View part of MVC easy to handle.

Here's the stuff that you get from Helium:

- Programatically enable and disable controls. Disabled elements keep emitting DOM events, but the controls themselves don't.
- Add tooltips with a simple config option. Tooltips can hold custom HTML and can be styled.
- Mark controls as "wrong" (error) with a config option. The wrong controls show an error message on their tooltip and display an icon on their label.
- Controls can be aware of their labels. Labels get a css class when the control is disabled and an error icon when the control is marked as wrong.
- Add SVG icons to buttons and inputs with a simple config option.
- Inputs with clickable icons
- Number inputs with as-you-type formatting and a number value type
- Date inputs with datepicker option and a Date value type
- Lists that bind to a javascript array of items
- A multiple-select scrollable list with custom item templates and optgroups
- A nullable dropdown list with custom item templates and optgroups
- A filterable (autocomplete) dropdown list with custom item templates and optgroups that supports async data loading.
- Checkbox and radio groups with a list interface with a custom render function
- Programmable modal dialog with onClose, willClose, onOpen and willOpen events
- A customizable context menu control
- A box helper to position pop-up elements relative to a reference anchor
- A data grid which allows editing, sorting, paging, resizing, keyboard navigation and can be bound to any data structure.

## Why we made this library?

As I mentioned, Helium was developed in the banking industry. The requirements here are more on the usability side than on the look-and-feel side. Our web applications use MVC architecture to handle the (sometimes very) complex business logic. Some of the app screens that we are dealing with easily contain more than 30 different controls which need to be disabled, re-labeled, marked as wrong, populated with new choices or have their value changed depending on the model state.

We gave some other UI libraries a shot, but we found the implicit behavior that comes with each control to be more of a nuissance than help. We needed something simple. So we made Helium with the following core assumptions:

1. All UI controls should be **dumb**. They should not be aware of anything more than the value they contain.
2. All UI controls should receive and return data of the correct type. Datepickers should return Date objects, lists should return arrays and number fields should return numbers and so on.
3. Controls should provide a very simple API for these common tasks: disabling, enabling, showing a tooltip, showing an icon and being marked as wrong.
4. Controls should not implicitly change or prevent user input. The validation is handled by the Model and, if need be, it will mark the controls as wrong.
5. Asynchronous/ajax calls are also handled by the model.
6. A grid control that won't manipulate the data source directly but rather just inform the model when a user makes an edit was essential.
7. We also needed a simple way to: display a menu, show a modal window.
8. We want clean HTML markup which avoids automatic wrapping and replacing elements as much as possible.

We ended up with a small library of bare essentials which focuses on having a simple, programmable API, leaves the logic to the model and the layout to HTML and CSS.

Helium is in large part built from itself. For instance, the dropdown list control combines a button control with a normal scroll list. The checkbox control is just a button with different styles. The autocomplete control combines an input control with a scroll list. This approach makes it easy to leverage on exeisting controls and combine or modify them to create new ones.

## Dependencies

Helium has a single dependency - [Lodash](http://lodash.com/). jQuery or similar libraries are not used because with Helium we rarely require any DOM manipulations and the js code deals with the business logic only. 

A downside of this is that Helium works only on modern browsers (IE10+). Touch devices are not supported either. Since we deploy applications on an intranet, this was never an issue.

## Api Reference (and how to read)

The helium API reference can be found in the [docs](docs) folder. Each control inherits functionality from an abstract base control and optionally one or more mixins. Some controls are combinations of one or more other controls. In the API reference you will find [Inherits] and [Composed by] sections which will explain which controls are used.  

When browsing the reference for a control keep in mind that it will inherit the methods, options, events and attributes from parent controls, so to have a complete picture, you should take a look at the reference for the inherited controls as well. Controls that are composed of other controls will have attributes that reference their constituents. These controls will have a list of methods and options which are delegated to them. For example, the autocompleteList is composed of a scrollList and an input. It lists the delegated methods, but you should turn to the input and scrollList API reference to see what these do.

#### API Reference Index

- [Base Control](docs/control.md)
- [Mixins](docs/mixins.md)
- [Utilities](docs/utils.md)
- [Panels](docs/panel.md)
- [Button](docs/button.md)
- [Inputs](docs/input.md)
- [List controls](docs/list.md)
- [Grid](docs/grid.md)

## Demos

You can find a demo for most of the controls [on this link](http://skid.github.io/helium-kitchen-sink.html). You can fire up the console and start playing with the controls.

A separate demo for the grid [can be found here](http://skid.github.io/helium-grid.html).

## Licence
MIT.