/**
 * Base class for a builder.
 * Pattern: Fluent Builder
 * After build() the entity and the modifications can be retrieved.
 *
 * Usage:
 *   let builder = new Builder();
 *   builder
 *     .create()
 *     .set("name", "value")
 *     .remove("old")
 *     .build();
 *
 * The builder throws an error at 'build()' whith all collected errors.
 * It does mot throw at creation or modification time. Nevertheless before
 * build() you can check it there are errors by asking for 'errors()'.
 * This does not report integrity check errors because they may be long lasting
 * and should not be done after a single modification.
 * The integrity checks a done right with build(), but you can cause it by
 * calling 'checkIntegrity()'.
 *
 *
 *   let entity = builder.entity;
 *   let modifications = builder.modifications;
 *
 * @todo: support nested objects (deep hierarchies)
 *
 * @author: blukassen
 */


const { notImplementedException, invalidProperyException, invalidStateException } = require('./errors');
const codes = require('../i18n/codes');

class Builder {

    /**
     * create a new Builder with optioons
     * @param options
     */
    constructor(options) {
        // init options
        /** @type {Object} */
        this._options = options || {};
        /** @type {Object} */
        this._properties = {};
        this._remove = [];
        this._errors = [];
        this._integrityViolations = [];
    }

    /**
     * build the entity. Collects all errors, does integrity checks - which may last longer.
     *
     * @return {Builder} this - for fluent builds
     * @throws {InvalidStateException} if any error or integrity check fails.
     */
    build() {
        this._applyProperties();
        this._reportIntegrity();

        // does the processing of errors and integrity violations. if any throws an error
        this._reportErrors();

        return this;
    }

    /**
     * Get the entitiy which is built/modified by this builder
     * @return {Object} entity - the built entity
     * @throws {InvalidStateException} when build is not finished.
     */
    get entity() {
        if (!this._modifications) throw invalidStateException("entity - no modifications available");
        return this._entity;
    }

    /**
     * start create new eTrace
     * @param {Object} options - options for the entity
     * @return {Builder} this - for fluent builds
     * @throws {InvalidStateException} exists - there is an entity, either already `create()`d or handed over to the builder by `use()`
     */
    create(options) {
        if (this._entity) throw invalidStateException("entity - no entity available");

        /** @type {Object} */
        this._entityoptions = options || {};
        /** @type {Object} */
        this._entity = this._newEntity(this._entityoptions);
        this._create = true;

        return this;
    }

    /**
     * create new instance
     * @param {Object} options - options for the eTrace
     * @return {Object} new entity
     * @private
     */
    _newEntity(options) {
        throw notImplementedException('newEntry()');
    }

    /**
     * start modifying an entity
     * @param {Object} entity - the entity which will be modified
     * @return {Builder} this - for fluent builds
     * @throws {InvalidStateException} exists - there is an entity, either already `create()`d or handed over to the builder by `use()`
     */
    use(entity, options) {
        if (this._entity) throw invalidStateException("entity - no entity available");

        /** @type {Object} */
        this._entityoptions = options || {};
        /** @type {Object} */
        this._entity = entity;
        this._create = false;

        return this;
    }

    /**
     * set a property of an entity.
     * will be crosschecked with the datadictionary
     *
     * @param {String} property - the name of the property
     * @param {Object} value - the value, if 'undefined' or 'null' the property will be deleted
     * @return {Builder} this - for fluent builds
     * @throws {InvalidStateException} not initialized, no entity exists
     * @throws {InvalidProperyException} invalid property, error when checked with data dictionary
     */
    set(property, value) {
        if (!this._entity) throw invalidStateException("entity - no entity available");

        // ToDo: crosscheck with datadictionary

        if (value == null) {    // yes this works, undefined == null --> true
            delete this._properties[property];
            this._remove.push(property);
        } else {
            this._properties[property] = value;
            let i = this._remove.indexOf(property);
            if (i > -1) this._remove.splice(i,1);   // remove the 'remove'
        }

        return this;
    }

    /**
     * removes a property from the entity
     * will be crosschecked with the datadictionary
     *
     * @param {String} property - the name of the property
     * @return {Builder} this - for fluent builds
     * @throws {InvalidStateException} not initialized, no entity exists
     * @throws {InvalidProperyException} invalid property, error when checked with data dictionary
     */
    remove(property) {
        return this.set(property, undefined);
    }

    /**
     * get the modifcations after build.
     * @return {{create: boolean, modifications: Array}}
     * @throws {InvalidStateException} when build is not finished.
     */
    get modifications() {
        if (!this._modifications) throw invalidStateException("modifications - no modifications available");
        let mods = {
            create: this._create,
            modifications: this._modifications
        };

        return mods;
    }

    /**
     * applies the properties to the entity.
     * keeps track of the changes.
     *   ToDo: deep compare for nested objects
     *
     * @throws {InvalidStateException} not initialized, no entity exists
     * @private
     */
    _applyProperties() {
        if (!this._entity) throw invalidStateException("applyProperties - no entity available");
        if (!this._modifications) this._modifications = [];

        const properties = this._properties;
        const entity = this._entity;

        for (let p in properties) {
            // todo: deep check for nested objects
            let newval = properties[p];
            let oldval = entity[p];

            // get rid of 'not' changes
            if (newval != oldval) {
                this._addModification(p, oldval, newval);
                entity[p] = newval;
            }
        }

        let remove = this._remove;

        for (let i in remove) {
            let p = remove[i];
            if (entity.hasOwnProperty(p)) {
                let oldval = entity[p];
                this._addRemoval(p, oldval);
                delete entity[p];
            }
        }
    }

    /**
     * register changes to the entity.
     *
     * @param {String} property - name of the property
     * @param {Object} oldval - value before change
     * @param {Object} newval - value after change
     * @private
     */
    _addModification(property, oldval, newval) {
        let modification = oldval == null ? {newval: newval, action: 'add'} : {oldval: oldval, newval: newval, action: 'change'};
        modification.property = property;
        this._modifications.push(modification);
    }

    /**
     * register removals to the entity.
     *
     * @param {String} property - name of the property
     * @param {Object} oldval - value before change
     * @private
     */
    _addRemoval(property, oldval) {
        let modification = { property: property, oldval: oldval, action:'remove'};
        this._modifications.push(modification);
    }

    /**
     * just a hook method to check the integrity
     * @private
     */
    _reportIntegrity() {
        this.checkIntegrity();
    }

    /**
     * collect errors and integrity violations, throws an error if any.
     *
     * @return {Array} errors
     * @private
     */
    _reportErrors() {
        let errcollection = [];

        if (this._errors.length > 0) errcollection = errcollection.concat(this._errors);

        if (this._integrityViolations.length > 0) errcollection = errcollection.concat(this._integrityViolations);

        return errcollection;
    }

    /**
     * the modified or new object needs to be checked against the integrity rules.
     *
     * @return {Array} integrity violations
     */
    checkIntegrity() {
        // todo: implement with data dictionary
        return this._integrityViolations;
    }
}

module.exports = Builder;
