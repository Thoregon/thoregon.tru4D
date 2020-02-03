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

import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";
import { RepoMirror, parts }        from "/evolux.util";
import { myuniverse, tservices }    from "/evolux.universe";
import { ErrNoPersistenceProvider } from "./errors.mjs";

const ddddrootname      = 'dddd';
const commandrootname   = `${ddddrootname}.commands`;
const eventrootname     = `${ddddrootname}.events`;

export default class Repository extends RepoMirror(Reporter(EventEmitter), 'dddd') {

    constructor() {
        super();
        this.contexts       = new Map();
        this.commands       = new Map();
        this.aggregates     = new Map();
        this.actions        = new Map();
        this.events         = new Map();
        this.collections    = {};
    }

    /*
     * Processing
     */

    async doCommand(cmd, defcmd) {
        return null;
    }

    /*
     * Information
     */

    get commandroot() {
        return myuniverse().matter.path(commandrootname);
    }

    get eventroot() {
        return myuniverse().matter.path(eventrootname);
    }

    // non permanent node id
    get t͛zodiac() {
        return myuniverse().t͛zodiac;
    }

    isResponsible(cmdresponsibilities) {
        if (!Array.isArray(cmdresponsibilities)) cmdresponsibilities = [cmdresponsibilities];
        const responsibilities = myuniverse().responsibilities;
        if (!responsibilities) return true;
        return cmdresponsibilities.every(responsibility => responsibilities.includes(responsibility));
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
     * Events
     */

    hasEvent(ctxid, id) {
        return this.events.has(id);
    }

    event(ctxid, id) {
        return this.events.get(id);
    }

    useEvent(ctxid, id, event) {
        const exists = this.hasEvent(id);
        this.events.set(id, event);
        this._addToMirror(`events.${ctxid}.${id}`, event);   // shortcut for convenience
        this.emit(exists ? 'update' : 'put', { id, event, type: 'event' });
        return this;
    }

    dropEvent(ctxid, id) {
        const event = this.event(id);
        if (!event) return;
        this.events.delete(id);
        this._removeFromMirror(`events.${ctxid}.${id}`);
        this.emit('drop', { id, event, type: 'event' });
        return this;
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
     */

    hasAction(ctxid, id) {
        return this.actions.has(id);
    }

    action(ctxid, id) {
        return this.actions.get(id);
    }

    useAction(ctxid, id, action) {
        const exists = this.hasCommand(id);
        this.actions.set(id, action);
        this._addToMirror(`actions.${ctxid}.${id}`, action);   // shortcut for convenience
        this.emit(exists ? 'update' : 'put', { id, action, type: 'action' });
        return this;
    }

    dropAction(ctxid, id) {
        const action = this.actions(id);
        if (!action) return;
        this.actions.delete(id);
        this._removeFromMirror(`actions.${ctxid}.${id}`);
        this.emit('drop', { id, action, type: 'action' });
        return this;
    }

    /*
     * Collections
     */

    async useCollection(collectionpath, ctxid) {
        const matter = myuniverse().matter;
        if (!await matter.has(collectionpath)) {
            let elems   = parts(collectionpath);
            let parent  = elems[0];
            let name    = elems[1];
            matter.path(parent)[name] = [];
            this.logger.debug(`created collection in matter '${collectionpath}'`);
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
     * Lifecycle
     */

    connect() {
        const u = myuniverse();
        if (this._persistence) return;
        this._persistence = u.matter;

        // now create sub stores for responsiblities
        if (u.responsibilities) {
            Object.entries(u.responsibilities).forEach(([name, scope]) => {
                u.Matter.addStore(name, scope);
            })
        }

        // listen to commands
        this.commandroot

        // listen to events

        this.emit('ready', { tru4d: this });
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
