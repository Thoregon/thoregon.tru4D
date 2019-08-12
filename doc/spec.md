tru4D
=====

Implements a foundation to build an app or system following the 4D (distributed domain driven design) paradigm.

Building blocks:
- Aggregates
    * Artisan 
        * implements the algorithms to perform commands/aggregates
        * builtin artisans for standard tasks like modifying attributes or state of entities
- Command
- Event
- Entity
- BoundedContext

Persistence layer for event sourcing is plugable.

