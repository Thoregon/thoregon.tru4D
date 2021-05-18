/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import Schema from "./schema.mjs";

export default class ViewSchema extends Schema {

    constructor() {
        super();
        this.elements = {};
        this.actions  = {};
        this.plugins  = {};
    }

}
