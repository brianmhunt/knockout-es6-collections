/* eslint-disable */

// Very blunt polyfill.
Array.from = Array.from || function array_from_stub(iterable) {
    var arr = []
    iterable.forEach(function (v) { arr.push(v) })
    return arr
}

describe(" > ObservableMap", function () {
    it("performs map functions", function () {
        var m = ko.Map()
        m.set('a', 'b')
        assert.equal(m.get('a'), 'b', 'a')
        assert.equal(m.size, 1, 'ms1')
        assert.deepEqual(Array.from(m), ['b'], 'barr')
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
        assert.notOk(m._mutatingMutex, "created")
        var x = ko.pureComputed(function () {
            return [m.size, Array.from(m)]
        })
        assert.deepEqual(x(), [0, []])
        m.set('a', 'b')
        assert.ok(m._mutatingMutex, "mutating")
        x.subscribe(function () {
            assert.notOk(m._mutatingMutex, "not mutating")
            assert.deepEqual(x(), [1, ['b']])
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
        assert.instanceOf(s._kc, WeakSet)
        var v = {}
        s.add(v)
        assert.equal(s.has(v), true)

        var s = new ko.WeakMap()
        assert.instanceOf(s, ko.WeakMap)
        assert.instanceOf(s._kc, WeakMap)

        var s = new ko.Set()
        assert.instanceOf(s, ko.Set)
        assert.instanceOf(s._kc, Set)

        var s = new ko.Map()
        assert.instanceOf(s, ko.Map)
        assert.instanceOf(s._kc, Map)
    })
})
