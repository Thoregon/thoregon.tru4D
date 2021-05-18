/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import Schema from "./schema.mjs";

export default class LogicalSchema extends Schema {

    constructor(...args) {
        super(...args);
        this.commands = {};
        this.queries  = {};
        this.events   = {};
        this.relays   = {};
    }

}
