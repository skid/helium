# TODOS for version 0.1

#### Documentation
- Document [Events] where missing
- Finish README for docs
- Write tutorial

#### Calendar
- Fix styles - set sizes in pixels

#### Grid
- Offer out-of-the-box data binding (the crap you got in index.js)

#### General BUGS

In chrome/safari/firefox, the grid filter list scrolls to the top after a filter is applied (countries column).

In chrome (possibly others), the number inputs make the page scroll to the top when focused.

#### Firefox BUGS

- Any elements that are children of a <BUTTON> do not appear as targets of mouse events. This prevents the nullable dropdown to work since the click event target is always the button itself.

### IE BUGS

- The SVG DOM nodes do not have a classList property.

---

# TODOS for version 0.2

#### Bugs
- In firefox, when the enum filter is applied on the grid, the filter list scrolls back to the top...
- Resize grid so that a column reaches the rightmost edge of the screen. Open filter menu. The menu is not auto-positioned. If you close it and open it again, it WILL be auto-positioned...

#### General
- Make custom date formats
- For lists - make it possible so some of their options are disabled
- Handle "maxlength" input options
- Header columns

#### Menu
- Make the menu able to use the mous pointer as an anchor. This change probably has to come to getPositionInfo

#### CSS
- Create CSS for button groups and make pill buttons
- Add css class for displaying button lists vertically

#### Button lists
- Make a plain button list (no icons). Apply classes to the active buttons instead of swapping the SVG icons (like in the checkboxes);

#### Tabbed interface
- Create a tabbed interface using a custom "no-svg-icon" button list and a set of panels. The list will show/hide panels based on its value

#### Autocomplete/Combo
- Add the "combo" option where the list will take the value of the typed-in text

#### Inputs
- Autogrow textarea
- Improve as-you-type formatting in number inputs (remove commans on backspace)
- Allow arbitrary date types for date inputs / calendars
- Make as-you-type dash insertion for date inputs

#### Calendar
- Selection of date ranges
- Selection of time and timezone

#### Token Input
- Make a token input control
- Validate a typed-in string before allowing it to be tokenized
- List of separator characters

#### Token combo list
- Make a token combo list control

#### Grid
- Make the grid cells selectable and navigable with keyboard; hitting RETURN or clicking on a selected cell should trigger editing. Rewrite the editing.js code.
- Make an option to set min-width to the grid. Shrinking one column should enlarge another
- Column reordering
- Row reordering
- Grouping Rows (that span all columns and can optionally expand some data)
- Grouping Columns (rowspan) based on the identicity of data

#### Modal
- Allow closing by hitting the ESC key.

---

# TODOS for version 0.3

#### Lists and grids
- Make a infinite list that renders items progressively

#### Scroll Lists
- Make an orderable list - by dragging its members

#### Treeview Control
- Make it

#### Menu
- Add separators between menu items
