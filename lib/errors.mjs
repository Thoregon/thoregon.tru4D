/**
 *
 *
 * @author: blukassen
 */



import { EError}    from "/evolux.supervise";

export const ErrNotImplemented          = (msg)         => new EError(`Not implemented: ${msg}`,            "TRU4D:00001");
export const ErrInvalidProperty         = (msg, prop)   => new EError(`Invalid property: ${msg}`,           "TRU4D:00002", prop);
export const ErrInvalidState            = (msg)         => new EError(`Invalid state: ${msg}`,              "TRU4D:00003");
export const ErrNoId                    = (msg)         => new EError(`Id missing: ${msg}`,                 "TRU4D:00004");
export const ErrNoPersistenceProvider   = ()            => new EError(`No Persistence Provider set`,        "TRU4D:00005");
export const ErrRefToNonPersistent      = (msg, prop)   => new EError(`Reference to non persistent entity encountered: ${msg}`, "TRU4D:00005", prop);
export const ErrCommandStoreMissing     = (msg)         => new EError(`Command Store undefined: ${msg}`,    "TRU4D:00006");
