// simple node test process which outputs some logs
const sleep = require('sleep');

console.info('starting...');

console.info(`cwd: ${process.cwd()}`);
console.info(`env: ${JSON.stringify(process.env)}`);
console.info(`pid: ${process.pid}`);

sleep.sleep(1);

console.error('error output');
console.info('regular output');

(function loop() {
  setTimeout(() => {
    console.log('still alive');
    loop();
  }, 5000);
})();