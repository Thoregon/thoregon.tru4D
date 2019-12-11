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

export default class Repository extends Reporter(EventEmitter) {

    constructor() {
        super();
        this.contexts       = new Map();
        this.commands       = new Map();
        this.actors         = new Map();
        this.eventstores    = new Map();

        this.transactions   = [];
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
            ready:          'Layers ready',
            exit:           'Layers exit',
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
