/**
 * Fluent builder for bounded contexts
 *
 * @author: Bernhard Lukassen
 */
import BoundedContext   from './boundedcontext.mjs';
import * as Types       from '/evolux.schema/lib/types/types.mjs';
import { myevolux }     from "/evolux.universe";

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

    collection(collectionname) {
        const item = this._last();
        if (item && item.schema) {
            item.collection = collectionname;
        }
        return this;
    }

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
        let bc = myevolux().tru4d.contexts.get(this._name);
        if (!bc) {
            bc = new BoundedContext({ name: this._name });
            myevolux().tru4d.contexts.put(this._name, bc);
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
