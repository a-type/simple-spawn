import test from 'ava';
import path from 'path';
import spawn from '../index.js';

test('spawning a process waiting for timeout', async (t) => {
  t.throws(spawn('node', [ path.join(__dirname, 'fixtures', 'testProc.js') ], {
    name: 'wait-timeout',
    matchOutput: /never matches/,
    matchTimeout: 50
  }), /timed out/);
});