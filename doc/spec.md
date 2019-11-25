tru4D
=====

Kind: Library/Framework

Implements a foundation to build an app or system following the 4D (distributed domain driven design) paradigm.

Building blocks:
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
 
##Bounded contexts

A bounded context can be based on another (inherit), also reducing props and funcs.
Bounded cotnexts can cooperate in a network manner.

##Commands


