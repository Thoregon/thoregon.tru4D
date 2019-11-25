/**
 * Create Command applies a unique 'id' on commit.
 * The id can also be passed at creation, but be careful
 * it has to be unique in the whole universe.
 *
 * Don't apply a unique id at 'commit'. The id should be
 * applied by the persistence layer with transaction successful.
 *
 * @author: Bernhard Lukassen
 */

import { className }            from "/evolux.util";

import Command                  from "./command.mjs";
import { ErrNotImplemented }    from '../errors.mjs';

export default class CreateCommand extends Command {

    constructor({
                    id
                } = {}) {
        super();
        Object.assign(this, { id });
    }

    /**
     * Add a unique id
     */
    async commit() {
        if (!this._isNew) this._isNew = true;
        return await super.commit();
    }

    /*
     * implement by subclasses
     */


    /**
     * answer a constructor if neccessary.
     * if undefined just plane javascript objects will be built.
     *
     * @return {class} constructor or null
     */
    constructs() {
        return null;
    }

    /**
     * answer a schema if defined
     * @return {Schema} schema or null
     */
    async schema() {
        return null;
    }

}
