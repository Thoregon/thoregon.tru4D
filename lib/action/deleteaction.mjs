/**
 * Deletes an Entity
 *
 * Uses the Matter API to persist the entity in a collection or a map
 *
 * @author: Bernhard Lukassen
 */

import Action           from "./action.mjs";
import { myuniverse }   from "/evolux.universe";

const TDEL = 't͛del';

export default class DeleteAction extends Action {

    exec(command, payload, control) {
        const u         = myuniverse();
        const matter    = u.matter;
        const db        = matter.root;   //db root to query sub objects

        // get the properties to modify w/o the key of the command param
        let id = command.id;
        let obj = db[id];

        obj[TDEL] = true;
    }
}
