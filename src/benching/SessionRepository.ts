import { BenchSession } from './Benching'

export class SessionRepository {
    private sessionMap: Map<string, BenchSession>;

    constructor() {
        this.sessionMap = new Map();
    }

    addOrUpdate(session: BenchSession) {
        this.sessionMap.set(session.id, session);
    }

    listAll(): Array<BenchSession> {
        var r = [];
        for (const s of this.sessionMap.values()) {
            r.push(s);
        }
        return r;
    }

    get(id: string) {
        return this.sessionMap.get(id);
    }

    delete(id: string) {
        return this.sessionMap.delete(id);
    }

}