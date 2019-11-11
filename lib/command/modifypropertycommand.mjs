/**
 *
 *
 * @author: Bernhard Lukassen
 */

import Command from "./command.mjs";

export default class ModifyPropertyCommand {

    constructor({
                    id
                } = {}) {
        Object.assign(this, {id});
    }

    setProperty(path, value) {

    }

}
