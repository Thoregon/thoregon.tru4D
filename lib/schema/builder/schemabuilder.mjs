/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import {
    LBoolean,
    LCollection,
    LDateTime,
    LDuration, LFloat,
    LImage, LInteger, LLink,
    LMap, LNumber,
    LSet, LStream, LString,
    Reference,
    SchemaReference
}                      from "../types/types.mjs";
import ComponentSchema from "../componentschema.mjs";
import EntitySchema    from "../entityschema.mjs";
import Attribute       from "../attribute.mjs";
import Command         from "../command.mjs";
import Method          from "../method.mjs";
import Event           from "../event.mjs";
import Query           from "../query.mjs";
import Relay           from "../relay.mjs";
import Parameter       from "../parameter.mjs";

export default class SchemaBuilder {

    static fromJSON(json) {

    }

    static toJSON(schema) {

    }

    static component(name) {
        return new ComponentBuilder().schemaName(name);
    }

    static entity(name) {
        return new EntityBuilder().schemaName(name);
    }

    static view(name) {
        return new ViewBuilder().schemaName(name);
    }

    //
    // build single elements
    //  - query, command, event
    //

}

/**
 * Baseclass for any builder
 */
class Builder {

    constructor(props) {
    }


    static under(parent) {
        let cat = `@${this.category}`;
        let builder = parent[cat];
        if (!builder) {
            builder = new this();
            parent[cat] = builder;
        }
        return builder.parent(parent);
    }

    static get category() {
        return this.name.toLowerCase();
    }

    parent(parent) {
        this._parent = parent;
        return this;
    }

    impl(impl) {
        this._impl = impl;
        return this;
    }
}

/**
 * baseclass for composites
 */
class LogicalBuilder extends Builder {

    // todo:
    //  - mixin (trait)
    //      - Commands as extension for components and entities
    //  - ViewSchema
    //  - plugins to other components (will be applied if the other component is used)
    //      - UI  -> see ODOO xml UI extensions

    schemaName(name) {
        this._schemaName = name;
        return this;
    }

    extends(ref) {
        this._extend = ref;
        return this;
    }

    meta() {
        return Meta.under(this);
    }

    queries() {
        return Queries.under(this);
    }

    commands() {
        return Commands.under(this);
    }

    events() {
        return Events.under(this);
    }

    //
    // build schemas
    //

    async build() {
        let schema = this.createSchema();
        schema.meta.name = this._schemaName;
        if (this._extend) schema.meta.extend = this._extend;
        if (this._impl) schema.meta.impl = this._impl;
        let categories = Object.getOwnPropertyNames(this).filter(cat => cat.startsWith('@'));
        await categories.aForEach(async (cat) => {
            let category = cat.substring(1);
            let builder = this[cat];
            await builder.build(category, schema);
        });
        return schema;
    }

    createSchema() {
        // throw ErrNotImplemented('createSchema');
        throw new Error('not implemented: createSchema');
    }

}


class ComponentBuilder extends LogicalBuilder {

    schemas() {
        return Schemas.under(this);
    }

    createSchema() {
        return new ComponentSchema();
    }
}

class EntityBuilder extends LogicalBuilder {

    attributes() {
        return Attributes.under(this);
    }

    methods() {
        return Methods.under(this);
    }

    createSchema() {
        return new EntitySchema();
    }
}

/**
 * baseclass for composite elements
 */
class ChildBuilder extends Builder {

    meta()       { return this._parent.meta() }

    attributes() { return this._parent.attributes() }

    methods()    { return this._parent.methods() }

    queries()    { return this._parent.queries() }

    commands()   { return this._parent.commands() }

    events()     { return this._parent.events() }

    elements()   { return this._parent.elements() }

    actions()    { return this._parent.actions() }

    plugins()    { return this._parent.plugins() }

    //
    // helper
    //

    _child(name) {
        let cat = `@${this.category}`;
        if (!this[cat]) this[cat] = {};
        let attr = this[cat][name];
        if (!attr) attr = this[cat][name] = this.specifier().parent(this).name(name);
        return attr;
    }

    //
    // buils
    //

    async build(category, schema) {
        let cat = `@${category}`;
        let elems = this[cat];
        await Object.entries(elems).aForEach(async ([name, builder]) => {
            await builder.build(category, name, schema);
        });
    }
}

class Meta extends ChildBuilder {

    description(description) {
        this._description = description;
        return this;
    }

    icon(icon, scale) {
        this._icon  = icon;
        this._scale = scale;
        return this;
    }

    async build(category, schema) {
        schema.meta.description = this._description;
        schema.meta.icon = { icon: this._icon, scale: this._scale };
    }
}

class Schemas extends ChildBuilder {

    schema(ref) {
        return SchemaRefBuilder.under(this);
    }
}

class Specifiers extends ChildBuilder {

    constructor(...args) {
        super(...args);
    }

    boolean(name) { return this._child(name).type(new LBoolean()) }

    number(name) { return this._child(name).type(new LNumber()) }

    integer(name) { return this._child(name).type(new LInteger()) }

    float(name) { return this._child(name).type(new LFloat()) }

    string(name) { return this._child(name).type(new LString()) }

    stream(name) { return this._child(name).type(new LStream()) }

    link(name) { return this._child(name).type(new LLink()) }

    dateTime(name) { return this._child(name).type(new LDateTime()) }

    duration(name) { return this._child(name).type(new LDuration()) }

    image(name) { return this._child(name).type(new LImage()) }

    collection(name) { return this._child(name).type(new LCollection()) }

    map(name) { return this._child(name).type(new LMap()) }

    set(name) { return this._child(name).type(new LSet()) }

    reference(name) { return this._child(name).type(new Reference()) }

    schemaReference(name) { return this._child(name).type(new SchemaReference()) }
}

class Attributes extends Specifiers {

    get category() {
        return "attributes";
    }

    specifier() {
        return new AttributeBuilder();
    }
}

class Params extends Specifiers {

    get category() {
        return "parameters";
    }

    specifier() {
        return new ParamBuilder();
    }

    async build(name, callable) {
        await super.build('parameters', callable);
    }
}

class Commands extends ChildBuilder {

    constructor(...args) {
        super(...args);
        this['@commands'] = {};
    }

    /**
     * shortcut for 'create', 'update' & 'delete'
     * @constructor
     */
    CUD() {
        this.command('create');
        this.command('update');
        this.command('delete');
        return this;
    }

    command(name) { return this._child(name) }

    //
    // helper
    //

    get category() {
        return "commands";
    }

    specifier() {
        return new CommandBuilder();
    }

}

class Queries extends ChildBuilder {

    query(name) { return this._child(name) }

    //
    // helper
    //

    get category() {
        return "queries";
    }

    specifier() {
        return new QueryBuilder();
    }
}

class Events extends ChildBuilder {

    event() { return this._child(name) }

    //
    // helper
    //

    get category() {
        return "events";
    }

    specifier() {
        return new EventBuilder();
    }
}

class Methods extends ChildBuilder {

    constructor(...args) {
        super(...args);
        this._methods = {};
    }

    method(name) { return this._child(name) }

    //
    // helper
    //

    get category() {
        return "methods";
    }

    specifier() {
        return new MethodBuilder();
    }

}

/**
 * baseclass for composite element details builder
 */
class ItemBuilder extends ChildBuilder {

    //
    // attributes
    //

    boolean(name) { return this._parent.boolean(name) }

    number(name) { return this._parent.number(name) }

    integer(name) { return this._parent.integer(name) }

    float(name) { return this._parent.float(name) }

    string(name) { return this._parent.string(name) }

    stream(name) { return this._parent.stream(name) }

    link(name) { return this._parent.link(name) }

    dateTime(name) { return this._parent.dateTime(name) }

    duration(name) { return this._parent.duration(name) }

    image(name) { return this._parent.image(name) }

    collection(name) { return this._parent.collection(name) }

    map(name) { return this._parent.map(name) }

    set(name) { return this._parent.set(name) }

    reference(name) { return this._parent.reference(name) }

    schemaReference(name) { return this._parent.schemaReference(name) }

    //
    // methods
    //

    method(name) { return this._parent.method(name) }

    //
    // queries
    //
    query(name) { return this._parent.query(name) }

    //
    // commands
    //
    command(name) { return this._parent.command(name) }

    //
    // events
    //
    event(name) { return this._parent.event(name) }

    //
    // relay
    //
    relay(name) { return this._parent.relay(name) }

    //
    // build
    //

    async build(category, name, schema) {
        let elem = this.createElem();
        Object.assign(elem, this.spec());
        if (!schema[category]) schema[category] = {};
        schema[category][name] = elem;
    }

    createElem() {
        throw new Error("not implemented: createElement");
    }

    spec() {
        return {};
    }
}

class SpecifierBuilder extends ItemBuilder {

    name(name) {
        this._name = name;
        return this;
    }

    default(value) {
        this._default = value;
        return this;
    }

    type(type) {
        this._type = type;
        return this;
    }

    mandatory() {
        this._mandatory = true;
        return this;
    }

    //
    // build
    //

    spec() {
        return { name: this._name, default: this._default, type: this._type, mandatory: !!this._mandatory };
    }
}

class AttributeBuilder extends SpecifierBuilder {

    createElem() {
        return new Attribute();
    }

}

class ParamBuilder extends SpecifierBuilder {

    createElem() {
        return new Parameter();
    }

}

class CallableBuilder extends ItemBuilder {

    name(name) {
        this._name = name;
        return this;
    }

    params() {
        return Params.under(this);
    }

    //
    // build
    //

    async build(category, name, schema) {
        super.build(category, name, schema);
        let callable = schema[category][name];
        if (callable && this['@params']) await this['@params'].build(name, callable);
    }

}

class CommandBuilder extends CallableBuilder {

    createElem() {
        return new Command();
    }

}

class MethodBuilder extends CallableBuilder {

    createElem() {
        return new Method();
    }

}

class QueryBuilder extends CallableBuilder {

    createElem() {
        return new Query();
    }

}

class EventBuilder extends CallableBuilder {

    createElem() {
        return new Event(this);
    }

}

class RelayBuilder extends CallableBuilder {

    createElem() {
        return new Relay();
    }

}

class SchemaRefBuilder extends ItemBuilder {

    createElem() {
        return new SchemaReference();
    }
}

//
// UI
//

class ViewsBuilder extends Builder {

    // todo:
    //  - mixin (trait)
    //      - Commands as extension for components and entities
    //  - ViewSchema
    //  - plugins to other components (will be applied if the other component is used)
    //      - UI  -> see ODOO xml UI extensions

    schemaName(name) {
        this._schemaName = name;
        return this;
    }

    extend(ref) {
        this._extend = ref;
        return this;
    }

    meta() {
        return Meta.under(this);
    }

    elements() {
        return ViewElements.under(this);
    }

    plugins() {
        return ViewPlugins.under(this);
    }

    actions() {
        return ViewActions.under(this);
    }

    events() {
        return ViewEvents.under(this);
    }

}

class ViewChildBuilder {

    elements() {
        return this._parent.elements();
    }
    plugins() {
        return this._parent.plugins();
    }
    actions() {
        return this._parent.actions();
    }
    events() {
        return this._parent.events();
    }
}

class ViewElements extends ViewChildBuilder {

}

class ViewPlugins extends ViewChildBuilder {

}

class ViewActions extends ViewChildBuilder {

}

class ViewEvents extends ViewChildBuilder {

}
