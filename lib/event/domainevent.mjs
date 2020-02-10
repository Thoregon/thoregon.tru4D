/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class DomainEvent {

    constructor({
                    dttm,
                    cmd,
                    data,
                    path,
                    key
                } = {}) {
        Object.assign(this, { dttm, cmd, data, path, key });
    }

}
