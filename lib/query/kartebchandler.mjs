/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class KarteBCHandler {

    matches(urn) {
        return !!urn.match(/^bc:.*/);
    }

    async find(urn, karte) {
        // implement by subclass
        return false;
    }

}
