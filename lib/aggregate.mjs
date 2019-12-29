/**
 * An aggregate is a collection of entities
 * working together as an Aggregate (~ Transaction)
 *
 * @author: Bernhard Lukassen
 */

export default class Aggregate {

    constructor({
                    name,
                    description,
                    schemata,
                    commands
                } = {}) {
        Object.assign(this, { name, description, schemata, commands });
    }

}
