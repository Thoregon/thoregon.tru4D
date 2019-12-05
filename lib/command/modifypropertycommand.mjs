/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Command from "./command.mjs";

export default class ModifyPropertyCommand extends Command {

    constructor(properties) {
        super();
        this._properties = properties;
    }

    set(path, value) {

    }

}
