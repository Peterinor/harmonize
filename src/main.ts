import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as KoaStatic from 'koa-static';
import * as bodyParser from 'koa-bodyparser';

import * as websockify from 'koa-websocket';
import * as WebSocket from 'ws';

import * as program from 'commander';

import * as utils from './harmonize/Utils'
import * as Components from './harmonize/Component';
import { BenchSession, BenchScene } from './harmonize/Benching';

program
    .version('0.1.0')
    .option('-r, --role [value]', 'role of the node, node or commander', 'node')
    .option('-p, --port [value]', 'TCP port to listen on', '3010')
    .option('-s, --commander [value]', 'commander server, ip:port', 'localhost')
    .parse(process.argv);


const ROLE = program.role;
const PORT = program.port;
const IP = utils.getLocalIPAddress();
const ID = IP + ":" + PORT;

const app = websockify(new Koa());
app.use(KoaStatic('.'));
app.use(bodyParser());

const router = new Router();
router.get('/hw', (ctx, next) => {
    ctx.body = 'Hello World!';
});

if (ROLE === "commander") {

    // Commander
    const commander = new Components.Commander(ID);
    router.post('/register', (ctx, next) => {
        commander.register(new Components.ClusterNode(ctx.request.body.id));
        ctx.body = JSON.stringify(commander);;
    });

    router.post('/pong', (ctx, next) => {
        commander.register(new Components.ClusterNode(ctx.request.body.id));
        ctx.body = JSON.stringify(commander);;
    });

    router.post('/report-status', (ctx, next) => {

    });

    router.post('/cluster', (ctx, next) => {
        ctx.body = JSON.stringify(commander);
    });

    router.post('/bench', (ctx, next) => {

        var bs = new BenchSession();
        bs.parse('5');
        var sc1 = new BenchScene("sc1", "GET", "http://localhost/");
        bs.scenes.push(sc1);
        commander.bench(bs);
        ctx.body = JSON.stringify(bs);
    });

    app.ws.use((ctx, next) => {
        if (ctx.path === '/websocket') {
            if (ctx.query.nodeId) {
                ctx.websocket.send(JSON.stringify({ msg: 'Hello ' + ctx.query.nodeId }));
                commander.connect(ctx.query.nodeId, ctx.websocket);
            }
        }
        if (ctx.path === '/websocket/cluster') {
            if (ctx.query.nodeId) {
                ctx.websocket.send(JSON.stringify({ msg: 'Hello cluster' + ctx.query.nodeId }));
                commander.connectCluster(ctx.query.nodeId, ctx.websocket);
            }
        }
    });

} else {

    if (!program.commander) {
        throw "commander server must be provided for a node";
    }

    // Node
    const node = new Components.ClusterNode(ID);
    router.post('/ping', (ctx, next) => {
        // todo
    });

    router.post('/dispatch-bench', async (ctx, next) => {
        var atom = new Components.BenchAtom(0, null, null);
        Object.assign(atom, ctx.request.body);
        var br = await node.bench(atom);
        ctx.body = JSON.stringify({ node: node, status: br });
    });

    router.post('/pull-status', (ctx, next) => {
        console.log(ctx.request.body);
        ctx.body = JSON.stringify(node);
    });

    router.post('/kill-bench', async (ctx, next) => {
        var sessionId = ctx.request.query.sessionId;
        var br = await node.stop(sessionId);
        ctx.body = JSON.stringify({ node: node, status: br });
    });

    var commander = new Components.Commander(program.commander);
    node.registerTo(commander);
}


app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(PORT, () => {
    console.log('koa is listening in ' + PORT);
});


