import * as React from "react";
import * as ReactDOM from "react-dom";
import * as utils from "./harmonize/Utils"

import { Commander } from "./harmonize/Component";
import { Root } from "./components/Root";
import { BenchSession, BenchScene } from "./benching/Benching";
import commander = require("commander");

globalThis.bench = function xxx() {
    var bs = new BenchSession();
    bs.parse('5');
    var sc1 = new BenchScene("sc1", "GET", "http://localhost/");
    bs.scenes.push(sc1);
    utils.postJSON('./bench', bs).then((session: BenchSession) => {
        console.log(session);
    });
}

Promise.all([utils.postJSON('/cluster', {}), utils.getJSON('/session/list', {})]).then(res => {
    //[commander, sessions]
    console.log(res);
});

utils.postJSON('/cluster', {}).then((commander: Commander) => {

    function connect(nodeId) {
        var ws = new WebSocket("ws://" + window.location.host + "/websocket?nodeId=" + nodeId);
        ws.addEventListener('handshake', (evt: MessageEvent) => {
            // console.log(evt.data);
        });

        ws.addEventListener('node-report', (evt: MessageEvent) => {
            console.log(evt.data);
        });

        ws.onmessage = evt => {
            try {
                var q = JSON.parse(evt.data);
                if (q.type) {
                    var evtx = new MessageEvent(q.type, { data: q.data });
                    ws.dispatchEvent(evtx);
                }
            } catch (ex) {
                console.log(evt);
            }
        }

        return ws;
    }

    commander.nodes.forEach(n => {
        n.pipe = connect(n.id);
    });

    setInterval(() => {
        commander.nodes.forEach(n => {
            if (!n.pipe || n.pipe.readyState != WebSocket.OPEN) {
                n.pipe = connect(n.id);
            }
        });
    }, 5000)

    var session = new BenchSession();
    session.id = "Offer_2node_gzip";
    session.backend = "Apache Bench";
    session.parse("5..50 step 10");
    // session.durationn = 1000;
    session.zoom = 250;
    session.variables['channel'] = 'APP';
    session.variables['server'] = 'ecip-offer-api';

    var scene1 = new BenchScene("offer", "GET", "/offer");
    scene1.body = JSON.stringify(scene1);
    session.scenes.push(scene1);
    session.scenes.push(new BenchScene("ancillary-offer", "GET", "/ancillayoffer"))

    session.cluster = commander;

    var sessions = [session];

    utils.getJSON('/session/list', {}).then((sessions: Array<BenchSession>) => {
        ReactDOM.render(
            <Root cluster={commander} session={session} sessions={sessions} />,
            document.getElementById("root")
        );
    });
});
