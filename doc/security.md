Security, Encryption & Permissions
==================================



## Permissions
to a bounded context several roles can be defined.
within a bounded context, a user can have a number of (defined) roles.

for a collection, roles can be defined for access (r/w) and additional 
selection criteria. 

- roles are agnostic of users - creation and management of roles is independent of users
- roles can have overlapping permissions

- permissions should be easy to comprehend 
- permissions are
    - on data level
    - on commands
    - on events

a role based access control list is materialized for each 
- entity
    - attribute
- command
- event

POLP - Principle of Least Privilege  
