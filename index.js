const childProcess = require('child_process');

const DEFAULT_TIMEOUT = 10000;

/**
 * Spawns a child process and cleans it up automatically on parent termination
 *
 * @param {string} command - the base command to spawn, like 'npm'
 * @param {array} args - set of String arguments to provide, like ['run', 'build']
 * @param {Object} options - various options to determine environment and behavior
 * @param {string} options.name - (optional) a friendly name for the process
 * @param {string} options.cwd - override the current working directory for the child
 * @param {Object} options.env - override the child process' environment variables
 * @param {boolean} options.shell - whether or not to run the child in a shell (default true)
 * @param {RegExp} options.matchOutput - a regular expression to match against the child's stdio which will indicate that the process is ready for use. Specify this and simple-spawn will not resolve the returned promise until the match is satisfied or a timeout occurs
 * @param {number} options.matchTimeout - milliseconds to wait for the matchOutput to succeed before giving up. A timeout will cause a promise rejection.
 * @param {boolean} options.outputToConsole - overrides debug settings to output the child's stdio to console
 */
module.exports = (command, args, options) => {
  if (!options) {
    if (typeof args === 'Object') {
      options = args;
      args = [];
    } else {
      options = {};
    }
  }

  // print debug if: option is specified, DEBUG=simple-spawn, or DEBUG=*
  let debug = options.outputToConsole || (process.env.DEBUG && ~process.env.DEBUG.indexOf('simple-spawn')) || process.env.DEBUG === '*';
  // if a filter was applied to DEBUG=simple-spawn, only output if it matches our process name
  const debugFilterMatch = /simple-spawn:([^,]*)/.exec(process.env.DEBUG);
  if (debugFilterMatch) {
    debug = debug && (new RegExp(debugFilterMatch[1]).test(options.name));
  }

  function debugLog(message) {
    if (debug) {
      console.info(message);
    }
  }

  const displayName = options.name || `${command} ${args.join(' ')}`;

  const env = options.env || Object.assign({}, process.env);
  const useShell = (options.shell === true || options.shell === undefined);

  const proc = childProcess.spawn(command, args, {
    cwd: options.cwd,
    env: env,
    stdio: 'pipe',
    shell: useShell,
    detached: true // enables more reliable termination
  });

  debugLog(`${displayName} spawned (pid ${proc.pid})`);

  proc.on('error', () => {
    throw new Error(`${displayName} process encountered an error - run with env DEBUG=simple-spawn to diagnose`);
  });

  const cleanup = () => {
    debugLog(`killing ${displayName} (pid ${proc.pid})`);
    /*
      combined with the 'detached' specifier in spawn,
      killing a negative PID will kill the whole process group

      see also http://stackoverflow.com/a/33367711
    */
    try {
      process.kill(-proc.pid);
      debugLog(`${displayName} (pid ${proc.pid}) killed`);
    } catch (err) {
      debugLog(`could not kill ${displayName} (pid ${proc.pid}) : ${err.message}`)
    }
  };
  process.on('exit', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  if (!options.matchOutput) {
    return Promise.resolve({
      process: proc,
      pid: proc.pid
    });
  }

  return new Promise((resolve, reject) => {
    function handleStdIO(streamTag) {
      return chunk => {
        // echo the stream when debugging
        debugLog(`[${displayName}] ${streamTag} >>> ${chunk}`);

        const match = options.matchOutput.exec(chunk);

        if (match) {
          debugLog(`${displayName} started (pid ${proc.pid})`);

          resolve({
            process: proc,
            pid: proc.pid,
            matchResult: match
          });
        }
      };
    }

    proc.stdout.on('data', handleStdIO('OUT'));
    proc.stderr.on('data', handleStdIO('ERR'));

    // set timeout failure
    setTimeout(() => {
      reject(new Error(`${displayName} startup timed out after ${options.matchTimeout || DEFAULT_TIMEOUT}ms - run with env DEBUG=simple-spawn to diagnose`));
    }, options.matchTimeout || DEFAULT_TIMEOUT);
  });
};