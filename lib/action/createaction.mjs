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

    exec(command, payload, control) {
        const u         = myuniverse();
        const matter    = u.matter;
        const db        = matter.root;   //db root to query sub objects
        // clone object w/o the key belonging to the command param

        let { _, ...obj } = payload;
        let collection  = matter.path(control.collection);
        // obj = u.Matter.asNode(obj);
        collection.add(obj);
        // return obj;
    }
}
