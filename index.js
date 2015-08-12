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
        this._mutating = false
        this._kc = new KeyClass(iterable)
        Object.defineProperty(this, "size", {
            get: this._get_size.bind(this)
        })
    }

    KeyCollection.prototype = {
        constructor: KeyCollection,
        _mutate: function () {
            var self = this
            self._mutating = true
            var o = this.trigger
            schedule(function () {
                self._mutating = false
                o(o() + 1)
            }, 0)
        },
        _get_size: function _m_size_proxy() {
            this.trigger()
            return this._kc.size
        }
    }

    var kinds = {
        Map: {
            ctr: Map,
            mutators: ["set", "clear", "delete"],
            observers: ["get", "has", "values", "keys", "entries", "forEach", "valueOf"]
        },
        Set: {
            ctr: Set,
            mutators: ["add", "clear", "delete"],
            observers: ["entries", "values", "has", "forEach", "keys", "valueOf"]
        },
        WeakMap: {
            ctr: WeakMap,
            mutators: ["add", "delete", "has"],
            observers: ["valueOf"]
        },
        WeakSet: {
            ctr: WeakSet,
            mutators: ["delete", "set"],
            observers: ["has", "get", "valueOf"]
        }
    }

    Object.keys(kinds).forEach(function (name) {
        var defn = kinds[name]
        function KeyClass(iterable) {
            KeyCollection.call(this, defn.ctr, iterable)
        }
        KeyClass.prototype = Object.create(KeyCollection.prototype, {
            subscribe: function (fn, thisArg) {
                return this.trigger.subscribe(function () {
                    fn.call(thisArg, this)
                }, this)
            },
            getSubscriptionCount: function () {
                return this.trigger.getSubscriptionCount()
            },
            valueHasMutated: function () {
                return this.trigger.valueHasMutated()
            }
        })
        defn.mutators.forEach(function (fn) {
            KeyClass.prototype[fn] = function () {
                if (!this._mutating) { this._mutate() }
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
