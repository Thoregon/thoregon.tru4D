/**
 *
 *
 * @author: blukassen
 */

import { EError}    from "/evolux.supervise";

export default {
    notImplementedException:    (msg) => new EError("Not implemented" + msg ? `: ${msg}` : "", "DYCMP:00001"),
    invalidProperyException:    (msg) => new EError("Invalid property" + msg ? `: ${msg}` : "", "DYCMP:00001"),
    invalidStateException:      (msg) => new EError("Invalid state" + msg ? `: ${msg}` : "", "DYCMP:00001")
};
