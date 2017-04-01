//
// Observable Keyed Collections
// ---
// This is an ideal spot for an ES6 proxy, but those are not widely supported.
// One might extend the Map class, but extending builtins is not a widely
// accepted practice and there does not appear to be any way to overwrite .size.
//

(function () {
    "use strict"
    
    const SYMS = {
        mutex: Symbol("Mutex"),
        kc: Symbol("Entity Class Instance"),
        trigger: Symbol("Observable Trigger"),
        tm: Symbol("Trigger Mutation Fn"),
        pm: Symbol("Trigger Propagate Mutation Fn"),
    }
    const schedule = (ko.tasks && ko.tasks.schedule) || setTimeout

    function KeyCollection(WrappedClass, iterable) {
        this[SYMS.trigger] = ko.observable(0)
        this[SYMS.mutex] = false
        this[SYMS.kc] = new WrappedClass(iterable)
        kinds[WrappedClass.name]
            .observers
            .forEach((fn) =>
                this[fn].peek = (...args) => this[SYMS.kc][fn](...args)
            )
    }
    
    KeyCollection.prototype = {
        constructor: KeyCollection,
        [SYMS.tm]: function () {
            if (this[SYMS.mutex]) { return }
            this[SYMS.mutex] = true
            schedule(this[SYMS.pm].bind(this), 0)
        },
        [SYMS.pm]: function () {
            this[SYMS.mutex] = false
            this[SYMS.trigger](this[SYMS.trigger]() + 1)
        }
    }

    Object.defineProperty(KeyCollection.prototype, "size", {
        get: function () {
            this[SYMS.trigger]()
            return this[SYMS.kc].size
        }
    })
    
    function ctr(ObsClass, Es6, iter) {
        if (this instanceof ObsClass) {
            KeyCollection.call(this, Es6, iter)
        } else {
            return new ObsClass(iter)
        }
    }
    
    function KoMap(iter) { return ctr.call(this, KoMap, Map, iter) }
    function KoSet(iter) { return ctr.call(this, KoSet, Set, iter) }
    function KoWeakMap(iter) { return ctr.call(this, KoWeakMap, WeakMap, iter) }
    function KoWeakSet(iter) { return ctr.call(this, KoWeakSet, WeakSet, iter) }
    
    const kinds = {
        Map: {
            Ctr: KoMap,
            mutators: ["set", "clear", "delete"],
            observers: ["get", "has", "values", "keys", "entries", "forEach", "valueOf"],
            iterFn: "entries",
        },
        Set: {
            Ctr: KoSet,
            mutators: ["add", "clear", "delete"],
            observers: ["entries", "values", "has", "forEach", "keys", "valueOf"],
            iterFn: "values"
        },
        WeakMap: {
            Ctr: KoWeakMap,
            mutators: ["set", "delete", "has"],
            observers: ["valueOf"]
        },
        WeakSet: {
            Ctr: KoWeakSet,
            mutators: ["delete", "add"],
            observers: ["has", "get", "valueOf"]
        }
    }

    Object.keys(kinds).forEach(function (name) {
        const defn = kinds[name]
        const KeyClass = defn.Ctr
        KeyClass["@@SYMS"] = SYMS
        KeyClass.prototype = Object.create(KeyCollection.prototype)
        
        Object.assign(KeyClass.prototype, {
            subscribe(fn, thisArg) {
                return this[SYMS.trigger].subscribe(function () {
                    fn.call(thisArg, this)
                }, this)
            },
            getSubscriptionsCount() {
                return this[SYMS.trigger].getSubscriptionsCount()
            },
            valueHasMutated() {
                return this[SYMS.trigger].valueHasMutated()
            }
        })
        
        defn.mutators.forEach(function (fn) {
            KeyClass.prototype[fn] = function () {
                this[SYMS.tm]()
                return this[SYMS.kc][fn].apply(this[SYMS.kc], arguments)
            }
        })
        
        defn.observers.forEach(function(fn) {
            KeyClass.prototype[fn] = function () {
                this[SYMS.trigger]() // Create dependency.
                return this[SYMS.kc][fn].apply(this[SYMS.kc], arguments)
            }
        })
        
        if (defn.iterFn) {
            KeyClass.prototype[Symbol.iterator] = function () {
                return this[SYMS.kc][defn.iterFn]()
            }
        }
        
        ko[name] = KeyClass
    })
})()
