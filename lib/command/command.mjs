/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { ErrNotImplemented }    from '../errors.mjs';

export default class Command {

    constructor({
                    _id
                } = {}) {
        Object.assign(this._properties || {}, { _id });
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
     * @private
     */
    _commit() {

    }

}
