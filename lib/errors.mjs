/**
 *
 *
 * @author: blukassen
 */



import { EError}    from "/evolux.supervise";

export const ErrNotImplemented              = (msg)                 => new EError(`Not implemented: ${msg}`,                    "TRU4D:00001");
export const ErrInvalidProperty             = (msg, prop)           => new EError(`Invalid property: ${msg}`,                   "TRU4D:00002", prop);
export const ErrInvalidState                = (msg)                 => new EError(`Invalid state: ${msg}`,                      "TRU4D:00003");
export const ErrNoId                        = (msg)                 => new EError(`Id missing: ${msg}`,                         "TRU4D:00004");
export const ErrNoPersistenceProvider       = ()                    => new EError(`No Persistence Provider set`,                "TRU4D:00005");
export const ErrRefToNonPersistent          = (msg, prop)           => new EError(`Reference to non persistent entity encountered: ${msg}`, "TRU4D:00006", prop);
export const ErrCommandStoreMissing         = (msg)                 => new EError(`Command Store undefined: ${msg}`,            "TRU4D:00007");
export const ErrCommandAlreadyComitted      = (msg)                 => new EError(`Command already committed: ${msg}`,          "TRU4D:00008");
export const ErrCommandHasNoSchema          = (msg)                 => new EError(`Schema missing for command: ${msg}`,         "TRU4D:00009");
export const ErrNotACommand                 = (msg)                 => new EError(`Not a command or command name: ${msg}`,      "TRU4D:00010");
export const ErrBoundedContextExists        = (bc, id)              => new EError(`Bounded Context exists: ${bc} -> ${id}`,     "TRU4D:00011");
export const ErrBoundedContextNonExists     = (bc, id)              => new EError(`Bounded Context does not exists: ${bc} -> ${id}`, "TRU4D:00012");
export const ErrInvalidBoundedContext       = (bc, id, msg)         => new EError(`Bounded Context invalid: ${bc} -> ${id}, ${msg}`, "TRU4D:00013");
export const ErrBoundedContextMetaMissmatch = (storedid, metaid)    => new EError(`Stored Bounded Context does not match Meta Context: stored '${storedid}' -> meta '${metaid}`, "TRU4D:00014");

export const ErrPrimaryKeyMissing           = (msg)                 => new EError(`Primary key missing for object in collection: ${msg}`, "TRU4D:00015");
export const ErrDuplicatePrimaryKey         = (msg, pk)             => new EError(`Duplicate primary key for object in collection: ${msg} -> PK \${pk}'`, "TRU4D:00016");

export const ErrParentEntityMissing         = (msg, prop)           => new EError(`Parent entity missing: ${msg}.${prop}`,      "TRU4D:00017");
export const ErrCollectionMissing           = (bc, id)              => new EError(`Collection missing: ${bc} -> ${id}`,         "TRU4D:00018");
