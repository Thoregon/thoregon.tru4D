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

        let ref = {};
        if (command.id) ref.id = command.id;
        if (command.key) ref.pk = command.key;
        // now remove it from the collection
        const collection = await bc.getCollection(control.collection.collection);
        await collection.del(ref);
    }
}
