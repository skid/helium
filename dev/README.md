# Helium Development
This is the helium development directory. Here's a quick rundown of the structure:

- The "data" directory contains test data in JSON format.
- The "lib" directory contains 3rd party libraries. Only lodash is required by helium, the rest are used to simplify development.
- The "index.html" is the kitchen sink HMTL file.
- The "index.js" is the kitchen sink JS file.
- The "server.js" is the node (connect) development server .
- The "styles.css" contains styles mostly used to position the index.html content.

The helium javascript and css files are directly loaded from the "src" directory of the project, so no source maps are required.

## Contributing

To contribute to helium, you will need to install [Node.js](http://nodejs.org) and the dev dependencies.