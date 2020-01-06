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
import { RepoMirror }               from "/evolux.util";

export default class Repository extends RepoMirror(Reporter(EventEmitter), 'dddd') {

    constructor() {
        super();
        this.contexts       = new Map();
        this.commands       = new Map();
        this.actors         = new Map();
        this.eventstores    = new Map();

        this.transactions   = [];
    }

    /*
     * Definition
     */

    hasContext(name) {
        return this.contexts.has(name);
    }

    context(name) {
        return this.contexts.get(name);
    }

    putContext(name, ctx) {
        const exists = this.hasContext(name);
        this.contexts.set(name, ctx);
        this._addToMirror(name, ctx);   // shortcut for convenience
        this.emit(exists ? 'update' : 'put', { name, ctx });
    }

    dropContext(name) {
        const ctx = this.context(name);
        if (!ctx) return;
        this.contexts.delete(name);
        this._removeFromMirror(name);
        this.emit('drop', { name, ctx });
    }

    /*
     * Event Stores
     */

    store(id) {
        return this.eventstores.get(id);
    }

    initStore(id, eventstore) {

    }

    /*
     * Commands
     */

    command(id) {

    }

    initCommand(id, command) {

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

    /*
     * Actors
     */

    actor(id) {

    }

    initActor(id, actor) {

    }
}
