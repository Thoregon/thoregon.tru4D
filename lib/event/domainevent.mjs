/**
 * This is the domain event object of an occurred event. Will be
 * the param which is passed to the event listeners registered on
 * a domain event dispatcher.
 *
 * Each domain event (class) has a corresponding event dispatcher
 *
 * @author: Bernhard Lukassen
 */

export default class DomainEvent {

    constructor({
                    id,
                    dttm,
                    cmdid,
                    data,
                    path,
                    pubkey
                } = {}) {
        Object.assign(this, { id, dttm, cmdid, data, path, pubkey });
    }

}
