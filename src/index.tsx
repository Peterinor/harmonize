import * as React from "react";
import * as ReactDOM from "react-dom";
import * as utils from "./harmonize/Utils"

import { Commander } from "./harmonize/Component";
import { Root } from "./components/Root";
import { BenchSession, BenchScene } from "./harmonize/Benching";

globalThis.bench = function xxx() {
    utils.postJSON('./bench', {}).then((session: BenchSession) => {
        console.log(session);
    });
}

utils.postJSON('./cluster', {}).then((commander: Commander) => {

    commander.nodes.forEach(n => {
        var ws = new WebSocket("ws://" + window.location.host + "/websocket?nodeId=" + n.id);
        ws.addEventListener('handshake', (evt: MessageEvent) => {
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
                n.shellOutput.push(evt.data);
                console.log(evt);
            }
        }
    });

    var session = new BenchSession();
    session.id = "Offer_2node_gzip";
    session.backend = "Apache Bench";
    session.parse("5..50 step 10");
    // session.durationn = 1000;
    session.zoom = 250;
    session.variables.set('channel', 'APP');
    session.variables.set('server', 'ecip-offer-api');

    var scene1 = new BenchScene("offer", "GET", "/offer");
    scene1.body = JSON.stringify(scene1);
    session.scenes.push(scene1);
    session.scenes.push(new BenchScene("ancillary-offer", "GET", "/ancillayoffer"))

    session.cluster = commander;

    var sessions = [session];

    ReactDOM.render(
        <Root cluster={commander} session={session} sessions={sessions} />,
        document.getElementById("root")
    );
});
