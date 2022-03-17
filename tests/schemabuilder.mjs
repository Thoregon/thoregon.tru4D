/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import SchemaBuilder from "../lib/schema/builder/schemabuilder.mjs";

if (!Array.asyncForEach) Object.defineProperty(Array.prototype, 'asyncForEach', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: async function asyncForEach(fn) {    // don't use () => {} because it binds this to undefined!
        for await (const item of this) {
            await fn(item);
        }
    }
});

(async () => {
    let entitybuilder = SchemaBuilder.entity("Website Descriptor");

    entitybuilder
        .extends("Descriptor")
        // .impl()
        .meta()
            .description("a website")
            .icon("smily.png")
        .attributes()
            .string     ( "shortName" )
                .mandatory()
            .string     ( "subline" )
            .image      ( "image169" )
            .image      ( "imageIcon" )
            .string     ( "domain" )
            .link       ( "aboutLink" )
            .boolean    ( "visibleInServiceDirectory" )
                .default    ( true )
            .collection ( "categories")
            .boolean    ( "enabledLogin")
            .boolean    ( "enabledComment" )
            .boolean    ( "enabledChat" )
            .boolean    ( "enabledVideoHosting" )
            .boolean    ( "enabledHostedSSI" )
            .boolean    ( "verified" )
            .boolean    ( "disabled" )
        .commands()
            .CUD()
            .command("activate")
                .params()
                    .boolean("state")
        .queries()
            .query("mywebsites")
                .params()
                    .string("search");

    let schema = await entitybuilder.build();

    console.log(entitybuilder);
    console.log(schema);
})();
