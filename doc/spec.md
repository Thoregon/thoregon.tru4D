tru4D
=====

Kind: Library/Framework

Implements a foundation to build an app or system following the 4D (distributed domain driven design) paradigm.

Building blocks:
- Responsibilities (this the the 'distributed' from the 4D)
- Choreography --> [orchestration vs choreography](https://stackoverflow.com/questions/4127241/orchestration-vs-choreography)
    - a context is built up from its parts (choreography)
    - no dedicated composition for a context exists (orchestration)
    - anti package pattern, don't build monolithic packages
    --> https://geekexplains.blogspot.com/2008/07/ways-of-combining-web-services.html
- Bounded Context
    - is a distributed component
    - contains at least one aggregate
    - defines a section of another context 
        - can be imagined simmilar to GraphQL, but can also reuse behavior
    - In addition, the bounded context can be composed of several other contexts
    - allow view with different structure to the base context like GraphQL/supergraph
- Aggregates
    - comarable to a transaction (microservice) 
    - Actor 
        - implements the algorithms to perform commands/aggregates
        - will be distributed to all/responsible peers, responsible to update snapshots
        - builtin actors for standard tasks like modifying attributes or state of entities
- Command: What to process/modify
    - Subclass one of the provided default commands
    - Class --> Command Definition
    - Instance --> Command
- Control: State changes of other components, e.g. if a user tends to modify an inputfield (focus), others gets informed
that this field may me modified (like google docs, sheets)
- Domain Event
    - emited by bounded context
    - listen to event
        - other bc
        - other responsibility in same bc
        - need grant 
- Actions
    - multiple actions for command
    - can be attached to command and domain events
    - will be executed in the same 'responsibility' context
    - run async, can't stop processing of a command or event
    - define an escalation procedure
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

## Responsibilities
Builds a scope for each responsibility. Domain Events are sent via the global scope.
--> responsibility scopes in matter

### Distributed Responsibility
Command is created by one node but will be processed by another.
Tuple for 'client node' & 'contractor node' (service).
Visibility between client and contractor

### User scoped responsibilities
Tuple for 'user' & 'contractor node' (service) to enable 'remote' commands
Shared user entities with the services for processing of commands 
Visibility between user (all user nodes) and contractor
 
## Bounded contexts
--> strategic design (structure)
A bounded context can be based on another (inherit), also reducing props and funcs.
Bounded contexts can cooperate in a network manner.

Bounded contexts can be split into responsibilities. This allows to deploy a bounded context
to multiple peers, 

To deploy a meta bounded context create a pair to sign the deployment. 

    $ vault -p <pair_id> <passphrase> <./myvaults/vault.tvs>

To deploy a bounded context instance create a secret (128 characters). This secret is used as passphrase to encode the
instances generated key pair. 

    $ vault -s <secret_id> <passphrase> <./myvaults/vault.tvs>

(Meta) Bounded Contexts are not limited to the component where they are defined.
(Meta) Bounded Contexts can be extended by other components if the owner has the permission. 

### Scopes

- user  (default)
- ctx
- device

Define also Context-Mapping (Anti Corruption Layer)

Shared Kernel/Open Host Service

## Aggregates
--> tactical design (procedure)
Defines transaction boundaries. Collection of commands for a (group of) entities. Needs a root entity.
Includes all changes that must be consistent after the transaction.

## Domain Event
After a command is successfully processed, inform all interested listeners.

### Inbound Events
This type of event can only be observed within the bounded context. Use to ensure consistency etc.

### Outbound Events
Can be observed within the universe. Use to enhance features and enable relationships between
bounded contexts.

## Commands
Is an invocation as an object. Will be stored in the event store in matter 

- get command from bounded context instance
    - from metaboundedcontext with boundedcontext id
    - is user allowed or 
    - public command 
- commit command
    - add to current or append to pending (encoded)
    - 
- shedule commands
    - enqueue commands at a specific scedule
    - check condition before exec of the command to check if the command needs to run 

### Process

- 1 command -> commit
- 2 store command in matter
    - prepare, reject command on error
    - maintain command state: created/processing/[done/rejected]
- 3 actions for command created (event sourcing) --> implicit
    - if the creating node is responsible exec action
- 4 execute action (only one on one node)
    - all commands are executed, on error start escalation procedure
    - actions may trigger long lasting processes, introduce your own state object and states
- 5 create entries in matter
- 6 send dpmain event from bounded context -> execute listeners on the events
    - register event listeners for 'boundedcontext' + 'eventname'
    - don't stop execution if one fails --> must be idempotent!
    - do proper logging!
    - from here again commands can be committed -> start at 1
    - event can also be subscribed by other bounded contexts 

### Command Protocol

- A command storage for every responsibility is established.
- a set with 'pending' commands; todo: maintain right order!
- a set with 'done' commands
- a set with 'rejected' commands; todo: check if needed
- each command has a 'state' (created, running, done, rejected)
    - processors should only start with 'created' commands to avoid double processing
    - if multiple actions are defined, all will be processed
    - if one action throws, the command gets rejected
        - all actions will be called again --> action.rollback() 
- when 'moving' to another queue, always create a new object!
  

Commands are sored in the commands set. The last command is the topmost, previous commands are 
chained with the 'prev' attribute. 

   {
        cmd: 'name' 
        id: '', 
        payload: {},
        control: {}
   } 

## Queries

Get object models based on bounded context spec: Schema, refs to other Entities, relation objects between entities
Provide mirrors for other frameworks like VUE

## Views

Make a view on a bounded context as public interface
- entities
- commands
- events

# Conventions
Components can deliver bounded contexts
- meta bounded contexts (classes)
- bounded contexts instances

The 'contexts' directory
