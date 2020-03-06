/**
 * The repository is the central element. Contains only Control entities no business entities
 *
 * - registry for
 *      - (bounded) contexts
 *      - commands
 *      - actors
 * - facade for multiple event stores
 *      - based on users scope
 * - distributes events
 *      - based on commands
 * - provides actors e.g. to update/build snapshots
 *      - there can by multiple actors for one event
 *      - separate aspects e.g. uddate snapshot, recalc statistic, notify external system
 *
 * - Transations
 *      - todo: can be nested in tree form
 *
 * Commands will be wrapped in Events when they got synced
 *
 * The repository
 *
 * @author: Bernhard Lukassen
 */

import { EventEmitter}                      from "/evolux.pubsub";
import { Reporter }                         from "/evolux.supervise";
import { RepoMirror, parts, forEach }       from "/evolux.util";
import { ErrNoPersistenceProvider }         from "./errors.mjs";

import CommandUtil                          from "./command/commandutil.mjs";
import Command                              from "./command/command.mjs";

import { myuniverse, tservices, timeout, doAsync }   from "/evolux.universe";

const LOCALRESPONSIBILITY   = 'zodiac';
const DDDDROOTNAME          = 'dddd';
const COMMANDROOTNAME       = `${DDDDROOTNAME}.commands`;
const CURRENTCOMMAND        = 'current';
const EVENTROOTNAME         = 'events';

export default class Repository extends RepoMirror(Reporter(EventEmitter), 'dddd') {

    constructor() {
        super();
        this.contexts       = new Map();
        this.commands       = new Map();
        this.aggregates     = new Map();
        this.actions        = new Map();
        this.events         = new Map();
        this.collections    = {};

        this.cmdactions     = new Map();

        this.stores         = {};
    }

    /*
     * Processing
     */

    /*
     * Information
     */

    get LOCALRESPONSIBILITY() {
        return LOCALRESPONSIBILITY;
    }

    commandroot(responsibility) {
        let store = this.responsibilityStore(responsibility);
        return store.path(COMMANDROOTNAME);
    }

    eventrootpath(ctxid) {
        return `${DDDDROOTNAME}.${ctxid}.${EVENTROOTNAME}`;
    }

    eventroot(ctxid) {
        return myuniverse().matter.path(this.eventrootpath(ctxid));
    }

    // non permanent node id
    get t͛zodiac() {
        return myuniverse().t͛zodiac;
    }

    responsibilityStore(responsibility) {
        if (myuniverse().t͛zodiac && responsibility === myuniverse().t͛zodiac) return myuniverse().matter[LOCALRESPONSIBILITY];
        if (myuniverse().responsibilities && myuniverse().responsibilities[responsibility]) return myuniverse().matter[responsibility];
        return myuniverse().matter;
    }

    isResponsible(responsibility) {
        if (myuniverse().t͛zodiac && responsibility === myuniverse().t͛zodiac) return true;
        const responsibilities = this.responsibilities;
        return responsibilities.includes(responsibility);
    }

    // don't sore or cache responsibilities, always request it, they may change dynamically (well there should only be added new ones for dynamically installed contexts)
    get responsibilities() {
        return myuniverse().responsibilities ? Object.keys(myuniverse().responsibilities) : [];
    }

    /*
     * Definition
     */

    hasContext(id) {
        return this.contexts.has(id);
    }

    context(id) {
        return this.contexts.get(id);
    }

    useContext(id, ctx) {
        const exists = this.hasContext(id);
        this.contexts.set(id, ctx);
        this._addToMirror(`ctx.${id}`, ctx);   // shortcut for convenience
        this.emit(exists ? 'update' : 'put', { id, ctx, type: 'context' });
        return this;
    }

    dropContext(id) {
        const ctx = this.context(id);
        if (!ctx) return;
        this.contexts.delete(id);
        this._removeFromMirror(`ctx.${id}`);
        this.emit('drop', { id, ctx, type: 'context' });
        return this;
    }

    /*
     * Events: is just informational, list which events are sent from a bounded context
     */

    hasEvent(ctxid, eventid) {
        return this.events.has(ctxid) && this.events.get(ctxid).includes(eventid);
    }

    eventsFor(ctxid) {
        return this.events.get(id);
    }

    useEvent(ctxid, eventid) {
        const exists = this.hasEvent(ctxid, eventid);
        let events = this.events.get(ctxid);
        if (!events) {
            events = [];
            this.events.set(ctxid, events);
        }
        events.push(eventid);
        // this._addToMirror(`events.${ctxid}.${id}`, event);   // shortcut for convenience
        this.emit(exists ? 'update' : 'put', { eventid, type: 'event' });
        return this;
    }

    dropEvent(ctxid, eventid) {
        if (!this.hasEvent(ctxid, eventid)) return;
        let events = this.events.get(ctxid);
        let i = events.indexOf(eventid);
        if (i > -1) events.splice(i, 1);
        this.emit('drop', { eventid, type: 'event' });
        return this;
    }

    /*
     * Event Listeners
     */

    listen(ctxid, eventid) {
        // todo
    }

    /*
     * Commands
     */

    hasCommand(ctxid, id) {
        return this.commands.has(id);
    }

    command(ctxid, id) {
        return this.commands.get(id);
    }

    useCommand(ctxid, id, command) {
        const exists = this.hasCommand(id);
        this.commands.set(id, command);
        this._addToMirror(`commands.${ctxid}.${id}`, command);   // shortcut for convenience
        if (command.event) {
            this.useEvent(ctxid, command.event);
        }
        this.emit(exists ? 'update' : 'put', { id, command, type: 'command' });
        return this;
    }

    dropCommand(ctxid, id) {
        const command = this.event(id);
        if (!command) return;
        this.commands.delete(id);
        this._removeFromMirror(`commands.${ctxid}.${id}`);
        this.emit('drop', { id, command, type: 'command' });
        return this;
    }

    /*
     * Actions
     *
     * todo: resposibilities for actions
     */

    hasAction(ctxid, id) {
        return this.actions.has(id);
    }

    action(ctxid, id) {
        return this.actions.get(id);
    }

    useAction(ctxid, id, action) {
        const exists = this.hasAction(id);
        this.actions.set(id, action);
        // get actions fast for command
        if (action.commandid) {
            let cmdactions = this.cmdactions.get(action.commandid);
            if (!cmdactions) {
                cmdactions = {};
                this.cmdactions.set(action.commandid, cmdactions);
            }
            cmdactions[id] = action;
        }
        // this._addToMirror(`actions.${ctxid}.${id}`, action);   // shortcut for convenience
        this.emit(exists ? 'update' : 'put', { id, action, type: 'action' });
        return this;
    }

    dropAction(ctxid, id) {
        const action = this.actions(id);
        if (!action) return;
        this.actions.delete(id);
        if (action.commandid) {
            let cmdactions = this.cmdactions.get(action.commandid);
            if (cmdactions) {
                delete cmdactions[id];
            }
        }
        // this._removeFromMirror(`actions.${ctxid}.${id}`);
        this.emit('drop', { id, action, type: 'action' });
        return this;
    }

    /*
     * Collections
     */

    async useCollection(collectionpath, ctxid) {
        // todo: add ctx to path
        const matter = myuniverse().matter;
        if (!await matter.has(collectionpath)) {
            let elems   = parts(collectionpath);
            let parent  = elems[0];
            let name    = elems[1];
            matter.path(parent)[name] = [];
            this.logger.debug(`created collection in matter '${collectionpath}' for context ${ctxid}`);
        }
    }

    /*
     * Service
     */

    install() {
        this.logger.debug('** tru4d install()');
        tservices().tru4d = this;
    }

    uninstall() {
        this.logger.debug('** tru4d uninstall()');
        delete tservices().tru4d;
    }

    resolve() {
        this.logger.debug('** tru4d resolve()');
    }

    start() {
        this.logger.debug('** tru4d start()');

        // check if 'matter' gets isntalled and use it
        // todo: add convention/configuration for dependencies/optional features
        const controller = tservices().components;
        if (controller) {
            controller.observe({
                observes:   'matter',
                forget:     true,           // do just once, forget after execution
                installed:  () => this.connect()
            });
        }
    }

    stop() {
        this.logger.debug('** tru4d stop()');
        this.disconnect();
    }

    update() {
        this.logger.debug('** tru4d update()');
    }

    /*
     * Command processing
     * todo: eventually refactor to separate (responsibility) handlers and use the pubsub infrastructure for dispatching
     */

    async handleCommand(responsibility, commanddata, key, node, cmdroot) {
        if (!commanddata) return;
        if (!this.isResponsible(responsibility)) return;
        if (commanddata.state !== 'created') return;   // check if no one else is processing the command
        const u = myuniverse();
        const db = u.matter.root;   //db root to query sub objects
        const handler = CommandUtil.handle(commanddata, node, cmdroot);
        handler.running();
        this.logger.debug(`handleCommand`); // ${JSON.stringify(commanddata)}
        // let command = Command.from(commanddata);
        // command.setPending();
        let actions = this.actionsFor(commanddata.command);
        let errors = [];
        let results = {};
        let cmd = await handler.resolve();
        await forEach(actions, async (action) => {
            try {
                // actions should always process very fast. for long lasting transactions react on the events created
                // todo: introduce a timeout if necessary --> action.abort()
                let result = await action.exec(cmd, cmd.payload, cmd.control);
                if (result) results[cmd.command] = result;
            } catch (err) {
                errors.push(err);
            }
        });
        if (this.hasErrors(errors)) {
            this.reportErrors('handleCommand', errors);
            handler.reject(errors);
        } else {
            handler.done(results);
            // todo: create event
            // events may trigger long lasting processes, introduce your own state object and states
        }
    }

    actionsFor(command) {
        let cmdactions = this.cmdactions.get(command);
        return cmdactions ? Object.values(cmdactions) : [];
    }

    hasErrors(errors) {
        return errors && errors.length > 0;
    }

    reportErrors(msg, errors) {
        if (!errors) return;
        errors.forEach(err => this.logger.error(msg, err));
    }

    /*
     * Event processing
     */

    /*
     * Lifecycle
     */

    async connect() {
        const u = myuniverse();
        if (this._persistence) return;
        this._persistence = u.matter;

        // now create sub stores for local responsiblity
        if (u.t͛zodiac) {
            u.Matter.addStore(LOCALRESPONSIBILITY, u.t͛zodiac);
            this.stores[`${LOCALRESPONSIBILITY}.${COMMANDROOTNAME}`] = u.t͛zodiac;
        }

        // now create sub stores for responsiblities
        if (u.responsibilities) {
            Object.entries(u.responsibilities).forEach(([responsibility, scope]) => {
                u.Matter.addStore(responsibility, scope);
                this.stores[`${responsibility}.${COMMANDROOTNAME}`] = responsibility;
            })
        }

        this.emit('ready', { tru4d: this });

        await timeout(1000);
        this.listenOnCommands();
    }

    listenOnCommands() {
        const matter = myuniverse().matter;
        Object.entries(this.stores).forEach(([store, responsibility]) => {
            matter.path(`${store}.${CURRENTCOMMAND}`).on(async (command, key, node) => {
                await this.handleCommand(responsibility, command, key, node, matter.path(store));
            });
        });
        // listen to commands in general
        matter.path(`${COMMANDROOTNAME}.${CURRENTCOMMAND}`).on((command, key, node) => {
            this.handleCommand(null, command, key, node, matter.path(COMMANDROOTNAME));
        });
    }

    disconnect() {
        delete this._persistence;
        this.emit('exit', { tru4d: this });
    }

    get isConnected() {
        return !!this._persistence;
    }

    get persistence() {
        if (!this.isConnected) throw ErrNoPersistenceProvider();
        return this._persistence;
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'True4D ready',
            exit:           'True4D exit',
            put:            'Context putted',
            drop:           'Context dropped',
            update:         'Context updated'
        };
    }
}
