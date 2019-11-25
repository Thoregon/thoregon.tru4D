/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { ErrNotImplemented }    from '../errors.mjs';
import { className }            from "/evolux.util";

export default class Command {

    constructor({
                    id
                } = {}) {
        Object.assign(this, {id});
    }

    /**
     *
     * @return {Promise<void>}
     */
    async commit() {
        // todo: 'store' the command in the event store
    }

    /*
     * implement by subclasses
     */

    /**
     *
     */
    get actor() {
        throw ErrNotImplemented(`${className(this)}.actor`);
    }

}
