/**
 * The repository is the central element
 *
 * - registry for
 *      - bounded contexts
 *      - commands
 *      - actors
 * - facade for the event store
 * - distributes events
 *      - based on commands
 * - provides actors to update/build snapshots
 *
 * @author: Bernhard Lukassen
 */

export default class Repository {

    constructor() {
        this.boundedcontests    = {};
        this.commands           = {};
    }


}
