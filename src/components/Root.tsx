import * as React from "react";
import { BenchSession } from "../benching/Benching";
import { Commander } from "../harmonize/Component";
import { Session } from "./Session";
import { ClusterInfo } from "./ClusterInfo";

import * as utils from "../harmonize/Utils"
import * as serialize from 'form-serialize';

export interface RootProps { cluster: Commander, session: BenchSession, sessions: Array<BenchSession> }

export class Root extends React.Component<RootProps, {}> {

    constructor(props) {
        super(props);
        this.state = {
            t: Date.now(),
            session: this.props.sessions[0]
        };
    }

    addSession() {
        var form = document.querySelector('#addSessionModal form#form-session');
        var sessionObj = serialize(form, { hash: true });
        console.log(sessionObj);

        utils.postJSON('./session', sessionObj).then((session: BenchSession) => {
            this.setState({ t: Date.now(), session: session });
        });
    }

    addVariable() {
        var form = document.querySelector('#addSessionModal form#form-variable');
        var varObj = serialize(form, { hash: true });
        this.props.session.variables[varObj.varName] = varObj.varValue;
        console.log(varObj);
        this.setState({ t: Date.now() });
    }

    loadSession(id: string) {
        console.log('load session', id);
        this.setState({
            t: Date.now(),
            session: this.props.sessions.filter(s => s.id === id)[0]
        });
    }

    render() {

        var vaiables = [];
        Object.keys(this.props.session.variables).forEach((k) => {
            vaiables.push(<span className="badge badge-pill badge-secondary" style={{ marginRight: '0.5em' }} key={k}>{k} = {this.props.session.variables[k]}</span>);
        });

        var loadSession = this.loadSession.bind(this);

        var addSession = this.addSession.bind(this);
        var addVariable = this.addVariable.bind(this);

        return (<div className="container-fluid" data-version={this.state["t"] || 0}>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <a className="navbar-brand" href="#">Harmonize</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item active">
                            <a className="nav-link" href="#" data-toggle="modal" data-target="#addSessionModal">New</a>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                History Sessions
                            </a>
                            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                                {this.props.sessions.map((s, i) => {
                                    return (<a className="dropdown-item" key={i} href="#" onClick={e => loadSession(s.id)}>{s.id}</a>)
                                })}
                            </div>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">Scene</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" data-toggle="modal" data-target="#clusterInfoModal">Cluster Info</a>
                        </li>
                    </ul>
                    <form className="form-inline my-2 my-lg-0">
                        <input className="form-control mr-sm-2" type="search" placeholder="Search Session"
                            aria-label="Search Session" />
                        <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                    </form>
                </div>
            </nav>
            <div className="modal fade" id="addSessionModal" role="dialog" aria-labelledby="addSessionModalLabel"
                aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addSessionModalLabel">New bench session</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form id="form-session">
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="input_session_id">Session Id</label>
                                        <input type="text" className="form-control" id="input_session_id" defaultValue="session-1" name="id" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="input_session_backend">Backend</label>
                                        <select id="input_session_backend" className="form-control" defaultValue="ab" name="backend" >
                                            <option value="ab">Apache Bench</option>
                                            <option value="1">...</option>
                                            <option value="2">...</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="border border-secondary" style={{ padding: '0 0.5rem', margin: '0.2rem 0' }}>
                                    <span
                                        style={{ position: 'relative', top: '-1rem', background: 'white', padding: '0 0.5rem' }}>
                                        Parameters</span>
                                    <div className="form-row">
                                        <div className="form-group col-md-4">
                                            <label htmlFor="input_session_concurrency">Concurrency</label>
                                            <input type="text" className="form-control" id="input_session_concurrency" defaultValue="5..100 step 5" name="concurrency" placeholder="100 | 1 5 10 | 5..100 step 5" />
                                        </div>
                                        <div className="form-group col-md-4">
                                            <label htmlFor="input_session_zoom">Zoom(每并发请求书)</label>
                                            <input type="number" className="form-control" id="input_session_zoom" defaultValue={250} name="zoom" />
                                        </div>
                                        <div className="form-group col-md-4">
                                            <label htmlFor="input_session_duration">Duration(执行时长)</label>
                                            <input type="number" className="form-control" id="input_session_duration" name="duration" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="input_session_extra_cmd_options">Extra Command Options(执行压测命令的额外参数，取决于backend和实际场景)</label>
                                        <input type="text" className="form-control" id="input_session_extra_cmd_options" name="extraCmdOptions" placeholder="-k -r -s 100" />
                                    </div>
                                </div>
                                <br />
                            </form>
                            <form id="form-variable">
                                <div className="border border-secondary" style={{ padding: '0 0.5rem', margin: '0.2rem 0' }}>
                                    <span
                                        style={{ position: 'relative', top: '-1rem', background: 'white', padding: '0 0.5rem' }}>
                                        Variables</span>
                                    <div className="form-row">
                                        <div className="form-group col-md-9">
                                            {vaiables}
                                        </div>
                                        <div className="form-group col-md-3">
                                            <input type="text" className="form-control form-control-sm" name="varName" placeholder="variable name" />
                                            <input type="text" className="form-control form-control-sm" name="varValue" placeholder="variable value" />
                                            <button type="button" className="btn btn-primary btn-sm btn-block" onClick={addVariable}>Add</button>
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={addSession}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="jumbotron" style={{ padding: '1em 2em', marginBottom: 0, borderRadius: 0 }}>
                <h1 className="display-6">Hi, welcome to harmonize!</h1>
                <p className="lead">Harmonize is a cluster bench testing tool. <a className="" href="./README.md"
                    role="button">Learn more</a>
                </p>
            </div>
            <Session session={this.state["session"]} cluster={this.props.cluster} />
            <ClusterInfo cluster={this.props.cluster} />
        </div>);
    }
}