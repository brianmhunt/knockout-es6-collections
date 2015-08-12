//
// Observable Keyed Collections
// ---
// This is an ideal spot for an ES6 proxy, but those are not widely supported.
// One might extend the Map class, but extending builtins is not a widely
// accepted practice and there does not appear to be any way to overwrite .size.
//

(function () {
    "use strict"

    var iteratorSymbol = (window.Symbol && window.Symbol.iterator) || "__iter__"
    var schedule = (ko.tasks && ko.tasks.schedule) || setTimeout

    function KeyCollection(KeyClass, iterable) {
        this.trigger = ko.observable(0)
        this._mutatingMutex = false
        this._kc = new KeyClass(iterable)
    }

    KeyCollection.prototype = {
        constructor: KeyCollection,
        _triggerMutate: function () {
            if (this._mutatingMutex) { return }
            this._mutatingMutex = true
            schedule(this._propagateMutateEvent.bind(this), 0)
        },
        _propagateMutateEvent: function () {
            this._mutatingMutex = false
            this.trigger(this.trigger() + 1)
        }
    }

    Object.defineProperty(KeyCollection.prototype, "size", {
        get: function () {
            this.trigger()
            return this._kc.size
        }
    })

    var kinds = {
        Map: {
            mutators: ["set", "clear", "delete"],
            observers: ["get", "has", "values", "keys", "entries", "forEach", "valueOf"]
        },
        Set: {
            mutators: ["add", "clear", "delete"],
            observers: ["entries", "values", "has", "forEach", "keys", "valueOf"]
        },
        WeakMap: {
            mutators: ["set", "delete", "has"],
            observers: ["valueOf"]
        },
        WeakSet: {
            mutators: ["delete", "add"],
            observers: ["has", "get", "valueOf"]
        }
    }

    Object.keys(kinds).forEach(function (name) {
        var defn = kinds[name]
        function KeyClass(iterable) {
            if (this instanceof KeyClass) {

                KeyCollection.call(this, window[name], iterable)
            } else {
                return new KeyClass(iterable)
            }
        }
        KeyClass.prototype = Object.create(KeyCollection.prototype)
        KeyClass.prototype.subscribe = function subscribe(fn, thisArg) {
            return this.trigger.subscribe(function () {
                fn.call(thisArg, this)
            }, this)
        }
        KeyClass.prototype.getSubscriptionCount = function getSubscriptionCount() {
            return this.trigger.getSubscriptionCount()
        }
        KeyClass.prototype.valueHasMutated = function valueHasMutated() {
            return this.trigger.valueHasMutated()
        }
        defn.mutators.forEach(function (fn) {
            KeyClass.prototype[fn] = function () {
                this._triggerMutate()
                return this._kc[fn].apply(this._kc, arguments)
            }
        })
        defn.observers.forEach(function(fn) {
            KeyClass.prototype[fn] = function () {
                this.trigger() // Create dependency.
                return this._kc[fn].apply(this._kc, arguments)
            }
        })
        KeyClass.prototype[Symbol.iterator] = function () {
            return this._kc.entries()
        }
        ko[name] = KeyClass
    })
})()
