/**
 * Check out notes in store.es6.js to understand what's happening here.
 */

/**
 * `registered` is the object that contains each auto-
 * generated notification dispatch handler (handlers
 * are similar to Redux reducers).
 */
const registered = {};
/**
* .add() auto-generates the store's notification dispatch
* handlers by adding each to the `registered` object that
* gets combine()'d below. This is very similar to a Redux
* reducer (aka "action handler"), only we aren't using
* actual reducers (overkill for us).
* Notifications are just objects that contain current
* state data about each notifier, sent via events emitted
* from the store (see store.es6.js file).
*/
function add (notifierName) {

    registered[notifierName] = (state, notification) => {
        if (state === undefined) state = { change: null };

        if (notification.notifierName === notifierName) {
            /**
            * So far, model changes are the only notification
            * types. in the future if we want to add more types,
            * they would go here:
            */
            var change = notification.change || null;
            return {
              change: change,
              attributes: notification.attributes
            };
        } else {
          return state;
        }
    }
}

function combine () {
    /*
    * This is based on Redux/Minidux's combineReducers() method
    * ... only we aren't using full reducers (overkill for us).
    * We just send single notifications about state changes to
    * store event subscribers. This function is a slimmer version of:
    * https://www.npmjs.com/package/minidux#combinereducersreducers
    */
    var keys = Object.keys(registered)

    return function combination (state, notification) {
      var hasChanged = false;
      var nextState = {};

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (typeof registered[key] !== 'function') throw new Error('notifier ' + key + 'must be a function');
        nextState[key] = registered[key](state[key], notification);
        hasChanged = hasChanged || nextState[key] !== state[key];
      }

      return hasChanged ? nextState : state;
    }

}

function remove (notifier) {
    if (registered[notifier]) {
        delete registered[notifier];
        return true;
    }
}


// Public api
module.exports = {
  registered: registered, // object containing each of our notifier funcs auto-generated by .add()
  add: add, // adds a new notifier to `registered`
  combine: combine, // similar to Redux combineReducers() function
  remove: remove // remove a notifier from `registered` object
}
