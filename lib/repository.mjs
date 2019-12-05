/**
 * The repository is the central element. Contains only Control entities no business entities
 *
 * - registry for
 *      - bounded contexts
 *      - commands
 *      - actors
 * - facade for multiple event stores
 *      - based on users scope
 * - distributes events
 *      - based on commands
 * - provides actors to update/build snapshots
 *
 * the repository
 *
 * @author: Bernhard Lukassen
 */

export default class Repository {

    constructor() {
        this.boundedcontests    = new Map();
        this.commands           = new Map();
        this.actors             = new Map();
        this.eventstores        = new Map();
        this.snapshots          = new Map();
    }




}
