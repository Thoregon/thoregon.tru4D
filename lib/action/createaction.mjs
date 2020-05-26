/**
 * Creates an Entity
 *
 * Uses the Matter API to persist the entity in a collection or a map
 *
 * @author: Bernhard Lukassen
 */

import Action           from "./action.mjs";

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
        let { _, ...obj } = payload;

        let result;

        if (this.parent) {
            let parent      = this.parent;
            let property    = parent.property;
            let ref         = this.db[parent.parent['#']];
            // let soul        = universe.Gun.soul(ref);
            switch (parent.type) {
                case 'collection':
                    // get collection and add the payload
                    let collection = await this.collectionFor(ref, property);
                    result = await collection.add(obj);
                    break;
                default:
                    // just get the object and set the payload to the property
                    // let ref = this.db[soul][property];
                    Object.assign(ref, payload);
                    result = ref;
                    break;
            }
        } else {
            const collection = await bc.getCollection(control.collection.collection);
            result = await collection.add(obj);
        }

        return result;
    }

    /**
     * a create action typically should return a value
     * @return {boolean}
     */
    withResult() {
        return true;
    }

}
