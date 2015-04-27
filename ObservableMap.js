//
// ObservableMap
// ---
// This is an ideal spot for an ES6 proxy, but those are not widely supported.
// One might extend the Map class, but extending builtins is not a widely
// accepted practice and there does not appear to be any way to overwrite .size.
//
function ObservableMap(iterable) {
  this._o = ko.observable(0)
  this._m = new Map(iterable)

  Object.defineProperty(this, 'size', {
    get: this._get_size.bind(this)
  })
}

ObservableMap.prototype = {
  constructor: ObservableMap,
  set: function setProxy(k, v) {
    this._m.set(k, v);
    this._o(this._o() + 1)
  },
  clear: function clearProxy() {
    if (this.size !== 0) {
      this._m.clear()
      this._o(this._o() + 1)
    }
  },
  delete: function deleteProxy(k) {
    this._m.delete(k)
    this._o(this._o() + 1)
  },
  get: function getProxy(k) {
    this._o();
    return this._m.get(k)
  },
  has: function getProxy(k) {
    this._o();
    return this._m.has(k)
  },
  entries: function entriesProxy() {
    this._o();
    return this._m.entries()
  },
  values: function entriesProxy() {
    this._o();
    return this._m.values()
  },
  keys: function entriesProxy() {
    this._o();
    return this._m.keys()
  },
  forEach: function (fn, the) {
    this._o();
    return this._m.forEach(fn, the)
  },
  _get_size: function sizeProxy() {
    // We cannot seem to overload this._m.size
    this._o()
    return this._m.size
  },

  /* Convenience function */
  values_array: function () {
    this._o()
    var arr = []
    this._m.forEach(function (v) { arr.push(v) })
    return arr
  },
}

ko.observableMap = function (iterable) {
  return new ObservableMap(iterable)
}
