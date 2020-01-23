/**
 * An aggregate is a collection of entities
 * working together as an Aggregate (~ Transaction)
 *
 * Typical uses of Aggregates:
 *  - creating relations e.g. 'Review Book' in a Library
 *  - new Entities which are 'aggregted' from others like 'Create Invoice'
 *      - out of several delivery notes
 *      - considering calculated discounts and assigned discounts on orders
 *      - assigning discounts to orders, especially if only part is invoiced e.g. part deliveries
 *
 * An aggregate itself just uses Commands for data manipulation, don't use the Matter API!
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
