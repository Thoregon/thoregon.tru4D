/**
 * An Action will be triggered from an Event in the EventStream
 *
 * @author: Bernhard Lukassen
 */

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

    /**
     * if a command processes async tasks, check to stop processing
     */
    abort() {
       this.aborted = true;
    }

}
