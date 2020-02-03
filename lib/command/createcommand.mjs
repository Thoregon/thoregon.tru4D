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

import ModifyCommand            from "./command.mjs";
import { ErrNoId }              from '../errors.mjs';

export default class CreateCommand extends ModifyCommand {

    constructor() {
        super(...arguments);
    }

    /**
     * just mark as new,
     * don't add a unique id, this must be supplied by the persistence layer
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

}
