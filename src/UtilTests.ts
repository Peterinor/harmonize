import * as utils from './harmonize/Utils';
// utils.exec('ab');
// utils.exec('ab', ['-V']);

// utils.exec('ab', '-c 5 -n 100 http://localhost/');

var cmd = utils.exec('ab', '-c 5 -n 1000 http://localhost/');
cmd.on('data', data => {
    console.log(data);
}).on('exit', (c, s) => {
    console.log(c, s);
}).on('error', data => {
    console.error(data);
})