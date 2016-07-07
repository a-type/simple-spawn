const spawn = require('../../index');
const path = require('path');

spawn('node', [ path.join(__dirname, 'testProc.js') ], {
  name: 'cleanup-child',
  outputToConsole: true
});
