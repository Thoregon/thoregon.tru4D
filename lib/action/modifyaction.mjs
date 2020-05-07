/**
 * Modifies an Entity
 *
 * Uses the Matter API to persist the entity in a collection or a map
 *
 * @author: Bernhard Lukassen
 */

import Action               from "./action.mjs";
import { myuniverse }       from "/evolux.universe";
import { className }        from "/evolux.util";

export default class ModifyAction extends Action {

    async exec(command, payload, control, bc) {
        const u         = myuniverse();
        const matter    = u.matter;
        const db        = matter.root;   //db root to query sub objects

        let { _, ...properties } = payload;

        let ref = {};
        if (command.id) ref.id = command.id;
        if (command.key) ref.pk = command.key;
        if (ref.id) {
            // modify object directly
            let obj = db[id];
            Object.assign(obj, properties);
        } else {
            // now modify it from the collection with pk
            const collection = await bc.getCollection(control.collection.collection);
            if (collection) await collection.mod(payload, ref);
        }
    }
}
