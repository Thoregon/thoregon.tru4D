/**
 * Handler for Meta Bounded Contexts
 *
 *
 * @author: Bernhard Lukassen
 */

export default class KarteMBCHandler {

    matches(urn) {
        return !!urn.match(/^mbc:.*/);
    }

    async lookup(urn, karte) {
        // implement by subclass
        return false;
    }

}
