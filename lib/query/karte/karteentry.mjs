/**
 *
 *
 * @author: Bernhard Lukassen
 */
import BCNode from "./bcnode.mjs";

export default class KarteEntry {

    constructor({
                    name,
                    nodes
                } = {}) {
        Object.assign(this, { name, nodes });
    }

    static from(entryobj) {
        return new this({ type: entryobj.name, path: entryobj.nodes.map(nodeobj => BCNode.from(nodeobj)) });
    }

}
