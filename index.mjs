/**
 *
 *
 * @author: blukassen
 */

import Repository                           from "./lib/repository.mjs";
import BoundedContextBuilder                from "./lib/ctx/boundedcontextbuilder.mjs";

/*
 * publish ubiquitous definitions etc.
 */
export *                                    from './lib/ubiqutious.mjs';

/*
 * basic commands
 */
export { default as CommandBuilder }        from './lib/command/commandbuilder.mjs';
export { default as Command }               from './lib/command/command.mjs';
export { default as CreateCommand }         from './lib/command/createcommand.mjs';
export { default as ModifyCommand }         from './lib/command/modifycommand.mjs';
export { default as DeleteCommand }         from './lib/command/deletecommand.mjs';
// export { default as ActionCommand }         from './lib/command/actioncommand.mjs';

/*
 * basic actions
 */
export { default as Action }                from './lib/action/action.mjs';
export { default as CreateAction }          from './lib/action/createaction.mjs';
export { default as ModifyAction }          from './lib/action/modifyaction.mjs';
export { default as DeleteAction }          from './lib/action/deleteaction.mjs';

/*
 * bounded context
 */
export { default as MetaBoundedContext }    from './lib/ctx/metaboundedcontext.mjs';
export { default as BoundedContext }        from './lib/ctx/boundedcontext.mjs';
// export { default as Aggregate }             from './lib/aggregate.mjs';

/*
 * context build for convenience
 */
export default BoundedContextBuilder;

/*
 * tru4d service
 */
export const service = new Repository();

