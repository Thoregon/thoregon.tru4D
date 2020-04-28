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

    async exec(command, payload, control, bc) {
        if (this.aborted) return;

        // now rmove it from the collection
        const collection = await bc.getCollection(control.collection.collection);
        await collection.del(command.id, command.key);
    }
}
