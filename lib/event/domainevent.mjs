/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class DomainEvent {

    constructor({
                    dttm,
                    cmd,
                    data
                } = {}) {
        Object.assign(this, { dttm, cmd, data });
    }

}
