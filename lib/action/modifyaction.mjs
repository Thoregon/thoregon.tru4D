/**
 * Modifies an Entity
 *
 * Uses the Matter API to persist the entity in a collection or a map
 *
 * @author: Bernhard Lukassen
 */

import Action           from "./action.mjs";
import { myuniverse }   from "/evolux.universe";

export default class ModifyAction extends Action {

    exec(command, payload, control) {
        const u         = myuniverse();
        const matter    = u.matter;
        const db        = matter.root;   //db root to query sub objects

        let id = command.id;
        // get the properties to modify w/o the 'gun' key of the payload
        let { _, ...properties } = payload;
        let obj = db[id];
        Object.assign(obj, properties);
    }
}
