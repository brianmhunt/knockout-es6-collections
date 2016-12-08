# knockout-es6-collections

Observable maps, sets, weak maps and weak sets.

The collections created are:

- ko.Map
- ko.Set
- ko.WeakSet
- ko.WeakMap

Each of the functions of the keyed collections either observes or mutates
the collection.

&nbsp; | Mutates | Observes
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

12 Aug 2014 – 🌵2.2.0
- (fix) Tests with canonical `Array.from`
- work when `Symbol` is not defined
- use `ko.tasks.schedule` if available


15 Jul 2015 – 🐸  2.1.1
 - Fixed bugs with `ko.Set` and `ko.WeakSet`
 - Removed minified version since we have no auto-build process
 - Create instance with either `ko.Set(...)`, etc., or `new ko.Set(...)`
 - Fixed insertion properties for `WeakSet` and `WeakMap`

### Test

Run tests with `karma start`.

Run tests with `karma start` (or if karma is not installed globally,
  `./node_modules/karma/bin/karma start`).
