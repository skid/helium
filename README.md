# Helium

Form controls for all occasions, for the web. And guidelines.

## Usage
- grab only the build folder

## Examples

## Concept

The Helium library comes with an opinionated concept on user interface controls and their usage. The concept is derived mostly from practical development of business applications and development of different controls for working with boring banking data.

First and foremost, we recognize the fact that a GUI control stands for a certain concept in the application. Helium identifies three such concepts:

1. Data display (D)
2. Data entry (E)
3. User action (A)
4. Visuals (V)

You can argue that data entry can be viewed as an action, but in my perspective "an action" is a specific command that the user issues at a single point in time like "click a button".

On the other hand, however, to be able to enter data, you need to be able to see what you have entered, so data entry and data display are sometimes the same thing.

Some data, of course, is manipulated in a different way than it is displayed (graphs), so we need to recognize data display and data entry as separate points.

Visuals have nothing to do with the underlying data, but are rather used to add structure to the data representation or to facilitate how the user interacts with it.

## Controls library

Helium attempts to identify the most commonly used data types and the best ways to handle them. Its collection of controls is a mix of simple controls for taking care of the simple data types and compositions of simple controls for handling more complex data types.

