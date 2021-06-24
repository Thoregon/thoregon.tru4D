Preface
=======

Commands and Queries represents the persistence 

There is a default processing how entities gets stored 
and queries im universe matter.
The behavior of this automatic can be finetuned or changed
by descriptions and implementations of commands and queries.

If the features from matter are not sufficient, own features can be implemented
using the framework and/or the hooks supplied.

Caution: everything persistent will always be encrypted! 
Keypairs are also necessary to testing in development.  

## Overview

### Persist arbitrary entities

````js
// define the root in matter where to store 
// associate with SSI
const ctx = dorifer.context('myctx');
const cmd = ctx.command("CreateEntity");

````

### Query entities

````js
const ctx   = dorifer.context('myctx');
const query = ctx.query( "EntiryQuery");

// query by index

````

### More elaborate commands

````js
// used default commands to store some entities

````

Queries
=======

Queries supports a reactive event api as well as a stream/generator api which 
can be used in async for loops 

## Auto Persistence

Auto persistence just needs a root to be specified. 

Prerequisites:
- root id  ... *mandatory; any arbitrary id, should be randomly generated. if exists read/write will fail because auf the signature checks
    - standalone
    - within SSI
- strategy
    - newest/latest ... last stored is first in query 
    - flat/struct ... store all non references (simple data types) in JSON or store detailed
- references
    - ref/embedd ... objects in properties as own entities or embedded in the top entity
    - the references specification can be defined fine grained for each property 

## Indexes

- define properties as index
- existence/absence of property causes the recording in the index
    - e.g. 'unread' as index to 
    
## Associations

- associates two or more entities
- allows additional meta data to specify the association 
- indexes for associations

## Query Schemas

## Entity Schemas


Commands
========

There exists a basic set of command which easly can be used w/o any programming
- Create
- Update
- Delete

But commands are much more then just persisting new or modified entities. Often 
there is 
- additional processing necessary
- multiple steps to fullfill
- provisioning/deprovisioning resources
- all together

The CUD commands can also be utilized within another command which acts as a bracket.
The modification will only be stored when the parent command executed w/o error.
This guaranties an atomic transaction.
Queries can also be used in commands e.g to verify existence or establish relations
to other entities.

Contracts
=========

Contracts implement consistency and authorization rules. 
