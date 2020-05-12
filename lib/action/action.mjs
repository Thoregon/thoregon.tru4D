/**
 * An Action will be triggered from an Event in the EventStream
 *
 * @author: Bernhard Lukassen
 */

import Collection from "../collection/collection.mjs";

export default class Action {

    constructor({
                    commandid,
                } = {}) {
        Object.assign(this, { commandid });
    }

    /**
     * Implement by subclasses. Don't throw, does nothing
     * @param commanddata
     */
    async exec(command, payload, control) {
        // nop by default
        universe.logger.info(command, payload, control);
    }

    /**
     * if one action fails this will be called
     * @param command
     * @param payload
     * @param control
     */
    async rollback(command, payload, control) {

    }

    /*
     * child entities
     */

    for(parent) {
        this.parent = parent;
        return this;
    }

    async collectionFor(obj, property) {
        return await Collection.from(obj, property);
    }

    /**
     * if a command processes async tasks, check to stop processing
     */
    abort() {
       this.aborted = true;
    }

    get db() {
        return universe.matter.root;
    }
}
