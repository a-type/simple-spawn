import test from 'ava';
import path from 'path';
import spawn from '../index.js';

test('spawning a process waiting for a match', async (t) => {
  const result = await spawn('node', [ path.join(__dirname, 'fixtures', 'testProc.js') ], {
    name: 'wait-out',
    matchOutput: /regular (.*)/
  });
  t.truthy(result.process);
  t.truthy(result.pid);
  t.truthy(result.matchResult);
  t.is(result.matchResult[1], 'output');
});