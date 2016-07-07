# simple-spawn
Spawns a NodeJS child process and cleans it up automatically

## Usage

### Basic child process
```javascript
import spawn from 'simple-spawn';
spawn('tail', [ '-f', 'access.log' ]); // fire-and-forget, cleaned up on parent termination
```

### Wait for output
```javascript
import spawn from 'simple-spawn';
const result = await spawn('node', [ 'server.js' ], {
  matchOutput: /server listening on (.*)/,
  matchTimeout: 10000 // ms
});

console.log(`child server is listening on ${result.matchResult[1]}`);
// child server is listening on http://localhost:8080
```

### Customizing child environment
```javascript
import spawn from 'simple-spawn';
import path from 'path';
spawn('ls', {
  cwd: path.join(__dirname, 'foo'),
  env: { bar: 'corge' },
  shell: false
});
```