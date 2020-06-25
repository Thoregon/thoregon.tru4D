/**
 * This is the description of a domain event
 *
 * @author: Bernhard Lukassen
 */
import DomainEvent from "./domainevent.mjs";

export default class MetaDomainEvent {

    constructor({
                    id,
                    description,
                } = {}) {
        Object.assign(this, { id , description });
    }

    newEvent({
                 dttm,
                 cmdid,
                 data,
                 path,
                 pubkey

             }) {
        let event = new DomainEvent({ id, dttm, cmdid, data, path, pubkey })
    }
}
