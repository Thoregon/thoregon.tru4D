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
    }

    use(name) {
        this._name = name;
        return this;
    }

    addSchema(schema) {
        this._steps.push({ schema });
        return this;
    }

    addAggregate(aggregate) {
        this._steps.push({ aggregate });
        return this;
    }

    /**
     *
     * @return {BoundedContextBuilder}
     */
    addDefaults() {
        const item = this._last();
        if (item && item.schema) item.defaults = true;
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
        const item = this._last();

    }

    // the order of 'addAction' is important; stops calling actions if one fails!
    addAction(commandname, action) {
        const item = this._last();
        let reg = item.actions[commandname];
        if (!reg) {
            reg = [];
            this.actions[commandname] = reg;
        }
        reg.push(action);
        return this;
    }

    release(releasetag) {
        this._release = releasetag;
    }

    /*
     * build and register the context elements
     */

    build() {
        let tru4d   = tservices().tru4d;
        let bc      = tru4d.context(this._name);
        if (!bc) {
            bc = new BoundedContext({ name: this._name });
            tru4d.useContext(this._name, bc);
        }

        this._steps.forEach(item => {
            if (item.schema) this._buildSchemaItems(item, bc, tru4d);
        });

        return bc;
    }

    _buildSchemaItems(item, bc, tru4d) {
        {
            item.commands   = ['create', 'modify', 'drop'];
            item.actions    = ['create', 'modify', 'drop'];
            item.events     =   ['created', 'modified', 'dropped'];
        }
        if (item.collection) {
            tru4d.useCollection(item.collection, bc);
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
