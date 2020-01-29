tru4D
=====

Kind: Library/Framework

Implements a foundation to build an app or system following the 4D (distributed domain driven design) paradigm.

Building blocks:
- Responsibilities (this the the 'distributed' from the 4D)
- Context (Bounded Context)
    - can be wrappend as a component
    - contains at least one aggregate
    - defines a section of another context 
        - can be imagined simmilar to GraphQL, but can also reuse behavior
    - In addition, the bounded context can be composed of several other contexts
- Aggregates
    - comarable to a transaction (microservice) 
    - Actor 
        - implements the algorithms to perform commands/aggregates
        - will be distributed to all/responsible peers, responsible to update snapshots
        - builtin actors for standard tasks like modifying attributes or state of entities
- Command: What to process/modify
- Control: State changes of other components, e.g. if a user tends to modify an inputfield (focus), others gest informed
that this field may me modified (like google docs, sheets)
- Domain Event
- Model
    - Entity
    - Value Object
- BoundedContext
- Repository
- Factory
- Competence
    - formal description of the abilities of the context
    - a matrix of skills, which publishes the degree of fulfilment of competences in the public repository  

Persistence layer for event sourcing is plugable.

If it is an extension to another context it can provide where its plugs in 
- extensions of UI
- imports from parent context
- publish overrides and extensions

## Responsibilitites
Builds a scope for each responsibility. Domain Events are sent via the global scope.
--> responsibility scopes in matter
 
## Bounded contexts
--> strategic design (structure)
A bounded context can be based on another (inherit), also reducing props and funcs.
Bounded cotnexts can cooperate in a network manner.

Define also Context-Mapping (Anti Corruption Layer)

Shared Kernel/Open Host Service

## Commands
Is an invocation as an object. Will be stored in the event store in matter 

## Aggregates
--> tactical design (procedure)
Defines transaction boundaries. Collection of commands for a (group of) entities. Needs a root entity.
Includes all changes that must be consistent after the transaction.

## Domain Event
After a command is successfully processed, inform all interested listeners

## Process

- 1 command -> commit
- 2 store command in matter
    - maintain command state: created/processing/[done/rejected]
- 3 event command created (event sourcing) --> implicit
    - event only where 'responsible'
    - if the creating node is responsible exec action 
- 4 execute action (only one on one node)
    - check prerequisites to exec command
    - reject command on error
- 5 create entries in matter
- 6 store matching aggregate events in matter
    - create of entities
    - command performed -> defined implicitly by the command
- 7 send dpmain event -> execute listeners on the events
    - don't stop execution if one fails --> must be idempotent!
    - do proper logging!
    - from here again commands can be committed -> start at 1
    - event can also be subscribed by other bounded contexts 

Commands are sored in the commands set. The last command is the topmost, previous commands are 
chained with the 'prev' attribute. 

   {
        cmd: { id: '', payload: {} },
        prev: { 
            cmd: { id: '', payload: {} },
            prev: { 
                ...
            }
        }
   } 

## Queries

Get object models based on bounded context spec: Schema, refs to other Entities, relation objects between entities
Provide mirrors for other frameworks like VUE
