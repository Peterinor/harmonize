import * as utils from './Utils';
import { BenchSession, BenchScene } from '../benching/Benching';

export class BenchBackendFactory {
    static new(bench: string): BenchBackend {
        switch (bench.toLocaleLowerCase()) {
            case 'ab':
            case 'apache bench':
            case 'apachebench':
                return new ApacheBench();

            case 'jmeter':
                return new JMeterBench();

            default:
                return new ApacheBench();
                break;
        }
    }
}

export abstract class BenchBackend {
    name: string;

    constructor() {
    }

    abstract shellCmd(conc: number, session: BenchSession, params: BenchScene);
}

export class ApacheBench extends BenchBackend {

    constructor() {
        super();
        this.name = "Apache Bench";
    }

    /*
    ab  -c {{=conc}} \
    {{?it.timelimit}} -t {{=it.timelimit}} {{?}} \
    {{?it.count || !it.timelimit}} -n {{=count}} {{?}} \
    -g {{=it.out_dir}}/data/{{=it.action}}-{{=conc}}.dat \
    {{~it.headers:header}} -H "{{=header}}" {{~}} \
    {{?it.contentType}} -T "{{=it.contentType}}" {{?}} \
    -k {{?it.variable}} -l {{?}} -r \
    {{?it.cmd_options}} {{=it.cmd_options}} {{?}} \
    {{?it.timeout}} -s {{=it.timeout}} {{?}} \
    {{?it.postfile}} -p "{{=it.postfile}}" {{?}} \
    "{{=it.url}}" > {{=it.out_dir}}/{{=it.action}}-{{=conc}}.txt

    Usage: D:\program\tools\ab.exe [options] [http://]hostname[:port]/path
Options are:
    -n requests     Number of requests to perform
    -c concurrency  Number of multiple requests to make at a time
    -t timelimit    Seconds to max. to spend on benchmarking
                    This implies -n 50000
    -s timeout      Seconds to max. wait for each response
                    Default is 30 seconds
    -b windowsize   Size of TCP send/receive buffer, in bytes
    -B address      Address to bind to when making outgoing connections
    -p postfile     File containing data to POST. Remember also to set -T
    -u putfile      File containing data to PUT. Remember also to set -T
    -T content-type Content-type header to use for POST/PUT data, eg.
                    'application/x-www-form-urlencoded'
                    Default is 'text/plain'
    -v verbosity    How much troubleshooting info to print
    -w              Print out results in HTML tables
    -i              Use HEAD instead of GET
    -x attributes   String to insert as table attributes
    -y attributes   String to insert as tr attributes
    -z attributes   String to insert as td or th attributes
    -C attribute    Add cookie, eg. 'Apache=1234'. (repeatable)
    -H attribute    Add Arbitrary header line, eg. 'Accept-Encoding: gzip'
                    Inserted after all normal header lines. (repeatable)
    -A attribute    Add Basic WWW Authentication, the attributes
                    are a colon separated username and password.
    -P attribute    Add Basic Proxy Authentication, the attributes
                    are a colon separated username and password.
    -X proxy:port   Proxyserver and port number to use
    -V              Print version number and exit
    -k              Use HTTP KeepAlive feature
    -d              Do not show percentiles served table.
    -S              Do not show confidence estimators and warnings.
    -q              Do not show progress when doing more than 150 requests
    -l              Accept variable document length (use this for dynamic pages)
    -g filename     Output collected data to gnuplot format file.
    -e filename     Output CSV file with percentages served
    -r              Don't exit on socket receive errors.
    -m method       Method name
    -h              Display usage information (this message)
    */

    shellCmd(conc: number, session: BenchSession, scene: BenchScene) {
        var args = ['ab'];

        args.push('-c');
        args.push(String(conc));

        args.push('-n');
        args.push(String((session.zoom || 250) * conc));

        if (scene.method) {
            args.push('-m');
            args.push(scene.method);
        }

        if (session.duration) {
            args.push('-t');
            args.push(String(session.duration));
        }

        if (scene.contentType) {
            args.push('-T');
            args.push(scene.contentType);
        }

        if (scene.headers) {
            scene.headers.forEach(h => {
                args.push('-H');
                args.push(h);
            })
        }

        if (session.extraCmdOptions) {
            args.push(session.extraCmdOptions);
        }

        args.push(scene.url)
        return args;
    }
}


export class JMeterBench extends BenchBackend {
    shellCmd(conc: number, session: BenchSession, params: BenchScene) {
        throw new Error("Method not implemented.");
    }


    constructor() {
        super();
        this.name = "JMeter";
    }

}