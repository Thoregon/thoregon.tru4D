ToDo
====

- plugin to 'matter' to provide
    - bounded contexts
    - observers which builds commands
    - Achtung! Gun nodes referenzieren!
    - everblack -> bounded contexts  -> Gun.chain.boundedcontext = (...) => { }    

- BoundedContexts
    - distribution plan, which node processes which responsibilities
        - ! Caution: don't just collect the installes responsibilties, a command may be mandated on one node but processed on another
    - commands with multiple responsibilities
    - collections with multiple schemas, e.g. class hierarchy

- Meat Bounded Context public API 
    - publish API
        - commands
        - events
    - permissions
        - commands, events

- command w/o responsibility
    - different actions on different nodes

- Import Schemas and bounded contexts from OpenAPI (Swagger)

- collect all changes of persistent stores in an aggregate (transaction)
    - apply it at once

- key, index, tags
    - command mit key statt id (mapping)

- responsibility tuples
    - user/device - service

- tools
    - easy access to command queues
    - command browser
    - rebuild keys, indexes and tags
    - move commands to other responsibilities
