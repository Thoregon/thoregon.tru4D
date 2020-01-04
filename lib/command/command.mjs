/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }              from "/evolux.universe";

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
        await doAsync();        // just push to processing queue

        // select the event store

    }

    /*
     * implement by subclasses
     */

    /**
     * will be called before the actual commit to the event store is done.
     * implment what is neccessary, throw errors if commit cannot be performed
     */
    prepare() {
    }

    /**
     * answer a schema if defined
     * @return {Schema} schema or null
     */
    async schema() {
        return null;
    }

}
