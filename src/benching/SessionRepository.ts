import { BenchSession } from './Benching'

export class SessionRepository {
    private sessionList: Array<BenchSession>;

    constructor() {
        this.sessionList = [];
    }

    addOrUpdate(session: BenchSession) {
        this.sessionList.push(session);
    }

    listAll(): Array<BenchSession> {
        return [].concat(this.sessionList);
    }

    get(id: string) {
        var s = this.sessionList.filter(s => s.id === id);
        if (s.length > 0) {
            return s;
        } else {
            return null;
        }
    }

    delete(id: string) {
    }

}