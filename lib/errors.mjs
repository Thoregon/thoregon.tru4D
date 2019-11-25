/**
 *
 *
 * @author: blukassen
 */



import { EError}    from "/evolux.supervise";

export const ErrNotImplemented          = (msg)         => new EError(`Not implemented: ${msg}`,    "TRU4D:00001");
export const ErrInvalidProperty         = (msg, prop)   => new EError(`Invalid property: ${msg}`,   "TRU4D:00002", prop);
export const ErrInvalidState            = (msg)         => new EError(`Invalid state: ${msg}`,      "TRU4D:00003");
