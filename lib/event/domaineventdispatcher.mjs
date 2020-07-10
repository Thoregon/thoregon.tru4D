/**
 * A domain event dispatcher is used to add listeners on a domain event
 *
 * @author: Bernhard Lukassen
 */

export default class DomainEventDispatcher {

    constructor() {
        this.events = new Map();
    }

    /**
     *
     * @param {KeyPair} pair - needs the keypair
     * @param params
     * @param fn
     */
    subscribe(params, fn) {
        // get pubkey from bounded context
        // create DH secret with the keypair on the listeners side - supplied at bc.unlock(pair)


        // register listener on bounded context with its public key
        let pubkey = pair.pub;
    }

    /**
     * unsubscribe
     */
    unsubscribe() {

    }
}
