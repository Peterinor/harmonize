import * as React from "react";
import { BenchSession } from "../harmonize/Benching";
import { Scene } from "./Scene"
import { Cluster } from "./Cluster";

export interface SessionProps { session: BenchSession }

export class Session extends React.Component<SessionProps, {}> {

    addScene() {
        console.log('add scene');
        this.setState({

        });
    }

    render() {
        var scenes = this.props.session.scenes.map((s, i) => {
            return <Scene key={i} scene={s} />;
        });

        var addScene = this.addScene.bind(this);
        return (<div className="border border-secondary">
            <div className="position-relative border border-secondary d-flex flex-row bd-highlight mb-3" style={{ padding: '1rem 0.2rem', margin: '1rem 0.2rem' }}>
                <span style={{ position: 'absolute', top: '-1rem', left: '0.5rem', background: 'white', padding: '0 0.5rem' }}>
                    Session: {this.props.session.id} / Scenes</span>
                <button type="button" className="btn btn-warning" data-toggle="modal" data-target="#addSceneModal"
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>Add Scene</button>
                {scenes}
            </div>
            <div className="modal fade" id="addSceneModal" role="dialog" aria-labelledby="addSceneModalLabel"
                aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addSceneModalLabel">New bench Scene</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="input_scene_name">Name</label>
                                        <input type="text" className="form-control" id="input_scene_name" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="input_scene_method">Method</label>
                                        <select id="input_scene_method" className="form-control" defaultValue="POST">
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="border border-secondary" style={{ padding: '0 0.5rem', margin: '0.2rem 0' }}>
                                    <span
                                        style={{ position: 'relative', top: '-1rem', background: 'white', padding: '0 0.5rem' }}>
                                        Parameters</span>
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                            <label htmlFor="input_scene_content_type">Content-Type</label>
                                            <input type="text" className="form-control" id="input_scene_content_type" />
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="input_scene_headers">Headers</label>
                                            <input type="text" className="form-control" id="input_scene_headers" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="input_scene_url">Url</label>
                                        <input type="text" className="form-control" id="input_scene_url" placeholder="" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="input_scene_query_body">query/body</label>
                                        <textarea className="form-control" id="input_scene_query_body"></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={addScene} >Submit</button>
                        </div>
                    </div>
                </div>
            </div>

            <Cluster cluster={this.props.session.cluster} />
        </div>);
    }
}