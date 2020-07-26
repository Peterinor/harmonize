import * as WebSocket from 'ws';
import * as utils from './Utils';
import { ChildProcessWithoutNullStreams } from 'child_process';

import { BenchBackend, ApacheBench, JMeterBench, BenchBackendFactory } from './BenchBackend';
import { BenchSession, BenchScene } from '../benching/Benching';

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

    start(): ChildProcessWithoutNullStreams {
        if (this._cmd) {
            throw "running...";
        }
        var args = BenchBackendFactory.new(this.session.backend).shellCmd(this.conc, this.session, this.scene);
        var cmd = args.shift();
        this._cmd = utils.exec(cmd, args);
        return this._cmd;
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
        console.log('connected', nodeId, this.pipes.keys());
    }

    connectCluster(nodeId: string, websocket: WebSocket) {
        this.nodes.forEach(n => {
            if (n.id == nodeId) {
                n.pipe = websocket;
                websocket.onmessage = evt => {
                    if (this.pipes.get(n.id)) {
                        this.pipes.get(n.id).send(evt.data);
                    }
                }
            }

        });
        console.log('cluster connected', nodeId, this.nodes.map(n => n.id));
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
    pipe: globalThis.WebSocket | WebSocket;
    constructor(_id: string) {
        super(_id);

        this.availableBackends = [new ApacheBench(), new JMeterBench()];
        this.shellOutput = [];

        var self = this;
        setInterval(() => {
            if (self.commander) {
                utils.postJSON("http://" + self.commander.id + "/pong", self)
                    .then(json => {
                        this.connectToCommander();
                    });
            }
        }, HEALTH_CHECK_INTERVAL);
    }
    registerTo(commander: Commander) {
        this.commander = commander;
        utils.postJSON("http://" + commander.id + "/register", this)
            .then(json => {
                this.connectToCommander();
            });
    }

    private connectToCommander() {
        if (!this.pipe || this.pipe.readyState != WebSocket.OPEN) {
            const ws = new WebSocket('ws://' + this.commander.id + '/websocket/cluster?nodeId=' + this.id);
            this.pipe = ws;
            ws.onmessage = evt => {
                console.log(evt.data);
            }
        }

    }


    bench(atom: BenchAtom): Promise<BenchReport> {
        console.log("start benching:", atom);
        return new Promise((resolve, reject) => {
            var r = atom.start();
            r.on('data', data => {
                this.pipe.send(JSON.stringify({ type: 'node-report', data: data }));
                // console.log(data);
            }).on('exit', (c, s) => {
                if (c == 0) {
                    resolve(new BenchReport(this.id, 'ok'));
                } else {
                    reject('error on exit, code:' + c);
                }
            })
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
