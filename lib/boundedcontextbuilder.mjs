/**
 * Fluent builder for bounded contexts
 *
 * @author: Bernhard Lukassen
 */

import { forEach,
         isFunction,
         ClassBuilder }     from '/evolux.util';
import BoundedContext       from './boundedcontext.mjs';
import * as Types           from '/evolux.schema/lib/types/types.mjs';
import { tservices }        from "/evolux.universe";
import { Reporter }         from "/evolux.supervise";
import CreateCommand        from "./command/createcommand.mjs";
import ModifyCommand        from "./command/modifycommand.mjs";
import DeleteCommand        from "./command/deletecommand.mjs";

export default class BoundedContextBuilder extends Reporter() {

    constructor() {
        super();
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
    addDefaults(responsibilties) {
        const item = this._last();
        if (item && item.schema) {
            item.defaults = true;
            if (responsibilties) {
                if (!Array.isArray(responsibilties)) responsibilties = [responsibilties];
                item.responsibilities = responsibilties;
            };
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

    /**
     * add a command for the bounded context
     * @param command
     * @param actions
     */
    addCommand(command, responsibilties) {
        const item = this._last();
        let reg = item.commands[command];
        if (!reg) {
            reg = {};
            if (responsibilties) {
                if (!Array.isArray(responsibilties)) responsibilties = [responsibilties];
                reg.responsibilties = responsibilties;
            }
            item.commands[command] = reg;
        }
        return this;
    }

    defineAggregate(root, entities, commands) {

        return this;
    }

    // the order of 'addAction' is important; stops calling actions if one fails!
    addAction(command, action) {
        const item = this._last();
        let cmd = item.commands[command];
        if (!cmd) {
            this.logger.error(`${this._name}, command '${command}' for action not found`);
            return this;
        }
        let reg = item.actions[command];
        if (!reg) {
            reg = [];
            this.actions[command] = reg;
        }
        reg.push(action);
        return this;
    }

    release(releasetag) {
        this._release = releasetag;
        return this;
    }

    /*
     * build and register the context elements
     */

    async build() {
        let tru4d   = tservices().tru4d;
        let bc      = tru4d.context(this._name);
        if (!bc) {
            bc = new BoundedContext({ name: this._name });
            tru4d.useContext(bc.name, bc);
        }

        await forEach(this._steps, async item => {
            if (item.schema) await this._buildSchemaItems(item, bc, tru4d);
        });

        return bc;
    }

    /*
        item.commands   = ['create', 'modify', 'drop'];
        item.actions    = ['create', 'modify', 'drop'];
        item.events     = ['created', 'modified', 'dropped'];
     */
    async _buildSchemaItems(item, bc, tru4d) {
        const ctxid = bc.name;

        if (item.collection) {
            await tru4d.useCollection(item.collection, bc.name);
        }

        if (item.defaults) {
            let schema = item.schema;
            let properties  = {
                properties: schema.jsProperties
            };
            let consts = {
                _ctx:       ctxid,
                _schema:    schema
            };
            let methods     = {};
            if (item.responsibilties) properties['_responsibilties'] = item.responsibilties;
            let cmdid = `Create${schema.name}Command`;
            let command = new ClassBuilder({
                name: cmdid,
                constructor(properties) {
                    Object.assign(this.properties, properties);
                } ,
                extend: CreateCommand,
                properties,
                consts,
                methods
            }).build();
            tru4d.useCommand(ctxid, cmdid, command);

            cmdid = `Modify${schema.name}Command`;
            command = new ClassBuilder({
                name: cmdid,
                constructor(properties) {
                    Object.assign(this.properties, properties);
                } ,
                extend: ModifyCommand,
                properties
            }).build();
            tru4d.useCommand(ctxid, cmdid, command);

            cmdid = `Drop${schema.name}Command`;
            command = new ClassBuilder({
                name: cmdid,
                extend: DeleteCommand
            }).build();
            tru4d.useCommand(ctxid, cmdid, command);




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
