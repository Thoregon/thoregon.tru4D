/**
 * Test the Builder
 *
 * @author: blukassen
 */

const TestBuilder = require('./mocks/testbuilder');

test("should not be initialized", function () {
    let builder = new TestBuilder();

    expect(function () {
        builder.build();
    }).toThrowError("Invalid state: applyProperties - no entity available");
    expect(function () {
        builder.entity;
    }).toThrowError("Invalid state: entity - no modifications available");
    expect(function () {
        builder.modifications;
    }).toThrowError("Invalid state: modifications - no modifications available");
});

test("should build an object with one property", function () {
    let builder = new TestBuilder();

    builder
        .create()
        .set("a", 1)
        .build();

    let entity = builder.entity;

    expect(entity.a).toBe(1);
});

test("should have one add modification", function () {
    let builder = new TestBuilder();

    builder
        .create()
        .set("a", 1)
        .build();

    let mod = builder.modifications;

    expect(mod.create).toBe(true);
    expect(mod.modifications.length).toBe(1);
    expect(mod.modifications[0]).toEqual({property: 'a', newval: 1, action: "add"});
});

test("should have no removal", function () {
    let builder = new TestBuilder();

    builder
        .create()
        .remove("a")
        .build();

    let mod = builder.modifications;

    expect(mod.create).toBe(true);
    expect(mod.modifications.length).toBe(0);
});

test("should have one replace modification", function () {
    let builder = new TestBuilder();

    builder
        .use({a: 0})
        .set("a", 1)
        .build();

    let mod = builder.modifications;

    expect(mod.create).toBe(false);
    expect(mod.modifications.length).toBe(1);
    expect(mod.modifications[0]).toEqual({property: 'a', oldval: 0, newval: 1, action: 'change'});
});

test("should have one removal", function () {
    let builder = new TestBuilder();

    builder
        .use({a: 0, b: 1})
        .remove("a")
        .build();

    let mod = builder.modifications;

    expect(mod.create).toBe(false);
    expect(mod.modifications.length).toBe(1);
    expect(mod.modifications[0]).toEqual({property: 'a', oldval: 0, action: "remove"});
});
