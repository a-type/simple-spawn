import test from 'ava';
import path from 'path';
import spawn from '../index.js';

test('spawning a process waiting for a match on stderr', async (t) => {
  const result = await spawn('node', [ path.join(__dirname, 'fixtures', 'testProc.js') ], {
    name: 'wait-err',
    matchOutput: /error (.*)/
  });
  t.truthy(result.process);
  t.truthy(result.pid);
  t.truthy(result.matchResult);
  t.is(result.matchResult[1], 'output');
});