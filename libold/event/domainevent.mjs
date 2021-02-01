/**
 * This is the domain event object of an occurred event. Will be
 * the param which is passed to the event listeners registered on
 * a domain event dispatcher.
 *      boundedcontext.events.subscribe(eventname, params, handlerfn)
 *
 * Each domain event (class) has a corresponding event dispatcher
 *
 * @author: Bernhard Lukassen
 */

export default class DomainEvent {

    constructor({
                    id,
                    dttm,
                    data,
                } = {}) {
        Object.assign(this, { id, dttm, data });
    }

}
