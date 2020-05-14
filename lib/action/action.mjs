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
     * @param command   - command data
     * @param payload   - data
     * @param control   - control data
     * @param bc        - bounded context instance
     * @prame errors    - errors from prevoius actions, decide to proceed or do some repair
     */
    async exec(command, payload, control, bc, errors) {
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
