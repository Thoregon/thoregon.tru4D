/**
 *
 *
 * @author: blukassen
 */

export default class BoundedContext {

    constructor({
                    name,                   // name the bounded context
                    description,            // give an educated description
                    aggregates,             //
                    facade
                } = {}) {
        Object.assign(this, { name, description, aggregates, facade });


    }

}
