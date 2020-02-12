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
import CreateAction         from "./action/createaction.mjs";
import ModifyAction         from "./action/modifyaction.mjs";
import DeleteAction         from "./action/deleteaction.mjs";
import DomainEvent          from "./event/domainevent.mjs";

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
    addDefaults(responsibility) {
        const item = this._last();
        if (item && item.schema) {
            item.defaults = true;
            if (responsibility) {
                item.responsibility = responsibility;
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
    addCommand(command, responsibility) {
        const item = this._last();
        let reg = item.commands[command];
        if (!reg) {
            reg = {};
            if (responsibility) {
                reg.responsibility = responsibility;
            }
            item.commands[command] = reg;
        }
        return this;
    }

    defineAggregate(root, entities, commands) {

        return this;
    }

    /**
     * Register an action for a command. There can be multiple actions.
     * the order of 'addAction' is important; stops calling actions if one fails!
     * @param command   ... name of the command (with namespace)
     * @param action
     * @return {BoundedContextBuilder}
     */
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
            await tru4d.useCollection(item.collection, ctxid);
        }

        if (item.defaults) {
            /*
             * build basic setup information
             */
            let schema = item.schema;
            let properties  = {
                defaults: schema.jsProperties
            };
            let consts = {
                ctx:        ctxid,
                schema:     schema,
                collection: item.collection
            };
            let methods     = {
                supplementControl(ctrl) {
                    Object.assign(ctrl, {
                        ctx: this.constructor.ctx,
                        schema: this.constructor.schema.ref,
                        collection: this.constructor.collection,
                    });
                }
            };
            if (item.responsibility) consts.responsibility = item.responsibility;

            /*
             * build default commands. For each kind a class as command definition is created
             */

            // build the create command
            let cmdcreateid = `Create${schema.name}Command`;
            consts.name     = cmdcreateid;
            consts.id       = `${ctxid}.${cmdcreateid}`;
            consts.event    = `Created${schema.name}Event`;
            let command = new ClassBuilder({
                name: cmdcreateid,
                constructor(properties) {
                    this.properties = properties;
                },
                extend: CreateCommand,
                properties,
                consts,
                methods
            }).build();
            tru4d.useCommand(ctxid, cmdcreateid, command);

            // build the modify command
            let cmdmodifyid = `Modify${schema.name}Command`;
            consts.name     = cmdmodifyid;
            consts.id       = `${ctxid}.${cmdmodifyid}`;
            consts.event    = `Modified${schema.name}Event`;
            command = new ClassBuilder({
                name: cmdmodifyid,
                constructor(obj, properties) {
                    this.properties = properties;
                    this.id = (typeof obj === 'object') ? universe.Matter.key(obj) : obj;
                },
                extend: ModifyCommand,
                properties
            }).build();
            tru4d.useCommand(ctxid, cmdmodifyid, command);

            // build the delete command (there is no really drop,
            let cmddeleteid = `Delete${schema.name}Command`;
            consts.name     = cmddeleteid;
            consts.id       = `${ctxid}.${cmddeleteid}`;
            consts.event    = `Deleted${schema.name}Event`;
            command = new ClassBuilder({
                name: cmddeleteid,
                extend: DeleteCommand,
                constructor(obj) {
                    this.id = (typeof obj === 'object') ? universe.Matter.key(obj) : obj;
                } ,
            }).build();
            tru4d.useCommand(ctxid, cmddeleteid, command);

            /*
             * build default actions. for default actions no classes are necessary
             */
            let actionid;
            let action;

            // build create action
            actionid = `Create${schema.name}Action`;
            action = new CreateAction( { commandid: cmdcreateid, collection: item.collection });
            tru4d.useAction(ctxid, actionid, action);

            // build modify action
            actionid = `Modify${schema.name}Action`;
            action = new ModifyAction( { commandid: cmdmodifyid, collection: item.collection });
            tru4d.useAction(ctxid, actionid, action);

            // build delete action
            actionid = `Delete${schema.name}Action`;
            action = new DeleteAction( { commandid: cmddeleteid, collection: item.collection });
            tru4d.useAction(ctxid, actionid, action);

            /*
             * build default events
             */
            let eventid;
            let event;

            // build created event

            // build create action
            tru4d.useEvent(ctxid, `Created${schema.name}Event`, cmdcreateid);

            // build modify action
            tru4d.useEvent(ctxid, `Modify${schema.name}Event`, cmdmodifyid);

            // build delete action
            tru4d.useEvent(ctxid, `Delete${schema.name}Event`, cmddeleteid);

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
