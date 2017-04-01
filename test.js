/* eslint-disable */

// Very blunt polyfill.
Array.from = Array.from || function array_from_stub(iterable) {
    var arr = []
    iterable.forEach(function (v) { arr.push(v) })
    return arr
}

describe(" > ObservableMap", function () {
    
    const {
        iterator, mutex, kc, trigger, tm, pm
    } = ko.Map['@@SYMS']
    
    it("constructs without `new`", function () {
        var m = ko.Map()
        assert.instanceOf(m, ko.Map)
    })
    
    it("performs map functions", function () {
        var m = new ko.Map()
        m.set('a', 'b')    // {'a' => 'b'}
        assert.equal(m.get('a'), 'b', 'a')
        assert.equal(m.size, 1, 'ms1')
        assert.deepEqual(Array.from(m.values()), ['b'], 'barr')
        assert.equal(m.has('a'), true, 'at')
        assert.equal(m.has('x'), false, 'xf')
        m.clear()
        assert.equal(m.size, 0, 'ms0')
        assert.equal(m.has('a'), false, 'af2')
        m.set('c', 'd', 'c')
        assert.equal(m.size, 1, 'ms1-c')
        assert.equal(m.has('c'), true, 'mhc')
        m.delete('c')
        assert.equal(m.size, 0, 'ms0-c')
        assert.equal(m.has('c'), false, 'mhcf')
    })

    it("asynchronously recalculates dependencies on changes", function (done) {
        var m = ko.Map()
        assert.notOk(m[mutex], "created")
        var x = ko.pureComputed(function () {
            return [m.size, Array.from(m.values())]
        })
        assert.deepEqual(x(), [0, []])
        m.set('a', 'b')
        m.set('a', 'c')
        // The value is set immediately
        assert.deepEqual(m.get('a'), 'c')
        // The differences are not propagated immediately though
        assert.deepEqual(x(), [0, []])
        assert.ok(m[mutex], "mutating")
        x.subscribe(function () {
            assert.notOk(m[mutex], "not mutating")
            assert.deepEqual(x(), [1, ['c']])
            done()
        })
    })

    it("creates an observable set", function (done) {
        var s = ko.Set()
        assert.equal(s.size, 0)
        s.add("abc")
        assert.equal(s.size, 1)
        s.subscribe(function () {
            assert.ok(s.has('abc'))
            assert.equal(s.size, 1)
            done()
        })
    })

    it("creates with 'new' keyword", function () {
        var s = new ko.WeakSet()
        assert.instanceOf(s, ko.WeakSet)
        assert.instanceOf(s[kc], WeakSet)
        var v = {}
        s.add(v)
        assert.equal(s.has(v), true)

        var s = new ko.WeakMap()
        assert.instanceOf(s, ko.WeakMap)
        assert.instanceOf(s[kc], WeakMap)

        var s = new ko.Set()
        assert.instanceOf(s, ko.Set)
        assert.instanceOf(s[kc], Set)

        var s = new ko.Map()
        assert.instanceOf(s, ko.Map)
        assert.instanceOf(s[kc], Map)
    })
    
    it("iterates over entities of a map", function (done) {
        const m = ko.Map()
        const x = {}
        m.set(x, "alpha")
        m.subscribe(() => {
            assert.deepEqual(Array.from(m), [[x, 'alpha']])
            done()
        })
    })
    
    it("iterates over values of a set", function () {
        s = ko.Set([1, 2, 3])
        s.subscribe(() => {
            assert.deepEqual(Array.from(s).sort(), [1,2,3])
            done()
        })
    })

    it("is iterable by the primitive Symbol.iterator", function () {
        const s = ko.Set()
        s.add('1236')
        for (const x of s) {
           assert.equal(x, '1236')
        }
    })
    
    it("adds dependency subscriptions", function () {
        var callCount = 0
        var y = ko.Map()
        var x = ko.computed(function () {
            callCount++;
            y.values()
        })
        assert.equal(callCount, 1)
        assert.equal(y.getSubscriptionsCount(), 1)
    })
    
    it("respects ignoreDependencies", function () {
        var callCount = 0
        var y = ko.Map()
        var x = ko.computed(function () {
            callCount++;
            ko.ignoreDependencies(function () { y.values(); })
        })
        assert.equal(callCount, 1)
        assert.equal(y.getSubscriptionsCount(), 0)
    })
    
    it("exposes .peek functions", function () {
        var callCount = 0
        var y = ko.Map()
        var x = ko.computed(function () {
            callCount++;
            y.values.peek()
        })
        assert.equal(callCount, 1)
        assert.equal(y.getSubscriptionsCount(), 0)
    })
})
