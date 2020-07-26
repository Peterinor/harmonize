
import { BenchSession, BenchScene } from './benching/Benching';
import { BenchBackendFactory } from './harmonize/BenchBackend';
import { BenchAtom } from './harmonize/Component';

var bs = new BenchSession();

bs.parse('1');
console.log(bs.concurrency);

bs.parse('1 5 10');
console.log(bs.concurrency);

bs.parse('5..100 step 5');
console.log(bs.concurrency);

try {
    bs.parse('');
    console.log(bs.concurrency);
} catch (e) {
    console.log('invalid');
}

try {
    bs.parse('haha..');
    console.log(bs.concurrency);
} catch (e) {
    console.log('invalid');
}



var sc1 = new BenchScene("sc1", "GET", "http://localhost/");

var apache = BenchBackendFactory.new('ab');
console.log(apache.shellCmd(5, bs, sc1));

var abAtom = new BenchAtom(5, bs, sc1);
abAtom.start();
setTimeout(() => abAtom.stop(), 1000);