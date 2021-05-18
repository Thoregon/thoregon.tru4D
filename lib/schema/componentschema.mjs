/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import Schema from "./schema.mjs";

export default class ComponentSchema extends Schema {

    constructor(...args) {
        super(...args);
        this.schemas = {};
    }

}
