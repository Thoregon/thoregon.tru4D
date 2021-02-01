/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class BCNode {

    constructor({
                    type,
                    path
                } = {}) {
        Object.assign(this, { type, path });
    }

    static from(nodeobj) {
        return new this({ type: nodeobj.type, path: nodeobj.path });
    }

}
