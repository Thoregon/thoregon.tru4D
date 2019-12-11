/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Command                  from "./command.mjs";
import { ErrNoId }              from '../errors.mjs';

export default class ModifyCommand extends Command {

    /**
     * properties must contain the '_id'
     * @param properties
     */
    constructor(properties) {
        super();
        this._props = Object.assign({}, properties);
    }

    async commit() {
        if (!this._props[_id]) throw ErrNoId(JSON.stringify(this._props));
        return await super.commit();
    }

}
