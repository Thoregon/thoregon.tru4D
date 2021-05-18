/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import Schema from "./schema.mjs";

export default class EntitySchema extends Schema {

    constructor(...args) {
        super(...args);
        this.attributes = {};
        this.methods    = {};
    }

}
