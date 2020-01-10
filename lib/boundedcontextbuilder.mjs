/**
 * Fluent builder for bounded contexts
 *
 * @author: Bernhard Lukassen
 */
import BoundedContext   from './boundedcontext.mjs';
import * as Types       from '/evolux.schema/lib/types/types.mjs';
import { tservices }     from "/evolux.universe";

export default class BoundedContextBuilder {

    constructor() {
        this._steps     = [];
        this._actors    = {};
    }

    use(name) {
        this._name = name;
        return this;
    }

    addSchema(schema) {
        this._steps.push({ schema });
        return this;
    }

    addDefaultCommands(...commands) {
        const item = this._last();
        if (item && item.schema) {
            item.commands = commands ? commands : ['create', 'modify', 'drop'];
        }
        return this;
    }

    publish(collectionname) {
        const item = this._last();
        if (item && item.schema) {
            item.collection = collectionname;
        }
        return this;
    }

    // the order of 'addActor' is important; stops calling actors if one fails!
    addActor(commandname, actor) {
        let reg = this._actors[commandname];
        if (!reg) {
            reg = [];
            this._actors[commandname] = reg;
        }
        reg.push(actor);
        return this;
    }

    release(releasetag) {
        this._release = releasetag;
    }

    /*
     * build and register the context elements
     */

    build() {
        let bc = tservices().tru4d.context(this._name);
        if (!bc) {
            bc = new BoundedContext({ name: this._name });
            tservices().tru4d.putContext(this._name, bc);
        }

    }

    static get types() {
        return Types;
    }

    /*
     * private
     */

    _last() {
        return this._steps.length > 0 ? this._steps[this._steps.length-1] : null;
    }
}
