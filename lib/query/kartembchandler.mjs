/**
 * Handler for Meta Bounded Contexts
 *
 * handles urn's for meta bounded contexts.
 * these urn's starts with 'mbc:'
 *
 *
 * @author: Bernhard Lukassen
 */

const MBCROOT = 'mL12bVvsdRIfiuOiXKbD8zs0';

export default class KarteMBCHandler {

    matches(urn) {
        return !!urn.match(/^mbc:.*/);
    }

    async lookup(urn, karte) {
        // implement by subclass
        return false;
    }

}
