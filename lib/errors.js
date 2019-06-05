/**
 *
 *
 * @author: blukassen
 */

const EError = require('evolux.supervise/lib/error/eerror');

module.exports = {
    notImplementedException: (msg) => new EError("Not implemented" + msg ? `: ${msg}` : "", "DYCMP:00001"),
    invalidProperyException: (msg) => new EError("Invalid property" + msg ? `: ${msg}` : "", "DYCMP:00001"),
    invalidStateException: (msg) => new EError("Invalid state" + msg ? `: ${msg}` : "", "DYCMP:00001")
};
