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
     * if action fails this will be called
     * implement by subclasses
     * @param command
     * @param payload
     * @param control
     * @param bc        - bounded context instance
     * @prame err       - current errors from exec of this command
     */
    async error(command, payload, control, bc, err) {}

    /**
     * if any action of the command fails this will be called
     * implement by subclasses
     * @param command
     * @param payload
     * @param control
     * @param bc        - bounded context instance
     * @prame errors    - all errors from exec of this command
     */
    async rollback(command, payload, control, bc, errors) {}

    errormessages(errors) {
        return Array.isArray(errors) ? errors.map(err => err.message).join('\n') : '*unknown errors*';
    }

    withResult() {
        return false;
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
