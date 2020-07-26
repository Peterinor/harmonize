import { Commander } from "../harmonize/Component";

export class BenchSession {
    id: string;
    backend: string;

    // bench parameters
    concurrency: Array<number>;
    // request count for each concurrency
    zoom: number;
    duration: number;
    extraCmdOptions: string;
    variables: Map<string, any>;

    scenes: Array<BenchScene>;

    // 执行该压测会话当时的集群
    cluster: Commander;

    constructor() {
        this.concurrency = [5];
        this.backend = 'ab';

        this.zoom = 250;

        this.scenes = [];
        this.variables = new Map();
    }

    parse(conc_list: string) {
        try {
            var concReg = /(\d+)\.\.(\d+) step (\d+)/;
            var c = conc_list.split(' ');
            var x = concReg.exec(conc_list);
            if (x) {
                var arr = [];
                for (var i = parseInt(x[1]); i <= parseInt(x[2]); i += parseInt(x[3])) {
                    arr.push(i);
                }
                c = arr;
            }
            this.concurrency = c.map(c => {
                var cn = parseInt(c);
                if (!cn) {
                    throw "invalid concurrency///" + conc_list;
                }
                return cn;
            });
        } catch (e) {
            throw "invalid concurrency configuration....";
        }
    }
}

export class BenchScene {
    name: string;

    method: string; // GET, POST, ...
    url: string;

    headers: Map<string, string>;
    contentType: string;
    body: string;

    constructor(_name?: string, _method?: string, _url?: string) {
        this.name = _name;
        this.method = _method;
        this.url = _url;

        this.headers = new Map();
    }
}
