

describe(" > ObservableMap", function () {
  it("performs map functions", function () {
    var m = new ObservableMap()
    m.set('a', 'b')
    assert.equal(m.get('a'), 'b', 'a')
    assert.equal(m.size, 1, 'ms1')
    assert.deepEqual(m.values_array(), ['b'], 'barr')
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

  it("recalculates dependencies on changes", function () {
    var m = new ObservableMap()
    var x = ko.pureComputed(function () {
      return [m.size, m.values_array()]
    })
    assert.deepEqual(x(), [0, []])
    m.set('a', 'b')
    assert.deepEqual(x(), [1, ['b']])
    m.delete('a')
    assert.deepEqual(x(), [0, []])
  })
})
