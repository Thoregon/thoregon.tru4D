/**
 * Creates an Entity
 *
 * Uses the Matter API to persist the entity in a collection or a map
 *
 * @author: Bernhard Lukassen
 */

import Action           from "./action.mjs";
import { myuniverse }   from "/evolux.universe";

export default class CreateAction extends Action {

    constructor({
                    commandid,
                    collection
                } = {}) {
        super({ commandid });
        Object.assign(this, { collection });
    }

    async exec(command, payload, control, bc) {
        if (this.aborted) return;

        const collection = await bc.getCollection(control.collection.collection);
        let { _, ...obj } = payload;
        let key = await collection.add(obj);

        return key ? { id : key } : undefined;
    }
}
