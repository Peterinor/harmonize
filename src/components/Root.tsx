import * as React from "react";
import { BenchSession } from "../harmonize/Benching";
import { Commander } from "../harmonize/Component";
import { Cluster } from "./Cluster";
import { Session } from "./Session";
import { ClusterInfo } from "./ClusterInfo";

export interface RootProps { cluster: Commander, session: BenchSession, sessions: Array<BenchSession> }

export class Root extends React.Component<RootProps, {}> {
    render() {

        var vaiables = [];
        this.props.session.variables.forEach((v, k) => {
            vaiables.push(<span className="badge badge-pill badge-secondary" key={k}>{k} = {v}</span>);
        });

        return (<div className="container-fluid">
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
                                    return (<a className="dropdown-item" key={i} href="#">{s.id}</a>)
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
                            <form>
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="input_session_id">Session Id</label>
                                        <input type="text" className="form-control" id="input_session_id" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="input_scene_method">Backend</label>
                                        <select id="input_scene_method" className="form-control" defaultValue="ab">
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
                                            <input type="text" className="form-control" id="input_session_concurrency" />
                                        </div>
                                        <div className="form-group col-md-4">
                                            <label htmlFor="input_session_zoom">Zoom</label>
                                            <input type="text" className="form-control" id="input_session_zoom" />
                                        </div>
                                        <div className="form-group col-md-4">
                                            <label htmlFor="input_session_duration">Duration</label>
                                            <input type="text" className="form-control" id="input_session_duration" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="input_session_extra_cmd_options">Extra Command Options</label>
                                        <input type="text" className="form-control" id="input_session_extra_cmd_options"
                                            placeholder="" />
                                    </div>
                                </div>
                                <br />
                                <div className="border border-secondary" style={{ padding: '0 0.5rem', margin: '0.2rem 0' }}>
                                    <span
                                        style={{ position: 'relative', top: '-1rem', background: 'white', padding: '0 0.5rem' }}>
                                        Variables</span>
                                    <div className="form-group">
                                        {vaiables}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Submit</button>
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
            <Session session={this.props.session} />
            <ClusterInfo cluster={this.props.cluster} />
        </div>);
    }
}