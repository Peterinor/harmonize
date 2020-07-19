import * as WebSocket from 'ws';
import * as utils from './Utils';
import { ChildProcessWithoutNullStreams } from 'child_process';

import { BenchBackend, ApacheBench, JMeterBench, BenchBackendFactory } from './BenchBackend';
import { BenchSession, BenchScene } from './Benching';

const HEALTH_CHECK_INTERVAL = 5000;

export class BenchAtom {
    conc: number;
    session: BenchSession;
    scene: BenchScene;

    private _cmd: ChildProcessWithoutNullStreams;
    constructor(_conc: number, _session: BenchSession, _scene: BenchScene) {
        this.conc = _conc;
        this.session = _session;
        this.scene = _scene;

        this._cmd = null;
    }

    start(): number {
        if (this._cmd) {
            throw "running...";
        }
        var output = [];
        var args = BenchBackendFactory.new(this.session.backend).shellCmd(this.conc, this.session, this.scene);
        var cmd = args.shift();
        this._cmd = utils.exec(cmd, args);
        this._cmd.on('data', data => {
            console.log(data);
            output.push(data);
        }).on('error', (c, s) => {
            console.error(c, s);
            output.push(c + s);
            return -1;
        }).on('exit', (c, s) => {
            console.log(c, s);
            if (c === 0) {
                return 0;
            }
            return -1;
        });
        return 0;
    }

    stop() {
        if (this._cmd.kill()) {
            this._cmd = null;
        } else {
            throw "stop command failed...";
        }
    }

}


export class BenchReport {
    nodeId: string;
    data: any;

    constructor(_node: string, _data: any) {
        this.nodeId = _node;
        this.data = _data;
    }
}


export class Component {
    // id = ip:port
    id: string;

    constructor(_id: string) {
        this.id = _id;
    }
}

export class Commander extends Component {
    nodes: Array<ClusterNode>;
    pipes: Map<string, WebSocket>;

    constructor(_id: string) {
        super(_id);
        this.nodes = new Array;
        this.pipes = new Map;

        var self = this;
        setInterval(() => {
            var now = Date.now();
            for (var i = 0; i < self.nodes.length; i++) {
                var n = self.nodes[i];
                if (now - n.lastRespondTime > 30 * 1000) {
                    self.nodes[i] = null;
                }
            }
            self.nodes = self.nodes.filter(n => n);
        }, HEALTH_CHECK_INTERVAL);

    }
    register(node: ClusterNode) {
        var exist = this.nodes.filter(n => n.id === node.id);
        if (exist.length === 0) {
            node.lastRespondTime = Date.now();
            this.nodes.push(node);
        } else {
            exist[0].lastRespondTime = Date.now();
        }

        if (this.pipes.has(node.id)) {
            this.pipes.get(node.id).send(JSON.stringify({ type: 'handshake', data: node }));
        }
    }

    connect(nodeId: string, websocket: WebSocket) {
        this.pipes.set(nodeId, websocket);
    }

    bench(session: BenchSession) {
        session.concurrency.forEach(conc => {
            session.scenes.forEach(scene => {
                var atom = new BenchAtom(conc, session, scene);
                this.start(atom);
            })
        })
    }

    async start(atom: BenchAtom) {
        var atoms = [];
        this.nodes.forEach(n => {
            atoms.push(new Promise((resolve, reject) => {
                utils.postJSON("http://" + n.id + "/dispatch-bench", atom)
                    .then(json => {
                        console.log(json);
                        resolve({
                            nodeId: n.id,
                            data: json
                        });
                    });
            }));
        });
        var res = await Promise.all(atoms);
        return res;
    }

    async stop(sessionId: string) {
        var atoms = [];
        this.nodes.forEach(n => {
            atoms.push(new Promise((resolve, reject) => {
                utils.postJSON("http://" + n.id + "/kill-bench", {})
                    .then(json => {
                        console.log(json);
                        resolve({
                            nodeId: n.id,
                            data: json
                        });
                    });
            }));
        });
        var res = await Promise.all(atoms);
        return res;
    }
}


export class ClusterNode extends Component {
    lastRespondTime: number;
    commander: Commander;
    shellOutput: Array<string>;
    availableBackends: Array<BenchBackend>;
    constructor(_id: string) {
        super(_id);

        this.availableBackends = [new ApacheBench(), new JMeterBench()];
        this.shellOutput = [];

        var self = this;
        setInterval(() => {
            if (self.commander) {
                console.log('pong');
                utils.postJSON("http://" + self.commander.id + "/pong", self);
            }
        }, HEALTH_CHECK_INTERVAL);
    }
    registerTo(commander: Commander) {
        this.commander = commander;
        console.log('register');
        utils.postJSON("http://" + commander.id + "/register", this)
            .then(json => {
                console.log(json);
            });
    }


    bench(atom: BenchAtom): Promise<BenchReport> {
        console.log(atom);
        return new Promise((resolve, reject) => {
            var r = atom.start();
            resolve(new BenchReport(this.id, r));
        });
    }

    stop(sessionId: string): Promise<BenchReport> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(new BenchReport(this.id, "ok"));
            }, 1000);
        });
    }
}
