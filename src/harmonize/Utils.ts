import * as OS from 'os';

import * as fetch from 'node-fetch';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

export function getLocalIPAddress() {
    var interfaces = OS.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}


export function post(url: String, body: any) {

    return fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36"
        },
        body: JSON.stringify(body)
    });
}

export function postJSON(url: String, body: any) {
    return post(url, body).then(res => {
        return res.json();
    });
}

export function get(url: String, query: any) {

    return fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36"
        },
        query: query
    });
}
export function getJSON(url: String, query: any) {
    return get(url, query).then(res => {
        return res.json();
    });
}

export function exec(cmd: string, args?: string | Array<string>): ChildProcessWithoutNullStreams {
    if (!args) {
        args = [];
    }
    if (typeof (args) === 'string') {
        args = args.split(' ');
    }
    var cmdHook = spawn(cmd, args);

    //  
    cmdHook.stdout.on('data', function (data) {
        cmdHook.emit('data', data.toString());
    });

    // error
    cmdHook.stderr.on('data', function (data) {
        cmdHook.emit('data', data.toString());
    });

    return cmdHook;
}