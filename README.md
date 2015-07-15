# knockout-es6-collections

Observable maps, sets, weak maps and weak sets.

The collections created are:

- ko.Map
- ko.Set
- ko.WeakSet
- ko.WeakMap

Each of the functions of the keyed collections either observes or mutates
the collection.

&nbsp; | Observes  | Mutates
 --- | --- | ---
 Map | set, clear, delete | get, has, values, keys, entries, forEach, valueOf
 Set | add, clear, delete | entries, values, keys, has, forEach, valueOf
 WeakMap | add, delete, has | valueOf
 WeakSet | delete, set | has, get, valueOf

The observable is always triggered asynchronously, so multiple updates will
be pooled together into one change.

These functions also expose some Knockout observable functions, namely:

- `subscribe(callback[, thisArg])` where the callback receives the entire collection when called
- `valueHasMutated()`
- `getSubscriptionCount()`


## Changelog

15 Jul 2015 – 🐸  2.1.0
 - Fixed bugs with `ko.Set` and `ko.WeakSet`
 - Removed minified version since we have no auto-build process

### Test

Run tests with `karma start` (or if karma is not installed globally,
  `./node_modules/karma/bin/karma start`).
