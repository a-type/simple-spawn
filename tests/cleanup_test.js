import test from 'ava';
import childProcess from 'child_process';
import path from 'path';
import isRunning from 'is-running';

test.skip('child cleanup after terminating the parent', async (t) => {
  const proc = childProcess.spawn('node', [ path.join(__dirname, 'fixtures', 'parentProc.js') ], {
    stdio: 'pipe',
    shell: true,
    detached: true
  });

  const childPid = await new Promise((resolve) => {
    proc.stdout.on('data', (chunk) => {
      console.log(chunk.toString());
      const match = /spawned \(pid (\d+)\)/.exec(chunk);
      if (match) {
        resolve(Math.floor(match[1]));
      }
    });
  });

  const procKilledPromise = new Promise((resolve) => {
    proc.stdout.on('data', (chunk) => {
      console.log(chunk.toString());
      if (new RegExp(`(pid ${childPid}\) killed`).test(chunk)) {
        resolve();
      }
    });
  });

  process.kill(proc.pid);

  await procKilledPromise;

  t.false(isRunning(childPid));
});