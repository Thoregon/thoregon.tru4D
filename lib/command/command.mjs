/**
 * Commands will be stored in an event stream.
 * Uses the Matter API for persistence
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }              from "/evolux.universe";

const cmdstatus = {
    created:    'created',
    pending:    'pending',
    done:       'done'
};

export default class Command {

    constructor({
                    _id
                } = {}) {
        Object.assign(this._properties || {}, { _id });
        this._status = cmdstatus.created;
    }

    get status() {
        return this._status;
    }

    get isPending() {
        return this._status === cmdstatus.pending;
    }

    get isDone() {
        return this._status === cmdstatus.done;
    }

    /**
     * execute (commit) the command
     * @return {Promise<void>}
     */
    async commit() {
        // todo: 'store' the command in the event store
        await doAsync();        // just push to processing queue

        // select the event store, defined by the bounded context, but can be overridden

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
