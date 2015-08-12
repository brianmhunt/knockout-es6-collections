/* eslint-disable */

// Very blunt polyfill.
Array.from = Array.from || function array_from_stub(iterable) {
    var arr = []
    iterable.forEach(function (v) { arr.push(v) })
    return arr
}

describe(" > ObservableMap", function () {
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
        var m = new ko.Map()
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
        assert.ok(m._mutating, "mutating")
        x.subscribe(function () {
            assert.notOk(m._mutating, "not mutating")
            assert.deepEqual(x(), [1, ['c']])
            done()
        })
    })
})
