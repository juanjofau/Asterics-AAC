// Load the same browser-global ObjectModel library used by index.html before model imports run in Jest.
const fs = require('fs');
const path = require('path');

const objectModelPath = path.resolve(__dirname, 'app/lib/object-model.min.js');
const objectModelSource = fs.readFileSync(objectModelPath, 'utf8');
// The vendor script attaches ObjectModel to the browser global via its top-level "this".
const jestObjectModelSource = objectModelSource.replace(/\}\(this\);\s*$/, '}(window);');

if (jestObjectModelSource === objectModelSource) {
    throw new Error('Could not initialize ObjectModel for Jest: unexpected vendor script ending.');
}

eval(jestObjectModelSource);

if (typeof window.Model !== 'function') {
    throw new Error('ObjectModel was not initialized on window.Model for Jest.');
}
