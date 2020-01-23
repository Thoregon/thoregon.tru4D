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

    /**
     *
     * @return {BoundedContextBuilder}
     */
    addDefaultCommands() {
        const item = this._last();
        if (item && item.schema) {
            item.commands = ['create', 'modify', 'drop'];
            item.events =   ['created', 'modified', 'droped'];
        }
        return this;
    }

    collecion(collectionname) {
        const item = this._last();
        if (item && item.schema) {
            item.collection = collectionname;
        }
        return this;
    }

    addCommand(command, ...actors) {

    }

    // the order of 'addActor' is important; stops calling actors if one fails!
    addActor(commandname, actor) {
        const item = this._last();
        let reg = item.actors[commandname];
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
