import test from 'ava';
import path from 'path';
import spawn from '../index.js';

test('spawning a process without waiting', async (t) => {
  const result = await spawn('node', [ path.join(__dirname, 'fixtures', 'testProc.js') ], { name: 'fire-forget' });
  t.truthy(result.process);
  t.truthy(result.pid);
});