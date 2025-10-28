/**
 * Fluent builder for bounded contexts
 *
 * @author: Bernhard Lukassen
 */

import {
    forEach,
    isFunction,
    ClassBuilder, className
}                               from '/evolux.util';
// import { Types }                from '/evolux.schema';
import { tservices }            from "/evolux.universe";
import { EventEmitter}          from "/evolux.util/lib/eventemitter.mjs";
import { Reporter }             from "/evolux.supervise";

import MetaBoundedContext       from "./metaboundedcontext.mjs";
import Command                  from "../command/command.mjs";
import ActionCommand            from "../command/actioncommand.mjs";
import CreateCommand            from "../command/createcommand.mjs";
import ModifyCommand            from "../command/modifycommand.mjs";
import DeleteCommand            from "../command/deletecommand.mjs";
import CreateAction             from "../action/createaction.mjs";
import ModifyAction             from "../action/modifyaction.mjs";
import DeleteAction             from "../action/deleteaction.mjs";
// import DomainEvent              from "../event/domainevent.mjs";

// import is                       from "/@sindresorhus/is";

import { ErrNotACommand }       from "../errors.mjs";

const is = {
    string(obj) {
        return typeof obj === 'string' || obj instanceof String;
    }
}

export default class BoundedContextBuilder extends Reporter(EventEmitter) {

    constructor() {
        super();
        this._steps     = [];
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            building:               'building a bounded context',
            builded:                'bounded context ready',
            createboundedcontext:   'bounded context has been created',
            extendboundedcontext:   'bounded context has been exentded',
        };
    }

    /*
     * Builder fluent API
     */

    use(name) {
        this._name = name;
        return this;
    }

    addSchema(schema) {
        this._steps.push({ schema, commands: {}, actions: [] });
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

    /**
     *
     * @return {BoundedContextBuilder}
     */
    validate(dovalidate) {
        const item = this._last();
        if (item && item.schema) {
            item.validate = dovalidate;
        }
        return this;
    }

    /**
     * define a collection for the current item
     * @param {String}  collection  - name of the collection
     * @param {String}  scope       - one of 'public', 'context', 'shared' or 'private'
     * @return {BoundedContextBuilder}  this - fluent API
     */
    collection(collection, scope) {
        const item = this._last();
        if (item && item.schema) {
            item.collection = { collection, scope };
        }
        return this;
    }

    /**
     * add a command for the bounded context
     * @param command   .. a name or a class
     * @param responsibility
     */
    addCommand(commandid, responsibility, extendscls) {
        const item = this._last();
        let command;
        if (is.string(commandid)) {
            command = this._asCommandClass(commandid, extendscls);
        } else if (commandid instanceof Command) {
            command = commandid;
        } else {
            throw ErrNotACommand(commandid);
        }
        if (responsibility) {
            command.responsibility = responsibility;
        }
        item.commands[commandid] = command;
        return this;
    }

    _asCommandClass(commandid, extendscls) {
        // build the create command
        let consts = {
            ctx:    this._name,
            name:   commandid,
            id:     `${this._name}.${commandid}`,
            event:  `Done${commandid}Event`
        };
        let properties = {};
        let methods = {};

        let command = new ClassBuilder({
            name: commandid,
            constructor(properties) {
                this.properties = properties;
            },
            extend: extendscls || ActionCommand,
            properties,
            consts,
            methods
        }).build();
        return command;
    }

    defineAggregate(root, entities, commands) {
        return this;
    }

    /**
     * Register an action for a command. There can be multiple actions.
     * the order of 'addAction' is important; stops calling actions if one fails!
     * @param commandselector     ... name (id) of the command (with namespace)
     * @param action        ... the action for the command
     * @return {BoundedContextBuilder}
     */
    addAction(commandid, action) {
        const item = this._last();
        let cmd = item.commands[commandselector];
        if (!cmd) {
            this.logger.error(`${this._name}, command '${commandselector}' for action not found`);
            return this;
        }
        let reg = item.actions;
        if (!reg) {
            reg = [];
            this.actions = reg;
        }
        reg.push(action);
        return this;
    }

    withCommand(commandid, command, action) {
        let item = { command: [ commandid ] };
        this._steps.push(item);
        if (action) this.withAction()
        return this;
    }

    defineEvent(eventid) {
        let item = { event: eventid };
        this._steps.push(item);
        return this;
    }

    withAction(actionid, action, commandid) {
        if (commandid) action.commandid = commandid;

        let item = { actions: [ action ] };
        this._steps.push(item);
        return this;
    }

    release(releasetag) {
        this._release = releasetag;
        return this;
    }

    /*
     * build and register the context elements. calling this method
     * todo: always extend a bounded context
     * todo: check signature it extension is allowed
     */

    async build() {
        let tru4d   = tservices().tru4d;
        let bc      = tru4d.meta(this._name);
        let event   = 'extendboundedcontext';
        if (!bc) {
            bc = new MetaBoundedContext({ name: this._name });
            tru4d.useMeta(bc.name, bc);
            event   = 'createboundedcontext';
        }

        await forEach(this._steps, async item => {
            await this._buildItems(item, bc);
        });

        this.emit(event, { metaboundedcontext: bc, builder: this });
        return bc;
    }

    /*
        item.commands   = ['create', 'modify', 'drop'];
        item.actions    = ['create', 'modify', 'drop'];
        item.events     = ['created', 'modified', 'dropped'];
     */
    async _buildItems(item, bc) {
        const ctxid = bc.name;

        if (item.collection) {
            await bc.useCollection(item.collection.collection, item.collection.scope, item.schema);
        }

        if (item.schema && item.defaults) {
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
            bc.useCommand(cmdcreateid, command);

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
                properties,
                consts,
                methods
            }).build();
            bc.useCommand(cmdmodifyid, command);

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
                consts,
                methods
            }).build();
            bc.useCommand(cmddeleteid, command);

            /*
             * build default actions. for default actions no classes are necessary
             */
            let actionid;
            let action;

            // build create action
            actionid = `Create${schema.name}Action`;
            action = new CreateAction( { commandid: cmdcreateid, collection: item.collection, responsibility: item.responsibility });
            bc.useAction(actionid, action);

            // build modify action
            actionid = `Modify${schema.name}Action`;
            action = new ModifyAction( { commandid: cmdmodifyid, collection: item.collection, responsibility: item.responsibility });
            bc.useAction(actionid, action);

            // build delete action
            actionid = `Delete${schema.name}Action`;
            action = new DeleteAction( { commandid: cmddeleteid, collection: item.collection, responsibility: item.responsibility });
            bc.useAction(actionid, action);

            /*
             * don't build default events
             * Public events must always be consciously defined
             */

            /*
             * now create defaults for child schemas
             */


        }

        if (item.commands) {
            Object.entries(item.commands).forEach(([name, command]) => {
                bc.useCommand(name, command);
            });
        }

        if (item.actions) {
            item.actions.forEach((action) => {
                bc.useAction(action.commandid, action);
            })
        }

        if (item.event) {
            bc.useEvent(item.event);
        }
    }

/*
    static get types() {
        return Types;
    }
*/

    /*
     * private
     */

    _last() {
        return this._steps.length > 0 ? this._steps[this._steps.length-1] : null;
    }
}
