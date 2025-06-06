!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = e(require("qtiCustomInteractionContext")))
    : "function" == typeof define && define.amd
    ? define(["qtiCustomInteractionContext"], e)
    : ((t = "undefined" != typeof globalThis ? globalThis : t || self)[
        "@citolab/tspci-3d-blocks"
      ] = e(t.ctx));
})(this, function (t) {
  "use strict";
  function e(t) {
    var e = Object.create(null);
    return (
      t &&
        Object.keys(t).forEach(function (n) {
          if ("default" !== n) {
            var i = Object.getOwnPropertyDescriptor(t, n);
            Object.defineProperty(
              e,
              n,
              i.get
                ? i
                : {
                    enumerable: !0,
                    get: function () {
                      return t[n];
                    },
                  }
            );
          }
        }),
      (e.default = t),
      Object.freeze(e)
    );
  }
  var n,
    i,
    r,
    s,
    o,
    a,
    l,
    c,
    h,
    u,
    d,
    p = e(t),
    m = {},
    f = [],
    g = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,
    v = Array.isArray;
  function x(t, e) {
    for (var n in e) t[n] = e[n];
    return t;
  }
  function _(t) {
    t && t.parentNode && t.parentNode.removeChild(t);
  }
  function y(t, e, n, s, o) {
    var a = {
      type: t,
      props: e,
      key: n,
      ref: s,
      __k: null,
      __: null,
      __b: 0,
      __e: null,
      __c: null,
      constructor: void 0,
      __v: null == o ? ++r : o,
      __i: -1,
      __u: 0,
    };
    return null == o && null != i.vnode && i.vnode(a), a;
  }
  function b(t) {
    return t.children;
  }
  function w(t, e) {
    (this.props = t), (this.context = e);
  }
  function M(t, e) {
    if (null == e) return t.__ ? M(t.__, t.__i + 1) : null;
    for (var n; e < t.__k.length; e++)
      if (null != (n = t.__k[e]) && null != n.__e) return n.__e;
    return "function" == typeof t.type ? M(t) : null;
  }
  function S(t) {
    var e, n;
    if (null != (t = t.__) && null != t.__c) {
      for (t.__e = t.__c.base = null, e = 0; e < t.__k.length; e++)
        if (null != (n = t.__k[e]) && null != n.__e) {
          t.__e = t.__c.base = n.__e;
          break;
        }
      return S(t);
    }
  }
  function T(t) {
    ((!t.__d && (t.__d = !0) && s.push(t) && !E.__r++) ||
      o !== i.debounceRendering) &&
      ((o = i.debounceRendering) || a)(E);
  }
  function E() {
    var t, e, n, r, o, a, c, h;
    for (s.sort(l); (t = s.shift()); )
      t.__d &&
        ((e = s.length),
        (r = void 0),
        (a = (o = (n = t).__v).__e),
        (c = []),
        (h = []),
        n.__P &&
          (((r = x({}, o)).__v = o.__v + 1),
          i.vnode && i.vnode(r),
          I(
            n.__P,
            r,
            o,
            n.__n,
            n.__P.namespaceURI,
            32 & o.__u ? [a] : null,
            c,
            null == a ? M(o) : a,
            !!(32 & o.__u),
            h
          ),
          (r.__v = o.__v),
          (r.__.__k[r.__i] = r),
          N(c, r, h),
          r.__e != a && S(r)),
        s.length > e && s.sort(l));
    E.__r = 0;
  }
  function A(t, e, n, i, r, s, o, a, l, c, h) {
    var u,
      d,
      p,
      g,
      x,
      _,
      w = (i && i.__k) || f,
      S = e.length;
    for (
      l = (function (t, e, n, i, r) {
        var s,
          o,
          a,
          l,
          c,
          h = n.length,
          u = h,
          d = 0;
        for (t.__k = new Array(r), s = 0; s < r; s++)
          null != (o = e[s]) && "boolean" != typeof o && "function" != typeof o
            ? ((l = s + d),
              ((o = t.__k[s] =
                "string" == typeof o ||
                "number" == typeof o ||
                "bigint" == typeof o ||
                o.constructor == String
                  ? y(null, o, null, null, null)
                  : v(o)
                  ? y(b, { children: o }, null, null, null)
                  : void 0 === o.constructor && o.__b > 0
                  ? y(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v)
                  : o).__ = t),
              (o.__b = t.__b + 1),
              (a = null),
              -1 !== (c = o.__i = R(o, n, l, u)) &&
                (u--, (a = n[c]) && (a.__u |= 2)),
              null == a || null === a.__v
                ? (-1 == c && d--, "function" != typeof o.type && (o.__u |= 4))
                : c != l &&
                  (c == l - 1
                    ? d--
                    : c == l + 1
                    ? d++
                    : (c > l ? d-- : d++, (o.__u |= 4))))
            : (t.__k[s] = null);
        if (u)
          for (s = 0; s < h; s++)
            null != (a = n[s]) &&
              !(2 & a.__u) &&
              (a.__e == i && (i = M(a)), O(a, a));
        return i;
      })(n, e, w, l, S),
        u = 0;
      u < S;
      u++
    )
      null != (p = n.__k[u]) &&
        ((d = -1 === p.__i ? m : w[p.__i] || m),
        (p.__i = u),
        (_ = I(t, p, d, r, s, o, a, l, c, h)),
        (g = p.__e),
        p.ref &&
          d.ref != p.ref &&
          (d.ref && k(d.ref, null, p), h.push(p.ref, p.__c || g, p)),
        null == x && null != g && (x = g),
        4 & p.__u || d.__k === p.__k
          ? (l = L(p, l, t))
          : "function" == typeof p.type && void 0 !== _
          ? (l = _)
          : g && (l = g.nextSibling),
        (p.__u &= -7));
    return (n.__e = x), l;
  }
  function L(t, e, n) {
    var i, r;
    if ("function" == typeof t.type) {
      for (i = t.__k, r = 0; i && r < i.length; r++)
        i[r] && ((i[r].__ = t), (e = L(i[r], e, n)));
      return e;
    }
    t.__e != e &&
      (e && t.type && !n.contains(e) && (e = M(t)),
      n.insertBefore(t.__e, e || null),
      (e = t.__e));
    do {
      e = e && e.nextSibling;
    } while (null != e && 8 == e.nodeType);
    return e;
  }
  function R(t, e, n, i) {
    var r,
      s,
      o = t.key,
      a = t.type,
      l = e[n];
    if (null === l || (l && o == l.key && a === l.type && !(2 & l.__u)))
      return n;
    if (i > (null == l || 2 & l.__u ? 0 : 1))
      for (r = n - 1, s = n + 1; r >= 0 || s < e.length; ) {
        if (r >= 0) {
          if ((l = e[r]) && !(2 & l.__u) && o == l.key && a === l.type)
            return r;
          r--;
        }
        if (s < e.length) {
          if ((l = e[s]) && !(2 & l.__u) && o == l.key && a === l.type)
            return s;
          s++;
        }
      }
    return -1;
  }
  function C(t, e, n) {
    "-" == e[0]
      ? t.setProperty(e, null == n ? "" : n)
      : (t[e] =
          null == n ? "" : "number" != typeof n || g.test(e) ? n : n + "px");
  }
  function P(t, e, n, i, r) {
    var s;
    t: if ("style" == e)
      if ("string" == typeof n) t.style.cssText = n;
      else {
        if (("string" == typeof i && (t.style.cssText = i = ""), i))
          for (e in i) (n && e in n) || C(t.style, e, "");
        if (n) for (e in n) (i && n[e] === i[e]) || C(t.style, e, n[e]);
      }
    else if ("o" == e[0] && "n" == e[1])
      (s = e != (e = e.replace(c, "$1"))),
        (e =
          e.toLowerCase() in t || "onFocusOut" == e || "onFocusIn" == e
            ? e.toLowerCase().slice(2)
            : e.slice(2)),
        t.l || (t.l = {}),
        (t.l[e + s] = n),
        n
          ? i
            ? (n.u = i.u)
            : ((n.u = h), t.addEventListener(e, s ? d : u, s))
          : t.removeEventListener(e, s ? d : u, s);
    else {
      if ("http://www.w3.org/2000/svg" == r)
        e = e.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (
        "width" != e &&
        "height" != e &&
        "href" != e &&
        "list" != e &&
        "form" != e &&
        "tabIndex" != e &&
        "download" != e &&
        "rowSpan" != e &&
        "colSpan" != e &&
        "role" != e &&
        "popover" != e &&
        e in t
      )
        try {
          t[e] = null == n ? "" : n;
          break t;
        } catch (t) {}
      "function" == typeof n ||
        (null == n || (!1 === n && "-" != e[4])
          ? t.removeAttribute(e)
          : t.setAttribute(e, "popover" == e && 1 == n ? "" : n));
    }
  }
  function D(t) {
    return function (e) {
      if (this.l) {
        var n = this.l[e.type + t];
        if (null == e.t) e.t = h++;
        else if (e.t < n.u) return;
        return n(i.event ? i.event(e) : e);
      }
    };
  }
  function I(t, e, n, r, s, o, a, l, c, h) {
    var u,
      d,
      p,
      m,
      f,
      g,
      y,
      M,
      S,
      T,
      E,
      L,
      R,
      C,
      P,
      D,
      I,
      N = e.type;
    if (void 0 !== e.constructor) return null;
    128 & n.__u && ((c = !!(32 & n.__u)), (o = [(l = e.__e = n.__e)])),
      (u = i.__b) && u(e);
    t: if ("function" == typeof N)
      try {
        if (
          ((M = e.props),
          (S = "prototype" in N && N.prototype.render),
          (T = (u = N.contextType) && r[u.__c]),
          (E = u ? (T ? T.props.value : u.__) : r),
          n.__c
            ? (y = (d = e.__c = n.__c).__ = d.__E)
            : (S
                ? (e.__c = d = new N(M, E))
                : ((e.__c = d = new w(M, E)),
                  (d.constructor = N),
                  (d.render = F)),
              T && T.sub(d),
              (d.props = M),
              d.state || (d.state = {}),
              (d.context = E),
              (d.__n = r),
              (p = d.__d = !0),
              (d.__h = []),
              (d._sb = [])),
          S && null == d.__s && (d.__s = d.state),
          S &&
            null != N.getDerivedStateFromProps &&
            (d.__s == d.state && (d.__s = x({}, d.__s)),
            x(d.__s, N.getDerivedStateFromProps(M, d.__s))),
          (m = d.props),
          (f = d.state),
          (d.__v = e),
          p)
        )
          S &&
            null == N.getDerivedStateFromProps &&
            null != d.componentWillMount &&
            d.componentWillMount(),
            S && null != d.componentDidMount && d.__h.push(d.componentDidMount);
        else {
          if (
            (S &&
              null == N.getDerivedStateFromProps &&
              M !== m &&
              null != d.componentWillReceiveProps &&
              d.componentWillReceiveProps(M, E),
            !d.__e &&
              ((null != d.shouldComponentUpdate &&
                !1 === d.shouldComponentUpdate(M, d.__s, E)) ||
                e.__v == n.__v))
          ) {
            for (
              e.__v != n.__v &&
                ((d.props = M), (d.state = d.__s), (d.__d = !1)),
                e.__e = n.__e,
                e.__k = n.__k,
                e.__k.some(function (t) {
                  t && (t.__ = e);
                }),
                L = 0;
              L < d._sb.length;
              L++
            )
              d.__h.push(d._sb[L]);
            (d._sb = []), d.__h.length && a.push(d);
            break t;
          }
          null != d.componentWillUpdate && d.componentWillUpdate(M, d.__s, E),
            S &&
              null != d.componentDidUpdate &&
              d.__h.push(function () {
                d.componentDidUpdate(m, f, g);
              });
        }
        if (
          ((d.context = E),
          (d.props = M),
          (d.__P = t),
          (d.__e = !1),
          (R = i.__r),
          (C = 0),
          S)
        ) {
          for (
            d.state = d.__s,
              d.__d = !1,
              R && R(e),
              u = d.render(d.props, d.state, d.context),
              P = 0;
            P < d._sb.length;
            P++
          )
            d.__h.push(d._sb[P]);
          d._sb = [];
        } else
          do {
            (d.__d = !1),
              R && R(e),
              (u = d.render(d.props, d.state, d.context)),
              (d.state = d.__s);
          } while (d.__d && ++C < 25);
        (d.state = d.__s),
          null != d.getChildContext && (r = x(x({}, r), d.getChildContext())),
          S &&
            !p &&
            null != d.getSnapshotBeforeUpdate &&
            (g = d.getSnapshotBeforeUpdate(m, f)),
          (l = A(
            t,
            v(
              (D =
                null != u && u.type === b && null == u.key
                  ? u.props.children
                  : u)
            )
              ? D
              : [D],
            e,
            n,
            r,
            s,
            o,
            a,
            l,
            c,
            h
          )),
          (d.base = e.__e),
          (e.__u &= -161),
          d.__h.length && a.push(d),
          y && (d.__E = d.__ = null);
      } catch (t) {
        if (((e.__v = null), c || null != o))
          if (t.then) {
            for (
              e.__u |= c ? 160 : 128;
              l && 8 == l.nodeType && l.nextSibling;

            )
              l = l.nextSibling;
            (o[o.indexOf(l)] = null), (e.__e = l);
          } else for (I = o.length; I--; ) _(o[I]);
        else (e.__e = n.__e), (e.__k = n.__k);
        i.__e(t, e, n);
      }
    else
      null == o && e.__v == n.__v
        ? ((e.__k = n.__k), (e.__e = n.__e))
        : (l = e.__e = z(n.__e, e, n, r, s, o, a, c, h));
    return (u = i.diffed) && u(e), 128 & e.__u ? void 0 : l;
  }
  function N(t, e, n) {
    for (var r = 0; r < n.length; r++) k(n[r], n[++r], n[++r]);
    i.__c && i.__c(e, t),
      t.some(function (e) {
        try {
          (t = e.__h),
            (e.__h = []),
            t.some(function (t) {
              t.call(e);
            });
        } catch (t) {
          i.__e(t, e.__v);
        }
      });
  }
  function z(t, e, r, s, o, a, l, c, h) {
    var u,
      d,
      p,
      f,
      g,
      x,
      y,
      b = r.props,
      w = e.props,
      S = e.type;
    if (
      ("svg" == S
        ? (o = "http://www.w3.org/2000/svg")
        : "math" == S
        ? (o = "http://www.w3.org/1998/Math/MathML")
        : o || (o = "http://www.w3.org/1999/xhtml"),
      null != a)
    )
      for (u = 0; u < a.length; u++)
        if (
          (g = a[u]) &&
          "setAttribute" in g == !!S &&
          (S ? g.localName == S : 3 == g.nodeType)
        ) {
          (t = g), (a[u] = null);
          break;
        }
    if (null == t) {
      if (null == S) return document.createTextNode(w);
      (t = document.createElementNS(o, S, w.is && w)),
        c && (i.__m && i.__m(e, a), (c = !1)),
        (a = null);
    }
    if (null === S) b === w || (c && t.data === w) || (t.data = w);
    else {
      if (
        ((a = a && n.call(t.childNodes)), (b = r.props || m), !c && null != a)
      )
        for (b = {}, u = 0; u < t.attributes.length; u++)
          b[(g = t.attributes[u]).name] = g.value;
      for (u in b)
        if (((g = b[u]), "children" == u));
        else if ("dangerouslySetInnerHTML" == u) p = g;
        else if (!(u in w)) {
          if (
            ("value" == u && "defaultValue" in w) ||
            ("checked" == u && "defaultChecked" in w)
          )
            continue;
          P(t, u, null, g, o);
        }
      for (u in w)
        (g = w[u]),
          "children" == u
            ? (f = g)
            : "dangerouslySetInnerHTML" == u
            ? (d = g)
            : "value" == u
            ? (x = g)
            : "checked" == u
            ? (y = g)
            : (c && "function" != typeof g) ||
              b[u] === g ||
              P(t, u, g, b[u], o);
      if (d)
        c ||
          (p && (d.__html === p.__html || d.__html === t.innerHTML)) ||
          (t.innerHTML = d.__html),
          (e.__k = []);
      else if (
        (p && (t.innerHTML = ""),
        A(
          t,
          v(f) ? f : [f],
          e,
          r,
          s,
          "foreignObject" == S ? "http://www.w3.org/1999/xhtml" : o,
          a,
          l,
          a ? a[0] : r.__k && M(r, 0),
          c,
          h
        ),
        null != a)
      )
        for (u = a.length; u--; ) _(a[u]);
      c ||
        ((u = "value"),
        "progress" == S && null == x
          ? t.removeAttribute("value")
          : void 0 !== x &&
            (x !== t[u] ||
              ("progress" == S && !x) ||
              ("option" == S && x !== b[u])) &&
            P(t, u, x, b[u], o),
        (u = "checked"),
        void 0 !== y && y !== t[u] && P(t, u, y, b[u], o));
    }
    return t;
  }
  function k(t, e, n) {
    try {
      if ("function" == typeof t) {
        var r = "function" == typeof t.__u;
        r && t.__u(), (r && null == e) || (t.__u = t(e));
      } else t.current = e;
    } catch (t) {
      i.__e(t, n);
    }
  }
  function O(t, e, n) {
    var r, s;
    if (
      (i.unmount && i.unmount(t),
      (r = t.ref) && ((r.current && r.current !== t.__e) || k(r, null, e)),
      null != (r = t.__c))
    ) {
      if (r.componentWillUnmount)
        try {
          r.componentWillUnmount();
        } catch (t) {
          i.__e(t, e);
        }
      r.base = r.__P = null;
    }
    if ((r = t.__k))
      for (s = 0; s < r.length; s++)
        r[s] && O(r[s], e, n || "function" != typeof t.type);
    n || _(t.__e), (t.__c = t.__ = t.__e = void 0);
  }
  function F(t, e, n) {
    return this.constructor(t, n);
  }
  function U(t, e, r) {
    var s, o, a;
    e == document && (e = document.documentElement),
      i.__ && i.__(t, e),
      (s = !1 ? null : e.__k),
      (o = []),
      (a = []),
      I(
        e,
        (t = e.__k =
          (function (t, e, i) {
            var r,
              s,
              o,
              a = {};
            for (o in e)
              "key" == o ? (r = e[o]) : "ref" == o ? (s = e[o]) : (a[o] = e[o]);
            if (
              (arguments.length > 2 &&
                (a.children = arguments.length > 3 ? n.call(arguments, 2) : i),
              "function" == typeof t && null != t.defaultProps)
            )
              for (o in t.defaultProps)
                void 0 === a[o] && (a[o] = t.defaultProps[o]);
            return y(t, a, r, s, null);
          })(b, null, [t])),
        s || m,
        m,
        e.namespaceURI,
        s ? null : e.firstChild ? n.call(e.childNodes) : null,
        o,
        s ? s.__e : e.firstChild,
        false,
        a
      ),
      N(o, t, a);
  }
  (n = f.slice),
    (i = {
      __e: function (t, e, n, i) {
        for (var r, s, o; (e = e.__); )
          if ((r = e.__c) && !r.__)
            try {
              if (
                ((s = r.constructor) &&
                  null != s.getDerivedStateFromError &&
                  (r.setState(s.getDerivedStateFromError(t)), (o = r.__d)),
                null != r.componentDidCatch &&
                  (r.componentDidCatch(t, i || {}), (o = r.__d)),
                o)
              )
                return (r.__E = r);
            } catch (e) {
              t = e;
            }
        throw t;
      },
    }),
    (r = 0),
    (w.prototype.setState = function (t, e) {
      var n;
      (n =
        null != this.__s && this.__s !== this.state
          ? this.__s
          : (this.__s = x({}, this.state))),
        "function" == typeof t && (t = t(x({}, n), this.props)),
        t && x(n, t),
        null != t && this.__v && (e && this._sb.push(e), T(this));
    }),
    (w.prototype.forceUpdate = function (t) {
      this.__v && ((this.__e = !0), t && this.__h.push(t), T(this));
    }),
    (w.prototype.render = b),
    (s = []),
    (a =
      "function" == typeof Promise
        ? Promise.prototype.then.bind(Promise.resolve())
        : setTimeout),
    (l = function (t, e) {
      return t.__v.__b - e.__v.__b;
    }),
    (E.__r = 0),
    (c = /(PointerCapture)$|Capture$/i),
    (h = 0),
    (u = D(!1)),
    (d = D(!0));
  var B = 0;
  function H(t, e, n, r, s, o) {
    e || (e = {});
    var a,
      l,
      c = e;
    if ("ref" in c)
      for (l in ((c = {}), e)) "ref" == l ? (a = e[l]) : (c[l] = e[l]);
    var h = {
      type: t,
      props: c,
      key: n,
      ref: a,
      __k: null,
      __: null,
      __b: 0,
      __e: null,
      __c: null,
      constructor: void 0,
      __v: --B,
      __i: -1,
      __u: 0,
      __source: s,
      __self: o,
    };
    if ("function" == typeof t && (a = t.defaultProps))
      for (l in a) void 0 === c[l] && (c[l] = a[l]);
    return i.vnode && i.vnode(h), h;
  }
  var G,
    V,
    W,
    j,
    Z = 0,
    Y = [],
    X = i,
    q = X.__b,
    J = X.__r,
    Q = X.diffed,
    K = X.__c,
    $ = X.unmount,
    tt = X.__;
  function et(t, e) {
    X.__h && X.__h(V, t, Z || e), (Z = 0);
    var n = V.__H || (V.__H = { __: [], __h: [] });
    return t >= n.__.length && n.__.push({}), n.__[t];
  }
  function nt(t) {
    return (
      (Z = 1),
      (function (t, e) {
        var n = et(G++, 2);
        if (
          ((n.t = t),
          !n.__c &&
            ((n.__ = [
              ct(void 0, e),
              function (t) {
                var e = n.__N ? n.__N[0] : n.__[0],
                  i = n.t(e, t);
                e !== i && ((n.__N = [i, n.__[1]]), n.__c.setState({}));
              },
            ]),
            (n.__c = V),
            !V.u))
        ) {
          var i = function (t, e, i) {
            if (!n.__c.__H) return !0;
            var s = n.__c.__H.__.filter(function (t) {
              return !!t.__c;
            });
            if (
              s.every(function (t) {
                return !t.__N;
              })
            )
              return !r || r.call(this, t, e, i);
            var o = n.__c.props !== t;
            return (
              s.forEach(function (t) {
                if (t.__N) {
                  var e = t.__[0];
                  (t.__ = t.__N), (t.__N = void 0), e !== t.__[0] && (o = !0);
                }
              }),
              (r && r.call(this, t, e, i)) || o
            );
          };
          V.u = !0;
          var r = V.shouldComponentUpdate,
            s = V.componentWillUpdate;
          (V.componentWillUpdate = function (t, e, n) {
            if (this.__e) {
              var o = r;
              (r = void 0), i(t, e, n), (r = o);
            }
            s && s.call(this, t, e, n);
          }),
            (V.shouldComponentUpdate = i);
        }
        return n.__N || n.__;
      })(ct, t)
    );
  }
  function it(t, e) {
    var n = et(G++, 3);
    !X.__s &&
      (function (t, e) {
        return (
          !t ||
          t.length !== e.length ||
          e.some(function (e, n) {
            return e !== t[n];
          })
        );
      })(n.__H, e) &&
      ((n.__ = t), (n.i = e), V.__H.__h.push(n));
  }
  function rt() {
    for (var t; (t = Y.shift()); )
      if (t.__P && t.__H)
        try {
          t.__H.__h.forEach(at), t.__H.__h.forEach(lt), (t.__H.__h = []);
        } catch (e) {
          (t.__H.__h = []), X.__e(e, t.__v);
        }
  }
  (X.__b = function (t) {
    (V = null), q && q(t);
  }),
    (X.__ = function (t, e) {
      t && e.__k && e.__k.__m && (t.__m = e.__k.__m), tt && tt(t, e);
    }),
    (X.__r = function (t) {
      J && J(t), (G = 0);
      var e = (V = t.__c).__H;
      e &&
        (W === V
          ? ((e.__h = []),
            (V.__h = []),
            e.__.forEach(function (t) {
              t.__N && (t.__ = t.__N), (t.i = t.__N = void 0);
            }))
          : (e.__h.forEach(at), e.__h.forEach(lt), (e.__h = []), (G = 0))),
        (W = V);
    }),
    (X.diffed = function (t) {
      Q && Q(t);
      var e = t.__c;
      e &&
        e.__H &&
        (e.__H.__h.length &&
          ((1 !== Y.push(e) && j === X.requestAnimationFrame) ||
            ((j = X.requestAnimationFrame) || ot)(rt)),
        e.__H.__.forEach(function (t) {
          t.i && (t.__H = t.i), (t.i = void 0);
        })),
        (W = V = null);
    }),
    (X.__c = function (t, e) {
      e.some(function (t) {
        try {
          t.__h.forEach(at),
            (t.__h = t.__h.filter(function (t) {
              return !t.__ || lt(t);
            }));
        } catch (n) {
          e.some(function (t) {
            t.__h && (t.__h = []);
          }),
            (e = []),
            X.__e(n, t.__v);
        }
      }),
        K && K(t, e);
    }),
    (X.unmount = function (t) {
      $ && $(t);
      var e,
        n = t.__c;
      n &&
        n.__H &&
        (n.__H.__.forEach(function (t) {
          try {
            at(t);
          } catch (t) {
            e = t;
          }
        }),
        (n.__H = void 0),
        e && X.__e(e, n.__v));
    });
  var st = "function" == typeof requestAnimationFrame;
  function ot(t) {
    var e,
      n = function () {
        clearTimeout(i), st && cancelAnimationFrame(e), setTimeout(t);
      },
      i = setTimeout(n, 100);
    st && (e = requestAnimationFrame(n));
  }
  function at(t) {
    var e = V,
      n = t.__c;
    "function" == typeof n && ((t.__c = void 0), n()), (V = e);
  }
  function lt(t) {
    var e = V;
    (t.__c = t.__()), (V = e);
  }
  function ct(t, e) {
    return "function" == typeof e ? e(t) : e;
  }
  /**
   * @license
   * Copyright 2010-2021 Three.js Authors
   * SPDX-License-Identifier: MIT
   */ const ht = "136",
    ut = 0,
    dt = 1,
    pt = 2,
    mt = 0,
    ft = 1,
    gt = 2,
    vt = 3,
    xt = 100,
    _t = 101,
    yt = 102,
    bt = 200,
    wt = 201,
    Mt = 202,
    St = 203,
    Tt = 204,
    Et = 205,
    At = 206,
    Lt = 207,
    Rt = 208,
    Ct = 209,
    Pt = 210,
    Dt = 301,
    It = 302,
    Nt = 306,
    zt = 1e3,
    kt = 1001,
    Ot = 1002,
    Ft = 1003,
    Ut = 1004,
    Bt = 1005,
    Ht = 1006,
    Gt = 1007,
    Vt = 1008,
    Wt = 1009,
    jt = 1012,
    Zt = 1014,
    Yt = 1015,
    Xt = 1016,
    qt = 1020,
    Jt = 1022,
    Qt = 1023,
    Kt = 1026,
    $t = 1027,
    te = 2300,
    ee = 2301,
    ne = 2302,
    ie = 2400,
    re = 2401,
    se = 2402,
    oe = 2500,
    ae = 3e3,
    le = 3001,
    ce = 7680,
    he = 35044,
    ue = 35048,
    de = "300 es";
  class pe {
    addEventListener(t, e) {
      void 0 === this._listeners && (this._listeners = {});
      const n = this._listeners;
      void 0 === n[t] && (n[t] = []), -1 === n[t].indexOf(e) && n[t].push(e);
    }
    hasEventListener(t, e) {
      if (void 0 === this._listeners) return !1;
      const n = this._listeners;
      return void 0 !== n[t] && -1 !== n[t].indexOf(e);
    }
    removeEventListener(t, e) {
      if (void 0 === this._listeners) return;
      const n = this._listeners[t];
      if (void 0 !== n) {
        const t = n.indexOf(e);
        -1 !== t && n.splice(t, 1);
      }
    }
    dispatchEvent(t) {
      if (void 0 === this._listeners) return;
      const e = this._listeners[t.type];
      if (void 0 !== e) {
        t.target = this;
        const n = e.slice(0);
        for (let e = 0, i = n.length; e < i; e++) n[e].call(this, t);
        t.target = null;
      }
    }
  }
  const me = [];
  for (let t = 0; t < 256; t++) me[t] = (t < 16 ? "0" : "") + t.toString(16);
  const fe = Math.PI / 180,
    ge = 180 / Math.PI;
  function ve() {
    const t = (4294967295 * Math.random()) | 0,
      e = (4294967295 * Math.random()) | 0,
      n = (4294967295 * Math.random()) | 0,
      i = (4294967295 * Math.random()) | 0;
    return (
      me[255 & t] +
      me[(t >> 8) & 255] +
      me[(t >> 16) & 255] +
      me[(t >> 24) & 255] +
      "-" +
      me[255 & e] +
      me[(e >> 8) & 255] +
      "-" +
      me[((e >> 16) & 15) | 64] +
      me[(e >> 24) & 255] +
      "-" +
      me[(63 & n) | 128] +
      me[(n >> 8) & 255] +
      "-" +
      me[(n >> 16) & 255] +
      me[(n >> 24) & 255] +
      me[255 & i] +
      me[(i >> 8) & 255] +
      me[(i >> 16) & 255] +
      me[(i >> 24) & 255]
    ).toUpperCase();
  }
  function xe(t, e, n) {
    return Math.max(e, Math.min(n, t));
  }
  function _e(t, e, n) {
    return (1 - n) * t + n * e;
  }
  function ye(t) {
    return !(t & (t - 1)) && 0 !== t;
  }
  function be(t) {
    return Math.pow(2, Math.floor(Math.log(t) / Math.LN2));
  }
  class we {
    constructor(t = 0, e = 0) {
      (this.x = t), (this.y = e);
    }
    get width() {
      return this.x;
    }
    set width(t) {
      this.x = t;
    }
    get height() {
      return this.y;
    }
    set height(t) {
      this.y = t;
    }
    set(t, e) {
      return (this.x = t), (this.y = e), this;
    }
    setScalar(t) {
      return (this.x = t), (this.y = t), this;
    }
    setX(t) {
      return (this.x = t), this;
    }
    setY(t) {
      return (this.y = t), this;
    }
    setComponent(t, e) {
      switch (t) {
        case 0:
          this.x = e;
          break;
        case 1:
          this.y = e;
          break;
        default:
          throw new Error("index is out of range: " + t);
      }
      return this;
    }
    getComponent(t) {
      switch (t) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("index is out of range: " + t);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y);
    }
    copy(t) {
      return (this.x = t.x), (this.y = t.y), this;
    }
    add(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."
          ),
          this.addVectors(t, e))
        : ((this.x += t.x), (this.y += t.y), this);
    }
    addScalar(t) {
      return (this.x += t), (this.y += t), this;
    }
    addVectors(t, e) {
      return (this.x = t.x + e.x), (this.y = t.y + e.y), this;
    }
    addScaledVector(t, e) {
      return (this.x += t.x * e), (this.y += t.y * e), this;
    }
    sub(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."
          ),
          this.subVectors(t, e))
        : ((this.x -= t.x), (this.y -= t.y), this);
    }
    subScalar(t) {
      return (this.x -= t), (this.y -= t), this;
    }
    subVectors(t, e) {
      return (this.x = t.x - e.x), (this.y = t.y - e.y), this;
    }
    multiply(t) {
      return (this.x *= t.x), (this.y *= t.y), this;
    }
    multiplyScalar(t) {
      return (this.x *= t), (this.y *= t), this;
    }
    divide(t) {
      return (this.x /= t.x), (this.y /= t.y), this;
    }
    divideScalar(t) {
      return this.multiplyScalar(1 / t);
    }
    applyMatrix3(t) {
      const e = this.x,
        n = this.y,
        i = t.elements;
      return (
        (this.x = i[0] * e + i[3] * n + i[6]),
        (this.y = i[1] * e + i[4] * n + i[7]),
        this
      );
    }
    min(t) {
      return (
        (this.x = Math.min(this.x, t.x)), (this.y = Math.min(this.y, t.y)), this
      );
    }
    max(t) {
      return (
        (this.x = Math.max(this.x, t.x)), (this.y = Math.max(this.y, t.y)), this
      );
    }
    clamp(t, e) {
      return (
        (this.x = Math.max(t.x, Math.min(e.x, this.x))),
        (this.y = Math.max(t.y, Math.min(e.y, this.y))),
        this
      );
    }
    clampScalar(t, e) {
      return (
        (this.x = Math.max(t, Math.min(e, this.x))),
        (this.y = Math.max(t, Math.min(e, this.y))),
        this
      );
    }
    clampLength(t, e) {
      const n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(
        Math.max(t, Math.min(e, n))
      );
    }
    floor() {
      return (this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this;
    }
    ceil() {
      return (this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this;
    }
    round() {
      return (this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this;
    }
    roundToZero() {
      return (
        (this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x)),
        (this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y)),
        this
      );
    }
    negate() {
      return (this.x = -this.x), (this.y = -this.y), this;
    }
    dot(t) {
      return this.x * t.x + this.y * t.y;
    }
    cross(t) {
      return this.x * t.y - this.y * t.x;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    angle() {
      return Math.atan2(-this.y, -this.x) + Math.PI;
    }
    distanceTo(t) {
      return Math.sqrt(this.distanceToSquared(t));
    }
    distanceToSquared(t) {
      const e = this.x - t.x,
        n = this.y - t.y;
      return e * e + n * n;
    }
    manhattanDistanceTo(t) {
      return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
    }
    setLength(t) {
      return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
      return (
        (this.x += (t.x - this.x) * e), (this.y += (t.y - this.y) * e), this
      );
    }
    lerpVectors(t, e, n) {
      return (
        (this.x = t.x + (e.x - t.x) * n), (this.y = t.y + (e.y - t.y) * n), this
      );
    }
    equals(t) {
      return t.x === this.x && t.y === this.y;
    }
    fromArray(t, e = 0) {
      return (this.x = t[e]), (this.y = t[e + 1]), this;
    }
    toArray(t = [], e = 0) {
      return (t[e] = this.x), (t[e + 1] = this.y), t;
    }
    fromBufferAttribute(t, e, n) {
      return (
        void 0 !== n &&
          console.warn(
            "THREE.Vector2: offset has been removed from .fromBufferAttribute()."
          ),
        (this.x = t.getX(e)),
        (this.y = t.getY(e)),
        this
      );
    }
    rotateAround(t, e) {
      const n = Math.cos(e),
        i = Math.sin(e),
        r = this.x - t.x,
        s = this.y - t.y;
      return (
        (this.x = r * n - s * i + t.x), (this.y = r * i + s * n + t.y), this
      );
    }
    random() {
      return (this.x = Math.random()), (this.y = Math.random()), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y;
    }
  }
  we.prototype.isVector2 = !0;
  class Me {
    constructor() {
      (this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]),
        arguments.length > 0 &&
          console.error(
            "THREE.Matrix3: the constructor no longer reads arguments. use .set() instead."
          );
    }
    set(t, e, n, i, r, s, o, a, l) {
      const c = this.elements;
      return (
        (c[0] = t),
        (c[1] = i),
        (c[2] = o),
        (c[3] = e),
        (c[4] = r),
        (c[5] = a),
        (c[6] = n),
        (c[7] = s),
        (c[8] = l),
        this
      );
    }
    identity() {
      return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
    }
    copy(t) {
      const e = this.elements,
        n = t.elements;
      return (
        (e[0] = n[0]),
        (e[1] = n[1]),
        (e[2] = n[2]),
        (e[3] = n[3]),
        (e[4] = n[4]),
        (e[5] = n[5]),
        (e[6] = n[6]),
        (e[7] = n[7]),
        (e[8] = n[8]),
        this
      );
    }
    extractBasis(t, e, n) {
      return (
        t.setFromMatrix3Column(this, 0),
        e.setFromMatrix3Column(this, 1),
        n.setFromMatrix3Column(this, 2),
        this
      );
    }
    setFromMatrix4(t) {
      const e = t.elements;
      return (
        this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]), this
      );
    }
    multiply(t) {
      return this.multiplyMatrices(this, t);
    }
    premultiply(t) {
      return this.multiplyMatrices(t, this);
    }
    multiplyMatrices(t, e) {
      const n = t.elements,
        i = e.elements,
        r = this.elements,
        s = n[0],
        o = n[3],
        a = n[6],
        l = n[1],
        c = n[4],
        h = n[7],
        u = n[2],
        d = n[5],
        p = n[8],
        m = i[0],
        f = i[3],
        g = i[6],
        v = i[1],
        x = i[4],
        _ = i[7],
        y = i[2],
        b = i[5],
        w = i[8];
      return (
        (r[0] = s * m + o * v + a * y),
        (r[3] = s * f + o * x + a * b),
        (r[6] = s * g + o * _ + a * w),
        (r[1] = l * m + c * v + h * y),
        (r[4] = l * f + c * x + h * b),
        (r[7] = l * g + c * _ + h * w),
        (r[2] = u * m + d * v + p * y),
        (r[5] = u * f + d * x + p * b),
        (r[8] = u * g + d * _ + p * w),
        this
      );
    }
    multiplyScalar(t) {
      const e = this.elements;
      return (
        (e[0] *= t),
        (e[3] *= t),
        (e[6] *= t),
        (e[1] *= t),
        (e[4] *= t),
        (e[7] *= t),
        (e[2] *= t),
        (e[5] *= t),
        (e[8] *= t),
        this
      );
    }
    determinant() {
      const t = this.elements,
        e = t[0],
        n = t[1],
        i = t[2],
        r = t[3],
        s = t[4],
        o = t[5],
        a = t[6],
        l = t[7],
        c = t[8];
      return (
        e * s * c - e * o * l - n * r * c + n * o * a + i * r * l - i * s * a
      );
    }
    invert() {
      const t = this.elements,
        e = t[0],
        n = t[1],
        i = t[2],
        r = t[3],
        s = t[4],
        o = t[5],
        a = t[6],
        l = t[7],
        c = t[8],
        h = c * s - o * l,
        u = o * a - c * r,
        d = l * r - s * a,
        p = e * h + n * u + i * d;
      if (0 === p) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      const m = 1 / p;
      return (
        (t[0] = h * m),
        (t[1] = (i * l - c * n) * m),
        (t[2] = (o * n - i * s) * m),
        (t[3] = u * m),
        (t[4] = (c * e - i * a) * m),
        (t[5] = (i * r - o * e) * m),
        (t[6] = d * m),
        (t[7] = (n * a - l * e) * m),
        (t[8] = (s * e - n * r) * m),
        this
      );
    }
    transpose() {
      let t;
      const e = this.elements;
      return (
        (t = e[1]),
        (e[1] = e[3]),
        (e[3] = t),
        (t = e[2]),
        (e[2] = e[6]),
        (e[6] = t),
        (t = e[5]),
        (e[5] = e[7]),
        (e[7] = t),
        this
      );
    }
    getNormalMatrix(t) {
      return this.setFromMatrix4(t).invert().transpose();
    }
    transposeIntoArray(t) {
      const e = this.elements;
      return (
        (t[0] = e[0]),
        (t[1] = e[3]),
        (t[2] = e[6]),
        (t[3] = e[1]),
        (t[4] = e[4]),
        (t[5] = e[7]),
        (t[6] = e[2]),
        (t[7] = e[5]),
        (t[8] = e[8]),
        this
      );
    }
    setUvTransform(t, e, n, i, r, s, o) {
      const a = Math.cos(r),
        l = Math.sin(r);
      return (
        this.set(
          n * a,
          n * l,
          -n * (a * s + l * o) + s + t,
          -i * l,
          i * a,
          -i * (-l * s + a * o) + o + e,
          0,
          0,
          1
        ),
        this
      );
    }
    scale(t, e) {
      const n = this.elements;
      return (
        (n[0] *= t),
        (n[3] *= t),
        (n[6] *= t),
        (n[1] *= e),
        (n[4] *= e),
        (n[7] *= e),
        this
      );
    }
    rotate(t) {
      const e = Math.cos(t),
        n = Math.sin(t),
        i = this.elements,
        r = i[0],
        s = i[3],
        o = i[6],
        a = i[1],
        l = i[4],
        c = i[7];
      return (
        (i[0] = e * r + n * a),
        (i[3] = e * s + n * l),
        (i[6] = e * o + n * c),
        (i[1] = -n * r + e * a),
        (i[4] = -n * s + e * l),
        (i[7] = -n * o + e * c),
        this
      );
    }
    translate(t, e) {
      const n = this.elements;
      return (
        (n[0] += t * n[2]),
        (n[3] += t * n[5]),
        (n[6] += t * n[8]),
        (n[1] += e * n[2]),
        (n[4] += e * n[5]),
        (n[7] += e * n[8]),
        this
      );
    }
    equals(t) {
      const e = this.elements,
        n = t.elements;
      for (let t = 0; t < 9; t++) if (e[t] !== n[t]) return !1;
      return !0;
    }
    fromArray(t, e = 0) {
      for (let n = 0; n < 9; n++) this.elements[n] = t[n + e];
      return this;
    }
    toArray(t = [], e = 0) {
      const n = this.elements;
      return (
        (t[e] = n[0]),
        (t[e + 1] = n[1]),
        (t[e + 2] = n[2]),
        (t[e + 3] = n[3]),
        (t[e + 4] = n[4]),
        (t[e + 5] = n[5]),
        (t[e + 6] = n[6]),
        (t[e + 7] = n[7]),
        (t[e + 8] = n[8]),
        t
      );
    }
    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  }
  function Se(t) {
    if (0 === t.length) return -1 / 0;
    let e = t[0];
    for (let n = 1, i = t.length; n < i; ++n) t[n] > e && (e = t[n]);
    return e;
  }
  function Te(t) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", t);
  }
  let Ee;
  Me.prototype.isMatrix3 = !0;
  class Ae {
    static getDataURL(t) {
      if (/^data:/i.test(t.src)) return t.src;
      if ("undefined" == typeof HTMLCanvasElement) return t.src;
      let e;
      if (t instanceof HTMLCanvasElement) e = t;
      else {
        void 0 === Ee && (Ee = Te("canvas")),
          (Ee.width = t.width),
          (Ee.height = t.height);
        const n = Ee.getContext("2d");
        t instanceof ImageData
          ? n.putImageData(t, 0, 0)
          : n.drawImage(t, 0, 0, t.width, t.height),
          (e = Ee);
      }
      return e.width > 2048 || e.height > 2048
        ? (console.warn(
            "THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",
            t
          ),
          e.toDataURL("image/jpeg", 0.6))
        : e.toDataURL("image/png");
    }
  }
  let Le = 0;
  class Re extends pe {
    constructor(
      t = Re.DEFAULT_IMAGE,
      e = Re.DEFAULT_MAPPING,
      n = 1001,
      i = 1001,
      r = 1006,
      s = 1008,
      o = 1023,
      a = 1009,
      l = 1,
      c = 3e3
    ) {
      super(),
        Object.defineProperty(this, "id", { value: Le++ }),
        (this.uuid = ve()),
        (this.name = ""),
        (this.image = t),
        (this.mipmaps = []),
        (this.mapping = e),
        (this.wrapS = n),
        (this.wrapT = i),
        (this.magFilter = r),
        (this.minFilter = s),
        (this.anisotropy = l),
        (this.format = o),
        (this.internalFormat = null),
        (this.type = a),
        (this.offset = new we(0, 0)),
        (this.repeat = new we(1, 1)),
        (this.center = new we(0, 0)),
        (this.rotation = 0),
        (this.matrixAutoUpdate = !0),
        (this.matrix = new Me()),
        (this.generateMipmaps = !0),
        (this.premultiplyAlpha = !1),
        (this.flipY = !0),
        (this.unpackAlignment = 4),
        (this.encoding = c),
        (this.userData = {}),
        (this.version = 0),
        (this.onUpdate = null),
        (this.isRenderTargetTexture = !1);
    }
    updateMatrix() {
      this.matrix.setUvTransform(
        this.offset.x,
        this.offset.y,
        this.repeat.x,
        this.repeat.y,
        this.rotation,
        this.center.x,
        this.center.y
      );
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      return (
        (this.name = t.name),
        (this.image = t.image),
        (this.mipmaps = t.mipmaps.slice(0)),
        (this.mapping = t.mapping),
        (this.wrapS = t.wrapS),
        (this.wrapT = t.wrapT),
        (this.magFilter = t.magFilter),
        (this.minFilter = t.minFilter),
        (this.anisotropy = t.anisotropy),
        (this.format = t.format),
        (this.internalFormat = t.internalFormat),
        (this.type = t.type),
        this.offset.copy(t.offset),
        this.repeat.copy(t.repeat),
        this.center.copy(t.center),
        (this.rotation = t.rotation),
        (this.matrixAutoUpdate = t.matrixAutoUpdate),
        this.matrix.copy(t.matrix),
        (this.generateMipmaps = t.generateMipmaps),
        (this.premultiplyAlpha = t.premultiplyAlpha),
        (this.flipY = t.flipY),
        (this.unpackAlignment = t.unpackAlignment),
        (this.encoding = t.encoding),
        (this.userData = JSON.parse(JSON.stringify(t.userData))),
        this
      );
    }
    toJSON(t) {
      const e = void 0 === t || "string" == typeof t;
      if (!e && void 0 !== t.textures[this.uuid]) return t.textures[this.uuid];
      const n = {
        metadata: {
          version: 4.5,
          type: "Texture",
          generator: "Texture.toJSON",
        },
        uuid: this.uuid,
        name: this.name,
        mapping: this.mapping,
        repeat: [this.repeat.x, this.repeat.y],
        offset: [this.offset.x, this.offset.y],
        center: [this.center.x, this.center.y],
        rotation: this.rotation,
        wrap: [this.wrapS, this.wrapT],
        format: this.format,
        type: this.type,
        encoding: this.encoding,
        minFilter: this.minFilter,
        magFilter: this.magFilter,
        anisotropy: this.anisotropy,
        flipY: this.flipY,
        premultiplyAlpha: this.premultiplyAlpha,
        unpackAlignment: this.unpackAlignment,
      };
      if (void 0 !== this.image) {
        const i = this.image;
        if (
          (void 0 === i.uuid && (i.uuid = ve()),
          !e && void 0 === t.images[i.uuid])
        ) {
          let e;
          if (Array.isArray(i)) {
            e = [];
            for (let t = 0, n = i.length; t < n; t++)
              i[t].isDataTexture ? e.push(Ce(i[t].image)) : e.push(Ce(i[t]));
          } else e = Ce(i);
          t.images[i.uuid] = { uuid: i.uuid, url: e };
        }
        n.image = i.uuid;
      }
      return (
        "{}" !== JSON.stringify(this.userData) && (n.userData = this.userData),
        e || (t.textures[this.uuid] = n),
        n
      );
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    transformUv(t) {
      if (300 !== this.mapping) return t;
      if ((t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1))
        switch (this.wrapS) {
          case zt:
            t.x = t.x - Math.floor(t.x);
            break;
          case kt:
            t.x = t.x < 0 ? 0 : 1;
            break;
          case Ot:
            1 === Math.abs(Math.floor(t.x) % 2)
              ? (t.x = Math.ceil(t.x) - t.x)
              : (t.x = t.x - Math.floor(t.x));
        }
      if (t.y < 0 || t.y > 1)
        switch (this.wrapT) {
          case zt:
            t.y = t.y - Math.floor(t.y);
            break;
          case kt:
            t.y = t.y < 0 ? 0 : 1;
            break;
          case Ot:
            1 === Math.abs(Math.floor(t.y) % 2)
              ? (t.y = Math.ceil(t.y) - t.y)
              : (t.y = t.y - Math.floor(t.y));
        }
      return this.flipY && (t.y = 1 - t.y), t;
    }
    set needsUpdate(t) {
      !0 === t && this.version++;
    }
  }
  function Ce(t) {
    return ("undefined" != typeof HTMLImageElement &&
      t instanceof HTMLImageElement) ||
      ("undefined" != typeof HTMLCanvasElement &&
        t instanceof HTMLCanvasElement) ||
      ("undefined" != typeof ImageBitmap && t instanceof ImageBitmap)
      ? Ae.getDataURL(t)
      : t.data
      ? {
          data: Array.prototype.slice.call(t.data),
          width: t.width,
          height: t.height,
          type: t.data.constructor.name,
        }
      : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
  }
  (Re.DEFAULT_IMAGE = void 0),
    (Re.DEFAULT_MAPPING = 300),
    (Re.prototype.isTexture = !0);
  class Pe {
    constructor(t = 0, e = 0, n = 0, i = 1) {
      (this.x = t), (this.y = e), (this.z = n), (this.w = i);
    }
    get width() {
      return this.z;
    }
    set width(t) {
      this.z = t;
    }
    get height() {
      return this.w;
    }
    set height(t) {
      this.w = t;
    }
    set(t, e, n, i) {
      return (this.x = t), (this.y = e), (this.z = n), (this.w = i), this;
    }
    setScalar(t) {
      return (this.x = t), (this.y = t), (this.z = t), (this.w = t), this;
    }
    setX(t) {
      return (this.x = t), this;
    }
    setY(t) {
      return (this.y = t), this;
    }
    setZ(t) {
      return (this.z = t), this;
    }
    setW(t) {
      return (this.w = t), this;
    }
    setComponent(t, e) {
      switch (t) {
        case 0:
          this.x = e;
          break;
        case 1:
          this.y = e;
          break;
        case 2:
          this.z = e;
          break;
        case 3:
          this.w = e;
          break;
        default:
          throw new Error("index is out of range: " + t);
      }
      return this;
    }
    getComponent(t) {
      switch (t) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw new Error("index is out of range: " + t);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }
    copy(t) {
      return (
        (this.x = t.x),
        (this.y = t.y),
        (this.z = t.z),
        (this.w = void 0 !== t.w ? t.w : 1),
        this
      );
    }
    add(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."
          ),
          this.addVectors(t, e))
        : ((this.x += t.x),
          (this.y += t.y),
          (this.z += t.z),
          (this.w += t.w),
          this);
    }
    addScalar(t) {
      return (this.x += t), (this.y += t), (this.z += t), (this.w += t), this;
    }
    addVectors(t, e) {
      return (
        (this.x = t.x + e.x),
        (this.y = t.y + e.y),
        (this.z = t.z + e.z),
        (this.w = t.w + e.w),
        this
      );
    }
    addScaledVector(t, e) {
      return (
        (this.x += t.x * e),
        (this.y += t.y * e),
        (this.z += t.z * e),
        (this.w += t.w * e),
        this
      );
    }
    sub(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."
          ),
          this.subVectors(t, e))
        : ((this.x -= t.x),
          (this.y -= t.y),
          (this.z -= t.z),
          (this.w -= t.w),
          this);
    }
    subScalar(t) {
      return (this.x -= t), (this.y -= t), (this.z -= t), (this.w -= t), this;
    }
    subVectors(t, e) {
      return (
        (this.x = t.x - e.x),
        (this.y = t.y - e.y),
        (this.z = t.z - e.z),
        (this.w = t.w - e.w),
        this
      );
    }
    multiply(t) {
      return (
        (this.x *= t.x), (this.y *= t.y), (this.z *= t.z), (this.w *= t.w), this
      );
    }
    multiplyScalar(t) {
      return (this.x *= t), (this.y *= t), (this.z *= t), (this.w *= t), this;
    }
    applyMatrix4(t) {
      const e = this.x,
        n = this.y,
        i = this.z,
        r = this.w,
        s = t.elements;
      return (
        (this.x = s[0] * e + s[4] * n + s[8] * i + s[12] * r),
        (this.y = s[1] * e + s[5] * n + s[9] * i + s[13] * r),
        (this.z = s[2] * e + s[6] * n + s[10] * i + s[14] * r),
        (this.w = s[3] * e + s[7] * n + s[11] * i + s[15] * r),
        this
      );
    }
    divideScalar(t) {
      return this.multiplyScalar(1 / t);
    }
    setAxisAngleFromQuaternion(t) {
      this.w = 2 * Math.acos(t.w);
      const e = Math.sqrt(1 - t.w * t.w);
      return (
        e < 1e-4
          ? ((this.x = 1), (this.y = 0), (this.z = 0))
          : ((this.x = t.x / e), (this.y = t.y / e), (this.z = t.z / e)),
        this
      );
    }
    setAxisAngleFromRotationMatrix(t) {
      let e, n, i, r;
      const s = 0.01,
        o = 0.1,
        a = t.elements,
        l = a[0],
        c = a[4],
        h = a[8],
        u = a[1],
        d = a[5],
        p = a[9],
        m = a[2],
        f = a[6],
        g = a[10];
      if (Math.abs(c - u) < s && Math.abs(h - m) < s && Math.abs(p - f) < s) {
        if (
          Math.abs(c + u) < o &&
          Math.abs(h + m) < o &&
          Math.abs(p + f) < o &&
          Math.abs(l + d + g - 3) < o
        )
          return this.set(1, 0, 0, 0), this;
        e = Math.PI;
        const t = (l + 1) / 2,
          a = (d + 1) / 2,
          v = (g + 1) / 2,
          x = (c + u) / 4,
          _ = (h + m) / 4,
          y = (p + f) / 4;
        return (
          t > a && t > v
            ? t < s
              ? ((n = 0), (i = 0.707106781), (r = 0.707106781))
              : ((n = Math.sqrt(t)), (i = x / n), (r = _ / n))
            : a > v
            ? a < s
              ? ((n = 0.707106781), (i = 0), (r = 0.707106781))
              : ((i = Math.sqrt(a)), (n = x / i), (r = y / i))
            : v < s
            ? ((n = 0.707106781), (i = 0.707106781), (r = 0))
            : ((r = Math.sqrt(v)), (n = _ / r), (i = y / r)),
          this.set(n, i, r, e),
          this
        );
      }
      let v = Math.sqrt(
        (f - p) * (f - p) + (h - m) * (h - m) + (u - c) * (u - c)
      );
      return (
        Math.abs(v) < 0.001 && (v = 1),
        (this.x = (f - p) / v),
        (this.y = (h - m) / v),
        (this.z = (u - c) / v),
        (this.w = Math.acos((l + d + g - 1) / 2)),
        this
      );
    }
    min(t) {
      return (
        (this.x = Math.min(this.x, t.x)),
        (this.y = Math.min(this.y, t.y)),
        (this.z = Math.min(this.z, t.z)),
        (this.w = Math.min(this.w, t.w)),
        this
      );
    }
    max(t) {
      return (
        (this.x = Math.max(this.x, t.x)),
        (this.y = Math.max(this.y, t.y)),
        (this.z = Math.max(this.z, t.z)),
        (this.w = Math.max(this.w, t.w)),
        this
      );
    }
    clamp(t, e) {
      return (
        (this.x = Math.max(t.x, Math.min(e.x, this.x))),
        (this.y = Math.max(t.y, Math.min(e.y, this.y))),
        (this.z = Math.max(t.z, Math.min(e.z, this.z))),
        (this.w = Math.max(t.w, Math.min(e.w, this.w))),
        this
      );
    }
    clampScalar(t, e) {
      return (
        (this.x = Math.max(t, Math.min(e, this.x))),
        (this.y = Math.max(t, Math.min(e, this.y))),
        (this.z = Math.max(t, Math.min(e, this.z))),
        (this.w = Math.max(t, Math.min(e, this.w))),
        this
      );
    }
    clampLength(t, e) {
      const n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(
        Math.max(t, Math.min(e, n))
      );
    }
    floor() {
      return (
        (this.x = Math.floor(this.x)),
        (this.y = Math.floor(this.y)),
        (this.z = Math.floor(this.z)),
        (this.w = Math.floor(this.w)),
        this
      );
    }
    ceil() {
      return (
        (this.x = Math.ceil(this.x)),
        (this.y = Math.ceil(this.y)),
        (this.z = Math.ceil(this.z)),
        (this.w = Math.ceil(this.w)),
        this
      );
    }
    round() {
      return (
        (this.x = Math.round(this.x)),
        (this.y = Math.round(this.y)),
        (this.z = Math.round(this.z)),
        (this.w = Math.round(this.w)),
        this
      );
    }
    roundToZero() {
      return (
        (this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x)),
        (this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y)),
        (this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z)),
        (this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w)),
        this
      );
    }
    negate() {
      return (
        (this.x = -this.x),
        (this.y = -this.y),
        (this.z = -this.z),
        (this.w = -this.w),
        this
      );
    }
    dot(t) {
      return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
    }
    lengthSq() {
      return (
        this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
      );
    }
    length() {
      return Math.sqrt(
        this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
      );
    }
    manhattanLength() {
      return (
        Math.abs(this.x) +
        Math.abs(this.y) +
        Math.abs(this.z) +
        Math.abs(this.w)
      );
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(t) {
      return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
      return (
        (this.x += (t.x - this.x) * e),
        (this.y += (t.y - this.y) * e),
        (this.z += (t.z - this.z) * e),
        (this.w += (t.w - this.w) * e),
        this
      );
    }
    lerpVectors(t, e, n) {
      return (
        (this.x = t.x + (e.x - t.x) * n),
        (this.y = t.y + (e.y - t.y) * n),
        (this.z = t.z + (e.z - t.z) * n),
        (this.w = t.w + (e.w - t.w) * n),
        this
      );
    }
    equals(t) {
      return (
        t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w
      );
    }
    fromArray(t, e = 0) {
      return (
        (this.x = t[e]),
        (this.y = t[e + 1]),
        (this.z = t[e + 2]),
        (this.w = t[e + 3]),
        this
      );
    }
    toArray(t = [], e = 0) {
      return (
        (t[e] = this.x),
        (t[e + 1] = this.y),
        (t[e + 2] = this.z),
        (t[e + 3] = this.w),
        t
      );
    }
    fromBufferAttribute(t, e, n) {
      return (
        void 0 !== n &&
          console.warn(
            "THREE.Vector4: offset has been removed from .fromBufferAttribute()."
          ),
        (this.x = t.getX(e)),
        (this.y = t.getY(e)),
        (this.z = t.getZ(e)),
        (this.w = t.getW(e)),
        this
      );
    }
    random() {
      return (
        (this.x = Math.random()),
        (this.y = Math.random()),
        (this.z = Math.random()),
        (this.w = Math.random()),
        this
      );
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z, yield this.w;
    }
  }
  Pe.prototype.isVector4 = !0;
  class De extends pe {
    constructor(t, e, n = {}) {
      super(),
        (this.width = t),
        (this.height = e),
        (this.depth = 1),
        (this.scissor = new Pe(0, 0, t, e)),
        (this.scissorTest = !1),
        (this.viewport = new Pe(0, 0, t, e)),
        (this.texture = new Re(
          void 0,
          n.mapping,
          n.wrapS,
          n.wrapT,
          n.magFilter,
          n.minFilter,
          n.format,
          n.type,
          n.anisotropy,
          n.encoding
        )),
        (this.texture.isRenderTargetTexture = !0),
        (this.texture.image = { width: t, height: e, depth: 1 }),
        (this.texture.generateMipmaps =
          void 0 !== n.generateMipmaps && n.generateMipmaps),
        (this.texture.internalFormat =
          void 0 !== n.internalFormat ? n.internalFormat : null),
        (this.texture.minFilter = void 0 !== n.minFilter ? n.minFilter : Ht),
        (this.depthBuffer = void 0 === n.depthBuffer || n.depthBuffer),
        (this.stencilBuffer = void 0 !== n.stencilBuffer && n.stencilBuffer),
        (this.depthTexture = void 0 !== n.depthTexture ? n.depthTexture : null);
    }
    setTexture(t) {
      (t.image = { width: this.width, height: this.height, depth: this.depth }),
        (this.texture = t);
    }
    setSize(t, e, n = 1) {
      (this.width === t && this.height === e && this.depth === n) ||
        ((this.width = t),
        (this.height = e),
        (this.depth = n),
        (this.texture.image.width = t),
        (this.texture.image.height = e),
        (this.texture.image.depth = n),
        this.dispose()),
        this.viewport.set(0, 0, t, e),
        this.scissor.set(0, 0, t, e);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      return (
        (this.width = t.width),
        (this.height = t.height),
        (this.depth = t.depth),
        this.viewport.copy(t.viewport),
        (this.texture = t.texture.clone()),
        (this.texture.image = { ...this.texture.image }),
        (this.depthBuffer = t.depthBuffer),
        (this.stencilBuffer = t.stencilBuffer),
        (this.depthTexture = t.depthTexture),
        this
      );
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }
  De.prototype.isWebGLRenderTarget = !0;
  (class extends De {
    constructor(t, e, n) {
      super(t, e);
      const i = this.texture;
      this.texture = [];
      for (let t = 0; t < n; t++) this.texture[t] = i.clone();
    }
    setSize(t, e, n = 1) {
      if (this.width !== t || this.height !== e || this.depth !== n) {
        (this.width = t), (this.height = e), (this.depth = n);
        for (let i = 0, r = this.texture.length; i < r; i++)
          (this.texture[i].image.width = t),
            (this.texture[i].image.height = e),
            (this.texture[i].image.depth = n);
        this.dispose();
      }
      return this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e), this;
    }
    copy(t) {
      this.dispose(),
        (this.width = t.width),
        (this.height = t.height),
        (this.depth = t.depth),
        this.viewport.set(0, 0, this.width, this.height),
        this.scissor.set(0, 0, this.width, this.height),
        (this.depthBuffer = t.depthBuffer),
        (this.stencilBuffer = t.stencilBuffer),
        (this.depthTexture = t.depthTexture),
        (this.texture.length = 0);
      for (let e = 0, n = t.texture.length; e < n; e++)
        this.texture[e] = t.texture[e].clone();
      return this;
    }
  }).prototype.isWebGLMultipleRenderTargets = !0;
  class Ie extends De {
    constructor(t, e, n = {}) {
      super(t, e, n),
        (this.samples = 4),
        (this.ignoreDepthForMultisampleCopy =
          void 0 === n.ignoreDepth || n.ignoreDepth),
        (this.useRenderToTexture =
          void 0 !== n.useRenderToTexture && n.useRenderToTexture),
        (this.useRenderbuffer = !1 === this.useRenderToTexture);
    }
    copy(t) {
      return (
        super.copy.call(this, t),
        (this.samples = t.samples),
        (this.useRenderToTexture = t.useRenderToTexture),
        (this.useRenderbuffer = t.useRenderbuffer),
        this
      );
    }
  }
  Ie.prototype.isWebGLMultisampleRenderTarget = !0;
  class Ne {
    constructor(t = 0, e = 0, n = 0, i = 1) {
      (this._x = t), (this._y = e), (this._z = n), (this._w = i);
    }
    static slerp(t, e, n, i) {
      return (
        console.warn(
          "THREE.Quaternion: Static .slerp() has been deprecated. Use qm.slerpQuaternions( qa, qb, t ) instead."
        ),
        n.slerpQuaternions(t, e, i)
      );
    }
    static slerpFlat(t, e, n, i, r, s, o) {
      let a = n[i + 0],
        l = n[i + 1],
        c = n[i + 2],
        h = n[i + 3];
      const u = r[s + 0],
        d = r[s + 1],
        p = r[s + 2],
        m = r[s + 3];
      if (0 === o)
        return (
          (t[e + 0] = a), (t[e + 1] = l), (t[e + 2] = c), void (t[e + 3] = h)
        );
      if (1 === o)
        return (
          (t[e + 0] = u), (t[e + 1] = d), (t[e + 2] = p), void (t[e + 3] = m)
        );
      if (h !== m || a !== u || l !== d || c !== p) {
        let t = 1 - o;
        const e = a * u + l * d + c * p + h * m,
          n = e >= 0 ? 1 : -1,
          i = 1 - e * e;
        if (i > Number.EPSILON) {
          const r = Math.sqrt(i),
            s = Math.atan2(r, e * n);
          (t = Math.sin(t * s) / r), (o = Math.sin(o * s) / r);
        }
        const r = o * n;
        if (
          ((a = a * t + u * r),
          (l = l * t + d * r),
          (c = c * t + p * r),
          (h = h * t + m * r),
          t === 1 - o)
        ) {
          const t = 1 / Math.sqrt(a * a + l * l + c * c + h * h);
          (a *= t), (l *= t), (c *= t), (h *= t);
        }
      }
      (t[e] = a), (t[e + 1] = l), (t[e + 2] = c), (t[e + 3] = h);
    }
    static multiplyQuaternionsFlat(t, e, n, i, r, s) {
      const o = n[i],
        a = n[i + 1],
        l = n[i + 2],
        c = n[i + 3],
        h = r[s],
        u = r[s + 1],
        d = r[s + 2],
        p = r[s + 3];
      return (
        (t[e] = o * p + c * h + a * d - l * u),
        (t[e + 1] = a * p + c * u + l * h - o * d),
        (t[e + 2] = l * p + c * d + o * u - a * h),
        (t[e + 3] = c * p - o * h - a * u - l * d),
        t
      );
    }
    get x() {
      return this._x;
    }
    set x(t) {
      (this._x = t), this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(t) {
      (this._y = t), this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(t) {
      (this._z = t), this._onChangeCallback();
    }
    get w() {
      return this._w;
    }
    set w(t) {
      (this._w = t), this._onChangeCallback();
    }
    set(t, e, n, i) {
      return (
        (this._x = t),
        (this._y = e),
        (this._z = n),
        (this._w = i),
        this._onChangeCallback(),
        this
      );
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }
    copy(t) {
      return (
        (this._x = t.x),
        (this._y = t.y),
        (this._z = t.z),
        (this._w = t.w),
        this._onChangeCallback(),
        this
      );
    }
    setFromEuler(t, e) {
      if (!t || !t.isEuler)
        throw new Error(
          "THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order."
        );
      const n = t._x,
        i = t._y,
        r = t._z,
        s = t._order,
        o = Math.cos,
        a = Math.sin,
        l = o(n / 2),
        c = o(i / 2),
        h = o(r / 2),
        u = a(n / 2),
        d = a(i / 2),
        p = a(r / 2);
      switch (s) {
        case "XYZ":
          (this._x = u * c * h + l * d * p),
            (this._y = l * d * h - u * c * p),
            (this._z = l * c * p + u * d * h),
            (this._w = l * c * h - u * d * p);
          break;
        case "YXZ":
          (this._x = u * c * h + l * d * p),
            (this._y = l * d * h - u * c * p),
            (this._z = l * c * p - u * d * h),
            (this._w = l * c * h + u * d * p);
          break;
        case "ZXY":
          (this._x = u * c * h - l * d * p),
            (this._y = l * d * h + u * c * p),
            (this._z = l * c * p + u * d * h),
            (this._w = l * c * h - u * d * p);
          break;
        case "ZYX":
          (this._x = u * c * h - l * d * p),
            (this._y = l * d * h + u * c * p),
            (this._z = l * c * p - u * d * h),
            (this._w = l * c * h + u * d * p);
          break;
        case "YZX":
          (this._x = u * c * h + l * d * p),
            (this._y = l * d * h + u * c * p),
            (this._z = l * c * p - u * d * h),
            (this._w = l * c * h - u * d * p);
          break;
        case "XZY":
          (this._x = u * c * h - l * d * p),
            (this._y = l * d * h - u * c * p),
            (this._z = l * c * p + u * d * h),
            (this._w = l * c * h + u * d * p);
          break;
        default:
          console.warn(
            "THREE.Quaternion: .setFromEuler() encountered an unknown order: " +
              s
          );
      }
      return !1 !== e && this._onChangeCallback(), this;
    }
    setFromAxisAngle(t, e) {
      const n = e / 2,
        i = Math.sin(n);
      return (
        (this._x = t.x * i),
        (this._y = t.y * i),
        (this._z = t.z * i),
        (this._w = Math.cos(n)),
        this._onChangeCallback(),
        this
      );
    }
    setFromRotationMatrix(t) {
      const e = t.elements,
        n = e[0],
        i = e[4],
        r = e[8],
        s = e[1],
        o = e[5],
        a = e[9],
        l = e[2],
        c = e[6],
        h = e[10],
        u = n + o + h;
      if (u > 0) {
        const t = 0.5 / Math.sqrt(u + 1);
        (this._w = 0.25 / t),
          (this._x = (c - a) * t),
          (this._y = (r - l) * t),
          (this._z = (s - i) * t);
      } else if (n > o && n > h) {
        const t = 2 * Math.sqrt(1 + n - o - h);
        (this._w = (c - a) / t),
          (this._x = 0.25 * t),
          (this._y = (i + s) / t),
          (this._z = (r + l) / t);
      } else if (o > h) {
        const t = 2 * Math.sqrt(1 + o - n - h);
        (this._w = (r - l) / t),
          (this._x = (i + s) / t),
          (this._y = 0.25 * t),
          (this._z = (a + c) / t);
      } else {
        const t = 2 * Math.sqrt(1 + h - n - o);
        (this._w = (s - i) / t),
          (this._x = (r + l) / t),
          (this._y = (a + c) / t),
          (this._z = 0.25 * t);
      }
      return this._onChangeCallback(), this;
    }
    setFromUnitVectors(t, e) {
      let n = t.dot(e) + 1;
      return (
        n < Number.EPSILON
          ? ((n = 0),
            Math.abs(t.x) > Math.abs(t.z)
              ? ((this._x = -t.y),
                (this._y = t.x),
                (this._z = 0),
                (this._w = n))
              : ((this._x = 0),
                (this._y = -t.z),
                (this._z = t.y),
                (this._w = n)))
          : ((this._x = t.y * e.z - t.z * e.y),
            (this._y = t.z * e.x - t.x * e.z),
            (this._z = t.x * e.y - t.y * e.x),
            (this._w = n)),
        this.normalize()
      );
    }
    angleTo(t) {
      return 2 * Math.acos(Math.abs(xe(this.dot(t), -1, 1)));
    }
    rotateTowards(t, e) {
      const n = this.angleTo(t);
      if (0 === n) return this;
      const i = Math.min(1, e / n);
      return this.slerp(t, i), this;
    }
    identity() {
      return this.set(0, 0, 0, 1);
    }
    invert() {
      return this.conjugate();
    }
    conjugate() {
      return (
        (this._x *= -1),
        (this._y *= -1),
        (this._z *= -1),
        this._onChangeCallback(),
        this
      );
    }
    dot(t) {
      return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
    }
    lengthSq() {
      return (
        this._x * this._x +
        this._y * this._y +
        this._z * this._z +
        this._w * this._w
      );
    }
    length() {
      return Math.sqrt(
        this._x * this._x +
          this._y * this._y +
          this._z * this._z +
          this._w * this._w
      );
    }
    normalize() {
      let t = this.length();
      return (
        0 === t
          ? ((this._x = 0), (this._y = 0), (this._z = 0), (this._w = 1))
          : ((t = 1 / t),
            (this._x = this._x * t),
            (this._y = this._y * t),
            (this._z = this._z * t),
            (this._w = this._w * t)),
        this._onChangeCallback(),
        this
      );
    }
    multiply(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."
          ),
          this.multiplyQuaternions(t, e))
        : this.multiplyQuaternions(this, t);
    }
    premultiply(t) {
      return this.multiplyQuaternions(t, this);
    }
    multiplyQuaternions(t, e) {
      const n = t._x,
        i = t._y,
        r = t._z,
        s = t._w,
        o = e._x,
        a = e._y,
        l = e._z,
        c = e._w;
      return (
        (this._x = n * c + s * o + i * l - r * a),
        (this._y = i * c + s * a + r * o - n * l),
        (this._z = r * c + s * l + n * a - i * o),
        (this._w = s * c - n * o - i * a - r * l),
        this._onChangeCallback(),
        this
      );
    }
    slerp(t, e) {
      if (0 === e) return this;
      if (1 === e) return this.copy(t);
      const n = this._x,
        i = this._y,
        r = this._z,
        s = this._w;
      let o = s * t._w + n * t._x + i * t._y + r * t._z;
      if (
        (o < 0
          ? ((this._w = -t._w),
            (this._x = -t._x),
            (this._y = -t._y),
            (this._z = -t._z),
            (o = -o))
          : this.copy(t),
        o >= 1)
      )
        return (this._w = s), (this._x = n), (this._y = i), (this._z = r), this;
      const a = 1 - o * o;
      if (a <= Number.EPSILON) {
        const t = 1 - e;
        return (
          (this._w = t * s + e * this._w),
          (this._x = t * n + e * this._x),
          (this._y = t * i + e * this._y),
          (this._z = t * r + e * this._z),
          this.normalize(),
          this._onChangeCallback(),
          this
        );
      }
      const l = Math.sqrt(a),
        c = Math.atan2(l, o),
        h = Math.sin((1 - e) * c) / l,
        u = Math.sin(e * c) / l;
      return (
        (this._w = s * h + this._w * u),
        (this._x = n * h + this._x * u),
        (this._y = i * h + this._y * u),
        (this._z = r * h + this._z * u),
        this._onChangeCallback(),
        this
      );
    }
    slerpQuaternions(t, e, n) {
      this.copy(t).slerp(e, n);
    }
    random() {
      const t = Math.random(),
        e = Math.sqrt(1 - t),
        n = Math.sqrt(t),
        i = 2 * Math.PI * Math.random(),
        r = 2 * Math.PI * Math.random();
      return this.set(
        e * Math.cos(i),
        n * Math.sin(r),
        n * Math.cos(r),
        e * Math.sin(i)
      );
    }
    equals(t) {
      return (
        t._x === this._x &&
        t._y === this._y &&
        t._z === this._z &&
        t._w === this._w
      );
    }
    fromArray(t, e = 0) {
      return (
        (this._x = t[e]),
        (this._y = t[e + 1]),
        (this._z = t[e + 2]),
        (this._w = t[e + 3]),
        this._onChangeCallback(),
        this
      );
    }
    toArray(t = [], e = 0) {
      return (
        (t[e] = this._x),
        (t[e + 1] = this._y),
        (t[e + 2] = this._z),
        (t[e + 3] = this._w),
        t
      );
    }
    fromBufferAttribute(t, e) {
      return (
        (this._x = t.getX(e)),
        (this._y = t.getY(e)),
        (this._z = t.getZ(e)),
        (this._w = t.getW(e)),
        this
      );
    }
    _onChange(t) {
      return (this._onChangeCallback = t), this;
    }
    _onChangeCallback() {}
  }
  Ne.prototype.isQuaternion = !0;
  class ze {
    constructor(t = 0, e = 0, n = 0) {
      (this.x = t), (this.y = e), (this.z = n);
    }
    set(t, e, n) {
      return (
        void 0 === n && (n = this.z),
        (this.x = t),
        (this.y = e),
        (this.z = n),
        this
      );
    }
    setScalar(t) {
      return (this.x = t), (this.y = t), (this.z = t), this;
    }
    setX(t) {
      return (this.x = t), this;
    }
    setY(t) {
      return (this.y = t), this;
    }
    setZ(t) {
      return (this.z = t), this;
    }
    setComponent(t, e) {
      switch (t) {
        case 0:
          this.x = e;
          break;
        case 1:
          this.y = e;
          break;
        case 2:
          this.z = e;
          break;
        default:
          throw new Error("index is out of range: " + t);
      }
      return this;
    }
    getComponent(t) {
      switch (t) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + t);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }
    copy(t) {
      return (this.x = t.x), (this.y = t.y), (this.z = t.z), this;
    }
    add(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."
          ),
          this.addVectors(t, e))
        : ((this.x += t.x), (this.y += t.y), (this.z += t.z), this);
    }
    addScalar(t) {
      return (this.x += t), (this.y += t), (this.z += t), this;
    }
    addVectors(t, e) {
      return (
        (this.x = t.x + e.x), (this.y = t.y + e.y), (this.z = t.z + e.z), this
      );
    }
    addScaledVector(t, e) {
      return (
        (this.x += t.x * e), (this.y += t.y * e), (this.z += t.z * e), this
      );
    }
    sub(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."
          ),
          this.subVectors(t, e))
        : ((this.x -= t.x), (this.y -= t.y), (this.z -= t.z), this);
    }
    subScalar(t) {
      return (this.x -= t), (this.y -= t), (this.z -= t), this;
    }
    subVectors(t, e) {
      return (
        (this.x = t.x - e.x), (this.y = t.y - e.y), (this.z = t.z - e.z), this
      );
    }
    multiply(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."
          ),
          this.multiplyVectors(t, e))
        : ((this.x *= t.x), (this.y *= t.y), (this.z *= t.z), this);
    }
    multiplyScalar(t) {
      return (this.x *= t), (this.y *= t), (this.z *= t), this;
    }
    multiplyVectors(t, e) {
      return (
        (this.x = t.x * e.x), (this.y = t.y * e.y), (this.z = t.z * e.z), this
      );
    }
    applyEuler(t) {
      return (
        (t && t.isEuler) ||
          console.error(
            "THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order."
          ),
        this.applyQuaternion(Oe.setFromEuler(t))
      );
    }
    applyAxisAngle(t, e) {
      return this.applyQuaternion(Oe.setFromAxisAngle(t, e));
    }
    applyMatrix3(t) {
      const e = this.x,
        n = this.y,
        i = this.z,
        r = t.elements;
      return (
        (this.x = r[0] * e + r[3] * n + r[6] * i),
        (this.y = r[1] * e + r[4] * n + r[7] * i),
        (this.z = r[2] * e + r[5] * n + r[8] * i),
        this
      );
    }
    applyNormalMatrix(t) {
      return this.applyMatrix3(t).normalize();
    }
    applyMatrix4(t) {
      const e = this.x,
        n = this.y,
        i = this.z,
        r = t.elements,
        s = 1 / (r[3] * e + r[7] * n + r[11] * i + r[15]);
      return (
        (this.x = (r[0] * e + r[4] * n + r[8] * i + r[12]) * s),
        (this.y = (r[1] * e + r[5] * n + r[9] * i + r[13]) * s),
        (this.z = (r[2] * e + r[6] * n + r[10] * i + r[14]) * s),
        this
      );
    }
    applyQuaternion(t) {
      const e = this.x,
        n = this.y,
        i = this.z,
        r = t.x,
        s = t.y,
        o = t.z,
        a = t.w,
        l = a * e + s * i - o * n,
        c = a * n + o * e - r * i,
        h = a * i + r * n - s * e,
        u = -r * e - s * n - o * i;
      return (
        (this.x = l * a + u * -r + c * -o - h * -s),
        (this.y = c * a + u * -s + h * -r - l * -o),
        (this.z = h * a + u * -o + l * -s - c * -r),
        this
      );
    }
    project(t) {
      return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(
        t.projectionMatrix
      );
    }
    unproject(t) {
      return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(
        t.matrixWorld
      );
    }
    transformDirection(t) {
      const e = this.x,
        n = this.y,
        i = this.z,
        r = t.elements;
      return (
        (this.x = r[0] * e + r[4] * n + r[8] * i),
        (this.y = r[1] * e + r[5] * n + r[9] * i),
        (this.z = r[2] * e + r[6] * n + r[10] * i),
        this.normalize()
      );
    }
    divide(t) {
      return (this.x /= t.x), (this.y /= t.y), (this.z /= t.z), this;
    }
    divideScalar(t) {
      return this.multiplyScalar(1 / t);
    }
    min(t) {
      return (
        (this.x = Math.min(this.x, t.x)),
        (this.y = Math.min(this.y, t.y)),
        (this.z = Math.min(this.z, t.z)),
        this
      );
    }
    max(t) {
      return (
        (this.x = Math.max(this.x, t.x)),
        (this.y = Math.max(this.y, t.y)),
        (this.z = Math.max(this.z, t.z)),
        this
      );
    }
    clamp(t, e) {
      return (
        (this.x = Math.max(t.x, Math.min(e.x, this.x))),
        (this.y = Math.max(t.y, Math.min(e.y, this.y))),
        (this.z = Math.max(t.z, Math.min(e.z, this.z))),
        this
      );
    }
    clampScalar(t, e) {
      return (
        (this.x = Math.max(t, Math.min(e, this.x))),
        (this.y = Math.max(t, Math.min(e, this.y))),
        (this.z = Math.max(t, Math.min(e, this.z))),
        this
      );
    }
    clampLength(t, e) {
      const n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(
        Math.max(t, Math.min(e, n))
      );
    }
    floor() {
      return (
        (this.x = Math.floor(this.x)),
        (this.y = Math.floor(this.y)),
        (this.z = Math.floor(this.z)),
        this
      );
    }
    ceil() {
      return (
        (this.x = Math.ceil(this.x)),
        (this.y = Math.ceil(this.y)),
        (this.z = Math.ceil(this.z)),
        this
      );
    }
    round() {
      return (
        (this.x = Math.round(this.x)),
        (this.y = Math.round(this.y)),
        (this.z = Math.round(this.z)),
        this
      );
    }
    roundToZero() {
      return (
        (this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x)),
        (this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y)),
        (this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z)),
        this
      );
    }
    negate() {
      return (this.x = -this.x), (this.y = -this.y), (this.z = -this.z), this;
    }
    dot(t) {
      return this.x * t.x + this.y * t.y + this.z * t.z;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(t) {
      return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
      return (
        (this.x += (t.x - this.x) * e),
        (this.y += (t.y - this.y) * e),
        (this.z += (t.z - this.z) * e),
        this
      );
    }
    lerpVectors(t, e, n) {
      return (
        (this.x = t.x + (e.x - t.x) * n),
        (this.y = t.y + (e.y - t.y) * n),
        (this.z = t.z + (e.z - t.z) * n),
        this
      );
    }
    cross(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."
          ),
          this.crossVectors(t, e))
        : this.crossVectors(this, t);
    }
    crossVectors(t, e) {
      const n = t.x,
        i = t.y,
        r = t.z,
        s = e.x,
        o = e.y,
        a = e.z;
      return (
        (this.x = i * a - r * o),
        (this.y = r * s - n * a),
        (this.z = n * o - i * s),
        this
      );
    }
    projectOnVector(t) {
      const e = t.lengthSq();
      if (0 === e) return this.set(0, 0, 0);
      const n = t.dot(this) / e;
      return this.copy(t).multiplyScalar(n);
    }
    projectOnPlane(t) {
      return ke.copy(this).projectOnVector(t), this.sub(ke);
    }
    reflect(t) {
      return this.sub(ke.copy(t).multiplyScalar(2 * this.dot(t)));
    }
    angleTo(t) {
      const e = Math.sqrt(this.lengthSq() * t.lengthSq());
      if (0 === e) return Math.PI / 2;
      const n = this.dot(t) / e;
      return Math.acos(xe(n, -1, 1));
    }
    distanceTo(t) {
      return Math.sqrt(this.distanceToSquared(t));
    }
    distanceToSquared(t) {
      const e = this.x - t.x,
        n = this.y - t.y,
        i = this.z - t.z;
      return e * e + n * n + i * i;
    }
    manhattanDistanceTo(t) {
      return (
        Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z)
      );
    }
    setFromSpherical(t) {
      return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
    }
    setFromSphericalCoords(t, e, n) {
      const i = Math.sin(e) * t;
      return (
        (this.x = i * Math.sin(n)),
        (this.y = Math.cos(e) * t),
        (this.z = i * Math.cos(n)),
        this
      );
    }
    setFromCylindrical(t) {
      return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
    }
    setFromCylindricalCoords(t, e, n) {
      return (
        (this.x = t * Math.sin(e)),
        (this.y = n),
        (this.z = t * Math.cos(e)),
        this
      );
    }
    setFromMatrixPosition(t) {
      const e = t.elements;
      return (this.x = e[12]), (this.y = e[13]), (this.z = e[14]), this;
    }
    setFromMatrixScale(t) {
      const e = this.setFromMatrixColumn(t, 0).length(),
        n = this.setFromMatrixColumn(t, 1).length(),
        i = this.setFromMatrixColumn(t, 2).length();
      return (this.x = e), (this.y = n), (this.z = i), this;
    }
    setFromMatrixColumn(t, e) {
      return this.fromArray(t.elements, 4 * e);
    }
    setFromMatrix3Column(t, e) {
      return this.fromArray(t.elements, 3 * e);
    }
    equals(t) {
      return t.x === this.x && t.y === this.y && t.z === this.z;
    }
    fromArray(t, e = 0) {
      return (this.x = t[e]), (this.y = t[e + 1]), (this.z = t[e + 2]), this;
    }
    toArray(t = [], e = 0) {
      return (t[e] = this.x), (t[e + 1] = this.y), (t[e + 2] = this.z), t;
    }
    fromBufferAttribute(t, e, n) {
      return (
        void 0 !== n &&
          console.warn(
            "THREE.Vector3: offset has been removed from .fromBufferAttribute()."
          ),
        (this.x = t.getX(e)),
        (this.y = t.getY(e)),
        (this.z = t.getZ(e)),
        this
      );
    }
    random() {
      return (
        (this.x = Math.random()),
        (this.y = Math.random()),
        (this.z = Math.random()),
        this
      );
    }
    randomDirection() {
      const t = 2 * (Math.random() - 0.5),
        e = Math.random() * Math.PI * 2,
        n = Math.sqrt(1 - t ** 2);
      return (
        (this.x = n * Math.cos(e)),
        (this.y = n * Math.sin(e)),
        (this.z = t),
        this
      );
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z;
    }
  }
  ze.prototype.isVector3 = !0;
  const ke = new ze(),
    Oe = new Ne();
  class Fe {
    constructor(
      t = new ze(1 / 0, 1 / 0, 1 / 0),
      e = new ze(-1 / 0, -1 / 0, -1 / 0)
    ) {
      (this.min = t), (this.max = e);
    }
    set(t, e) {
      return this.min.copy(t), this.max.copy(e), this;
    }
    setFromArray(t) {
      let e = 1 / 0,
        n = 1 / 0,
        i = 1 / 0,
        r = -1 / 0,
        s = -1 / 0,
        o = -1 / 0;
      for (let a = 0, l = t.length; a < l; a += 3) {
        const l = t[a],
          c = t[a + 1],
          h = t[a + 2];
        l < e && (e = l),
          c < n && (n = c),
          h < i && (i = h),
          l > r && (r = l),
          c > s && (s = c),
          h > o && (o = h);
      }
      return this.min.set(e, n, i), this.max.set(r, s, o), this;
    }
    setFromBufferAttribute(t) {
      let e = 1 / 0,
        n = 1 / 0,
        i = 1 / 0,
        r = -1 / 0,
        s = -1 / 0,
        o = -1 / 0;
      for (let a = 0, l = t.count; a < l; a++) {
        const l = t.getX(a),
          c = t.getY(a),
          h = t.getZ(a);
        l < e && (e = l),
          c < n && (n = c),
          h < i && (i = h),
          l > r && (r = l),
          c > s && (s = c),
          h > o && (o = h);
      }
      return this.min.set(e, n, i), this.max.set(r, s, o), this;
    }
    setFromPoints(t) {
      this.makeEmpty();
      for (let e = 0, n = t.length; e < n; e++) this.expandByPoint(t[e]);
      return this;
    }
    setFromCenterAndSize(t, e) {
      const n = Be.copy(e).multiplyScalar(0.5);
      return this.min.copy(t).sub(n), this.max.copy(t).add(n), this;
    }
    setFromObject(t) {
      return this.makeEmpty(), this.expandByObject(t);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      return this.min.copy(t.min), this.max.copy(t.max), this;
    }
    makeEmpty() {
      return (
        (this.min.x = this.min.y = this.min.z = 1 / 0),
        (this.max.x = this.max.y = this.max.z = -1 / 0),
        this
      );
    }
    isEmpty() {
      return (
        this.max.x < this.min.x ||
        this.max.y < this.min.y ||
        this.max.z < this.min.z
      );
    }
    getCenter(t) {
      return this.isEmpty()
        ? t.set(0, 0, 0)
        : t.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    getSize(t) {
      return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
    }
    expandByPoint(t) {
      return this.min.min(t), this.max.max(t), this;
    }
    expandByVector(t) {
      return this.min.sub(t), this.max.add(t), this;
    }
    expandByScalar(t) {
      return this.min.addScalar(-t), this.max.addScalar(t), this;
    }
    expandByObject(t) {
      t.updateWorldMatrix(!1, !1);
      const e = t.geometry;
      void 0 !== e &&
        (null === e.boundingBox && e.computeBoundingBox(),
        He.copy(e.boundingBox),
        He.applyMatrix4(t.matrixWorld),
        this.union(He));
      const n = t.children;
      for (let t = 0, e = n.length; t < e; t++) this.expandByObject(n[t]);
      return this;
    }
    containsPoint(t) {
      return !(
        t.x < this.min.x ||
        t.x > this.max.x ||
        t.y < this.min.y ||
        t.y > this.max.y ||
        t.z < this.min.z ||
        t.z > this.max.z
      );
    }
    containsBox(t) {
      return (
        this.min.x <= t.min.x &&
        t.max.x <= this.max.x &&
        this.min.y <= t.min.y &&
        t.max.y <= this.max.y &&
        this.min.z <= t.min.z &&
        t.max.z <= this.max.z
      );
    }
    getParameter(t, e) {
      return e.set(
        (t.x - this.min.x) / (this.max.x - this.min.x),
        (t.y - this.min.y) / (this.max.y - this.min.y),
        (t.z - this.min.z) / (this.max.z - this.min.z)
      );
    }
    intersectsBox(t) {
      return !(
        t.max.x < this.min.x ||
        t.min.x > this.max.x ||
        t.max.y < this.min.y ||
        t.min.y > this.max.y ||
        t.max.z < this.min.z ||
        t.min.z > this.max.z
      );
    }
    intersectsSphere(t) {
      return (
        this.clampPoint(t.center, Be),
        Be.distanceToSquared(t.center) <= t.radius * t.radius
      );
    }
    intersectsPlane(t) {
      let e, n;
      return (
        t.normal.x > 0
          ? ((e = t.normal.x * this.min.x), (n = t.normal.x * this.max.x))
          : ((e = t.normal.x * this.max.x), (n = t.normal.x * this.min.x)),
        t.normal.y > 0
          ? ((e += t.normal.y * this.min.y), (n += t.normal.y * this.max.y))
          : ((e += t.normal.y * this.max.y), (n += t.normal.y * this.min.y)),
        t.normal.z > 0
          ? ((e += t.normal.z * this.min.z), (n += t.normal.z * this.max.z))
          : ((e += t.normal.z * this.max.z), (n += t.normal.z * this.min.z)),
        e <= -t.constant && n >= -t.constant
      );
    }
    intersectsTriangle(t) {
      if (this.isEmpty()) return !1;
      this.getCenter(Xe),
        qe.subVectors(this.max, Xe),
        Ge.subVectors(t.a, Xe),
        Ve.subVectors(t.b, Xe),
        We.subVectors(t.c, Xe),
        je.subVectors(Ve, Ge),
        Ze.subVectors(We, Ve),
        Ye.subVectors(Ge, We);
      let e = [
        0,
        -je.z,
        je.y,
        0,
        -Ze.z,
        Ze.y,
        0,
        -Ye.z,
        Ye.y,
        je.z,
        0,
        -je.x,
        Ze.z,
        0,
        -Ze.x,
        Ye.z,
        0,
        -Ye.x,
        -je.y,
        je.x,
        0,
        -Ze.y,
        Ze.x,
        0,
        -Ye.y,
        Ye.x,
        0,
      ];
      return (
        !!Ke(e, Ge, Ve, We, qe) &&
        ((e = [1, 0, 0, 0, 1, 0, 0, 0, 1]),
        !!Ke(e, Ge, Ve, We, qe) &&
          (Je.crossVectors(je, Ze),
          (e = [Je.x, Je.y, Je.z]),
          Ke(e, Ge, Ve, We, qe)))
      );
    }
    clampPoint(t, e) {
      return e.copy(t).clamp(this.min, this.max);
    }
    distanceToPoint(t) {
      return Be.copy(t).clamp(this.min, this.max).sub(t).length();
    }
    getBoundingSphere(t) {
      return (
        this.getCenter(t.center),
        (t.radius = 0.5 * this.getSize(Be).length()),
        t
      );
    }
    intersect(t) {
      return (
        this.min.max(t.min),
        this.max.min(t.max),
        this.isEmpty() && this.makeEmpty(),
        this
      );
    }
    union(t) {
      return this.min.min(t.min), this.max.max(t.max), this;
    }
    applyMatrix4(t) {
      return (
        this.isEmpty() ||
          (Ue[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t),
          Ue[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t),
          Ue[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t),
          Ue[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t),
          Ue[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t),
          Ue[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t),
          Ue[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t),
          Ue[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t),
          this.setFromPoints(Ue)),
        this
      );
    }
    translate(t) {
      return this.min.add(t), this.max.add(t), this;
    }
    equals(t) {
      return t.min.equals(this.min) && t.max.equals(this.max);
    }
  }
  Fe.prototype.isBox3 = !0;
  const Ue = [
      new ze(),
      new ze(),
      new ze(),
      new ze(),
      new ze(),
      new ze(),
      new ze(),
      new ze(),
    ],
    Be = new ze(),
    He = new Fe(),
    Ge = new ze(),
    Ve = new ze(),
    We = new ze(),
    je = new ze(),
    Ze = new ze(),
    Ye = new ze(),
    Xe = new ze(),
    qe = new ze(),
    Je = new ze(),
    Qe = new ze();
  function Ke(t, e, n, i, r) {
    for (let s = 0, o = t.length - 3; s <= o; s += 3) {
      Qe.fromArray(t, s);
      const o =
          r.x * Math.abs(Qe.x) + r.y * Math.abs(Qe.y) + r.z * Math.abs(Qe.z),
        a = e.dot(Qe),
        l = n.dot(Qe),
        c = i.dot(Qe);
      if (Math.max(-Math.max(a, l, c), Math.min(a, l, c)) > o) return !1;
    }
    return !0;
  }
  const $e = new Fe(),
    tn = new ze(),
    en = new ze(),
    nn = new ze();
  class rn {
    constructor(t = new ze(), e = -1) {
      (this.center = t), (this.radius = e);
    }
    set(t, e) {
      return this.center.copy(t), (this.radius = e), this;
    }
    setFromPoints(t, e) {
      const n = this.center;
      void 0 !== e ? n.copy(e) : $e.setFromPoints(t).getCenter(n);
      let i = 0;
      for (let e = 0, r = t.length; e < r; e++)
        i = Math.max(i, n.distanceToSquared(t[e]));
      return (this.radius = Math.sqrt(i)), this;
    }
    copy(t) {
      return this.center.copy(t.center), (this.radius = t.radius), this;
    }
    isEmpty() {
      return this.radius < 0;
    }
    makeEmpty() {
      return this.center.set(0, 0, 0), (this.radius = -1), this;
    }
    containsPoint(t) {
      return t.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    distanceToPoint(t) {
      return t.distanceTo(this.center) - this.radius;
    }
    intersectsSphere(t) {
      const e = this.radius + t.radius;
      return t.center.distanceToSquared(this.center) <= e * e;
    }
    intersectsBox(t) {
      return t.intersectsSphere(this);
    }
    intersectsPlane(t) {
      return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
    }
    clampPoint(t, e) {
      const n = this.center.distanceToSquared(t);
      return (
        e.copy(t),
        n > this.radius * this.radius &&
          (e.sub(this.center).normalize(),
          e.multiplyScalar(this.radius).add(this.center)),
        e
      );
    }
    getBoundingBox(t) {
      return this.isEmpty()
        ? (t.makeEmpty(), t)
        : (t.set(this.center, this.center), t.expandByScalar(this.radius), t);
    }
    applyMatrix4(t) {
      return (
        this.center.applyMatrix4(t),
        (this.radius = this.radius * t.getMaxScaleOnAxis()),
        this
      );
    }
    translate(t) {
      return this.center.add(t), this;
    }
    expandByPoint(t) {
      nn.subVectors(t, this.center);
      const e = nn.lengthSq();
      if (e > this.radius * this.radius) {
        const t = Math.sqrt(e),
          n = 0.5 * (t - this.radius);
        this.center.add(nn.multiplyScalar(n / t)), (this.radius += n);
      }
      return this;
    }
    union(t) {
      return (
        !0 === this.center.equals(t.center)
          ? en.set(0, 0, 1).multiplyScalar(t.radius)
          : en
              .subVectors(t.center, this.center)
              .normalize()
              .multiplyScalar(t.radius),
        this.expandByPoint(tn.copy(t.center).add(en)),
        this.expandByPoint(tn.copy(t.center).sub(en)),
        this
      );
    }
    equals(t) {
      return t.center.equals(this.center) && t.radius === this.radius;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const sn = new ze(),
    on = new ze(),
    an = new ze(),
    ln = new ze(),
    cn = new ze(),
    hn = new ze(),
    un = new ze();
  class dn {
    constructor(t = new ze(), e = new ze(0, 0, -1)) {
      (this.origin = t), (this.direction = e);
    }
    set(t, e) {
      return this.origin.copy(t), this.direction.copy(e), this;
    }
    copy(t) {
      return this.origin.copy(t.origin), this.direction.copy(t.direction), this;
    }
    at(t, e) {
      return e.copy(this.direction).multiplyScalar(t).add(this.origin);
    }
    lookAt(t) {
      return this.direction.copy(t).sub(this.origin).normalize(), this;
    }
    recast(t) {
      return this.origin.copy(this.at(t, sn)), this;
    }
    closestPointToPoint(t, e) {
      e.subVectors(t, this.origin);
      const n = e.dot(this.direction);
      return n < 0
        ? e.copy(this.origin)
        : e.copy(this.direction).multiplyScalar(n).add(this.origin);
    }
    distanceToPoint(t) {
      return Math.sqrt(this.distanceSqToPoint(t));
    }
    distanceSqToPoint(t) {
      const e = sn.subVectors(t, this.origin).dot(this.direction);
      return e < 0
        ? this.origin.distanceToSquared(t)
        : (sn.copy(this.direction).multiplyScalar(e).add(this.origin),
          sn.distanceToSquared(t));
    }
    distanceSqToSegment(t, e, n, i) {
      on.copy(t).add(e).multiplyScalar(0.5),
        an.copy(e).sub(t).normalize(),
        ln.copy(this.origin).sub(on);
      const r = 0.5 * t.distanceTo(e),
        s = -this.direction.dot(an),
        o = ln.dot(this.direction),
        a = -ln.dot(an),
        l = ln.lengthSq(),
        c = Math.abs(1 - s * s);
      let h, u, d, p;
      if (c > 0)
        if (((h = s * a - o), (u = s * o - a), (p = r * c), h >= 0))
          if (u >= -p)
            if (u <= p) {
              const t = 1 / c;
              (h *= t),
                (u *= t),
                (d = h * (h + s * u + 2 * o) + u * (s * h + u + 2 * a) + l);
            } else
              (u = r),
                (h = Math.max(0, -(s * u + o))),
                (d = -h * h + u * (u + 2 * a) + l);
          else
            (u = -r),
              (h = Math.max(0, -(s * u + o))),
              (d = -h * h + u * (u + 2 * a) + l);
        else
          u <= -p
            ? ((h = Math.max(0, -(-s * r + o))),
              (u = h > 0 ? -r : Math.min(Math.max(-r, -a), r)),
              (d = -h * h + u * (u + 2 * a) + l))
            : u <= p
            ? ((h = 0),
              (u = Math.min(Math.max(-r, -a), r)),
              (d = u * (u + 2 * a) + l))
            : ((h = Math.max(0, -(s * r + o))),
              (u = h > 0 ? r : Math.min(Math.max(-r, -a), r)),
              (d = -h * h + u * (u + 2 * a) + l));
      else
        (u = s > 0 ? -r : r),
          (h = Math.max(0, -(s * u + o))),
          (d = -h * h + u * (u + 2 * a) + l);
      return (
        n && n.copy(this.direction).multiplyScalar(h).add(this.origin),
        i && i.copy(an).multiplyScalar(u).add(on),
        d
      );
    }
    intersectSphere(t, e) {
      sn.subVectors(t.center, this.origin);
      const n = sn.dot(this.direction),
        i = sn.dot(sn) - n * n,
        r = t.radius * t.radius;
      if (i > r) return null;
      const s = Math.sqrt(r - i),
        o = n - s,
        a = n + s;
      return o < 0 && a < 0 ? null : o < 0 ? this.at(a, e) : this.at(o, e);
    }
    intersectsSphere(t) {
      return this.distanceSqToPoint(t.center) <= t.radius * t.radius;
    }
    distanceToPlane(t) {
      const e = t.normal.dot(this.direction);
      if (0 === e) return 0 === t.distanceToPoint(this.origin) ? 0 : null;
      const n = -(this.origin.dot(t.normal) + t.constant) / e;
      return n >= 0 ? n : null;
    }
    intersectPlane(t, e) {
      const n = this.distanceToPlane(t);
      return null === n ? null : this.at(n, e);
    }
    intersectsPlane(t) {
      const e = t.distanceToPoint(this.origin);
      if (0 === e) return !0;
      return t.normal.dot(this.direction) * e < 0;
    }
    intersectBox(t, e) {
      let n, i, r, s, o, a;
      const l = 1 / this.direction.x,
        c = 1 / this.direction.y,
        h = 1 / this.direction.z,
        u = this.origin;
      return (
        l >= 0
          ? ((n = (t.min.x - u.x) * l), (i = (t.max.x - u.x) * l))
          : ((n = (t.max.x - u.x) * l), (i = (t.min.x - u.x) * l)),
        c >= 0
          ? ((r = (t.min.y - u.y) * c), (s = (t.max.y - u.y) * c))
          : ((r = (t.max.y - u.y) * c), (s = (t.min.y - u.y) * c)),
        n > s || r > i
          ? null
          : ((r > n || n != n) && (n = r),
            (s < i || i != i) && (i = s),
            h >= 0
              ? ((o = (t.min.z - u.z) * h), (a = (t.max.z - u.z) * h))
              : ((o = (t.max.z - u.z) * h), (a = (t.min.z - u.z) * h)),
            n > a || o > i
              ? null
              : ((o > n || n != n) && (n = o),
                (a < i || i != i) && (i = a),
                i < 0 ? null : this.at(n >= 0 ? n : i, e)))
      );
    }
    intersectsBox(t) {
      return null !== this.intersectBox(t, sn);
    }
    intersectTriangle(t, e, n, i, r) {
      cn.subVectors(e, t), hn.subVectors(n, t), un.crossVectors(cn, hn);
      let s,
        o = this.direction.dot(un);
      if (o > 0) {
        if (i) return null;
        s = 1;
      } else {
        if (!(o < 0)) return null;
        (s = -1), (o = -o);
      }
      ln.subVectors(this.origin, t);
      const a = s * this.direction.dot(hn.crossVectors(ln, hn));
      if (a < 0) return null;
      const l = s * this.direction.dot(cn.cross(ln));
      if (l < 0) return null;
      if (a + l > o) return null;
      const c = -s * ln.dot(un);
      return c < 0 ? null : this.at(c / o, r);
    }
    applyMatrix4(t) {
      return (
        this.origin.applyMatrix4(t), this.direction.transformDirection(t), this
      );
    }
    equals(t) {
      return t.origin.equals(this.origin) && t.direction.equals(this.direction);
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  class pn {
    constructor() {
      (this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        arguments.length > 0 &&
          console.error(
            "THREE.Matrix4: the constructor no longer reads arguments. use .set() instead."
          );
    }
    set(t, e, n, i, r, s, o, a, l, c, h, u, d, p, m, f) {
      const g = this.elements;
      return (
        (g[0] = t),
        (g[4] = e),
        (g[8] = n),
        (g[12] = i),
        (g[1] = r),
        (g[5] = s),
        (g[9] = o),
        (g[13] = a),
        (g[2] = l),
        (g[6] = c),
        (g[10] = h),
        (g[14] = u),
        (g[3] = d),
        (g[7] = p),
        (g[11] = m),
        (g[15] = f),
        this
      );
    }
    identity() {
      return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    clone() {
      return new pn().fromArray(this.elements);
    }
    copy(t) {
      const e = this.elements,
        n = t.elements;
      return (
        (e[0] = n[0]),
        (e[1] = n[1]),
        (e[2] = n[2]),
        (e[3] = n[3]),
        (e[4] = n[4]),
        (e[5] = n[5]),
        (e[6] = n[6]),
        (e[7] = n[7]),
        (e[8] = n[8]),
        (e[9] = n[9]),
        (e[10] = n[10]),
        (e[11] = n[11]),
        (e[12] = n[12]),
        (e[13] = n[13]),
        (e[14] = n[14]),
        (e[15] = n[15]),
        this
      );
    }
    copyPosition(t) {
      const e = this.elements,
        n = t.elements;
      return (e[12] = n[12]), (e[13] = n[13]), (e[14] = n[14]), this;
    }
    setFromMatrix3(t) {
      const e = t.elements;
      return (
        this.set(
          e[0],
          e[3],
          e[6],
          0,
          e[1],
          e[4],
          e[7],
          0,
          e[2],
          e[5],
          e[8],
          0,
          0,
          0,
          0,
          1
        ),
        this
      );
    }
    extractBasis(t, e, n) {
      return (
        t.setFromMatrixColumn(this, 0),
        e.setFromMatrixColumn(this, 1),
        n.setFromMatrixColumn(this, 2),
        this
      );
    }
    makeBasis(t, e, n) {
      return (
        this.set(
          t.x,
          e.x,
          n.x,
          0,
          t.y,
          e.y,
          n.y,
          0,
          t.z,
          e.z,
          n.z,
          0,
          0,
          0,
          0,
          1
        ),
        this
      );
    }
    extractRotation(t) {
      const e = this.elements,
        n = t.elements,
        i = 1 / mn.setFromMatrixColumn(t, 0).length(),
        r = 1 / mn.setFromMatrixColumn(t, 1).length(),
        s = 1 / mn.setFromMatrixColumn(t, 2).length();
      return (
        (e[0] = n[0] * i),
        (e[1] = n[1] * i),
        (e[2] = n[2] * i),
        (e[3] = 0),
        (e[4] = n[4] * r),
        (e[5] = n[5] * r),
        (e[6] = n[6] * r),
        (e[7] = 0),
        (e[8] = n[8] * s),
        (e[9] = n[9] * s),
        (e[10] = n[10] * s),
        (e[11] = 0),
        (e[12] = 0),
        (e[13] = 0),
        (e[14] = 0),
        (e[15] = 1),
        this
      );
    }
    makeRotationFromEuler(t) {
      (t && t.isEuler) ||
        console.error(
          "THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order."
        );
      const e = this.elements,
        n = t.x,
        i = t.y,
        r = t.z,
        s = Math.cos(n),
        o = Math.sin(n),
        a = Math.cos(i),
        l = Math.sin(i),
        c = Math.cos(r),
        h = Math.sin(r);
      if ("XYZ" === t.order) {
        const t = s * c,
          n = s * h,
          i = o * c,
          r = o * h;
        (e[0] = a * c),
          (e[4] = -a * h),
          (e[8] = l),
          (e[1] = n + i * l),
          (e[5] = t - r * l),
          (e[9] = -o * a),
          (e[2] = r - t * l),
          (e[6] = i + n * l),
          (e[10] = s * a);
      } else if ("YXZ" === t.order) {
        const t = a * c,
          n = a * h,
          i = l * c,
          r = l * h;
        (e[0] = t + r * o),
          (e[4] = i * o - n),
          (e[8] = s * l),
          (e[1] = s * h),
          (e[5] = s * c),
          (e[9] = -o),
          (e[2] = n * o - i),
          (e[6] = r + t * o),
          (e[10] = s * a);
      } else if ("ZXY" === t.order) {
        const t = a * c,
          n = a * h,
          i = l * c,
          r = l * h;
        (e[0] = t - r * o),
          (e[4] = -s * h),
          (e[8] = i + n * o),
          (e[1] = n + i * o),
          (e[5] = s * c),
          (e[9] = r - t * o),
          (e[2] = -s * l),
          (e[6] = o),
          (e[10] = s * a);
      } else if ("ZYX" === t.order) {
        const t = s * c,
          n = s * h,
          i = o * c,
          r = o * h;
        (e[0] = a * c),
          (e[4] = i * l - n),
          (e[8] = t * l + r),
          (e[1] = a * h),
          (e[5] = r * l + t),
          (e[9] = n * l - i),
          (e[2] = -l),
          (e[6] = o * a),
          (e[10] = s * a);
      } else if ("YZX" === t.order) {
        const t = s * a,
          n = s * l,
          i = o * a,
          r = o * l;
        (e[0] = a * c),
          (e[4] = r - t * h),
          (e[8] = i * h + n),
          (e[1] = h),
          (e[5] = s * c),
          (e[9] = -o * c),
          (e[2] = -l * c),
          (e[6] = n * h + i),
          (e[10] = t - r * h);
      } else if ("XZY" === t.order) {
        const t = s * a,
          n = s * l,
          i = o * a,
          r = o * l;
        (e[0] = a * c),
          (e[4] = -h),
          (e[8] = l * c),
          (e[1] = t * h + r),
          (e[5] = s * c),
          (e[9] = n * h - i),
          (e[2] = i * h - n),
          (e[6] = o * c),
          (e[10] = r * h + t);
      }
      return (
        (e[3] = 0),
        (e[7] = 0),
        (e[11] = 0),
        (e[12] = 0),
        (e[13] = 0),
        (e[14] = 0),
        (e[15] = 1),
        this
      );
    }
    makeRotationFromQuaternion(t) {
      return this.compose(gn, t, vn);
    }
    lookAt(t, e, n) {
      const i = this.elements;
      return (
        yn.subVectors(t, e),
        0 === yn.lengthSq() && (yn.z = 1),
        yn.normalize(),
        xn.crossVectors(n, yn),
        0 === xn.lengthSq() &&
          (1 === Math.abs(n.z) ? (yn.x += 1e-4) : (yn.z += 1e-4),
          yn.normalize(),
          xn.crossVectors(n, yn)),
        xn.normalize(),
        _n.crossVectors(yn, xn),
        (i[0] = xn.x),
        (i[4] = _n.x),
        (i[8] = yn.x),
        (i[1] = xn.y),
        (i[5] = _n.y),
        (i[9] = yn.y),
        (i[2] = xn.z),
        (i[6] = _n.z),
        (i[10] = yn.z),
        this
      );
    }
    multiply(t, e) {
      return void 0 !== e
        ? (console.warn(
            "THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."
          ),
          this.multiplyMatrices(t, e))
        : this.multiplyMatrices(this, t);
    }
    premultiply(t) {
      return this.multiplyMatrices(t, this);
    }
    multiplyMatrices(t, e) {
      const n = t.elements,
        i = e.elements,
        r = this.elements,
        s = n[0],
        o = n[4],
        a = n[8],
        l = n[12],
        c = n[1],
        h = n[5],
        u = n[9],
        d = n[13],
        p = n[2],
        m = n[6],
        f = n[10],
        g = n[14],
        v = n[3],
        x = n[7],
        _ = n[11],
        y = n[15],
        b = i[0],
        w = i[4],
        M = i[8],
        S = i[12],
        T = i[1],
        E = i[5],
        A = i[9],
        L = i[13],
        R = i[2],
        C = i[6],
        P = i[10],
        D = i[14],
        I = i[3],
        N = i[7],
        z = i[11],
        k = i[15];
      return (
        (r[0] = s * b + o * T + a * R + l * I),
        (r[4] = s * w + o * E + a * C + l * N),
        (r[8] = s * M + o * A + a * P + l * z),
        (r[12] = s * S + o * L + a * D + l * k),
        (r[1] = c * b + h * T + u * R + d * I),
        (r[5] = c * w + h * E + u * C + d * N),
        (r[9] = c * M + h * A + u * P + d * z),
        (r[13] = c * S + h * L + u * D + d * k),
        (r[2] = p * b + m * T + f * R + g * I),
        (r[6] = p * w + m * E + f * C + g * N),
        (r[10] = p * M + m * A + f * P + g * z),
        (r[14] = p * S + m * L + f * D + g * k),
        (r[3] = v * b + x * T + _ * R + y * I),
        (r[7] = v * w + x * E + _ * C + y * N),
        (r[11] = v * M + x * A + _ * P + y * z),
        (r[15] = v * S + x * L + _ * D + y * k),
        this
      );
    }
    multiplyScalar(t) {
      const e = this.elements;
      return (
        (e[0] *= t),
        (e[4] *= t),
        (e[8] *= t),
        (e[12] *= t),
        (e[1] *= t),
        (e[5] *= t),
        (e[9] *= t),
        (e[13] *= t),
        (e[2] *= t),
        (e[6] *= t),
        (e[10] *= t),
        (e[14] *= t),
        (e[3] *= t),
        (e[7] *= t),
        (e[11] *= t),
        (e[15] *= t),
        this
      );
    }
    determinant() {
      const t = this.elements,
        e = t[0],
        n = t[4],
        i = t[8],
        r = t[12],
        s = t[1],
        o = t[5],
        a = t[9],
        l = t[13],
        c = t[2],
        h = t[6],
        u = t[10],
        d = t[14];
      return (
        t[3] *
          (+r * a * h -
            i * l * h -
            r * o * u +
            n * l * u +
            i * o * d -
            n * a * d) +
        t[7] *
          (+e * a * d -
            e * l * u +
            r * s * u -
            i * s * d +
            i * l * c -
            r * a * c) +
        t[11] *
          (+e * l * h -
            e * o * d -
            r * s * h +
            n * s * d +
            r * o * c -
            n * l * c) +
        t[15] *
          (-i * o * c -
            e * a * h +
            e * o * u +
            i * s * h -
            n * s * u +
            n * a * c)
      );
    }
    transpose() {
      const t = this.elements;
      let e;
      return (
        (e = t[1]),
        (t[1] = t[4]),
        (t[4] = e),
        (e = t[2]),
        (t[2] = t[8]),
        (t[8] = e),
        (e = t[6]),
        (t[6] = t[9]),
        (t[9] = e),
        (e = t[3]),
        (t[3] = t[12]),
        (t[12] = e),
        (e = t[7]),
        (t[7] = t[13]),
        (t[13] = e),
        (e = t[11]),
        (t[11] = t[14]),
        (t[14] = e),
        this
      );
    }
    setPosition(t, e, n) {
      const i = this.elements;
      return (
        t.isVector3
          ? ((i[12] = t.x), (i[13] = t.y), (i[14] = t.z))
          : ((i[12] = t), (i[13] = e), (i[14] = n)),
        this
      );
    }
    invert() {
      const t = this.elements,
        e = t[0],
        n = t[1],
        i = t[2],
        r = t[3],
        s = t[4],
        o = t[5],
        a = t[6],
        l = t[7],
        c = t[8],
        h = t[9],
        u = t[10],
        d = t[11],
        p = t[12],
        m = t[13],
        f = t[14],
        g = t[15],
        v =
          h * f * l - m * u * l + m * a * d - o * f * d - h * a * g + o * u * g,
        x =
          p * u * l - c * f * l - p * a * d + s * f * d + c * a * g - s * u * g,
        _ =
          c * m * l - p * h * l + p * o * d - s * m * d - c * o * g + s * h * g,
        y =
          p * h * a - c * m * a - p * o * u + s * m * u + c * o * f - s * h * f,
        b = e * v + n * x + i * _ + r * y;
      if (0 === b)
        return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      const w = 1 / b;
      return (
        (t[0] = v * w),
        (t[1] =
          (m * u * r -
            h * f * r -
            m * i * d +
            n * f * d +
            h * i * g -
            n * u * g) *
          w),
        (t[2] =
          (o * f * r -
            m * a * r +
            m * i * l -
            n * f * l -
            o * i * g +
            n * a * g) *
          w),
        (t[3] =
          (h * a * r -
            o * u * r -
            h * i * l +
            n * u * l +
            o * i * d -
            n * a * d) *
          w),
        (t[4] = x * w),
        (t[5] =
          (c * f * r -
            p * u * r +
            p * i * d -
            e * f * d -
            c * i * g +
            e * u * g) *
          w),
        (t[6] =
          (p * a * r -
            s * f * r -
            p * i * l +
            e * f * l +
            s * i * g -
            e * a * g) *
          w),
        (t[7] =
          (s * u * r -
            c * a * r +
            c * i * l -
            e * u * l -
            s * i * d +
            e * a * d) *
          w),
        (t[8] = _ * w),
        (t[9] =
          (p * h * r -
            c * m * r -
            p * n * d +
            e * m * d +
            c * n * g -
            e * h * g) *
          w),
        (t[10] =
          (s * m * r -
            p * o * r +
            p * n * l -
            e * m * l -
            s * n * g +
            e * o * g) *
          w),
        (t[11] =
          (c * o * r -
            s * h * r -
            c * n * l +
            e * h * l +
            s * n * d -
            e * o * d) *
          w),
        (t[12] = y * w),
        (t[13] =
          (c * m * i -
            p * h * i +
            p * n * u -
            e * m * u -
            c * n * f +
            e * h * f) *
          w),
        (t[14] =
          (p * o * i -
            s * m * i -
            p * n * a +
            e * m * a +
            s * n * f -
            e * o * f) *
          w),
        (t[15] =
          (s * h * i -
            c * o * i +
            c * n * a -
            e * h * a -
            s * n * u +
            e * o * u) *
          w),
        this
      );
    }
    scale(t) {
      const e = this.elements,
        n = t.x,
        i = t.y,
        r = t.z;
      return (
        (e[0] *= n),
        (e[4] *= i),
        (e[8] *= r),
        (e[1] *= n),
        (e[5] *= i),
        (e[9] *= r),
        (e[2] *= n),
        (e[6] *= i),
        (e[10] *= r),
        (e[3] *= n),
        (e[7] *= i),
        (e[11] *= r),
        this
      );
    }
    getMaxScaleOnAxis() {
      const t = this.elements,
        e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2],
        n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6],
        i = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
      return Math.sqrt(Math.max(e, n, i));
    }
    makeTranslation(t, e, n) {
      return this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, n, 0, 0, 0, 1), this;
    }
    makeRotationX(t) {
      const e = Math.cos(t),
        n = Math.sin(t);
      return this.set(1, 0, 0, 0, 0, e, -n, 0, 0, n, e, 0, 0, 0, 0, 1), this;
    }
    makeRotationY(t) {
      const e = Math.cos(t),
        n = Math.sin(t);
      return this.set(e, 0, n, 0, 0, 1, 0, 0, -n, 0, e, 0, 0, 0, 0, 1), this;
    }
    makeRotationZ(t) {
      const e = Math.cos(t),
        n = Math.sin(t);
      return this.set(e, -n, 0, 0, n, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    makeRotationAxis(t, e) {
      const n = Math.cos(e),
        i = Math.sin(e),
        r = 1 - n,
        s = t.x,
        o = t.y,
        a = t.z,
        l = r * s,
        c = r * o;
      return (
        this.set(
          l * s + n,
          l * o - i * a,
          l * a + i * o,
          0,
          l * o + i * a,
          c * o + n,
          c * a - i * s,
          0,
          l * a - i * o,
          c * a + i * s,
          r * a * a + n,
          0,
          0,
          0,
          0,
          1
        ),
        this
      );
    }
    makeScale(t, e, n) {
      return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this;
    }
    makeShear(t, e, n, i, r, s) {
      return this.set(1, n, r, 0, t, 1, s, 0, e, i, 1, 0, 0, 0, 0, 1), this;
    }
    compose(t, e, n) {
      const i = this.elements,
        r = e._x,
        s = e._y,
        o = e._z,
        a = e._w,
        l = r + r,
        c = s + s,
        h = o + o,
        u = r * l,
        d = r * c,
        p = r * h,
        m = s * c,
        f = s * h,
        g = o * h,
        v = a * l,
        x = a * c,
        _ = a * h,
        y = n.x,
        b = n.y,
        w = n.z;
      return (
        (i[0] = (1 - (m + g)) * y),
        (i[1] = (d + _) * y),
        (i[2] = (p - x) * y),
        (i[3] = 0),
        (i[4] = (d - _) * b),
        (i[5] = (1 - (u + g)) * b),
        (i[6] = (f + v) * b),
        (i[7] = 0),
        (i[8] = (p + x) * w),
        (i[9] = (f - v) * w),
        (i[10] = (1 - (u + m)) * w),
        (i[11] = 0),
        (i[12] = t.x),
        (i[13] = t.y),
        (i[14] = t.z),
        (i[15] = 1),
        this
      );
    }
    decompose(t, e, n) {
      const i = this.elements;
      let r = mn.set(i[0], i[1], i[2]).length();
      const s = mn.set(i[4], i[5], i[6]).length(),
        o = mn.set(i[8], i[9], i[10]).length();
      this.determinant() < 0 && (r = -r),
        (t.x = i[12]),
        (t.y = i[13]),
        (t.z = i[14]),
        fn.copy(this);
      const a = 1 / r,
        l = 1 / s,
        c = 1 / o;
      return (
        (fn.elements[0] *= a),
        (fn.elements[1] *= a),
        (fn.elements[2] *= a),
        (fn.elements[4] *= l),
        (fn.elements[5] *= l),
        (fn.elements[6] *= l),
        (fn.elements[8] *= c),
        (fn.elements[9] *= c),
        (fn.elements[10] *= c),
        e.setFromRotationMatrix(fn),
        (n.x = r),
        (n.y = s),
        (n.z = o),
        this
      );
    }
    makePerspective(t, e, n, i, r, s) {
      void 0 === s &&
        console.warn(
          "THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs."
        );
      const o = this.elements,
        a = (2 * r) / (e - t),
        l = (2 * r) / (n - i),
        c = (e + t) / (e - t),
        h = (n + i) / (n - i),
        u = -(s + r) / (s - r),
        d = (-2 * s * r) / (s - r);
      return (
        (o[0] = a),
        (o[4] = 0),
        (o[8] = c),
        (o[12] = 0),
        (o[1] = 0),
        (o[5] = l),
        (o[9] = h),
        (o[13] = 0),
        (o[2] = 0),
        (o[6] = 0),
        (o[10] = u),
        (o[14] = d),
        (o[3] = 0),
        (o[7] = 0),
        (o[11] = -1),
        (o[15] = 0),
        this
      );
    }
    makeOrthographic(t, e, n, i, r, s) {
      const o = this.elements,
        a = 1 / (e - t),
        l = 1 / (n - i),
        c = 1 / (s - r),
        h = (e + t) * a,
        u = (n + i) * l,
        d = (s + r) * c;
      return (
        (o[0] = 2 * a),
        (o[4] = 0),
        (o[8] = 0),
        (o[12] = -h),
        (o[1] = 0),
        (o[5] = 2 * l),
        (o[9] = 0),
        (o[13] = -u),
        (o[2] = 0),
        (o[6] = 0),
        (o[10] = -2 * c),
        (o[14] = -d),
        (o[3] = 0),
        (o[7] = 0),
        (o[11] = 0),
        (o[15] = 1),
        this
      );
    }
    equals(t) {
      const e = this.elements,
        n = t.elements;
      for (let t = 0; t < 16; t++) if (e[t] !== n[t]) return !1;
      return !0;
    }
    fromArray(t, e = 0) {
      for (let n = 0; n < 16; n++) this.elements[n] = t[n + e];
      return this;
    }
    toArray(t = [], e = 0) {
      const n = this.elements;
      return (
        (t[e] = n[0]),
        (t[e + 1] = n[1]),
        (t[e + 2] = n[2]),
        (t[e + 3] = n[3]),
        (t[e + 4] = n[4]),
        (t[e + 5] = n[5]),
        (t[e + 6] = n[6]),
        (t[e + 7] = n[7]),
        (t[e + 8] = n[8]),
        (t[e + 9] = n[9]),
        (t[e + 10] = n[10]),
        (t[e + 11] = n[11]),
        (t[e + 12] = n[12]),
        (t[e + 13] = n[13]),
        (t[e + 14] = n[14]),
        (t[e + 15] = n[15]),
        t
      );
    }
  }
  pn.prototype.isMatrix4 = !0;
  const mn = new ze(),
    fn = new pn(),
    gn = new ze(0, 0, 0),
    vn = new ze(1, 1, 1),
    xn = new ze(),
    _n = new ze(),
    yn = new ze(),
    bn = new pn(),
    wn = new Ne();
  class Mn {
    constructor(t = 0, e = 0, n = 0, i = Mn.DefaultOrder) {
      (this._x = t), (this._y = e), (this._z = n), (this._order = i);
    }
    get x() {
      return this._x;
    }
    set x(t) {
      (this._x = t), this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(t) {
      (this._y = t), this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(t) {
      (this._z = t), this._onChangeCallback();
    }
    get order() {
      return this._order;
    }
    set order(t) {
      (this._order = t), this._onChangeCallback();
    }
    set(t, e, n, i = this._order) {
      return (
        (this._x = t),
        (this._y = e),
        (this._z = n),
        (this._order = i),
        this._onChangeCallback(),
        this
      );
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }
    copy(t) {
      return (
        (this._x = t._x),
        (this._y = t._y),
        (this._z = t._z),
        (this._order = t._order),
        this._onChangeCallback(),
        this
      );
    }
    setFromRotationMatrix(t, e = this._order, n = !0) {
      const i = t.elements,
        r = i[0],
        s = i[4],
        o = i[8],
        a = i[1],
        l = i[5],
        c = i[9],
        h = i[2],
        u = i[6],
        d = i[10];
      switch (e) {
        case "XYZ":
          (this._y = Math.asin(xe(o, -1, 1))),
            Math.abs(o) < 0.9999999
              ? ((this._x = Math.atan2(-c, d)), (this._z = Math.atan2(-s, r)))
              : ((this._x = Math.atan2(u, l)), (this._z = 0));
          break;
        case "YXZ":
          (this._x = Math.asin(-xe(c, -1, 1))),
            Math.abs(c) < 0.9999999
              ? ((this._y = Math.atan2(o, d)), (this._z = Math.atan2(a, l)))
              : ((this._y = Math.atan2(-h, r)), (this._z = 0));
          break;
        case "ZXY":
          (this._x = Math.asin(xe(u, -1, 1))),
            Math.abs(u) < 0.9999999
              ? ((this._y = Math.atan2(-h, d)), (this._z = Math.atan2(-s, l)))
              : ((this._y = 0), (this._z = Math.atan2(a, r)));
          break;
        case "ZYX":
          (this._y = Math.asin(-xe(h, -1, 1))),
            Math.abs(h) < 0.9999999
              ? ((this._x = Math.atan2(u, d)), (this._z = Math.atan2(a, r)))
              : ((this._x = 0), (this._z = Math.atan2(-s, l)));
          break;
        case "YZX":
          (this._z = Math.asin(xe(a, -1, 1))),
            Math.abs(a) < 0.9999999
              ? ((this._x = Math.atan2(-c, l)), (this._y = Math.atan2(-h, r)))
              : ((this._x = 0), (this._y = Math.atan2(o, d)));
          break;
        case "XZY":
          (this._z = Math.asin(-xe(s, -1, 1))),
            Math.abs(s) < 0.9999999
              ? ((this._x = Math.atan2(u, l)), (this._y = Math.atan2(o, r)))
              : ((this._x = Math.atan2(-c, d)), (this._y = 0));
          break;
        default:
          console.warn(
            "THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " +
              e
          );
      }
      return (this._order = e), !0 === n && this._onChangeCallback(), this;
    }
    setFromQuaternion(t, e, n) {
      return (
        bn.makeRotationFromQuaternion(t), this.setFromRotationMatrix(bn, e, n)
      );
    }
    setFromVector3(t, e = this._order) {
      return this.set(t.x, t.y, t.z, e);
    }
    reorder(t) {
      return wn.setFromEuler(this), this.setFromQuaternion(wn, t);
    }
    equals(t) {
      return (
        t._x === this._x &&
        t._y === this._y &&
        t._z === this._z &&
        t._order === this._order
      );
    }
    fromArray(t) {
      return (
        (this._x = t[0]),
        (this._y = t[1]),
        (this._z = t[2]),
        void 0 !== t[3] && (this._order = t[3]),
        this._onChangeCallback(),
        this
      );
    }
    toArray(t = [], e = 0) {
      return (
        (t[e] = this._x),
        (t[e + 1] = this._y),
        (t[e + 2] = this._z),
        (t[e + 3] = this._order),
        t
      );
    }
    toVector3(t) {
      return t
        ? t.set(this._x, this._y, this._z)
        : new ze(this._x, this._y, this._z);
    }
    _onChange(t) {
      return (this._onChangeCallback = t), this;
    }
    _onChangeCallback() {}
  }
  (Mn.prototype.isEuler = !0),
    (Mn.DefaultOrder = "XYZ"),
    (Mn.RotationOrders = ["XYZ", "YZX", "ZXY", "XZY", "YXZ", "ZYX"]);
  class Sn {
    constructor() {
      this.mask = 1;
    }
    set(t) {
      this.mask = (1 << t) >>> 0;
    }
    enable(t) {
      this.mask |= 1 << t;
    }
    enableAll() {
      this.mask = -1;
    }
    toggle(t) {
      this.mask ^= 1 << t;
    }
    disable(t) {
      this.mask &= ~(1 << t);
    }
    disableAll() {
      this.mask = 0;
    }
    test(t) {
      return !!(this.mask & t.mask);
    }
    isEnabled(t) {
      return !!(this.mask & (1 << t));
    }
  }
  let Tn = 0;
  const En = new ze(),
    An = new Ne(),
    Ln = new pn(),
    Rn = new ze(),
    Cn = new ze(),
    Pn = new ze(),
    Dn = new Ne(),
    In = new ze(1, 0, 0),
    Nn = new ze(0, 1, 0),
    zn = new ze(0, 0, 1),
    kn = { type: "added" },
    On = { type: "removed" };
  class Fn extends pe {
    constructor() {
      super(),
        Object.defineProperty(this, "id", { value: Tn++ }),
        (this.uuid = ve()),
        (this.name = ""),
        (this.type = "Object3D"),
        (this.parent = null),
        (this.children = []),
        (this.up = Fn.DefaultUp.clone());
      const t = new ze(),
        e = new Mn(),
        n = new Ne(),
        i = new ze(1, 1, 1);
      e._onChange(function () {
        n.setFromEuler(e, !1);
      }),
        n._onChange(function () {
          e.setFromQuaternion(n, void 0, !1);
        }),
        Object.defineProperties(this, {
          position: { configurable: !0, enumerable: !0, value: t },
          rotation: { configurable: !0, enumerable: !0, value: e },
          quaternion: { configurable: !0, enumerable: !0, value: n },
          scale: { configurable: !0, enumerable: !0, value: i },
          modelViewMatrix: { value: new pn() },
          normalMatrix: { value: new Me() },
        }),
        (this.matrix = new pn()),
        (this.matrixWorld = new pn()),
        (this.matrixAutoUpdate = Fn.DefaultMatrixAutoUpdate),
        (this.matrixWorldNeedsUpdate = !1),
        (this.layers = new Sn()),
        (this.visible = !0),
        (this.castShadow = !1),
        (this.receiveShadow = !1),
        (this.frustumCulled = !0),
        (this.renderOrder = 0),
        (this.animations = []),
        (this.userData = {});
    }
    onBeforeRender() {}
    onAfterRender() {}
    applyMatrix4(t) {
      this.matrixAutoUpdate && this.updateMatrix(),
        this.matrix.premultiply(t),
        this.matrix.decompose(this.position, this.quaternion, this.scale);
    }
    applyQuaternion(t) {
      return this.quaternion.premultiply(t), this;
    }
    setRotationFromAxisAngle(t, e) {
      this.quaternion.setFromAxisAngle(t, e);
    }
    setRotationFromEuler(t) {
      this.quaternion.setFromEuler(t, !0);
    }
    setRotationFromMatrix(t) {
      this.quaternion.setFromRotationMatrix(t);
    }
    setRotationFromQuaternion(t) {
      this.quaternion.copy(t);
    }
    rotateOnAxis(t, e) {
      return An.setFromAxisAngle(t, e), this.quaternion.multiply(An), this;
    }
    rotateOnWorldAxis(t, e) {
      return An.setFromAxisAngle(t, e), this.quaternion.premultiply(An), this;
    }
    rotateX(t) {
      return this.rotateOnAxis(In, t);
    }
    rotateY(t) {
      return this.rotateOnAxis(Nn, t);
    }
    rotateZ(t) {
      return this.rotateOnAxis(zn, t);
    }
    translateOnAxis(t, e) {
      return (
        En.copy(t).applyQuaternion(this.quaternion),
        this.position.add(En.multiplyScalar(e)),
        this
      );
    }
    translateX(t) {
      return this.translateOnAxis(In, t);
    }
    translateY(t) {
      return this.translateOnAxis(Nn, t);
    }
    translateZ(t) {
      return this.translateOnAxis(zn, t);
    }
    localToWorld(t) {
      return t.applyMatrix4(this.matrixWorld);
    }
    worldToLocal(t) {
      return t.applyMatrix4(Ln.copy(this.matrixWorld).invert());
    }
    lookAt(t, e, n) {
      t.isVector3 ? Rn.copy(t) : Rn.set(t, e, n);
      const i = this.parent;
      this.updateWorldMatrix(!0, !1),
        Cn.setFromMatrixPosition(this.matrixWorld),
        this.isCamera || this.isLight
          ? Ln.lookAt(Cn, Rn, this.up)
          : Ln.lookAt(Rn, Cn, this.up),
        this.quaternion.setFromRotationMatrix(Ln),
        i &&
          (Ln.extractRotation(i.matrixWorld),
          An.setFromRotationMatrix(Ln),
          this.quaternion.premultiply(An.invert()));
    }
    add(t) {
      if (arguments.length > 1) {
        for (let t = 0; t < arguments.length; t++) this.add(arguments[t]);
        return this;
      }
      return t === this
        ? (console.error(
            "THREE.Object3D.add: object can't be added as a child of itself.",
            t
          ),
          this)
        : (t && t.isObject3D
            ? (null !== t.parent && t.parent.remove(t),
              (t.parent = this),
              this.children.push(t),
              t.dispatchEvent(kn))
            : console.error(
                "THREE.Object3D.add: object not an instance of THREE.Object3D.",
                t
              ),
          this);
    }
    remove(t) {
      if (arguments.length > 1) {
        for (let t = 0; t < arguments.length; t++) this.remove(arguments[t]);
        return this;
      }
      const e = this.children.indexOf(t);
      return (
        -1 !== e &&
          ((t.parent = null), this.children.splice(e, 1), t.dispatchEvent(On)),
        this
      );
    }
    removeFromParent() {
      const t = this.parent;
      return null !== t && t.remove(this), this;
    }
    clear() {
      for (let t = 0; t < this.children.length; t++) {
        const e = this.children[t];
        (e.parent = null), e.dispatchEvent(On);
      }
      return (this.children.length = 0), this;
    }
    attach(t) {
      return (
        this.updateWorldMatrix(!0, !1),
        Ln.copy(this.matrixWorld).invert(),
        null !== t.parent &&
          (t.parent.updateWorldMatrix(!0, !1),
          Ln.multiply(t.parent.matrixWorld)),
        t.applyMatrix4(Ln),
        this.add(t),
        t.updateWorldMatrix(!1, !0),
        this
      );
    }
    getObjectById(t) {
      return this.getObjectByProperty("id", t);
    }
    getObjectByName(t) {
      return this.getObjectByProperty("name", t);
    }
    getObjectByProperty(t, e) {
      if (this[t] === e) return this;
      for (let n = 0, i = this.children.length; n < i; n++) {
        const i = this.children[n].getObjectByProperty(t, e);
        if (void 0 !== i) return i;
      }
    }
    getWorldPosition(t) {
      return (
        this.updateWorldMatrix(!0, !1),
        t.setFromMatrixPosition(this.matrixWorld)
      );
    }
    getWorldQuaternion(t) {
      return (
        this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Cn, t, Pn), t
      );
    }
    getWorldScale(t) {
      return (
        this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Cn, Dn, t), t
      );
    }
    getWorldDirection(t) {
      this.updateWorldMatrix(!0, !1);
      const e = this.matrixWorld.elements;
      return t.set(e[8], e[9], e[10]).normalize();
    }
    raycast() {}
    traverse(t) {
      t(this);
      const e = this.children;
      for (let n = 0, i = e.length; n < i; n++) e[n].traverse(t);
    }
    traverseVisible(t) {
      if (!1 === this.visible) return;
      t(this);
      const e = this.children;
      for (let n = 0, i = e.length; n < i; n++) e[n].traverseVisible(t);
    }
    traverseAncestors(t) {
      const e = this.parent;
      null !== e && (t(e), e.traverseAncestors(t));
    }
    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale),
        (this.matrixWorldNeedsUpdate = !0);
    }
    updateMatrixWorld(t) {
      this.matrixAutoUpdate && this.updateMatrix(),
        (this.matrixWorldNeedsUpdate || t) &&
          (null === this.parent
            ? this.matrixWorld.copy(this.matrix)
            : this.matrixWorld.multiplyMatrices(
                this.parent.matrixWorld,
                this.matrix
              ),
          (this.matrixWorldNeedsUpdate = !1),
          (t = !0));
      const e = this.children;
      for (let n = 0, i = e.length; n < i; n++) e[n].updateMatrixWorld(t);
    }
    updateWorldMatrix(t, e) {
      const n = this.parent;
      if (
        (!0 === t && null !== n && n.updateWorldMatrix(!0, !1),
        this.matrixAutoUpdate && this.updateMatrix(),
        null === this.parent
          ? this.matrixWorld.copy(this.matrix)
          : this.matrixWorld.multiplyMatrices(
              this.parent.matrixWorld,
              this.matrix
            ),
        !0 === e)
      ) {
        const t = this.children;
        for (let e = 0, n = t.length; e < n; e++)
          t[e].updateWorldMatrix(!1, !0);
      }
    }
    toJSON(t) {
      const e = void 0 === t || "string" == typeof t,
        n = {};
      e &&
        ((t = {
          geometries: {},
          materials: {},
          textures: {},
          images: {},
          shapes: {},
          skeletons: {},
          animations: {},
        }),
        (n.metadata = {
          version: 4.5,
          type: "Object",
          generator: "Object3D.toJSON",
        }));
      const i = {};
      function r(e, n) {
        return void 0 === e[n.uuid] && (e[n.uuid] = n.toJSON(t)), n.uuid;
      }
      if (
        ((i.uuid = this.uuid),
        (i.type = this.type),
        "" !== this.name && (i.name = this.name),
        !0 === this.castShadow && (i.castShadow = !0),
        !0 === this.receiveShadow && (i.receiveShadow = !0),
        !1 === this.visible && (i.visible = !1),
        !1 === this.frustumCulled && (i.frustumCulled = !1),
        0 !== this.renderOrder && (i.renderOrder = this.renderOrder),
        "{}" !== JSON.stringify(this.userData) && (i.userData = this.userData),
        (i.layers = this.layers.mask),
        (i.matrix = this.matrix.toArray()),
        !1 === this.matrixAutoUpdate && (i.matrixAutoUpdate = !1),
        this.isInstancedMesh &&
          ((i.type = "InstancedMesh"),
          (i.count = this.count),
          (i.instanceMatrix = this.instanceMatrix.toJSON()),
          null !== this.instanceColor &&
            (i.instanceColor = this.instanceColor.toJSON())),
        this.isScene)
      )
        this.background &&
          (this.background.isColor
            ? (i.background = this.background.toJSON())
            : this.background.isTexture &&
              (i.background = this.background.toJSON(t).uuid)),
          this.environment &&
            this.environment.isTexture &&
            (i.environment = this.environment.toJSON(t).uuid);
      else if (this.isMesh || this.isLine || this.isPoints) {
        i.geometry = r(t.geometries, this.geometry);
        const e = this.geometry.parameters;
        if (void 0 !== e && void 0 !== e.shapes) {
          const n = e.shapes;
          if (Array.isArray(n))
            for (let e = 0, i = n.length; e < i; e++) {
              const i = n[e];
              r(t.shapes, i);
            }
          else r(t.shapes, n);
        }
      }
      if (
        (this.isSkinnedMesh &&
          ((i.bindMode = this.bindMode),
          (i.bindMatrix = this.bindMatrix.toArray()),
          void 0 !== this.skeleton &&
            (r(t.skeletons, this.skeleton), (i.skeleton = this.skeleton.uuid))),
        void 0 !== this.material)
      )
        if (Array.isArray(this.material)) {
          const e = [];
          for (let n = 0, i = this.material.length; n < i; n++)
            e.push(r(t.materials, this.material[n]));
          i.material = e;
        } else i.material = r(t.materials, this.material);
      if (this.children.length > 0) {
        i.children = [];
        for (let e = 0; e < this.children.length; e++)
          i.children.push(this.children[e].toJSON(t).object);
      }
      if (this.animations.length > 0) {
        i.animations = [];
        for (let e = 0; e < this.animations.length; e++) {
          const n = this.animations[e];
          i.animations.push(r(t.animations, n));
        }
      }
      if (e) {
        const e = s(t.geometries),
          i = s(t.materials),
          r = s(t.textures),
          o = s(t.images),
          a = s(t.shapes),
          l = s(t.skeletons),
          c = s(t.animations);
        e.length > 0 && (n.geometries = e),
          i.length > 0 && (n.materials = i),
          r.length > 0 && (n.textures = r),
          o.length > 0 && (n.images = o),
          a.length > 0 && (n.shapes = a),
          l.length > 0 && (n.skeletons = l),
          c.length > 0 && (n.animations = c);
      }
      return (n.object = i), n;
      function s(t) {
        const e = [];
        for (const n in t) {
          const i = t[n];
          delete i.metadata, e.push(i);
        }
        return e;
      }
    }
    clone(t) {
      return new this.constructor().copy(this, t);
    }
    copy(t, e = !0) {
      if (
        ((this.name = t.name),
        this.up.copy(t.up),
        this.position.copy(t.position),
        (this.rotation.order = t.rotation.order),
        this.quaternion.copy(t.quaternion),
        this.scale.copy(t.scale),
        this.matrix.copy(t.matrix),
        this.matrixWorld.copy(t.matrixWorld),
        (this.matrixAutoUpdate = t.matrixAutoUpdate),
        (this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate),
        (this.layers.mask = t.layers.mask),
        (this.visible = t.visible),
        (this.castShadow = t.castShadow),
        (this.receiveShadow = t.receiveShadow),
        (this.frustumCulled = t.frustumCulled),
        (this.renderOrder = t.renderOrder),
        (this.userData = JSON.parse(JSON.stringify(t.userData))),
        !0 === e)
      )
        for (let e = 0; e < t.children.length; e++) {
          const n = t.children[e];
          this.add(n.clone());
        }
      return this;
    }
  }
  (Fn.DefaultUp = new ze(0, 1, 0)),
    (Fn.DefaultMatrixAutoUpdate = !0),
    (Fn.prototype.isObject3D = !0);
  const Un = new ze(),
    Bn = new ze(),
    Hn = new ze(),
    Gn = new ze(),
    Vn = new ze(),
    Wn = new ze(),
    jn = new ze(),
    Zn = new ze(),
    Yn = new ze(),
    Xn = new ze();
  class qn {
    constructor(t = new ze(), e = new ze(), n = new ze()) {
      (this.a = t), (this.b = e), (this.c = n);
    }
    static getNormal(t, e, n, i) {
      i.subVectors(n, e), Un.subVectors(t, e), i.cross(Un);
      const r = i.lengthSq();
      return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0);
    }
    static getBarycoord(t, e, n, i, r) {
      Un.subVectors(i, e), Bn.subVectors(n, e), Hn.subVectors(t, e);
      const s = Un.dot(Un),
        o = Un.dot(Bn),
        a = Un.dot(Hn),
        l = Bn.dot(Bn),
        c = Bn.dot(Hn),
        h = s * l - o * o;
      if (0 === h) return r.set(-2, -1, -1);
      const u = 1 / h,
        d = (l * a - o * c) * u,
        p = (s * c - o * a) * u;
      return r.set(1 - d - p, p, d);
    }
    static containsPoint(t, e, n, i) {
      return (
        this.getBarycoord(t, e, n, i, Gn),
        Gn.x >= 0 && Gn.y >= 0 && Gn.x + Gn.y <= 1
      );
    }
    static getUV(t, e, n, i, r, s, o, a) {
      return (
        this.getBarycoord(t, e, n, i, Gn),
        a.set(0, 0),
        a.addScaledVector(r, Gn.x),
        a.addScaledVector(s, Gn.y),
        a.addScaledVector(o, Gn.z),
        a
      );
    }
    static isFrontFacing(t, e, n, i) {
      return Un.subVectors(n, e), Bn.subVectors(t, e), Un.cross(Bn).dot(i) < 0;
    }
    set(t, e, n) {
      return this.a.copy(t), this.b.copy(e), this.c.copy(n), this;
    }
    setFromPointsAndIndices(t, e, n, i) {
      return this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[i]), this;
    }
    setFromAttributeAndIndices(t, e, n, i) {
      return (
        this.a.fromBufferAttribute(t, e),
        this.b.fromBufferAttribute(t, n),
        this.c.fromBufferAttribute(t, i),
        this
      );
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
    }
    getArea() {
      return (
        Un.subVectors(this.c, this.b),
        Bn.subVectors(this.a, this.b),
        0.5 * Un.cross(Bn).length()
      );
    }
    getMidpoint(t) {
      return t
        .addVectors(this.a, this.b)
        .add(this.c)
        .multiplyScalar(1 / 3);
    }
    getNormal(t) {
      return qn.getNormal(this.a, this.b, this.c, t);
    }
    getPlane(t) {
      return t.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(t, e) {
      return qn.getBarycoord(t, this.a, this.b, this.c, e);
    }
    getUV(t, e, n, i, r) {
      return qn.getUV(t, this.a, this.b, this.c, e, n, i, r);
    }
    containsPoint(t) {
      return qn.containsPoint(t, this.a, this.b, this.c);
    }
    isFrontFacing(t) {
      return qn.isFrontFacing(this.a, this.b, this.c, t);
    }
    intersectsBox(t) {
      return t.intersectsTriangle(this);
    }
    closestPointToPoint(t, e) {
      const n = this.a,
        i = this.b,
        r = this.c;
      let s, o;
      Vn.subVectors(i, n), Wn.subVectors(r, n), Zn.subVectors(t, n);
      const a = Vn.dot(Zn),
        l = Wn.dot(Zn);
      if (a <= 0 && l <= 0) return e.copy(n);
      Yn.subVectors(t, i);
      const c = Vn.dot(Yn),
        h = Wn.dot(Yn);
      if (c >= 0 && h <= c) return e.copy(i);
      const u = a * h - c * l;
      if (u <= 0 && a >= 0 && c <= 0)
        return (s = a / (a - c)), e.copy(n).addScaledVector(Vn, s);
      Xn.subVectors(t, r);
      const d = Vn.dot(Xn),
        p = Wn.dot(Xn);
      if (p >= 0 && d <= p) return e.copy(r);
      const m = d * l - a * p;
      if (m <= 0 && l >= 0 && p <= 0)
        return (o = l / (l - p)), e.copy(n).addScaledVector(Wn, o);
      const f = c * p - d * h;
      if (f <= 0 && h - c >= 0 && d - p >= 0)
        return (
          jn.subVectors(r, i),
          (o = (h - c) / (h - c + (d - p))),
          e.copy(i).addScaledVector(jn, o)
        );
      const g = 1 / (f + m + u);
      return (
        (s = m * g),
        (o = u * g),
        e.copy(n).addScaledVector(Vn, s).addScaledVector(Wn, o)
      );
    }
    equals(t) {
      return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
    }
  }
  let Jn = 0;
  class Qn extends pe {
    constructor() {
      super(),
        Object.defineProperty(this, "id", { value: Jn++ }),
        (this.uuid = ve()),
        (this.name = ""),
        (this.type = "Material"),
        (this.fog = !0),
        (this.blending = 1),
        (this.side = 0),
        (this.vertexColors = !1),
        (this.opacity = 1),
        (this.format = Qt),
        (this.transparent = !1),
        (this.blendSrc = 204),
        (this.blendDst = 205),
        (this.blendEquation = xt),
        (this.blendSrcAlpha = null),
        (this.blendDstAlpha = null),
        (this.blendEquationAlpha = null),
        (this.depthFunc = 3),
        (this.depthTest = !0),
        (this.depthWrite = !0),
        (this.stencilWriteMask = 255),
        (this.stencilFunc = 519),
        (this.stencilRef = 0),
        (this.stencilFuncMask = 255),
        (this.stencilFail = ce),
        (this.stencilZFail = ce),
        (this.stencilZPass = ce),
        (this.stencilWrite = !1),
        (this.clippingPlanes = null),
        (this.clipIntersection = !1),
        (this.clipShadows = !1),
        (this.shadowSide = null),
        (this.colorWrite = !0),
        (this.precision = null),
        (this.polygonOffset = !1),
        (this.polygonOffsetFactor = 0),
        (this.polygonOffsetUnits = 0),
        (this.dithering = !1),
        (this.alphaToCoverage = !1),
        (this.premultipliedAlpha = !1),
        (this.visible = !0),
        (this.toneMapped = !0),
        (this.userData = {}),
        (this.version = 0),
        (this._alphaTest = 0);
    }
    get alphaTest() {
      return this._alphaTest;
    }
    set alphaTest(t) {
      this._alphaTest > 0 != t > 0 && this.version++, (this._alphaTest = t);
    }
    onBuild() {}
    onBeforeRender() {}
    onBeforeCompile() {}
    customProgramCacheKey() {
      return this.onBeforeCompile.toString();
    }
    setValues(t) {
      if (void 0 !== t)
        for (const e in t) {
          const n = t[e];
          if (void 0 === n) {
            console.warn("THREE.Material: '" + e + "' parameter is undefined.");
            continue;
          }
          if ("shading" === e) {
            console.warn(
              "THREE." +
                this.type +
                ": .shading has been removed. Use the boolean .flatShading instead."
            ),
              (this.flatShading = 1 === n);
            continue;
          }
          const i = this[e];
          void 0 !== i
            ? i && i.isColor
              ? i.set(n)
              : i && i.isVector3 && n && n.isVector3
              ? i.copy(n)
              : (this[e] = n)
            : console.warn(
                "THREE." +
                  this.type +
                  ": '" +
                  e +
                  "' is not a property of this material."
              );
        }
    }
    toJSON(t) {
      const e = void 0 === t || "string" == typeof t;
      e && (t = { textures: {}, images: {} });
      const n = {
        metadata: {
          version: 4.5,
          type: "Material",
          generator: "Material.toJSON",
        },
      };
      function i(t) {
        const e = [];
        for (const n in t) {
          const i = t[n];
          delete i.metadata, e.push(i);
        }
        return e;
      }
      if (
        ((n.uuid = this.uuid),
        (n.type = this.type),
        "" !== this.name && (n.name = this.name),
        this.color && this.color.isColor && (n.color = this.color.getHex()),
        void 0 !== this.roughness && (n.roughness = this.roughness),
        void 0 !== this.metalness && (n.metalness = this.metalness),
        void 0 !== this.sheen && (n.sheen = this.sheen),
        this.sheenColor &&
          this.sheenColor.isColor &&
          (n.sheenColor = this.sheenColor.getHex()),
        void 0 !== this.sheenRoughness &&
          (n.sheenRoughness = this.sheenRoughness),
        this.emissive &&
          this.emissive.isColor &&
          (n.emissive = this.emissive.getHex()),
        this.emissiveIntensity &&
          1 !== this.emissiveIntensity &&
          (n.emissiveIntensity = this.emissiveIntensity),
        this.specular &&
          this.specular.isColor &&
          (n.specular = this.specular.getHex()),
        void 0 !== this.specularIntensity &&
          (n.specularIntensity = this.specularIntensity),
        this.specularColor &&
          this.specularColor.isColor &&
          (n.specularColor = this.specularColor.getHex()),
        void 0 !== this.shininess && (n.shininess = this.shininess),
        void 0 !== this.clearcoat && (n.clearcoat = this.clearcoat),
        void 0 !== this.clearcoatRoughness &&
          (n.clearcoatRoughness = this.clearcoatRoughness),
        this.clearcoatMap &&
          this.clearcoatMap.isTexture &&
          (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid),
        this.clearcoatRoughnessMap &&
          this.clearcoatRoughnessMap.isTexture &&
          (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid),
        this.clearcoatNormalMap &&
          this.clearcoatNormalMap.isTexture &&
          ((n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid),
          (n.clearcoatNormalScale = this.clearcoatNormalScale.toArray())),
        this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid),
        this.matcap &&
          this.matcap.isTexture &&
          (n.matcap = this.matcap.toJSON(t).uuid),
        this.alphaMap &&
          this.alphaMap.isTexture &&
          (n.alphaMap = this.alphaMap.toJSON(t).uuid),
        this.lightMap &&
          this.lightMap.isTexture &&
          ((n.lightMap = this.lightMap.toJSON(t).uuid),
          (n.lightMapIntensity = this.lightMapIntensity)),
        this.aoMap &&
          this.aoMap.isTexture &&
          ((n.aoMap = this.aoMap.toJSON(t).uuid),
          (n.aoMapIntensity = this.aoMapIntensity)),
        this.bumpMap &&
          this.bumpMap.isTexture &&
          ((n.bumpMap = this.bumpMap.toJSON(t).uuid),
          (n.bumpScale = this.bumpScale)),
        this.normalMap &&
          this.normalMap.isTexture &&
          ((n.normalMap = this.normalMap.toJSON(t).uuid),
          (n.normalMapType = this.normalMapType),
          (n.normalScale = this.normalScale.toArray())),
        this.displacementMap &&
          this.displacementMap.isTexture &&
          ((n.displacementMap = this.displacementMap.toJSON(t).uuid),
          (n.displacementScale = this.displacementScale),
          (n.displacementBias = this.displacementBias)),
        this.roughnessMap &&
          this.roughnessMap.isTexture &&
          (n.roughnessMap = this.roughnessMap.toJSON(t).uuid),
        this.metalnessMap &&
          this.metalnessMap.isTexture &&
          (n.metalnessMap = this.metalnessMap.toJSON(t).uuid),
        this.emissiveMap &&
          this.emissiveMap.isTexture &&
          (n.emissiveMap = this.emissiveMap.toJSON(t).uuid),
        this.specularMap &&
          this.specularMap.isTexture &&
          (n.specularMap = this.specularMap.toJSON(t).uuid),
        this.specularIntensityMap &&
          this.specularIntensityMap.isTexture &&
          (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid),
        this.specularColorMap &&
          this.specularColorMap.isTexture &&
          (n.specularColorMap = this.specularColorMap.toJSON(t).uuid),
        this.envMap &&
          this.envMap.isTexture &&
          ((n.envMap = this.envMap.toJSON(t).uuid),
          void 0 !== this.combine && (n.combine = this.combine)),
        void 0 !== this.envMapIntensity &&
          (n.envMapIntensity = this.envMapIntensity),
        void 0 !== this.reflectivity && (n.reflectivity = this.reflectivity),
        void 0 !== this.refractionRatio &&
          (n.refractionRatio = this.refractionRatio),
        this.gradientMap &&
          this.gradientMap.isTexture &&
          (n.gradientMap = this.gradientMap.toJSON(t).uuid),
        void 0 !== this.transmission && (n.transmission = this.transmission),
        this.transmissionMap &&
          this.transmissionMap.isTexture &&
          (n.transmissionMap = this.transmissionMap.toJSON(t).uuid),
        void 0 !== this.thickness && (n.thickness = this.thickness),
        this.thicknessMap &&
          this.thicknessMap.isTexture &&
          (n.thicknessMap = this.thicknessMap.toJSON(t).uuid),
        void 0 !== this.attenuationDistance &&
          (n.attenuationDistance = this.attenuationDistance),
        void 0 !== this.attenuationColor &&
          (n.attenuationColor = this.attenuationColor.getHex()),
        void 0 !== this.size && (n.size = this.size),
        null !== this.shadowSide && (n.shadowSide = this.shadowSide),
        void 0 !== this.sizeAttenuation &&
          (n.sizeAttenuation = this.sizeAttenuation),
        1 !== this.blending && (n.blending = this.blending),
        0 !== this.side && (n.side = this.side),
        this.vertexColors && (n.vertexColors = !0),
        this.opacity < 1 && (n.opacity = this.opacity),
        this.format !== Qt && (n.format = this.format),
        !0 === this.transparent && (n.transparent = this.transparent),
        (n.depthFunc = this.depthFunc),
        (n.depthTest = this.depthTest),
        (n.depthWrite = this.depthWrite),
        (n.colorWrite = this.colorWrite),
        (n.stencilWrite = this.stencilWrite),
        (n.stencilWriteMask = this.stencilWriteMask),
        (n.stencilFunc = this.stencilFunc),
        (n.stencilRef = this.stencilRef),
        (n.stencilFuncMask = this.stencilFuncMask),
        (n.stencilFail = this.stencilFail),
        (n.stencilZFail = this.stencilZFail),
        (n.stencilZPass = this.stencilZPass),
        this.rotation && 0 !== this.rotation && (n.rotation = this.rotation),
        !0 === this.polygonOffset && (n.polygonOffset = !0),
        0 !== this.polygonOffsetFactor &&
          (n.polygonOffsetFactor = this.polygonOffsetFactor),
        0 !== this.polygonOffsetUnits &&
          (n.polygonOffsetUnits = this.polygonOffsetUnits),
        this.linewidth &&
          1 !== this.linewidth &&
          (n.linewidth = this.linewidth),
        void 0 !== this.dashSize && (n.dashSize = this.dashSize),
        void 0 !== this.gapSize && (n.gapSize = this.gapSize),
        void 0 !== this.scale && (n.scale = this.scale),
        !0 === this.dithering && (n.dithering = !0),
        this.alphaTest > 0 && (n.alphaTest = this.alphaTest),
        !0 === this.alphaToCoverage &&
          (n.alphaToCoverage = this.alphaToCoverage),
        !0 === this.premultipliedAlpha &&
          (n.premultipliedAlpha = this.premultipliedAlpha),
        !0 === this.wireframe && (n.wireframe = this.wireframe),
        this.wireframeLinewidth > 1 &&
          (n.wireframeLinewidth = this.wireframeLinewidth),
        "round" !== this.wireframeLinecap &&
          (n.wireframeLinecap = this.wireframeLinecap),
        "round" !== this.wireframeLinejoin &&
          (n.wireframeLinejoin = this.wireframeLinejoin),
        !0 === this.flatShading && (n.flatShading = this.flatShading),
        !1 === this.visible && (n.visible = !1),
        !1 === this.toneMapped && (n.toneMapped = !1),
        "{}" !== JSON.stringify(this.userData) && (n.userData = this.userData),
        e)
      ) {
        const e = i(t.textures),
          r = i(t.images);
        e.length > 0 && (n.textures = e), r.length > 0 && (n.images = r);
      }
      return n;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      (this.name = t.name),
        (this.fog = t.fog),
        (this.blending = t.blending),
        (this.side = t.side),
        (this.vertexColors = t.vertexColors),
        (this.opacity = t.opacity),
        (this.format = t.format),
        (this.transparent = t.transparent),
        (this.blendSrc = t.blendSrc),
        (this.blendDst = t.blendDst),
        (this.blendEquation = t.blendEquation),
        (this.blendSrcAlpha = t.blendSrcAlpha),
        (this.blendDstAlpha = t.blendDstAlpha),
        (this.blendEquationAlpha = t.blendEquationAlpha),
        (this.depthFunc = t.depthFunc),
        (this.depthTest = t.depthTest),
        (this.depthWrite = t.depthWrite),
        (this.stencilWriteMask = t.stencilWriteMask),
        (this.stencilFunc = t.stencilFunc),
        (this.stencilRef = t.stencilRef),
        (this.stencilFuncMask = t.stencilFuncMask),
        (this.stencilFail = t.stencilFail),
        (this.stencilZFail = t.stencilZFail),
        (this.stencilZPass = t.stencilZPass),
        (this.stencilWrite = t.stencilWrite);
      const e = t.clippingPlanes;
      let n = null;
      if (null !== e) {
        const t = e.length;
        n = new Array(t);
        for (let i = 0; i !== t; ++i) n[i] = e[i].clone();
      }
      return (
        (this.clippingPlanes = n),
        (this.clipIntersection = t.clipIntersection),
        (this.clipShadows = t.clipShadows),
        (this.shadowSide = t.shadowSide),
        (this.colorWrite = t.colorWrite),
        (this.precision = t.precision),
        (this.polygonOffset = t.polygonOffset),
        (this.polygonOffsetFactor = t.polygonOffsetFactor),
        (this.polygonOffsetUnits = t.polygonOffsetUnits),
        (this.dithering = t.dithering),
        (this.alphaTest = t.alphaTest),
        (this.alphaToCoverage = t.alphaToCoverage),
        (this.premultipliedAlpha = t.premultipliedAlpha),
        (this.visible = t.visible),
        (this.toneMapped = t.toneMapped),
        (this.userData = JSON.parse(JSON.stringify(t.userData))),
        this
      );
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
    set needsUpdate(t) {
      !0 === t && this.version++;
    }
  }
  Qn.prototype.isMaterial = !0;
  const Kn = {
      aliceblue: 15792383,
      antiquewhite: 16444375,
      aqua: 65535,
      aquamarine: 8388564,
      azure: 15794175,
      beige: 16119260,
      bisque: 16770244,
      black: 0,
      blanchedalmond: 16772045,
      blue: 255,
      blueviolet: 9055202,
      brown: 10824234,
      burlywood: 14596231,
      cadetblue: 6266528,
      chartreuse: 8388352,
      chocolate: 13789470,
      coral: 16744272,
      cornflowerblue: 6591981,
      cornsilk: 16775388,
      crimson: 14423100,
      cyan: 65535,
      darkblue: 139,
      darkcyan: 35723,
      darkgoldenrod: 12092939,
      darkgray: 11119017,
      darkgreen: 25600,
      darkgrey: 11119017,
      darkkhaki: 12433259,
      darkmagenta: 9109643,
      darkolivegreen: 5597999,
      darkorange: 16747520,
      darkorchid: 10040012,
      darkred: 9109504,
      darksalmon: 15308410,
      darkseagreen: 9419919,
      darkslateblue: 4734347,
      darkslategray: 3100495,
      darkslategrey: 3100495,
      darkturquoise: 52945,
      darkviolet: 9699539,
      deeppink: 16716947,
      deepskyblue: 49151,
      dimgray: 6908265,
      dimgrey: 6908265,
      dodgerblue: 2003199,
      firebrick: 11674146,
      floralwhite: 16775920,
      forestgreen: 2263842,
      fuchsia: 16711935,
      gainsboro: 14474460,
      ghostwhite: 16316671,
      gold: 16766720,
      goldenrod: 14329120,
      gray: 8421504,
      green: 32768,
      greenyellow: 11403055,
      grey: 8421504,
      honeydew: 15794160,
      hotpink: 16738740,
      indianred: 13458524,
      indigo: 4915330,
      ivory: 16777200,
      khaki: 15787660,
      lavender: 15132410,
      lavenderblush: 16773365,
      lawngreen: 8190976,
      lemonchiffon: 16775885,
      lightblue: 11393254,
      lightcoral: 15761536,
      lightcyan: 14745599,
      lightgoldenrodyellow: 16448210,
      lightgray: 13882323,
      lightgreen: 9498256,
      lightgrey: 13882323,
      lightpink: 16758465,
      lightsalmon: 16752762,
      lightseagreen: 2142890,
      lightskyblue: 8900346,
      lightslategray: 7833753,
      lightslategrey: 7833753,
      lightsteelblue: 11584734,
      lightyellow: 16777184,
      lime: 65280,
      limegreen: 3329330,
      linen: 16445670,
      magenta: 16711935,
      maroon: 8388608,
      mediumaquamarine: 6737322,
      mediumblue: 205,
      mediumorchid: 12211667,
      mediumpurple: 9662683,
      mediumseagreen: 3978097,
      mediumslateblue: 8087790,
      mediumspringgreen: 64154,
      mediumturquoise: 4772300,
      mediumvioletred: 13047173,
      midnightblue: 1644912,
      mintcream: 16121850,
      mistyrose: 16770273,
      moccasin: 16770229,
      navajowhite: 16768685,
      navy: 128,
      oldlace: 16643558,
      olive: 8421376,
      olivedrab: 7048739,
      orange: 16753920,
      orangered: 16729344,
      orchid: 14315734,
      palegoldenrod: 15657130,
      palegreen: 10025880,
      paleturquoise: 11529966,
      palevioletred: 14381203,
      papayawhip: 16773077,
      peachpuff: 16767673,
      peru: 13468991,
      pink: 16761035,
      plum: 14524637,
      powderblue: 11591910,
      purple: 8388736,
      rebeccapurple: 6697881,
      red: 16711680,
      rosybrown: 12357519,
      royalblue: 4286945,
      saddlebrown: 9127187,
      salmon: 16416882,
      sandybrown: 16032864,
      seagreen: 3050327,
      seashell: 16774638,
      sienna: 10506797,
      silver: 12632256,
      skyblue: 8900331,
      slateblue: 6970061,
      slategray: 7372944,
      slategrey: 7372944,
      snow: 16775930,
      springgreen: 65407,
      steelblue: 4620980,
      tan: 13808780,
      teal: 32896,
      thistle: 14204888,
      tomato: 16737095,
      turquoise: 4251856,
      violet: 15631086,
      wheat: 16113331,
      white: 16777215,
      whitesmoke: 16119285,
      yellow: 16776960,
      yellowgreen: 10145074,
    },
    $n = { h: 0, s: 0, l: 0 },
    ti = { h: 0, s: 0, l: 0 };
  function ei(t, e, n) {
    return (
      n < 0 && (n += 1),
      n > 1 && (n -= 1),
      n < 1 / 6
        ? t + 6 * (e - t) * n
        : n < 0.5
        ? e
        : n < 2 / 3
        ? t + 6 * (e - t) * (2 / 3 - n)
        : t
    );
  }
  function ni(t) {
    return t < 0.04045
      ? 0.0773993808 * t
      : Math.pow(0.9478672986 * t + 0.0521327014, 2.4);
  }
  function ii(t) {
    return t < 0.0031308 ? 12.92 * t : 1.055 * Math.pow(t, 0.41666) - 0.055;
  }
  class ri {
    constructor(t, e, n) {
      return void 0 === e && void 0 === n ? this.set(t) : this.setRGB(t, e, n);
    }
    set(t) {
      return (
        t && t.isColor
          ? this.copy(t)
          : "number" == typeof t
          ? this.setHex(t)
          : "string" == typeof t && this.setStyle(t),
        this
      );
    }
    setScalar(t) {
      return (this.r = t), (this.g = t), (this.b = t), this;
    }
    setHex(t) {
      return (
        (t = Math.floor(t)),
        (this.r = ((t >> 16) & 255) / 255),
        (this.g = ((t >> 8) & 255) / 255),
        (this.b = (255 & t) / 255),
        this
      );
    }
    setRGB(t, e, n) {
      return (this.r = t), (this.g = e), (this.b = n), this;
    }
    setHSL(t, e, n) {
      if (
        ((t = (function (t, e) {
          return ((t % e) + e) % e;
        })(t, 1)),
        (e = xe(e, 0, 1)),
        (n = xe(n, 0, 1)),
        0 === e)
      )
        this.r = this.g = this.b = n;
      else {
        const i = n <= 0.5 ? n * (1 + e) : n + e - n * e,
          r = 2 * n - i;
        (this.r = ei(r, i, t + 1 / 3)),
          (this.g = ei(r, i, t)),
          (this.b = ei(r, i, t - 1 / 3));
      }
      return this;
    }
    setStyle(t) {
      function e(e) {
        void 0 !== e &&
          parseFloat(e) < 1 &&
          console.warn(
            "THREE.Color: Alpha component of " + t + " will be ignored."
          );
      }
      let n;
      if ((n = /^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(t))) {
        let t;
        const i = n[1],
          r = n[2];
        switch (i) {
          case "rgb":
          case "rgba":
            if (
              (t =
                /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                  r
                ))
            )
              return (
                (this.r = Math.min(255, parseInt(t[1], 10)) / 255),
                (this.g = Math.min(255, parseInt(t[2], 10)) / 255),
                (this.b = Math.min(255, parseInt(t[3], 10)) / 255),
                e(t[4]),
                this
              );
            if (
              (t =
                /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                  r
                ))
            )
              return (
                (this.r = Math.min(100, parseInt(t[1], 10)) / 100),
                (this.g = Math.min(100, parseInt(t[2], 10)) / 100),
                (this.b = Math.min(100, parseInt(t[3], 10)) / 100),
                e(t[4]),
                this
              );
            break;
          case "hsl":
          case "hsla":
            if (
              (t =
                /^\s*(\d*\.?\d+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                  r
                ))
            ) {
              const n = parseFloat(t[1]) / 360,
                i = parseInt(t[2], 10) / 100,
                r = parseInt(t[3], 10) / 100;
              return e(t[4]), this.setHSL(n, i, r);
            }
        }
      } else if ((n = /^\#([A-Fa-f\d]+)$/.exec(t))) {
        const t = n[1],
          e = t.length;
        if (3 === e)
          return (
            (this.r = parseInt(t.charAt(0) + t.charAt(0), 16) / 255),
            (this.g = parseInt(t.charAt(1) + t.charAt(1), 16) / 255),
            (this.b = parseInt(t.charAt(2) + t.charAt(2), 16) / 255),
            this
          );
        if (6 === e)
          return (
            (this.r = parseInt(t.charAt(0) + t.charAt(1), 16) / 255),
            (this.g = parseInt(t.charAt(2) + t.charAt(3), 16) / 255),
            (this.b = parseInt(t.charAt(4) + t.charAt(5), 16) / 255),
            this
          );
      }
      return t && t.length > 0 ? this.setColorName(t) : this;
    }
    setColorName(t) {
      const e = Kn[t.toLowerCase()];
      return (
        void 0 !== e
          ? this.setHex(e)
          : console.warn("THREE.Color: Unknown color " + t),
        this
      );
    }
    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }
    copy(t) {
      return (this.r = t.r), (this.g = t.g), (this.b = t.b), this;
    }
    copySRGBToLinear(t) {
      return (this.r = ni(t.r)), (this.g = ni(t.g)), (this.b = ni(t.b)), this;
    }
    copyLinearToSRGB(t) {
      return (this.r = ii(t.r)), (this.g = ii(t.g)), (this.b = ii(t.b)), this;
    }
    convertSRGBToLinear() {
      return this.copySRGBToLinear(this), this;
    }
    convertLinearToSRGB() {
      return this.copyLinearToSRGB(this), this;
    }
    getHex() {
      return ((255 * this.r) << 16) ^ ((255 * this.g) << 8) ^ (255 * this.b);
    }
    getHexString() {
      return ("000000" + this.getHex().toString(16)).slice(-6);
    }
    getHSL(t) {
      const e = this.r,
        n = this.g,
        i = this.b,
        r = Math.max(e, n, i),
        s = Math.min(e, n, i);
      let o, a;
      const l = (s + r) / 2;
      if (s === r) (o = 0), (a = 0);
      else {
        const t = r - s;
        switch (((a = l <= 0.5 ? t / (r + s) : t / (2 - r - s)), r)) {
          case e:
            o = (n - i) / t + (n < i ? 6 : 0);
            break;
          case n:
            o = (i - e) / t + 2;
            break;
          case i:
            o = (e - n) / t + 4;
        }
        o /= 6;
      }
      return (t.h = o), (t.s = a), (t.l = l), t;
    }
    getStyle() {
      return (
        "rgb(" +
        ((255 * this.r) | 0) +
        "," +
        ((255 * this.g) | 0) +
        "," +
        ((255 * this.b) | 0) +
        ")"
      );
    }
    offsetHSL(t, e, n) {
      return (
        this.getHSL($n),
        ($n.h += t),
        ($n.s += e),
        ($n.l += n),
        this.setHSL($n.h, $n.s, $n.l),
        this
      );
    }
    add(t) {
      return (this.r += t.r), (this.g += t.g), (this.b += t.b), this;
    }
    addColors(t, e) {
      return (
        (this.r = t.r + e.r), (this.g = t.g + e.g), (this.b = t.b + e.b), this
      );
    }
    addScalar(t) {
      return (this.r += t), (this.g += t), (this.b += t), this;
    }
    sub(t) {
      return (
        (this.r = Math.max(0, this.r - t.r)),
        (this.g = Math.max(0, this.g - t.g)),
        (this.b = Math.max(0, this.b - t.b)),
        this
      );
    }
    multiply(t) {
      return (this.r *= t.r), (this.g *= t.g), (this.b *= t.b), this;
    }
    multiplyScalar(t) {
      return (this.r *= t), (this.g *= t), (this.b *= t), this;
    }
    lerp(t, e) {
      return (
        (this.r += (t.r - this.r) * e),
        (this.g += (t.g - this.g) * e),
        (this.b += (t.b - this.b) * e),
        this
      );
    }
    lerpColors(t, e, n) {
      return (
        (this.r = t.r + (e.r - t.r) * n),
        (this.g = t.g + (e.g - t.g) * n),
        (this.b = t.b + (e.b - t.b) * n),
        this
      );
    }
    lerpHSL(t, e) {
      this.getHSL($n), t.getHSL(ti);
      const n = _e($n.h, ti.h, e),
        i = _e($n.s, ti.s, e),
        r = _e($n.l, ti.l, e);
      return this.setHSL(n, i, r), this;
    }
    equals(t) {
      return t.r === this.r && t.g === this.g && t.b === this.b;
    }
    fromArray(t, e = 0) {
      return (this.r = t[e]), (this.g = t[e + 1]), (this.b = t[e + 2]), this;
    }
    toArray(t = [], e = 0) {
      return (t[e] = this.r), (t[e + 1] = this.g), (t[e + 2] = this.b), t;
    }
    fromBufferAttribute(t, e) {
      return (
        (this.r = t.getX(e)),
        (this.g = t.getY(e)),
        (this.b = t.getZ(e)),
        !0 === t.normalized &&
          ((this.r /= 255), (this.g /= 255), (this.b /= 255)),
        this
      );
    }
    toJSON() {
      return this.getHex();
    }
  }
  (ri.NAMES = Kn),
    (ri.prototype.isColor = !0),
    (ri.prototype.r = 1),
    (ri.prototype.g = 1),
    (ri.prototype.b = 1);
  class si extends Qn {
    constructor(t) {
      super(),
        (this.type = "MeshBasicMaterial"),
        (this.color = new ri(16777215)),
        (this.map = null),
        (this.lightMap = null),
        (this.lightMapIntensity = 1),
        (this.aoMap = null),
        (this.aoMapIntensity = 1),
        (this.specularMap = null),
        (this.alphaMap = null),
        (this.envMap = null),
        (this.combine = 0),
        (this.reflectivity = 1),
        (this.refractionRatio = 0.98),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.wireframeLinecap = "round"),
        (this.wireframeLinejoin = "round"),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        this.color.copy(t.color),
        (this.map = t.map),
        (this.lightMap = t.lightMap),
        (this.lightMapIntensity = t.lightMapIntensity),
        (this.aoMap = t.aoMap),
        (this.aoMapIntensity = t.aoMapIntensity),
        (this.specularMap = t.specularMap),
        (this.alphaMap = t.alphaMap),
        (this.envMap = t.envMap),
        (this.combine = t.combine),
        (this.reflectivity = t.reflectivity),
        (this.refractionRatio = t.refractionRatio),
        (this.wireframe = t.wireframe),
        (this.wireframeLinewidth = t.wireframeLinewidth),
        (this.wireframeLinecap = t.wireframeLinecap),
        (this.wireframeLinejoin = t.wireframeLinejoin),
        this
      );
    }
  }
  si.prototype.isMeshBasicMaterial = !0;
  const oi = new ze(),
    ai = new we();
  class li {
    constructor(t, e, n) {
      if (Array.isArray(t))
        throw new TypeError(
          "THREE.BufferAttribute: array should be a Typed Array."
        );
      (this.name = ""),
        (this.array = t),
        (this.itemSize = e),
        (this.count = void 0 !== t ? t.length / e : 0),
        (this.normalized = !0 === n),
        (this.usage = he),
        (this.updateRange = { offset: 0, count: -1 }),
        (this.version = 0);
    }
    onUploadCallback() {}
    set needsUpdate(t) {
      !0 === t && this.version++;
    }
    setUsage(t) {
      return (this.usage = t), this;
    }
    copy(t) {
      return (
        (this.name = t.name),
        (this.array = new t.array.constructor(t.array)),
        (this.itemSize = t.itemSize),
        (this.count = t.count),
        (this.normalized = t.normalized),
        (this.usage = t.usage),
        this
      );
    }
    copyAt(t, e, n) {
      (t *= this.itemSize), (n *= e.itemSize);
      for (let i = 0, r = this.itemSize; i < r; i++)
        this.array[t + i] = e.array[n + i];
      return this;
    }
    copyArray(t) {
      return this.array.set(t), this;
    }
    copyColorsArray(t) {
      const e = this.array;
      let n = 0;
      for (let i = 0, r = t.length; i < r; i++) {
        let r = t[i];
        void 0 === r &&
          (console.warn(
            "THREE.BufferAttribute.copyColorsArray(): color is undefined",
            i
          ),
          (r = new ri())),
          (e[n++] = r.r),
          (e[n++] = r.g),
          (e[n++] = r.b);
      }
      return this;
    }
    copyVector2sArray(t) {
      const e = this.array;
      let n = 0;
      for (let i = 0, r = t.length; i < r; i++) {
        let r = t[i];
        void 0 === r &&
          (console.warn(
            "THREE.BufferAttribute.copyVector2sArray(): vector is undefined",
            i
          ),
          (r = new we())),
          (e[n++] = r.x),
          (e[n++] = r.y);
      }
      return this;
    }
    copyVector3sArray(t) {
      const e = this.array;
      let n = 0;
      for (let i = 0, r = t.length; i < r; i++) {
        let r = t[i];
        void 0 === r &&
          (console.warn(
            "THREE.BufferAttribute.copyVector3sArray(): vector is undefined",
            i
          ),
          (r = new ze())),
          (e[n++] = r.x),
          (e[n++] = r.y),
          (e[n++] = r.z);
      }
      return this;
    }
    copyVector4sArray(t) {
      const e = this.array;
      let n = 0;
      for (let i = 0, r = t.length; i < r; i++) {
        let r = t[i];
        void 0 === r &&
          (console.warn(
            "THREE.BufferAttribute.copyVector4sArray(): vector is undefined",
            i
          ),
          (r = new Pe())),
          (e[n++] = r.x),
          (e[n++] = r.y),
          (e[n++] = r.z),
          (e[n++] = r.w);
      }
      return this;
    }
    applyMatrix3(t) {
      if (2 === this.itemSize)
        for (let e = 0, n = this.count; e < n; e++)
          ai.fromBufferAttribute(this, e),
            ai.applyMatrix3(t),
            this.setXY(e, ai.x, ai.y);
      else if (3 === this.itemSize)
        for (let e = 0, n = this.count; e < n; e++)
          oi.fromBufferAttribute(this, e),
            oi.applyMatrix3(t),
            this.setXYZ(e, oi.x, oi.y, oi.z);
      return this;
    }
    applyMatrix4(t) {
      for (let e = 0, n = this.count; e < n; e++)
        (oi.x = this.getX(e)),
          (oi.y = this.getY(e)),
          (oi.z = this.getZ(e)),
          oi.applyMatrix4(t),
          this.setXYZ(e, oi.x, oi.y, oi.z);
      return this;
    }
    applyNormalMatrix(t) {
      for (let e = 0, n = this.count; e < n; e++)
        (oi.x = this.getX(e)),
          (oi.y = this.getY(e)),
          (oi.z = this.getZ(e)),
          oi.applyNormalMatrix(t),
          this.setXYZ(e, oi.x, oi.y, oi.z);
      return this;
    }
    transformDirection(t) {
      for (let e = 0, n = this.count; e < n; e++)
        (oi.x = this.getX(e)),
          (oi.y = this.getY(e)),
          (oi.z = this.getZ(e)),
          oi.transformDirection(t),
          this.setXYZ(e, oi.x, oi.y, oi.z);
      return this;
    }
    set(t, e = 0) {
      return this.array.set(t, e), this;
    }
    getX(t) {
      return this.array[t * this.itemSize];
    }
    setX(t, e) {
      return (this.array[t * this.itemSize] = e), this;
    }
    getY(t) {
      return this.array[t * this.itemSize + 1];
    }
    setY(t, e) {
      return (this.array[t * this.itemSize + 1] = e), this;
    }
    getZ(t) {
      return this.array[t * this.itemSize + 2];
    }
    setZ(t, e) {
      return (this.array[t * this.itemSize + 2] = e), this;
    }
    getW(t) {
      return this.array[t * this.itemSize + 3];
    }
    setW(t, e) {
      return (this.array[t * this.itemSize + 3] = e), this;
    }
    setXY(t, e, n) {
      return (
        (t *= this.itemSize),
        (this.array[t + 0] = e),
        (this.array[t + 1] = n),
        this
      );
    }
    setXYZ(t, e, n, i) {
      return (
        (t *= this.itemSize),
        (this.array[t + 0] = e),
        (this.array[t + 1] = n),
        (this.array[t + 2] = i),
        this
      );
    }
    setXYZW(t, e, n, i, r) {
      return (
        (t *= this.itemSize),
        (this.array[t + 0] = e),
        (this.array[t + 1] = n),
        (this.array[t + 2] = i),
        (this.array[t + 3] = r),
        this
      );
    }
    onUpload(t) {
      return (this.onUploadCallback = t), this;
    }
    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }
    toJSON() {
      const t = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.prototype.slice.call(this.array),
        normalized: this.normalized,
      };
      return (
        "" !== this.name && (t.name = this.name),
        this.usage !== he && (t.usage = this.usage),
        (0 === this.updateRange.offset && -1 === this.updateRange.count) ||
          (t.updateRange = this.updateRange),
        t
      );
    }
  }
  li.prototype.isBufferAttribute = !0;
  class ci extends li {
    constructor(t, e, n) {
      super(new Uint16Array(t), e, n);
    }
  }
  class hi extends li {
    constructor(t, e, n) {
      super(new Uint32Array(t), e, n);
    }
  }
  (class extends li {
    constructor(t, e, n) {
      super(new Uint16Array(t), e, n);
    }
  }).prototype.isFloat16BufferAttribute = !0;
  class ui extends li {
    constructor(t, e, n) {
      super(new Float32Array(t), e, n);
    }
  }
  let di = 0;
  const pi = new pn(),
    mi = new Fn(),
    fi = new ze(),
    gi = new Fe(),
    vi = new Fe(),
    xi = new ze();
  class _i extends pe {
    constructor() {
      super(),
        Object.defineProperty(this, "id", { value: di++ }),
        (this.uuid = ve()),
        (this.name = ""),
        (this.type = "BufferGeometry"),
        (this.index = null),
        (this.attributes = {}),
        (this.morphAttributes = {}),
        (this.morphTargetsRelative = !1),
        (this.groups = []),
        (this.boundingBox = null),
        (this.boundingSphere = null),
        (this.drawRange = { start: 0, count: 1 / 0 }),
        (this.userData = {});
    }
    getIndex() {
      return this.index;
    }
    setIndex(t) {
      return (
        Array.isArray(t)
          ? (this.index = new (Se(t) > 65535 ? hi : ci)(t, 1))
          : (this.index = t),
        this
      );
    }
    getAttribute(t) {
      return this.attributes[t];
    }
    setAttribute(t, e) {
      return (this.attributes[t] = e), this;
    }
    deleteAttribute(t) {
      return delete this.attributes[t], this;
    }
    hasAttribute(t) {
      return void 0 !== this.attributes[t];
    }
    addGroup(t, e, n = 0) {
      this.groups.push({ start: t, count: e, materialIndex: n });
    }
    clearGroups() {
      this.groups = [];
    }
    setDrawRange(t, e) {
      (this.drawRange.start = t), (this.drawRange.count = e);
    }
    applyMatrix4(t) {
      const e = this.attributes.position;
      void 0 !== e && (e.applyMatrix4(t), (e.needsUpdate = !0));
      const n = this.attributes.normal;
      if (void 0 !== n) {
        const e = new Me().getNormalMatrix(t);
        n.applyNormalMatrix(e), (n.needsUpdate = !0);
      }
      const i = this.attributes.tangent;
      return (
        void 0 !== i && (i.transformDirection(t), (i.needsUpdate = !0)),
        null !== this.boundingBox && this.computeBoundingBox(),
        null !== this.boundingSphere && this.computeBoundingSphere(),
        this
      );
    }
    applyQuaternion(t) {
      return pi.makeRotationFromQuaternion(t), this.applyMatrix4(pi), this;
    }
    rotateX(t) {
      return pi.makeRotationX(t), this.applyMatrix4(pi), this;
    }
    rotateY(t) {
      return pi.makeRotationY(t), this.applyMatrix4(pi), this;
    }
    rotateZ(t) {
      return pi.makeRotationZ(t), this.applyMatrix4(pi), this;
    }
    translate(t, e, n) {
      return pi.makeTranslation(t, e, n), this.applyMatrix4(pi), this;
    }
    scale(t, e, n) {
      return pi.makeScale(t, e, n), this.applyMatrix4(pi), this;
    }
    lookAt(t) {
      return (
        mi.lookAt(t), mi.updateMatrix(), this.applyMatrix4(mi.matrix), this
      );
    }
    center() {
      return (
        this.computeBoundingBox(),
        this.boundingBox.getCenter(fi).negate(),
        this.translate(fi.x, fi.y, fi.z),
        this
      );
    }
    setFromPoints(t) {
      const e = [];
      for (let n = 0, i = t.length; n < i; n++) {
        const i = t[n];
        e.push(i.x, i.y, i.z || 0);
      }
      return this.setAttribute("position", new ui(e, 3)), this;
    }
    computeBoundingBox() {
      null === this.boundingBox && (this.boundingBox = new Fe());
      const t = this.attributes.position,
        e = this.morphAttributes.position;
      if (t && t.isGLBufferAttribute)
        return (
          console.error(
            'THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',
            this
          ),
          void this.boundingBox.set(
            new ze(-1 / 0, -1 / 0, -1 / 0),
            new ze(1 / 0, 1 / 0, 1 / 0)
          )
        );
      if (void 0 !== t) {
        if ((this.boundingBox.setFromBufferAttribute(t), e))
          for (let t = 0, n = e.length; t < n; t++) {
            const n = e[t];
            gi.setFromBufferAttribute(n),
              this.morphTargetsRelative
                ? (xi.addVectors(this.boundingBox.min, gi.min),
                  this.boundingBox.expandByPoint(xi),
                  xi.addVectors(this.boundingBox.max, gi.max),
                  this.boundingBox.expandByPoint(xi))
                : (this.boundingBox.expandByPoint(gi.min),
                  this.boundingBox.expandByPoint(gi.max));
          }
      } else this.boundingBox.makeEmpty();
      (isNaN(this.boundingBox.min.x) ||
        isNaN(this.boundingBox.min.y) ||
        isNaN(this.boundingBox.min.z)) &&
        console.error(
          'THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',
          this
        );
    }
    computeBoundingSphere() {
      null === this.boundingSphere && (this.boundingSphere = new rn());
      const t = this.attributes.position,
        e = this.morphAttributes.position;
      if (t && t.isGLBufferAttribute)
        return (
          console.error(
            'THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',
            this
          ),
          void this.boundingSphere.set(new ze(), 1 / 0)
        );
      if (t) {
        const n = this.boundingSphere.center;
        if ((gi.setFromBufferAttribute(t), e))
          for (let t = 0, n = e.length; t < n; t++) {
            const n = e[t];
            vi.setFromBufferAttribute(n),
              this.morphTargetsRelative
                ? (xi.addVectors(gi.min, vi.min),
                  gi.expandByPoint(xi),
                  xi.addVectors(gi.max, vi.max),
                  gi.expandByPoint(xi))
                : (gi.expandByPoint(vi.min), gi.expandByPoint(vi.max));
          }
        gi.getCenter(n);
        let i = 0;
        for (let e = 0, r = t.count; e < r; e++)
          xi.fromBufferAttribute(t, e),
            (i = Math.max(i, n.distanceToSquared(xi)));
        if (e)
          for (let r = 0, s = e.length; r < s; r++) {
            const s = e[r],
              o = this.morphTargetsRelative;
            for (let e = 0, r = s.count; e < r; e++)
              xi.fromBufferAttribute(s, e),
                o && (fi.fromBufferAttribute(t, e), xi.add(fi)),
                (i = Math.max(i, n.distanceToSquared(xi)));
          }
        (this.boundingSphere.radius = Math.sqrt(i)),
          isNaN(this.boundingSphere.radius) &&
            console.error(
              'THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',
              this
            );
      }
    }
    computeTangents() {
      const t = this.index,
        e = this.attributes;
      if (
        null === t ||
        void 0 === e.position ||
        void 0 === e.normal ||
        void 0 === e.uv
      )
        return void console.error(
          "THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)"
        );
      const n = t.array,
        i = e.position.array,
        r = e.normal.array,
        s = e.uv.array,
        o = i.length / 3;
      void 0 === e.tangent &&
        this.setAttribute("tangent", new li(new Float32Array(4 * o), 4));
      const a = e.tangent.array,
        l = [],
        c = [];
      for (let t = 0; t < o; t++) (l[t] = new ze()), (c[t] = new ze());
      const h = new ze(),
        u = new ze(),
        d = new ze(),
        p = new we(),
        m = new we(),
        f = new we(),
        g = new ze(),
        v = new ze();
      function x(t, e, n) {
        h.fromArray(i, 3 * t),
          u.fromArray(i, 3 * e),
          d.fromArray(i, 3 * n),
          p.fromArray(s, 2 * t),
          m.fromArray(s, 2 * e),
          f.fromArray(s, 2 * n),
          u.sub(h),
          d.sub(h),
          m.sub(p),
          f.sub(p);
        const r = 1 / (m.x * f.y - f.x * m.y);
        isFinite(r) &&
          (g
            .copy(u)
            .multiplyScalar(f.y)
            .addScaledVector(d, -m.y)
            .multiplyScalar(r),
          v
            .copy(d)
            .multiplyScalar(m.x)
            .addScaledVector(u, -f.x)
            .multiplyScalar(r),
          l[t].add(g),
          l[e].add(g),
          l[n].add(g),
          c[t].add(v),
          c[e].add(v),
          c[n].add(v));
      }
      let _ = this.groups;
      0 === _.length && (_ = [{ start: 0, count: n.length }]);
      for (let t = 0, e = _.length; t < e; ++t) {
        const e = _[t],
          i = e.start;
        for (let t = i, r = i + e.count; t < r; t += 3)
          x(n[t + 0], n[t + 1], n[t + 2]);
      }
      const y = new ze(),
        b = new ze(),
        w = new ze(),
        M = new ze();
      function S(t) {
        w.fromArray(r, 3 * t), M.copy(w);
        const e = l[t];
        y.copy(e),
          y.sub(w.multiplyScalar(w.dot(e))).normalize(),
          b.crossVectors(M, e);
        const n = b.dot(c[t]) < 0 ? -1 : 1;
        (a[4 * t] = y.x),
          (a[4 * t + 1] = y.y),
          (a[4 * t + 2] = y.z),
          (a[4 * t + 3] = n);
      }
      for (let t = 0, e = _.length; t < e; ++t) {
        const e = _[t],
          i = e.start;
        for (let t = i, r = i + e.count; t < r; t += 3)
          S(n[t + 0]), S(n[t + 1]), S(n[t + 2]);
      }
    }
    computeVertexNormals() {
      const t = this.index,
        e = this.getAttribute("position");
      if (void 0 !== e) {
        let n = this.getAttribute("normal");
        if (void 0 === n)
          (n = new li(new Float32Array(3 * e.count), 3)),
            this.setAttribute("normal", n);
        else for (let t = 0, e = n.count; t < e; t++) n.setXYZ(t, 0, 0, 0);
        const i = new ze(),
          r = new ze(),
          s = new ze(),
          o = new ze(),
          a = new ze(),
          l = new ze(),
          c = new ze(),
          h = new ze();
        if (t)
          for (let u = 0, d = t.count; u < d; u += 3) {
            const d = t.getX(u + 0),
              p = t.getX(u + 1),
              m = t.getX(u + 2);
            i.fromBufferAttribute(e, d),
              r.fromBufferAttribute(e, p),
              s.fromBufferAttribute(e, m),
              c.subVectors(s, r),
              h.subVectors(i, r),
              c.cross(h),
              o.fromBufferAttribute(n, d),
              a.fromBufferAttribute(n, p),
              l.fromBufferAttribute(n, m),
              o.add(c),
              a.add(c),
              l.add(c),
              n.setXYZ(d, o.x, o.y, o.z),
              n.setXYZ(p, a.x, a.y, a.z),
              n.setXYZ(m, l.x, l.y, l.z);
          }
        else
          for (let t = 0, o = e.count; t < o; t += 3)
            i.fromBufferAttribute(e, t + 0),
              r.fromBufferAttribute(e, t + 1),
              s.fromBufferAttribute(e, t + 2),
              c.subVectors(s, r),
              h.subVectors(i, r),
              c.cross(h),
              n.setXYZ(t + 0, c.x, c.y, c.z),
              n.setXYZ(t + 1, c.x, c.y, c.z),
              n.setXYZ(t + 2, c.x, c.y, c.z);
        this.normalizeNormals(), (n.needsUpdate = !0);
      }
    }
    merge(t, e) {
      if (!t || !t.isBufferGeometry)
        return void console.error(
          "THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.",
          t
        );
      void 0 === e &&
        ((e = 0),
        console.warn(
          "THREE.BufferGeometry.merge(): Overwriting original geometry, starting at offset=0. Use BufferGeometryUtils.mergeBufferGeometries() for lossless merge."
        ));
      const n = this.attributes;
      for (const i in n) {
        if (void 0 === t.attributes[i]) continue;
        const r = n[i].array,
          s = t.attributes[i],
          o = s.array,
          a = s.itemSize * e,
          l = Math.min(o.length, r.length - a);
        for (let t = 0, e = a; t < l; t++, e++) r[e] = o[t];
      }
      return this;
    }
    normalizeNormals() {
      const t = this.attributes.normal;
      for (let e = 0, n = t.count; e < n; e++)
        xi.fromBufferAttribute(t, e),
          xi.normalize(),
          t.setXYZ(e, xi.x, xi.y, xi.z);
    }
    toNonIndexed() {
      function t(t, e) {
        const n = t.array,
          i = t.itemSize,
          r = t.normalized,
          s = new n.constructor(e.length * i);
        let o = 0,
          a = 0;
        for (let r = 0, l = e.length; r < l; r++) {
          o = t.isInterleavedBufferAttribute
            ? e[r] * t.data.stride + t.offset
            : e[r] * i;
          for (let t = 0; t < i; t++) s[a++] = n[o++];
        }
        return new li(s, i, r);
      }
      if (null === this.index)
        return (
          console.warn(
            "THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."
          ),
          this
        );
      const e = new _i(),
        n = this.index.array,
        i = this.attributes;
      for (const r in i) {
        const s = t(i[r], n);
        e.setAttribute(r, s);
      }
      const r = this.morphAttributes;
      for (const i in r) {
        const s = [],
          o = r[i];
        for (let e = 0, i = o.length; e < i; e++) {
          const i = t(o[e], n);
          s.push(i);
        }
        e.morphAttributes[i] = s;
      }
      e.morphTargetsRelative = this.morphTargetsRelative;
      const s = this.groups;
      for (let t = 0, n = s.length; t < n; t++) {
        const n = s[t];
        e.addGroup(n.start, n.count, n.materialIndex);
      }
      return e;
    }
    toJSON() {
      const t = {
        metadata: {
          version: 4.5,
          type: "BufferGeometry",
          generator: "BufferGeometry.toJSON",
        },
      };
      if (
        ((t.uuid = this.uuid),
        (t.type = this.type),
        "" !== this.name && (t.name = this.name),
        Object.keys(this.userData).length > 0 && (t.userData = this.userData),
        void 0 !== this.parameters)
      ) {
        const e = this.parameters;
        for (const n in e) void 0 !== e[n] && (t[n] = e[n]);
        return t;
      }
      t.data = { attributes: {} };
      const e = this.index;
      null !== e &&
        (t.data.index = {
          type: e.array.constructor.name,
          array: Array.prototype.slice.call(e.array),
        });
      const n = this.attributes;
      for (const e in n) {
        const i = n[e];
        t.data.attributes[e] = i.toJSON(t.data);
      }
      const i = {};
      let r = !1;
      for (const e in this.morphAttributes) {
        const n = this.morphAttributes[e],
          s = [];
        for (let e = 0, i = n.length; e < i; e++) {
          const i = n[e];
          s.push(i.toJSON(t.data));
        }
        s.length > 0 && ((i[e] = s), (r = !0));
      }
      r &&
        ((t.data.morphAttributes = i),
        (t.data.morphTargetsRelative = this.morphTargetsRelative));
      const s = this.groups;
      s.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(s)));
      const o = this.boundingSphere;
      return (
        null !== o &&
          (t.data.boundingSphere = {
            center: o.center.toArray(),
            radius: o.radius,
          }),
        t
      );
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      (this.index = null),
        (this.attributes = {}),
        (this.morphAttributes = {}),
        (this.groups = []),
        (this.boundingBox = null),
        (this.boundingSphere = null);
      const e = {};
      this.name = t.name;
      const n = t.index;
      null !== n && this.setIndex(n.clone(e));
      const i = t.attributes;
      for (const t in i) {
        const n = i[t];
        this.setAttribute(t, n.clone(e));
      }
      const r = t.morphAttributes;
      for (const t in r) {
        const n = [],
          i = r[t];
        for (let t = 0, r = i.length; t < r; t++) n.push(i[t].clone(e));
        this.morphAttributes[t] = n;
      }
      this.morphTargetsRelative = t.morphTargetsRelative;
      const s = t.groups;
      for (let t = 0, e = s.length; t < e; t++) {
        const e = s[t];
        this.addGroup(e.start, e.count, e.materialIndex);
      }
      const o = t.boundingBox;
      null !== o && (this.boundingBox = o.clone());
      const a = t.boundingSphere;
      return (
        null !== a && (this.boundingSphere = a.clone()),
        (this.drawRange.start = t.drawRange.start),
        (this.drawRange.count = t.drawRange.count),
        (this.userData = t.userData),
        void 0 !== t.parameters &&
          (this.parameters = Object.assign({}, t.parameters)),
        this
      );
    }
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }
  _i.prototype.isBufferGeometry = !0;
  const yi = new pn(),
    bi = new dn(),
    wi = new rn(),
    Mi = new ze(),
    Si = new ze(),
    Ti = new ze(),
    Ei = new ze(),
    Ai = new ze(),
    Li = new ze(),
    Ri = new ze(),
    Ci = new ze(),
    Pi = new ze(),
    Di = new we(),
    Ii = new we(),
    Ni = new we(),
    zi = new ze(),
    ki = new ze();
  class Oi extends Fn {
    constructor(t = new _i(), e = new si()) {
      super(),
        (this.type = "Mesh"),
        (this.geometry = t),
        (this.material = e),
        this.updateMorphTargets();
    }
    copy(t) {
      return (
        super.copy(t),
        void 0 !== t.morphTargetInfluences &&
          (this.morphTargetInfluences = t.morphTargetInfluences.slice()),
        void 0 !== t.morphTargetDictionary &&
          (this.morphTargetDictionary = Object.assign(
            {},
            t.morphTargetDictionary
          )),
        (this.material = t.material),
        (this.geometry = t.geometry),
        this
      );
    }
    updateMorphTargets() {
      const t = this.geometry;
      if (t.isBufferGeometry) {
        const e = t.morphAttributes,
          n = Object.keys(e);
        if (n.length > 0) {
          const t = e[n[0]];
          if (void 0 !== t) {
            (this.morphTargetInfluences = []),
              (this.morphTargetDictionary = {});
            for (let e = 0, n = t.length; e < n; e++) {
              const n = t[e].name || String(e);
              this.morphTargetInfluences.push(0),
                (this.morphTargetDictionary[n] = e);
            }
          }
        }
      } else {
        const e = t.morphTargets;
        void 0 !== e &&
          e.length > 0 &&
          console.error(
            "THREE.Mesh.updateMorphTargets() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead."
          );
      }
    }
    raycast(t, e) {
      const n = this.geometry,
        i = this.material,
        r = this.matrixWorld;
      if (void 0 === i) return;
      if (
        (null === n.boundingSphere && n.computeBoundingSphere(),
        wi.copy(n.boundingSphere),
        wi.applyMatrix4(r),
        !1 === t.ray.intersectsSphere(wi))
      )
        return;
      if (
        (yi.copy(r).invert(),
        bi.copy(t.ray).applyMatrix4(yi),
        null !== n.boundingBox && !1 === bi.intersectsBox(n.boundingBox))
      )
        return;
      let s;
      if (n.isBufferGeometry) {
        const r = n.index,
          o = n.attributes.position,
          a = n.morphAttributes.position,
          l = n.morphTargetsRelative,
          c = n.attributes.uv,
          h = n.attributes.uv2,
          u = n.groups,
          d = n.drawRange;
        if (null !== r)
          if (Array.isArray(i))
            for (let n = 0, p = u.length; n < p; n++) {
              const p = u[n],
                m = i[p.materialIndex];
              for (
                let n = Math.max(p.start, d.start),
                  i = Math.min(
                    r.count,
                    Math.min(p.start + p.count, d.start + d.count)
                  );
                n < i;
                n += 3
              ) {
                const i = r.getX(n),
                  u = r.getX(n + 1),
                  d = r.getX(n + 2);
                (s = Fi(this, m, t, bi, o, a, l, c, h, i, u, d)),
                  s &&
                    ((s.faceIndex = Math.floor(n / 3)),
                    (s.face.materialIndex = p.materialIndex),
                    e.push(s));
              }
            }
          else {
            for (
              let n = Math.max(0, d.start),
                u = Math.min(r.count, d.start + d.count);
              n < u;
              n += 3
            ) {
              const u = r.getX(n),
                d = r.getX(n + 1),
                p = r.getX(n + 2);
              (s = Fi(this, i, t, bi, o, a, l, c, h, u, d, p)),
                s && ((s.faceIndex = Math.floor(n / 3)), e.push(s));
            }
          }
        else if (void 0 !== o)
          if (Array.isArray(i))
            for (let n = 0, r = u.length; n < r; n++) {
              const r = u[n],
                p = i[r.materialIndex];
              for (
                let n = Math.max(r.start, d.start),
                  i = Math.min(
                    o.count,
                    Math.min(r.start + r.count, d.start + d.count)
                  );
                n < i;
                n += 3
              ) {
                (s = Fi(this, p, t, bi, o, a, l, c, h, n, n + 1, n + 2)),
                  s &&
                    ((s.faceIndex = Math.floor(n / 3)),
                    (s.face.materialIndex = r.materialIndex),
                    e.push(s));
              }
            }
          else {
            for (
              let n = Math.max(0, d.start),
                r = Math.min(o.count, d.start + d.count);
              n < r;
              n += 3
            ) {
              (s = Fi(this, i, t, bi, o, a, l, c, h, n, n + 1, n + 2)),
                s && ((s.faceIndex = Math.floor(n / 3)), e.push(s));
            }
          }
      } else n.isGeometry && console.error("THREE.Mesh.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.");
    }
  }
  function Fi(t, e, n, i, r, s, o, a, l, c, h, u) {
    Mi.fromBufferAttribute(r, c),
      Si.fromBufferAttribute(r, h),
      Ti.fromBufferAttribute(r, u);
    const d = t.morphTargetInfluences;
    if (s && d) {
      Ri.set(0, 0, 0), Ci.set(0, 0, 0), Pi.set(0, 0, 0);
      for (let t = 0, e = s.length; t < e; t++) {
        const e = d[t],
          n = s[t];
        0 !== e &&
          (Ei.fromBufferAttribute(n, c),
          Ai.fromBufferAttribute(n, h),
          Li.fromBufferAttribute(n, u),
          o
            ? (Ri.addScaledVector(Ei, e),
              Ci.addScaledVector(Ai, e),
              Pi.addScaledVector(Li, e))
            : (Ri.addScaledVector(Ei.sub(Mi), e),
              Ci.addScaledVector(Ai.sub(Si), e),
              Pi.addScaledVector(Li.sub(Ti), e)));
      }
      Mi.add(Ri), Si.add(Ci), Ti.add(Pi);
    }
    t.isSkinnedMesh &&
      (t.boneTransform(c, Mi), t.boneTransform(h, Si), t.boneTransform(u, Ti));
    const p = (function (t, e, n, i, r, s, o, a) {
      let l;
      if (
        ((l =
          1 === e.side
            ? i.intersectTriangle(o, s, r, !0, a)
            : i.intersectTriangle(r, s, o, 2 !== e.side, a)),
        null === l)
      )
        return null;
      ki.copy(a), ki.applyMatrix4(t.matrixWorld);
      const c = n.ray.origin.distanceTo(ki);
      return c < n.near || c > n.far
        ? null
        : { distance: c, point: ki.clone(), object: t };
    })(t, e, n, i, Mi, Si, Ti, zi);
    if (p) {
      a &&
        (Di.fromBufferAttribute(a, c),
        Ii.fromBufferAttribute(a, h),
        Ni.fromBufferAttribute(a, u),
        (p.uv = qn.getUV(zi, Mi, Si, Ti, Di, Ii, Ni, new we()))),
        l &&
          (Di.fromBufferAttribute(l, c),
          Ii.fromBufferAttribute(l, h),
          Ni.fromBufferAttribute(l, u),
          (p.uv2 = qn.getUV(zi, Mi, Si, Ti, Di, Ii, Ni, new we())));
      const t = { a: c, b: h, c: u, normal: new ze(), materialIndex: 0 };
      qn.getNormal(Mi, Si, Ti, t.normal), (p.face = t);
    }
    return p;
  }
  Oi.prototype.isMesh = !0;
  class Ui extends _i {
    constructor(t = 1, e = 1, n = 1, i = 1, r = 1, s = 1) {
      super(),
        (this.type = "BoxGeometry"),
        (this.parameters = {
          width: t,
          height: e,
          depth: n,
          widthSegments: i,
          heightSegments: r,
          depthSegments: s,
        });
      const o = this;
      (i = Math.floor(i)), (r = Math.floor(r)), (s = Math.floor(s));
      const a = [],
        l = [],
        c = [],
        h = [];
      let u = 0,
        d = 0;
      function p(t, e, n, i, r, s, p, m, f, g, v) {
        const x = s / f,
          _ = p / g,
          y = s / 2,
          b = p / 2,
          w = m / 2,
          M = f + 1,
          S = g + 1;
        let T = 0,
          E = 0;
        const A = new ze();
        for (let s = 0; s < S; s++) {
          const o = s * _ - b;
          for (let a = 0; a < M; a++) {
            const u = a * x - y;
            (A[t] = u * i),
              (A[e] = o * r),
              (A[n] = w),
              l.push(A.x, A.y, A.z),
              (A[t] = 0),
              (A[e] = 0),
              (A[n] = m > 0 ? 1 : -1),
              c.push(A.x, A.y, A.z),
              h.push(a / f),
              h.push(1 - s / g),
              (T += 1);
          }
        }
        for (let t = 0; t < g; t++)
          for (let e = 0; e < f; e++) {
            const n = u + e + M * t,
              i = u + e + M * (t + 1),
              r = u + (e + 1) + M * (t + 1),
              s = u + (e + 1) + M * t;
            a.push(n, i, s), a.push(i, r, s), (E += 6);
          }
        o.addGroup(d, E, v), (d += E), (u += T);
      }
      p("z", "y", "x", -1, -1, n, e, t, s, r, 0),
        p("z", "y", "x", 1, -1, n, e, -t, s, r, 1),
        p("x", "z", "y", 1, 1, t, n, e, i, s, 2),
        p("x", "z", "y", 1, -1, t, n, -e, i, s, 3),
        p("x", "y", "z", 1, -1, t, e, n, i, r, 4),
        p("x", "y", "z", -1, -1, t, e, -n, i, r, 5),
        this.setIndex(a),
        this.setAttribute("position", new ui(l, 3)),
        this.setAttribute("normal", new ui(c, 3)),
        this.setAttribute("uv", new ui(h, 2));
    }
    static fromJSON(t) {
      return new Ui(
        t.width,
        t.height,
        t.depth,
        t.widthSegments,
        t.heightSegments,
        t.depthSegments
      );
    }
  }
  function Bi(t) {
    const e = {};
    for (const n in t) {
      e[n] = {};
      for (const i in t[n]) {
        const r = t[n][i];
        r &&
        (r.isColor ||
          r.isMatrix3 ||
          r.isMatrix4 ||
          r.isVector2 ||
          r.isVector3 ||
          r.isVector4 ||
          r.isTexture ||
          r.isQuaternion)
          ? (e[n][i] = r.clone())
          : Array.isArray(r)
          ? (e[n][i] = r.slice())
          : (e[n][i] = r);
      }
    }
    return e;
  }
  function Hi(t) {
    const e = {};
    for (let n = 0; n < t.length; n++) {
      const i = Bi(t[n]);
      for (const t in i) e[t] = i[t];
    }
    return e;
  }
  const Gi = { clone: Bi, merge: Hi };
  class Vi extends Qn {
    constructor(t) {
      super(),
        (this.type = "ShaderMaterial"),
        (this.defines = {}),
        (this.uniforms = {}),
        (this.vertexShader =
          "void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}"),
        (this.fragmentShader =
          "void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}"),
        (this.linewidth = 1),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.fog = !1),
        (this.lights = !1),
        (this.clipping = !1),
        (this.extensions = {
          derivatives: !1,
          fragDepth: !1,
          drawBuffers: !1,
          shaderTextureLOD: !1,
        }),
        (this.defaultAttributeValues = {
          color: [1, 1, 1],
          uv: [0, 0],
          uv2: [0, 0],
        }),
        (this.index0AttributeName = void 0),
        (this.uniformsNeedUpdate = !1),
        (this.glslVersion = null),
        void 0 !== t &&
          (void 0 !== t.attributes &&
            console.error(
              "THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead."
            ),
          this.setValues(t));
    }
    copy(t) {
      return (
        super.copy(t),
        (this.fragmentShader = t.fragmentShader),
        (this.vertexShader = t.vertexShader),
        (this.uniforms = Bi(t.uniforms)),
        (this.defines = Object.assign({}, t.defines)),
        (this.wireframe = t.wireframe),
        (this.wireframeLinewidth = t.wireframeLinewidth),
        (this.lights = t.lights),
        (this.clipping = t.clipping),
        (this.extensions = Object.assign({}, t.extensions)),
        (this.glslVersion = t.glslVersion),
        this
      );
    }
    toJSON(t) {
      const e = super.toJSON(t);
      (e.glslVersion = this.glslVersion), (e.uniforms = {});
      for (const n in this.uniforms) {
        const i = this.uniforms[n].value;
        i && i.isTexture
          ? (e.uniforms[n] = { type: "t", value: i.toJSON(t).uuid })
          : i && i.isColor
          ? (e.uniforms[n] = { type: "c", value: i.getHex() })
          : i && i.isVector2
          ? (e.uniforms[n] = { type: "v2", value: i.toArray() })
          : i && i.isVector3
          ? (e.uniforms[n] = { type: "v3", value: i.toArray() })
          : i && i.isVector4
          ? (e.uniforms[n] = { type: "v4", value: i.toArray() })
          : i && i.isMatrix3
          ? (e.uniforms[n] = { type: "m3", value: i.toArray() })
          : i && i.isMatrix4
          ? (e.uniforms[n] = { type: "m4", value: i.toArray() })
          : (e.uniforms[n] = { value: i });
      }
      Object.keys(this.defines).length > 0 && (e.defines = this.defines),
        (e.vertexShader = this.vertexShader),
        (e.fragmentShader = this.fragmentShader);
      const n = {};
      for (const t in this.extensions) !0 === this.extensions[t] && (n[t] = !0);
      return Object.keys(n).length > 0 && (e.extensions = n), e;
    }
  }
  Vi.prototype.isShaderMaterial = !0;
  class Wi extends Fn {
    constructor() {
      super(),
        (this.type = "Camera"),
        (this.matrixWorldInverse = new pn()),
        (this.projectionMatrix = new pn()),
        (this.projectionMatrixInverse = new pn());
    }
    copy(t, e) {
      return (
        super.copy(t, e),
        this.matrixWorldInverse.copy(t.matrixWorldInverse),
        this.projectionMatrix.copy(t.projectionMatrix),
        this.projectionMatrixInverse.copy(t.projectionMatrixInverse),
        this
      );
    }
    getWorldDirection(t) {
      this.updateWorldMatrix(!0, !1);
      const e = this.matrixWorld.elements;
      return t.set(-e[8], -e[9], -e[10]).normalize();
    }
    updateMatrixWorld(t) {
      super.updateMatrixWorld(t),
        this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    updateWorldMatrix(t, e) {
      super.updateWorldMatrix(t, e),
        this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  Wi.prototype.isCamera = !0;
  class ji extends Wi {
    constructor(t = 50, e = 1, n = 0.1, i = 2e3) {
      super(),
        (this.type = "PerspectiveCamera"),
        (this.fov = t),
        (this.zoom = 1),
        (this.near = n),
        (this.far = i),
        (this.focus = 10),
        (this.aspect = e),
        (this.view = null),
        (this.filmGauge = 35),
        (this.filmOffset = 0),
        this.updateProjectionMatrix();
    }
    copy(t, e) {
      return (
        super.copy(t, e),
        (this.fov = t.fov),
        (this.zoom = t.zoom),
        (this.near = t.near),
        (this.far = t.far),
        (this.focus = t.focus),
        (this.aspect = t.aspect),
        (this.view = null === t.view ? null : Object.assign({}, t.view)),
        (this.filmGauge = t.filmGauge),
        (this.filmOffset = t.filmOffset),
        this
      );
    }
    setFocalLength(t) {
      const e = (0.5 * this.getFilmHeight()) / t;
      (this.fov = 2 * ge * Math.atan(e)), this.updateProjectionMatrix();
    }
    getFocalLength() {
      const t = Math.tan(0.5 * fe * this.fov);
      return (0.5 * this.getFilmHeight()) / t;
    }
    getEffectiveFOV() {
      return 2 * ge * Math.atan(Math.tan(0.5 * fe * this.fov) / this.zoom);
    }
    getFilmWidth() {
      return this.filmGauge * Math.min(this.aspect, 1);
    }
    getFilmHeight() {
      return this.filmGauge / Math.max(this.aspect, 1);
    }
    setViewOffset(t, e, n, i, r, s) {
      (this.aspect = t / e),
        null === this.view &&
          (this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1,
          }),
        (this.view.enabled = !0),
        (this.view.fullWidth = t),
        (this.view.fullHeight = e),
        (this.view.offsetX = n),
        (this.view.offsetY = i),
        (this.view.width = r),
        (this.view.height = s),
        this.updateProjectionMatrix();
    }
    clearViewOffset() {
      null !== this.view && (this.view.enabled = !1),
        this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      const t = this.near;
      let e = (t * Math.tan(0.5 * fe * this.fov)) / this.zoom,
        n = 2 * e,
        i = this.aspect * n,
        r = -0.5 * i;
      const s = this.view;
      if (null !== this.view && this.view.enabled) {
        const t = s.fullWidth,
          o = s.fullHeight;
        (r += (s.offsetX * i) / t),
          (e -= (s.offsetY * n) / o),
          (i *= s.width / t),
          (n *= s.height / o);
      }
      const o = this.filmOffset;
      0 !== o && (r += (t * o) / this.getFilmWidth()),
        this.projectionMatrix.makePerspective(r, r + i, e, e - n, t, this.far),
        this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return (
        (e.object.fov = this.fov),
        (e.object.zoom = this.zoom),
        (e.object.near = this.near),
        (e.object.far = this.far),
        (e.object.focus = this.focus),
        (e.object.aspect = this.aspect),
        null !== this.view && (e.object.view = Object.assign({}, this.view)),
        (e.object.filmGauge = this.filmGauge),
        (e.object.filmOffset = this.filmOffset),
        e
      );
    }
  }
  ji.prototype.isPerspectiveCamera = !0;
  const Zi = 90;
  class Yi extends Fn {
    constructor(t, e, n) {
      if (
        (super(), (this.type = "CubeCamera"), !0 !== n.isWebGLCubeRenderTarget)
      )
        return void console.error(
          "THREE.CubeCamera: The constructor now expects an instance of WebGLCubeRenderTarget as third parameter."
        );
      this.renderTarget = n;
      const i = new ji(Zi, 1, t, e);
      (i.layers = this.layers),
        i.up.set(0, -1, 0),
        i.lookAt(new ze(1, 0, 0)),
        this.add(i);
      const r = new ji(Zi, 1, t, e);
      (r.layers = this.layers),
        r.up.set(0, -1, 0),
        r.lookAt(new ze(-1, 0, 0)),
        this.add(r);
      const s = new ji(Zi, 1, t, e);
      (s.layers = this.layers),
        s.up.set(0, 0, 1),
        s.lookAt(new ze(0, 1, 0)),
        this.add(s);
      const o = new ji(Zi, 1, t, e);
      (o.layers = this.layers),
        o.up.set(0, 0, -1),
        o.lookAt(new ze(0, -1, 0)),
        this.add(o);
      const a = new ji(Zi, 1, t, e);
      (a.layers = this.layers),
        a.up.set(0, -1, 0),
        a.lookAt(new ze(0, 0, 1)),
        this.add(a);
      const l = new ji(Zi, 1, t, e);
      (l.layers = this.layers),
        l.up.set(0, -1, 0),
        l.lookAt(new ze(0, 0, -1)),
        this.add(l);
    }
    update(t, e) {
      null === this.parent && this.updateMatrixWorld();
      const n = this.renderTarget,
        [i, r, s, o, a, l] = this.children,
        c = t.xr.enabled,
        h = t.getRenderTarget();
      t.xr.enabled = !1;
      const u = n.texture.generateMipmaps;
      (n.texture.generateMipmaps = !1),
        t.setRenderTarget(n, 0),
        t.render(e, i),
        t.setRenderTarget(n, 1),
        t.render(e, r),
        t.setRenderTarget(n, 2),
        t.render(e, s),
        t.setRenderTarget(n, 3),
        t.render(e, o),
        t.setRenderTarget(n, 4),
        t.render(e, a),
        (n.texture.generateMipmaps = u),
        t.setRenderTarget(n, 5),
        t.render(e, l),
        t.setRenderTarget(h),
        (t.xr.enabled = c);
    }
  }
  class Xi extends Re {
    constructor(t, e, n, i, r, s, o, a, l, c) {
      super(
        (t = void 0 !== t ? t : []),
        (e = void 0 !== e ? e : Dt),
        n,
        i,
        r,
        s,
        o,
        a,
        l,
        c
      ),
        (this.flipY = !1);
    }
    get images() {
      return this.image;
    }
    set images(t) {
      this.image = t;
    }
  }
  Xi.prototype.isCubeTexture = !0;
  class qi extends De {
    constructor(t, e, n) {
      Number.isInteger(e) &&
        (console.warn(
          "THREE.WebGLCubeRenderTarget: constructor signature is now WebGLCubeRenderTarget( size, options )"
        ),
        (e = n)),
        super(t, t, e),
        (e = e || {}),
        (this.texture = new Xi(
          void 0,
          e.mapping,
          e.wrapS,
          e.wrapT,
          e.magFilter,
          e.minFilter,
          e.format,
          e.type,
          e.anisotropy,
          e.encoding
        )),
        (this.texture.isRenderTargetTexture = !0),
        (this.texture.generateMipmaps =
          void 0 !== e.generateMipmaps && e.generateMipmaps),
        (this.texture.minFilter = void 0 !== e.minFilter ? e.minFilter : Ht),
        (this.texture._needsFlipEnvMap = !1);
    }
    fromEquirectangularTexture(t, e) {
      (this.texture.type = e.type),
        (this.texture.format = Qt),
        (this.texture.encoding = e.encoding),
        (this.texture.generateMipmaps = e.generateMipmaps),
        (this.texture.minFilter = e.minFilter),
        (this.texture.magFilter = e.magFilter);
      const n = {
          uniforms: { tEquirect: { value: null } },
          vertexShader:
            "\n\n\t\t\t\tvarying vec3 vWorldDirection;\n\n\t\t\t\tvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\n\t\t\t\t\treturn normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n\n\t\t\t\t}\n\n\t\t\t\tvoid main() {\n\n\t\t\t\t\tvWorldDirection = transformDirection( position, modelMatrix );\n\n\t\t\t\t\t#include <begin_vertex>\n\t\t\t\t\t#include <project_vertex>\n\n\t\t\t\t}\n\t\t\t",
          fragmentShader:
            "\n\n\t\t\t\tuniform sampler2D tEquirect;\n\n\t\t\t\tvarying vec3 vWorldDirection;\n\n\t\t\t\t#include <common>\n\n\t\t\t\tvoid main() {\n\n\t\t\t\t\tvec3 direction = normalize( vWorldDirection );\n\n\t\t\t\t\tvec2 sampleUV = equirectUv( direction );\n\n\t\t\t\t\tgl_FragColor = texture2D( tEquirect, sampleUV );\n\n\t\t\t\t}\n\t\t\t",
        },
        i = new Ui(5, 5, 5),
        r = new Vi({
          name: "CubemapFromEquirect",
          uniforms: Bi(n.uniforms),
          vertexShader: n.vertexShader,
          fragmentShader: n.fragmentShader,
          side: 1,
          blending: 0,
        });
      r.uniforms.tEquirect.value = e;
      const s = new Oi(i, r),
        o = e.minFilter;
      e.minFilter === Vt && (e.minFilter = Ht);
      return (
        new Yi(1, 10, this).update(t, s),
        (e.minFilter = o),
        s.geometry.dispose(),
        s.material.dispose(),
        this
      );
    }
    clear(t, e, n, i) {
      const r = t.getRenderTarget();
      for (let r = 0; r < 6; r++) t.setRenderTarget(this, r), t.clear(e, n, i);
      t.setRenderTarget(r);
    }
  }
  qi.prototype.isWebGLCubeRenderTarget = !0;
  const Ji = new ze(),
    Qi = new ze(),
    Ki = new Me();
  class $i {
    constructor(t = new ze(1, 0, 0), e = 0) {
      (this.normal = t), (this.constant = e);
    }
    set(t, e) {
      return this.normal.copy(t), (this.constant = e), this;
    }
    setComponents(t, e, n, i) {
      return this.normal.set(t, e, n), (this.constant = i), this;
    }
    setFromNormalAndCoplanarPoint(t, e) {
      return this.normal.copy(t), (this.constant = -e.dot(this.normal)), this;
    }
    setFromCoplanarPoints(t, e, n) {
      const i = Ji.subVectors(n, e).cross(Qi.subVectors(t, e)).normalize();
      return this.setFromNormalAndCoplanarPoint(i, t), this;
    }
    copy(t) {
      return this.normal.copy(t.normal), (this.constant = t.constant), this;
    }
    normalize() {
      const t = 1 / this.normal.length();
      return this.normal.multiplyScalar(t), (this.constant *= t), this;
    }
    negate() {
      return (this.constant *= -1), this.normal.negate(), this;
    }
    distanceToPoint(t) {
      return this.normal.dot(t) + this.constant;
    }
    distanceToSphere(t) {
      return this.distanceToPoint(t.center) - t.radius;
    }
    projectPoint(t, e) {
      return e
        .copy(this.normal)
        .multiplyScalar(-this.distanceToPoint(t))
        .add(t);
    }
    intersectLine(t, e) {
      const n = t.delta(Ji),
        i = this.normal.dot(n);
      if (0 === i)
        return 0 === this.distanceToPoint(t.start) ? e.copy(t.start) : null;
      const r = -(t.start.dot(this.normal) + this.constant) / i;
      return r < 0 || r > 1 ? null : e.copy(n).multiplyScalar(r).add(t.start);
    }
    intersectsLine(t) {
      const e = this.distanceToPoint(t.start),
        n = this.distanceToPoint(t.end);
      return (e < 0 && n > 0) || (n < 0 && e > 0);
    }
    intersectsBox(t) {
      return t.intersectsPlane(this);
    }
    intersectsSphere(t) {
      return t.intersectsPlane(this);
    }
    coplanarPoint(t) {
      return t.copy(this.normal).multiplyScalar(-this.constant);
    }
    applyMatrix4(t, e) {
      const n = e || Ki.getNormalMatrix(t),
        i = this.coplanarPoint(Ji).applyMatrix4(t),
        r = this.normal.applyMatrix3(n).normalize();
      return (this.constant = -i.dot(r)), this;
    }
    translate(t) {
      return (this.constant -= t.dot(this.normal)), this;
    }
    equals(t) {
      return t.normal.equals(this.normal) && t.constant === this.constant;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  $i.prototype.isPlane = !0;
  const tr = new rn(),
    er = new ze();
  class nr {
    constructor(
      t = new $i(),
      e = new $i(),
      n = new $i(),
      i = new $i(),
      r = new $i(),
      s = new $i()
    ) {
      this.planes = [t, e, n, i, r, s];
    }
    set(t, e, n, i, r, s) {
      const o = this.planes;
      return (
        o[0].copy(t),
        o[1].copy(e),
        o[2].copy(n),
        o[3].copy(i),
        o[4].copy(r),
        o[5].copy(s),
        this
      );
    }
    copy(t) {
      const e = this.planes;
      for (let n = 0; n < 6; n++) e[n].copy(t.planes[n]);
      return this;
    }
    setFromProjectionMatrix(t) {
      const e = this.planes,
        n = t.elements,
        i = n[0],
        r = n[1],
        s = n[2],
        o = n[3],
        a = n[4],
        l = n[5],
        c = n[6],
        h = n[7],
        u = n[8],
        d = n[9],
        p = n[10],
        m = n[11],
        f = n[12],
        g = n[13],
        v = n[14],
        x = n[15];
      return (
        e[0].setComponents(o - i, h - a, m - u, x - f).normalize(),
        e[1].setComponents(o + i, h + a, m + u, x + f).normalize(),
        e[2].setComponents(o + r, h + l, m + d, x + g).normalize(),
        e[3].setComponents(o - r, h - l, m - d, x - g).normalize(),
        e[4].setComponents(o - s, h - c, m - p, x - v).normalize(),
        e[5].setComponents(o + s, h + c, m + p, x + v).normalize(),
        this
      );
    }
    intersectsObject(t) {
      const e = t.geometry;
      return (
        null === e.boundingSphere && e.computeBoundingSphere(),
        tr.copy(e.boundingSphere).applyMatrix4(t.matrixWorld),
        this.intersectsSphere(tr)
      );
    }
    intersectsSprite(t) {
      return (
        tr.center.set(0, 0, 0),
        (tr.radius = 0.7071067811865476),
        tr.applyMatrix4(t.matrixWorld),
        this.intersectsSphere(tr)
      );
    }
    intersectsSphere(t) {
      const e = this.planes,
        n = t.center,
        i = -t.radius;
      for (let t = 0; t < 6; t++) {
        if (e[t].distanceToPoint(n) < i) return !1;
      }
      return !0;
    }
    intersectsBox(t) {
      const e = this.planes;
      for (let n = 0; n < 6; n++) {
        const i = e[n];
        if (
          ((er.x = i.normal.x > 0 ? t.max.x : t.min.x),
          (er.y = i.normal.y > 0 ? t.max.y : t.min.y),
          (er.z = i.normal.z > 0 ? t.max.z : t.min.z),
          i.distanceToPoint(er) < 0)
        )
          return !1;
      }
      return !0;
    }
    containsPoint(t) {
      const e = this.planes;
      for (let n = 0; n < 6; n++) if (e[n].distanceToPoint(t) < 0) return !1;
      return !0;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  function ir() {
    let t = null,
      e = !1,
      n = null,
      i = null;
    function r(e, s) {
      n(e, s), (i = t.requestAnimationFrame(r));
    }
    return {
      start: function () {
        !0 !== e && null !== n && ((i = t.requestAnimationFrame(r)), (e = !0));
      },
      stop: function () {
        t.cancelAnimationFrame(i), (e = !1);
      },
      setAnimationLoop: function (t) {
        n = t;
      },
      setContext: function (e) {
        t = e;
      },
    };
  }
  function rr(t, e) {
    const n = e.isWebGL2,
      i = new WeakMap();
    return {
      get: function (t) {
        return t.isInterleavedBufferAttribute && (t = t.data), i.get(t);
      },
      remove: function (e) {
        e.isInterleavedBufferAttribute && (e = e.data);
        const n = i.get(e);
        n && (t.deleteBuffer(n.buffer), i.delete(e));
      },
      update: function (e, r) {
        if (e.isGLBufferAttribute) {
          const t = i.get(e);
          return void (
            (!t || t.version < e.version) &&
            i.set(e, {
              buffer: e.buffer,
              type: e.type,
              bytesPerElement: e.elementSize,
              version: e.version,
            })
          );
        }
        e.isInterleavedBufferAttribute && (e = e.data);
        const s = i.get(e);
        void 0 === s
          ? i.set(
              e,
              (function (e, i) {
                const r = e.array,
                  s = e.usage,
                  o = t.createBuffer();
                t.bindBuffer(i, o), t.bufferData(i, r, s), e.onUploadCallback();
                let a = 5126;
                return (
                  r instanceof Float32Array
                    ? (a = 5126)
                    : r instanceof Float64Array
                    ? console.warn(
                        "THREE.WebGLAttributes: Unsupported data buffer format: Float64Array."
                      )
                    : r instanceof Uint16Array
                    ? e.isFloat16BufferAttribute
                      ? n
                        ? (a = 5131)
                        : console.warn(
                            "THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2."
                          )
                      : (a = 5123)
                    : r instanceof Int16Array
                    ? (a = 5122)
                    : r instanceof Uint32Array
                    ? (a = 5125)
                    : r instanceof Int32Array
                    ? (a = 5124)
                    : r instanceof Int8Array
                    ? (a = 5120)
                    : (r instanceof Uint8Array ||
                        r instanceof Uint8ClampedArray) &&
                      (a = 5121),
                  {
                    buffer: o,
                    type: a,
                    bytesPerElement: r.BYTES_PER_ELEMENT,
                    version: e.version,
                  }
                );
              })(e, r)
            )
          : s.version < e.version &&
            (!(function (e, i, r) {
              const s = i.array,
                o = i.updateRange;
              t.bindBuffer(r, e),
                -1 === o.count
                  ? t.bufferSubData(r, 0, s)
                  : (n
                      ? t.bufferSubData(
                          r,
                          o.offset * s.BYTES_PER_ELEMENT,
                          s,
                          o.offset,
                          o.count
                        )
                      : t.bufferSubData(
                          r,
                          o.offset * s.BYTES_PER_ELEMENT,
                          s.subarray(o.offset, o.offset + o.count)
                        ),
                    (o.count = -1));
            })(s.buffer, e, r),
            (s.version = e.version));
      },
    };
  }
  class sr extends _i {
    constructor(t = 1, e = 1, n = 1, i = 1) {
      super(),
        (this.type = "PlaneGeometry"),
        (this.parameters = {
          width: t,
          height: e,
          widthSegments: n,
          heightSegments: i,
        });
      const r = t / 2,
        s = e / 2,
        o = Math.floor(n),
        a = Math.floor(i),
        l = o + 1,
        c = a + 1,
        h = t / o,
        u = e / a,
        d = [],
        p = [],
        m = [],
        f = [];
      for (let t = 0; t < c; t++) {
        const e = t * u - s;
        for (let n = 0; n < l; n++) {
          const i = n * h - r;
          p.push(i, -e, 0), m.push(0, 0, 1), f.push(n / o), f.push(1 - t / a);
        }
      }
      for (let t = 0; t < a; t++)
        for (let e = 0; e < o; e++) {
          const n = e + l * t,
            i = e + l * (t + 1),
            r = e + 1 + l * (t + 1),
            s = e + 1 + l * t;
          d.push(n, i, s), d.push(i, r, s);
        }
      this.setIndex(d),
        this.setAttribute("position", new ui(p, 3)),
        this.setAttribute("normal", new ui(m, 3)),
        this.setAttribute("uv", new ui(f, 2));
    }
    static fromJSON(t) {
      return new sr(t.width, t.height, t.widthSegments, t.heightSegments);
    }
  }
  const or = {
      alphamap_fragment:
        "#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, vUv ).g;\n#endif",
      alphamap_pars_fragment:
        "#ifdef USE_ALPHAMAP\n\tuniform sampler2D alphaMap;\n#endif",
      alphatest_fragment:
        "#ifdef USE_ALPHATEST\n\tif ( diffuseColor.a < alphaTest ) discard;\n#endif",
      alphatest_pars_fragment:
        "#ifdef USE_ALPHATEST\n\tuniform float alphaTest;\n#endif",
      aomap_fragment:
        "#ifdef USE_AOMAP\n\tfloat ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;\n\treflectedLight.indirectDiffuse *= ambientOcclusion;\n\t#if defined( USE_ENVMAP ) && defined( STANDARD )\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\treflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );\n\t#endif\n#endif",
      aomap_pars_fragment:
        "#ifdef USE_AOMAP\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n#endif",
      begin_vertex: "vec3 transformed = vec3( position );",
      beginnormal_vertex:
        "vec3 objectNormal = vec3( normal );\n#ifdef USE_TANGENT\n\tvec3 objectTangent = vec3( tangent.xyz );\n#endif",
      bsdfs:
        "vec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n\treturn RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {\n\tfloat fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n\treturn f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n}\nfloat V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\tfloat gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\treturn 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n\tfloat a2 = pow2( alpha );\n\tfloat denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n\treturn RECIPROCAL_PI * a2 / pow2( denom );\n}\nvec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {\n\tfloat alpha = pow2( roughness );\n\tvec3 halfDir = normalize( lightDir + viewDir );\n\tfloat dotNL = saturate( dot( normal, lightDir ) );\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\tfloat dotVH = saturate( dot( viewDir, halfDir ) );\n\tvec3 F = F_Schlick( f0, f90, dotVH );\n\tfloat V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n\tfloat D = D_GGX( alpha, dotNH );\n\treturn F * ( V * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n\tconst float LUT_SIZE = 64.0;\n\tconst float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n\tconst float LUT_BIAS = 0.5 / LUT_SIZE;\n\tfloat dotNV = saturate( dot( N, V ) );\n\tvec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );\n\tuv = uv * LUT_SCALE + LUT_BIAS;\n\treturn uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n\tfloat l = length( f );\n\treturn max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n\tfloat x = dot( v1, v2 );\n\tfloat y = abs( x );\n\tfloat a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;\n\tfloat b = 3.4175940 + ( 4.1616724 + y ) * y;\n\tfloat v = a / b;\n\tfloat theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;\n\treturn cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n\tvec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n\tvec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n\tvec3 lightNormal = cross( v1, v2 );\n\tif( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n\tvec3 T1, T2;\n\tT1 = normalize( V - N * dot( V, N ) );\n\tT2 = - cross( N, T1 );\n\tmat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );\n\tvec3 coords[ 4 ];\n\tcoords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n\tcoords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n\tcoords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n\tcoords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n\tcoords[ 0 ] = normalize( coords[ 0 ] );\n\tcoords[ 1 ] = normalize( coords[ 1 ] );\n\tcoords[ 2 ] = normalize( coords[ 2 ] );\n\tcoords[ 3 ] = normalize( coords[ 3 ] );\n\tvec3 vectorFormFactor = vec3( 0.0 );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n\tfloat result = LTC_ClippedSphereFormFactor( vectorFormFactor );\n\treturn vec3( result );\n}\nfloat G_BlinnPhong_Implicit( ) {\n\treturn 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n\treturn RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {\n\tvec3 halfDir = normalize( lightDir + viewDir );\n\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\tfloat dotVH = saturate( dot( viewDir, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, 1.0, dotVH );\n\tfloat G = G_BlinnPhong_Implicit( );\n\tfloat D = D_BlinnPhong( shininess, dotNH );\n\treturn F * ( G * D );\n}\n#if defined( USE_SHEEN )\nfloat D_Charlie( float roughness, float dotNH ) {\n\tfloat alpha = pow2( roughness );\n\tfloat invAlpha = 1.0 / alpha;\n\tfloat cos2h = dotNH * dotNH;\n\tfloat sin2h = max( 1.0 - cos2h, 0.0078125 );\n\treturn ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );\n}\nfloat V_Neubelt( float dotNV, float dotNL ) {\n\treturn saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );\n}\nvec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {\n\tvec3 halfDir = normalize( lightDir + viewDir );\n\tfloat dotNL = saturate( dot( normal, lightDir ) );\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\tfloat D = D_Charlie( sheenRoughness, dotNH );\n\tfloat V = V_Neubelt( dotNV, dotNL );\n\treturn sheenColor * ( D * V );\n}\n#endif",
      bumpmap_pars_fragment:
        "#ifdef USE_BUMPMAP\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\tvec2 dHdxy_fwd() {\n\t\tvec2 dSTdx = dFdx( vUv );\n\t\tvec2 dSTdy = dFdy( vUv );\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\t\treturn vec2( dBx, dBy );\n\t}\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {\n\t\tvec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );\n\t\tvec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\t\tfloat fDet = dot( vSigmaX, R1 ) * faceDirection;\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\t}\n#endif",
      clipping_planes_fragment:
        "#if NUM_CLIPPING_PLANES > 0\n\tvec4 plane;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n\t\tplane = clippingPlanes[ i ];\n\t\tif ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;\n\t}\n\t#pragma unroll_loop_end\n\t#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n\t\tbool clipped = true;\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n\t\t\tplane = clippingPlanes[ i ];\n\t\t\tclipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t\tif ( clipped ) discard;\n\t#endif\n#endif",
      clipping_planes_pars_fragment:
        "#if NUM_CLIPPING_PLANES > 0\n\tvarying vec3 vClipPosition;\n\tuniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif",
      clipping_planes_pars_vertex:
        "#if NUM_CLIPPING_PLANES > 0\n\tvarying vec3 vClipPosition;\n#endif",
      clipping_planes_vertex:
        "#if NUM_CLIPPING_PLANES > 0\n\tvClipPosition = - mvPosition.xyz;\n#endif",
      color_fragment:
        "#if defined( USE_COLOR_ALPHA )\n\tdiffuseColor *= vColor;\n#elif defined( USE_COLOR )\n\tdiffuseColor.rgb *= vColor;\n#endif",
      color_pars_fragment:
        "#if defined( USE_COLOR_ALPHA )\n\tvarying vec4 vColor;\n#elif defined( USE_COLOR )\n\tvarying vec3 vColor;\n#endif",
      color_pars_vertex:
        "#if defined( USE_COLOR_ALPHA )\n\tvarying vec4 vColor;\n#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n\tvarying vec3 vColor;\n#endif",
      color_vertex:
        "#if defined( USE_COLOR_ALPHA )\n\tvColor = vec4( 1.0 );\n#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n\tvColor = vec3( 1.0 );\n#endif\n#ifdef USE_COLOR\n\tvColor *= color;\n#endif\n#ifdef USE_INSTANCING_COLOR\n\tvColor.xyz *= instanceColor.xyz;\n#endif",
      common:
        "#define PI 3.141592653589793\n#define PI2 6.283185307179586\n#define PI_HALF 1.5707963267948966\n#define RECIPROCAL_PI 0.3183098861837907\n#define RECIPROCAL_PI2 0.15915494309189535\n#define EPSILON 1e-6\n#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\n#define whiteComplement( a ) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }\nfloat average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }\nhighp float rand( const in vec2 uv ) {\n\tconst highp float a = 12.9898, b = 78.233, c = 43758.5453;\n\thighp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n\treturn fract( sin( sn ) * c );\n}\n#ifdef HIGH_PRECISION\n\tfloat precisionSafeLength( vec3 v ) { return length( v ); }\n#else\n\tfloat precisionSafeLength( vec3 v ) {\n\t\tfloat maxComponent = max3( abs( v ) );\n\t\treturn length( v / maxComponent ) * maxComponent;\n\t}\n#endif\nstruct IncidentLight {\n\tvec3 color;\n\tvec3 direction;\n\tbool visible;\n};\nstruct ReflectedLight {\n\tvec3 directDiffuse;\n\tvec3 directSpecular;\n\tvec3 indirectDiffuse;\n\tvec3 indirectSpecular;\n};\nstruct GeometricContext {\n\tvec3 position;\n\tvec3 normal;\n\tvec3 viewDir;\n#ifdef USE_CLEARCOAT\n\tvec3 clearcoatNormal;\n#endif\n};\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nmat3 transposeMat3( const in mat3 m ) {\n\tmat3 tmp;\n\ttmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );\n\ttmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );\n\ttmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );\n\treturn tmp;\n}\nfloat linearToRelativeLuminance( const in vec3 color ) {\n\tvec3 weights = vec3( 0.2126, 0.7152, 0.0722 );\n\treturn dot( weights, color.rgb );\n}\nbool isPerspectiveMatrix( mat4 m ) {\n\treturn m[ 2 ][ 3 ] == - 1.0;\n}\nvec2 equirectUv( in vec3 dir ) {\n\tfloat u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;\n\tfloat v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\treturn vec2( u, v );\n}",
      cube_uv_reflection_fragment:
        "#ifdef ENVMAP_TYPE_CUBE_UV\n\t#define cubeUV_maxMipLevel 8.0\n\t#define cubeUV_minMipLevel 4.0\n\t#define cubeUV_maxTileSize 256.0\n\t#define cubeUV_minTileSize 16.0\n\tfloat getFace( vec3 direction ) {\n\t\tvec3 absDirection = abs( direction );\n\t\tfloat face = - 1.0;\n\t\tif ( absDirection.x > absDirection.z ) {\n\t\t\tif ( absDirection.x > absDirection.y )\n\t\t\t\tface = direction.x > 0.0 ? 0.0 : 3.0;\n\t\t\telse\n\t\t\t\tface = direction.y > 0.0 ? 1.0 : 4.0;\n\t\t} else {\n\t\t\tif ( absDirection.z > absDirection.y )\n\t\t\t\tface = direction.z > 0.0 ? 2.0 : 5.0;\n\t\t\telse\n\t\t\t\tface = direction.y > 0.0 ? 1.0 : 4.0;\n\t\t}\n\t\treturn face;\n\t}\n\tvec2 getUV( vec3 direction, float face ) {\n\t\tvec2 uv;\n\t\tif ( face == 0.0 ) {\n\t\t\tuv = vec2( direction.z, direction.y ) / abs( direction.x );\n\t\t} else if ( face == 1.0 ) {\n\t\t\tuv = vec2( - direction.x, - direction.z ) / abs( direction.y );\n\t\t} else if ( face == 2.0 ) {\n\t\t\tuv = vec2( - direction.x, direction.y ) / abs( direction.z );\n\t\t} else if ( face == 3.0 ) {\n\t\t\tuv = vec2( - direction.z, direction.y ) / abs( direction.x );\n\t\t} else if ( face == 4.0 ) {\n\t\t\tuv = vec2( - direction.x, direction.z ) / abs( direction.y );\n\t\t} else {\n\t\t\tuv = vec2( direction.x, direction.y ) / abs( direction.z );\n\t\t}\n\t\treturn 0.5 * ( uv + 1.0 );\n\t}\n\tvec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {\n\t\tfloat face = getFace( direction );\n\t\tfloat filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );\n\t\tmipInt = max( mipInt, cubeUV_minMipLevel );\n\t\tfloat faceSize = exp2( mipInt );\n\t\tfloat texelSize = 1.0 / ( 3.0 * cubeUV_maxTileSize );\n\t\tvec2 uv = getUV( direction, face ) * ( faceSize - 1.0 ) + 0.5;\n\t\tif ( face > 2.0 ) {\n\t\t\tuv.y += faceSize;\n\t\t\tface -= 3.0;\n\t\t}\n\t\tuv.x += face * faceSize;\n\t\tif ( mipInt < cubeUV_maxMipLevel ) {\n\t\t\tuv.y += 2.0 * cubeUV_maxTileSize;\n\t\t}\n\t\tuv.y += filterInt * 2.0 * cubeUV_minTileSize;\n\t\tuv.x += 3.0 * max( 0.0, cubeUV_maxTileSize - 2.0 * faceSize );\n\t\tuv *= texelSize;\n\t\treturn texture2D( envMap, uv ).rgb;\n\t}\n\t#define r0 1.0\n\t#define v0 0.339\n\t#define m0 - 2.0\n\t#define r1 0.8\n\t#define v1 0.276\n\t#define m1 - 1.0\n\t#define r4 0.4\n\t#define v4 0.046\n\t#define m4 2.0\n\t#define r5 0.305\n\t#define v5 0.016\n\t#define m5 3.0\n\t#define r6 0.21\n\t#define v6 0.0038\n\t#define m6 4.0\n\tfloat roughnessToMip( float roughness ) {\n\t\tfloat mip = 0.0;\n\t\tif ( roughness >= r1 ) {\n\t\t\tmip = ( r0 - roughness ) * ( m1 - m0 ) / ( r0 - r1 ) + m0;\n\t\t} else if ( roughness >= r4 ) {\n\t\t\tmip = ( r1 - roughness ) * ( m4 - m1 ) / ( r1 - r4 ) + m1;\n\t\t} else if ( roughness >= r5 ) {\n\t\t\tmip = ( r4 - roughness ) * ( m5 - m4 ) / ( r4 - r5 ) + m4;\n\t\t} else if ( roughness >= r6 ) {\n\t\t\tmip = ( r5 - roughness ) * ( m6 - m5 ) / ( r5 - r6 ) + m5;\n\t\t} else {\n\t\t\tmip = - 2.0 * log2( 1.16 * roughness );\t\t}\n\t\treturn mip;\n\t}\n\tvec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {\n\t\tfloat mip = clamp( roughnessToMip( roughness ), m0, cubeUV_maxMipLevel );\n\t\tfloat mipF = fract( mip );\n\t\tfloat mipInt = floor( mip );\n\t\tvec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );\n\t\tif ( mipF == 0.0 ) {\n\t\t\treturn vec4( color0, 1.0 );\n\t\t} else {\n\t\t\tvec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );\n\t\t\treturn vec4( mix( color0, color1, mipF ), 1.0 );\n\t\t}\n\t}\n#endif",
      defaultnormal_vertex:
        "vec3 transformedNormal = objectNormal;\n#ifdef USE_INSTANCING\n\tmat3 m = mat3( instanceMatrix );\n\ttransformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );\n\ttransformedNormal = m * transformedNormal;\n#endif\ntransformedNormal = normalMatrix * transformedNormal;\n#ifdef FLIP_SIDED\n\ttransformedNormal = - transformedNormal;\n#endif\n#ifdef USE_TANGENT\n\tvec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n\t#ifdef FLIP_SIDED\n\t\ttransformedTangent = - transformedTangent;\n\t#endif\n#endif",
      displacementmap_pars_vertex:
        "#ifdef USE_DISPLACEMENTMAP\n\tuniform sampler2D displacementMap;\n\tuniform float displacementScale;\n\tuniform float displacementBias;\n#endif",
      displacementmap_vertex:
        "#ifdef USE_DISPLACEMENTMAP\n\ttransformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );\n#endif",
      emissivemap_fragment:
        "#ifdef USE_EMISSIVEMAP\n\tvec4 emissiveColor = texture2D( emissiveMap, vUv );\n\temissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;\n\ttotalEmissiveRadiance *= emissiveColor.rgb;\n#endif",
      emissivemap_pars_fragment:
        "#ifdef USE_EMISSIVEMAP\n\tuniform sampler2D emissiveMap;\n#endif",
      encodings_fragment: "gl_FragColor = linearToOutputTexel( gl_FragColor );",
      encodings_pars_fragment:
        "vec4 LinearToLinear( in vec4 value ) {\n\treturn value;\n}\nvec4 sRGBToLinear( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );\n}\nvec4 LinearTosRGB( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );\n}",
      envmap_fragment:
        "#ifdef USE_ENVMAP\n\t#ifdef ENV_WORLDPOS\n\t\tvec3 cameraToFrag;\n\t\tif ( isOrthographic ) {\n\t\t\tcameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n\t\t} else {\n\t\t\tcameraToFrag = normalize( vWorldPosition - cameraPosition );\n\t\t}\n\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( cameraToFrag, worldNormal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );\n\t\t#endif\n\t#else\n\t\tvec3 reflectVec = vReflect;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\t\tenvColor = envMapTexelToLinear( envColor );\n\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\tvec4 envColor = textureCubeUV( envMap, reflectVec, 0.0 );\n\t#else\n\t\tvec4 envColor = vec4( 0.0 );\n\t#endif\n\t#ifdef ENVMAP_BLENDING_MULTIPLY\n\t\toutgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\t\toutgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\t\toutgoingLight += envColor.xyz * specularStrength * reflectivity;\n\t#endif\n#endif",
      envmap_common_pars_fragment:
        "#ifdef USE_ENVMAP\n\tuniform float envMapIntensity;\n\tuniform float flipEnvMap;\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tuniform samplerCube envMap;\n\t#else\n\t\tuniform sampler2D envMap;\n\t#endif\n\t\n#endif",
      envmap_pars_fragment:
        "#ifdef USE_ENVMAP\n\tuniform float reflectivity;\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\t\t#define ENV_WORLDPOS\n\t#endif\n\t#ifdef ENV_WORLDPOS\n\t\tvarying vec3 vWorldPosition;\n\t\tuniform float refractionRatio;\n\t#else\n\t\tvarying vec3 vReflect;\n\t#endif\n#endif",
      envmap_pars_vertex:
        "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) ||defined( PHONG )\n\t\t#define ENV_WORLDPOS\n\t#endif\n\t#ifdef ENV_WORLDPOS\n\t\t\n\t\tvarying vec3 vWorldPosition;\n\t#else\n\t\tvarying vec3 vReflect;\n\t\tuniform float refractionRatio;\n\t#endif\n#endif",
      envmap_physical_pars_fragment:
        "#if defined( USE_ENVMAP )\n\t#ifdef ENVMAP_MODE_REFRACTION\n\t\tuniform float refractionRatio;\n\t#endif\n\tvec3 getIBLIrradiance( const in vec3 normal ) {\n\t\t#if defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\t\t\tvec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );\n\t\t\treturn PI * envMapColor.rgb * envMapIntensity;\n\t\t#else\n\t\t\treturn vec3( 0.0 );\n\t\t#endif\n\t}\n\tvec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {\n\t\t#if defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 reflectVec;\n\t\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\t\treflectVec = reflect( - viewDir, normal );\n\t\t\t\treflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );\n\t\t\t#else\n\t\t\t\treflectVec = refract( - viewDir, normal, refractionRatio );\n\t\t\t#endif\n\t\t\treflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n\t\t\tvec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );\n\t\t\treturn envMapColor.rgb * envMapIntensity;\n\t\t#else\n\t\t\treturn vec3( 0.0 );\n\t\t#endif\n\t}\n#endif",
      envmap_vertex:
        "#ifdef USE_ENVMAP\n\t#ifdef ENV_WORLDPOS\n\t\tvWorldPosition = worldPosition.xyz;\n\t#else\n\t\tvec3 cameraToVertex;\n\t\tif ( isOrthographic ) {\n\t\t\tcameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n\t\t} else {\n\t\t\tcameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\t\t}\n\t\tvec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvReflect = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#endif\n#endif",
      fog_vertex: "#ifdef USE_FOG\n\tvFogDepth = - mvPosition.z;\n#endif",
      fog_pars_vertex: "#ifdef USE_FOG\n\tvarying float vFogDepth;\n#endif",
      fog_fragment:
        "#ifdef USE_FOG\n\t#ifdef FOG_EXP2\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );\n\t#else\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, vFogDepth );\n\t#endif\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif",
      fog_pars_fragment:
        "#ifdef USE_FOG\n\tuniform vec3 fogColor;\n\tvarying float vFogDepth;\n\t#ifdef FOG_EXP2\n\t\tuniform float fogDensity;\n\t#else\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n#endif",
      gradientmap_pars_fragment:
        "#ifdef USE_GRADIENTMAP\n\tuniform sampler2D gradientMap;\n#endif\nvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n\tfloat dotNL = dot( normal, lightDirection );\n\tvec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n\t#ifdef USE_GRADIENTMAP\n\t\treturn vec3( texture2D( gradientMap, coord ).r );\n\t#else\n\t\treturn ( coord.x < 0.7 ) ? vec3( 0.7 ) : vec3( 1.0 );\n\t#endif\n}",
      lightmap_fragment:
        "#ifdef USE_LIGHTMAP\n\tvec4 lightMapTexel = texture2D( lightMap, vUv2 );\n\tvec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;\n\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\tlightMapIrradiance *= PI;\n\t#endif\n\treflectedLight.indirectDiffuse += lightMapIrradiance;\n#endif",
      lightmap_pars_fragment:
        "#ifdef USE_LIGHTMAP\n\tuniform sampler2D lightMap;\n\tuniform float lightMapIntensity;\n#endif",
      lights_lambert_vertex:
        "vec3 diffuse = vec3( 1.0 );\nGeometricContext geometry;\ngeometry.position = mvPosition.xyz;\ngeometry.normal = normalize( transformedNormal );\ngeometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( -mvPosition.xyz );\nGeometricContext backGeometry;\nbackGeometry.position = geometry.position;\nbackGeometry.normal = -geometry.normal;\nbackGeometry.viewDir = geometry.viewDir;\nvLightFront = vec3( 0.0 );\nvIndirectFront = vec3( 0.0 );\n#ifdef DOUBLE_SIDED\n\tvLightBack = vec3( 0.0 );\n\tvIndirectBack = vec3( 0.0 );\n#endif\nIncidentLight directLight;\nfloat dotNL;\nvec3 directLightColor_Diffuse;\nvIndirectFront += getAmbientLightIrradiance( ambientLightColor );\nvIndirectFront += getLightProbeIrradiance( lightProbe, geometry.normal );\n#ifdef DOUBLE_SIDED\n\tvIndirectBack += getAmbientLightIrradiance( ambientLightColor );\n\tvIndirectBack += getLightProbeIrradiance( lightProbe, backGeometry.normal );\n#endif\n#if NUM_POINT_LIGHTS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tgetPointLightInfo( pointLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( - dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tgetSpotLightInfo( spotLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( - dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if NUM_DIR_LIGHTS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tgetDirectionalLightInfo( directionalLights[ i ], geometry, directLight );\n\t\tdotNL = dot( geometry.normal, directLight.direction );\n\t\tdirectLightColor_Diffuse = directLight.color;\n\t\tvLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvLightBack += saturate( - dotNL ) * directLightColor_Diffuse;\n\t\t#endif\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\tvIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );\n\t\t#ifdef DOUBLE_SIDED\n\t\t\tvIndirectBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry.normal );\n\t\t#endif\n\t}\n\t#pragma unroll_loop_end\n#endif",
      lights_pars_begin:
        "uniform bool receiveShadow;\nuniform vec3 ambientLightColor;\nuniform vec3 lightProbe[ 9 ];\nvec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {\n\tfloat x = normal.x, y = normal.y, z = normal.z;\n\tvec3 result = shCoefficients[ 0 ] * 0.886227;\n\tresult += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;\n\tresult += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;\n\tresult += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;\n\tresult += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;\n\tresult += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;\n\tresult += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );\n\tresult += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;\n\tresult += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );\n\treturn result;\n}\nvec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {\n\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\tvec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );\n\treturn irradiance;\n}\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n\tvec3 irradiance = ambientLightColor;\n\treturn irradiance;\n}\nfloat getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n\t#if defined ( PHYSICALLY_CORRECT_LIGHTS )\n\t\tfloat distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n\t\tif ( cutoffDistance > 0.0 ) {\n\t\t\tdistanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n\t\t}\n\t\treturn distanceFalloff;\n\t#else\n\t\tif ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {\n\t\t\treturn pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );\n\t\t}\n\t\treturn 1.0;\n\t#endif\n}\nfloat getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {\n\treturn smoothstep( coneCosine, penumbraCosine, angleCosine );\n}\n#if NUM_DIR_LIGHTS > 0\n\tstruct DirectionalLight {\n\t\tvec3 direction;\n\t\tvec3 color;\n\t};\n\tuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\tvoid getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {\n\t\tlight.color = directionalLight.color;\n\t\tlight.direction = directionalLight.direction;\n\t\tlight.visible = true;\n\t}\n#endif\n#if NUM_POINT_LIGHTS > 0\n\tstruct PointLight {\n\t\tvec3 position;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t};\n\tuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n\tvoid getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {\n\t\tvec3 lVector = pointLight.position - geometry.position;\n\t\tlight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tlight.color = pointLight.color;\n\t\tlight.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );\n\t\tlight.visible = ( light.color != vec3( 0.0 ) );\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tstruct SpotLight {\n\t\tvec3 position;\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tfloat coneCos;\n\t\tfloat penumbraCos;\n\t};\n\tuniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n\tvoid getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {\n\t\tvec3 lVector = spotLight.position - geometry.position;\n\t\tlight.direction = normalize( lVector );\n\t\tfloat angleCos = dot( light.direction, spotLight.direction );\n\t\tfloat spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n\t\tif ( spotAttenuation > 0.0 ) {\n\t\t\tfloat lightDistance = length( lVector );\n\t\t\tlight.color = spotLight.color * spotAttenuation;\n\t\t\tlight.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );\n\t\t\tlight.visible = ( light.color != vec3( 0.0 ) );\n\t\t} else {\n\t\t\tlight.color = vec3( 0.0 );\n\t\t\tlight.visible = false;\n\t\t}\n\t}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n\tstruct RectAreaLight {\n\t\tvec3 color;\n\t\tvec3 position;\n\t\tvec3 halfWidth;\n\t\tvec3 halfHeight;\n\t};\n\tuniform sampler2D ltc_1;\tuniform sampler2D ltc_2;\n\tuniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tstruct HemisphereLight {\n\t\tvec3 direction;\n\t\tvec3 skyColor;\n\t\tvec3 groundColor;\n\t};\n\tuniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n\tvec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {\n\t\tfloat dotNL = dot( normal, hemiLight.direction );\n\t\tfloat hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n\t\tvec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n\t\treturn irradiance;\n\t}\n#endif",
      lights_toon_fragment:
        "ToonMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;",
      lights_toon_pars_fragment:
        "varying vec3 vViewPosition;\nstruct ToonMaterial {\n\tvec3 diffuseColor;\n};\nvoid RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n\tvec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;\n\treflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct\t\t\t\tRE_Direct_Toon\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Toon\n#define Material_LightProbeLOD( material )\t(0)",
      lights_phong_fragment:
        "BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;",
      lights_phong_pars_fragment:
        "varying vec3 vViewPosition;\nstruct BlinnPhongMaterial {\n\tvec3 diffuseColor;\n\tvec3 specularColor;\n\tfloat specularShininess;\n\tfloat specularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\treflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n\treflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct\t\t\t\tRE_Direct_BlinnPhong\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_BlinnPhong\n#define Material_LightProbeLOD( material )\t(0)",
      lights_physical_fragment:
        "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nvec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\nmaterial.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;\nmaterial.roughness = min( material.roughness, 1.0 );\n#ifdef IOR\n\t#ifdef SPECULAR\n\t\tfloat specularIntensityFactor = specularIntensity;\n\t\tvec3 specularColorFactor = specularColor;\n\t\t#ifdef USE_SPECULARINTENSITYMAP\n\t\t\tspecularIntensityFactor *= texture2D( specularIntensityMap, vUv ).a;\n\t\t#endif\n\t\t#ifdef USE_SPECULARCOLORMAP\n\t\t\tspecularColorFactor *= specularColorMapTexelToLinear( texture2D( specularColorMap, vUv ) ).rgb;\n\t\t#endif\n\t\tmaterial.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );\n\t#else\n\t\tfloat specularIntensityFactor = 1.0;\n\t\tvec3 specularColorFactor = vec3( 1.0 );\n\t\tmaterial.specularF90 = 1.0;\n\t#endif\n\tmaterial.specularColor = mix( min( pow2( ( ior - 1.0 ) / ( ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );\n#else\n\tmaterial.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );\n\tmaterial.specularF90 = 1.0;\n#endif\n#ifdef USE_CLEARCOAT\n\tmaterial.clearcoat = clearcoat;\n\tmaterial.clearcoatRoughness = clearcoatRoughness;\n\tmaterial.clearcoatF0 = vec3( 0.04 );\n\tmaterial.clearcoatF90 = 1.0;\n\t#ifdef USE_CLEARCOATMAP\n\t\tmaterial.clearcoat *= texture2D( clearcoatMap, vUv ).x;\n\t#endif\n\t#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\t\tmaterial.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;\n\t#endif\n\tmaterial.clearcoat = saturate( material.clearcoat );\tmaterial.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );\n\tmaterial.clearcoatRoughness += geometryRoughness;\n\tmaterial.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\n#endif\n#ifdef USE_SHEEN\n\tmaterial.sheenColor = sheenColor;\n\t#ifdef USE_SHEENCOLORMAP\n\t\tmaterial.sheenColor *= sheenColorMapTexelToLinear( texture2D( sheenColorMap, vUv ) ).rgb;\n\t#endif\n\tmaterial.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );\n\t#ifdef USE_SHEENROUGHNESSMAP\n\t\tmaterial.sheenRoughness *= texture2D( sheenRoughnessMap, vUv ).a;\n\t#endif\n#endif",
      lights_physical_pars_fragment:
        "struct PhysicalMaterial {\n\tvec3 diffuseColor;\n\tfloat roughness;\n\tvec3 specularColor;\n\tfloat specularF90;\n\t#ifdef USE_CLEARCOAT\n\t\tfloat clearcoat;\n\t\tfloat clearcoatRoughness;\n\t\tvec3 clearcoatF0;\n\t\tfloat clearcoatF90;\n\t#endif\n\t#ifdef USE_SHEEN\n\t\tvec3 sheenColor;\n\t\tfloat sheenRoughness;\n\t#endif\n};\nvec3 clearcoatSpecular = vec3( 0.0 );\nvec3 sheenSpecular = vec3( 0.0 );\nfloat IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness) {\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tfloat r2 = roughness * roughness;\n\tfloat a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;\n\tfloat b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;\n\tfloat DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );\n\treturn saturate( DG * RECIPROCAL_PI );\n}\nvec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tconst vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n\tconst vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n\tvec4 r = roughness * c0 + c1;\n\tfloat a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n\tvec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;\n\treturn fab;\n}\nvec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {\n\tvec2 fab = DFGApprox( normal, viewDir, roughness );\n\treturn specularColor * fab.x + specularF90 * fab.y;\n}\nvoid computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {\n\tvec2 fab = DFGApprox( normal, viewDir, roughness );\n\tvec3 FssEss = specularColor * fab.x + specularF90 * fab.y;\n\tfloat Ess = fab.x + fab.y;\n\tfloat Ems = 1.0 - Ess;\n\tvec3 Favg = specularColor + ( 1.0 - specularColor ) * 0.047619;\tvec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );\n\tsingleScatter += FssEss;\n\tmultiScatter += Fms * Ems;\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n\tvoid RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t\tvec3 normal = geometry.normal;\n\t\tvec3 viewDir = geometry.viewDir;\n\t\tvec3 position = geometry.position;\n\t\tvec3 lightPos = rectAreaLight.position;\n\t\tvec3 halfWidth = rectAreaLight.halfWidth;\n\t\tvec3 halfHeight = rectAreaLight.halfHeight;\n\t\tvec3 lightColor = rectAreaLight.color;\n\t\tfloat roughness = material.roughness;\n\t\tvec3 rectCoords[ 4 ];\n\t\trectCoords[ 0 ] = lightPos + halfWidth - halfHeight;\t\trectCoords[ 1 ] = lightPos - halfWidth - halfHeight;\n\t\trectCoords[ 2 ] = lightPos - halfWidth + halfHeight;\n\t\trectCoords[ 3 ] = lightPos + halfWidth + halfHeight;\n\t\tvec2 uv = LTC_Uv( normal, viewDir, roughness );\n\t\tvec4 t1 = texture2D( ltc_1, uv );\n\t\tvec4 t2 = texture2D( ltc_2, uv );\n\t\tmat3 mInv = mat3(\n\t\t\tvec3( t1.x, 0, t1.y ),\n\t\t\tvec3(    0, 1,    0 ),\n\t\t\tvec3( t1.z, 0, t1.w )\n\t\t);\n\t\tvec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );\n\t\treflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n\t\treflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );\n\t}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\t#ifdef USE_CLEARCOAT\n\t\tfloat dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );\n\t\tvec3 ccIrradiance = dotNLcc * directLight.color;\n\t\tclearcoatSpecular += ccIrradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );\n\t#endif\n\t#ifdef USE_SHEEN\n\t\tsheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );\n\t#endif\n\treflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.roughness );\n\treflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {\n\t#ifdef USE_CLEARCOAT\n\t\tclearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );\n\t#endif\n\t#ifdef USE_SHEEN\n\t\tsheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );\n\t#endif\n\tvec3 singleScattering = vec3( 0.0 );\n\tvec3 multiScattering = vec3( 0.0 );\n\tvec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;\n\tcomputeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );\n\tvec3 diffuse = material.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );\n\treflectedLight.indirectSpecular += radiance * singleScattering;\n\treflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;\n\treflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;\n}\n#define RE_Direct\t\t\t\tRE_Direct_Physical\n#define RE_Direct_RectArea\t\tRE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular\t\tRE_IndirectSpecular_Physical\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n\treturn saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}",
      lights_fragment_begin:
        "\nGeometricContext geometry;\ngeometry.position = - vViewPosition;\ngeometry.normal = normal;\ngeometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\n#ifdef USE_CLEARCOAT\n\tgeometry.clearcoatNormal = clearcoatNormal;\n#endif\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\tPointLight pointLight;\n\t#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n\tPointLightShadow pointLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tgetPointLightInfo( pointLight, geometry, directLight );\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )\n\t\tpointLightShadow = pointLightShadows[ i ];\n\t\tdirectLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\tSpotLight spotLight;\n\t#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n\tSpotLightShadow spotLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tgetSpotLightInfo( spotLight, geometry, directLight );\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n\t\tspotLightShadow = spotLightShadows[ i ];\n\t\tdirectLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\tDirectionalLight directionalLight;\n\t#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n\tDirectionalLightShadow directionalLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tgetDirectionalLightInfo( directionalLight, geometry, directLight );\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n\t\tdirectionalLightShadow = directionalLightShadows[ i ];\n\t\tdirectLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\tRectAreaLight rectAreaLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\t\trectAreaLight = rectAreaLights[ i ];\n\t\tRE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if defined( RE_IndirectDiffuse )\n\tvec3 iblIrradiance = vec3( 0.0 );\n\tvec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\tirradiance += getLightProbeIrradiance( lightProbe, geometry.normal );\n\t#if ( NUM_HEMI_LIGHTS > 0 )\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\t\tirradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n#endif\n#if defined( RE_IndirectSpecular )\n\tvec3 radiance = vec3( 0.0 );\n\tvec3 clearcoatRadiance = vec3( 0.0 );\n#endif",
      lights_fragment_maps:
        "#if defined( RE_IndirectDiffuse )\n\t#ifdef USE_LIGHTMAP\n\t\tvec4 lightMapTexel = texture2D( lightMap, vUv2 );\n\t\tvec3 lightMapIrradiance = lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;\n\t\t#ifndef PHYSICALLY_CORRECT_LIGHTS\n\t\t\tlightMapIrradiance *= PI;\n\t\t#endif\n\t\tirradiance += lightMapIrradiance;\n\t#endif\n\t#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )\n\t\tiblIrradiance += getIBLIrradiance( geometry.normal );\n\t#endif\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n\tradiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );\n\t#ifdef USE_CLEARCOAT\n\t\tclearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );\n\t#endif\n#endif",
      lights_fragment_end:
        "#if defined( RE_IndirectDiffuse )\n\tRE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );\n#endif\n#if defined( RE_IndirectSpecular )\n\tRE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );\n#endif",
      logdepthbuf_fragment:
        "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tgl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif",
      logdepthbuf_pars_fragment:
        "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tuniform float logDepthBufFC;\n\tvarying float vFragDepth;\n\tvarying float vIsPerspective;\n#endif",
      logdepthbuf_pars_vertex:
        "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t\tvarying float vIsPerspective;\n\t#else\n\t\tuniform float logDepthBufFC;\n\t#endif\n#endif",
      logdepthbuf_vertex:
        "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvFragDepth = 1.0 + gl_Position.w;\n\t\tvIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );\n\t#else\n\t\tif ( isPerspectiveMatrix( projectionMatrix ) ) {\n\t\t\tgl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;\n\t\t\tgl_Position.z *= gl_Position.w;\n\t\t}\n\t#endif\n#endif",
      map_fragment:
        "#ifdef USE_MAP\n\tvec4 texelColor = texture2D( map, vUv );\n\ttexelColor = mapTexelToLinear( texelColor );\n\tdiffuseColor *= texelColor;\n#endif",
      map_pars_fragment: "#ifdef USE_MAP\n\tuniform sampler2D map;\n#endif",
      map_particle_fragment:
        "#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n\tvec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;\n#endif\n#ifdef USE_MAP\n\tvec4 mapTexel = texture2D( map, uv );\n\tdiffuseColor *= mapTexelToLinear( mapTexel );\n#endif\n#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, uv ).g;\n#endif",
      map_particle_pars_fragment:
        "#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n\tuniform mat3 uvTransform;\n#endif\n#ifdef USE_MAP\n\tuniform sampler2D map;\n#endif\n#ifdef USE_ALPHAMAP\n\tuniform sampler2D alphaMap;\n#endif",
      metalnessmap_fragment:
        "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n\tvec4 texelMetalness = texture2D( metalnessMap, vUv );\n\tmetalnessFactor *= texelMetalness.b;\n#endif",
      metalnessmap_pars_fragment:
        "#ifdef USE_METALNESSMAP\n\tuniform sampler2D metalnessMap;\n#endif",
      morphnormal_vertex:
        "#ifdef USE_MORPHNORMALS\n\tobjectNormal *= morphTargetBaseInfluence;\n\t#ifdef MORPHTARGETS_TEXTURE\n\t\tfor ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n\t\t\tif ( morphTargetInfluences[ i ] > 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1, 2 ) * morphTargetInfluences[ i ];\n\t\t}\n\t#else\n\t\tobjectNormal += morphNormal0 * morphTargetInfluences[ 0 ];\n\t\tobjectNormal += morphNormal1 * morphTargetInfluences[ 1 ];\n\t\tobjectNormal += morphNormal2 * morphTargetInfluences[ 2 ];\n\t\tobjectNormal += morphNormal3 * morphTargetInfluences[ 3 ];\n\t#endif\n#endif",
      morphtarget_pars_vertex:
        "#ifdef USE_MORPHTARGETS\n\tuniform float morphTargetBaseInfluence;\n\t#ifdef MORPHTARGETS_TEXTURE\n\t\tuniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n\t\tuniform sampler2DArray morphTargetsTexture;\n\t\tuniform vec2 morphTargetsTextureSize;\n\t\tvec3 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset, const in int stride ) {\n\t\t\tfloat texelIndex = float( vertexIndex * stride + offset );\n\t\t\tfloat y = floor( texelIndex / morphTargetsTextureSize.x );\n\t\t\tfloat x = texelIndex - y * morphTargetsTextureSize.x;\n\t\t\tvec3 morphUV = vec3( ( x + 0.5 ) / morphTargetsTextureSize.x, y / morphTargetsTextureSize.y, morphTargetIndex );\n\t\t\treturn texture( morphTargetsTexture, morphUV ).xyz;\n\t\t}\n\t#else\n\t\t#ifndef USE_MORPHNORMALS\n\t\t\tuniform float morphTargetInfluences[ 8 ];\n\t\t#else\n\t\t\tuniform float morphTargetInfluences[ 4 ];\n\t\t#endif\n\t#endif\n#endif",
      morphtarget_vertex:
        "#ifdef USE_MORPHTARGETS\n\ttransformed *= morphTargetBaseInfluence;\n\t#ifdef MORPHTARGETS_TEXTURE\n\t\tfor ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n\t\t\t#ifndef USE_MORPHNORMALS\n\t\t\t\tif ( morphTargetInfluences[ i ] > 0.0 ) transformed += getMorph( gl_VertexID, i, 0, 1 ) * morphTargetInfluences[ i ];\n\t\t\t#else\n\t\t\t\tif ( morphTargetInfluences[ i ] > 0.0 ) transformed += getMorph( gl_VertexID, i, 0, 2 ) * morphTargetInfluences[ i ];\n\t\t\t#endif\n\t\t}\n\t#else\n\t\ttransformed += morphTarget0 * morphTargetInfluences[ 0 ];\n\t\ttransformed += morphTarget1 * morphTargetInfluences[ 1 ];\n\t\ttransformed += morphTarget2 * morphTargetInfluences[ 2 ];\n\t\ttransformed += morphTarget3 * morphTargetInfluences[ 3 ];\n\t\t#ifndef USE_MORPHNORMALS\n\t\t\ttransformed += morphTarget4 * morphTargetInfluences[ 4 ];\n\t\t\ttransformed += morphTarget5 * morphTargetInfluences[ 5 ];\n\t\t\ttransformed += morphTarget6 * morphTargetInfluences[ 6 ];\n\t\t\ttransformed += morphTarget7 * morphTargetInfluences[ 7 ];\n\t\t#endif\n\t#endif\n#endif",
      normal_fragment_begin:
        "float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;\n#ifdef FLAT_SHADED\n\tvec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );\n\tvec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n#else\n\tvec3 normal = normalize( vNormal );\n\t#ifdef DOUBLE_SIDED\n\t\tnormal = normal * faceDirection;\n\t#endif\n\t#ifdef USE_TANGENT\n\t\tvec3 tangent = normalize( vTangent );\n\t\tvec3 bitangent = normalize( vBitangent );\n\t\t#ifdef DOUBLE_SIDED\n\t\t\ttangent = tangent * faceDirection;\n\t\t\tbitangent = bitangent * faceDirection;\n\t\t#endif\n\t\t#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )\n\t\t\tmat3 vTBN = mat3( tangent, bitangent, normal );\n\t\t#endif\n\t#endif\n#endif\nvec3 geometryNormal = normal;",
      normal_fragment_maps:
        "#ifdef OBJECTSPACE_NORMALMAP\n\tnormal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\t#ifdef FLIP_SIDED\n\t\tnormal = - normal;\n\t#endif\n\t#ifdef DOUBLE_SIDED\n\t\tnormal = normal * faceDirection;\n\t#endif\n\tnormal = normalize( normalMatrix * normal );\n#elif defined( TANGENTSPACE_NORMALMAP )\n\tvec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n\tmapN.xy *= normalScale;\n\t#ifdef USE_TANGENT\n\t\tnormal = normalize( vTBN * mapN );\n\t#else\n\t\tnormal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );\n\t#endif\n#elif defined( USE_BUMPMAP )\n\tnormal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );\n#endif",
      normal_pars_fragment:
        "#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n\t#ifdef USE_TANGENT\n\t\tvarying vec3 vTangent;\n\t\tvarying vec3 vBitangent;\n\t#endif\n#endif",
      normal_pars_vertex:
        "#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n\t#ifdef USE_TANGENT\n\t\tvarying vec3 vTangent;\n\t\tvarying vec3 vBitangent;\n\t#endif\n#endif",
      normal_vertex:
        "#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n\t#ifdef USE_TANGENT\n\t\tvTangent = normalize( transformedTangent );\n\t\tvBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );\n\t#endif\n#endif",
      normalmap_pars_fragment:
        "#ifdef USE_NORMALMAP\n\tuniform sampler2D normalMap;\n\tuniform vec2 normalScale;\n#endif\n#ifdef OBJECTSPACE_NORMALMAP\n\tuniform mat3 normalMatrix;\n#endif\n#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )\n\tvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {\n\t\tvec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n\t\tvec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n\t\tvec2 st0 = dFdx( vUv.st );\n\t\tvec2 st1 = dFdy( vUv.st );\n\t\tvec3 N = surf_norm;\n\t\tvec3 q1perp = cross( q1, N );\n\t\tvec3 q0perp = cross( N, q0 );\n\t\tvec3 T = q1perp * st0.x + q0perp * st1.x;\n\t\tvec3 B = q1perp * st0.y + q0perp * st1.y;\n\t\tfloat det = max( dot( T, T ), dot( B, B ) );\n\t\tfloat scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );\n\t\treturn normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );\n\t}\n#endif",
      clearcoat_normal_fragment_begin:
        "#ifdef USE_CLEARCOAT\n\tvec3 clearcoatNormal = geometryNormal;\n#endif",
      clearcoat_normal_fragment_maps:
        "#ifdef USE_CLEARCOAT_NORMALMAP\n\tvec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;\n\tclearcoatMapN.xy *= clearcoatNormalScale;\n\t#ifdef USE_TANGENT\n\t\tclearcoatNormal = normalize( vTBN * clearcoatMapN );\n\t#else\n\t\tclearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );\n\t#endif\n#endif",
      clearcoat_pars_fragment:
        "#ifdef USE_CLEARCOATMAP\n\tuniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\tuniform sampler2D clearcoatRoughnessMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tuniform sampler2D clearcoatNormalMap;\n\tuniform vec2 clearcoatNormalScale;\n#endif",
      output_fragment:
        "#ifdef OPAQUE\ndiffuseColor.a = 1.0;\n#endif\n#ifdef USE_TRANSMISSION\ndiffuseColor.a *= transmissionAlpha + 0.1;\n#endif\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );",
      packing:
        "vec3 packNormalToRGB( const in vec3 normal ) {\n\treturn normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n\treturn 2.0 * rgb.xyz - 1.0;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n\tvec4 r = vec4( fract( v * PackFactors ), v );\n\tr.yzw -= r.xyz * ShiftRight8;\treturn r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n\treturn dot( v, UnpackFactors );\n}\nvec4 pack2HalfToRGBA( vec2 v ) {\n\tvec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );\n\treturn vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );\n}\nvec2 unpackRGBATo2Half( vec4 v ) {\n\treturn vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {\n\treturn linearClipZ * ( near - far ) - near;\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {\n\treturn ( near * far ) / ( ( far - near ) * invClipZ - far );\n}",
      premultiplied_alpha_fragment:
        "#ifdef PREMULTIPLIED_ALPHA\n\tgl_FragColor.rgb *= gl_FragColor.a;\n#endif",
      project_vertex:
        "vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_INSTANCING\n\tmvPosition = instanceMatrix * mvPosition;\n#endif\nmvPosition = modelViewMatrix * mvPosition;\ngl_Position = projectionMatrix * mvPosition;",
      dithering_fragment:
        "#ifdef DITHERING\n\tgl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif",
      dithering_pars_fragment:
        "#ifdef DITHERING\n\tvec3 dithering( vec3 color ) {\n\t\tfloat grid_position = rand( gl_FragCoord.xy );\n\t\tvec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n\t\tdither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n\t\treturn color + dither_shift_RGB;\n\t}\n#endif",
      roughnessmap_fragment:
        "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n\tvec4 texelRoughness = texture2D( roughnessMap, vUv );\n\troughnessFactor *= texelRoughness.g;\n#endif",
      roughnessmap_pars_fragment:
        "#ifdef USE_ROUGHNESSMAP\n\tuniform sampler2D roughnessMap;\n#endif",
      shadowmap_pars_fragment:
        "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tstruct DirectionalLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tstruct SpotLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tstruct PointLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n\t#endif\n\tfloat texture2DCompare( sampler2D depths, vec2 uv, float compare ) {\n\t\treturn step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\n\t}\n\tvec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {\n\t\treturn unpackRGBATo2Half( texture2D( shadow, uv ) );\n\t}\n\tfloat VSMShadow (sampler2D shadow, vec2 uv, float compare ){\n\t\tfloat occlusion = 1.0;\n\t\tvec2 distribution = texture2DDistribution( shadow, uv );\n\t\tfloat hard_shadow = step( compare , distribution.x );\n\t\tif (hard_shadow != 1.0 ) {\n\t\t\tfloat distance = compare - distribution.x ;\n\t\t\tfloat variance = max( 0.00000, distribution.y * distribution.y );\n\t\t\tfloat softness_probability = variance / (variance + distance * distance );\t\t\tsoftness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );\t\t\tocclusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );\n\t\t}\n\t\treturn occlusion;\n\t}\n\tfloat getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n\t\tfloat shadow = 1.0;\n\t\tshadowCoord.xyz /= shadowCoord.w;\n\t\tshadowCoord.z += shadowBias;\n\t\tbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n\t\tbool inFrustum = all( inFrustumVec );\n\t\tbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\t\tbool frustumTest = all( frustumTestVec );\n\t\tif ( frustumTest ) {\n\t\t#if defined( SHADOWMAP_TYPE_PCF )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tfloat dx2 = dx0 / 2.0;\n\t\t\tfloat dy2 = dy0 / 2.0;\n\t\t\tfloat dx3 = dx1 / 2.0;\n\t\t\tfloat dy3 = dy1 / 2.0;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 17.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx = texelSize.x;\n\t\t\tfloat dy = texelSize.y;\n\t\t\tvec2 uv = shadowCoord.xy;\n\t\t\tvec2 f = fract( uv * shadowMapSize + 0.5 );\n\t\t\tuv -= f * texelSize;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, uv, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ), \n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),\n\t\t\t\t\t f.x ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ), \n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),\n\t\t\t\t\t f.x ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ), \n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t f.y ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ), \n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t f.y ) +\n\t\t\t\tmix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ), \n\t\t\t\t\t\t  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),\n\t\t\t\t\t\t  f.x ),\n\t\t\t\t\t mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ), \n\t\t\t\t\t\t  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t\t  f.x ),\n\t\t\t\t\t f.y )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_VSM )\n\t\t\tshadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#else\n\t\t\tshadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#endif\n\t\t}\n\t\treturn shadow;\n\t}\n\tvec2 cubeToUV( vec3 v, float texelSizeY ) {\n\t\tvec3 absV = abs( v );\n\t\tfloat scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n\t\tabsV *= scaleToCube;\n\t\tv *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n\t\tvec2 planar = v.xy;\n\t\tfloat almostATexel = 1.5 * texelSizeY;\n\t\tfloat almostOne = 1.0 - almostATexel;\n\t\tif ( absV.z >= almostOne ) {\n\t\t\tif ( v.z > 0.0 )\n\t\t\t\tplanar.x = 4.0 - v.x;\n\t\t} else if ( absV.x >= almostOne ) {\n\t\t\tfloat signX = sign( v.x );\n\t\t\tplanar.x = v.z * signX + 2.0 * signX;\n\t\t} else if ( absV.y >= almostOne ) {\n\t\t\tfloat signY = sign( v.y );\n\t\t\tplanar.x = v.x + 2.0 * signY + 2.0;\n\t\t\tplanar.y = v.z * signY - 2.0;\n\t\t}\n\t\treturn vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n\t}\n\tfloat getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n\t\tvec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\n\t\tvec3 lightToPosition = shadowCoord.xyz;\n\t\tfloat dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );\t\tdp += shadowBias;\n\t\tvec3 bd3D = normalize( lightToPosition );\n\t\t#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )\n\t\t\tvec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\n\t\t\treturn (\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\treturn texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\n\t\t#endif\n\t}\n#endif",
      shadowmap_pars_vertex:
        "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t\tuniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tstruct DirectionalLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\t\tuniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tstruct SpotLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t\tuniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tstruct PointLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n\t#endif\n#endif",
      shadowmap_vertex:
        "#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SPOT_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0\n\t\tvec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\t\tvec4 shadowWorldPosition;\n\t#endif\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n\t\tshadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );\n\t\tvDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n\t\tshadowWorldPosition = worldPosition + vec4( shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias, 0 );\n\t\tvSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * shadowWorldPosition;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n\t\tshadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );\n\t\tvPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n#endif",
      shadowmask_pars_fragment:
        "float getShadowMask() {\n\tfloat shadow = 1.0;\n\t#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\tDirectionalLightShadow directionalLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n\t\tdirectionalLight = directionalLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\tSpotLightShadow spotLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n\t\tspotLight = spotLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\tPointLightShadow pointLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n\t\tpointLight = pointLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#endif\n\treturn shadow;\n}",
      skinbase_vertex:
        "#ifdef USE_SKINNING\n\tmat4 boneMatX = getBoneMatrix( skinIndex.x );\n\tmat4 boneMatY = getBoneMatrix( skinIndex.y );\n\tmat4 boneMatZ = getBoneMatrix( skinIndex.z );\n\tmat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif",
      skinning_pars_vertex:
        "#ifdef USE_SKINNING\n\tuniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n\t#ifdef BONE_TEXTURE\n\t\tuniform highp sampler2D boneTexture;\n\t\tuniform int boneTextureSize;\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tfloat j = i * 4.0;\n\t\t\tfloat x = mod( j, float( boneTextureSize ) );\n\t\t\tfloat y = floor( j / float( boneTextureSize ) );\n\t\t\tfloat dx = 1.0 / float( boneTextureSize );\n\t\t\tfloat dy = 1.0 / float( boneTextureSize );\n\t\t\ty = dy * ( y + 0.5 );\n\t\t\tvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n\t\t\tvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n\t\t\tvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n\t\t\tvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\t\t\tmat4 bone = mat4( v1, v2, v3, v4 );\n\t\t\treturn bone;\n\t\t}\n\t#else\n\t\tuniform mat4 boneMatrices[ MAX_BONES ];\n\t\tmat4 getBoneMatrix( const in float i ) {\n\t\t\tmat4 bone = boneMatrices[ int(i) ];\n\t\t\treturn bone;\n\t\t}\n\t#endif\n#endif",
      skinning_vertex:
        "#ifdef USE_SKINNING\n\tvec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n\tvec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\ttransformed = ( bindMatrixInverse * skinned ).xyz;\n#endif",
      skinnormal_vertex:
        "#ifdef USE_SKINNING\n\tmat4 skinMatrix = mat4( 0.0 );\n\tskinMatrix += skinWeight.x * boneMatX;\n\tskinMatrix += skinWeight.y * boneMatY;\n\tskinMatrix += skinWeight.z * boneMatZ;\n\tskinMatrix += skinWeight.w * boneMatW;\n\tskinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n\tobjectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n\t#ifdef USE_TANGENT\n\t\tobjectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n\t#endif\n#endif",
      specularmap_fragment:
        "float specularStrength;\n#ifdef USE_SPECULARMAP\n\tvec4 texelSpecular = texture2D( specularMap, vUv );\n\tspecularStrength = texelSpecular.r;\n#else\n\tspecularStrength = 1.0;\n#endif",
      specularmap_pars_fragment:
        "#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif",
      tonemapping_fragment:
        "#if defined( TONE_MAPPING )\n\tgl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif",
      tonemapping_pars_fragment:
        "#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\nuniform float toneMappingExposure;\nvec3 LinearToneMapping( vec3 color ) {\n\treturn toneMappingExposure * color;\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( color / ( vec3( 1.0 ) + color ) );\n}\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\tcolor = max( vec3( 0.0 ), color - 0.004 );\n\treturn pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\nvec3 RRTAndODTFit( vec3 v ) {\n\tvec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n\tvec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n\treturn a / b;\n}\nvec3 ACESFilmicToneMapping( vec3 color ) {\n\tconst mat3 ACESInputMat = mat3(\n\t\tvec3( 0.59719, 0.07600, 0.02840 ),\t\tvec3( 0.35458, 0.90834, 0.13383 ),\n\t\tvec3( 0.04823, 0.01566, 0.83777 )\n\t);\n\tconst mat3 ACESOutputMat = mat3(\n\t\tvec3(  1.60475, -0.10208, -0.00327 ),\t\tvec3( -0.53108,  1.10813, -0.07276 ),\n\t\tvec3( -0.07367, -0.00605,  1.07602 )\n\t);\n\tcolor *= toneMappingExposure / 0.6;\n\tcolor = ACESInputMat * color;\n\tcolor = RRTAndODTFit( color );\n\tcolor = ACESOutputMat * color;\n\treturn saturate( color );\n}\nvec3 CustomToneMapping( vec3 color ) { return color; }",
      transmission_fragment:
        "#ifdef USE_TRANSMISSION\n\tfloat transmissionAlpha = 1.0;\n\tfloat transmissionFactor = transmission;\n\tfloat thicknessFactor = thickness;\n\t#ifdef USE_TRANSMISSIONMAP\n\t\ttransmissionFactor *= texture2D( transmissionMap, vUv ).r;\n\t#endif\n\t#ifdef USE_THICKNESSMAP\n\t\tthicknessFactor *= texture2D( thicknessMap, vUv ).g;\n\t#endif\n\tvec3 pos = vWorldPosition;\n\tvec3 v = normalize( cameraPosition - pos );\n\tvec3 n = inverseTransformDirection( normal, viewMatrix );\n\tvec4 transmission = getIBLVolumeRefraction(\n\t\tn, v, roughnessFactor, material.diffuseColor, material.specularColor, material.specularF90,\n\t\tpos, modelMatrix, viewMatrix, projectionMatrix, ior, thicknessFactor,\n\t\tattenuationColor, attenuationDistance );\n\ttotalDiffuse = mix( totalDiffuse, transmission.rgb, transmissionFactor );\n\ttransmissionAlpha = mix( transmissionAlpha, transmission.a, transmissionFactor );\n#endif",
      transmission_pars_fragment:
        "#ifdef USE_TRANSMISSION\n\tuniform float transmission;\n\tuniform float thickness;\n\tuniform float attenuationDistance;\n\tuniform vec3 attenuationColor;\n\t#ifdef USE_TRANSMISSIONMAP\n\t\tuniform sampler2D transmissionMap;\n\t#endif\n\t#ifdef USE_THICKNESSMAP\n\t\tuniform sampler2D thicknessMap;\n\t#endif\n\tuniform vec2 transmissionSamplerSize;\n\tuniform sampler2D transmissionSamplerMap;\n\tuniform mat4 modelMatrix;\n\tuniform mat4 projectionMatrix;\n\tvarying vec3 vWorldPosition;\n\tvec3 getVolumeTransmissionRay( vec3 n, vec3 v, float thickness, float ior, mat4 modelMatrix ) {\n\t\tvec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );\n\t\tvec3 modelScale;\n\t\tmodelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );\n\t\tmodelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );\n\t\tmodelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );\n\t\treturn normalize( refractionVector ) * thickness * modelScale;\n\t}\n\tfloat applyIorToRoughness( float roughness, float ior ) {\n\t\treturn roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );\n\t}\n\tvec4 getTransmissionSample( vec2 fragCoord, float roughness, float ior ) {\n\t\tfloat framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );\n\t\t#ifdef TEXTURE_LOD_EXT\n\t\t\treturn texture2DLodEXT( transmissionSamplerMap, fragCoord.xy, framebufferLod );\n\t\t#else\n\t\t\treturn texture2D( transmissionSamplerMap, fragCoord.xy, framebufferLod );\n\t\t#endif\n\t}\n\tvec3 applyVolumeAttenuation( vec3 radiance, float transmissionDistance, vec3 attenuationColor, float attenuationDistance ) {\n\t\tif ( attenuationDistance == 0.0 ) {\n\t\t\treturn radiance;\n\t\t} else {\n\t\t\tvec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;\n\t\t\tvec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );\t\t\treturn transmittance * radiance;\n\t\t}\n\t}\n\tvec4 getIBLVolumeRefraction( vec3 n, vec3 v, float roughness, vec3 diffuseColor, vec3 specularColor, float specularF90,\n\t\tvec3 position, mat4 modelMatrix, mat4 viewMatrix, mat4 projMatrix, float ior, float thickness,\n\t\tvec3 attenuationColor, float attenuationDistance ) {\n\t\tvec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );\n\t\tvec3 refractedRayExit = position + transmissionRay;\n\t\tvec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n\t\tvec2 refractionCoords = ndcPos.xy / ndcPos.w;\n\t\trefractionCoords += 1.0;\n\t\trefractionCoords /= 2.0;\n\t\tvec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );\n\t\tvec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );\n\t\tvec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );\n\t\treturn vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );\n\t}\n#endif",
      uv_pars_fragment:
        "#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )\n\tvarying vec2 vUv;\n#endif",
      uv_pars_vertex:
        "#ifdef USE_UV\n\t#ifdef UVS_VERTEX_ONLY\n\t\tvec2 vUv;\n\t#else\n\t\tvarying vec2 vUv;\n\t#endif\n\tuniform mat3 uvTransform;\n#endif",
      uv_vertex:
        "#ifdef USE_UV\n\tvUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n#endif",
      uv2_pars_fragment:
        "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvarying vec2 vUv2;\n#endif",
      uv2_pars_vertex:
        "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tattribute vec2 uv2;\n\tvarying vec2 vUv2;\n\tuniform mat3 uv2Transform;\n#endif",
      uv2_vertex:
        "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n\tvUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;\n#endif",
      worldpos_vertex:
        "#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION )\n\tvec4 worldPosition = vec4( transformed, 1.0 );\n\t#ifdef USE_INSTANCING\n\t\tworldPosition = instanceMatrix * worldPosition;\n\t#endif\n\tworldPosition = modelMatrix * worldPosition;\n#endif",
      background_vert:
        "varying vec2 vUv;\nuniform mat3 uvTransform;\nvoid main() {\n\tvUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n\tgl_Position = vec4( position.xy, 1.0, 1.0 );\n}",
      background_frag:
        "uniform sampler2D t2D;\nvarying vec2 vUv;\nvoid main() {\n\tvec4 texColor = texture2D( t2D, vUv );\n\tgl_FragColor = mapTexelToLinear( texColor );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n}",
      cube_vert:
        "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n\tvWorldDirection = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\tgl_Position.z = gl_Position.w;\n}",
      cube_frag:
        "#include <envmap_common_pars_fragment>\nuniform float opacity;\nvarying vec3 vWorldDirection;\n#include <cube_uv_reflection_fragment>\nvoid main() {\n\tvec3 vReflect = vWorldDirection;\n\t#include <envmap_fragment>\n\tgl_FragColor = envColor;\n\tgl_FragColor.a *= opacity;\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n}",
      depth_vert:
        "#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n\t#include <uv_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_DISPLACEMENTMAP\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvHighPrecisionZW = gl_Position.zw;\n}",
      depth_frag:
        "#if DEPTH_PACKING == 3200\n\tuniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( 1.0 );\n\t#if DEPTH_PACKING == 3200\n\t\tdiffuseColor.a = opacity;\n\t#endif\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <logdepthbuf_fragment>\n\tfloat fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;\n\t#if DEPTH_PACKING == 3200\n\t\tgl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );\n\t#elif DEPTH_PACKING == 3201\n\t\tgl_FragColor = packDepthToRGBA( fragCoordZ );\n\t#endif\n}",
      distanceRGBA_vert:
        "#define DISTANCE\nvarying vec3 vWorldPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_DISPLACEMENTMAP\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\tvWorldPosition = worldPosition.xyz;\n}",
      distanceRGBA_frag:
        "#define DISTANCE\nuniform vec3 referencePosition;\nuniform float nearDistance;\nuniform float farDistance;\nvarying vec3 vWorldPosition;\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main () {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( 1.0 );\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\tfloat dist = length( vWorldPosition - referencePosition );\n\tdist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n\tdist = saturate( dist );\n\tgl_FragColor = packDepthToRGBA( dist );\n}",
      equirect_vert:
        "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n\tvWorldDirection = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n}",
      equirect_frag:
        "uniform sampler2D tEquirect;\nvarying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n\tvec3 direction = normalize( vWorldDirection );\n\tvec2 sampleUV = equirectUv( direction );\n\tvec4 texColor = texture2D( tEquirect, sampleUV );\n\tgl_FragColor = mapTexelToLinear( texColor );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n}",
      linedashed_vert:
        "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\tvLineDistance = scale * lineDistance;\n\t#include <color_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n}",
      linedashed_frag:
        "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tif ( mod( vLineDistance, totalSize ) > dashSize ) {\n\t\tdiscard;\n\t}\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <color_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n}",
      meshbasic_vert:
        "#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinbase_vertex>\n\t\t#include <skinnormal_vertex>\n\t\t#include <defaultnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <fog_vertex>\n}",
      meshbasic_frag:
        "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <cube_uv_reflection_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t#ifdef USE_LIGHTMAP\n\t\tvec4 lightMapTexel= texture2D( lightMap, vUv2 );\n\t\treflectedLight.indirectDiffuse += lightMapTexelToLinear( lightMapTexel ).rgb * lightMapIntensity;\n\t#else\n\t\treflectedLight.indirectDiffuse += vec3( 1.0 );\n\t#endif\n\t#include <aomap_fragment>\n\treflectedLight.indirectDiffuse *= diffuseColor.rgb;\n\tvec3 outgoingLight = reflectedLight.indirectDiffuse;\n\t#include <envmap_fragment>\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
      meshlambert_vert:
        "#define LAMBERT\nvarying vec3 vLightFront;\nvarying vec3 vIndirectFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n\tvarying vec3 vIndirectBack;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <lights_lambert_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}",
      meshlambert_frag:
        "uniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\nvarying vec3 vLightFront;\nvarying vec3 vIndirectFront;\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n\tvarying vec3 vIndirectBack;\n#endif\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <cube_uv_reflection_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <emissivemap_fragment>\n\t#ifdef DOUBLE_SIDED\n\t\treflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;\n\t#else\n\t\treflectedLight.indirectDiffuse += vIndirectFront;\n\t#endif\n\t#include <lightmap_fragment>\n\treflectedLight.indirectDiffuse *= BRDF_Lambert( diffuseColor.rgb );\n\t#ifdef DOUBLE_SIDED\n\t\treflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n\t#else\n\t\treflectedLight.directDiffuse = vLightFront;\n\t#endif\n\treflectedLight.directDiffuse *= BRDF_Lambert( diffuseColor.rgb ) * getShadowMask();\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t#include <envmap_fragment>\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
      meshmatcap_vert:
        "#define MATCAP\nvarying vec3 vViewPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n\tvViewPosition = - mvPosition.xyz;\n}",
      meshmatcap_frag:
        "#define MATCAP\nuniform vec3 diffuse;\nuniform float opacity;\nuniform sampler2D matcap;\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <fog_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\tvec3 viewDir = normalize( vViewPosition );\n\tvec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );\n\tvec3 y = cross( viewDir, x );\n\tvec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;\n\t#ifdef USE_MATCAP\n\t\tvec4 matcapColor = texture2D( matcap, uv );\n\t\tmatcapColor = matcapTexelToLinear( matcapColor );\n\t#else\n\t\tvec4 matcapColor = vec4( 1.0 );\n\t#endif\n\tvec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
      meshnormal_vert:
        "#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )\n\tvarying vec3 vViewPosition;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )\n\tvViewPosition = - mvPosition.xyz;\n#endif\n}",
      meshnormal_frag:
        "#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )\n\tvarying vec3 vViewPosition;\n#endif\n#include <packing>\n#include <uv_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\t#include <logdepthbuf_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\tgl_FragColor = vec4( packNormalToRGB( normal ), opacity );\n}",
      meshphong_vert:
        "#define PHONG\nvarying vec3 vViewPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}",
      meshphong_frag:
        "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <cube_uv_reflection_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <lights_phong_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\t#include <envmap_fragment>\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
      meshphysical_vert:
        "#define STANDARD\nvarying vec3 vViewPosition;\n#ifdef USE_TRANSMISSION\n\tvarying vec3 vWorldPosition;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n#ifdef USE_TRANSMISSION\n\tvWorldPosition = worldPosition.xyz;\n#endif\n}",
      meshphysical_frag:
        "#define STANDARD\n#ifdef PHYSICAL\n\t#define IOR\n\t#define SPECULAR\n#endif\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifdef IOR\n\tuniform float ior;\n#endif\n#ifdef SPECULAR\n\tuniform float specularIntensity;\n\tuniform vec3 specularColor;\n\t#ifdef USE_SPECULARINTENSITYMAP\n\t\tuniform sampler2D specularIntensityMap;\n\t#endif\n\t#ifdef USE_SPECULARCOLORMAP\n\t\tuniform sampler2D specularColorMap;\n\t#endif\n#endif\n#ifdef USE_CLEARCOAT\n\tuniform float clearcoat;\n\tuniform float clearcoatRoughness;\n#endif\n#ifdef USE_SHEEN\n\tuniform vec3 sheenColor;\n\tuniform float sheenRoughness;\n\t#ifdef USE_SHEENCOLORMAP\n\t\tuniform sampler2D sheenColorMap;\n\t#endif\n\t#ifdef USE_SHEENROUGHNESSMAP\n\t\tuniform sampler2D sheenRoughnessMap;\n\t#endif\n#endif\nvarying vec3 vViewPosition;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <bsdfs>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_physical_pars_fragment>\n#include <transmission_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <clearcoat_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <roughnessmap_fragment>\n\t#include <metalnessmap_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <clearcoat_normal_fragment_begin>\n\t#include <clearcoat_normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <lights_physical_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n\tvec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n\t#include <transmission_fragment>\n\tvec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;\n\t#ifdef USE_SHEEN\n\t\tfloat sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );\n\t\toutgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;\n\t#endif\n\t#ifdef USE_CLEARCOAT\n\t\tfloat dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );\n\t\tvec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );\n\t\toutgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;\n\t#endif\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
      meshtoon_vert:
        "#define TOON\nvarying vec3 vViewPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}",
      meshtoon_frag:
        "#define TOON\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_toon_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <lights_toon_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
      points_vert:
        "uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <color_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <project_vertex>\n\tgl_PointSize = size;\n\t#ifdef USE_SIZEATTENUATION\n\t\tbool isPerspective = isPerspectiveMatrix( projectionMatrix );\n\t\tif ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );\n\t#endif\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <fog_vertex>\n}",
      points_frag:
        "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_particle_fragment>\n\t#include <color_fragment>\n\t#include <alphatest_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n}",
      shadow_vert:
        "#include <common>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\nvoid main() {\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}",
      shadow_frag:
        "uniform vec3 color;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n\tgl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}",
      sprite_vert:
        "uniform float rotation;\nuniform vec2 center;\n#include <common>\n#include <uv_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\tvec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\n\tvec2 scale;\n\tscale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );\n\tscale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );\n\t#ifndef USE_SIZEATTENUATION\n\t\tbool isPerspective = isPerspectiveMatrix( projectionMatrix );\n\t\tif ( isPerspective ) scale *= - mvPosition.z;\n\t#endif\n\tvec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;\n\tvec2 rotatedPosition;\n\trotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\n\trotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\n\tmvPosition.xy += rotatedPosition;\n\tgl_Position = projectionMatrix * mvPosition;\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n}",
      sprite_frag:
        "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}",
    },
    ar = {
      common: {
        diffuse: { value: new ri(16777215) },
        opacity: { value: 1 },
        map: { value: null },
        uvTransform: { value: new Me() },
        uv2Transform: { value: new Me() },
        alphaMap: { value: null },
        alphaTest: { value: 0 },
      },
      specularmap: { specularMap: { value: null } },
      envmap: {
        envMap: { value: null },
        flipEnvMap: { value: -1 },
        reflectivity: { value: 1 },
        ior: { value: 1.5 },
        refractionRatio: { value: 0.98 },
      },
      aomap: { aoMap: { value: null }, aoMapIntensity: { value: 1 } },
      lightmap: { lightMap: { value: null }, lightMapIntensity: { value: 1 } },
      emissivemap: { emissiveMap: { value: null } },
      bumpmap: { bumpMap: { value: null }, bumpScale: { value: 1 } },
      normalmap: {
        normalMap: { value: null },
        normalScale: { value: new we(1, 1) },
      },
      displacementmap: {
        displacementMap: { value: null },
        displacementScale: { value: 1 },
        displacementBias: { value: 0 },
      },
      roughnessmap: { roughnessMap: { value: null } },
      metalnessmap: { metalnessMap: { value: null } },
      gradientmap: { gradientMap: { value: null } },
      fog: {
        fogDensity: { value: 25e-5 },
        fogNear: { value: 1 },
        fogFar: { value: 2e3 },
        fogColor: { value: new ri(16777215) },
      },
      lights: {
        ambientLightColor: { value: [] },
        lightProbe: { value: [] },
        directionalLights: {
          value: [],
          properties: { direction: {}, color: {} },
        },
        directionalLightShadows: {
          value: [],
          properties: {
            shadowBias: {},
            shadowNormalBias: {},
            shadowRadius: {},
            shadowMapSize: {},
          },
        },
        directionalShadowMap: { value: [] },
        directionalShadowMatrix: { value: [] },
        spotLights: {
          value: [],
          properties: {
            color: {},
            position: {},
            direction: {},
            distance: {},
            coneCos: {},
            penumbraCos: {},
            decay: {},
          },
        },
        spotLightShadows: {
          value: [],
          properties: {
            shadowBias: {},
            shadowNormalBias: {},
            shadowRadius: {},
            shadowMapSize: {},
          },
        },
        spotShadowMap: { value: [] },
        spotShadowMatrix: { value: [] },
        pointLights: {
          value: [],
          properties: { color: {}, position: {}, decay: {}, distance: {} },
        },
        pointLightShadows: {
          value: [],
          properties: {
            shadowBias: {},
            shadowNormalBias: {},
            shadowRadius: {},
            shadowMapSize: {},
            shadowCameraNear: {},
            shadowCameraFar: {},
          },
        },
        pointShadowMap: { value: [] },
        pointShadowMatrix: { value: [] },
        hemisphereLights: {
          value: [],
          properties: { direction: {}, skyColor: {}, groundColor: {} },
        },
        rectAreaLights: {
          value: [],
          properties: { color: {}, position: {}, width: {}, height: {} },
        },
        ltc_1: { value: null },
        ltc_2: { value: null },
      },
      points: {
        diffuse: { value: new ri(16777215) },
        opacity: { value: 1 },
        size: { value: 1 },
        scale: { value: 1 },
        map: { value: null },
        alphaMap: { value: null },
        alphaTest: { value: 0 },
        uvTransform: { value: new Me() },
      },
      sprite: {
        diffuse: { value: new ri(16777215) },
        opacity: { value: 1 },
        center: { value: new we(0.5, 0.5) },
        rotation: { value: 0 },
        map: { value: null },
        alphaMap: { value: null },
        alphaTest: { value: 0 },
        uvTransform: { value: new Me() },
      },
    },
    lr = {
      basic: {
        uniforms: Hi([
          ar.common,
          ar.specularmap,
          ar.envmap,
          ar.aomap,
          ar.lightmap,
          ar.fog,
        ]),
        vertexShader: or.meshbasic_vert,
        fragmentShader: or.meshbasic_frag,
      },
      lambert: {
        uniforms: Hi([
          ar.common,
          ar.specularmap,
          ar.envmap,
          ar.aomap,
          ar.lightmap,
          ar.emissivemap,
          ar.fog,
          ar.lights,
          { emissive: { value: new ri(0) } },
        ]),
        vertexShader: or.meshlambert_vert,
        fragmentShader: or.meshlambert_frag,
      },
      phong: {
        uniforms: Hi([
          ar.common,
          ar.specularmap,
          ar.envmap,
          ar.aomap,
          ar.lightmap,
          ar.emissivemap,
          ar.bumpmap,
          ar.normalmap,
          ar.displacementmap,
          ar.fog,
          ar.lights,
          {
            emissive: { value: new ri(0) },
            specular: { value: new ri(1118481) },
            shininess: { value: 30 },
          },
        ]),
        vertexShader: or.meshphong_vert,
        fragmentShader: or.meshphong_frag,
      },
      standard: {
        uniforms: Hi([
          ar.common,
          ar.envmap,
          ar.aomap,
          ar.lightmap,
          ar.emissivemap,
          ar.bumpmap,
          ar.normalmap,
          ar.displacementmap,
          ar.roughnessmap,
          ar.metalnessmap,
          ar.fog,
          ar.lights,
          {
            emissive: { value: new ri(0) },
            roughness: { value: 1 },
            metalness: { value: 0 },
            envMapIntensity: { value: 1 },
          },
        ]),
        vertexShader: or.meshphysical_vert,
        fragmentShader: or.meshphysical_frag,
      },
      toon: {
        uniforms: Hi([
          ar.common,
          ar.aomap,
          ar.lightmap,
          ar.emissivemap,
          ar.bumpmap,
          ar.normalmap,
          ar.displacementmap,
          ar.gradientmap,
          ar.fog,
          ar.lights,
          { emissive: { value: new ri(0) } },
        ]),
        vertexShader: or.meshtoon_vert,
        fragmentShader: or.meshtoon_frag,
      },
      matcap: {
        uniforms: Hi([
          ar.common,
          ar.bumpmap,
          ar.normalmap,
          ar.displacementmap,
          ar.fog,
          { matcap: { value: null } },
        ]),
        vertexShader: or.meshmatcap_vert,
        fragmentShader: or.meshmatcap_frag,
      },
      points: {
        uniforms: Hi([ar.points, ar.fog]),
        vertexShader: or.points_vert,
        fragmentShader: or.points_frag,
      },
      dashed: {
        uniforms: Hi([
          ar.common,
          ar.fog,
          {
            scale: { value: 1 },
            dashSize: { value: 1 },
            totalSize: { value: 2 },
          },
        ]),
        vertexShader: or.linedashed_vert,
        fragmentShader: or.linedashed_frag,
      },
      depth: {
        uniforms: Hi([ar.common, ar.displacementmap]),
        vertexShader: or.depth_vert,
        fragmentShader: or.depth_frag,
      },
      normal: {
        uniforms: Hi([
          ar.common,
          ar.bumpmap,
          ar.normalmap,
          ar.displacementmap,
          { opacity: { value: 1 } },
        ]),
        vertexShader: or.meshnormal_vert,
        fragmentShader: or.meshnormal_frag,
      },
      sprite: {
        uniforms: Hi([ar.sprite, ar.fog]),
        vertexShader: or.sprite_vert,
        fragmentShader: or.sprite_frag,
      },
      background: {
        uniforms: { uvTransform: { value: new Me() }, t2D: { value: null } },
        vertexShader: or.background_vert,
        fragmentShader: or.background_frag,
      },
      cube: {
        uniforms: Hi([ar.envmap, { opacity: { value: 1 } }]),
        vertexShader: or.cube_vert,
        fragmentShader: or.cube_frag,
      },
      equirect: {
        uniforms: { tEquirect: { value: null } },
        vertexShader: or.equirect_vert,
        fragmentShader: or.equirect_frag,
      },
      distanceRGBA: {
        uniforms: Hi([
          ar.common,
          ar.displacementmap,
          {
            referencePosition: { value: new ze() },
            nearDistance: { value: 1 },
            farDistance: { value: 1e3 },
          },
        ]),
        vertexShader: or.distanceRGBA_vert,
        fragmentShader: or.distanceRGBA_frag,
      },
      shadow: {
        uniforms: Hi([
          ar.lights,
          ar.fog,
          { color: { value: new ri(0) }, opacity: { value: 1 } },
        ]),
        vertexShader: or.shadow_vert,
        fragmentShader: or.shadow_frag,
      },
    };
  function cr(t, e, n, i, r) {
    const s = new ri(0);
    let o,
      a,
      l = 0,
      c = null,
      h = 0,
      u = null;
    function d(t, e) {
      n.buffers.color.setClear(t.r, t.g, t.b, e, r);
    }
    return {
      getClearColor: function () {
        return s;
      },
      setClearColor: function (t, e = 1) {
        s.set(t), (l = e), d(s, l);
      },
      getClearAlpha: function () {
        return l;
      },
      setClearAlpha: function (t) {
        (l = t), d(s, l);
      },
      render: function (n, r) {
        let p = !1,
          m = !0 === r.isScene ? r.background : null;
        m && m.isTexture && (m = e.get(m));
        const f = t.xr,
          g = f.getSession && f.getSession();
        g && "additive" === g.environmentBlendMode && (m = null),
          null === m ? d(s, l) : m && m.isColor && (d(m, 1), (p = !0)),
          (t.autoClear || p) &&
            t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil),
          m && (m.isCubeTexture || m.mapping === Nt)
            ? (void 0 === a &&
                ((a = new Oi(
                  new Ui(1, 1, 1),
                  new Vi({
                    name: "BackgroundCubeMaterial",
                    uniforms: Bi(lr.cube.uniforms),
                    vertexShader: lr.cube.vertexShader,
                    fragmentShader: lr.cube.fragmentShader,
                    side: 1,
                    depthTest: !1,
                    depthWrite: !1,
                    fog: !1,
                  })
                )),
                a.geometry.deleteAttribute("normal"),
                a.geometry.deleteAttribute("uv"),
                (a.onBeforeRender = function (t, e, n) {
                  this.matrixWorld.copyPosition(n.matrixWorld);
                }),
                Object.defineProperty(a.material, "envMap", {
                  get: function () {
                    return this.uniforms.envMap.value;
                  },
                }),
                i.update(a)),
              (a.material.uniforms.envMap.value = m),
              (a.material.uniforms.flipEnvMap.value =
                m.isCubeTexture && !1 === m.isRenderTargetTexture ? -1 : 1),
              (c === m && h === m.version && u === t.toneMapping) ||
                ((a.material.needsUpdate = !0),
                (c = m),
                (h = m.version),
                (u = t.toneMapping)),
              n.unshift(a, a.geometry, a.material, 0, 0, null))
            : m &&
              m.isTexture &&
              (void 0 === o &&
                ((o = new Oi(
                  new sr(2, 2),
                  new Vi({
                    name: "BackgroundMaterial",
                    uniforms: Bi(lr.background.uniforms),
                    vertexShader: lr.background.vertexShader,
                    fragmentShader: lr.background.fragmentShader,
                    side: 0,
                    depthTest: !1,
                    depthWrite: !1,
                    fog: !1,
                  })
                )),
                o.geometry.deleteAttribute("normal"),
                Object.defineProperty(o.material, "map", {
                  get: function () {
                    return this.uniforms.t2D.value;
                  },
                }),
                i.update(o)),
              (o.material.uniforms.t2D.value = m),
              !0 === m.matrixAutoUpdate && m.updateMatrix(),
              o.material.uniforms.uvTransform.value.copy(m.matrix),
              (c === m && h === m.version && u === t.toneMapping) ||
                ((o.material.needsUpdate = !0),
                (c = m),
                (h = m.version),
                (u = t.toneMapping)),
              n.unshift(o, o.geometry, o.material, 0, 0, null));
      },
    };
  }
  function hr(t, e, n, i) {
    const r = t.getParameter(34921),
      s = i.isWebGL2 ? null : e.get("OES_vertex_array_object"),
      o = i.isWebGL2 || null !== s,
      a = {},
      l = d(null);
    let c = l;
    function h(e) {
      return i.isWebGL2 ? t.bindVertexArray(e) : s.bindVertexArrayOES(e);
    }
    function u(e) {
      return i.isWebGL2 ? t.deleteVertexArray(e) : s.deleteVertexArrayOES(e);
    }
    function d(t) {
      const e = [],
        n = [],
        i = [];
      for (let t = 0; t < r; t++) (e[t] = 0), (n[t] = 0), (i[t] = 0);
      return {
        geometry: null,
        program: null,
        wireframe: !1,
        newAttributes: e,
        enabledAttributes: n,
        attributeDivisors: i,
        object: t,
        attributes: {},
        index: null,
      };
    }
    function p() {
      const t = c.newAttributes;
      for (let e = 0, n = t.length; e < n; e++) t[e] = 0;
    }
    function m(t) {
      f(t, 0);
    }
    function f(n, r) {
      const s = c.newAttributes,
        o = c.enabledAttributes,
        a = c.attributeDivisors;
      if (
        ((s[n] = 1),
        0 === o[n] && (t.enableVertexAttribArray(n), (o[n] = 1)),
        a[n] !== r)
      ) {
        (i.isWebGL2 ? t : e.get("ANGLE_instanced_arrays"))[
          i.isWebGL2 ? "vertexAttribDivisor" : "vertexAttribDivisorANGLE"
        ](n, r),
          (a[n] = r);
      }
    }
    function g() {
      const e = c.newAttributes,
        n = c.enabledAttributes;
      for (let i = 0, r = n.length; i < r; i++)
        n[i] !== e[i] && (t.disableVertexAttribArray(i), (n[i] = 0));
    }
    function v(e, n, r, s, o, a) {
      !0 !== i.isWebGL2 || (5124 !== r && 5125 !== r)
        ? t.vertexAttribPointer(e, n, r, s, o, a)
        : t.vertexAttribIPointer(e, n, r, o, a);
    }
    function x() {
      _(), c !== l && ((c = l), h(c.object));
    }
    function _() {
      (l.geometry = null), (l.program = null), (l.wireframe = !1);
    }
    return {
      setup: function (r, l, u, x, _) {
        let y = !1;
        if (o) {
          const e = (function (e, n, r) {
            const o = !0 === r.wireframe;
            let l = a[e.id];
            void 0 === l && ((l = {}), (a[e.id] = l));
            let c = l[n.id];
            void 0 === c && ((c = {}), (l[n.id] = c));
            let h = c[o];
            void 0 === h &&
              ((h = d(
                i.isWebGL2 ? t.createVertexArray() : s.createVertexArrayOES()
              )),
              (c[o] = h));
            return h;
          })(x, u, l);
          c !== e && ((c = e), h(c.object)),
            (y = (function (t, e) {
              const n = c.attributes,
                i = t.attributes;
              let r = 0;
              for (const t in i) {
                const e = n[t],
                  s = i[t];
                if (void 0 === e) return !0;
                if (e.attribute !== s) return !0;
                if (e.data !== s.data) return !0;
                r++;
              }
              return c.attributesNum !== r || c.index !== e;
            })(x, _)),
            y &&
              (function (t, e) {
                const n = {},
                  i = t.attributes;
                let r = 0;
                for (const t in i) {
                  const e = i[t],
                    s = {};
                  (s.attribute = e),
                    e.data && (s.data = e.data),
                    (n[t] = s),
                    r++;
                }
                (c.attributes = n), (c.attributesNum = r), (c.index = e);
              })(x, _);
        } else {
          const t = !0 === l.wireframe;
          (c.geometry === x.id && c.program === u.id && c.wireframe === t) ||
            ((c.geometry = x.id),
            (c.program = u.id),
            (c.wireframe = t),
            (y = !0));
        }
        !0 === r.isInstancedMesh && (y = !0),
          null !== _ && n.update(_, 34963),
          y &&
            (!(function (r, s, o, a) {
              if (
                !1 === i.isWebGL2 &&
                (r.isInstancedMesh || a.isInstancedBufferGeometry) &&
                null === e.get("ANGLE_instanced_arrays")
              )
                return;
              p();
              const l = a.attributes,
                c = o.getAttributes(),
                h = s.defaultAttributeValues;
              for (const e in c) {
                const i = c[e];
                if (i.location >= 0) {
                  let s = l[e];
                  if (
                    (void 0 === s &&
                      ("instanceMatrix" === e &&
                        r.instanceMatrix &&
                        (s = r.instanceMatrix),
                      "instanceColor" === e &&
                        r.instanceColor &&
                        (s = r.instanceColor)),
                    void 0 !== s)
                  ) {
                    const e = s.normalized,
                      o = s.itemSize,
                      l = n.get(s);
                    if (void 0 === l) continue;
                    const c = l.buffer,
                      h = l.type,
                      u = l.bytesPerElement;
                    if (s.isInterleavedBufferAttribute) {
                      const n = s.data,
                        l = n.stride,
                        d = s.offset;
                      if (n && n.isInstancedInterleavedBuffer) {
                        for (let t = 0; t < i.locationSize; t++)
                          f(i.location + t, n.meshPerAttribute);
                        !0 !== r.isInstancedMesh &&
                          void 0 === a._maxInstanceCount &&
                          (a._maxInstanceCount = n.meshPerAttribute * n.count);
                      } else
                        for (let t = 0; t < i.locationSize; t++)
                          m(i.location + t);
                      t.bindBuffer(34962, c);
                      for (let t = 0; t < i.locationSize; t++)
                        v(
                          i.location + t,
                          o / i.locationSize,
                          h,
                          e,
                          l * u,
                          (d + (o / i.locationSize) * t) * u
                        );
                    } else {
                      if (s.isInstancedBufferAttribute) {
                        for (let t = 0; t < i.locationSize; t++)
                          f(i.location + t, s.meshPerAttribute);
                        !0 !== r.isInstancedMesh &&
                          void 0 === a._maxInstanceCount &&
                          (a._maxInstanceCount = s.meshPerAttribute * s.count);
                      } else
                        for (let t = 0; t < i.locationSize; t++)
                          m(i.location + t);
                      t.bindBuffer(34962, c);
                      for (let t = 0; t < i.locationSize; t++)
                        v(
                          i.location + t,
                          o / i.locationSize,
                          h,
                          e,
                          o * u,
                          (o / i.locationSize) * t * u
                        );
                    }
                  } else if (void 0 !== h) {
                    const n = h[e];
                    if (void 0 !== n)
                      switch (n.length) {
                        case 2:
                          t.vertexAttrib2fv(i.location, n);
                          break;
                        case 3:
                          t.vertexAttrib3fv(i.location, n);
                          break;
                        case 4:
                          t.vertexAttrib4fv(i.location, n);
                          break;
                        default:
                          t.vertexAttrib1fv(i.location, n);
                      }
                  }
                }
              }
              g();
            })(r, l, u, x),
            null !== _ && t.bindBuffer(34963, n.get(_).buffer));
      },
      reset: x,
      resetDefaultState: _,
      dispose: function () {
        x();
        for (const t in a) {
          const e = a[t];
          for (const t in e) {
            const n = e[t];
            for (const t in n) u(n[t].object), delete n[t];
            delete e[t];
          }
          delete a[t];
        }
      },
      releaseStatesOfGeometry: function (t) {
        if (void 0 === a[t.id]) return;
        const e = a[t.id];
        for (const t in e) {
          const n = e[t];
          for (const t in n) u(n[t].object), delete n[t];
          delete e[t];
        }
        delete a[t.id];
      },
      releaseStatesOfProgram: function (t) {
        for (const e in a) {
          const n = a[e];
          if (void 0 === n[t.id]) continue;
          const i = n[t.id];
          for (const t in i) u(i[t].object), delete i[t];
          delete n[t.id];
        }
      },
      initAttributes: p,
      enableAttribute: m,
      disableUnusedAttributes: g,
    };
  }
  function ur(t, e, n, i) {
    const r = i.isWebGL2;
    let s;
    (this.setMode = function (t) {
      s = t;
    }),
      (this.render = function (e, i) {
        t.drawArrays(s, e, i), n.update(i, s, 1);
      }),
      (this.renderInstances = function (i, o, a) {
        if (0 === a) return;
        let l, c;
        if (r) (l = t), (c = "drawArraysInstanced");
        else if (
          ((l = e.get("ANGLE_instanced_arrays")),
          (c = "drawArraysInstancedANGLE"),
          null === l)
        )
          return void console.error(
            "THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays."
          );
        l[c](s, i, o, a), n.update(o, s, a);
      });
  }
  function dr(t, e, n) {
    let i;
    function r(e) {
      if ("highp" === e) {
        if (
          t.getShaderPrecisionFormat(35633, 36338).precision > 0 &&
          t.getShaderPrecisionFormat(35632, 36338).precision > 0
        )
          return "highp";
        e = "mediump";
      }
      return "mediump" === e &&
        t.getShaderPrecisionFormat(35633, 36337).precision > 0 &&
        t.getShaderPrecisionFormat(35632, 36337).precision > 0
        ? "mediump"
        : "lowp";
    }
    const s =
      ("undefined" != typeof WebGL2RenderingContext &&
        t instanceof WebGL2RenderingContext) ||
      ("undefined" != typeof WebGL2ComputeRenderingContext &&
        t instanceof WebGL2ComputeRenderingContext);
    let o = void 0 !== n.precision ? n.precision : "highp";
    const a = r(o);
    a !== o &&
      (console.warn(
        "THREE.WebGLRenderer:",
        o,
        "not supported, using",
        a,
        "instead."
      ),
      (o = a));
    const l = s || e.has("WEBGL_draw_buffers"),
      c = !0 === n.logarithmicDepthBuffer,
      h = t.getParameter(34930),
      u = t.getParameter(35660),
      d = t.getParameter(3379),
      p = t.getParameter(34076),
      m = t.getParameter(34921),
      f = t.getParameter(36347),
      g = t.getParameter(36348),
      v = t.getParameter(36349),
      x = u > 0,
      _ = s || e.has("OES_texture_float");
    return {
      isWebGL2: s,
      drawBuffers: l,
      getMaxAnisotropy: function () {
        if (void 0 !== i) return i;
        if (!0 === e.has("EXT_texture_filter_anisotropic")) {
          const n = e.get("EXT_texture_filter_anisotropic");
          i = t.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        } else i = 0;
        return i;
      },
      getMaxPrecision: r,
      precision: o,
      logarithmicDepthBuffer: c,
      maxTextures: h,
      maxVertexTextures: u,
      maxTextureSize: d,
      maxCubemapSize: p,
      maxAttributes: m,
      maxVertexUniforms: f,
      maxVaryings: g,
      maxFragmentUniforms: v,
      vertexTextures: x,
      floatFragmentTextures: _,
      floatVertexTextures: x && _,
      maxSamples: s ? t.getParameter(36183) : 0,
    };
  }
  function pr(t) {
    const e = this;
    let n = null,
      i = 0,
      r = !1,
      s = !1;
    const o = new $i(),
      a = new Me(),
      l = { value: null, needsUpdate: !1 };
    function c() {
      l.value !== n && ((l.value = n), (l.needsUpdate = i > 0)),
        (e.numPlanes = i),
        (e.numIntersection = 0);
    }
    function h(t, n, i, r) {
      const s = null !== t ? t.length : 0;
      let c = null;
      if (0 !== s) {
        if (((c = l.value), !0 !== r || null === c)) {
          const e = i + 4 * s,
            r = n.matrixWorldInverse;
          a.getNormalMatrix(r),
            (null === c || c.length < e) && (c = new Float32Array(e));
          for (let e = 0, n = i; e !== s; ++e, n += 4)
            o.copy(t[e]).applyMatrix4(r, a),
              o.normal.toArray(c, n),
              (c[n + 3] = o.constant);
        }
        (l.value = c), (l.needsUpdate = !0);
      }
      return (e.numPlanes = s), (e.numIntersection = 0), c;
    }
    (this.uniform = l),
      (this.numPlanes = 0),
      (this.numIntersection = 0),
      (this.init = function (t, e, s) {
        const o = 0 !== t.length || e || 0 !== i || r;
        return (r = e), (n = h(t, s, 0)), (i = t.length), o;
      }),
      (this.beginShadows = function () {
        (s = !0), h(null);
      }),
      (this.endShadows = function () {
        (s = !1), c();
      }),
      (this.setState = function (e, o, a) {
        const u = e.clippingPlanes,
          d = e.clipIntersection,
          p = e.clipShadows,
          m = t.get(e);
        if (!r || null === u || 0 === u.length || (s && !p)) s ? h(null) : c();
        else {
          const t = s ? 0 : i,
            e = 4 * t;
          let r = m.clippingState || null;
          (l.value = r), (r = h(u, o, e, a));
          for (let t = 0; t !== e; ++t) r[t] = n[t];
          (m.clippingState = r),
            (this.numIntersection = d ? this.numPlanes : 0),
            (this.numPlanes += t);
        }
      });
  }
  function mr(t) {
    let e = new WeakMap();
    function n(t, e) {
      return 303 === e ? (t.mapping = Dt) : 304 === e && (t.mapping = It), t;
    }
    function i(t) {
      const n = t.target;
      n.removeEventListener("dispose", i);
      const r = e.get(n);
      void 0 !== r && (e.delete(n), r.dispose());
    }
    return {
      get: function (r) {
        if (r && r.isTexture && !1 === r.isRenderTargetTexture) {
          const s = r.mapping;
          if (303 === s || 304 === s) {
            if (e.has(r)) {
              return n(e.get(r).texture, r.mapping);
            }
            {
              const s = r.image;
              if (s && s.height > 0) {
                const o = t.getRenderTarget(),
                  a = new qi(s.height / 2);
                return (
                  a.fromEquirectangularTexture(t, r),
                  e.set(r, a),
                  t.setRenderTarget(o),
                  r.addEventListener("dispose", i),
                  n(a.texture, r.mapping)
                );
              }
              return null;
            }
          }
        }
        return r;
      },
      dispose: function () {
        e = new WeakMap();
      },
    };
  }
  lr.physical = {
    uniforms: Hi([
      lr.standard.uniforms,
      {
        clearcoat: { value: 0 },
        clearcoatMap: { value: null },
        clearcoatRoughness: { value: 0 },
        clearcoatRoughnessMap: { value: null },
        clearcoatNormalScale: { value: new we(1, 1) },
        clearcoatNormalMap: { value: null },
        sheen: { value: 0 },
        sheenColor: { value: new ri(0) },
        sheenColorMap: { value: null },
        sheenRoughness: { value: 0 },
        sheenRoughnessMap: { value: null },
        transmission: { value: 0 },
        transmissionMap: { value: null },
        transmissionSamplerSize: { value: new we() },
        transmissionSamplerMap: { value: null },
        thickness: { value: 0 },
        thicknessMap: { value: null },
        attenuationDistance: { value: 0 },
        attenuationColor: { value: new ri(0) },
        specularIntensity: { value: 0 },
        specularIntensityMap: { value: null },
        specularColor: { value: new ri(1, 1, 1) },
        specularColorMap: { value: null },
      },
    ]),
    vertexShader: or.meshphysical_vert,
    fragmentShader: or.meshphysical_frag,
  };
  class fr extends Wi {
    constructor(t = -1, e = 1, n = 1, i = -1, r = 0.1, s = 2e3) {
      super(),
        (this.type = "OrthographicCamera"),
        (this.zoom = 1),
        (this.view = null),
        (this.left = t),
        (this.right = e),
        (this.top = n),
        (this.bottom = i),
        (this.near = r),
        (this.far = s),
        this.updateProjectionMatrix();
    }
    copy(t, e) {
      return (
        super.copy(t, e),
        (this.left = t.left),
        (this.right = t.right),
        (this.top = t.top),
        (this.bottom = t.bottom),
        (this.near = t.near),
        (this.far = t.far),
        (this.zoom = t.zoom),
        (this.view = null === t.view ? null : Object.assign({}, t.view)),
        this
      );
    }
    setViewOffset(t, e, n, i, r, s) {
      null === this.view &&
        (this.view = {
          enabled: !0,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1,
        }),
        (this.view.enabled = !0),
        (this.view.fullWidth = t),
        (this.view.fullHeight = e),
        (this.view.offsetX = n),
        (this.view.offsetY = i),
        (this.view.width = r),
        (this.view.height = s),
        this.updateProjectionMatrix();
    }
    clearViewOffset() {
      null !== this.view && (this.view.enabled = !1),
        this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      const t = (this.right - this.left) / (2 * this.zoom),
        e = (this.top - this.bottom) / (2 * this.zoom),
        n = (this.right + this.left) / 2,
        i = (this.top + this.bottom) / 2;
      let r = n - t,
        s = n + t,
        o = i + e,
        a = i - e;
      if (null !== this.view && this.view.enabled) {
        const t = (this.right - this.left) / this.view.fullWidth / this.zoom,
          e = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
        (r += t * this.view.offsetX),
          (s = r + t * this.view.width),
          (o -= e * this.view.offsetY),
          (a = o - e * this.view.height);
      }
      this.projectionMatrix.makeOrthographic(r, s, o, a, this.near, this.far),
        this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return (
        (e.object.zoom = this.zoom),
        (e.object.left = this.left),
        (e.object.right = this.right),
        (e.object.top = this.top),
        (e.object.bottom = this.bottom),
        (e.object.near = this.near),
        (e.object.far = this.far),
        null !== this.view && (e.object.view = Object.assign({}, this.view)),
        e
      );
    }
  }
  fr.prototype.isOrthographicCamera = !0;
  class gr extends Vi {
    constructor(t) {
      super(t), (this.type = "RawShaderMaterial");
    }
  }
  gr.prototype.isRawShaderMaterial = !0;
  const vr = Math.pow(2, 8),
    xr = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582],
    _r = 5 + xr.length,
    yr = 20,
    br = { [ae]: 0, [le]: 1 },
    wr = new fr(),
    { _lodPlanes: Mr, _sizeLods: Sr, _sigmas: Tr } = Dr(),
    Er = new ri();
  let Ar = null;
  const Lr = (1 + Math.sqrt(5)) / 2,
    Rr = 1 / Lr,
    Cr = [
      new ze(1, 1, 1),
      new ze(-1, 1, 1),
      new ze(1, 1, -1),
      new ze(-1, 1, -1),
      new ze(0, Lr, Rr),
      new ze(0, Lr, -Rr),
      new ze(Rr, 0, Lr),
      new ze(-Rr, 0, Lr),
      new ze(Lr, Rr, 0),
      new ze(-Lr, Rr, 0),
    ];
  class Pr {
    constructor(t) {
      (this._renderer = t),
        (this._pingPongRenderTarget = null),
        (this._blurMaterial = (function (t) {
          const e = new Float32Array(t),
            n = new ze(0, 1, 0);
          return new gr({
            name: "SphericalGaussianBlur",
            defines: { n: t },
            uniforms: {
              envMap: { value: null },
              samples: { value: 1 },
              weights: { value: e },
              latitudinal: { value: !1 },
              dTheta: { value: 0 },
              mipInt: { value: 0 },
              poleAxis: { value: n },
            },
            vertexShader: Or(),
            fragmentShader: `\n\n\t\t\tprecision mediump float;\n\t\t\tprecision mediump int;\n\n\t\t\tvarying vec3 vOutputDirection;\n\n\t\t\tuniform sampler2D envMap;\n\t\t\tuniform int samples;\n\t\t\tuniform float weights[ n ];\n\t\t\tuniform bool latitudinal;\n\t\t\tuniform float dTheta;\n\t\t\tuniform float mipInt;\n\t\t\tuniform vec3 poleAxis;\n\n\t\t\t${Fr()}\n\n\t\t\t#define ENVMAP_TYPE_CUBE_UV\n\t\t\t#include <cube_uv_reflection_fragment>\n\n\t\t\tvec3 getSample( float theta, vec3 axis ) {\n\n\t\t\t\tfloat cosTheta = cos( theta );\n\t\t\t\t// Rodrigues' axis-angle rotation\n\t\t\t\tvec3 sampleDirection = vOutputDirection * cosTheta\n\t\t\t\t\t+ cross( axis, vOutputDirection ) * sin( theta )\n\t\t\t\t\t+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );\n\n\t\t\t\treturn bilinearCubeUV( envMap, sampleDirection, mipInt );\n\n\t\t\t}\n\n\t\t\tvoid main() {\n\n\t\t\t\tvec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );\n\n\t\t\t\tif ( all( equal( axis, vec3( 0.0 ) ) ) ) {\n\n\t\t\t\t\taxis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );\n\n\t\t\t\t}\n\n\t\t\t\taxis = normalize( axis );\n\n\t\t\t\tgl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n\t\t\t\tgl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );\n\n\t\t\t\tfor ( int i = 1; i < n; i++ ) {\n\n\t\t\t\t\tif ( i >= samples ) {\n\n\t\t\t\t\t\tbreak;\n\n\t\t\t\t\t}\n\n\t\t\t\t\tfloat theta = dTheta * float( i );\n\t\t\t\t\tgl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );\n\t\t\t\t\tgl_FragColor.rgb += weights[ i ] * getSample( theta, axis );\n\n\t\t\t\t}\n\n\t\t\t}\n\t\t`,
            blending: 0,
            depthTest: !1,
            depthWrite: !1,
          });
        })(yr)),
        (this._equirectShader = null),
        (this._cubemapShader = null),
        this._compileMaterial(this._blurMaterial);
    }
    fromScene(t, e = 0, n = 0.1, i = 100) {
      Ar = this._renderer.getRenderTarget();
      const r = this._allocateTargets();
      return (
        this._sceneToCubeUV(t, n, i, r),
        e > 0 && this._blur(r, 0, 0, e),
        this._applyPMREM(r),
        this._cleanup(r),
        r
      );
    }
    fromEquirectangular(t) {
      return this._fromTexture(t);
    }
    fromCubemap(t) {
      return this._fromTexture(t);
    }
    compileCubemapShader() {
      null === this._cubemapShader &&
        ((this._cubemapShader = kr()),
        this._compileMaterial(this._cubemapShader));
    }
    compileEquirectangularShader() {
      null === this._equirectShader &&
        ((this._equirectShader = zr()),
        this._compileMaterial(this._equirectShader));
    }
    dispose() {
      this._blurMaterial.dispose(),
        null !== this._cubemapShader && this._cubemapShader.dispose(),
        null !== this._equirectShader && this._equirectShader.dispose();
      for (let t = 0; t < Mr.length; t++) Mr[t].dispose();
    }
    _cleanup(t) {
      this._pingPongRenderTarget.dispose(),
        this._renderer.setRenderTarget(Ar),
        (t.scissorTest = !1),
        Nr(t, 0, 0, t.width, t.height);
    }
    _fromTexture(t) {
      Ar = this._renderer.getRenderTarget();
      const e = this._allocateTargets(t);
      return (
        this._textureToCubeUV(t, e), this._applyPMREM(e), this._cleanup(e), e
      );
    }
    _allocateTargets(t) {
      const e = {
          magFilter: Ht,
          minFilter: Ht,
          generateMipmaps: !1,
          type: Xt,
          format: Qt,
          encoding: ae,
          depthBuffer: !1,
        },
        n = Ir(e);
      return (n.depthBuffer = !t), (this._pingPongRenderTarget = Ir(e)), n;
    }
    _compileMaterial(t) {
      const e = new Oi(Mr[0], t);
      this._renderer.compile(e, wr);
    }
    _sceneToCubeUV(t, e, n, i) {
      const r = new ji(90, 1, e, n),
        s = [1, -1, 1, 1, 1, 1],
        o = [1, 1, 1, -1, -1, -1],
        a = this._renderer,
        l = a.autoClear,
        c = a.toneMapping;
      a.getClearColor(Er), (a.toneMapping = 0), (a.autoClear = !1);
      const h = new si({
          name: "PMREM.Background",
          side: 1,
          depthWrite: !1,
          depthTest: !1,
        }),
        u = new Oi(new Ui(), h);
      let d = !1;
      const p = t.background;
      p
        ? p.isColor && (h.color.copy(p), (t.background = null), (d = !0))
        : (h.color.copy(Er), (d = !0));
      for (let e = 0; e < 6; e++) {
        const n = e % 3;
        0 == n
          ? (r.up.set(0, s[e], 0), r.lookAt(o[e], 0, 0))
          : 1 == n
          ? (r.up.set(0, 0, s[e]), r.lookAt(0, o[e], 0))
          : (r.up.set(0, s[e], 0), r.lookAt(0, 0, o[e])),
          Nr(i, n * vr, e > 2 ? vr : 0, vr, vr),
          a.setRenderTarget(i),
          d && a.render(u, r),
          a.render(t, r);
      }
      u.geometry.dispose(),
        u.material.dispose(),
        (a.toneMapping = c),
        (a.autoClear = l),
        (t.background = p);
    }
    _setEncoding(t, e) {
      !0 === this._renderer.capabilities.isWebGL2 &&
      e.format === Qt &&
      e.type === Wt &&
      e.encoding === le
        ? (t.value = br[3e3])
        : (t.value = br[e.encoding]);
    }
    _textureToCubeUV(t, e) {
      const n = this._renderer,
        i = t.mapping === Dt || t.mapping === It;
      i
        ? null == this._cubemapShader && (this._cubemapShader = kr())
        : null == this._equirectShader && (this._equirectShader = zr());
      const r = i ? this._cubemapShader : this._equirectShader,
        s = new Oi(Mr[0], r),
        o = r.uniforms;
      (o.envMap.value = t),
        i || o.texelSize.value.set(1 / t.image.width, 1 / t.image.height),
        this._setEncoding(o.inputEncoding, t),
        Nr(e, 0, 0, 3 * vr, 2 * vr),
        n.setRenderTarget(e),
        n.render(s, wr);
    }
    _applyPMREM(t) {
      const e = this._renderer,
        n = e.autoClear;
      e.autoClear = !1;
      for (let e = 1; e < _r; e++) {
        const n = Math.sqrt(Tr[e] * Tr[e] - Tr[e - 1] * Tr[e - 1]),
          i = Cr[(e - 1) % Cr.length];
        this._blur(t, e - 1, e, n, i);
      }
      e.autoClear = n;
    }
    _blur(t, e, n, i, r) {
      const s = this._pingPongRenderTarget;
      this._halfBlur(t, s, e, n, i, "latitudinal", r),
        this._halfBlur(s, t, n, n, i, "longitudinal", r);
    }
    _halfBlur(t, e, n, i, r, s, o) {
      const a = this._renderer,
        l = this._blurMaterial;
      "latitudinal" !== s &&
        "longitudinal" !== s &&
        console.error(
          "blur direction must be either latitudinal or longitudinal!"
        );
      const c = new Oi(Mr[i], l),
        h = l.uniforms,
        u = Sr[n] - 1,
        d = isFinite(r) ? Math.PI / (2 * u) : (2 * Math.PI) / 39,
        p = r / d,
        m = isFinite(r) ? 1 + Math.floor(3 * p) : yr;
      m > yr &&
        console.warn(
          `sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to 20`
        );
      const f = [];
      let g = 0;
      for (let t = 0; t < yr; ++t) {
        const e = t / p,
          n = Math.exp((-e * e) / 2);
        f.push(n), 0 == t ? (g += n) : t < m && (g += 2 * n);
      }
      for (let t = 0; t < f.length; t++) f[t] = f[t] / g;
      (h.envMap.value = t.texture),
        (h.samples.value = m),
        (h.weights.value = f),
        (h.latitudinal.value = "latitudinal" === s),
        o && (h.poleAxis.value = o),
        (h.dTheta.value = d),
        (h.mipInt.value = 8 - n);
      const v = Sr[i];
      Nr(
        e,
        3 * Math.max(0, vr - 2 * v),
        (0 === i ? 0 : 2 * vr) + 2 * v * (i > 4 ? i - 8 + 4 : 0),
        3 * v,
        2 * v
      ),
        a.setRenderTarget(e),
        a.render(c, wr);
    }
  }
  function Dr() {
    const t = [],
      e = [],
      n = [];
    let i = 8;
    for (let r = 0; r < _r; r++) {
      const s = Math.pow(2, i);
      e.push(s);
      let o = 1 / s;
      r > 4 ? (o = xr[r - 8 + 4 - 1]) : 0 == r && (o = 0), n.push(o);
      const a = 1 / (s - 1),
        l = -a / 2,
        c = 1 + a / 2,
        h = [l, l, c, l, c, c, l, l, c, c, l, c],
        u = 6,
        d = 6,
        p = 3,
        m = 2,
        f = 1,
        g = new Float32Array(p * d * u),
        v = new Float32Array(m * d * u),
        x = new Float32Array(f * d * u);
      for (let t = 0; t < u; t++) {
        const e = ((t % 3) * 2) / 3 - 1,
          n = t > 2 ? 0 : -1,
          i = [
            e,
            n,
            0,
            e + 2 / 3,
            n,
            0,
            e + 2 / 3,
            n + 1,
            0,
            e,
            n,
            0,
            e + 2 / 3,
            n + 1,
            0,
            e,
            n + 1,
            0,
          ];
        g.set(i, p * d * t), v.set(h, m * d * t);
        const r = [t, t, t, t, t, t];
        x.set(r, f * d * t);
      }
      const _ = new _i();
      _.setAttribute("position", new li(g, p)),
        _.setAttribute("uv", new li(v, m)),
        _.setAttribute("faceIndex", new li(x, f)),
        t.push(_),
        i > 4 && i--;
    }
    return { _lodPlanes: t, _sizeLods: e, _sigmas: n };
  }
  function Ir(t) {
    const e = new De(3 * vr, 3 * vr, t);
    return (
      (e.texture.mapping = Nt),
      (e.texture.name = "PMREM.cubeUv"),
      (e.scissorTest = !0),
      e
    );
  }
  function Nr(t, e, n, i, r) {
    t.viewport.set(e, n, i, r), t.scissor.set(e, n, i, r);
  }
  function zr() {
    const t = new we(1, 1);
    return new gr({
      name: "EquirectangularToCubeUV",
      uniforms: {
        envMap: { value: null },
        texelSize: { value: t },
        inputEncoding: { value: br[3e3] },
      },
      vertexShader: Or(),
      fragmentShader: `\n\n\t\t\tprecision mediump float;\n\t\t\tprecision mediump int;\n\n\t\t\tvarying vec3 vOutputDirection;\n\n\t\t\tuniform sampler2D envMap;\n\t\t\tuniform vec2 texelSize;\n\n\t\t\t${Fr()}\n\n\t\t\t#include <common>\n\n\t\t\tvoid main() {\n\n\t\t\t\tgl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n\n\t\t\t\tvec3 outputDirection = normalize( vOutputDirection );\n\t\t\t\tvec2 uv = equirectUv( outputDirection );\n\n\t\t\t\tvec2 f = fract( uv / texelSize - 0.5 );\n\t\t\t\tuv -= f * texelSize;\n\t\t\t\tvec3 tl = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;\n\t\t\t\tuv.x += texelSize.x;\n\t\t\t\tvec3 tr = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;\n\t\t\t\tuv.y += texelSize.y;\n\t\t\t\tvec3 br = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;\n\t\t\t\tuv.x -= texelSize.x;\n\t\t\t\tvec3 bl = envMapTexelToLinear( texture2D ( envMap, uv ) ).rgb;\n\n\t\t\t\tvec3 tm = mix( tl, tr, f.x );\n\t\t\t\tvec3 bm = mix( bl, br, f.x );\n\t\t\t\tgl_FragColor.rgb = mix( tm, bm, f.y );\n\n\t\t\t}\n\t\t`,
      blending: 0,
      depthTest: !1,
      depthWrite: !1,
    });
  }
  function kr() {
    return new gr({
      name: "CubemapToCubeUV",
      uniforms: { envMap: { value: null }, inputEncoding: { value: br[3e3] } },
      vertexShader: Or(),
      fragmentShader: `\n\n\t\t\tprecision mediump float;\n\t\t\tprecision mediump int;\n\n\t\t\tvarying vec3 vOutputDirection;\n\n\t\t\tuniform samplerCube envMap;\n\n\t\t\t${Fr()}\n\n\t\t\tvoid main() {\n\n\t\t\t\tgl_FragColor = envMapTexelToLinear( textureCube( envMap, vec3( - vOutputDirection.x, vOutputDirection.yz ) ) );\n\n\t\t\t}\n\t\t`,
      blending: 0,
      depthTest: !1,
      depthWrite: !1,
    });
  }
  function Or() {
    return "\n\n\t\tprecision mediump float;\n\t\tprecision mediump int;\n\n\t\tattribute vec3 position;\n\t\tattribute vec2 uv;\n\t\tattribute float faceIndex;\n\n\t\tvarying vec3 vOutputDirection;\n\n\t\t// RH coordinate system; PMREM face-indexing convention\n\t\tvec3 getDirection( vec2 uv, float face ) {\n\n\t\t\tuv = 2.0 * uv - 1.0;\n\n\t\t\tvec3 direction = vec3( uv, 1.0 );\n\n\t\t\tif ( face == 0.0 ) {\n\n\t\t\t\tdirection = direction.zyx; // ( 1, v, u ) pos x\n\n\t\t\t} else if ( face == 1.0 ) {\n\n\t\t\t\tdirection = direction.xzy;\n\t\t\t\tdirection.xz *= -1.0; // ( -u, 1, -v ) pos y\n\n\t\t\t} else if ( face == 2.0 ) {\n\n\t\t\t\tdirection.x *= -1.0; // ( -u, v, 1 ) pos z\n\n\t\t\t} else if ( face == 3.0 ) {\n\n\t\t\t\tdirection = direction.zyx;\n\t\t\t\tdirection.xz *= -1.0; // ( -1, v, -u ) neg x\n\n\t\t\t} else if ( face == 4.0 ) {\n\n\t\t\t\tdirection = direction.xzy;\n\t\t\t\tdirection.xy *= -1.0; // ( -u, -1, v ) neg y\n\n\t\t\t} else if ( face == 5.0 ) {\n\n\t\t\t\tdirection.z *= -1.0; // ( u, v, -1 ) neg z\n\n\t\t\t}\n\n\t\t\treturn direction;\n\n\t\t}\n\n\t\tvoid main() {\n\n\t\t\tvOutputDirection = getDirection( uv, faceIndex );\n\t\t\tgl_Position = vec4( position, 1.0 );\n\n\t\t}\n\t";
  }
  function Fr() {
    return "\n\n\t\tuniform int inputEncoding;\n\n\t\t#include <encodings_pars_fragment>\n\n\t\tvec4 inputTexelToLinear( vec4 value ) {\n\n\t\t\tif ( inputEncoding == 0 ) {\n\n\t\t\t\treturn value;\n\n\t\t\t} else {\n\n\t\t\t\treturn sRGBToLinear( value );\n\n\t\t\t}\n\n\t\t}\n\n\t\tvec4 envMapTexelToLinear( vec4 color ) {\n\n\t\t\treturn inputTexelToLinear( color );\n\n\t\t}\n\t";
  }
  function Ur(t) {
    let e = new WeakMap(),
      n = null;
    function i(t) {
      const n = t.target;
      n.removeEventListener("dispose", i);
      const r = e.get(n);
      void 0 !== r && (e.delete(n), r.dispose());
    }
    return {
      get: function (r) {
        if (r && r.isTexture && !1 === r.isRenderTargetTexture) {
          const s = r.mapping,
            o = 303 === s || 304 === s,
            a = s === Dt || s === It;
          if (o || a) {
            if (e.has(r)) return e.get(r).texture;
            {
              const s = r.image;
              if (
                (o && s && s.height > 0) ||
                (a &&
                  s &&
                  (function (t) {
                    let e = 0;
                    const n = 6;
                    for (let i = 0; i < n; i++) void 0 !== t[i] && e++;
                    return e === n;
                  })(s))
              ) {
                const s = t.getRenderTarget();
                null === n && (n = new Pr(t));
                const a = o ? n.fromEquirectangular(r) : n.fromCubemap(r);
                return (
                  e.set(r, a),
                  t.setRenderTarget(s),
                  r.addEventListener("dispose", i),
                  a.texture
                );
              }
              return null;
            }
          }
        }
        return r;
      },
      dispose: function () {
        (e = new WeakMap()), null !== n && (n.dispose(), (n = null));
      },
    };
  }
  function Br(t) {
    const e = {};
    function n(n) {
      if (void 0 !== e[n]) return e[n];
      let i;
      switch (n) {
        case "WEBGL_depth_texture":
          i =
            t.getExtension("WEBGL_depth_texture") ||
            t.getExtension("MOZ_WEBGL_depth_texture") ||
            t.getExtension("WEBKIT_WEBGL_depth_texture");
          break;
        case "EXT_texture_filter_anisotropic":
          i =
            t.getExtension("EXT_texture_filter_anisotropic") ||
            t.getExtension("MOZ_EXT_texture_filter_anisotropic") ||
            t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
          break;
        case "WEBGL_compressed_texture_s3tc":
          i =
            t.getExtension("WEBGL_compressed_texture_s3tc") ||
            t.getExtension("MOZ_WEBGL_compressed_texture_s3tc") ||
            t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
          break;
        case "WEBGL_compressed_texture_pvrtc":
          i =
            t.getExtension("WEBGL_compressed_texture_pvrtc") ||
            t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
          break;
        default:
          i = t.getExtension(n);
      }
      return (e[n] = i), i;
    }
    return {
      has: function (t) {
        return null !== n(t);
      },
      init: function (t) {
        t.isWebGL2
          ? n("EXT_color_buffer_float")
          : (n("WEBGL_depth_texture"),
            n("OES_texture_float"),
            n("OES_texture_half_float"),
            n("OES_texture_half_float_linear"),
            n("OES_standard_derivatives"),
            n("OES_element_index_uint"),
            n("OES_vertex_array_object"),
            n("ANGLE_instanced_arrays")),
          n("OES_texture_float_linear"),
          n("EXT_color_buffer_half_float"),
          n("WEBGL_multisampled_render_to_texture");
      },
      get: function (t) {
        const e = n(t);
        return (
          null === e &&
            console.warn(
              "THREE.WebGLRenderer: " + t + " extension not supported."
            ),
          e
        );
      },
    };
  }
  function Hr(t, e, n, i) {
    const r = {},
      s = new WeakMap();
    function o(t) {
      const a = t.target;
      null !== a.index && e.remove(a.index);
      for (const t in a.attributes) e.remove(a.attributes[t]);
      a.removeEventListener("dispose", o), delete r[a.id];
      const l = s.get(a);
      l && (e.remove(l), s.delete(a)),
        i.releaseStatesOfGeometry(a),
        !0 === a.isInstancedBufferGeometry && delete a._maxInstanceCount,
        n.memory.geometries--;
    }
    function a(t) {
      const n = [],
        i = t.index,
        r = t.attributes.position;
      let o = 0;
      if (null !== i) {
        const t = i.array;
        o = i.version;
        for (let e = 0, i = t.length; e < i; e += 3) {
          const i = t[e + 0],
            r = t[e + 1],
            s = t[e + 2];
          n.push(i, r, r, s, s, i);
        }
      } else {
        const t = r.array;
        o = r.version;
        for (let e = 0, i = t.length / 3 - 1; e < i; e += 3) {
          const t = e + 0,
            i = e + 1,
            r = e + 2;
          n.push(t, i, i, r, r, t);
        }
      }
      const a = new (Se(n) > 65535 ? hi : ci)(n, 1);
      a.version = o;
      const l = s.get(t);
      l && e.remove(l), s.set(t, a);
    }
    return {
      get: function (t, e) {
        return (
          !0 === r[e.id] ||
            (e.addEventListener("dispose", o),
            (r[e.id] = !0),
            n.memory.geometries++),
          e
        );
      },
      update: function (t) {
        const n = t.attributes;
        for (const t in n) e.update(n[t], 34962);
        const i = t.morphAttributes;
        for (const t in i) {
          const n = i[t];
          for (let t = 0, i = n.length; t < i; t++) e.update(n[t], 34962);
        }
      },
      getWireframeAttribute: function (t) {
        const e = s.get(t);
        if (e) {
          const n = t.index;
          null !== n && e.version < n.version && a(t);
        } else a(t);
        return s.get(t);
      },
    };
  }
  function Gr(t, e, n, i) {
    const r = i.isWebGL2;
    let s, o, a;
    (this.setMode = function (t) {
      s = t;
    }),
      (this.setIndex = function (t) {
        (o = t.type), (a = t.bytesPerElement);
      }),
      (this.render = function (e, i) {
        t.drawElements(s, i, o, e * a), n.update(i, s, 1);
      }),
      (this.renderInstances = function (i, l, c) {
        if (0 === c) return;
        let h, u;
        if (r) (h = t), (u = "drawElementsInstanced");
        else if (
          ((h = e.get("ANGLE_instanced_arrays")),
          (u = "drawElementsInstancedANGLE"),
          null === h)
        )
          return void console.error(
            "THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays."
          );
        h[u](s, l, o, i * a, c), n.update(l, s, c);
      });
  }
  function Vr(t) {
    const e = { frame: 0, calls: 0, triangles: 0, points: 0, lines: 0 };
    return {
      memory: { geometries: 0, textures: 0 },
      render: e,
      programs: null,
      autoReset: !0,
      reset: function () {
        e.frame++,
          (e.calls = 0),
          (e.triangles = 0),
          (e.points = 0),
          (e.lines = 0);
      },
      update: function (t, n, i) {
        switch ((e.calls++, n)) {
          case 4:
            e.triangles += i * (t / 3);
            break;
          case 1:
            e.lines += i * (t / 2);
            break;
          case 3:
            e.lines += i * (t - 1);
            break;
          case 2:
            e.lines += i * t;
            break;
          case 0:
            e.points += i * t;
            break;
          default:
            console.error("THREE.WebGLInfo: Unknown draw mode:", n);
        }
      },
    };
  }
  class Wr extends Re {
    constructor(t = null, e = 1, n = 1, i = 1) {
      super(null),
        (this.image = { data: t, width: e, height: n, depth: i }),
        (this.magFilter = Ft),
        (this.minFilter = Ft),
        (this.wrapR = kt),
        (this.generateMipmaps = !1),
        (this.flipY = !1),
        (this.unpackAlignment = 1);
    }
  }
  function jr(t, e) {
    return t[0] - e[0];
  }
  function Zr(t, e) {
    return Math.abs(e[1]) - Math.abs(t[1]);
  }
  function Yr(t, e) {
    let n = 1;
    const i = e.isInterleavedBufferAttribute ? e.data.array : e.array;
    i instanceof Int8Array
      ? (n = 127)
      : i instanceof Int16Array
      ? (n = 32767)
      : i instanceof Int32Array
      ? (n = 2147483647)
      : console.error(
          "THREE.WebGLMorphtargets: Unsupported morph attribute data type: ",
          i
        ),
      t.divideScalar(n);
  }
  function Xr(t, e, n) {
    const i = {},
      r = new Float32Array(8),
      s = new WeakMap(),
      o = new ze(),
      a = [];
    for (let t = 0; t < 8; t++) a[t] = [t, 0];
    return {
      update: function (l, c, h, u) {
        const d = l.morphTargetInfluences;
        if (!0 === e.isWebGL2) {
          const i = c.morphAttributes.position.length;
          let r = s.get(c);
          if (void 0 === r || r.count !== i) {
            void 0 !== r && r.texture.dispose();
            const t = void 0 !== c.morphAttributes.normal,
              n = c.morphAttributes.position,
              a = c.morphAttributes.normal || [],
              l = !0 === t ? 2 : 1;
            let h = c.attributes.position.count * l,
              u = 1;
            h > e.maxTextureSize &&
              ((u = Math.ceil(h / e.maxTextureSize)), (h = e.maxTextureSize));
            const d = new Float32Array(h * u * 4 * i),
              p = new Wr(d, h, u, i);
            (p.format = Qt), (p.type = Yt), (p.needsUpdate = !0);
            const m = 4 * l;
            for (let e = 0; e < i; e++) {
              const i = n[e],
                r = a[e],
                s = h * u * 4 * e;
              for (let e = 0; e < i.count; e++) {
                o.fromBufferAttribute(i, e), !0 === i.normalized && Yr(o, i);
                const n = e * m;
                (d[s + n + 0] = o.x),
                  (d[s + n + 1] = o.y),
                  (d[s + n + 2] = o.z),
                  (d[s + n + 3] = 0),
                  !0 === t &&
                    (o.fromBufferAttribute(r, e),
                    !0 === r.normalized && Yr(o, r),
                    (d[s + n + 4] = o.x),
                    (d[s + n + 5] = o.y),
                    (d[s + n + 6] = o.z),
                    (d[s + n + 7] = 0));
              }
            }
            (r = { count: i, texture: p, size: new we(h, u) }), s.set(c, r);
          }
          let a = 0;
          for (let t = 0; t < d.length; t++) a += d[t];
          const l = c.morphTargetsRelative ? 1 : 1 - a;
          u.getUniforms().setValue(t, "morphTargetBaseInfluence", l),
            u.getUniforms().setValue(t, "morphTargetInfluences", d),
            u.getUniforms().setValue(t, "morphTargetsTexture", r.texture, n),
            u.getUniforms().setValue(t, "morphTargetsTextureSize", r.size);
        } else {
          const e = void 0 === d ? 0 : d.length;
          let n = i[c.id];
          if (void 0 === n || n.length !== e) {
            n = [];
            for (let t = 0; t < e; t++) n[t] = [t, 0];
            i[c.id] = n;
          }
          for (let t = 0; t < e; t++) {
            const e = n[t];
            (e[0] = t), (e[1] = d[t]);
          }
          n.sort(Zr);
          for (let t = 0; t < 8; t++)
            t < e && n[t][1]
              ? ((a[t][0] = n[t][0]), (a[t][1] = n[t][1]))
              : ((a[t][0] = Number.MAX_SAFE_INTEGER), (a[t][1] = 0));
          a.sort(jr);
          const s = c.morphAttributes.position,
            o = c.morphAttributes.normal;
          let l = 0;
          for (let t = 0; t < 8; t++) {
            const e = a[t],
              n = e[0],
              i = e[1];
            n !== Number.MAX_SAFE_INTEGER && i
              ? (s &&
                  c.getAttribute("morphTarget" + t) !== s[n] &&
                  c.setAttribute("morphTarget" + t, s[n]),
                o &&
                  c.getAttribute("morphNormal" + t) !== o[n] &&
                  c.setAttribute("morphNormal" + t, o[n]),
                (r[t] = i),
                (l += i))
              : (s &&
                  !0 === c.hasAttribute("morphTarget" + t) &&
                  c.deleteAttribute("morphTarget" + t),
                o &&
                  !0 === c.hasAttribute("morphNormal" + t) &&
                  c.deleteAttribute("morphNormal" + t),
                (r[t] = 0));
          }
          const h = c.morphTargetsRelative ? 1 : 1 - l;
          u.getUniforms().setValue(t, "morphTargetBaseInfluence", h),
            u.getUniforms().setValue(t, "morphTargetInfluences", r);
        }
      },
    };
  }
  function qr(t, e, n, i) {
    let r = new WeakMap();
    function s(t) {
      const e = t.target;
      e.removeEventListener("dispose", s),
        n.remove(e.instanceMatrix),
        null !== e.instanceColor && n.remove(e.instanceColor);
    }
    return {
      update: function (t) {
        const o = i.render.frame,
          a = t.geometry,
          l = e.get(t, a);
        return (
          r.get(l) !== o && (e.update(l), r.set(l, o)),
          t.isInstancedMesh &&
            (!1 === t.hasEventListener("dispose", s) &&
              t.addEventListener("dispose", s),
            n.update(t.instanceMatrix, 34962),
            null !== t.instanceColor && n.update(t.instanceColor, 34962)),
          l
        );
      },
      dispose: function () {
        r = new WeakMap();
      },
    };
  }
  Wr.prototype.isDataTexture2DArray = !0;
  class Jr extends Re {
    constructor(t = null, e = 1, n = 1, i = 1) {
      super(null),
        (this.image = { data: t, width: e, height: n, depth: i }),
        (this.magFilter = Ft),
        (this.minFilter = Ft),
        (this.wrapR = kt),
        (this.generateMipmaps = !1),
        (this.flipY = !1),
        (this.unpackAlignment = 1);
    }
  }
  Jr.prototype.isDataTexture3D = !0;
  const Qr = new Re(),
    Kr = new Wr(),
    $r = new Jr(),
    ts = new Xi(),
    es = [],
    ns = [],
    is = new Float32Array(16),
    rs = new Float32Array(9),
    ss = new Float32Array(4);
  function os(t, e, n) {
    const i = t[0];
    if (i <= 0 || i > 0) return t;
    const r = e * n;
    let s = es[r];
    if ((void 0 === s && ((s = new Float32Array(r)), (es[r] = s)), 0 !== e)) {
      i.toArray(s, 0);
      for (let i = 1, r = 0; i !== e; ++i) (r += n), t[i].toArray(s, r);
    }
    return s;
  }
  function as(t, e) {
    if (t.length !== e.length) return !1;
    for (let n = 0, i = t.length; n < i; n++) if (t[n] !== e[n]) return !1;
    return !0;
  }
  function ls(t, e) {
    for (let n = 0, i = e.length; n < i; n++) t[n] = e[n];
  }
  function cs(t, e) {
    let n = ns[e];
    void 0 === n && ((n = new Int32Array(e)), (ns[e] = n));
    for (let i = 0; i !== e; ++i) n[i] = t.allocateTextureUnit();
    return n;
  }
  function hs(t, e) {
    const n = this.cache;
    n[0] !== e && (t.uniform1f(this.addr, e), (n[0] = e));
  }
  function us(t, e) {
    const n = this.cache;
    if (void 0 !== e.x)
      (n[0] === e.x && n[1] === e.y) ||
        (t.uniform2f(this.addr, e.x, e.y), (n[0] = e.x), (n[1] = e.y));
    else {
      if (as(n, e)) return;
      t.uniform2fv(this.addr, e), ls(n, e);
    }
  }
  function ds(t, e) {
    const n = this.cache;
    if (void 0 !== e.x)
      (n[0] === e.x && n[1] === e.y && n[2] === e.z) ||
        (t.uniform3f(this.addr, e.x, e.y, e.z),
        (n[0] = e.x),
        (n[1] = e.y),
        (n[2] = e.z));
    else if (void 0 !== e.r)
      (n[0] === e.r && n[1] === e.g && n[2] === e.b) ||
        (t.uniform3f(this.addr, e.r, e.g, e.b),
        (n[0] = e.r),
        (n[1] = e.g),
        (n[2] = e.b));
    else {
      if (as(n, e)) return;
      t.uniform3fv(this.addr, e), ls(n, e);
    }
  }
  function ps(t, e) {
    const n = this.cache;
    if (void 0 !== e.x)
      (n[0] === e.x && n[1] === e.y && n[2] === e.z && n[3] === e.w) ||
        (t.uniform4f(this.addr, e.x, e.y, e.z, e.w),
        (n[0] = e.x),
        (n[1] = e.y),
        (n[2] = e.z),
        (n[3] = e.w));
    else {
      if (as(n, e)) return;
      t.uniform4fv(this.addr, e), ls(n, e);
    }
  }
  function ms(t, e) {
    const n = this.cache,
      i = e.elements;
    if (void 0 === i) {
      if (as(n, e)) return;
      t.uniformMatrix2fv(this.addr, !1, e), ls(n, e);
    } else {
      if (as(n, i)) return;
      ss.set(i), t.uniformMatrix2fv(this.addr, !1, ss), ls(n, i);
    }
  }
  function fs(t, e) {
    const n = this.cache,
      i = e.elements;
    if (void 0 === i) {
      if (as(n, e)) return;
      t.uniformMatrix3fv(this.addr, !1, e), ls(n, e);
    } else {
      if (as(n, i)) return;
      rs.set(i), t.uniformMatrix3fv(this.addr, !1, rs), ls(n, i);
    }
  }
  function gs(t, e) {
    const n = this.cache,
      i = e.elements;
    if (void 0 === i) {
      if (as(n, e)) return;
      t.uniformMatrix4fv(this.addr, !1, e), ls(n, e);
    } else {
      if (as(n, i)) return;
      is.set(i), t.uniformMatrix4fv(this.addr, !1, is), ls(n, i);
    }
  }
  function vs(t, e) {
    const n = this.cache;
    n[0] !== e && (t.uniform1i(this.addr, e), (n[0] = e));
  }
  function xs(t, e) {
    const n = this.cache;
    as(n, e) || (t.uniform2iv(this.addr, e), ls(n, e));
  }
  function _s(t, e) {
    const n = this.cache;
    as(n, e) || (t.uniform3iv(this.addr, e), ls(n, e));
  }
  function ys(t, e) {
    const n = this.cache;
    as(n, e) || (t.uniform4iv(this.addr, e), ls(n, e));
  }
  function bs(t, e) {
    const n = this.cache;
    n[0] !== e && (t.uniform1ui(this.addr, e), (n[0] = e));
  }
  function ws(t, e) {
    const n = this.cache;
    as(n, e) || (t.uniform2uiv(this.addr, e), ls(n, e));
  }
  function Ms(t, e) {
    const n = this.cache;
    as(n, e) || (t.uniform3uiv(this.addr, e), ls(n, e));
  }
  function Ss(t, e) {
    const n = this.cache;
    as(n, e) || (t.uniform4uiv(this.addr, e), ls(n, e));
  }
  function Ts(t, e, n) {
    const i = this.cache,
      r = n.allocateTextureUnit();
    i[0] !== r && (t.uniform1i(this.addr, r), (i[0] = r)),
      n.safeSetTexture2D(e || Qr, r);
  }
  function Es(t, e, n) {
    const i = this.cache,
      r = n.allocateTextureUnit();
    i[0] !== r && (t.uniform1i(this.addr, r), (i[0] = r)),
      n.setTexture3D(e || $r, r);
  }
  function As(t, e, n) {
    const i = this.cache,
      r = n.allocateTextureUnit();
    i[0] !== r && (t.uniform1i(this.addr, r), (i[0] = r)),
      n.safeSetTextureCube(e || ts, r);
  }
  function Ls(t, e, n) {
    const i = this.cache,
      r = n.allocateTextureUnit();
    i[0] !== r && (t.uniform1i(this.addr, r), (i[0] = r)),
      n.setTexture2DArray(e || Kr, r);
  }
  function Rs(t, e) {
    t.uniform1fv(this.addr, e);
  }
  function Cs(t, e) {
    const n = os(e, this.size, 2);
    t.uniform2fv(this.addr, n);
  }
  function Ps(t, e) {
    const n = os(e, this.size, 3);
    t.uniform3fv(this.addr, n);
  }
  function Ds(t, e) {
    const n = os(e, this.size, 4);
    t.uniform4fv(this.addr, n);
  }
  function Is(t, e) {
    const n = os(e, this.size, 4);
    t.uniformMatrix2fv(this.addr, !1, n);
  }
  function Ns(t, e) {
    const n = os(e, this.size, 9);
    t.uniformMatrix3fv(this.addr, !1, n);
  }
  function zs(t, e) {
    const n = os(e, this.size, 16);
    t.uniformMatrix4fv(this.addr, !1, n);
  }
  function ks(t, e) {
    t.uniform1iv(this.addr, e);
  }
  function Os(t, e) {
    t.uniform2iv(this.addr, e);
  }
  function Fs(t, e) {
    t.uniform3iv(this.addr, e);
  }
  function Us(t, e) {
    t.uniform4iv(this.addr, e);
  }
  function Bs(t, e) {
    t.uniform1uiv(this.addr, e);
  }
  function Hs(t, e) {
    t.uniform2uiv(this.addr, e);
  }
  function Gs(t, e) {
    t.uniform3uiv(this.addr, e);
  }
  function Vs(t, e) {
    t.uniform4uiv(this.addr, e);
  }
  function Ws(t, e, n) {
    const i = e.length,
      r = cs(n, i);
    t.uniform1iv(this.addr, r);
    for (let t = 0; t !== i; ++t) n.safeSetTexture2D(e[t] || Qr, r[t]);
  }
  function js(t, e, n) {
    const i = e.length,
      r = cs(n, i);
    t.uniform1iv(this.addr, r);
    for (let t = 0; t !== i; ++t) n.setTexture3D(e[t] || $r, r[t]);
  }
  function Zs(t, e, n) {
    const i = e.length,
      r = cs(n, i);
    t.uniform1iv(this.addr, r);
    for (let t = 0; t !== i; ++t) n.safeSetTextureCube(e[t] || ts, r[t]);
  }
  function Ys(t, e, n) {
    const i = e.length,
      r = cs(n, i);
    t.uniform1iv(this.addr, r);
    for (let t = 0; t !== i; ++t) n.setTexture2DArray(e[t] || Kr, r[t]);
  }
  function Xs(t, e, n) {
    (this.id = t),
      (this.addr = n),
      (this.cache = []),
      (this.setValue = (function (t) {
        switch (t) {
          case 5126:
            return hs;
          case 35664:
            return us;
          case 35665:
            return ds;
          case 35666:
            return ps;
          case 35674:
            return ms;
          case 35675:
            return fs;
          case 35676:
            return gs;
          case 5124:
          case 35670:
            return vs;
          case 35667:
          case 35671:
            return xs;
          case 35668:
          case 35672:
            return _s;
          case 35669:
          case 35673:
            return ys;
          case 5125:
            return bs;
          case 36294:
            return ws;
          case 36295:
            return Ms;
          case 36296:
            return Ss;
          case 35678:
          case 36198:
          case 36298:
          case 36306:
          case 35682:
            return Ts;
          case 35679:
          case 36299:
          case 36307:
            return Es;
          case 35680:
          case 36300:
          case 36308:
          case 36293:
            return As;
          case 36289:
          case 36303:
          case 36311:
          case 36292:
            return Ls;
        }
      })(e.type));
  }
  function qs(t, e, n) {
    (this.id = t),
      (this.addr = n),
      (this.cache = []),
      (this.size = e.size),
      (this.setValue = (function (t) {
        switch (t) {
          case 5126:
            return Rs;
          case 35664:
            return Cs;
          case 35665:
            return Ps;
          case 35666:
            return Ds;
          case 35674:
            return Is;
          case 35675:
            return Ns;
          case 35676:
            return zs;
          case 5124:
          case 35670:
            return ks;
          case 35667:
          case 35671:
            return Os;
          case 35668:
          case 35672:
            return Fs;
          case 35669:
          case 35673:
            return Us;
          case 5125:
            return Bs;
          case 36294:
            return Hs;
          case 36295:
            return Gs;
          case 36296:
            return Vs;
          case 35678:
          case 36198:
          case 36298:
          case 36306:
          case 35682:
            return Ws;
          case 35679:
          case 36299:
          case 36307:
            return js;
          case 35680:
          case 36300:
          case 36308:
          case 36293:
            return Zs;
          case 36289:
          case 36303:
          case 36311:
          case 36292:
            return Ys;
        }
      })(e.type));
  }
  function Js(t) {
    (this.id = t), (this.seq = []), (this.map = {});
  }
  (qs.prototype.updateCache = function (t) {
    const e = this.cache;
    t instanceof Float32Array &&
      e.length !== t.length &&
      (this.cache = new Float32Array(t.length)),
      ls(e, t);
  }),
    (Js.prototype.setValue = function (t, e, n) {
      const i = this.seq;
      for (let r = 0, s = i.length; r !== s; ++r) {
        const s = i[r];
        s.setValue(t, e[s.id], n);
      }
    });
  const Qs = /(\w+)(\])?(\[|\.)?/g;
  function Ks(t, e) {
    t.seq.push(e), (t.map[e.id] = e);
  }
  function $s(t, e, n) {
    const i = t.name,
      r = i.length;
    for (Qs.lastIndex = 0; ; ) {
      const s = Qs.exec(i),
        o = Qs.lastIndex;
      let a = s[1];
      const l = "]" === s[2],
        c = s[3];
      if ((l && (a |= 0), void 0 === c || ("[" === c && o + 2 === r))) {
        Ks(n, void 0 === c ? new Xs(a, t, e) : new qs(a, t, e));
        break;
      }
      {
        let t = n.map[a];
        void 0 === t && ((t = new Js(a)), Ks(n, t)), (n = t);
      }
    }
  }
  function to(t, e) {
    (this.seq = []), (this.map = {});
    const n = t.getProgramParameter(e, 35718);
    for (let i = 0; i < n; ++i) {
      const n = t.getActiveUniform(e, i);
      $s(n, t.getUniformLocation(e, n.name), this);
    }
  }
  function eo(t, e, n) {
    const i = t.createShader(e);
    return t.shaderSource(i, n), t.compileShader(i), i;
  }
  (to.prototype.setValue = function (t, e, n, i) {
    const r = this.map[e];
    void 0 !== r && r.setValue(t, n, i);
  }),
    (to.prototype.setOptional = function (t, e, n) {
      const i = e[n];
      void 0 !== i && this.setValue(t, n, i);
    }),
    (to.upload = function (t, e, n, i) {
      for (let r = 0, s = e.length; r !== s; ++r) {
        const s = e[r],
          o = n[s.id];
        !1 !== o.needsUpdate && s.setValue(t, o.value, i);
      }
    }),
    (to.seqWithValue = function (t, e) {
      const n = [];
      for (let i = 0, r = t.length; i !== r; ++i) {
        const r = t[i];
        r.id in e && n.push(r);
      }
      return n;
    });
  let no = 0;
  function io(t) {
    switch (t) {
      case ae:
        return ["Linear", "( value )"];
      case le:
        return ["sRGB", "( value )"];
      default:
        return (
          console.warn("THREE.WebGLProgram: Unsupported encoding:", t),
          ["Linear", "( value )"]
        );
    }
  }
  function ro(t, e, n) {
    const i = t.getShaderParameter(e, 35713),
      r = t.getShaderInfoLog(e).trim();
    return i && "" === r
      ? ""
      : n.toUpperCase() +
          "\n\n" +
          r +
          "\n\n" +
          (function (t) {
            const e = t.split("\n");
            for (let t = 0; t < e.length; t++) e[t] = t + 1 + ": " + e[t];
            return e.join("\n");
          })(t.getShaderSource(e));
  }
  function so(t, e) {
    const n = io(e);
    return (
      "vec4 " +
      t +
      "( vec4 value ) { return " +
      n[0] +
      "ToLinear" +
      n[1] +
      "; }"
    );
  }
  function oo(t, e) {
    const n = io(e);
    return (
      "vec4 " + t + "( vec4 value ) { return LinearTo" + n[0] + n[1] + "; }"
    );
  }
  function ao(t, e) {
    let n;
    switch (e) {
      case 1:
        n = "Linear";
        break;
      case 2:
        n = "Reinhard";
        break;
      case 3:
        n = "OptimizedCineon";
        break;
      case 4:
        n = "ACESFilmic";
        break;
      case 5:
        n = "Custom";
        break;
      default:
        console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e),
          (n = "Linear");
    }
    return (
      "vec3 " + t + "( vec3 color ) { return " + n + "ToneMapping( color ); }"
    );
  }
  function lo(t) {
    return "" !== t;
  }
  function co(t, e) {
    return t
      .replace(/NUM_DIR_LIGHTS/g, e.numDirLights)
      .replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights)
      .replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights)
      .replace(/NUM_POINT_LIGHTS/g, e.numPointLights)
      .replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights)
      .replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows)
      .replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows)
      .replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
  }
  function ho(t, e) {
    return t
      .replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes)
      .replace(
        /UNION_CLIPPING_PLANES/g,
        e.numClippingPlanes - e.numClipIntersection
      );
  }
  const uo = /^[ \t]*#include +<([\w\d./]+)>/gm;
  function po(t) {
    return t.replace(uo, mo);
  }
  function mo(t, e) {
    const n = or[e];
    if (void 0 === n) throw new Error("Can not resolve #include <" + e + ">");
    return po(n);
  }
  const fo =
      /#pragma unroll_loop[\s]+?for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g,
    go =
      /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
  function vo(t) {
    return t.replace(go, _o).replace(fo, xo);
  }
  function xo(t, e, n, i) {
    return (
      console.warn(
        "WebGLProgram: #pragma unroll_loop shader syntax is deprecated. Please use #pragma unroll_loop_start syntax instead."
      ),
      _o(t, e, n, i)
    );
  }
  function _o(t, e, n, i) {
    let r = "";
    for (let t = parseInt(e); t < parseInt(n); t++)
      r += i
        .replace(/\[\s*i\s*\]/g, "[ " + t + " ]")
        .replace(/UNROLLED_LOOP_INDEX/g, t);
    return r;
  }
  function yo(t) {
    let e =
      "precision " +
      t.precision +
      " float;\nprecision " +
      t.precision +
      " int;";
    return (
      "highp" === t.precision
        ? (e += "\n#define HIGH_PRECISION")
        : "mediump" === t.precision
        ? (e += "\n#define MEDIUM_PRECISION")
        : "lowp" === t.precision && (e += "\n#define LOW_PRECISION"),
      e
    );
  }
  function bo(t, e, n, i) {
    const r = t.getContext(),
      s = n.defines;
    let o = n.vertexShader,
      a = n.fragmentShader;
    const l = (function (t) {
        let e = "SHADOWMAP_TYPE_BASIC";
        return (
          1 === t.shadowMapType
            ? (e = "SHADOWMAP_TYPE_PCF")
            : 2 === t.shadowMapType
            ? (e = "SHADOWMAP_TYPE_PCF_SOFT")
            : 3 === t.shadowMapType && (e = "SHADOWMAP_TYPE_VSM"),
          e
        );
      })(n),
      c = (function (t) {
        let e = "ENVMAP_TYPE_CUBE";
        if (t.envMap)
          switch (t.envMapMode) {
            case Dt:
            case It:
              e = "ENVMAP_TYPE_CUBE";
              break;
            case Nt:
            case 307:
              e = "ENVMAP_TYPE_CUBE_UV";
          }
        return e;
      })(n),
      h = (function (t) {
        let e = "ENVMAP_MODE_REFLECTION";
        if (t.envMap)
          switch (t.envMapMode) {
            case It:
            case 307:
              e = "ENVMAP_MODE_REFRACTION";
          }
        return e;
      })(n),
      u = (function (t) {
        let e = "ENVMAP_BLENDING_NONE";
        if (t.envMap)
          switch (t.combine) {
            case 0:
              e = "ENVMAP_BLENDING_MULTIPLY";
              break;
            case 1:
              e = "ENVMAP_BLENDING_MIX";
              break;
            case 2:
              e = "ENVMAP_BLENDING_ADD";
          }
        return e;
      })(n),
      d = n.isWebGL2
        ? ""
        : (function (t) {
            return [
              t.extensionDerivatives ||
              t.envMapCubeUV ||
              t.bumpMap ||
              t.tangentSpaceNormalMap ||
              t.clearcoatNormalMap ||
              t.flatShading ||
              "physical" === t.shaderID
                ? "#extension GL_OES_standard_derivatives : enable"
                : "",
              (t.extensionFragDepth || t.logarithmicDepthBuffer) &&
              t.rendererExtensionFragDepth
                ? "#extension GL_EXT_frag_depth : enable"
                : "",
              t.extensionDrawBuffers && t.rendererExtensionDrawBuffers
                ? "#extension GL_EXT_draw_buffers : require"
                : "",
              (t.extensionShaderTextureLOD || t.envMap || t.transmission) &&
              t.rendererExtensionShaderTextureLod
                ? "#extension GL_EXT_shader_texture_lod : enable"
                : "",
            ]
              .filter(lo)
              .join("\n");
          })(n),
      p = (function (t) {
        const e = [];
        for (const n in t) {
          const i = t[n];
          !1 !== i && e.push("#define " + n + " " + i);
        }
        return e.join("\n");
      })(s),
      m = r.createProgram();
    let f,
      g,
      v = n.glslVersion ? "#version " + n.glslVersion + "\n" : "";
    n.isRawShaderMaterial
      ? ((f = [p].filter(lo).join("\n")),
        f.length > 0 && (f += "\n"),
        (g = [d, p].filter(lo).join("\n")),
        g.length > 0 && (g += "\n"))
      : ((f = [
          yo(n),
          "#define SHADER_NAME " + n.shaderName,
          p,
          n.instancing ? "#define USE_INSTANCING" : "",
          n.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
          n.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "",
          "#define MAX_BONES " + n.maxBones,
          n.useFog && n.fog ? "#define USE_FOG" : "",
          n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
          n.map ? "#define USE_MAP" : "",
          n.envMap ? "#define USE_ENVMAP" : "",
          n.envMap ? "#define " + h : "",
          n.lightMap ? "#define USE_LIGHTMAP" : "",
          n.aoMap ? "#define USE_AOMAP" : "",
          n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
          n.bumpMap ? "#define USE_BUMPMAP" : "",
          n.normalMap ? "#define USE_NORMALMAP" : "",
          n.normalMap && n.objectSpaceNormalMap
            ? "#define OBJECTSPACE_NORMALMAP"
            : "",
          n.normalMap && n.tangentSpaceNormalMap
            ? "#define TANGENTSPACE_NORMALMAP"
            : "",
          n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
          n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
          n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
          n.displacementMap && n.supportsVertexTextures
            ? "#define USE_DISPLACEMENTMAP"
            : "",
          n.specularMap ? "#define USE_SPECULARMAP" : "",
          n.specularIntensityMap ? "#define USE_SPECULARINTENSITYMAP" : "",
          n.specularColorMap ? "#define USE_SPECULARCOLORMAP" : "",
          n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
          n.metalnessMap ? "#define USE_METALNESSMAP" : "",
          n.alphaMap ? "#define USE_ALPHAMAP" : "",
          n.transmission ? "#define USE_TRANSMISSION" : "",
          n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
          n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
          n.sheenColorMap ? "#define USE_SHEENCOLORMAP" : "",
          n.sheenRoughnessMap ? "#define USE_SHEENROUGHNESSMAP" : "",
          n.vertexTangents ? "#define USE_TANGENT" : "",
          n.vertexColors ? "#define USE_COLOR" : "",
          n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
          n.vertexUvs ? "#define USE_UV" : "",
          n.uvsVertexOnly ? "#define UVS_VERTEX_ONLY" : "",
          n.flatShading ? "#define FLAT_SHADED" : "",
          n.skinning ? "#define USE_SKINNING" : "",
          n.useVertexTexture ? "#define BONE_TEXTURE" : "",
          n.morphTargets ? "#define USE_MORPHTARGETS" : "",
          n.morphNormals && !1 === n.flatShading
            ? "#define USE_MORPHNORMALS"
            : "",
          n.morphTargets && n.isWebGL2 ? "#define MORPHTARGETS_TEXTURE" : "",
          n.morphTargets && n.isWebGL2
            ? "#define MORPHTARGETS_COUNT " + n.morphTargetsCount
            : "",
          n.doubleSided ? "#define DOUBLE_SIDED" : "",
          n.flipSided ? "#define FLIP_SIDED" : "",
          n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
          n.shadowMapEnabled ? "#define " + l : "",
          n.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
          n.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
          n.logarithmicDepthBuffer && n.rendererExtensionFragDepth
            ? "#define USE_LOGDEPTHBUF_EXT"
            : "",
          "uniform mat4 modelMatrix;",
          "uniform mat4 modelViewMatrix;",
          "uniform mat4 projectionMatrix;",
          "uniform mat4 viewMatrix;",
          "uniform mat3 normalMatrix;",
          "uniform vec3 cameraPosition;",
          "uniform bool isOrthographic;",
          "#ifdef USE_INSTANCING",
          "\tattribute mat4 instanceMatrix;",
          "#endif",
          "#ifdef USE_INSTANCING_COLOR",
          "\tattribute vec3 instanceColor;",
          "#endif",
          "attribute vec3 position;",
          "attribute vec3 normal;",
          "attribute vec2 uv;",
          "#ifdef USE_TANGENT",
          "\tattribute vec4 tangent;",
          "#endif",
          "#if defined( USE_COLOR_ALPHA )",
          "\tattribute vec4 color;",
          "#elif defined( USE_COLOR )",
          "\tattribute vec3 color;",
          "#endif",
          "#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )",
          "\tattribute vec3 morphTarget0;",
          "\tattribute vec3 morphTarget1;",
          "\tattribute vec3 morphTarget2;",
          "\tattribute vec3 morphTarget3;",
          "\t#ifdef USE_MORPHNORMALS",
          "\t\tattribute vec3 morphNormal0;",
          "\t\tattribute vec3 morphNormal1;",
          "\t\tattribute vec3 morphNormal2;",
          "\t\tattribute vec3 morphNormal3;",
          "\t#else",
          "\t\tattribute vec3 morphTarget4;",
          "\t\tattribute vec3 morphTarget5;",
          "\t\tattribute vec3 morphTarget6;",
          "\t\tattribute vec3 morphTarget7;",
          "\t#endif",
          "#endif",
          "#ifdef USE_SKINNING",
          "\tattribute vec4 skinIndex;",
          "\tattribute vec4 skinWeight;",
          "#endif",
          "\n",
        ]
          .filter(lo)
          .join("\n")),
        (g = [
          d,
          yo(n),
          "#define SHADER_NAME " + n.shaderName,
          p,
          n.useFog && n.fog ? "#define USE_FOG" : "",
          n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
          n.map ? "#define USE_MAP" : "",
          n.matcap ? "#define USE_MATCAP" : "",
          n.envMap ? "#define USE_ENVMAP" : "",
          n.envMap ? "#define " + c : "",
          n.envMap ? "#define " + h : "",
          n.envMap ? "#define " + u : "",
          n.lightMap ? "#define USE_LIGHTMAP" : "",
          n.aoMap ? "#define USE_AOMAP" : "",
          n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
          n.bumpMap ? "#define USE_BUMPMAP" : "",
          n.normalMap ? "#define USE_NORMALMAP" : "",
          n.normalMap && n.objectSpaceNormalMap
            ? "#define OBJECTSPACE_NORMALMAP"
            : "",
          n.normalMap && n.tangentSpaceNormalMap
            ? "#define TANGENTSPACE_NORMALMAP"
            : "",
          n.clearcoat ? "#define USE_CLEARCOAT" : "",
          n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
          n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
          n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
          n.specularMap ? "#define USE_SPECULARMAP" : "",
          n.specularIntensityMap ? "#define USE_SPECULARINTENSITYMAP" : "",
          n.specularColorMap ? "#define USE_SPECULARCOLORMAP" : "",
          n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
          n.metalnessMap ? "#define USE_METALNESSMAP" : "",
          n.alphaMap ? "#define USE_ALPHAMAP" : "",
          n.alphaTest ? "#define USE_ALPHATEST" : "",
          n.sheen ? "#define USE_SHEEN" : "",
          n.sheenColorMap ? "#define USE_SHEENCOLORMAP" : "",
          n.sheenRoughnessMap ? "#define USE_SHEENROUGHNESSMAP" : "",
          n.transmission ? "#define USE_TRANSMISSION" : "",
          n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
          n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
          n.vertexTangents ? "#define USE_TANGENT" : "",
          n.vertexColors || n.instancingColor ? "#define USE_COLOR" : "",
          n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
          n.vertexUvs ? "#define USE_UV" : "",
          n.uvsVertexOnly ? "#define UVS_VERTEX_ONLY" : "",
          n.gradientMap ? "#define USE_GRADIENTMAP" : "",
          n.flatShading ? "#define FLAT_SHADED" : "",
          n.doubleSided ? "#define DOUBLE_SIDED" : "",
          n.flipSided ? "#define FLIP_SIDED" : "",
          n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
          n.shadowMapEnabled ? "#define " + l : "",
          n.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
          n.physicallyCorrectLights ? "#define PHYSICALLY_CORRECT_LIGHTS" : "",
          n.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
          n.logarithmicDepthBuffer && n.rendererExtensionFragDepth
            ? "#define USE_LOGDEPTHBUF_EXT"
            : "",
          (n.extensionShaderTextureLOD || n.envMap) &&
          n.rendererExtensionShaderTextureLod
            ? "#define TEXTURE_LOD_EXT"
            : "",
          "uniform mat4 viewMatrix;",
          "uniform vec3 cameraPosition;",
          "uniform bool isOrthographic;",
          0 !== n.toneMapping ? "#define TONE_MAPPING" : "",
          0 !== n.toneMapping ? or.tonemapping_pars_fragment : "",
          0 !== n.toneMapping ? ao("toneMapping", n.toneMapping) : "",
          n.dithering ? "#define DITHERING" : "",
          n.format === Jt ? "#define OPAQUE" : "",
          or.encodings_pars_fragment,
          n.map ? so("mapTexelToLinear", n.mapEncoding) : "",
          n.matcap ? so("matcapTexelToLinear", n.matcapEncoding) : "",
          n.envMap ? so("envMapTexelToLinear", n.envMapEncoding) : "",
          n.emissiveMap
            ? so("emissiveMapTexelToLinear", n.emissiveMapEncoding)
            : "",
          n.specularColorMap
            ? so("specularColorMapTexelToLinear", n.specularColorMapEncoding)
            : "",
          n.sheenColorMap
            ? so("sheenColorMapTexelToLinear", n.sheenColorMapEncoding)
            : "",
          n.lightMap ? so("lightMapTexelToLinear", n.lightMapEncoding) : "",
          oo("linearToOutputTexel", n.outputEncoding),
          n.depthPacking ? "#define DEPTH_PACKING " + n.depthPacking : "",
          "\n",
        ]
          .filter(lo)
          .join("\n"))),
      (o = po(o)),
      (o = co(o, n)),
      (o = ho(o, n)),
      (a = po(a)),
      (a = co(a, n)),
      (a = ho(a, n)),
      (o = vo(o)),
      (a = vo(a)),
      n.isWebGL2 &&
        !0 !== n.isRawShaderMaterial &&
        ((v = "#version 300 es\n"),
        (f =
          [
            "precision mediump sampler2DArray;",
            "#define attribute in",
            "#define varying out",
            "#define texture2D texture",
          ].join("\n") +
          "\n" +
          f),
        (g =
          [
            "#define varying in",
            n.glslVersion === de
              ? ""
              : "layout(location = 0) out highp vec4 pc_fragColor;",
            n.glslVersion === de ? "" : "#define gl_FragColor pc_fragColor",
            "#define gl_FragDepthEXT gl_FragDepth",
            "#define texture2D texture",
            "#define textureCube texture",
            "#define texture2DProj textureProj",
            "#define texture2DLodEXT textureLod",
            "#define texture2DProjLodEXT textureProjLod",
            "#define textureCubeLodEXT textureLod",
            "#define texture2DGradEXT textureGrad",
            "#define texture2DProjGradEXT textureProjGrad",
            "#define textureCubeGradEXT textureGrad",
          ].join("\n") +
          "\n" +
          g));
    const x = v + g + a,
      _ = eo(r, 35633, v + f + o),
      y = eo(r, 35632, x);
    if (
      (r.attachShader(m, _),
      r.attachShader(m, y),
      void 0 !== n.index0AttributeName
        ? r.bindAttribLocation(m, 0, n.index0AttributeName)
        : !0 === n.morphTargets && r.bindAttribLocation(m, 0, "position"),
      r.linkProgram(m),
      t.debug.checkShaderErrors)
    ) {
      const t = r.getProgramInfoLog(m).trim(),
        e = r.getShaderInfoLog(_).trim(),
        n = r.getShaderInfoLog(y).trim();
      let i = !0,
        s = !0;
      if (!1 === r.getProgramParameter(m, 35714)) {
        i = !1;
        const e = ro(r, _, "vertex"),
          n = ro(r, y, "fragment");
        console.error(
          "THREE.WebGLProgram: Shader Error " +
            r.getError() +
            " - VALIDATE_STATUS " +
            r.getProgramParameter(m, 35715) +
            "\n\nProgram Info Log: " +
            t +
            "\n" +
            e +
            "\n" +
            n
        );
      } else
        "" !== t
          ? console.warn("THREE.WebGLProgram: Program Info Log:", t)
          : ("" !== e && "" !== n) || (s = !1);
      s &&
        (this.diagnostics = {
          runnable: i,
          programLog: t,
          vertexShader: { log: e, prefix: f },
          fragmentShader: { log: n, prefix: g },
        });
    }
    let b, w;
    return (
      r.deleteShader(_),
      r.deleteShader(y),
      (this.getUniforms = function () {
        return void 0 === b && (b = new to(r, m)), b;
      }),
      (this.getAttributes = function () {
        return (
          void 0 === w &&
            (w = (function (t, e) {
              const n = {},
                i = t.getProgramParameter(e, 35721);
              for (let r = 0; r < i; r++) {
                const i = t.getActiveAttrib(e, r),
                  s = i.name;
                let o = 1;
                35674 === i.type && (o = 2),
                  35675 === i.type && (o = 3),
                  35676 === i.type && (o = 4),
                  (n[s] = {
                    type: i.type,
                    location: t.getAttribLocation(e, s),
                    locationSize: o,
                  });
              }
              return n;
            })(r, m)),
          w
        );
      }),
      (this.destroy = function () {
        i.releaseStatesOfProgram(this),
          r.deleteProgram(m),
          (this.program = void 0);
      }),
      (this.name = n.shaderName),
      (this.id = no++),
      (this.cacheKey = e),
      (this.usedTimes = 1),
      (this.program = m),
      (this.vertexShader = _),
      (this.fragmentShader = y),
      this
    );
  }
  let wo = 0;
  class Mo {
    constructor() {
      (this.shaderCache = new Map()), (this.materialCache = new Map());
    }
    update(t) {
      const e = t.vertexShader,
        n = t.fragmentShader,
        i = this._getShaderStage(e),
        r = this._getShaderStage(n),
        s = this._getShaderCacheForMaterial(t);
      return (
        !1 === s.has(i) && (s.add(i), i.usedTimes++),
        !1 === s.has(r) && (s.add(r), r.usedTimes++),
        this
      );
    }
    remove(t) {
      const e = this.materialCache.get(t);
      for (const t of e)
        t.usedTimes--, 0 === t.usedTimes && this.shaderCache.delete(t);
      return this.materialCache.delete(t), this;
    }
    getVertexShaderID(t) {
      return this._getShaderStage(t.vertexShader).id;
    }
    getFragmentShaderID(t) {
      return this._getShaderStage(t.fragmentShader).id;
    }
    dispose() {
      this.shaderCache.clear(), this.materialCache.clear();
    }
    _getShaderCacheForMaterial(t) {
      const e = this.materialCache;
      return !1 === e.has(t) && e.set(t, new Set()), e.get(t);
    }
    _getShaderStage(t) {
      const e = this.shaderCache;
      if (!1 === e.has(t)) {
        const n = new So();
        e.set(t, n);
      }
      return e.get(t);
    }
  }
  class So {
    constructor() {
      (this.id = wo++), (this.usedTimes = 0);
    }
  }
  function To(t, e, n, i, r, s, o) {
    const a = new Sn(),
      l = new Mo(),
      c = [],
      h = r.isWebGL2,
      u = r.logarithmicDepthBuffer,
      d = r.floatVertexTextures,
      p = r.maxVertexUniforms,
      m = r.vertexTextures;
    let f = r.precision;
    const g = {
      MeshDepthMaterial: "depth",
      MeshDistanceMaterial: "distanceRGBA",
      MeshNormalMaterial: "normal",
      MeshBasicMaterial: "basic",
      MeshLambertMaterial: "lambert",
      MeshPhongMaterial: "phong",
      MeshToonMaterial: "toon",
      MeshStandardMaterial: "physical",
      MeshPhysicalMaterial: "physical",
      MeshMatcapMaterial: "matcap",
      LineBasicMaterial: "basic",
      LineDashedMaterial: "dashed",
      PointsMaterial: "points",
      ShadowMaterial: "shadow",
      SpriteMaterial: "sprite",
    };
    function v(t) {
      let e;
      return (
        t && t.isTexture
          ? (e = t.encoding)
          : t && t.isWebGLRenderTarget
          ? (console.warn(
              "THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead."
            ),
            (e = t.texture.encoding))
          : (e = ae),
        h &&
          t &&
          t.isTexture &&
          t.format === Qt &&
          t.type === Wt &&
          t.encoding === le &&
          (e = ae),
        e
      );
    }
    return {
      getParameters: function (s, a, c, x, _) {
        const y = x.fog,
          b = s.isMeshStandardMaterial ? x.environment : null,
          w = (s.isMeshStandardMaterial ? n : e).get(s.envMap || b),
          M = g[s.type],
          S = _.isSkinnedMesh
            ? (function (t) {
                const e = t.skeleton.bones;
                if (d) return 1024;
                {
                  const t = p,
                    n = Math.floor((t - 20) / 4),
                    i = Math.min(n, e.length);
                  return i < e.length
                    ? (console.warn(
                        "THREE.WebGLRenderer: Skeleton has " +
                          e.length +
                          " bones. This GPU supports " +
                          i +
                          "."
                      ),
                      0)
                    : i;
                }
              })(_)
            : 0;
        let T, E, A, L;
        if (
          (null !== s.precision &&
            ((f = r.getMaxPrecision(s.precision)),
            f !== s.precision &&
              console.warn(
                "THREE.WebGLProgram.getParameters:",
                s.precision,
                "not supported, using",
                f,
                "instead."
              )),
          M)
        ) {
          const t = lr[M];
          (T = t.vertexShader), (E = t.fragmentShader);
        } else
          (T = s.vertexShader),
            (E = s.fragmentShader),
            l.update(s),
            (A = l.getVertexShaderID(s)),
            (L = l.getFragmentShaderID(s));
        const R = t.getRenderTarget(),
          C = s.alphaTest > 0,
          P = s.clearcoat > 0;
        return {
          isWebGL2: h,
          shaderID: M,
          shaderName: s.type,
          vertexShader: T,
          fragmentShader: E,
          defines: s.defines,
          customVertexShaderID: A,
          customFragmentShaderID: L,
          isRawShaderMaterial: !0 === s.isRawShaderMaterial,
          glslVersion: s.glslVersion,
          precision: f,
          instancing: !0 === _.isInstancedMesh,
          instancingColor: !0 === _.isInstancedMesh && null !== _.instanceColor,
          supportsVertexTextures: m,
          outputEncoding: null !== R ? v(R.texture) : t.outputEncoding,
          map: !!s.map,
          mapEncoding: v(s.map),
          matcap: !!s.matcap,
          matcapEncoding: v(s.matcap),
          envMap: !!w,
          envMapMode: w && w.mapping,
          envMapEncoding: v(w),
          envMapCubeUV: !!w && (w.mapping === Nt || 307 === w.mapping),
          lightMap: !!s.lightMap,
          lightMapEncoding: v(s.lightMap),
          aoMap: !!s.aoMap,
          emissiveMap: !!s.emissiveMap,
          emissiveMapEncoding: v(s.emissiveMap),
          bumpMap: !!s.bumpMap,
          normalMap: !!s.normalMap,
          objectSpaceNormalMap: 1 === s.normalMapType,
          tangentSpaceNormalMap: 0 === s.normalMapType,
          clearcoat: P,
          clearcoatMap: P && !!s.clearcoatMap,
          clearcoatRoughnessMap: P && !!s.clearcoatRoughnessMap,
          clearcoatNormalMap: P && !!s.clearcoatNormalMap,
          displacementMap: !!s.displacementMap,
          roughnessMap: !!s.roughnessMap,
          metalnessMap: !!s.metalnessMap,
          specularMap: !!s.specularMap,
          specularIntensityMap: !!s.specularIntensityMap,
          specularColorMap: !!s.specularColorMap,
          specularColorMapEncoding: v(s.specularColorMap),
          alphaMap: !!s.alphaMap,
          alphaTest: C,
          gradientMap: !!s.gradientMap,
          sheen: s.sheen > 0,
          sheenColorMap: !!s.sheenColorMap,
          sheenColorMapEncoding: v(s.sheenColorMap),
          sheenRoughnessMap: !!s.sheenRoughnessMap,
          transmission: s.transmission > 0,
          transmissionMap: !!s.transmissionMap,
          thicknessMap: !!s.thicknessMap,
          combine: s.combine,
          vertexTangents:
            !!s.normalMap && !!_.geometry && !!_.geometry.attributes.tangent,
          vertexColors: s.vertexColors,
          vertexAlphas:
            !0 === s.vertexColors &&
            !!_.geometry &&
            !!_.geometry.attributes.color &&
            4 === _.geometry.attributes.color.itemSize,
          vertexUvs: !!(
            s.map ||
            s.bumpMap ||
            s.normalMap ||
            s.specularMap ||
            s.alphaMap ||
            s.emissiveMap ||
            s.roughnessMap ||
            s.metalnessMap ||
            s.clearcoatMap ||
            s.clearcoatRoughnessMap ||
            s.clearcoatNormalMap ||
            s.displacementMap ||
            s.transmissionMap ||
            s.thicknessMap ||
            s.specularIntensityMap ||
            s.specularColorMap ||
            s.sheenColorMap ||
            s.sheenRoughnessMap
          ),
          uvsVertexOnly: !(
            s.map ||
            s.bumpMap ||
            s.normalMap ||
            s.specularMap ||
            s.alphaMap ||
            s.emissiveMap ||
            s.roughnessMap ||
            s.metalnessMap ||
            s.clearcoatNormalMap ||
            s.transmission > 0 ||
            s.transmissionMap ||
            s.thicknessMap ||
            s.specularIntensityMap ||
            s.specularColorMap ||
            s.sheen > 0 ||
            s.sheenColorMap ||
            s.sheenRoughnessMap ||
            !s.displacementMap
          ),
          fog: !!y,
          useFog: s.fog,
          fogExp2: y && y.isFogExp2,
          flatShading: !!s.flatShading,
          sizeAttenuation: s.sizeAttenuation,
          logarithmicDepthBuffer: u,
          skinning: !0 === _.isSkinnedMesh && S > 0,
          maxBones: S,
          useVertexTexture: d,
          morphTargets: !!_.geometry && !!_.geometry.morphAttributes.position,
          morphNormals: !!_.geometry && !!_.geometry.morphAttributes.normal,
          morphTargetsCount:
            _.geometry && _.geometry.morphAttributes.position
              ? _.geometry.morphAttributes.position.length
              : 0,
          numDirLights: a.directional.length,
          numPointLights: a.point.length,
          numSpotLights: a.spot.length,
          numRectAreaLights: a.rectArea.length,
          numHemiLights: a.hemi.length,
          numDirLightShadows: a.directionalShadowMap.length,
          numPointLightShadows: a.pointShadowMap.length,
          numSpotLightShadows: a.spotShadowMap.length,
          numClippingPlanes: o.numPlanes,
          numClipIntersection: o.numIntersection,
          format: s.format,
          dithering: s.dithering,
          shadowMapEnabled: t.shadowMap.enabled && c.length > 0,
          shadowMapType: t.shadowMap.type,
          toneMapping: s.toneMapped ? t.toneMapping : 0,
          physicallyCorrectLights: t.physicallyCorrectLights,
          premultipliedAlpha: s.premultipliedAlpha,
          doubleSided: 2 === s.side,
          flipSided: 1 === s.side,
          depthPacking: void 0 !== s.depthPacking && s.depthPacking,
          index0AttributeName: s.index0AttributeName,
          extensionDerivatives: s.extensions && s.extensions.derivatives,
          extensionFragDepth: s.extensions && s.extensions.fragDepth,
          extensionDrawBuffers: s.extensions && s.extensions.drawBuffers,
          extensionShaderTextureLOD:
            s.extensions && s.extensions.shaderTextureLOD,
          rendererExtensionFragDepth: h || i.has("EXT_frag_depth"),
          rendererExtensionDrawBuffers: h || i.has("WEBGL_draw_buffers"),
          rendererExtensionShaderTextureLod:
            h || i.has("EXT_shader_texture_lod"),
          customProgramCacheKey: s.customProgramCacheKey(),
        };
      },
      getProgramCacheKey: function (e) {
        const n = [];
        if (
          (e.shaderID
            ? n.push(e.shaderID)
            : (n.push(e.customVertexShaderID),
              n.push(e.customFragmentShaderID)),
          void 0 !== e.defines)
        )
          for (const t in e.defines) n.push(t), n.push(e.defines[t]);
        return (
          !1 === e.isRawShaderMaterial &&
            (!(function (t, e) {
              t.push(e.precision),
                t.push(e.outputEncoding),
                t.push(e.mapEncoding),
                t.push(e.matcapEncoding),
                t.push(e.envMapMode),
                t.push(e.envMapEncoding),
                t.push(e.lightMapEncoding),
                t.push(e.emissiveMapEncoding),
                t.push(e.combine),
                t.push(e.vertexUvs),
                t.push(e.fogExp2),
                t.push(e.sizeAttenuation),
                t.push(e.maxBones),
                t.push(e.morphTargetsCount),
                t.push(e.numDirLights),
                t.push(e.numPointLights),
                t.push(e.numSpotLights),
                t.push(e.numHemiLights),
                t.push(e.numRectAreaLights),
                t.push(e.numDirLightShadows),
                t.push(e.numPointLightShadows),
                t.push(e.numSpotLightShadows),
                t.push(e.shadowMapType),
                t.push(e.toneMapping),
                t.push(e.numClippingPlanes),
                t.push(e.numClipIntersection),
                t.push(e.format),
                t.push(e.specularColorMapEncoding),
                t.push(e.sheenColorMapEncoding);
            })(n, e),
            (function (t, e) {
              a.disableAll(), e.isWebGL2 && a.enable(0);
              e.supportsVertexTextures && a.enable(1);
              e.instancing && a.enable(2);
              e.instancingColor && a.enable(3);
              e.map && a.enable(4);
              e.matcap && a.enable(5);
              e.envMap && a.enable(6);
              e.envMapCubeUV && a.enable(7);
              e.lightMap && a.enable(8);
              e.aoMap && a.enable(9);
              e.emissiveMap && a.enable(10);
              e.bumpMap && a.enable(11);
              e.normalMap && a.enable(12);
              e.objectSpaceNormalMap && a.enable(13);
              e.tangentSpaceNormalMap && a.enable(14);
              e.clearcoat && a.enable(15);
              e.clearcoatMap && a.enable(16);
              e.clearcoatRoughnessMap && a.enable(17);
              e.clearcoatNormalMap && a.enable(18);
              e.displacementMap && a.enable(19);
              e.specularMap && a.enable(20);
              e.roughnessMap && a.enable(21);
              e.metalnessMap && a.enable(22);
              e.gradientMap && a.enable(23);
              e.alphaMap && a.enable(24);
              e.alphaTest && a.enable(25);
              e.vertexColors && a.enable(26);
              e.vertexAlphas && a.enable(27);
              e.vertexUvs && a.enable(28);
              e.vertexTangents && a.enable(29);
              e.uvsVertexOnly && a.enable(30);
              e.fog && a.enable(31);
              t.push(a.mask), a.disableAll(), e.useFog && a.enable(0);
              e.flatShading && a.enable(1);
              e.logarithmicDepthBuffer && a.enable(2);
              e.skinning && a.enable(3);
              e.useVertexTexture && a.enable(4);
              e.morphTargets && a.enable(5);
              e.morphNormals && a.enable(6);
              e.premultipliedAlpha && a.enable(7);
              e.shadowMapEnabled && a.enable(8);
              e.physicallyCorrectLights && a.enable(9);
              e.doubleSided && a.enable(10);
              e.flipSided && a.enable(11);
              e.depthPacking && a.enable(12);
              e.dithering && a.enable(13);
              e.specularIntensityMap && a.enable(14);
              e.specularColorMap && a.enable(15);
              e.transmission && a.enable(16);
              e.transmissionMap && a.enable(17);
              e.thicknessMap && a.enable(18);
              e.sheen && a.enable(19);
              e.sheenColorMap && a.enable(20);
              e.sheenRoughnessMap && a.enable(21);
              t.push(a.mask);
            })(n, e),
            n.push(t.outputEncoding)),
          n.push(e.customProgramCacheKey),
          n.join()
        );
      },
      getUniforms: function (t) {
        const e = g[t.type];
        let n;
        if (e) {
          const t = lr[e];
          n = Gi.clone(t.uniforms);
        } else n = t.uniforms;
        return n;
      },
      acquireProgram: function (e, n) {
        let i;
        for (let t = 0, e = c.length; t < e; t++) {
          const e = c[t];
          if (e.cacheKey === n) {
            (i = e), ++i.usedTimes;
            break;
          }
        }
        return void 0 === i && ((i = new bo(t, n, e, s)), c.push(i)), i;
      },
      releaseProgram: function (t) {
        if (0 == --t.usedTimes) {
          const e = c.indexOf(t);
          (c[e] = c[c.length - 1]), c.pop(), t.destroy();
        }
      },
      releaseShaderCache: function (t) {
        l.remove(t);
      },
      programs: c,
      dispose: function () {
        l.dispose();
      },
    };
  }
  function Eo() {
    let t = new WeakMap();
    return {
      get: function (e) {
        let n = t.get(e);
        return void 0 === n && ((n = {}), t.set(e, n)), n;
      },
      remove: function (e) {
        t.delete(e);
      },
      update: function (e, n, i) {
        t.get(e)[n] = i;
      },
      dispose: function () {
        t = new WeakMap();
      },
    };
  }
  function Ao(t, e) {
    return t.groupOrder !== e.groupOrder
      ? t.groupOrder - e.groupOrder
      : t.renderOrder !== e.renderOrder
      ? t.renderOrder - e.renderOrder
      : t.material.id !== e.material.id
      ? t.material.id - e.material.id
      : t.z !== e.z
      ? t.z - e.z
      : t.id - e.id;
  }
  function Lo(t, e) {
    return t.groupOrder !== e.groupOrder
      ? t.groupOrder - e.groupOrder
      : t.renderOrder !== e.renderOrder
      ? t.renderOrder - e.renderOrder
      : t.z !== e.z
      ? e.z - t.z
      : t.id - e.id;
  }
  function Ro() {
    const t = [];
    let e = 0;
    const n = [],
      i = [],
      r = [];
    function s(n, i, r, s, o, a) {
      let l = t[e];
      return (
        void 0 === l
          ? ((l = {
              id: n.id,
              object: n,
              geometry: i,
              material: r,
              groupOrder: s,
              renderOrder: n.renderOrder,
              z: o,
              group: a,
            }),
            (t[e] = l))
          : ((l.id = n.id),
            (l.object = n),
            (l.geometry = i),
            (l.material = r),
            (l.groupOrder = s),
            (l.renderOrder = n.renderOrder),
            (l.z = o),
            (l.group = a)),
        e++,
        l
      );
    }
    return {
      opaque: n,
      transmissive: i,
      transparent: r,
      init: function () {
        (e = 0), (n.length = 0), (i.length = 0), (r.length = 0);
      },
      push: function (t, e, o, a, l, c) {
        const h = s(t, e, o, a, l, c);
        o.transmission > 0
          ? i.push(h)
          : !0 === o.transparent
          ? r.push(h)
          : n.push(h);
      },
      unshift: function (t, e, o, a, l, c) {
        const h = s(t, e, o, a, l, c);
        o.transmission > 0
          ? i.unshift(h)
          : !0 === o.transparent
          ? r.unshift(h)
          : n.unshift(h);
      },
      finish: function () {
        for (let n = e, i = t.length; n < i; n++) {
          const e = t[n];
          if (null === e.id) break;
          (e.id = null),
            (e.object = null),
            (e.geometry = null),
            (e.material = null),
            (e.group = null);
        }
      },
      sort: function (t, e) {
        n.length > 1 && n.sort(t || Ao),
          i.length > 1 && i.sort(e || Lo),
          r.length > 1 && r.sort(e || Lo);
      },
    };
  }
  function Co() {
    let t = new WeakMap();
    return {
      get: function (e, n) {
        let i;
        return (
          !1 === t.has(e)
            ? ((i = new Ro()), t.set(e, [i]))
            : n >= t.get(e).length
            ? ((i = new Ro()), t.get(e).push(i))
            : (i = t.get(e)[n]),
          i
        );
      },
      dispose: function () {
        t = new WeakMap();
      },
    };
  }
  function Po() {
    const t = {};
    return {
      get: function (e) {
        if (void 0 !== t[e.id]) return t[e.id];
        let n;
        switch (e.type) {
          case "DirectionalLight":
            n = { direction: new ze(), color: new ri() };
            break;
          case "SpotLight":
            n = {
              position: new ze(),
              direction: new ze(),
              color: new ri(),
              distance: 0,
              coneCos: 0,
              penumbraCos: 0,
              decay: 0,
            };
            break;
          case "PointLight":
            n = { position: new ze(), color: new ri(), distance: 0, decay: 0 };
            break;
          case "HemisphereLight":
            n = {
              direction: new ze(),
              skyColor: new ri(),
              groundColor: new ri(),
            };
            break;
          case "RectAreaLight":
            n = {
              color: new ri(),
              position: new ze(),
              halfWidth: new ze(),
              halfHeight: new ze(),
            };
        }
        return (t[e.id] = n), n;
      },
    };
  }
  let Do = 0;
  function Io(t, e) {
    return (e.castShadow ? 1 : 0) - (t.castShadow ? 1 : 0);
  }
  function No(t, e) {
    const n = new Po(),
      i = (function () {
        const t = {};
        return {
          get: function (e) {
            if (void 0 !== t[e.id]) return t[e.id];
            let n;
            switch (e.type) {
              case "DirectionalLight":
              case "SpotLight":
                n = {
                  shadowBias: 0,
                  shadowNormalBias: 0,
                  shadowRadius: 1,
                  shadowMapSize: new we(),
                };
                break;
              case "PointLight":
                n = {
                  shadowBias: 0,
                  shadowNormalBias: 0,
                  shadowRadius: 1,
                  shadowMapSize: new we(),
                  shadowCameraNear: 1,
                  shadowCameraFar: 1e3,
                };
            }
            return (t[e.id] = n), n;
          },
        };
      })(),
      r = {
        version: 0,
        hash: {
          directionalLength: -1,
          pointLength: -1,
          spotLength: -1,
          rectAreaLength: -1,
          hemiLength: -1,
          numDirectionalShadows: -1,
          numPointShadows: -1,
          numSpotShadows: -1,
        },
        ambient: [0, 0, 0],
        probe: [],
        directional: [],
        directionalShadow: [],
        directionalShadowMap: [],
        directionalShadowMatrix: [],
        spot: [],
        spotShadow: [],
        spotShadowMap: [],
        spotShadowMatrix: [],
        rectArea: [],
        rectAreaLTC1: null,
        rectAreaLTC2: null,
        point: [],
        pointShadow: [],
        pointShadowMap: [],
        pointShadowMatrix: [],
        hemi: [],
      };
    for (let t = 0; t < 9; t++) r.probe.push(new ze());
    const s = new ze(),
      o = new pn(),
      a = new pn();
    return {
      setup: function (s, o) {
        let a = 0,
          l = 0,
          c = 0;
        for (let t = 0; t < 9; t++) r.probe[t].set(0, 0, 0);
        let h = 0,
          u = 0,
          d = 0,
          p = 0,
          m = 0,
          f = 0,
          g = 0,
          v = 0;
        s.sort(Io);
        const x = !0 !== o ? Math.PI : 1;
        for (let t = 0, e = s.length; t < e; t++) {
          const e = s[t],
            o = e.color,
            _ = e.intensity,
            y = e.distance,
            b = e.shadow && e.shadow.map ? e.shadow.map.texture : null;
          if (e.isAmbientLight)
            (a += o.r * _ * x), (l += o.g * _ * x), (c += o.b * _ * x);
          else if (e.isLightProbe)
            for (let t = 0; t < 9; t++)
              r.probe[t].addScaledVector(e.sh.coefficients[t], _);
          else if (e.isDirectionalLight) {
            const t = n.get(e);
            if (
              (t.color.copy(e.color).multiplyScalar(e.intensity * x),
              e.castShadow)
            ) {
              const t = e.shadow,
                n = i.get(e);
              (n.shadowBias = t.bias),
                (n.shadowNormalBias = t.normalBias),
                (n.shadowRadius = t.radius),
                (n.shadowMapSize = t.mapSize),
                (r.directionalShadow[h] = n),
                (r.directionalShadowMap[h] = b),
                (r.directionalShadowMatrix[h] = e.shadow.matrix),
                f++;
            }
            (r.directional[h] = t), h++;
          } else if (e.isSpotLight) {
            const t = n.get(e);
            if (
              (t.position.setFromMatrixPosition(e.matrixWorld),
              t.color.copy(o).multiplyScalar(_ * x),
              (t.distance = y),
              (t.coneCos = Math.cos(e.angle)),
              (t.penumbraCos = Math.cos(e.angle * (1 - e.penumbra))),
              (t.decay = e.decay),
              e.castShadow)
            ) {
              const t = e.shadow,
                n = i.get(e);
              (n.shadowBias = t.bias),
                (n.shadowNormalBias = t.normalBias),
                (n.shadowRadius = t.radius),
                (n.shadowMapSize = t.mapSize),
                (r.spotShadow[d] = n),
                (r.spotShadowMap[d] = b),
                (r.spotShadowMatrix[d] = e.shadow.matrix),
                v++;
            }
            (r.spot[d] = t), d++;
          } else if (e.isRectAreaLight) {
            const t = n.get(e);
            t.color.copy(o).multiplyScalar(_),
              t.halfWidth.set(0.5 * e.width, 0, 0),
              t.halfHeight.set(0, 0.5 * e.height, 0),
              (r.rectArea[p] = t),
              p++;
          } else if (e.isPointLight) {
            const t = n.get(e);
            if (
              (t.color.copy(e.color).multiplyScalar(e.intensity * x),
              (t.distance = e.distance),
              (t.decay = e.decay),
              e.castShadow)
            ) {
              const t = e.shadow,
                n = i.get(e);
              (n.shadowBias = t.bias),
                (n.shadowNormalBias = t.normalBias),
                (n.shadowRadius = t.radius),
                (n.shadowMapSize = t.mapSize),
                (n.shadowCameraNear = t.camera.near),
                (n.shadowCameraFar = t.camera.far),
                (r.pointShadow[u] = n),
                (r.pointShadowMap[u] = b),
                (r.pointShadowMatrix[u] = e.shadow.matrix),
                g++;
            }
            (r.point[u] = t), u++;
          } else if (e.isHemisphereLight) {
            const t = n.get(e);
            t.skyColor.copy(e.color).multiplyScalar(_ * x),
              t.groundColor.copy(e.groundColor).multiplyScalar(_ * x),
              (r.hemi[m] = t),
              m++;
          }
        }
        p > 0 &&
          (e.isWebGL2 || !0 === t.has("OES_texture_float_linear")
            ? ((r.rectAreaLTC1 = ar.LTC_FLOAT_1),
              (r.rectAreaLTC2 = ar.LTC_FLOAT_2))
            : !0 === t.has("OES_texture_half_float_linear")
            ? ((r.rectAreaLTC1 = ar.LTC_HALF_1),
              (r.rectAreaLTC2 = ar.LTC_HALF_2))
            : console.error(
                "THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions."
              )),
          (r.ambient[0] = a),
          (r.ambient[1] = l),
          (r.ambient[2] = c);
        const _ = r.hash;
        (_.directionalLength === h &&
          _.pointLength === u &&
          _.spotLength === d &&
          _.rectAreaLength === p &&
          _.hemiLength === m &&
          _.numDirectionalShadows === f &&
          _.numPointShadows === g &&
          _.numSpotShadows === v) ||
          ((r.directional.length = h),
          (r.spot.length = d),
          (r.rectArea.length = p),
          (r.point.length = u),
          (r.hemi.length = m),
          (r.directionalShadow.length = f),
          (r.directionalShadowMap.length = f),
          (r.pointShadow.length = g),
          (r.pointShadowMap.length = g),
          (r.spotShadow.length = v),
          (r.spotShadowMap.length = v),
          (r.directionalShadowMatrix.length = f),
          (r.pointShadowMatrix.length = g),
          (r.spotShadowMatrix.length = v),
          (_.directionalLength = h),
          (_.pointLength = u),
          (_.spotLength = d),
          (_.rectAreaLength = p),
          (_.hemiLength = m),
          (_.numDirectionalShadows = f),
          (_.numPointShadows = g),
          (_.numSpotShadows = v),
          (r.version = Do++));
      },
      setupView: function (t, e) {
        let n = 0,
          i = 0,
          l = 0,
          c = 0,
          h = 0;
        const u = e.matrixWorldInverse;
        for (let e = 0, d = t.length; e < d; e++) {
          const d = t[e];
          if (d.isDirectionalLight) {
            const t = r.directional[n];
            t.direction.setFromMatrixPosition(d.matrixWorld),
              s.setFromMatrixPosition(d.target.matrixWorld),
              t.direction.sub(s),
              t.direction.transformDirection(u),
              n++;
          } else if (d.isSpotLight) {
            const t = r.spot[l];
            t.position.setFromMatrixPosition(d.matrixWorld),
              t.position.applyMatrix4(u),
              t.direction.setFromMatrixPosition(d.matrixWorld),
              s.setFromMatrixPosition(d.target.matrixWorld),
              t.direction.sub(s),
              t.direction.transformDirection(u),
              l++;
          } else if (d.isRectAreaLight) {
            const t = r.rectArea[c];
            t.position.setFromMatrixPosition(d.matrixWorld),
              t.position.applyMatrix4(u),
              a.identity(),
              o.copy(d.matrixWorld),
              o.premultiply(u),
              a.extractRotation(o),
              t.halfWidth.set(0.5 * d.width, 0, 0),
              t.halfHeight.set(0, 0.5 * d.height, 0),
              t.halfWidth.applyMatrix4(a),
              t.halfHeight.applyMatrix4(a),
              c++;
          } else if (d.isPointLight) {
            const t = r.point[i];
            t.position.setFromMatrixPosition(d.matrixWorld),
              t.position.applyMatrix4(u),
              i++;
          } else if (d.isHemisphereLight) {
            const t = r.hemi[h];
            t.direction.setFromMatrixPosition(d.matrixWorld),
              t.direction.transformDirection(u),
              t.direction.normalize(),
              h++;
          }
        }
      },
      state: r,
    };
  }
  function zo(t, e) {
    const n = new No(t, e),
      i = [],
      r = [];
    return {
      init: function () {
        (i.length = 0), (r.length = 0);
      },
      state: { lightsArray: i, shadowsArray: r, lights: n },
      setupLights: function (t) {
        n.setup(i, t);
      },
      setupLightsView: function (t) {
        n.setupView(i, t);
      },
      pushLight: function (t) {
        i.push(t);
      },
      pushShadow: function (t) {
        r.push(t);
      },
    };
  }
  function ko(t, e) {
    let n = new WeakMap();
    return {
      get: function (i, r = 0) {
        let s;
        return (
          !1 === n.has(i)
            ? ((s = new zo(t, e)), n.set(i, [s]))
            : r >= n.get(i).length
            ? ((s = new zo(t, e)), n.get(i).push(s))
            : (s = n.get(i)[r]),
          s
        );
      },
      dispose: function () {
        n = new WeakMap();
      },
    };
  }
  class Oo extends Qn {
    constructor(t) {
      super(),
        (this.type = "MeshDepthMaterial"),
        (this.depthPacking = 3200),
        (this.map = null),
        (this.alphaMap = null),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.fog = !1),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        (this.depthPacking = t.depthPacking),
        (this.map = t.map),
        (this.alphaMap = t.alphaMap),
        (this.displacementMap = t.displacementMap),
        (this.displacementScale = t.displacementScale),
        (this.displacementBias = t.displacementBias),
        (this.wireframe = t.wireframe),
        (this.wireframeLinewidth = t.wireframeLinewidth),
        this
      );
    }
  }
  Oo.prototype.isMeshDepthMaterial = !0;
  class Fo extends Qn {
    constructor(t) {
      super(),
        (this.type = "MeshDistanceMaterial"),
        (this.referencePosition = new ze()),
        (this.nearDistance = 1),
        (this.farDistance = 1e3),
        (this.map = null),
        (this.alphaMap = null),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.fog = !1),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        this.referencePosition.copy(t.referencePosition),
        (this.nearDistance = t.nearDistance),
        (this.farDistance = t.farDistance),
        (this.map = t.map),
        (this.alphaMap = t.alphaMap),
        (this.displacementMap = t.displacementMap),
        (this.displacementScale = t.displacementScale),
        (this.displacementBias = t.displacementBias),
        this
      );
    }
  }
  Fo.prototype.isMeshDistanceMaterial = !0;
  function Uo(t, e, n) {
    let i = new nr();
    const r = new we(),
      s = new we(),
      o = new Pe(),
      a = new Oo({ depthPacking: 3201 }),
      l = new Fo(),
      c = {},
      h = n.maxTextureSize,
      u = { 0: 1, 1: 0, 2: 2 },
      d = new Vi({
        defines: { VSM_SAMPLES: 8 },
        uniforms: {
          shadow_pass: { value: null },
          resolution: { value: new we() },
          radius: { value: 4 },
        },
        vertexShader:
          "void main() {\n\tgl_Position = vec4( position, 1.0 );\n}",
        fragmentShader:
          "uniform sampler2D shadow_pass;\nuniform vec2 resolution;\nuniform float radius;\n#include <packing>\nvoid main() {\n\tconst float samples = float( VSM_SAMPLES );\n\tfloat mean = 0.0;\n\tfloat squared_mean = 0.0;\n\tfloat uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );\n\tfloat uvStart = samples <= 1.0 ? 0.0 : - 1.0;\n\tfor ( float i = 0.0; i < samples; i ++ ) {\n\t\tfloat uvOffset = uvStart + i * uvStride;\n\t\t#ifdef HORIZONTAL_PASS\n\t\t\tvec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );\n\t\t\tmean += distribution.x;\n\t\t\tsquared_mean += distribution.y * distribution.y + distribution.x * distribution.x;\n\t\t#else\n\t\t\tfloat depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );\n\t\t\tmean += depth;\n\t\t\tsquared_mean += depth * depth;\n\t\t#endif\n\t}\n\tmean = mean / samples;\n\tsquared_mean = squared_mean / samples;\n\tfloat std_dev = sqrt( squared_mean - mean * mean );\n\tgl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );\n}",
      }),
      p = d.clone();
    p.defines.HORIZONTAL_PASS = 1;
    const m = new _i();
    m.setAttribute(
      "position",
      new li(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3)
    );
    const f = new Oi(m, d),
      g = this;
    function v(n, i) {
      const r = e.update(f);
      d.defines.VSM_SAMPLES !== n.blurSamples &&
        ((d.defines.VSM_SAMPLES = n.blurSamples),
        (p.defines.VSM_SAMPLES = n.blurSamples),
        (d.needsUpdate = !0),
        (p.needsUpdate = !0)),
        (d.uniforms.shadow_pass.value = n.map.texture),
        (d.uniforms.resolution.value = n.mapSize),
        (d.uniforms.radius.value = n.radius),
        t.setRenderTarget(n.mapPass),
        t.clear(),
        t.renderBufferDirect(i, null, r, d, f, null),
        (p.uniforms.shadow_pass.value = n.mapPass.texture),
        (p.uniforms.resolution.value = n.mapSize),
        (p.uniforms.radius.value = n.radius),
        t.setRenderTarget(n.map),
        t.clear(),
        t.renderBufferDirect(i, null, r, p, f, null);
    }
    function x(e, n, i, r, s, o, h) {
      let d = null;
      const p =
        !0 === r.isPointLight
          ? e.customDistanceMaterial
          : e.customDepthMaterial;
      if (
        ((d = void 0 !== p ? p : !0 === r.isPointLight ? l : a),
        (t.localClippingEnabled &&
          !0 === i.clipShadows &&
          0 !== i.clippingPlanes.length) ||
          (i.displacementMap && 0 !== i.displacementScale) ||
          (i.alphaMap && i.alphaTest > 0))
      ) {
        const t = d.uuid,
          e = i.uuid;
        let n = c[t];
        void 0 === n && ((n = {}), (c[t] = n));
        let r = n[e];
        void 0 === r && ((r = d.clone()), (n[e] = r)), (d = r);
      }
      return (
        (d.visible = i.visible),
        (d.wireframe = i.wireframe),
        (d.side =
          3 === h
            ? null !== i.shadowSide
              ? i.shadowSide
              : i.side
            : null !== i.shadowSide
            ? i.shadowSide
            : u[i.side]),
        (d.alphaMap = i.alphaMap),
        (d.alphaTest = i.alphaTest),
        (d.clipShadows = i.clipShadows),
        (d.clippingPlanes = i.clippingPlanes),
        (d.clipIntersection = i.clipIntersection),
        (d.displacementMap = i.displacementMap),
        (d.displacementScale = i.displacementScale),
        (d.displacementBias = i.displacementBias),
        (d.wireframeLinewidth = i.wireframeLinewidth),
        (d.linewidth = i.linewidth),
        !0 === r.isPointLight &&
          !0 === d.isMeshDistanceMaterial &&
          (d.referencePosition.setFromMatrixPosition(r.matrixWorld),
          (d.nearDistance = s),
          (d.farDistance = o)),
        d
      );
    }
    function _(n, r, s, o, a) {
      if (!1 === n.visible) return;
      if (
        n.layers.test(r.layers) &&
        (n.isMesh || n.isLine || n.isPoints) &&
        (n.castShadow || (n.receiveShadow && 3 === a)) &&
        (!n.frustumCulled || i.intersectsObject(n))
      ) {
        n.modelViewMatrix.multiplyMatrices(s.matrixWorldInverse, n.matrixWorld);
        const i = e.update(n),
          r = n.material;
        if (Array.isArray(r)) {
          const e = i.groups;
          for (let l = 0, c = e.length; l < c; l++) {
            const c = e[l],
              h = r[c.materialIndex];
            if (h && h.visible) {
              const e = x(n, 0, h, o, s.near, s.far, a);
              t.renderBufferDirect(s, null, i, e, n, c);
            }
          }
        } else if (r.visible) {
          const e = x(n, 0, r, o, s.near, s.far, a);
          t.renderBufferDirect(s, null, i, e, n, null);
        }
      }
      const l = n.children;
      for (let t = 0, e = l.length; t < e; t++) _(l[t], r, s, o, a);
    }
    (this.enabled = !1),
      (this.autoUpdate = !0),
      (this.needsUpdate = !1),
      (this.type = 1),
      (this.render = function (e, n, a) {
        if (!1 === g.enabled) return;
        if (!1 === g.autoUpdate && !1 === g.needsUpdate) return;
        if (0 === e.length) return;
        const l = t.getRenderTarget(),
          c = t.getActiveCubeFace(),
          u = t.getActiveMipmapLevel(),
          d = t.state;
        d.setBlending(0),
          d.buffers.color.setClear(1, 1, 1, 1),
          d.buffers.depth.setTest(!0),
          d.setScissorTest(!1);
        for (let l = 0, c = e.length; l < c; l++) {
          const c = e[l],
            u = c.shadow;
          if (void 0 === u) {
            console.warn("THREE.WebGLShadowMap:", c, "has no shadow.");
            continue;
          }
          if (!1 === u.autoUpdate && !1 === u.needsUpdate) continue;
          r.copy(u.mapSize);
          const p = u.getFrameExtents();
          if (
            (r.multiply(p),
            s.copy(u.mapSize),
            (r.x > h || r.y > h) &&
              (r.x > h &&
                ((s.x = Math.floor(h / p.x)),
                (r.x = s.x * p.x),
                (u.mapSize.x = s.x)),
              r.y > h &&
                ((s.y = Math.floor(h / p.y)),
                (r.y = s.y * p.y),
                (u.mapSize.y = s.y))),
            null === u.map && !u.isPointLightShadow && 3 === this.type)
          ) {
            const t = { minFilter: Ht, magFilter: Ht, format: Qt };
            (u.map = new De(r.x, r.y, t)),
              (u.map.texture.name = c.name + ".shadowMap"),
              (u.mapPass = new De(r.x, r.y, t)),
              u.camera.updateProjectionMatrix();
          }
          if (null === u.map) {
            const t = { minFilter: Ft, magFilter: Ft, format: Qt };
            (u.map = new De(r.x, r.y, t)),
              (u.map.texture.name = c.name + ".shadowMap"),
              u.camera.updateProjectionMatrix();
          }
          t.setRenderTarget(u.map), t.clear();
          const m = u.getViewportCount();
          for (let t = 0; t < m; t++) {
            const e = u.getViewport(t);
            o.set(s.x * e.x, s.y * e.y, s.x * e.z, s.y * e.w),
              d.viewport(o),
              u.updateMatrices(c, t),
              (i = u.getFrustum()),
              _(n, a, u.camera, c, this.type);
          }
          u.isPointLightShadow || 3 !== this.type || v(u, a),
            (u.needsUpdate = !1);
        }
        (g.needsUpdate = !1), t.setRenderTarget(l, c, u);
      });
  }
  function Bo(t, e, n) {
    const i = n.isWebGL2;
    const r = new (function () {
        let e = !1;
        const n = new Pe();
        let i = null;
        const r = new Pe(0, 0, 0, 0);
        return {
          setMask: function (n) {
            i === n || e || (t.colorMask(n, n, n, n), (i = n));
          },
          setLocked: function (t) {
            e = t;
          },
          setClear: function (e, i, s, o, a) {
            !0 === a && ((e *= o), (i *= o), (s *= o)),
              n.set(e, i, s, o),
              !1 === r.equals(n) && (t.clearColor(e, i, s, o), r.copy(n));
          },
          reset: function () {
            (e = !1), (i = null), r.set(-1, 0, 0, 0);
          },
        };
      })(),
      s = new (function () {
        let e = !1,
          n = null,
          i = null,
          r = null;
        return {
          setTest: function (t) {
            t ? k(2929) : O(2929);
          },
          setMask: function (i) {
            n === i || e || (t.depthMask(i), (n = i));
          },
          setFunc: function (e) {
            if (i !== e) {
              if (e)
                switch (e) {
                  case 0:
                    t.depthFunc(512);
                    break;
                  case 1:
                    t.depthFunc(519);
                    break;
                  case 2:
                    t.depthFunc(513);
                    break;
                  case 3:
                  default:
                    t.depthFunc(515);
                    break;
                  case 4:
                    t.depthFunc(514);
                    break;
                  case 5:
                    t.depthFunc(518);
                    break;
                  case 6:
                    t.depthFunc(516);
                    break;
                  case 7:
                    t.depthFunc(517);
                }
              else t.depthFunc(515);
              i = e;
            }
          },
          setLocked: function (t) {
            e = t;
          },
          setClear: function (e) {
            r !== e && (t.clearDepth(e), (r = e));
          },
          reset: function () {
            (e = !1), (n = null), (i = null), (r = null);
          },
        };
      })(),
      o = new (function () {
        let e = !1,
          n = null,
          i = null,
          r = null,
          s = null,
          o = null,
          a = null,
          l = null,
          c = null;
        return {
          setTest: function (t) {
            e || (t ? k(2960) : O(2960));
          },
          setMask: function (i) {
            n === i || e || (t.stencilMask(i), (n = i));
          },
          setFunc: function (e, n, o) {
            (i === e && r === n && s === o) ||
              (t.stencilFunc(e, n, o), (i = e), (r = n), (s = o));
          },
          setOp: function (e, n, i) {
            (o === e && a === n && l === i) ||
              (t.stencilOp(e, n, i), (o = e), (a = n), (l = i));
          },
          setLocked: function (t) {
            e = t;
          },
          setClear: function (e) {
            c !== e && (t.clearStencil(e), (c = e));
          },
          reset: function () {
            (e = !1),
              (n = null),
              (i = null),
              (r = null),
              (s = null),
              (o = null),
              (a = null),
              (l = null),
              (c = null);
          },
        };
      })();
    let a = {},
      l = {},
      c = null,
      h = !1,
      u = null,
      d = null,
      p = null,
      m = null,
      f = null,
      g = null,
      v = null,
      x = !1,
      _ = null,
      y = null,
      b = null,
      w = null,
      M = null;
    const S = t.getParameter(35661);
    let T = !1,
      E = 0;
    const A = t.getParameter(7938);
    -1 !== A.indexOf("WebGL")
      ? ((E = parseFloat(/^WebGL (\d)/.exec(A)[1])), (T = E >= 1))
      : -1 !== A.indexOf("OpenGL ES") &&
        ((E = parseFloat(/^OpenGL ES (\d)/.exec(A)[1])), (T = E >= 2));
    let L = null,
      R = {};
    const C = t.getParameter(3088),
      P = t.getParameter(2978),
      D = new Pe().fromArray(C),
      I = new Pe().fromArray(P);
    function N(e, n, i) {
      const r = new Uint8Array(4),
        s = t.createTexture();
      t.bindTexture(e, s),
        t.texParameteri(e, 10241, 9728),
        t.texParameteri(e, 10240, 9728);
      for (let e = 0; e < i; e++)
        t.texImage2D(n + e, 0, 6408, 1, 1, 0, 6408, 5121, r);
      return s;
    }
    const z = {};
    function k(e) {
      !0 !== a[e] && (t.enable(e), (a[e] = !0));
    }
    function O(e) {
      !1 !== a[e] && (t.disable(e), (a[e] = !1));
    }
    (z[3553] = N(3553, 3553, 1)),
      (z[34067] = N(34067, 34069, 6)),
      r.setClear(0, 0, 0, 1),
      s.setClear(1),
      o.setClear(0),
      k(2929),
      s.setFunc(3),
      H(!1),
      G(1),
      k(2884),
      B(0);
    const F = { [xt]: 32774, [_t]: 32778, [yt]: 32779 };
    if (i) (F[103] = 32775), (F[104] = 32776);
    else {
      const t = e.get("EXT_blend_minmax");
      null !== t && ((F[103] = t.MIN_EXT), (F[104] = t.MAX_EXT));
    }
    const U = {
      [bt]: 0,
      [wt]: 1,
      [Mt]: 768,
      [Tt]: 770,
      [Pt]: 776,
      [Rt]: 774,
      [At]: 772,
      [St]: 769,
      [Et]: 771,
      [Ct]: 775,
      [Lt]: 773,
    };
    function B(e, n, i, r, s, o, a, l) {
      if (0 !== e) {
        if ((!1 === h && (k(3042), (h = !0)), 5 === e))
          (s = s || n),
            (o = o || i),
            (a = a || r),
            (n === d && s === f) ||
              (t.blendEquationSeparate(F[n], F[s]), (d = n), (f = s)),
            (i === p && r === m && o === g && a === v) ||
              (t.blendFuncSeparate(U[i], U[r], U[o], U[a]),
              (p = i),
              (m = r),
              (g = o),
              (v = a)),
            (u = e),
            (x = null);
        else if (e !== u || l !== x) {
          if (
            ((d === xt && f === xt) ||
              (t.blendEquation(32774), (d = xt), (f = xt)),
            l)
          )
            switch (e) {
              case 1:
                t.blendFuncSeparate(1, 771, 1, 771);
                break;
              case 2:
                t.blendFunc(1, 1);
                break;
              case 3:
                t.blendFuncSeparate(0, 0, 769, 771);
                break;
              case 4:
                t.blendFuncSeparate(0, 768, 0, 770);
                break;
              default:
                console.error("THREE.WebGLState: Invalid blending: ", e);
            }
          else
            switch (e) {
              case 1:
                t.blendFuncSeparate(770, 771, 1, 771);
                break;
              case 2:
                t.blendFunc(770, 1);
                break;
              case 3:
                t.blendFunc(0, 769);
                break;
              case 4:
                t.blendFunc(0, 768);
                break;
              default:
                console.error("THREE.WebGLState: Invalid blending: ", e);
            }
          (p = null), (m = null), (g = null), (v = null), (u = e), (x = l);
        }
      } else !0 === h && (O(3042), (h = !1));
    }
    function H(e) {
      _ !== e && (e ? t.frontFace(2304) : t.frontFace(2305), (_ = e));
    }
    function G(e) {
      0 !== e
        ? (k(2884),
          e !== y &&
            (1 === e
              ? t.cullFace(1029)
              : 2 === e
              ? t.cullFace(1028)
              : t.cullFace(1032)))
        : O(2884),
        (y = e);
    }
    function V(e, n, i) {
      e
        ? (k(32823),
          (w === n && M === i) || (t.polygonOffset(n, i), (w = n), (M = i)))
        : O(32823);
    }
    function W(e) {
      void 0 === e && (e = 33984 + S - 1),
        L !== e && (t.activeTexture(e), (L = e));
    }
    return {
      buffers: { color: r, depth: s, stencil: o },
      enable: k,
      disable: O,
      bindFramebuffer: function (e, n) {
        return (
          l[e] !== n &&
          (t.bindFramebuffer(e, n),
          (l[e] = n),
          i && (36009 === e && (l[36160] = n), 36160 === e && (l[36009] = n)),
          !0)
        );
      },
      useProgram: function (e) {
        return c !== e && (t.useProgram(e), (c = e), !0);
      },
      setBlending: B,
      setMaterial: function (t, e) {
        2 === t.side ? O(2884) : k(2884);
        let n = 1 === t.side;
        e && (n = !n),
          H(n),
          1 === t.blending && !1 === t.transparent
            ? B(0)
            : B(
                t.blending,
                t.blendEquation,
                t.blendSrc,
                t.blendDst,
                t.blendEquationAlpha,
                t.blendSrcAlpha,
                t.blendDstAlpha,
                t.premultipliedAlpha
              ),
          s.setFunc(t.depthFunc),
          s.setTest(t.depthTest),
          s.setMask(t.depthWrite),
          r.setMask(t.colorWrite);
        const i = t.stencilWrite;
        o.setTest(i),
          i &&
            (o.setMask(t.stencilWriteMask),
            o.setFunc(t.stencilFunc, t.stencilRef, t.stencilFuncMask),
            o.setOp(t.stencilFail, t.stencilZFail, t.stencilZPass)),
          V(t.polygonOffset, t.polygonOffsetFactor, t.polygonOffsetUnits),
          !0 === t.alphaToCoverage ? k(32926) : O(32926);
      },
      setFlipSided: H,
      setCullFace: G,
      setLineWidth: function (e) {
        e !== b && (T && t.lineWidth(e), (b = e));
      },
      setPolygonOffset: V,
      setScissorTest: function (t) {
        t ? k(3089) : O(3089);
      },
      activeTexture: W,
      bindTexture: function (e, n) {
        null === L && W();
        let i = R[L];
        void 0 === i && ((i = { type: void 0, texture: void 0 }), (R[L] = i)),
          (i.type === e && i.texture === n) ||
            (t.bindTexture(e, n || z[e]), (i.type = e), (i.texture = n));
      },
      unbindTexture: function () {
        const e = R[L];
        void 0 !== e &&
          void 0 !== e.type &&
          (t.bindTexture(e.type, null),
          (e.type = void 0),
          (e.texture = void 0));
      },
      compressedTexImage2D: function () {
        try {
          t.compressedTexImage2D.apply(t, arguments);
        } catch (t) {
          console.error("THREE.WebGLState:", t);
        }
      },
      texImage2D: function () {
        try {
          t.texImage2D.apply(t, arguments);
        } catch (t) {
          console.error("THREE.WebGLState:", t);
        }
      },
      texImage3D: function () {
        try {
          t.texImage3D.apply(t, arguments);
        } catch (t) {
          console.error("THREE.WebGLState:", t);
        }
      },
      texStorage2D: function () {
        try {
          t.texStorage2D.apply(t, arguments);
        } catch (t) {
          console.error("THREE.WebGLState:", t);
        }
      },
      texStorage3D: function () {
        try {
          t.texStorage3D.apply(t, arguments);
        } catch (t) {
          console.error("THREE.WebGLState:", t);
        }
      },
      texSubImage2D: function () {
        try {
          t.texSubImage2D.apply(t, arguments);
        } catch (t) {
          console.error("THREE.WebGLState:", t);
        }
      },
      texSubImage3D: function () {
        try {
          t.texSubImage3D.apply(t, arguments);
        } catch (t) {
          console.error("THREE.WebGLState:", t);
        }
      },
      compressedTexSubImage2D: function () {
        try {
          t.compressedTexSubImage2D.apply(t, arguments);
        } catch (t) {
          console.error("THREE.WebGLState:", t);
        }
      },
      scissor: function (e) {
        !1 === D.equals(e) && (t.scissor(e.x, e.y, e.z, e.w), D.copy(e));
      },
      viewport: function (e) {
        !1 === I.equals(e) && (t.viewport(e.x, e.y, e.z, e.w), I.copy(e));
      },
      reset: function () {
        t.disable(3042),
          t.disable(2884),
          t.disable(2929),
          t.disable(32823),
          t.disable(3089),
          t.disable(2960),
          t.disable(32926),
          t.blendEquation(32774),
          t.blendFunc(1, 0),
          t.blendFuncSeparate(1, 0, 1, 0),
          t.colorMask(!0, !0, !0, !0),
          t.clearColor(0, 0, 0, 0),
          t.depthMask(!0),
          t.depthFunc(513),
          t.clearDepth(1),
          t.stencilMask(4294967295),
          t.stencilFunc(519, 0, 4294967295),
          t.stencilOp(7680, 7680, 7680),
          t.clearStencil(0),
          t.cullFace(1029),
          t.frontFace(2305),
          t.polygonOffset(0, 0),
          t.activeTexture(33984),
          t.bindFramebuffer(36160, null),
          !0 === i &&
            (t.bindFramebuffer(36009, null), t.bindFramebuffer(36008, null)),
          t.useProgram(null),
          t.lineWidth(1),
          t.scissor(0, 0, t.canvas.width, t.canvas.height),
          t.viewport(0, 0, t.canvas.width, t.canvas.height),
          (a = {}),
          (L = null),
          (R = {}),
          (l = {}),
          (c = null),
          (h = !1),
          (u = null),
          (d = null),
          (p = null),
          (m = null),
          (f = null),
          (g = null),
          (v = null),
          (x = !1),
          (_ = null),
          (y = null),
          (b = null),
          (w = null),
          (M = null),
          D.set(0, 0, t.canvas.width, t.canvas.height),
          I.set(0, 0, t.canvas.width, t.canvas.height),
          r.reset(),
          s.reset(),
          o.reset();
      },
    };
  }
  function Ho(t, e, n, i, r, s, o) {
    const a = r.isWebGL2,
      l = r.maxTextures,
      c = r.maxCubemapSize,
      h = r.maxTextureSize,
      u = r.maxSamples,
      d = e.has("WEBGL_multisampled_render_to_texture")
        ? e.get("WEBGL_multisampled_render_to_texture")
        : void 0,
      p = new WeakMap();
    let m,
      f = !1;
    try {
      f =
        "undefined" != typeof OffscreenCanvas &&
        null !== new OffscreenCanvas(1, 1).getContext("2d");
    } catch (t) {}
    function g(t, e) {
      return f ? new OffscreenCanvas(t, e) : Te("canvas");
    }
    function v(t, e, n, i) {
      let r = 1;
      if (
        ((t.width > i || t.height > i) && (r = i / Math.max(t.width, t.height)),
        r < 1 || !0 === e)
      ) {
        if (
          ("undefined" != typeof HTMLImageElement &&
            t instanceof HTMLImageElement) ||
          ("undefined" != typeof HTMLCanvasElement &&
            t instanceof HTMLCanvasElement) ||
          ("undefined" != typeof ImageBitmap && t instanceof ImageBitmap)
        ) {
          const i = e ? be : Math.floor,
            s = i(r * t.width),
            o = i(r * t.height);
          void 0 === m && (m = g(s, o));
          const a = n ? g(s, o) : m;
          (a.width = s), (a.height = o);
          return (
            a.getContext("2d").drawImage(t, 0, 0, s, o),
            console.warn(
              "THREE.WebGLRenderer: Texture has been resized from (" +
                t.width +
                "x" +
                t.height +
                ") to (" +
                s +
                "x" +
                o +
                ")."
            ),
            a
          );
        }
        return (
          "data" in t &&
            console.warn(
              "THREE.WebGLRenderer: Image in DataTexture is too big (" +
                t.width +
                "x" +
                t.height +
                ")."
            ),
          t
        );
      }
      return t;
    }
    function x(t) {
      return ye(t.width) && ye(t.height);
    }
    function _(t, e) {
      return t.generateMipmaps && e && t.minFilter !== Ft && t.minFilter !== Ht;
    }
    function y(e) {
      t.generateMipmap(e);
    }
    function b(n, i, r, s) {
      if (!1 === a) return i;
      if (null !== n) {
        if (void 0 !== t[n]) return t[n];
        console.warn(
          "THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" +
            n +
            "'"
        );
      }
      let o = i;
      return (
        6403 === i &&
          (5126 === r && (o = 33326),
          5131 === r && (o = 33325),
          5121 === r && (o = 33321)),
        6407 === i &&
          (5126 === r && (o = 34837),
          5131 === r && (o = 34843),
          5121 === r && (o = 32849)),
        6408 === i &&
          (5126 === r && (o = 34836),
          5131 === r && (o = 34842),
          5121 === r && (o = s === le ? 35907 : 32856)),
        (33325 !== o && 33326 !== o && 34842 !== o && 34836 !== o) ||
          e.get("EXT_color_buffer_float"),
        o
      );
    }
    function w(t, e, n) {
      return !0 === _(t, n) ||
        (t.isFramebufferTexture && t.minFilter !== Ft && t.minFilter !== Ht)
        ? Math.log2(Math.max(e.width, e.height)) + 1
        : void 0 !== t.mipmaps && t.mipmaps.length > 0
        ? t.mipmaps.length
        : t.isCompressedTexture && Array.isArray(t.image)
        ? e.mipmaps.length
        : 1;
    }
    function M(t) {
      return t === Ft || 1004 === t || 1005 === t ? 9728 : 9729;
    }
    function S(e) {
      const n = e.target;
      n.removeEventListener("dispose", S),
        (function (e) {
          const n = i.get(e);
          if (void 0 === n.__webglInit) return;
          t.deleteTexture(n.__webglTexture), i.remove(e);
        })(n),
        n.isVideoTexture && p.delete(n),
        o.memory.textures--;
    }
    function T(e) {
      const n = e.target;
      n.removeEventListener("dispose", T),
        (function (e) {
          const n = e.texture,
            r = i.get(e),
            s = i.get(n);
          if (!e) return;
          void 0 !== s.__webglTexture &&
            (t.deleteTexture(s.__webglTexture), o.memory.textures--);
          e.depthTexture && e.depthTexture.dispose();
          if (e.isWebGLCubeRenderTarget)
            for (let e = 0; e < 6; e++)
              t.deleteFramebuffer(r.__webglFramebuffer[e]),
                r.__webglDepthbuffer &&
                  t.deleteRenderbuffer(r.__webglDepthbuffer[e]);
          else
            t.deleteFramebuffer(r.__webglFramebuffer),
              r.__webglDepthbuffer &&
                t.deleteRenderbuffer(r.__webglDepthbuffer),
              r.__webglMultisampledFramebuffer &&
                t.deleteFramebuffer(r.__webglMultisampledFramebuffer),
              r.__webglColorRenderbuffer &&
                t.deleteRenderbuffer(r.__webglColorRenderbuffer),
              r.__webglDepthRenderbuffer &&
                t.deleteRenderbuffer(r.__webglDepthRenderbuffer);
          if (e.isWebGLMultipleRenderTargets)
            for (let e = 0, r = n.length; e < r; e++) {
              const r = i.get(n[e]);
              r.__webglTexture &&
                (t.deleteTexture(r.__webglTexture), o.memory.textures--),
                i.remove(n[e]);
            }
          i.remove(n), i.remove(e);
        })(n);
    }
    let E = 0;
    function A(t, e) {
      const r = i.get(t);
      if (
        (t.isVideoTexture &&
          (function (t) {
            const e = o.render.frame;
            p.get(t) !== e && (p.set(t, e), t.update());
          })(t),
        t.version > 0 && r.__version !== t.version)
      ) {
        const n = t.image;
        if (void 0 === n)
          console.warn(
            "THREE.WebGLRenderer: Texture marked for update but image is undefined"
          );
        else {
          if (!1 !== n.complete) return void I(r, t, e);
          console.warn(
            "THREE.WebGLRenderer: Texture marked for update but image is incomplete"
          );
        }
      }
      n.activeTexture(33984 + e), n.bindTexture(3553, r.__webglTexture);
    }
    function L(e, r) {
      const o = i.get(e);
      e.version > 0 && o.__version !== e.version
        ? (function (e, i, r) {
            if (6 !== i.image.length) return;
            D(e, i),
              n.activeTexture(33984 + r),
              n.bindTexture(34067, e.__webglTexture),
              t.pixelStorei(37440, i.flipY),
              t.pixelStorei(37441, i.premultiplyAlpha),
              t.pixelStorei(3317, i.unpackAlignment),
              t.pixelStorei(37443, 0);
            const o =
                i && (i.isCompressedTexture || i.image[0].isCompressedTexture),
              l = i.image[0] && i.image[0].isDataTexture,
              h = [];
            for (let t = 0; t < 6; t++)
              h[t] =
                o || l
                  ? l
                    ? i.image[t].image
                    : i.image[t]
                  : v(i.image[t], !1, !0, c);
            const u = h[0],
              d = x(u) || a,
              p = s.convert(i.format),
              m = s.convert(i.type),
              f = b(i.internalFormat, p, m, i.encoding),
              g = a && !0 !== i.isVideoTexture,
              M = void 0 === e.__version;
            let S,
              T = w(i, u, d);
            if ((P(34067, i, d), o)) {
              g && M && n.texStorage2D(34067, T, f, u.width, u.height);
              for (let t = 0; t < 6; t++) {
                S = h[t].mipmaps;
                for (let e = 0; e < S.length; e++) {
                  const r = S[e];
                  i.format !== Qt && i.format !== Jt
                    ? null !== p
                      ? g
                        ? n.compressedTexSubImage2D(
                            34069 + t,
                            e,
                            0,
                            0,
                            r.width,
                            r.height,
                            p,
                            r.data
                          )
                        : n.compressedTexImage2D(
                            34069 + t,
                            e,
                            f,
                            r.width,
                            r.height,
                            0,
                            r.data
                          )
                      : console.warn(
                          "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"
                        )
                    : g
                    ? n.texSubImage2D(
                        34069 + t,
                        e,
                        0,
                        0,
                        r.width,
                        r.height,
                        p,
                        m,
                        r.data
                      )
                    : n.texImage2D(
                        34069 + t,
                        e,
                        f,
                        r.width,
                        r.height,
                        0,
                        p,
                        m,
                        r.data
                      );
                }
              }
            } else {
              (S = i.mipmaps),
                g &&
                  M &&
                  (S.length > 0 && T++,
                  n.texStorage2D(34067, T, f, h[0].width, h[0].height));
              for (let t = 0; t < 6; t++)
                if (l) {
                  g
                    ? n.texSubImage2D(
                        34069 + t,
                        0,
                        0,
                        0,
                        h[t].width,
                        h[t].height,
                        p,
                        m,
                        h[t].data
                      )
                    : n.texImage2D(
                        34069 + t,
                        0,
                        f,
                        h[t].width,
                        h[t].height,
                        0,
                        p,
                        m,
                        h[t].data
                      );
                  for (let e = 0; e < S.length; e++) {
                    const i = S[e].image[t].image;
                    g
                      ? n.texSubImage2D(
                          34069 + t,
                          e + 1,
                          0,
                          0,
                          i.width,
                          i.height,
                          p,
                          m,
                          i.data
                        )
                      : n.texImage2D(
                          34069 + t,
                          e + 1,
                          f,
                          i.width,
                          i.height,
                          0,
                          p,
                          m,
                          i.data
                        );
                  }
                } else {
                  g
                    ? n.texSubImage2D(34069 + t, 0, 0, 0, p, m, h[t])
                    : n.texImage2D(34069 + t, 0, f, p, m, h[t]);
                  for (let e = 0; e < S.length; e++) {
                    const i = S[e];
                    g
                      ? n.texSubImage2D(
                          34069 + t,
                          e + 1,
                          0,
                          0,
                          p,
                          m,
                          i.image[t]
                        )
                      : n.texImage2D(34069 + t, e + 1, f, p, m, i.image[t]);
                  }
                }
            }
            _(i, d) && y(34067);
            (e.__version = i.version), i.onUpdate && i.onUpdate(i);
          })(o, e, r)
        : (n.activeTexture(33984 + r), n.bindTexture(34067, o.__webglTexture));
    }
    const R = { [zt]: 10497, [kt]: 33071, [Ot]: 33648 },
      C = {
        [Ft]: 9728,
        [Ut]: 9984,
        [Bt]: 9986,
        [Ht]: 9729,
        [Gt]: 9985,
        [Vt]: 9987,
      };
    function P(n, s, o) {
      if (
        (o
          ? (t.texParameteri(n, 10242, R[s.wrapS]),
            t.texParameteri(n, 10243, R[s.wrapT]),
            (32879 !== n && 35866 !== n) ||
              t.texParameteri(n, 32882, R[s.wrapR]),
            t.texParameteri(n, 10240, C[s.magFilter]),
            t.texParameteri(n, 10241, C[s.minFilter]))
          : (t.texParameteri(n, 10242, 33071),
            t.texParameteri(n, 10243, 33071),
            (32879 !== n && 35866 !== n) || t.texParameteri(n, 32882, 33071),
            (s.wrapS === kt && s.wrapT === kt) ||
              console.warn(
                "THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."
              ),
            t.texParameteri(n, 10240, M(s.magFilter)),
            t.texParameteri(n, 10241, M(s.minFilter)),
            s.minFilter !== Ft &&
              s.minFilter !== Ht &&
              console.warn(
                "THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter."
              )),
        !0 === e.has("EXT_texture_filter_anisotropic"))
      ) {
        const o = e.get("EXT_texture_filter_anisotropic");
        if (s.type === Yt && !1 === e.has("OES_texture_float_linear")) return;
        if (
          !1 === a &&
          s.type === Xt &&
          !1 === e.has("OES_texture_half_float_linear")
        )
          return;
        (s.anisotropy > 1 || i.get(s).__currentAnisotropy) &&
          (t.texParameterf(
            n,
            o.TEXTURE_MAX_ANISOTROPY_EXT,
            Math.min(s.anisotropy, r.getMaxAnisotropy())
          ),
          (i.get(s).__currentAnisotropy = s.anisotropy));
      }
    }
    function D(e, n) {
      void 0 === e.__webglInit &&
        ((e.__webglInit = !0),
        n.addEventListener("dispose", S),
        (e.__webglTexture = t.createTexture()),
        o.memory.textures++);
    }
    function I(e, i, r) {
      let o = 3553;
      i.isDataTexture2DArray && (o = 35866),
        i.isDataTexture3D && (o = 32879),
        D(e, i),
        n.activeTexture(33984 + r),
        n.bindTexture(o, e.__webglTexture),
        t.pixelStorei(37440, i.flipY),
        t.pixelStorei(37441, i.premultiplyAlpha),
        t.pixelStorei(3317, i.unpackAlignment),
        t.pixelStorei(37443, 0);
      const l =
          (function (t) {
            return (
              !a &&
              (t.wrapS !== kt ||
                t.wrapT !== kt ||
                (t.minFilter !== Ft && t.minFilter !== Ht))
            );
          })(i) && !1 === x(i.image),
        c = v(i.image, l, !1, h),
        u = x(c) || a,
        d = s.convert(i.format);
      let p,
        m = s.convert(i.type),
        f = b(i.internalFormat, d, m, i.encoding);
      P(o, i, u);
      const g = i.mipmaps,
        M = a && !0 !== i.isVideoTexture,
        S = void 0 === e.__version,
        T = w(i, c, u);
      if (i.isDepthTexture)
        (f = 6402),
          a
            ? (f =
                i.type === Yt
                  ? 36012
                  : i.type === Zt
                  ? 33190
                  : i.type === qt
                  ? 35056
                  : 33189)
            : i.type === Yt &&
              console.error(
                "WebGLRenderer: Floating point depth texture requires WebGL2."
              ),
          i.format === Kt &&
            6402 === f &&
            i.type !== jt &&
            i.type !== Zt &&
            (console.warn(
              "THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."
            ),
            (i.type = jt),
            (m = s.convert(i.type))),
          i.format === $t &&
            6402 === f &&
            ((f = 34041),
            i.type !== qt &&
              (console.warn(
                "THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."
              ),
              (i.type = qt),
              (m = s.convert(i.type)))),
          M && S
            ? n.texStorage2D(3553, 1, f, c.width, c.height)
            : n.texImage2D(3553, 0, f, c.width, c.height, 0, d, m, null);
      else if (i.isDataTexture)
        if (g.length > 0 && u) {
          M && S && n.texStorage2D(3553, T, f, g[0].width, g[0].height);
          for (let t = 0, e = g.length; t < e; t++)
            (p = g[t]),
              M
                ? n.texSubImage2D(
                    3553,
                    0,
                    0,
                    0,
                    p.width,
                    p.height,
                    d,
                    m,
                    p.data
                  )
                : n.texImage2D(3553, t, f, p.width, p.height, 0, d, m, p.data);
          i.generateMipmaps = !1;
        } else
          M
            ? (S && n.texStorage2D(3553, T, f, c.width, c.height),
              n.texSubImage2D(3553, 0, 0, 0, c.width, c.height, d, m, c.data))
            : n.texImage2D(3553, 0, f, c.width, c.height, 0, d, m, c.data);
      else if (i.isCompressedTexture) {
        M && S && n.texStorage2D(3553, T, f, g[0].width, g[0].height);
        for (let t = 0, e = g.length; t < e; t++)
          (p = g[t]),
            i.format !== Qt && i.format !== Jt
              ? null !== d
                ? M
                  ? n.compressedTexSubImage2D(
                      3553,
                      t,
                      0,
                      0,
                      p.width,
                      p.height,
                      d,
                      p.data
                    )
                  : n.compressedTexImage2D(
                      3553,
                      t,
                      f,
                      p.width,
                      p.height,
                      0,
                      p.data
                    )
                : console.warn(
                    "THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"
                  )
              : M
              ? n.texSubImage2D(3553, t, 0, 0, p.width, p.height, d, m, p.data)
              : n.texImage2D(3553, t, f, p.width, p.height, 0, d, m, p.data);
      } else if (i.isDataTexture2DArray)
        M
          ? (S && n.texStorage3D(35866, T, f, c.width, c.height, c.depth),
            n.texSubImage3D(
              35866,
              0,
              0,
              0,
              0,
              c.width,
              c.height,
              c.depth,
              d,
              m,
              c.data
            ))
          : n.texImage3D(
              35866,
              0,
              f,
              c.width,
              c.height,
              c.depth,
              0,
              d,
              m,
              c.data
            );
      else if (i.isDataTexture3D)
        M
          ? (S && n.texStorage3D(32879, T, f, c.width, c.height, c.depth),
            n.texSubImage3D(
              32879,
              0,
              0,
              0,
              0,
              c.width,
              c.height,
              c.depth,
              d,
              m,
              c.data
            ))
          : n.texImage3D(
              32879,
              0,
              f,
              c.width,
              c.height,
              c.depth,
              0,
              d,
              m,
              c.data
            );
      else if (i.isFramebufferTexture)
        M && S
          ? n.texStorage2D(3553, T, f, c.width, c.height)
          : n.texImage2D(3553, 0, f, c.width, c.height, 0, d, m, null);
      else if (g.length > 0 && u) {
        M && S && n.texStorage2D(3553, T, f, g[0].width, g[0].height);
        for (let t = 0, e = g.length; t < e; t++)
          (p = g[t]),
            M
              ? n.texSubImage2D(3553, t, 0, 0, d, m, p)
              : n.texImage2D(3553, t, f, d, m, p);
        i.generateMipmaps = !1;
      } else
        M
          ? (S && n.texStorage2D(3553, T, f, c.width, c.height),
            n.texSubImage2D(3553, 0, 0, 0, d, m, c))
          : n.texImage2D(3553, 0, f, d, m, c);
      _(i, u) && y(o), (e.__version = i.version), i.onUpdate && i.onUpdate(i);
    }
    function N(e, r, o, a, l) {
      const c = s.convert(o.format),
        h = s.convert(o.type),
        u = b(o.internalFormat, c, h, o.encoding);
      i.get(r).__hasExternalTextures ||
        (32879 === l || 35866 === l
          ? n.texImage3D(l, 0, u, r.width, r.height, r.depth, 0, c, h, null)
          : n.texImage2D(l, 0, u, r.width, r.height, 0, c, h, null)),
        n.bindFramebuffer(36160, e),
        r.useRenderToTexture
          ? d.framebufferTexture2DMultisampleEXT(
              36160,
              a,
              l,
              i.get(o).__webglTexture,
              0,
              O(r)
            )
          : t.framebufferTexture2D(36160, a, l, i.get(o).__webglTexture, 0),
        n.bindFramebuffer(36160, null);
    }
    function z(e, n, i) {
      if ((t.bindRenderbuffer(36161, e), n.depthBuffer && !n.stencilBuffer)) {
        let r = 33189;
        if (i || n.useRenderToTexture) {
          const e = n.depthTexture;
          e &&
            e.isDepthTexture &&
            (e.type === Yt ? (r = 36012) : e.type === Zt && (r = 33190));
          const i = O(n);
          n.useRenderToTexture
            ? d.renderbufferStorageMultisampleEXT(
                36161,
                i,
                r,
                n.width,
                n.height
              )
            : t.renderbufferStorageMultisample(36161, i, r, n.width, n.height);
        } else t.renderbufferStorage(36161, r, n.width, n.height);
        t.framebufferRenderbuffer(36160, 36096, 36161, e);
      } else if (n.depthBuffer && n.stencilBuffer) {
        const r = O(n);
        i && n.useRenderbuffer
          ? t.renderbufferStorageMultisample(36161, r, 35056, n.width, n.height)
          : n.useRenderToTexture
          ? d.renderbufferStorageMultisampleEXT(
              36161,
              r,
              35056,
              n.width,
              n.height
            )
          : t.renderbufferStorage(36161, 34041, n.width, n.height),
          t.framebufferRenderbuffer(36160, 33306, 36161, e);
      } else {
        const e =
            !0 === n.isWebGLMultipleRenderTargets ? n.texture[0] : n.texture,
          r = s.convert(e.format),
          o = s.convert(e.type),
          a = b(e.internalFormat, r, o, e.encoding),
          l = O(n);
        i && n.useRenderbuffer
          ? t.renderbufferStorageMultisample(36161, l, a, n.width, n.height)
          : n.useRenderToTexture
          ? d.renderbufferStorageMultisampleEXT(36161, l, a, n.width, n.height)
          : t.renderbufferStorage(36161, a, n.width, n.height);
      }
      t.bindRenderbuffer(36161, null);
    }
    function k(e) {
      const r = i.get(e),
        s = !0 === e.isWebGLCubeRenderTarget;
      if (e.depthTexture && !r.__autoAllocateDepthBuffer) {
        if (s)
          throw new Error(
            "target.depthTexture not supported in Cube render targets"
          );
        !(function (e, r) {
          if (r && r.isWebGLCubeRenderTarget)
            throw new Error(
              "Depth Texture with cube render targets is not supported"
            );
          if (
            (n.bindFramebuffer(36160, e),
            !r.depthTexture || !r.depthTexture.isDepthTexture)
          )
            throw new Error(
              "renderTarget.depthTexture must be an instance of THREE.DepthTexture"
            );
          (i.get(r.depthTexture).__webglTexture &&
            r.depthTexture.image.width === r.width &&
            r.depthTexture.image.height === r.height) ||
            ((r.depthTexture.image.width = r.width),
            (r.depthTexture.image.height = r.height),
            (r.depthTexture.needsUpdate = !0)),
            A(r.depthTexture, 0);
          const s = i.get(r.depthTexture).__webglTexture,
            o = O(r);
          if (r.depthTexture.format === Kt)
            r.useRenderToTexture
              ? d.framebufferTexture2DMultisampleEXT(
                  36160,
                  36096,
                  3553,
                  s,
                  0,
                  o
                )
              : t.framebufferTexture2D(36160, 36096, 3553, s, 0);
          else {
            if (r.depthTexture.format !== $t)
              throw new Error("Unknown depthTexture format");
            r.useRenderToTexture
              ? d.framebufferTexture2DMultisampleEXT(
                  36160,
                  33306,
                  3553,
                  s,
                  0,
                  o
                )
              : t.framebufferTexture2D(36160, 33306, 3553, s, 0);
          }
        })(r.__webglFramebuffer, e);
      } else if (s) {
        r.__webglDepthbuffer = [];
        for (let i = 0; i < 6; i++)
          n.bindFramebuffer(36160, r.__webglFramebuffer[i]),
            (r.__webglDepthbuffer[i] = t.createRenderbuffer()),
            z(r.__webglDepthbuffer[i], e, !1);
      } else
        n.bindFramebuffer(36160, r.__webglFramebuffer),
          (r.__webglDepthbuffer = t.createRenderbuffer()),
          z(r.__webglDepthbuffer, e, !1);
      n.bindFramebuffer(36160, null);
    }
    function O(t) {
      return a && (t.useRenderbuffer || t.useRenderToTexture)
        ? Math.min(u, t.samples)
        : 0;
    }
    let F = !1,
      U = !1;
    (this.allocateTextureUnit = function () {
      const t = E;
      return (
        t >= l &&
          console.warn(
            "THREE.WebGLTextures: Trying to use " +
              t +
              " texture units while this GPU supports only " +
              l
          ),
        (E += 1),
        t
      );
    }),
      (this.resetTextureUnits = function () {
        E = 0;
      }),
      (this.setTexture2D = A),
      (this.setTexture2DArray = function (t, e) {
        const r = i.get(t);
        t.version > 0 && r.__version !== t.version
          ? I(r, t, e)
          : (n.activeTexture(33984 + e),
            n.bindTexture(35866, r.__webglTexture));
      }),
      (this.setTexture3D = function (t, e) {
        const r = i.get(t);
        t.version > 0 && r.__version !== t.version
          ? I(r, t, e)
          : (n.activeTexture(33984 + e),
            n.bindTexture(32879, r.__webglTexture));
      }),
      (this.setTextureCube = L),
      (this.rebindTextures = function (t, e, n) {
        const r = i.get(t);
        void 0 !== e && N(r.__webglFramebuffer, t, t.texture, 36064, 3553),
          void 0 !== n && k(t);
      }),
      (this.setupRenderTarget = function (e) {
        const l = e.texture,
          c = i.get(e),
          h = i.get(l);
        e.addEventListener("dispose", T),
          !0 !== e.isWebGLMultipleRenderTargets &&
            (void 0 === h.__webglTexture &&
              (h.__webglTexture = t.createTexture()),
            (h.__version = l.version),
            o.memory.textures++);
        const u = !0 === e.isWebGLCubeRenderTarget,
          d = !0 === e.isWebGLMultipleRenderTargets,
          p = l.isDataTexture3D || l.isDataTexture2DArray,
          m = x(e) || a;
        if (
          (!a ||
            l.format !== Jt ||
            (l.type !== Yt && l.type !== Xt) ||
            ((l.format = Qt),
            console.warn(
              "THREE.WebGLRenderer: Rendering to textures with RGB format is not supported. Using RGBA format instead."
            )),
          u)
        ) {
          c.__webglFramebuffer = [];
          for (let e = 0; e < 6; e++)
            c.__webglFramebuffer[e] = t.createFramebuffer();
        } else if (((c.__webglFramebuffer = t.createFramebuffer()), d))
          if (r.drawBuffers) {
            const n = e.texture;
            for (let e = 0, r = n.length; e < r; e++) {
              const r = i.get(n[e]);
              void 0 === r.__webglTexture &&
                ((r.__webglTexture = t.createTexture()), o.memory.textures++);
            }
          } else
            console.warn(
              "THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension."
            );
        else if (e.useRenderbuffer)
          if (a) {
            (c.__webglMultisampledFramebuffer = t.createFramebuffer()),
              (c.__webglColorRenderbuffer = t.createRenderbuffer()),
              t.bindRenderbuffer(36161, c.__webglColorRenderbuffer);
            const i = s.convert(l.format),
              r = s.convert(l.type),
              o = b(l.internalFormat, i, r, l.encoding),
              a = O(e);
            t.renderbufferStorageMultisample(36161, a, o, e.width, e.height),
              n.bindFramebuffer(36160, c.__webglMultisampledFramebuffer),
              t.framebufferRenderbuffer(
                36160,
                36064,
                36161,
                c.__webglColorRenderbuffer
              ),
              t.bindRenderbuffer(36161, null),
              e.depthBuffer &&
                ((c.__webglDepthRenderbuffer = t.createRenderbuffer()),
                z(c.__webglDepthRenderbuffer, e, !0)),
              n.bindFramebuffer(36160, null);
          } else
            console.warn(
              "THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2."
            );
        if (u) {
          n.bindTexture(34067, h.__webglTexture), P(34067, l, m);
          for (let t = 0; t < 6; t++)
            N(c.__webglFramebuffer[t], e, l, 36064, 34069 + t);
          _(l, m) && y(34067), n.unbindTexture();
        } else if (d) {
          const t = e.texture;
          for (let r = 0, s = t.length; r < s; r++) {
            const s = t[r],
              o = i.get(s);
            n.bindTexture(3553, o.__webglTexture),
              P(3553, s, m),
              N(c.__webglFramebuffer, e, s, 36064 + r, 3553),
              _(s, m) && y(3553);
          }
          n.unbindTexture();
        } else {
          let t = 3553;
          if (p)
            if (a) {
              t = l.isDataTexture3D ? 32879 : 35866;
            } else
              console.warn(
                "THREE.DataTexture3D and THREE.DataTexture2DArray only supported with WebGL2."
              );
          n.bindTexture(t, h.__webglTexture),
            P(t, l, m),
            N(c.__webglFramebuffer, e, l, 36064, t),
            _(l, m) && y(t),
            n.unbindTexture();
        }
        e.depthBuffer && k(e);
      }),
      (this.updateRenderTargetMipmap = function (t) {
        const e = x(t) || a,
          r = !0 === t.isWebGLMultipleRenderTargets ? t.texture : [t.texture];
        for (let s = 0, o = r.length; s < o; s++) {
          const o = r[s];
          if (_(o, e)) {
            const e = t.isWebGLCubeRenderTarget ? 34067 : 3553,
              r = i.get(o).__webglTexture;
            n.bindTexture(e, r), y(e), n.unbindTexture();
          }
        }
      }),
      (this.updateMultisampleRenderTarget = function (e) {
        if (e.useRenderbuffer)
          if (a) {
            const r = e.width,
              s = e.height;
            let o = 16384;
            const a = [36064],
              l = e.stencilBuffer ? 33306 : 36096;
            e.depthBuffer && a.push(l),
              e.ignoreDepthForMultisampleCopy ||
                (e.depthBuffer && (o |= 256), e.stencilBuffer && (o |= 1024));
            const c = i.get(e);
            n.bindFramebuffer(36008, c.__webglMultisampledFramebuffer),
              n.bindFramebuffer(36009, c.__webglFramebuffer),
              e.ignoreDepthForMultisampleCopy &&
                (t.invalidateFramebuffer(36008, [l]),
                t.invalidateFramebuffer(36009, [l])),
              t.blitFramebuffer(0, 0, r, s, 0, 0, r, s, o, 9728),
              t.invalidateFramebuffer(36008, a),
              n.bindFramebuffer(36008, null),
              n.bindFramebuffer(36009, c.__webglMultisampledFramebuffer);
          } else
            console.warn(
              "THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2."
            );
      }),
      (this.setupDepthRenderbuffer = k),
      (this.setupFrameBufferTexture = N),
      (this.safeSetTexture2D = function (t, e) {
        t &&
          t.isWebGLRenderTarget &&
          (!1 === F &&
            (console.warn(
              "THREE.WebGLTextures.safeSetTexture2D: don't use render targets as textures. Use their .texture property instead."
            ),
            (F = !0)),
          (t = t.texture)),
          A(t, e);
      }),
      (this.safeSetTextureCube = function (t, e) {
        t &&
          t.isWebGLCubeRenderTarget &&
          (!1 === U &&
            (console.warn(
              "THREE.WebGLTextures.safeSetTextureCube: don't use cube render targets as textures. Use their .texture property instead."
            ),
            (U = !0)),
          (t = t.texture)),
          L(t, e);
      });
  }
  function Go(t, e, n) {
    const i = n.isWebGL2;
    return {
      convert: function (t) {
        let n;
        if (t === Wt) return 5121;
        if (1017 === t) return 32819;
        if (1018 === t) return 32820;
        if (1019 === t) return 33635;
        if (1010 === t) return 5120;
        if (1011 === t) return 5122;
        if (t === jt) return 5123;
        if (1013 === t) return 5124;
        if (t === Zt) return 5125;
        if (t === Yt) return 5126;
        if (t === Xt)
          return i
            ? 5131
            : ((n = e.get("OES_texture_half_float")),
              null !== n ? n.HALF_FLOAT_OES : null);
        if (1021 === t) return 6406;
        if (t === Jt) return 6407;
        if (t === Qt) return 6408;
        if (1024 === t) return 6409;
        if (1025 === t) return 6410;
        if (t === Kt) return 6402;
        if (t === $t) return 34041;
        if (1028 === t) return 6403;
        if (1029 === t) return 36244;
        if (1030 === t) return 33319;
        if (1031 === t) return 33320;
        if (1032 === t) return 36248;
        if (1033 === t) return 36249;
        if (33776 === t || 33777 === t || 33778 === t || 33779 === t) {
          if (((n = e.get("WEBGL_compressed_texture_s3tc")), null === n))
            return null;
          if (33776 === t) return n.COMPRESSED_RGB_S3TC_DXT1_EXT;
          if (33777 === t) return n.COMPRESSED_RGBA_S3TC_DXT1_EXT;
          if (33778 === t) return n.COMPRESSED_RGBA_S3TC_DXT3_EXT;
          if (33779 === t) return n.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        }
        if (35840 === t || 35841 === t || 35842 === t || 35843 === t) {
          if (((n = e.get("WEBGL_compressed_texture_pvrtc")), null === n))
            return null;
          if (35840 === t) return n.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
          if (35841 === t) return n.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
          if (35842 === t) return n.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
          if (35843 === t) return n.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        }
        if (36196 === t)
          return (
            (n = e.get("WEBGL_compressed_texture_etc1")),
            null !== n ? n.COMPRESSED_RGB_ETC1_WEBGL : null
          );
        if (
          (37492 === t || 37496 === t) &&
          ((n = e.get("WEBGL_compressed_texture_etc")), null !== n)
        ) {
          if (37492 === t) return n.COMPRESSED_RGB8_ETC2;
          if (37496 === t) return n.COMPRESSED_RGBA8_ETC2_EAC;
        }
        return 37808 === t ||
          37809 === t ||
          37810 === t ||
          37811 === t ||
          37812 === t ||
          37813 === t ||
          37814 === t ||
          37815 === t ||
          37816 === t ||
          37817 === t ||
          37818 === t ||
          37819 === t ||
          37820 === t ||
          37821 === t ||
          37840 === t ||
          37841 === t ||
          37842 === t ||
          37843 === t ||
          37844 === t ||
          37845 === t ||
          37846 === t ||
          37847 === t ||
          37848 === t ||
          37849 === t ||
          37850 === t ||
          37851 === t ||
          37852 === t ||
          37853 === t
          ? ((n = e.get("WEBGL_compressed_texture_astc")),
            null !== n ? t : null)
          : 36492 === t
          ? ((n = e.get("EXT_texture_compression_bptc")), null !== n ? t : null)
          : t === qt
          ? i
            ? 34042
            : ((n = e.get("WEBGL_depth_texture")),
              null !== n ? n.UNSIGNED_INT_24_8_WEBGL : null)
          : void 0;
      },
    };
  }
  class Vo extends ji {
    constructor(t = []) {
      super(), (this.cameras = t);
    }
  }
  Vo.prototype.isArrayCamera = !0;
  class Wo extends Fn {
    constructor() {
      super(), (this.type = "Group");
    }
  }
  Wo.prototype.isGroup = !0;
  const jo = { type: "move" };
  class Zo {
    constructor() {
      (this._targetRay = null), (this._grip = null), (this._hand = null);
    }
    getHandSpace() {
      return (
        null === this._hand &&
          ((this._hand = new Wo()),
          (this._hand.matrixAutoUpdate = !1),
          (this._hand.visible = !1),
          (this._hand.joints = {}),
          (this._hand.inputState = { pinching: !1 })),
        this._hand
      );
    }
    getTargetRaySpace() {
      return (
        null === this._targetRay &&
          ((this._targetRay = new Wo()),
          (this._targetRay.matrixAutoUpdate = !1),
          (this._targetRay.visible = !1),
          (this._targetRay.hasLinearVelocity = !1),
          (this._targetRay.linearVelocity = new ze()),
          (this._targetRay.hasAngularVelocity = !1),
          (this._targetRay.angularVelocity = new ze())),
        this._targetRay
      );
    }
    getGripSpace() {
      return (
        null === this._grip &&
          ((this._grip = new Wo()),
          (this._grip.matrixAutoUpdate = !1),
          (this._grip.visible = !1),
          (this._grip.hasLinearVelocity = !1),
          (this._grip.linearVelocity = new ze()),
          (this._grip.hasAngularVelocity = !1),
          (this._grip.angularVelocity = new ze())),
        this._grip
      );
    }
    dispatchEvent(t) {
      return (
        null !== this._targetRay && this._targetRay.dispatchEvent(t),
        null !== this._grip && this._grip.dispatchEvent(t),
        null !== this._hand && this._hand.dispatchEvent(t),
        this
      );
    }
    disconnect(t) {
      return (
        this.dispatchEvent({ type: "disconnected", data: t }),
        null !== this._targetRay && (this._targetRay.visible = !1),
        null !== this._grip && (this._grip.visible = !1),
        null !== this._hand && (this._hand.visible = !1),
        this
      );
    }
    update(t, e, n) {
      let i = null,
        r = null,
        s = null;
      const o = this._targetRay,
        a = this._grip,
        l = this._hand;
      if (t && "visible-blurred" !== e.session.visibilityState)
        if (
          (null !== o &&
            ((i = e.getPose(t.targetRaySpace, n)),
            null !== i &&
              (o.matrix.fromArray(i.transform.matrix),
              o.matrix.decompose(o.position, o.rotation, o.scale),
              i.linearVelocity
                ? ((o.hasLinearVelocity = !0),
                  o.linearVelocity.copy(i.linearVelocity))
                : (o.hasLinearVelocity = !1),
              i.angularVelocity
                ? ((o.hasAngularVelocity = !0),
                  o.angularVelocity.copy(i.angularVelocity))
                : (o.hasAngularVelocity = !1),
              this.dispatchEvent(jo))),
          l && t.hand)
        ) {
          s = !0;
          for (const i of t.hand.values()) {
            const t = e.getJointPose(i, n);
            if (void 0 === l.joints[i.jointName]) {
              const t = new Wo();
              (t.matrixAutoUpdate = !1),
                (t.visible = !1),
                (l.joints[i.jointName] = t),
                l.add(t);
            }
            const r = l.joints[i.jointName];
            null !== t &&
              (r.matrix.fromArray(t.transform.matrix),
              r.matrix.decompose(r.position, r.rotation, r.scale),
              (r.jointRadius = t.radius)),
              (r.visible = null !== t);
          }
          const i = l.joints["index-finger-tip"],
            r = l.joints["thumb-tip"],
            o = i.position.distanceTo(r.position),
            a = 0.02,
            c = 0.005;
          l.inputState.pinching && o > a + c
            ? ((l.inputState.pinching = !1),
              this.dispatchEvent({
                type: "pinchend",
                handedness: t.handedness,
                target: this,
              }))
            : !l.inputState.pinching &&
              o <= a - c &&
              ((l.inputState.pinching = !0),
              this.dispatchEvent({
                type: "pinchstart",
                handedness: t.handedness,
                target: this,
              }));
        } else
          null !== a &&
            t.gripSpace &&
            ((r = e.getPose(t.gripSpace, n)),
            null !== r &&
              (a.matrix.fromArray(r.transform.matrix),
              a.matrix.decompose(a.position, a.rotation, a.scale),
              r.linearVelocity
                ? ((a.hasLinearVelocity = !0),
                  a.linearVelocity.copy(r.linearVelocity))
                : (a.hasLinearVelocity = !1),
              r.angularVelocity
                ? ((a.hasAngularVelocity = !0),
                  a.angularVelocity.copy(r.angularVelocity))
                : (a.hasAngularVelocity = !1)));
      return (
        null !== o && (o.visible = null !== i),
        null !== a && (a.visible = null !== r),
        null !== l && (l.visible = null !== s),
        this
      );
    }
  }
  class Yo extends Re {
    constructor(t, e, n, i, r, s, o, a, l, c) {
      if ((c = void 0 !== c ? c : Kt) !== Kt && c !== $t)
        throw new Error(
          "DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat"
        );
      void 0 === n && c === Kt && (n = jt),
        void 0 === n && c === $t && (n = qt),
        super(null, i, r, s, o, a, c, n, l),
        (this.image = { width: t, height: e }),
        (this.magFilter = void 0 !== o ? o : Ft),
        (this.minFilter = void 0 !== a ? a : Ft),
        (this.flipY = !1),
        (this.generateMipmaps = !1);
    }
  }
  Yo.prototype.isDepthTexture = !0;
  class Xo extends pe {
    constructor(t, e) {
      super();
      const n = this;
      let i = null,
        r = 1,
        s = null,
        o = "local-floor";
      const a = t.extensions.has("WEBGL_multisampled_render_to_texture");
      let l = null,
        c = null,
        h = null,
        u = null,
        d = !1,
        p = null;
      const m = e.getContextAttributes();
      let f = null,
        g = null;
      const v = [],
        x = new Map(),
        _ = new ji();
      _.layers.enable(1), (_.viewport = new Pe());
      const y = new ji();
      y.layers.enable(2), (y.viewport = new Pe());
      const b = [_, y],
        w = new Vo();
      w.layers.enable(1), w.layers.enable(2);
      let M = null,
        S = null;
      function T(t) {
        const e = x.get(t.inputSource);
        e && e.dispatchEvent({ type: t.type, data: t.inputSource });
      }
      function E() {
        x.forEach(function (t, e) {
          t.disconnect(e);
        }),
          x.clear(),
          (M = null),
          (S = null),
          t.setRenderTarget(f),
          (u = null),
          (h = null),
          (c = null),
          (i = null),
          (g = null),
          D.stop(),
          (n.isPresenting = !1),
          n.dispatchEvent({ type: "sessionend" });
      }
      function A(t) {
        const e = i.inputSources;
        for (let t = 0; t < v.length; t++) x.set(e[t], v[t]);
        for (let e = 0; e < t.removed.length; e++) {
          const n = t.removed[e],
            i = x.get(n);
          i &&
            (i.dispatchEvent({ type: "disconnected", data: n }), x.delete(n));
        }
        for (let e = 0; e < t.added.length; e++) {
          const n = t.added[e],
            i = x.get(n);
          i && i.dispatchEvent({ type: "connected", data: n });
        }
      }
      (this.cameraAutoUpdate = !0),
        (this.enabled = !1),
        (this.isPresenting = !1),
        (this.getController = function (t) {
          let e = v[t];
          return (
            void 0 === e && ((e = new Zo()), (v[t] = e)), e.getTargetRaySpace()
          );
        }),
        (this.getControllerGrip = function (t) {
          let e = v[t];
          return void 0 === e && ((e = new Zo()), (v[t] = e)), e.getGripSpace();
        }),
        (this.getHand = function (t) {
          let e = v[t];
          return void 0 === e && ((e = new Zo()), (v[t] = e)), e.getHandSpace();
        }),
        (this.setFramebufferScaleFactor = function (t) {
          (r = t),
            !0 === n.isPresenting &&
              console.warn(
                "THREE.WebXRManager: Cannot change framebuffer scale while presenting."
              );
        }),
        (this.setReferenceSpaceType = function (t) {
          (o = t),
            !0 === n.isPresenting &&
              console.warn(
                "THREE.WebXRManager: Cannot change reference space type while presenting."
              );
        }),
        (this.getReferenceSpace = function () {
          return s;
        }),
        (this.getBaseLayer = function () {
          return null !== h ? h : u;
        }),
        (this.getBinding = function () {
          return c;
        }),
        (this.getFrame = function () {
          return p;
        }),
        (this.getSession = function () {
          return i;
        }),
        (this.setSession = async function (l) {
          if (((i = l), null !== i)) {
            if (
              ((f = t.getRenderTarget()),
              i.addEventListener("select", T),
              i.addEventListener("selectstart", T),
              i.addEventListener("selectend", T),
              i.addEventListener("squeeze", T),
              i.addEventListener("squeezestart", T),
              i.addEventListener("squeezeend", T),
              i.addEventListener("end", E),
              i.addEventListener("inputsourceschange", A),
              !0 !== m.xrCompatible && (await e.makeXRCompatible()),
              void 0 === i.renderState.layers || !1 === t.capabilities.isWebGL2)
            ) {
              const n = {
                antialias: void 0 !== i.renderState.layers || m.antialias,
                alpha: m.alpha,
                depth: m.depth,
                stencil: m.stencil,
                framebufferScaleFactor: r,
              };
              (u = new XRWebGLLayer(i, e, n)),
                i.updateRenderState({ baseLayer: u }),
                (g = new De(u.framebufferWidth, u.framebufferHeight, {
                  format: Qt,
                  type: Wt,
                  encoding: t.outputEncoding,
                }));
            } else {
              d = m.antialias;
              let n = null,
                s = null,
                o = null;
              m.depth &&
                ((o = m.stencil ? 35056 : 33190),
                (n = m.stencil ? $t : Kt),
                (s = m.stencil ? qt : jt));
              const l = {
                colorFormat: m.alpha || d ? 32856 : 32849,
                depthFormat: o,
                scaleFactor: r,
              };
              (c = new XRWebGLBinding(i, e)),
                (h = c.createProjectionLayer(l)),
                i.updateRenderState({ layers: [h] }),
                (g = d
                  ? new Ie(h.textureWidth, h.textureHeight, {
                      format: Qt,
                      type: Wt,
                      depthTexture: new Yo(
                        h.textureWidth,
                        h.textureHeight,
                        s,
                        void 0,
                        void 0,
                        void 0,
                        void 0,
                        void 0,
                        void 0,
                        n
                      ),
                      stencilBuffer: m.stencil,
                      ignoreDepth: h.ignoreDepthValues,
                      useRenderToTexture: a,
                      encoding: t.outputEncoding,
                    })
                  : new De(h.textureWidth, h.textureHeight, {
                      format: m.alpha ? Qt : Jt,
                      type: Wt,
                      depthTexture: new Yo(
                        h.textureWidth,
                        h.textureHeight,
                        s,
                        void 0,
                        void 0,
                        void 0,
                        void 0,
                        void 0,
                        void 0,
                        n
                      ),
                      stencilBuffer: m.stencil,
                      ignoreDepth: h.ignoreDepthValues,
                      encoding: t.outputEncoding,
                    }));
            }
            this.setFoveation(1),
              (s = await i.requestReferenceSpace(o)),
              D.setContext(i),
              D.start(),
              (n.isPresenting = !0),
              n.dispatchEvent({ type: "sessionstart" });
          }
        });
      const L = new ze(),
        R = new ze();
      function C(t, e) {
        null === e
          ? t.matrixWorld.copy(t.matrix)
          : t.matrixWorld.multiplyMatrices(e.matrixWorld, t.matrix),
          t.matrixWorldInverse.copy(t.matrixWorld).invert();
      }
      (this.updateCamera = function (t) {
        if (null === i) return;
        (w.near = y.near = _.near = t.near),
          (w.far = y.far = _.far = t.far),
          (M === w.near && S === w.far) ||
            (i.updateRenderState({ depthNear: w.near, depthFar: w.far }),
            (M = w.near),
            (S = w.far));
        const e = t.parent,
          n = w.cameras;
        C(w, e);
        for (let t = 0; t < n.length; t++) C(n[t], e);
        w.matrixWorld.decompose(w.position, w.quaternion, w.scale),
          t.position.copy(w.position),
          t.quaternion.copy(w.quaternion),
          t.scale.copy(w.scale),
          t.matrix.copy(w.matrix),
          t.matrixWorld.copy(w.matrixWorld);
        const r = t.children;
        for (let t = 0, e = r.length; t < e; t++) r[t].updateMatrixWorld(!0);
        2 === n.length
          ? (function (t, e, n) {
              L.setFromMatrixPosition(e.matrixWorld),
                R.setFromMatrixPosition(n.matrixWorld);
              const i = L.distanceTo(R),
                r = e.projectionMatrix.elements,
                s = n.projectionMatrix.elements,
                o = r[14] / (r[10] - 1),
                a = r[14] / (r[10] + 1),
                l = (r[9] + 1) / r[5],
                c = (r[9] - 1) / r[5],
                h = (r[8] - 1) / r[0],
                u = (s[8] + 1) / s[0],
                d = o * h,
                p = o * u,
                m = i / (-h + u),
                f = m * -h;
              e.matrixWorld.decompose(t.position, t.quaternion, t.scale),
                t.translateX(f),
                t.translateZ(m),
                t.matrixWorld.compose(t.position, t.quaternion, t.scale),
                t.matrixWorldInverse.copy(t.matrixWorld).invert();
              const g = o + m,
                v = a + m,
                x = d - f,
                _ = p + (i - f),
                y = ((l * a) / v) * g,
                b = ((c * a) / v) * g;
              t.projectionMatrix.makePerspective(x, _, y, b, g, v);
            })(w, _, y)
          : w.projectionMatrix.copy(_.projectionMatrix);
      }),
        (this.getCamera = function () {
          return w;
        }),
        (this.getFoveation = function () {
          return null !== h
            ? h.fixedFoveation
            : null !== u
            ? u.fixedFoveation
            : void 0;
        }),
        (this.setFoveation = function (t) {
          null !== h && (h.fixedFoveation = t),
            null !== u && void 0 !== u.fixedFoveation && (u.fixedFoveation = t);
        });
      let P = null;
      const D = new ir();
      D.setAnimationLoop(function (e, n) {
        if (((l = n.getViewerPose(s)), (p = n), null !== l)) {
          const e = l.views;
          null !== u &&
            (t.setRenderTargetFramebuffer(g, u.framebuffer),
            t.setRenderTarget(g));
          let n = !1;
          e.length !== w.cameras.length && ((w.cameras.length = 0), (n = !0));
          for (let i = 0; i < e.length; i++) {
            const r = e[i];
            let s = null;
            if (null !== u) s = u.getViewport(r);
            else {
              const e = c.getViewSubImage(h, r);
              (s = e.viewport),
                0 === i &&
                  (t.setRenderTargetTextures(
                    g,
                    e.colorTexture,
                    h.ignoreDepthValues ? void 0 : e.depthStencilTexture
                  ),
                  t.setRenderTarget(g));
            }
            const o = b[i];
            o.matrix.fromArray(r.transform.matrix),
              o.projectionMatrix.fromArray(r.projectionMatrix),
              o.viewport.set(s.x, s.y, s.width, s.height),
              0 === i && w.matrix.copy(o.matrix),
              !0 === n && w.cameras.push(o);
          }
        }
        const r = i.inputSources;
        for (let t = 0; t < v.length; t++) {
          const e = v[t],
            i = r[t];
          e.update(i, n, s);
        }
        P && P(e, n), (p = null);
      }),
        (this.setAnimationLoop = function (t) {
          P = t;
        }),
        (this.dispose = function () {});
    }
  }
  function qo(t) {
    function e(e, n) {
      (e.opacity.value = n.opacity),
        n.color && e.diffuse.value.copy(n.color),
        n.emissive &&
          e.emissive.value.copy(n.emissive).multiplyScalar(n.emissiveIntensity),
        n.map && (e.map.value = n.map),
        n.alphaMap && (e.alphaMap.value = n.alphaMap),
        n.specularMap && (e.specularMap.value = n.specularMap),
        n.alphaTest > 0 && (e.alphaTest.value = n.alphaTest);
      const i = t.get(n).envMap;
      let r, s;
      i &&
        ((e.envMap.value = i),
        (e.flipEnvMap.value =
          i.isCubeTexture && !1 === i.isRenderTargetTexture ? -1 : 1),
        (e.reflectivity.value = n.reflectivity),
        (e.ior.value = n.ior),
        (e.refractionRatio.value = n.refractionRatio)),
        n.lightMap &&
          ((e.lightMap.value = n.lightMap),
          (e.lightMapIntensity.value = n.lightMapIntensity)),
        n.aoMap &&
          ((e.aoMap.value = n.aoMap),
          (e.aoMapIntensity.value = n.aoMapIntensity)),
        n.map
          ? (r = n.map)
          : n.specularMap
          ? (r = n.specularMap)
          : n.displacementMap
          ? (r = n.displacementMap)
          : n.normalMap
          ? (r = n.normalMap)
          : n.bumpMap
          ? (r = n.bumpMap)
          : n.roughnessMap
          ? (r = n.roughnessMap)
          : n.metalnessMap
          ? (r = n.metalnessMap)
          : n.alphaMap
          ? (r = n.alphaMap)
          : n.emissiveMap
          ? (r = n.emissiveMap)
          : n.clearcoatMap
          ? (r = n.clearcoatMap)
          : n.clearcoatNormalMap
          ? (r = n.clearcoatNormalMap)
          : n.clearcoatRoughnessMap
          ? (r = n.clearcoatRoughnessMap)
          : n.specularIntensityMap
          ? (r = n.specularIntensityMap)
          : n.specularColorMap
          ? (r = n.specularColorMap)
          : n.transmissionMap
          ? (r = n.transmissionMap)
          : n.thicknessMap
          ? (r = n.thicknessMap)
          : n.sheenColorMap
          ? (r = n.sheenColorMap)
          : n.sheenRoughnessMap && (r = n.sheenRoughnessMap),
        void 0 !== r &&
          (r.isWebGLRenderTarget && (r = r.texture),
          !0 === r.matrixAutoUpdate && r.updateMatrix(),
          e.uvTransform.value.copy(r.matrix)),
        n.aoMap ? (s = n.aoMap) : n.lightMap && (s = n.lightMap),
        void 0 !== s &&
          (s.isWebGLRenderTarget && (s = s.texture),
          !0 === s.matrixAutoUpdate && s.updateMatrix(),
          e.uv2Transform.value.copy(s.matrix));
    }
    function n(e, n) {
      (e.roughness.value = n.roughness),
        (e.metalness.value = n.metalness),
        n.roughnessMap && (e.roughnessMap.value = n.roughnessMap),
        n.metalnessMap && (e.metalnessMap.value = n.metalnessMap),
        n.emissiveMap && (e.emissiveMap.value = n.emissiveMap),
        n.bumpMap &&
          ((e.bumpMap.value = n.bumpMap),
          (e.bumpScale.value = n.bumpScale),
          1 === n.side && (e.bumpScale.value *= -1)),
        n.normalMap &&
          ((e.normalMap.value = n.normalMap),
          e.normalScale.value.copy(n.normalScale),
          1 === n.side && e.normalScale.value.negate()),
        n.displacementMap &&
          ((e.displacementMap.value = n.displacementMap),
          (e.displacementScale.value = n.displacementScale),
          (e.displacementBias.value = n.displacementBias));
      t.get(n).envMap && (e.envMapIntensity.value = n.envMapIntensity);
    }
    return {
      refreshFogUniforms: function (t, e) {
        t.fogColor.value.copy(e.color),
          e.isFog
            ? ((t.fogNear.value = e.near), (t.fogFar.value = e.far))
            : e.isFogExp2 && (t.fogDensity.value = e.density);
      },
      refreshMaterialUniforms: function (t, i, r, s, o) {
        i.isMeshBasicMaterial
          ? e(t, i)
          : i.isMeshLambertMaterial
          ? (e(t, i),
            (function (t, e) {
              e.emissiveMap && (t.emissiveMap.value = e.emissiveMap);
            })(t, i))
          : i.isMeshToonMaterial
          ? (e(t, i),
            (function (t, e) {
              e.gradientMap && (t.gradientMap.value = e.gradientMap);
              e.emissiveMap && (t.emissiveMap.value = e.emissiveMap);
              e.bumpMap &&
                ((t.bumpMap.value = e.bumpMap),
                (t.bumpScale.value = e.bumpScale),
                1 === e.side && (t.bumpScale.value *= -1));
              e.normalMap &&
                ((t.normalMap.value = e.normalMap),
                t.normalScale.value.copy(e.normalScale),
                1 === e.side && t.normalScale.value.negate());
              e.displacementMap &&
                ((t.displacementMap.value = e.displacementMap),
                (t.displacementScale.value = e.displacementScale),
                (t.displacementBias.value = e.displacementBias));
            })(t, i))
          : i.isMeshPhongMaterial
          ? (e(t, i),
            (function (t, e) {
              t.specular.value.copy(e.specular),
                (t.shininess.value = Math.max(e.shininess, 1e-4)),
                e.emissiveMap && (t.emissiveMap.value = e.emissiveMap);
              e.bumpMap &&
                ((t.bumpMap.value = e.bumpMap),
                (t.bumpScale.value = e.bumpScale),
                1 === e.side && (t.bumpScale.value *= -1));
              e.normalMap &&
                ((t.normalMap.value = e.normalMap),
                t.normalScale.value.copy(e.normalScale),
                1 === e.side && t.normalScale.value.negate());
              e.displacementMap &&
                ((t.displacementMap.value = e.displacementMap),
                (t.displacementScale.value = e.displacementScale),
                (t.displacementBias.value = e.displacementBias));
            })(t, i))
          : i.isMeshStandardMaterial
          ? (e(t, i),
            i.isMeshPhysicalMaterial
              ? (function (t, e, i) {
                  n(t, e),
                    (t.ior.value = e.ior),
                    e.sheen > 0 &&
                      (t.sheenColor.value
                        .copy(e.sheenColor)
                        .multiplyScalar(e.sheen),
                      (t.sheenRoughness.value = e.sheenRoughness),
                      e.sheenColorMap &&
                        (t.sheenColorMap.value = e.sheenColorMap),
                      e.sheenRoughnessMap &&
                        (t.sheenRoughnessMap.value = e.sheenRoughnessMap));
                  e.clearcoat > 0 &&
                    ((t.clearcoat.value = e.clearcoat),
                    (t.clearcoatRoughness.value = e.clearcoatRoughness),
                    e.clearcoatMap && (t.clearcoatMap.value = e.clearcoatMap),
                    e.clearcoatRoughnessMap &&
                      (t.clearcoatRoughnessMap.value = e.clearcoatRoughnessMap),
                    e.clearcoatNormalMap &&
                      (t.clearcoatNormalScale.value.copy(
                        e.clearcoatNormalScale
                      ),
                      (t.clearcoatNormalMap.value = e.clearcoatNormalMap),
                      1 === e.side && t.clearcoatNormalScale.value.negate()));
                  e.transmission > 0 &&
                    ((t.transmission.value = e.transmission),
                    (t.transmissionSamplerMap.value = i.texture),
                    t.transmissionSamplerSize.value.set(i.width, i.height),
                    e.transmissionMap &&
                      (t.transmissionMap.value = e.transmissionMap),
                    (t.thickness.value = e.thickness),
                    e.thicknessMap && (t.thicknessMap.value = e.thicknessMap),
                    (t.attenuationDistance.value = e.attenuationDistance),
                    t.attenuationColor.value.copy(e.attenuationColor));
                  (t.specularIntensity.value = e.specularIntensity),
                    t.specularColor.value.copy(e.specularColor),
                    e.specularIntensityMap &&
                      (t.specularIntensityMap.value = e.specularIntensityMap);
                  e.specularColorMap &&
                    (t.specularColorMap.value = e.specularColorMap);
                })(t, i, o)
              : n(t, i))
          : i.isMeshMatcapMaterial
          ? (e(t, i),
            (function (t, e) {
              e.matcap && (t.matcap.value = e.matcap);
              e.bumpMap &&
                ((t.bumpMap.value = e.bumpMap),
                (t.bumpScale.value = e.bumpScale),
                1 === e.side && (t.bumpScale.value *= -1));
              e.normalMap &&
                ((t.normalMap.value = e.normalMap),
                t.normalScale.value.copy(e.normalScale),
                1 === e.side && t.normalScale.value.negate());
              e.displacementMap &&
                ((t.displacementMap.value = e.displacementMap),
                (t.displacementScale.value = e.displacementScale),
                (t.displacementBias.value = e.displacementBias));
            })(t, i))
          : i.isMeshDepthMaterial
          ? (e(t, i),
            (function (t, e) {
              e.displacementMap &&
                ((t.displacementMap.value = e.displacementMap),
                (t.displacementScale.value = e.displacementScale),
                (t.displacementBias.value = e.displacementBias));
            })(t, i))
          : i.isMeshDistanceMaterial
          ? (e(t, i),
            (function (t, e) {
              e.displacementMap &&
                ((t.displacementMap.value = e.displacementMap),
                (t.displacementScale.value = e.displacementScale),
                (t.displacementBias.value = e.displacementBias));
              t.referencePosition.value.copy(e.referencePosition),
                (t.nearDistance.value = e.nearDistance),
                (t.farDistance.value = e.farDistance);
            })(t, i))
          : i.isMeshNormalMaterial
          ? (e(t, i),
            (function (t, e) {
              e.bumpMap &&
                ((t.bumpMap.value = e.bumpMap),
                (t.bumpScale.value = e.bumpScale),
                1 === e.side && (t.bumpScale.value *= -1));
              e.normalMap &&
                ((t.normalMap.value = e.normalMap),
                t.normalScale.value.copy(e.normalScale),
                1 === e.side && t.normalScale.value.negate());
              e.displacementMap &&
                ((t.displacementMap.value = e.displacementMap),
                (t.displacementScale.value = e.displacementScale),
                (t.displacementBias.value = e.displacementBias));
            })(t, i))
          : i.isLineBasicMaterial
          ? ((function (t, e) {
              t.diffuse.value.copy(e.color), (t.opacity.value = e.opacity);
            })(t, i),
            i.isLineDashedMaterial &&
              (function (t, e) {
                (t.dashSize.value = e.dashSize),
                  (t.totalSize.value = e.dashSize + e.gapSize),
                  (t.scale.value = e.scale);
              })(t, i))
          : i.isPointsMaterial
          ? (function (t, e, n, i) {
              t.diffuse.value.copy(e.color),
                (t.opacity.value = e.opacity),
                (t.size.value = e.size * n),
                (t.scale.value = 0.5 * i),
                e.map && (t.map.value = e.map);
              e.alphaMap && (t.alphaMap.value = e.alphaMap);
              e.alphaTest > 0 && (t.alphaTest.value = e.alphaTest);
              let r;
              e.map ? (r = e.map) : e.alphaMap && (r = e.alphaMap);
              void 0 !== r &&
                (!0 === r.matrixAutoUpdate && r.updateMatrix(),
                t.uvTransform.value.copy(r.matrix));
            })(t, i, r, s)
          : i.isSpriteMaterial
          ? (function (t, e) {
              t.diffuse.value.copy(e.color),
                (t.opacity.value = e.opacity),
                (t.rotation.value = e.rotation),
                e.map && (t.map.value = e.map);
              e.alphaMap && (t.alphaMap.value = e.alphaMap);
              e.alphaTest > 0 && (t.alphaTest.value = e.alphaTest);
              let n;
              e.map ? (n = e.map) : e.alphaMap && (n = e.alphaMap);
              void 0 !== n &&
                (!0 === n.matrixAutoUpdate && n.updateMatrix(),
                t.uvTransform.value.copy(n.matrix));
            })(t, i)
          : i.isShadowMaterial
          ? (t.color.value.copy(i.color), (t.opacity.value = i.opacity))
          : i.isShaderMaterial && (i.uniformsNeedUpdate = !1);
      },
    };
  }
  function Jo(t = {}) {
    const e =
        void 0 !== t.canvas
          ? t.canvas
          : (function () {
              const t = Te("canvas");
              return (t.style.display = "block"), t;
            })(),
      n = void 0 !== t.context ? t.context : null,
      i = void 0 !== t.alpha && t.alpha,
      r = void 0 === t.depth || t.depth,
      s = void 0 === t.stencil || t.stencil,
      o = void 0 !== t.antialias && t.antialias,
      a = void 0 === t.premultipliedAlpha || t.premultipliedAlpha,
      l = void 0 !== t.preserveDrawingBuffer && t.preserveDrawingBuffer,
      c = void 0 !== t.powerPreference ? t.powerPreference : "default",
      h =
        void 0 !== t.failIfMajorPerformanceCaveat &&
        t.failIfMajorPerformanceCaveat;
    let u = null,
      d = null;
    const p = [],
      m = [];
    (this.domElement = e),
      (this.debug = { checkShaderErrors: !0 }),
      (this.autoClear = !0),
      (this.autoClearColor = !0),
      (this.autoClearDepth = !0),
      (this.autoClearStencil = !0),
      (this.sortObjects = !0),
      (this.clippingPlanes = []),
      (this.localClippingEnabled = !1),
      (this.outputEncoding = ae),
      (this.physicallyCorrectLights = !1),
      (this.toneMapping = 0),
      (this.toneMappingExposure = 1);
    const f = this;
    let g = !1,
      v = 0,
      x = 0,
      _ = null,
      y = -1,
      b = null;
    const w = new Pe(),
      M = new Pe();
    let S = null,
      T = e.width,
      E = e.height,
      A = 1,
      L = null,
      R = null;
    const C = new Pe(0, 0, T, E),
      P = new Pe(0, 0, T, E);
    let D = !1;
    const I = [],
      N = new nr();
    let z = !1,
      k = !1,
      O = null;
    const F = new pn(),
      U = new ze(),
      B = {
        background: null,
        fog: null,
        environment: null,
        overrideMaterial: null,
        isScene: !0,
      };
    function H() {
      return null === _ ? A : 1;
    }
    let G,
      V,
      W,
      j,
      Z,
      Y,
      X,
      q,
      J,
      Q,
      K,
      $,
      tt,
      et,
      nt,
      it,
      rt,
      st,
      ot,
      at,
      lt,
      ct,
      ut,
      dt = n;
    function pt(t, n) {
      for (let i = 0; i < t.length; i++) {
        const r = t[i],
          s = e.getContext(r, n);
        if (null !== s) return s;
      }
      return null;
    }
    try {
      const t = {
        alpha: i,
        depth: r,
        stencil: s,
        antialias: o,
        premultipliedAlpha: a,
        preserveDrawingBuffer: l,
        powerPreference: c,
        failIfMajorPerformanceCaveat: h,
      };
      if (
        ("setAttribute" in e &&
          e.setAttribute("data-engine", `three.js r${ht}`),
        e.addEventListener("webglcontextlost", gt, !1),
        e.addEventListener("webglcontextrestored", vt, !1),
        null === dt)
      ) {
        const e = ["webgl2", "webgl", "experimental-webgl"];
        if (
          (!0 === f.isWebGL1Renderer && e.shift(), (dt = pt(e, t)), null === dt)
        )
          throw pt(e)
            ? new Error(
                "Error creating WebGL context with your selected attributes."
              )
            : new Error("Error creating WebGL context.");
      }
      void 0 === dt.getShaderPrecisionFormat &&
        (dt.getShaderPrecisionFormat = function () {
          return { rangeMin: 1, rangeMax: 1, precision: 1 };
        });
    } catch (t) {
      throw (console.error("THREE.WebGLRenderer: " + t.message), t);
    }
    function mt() {
      (G = new Br(dt)),
        (V = new dr(dt, G, t)),
        G.init(V),
        (ct = new Go(dt, G, V)),
        (W = new Bo(dt, G, V)),
        (I[0] = 1029),
        (j = new Vr()),
        (Z = new Eo()),
        (Y = new Ho(dt, G, W, Z, V, ct, j)),
        (X = new mr(f)),
        (q = new Ur(f)),
        (J = new rr(dt, V)),
        (ut = new hr(dt, G, J, V)),
        (Q = new Hr(dt, J, j, ut)),
        (K = new qr(dt, Q, J, j)),
        (ot = new Xr(dt, V, Y)),
        (it = new pr(Z)),
        ($ = new To(f, X, q, G, V, ut, it)),
        (tt = new qo(Z)),
        (et = new Co()),
        (nt = new ko(G, V)),
        (st = new cr(f, X, W, K, a)),
        (rt = new Uo(f, K, V)),
        (at = new ur(dt, G, j, V)),
        (lt = new Gr(dt, G, j, V)),
        (j.programs = $.programs),
        (f.capabilities = V),
        (f.extensions = G),
        (f.properties = Z),
        (f.renderLists = et),
        (f.shadowMap = rt),
        (f.state = W),
        (f.info = j);
    }
    mt();
    const ft = new Xo(f, dt);
    function gt(t) {
      t.preventDefault(),
        console.log("THREE.WebGLRenderer: Context Lost."),
        (g = !0);
    }
    function vt() {
      console.log("THREE.WebGLRenderer: Context Restored."), (g = !1);
      const t = j.autoReset,
        e = rt.enabled,
        n = rt.autoUpdate,
        i = rt.needsUpdate,
        r = rt.type;
      mt(),
        (j.autoReset = t),
        (rt.enabled = e),
        (rt.autoUpdate = n),
        (rt.needsUpdate = i),
        (rt.type = r);
    }
    function xt(t) {
      const e = t.target;
      e.removeEventListener("dispose", xt),
        (function (t) {
          (function (t) {
            const e = Z.get(t).programs;
            void 0 !== e &&
              (e.forEach(function (t) {
                $.releaseProgram(t);
              }),
              t.isShaderMaterial && $.releaseShaderCache(t));
          })(t),
            Z.remove(t);
        })(e);
    }
    (this.xr = ft),
      (this.getContext = function () {
        return dt;
      }),
      (this.getContextAttributes = function () {
        return dt.getContextAttributes();
      }),
      (this.forceContextLoss = function () {
        const t = G.get("WEBGL_lose_context");
        t && t.loseContext();
      }),
      (this.forceContextRestore = function () {
        const t = G.get("WEBGL_lose_context");
        t && t.restoreContext();
      }),
      (this.getPixelRatio = function () {
        return A;
      }),
      (this.setPixelRatio = function (t) {
        void 0 !== t && ((A = t), this.setSize(T, E, !1));
      }),
      (this.getSize = function (t) {
        return t.set(T, E);
      }),
      (this.setSize = function (t, n, i) {
        ft.isPresenting
          ? console.warn(
              "THREE.WebGLRenderer: Can't change size while VR device is presenting."
            )
          : ((T = t),
            (E = n),
            (e.width = Math.floor(t * A)),
            (e.height = Math.floor(n * A)),
            !1 !== i &&
              ((e.style.width = t + "px"), (e.style.height = n + "px")),
            this.setViewport(0, 0, t, n));
      }),
      (this.getDrawingBufferSize = function (t) {
        return t.set(T * A, E * A).floor();
      }),
      (this.setDrawingBufferSize = function (t, n, i) {
        (T = t),
          (E = n),
          (A = i),
          (e.width = Math.floor(t * i)),
          (e.height = Math.floor(n * i)),
          this.setViewport(0, 0, t, n);
      }),
      (this.getCurrentViewport = function (t) {
        return t.copy(w);
      }),
      (this.getViewport = function (t) {
        return t.copy(C);
      }),
      (this.setViewport = function (t, e, n, i) {
        t.isVector4 ? C.set(t.x, t.y, t.z, t.w) : C.set(t, e, n, i),
          W.viewport(w.copy(C).multiplyScalar(A).floor());
      }),
      (this.getScissor = function (t) {
        return t.copy(P);
      }),
      (this.setScissor = function (t, e, n, i) {
        t.isVector4 ? P.set(t.x, t.y, t.z, t.w) : P.set(t, e, n, i),
          W.scissor(M.copy(P).multiplyScalar(A).floor());
      }),
      (this.getScissorTest = function () {
        return D;
      }),
      (this.setScissorTest = function (t) {
        W.setScissorTest((D = t));
      }),
      (this.setOpaqueSort = function (t) {
        L = t;
      }),
      (this.setTransparentSort = function (t) {
        R = t;
      }),
      (this.getClearColor = function (t) {
        return t.copy(st.getClearColor());
      }),
      (this.setClearColor = function () {
        st.setClearColor.apply(st, arguments);
      }),
      (this.getClearAlpha = function () {
        return st.getClearAlpha();
      }),
      (this.setClearAlpha = function () {
        st.setClearAlpha.apply(st, arguments);
      }),
      (this.clear = function (t, e, n) {
        let i = 0;
        (void 0 === t || t) && (i |= 16384),
          (void 0 === e || e) && (i |= 256),
          (void 0 === n || n) && (i |= 1024),
          dt.clear(i);
      }),
      (this.clearColor = function () {
        this.clear(!0, !1, !1);
      }),
      (this.clearDepth = function () {
        this.clear(!1, !0, !1);
      }),
      (this.clearStencil = function () {
        this.clear(!1, !1, !0);
      }),
      (this.dispose = function () {
        e.removeEventListener("webglcontextlost", gt, !1),
          e.removeEventListener("webglcontextrestored", vt, !1),
          et.dispose(),
          nt.dispose(),
          Z.dispose(),
          X.dispose(),
          q.dispose(),
          K.dispose(),
          ut.dispose(),
          $.dispose(),
          ft.dispose(),
          ft.removeEventListener("sessionstart", yt),
          ft.removeEventListener("sessionend", bt),
          O && (O.dispose(), (O = null)),
          wt.stop();
      }),
      (this.renderBufferDirect = function (t, e, n, i, r, s) {
        null === e && (e = B);
        const o = r.isMesh && r.matrixWorld.determinant() < 0,
          a = (function (t, e, n, i, r) {
            !0 !== e.isScene && (e = B);
            Y.resetTextureUnits();
            const s = e.fog,
              o = i.isMeshStandardMaterial ? e.environment : null,
              a = null === _ ? f.outputEncoding : _.texture.encoding,
              l = (i.isMeshStandardMaterial ? q : X).get(i.envMap || o),
              c =
                !0 === i.vertexColors &&
                !!n.attributes.color &&
                4 === n.attributes.color.itemSize,
              h = !!i.normalMap && !!n.attributes.tangent,
              u = !!n.morphAttributes.position,
              p = !!n.morphAttributes.normal,
              m = n.morphAttributes.position
                ? n.morphAttributes.position.length
                : 0,
              g = i.toneMapped ? f.toneMapping : 0,
              v = Z.get(i),
              x = d.state.lights;
            if (!0 === z && (!0 === k || t !== b)) {
              const e = t === b && i.id === y;
              it.setState(i, t, e);
            }
            let w = !1;
            i.version === v.__version
              ? (v.needsLights && v.lightsStateVersion !== x.state.version) ||
                v.outputEncoding !== a ||
                (r.isInstancedMesh && !1 === v.instancing)
                ? (w = !0)
                : r.isInstancedMesh || !0 !== v.instancing
                ? r.isSkinnedMesh && !1 === v.skinning
                  ? (w = !0)
                  : r.isSkinnedMesh || !0 !== v.skinning
                  ? v.envMap !== l || (i.fog && v.fog !== s)
                    ? (w = !0)
                    : void 0 === v.numClippingPlanes ||
                      (v.numClippingPlanes === it.numPlanes &&
                        v.numIntersection === it.numIntersection)
                    ? (v.vertexAlphas !== c ||
                        v.vertexTangents !== h ||
                        v.morphTargets !== u ||
                        v.morphNormals !== p ||
                        v.toneMapping !== g ||
                        (!0 === V.isWebGL2 && v.morphTargetsCount !== m)) &&
                      (w = !0)
                    : (w = !0)
                  : (w = !0)
                : (w = !0)
              : ((w = !0), (v.__version = i.version));
            let M = v.currentProgram;
            !0 === w && (M = At(i, e, r));
            let S = !1,
              T = !1,
              L = !1;
            const R = M.getUniforms(),
              C = v.uniforms;
            W.useProgram(M.program) && ((S = !0), (T = !0), (L = !0));
            i.id !== y && ((y = i.id), (T = !0));
            if (S || b !== t) {
              if (
                (R.setValue(dt, "projectionMatrix", t.projectionMatrix),
                V.logarithmicDepthBuffer &&
                  R.setValue(
                    dt,
                    "logDepthBufFC",
                    2 / (Math.log(t.far + 1) / Math.LN2)
                  ),
                b !== t && ((b = t), (T = !0), (L = !0)),
                i.isShaderMaterial ||
                  i.isMeshPhongMaterial ||
                  i.isMeshToonMaterial ||
                  i.isMeshStandardMaterial ||
                  i.envMap)
              ) {
                const e = R.map.cameraPosition;
                void 0 !== e &&
                  e.setValue(dt, U.setFromMatrixPosition(t.matrixWorld));
              }
              (i.isMeshPhongMaterial ||
                i.isMeshToonMaterial ||
                i.isMeshLambertMaterial ||
                i.isMeshBasicMaterial ||
                i.isMeshStandardMaterial ||
                i.isShaderMaterial) &&
                R.setValue(dt, "isOrthographic", !0 === t.isOrthographicCamera),
                (i.isMeshPhongMaterial ||
                  i.isMeshToonMaterial ||
                  i.isMeshLambertMaterial ||
                  i.isMeshBasicMaterial ||
                  i.isMeshStandardMaterial ||
                  i.isShaderMaterial ||
                  i.isShadowMaterial ||
                  r.isSkinnedMesh) &&
                  R.setValue(dt, "viewMatrix", t.matrixWorldInverse);
            }
            if (r.isSkinnedMesh) {
              R.setOptional(dt, r, "bindMatrix"),
                R.setOptional(dt, r, "bindMatrixInverse");
              const t = r.skeleton;
              t &&
                (V.floatVertexTextures
                  ? (null === t.boneTexture && t.computeBoneTexture(),
                    R.setValue(dt, "boneTexture", t.boneTexture, Y),
                    R.setValue(dt, "boneTextureSize", t.boneTextureSize))
                  : R.setOptional(dt, t, "boneMatrices"));
            }
            !n ||
              (void 0 === n.morphAttributes.position &&
                void 0 === n.morphAttributes.normal) ||
              ot.update(r, n, i, M);
            (T || v.receiveShadow !== r.receiveShadow) &&
              ((v.receiveShadow = r.receiveShadow),
              R.setValue(dt, "receiveShadow", r.receiveShadow));
            T &&
              (R.setValue(dt, "toneMappingExposure", f.toneMappingExposure),
              v.needsLights &&
                ((D = L),
                ((P = C).ambientLightColor.needsUpdate = D),
                (P.lightProbe.needsUpdate = D),
                (P.directionalLights.needsUpdate = D),
                (P.directionalLightShadows.needsUpdate = D),
                (P.pointLights.needsUpdate = D),
                (P.pointLightShadows.needsUpdate = D),
                (P.spotLights.needsUpdate = D),
                (P.spotLightShadows.needsUpdate = D),
                (P.rectAreaLights.needsUpdate = D),
                (P.hemisphereLights.needsUpdate = D)),
              s && i.fog && tt.refreshFogUniforms(C, s),
              tt.refreshMaterialUniforms(C, i, A, E, O),
              to.upload(dt, v.uniformsList, C, Y));
            var P, D;
            i.isShaderMaterial &&
              !0 === i.uniformsNeedUpdate &&
              (to.upload(dt, v.uniformsList, C, Y),
              (i.uniformsNeedUpdate = !1));
            i.isSpriteMaterial && R.setValue(dt, "center", r.center);
            return (
              R.setValue(dt, "modelViewMatrix", r.modelViewMatrix),
              R.setValue(dt, "normalMatrix", r.normalMatrix),
              R.setValue(dt, "modelMatrix", r.matrixWorld),
              M
            );
          })(t, e, n, i, r);
        W.setMaterial(i, o);
        let l = n.index;
        const c = n.attributes.position;
        if (null === l) {
          if (void 0 === c || 0 === c.count) return;
        } else if (0 === l.count) return;
        let h,
          u = 1;
        !0 === i.wireframe && ((l = Q.getWireframeAttribute(n)), (u = 2)),
          ut.setup(r, i, a, n, l);
        let p = at;
        null !== l && ((h = J.get(l)), (p = lt), p.setIndex(h));
        const m = null !== l ? l.count : c.count,
          g = n.drawRange.start * u,
          v = n.drawRange.count * u,
          x = null !== s ? s.start * u : 0,
          w = null !== s ? s.count * u : 1 / 0,
          M = Math.max(g, x),
          S = Math.min(m, g + v, x + w) - 1,
          T = Math.max(0, S - M + 1);
        if (0 !== T) {
          if (r.isMesh)
            !0 === i.wireframe
              ? (W.setLineWidth(i.wireframeLinewidth * H()), p.setMode(1))
              : p.setMode(4);
          else if (r.isLine) {
            let t = i.linewidth;
            void 0 === t && (t = 1),
              W.setLineWidth(t * H()),
              r.isLineSegments
                ? p.setMode(1)
                : r.isLineLoop
                ? p.setMode(2)
                : p.setMode(3);
          } else r.isPoints ? p.setMode(0) : r.isSprite && p.setMode(4);
          if (r.isInstancedMesh) p.renderInstances(M, T, r.count);
          else if (n.isInstancedBufferGeometry) {
            const t = Math.min(n.instanceCount, n._maxInstanceCount);
            p.renderInstances(M, T, t);
          } else p.render(M, T);
        }
      }),
      (this.compile = function (t, e) {
        (d = nt.get(t)),
          d.init(),
          m.push(d),
          t.traverseVisible(function (t) {
            t.isLight &&
              t.layers.test(e.layers) &&
              (d.pushLight(t), t.castShadow && d.pushShadow(t));
          }),
          d.setupLights(f.physicallyCorrectLights),
          t.traverse(function (e) {
            const n = e.material;
            if (n)
              if (Array.isArray(n))
                for (let i = 0; i < n.length; i++) {
                  At(n[i], t, e);
                }
              else At(n, t, e);
          }),
          m.pop(),
          (d = null);
      });
    let _t = null;
    function yt() {
      wt.stop();
    }
    function bt() {
      wt.start();
    }
    const wt = new ir();
    function Mt(t, e, n, i) {
      if (!1 === t.visible) return;
      if (t.layers.test(e.layers))
        if (t.isGroup) n = t.renderOrder;
        else if (t.isLOD) !0 === t.autoUpdate && t.update(e);
        else if (t.isLight) d.pushLight(t), t.castShadow && d.pushShadow(t);
        else if (t.isSprite) {
          if (!t.frustumCulled || N.intersectsSprite(t)) {
            i && U.setFromMatrixPosition(t.matrixWorld).applyMatrix4(F);
            const e = K.update(t),
              r = t.material;
            r.visible && u.push(t, e, r, n, U.z, null);
          }
        } else if (
          (t.isMesh || t.isLine || t.isPoints) &&
          (t.isSkinnedMesh &&
            t.skeleton.frame !== j.render.frame &&
            (t.skeleton.update(), (t.skeleton.frame = j.render.frame)),
          !t.frustumCulled || N.intersectsObject(t))
        ) {
          i && U.setFromMatrixPosition(t.matrixWorld).applyMatrix4(F);
          const e = K.update(t),
            r = t.material;
          if (Array.isArray(r)) {
            const i = e.groups;
            for (let s = 0, o = i.length; s < o; s++) {
              const o = i[s],
                a = r[o.materialIndex];
              a && a.visible && u.push(t, e, a, n, U.z, o);
            }
          } else r.visible && u.push(t, e, r, n, U.z, null);
        }
      const r = t.children;
      for (let t = 0, s = r.length; t < s; t++) Mt(r[t], e, n, i);
    }
    function St(t, e, n, i) {
      const r = t.opaque,
        s = t.transmissive,
        a = t.transparent;
      d.setupLightsView(n),
        s.length > 0 &&
          (function (t, e, n) {
            if (null === O) {
              const t = !0 === o && !0 === V.isWebGL2;
              O = new (t ? Ie : De)(1024, 1024, {
                generateMipmaps: !0,
                type: null !== ct.convert(Xt) ? Xt : Wt,
                minFilter: Vt,
                magFilter: Ft,
                wrapS: kt,
                wrapT: kt,
                useRenderToTexture: G.has(
                  "WEBGL_multisampled_render_to_texture"
                ),
              });
            }
            const i = f.getRenderTarget();
            f.setRenderTarget(O), f.clear();
            const r = f.toneMapping;
            (f.toneMapping = 0),
              Tt(t, e, n),
              (f.toneMapping = r),
              Y.updateMultisampleRenderTarget(O),
              Y.updateRenderTargetMipmap(O),
              f.setRenderTarget(i);
          })(r, e, n),
        i && W.viewport(w.copy(i)),
        r.length > 0 && Tt(r, e, n),
        s.length > 0 && Tt(s, e, n),
        a.length > 0 && Tt(a, e, n);
    }
    function Tt(t, e, n) {
      const i = !0 === e.isScene ? e.overrideMaterial : null;
      for (let r = 0, s = t.length; r < s; r++) {
        const s = t[r],
          o = s.object,
          a = s.geometry,
          l = null === i ? s.material : i,
          c = s.group;
        o.layers.test(n.layers) && Et(o, e, n, a, l, c);
      }
    }
    function Et(t, e, n, i, r, s) {
      t.onBeforeRender(f, e, n, i, r, s),
        t.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse, t.matrixWorld),
        t.normalMatrix.getNormalMatrix(t.modelViewMatrix),
        r.onBeforeRender(f, e, n, i, t, s),
        !0 === r.transparent && 2 === r.side
          ? ((r.side = 1),
            (r.needsUpdate = !0),
            f.renderBufferDirect(n, e, i, r, t, s),
            (r.side = 0),
            (r.needsUpdate = !0),
            f.renderBufferDirect(n, e, i, r, t, s),
            (r.side = 2))
          : f.renderBufferDirect(n, e, i, r, t, s),
        t.onAfterRender(f, e, n, i, r, s);
    }
    function At(t, e, n) {
      !0 !== e.isScene && (e = B);
      const i = Z.get(t),
        r = d.state.lights,
        s = d.state.shadowsArray,
        o = r.state.version,
        a = $.getParameters(t, r.state, s, e, n),
        l = $.getProgramCacheKey(a);
      let c = i.programs;
      (i.environment = t.isMeshStandardMaterial ? e.environment : null),
        (i.fog = e.fog),
        (i.envMap = (t.isMeshStandardMaterial ? q : X).get(
          t.envMap || i.environment
        )),
        void 0 === c &&
          (t.addEventListener("dispose", xt),
          (c = new Map()),
          (i.programs = c));
      let h = c.get(l);
      if (void 0 !== h) {
        if (i.currentProgram === h && i.lightsStateVersion === o)
          return Lt(t, a), h;
      } else (a.uniforms = $.getUniforms(t)), t.onBuild(n, a, f), t.onBeforeCompile(a, f), (h = $.acquireProgram(a, l)), c.set(l, h), (i.uniforms = a.uniforms);
      const u = i.uniforms;
      ((t.isShaderMaterial || t.isRawShaderMaterial) && !0 !== t.clipping) ||
        (u.clippingPlanes = it.uniform),
        Lt(t, a),
        (i.needsLights = (function (t) {
          return (
            t.isMeshLambertMaterial ||
            t.isMeshToonMaterial ||
            t.isMeshPhongMaterial ||
            t.isMeshStandardMaterial ||
            t.isShadowMaterial ||
            (t.isShaderMaterial && !0 === t.lights)
          );
        })(t)),
        (i.lightsStateVersion = o),
        i.needsLights &&
          ((u.ambientLightColor.value = r.state.ambient),
          (u.lightProbe.value = r.state.probe),
          (u.directionalLights.value = r.state.directional),
          (u.directionalLightShadows.value = r.state.directionalShadow),
          (u.spotLights.value = r.state.spot),
          (u.spotLightShadows.value = r.state.spotShadow),
          (u.rectAreaLights.value = r.state.rectArea),
          (u.ltc_1.value = r.state.rectAreaLTC1),
          (u.ltc_2.value = r.state.rectAreaLTC2),
          (u.pointLights.value = r.state.point),
          (u.pointLightShadows.value = r.state.pointShadow),
          (u.hemisphereLights.value = r.state.hemi),
          (u.directionalShadowMap.value = r.state.directionalShadowMap),
          (u.directionalShadowMatrix.value = r.state.directionalShadowMatrix),
          (u.spotShadowMap.value = r.state.spotShadowMap),
          (u.spotShadowMatrix.value = r.state.spotShadowMatrix),
          (u.pointShadowMap.value = r.state.pointShadowMap),
          (u.pointShadowMatrix.value = r.state.pointShadowMatrix));
      const p = h.getUniforms(),
        m = to.seqWithValue(p.seq, u);
      return (i.currentProgram = h), (i.uniformsList = m), h;
    }
    function Lt(t, e) {
      const n = Z.get(t);
      (n.outputEncoding = e.outputEncoding),
        (n.instancing = e.instancing),
        (n.skinning = e.skinning),
        (n.morphTargets = e.morphTargets),
        (n.morphNormals = e.morphNormals),
        (n.morphTargetsCount = e.morphTargetsCount),
        (n.numClippingPlanes = e.numClippingPlanes),
        (n.numIntersection = e.numClipIntersection),
        (n.vertexAlphas = e.vertexAlphas),
        (n.vertexTangents = e.vertexTangents),
        (n.toneMapping = e.toneMapping);
    }
    wt.setAnimationLoop(function (t) {
      _t && _t(t);
    }),
      "undefined" != typeof window && wt.setContext(window),
      (this.setAnimationLoop = function (t) {
        (_t = t), ft.setAnimationLoop(t), null === t ? wt.stop() : wt.start();
      }),
      ft.addEventListener("sessionstart", yt),
      ft.addEventListener("sessionend", bt),
      (this.render = function (t, e) {
        if (void 0 !== e && !0 !== e.isCamera)
          return void console.error(
            "THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera."
          );
        if (!0 === g) return;
        !0 === t.autoUpdate && t.updateMatrixWorld(),
          null === e.parent && e.updateMatrixWorld(),
          !0 === ft.enabled &&
            !0 === ft.isPresenting &&
            (!0 === ft.cameraAutoUpdate && ft.updateCamera(e),
            (e = ft.getCamera())),
          !0 === t.isScene && t.onBeforeRender(f, t, e, _),
          (d = nt.get(t, m.length)),
          d.init(),
          m.push(d),
          F.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse),
          N.setFromProjectionMatrix(F),
          (k = this.localClippingEnabled),
          (z = it.init(this.clippingPlanes, k, e)),
          (u = et.get(t, p.length)),
          u.init(),
          p.push(u),
          Mt(t, e, 0, f.sortObjects),
          u.finish(),
          !0 === f.sortObjects && u.sort(L, R),
          !0 === z && it.beginShadows();
        const n = d.state.shadowsArray;
        if (
          (rt.render(n, t, e),
          !0 === z && it.endShadows(),
          !0 === this.info.autoReset && this.info.reset(),
          st.render(u, t),
          d.setupLights(f.physicallyCorrectLights),
          e.isArrayCamera)
        ) {
          const n = e.cameras;
          for (let e = 0, i = n.length; e < i; e++) {
            const i = n[e];
            St(u, t, i, i.viewport);
          }
        } else St(u, t, e);
        null !== _ &&
          (Y.updateMultisampleRenderTarget(_), Y.updateRenderTargetMipmap(_)),
          !0 === t.isScene && t.onAfterRender(f, t, e),
          W.buffers.depth.setTest(!0),
          W.buffers.depth.setMask(!0),
          W.buffers.color.setMask(!0),
          W.setPolygonOffset(!1),
          ut.resetDefaultState(),
          (y = -1),
          (b = null),
          m.pop(),
          (d = m.length > 0 ? m[m.length - 1] : null),
          p.pop(),
          (u = p.length > 0 ? p[p.length - 1] : null);
      }),
      (this.getActiveCubeFace = function () {
        return v;
      }),
      (this.getActiveMipmapLevel = function () {
        return x;
      }),
      (this.getRenderTarget = function () {
        return _;
      }),
      (this.setRenderTargetTextures = function (t, e, n) {
        (Z.get(t.texture).__webglTexture = e),
          (Z.get(t.depthTexture).__webglTexture = n);
        const i = Z.get(t);
        (i.__hasExternalTextures = !0),
          i.__hasExternalTextures &&
            ((i.__autoAllocateDepthBuffer = void 0 === n),
            i.__autoAllocateDepthBuffer ||
              (t.useRenderToTexture &&
                (console.warn(
                  "render-to-texture extension was disabled because an external texture was provided"
                ),
                (t.useRenderToTexture = !1),
                (t.useRenderbuffer = !0))));
      }),
      (this.setRenderTargetFramebuffer = function (t, e) {
        const n = Z.get(t);
        (n.__webglFramebuffer = e), (n.__useDefaultFramebuffer = void 0 === e);
      }),
      (this.setRenderTarget = function (t, e = 0, n = 0) {
        (_ = t), (v = e), (x = n);
        let i = !0;
        if (t) {
          const e = Z.get(t);
          void 0 !== e.__useDefaultFramebuffer
            ? (W.bindFramebuffer(36160, null), (i = !1))
            : void 0 === e.__webglFramebuffer
            ? Y.setupRenderTarget(t)
            : e.__hasExternalTextures &&
              Y.rebindTextures(
                t,
                Z.get(t.texture).__webglTexture,
                Z.get(t.depthTexture).__webglTexture
              );
        }
        let r = null,
          s = !1,
          o = !1;
        if (t) {
          const n = t.texture;
          (n.isDataTexture3D || n.isDataTexture2DArray) && (o = !0);
          const i = Z.get(t).__webglFramebuffer;
          t.isWebGLCubeRenderTarget
            ? ((r = i[e]), (s = !0))
            : (r = t.useRenderbuffer
                ? Z.get(t).__webglMultisampledFramebuffer
                : i),
            w.copy(t.viewport),
            M.copy(t.scissor),
            (S = t.scissorTest);
        } else
          w.copy(C).multiplyScalar(A).floor(),
            M.copy(P).multiplyScalar(A).floor(),
            (S = D);
        if (W.bindFramebuffer(36160, r) && V.drawBuffers && i) {
          let e = !1;
          if (t)
            if (t.isWebGLMultipleRenderTargets) {
              const n = t.texture;
              if (I.length !== n.length || 36064 !== I[0]) {
                for (let t = 0, e = n.length; t < e; t++) I[t] = 36064 + t;
                (I.length = n.length), (e = !0);
              }
            } else
              (1 === I.length && 36064 === I[0]) ||
                ((I[0] = 36064), (I.length = 1), (e = !0));
          else
            (1 === I.length && 1029 === I[0]) ||
              ((I[0] = 1029), (I.length = 1), (e = !0));
          e &&
            (V.isWebGL2
              ? dt.drawBuffers(I)
              : G.get("WEBGL_draw_buffers").drawBuffersWEBGL(I));
        }
        if ((W.viewport(w), W.scissor(M), W.setScissorTest(S), s)) {
          const i = Z.get(t.texture);
          dt.framebufferTexture2D(36160, 36064, 34069 + e, i.__webglTexture, n);
        } else if (o) {
          const i = Z.get(t.texture),
            r = e || 0;
          dt.framebufferTextureLayer(36160, 36064, i.__webglTexture, n || 0, r);
        }
        y = -1;
      }),
      (this.readRenderTargetPixels = function (t, e, n, i, r, s, o) {
        if (!t || !t.isWebGLRenderTarget)
          return void console.error(
            "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget."
          );
        let a = Z.get(t).__webglFramebuffer;
        if ((t.isWebGLCubeRenderTarget && void 0 !== o && (a = a[o]), a)) {
          W.bindFramebuffer(36160, a);
          try {
            const o = t.texture,
              a = o.format,
              l = o.type;
            if (a !== Qt && ct.convert(a) !== dt.getParameter(35739))
              return void console.error(
                "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format."
              );
            const c =
              l === Xt &&
              (G.has("EXT_color_buffer_half_float") ||
                (V.isWebGL2 && G.has("EXT_color_buffer_float")));
            if (
              !(
                l === Wt ||
                ct.convert(l) === dt.getParameter(35738) ||
                (l === Yt &&
                  (V.isWebGL2 ||
                    G.has("OES_texture_float") ||
                    G.has("WEBGL_color_buffer_float"))) ||
                c
              )
            )
              return void console.error(
                "THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type."
              );
            36053 === dt.checkFramebufferStatus(36160)
              ? e >= 0 &&
                e <= t.width - i &&
                n >= 0 &&
                n <= t.height - r &&
                dt.readPixels(e, n, i, r, ct.convert(a), ct.convert(l), s)
              : console.error(
                  "THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete."
                );
          } finally {
            const t = null !== _ ? Z.get(_).__webglFramebuffer : null;
            W.bindFramebuffer(36160, t);
          }
        }
      }),
      (this.copyFramebufferToTexture = function (t, e, n = 0) {
        if (!0 !== e.isFramebufferTexture)
          return void console.error(
            "THREE.WebGLRenderer: copyFramebufferToTexture() can only be used with FramebufferTexture."
          );
        const i = Math.pow(2, -n),
          r = Math.floor(e.image.width * i),
          s = Math.floor(e.image.height * i);
        Y.setTexture2D(e, 0),
          dt.copyTexSubImage2D(3553, n, 0, 0, t.x, t.y, r, s),
          W.unbindTexture();
      }),
      (this.copyTextureToTexture = function (t, e, n, i = 0) {
        const r = e.image.width,
          s = e.image.height,
          o = ct.convert(n.format),
          a = ct.convert(n.type);
        Y.setTexture2D(n, 0),
          dt.pixelStorei(37440, n.flipY),
          dt.pixelStorei(37441, n.premultiplyAlpha),
          dt.pixelStorei(3317, n.unpackAlignment),
          e.isDataTexture
            ? dt.texSubImage2D(3553, i, t.x, t.y, r, s, o, a, e.image.data)
            : e.isCompressedTexture
            ? dt.compressedTexSubImage2D(
                3553,
                i,
                t.x,
                t.y,
                e.mipmaps[0].width,
                e.mipmaps[0].height,
                o,
                e.mipmaps[0].data
              )
            : dt.texSubImage2D(3553, i, t.x, t.y, o, a, e.image),
          0 === i && n.generateMipmaps && dt.generateMipmap(3553),
          W.unbindTexture();
      }),
      (this.copyTextureToTexture3D = function (t, e, n, i, r = 0) {
        if (f.isWebGL1Renderer)
          return void console.warn(
            "THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2."
          );
        const s = t.max.x - t.min.x + 1,
          o = t.max.y - t.min.y + 1,
          a = t.max.z - t.min.z + 1,
          l = ct.convert(i.format),
          c = ct.convert(i.type);
        let h;
        if (i.isDataTexture3D) Y.setTexture3D(i, 0), (h = 32879);
        else {
          if (!i.isDataTexture2DArray)
            return void console.warn(
              "THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray."
            );
          Y.setTexture2DArray(i, 0), (h = 35866);
        }
        dt.pixelStorei(37440, i.flipY),
          dt.pixelStorei(37441, i.premultiplyAlpha),
          dt.pixelStorei(3317, i.unpackAlignment);
        const u = dt.getParameter(3314),
          d = dt.getParameter(32878),
          p = dt.getParameter(3316),
          m = dt.getParameter(3315),
          g = dt.getParameter(32877),
          v = n.isCompressedTexture ? n.mipmaps[0] : n.image;
        dt.pixelStorei(3314, v.width),
          dt.pixelStorei(32878, v.height),
          dt.pixelStorei(3316, t.min.x),
          dt.pixelStorei(3315, t.min.y),
          dt.pixelStorei(32877, t.min.z),
          n.isDataTexture || n.isDataTexture3D
            ? dt.texSubImage3D(h, r, e.x, e.y, e.z, s, o, a, l, c, v.data)
            : n.isCompressedTexture
            ? (console.warn(
                "THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."
              ),
              dt.compressedTexSubImage3D(
                h,
                r,
                e.x,
                e.y,
                e.z,
                s,
                o,
                a,
                l,
                v.data
              ))
            : dt.texSubImage3D(h, r, e.x, e.y, e.z, s, o, a, l, c, v),
          dt.pixelStorei(3314, u),
          dt.pixelStorei(32878, d),
          dt.pixelStorei(3316, p),
          dt.pixelStorei(3315, m),
          dt.pixelStorei(32877, g),
          0 === r && i.generateMipmaps && dt.generateMipmap(h),
          W.unbindTexture();
      }),
      (this.initTexture = function (t) {
        Y.setTexture2D(t, 0), W.unbindTexture();
      }),
      (this.resetState = function () {
        (v = 0), (x = 0), (_ = null), W.reset(), ut.reset();
      }),
      "undefined" != typeof __THREE_DEVTOOLS__ &&
        __THREE_DEVTOOLS__.dispatchEvent(
          new CustomEvent("observe", { detail: this })
        );
  }
  Jo.prototype.isWebGLRenderer = !0;
  (class extends Jo {}).prototype.isWebGL1Renderer = !0;
  class Qo extends Fn {
    constructor() {
      super(),
        (this.type = "Scene"),
        (this.background = null),
        (this.environment = null),
        (this.fog = null),
        (this.overrideMaterial = null),
        (this.autoUpdate = !0),
        "undefined" != typeof __THREE_DEVTOOLS__ &&
          __THREE_DEVTOOLS__.dispatchEvent(
            new CustomEvent("observe", { detail: this })
          );
    }
    copy(t, e) {
      return (
        super.copy(t, e),
        null !== t.background && (this.background = t.background.clone()),
        null !== t.environment && (this.environment = t.environment.clone()),
        null !== t.fog && (this.fog = t.fog.clone()),
        null !== t.overrideMaterial &&
          (this.overrideMaterial = t.overrideMaterial.clone()),
        (this.autoUpdate = t.autoUpdate),
        (this.matrixAutoUpdate = t.matrixAutoUpdate),
        this
      );
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return null !== this.fog && (e.object.fog = this.fog.toJSON()), e;
    }
  }
  Qo.prototype.isScene = !0;
  class Ko {
    constructor(t, e) {
      (this.array = t),
        (this.stride = e),
        (this.count = void 0 !== t ? t.length / e : 0),
        (this.usage = he),
        (this.updateRange = { offset: 0, count: -1 }),
        (this.version = 0),
        (this.uuid = ve());
    }
    onUploadCallback() {}
    set needsUpdate(t) {
      !0 === t && this.version++;
    }
    setUsage(t) {
      return (this.usage = t), this;
    }
    copy(t) {
      return (
        (this.array = new t.array.constructor(t.array)),
        (this.count = t.count),
        (this.stride = t.stride),
        (this.usage = t.usage),
        this
      );
    }
    copyAt(t, e, n) {
      (t *= this.stride), (n *= e.stride);
      for (let i = 0, r = this.stride; i < r; i++)
        this.array[t + i] = e.array[n + i];
      return this;
    }
    set(t, e = 0) {
      return this.array.set(t, e), this;
    }
    clone(t) {
      void 0 === t.arrayBuffers && (t.arrayBuffers = {}),
        void 0 === this.array.buffer._uuid && (this.array.buffer._uuid = ve()),
        void 0 === t.arrayBuffers[this.array.buffer._uuid] &&
          (t.arrayBuffers[this.array.buffer._uuid] =
            this.array.slice(0).buffer);
      const e = new this.array.constructor(
          t.arrayBuffers[this.array.buffer._uuid]
        ),
        n = new this.constructor(e, this.stride);
      return n.setUsage(this.usage), n;
    }
    onUpload(t) {
      return (this.onUploadCallback = t), this;
    }
    toJSON(t) {
      return (
        void 0 === t.arrayBuffers && (t.arrayBuffers = {}),
        void 0 === this.array.buffer._uuid && (this.array.buffer._uuid = ve()),
        void 0 === t.arrayBuffers[this.array.buffer._uuid] &&
          (t.arrayBuffers[this.array.buffer._uuid] = Array.prototype.slice.call(
            new Uint32Array(this.array.buffer)
          )),
        {
          uuid: this.uuid,
          buffer: this.array.buffer._uuid,
          type: this.array.constructor.name,
          stride: this.stride,
        }
      );
    }
  }
  Ko.prototype.isInterleavedBuffer = !0;
  const $o = new ze();
  class ta {
    constructor(t, e, n, i = !1) {
      (this.name = ""),
        (this.data = t),
        (this.itemSize = e),
        (this.offset = n),
        (this.normalized = !0 === i);
    }
    get count() {
      return this.data.count;
    }
    get array() {
      return this.data.array;
    }
    set needsUpdate(t) {
      this.data.needsUpdate = t;
    }
    applyMatrix4(t) {
      for (let e = 0, n = this.data.count; e < n; e++)
        ($o.x = this.getX(e)),
          ($o.y = this.getY(e)),
          ($o.z = this.getZ(e)),
          $o.applyMatrix4(t),
          this.setXYZ(e, $o.x, $o.y, $o.z);
      return this;
    }
    applyNormalMatrix(t) {
      for (let e = 0, n = this.count; e < n; e++)
        ($o.x = this.getX(e)),
          ($o.y = this.getY(e)),
          ($o.z = this.getZ(e)),
          $o.applyNormalMatrix(t),
          this.setXYZ(e, $o.x, $o.y, $o.z);
      return this;
    }
    transformDirection(t) {
      for (let e = 0, n = this.count; e < n; e++)
        ($o.x = this.getX(e)),
          ($o.y = this.getY(e)),
          ($o.z = this.getZ(e)),
          $o.transformDirection(t),
          this.setXYZ(e, $o.x, $o.y, $o.z);
      return this;
    }
    setX(t, e) {
      return (this.data.array[t * this.data.stride + this.offset] = e), this;
    }
    setY(t, e) {
      return (
        (this.data.array[t * this.data.stride + this.offset + 1] = e), this
      );
    }
    setZ(t, e) {
      return (
        (this.data.array[t * this.data.stride + this.offset + 2] = e), this
      );
    }
    setW(t, e) {
      return (
        (this.data.array[t * this.data.stride + this.offset + 3] = e), this
      );
    }
    getX(t) {
      return this.data.array[t * this.data.stride + this.offset];
    }
    getY(t) {
      return this.data.array[t * this.data.stride + this.offset + 1];
    }
    getZ(t) {
      return this.data.array[t * this.data.stride + this.offset + 2];
    }
    getW(t) {
      return this.data.array[t * this.data.stride + this.offset + 3];
    }
    setXY(t, e, n) {
      return (
        (t = t * this.data.stride + this.offset),
        (this.data.array[t + 0] = e),
        (this.data.array[t + 1] = n),
        this
      );
    }
    setXYZ(t, e, n, i) {
      return (
        (t = t * this.data.stride + this.offset),
        (this.data.array[t + 0] = e),
        (this.data.array[t + 1] = n),
        (this.data.array[t + 2] = i),
        this
      );
    }
    setXYZW(t, e, n, i, r) {
      return (
        (t = t * this.data.stride + this.offset),
        (this.data.array[t + 0] = e),
        (this.data.array[t + 1] = n),
        (this.data.array[t + 2] = i),
        (this.data.array[t + 3] = r),
        this
      );
    }
    clone(t) {
      if (void 0 === t) {
        console.log(
          "THREE.InterleavedBufferAttribute.clone(): Cloning an interlaved buffer attribute will deinterleave buffer data."
        );
        const t = [];
        for (let e = 0; e < this.count; e++) {
          const n = e * this.data.stride + this.offset;
          for (let e = 0; e < this.itemSize; e++)
            t.push(this.data.array[n + e]);
        }
        return new li(
          new this.array.constructor(t),
          this.itemSize,
          this.normalized
        );
      }
      return (
        void 0 === t.interleavedBuffers && (t.interleavedBuffers = {}),
        void 0 === t.interleavedBuffers[this.data.uuid] &&
          (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)),
        new ta(
          t.interleavedBuffers[this.data.uuid],
          this.itemSize,
          this.offset,
          this.normalized
        )
      );
    }
    toJSON(t) {
      if (void 0 === t) {
        console.log(
          "THREE.InterleavedBufferAttribute.toJSON(): Serializing an interlaved buffer attribute will deinterleave buffer data."
        );
        const t = [];
        for (let e = 0; e < this.count; e++) {
          const n = e * this.data.stride + this.offset;
          for (let e = 0; e < this.itemSize; e++)
            t.push(this.data.array[n + e]);
        }
        return {
          itemSize: this.itemSize,
          type: this.array.constructor.name,
          array: t,
          normalized: this.normalized,
        };
      }
      return (
        void 0 === t.interleavedBuffers && (t.interleavedBuffers = {}),
        void 0 === t.interleavedBuffers[this.data.uuid] &&
          (t.interleavedBuffers[this.data.uuid] = this.data.toJSON(t)),
        {
          isInterleavedBufferAttribute: !0,
          itemSize: this.itemSize,
          data: this.data.uuid,
          offset: this.offset,
          normalized: this.normalized,
        }
      );
    }
  }
  ta.prototype.isInterleavedBufferAttribute = !0;
  class ea extends Qn {
    constructor(t) {
      super(),
        (this.type = "SpriteMaterial"),
        (this.color = new ri(16777215)),
        (this.map = null),
        (this.alphaMap = null),
        (this.rotation = 0),
        (this.sizeAttenuation = !0),
        (this.transparent = !0),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        this.color.copy(t.color),
        (this.map = t.map),
        (this.alphaMap = t.alphaMap),
        (this.rotation = t.rotation),
        (this.sizeAttenuation = t.sizeAttenuation),
        this
      );
    }
  }
  let na;
  ea.prototype.isSpriteMaterial = !0;
  const ia = new ze(),
    ra = new ze(),
    sa = new ze(),
    oa = new we(),
    aa = new we(),
    la = new pn(),
    ca = new ze(),
    ha = new ze(),
    ua = new ze(),
    da = new we(),
    pa = new we(),
    ma = new we();
  function fa(t, e, n, i, r, s) {
    oa.subVectors(t, n).addScalar(0.5).multiply(i),
      void 0 !== r
        ? ((aa.x = s * oa.x - r * oa.y), (aa.y = r * oa.x + s * oa.y))
        : aa.copy(oa),
      t.copy(e),
      (t.x += aa.x),
      (t.y += aa.y),
      t.applyMatrix4(la);
  }
  (class extends Fn {
    constructor(t) {
      if ((super(), (this.type = "Sprite"), void 0 === na)) {
        na = new _i();
        const t = new Float32Array([
            -0.5, -0.5, 0, 0, 0, 0.5, -0.5, 0, 1, 0, 0.5, 0.5, 0, 1, 1, -0.5,
            0.5, 0, 0, 1,
          ]),
          e = new Ko(t, 5);
        na.setIndex([0, 1, 2, 0, 2, 3]),
          na.setAttribute("position", new ta(e, 3, 0, !1)),
          na.setAttribute("uv", new ta(e, 2, 3, !1));
      }
      (this.geometry = na),
        (this.material = void 0 !== t ? t : new ea()),
        (this.center = new we(0.5, 0.5));
    }
    raycast(t, e) {
      null === t.camera &&
        console.error(
          'THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'
        ),
        ra.setFromMatrixScale(this.matrixWorld),
        la.copy(t.camera.matrixWorld),
        this.modelViewMatrix.multiplyMatrices(
          t.camera.matrixWorldInverse,
          this.matrixWorld
        ),
        sa.setFromMatrixPosition(this.modelViewMatrix),
        t.camera.isPerspectiveCamera &&
          !1 === this.material.sizeAttenuation &&
          ra.multiplyScalar(-sa.z);
      const n = this.material.rotation;
      let i, r;
      0 !== n && ((r = Math.cos(n)), (i = Math.sin(n)));
      const s = this.center;
      fa(ca.set(-0.5, -0.5, 0), sa, s, ra, i, r),
        fa(ha.set(0.5, -0.5, 0), sa, s, ra, i, r),
        fa(ua.set(0.5, 0.5, 0), sa, s, ra, i, r),
        da.set(0, 0),
        pa.set(1, 0),
        ma.set(1, 1);
      let o = t.ray.intersectTriangle(ca, ha, ua, !1, ia);
      if (
        null === o &&
        (fa(ha.set(-0.5, 0.5, 0), sa, s, ra, i, r),
        pa.set(0, 1),
        (o = t.ray.intersectTriangle(ca, ua, ha, !1, ia)),
        null === o)
      )
        return;
      const a = t.ray.origin.distanceTo(ia);
      a < t.near ||
        a > t.far ||
        e.push({
          distance: a,
          point: ia.clone(),
          uv: qn.getUV(ia, ca, ha, ua, da, pa, ma, new we()),
          face: null,
          object: this,
        });
    }
    copy(t) {
      return (
        super.copy(t),
        void 0 !== t.center && this.center.copy(t.center),
        (this.material = t.material),
        this
      );
    }
  }).prototype.isSprite = !0;
  const ga = new ze(),
    va = new Pe(),
    xa = new Pe(),
    _a = new ze(),
    ya = new pn();
  class ba extends Oi {
    constructor(t, e) {
      super(t, e),
        (this.type = "SkinnedMesh"),
        (this.bindMode = "attached"),
        (this.bindMatrix = new pn()),
        (this.bindMatrixInverse = new pn());
    }
    copy(t) {
      return (
        super.copy(t),
        (this.bindMode = t.bindMode),
        this.bindMatrix.copy(t.bindMatrix),
        this.bindMatrixInverse.copy(t.bindMatrixInverse),
        (this.skeleton = t.skeleton),
        this
      );
    }
    bind(t, e) {
      (this.skeleton = t),
        void 0 === e &&
          (this.updateMatrixWorld(!0),
          this.skeleton.calculateInverses(),
          (e = this.matrixWorld)),
        this.bindMatrix.copy(e),
        this.bindMatrixInverse.copy(e).invert();
    }
    pose() {
      this.skeleton.pose();
    }
    normalizeSkinWeights() {
      const t = new Pe(),
        e = this.geometry.attributes.skinWeight;
      for (let n = 0, i = e.count; n < i; n++) {
        (t.x = e.getX(n)),
          (t.y = e.getY(n)),
          (t.z = e.getZ(n)),
          (t.w = e.getW(n));
        const i = 1 / t.manhattanLength();
        i !== 1 / 0 ? t.multiplyScalar(i) : t.set(1, 0, 0, 0),
          e.setXYZW(n, t.x, t.y, t.z, t.w);
      }
    }
    updateMatrixWorld(t) {
      super.updateMatrixWorld(t),
        "attached" === this.bindMode
          ? this.bindMatrixInverse.copy(this.matrixWorld).invert()
          : "detached" === this.bindMode
          ? this.bindMatrixInverse.copy(this.bindMatrix).invert()
          : console.warn(
              "THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode
            );
    }
    boneTransform(t, e) {
      const n = this.skeleton,
        i = this.geometry;
      va.fromBufferAttribute(i.attributes.skinIndex, t),
        xa.fromBufferAttribute(i.attributes.skinWeight, t),
        ga.copy(e).applyMatrix4(this.bindMatrix),
        e.set(0, 0, 0);
      for (let t = 0; t < 4; t++) {
        const i = xa.getComponent(t);
        if (0 !== i) {
          const r = va.getComponent(t);
          ya.multiplyMatrices(n.bones[r].matrixWorld, n.boneInverses[r]),
            e.addScaledVector(_a.copy(ga).applyMatrix4(ya), i);
        }
      }
      return e.applyMatrix4(this.bindMatrixInverse);
    }
  }
  ba.prototype.isSkinnedMesh = !0;
  (class extends Fn {
    constructor() {
      super(), (this.type = "Bone");
    }
  }).prototype.isBone = !0;
  (class extends Re {
    constructor(
      t = null,
      e = 1,
      n = 1,
      i,
      r,
      s,
      o,
      a,
      l = 1003,
      c = 1003,
      h,
      u
    ) {
      super(null, s, o, a, l, c, i, r, h, u),
        (this.image = { data: t, width: e, height: n }),
        (this.magFilter = l),
        (this.minFilter = c),
        (this.generateMipmaps = !1),
        (this.flipY = !1),
        (this.unpackAlignment = 1);
    }
  }).prototype.isDataTexture = !0;
  class wa extends li {
    constructor(t, e, n, i = 1) {
      "number" == typeof n &&
        ((i = n),
        (n = !1),
        console.error(
          "THREE.InstancedBufferAttribute: The constructor now expects normalized as the third argument."
        )),
        super(t, e, n),
        (this.meshPerAttribute = i);
    }
    copy(t) {
      return super.copy(t), (this.meshPerAttribute = t.meshPerAttribute), this;
    }
    toJSON() {
      const t = super.toJSON();
      return (
        (t.meshPerAttribute = this.meshPerAttribute),
        (t.isInstancedBufferAttribute = !0),
        t
      );
    }
  }
  wa.prototype.isInstancedBufferAttribute = !0;
  const Ma = new pn(),
    Sa = new pn(),
    Ta = [],
    Ea = new Oi();
  (class extends Oi {
    constructor(t, e, n) {
      super(t, e),
        (this.instanceMatrix = new wa(new Float32Array(16 * n), 16)),
        (this.instanceColor = null),
        (this.count = n),
        (this.frustumCulled = !1);
    }
    copy(t) {
      return (
        super.copy(t),
        this.instanceMatrix.copy(t.instanceMatrix),
        null !== t.instanceColor &&
          (this.instanceColor = t.instanceColor.clone()),
        (this.count = t.count),
        this
      );
    }
    getColorAt(t, e) {
      e.fromArray(this.instanceColor.array, 3 * t);
    }
    getMatrixAt(t, e) {
      e.fromArray(this.instanceMatrix.array, 16 * t);
    }
    raycast(t, e) {
      const n = this.matrixWorld,
        i = this.count;
      if (
        ((Ea.geometry = this.geometry),
        (Ea.material = this.material),
        void 0 !== Ea.material)
      )
        for (let r = 0; r < i; r++) {
          this.getMatrixAt(r, Ma),
            Sa.multiplyMatrices(n, Ma),
            (Ea.matrixWorld = Sa),
            Ea.raycast(t, Ta);
          for (let t = 0, n = Ta.length; t < n; t++) {
            const n = Ta[t];
            (n.instanceId = r), (n.object = this), e.push(n);
          }
          Ta.length = 0;
        }
    }
    setColorAt(t, e) {
      null === this.instanceColor &&
        (this.instanceColor = new wa(
          new Float32Array(3 * this.instanceMatrix.count),
          3
        )),
        e.toArray(this.instanceColor.array, 3 * t);
    }
    setMatrixAt(t, e) {
      e.toArray(this.instanceMatrix.array, 16 * t);
    }
    updateMorphTargets() {}
    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }).prototype.isInstancedMesh = !0;
  class Aa extends Qn {
    constructor(t) {
      super(),
        (this.type = "LineBasicMaterial"),
        (this.color = new ri(16777215)),
        (this.linewidth = 1),
        (this.linecap = "round"),
        (this.linejoin = "round"),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        this.color.copy(t.color),
        (this.linewidth = t.linewidth),
        (this.linecap = t.linecap),
        (this.linejoin = t.linejoin),
        this
      );
    }
  }
  Aa.prototype.isLineBasicMaterial = !0;
  const La = new ze(),
    Ra = new ze(),
    Ca = new pn(),
    Pa = new dn(),
    Da = new rn();
  class Ia extends Fn {
    constructor(t = new _i(), e = new Aa()) {
      super(),
        (this.type = "Line"),
        (this.geometry = t),
        (this.material = e),
        this.updateMorphTargets();
    }
    copy(t) {
      return (
        super.copy(t),
        (this.material = t.material),
        (this.geometry = t.geometry),
        this
      );
    }
    computeLineDistances() {
      const t = this.geometry;
      if (t.isBufferGeometry)
        if (null === t.index) {
          const e = t.attributes.position,
            n = [0];
          for (let t = 1, i = e.count; t < i; t++)
            La.fromBufferAttribute(e, t - 1),
              Ra.fromBufferAttribute(e, t),
              (n[t] = n[t - 1]),
              (n[t] += La.distanceTo(Ra));
          t.setAttribute("lineDistance", new ui(n, 1));
        } else
          console.warn(
            "THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry."
          );
      else
        t.isGeometry &&
          console.error(
            "THREE.Line.computeLineDistances() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead."
          );
      return this;
    }
    raycast(t, e) {
      const n = this.geometry,
        i = this.matrixWorld,
        r = t.params.Line.threshold,
        s = n.drawRange;
      if (
        (null === n.boundingSphere && n.computeBoundingSphere(),
        Da.copy(n.boundingSphere),
        Da.applyMatrix4(i),
        (Da.radius += r),
        !1 === t.ray.intersectsSphere(Da))
      )
        return;
      Ca.copy(i).invert(), Pa.copy(t.ray).applyMatrix4(Ca);
      const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
        a = o * o,
        l = new ze(),
        c = new ze(),
        h = new ze(),
        u = new ze(),
        d = this.isLineSegments ? 2 : 1;
      if (n.isBufferGeometry) {
        const i = n.index,
          r = n.attributes.position;
        if (null !== i) {
          for (
            let n = Math.max(0, s.start),
              o = Math.min(i.count, s.start + s.count) - 1;
            n < o;
            n += d
          ) {
            const s = i.getX(n),
              o = i.getX(n + 1);
            l.fromBufferAttribute(r, s), c.fromBufferAttribute(r, o);
            if (Pa.distanceSqToSegment(l, c, u, h) > a) continue;
            u.applyMatrix4(this.matrixWorld);
            const d = t.ray.origin.distanceTo(u);
            d < t.near ||
              d > t.far ||
              e.push({
                distance: d,
                point: h.clone().applyMatrix4(this.matrixWorld),
                index: n,
                face: null,
                faceIndex: null,
                object: this,
              });
          }
        } else {
          for (
            let n = Math.max(0, s.start),
              i = Math.min(r.count, s.start + s.count) - 1;
            n < i;
            n += d
          ) {
            l.fromBufferAttribute(r, n), c.fromBufferAttribute(r, n + 1);
            if (Pa.distanceSqToSegment(l, c, u, h) > a) continue;
            u.applyMatrix4(this.matrixWorld);
            const i = t.ray.origin.distanceTo(u);
            i < t.near ||
              i > t.far ||
              e.push({
                distance: i,
                point: h.clone().applyMatrix4(this.matrixWorld),
                index: n,
                face: null,
                faceIndex: null,
                object: this,
              });
          }
        }
      } else n.isGeometry && console.error("THREE.Line.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.");
    }
    updateMorphTargets() {
      const t = this.geometry;
      if (t.isBufferGeometry) {
        const e = t.morphAttributes,
          n = Object.keys(e);
        if (n.length > 0) {
          const t = e[n[0]];
          if (void 0 !== t) {
            (this.morphTargetInfluences = []),
              (this.morphTargetDictionary = {});
            for (let e = 0, n = t.length; e < n; e++) {
              const n = t[e].name || String(e);
              this.morphTargetInfluences.push(0),
                (this.morphTargetDictionary[n] = e);
            }
          }
        }
      } else {
        const e = t.morphTargets;
        void 0 !== e &&
          e.length > 0 &&
          console.error(
            "THREE.Line.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead."
          );
      }
    }
  }
  Ia.prototype.isLine = !0;
  const Na = new ze(),
    za = new ze();
  class ka extends Ia {
    constructor(t, e) {
      super(t, e), (this.type = "LineSegments");
    }
    computeLineDistances() {
      const t = this.geometry;
      if (t.isBufferGeometry)
        if (null === t.index) {
          const e = t.attributes.position,
            n = [];
          for (let t = 0, i = e.count; t < i; t += 2)
            Na.fromBufferAttribute(e, t),
              za.fromBufferAttribute(e, t + 1),
              (n[t] = 0 === t ? 0 : n[t - 1]),
              (n[t + 1] = n[t] + Na.distanceTo(za));
          t.setAttribute("lineDistance", new ui(n, 1));
        } else
          console.warn(
            "THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry."
          );
      else
        t.isGeometry &&
          console.error(
            "THREE.LineSegments.computeLineDistances() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead."
          );
      return this;
    }
  }
  ka.prototype.isLineSegments = !0;
  (class extends Ia {
    constructor(t, e) {
      super(t, e), (this.type = "LineLoop");
    }
  }).prototype.isLineLoop = !0;
  class Oa extends Qn {
    constructor(t) {
      super(),
        (this.type = "PointsMaterial"),
        (this.color = new ri(16777215)),
        (this.map = null),
        (this.alphaMap = null),
        (this.size = 1),
        (this.sizeAttenuation = !0),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        this.color.copy(t.color),
        (this.map = t.map),
        (this.alphaMap = t.alphaMap),
        (this.size = t.size),
        (this.sizeAttenuation = t.sizeAttenuation),
        this
      );
    }
  }
  Oa.prototype.isPointsMaterial = !0;
  const Fa = new pn(),
    Ua = new dn(),
    Ba = new rn(),
    Ha = new ze();
  function Ga(t, e, n, i, r, s, o) {
    const a = Ua.distanceSqToPoint(t);
    if (a < n) {
      const n = new ze();
      Ua.closestPointToPoint(t, n), n.applyMatrix4(i);
      const l = r.ray.origin.distanceTo(n);
      if (l < r.near || l > r.far) return;
      s.push({
        distance: l,
        distanceToRay: Math.sqrt(a),
        point: n,
        index: e,
        face: null,
        object: o,
      });
    }
  }
  (class extends Fn {
    constructor(t = new _i(), e = new Oa()) {
      super(),
        (this.type = "Points"),
        (this.geometry = t),
        (this.material = e),
        this.updateMorphTargets();
    }
    copy(t) {
      return (
        super.copy(t),
        (this.material = t.material),
        (this.geometry = t.geometry),
        this
      );
    }
    raycast(t, e) {
      const n = this.geometry,
        i = this.matrixWorld,
        r = t.params.Points.threshold,
        s = n.drawRange;
      if (
        (null === n.boundingSphere && n.computeBoundingSphere(),
        Ba.copy(n.boundingSphere),
        Ba.applyMatrix4(i),
        (Ba.radius += r),
        !1 === t.ray.intersectsSphere(Ba))
      )
        return;
      Fa.copy(i).invert(), Ua.copy(t.ray).applyMatrix4(Fa);
      const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
        a = o * o;
      if (n.isBufferGeometry) {
        const r = n.index,
          o = n.attributes.position;
        if (null !== r) {
          for (
            let n = Math.max(0, s.start),
              l = Math.min(r.count, s.start + s.count);
            n < l;
            n++
          ) {
            const s = r.getX(n);
            Ha.fromBufferAttribute(o, s), Ga(Ha, s, a, i, t, e, this);
          }
        } else {
          for (
            let n = Math.max(0, s.start),
              r = Math.min(o.count, s.start + s.count);
            n < r;
            n++
          )
            Ha.fromBufferAttribute(o, n), Ga(Ha, n, a, i, t, e, this);
        }
      } else
        console.error(
          "THREE.Points.raycast() no longer supports THREE.Geometry. Use THREE.BufferGeometry instead."
        );
    }
    updateMorphTargets() {
      const t = this.geometry;
      if (t.isBufferGeometry) {
        const e = t.morphAttributes,
          n = Object.keys(e);
        if (n.length > 0) {
          const t = e[n[0]];
          if (void 0 !== t) {
            (this.morphTargetInfluences = []),
              (this.morphTargetDictionary = {});
            for (let e = 0, n = t.length; e < n; e++) {
              const n = t[e].name || String(e);
              this.morphTargetInfluences.push(0),
                (this.morphTargetDictionary[n] = e);
            }
          }
        }
      } else {
        const e = t.morphTargets;
        void 0 !== e &&
          e.length > 0 &&
          console.error(
            "THREE.Points.updateMorphTargets() does not support THREE.Geometry. Use THREE.BufferGeometry instead."
          );
      }
    }
  }).prototype.isPoints = !0;
  (class extends Re {
    constructor(t, e, n, i, r, s, o, a, l) {
      super(t, e, n, i, r, s, o, a, l),
        (this.format = void 0 !== o ? o : Jt),
        (this.minFilter = void 0 !== s ? s : Ht),
        (this.magFilter = void 0 !== r ? r : Ht),
        (this.generateMipmaps = !1);
      const c = this;
      "requestVideoFrameCallback" in t &&
        t.requestVideoFrameCallback(function e() {
          (c.needsUpdate = !0), t.requestVideoFrameCallback(e);
        });
    }
    clone() {
      return new this.constructor(this.image).copy(this);
    }
    update() {
      const t = this.image;
      !1 === "requestVideoFrameCallback" in t &&
        t.readyState >= t.HAVE_CURRENT_DATA &&
        (this.needsUpdate = !0);
    }
  }).prototype.isVideoTexture = !0;
  (class extends Re {
    constructor(t, e, n) {
      super({ width: t, height: e }),
        (this.format = n),
        (this.magFilter = Ft),
        (this.minFilter = Ft),
        (this.generateMipmaps = !1),
        (this.needsUpdate = !0);
    }
  }).prototype.isFramebufferTexture = !0;
  (class extends Re {
    constructor(t, e, n, i, r, s, o, a, l, c, h, u) {
      super(null, s, o, a, l, c, i, r, h, u),
        (this.image = { width: e, height: n }),
        (this.mipmaps = t),
        (this.flipY = !1),
        (this.generateMipmaps = !1);
    }
  }).prototype.isCompressedTexture = !0;
  (class extends Re {
    constructor(t, e, n, i, r, s, o, a, l) {
      super(t, e, n, i, r, s, o, a, l), (this.needsUpdate = !0);
    }
  }).prototype.isCanvasTexture = !0;
  class Va {
    constructor() {
      (this.type = "Curve"), (this.arcLengthDivisions = 200);
    }
    getPoint() {
      return console.warn("THREE.Curve: .getPoint() not implemented."), null;
    }
    getPointAt(t, e) {
      const n = this.getUtoTmapping(t);
      return this.getPoint(n, e);
    }
    getPoints(t = 5) {
      const e = [];
      for (let n = 0; n <= t; n++) e.push(this.getPoint(n / t));
      return e;
    }
    getSpacedPoints(t = 5) {
      const e = [];
      for (let n = 0; n <= t; n++) e.push(this.getPointAt(n / t));
      return e;
    }
    getLength() {
      const t = this.getLengths();
      return t[t.length - 1];
    }
    getLengths(t = this.arcLengthDivisions) {
      if (
        this.cacheArcLengths &&
        this.cacheArcLengths.length === t + 1 &&
        !this.needsUpdate
      )
        return this.cacheArcLengths;
      this.needsUpdate = !1;
      const e = [];
      let n,
        i = this.getPoint(0),
        r = 0;
      e.push(0);
      for (let s = 1; s <= t; s++)
        (n = this.getPoint(s / t)), (r += n.distanceTo(i)), e.push(r), (i = n);
      return (this.cacheArcLengths = e), e;
    }
    updateArcLengths() {
      (this.needsUpdate = !0), this.getLengths();
    }
    getUtoTmapping(t, e) {
      const n = this.getLengths();
      let i = 0;
      const r = n.length;
      let s;
      s = e || t * n[r - 1];
      let o,
        a = 0,
        l = r - 1;
      for (; a <= l; )
        if (((i = Math.floor(a + (l - a) / 2)), (o = n[i] - s), o < 0))
          a = i + 1;
        else {
          if (!(o > 0)) {
            l = i;
            break;
          }
          l = i - 1;
        }
      if (((i = l), n[i] === s)) return i / (r - 1);
      const c = n[i];
      return (i + (s - c) / (n[i + 1] - c)) / (r - 1);
    }
    getTangent(t, e) {
      const n = 1e-4;
      let i = t - n,
        r = t + n;
      i < 0 && (i = 0), r > 1 && (r = 1);
      const s = this.getPoint(i),
        o = this.getPoint(r),
        a = e || (s.isVector2 ? new we() : new ze());
      return a.copy(o).sub(s).normalize(), a;
    }
    getTangentAt(t, e) {
      const n = this.getUtoTmapping(t);
      return this.getTangent(n, e);
    }
    computeFrenetFrames(t, e) {
      const n = new ze(),
        i = [],
        r = [],
        s = [],
        o = new ze(),
        a = new pn();
      for (let e = 0; e <= t; e++) {
        const n = e / t;
        i[e] = this.getTangentAt(n, new ze());
      }
      (r[0] = new ze()), (s[0] = new ze());
      let l = Number.MAX_VALUE;
      const c = Math.abs(i[0].x),
        h = Math.abs(i[0].y),
        u = Math.abs(i[0].z);
      c <= l && ((l = c), n.set(1, 0, 0)),
        h <= l && ((l = h), n.set(0, 1, 0)),
        u <= l && n.set(0, 0, 1),
        o.crossVectors(i[0], n).normalize(),
        r[0].crossVectors(i[0], o),
        s[0].crossVectors(i[0], r[0]);
      for (let e = 1; e <= t; e++) {
        if (
          ((r[e] = r[e - 1].clone()),
          (s[e] = s[e - 1].clone()),
          o.crossVectors(i[e - 1], i[e]),
          o.length() > Number.EPSILON)
        ) {
          o.normalize();
          const t = Math.acos(xe(i[e - 1].dot(i[e]), -1, 1));
          r[e].applyMatrix4(a.makeRotationAxis(o, t));
        }
        s[e].crossVectors(i[e], r[e]);
      }
      if (!0 === e) {
        let e = Math.acos(xe(r[0].dot(r[t]), -1, 1));
        (e /= t), i[0].dot(o.crossVectors(r[0], r[t])) > 0 && (e = -e);
        for (let n = 1; n <= t; n++)
          r[n].applyMatrix4(a.makeRotationAxis(i[n], e * n)),
            s[n].crossVectors(i[n], r[n]);
      }
      return { tangents: i, normals: r, binormals: s };
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      return (this.arcLengthDivisions = t.arcLengthDivisions), this;
    }
    toJSON() {
      const t = {
        metadata: { version: 4.5, type: "Curve", generator: "Curve.toJSON" },
      };
      return (
        (t.arcLengthDivisions = this.arcLengthDivisions),
        (t.type = this.type),
        t
      );
    }
    fromJSON(t) {
      return (this.arcLengthDivisions = t.arcLengthDivisions), this;
    }
  }
  class Wa extends Va {
    constructor(
      t = 0,
      e = 0,
      n = 1,
      i = 1,
      r = 0,
      s = 2 * Math.PI,
      o = !1,
      a = 0
    ) {
      super(),
        (this.type = "EllipseCurve"),
        (this.aX = t),
        (this.aY = e),
        (this.xRadius = n),
        (this.yRadius = i),
        (this.aStartAngle = r),
        (this.aEndAngle = s),
        (this.aClockwise = o),
        (this.aRotation = a);
    }
    getPoint(t, e) {
      const n = e || new we(),
        i = 2 * Math.PI;
      let r = this.aEndAngle - this.aStartAngle;
      const s = Math.abs(r) < Number.EPSILON;
      for (; r < 0; ) r += i;
      for (; r > i; ) r -= i;
      r < Number.EPSILON && (r = s ? 0 : i),
        !0 !== this.aClockwise || s || (r === i ? (r = -i) : (r -= i));
      const o = this.aStartAngle + t * r;
      let a = this.aX + this.xRadius * Math.cos(o),
        l = this.aY + this.yRadius * Math.sin(o);
      if (0 !== this.aRotation) {
        const t = Math.cos(this.aRotation),
          e = Math.sin(this.aRotation),
          n = a - this.aX,
          i = l - this.aY;
        (a = n * t - i * e + this.aX), (l = n * e + i * t + this.aY);
      }
      return n.set(a, l);
    }
    copy(t) {
      return (
        super.copy(t),
        (this.aX = t.aX),
        (this.aY = t.aY),
        (this.xRadius = t.xRadius),
        (this.yRadius = t.yRadius),
        (this.aStartAngle = t.aStartAngle),
        (this.aEndAngle = t.aEndAngle),
        (this.aClockwise = t.aClockwise),
        (this.aRotation = t.aRotation),
        this
      );
    }
    toJSON() {
      const t = super.toJSON();
      return (
        (t.aX = this.aX),
        (t.aY = this.aY),
        (t.xRadius = this.xRadius),
        (t.yRadius = this.yRadius),
        (t.aStartAngle = this.aStartAngle),
        (t.aEndAngle = this.aEndAngle),
        (t.aClockwise = this.aClockwise),
        (t.aRotation = this.aRotation),
        t
      );
    }
    fromJSON(t) {
      return (
        super.fromJSON(t),
        (this.aX = t.aX),
        (this.aY = t.aY),
        (this.xRadius = t.xRadius),
        (this.yRadius = t.yRadius),
        (this.aStartAngle = t.aStartAngle),
        (this.aEndAngle = t.aEndAngle),
        (this.aClockwise = t.aClockwise),
        (this.aRotation = t.aRotation),
        this
      );
    }
  }
  Wa.prototype.isEllipseCurve = !0;
  class ja extends Wa {
    constructor(t, e, n, i, r, s) {
      super(t, e, n, n, i, r, s), (this.type = "ArcCurve");
    }
  }
  function Za() {
    let t = 0,
      e = 0,
      n = 0,
      i = 0;
    function r(r, s, o, a) {
      (t = r),
        (e = o),
        (n = -3 * r + 3 * s - 2 * o - a),
        (i = 2 * r - 2 * s + o + a);
    }
    return {
      initCatmullRom: function (t, e, n, i, s) {
        r(e, n, s * (n - t), s * (i - e));
      },
      initNonuniformCatmullRom: function (t, e, n, i, s, o, a) {
        let l = (e - t) / s - (n - t) / (s + o) + (n - e) / o,
          c = (n - e) / o - (i - e) / (o + a) + (i - n) / a;
        (l *= o), (c *= o), r(e, n, l, c);
      },
      calc: function (r) {
        const s = r * r;
        return t + e * r + n * s + i * (s * r);
      },
    };
  }
  ja.prototype.isArcCurve = !0;
  const Ya = new ze(),
    Xa = new Za(),
    qa = new Za(),
    Ja = new Za();
  class Qa extends Va {
    constructor(t = [], e = !1, n = "centripetal", i = 0.5) {
      super(),
        (this.type = "CatmullRomCurve3"),
        (this.points = t),
        (this.closed = e),
        (this.curveType = n),
        (this.tension = i);
    }
    getPoint(t, e = new ze()) {
      const n = e,
        i = this.points,
        r = i.length,
        s = (r - (this.closed ? 0 : 1)) * t;
      let o,
        a,
        l = Math.floor(s),
        c = s - l;
      this.closed
        ? (l += l > 0 ? 0 : (Math.floor(Math.abs(l) / r) + 1) * r)
        : 0 === c && l === r - 1 && ((l = r - 2), (c = 1)),
        this.closed || l > 0
          ? (o = i[(l - 1) % r])
          : (Ya.subVectors(i[0], i[1]).add(i[0]), (o = Ya));
      const h = i[l % r],
        u = i[(l + 1) % r];
      if (
        (this.closed || l + 2 < r
          ? (a = i[(l + 2) % r])
          : (Ya.subVectors(i[r - 1], i[r - 2]).add(i[r - 1]), (a = Ya)),
        "centripetal" === this.curveType || "chordal" === this.curveType)
      ) {
        const t = "chordal" === this.curveType ? 0.5 : 0.25;
        let e = Math.pow(o.distanceToSquared(h), t),
          n = Math.pow(h.distanceToSquared(u), t),
          i = Math.pow(u.distanceToSquared(a), t);
        n < 1e-4 && (n = 1),
          e < 1e-4 && (e = n),
          i < 1e-4 && (i = n),
          Xa.initNonuniformCatmullRom(o.x, h.x, u.x, a.x, e, n, i),
          qa.initNonuniformCatmullRom(o.y, h.y, u.y, a.y, e, n, i),
          Ja.initNonuniformCatmullRom(o.z, h.z, u.z, a.z, e, n, i);
      } else "catmullrom" === this.curveType && (Xa.initCatmullRom(o.x, h.x, u.x, a.x, this.tension), qa.initCatmullRom(o.y, h.y, u.y, a.y, this.tension), Ja.initCatmullRom(o.z, h.z, u.z, a.z, this.tension));
      return n.set(Xa.calc(c), qa.calc(c), Ja.calc(c)), n;
    }
    copy(t) {
      super.copy(t), (this.points = []);
      for (let e = 0, n = t.points.length; e < n; e++) {
        const n = t.points[e];
        this.points.push(n.clone());
      }
      return (
        (this.closed = t.closed),
        (this.curveType = t.curveType),
        (this.tension = t.tension),
        this
      );
    }
    toJSON() {
      const t = super.toJSON();
      t.points = [];
      for (let e = 0, n = this.points.length; e < n; e++) {
        const n = this.points[e];
        t.points.push(n.toArray());
      }
      return (
        (t.closed = this.closed),
        (t.curveType = this.curveType),
        (t.tension = this.tension),
        t
      );
    }
    fromJSON(t) {
      super.fromJSON(t), (this.points = []);
      for (let e = 0, n = t.points.length; e < n; e++) {
        const n = t.points[e];
        this.points.push(new ze().fromArray(n));
      }
      return (
        (this.closed = t.closed),
        (this.curveType = t.curveType),
        (this.tension = t.tension),
        this
      );
    }
  }
  function Ka(t, e, n, i, r) {
    const s = 0.5 * (i - e),
      o = 0.5 * (r - n),
      a = t * t;
    return (
      (2 * n - 2 * i + s + o) * (t * a) +
      (-3 * n + 3 * i - 2 * s - o) * a +
      s * t +
      n
    );
  }
  function $a(t, e, n, i) {
    return (
      (function (t, e) {
        const n = 1 - t;
        return n * n * e;
      })(t, e) +
      (function (t, e) {
        return 2 * (1 - t) * t * e;
      })(t, n) +
      (function (t, e) {
        return t * t * e;
      })(t, i)
    );
  }
  function tl(t, e, n, i, r) {
    return (
      (function (t, e) {
        const n = 1 - t;
        return n * n * n * e;
      })(t, e) +
      (function (t, e) {
        const n = 1 - t;
        return 3 * n * n * t * e;
      })(t, n) +
      (function (t, e) {
        return 3 * (1 - t) * t * t * e;
      })(t, i) +
      (function (t, e) {
        return t * t * t * e;
      })(t, r)
    );
  }
  Qa.prototype.isCatmullRomCurve3 = !0;
  class el extends Va {
    constructor(t = new we(), e = new we(), n = new we(), i = new we()) {
      super(),
        (this.type = "CubicBezierCurve"),
        (this.v0 = t),
        (this.v1 = e),
        (this.v2 = n),
        (this.v3 = i);
    }
    getPoint(t, e = new we()) {
      const n = e,
        i = this.v0,
        r = this.v1,
        s = this.v2,
        o = this.v3;
      return n.set(tl(t, i.x, r.x, s.x, o.x), tl(t, i.y, r.y, s.y, o.y)), n;
    }
    copy(t) {
      return (
        super.copy(t),
        this.v0.copy(t.v0),
        this.v1.copy(t.v1),
        this.v2.copy(t.v2),
        this.v3.copy(t.v3),
        this
      );
    }
    toJSON() {
      const t = super.toJSON();
      return (
        (t.v0 = this.v0.toArray()),
        (t.v1 = this.v1.toArray()),
        (t.v2 = this.v2.toArray()),
        (t.v3 = this.v3.toArray()),
        t
      );
    }
    fromJSON(t) {
      return (
        super.fromJSON(t),
        this.v0.fromArray(t.v0),
        this.v1.fromArray(t.v1),
        this.v2.fromArray(t.v2),
        this.v3.fromArray(t.v3),
        this
      );
    }
  }
  el.prototype.isCubicBezierCurve = !0;
  class nl extends Va {
    constructor(t = new ze(), e = new ze(), n = new ze(), i = new ze()) {
      super(),
        (this.type = "CubicBezierCurve3"),
        (this.v0 = t),
        (this.v1 = e),
        (this.v2 = n),
        (this.v3 = i);
    }
    getPoint(t, e = new ze()) {
      const n = e,
        i = this.v0,
        r = this.v1,
        s = this.v2,
        o = this.v3;
      return (
        n.set(
          tl(t, i.x, r.x, s.x, o.x),
          tl(t, i.y, r.y, s.y, o.y),
          tl(t, i.z, r.z, s.z, o.z)
        ),
        n
      );
    }
    copy(t) {
      return (
        super.copy(t),
        this.v0.copy(t.v0),
        this.v1.copy(t.v1),
        this.v2.copy(t.v2),
        this.v3.copy(t.v3),
        this
      );
    }
    toJSON() {
      const t = super.toJSON();
      return (
        (t.v0 = this.v0.toArray()),
        (t.v1 = this.v1.toArray()),
        (t.v2 = this.v2.toArray()),
        (t.v3 = this.v3.toArray()),
        t
      );
    }
    fromJSON(t) {
      return (
        super.fromJSON(t),
        this.v0.fromArray(t.v0),
        this.v1.fromArray(t.v1),
        this.v2.fromArray(t.v2),
        this.v3.fromArray(t.v3),
        this
      );
    }
  }
  nl.prototype.isCubicBezierCurve3 = !0;
  class il extends Va {
    constructor(t = new we(), e = new we()) {
      super(), (this.type = "LineCurve"), (this.v1 = t), (this.v2 = e);
    }
    getPoint(t, e = new we()) {
      const n = e;
      return (
        1 === t
          ? n.copy(this.v2)
          : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(t).add(this.v1)),
        n
      );
    }
    getPointAt(t, e) {
      return this.getPoint(t, e);
    }
    getTangent(t, e) {
      const n = e || new we();
      return n.copy(this.v2).sub(this.v1).normalize(), n;
    }
    copy(t) {
      return super.copy(t), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
    }
    toJSON() {
      const t = super.toJSON();
      return (t.v1 = this.v1.toArray()), (t.v2 = this.v2.toArray()), t;
    }
    fromJSON(t) {
      return (
        super.fromJSON(t),
        this.v1.fromArray(t.v1),
        this.v2.fromArray(t.v2),
        this
      );
    }
  }
  il.prototype.isLineCurve = !0;
  class rl extends Va {
    constructor(t = new we(), e = new we(), n = new we()) {
      super(),
        (this.type = "QuadraticBezierCurve"),
        (this.v0 = t),
        (this.v1 = e),
        (this.v2 = n);
    }
    getPoint(t, e = new we()) {
      const n = e,
        i = this.v0,
        r = this.v1,
        s = this.v2;
      return n.set($a(t, i.x, r.x, s.x), $a(t, i.y, r.y, s.y)), n;
    }
    copy(t) {
      return (
        super.copy(t),
        this.v0.copy(t.v0),
        this.v1.copy(t.v1),
        this.v2.copy(t.v2),
        this
      );
    }
    toJSON() {
      const t = super.toJSON();
      return (
        (t.v0 = this.v0.toArray()),
        (t.v1 = this.v1.toArray()),
        (t.v2 = this.v2.toArray()),
        t
      );
    }
    fromJSON(t) {
      return (
        super.fromJSON(t),
        this.v0.fromArray(t.v0),
        this.v1.fromArray(t.v1),
        this.v2.fromArray(t.v2),
        this
      );
    }
  }
  rl.prototype.isQuadraticBezierCurve = !0;
  class sl extends Va {
    constructor(t = new ze(), e = new ze(), n = new ze()) {
      super(),
        (this.type = "QuadraticBezierCurve3"),
        (this.v0 = t),
        (this.v1 = e),
        (this.v2 = n);
    }
    getPoint(t, e = new ze()) {
      const n = e,
        i = this.v0,
        r = this.v1,
        s = this.v2;
      return (
        n.set($a(t, i.x, r.x, s.x), $a(t, i.y, r.y, s.y), $a(t, i.z, r.z, s.z)),
        n
      );
    }
    copy(t) {
      return (
        super.copy(t),
        this.v0.copy(t.v0),
        this.v1.copy(t.v1),
        this.v2.copy(t.v2),
        this
      );
    }
    toJSON() {
      const t = super.toJSON();
      return (
        (t.v0 = this.v0.toArray()),
        (t.v1 = this.v1.toArray()),
        (t.v2 = this.v2.toArray()),
        t
      );
    }
    fromJSON(t) {
      return (
        super.fromJSON(t),
        this.v0.fromArray(t.v0),
        this.v1.fromArray(t.v1),
        this.v2.fromArray(t.v2),
        this
      );
    }
  }
  sl.prototype.isQuadraticBezierCurve3 = !0;
  class ol extends Va {
    constructor(t = []) {
      super(), (this.type = "SplineCurve"), (this.points = t);
    }
    getPoint(t, e = new we()) {
      const n = e,
        i = this.points,
        r = (i.length - 1) * t,
        s = Math.floor(r),
        o = r - s,
        a = i[0 === s ? s : s - 1],
        l = i[s],
        c = i[s > i.length - 2 ? i.length - 1 : s + 1],
        h = i[s > i.length - 3 ? i.length - 1 : s + 2];
      return n.set(Ka(o, a.x, l.x, c.x, h.x), Ka(o, a.y, l.y, c.y, h.y)), n;
    }
    copy(t) {
      super.copy(t), (this.points = []);
      for (let e = 0, n = t.points.length; e < n; e++) {
        const n = t.points[e];
        this.points.push(n.clone());
      }
      return this;
    }
    toJSON() {
      const t = super.toJSON();
      t.points = [];
      for (let e = 0, n = this.points.length; e < n; e++) {
        const n = this.points[e];
        t.points.push(n.toArray());
      }
      return t;
    }
    fromJSON(t) {
      super.fromJSON(t), (this.points = []);
      for (let e = 0, n = t.points.length; e < n; e++) {
        const n = t.points[e];
        this.points.push(new we().fromArray(n));
      }
      return this;
    }
  }
  ol.prototype.isSplineCurve = !0;
  var al = Object.freeze({
    __proto__: null,
    ArcCurve: ja,
    CatmullRomCurve3: Qa,
    CubicBezierCurve: el,
    CubicBezierCurve3: nl,
    EllipseCurve: Wa,
    LineCurve: il,
    LineCurve3: class extends Va {
      constructor(t = new ze(), e = new ze()) {
        super(),
          (this.type = "LineCurve3"),
          (this.isLineCurve3 = !0),
          (this.v1 = t),
          (this.v2 = e);
      }
      getPoint(t, e = new ze()) {
        const n = e;
        return (
          1 === t
            ? n.copy(this.v2)
            : (n.copy(this.v2).sub(this.v1), n.multiplyScalar(t).add(this.v1)),
          n
        );
      }
      getPointAt(t, e) {
        return this.getPoint(t, e);
      }
      copy(t) {
        return super.copy(t), this.v1.copy(t.v1), this.v2.copy(t.v2), this;
      }
      toJSON() {
        const t = super.toJSON();
        return (t.v1 = this.v1.toArray()), (t.v2 = this.v2.toArray()), t;
      }
      fromJSON(t) {
        return (
          super.fromJSON(t),
          this.v1.fromArray(t.v1),
          this.v2.fromArray(t.v2),
          this
        );
      }
    },
    QuadraticBezierCurve: rl,
    QuadraticBezierCurve3: sl,
    SplineCurve: ol,
  });
  class ll extends Va {
    constructor() {
      super(),
        (this.type = "CurvePath"),
        (this.curves = []),
        (this.autoClose = !1);
    }
    add(t) {
      this.curves.push(t);
    }
    closePath() {
      const t = this.curves[0].getPoint(0),
        e = this.curves[this.curves.length - 1].getPoint(1);
      t.equals(e) || this.curves.push(new il(e, t));
    }
    getPoint(t, e) {
      const n = t * this.getLength(),
        i = this.getCurveLengths();
      let r = 0;
      for (; r < i.length; ) {
        if (i[r] >= n) {
          const t = i[r] - n,
            s = this.curves[r],
            o = s.getLength(),
            a = 0 === o ? 0 : 1 - t / o;
          return s.getPointAt(a, e);
        }
        r++;
      }
      return null;
    }
    getLength() {
      const t = this.getCurveLengths();
      return t[t.length - 1];
    }
    updateArcLengths() {
      (this.needsUpdate = !0),
        (this.cacheLengths = null),
        this.getCurveLengths();
    }
    getCurveLengths() {
      if (this.cacheLengths && this.cacheLengths.length === this.curves.length)
        return this.cacheLengths;
      const t = [];
      let e = 0;
      for (let n = 0, i = this.curves.length; n < i; n++)
        (e += this.curves[n].getLength()), t.push(e);
      return (this.cacheLengths = t), t;
    }
    getSpacedPoints(t = 40) {
      const e = [];
      for (let n = 0; n <= t; n++) e.push(this.getPoint(n / t));
      return this.autoClose && e.push(e[0]), e;
    }
    getPoints(t = 12) {
      const e = [];
      let n;
      for (let i = 0, r = this.curves; i < r.length; i++) {
        const s = r[i],
          o =
            s && s.isEllipseCurve
              ? 2 * t
              : s && (s.isLineCurve || s.isLineCurve3)
              ? 1
              : s && s.isSplineCurve
              ? t * s.points.length
              : t,
          a = s.getPoints(o);
        for (let t = 0; t < a.length; t++) {
          const i = a[t];
          (n && n.equals(i)) || (e.push(i), (n = i));
        }
      }
      return (
        this.autoClose &&
          e.length > 1 &&
          !e[e.length - 1].equals(e[0]) &&
          e.push(e[0]),
        e
      );
    }
    copy(t) {
      super.copy(t), (this.curves = []);
      for (let e = 0, n = t.curves.length; e < n; e++) {
        const n = t.curves[e];
        this.curves.push(n.clone());
      }
      return (this.autoClose = t.autoClose), this;
    }
    toJSON() {
      const t = super.toJSON();
      (t.autoClose = this.autoClose), (t.curves = []);
      for (let e = 0, n = this.curves.length; e < n; e++) {
        const n = this.curves[e];
        t.curves.push(n.toJSON());
      }
      return t;
    }
    fromJSON(t) {
      super.fromJSON(t), (this.autoClose = t.autoClose), (this.curves = []);
      for (let e = 0, n = t.curves.length; e < n; e++) {
        const n = t.curves[e];
        this.curves.push(new al[n.type]().fromJSON(n));
      }
      return this;
    }
  }
  class cl extends ll {
    constructor(t) {
      super(),
        (this.type = "Path"),
        (this.currentPoint = new we()),
        t && this.setFromPoints(t);
    }
    setFromPoints(t) {
      this.moveTo(t[0].x, t[0].y);
      for (let e = 1, n = t.length; e < n; e++) this.lineTo(t[e].x, t[e].y);
      return this;
    }
    moveTo(t, e) {
      return this.currentPoint.set(t, e), this;
    }
    lineTo(t, e) {
      const n = new il(this.currentPoint.clone(), new we(t, e));
      return this.curves.push(n), this.currentPoint.set(t, e), this;
    }
    quadraticCurveTo(t, e, n, i) {
      const r = new rl(this.currentPoint.clone(), new we(t, e), new we(n, i));
      return this.curves.push(r), this.currentPoint.set(n, i), this;
    }
    bezierCurveTo(t, e, n, i, r, s) {
      const o = new el(
        this.currentPoint.clone(),
        new we(t, e),
        new we(n, i),
        new we(r, s)
      );
      return this.curves.push(o), this.currentPoint.set(r, s), this;
    }
    splineThru(t) {
      const e = [this.currentPoint.clone()].concat(t),
        n = new ol(e);
      return this.curves.push(n), this.currentPoint.copy(t[t.length - 1]), this;
    }
    arc(t, e, n, i, r, s) {
      const o = this.currentPoint.x,
        a = this.currentPoint.y;
      return this.absarc(t + o, e + a, n, i, r, s), this;
    }
    absarc(t, e, n, i, r, s) {
      return this.absellipse(t, e, n, n, i, r, s), this;
    }
    ellipse(t, e, n, i, r, s, o, a) {
      const l = this.currentPoint.x,
        c = this.currentPoint.y;
      return this.absellipse(t + l, e + c, n, i, r, s, o, a), this;
    }
    absellipse(t, e, n, i, r, s, o, a) {
      const l = new Wa(t, e, n, i, r, s, o, a);
      if (this.curves.length > 0) {
        const t = l.getPoint(0);
        t.equals(this.currentPoint) || this.lineTo(t.x, t.y);
      }
      this.curves.push(l);
      const c = l.getPoint(1);
      return this.currentPoint.copy(c), this;
    }
    copy(t) {
      return super.copy(t), this.currentPoint.copy(t.currentPoint), this;
    }
    toJSON() {
      const t = super.toJSON();
      return (t.currentPoint = this.currentPoint.toArray()), t;
    }
    fromJSON(t) {
      return (
        super.fromJSON(t), this.currentPoint.fromArray(t.currentPoint), this
      );
    }
  }
  class hl extends cl {
    constructor(t) {
      super(t), (this.uuid = ve()), (this.type = "Shape"), (this.holes = []);
    }
    getPointsHoles(t) {
      const e = [];
      for (let n = 0, i = this.holes.length; n < i; n++)
        e[n] = this.holes[n].getPoints(t);
      return e;
    }
    extractPoints(t) {
      return { shape: this.getPoints(t), holes: this.getPointsHoles(t) };
    }
    copy(t) {
      super.copy(t), (this.holes = []);
      for (let e = 0, n = t.holes.length; e < n; e++) {
        const n = t.holes[e];
        this.holes.push(n.clone());
      }
      return this;
    }
    toJSON() {
      const t = super.toJSON();
      (t.uuid = this.uuid), (t.holes = []);
      for (let e = 0, n = this.holes.length; e < n; e++) {
        const n = this.holes[e];
        t.holes.push(n.toJSON());
      }
      return t;
    }
    fromJSON(t) {
      super.fromJSON(t), (this.uuid = t.uuid), (this.holes = []);
      for (let e = 0, n = t.holes.length; e < n; e++) {
        const n = t.holes[e];
        this.holes.push(new cl().fromJSON(n));
      }
      return this;
    }
  }
  const ul = function (t, e, n = 2) {
    const i = e && e.length,
      r = i ? e[0] * n : t.length;
    let s = dl(t, 0, r, n, !0);
    const o = [];
    if (!s || s.next === s.prev) return o;
    let a, l, c, h, u, d, p;
    if (
      (i &&
        (s = (function (t, e, n, i) {
          const r = [];
          let s, o, a, l, c;
          for (s = 0, o = e.length; s < o; s++)
            (a = e[s] * i),
              (l = s < o - 1 ? e[s + 1] * i : t.length),
              (c = dl(t, a, l, i, !1)),
              c === c.next && (c.steiner = !0),
              r.push(Ml(c));
          for (r.sort(_l), s = 0; s < r.length; s++)
            yl(r[s], n), (n = pl(n, n.next));
          return n;
        })(t, e, s, n)),
      t.length > 80 * n)
    ) {
      (a = c = t[0]), (l = h = t[1]);
      for (let e = n; e < r; e += n)
        (u = t[e]),
          (d = t[e + 1]),
          u < a && (a = u),
          d < l && (l = d),
          u > c && (c = u),
          d > h && (h = d);
      (p = Math.max(c - a, h - l)), (p = 0 !== p ? 1 / p : 0);
    }
    return ml(s, o, n, a, l, p), o;
  };
  function dl(t, e, n, i, r) {
    let s, o;
    if (
      r ===
      (function (t, e, n, i) {
        let r = 0;
        for (let s = e, o = n - i; s < n; s += i)
          (r += (t[o] - t[s]) * (t[s + 1] + t[o + 1])), (o = s);
        return r;
      })(t, e, n, i) >
        0
    )
      for (s = e; s < n; s += i) o = Il(s, t[s], t[s + 1], o);
    else for (s = n - i; s >= e; s -= i) o = Il(s, t[s], t[s + 1], o);
    return o && Al(o, o.next) && (Nl(o), (o = o.next)), o;
  }
  function pl(t, e) {
    if (!t) return t;
    e || (e = t);
    let n,
      i = t;
    do {
      if (
        ((n = !1), i.steiner || (!Al(i, i.next) && 0 !== El(i.prev, i, i.next)))
      )
        i = i.next;
      else {
        if ((Nl(i), (i = e = i.prev), i === i.next)) break;
        n = !0;
      }
    } while (n || i !== e);
    return e;
  }
  function ml(t, e, n, i, r, s, o) {
    if (!t) return;
    !o &&
      s &&
      (function (t, e, n, i) {
        let r = t;
        do {
          null === r.z && (r.z = wl(r.x, r.y, e, n, i)),
            (r.prevZ = r.prev),
            (r.nextZ = r.next),
            (r = r.next);
        } while (r !== t);
        (r.prevZ.nextZ = null),
          (r.prevZ = null),
          (function (t) {
            let e,
              n,
              i,
              r,
              s,
              o,
              a,
              l,
              c = 1;
            do {
              for (n = t, t = null, s = null, o = 0; n; ) {
                for (
                  o++, i = n, a = 0, e = 0;
                  e < c && (a++, (i = i.nextZ), i);
                  e++
                );
                for (l = c; a > 0 || (l > 0 && i); )
                  0 !== a && (0 === l || !i || n.z <= i.z)
                    ? ((r = n), (n = n.nextZ), a--)
                    : ((r = i), (i = i.nextZ), l--),
                    s ? (s.nextZ = r) : (t = r),
                    (r.prevZ = s),
                    (s = r);
                n = i;
              }
              (s.nextZ = null), (c *= 2);
            } while (o > 1);
          })(r);
      })(t, i, r, s);
    let a,
      l,
      c = t;
    for (; t.prev !== t.next; )
      if (((a = t.prev), (l = t.next), s ? gl(t, i, r, s) : fl(t)))
        e.push(a.i / n),
          e.push(t.i / n),
          e.push(l.i / n),
          Nl(t),
          (t = l.next),
          (c = l.next);
      else if ((t = l) === c) {
        o
          ? 1 === o
            ? ml((t = vl(pl(t), e, n)), e, n, i, r, s, 2)
            : 2 === o && xl(t, e, n, i, r, s)
          : ml(pl(t), e, n, i, r, s, 1);
        break;
      }
  }
  function fl(t) {
    const e = t.prev,
      n = t,
      i = t.next;
    if (El(e, n, i) >= 0) return !1;
    let r = t.next.next;
    for (; r !== t.prev; ) {
      if (
        Sl(e.x, e.y, n.x, n.y, i.x, i.y, r.x, r.y) &&
        El(r.prev, r, r.next) >= 0
      )
        return !1;
      r = r.next;
    }
    return !0;
  }
  function gl(t, e, n, i) {
    const r = t.prev,
      s = t,
      o = t.next;
    if (El(r, s, o) >= 0) return !1;
    const a = r.x < s.x ? (r.x < o.x ? r.x : o.x) : s.x < o.x ? s.x : o.x,
      l = r.y < s.y ? (r.y < o.y ? r.y : o.y) : s.y < o.y ? s.y : o.y,
      c = r.x > s.x ? (r.x > o.x ? r.x : o.x) : s.x > o.x ? s.x : o.x,
      h = r.y > s.y ? (r.y > o.y ? r.y : o.y) : s.y > o.y ? s.y : o.y,
      u = wl(a, l, e, n, i),
      d = wl(c, h, e, n, i);
    let p = t.prevZ,
      m = t.nextZ;
    for (; p && p.z >= u && m && m.z <= d; ) {
      if (
        p !== t.prev &&
        p !== t.next &&
        Sl(r.x, r.y, s.x, s.y, o.x, o.y, p.x, p.y) &&
        El(p.prev, p, p.next) >= 0
      )
        return !1;
      if (
        ((p = p.prevZ),
        m !== t.prev &&
          m !== t.next &&
          Sl(r.x, r.y, s.x, s.y, o.x, o.y, m.x, m.y) &&
          El(m.prev, m, m.next) >= 0)
      )
        return !1;
      m = m.nextZ;
    }
    for (; p && p.z >= u; ) {
      if (
        p !== t.prev &&
        p !== t.next &&
        Sl(r.x, r.y, s.x, s.y, o.x, o.y, p.x, p.y) &&
        El(p.prev, p, p.next) >= 0
      )
        return !1;
      p = p.prevZ;
    }
    for (; m && m.z <= d; ) {
      if (
        m !== t.prev &&
        m !== t.next &&
        Sl(r.x, r.y, s.x, s.y, o.x, o.y, m.x, m.y) &&
        El(m.prev, m, m.next) >= 0
      )
        return !1;
      m = m.nextZ;
    }
    return !0;
  }
  function vl(t, e, n) {
    let i = t;
    do {
      const r = i.prev,
        s = i.next.next;
      !Al(r, s) &&
        Ll(r, i, i.next, s) &&
        Pl(r, s) &&
        Pl(s, r) &&
        (e.push(r.i / n),
        e.push(i.i / n),
        e.push(s.i / n),
        Nl(i),
        Nl(i.next),
        (i = t = s)),
        (i = i.next);
    } while (i !== t);
    return pl(i);
  }
  function xl(t, e, n, i, r, s) {
    let o = t;
    do {
      let t = o.next.next;
      for (; t !== o.prev; ) {
        if (o.i !== t.i && Tl(o, t)) {
          let a = Dl(o, t);
          return (
            (o = pl(o, o.next)),
            (a = pl(a, a.next)),
            ml(o, e, n, i, r, s),
            void ml(a, e, n, i, r, s)
          );
        }
        t = t.next;
      }
      o = o.next;
    } while (o !== t);
  }
  function _l(t, e) {
    return t.x - e.x;
  }
  function yl(t, e) {
    if (
      ((e = (function (t, e) {
        let n = e;
        const i = t.x,
          r = t.y;
        let s,
          o = -1 / 0;
        do {
          if (r <= n.y && r >= n.next.y && n.next.y !== n.y) {
            const t = n.x + ((r - n.y) * (n.next.x - n.x)) / (n.next.y - n.y);
            if (t <= i && t > o) {
              if (((o = t), t === i)) {
                if (r === n.y) return n;
                if (r === n.next.y) return n.next;
              }
              s = n.x < n.next.x ? n : n.next;
            }
          }
          n = n.next;
        } while (n !== e);
        if (!s) return null;
        if (i === o) return s;
        const a = s,
          l = s.x,
          c = s.y;
        let h,
          u = 1 / 0;
        n = s;
        do {
          i >= n.x &&
            n.x >= l &&
            i !== n.x &&
            Sl(r < c ? i : o, r, l, c, r < c ? o : i, r, n.x, n.y) &&
            ((h = Math.abs(r - n.y) / (i - n.x)),
            Pl(n, t) &&
              (h < u ||
                (h === u && (n.x > s.x || (n.x === s.x && bl(s, n))))) &&
              ((s = n), (u = h))),
            (n = n.next);
        } while (n !== a);
        return s;
      })(t, e)),
      e)
    ) {
      const n = Dl(e, t);
      pl(e, e.next), pl(n, n.next);
    }
  }
  function bl(t, e) {
    return El(t.prev, t, e.prev) < 0 && El(e.next, t, t.next) < 0;
  }
  function wl(t, e, n, i, r) {
    return (
      (t =
        1431655765 &
        ((t =
          858993459 &
          ((t =
            252645135 &
            ((t = 16711935 & ((t = 32767 * (t - n) * r) | (t << 8))) |
              (t << 4))) |
            (t << 2))) |
          (t << 1))) |
      ((e =
        1431655765 &
        ((e =
          858993459 &
          ((e =
            252645135 &
            ((e = 16711935 & ((e = 32767 * (e - i) * r) | (e << 8))) |
              (e << 4))) |
            (e << 2))) |
          (e << 1))) <<
        1)
    );
  }
  function Ml(t) {
    let e = t,
      n = t;
    do {
      (e.x < n.x || (e.x === n.x && e.y < n.y)) && (n = e), (e = e.next);
    } while (e !== t);
    return n;
  }
  function Sl(t, e, n, i, r, s, o, a) {
    return (
      (r - o) * (e - a) - (t - o) * (s - a) >= 0 &&
      (t - o) * (i - a) - (n - o) * (e - a) >= 0 &&
      (n - o) * (s - a) - (r - o) * (i - a) >= 0
    );
  }
  function Tl(t, e) {
    return (
      t.next.i !== e.i &&
      t.prev.i !== e.i &&
      !(function (t, e) {
        let n = t;
        do {
          if (
            n.i !== t.i &&
            n.next.i !== t.i &&
            n.i !== e.i &&
            n.next.i !== e.i &&
            Ll(n, n.next, t, e)
          )
            return !0;
          n = n.next;
        } while (n !== t);
        return !1;
      })(t, e) &&
      ((Pl(t, e) &&
        Pl(e, t) &&
        (function (t, e) {
          let n = t,
            i = !1;
          const r = (t.x + e.x) / 2,
            s = (t.y + e.y) / 2;
          do {
            n.y > s != n.next.y > s &&
              n.next.y !== n.y &&
              r < ((n.next.x - n.x) * (s - n.y)) / (n.next.y - n.y) + n.x &&
              (i = !i),
              (n = n.next);
          } while (n !== t);
          return i;
        })(t, e) &&
        (El(t.prev, t, e.prev) || El(t, e.prev, e))) ||
        (Al(t, e) && El(t.prev, t, t.next) > 0 && El(e.prev, e, e.next) > 0))
    );
  }
  function El(t, e, n) {
    return (e.y - t.y) * (n.x - e.x) - (e.x - t.x) * (n.y - e.y);
  }
  function Al(t, e) {
    return t.x === e.x && t.y === e.y;
  }
  function Ll(t, e, n, i) {
    const r = Cl(El(t, e, n)),
      s = Cl(El(t, e, i)),
      o = Cl(El(n, i, t)),
      a = Cl(El(n, i, e));
    return (
      (r !== s && o !== a) ||
      !(0 !== r || !Rl(t, n, e)) ||
      !(0 !== s || !Rl(t, i, e)) ||
      !(0 !== o || !Rl(n, t, i)) ||
      !(0 !== a || !Rl(n, e, i))
    );
  }
  function Rl(t, e, n) {
    return (
      e.x <= Math.max(t.x, n.x) &&
      e.x >= Math.min(t.x, n.x) &&
      e.y <= Math.max(t.y, n.y) &&
      e.y >= Math.min(t.y, n.y)
    );
  }
  function Cl(t) {
    return t > 0 ? 1 : t < 0 ? -1 : 0;
  }
  function Pl(t, e) {
    return El(t.prev, t, t.next) < 0
      ? El(t, e, t.next) >= 0 && El(t, t.prev, e) >= 0
      : El(t, e, t.prev) < 0 || El(t, t.next, e) < 0;
  }
  function Dl(t, e) {
    const n = new zl(t.i, t.x, t.y),
      i = new zl(e.i, e.x, e.y),
      r = t.next,
      s = e.prev;
    return (
      (t.next = e),
      (e.prev = t),
      (n.next = r),
      (r.prev = n),
      (i.next = n),
      (n.prev = i),
      (s.next = i),
      (i.prev = s),
      i
    );
  }
  function Il(t, e, n, i) {
    const r = new zl(t, e, n);
    return (
      i
        ? ((r.next = i.next), (r.prev = i), (i.next.prev = r), (i.next = r))
        : ((r.prev = r), (r.next = r)),
      r
    );
  }
  function Nl(t) {
    (t.next.prev = t.prev),
      (t.prev.next = t.next),
      t.prevZ && (t.prevZ.nextZ = t.nextZ),
      t.nextZ && (t.nextZ.prevZ = t.prevZ);
  }
  function zl(t, e, n) {
    (this.i = t),
      (this.x = e),
      (this.y = n),
      (this.prev = null),
      (this.next = null),
      (this.z = null),
      (this.prevZ = null),
      (this.nextZ = null),
      (this.steiner = !1);
  }
  class kl {
    static area(t) {
      const e = t.length;
      let n = 0;
      for (let i = e - 1, r = 0; r < e; i = r++)
        n += t[i].x * t[r].y - t[r].x * t[i].y;
      return 0.5 * n;
    }
    static isClockWise(t) {
      return kl.area(t) < 0;
    }
    static triangulateShape(t, e) {
      const n = [],
        i = [],
        r = [];
      Ol(t), Fl(n, t);
      let s = t.length;
      e.forEach(Ol);
      for (let t = 0; t < e.length; t++)
        i.push(s), (s += e[t].length), Fl(n, e[t]);
      const o = ul(n, i);
      for (let t = 0; t < o.length; t += 3) r.push(o.slice(t, t + 3));
      return r;
    }
  }
  function Ol(t) {
    const e = t.length;
    e > 2 && t[e - 1].equals(t[0]) && t.pop();
  }
  function Fl(t, e) {
    for (let n = 0; n < e.length; n++) t.push(e[n].x), t.push(e[n].y);
  }
  class Ul extends _i {
    constructor(
      t = new hl([
        new we(0.5, 0.5),
        new we(-0.5, 0.5),
        new we(-0.5, -0.5),
        new we(0.5, -0.5),
      ]),
      e = {}
    ) {
      super(),
        (this.type = "ExtrudeGeometry"),
        (this.parameters = { shapes: t, options: e }),
        (t = Array.isArray(t) ? t : [t]);
      const n = this,
        i = [],
        r = [];
      for (let e = 0, n = t.length; e < n; e++) {
        s(t[e]);
      }
      function s(t) {
        const s = [],
          o = void 0 !== e.curveSegments ? e.curveSegments : 12,
          a = void 0 !== e.steps ? e.steps : 1;
        let l = void 0 !== e.depth ? e.depth : 1,
          c = void 0 === e.bevelEnabled || e.bevelEnabled,
          h = void 0 !== e.bevelThickness ? e.bevelThickness : 0.2,
          u = void 0 !== e.bevelSize ? e.bevelSize : h - 0.1,
          d = void 0 !== e.bevelOffset ? e.bevelOffset : 0,
          p = void 0 !== e.bevelSegments ? e.bevelSegments : 3;
        const m = e.extrudePath,
          f = void 0 !== e.UVGenerator ? e.UVGenerator : Bl;
        void 0 !== e.amount &&
          (console.warn(
            "THREE.ExtrudeBufferGeometry: amount has been renamed to depth."
          ),
          (l = e.amount));
        let g,
          v,
          x,
          _,
          y,
          b = !1;
        m &&
          ((g = m.getSpacedPoints(a)),
          (b = !0),
          (c = !1),
          (v = m.computeFrenetFrames(a, !1)),
          (x = new ze()),
          (_ = new ze()),
          (y = new ze())),
          c || ((p = 0), (h = 0), (u = 0), (d = 0));
        const w = t.extractPoints(o);
        let M = w.shape;
        const S = w.holes;
        if (!kl.isClockWise(M)) {
          M = M.reverse();
          for (let t = 0, e = S.length; t < e; t++) {
            const e = S[t];
            kl.isClockWise(e) && (S[t] = e.reverse());
          }
        }
        const T = kl.triangulateShape(M, S),
          E = M;
        for (let t = 0, e = S.length; t < e; t++) {
          const e = S[t];
          M = M.concat(e);
        }
        function A(t, e, n) {
          return (
            e || console.error("THREE.ExtrudeGeometry: vec does not exist"),
            e.clone().multiplyScalar(n).add(t)
          );
        }
        const L = M.length,
          R = T.length;
        function C(t, e, n) {
          let i, r, s;
          const o = t.x - e.x,
            a = t.y - e.y,
            l = n.x - t.x,
            c = n.y - t.y,
            h = o * o + a * a,
            u = o * c - a * l;
          if (Math.abs(u) > Number.EPSILON) {
            const u = Math.sqrt(h),
              d = Math.sqrt(l * l + c * c),
              p = e.x - a / u,
              m = e.y + o / u,
              f =
                ((n.x - c / d - p) * c - (n.y + l / d - m) * l) /
                (o * c - a * l);
            (i = p + o * f - t.x), (r = m + a * f - t.y);
            const g = i * i + r * r;
            if (g <= 2) return new we(i, r);
            s = Math.sqrt(g / 2);
          } else {
            let t = !1;
            o > Number.EPSILON
              ? l > Number.EPSILON && (t = !0)
              : o < -Number.EPSILON
              ? l < -Number.EPSILON && (t = !0)
              : Math.sign(a) === Math.sign(c) && (t = !0),
              t
                ? ((i = -a), (r = o), (s = Math.sqrt(h)))
                : ((i = o), (r = a), (s = Math.sqrt(h / 2)));
          }
          return new we(i / s, r / s);
        }
        const P = [];
        for (
          let t = 0, e = E.length, n = e - 1, i = t + 1;
          t < e;
          t++, n++, i++
        )
          n === e && (n = 0), i === e && (i = 0), (P[t] = C(E[t], E[n], E[i]));
        const D = [];
        let I,
          N = P.concat();
        for (let t = 0, e = S.length; t < e; t++) {
          const e = S[t];
          I = [];
          for (
            let t = 0, n = e.length, i = n - 1, r = t + 1;
            t < n;
            t++, i++, r++
          )
            i === n && (i = 0),
              r === n && (r = 0),
              (I[t] = C(e[t], e[i], e[r]));
          D.push(I), (N = N.concat(I));
        }
        for (let t = 0; t < p; t++) {
          const e = t / p,
            n = h * Math.cos((e * Math.PI) / 2),
            i = u * Math.sin((e * Math.PI) / 2) + d;
          for (let t = 0, e = E.length; t < e; t++) {
            const e = A(E[t], P[t], i);
            O(e.x, e.y, -n);
          }
          for (let t = 0, e = S.length; t < e; t++) {
            const e = S[t];
            I = D[t];
            for (let t = 0, r = e.length; t < r; t++) {
              const r = A(e[t], I[t], i);
              O(r.x, r.y, -n);
            }
          }
        }
        const z = u + d;
        for (let t = 0; t < L; t++) {
          const e = c ? A(M[t], N[t], z) : M[t];
          b
            ? (_.copy(v.normals[0]).multiplyScalar(e.x),
              x.copy(v.binormals[0]).multiplyScalar(e.y),
              y.copy(g[0]).add(_).add(x),
              O(y.x, y.y, y.z))
            : O(e.x, e.y, 0);
        }
        for (let t = 1; t <= a; t++)
          for (let e = 0; e < L; e++) {
            const n = c ? A(M[e], N[e], z) : M[e];
            b
              ? (_.copy(v.normals[t]).multiplyScalar(n.x),
                x.copy(v.binormals[t]).multiplyScalar(n.y),
                y.copy(g[t]).add(_).add(x),
                O(y.x, y.y, y.z))
              : O(n.x, n.y, (l / a) * t);
          }
        for (let t = p - 1; t >= 0; t--) {
          const e = t / p,
            n = h * Math.cos((e * Math.PI) / 2),
            i = u * Math.sin((e * Math.PI) / 2) + d;
          for (let t = 0, e = E.length; t < e; t++) {
            const e = A(E[t], P[t], i);
            O(e.x, e.y, l + n);
          }
          for (let t = 0, e = S.length; t < e; t++) {
            const e = S[t];
            I = D[t];
            for (let t = 0, r = e.length; t < r; t++) {
              const r = A(e[t], I[t], i);
              b ? O(r.x, r.y + g[a - 1].y, g[a - 1].x + n) : O(r.x, r.y, l + n);
            }
          }
        }
        function k(t, e) {
          let n = t.length;
          for (; --n >= 0; ) {
            const i = n;
            let r = n - 1;
            r < 0 && (r = t.length - 1);
            for (let t = 0, n = a + 2 * p; t < n; t++) {
              const n = L * t,
                s = L * (t + 1);
              U(e + i + n, e + r + n, e + r + s, e + i + s);
            }
          }
        }
        function O(t, e, n) {
          s.push(t), s.push(e), s.push(n);
        }
        function F(t, e, r) {
          B(t), B(e), B(r);
          const s = i.length / 3,
            o = f.generateTopUV(n, i, s - 3, s - 2, s - 1);
          H(o[0]), H(o[1]), H(o[2]);
        }
        function U(t, e, r, s) {
          B(t), B(e), B(s), B(e), B(r), B(s);
          const o = i.length / 3,
            a = f.generateSideWallUV(n, i, o - 6, o - 3, o - 2, o - 1);
          H(a[0]), H(a[1]), H(a[3]), H(a[1]), H(a[2]), H(a[3]);
        }
        function B(t) {
          i.push(s[3 * t + 0]), i.push(s[3 * t + 1]), i.push(s[3 * t + 2]);
        }
        function H(t) {
          r.push(t.x), r.push(t.y);
        }
        !(function () {
          const t = i.length / 3;
          if (c) {
            let t = 0,
              e = L * t;
            for (let t = 0; t < R; t++) {
              const n = T[t];
              F(n[2] + e, n[1] + e, n[0] + e);
            }
            (t = a + 2 * p), (e = L * t);
            for (let t = 0; t < R; t++) {
              const n = T[t];
              F(n[0] + e, n[1] + e, n[2] + e);
            }
          } else {
            for (let t = 0; t < R; t++) {
              const e = T[t];
              F(e[2], e[1], e[0]);
            }
            for (let t = 0; t < R; t++) {
              const e = T[t];
              F(e[0] + L * a, e[1] + L * a, e[2] + L * a);
            }
          }
          n.addGroup(t, i.length / 3 - t, 0);
        })(),
          (function () {
            const t = i.length / 3;
            let e = 0;
            k(E, e), (e += E.length);
            for (let t = 0, n = S.length; t < n; t++) {
              const n = S[t];
              k(n, e), (e += n.length);
            }
            n.addGroup(t, i.length / 3 - t, 1);
          })();
      }
      this.setAttribute("position", new ui(i, 3)),
        this.setAttribute("uv", new ui(r, 2)),
        this.computeVertexNormals();
    }
    toJSON() {
      const t = super.toJSON();
      return (function (t, e, n) {
        if (((n.shapes = []), Array.isArray(t)))
          for (let e = 0, i = t.length; e < i; e++) {
            const i = t[e];
            n.shapes.push(i.uuid);
          }
        else n.shapes.push(t.uuid);
        void 0 !== e.extrudePath &&
          (n.options.extrudePath = e.extrudePath.toJSON());
        return n;
      })(this.parameters.shapes, this.parameters.options, t);
    }
    static fromJSON(t, e) {
      const n = [];
      for (let i = 0, r = t.shapes.length; i < r; i++) {
        const r = e[t.shapes[i]];
        n.push(r);
      }
      const i = t.options.extrudePath;
      return (
        void 0 !== i && (t.options.extrudePath = new al[i.type]().fromJSON(i)),
        new Ul(n, t.options)
      );
    }
  }
  const Bl = {
    generateTopUV: function (t, e, n, i, r) {
      const s = e[3 * n],
        o = e[3 * n + 1],
        a = e[3 * i],
        l = e[3 * i + 1],
        c = e[3 * r],
        h = e[3 * r + 1];
      return [new we(s, o), new we(a, l), new we(c, h)];
    },
    generateSideWallUV: function (t, e, n, i, r, s) {
      const o = e[3 * n],
        a = e[3 * n + 1],
        l = e[3 * n + 2],
        c = e[3 * i],
        h = e[3 * i + 1],
        u = e[3 * i + 2],
        d = e[3 * r],
        p = e[3 * r + 1],
        m = e[3 * r + 2],
        f = e[3 * s],
        g = e[3 * s + 1],
        v = e[3 * s + 2];
      return Math.abs(a - h) < Math.abs(o - c)
        ? [
            new we(o, 1 - l),
            new we(c, 1 - u),
            new we(d, 1 - m),
            new we(f, 1 - v),
          ]
        : [
            new we(a, 1 - l),
            new we(h, 1 - u),
            new we(p, 1 - m),
            new we(g, 1 - v),
          ];
    },
  };
  class Hl extends _i {
    constructor(
      t = new hl([new we(0, 0.5), new we(-0.5, -0.5), new we(0.5, -0.5)]),
      e = 12
    ) {
      super(),
        (this.type = "ShapeGeometry"),
        (this.parameters = { shapes: t, curveSegments: e });
      const n = [],
        i = [],
        r = [],
        s = [];
      let o = 0,
        a = 0;
      if (!1 === Array.isArray(t)) l(t);
      else
        for (let e = 0; e < t.length; e++)
          l(t[e]), this.addGroup(o, a, e), (o += a), (a = 0);
      function l(t) {
        const o = i.length / 3,
          l = t.extractPoints(e);
        let c = l.shape;
        const h = l.holes;
        !1 === kl.isClockWise(c) && (c = c.reverse());
        for (let t = 0, e = h.length; t < e; t++) {
          const e = h[t];
          !0 === kl.isClockWise(e) && (h[t] = e.reverse());
        }
        const u = kl.triangulateShape(c, h);
        for (let t = 0, e = h.length; t < e; t++) {
          const e = h[t];
          c = c.concat(e);
        }
        for (let t = 0, e = c.length; t < e; t++) {
          const e = c[t];
          i.push(e.x, e.y, 0), r.push(0, 0, 1), s.push(e.x, e.y);
        }
        for (let t = 0, e = u.length; t < e; t++) {
          const e = u[t],
            i = e[0] + o,
            r = e[1] + o,
            s = e[2] + o;
          n.push(i, r, s), (a += 3);
        }
      }
      this.setIndex(n),
        this.setAttribute("position", new ui(i, 3)),
        this.setAttribute("normal", new ui(r, 3)),
        this.setAttribute("uv", new ui(s, 2));
    }
    toJSON() {
      const t = super.toJSON();
      return (function (t, e) {
        if (((e.shapes = []), Array.isArray(t)))
          for (let n = 0, i = t.length; n < i; n++) {
            const i = t[n];
            e.shapes.push(i.uuid);
          }
        else e.shapes.push(t.uuid);
        return e;
      })(this.parameters.shapes, t);
    }
    static fromJSON(t, e) {
      const n = [];
      for (let i = 0, r = t.shapes.length; i < r; i++) {
        const r = e[t.shapes[i]];
        n.push(r);
      }
      return new Hl(n, t.curveSegments);
    }
  }
  (class extends Qn {
    constructor(t) {
      super(),
        (this.type = "ShadowMaterial"),
        (this.color = new ri(0)),
        (this.transparent = !0),
        this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.color.copy(t.color), this;
    }
  }).prototype.isShadowMaterial = !0;
  class Gl extends Qn {
    constructor(t) {
      super(),
        (this.defines = { STANDARD: "" }),
        (this.type = "MeshStandardMaterial"),
        (this.color = new ri(16777215)),
        (this.roughness = 1),
        (this.metalness = 0),
        (this.map = null),
        (this.lightMap = null),
        (this.lightMapIntensity = 1),
        (this.aoMap = null),
        (this.aoMapIntensity = 1),
        (this.emissive = new ri(0)),
        (this.emissiveIntensity = 1),
        (this.emissiveMap = null),
        (this.bumpMap = null),
        (this.bumpScale = 1),
        (this.normalMap = null),
        (this.normalMapType = 0),
        (this.normalScale = new we(1, 1)),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.roughnessMap = null),
        (this.metalnessMap = null),
        (this.alphaMap = null),
        (this.envMap = null),
        (this.envMapIntensity = 1),
        (this.refractionRatio = 0.98),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.wireframeLinecap = "round"),
        (this.wireframeLinejoin = "round"),
        (this.flatShading = !1),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        (this.defines = { STANDARD: "" }),
        this.color.copy(t.color),
        (this.roughness = t.roughness),
        (this.metalness = t.metalness),
        (this.map = t.map),
        (this.lightMap = t.lightMap),
        (this.lightMapIntensity = t.lightMapIntensity),
        (this.aoMap = t.aoMap),
        (this.aoMapIntensity = t.aoMapIntensity),
        this.emissive.copy(t.emissive),
        (this.emissiveMap = t.emissiveMap),
        (this.emissiveIntensity = t.emissiveIntensity),
        (this.bumpMap = t.bumpMap),
        (this.bumpScale = t.bumpScale),
        (this.normalMap = t.normalMap),
        (this.normalMapType = t.normalMapType),
        this.normalScale.copy(t.normalScale),
        (this.displacementMap = t.displacementMap),
        (this.displacementScale = t.displacementScale),
        (this.displacementBias = t.displacementBias),
        (this.roughnessMap = t.roughnessMap),
        (this.metalnessMap = t.metalnessMap),
        (this.alphaMap = t.alphaMap),
        (this.envMap = t.envMap),
        (this.envMapIntensity = t.envMapIntensity),
        (this.refractionRatio = t.refractionRatio),
        (this.wireframe = t.wireframe),
        (this.wireframeLinewidth = t.wireframeLinewidth),
        (this.wireframeLinecap = t.wireframeLinecap),
        (this.wireframeLinejoin = t.wireframeLinejoin),
        (this.flatShading = t.flatShading),
        this
      );
    }
  }
  Gl.prototype.isMeshStandardMaterial = !0;
  (class extends Gl {
    constructor(t) {
      super(),
        (this.defines = { STANDARD: "", PHYSICAL: "" }),
        (this.type = "MeshPhysicalMaterial"),
        (this.clearcoatMap = null),
        (this.clearcoatRoughness = 0),
        (this.clearcoatRoughnessMap = null),
        (this.clearcoatNormalScale = new we(1, 1)),
        (this.clearcoatNormalMap = null),
        (this.ior = 1.5),
        Object.defineProperty(this, "reflectivity", {
          get: function () {
            return xe((2.5 * (this.ior - 1)) / (this.ior + 1), 0, 1);
          },
          set: function (t) {
            this.ior = (1 + 0.4 * t) / (1 - 0.4 * t);
          },
        }),
        (this.sheenColor = new ri(0)),
        (this.sheenColorMap = null),
        (this.sheenRoughness = 1),
        (this.sheenRoughnessMap = null),
        (this.transmissionMap = null),
        (this.thickness = 0),
        (this.thicknessMap = null),
        (this.attenuationDistance = 0),
        (this.attenuationColor = new ri(1, 1, 1)),
        (this.specularIntensity = 1),
        (this.specularIntensityMap = null),
        (this.specularColor = new ri(1, 1, 1)),
        (this.specularColorMap = null),
        (this._sheen = 0),
        (this._clearcoat = 0),
        (this._transmission = 0),
        this.setValues(t);
    }
    get sheen() {
      return this._sheen;
    }
    set sheen(t) {
      this._sheen > 0 != t > 0 && this.version++, (this._sheen = t);
    }
    get clearcoat() {
      return this._clearcoat;
    }
    set clearcoat(t) {
      this._clearcoat > 0 != t > 0 && this.version++, (this._clearcoat = t);
    }
    get transmission() {
      return this._transmission;
    }
    set transmission(t) {
      this._transmission > 0 != t > 0 && this.version++,
        (this._transmission = t);
    }
    copy(t) {
      return (
        super.copy(t),
        (this.defines = { STANDARD: "", PHYSICAL: "" }),
        (this.clearcoat = t.clearcoat),
        (this.clearcoatMap = t.clearcoatMap),
        (this.clearcoatRoughness = t.clearcoatRoughness),
        (this.clearcoatRoughnessMap = t.clearcoatRoughnessMap),
        (this.clearcoatNormalMap = t.clearcoatNormalMap),
        this.clearcoatNormalScale.copy(t.clearcoatNormalScale),
        (this.ior = t.ior),
        (this.sheen = t.sheen),
        this.sheenColor.copy(t.sheenColor),
        (this.sheenColorMap = t.sheenColorMap),
        (this.sheenRoughness = t.sheenRoughness),
        (this.sheenRoughnessMap = t.sheenRoughnessMap),
        (this.transmission = t.transmission),
        (this.transmissionMap = t.transmissionMap),
        (this.thickness = t.thickness),
        (this.thicknessMap = t.thicknessMap),
        (this.attenuationDistance = t.attenuationDistance),
        this.attenuationColor.copy(t.attenuationColor),
        (this.specularIntensity = t.specularIntensity),
        (this.specularIntensityMap = t.specularIntensityMap),
        this.specularColor.copy(t.specularColor),
        (this.specularColorMap = t.specularColorMap),
        this
      );
    }
  }).prototype.isMeshPhysicalMaterial = !0;
  (class extends Qn {
    constructor(t) {
      super(),
        (this.type = "MeshPhongMaterial"),
        (this.color = new ri(16777215)),
        (this.specular = new ri(1118481)),
        (this.shininess = 30),
        (this.map = null),
        (this.lightMap = null),
        (this.lightMapIntensity = 1),
        (this.aoMap = null),
        (this.aoMapIntensity = 1),
        (this.emissive = new ri(0)),
        (this.emissiveIntensity = 1),
        (this.emissiveMap = null),
        (this.bumpMap = null),
        (this.bumpScale = 1),
        (this.normalMap = null),
        (this.normalMapType = 0),
        (this.normalScale = new we(1, 1)),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.specularMap = null),
        (this.alphaMap = null),
        (this.envMap = null),
        (this.combine = 0),
        (this.reflectivity = 1),
        (this.refractionRatio = 0.98),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.wireframeLinecap = "round"),
        (this.wireframeLinejoin = "round"),
        (this.flatShading = !1),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        this.color.copy(t.color),
        this.specular.copy(t.specular),
        (this.shininess = t.shininess),
        (this.map = t.map),
        (this.lightMap = t.lightMap),
        (this.lightMapIntensity = t.lightMapIntensity),
        (this.aoMap = t.aoMap),
        (this.aoMapIntensity = t.aoMapIntensity),
        this.emissive.copy(t.emissive),
        (this.emissiveMap = t.emissiveMap),
        (this.emissiveIntensity = t.emissiveIntensity),
        (this.bumpMap = t.bumpMap),
        (this.bumpScale = t.bumpScale),
        (this.normalMap = t.normalMap),
        (this.normalMapType = t.normalMapType),
        this.normalScale.copy(t.normalScale),
        (this.displacementMap = t.displacementMap),
        (this.displacementScale = t.displacementScale),
        (this.displacementBias = t.displacementBias),
        (this.specularMap = t.specularMap),
        (this.alphaMap = t.alphaMap),
        (this.envMap = t.envMap),
        (this.combine = t.combine),
        (this.reflectivity = t.reflectivity),
        (this.refractionRatio = t.refractionRatio),
        (this.wireframe = t.wireframe),
        (this.wireframeLinewidth = t.wireframeLinewidth),
        (this.wireframeLinecap = t.wireframeLinecap),
        (this.wireframeLinejoin = t.wireframeLinejoin),
        (this.flatShading = t.flatShading),
        this
      );
    }
  }).prototype.isMeshPhongMaterial = !0;
  (class extends Qn {
    constructor(t) {
      super(),
        (this.defines = { TOON: "" }),
        (this.type = "MeshToonMaterial"),
        (this.color = new ri(16777215)),
        (this.map = null),
        (this.gradientMap = null),
        (this.lightMap = null),
        (this.lightMapIntensity = 1),
        (this.aoMap = null),
        (this.aoMapIntensity = 1),
        (this.emissive = new ri(0)),
        (this.emissiveIntensity = 1),
        (this.emissiveMap = null),
        (this.bumpMap = null),
        (this.bumpScale = 1),
        (this.normalMap = null),
        (this.normalMapType = 0),
        (this.normalScale = new we(1, 1)),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.alphaMap = null),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.wireframeLinecap = "round"),
        (this.wireframeLinejoin = "round"),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        this.color.copy(t.color),
        (this.map = t.map),
        (this.gradientMap = t.gradientMap),
        (this.lightMap = t.lightMap),
        (this.lightMapIntensity = t.lightMapIntensity),
        (this.aoMap = t.aoMap),
        (this.aoMapIntensity = t.aoMapIntensity),
        this.emissive.copy(t.emissive),
        (this.emissiveMap = t.emissiveMap),
        (this.emissiveIntensity = t.emissiveIntensity),
        (this.bumpMap = t.bumpMap),
        (this.bumpScale = t.bumpScale),
        (this.normalMap = t.normalMap),
        (this.normalMapType = t.normalMapType),
        this.normalScale.copy(t.normalScale),
        (this.displacementMap = t.displacementMap),
        (this.displacementScale = t.displacementScale),
        (this.displacementBias = t.displacementBias),
        (this.alphaMap = t.alphaMap),
        (this.wireframe = t.wireframe),
        (this.wireframeLinewidth = t.wireframeLinewidth),
        (this.wireframeLinecap = t.wireframeLinecap),
        (this.wireframeLinejoin = t.wireframeLinejoin),
        this
      );
    }
  }).prototype.isMeshToonMaterial = !0;
  (class extends Qn {
    constructor(t) {
      super(),
        (this.type = "MeshNormalMaterial"),
        (this.bumpMap = null),
        (this.bumpScale = 1),
        (this.normalMap = null),
        (this.normalMapType = 0),
        (this.normalScale = new we(1, 1)),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.fog = !1),
        (this.flatShading = !1),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        (this.bumpMap = t.bumpMap),
        (this.bumpScale = t.bumpScale),
        (this.normalMap = t.normalMap),
        (this.normalMapType = t.normalMapType),
        this.normalScale.copy(t.normalScale),
        (this.displacementMap = t.displacementMap),
        (this.displacementScale = t.displacementScale),
        (this.displacementBias = t.displacementBias),
        (this.wireframe = t.wireframe),
        (this.wireframeLinewidth = t.wireframeLinewidth),
        (this.flatShading = t.flatShading),
        this
      );
    }
  }).prototype.isMeshNormalMaterial = !0;
  class Vl extends Qn {
    constructor(t) {
      super(),
        (this.type = "MeshLambertMaterial"),
        (this.color = new ri(16777215)),
        (this.map = null),
        (this.lightMap = null),
        (this.lightMapIntensity = 1),
        (this.aoMap = null),
        (this.aoMapIntensity = 1),
        (this.emissive = new ri(0)),
        (this.emissiveIntensity = 1),
        (this.emissiveMap = null),
        (this.specularMap = null),
        (this.alphaMap = null),
        (this.envMap = null),
        (this.combine = 0),
        (this.reflectivity = 1),
        (this.refractionRatio = 0.98),
        (this.wireframe = !1),
        (this.wireframeLinewidth = 1),
        (this.wireframeLinecap = "round"),
        (this.wireframeLinejoin = "round"),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        this.color.copy(t.color),
        (this.map = t.map),
        (this.lightMap = t.lightMap),
        (this.lightMapIntensity = t.lightMapIntensity),
        (this.aoMap = t.aoMap),
        (this.aoMapIntensity = t.aoMapIntensity),
        this.emissive.copy(t.emissive),
        (this.emissiveMap = t.emissiveMap),
        (this.emissiveIntensity = t.emissiveIntensity),
        (this.specularMap = t.specularMap),
        (this.alphaMap = t.alphaMap),
        (this.envMap = t.envMap),
        (this.combine = t.combine),
        (this.reflectivity = t.reflectivity),
        (this.refractionRatio = t.refractionRatio),
        (this.wireframe = t.wireframe),
        (this.wireframeLinewidth = t.wireframeLinewidth),
        (this.wireframeLinecap = t.wireframeLinecap),
        (this.wireframeLinejoin = t.wireframeLinejoin),
        this
      );
    }
  }
  Vl.prototype.isMeshLambertMaterial = !0;
  (class extends Qn {
    constructor(t) {
      super(),
        (this.defines = { MATCAP: "" }),
        (this.type = "MeshMatcapMaterial"),
        (this.color = new ri(16777215)),
        (this.matcap = null),
        (this.map = null),
        (this.bumpMap = null),
        (this.bumpScale = 1),
        (this.normalMap = null),
        (this.normalMapType = 0),
        (this.normalScale = new we(1, 1)),
        (this.displacementMap = null),
        (this.displacementScale = 1),
        (this.displacementBias = 0),
        (this.alphaMap = null),
        (this.flatShading = !1),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        (this.defines = { MATCAP: "" }),
        this.color.copy(t.color),
        (this.matcap = t.matcap),
        (this.map = t.map),
        (this.bumpMap = t.bumpMap),
        (this.bumpScale = t.bumpScale),
        (this.normalMap = t.normalMap),
        (this.normalMapType = t.normalMapType),
        this.normalScale.copy(t.normalScale),
        (this.displacementMap = t.displacementMap),
        (this.displacementScale = t.displacementScale),
        (this.displacementBias = t.displacementBias),
        (this.alphaMap = t.alphaMap),
        (this.flatShading = t.flatShading),
        this
      );
    }
  }).prototype.isMeshMatcapMaterial = !0;
  (class extends Aa {
    constructor(t) {
      super(),
        (this.type = "LineDashedMaterial"),
        (this.scale = 1),
        (this.dashSize = 3),
        (this.gapSize = 1),
        this.setValues(t);
    }
    copy(t) {
      return (
        super.copy(t),
        (this.scale = t.scale),
        (this.dashSize = t.dashSize),
        (this.gapSize = t.gapSize),
        this
      );
    }
  }).prototype.isLineDashedMaterial = !0;
  const Wl = {
    arraySlice: function (t, e, n) {
      return Wl.isTypedArray(t)
        ? new t.constructor(t.subarray(e, void 0 !== n ? n : t.length))
        : t.slice(e, n);
    },
    convertArray: function (t, e, n) {
      return !t || (!n && t.constructor === e)
        ? t
        : "number" == typeof e.BYTES_PER_ELEMENT
        ? new e(t)
        : Array.prototype.slice.call(t);
    },
    isTypedArray: function (t) {
      return ArrayBuffer.isView(t) && !(t instanceof DataView);
    },
    getKeyframeOrder: function (t) {
      const e = t.length,
        n = new Array(e);
      for (let t = 0; t !== e; ++t) n[t] = t;
      return (
        n.sort(function (e, n) {
          return t[e] - t[n];
        }),
        n
      );
    },
    sortedArray: function (t, e, n) {
      const i = t.length,
        r = new t.constructor(i);
      for (let s = 0, o = 0; o !== i; ++s) {
        const i = n[s] * e;
        for (let n = 0; n !== e; ++n) r[o++] = t[i + n];
      }
      return r;
    },
    flattenJSON: function (t, e, n, i) {
      let r = 1,
        s = t[0];
      for (; void 0 !== s && void 0 === s[i]; ) s = t[r++];
      if (void 0 === s) return;
      let o = s[i];
      if (void 0 !== o)
        if (Array.isArray(o))
          do {
            (o = s[i]),
              void 0 !== o && (e.push(s.time), n.push.apply(n, o)),
              (s = t[r++]);
          } while (void 0 !== s);
        else if (void 0 !== o.toArray)
          do {
            (o = s[i]),
              void 0 !== o && (e.push(s.time), o.toArray(n, n.length)),
              (s = t[r++]);
          } while (void 0 !== s);
        else
          do {
            (o = s[i]),
              void 0 !== o && (e.push(s.time), n.push(o)),
              (s = t[r++]);
          } while (void 0 !== s);
    },
    subclip: function (t, e, n, i, r = 30) {
      const s = t.clone();
      s.name = e;
      const o = [];
      for (let t = 0; t < s.tracks.length; ++t) {
        const e = s.tracks[t],
          a = e.getValueSize(),
          l = [],
          c = [];
        for (let t = 0; t < e.times.length; ++t) {
          const s = e.times[t] * r;
          if (!(s < n || s >= i)) {
            l.push(e.times[t]);
            for (let n = 0; n < a; ++n) c.push(e.values[t * a + n]);
          }
        }
        0 !== l.length &&
          ((e.times = Wl.convertArray(l, e.times.constructor)),
          (e.values = Wl.convertArray(c, e.values.constructor)),
          o.push(e));
      }
      s.tracks = o;
      let a = 1 / 0;
      for (let t = 0; t < s.tracks.length; ++t)
        a > s.tracks[t].times[0] && (a = s.tracks[t].times[0]);
      for (let t = 0; t < s.tracks.length; ++t) s.tracks[t].shift(-1 * a);
      return s.resetDuration(), s;
    },
    makeClipAdditive: function (t, e = 0, n = t, i = 30) {
      i <= 0 && (i = 30);
      const r = n.tracks.length,
        s = e / i;
      for (let e = 0; e < r; ++e) {
        const i = n.tracks[e],
          r = i.ValueTypeName;
        if ("bool" === r || "string" === r) continue;
        const o = t.tracks.find(function (t) {
          return t.name === i.name && t.ValueTypeName === r;
        });
        if (void 0 === o) continue;
        let a = 0;
        const l = i.getValueSize();
        i.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline &&
          (a = l / 3);
        let c = 0;
        const h = o.getValueSize();
        o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline &&
          (c = h / 3);
        const u = i.times.length - 1;
        let d;
        if (s <= i.times[0]) {
          const t = a,
            e = l - a;
          d = Wl.arraySlice(i.values, t, e);
        } else if (s >= i.times[u]) {
          const t = u * l + a,
            e = t + l - a;
          d = Wl.arraySlice(i.values, t, e);
        } else {
          const t = i.createInterpolant(),
            e = a,
            n = l - a;
          t.evaluate(s), (d = Wl.arraySlice(t.resultBuffer, e, n));
        }
        if ("quaternion" === r) {
          new Ne().fromArray(d).normalize().conjugate().toArray(d);
        }
        const p = o.times.length;
        for (let t = 0; t < p; ++t) {
          const e = t * h + c;
          if ("quaternion" === r)
            Ne.multiplyQuaternionsFlat(o.values, e, d, 0, o.values, e);
          else {
            const t = h - 2 * c;
            for (let n = 0; n < t; ++n) o.values[e + n] -= d[n];
          }
        }
      }
      return (t.blendMode = 2501), t;
    },
  };
  class jl {
    constructor(t, e, n, i) {
      (this.parameterPositions = t),
        (this._cachedIndex = 0),
        (this.resultBuffer = void 0 !== i ? i : new e.constructor(n)),
        (this.sampleValues = e),
        (this.valueSize = n),
        (this.settings = null),
        (this.DefaultSettings_ = {});
    }
    evaluate(t) {
      const e = this.parameterPositions;
      let n = this._cachedIndex,
        i = e[n],
        r = e[n - 1];
      t: {
        e: {
          let s;
          n: {
            i: if (!(t < i)) {
              for (let s = n + 2; ; ) {
                if (void 0 === i) {
                  if (t < r) break i;
                  return (
                    (n = e.length),
                    (this._cachedIndex = n),
                    this.afterEnd_(n - 1, t, r)
                  );
                }
                if (n === s) break;
                if (((r = i), (i = e[++n]), t < i)) break e;
              }
              s = e.length;
              break n;
            }
            if (t >= r) break t;
            {
              const o = e[1];
              t < o && ((n = 2), (r = o));
              for (let s = n - 2; ; ) {
                if (void 0 === r)
                  return (this._cachedIndex = 0), this.beforeStart_(0, t, i);
                if (n === s) break;
                if (((i = r), (r = e[--n - 1]), t >= r)) break e;
              }
              (s = n), (n = 0);
            }
          }
          for (; n < s; ) {
            const i = (n + s) >>> 1;
            t < e[i] ? (s = i) : (n = i + 1);
          }
          if (((i = e[n]), (r = e[n - 1]), void 0 === r))
            return (this._cachedIndex = 0), this.beforeStart_(0, t, i);
          if (void 0 === i)
            return (
              (n = e.length),
              (this._cachedIndex = n),
              this.afterEnd_(n - 1, r, t)
            );
        }
        (this._cachedIndex = n), this.intervalChanged_(n, r, i);
      }
      return this.interpolate_(n, r, t, i);
    }
    getSettings_() {
      return this.settings || this.DefaultSettings_;
    }
    copySampleValue_(t) {
      const e = this.resultBuffer,
        n = this.sampleValues,
        i = this.valueSize,
        r = t * i;
      for (let t = 0; t !== i; ++t) e[t] = n[r + t];
      return e;
    }
    interpolate_() {
      throw new Error("call to abstract method");
    }
    intervalChanged_() {}
  }
  (jl.prototype.beforeStart_ = jl.prototype.copySampleValue_),
    (jl.prototype.afterEnd_ = jl.prototype.copySampleValue_);
  class Zl extends jl {
    constructor(t, e, n, i) {
      super(t, e, n, i),
        (this._weightPrev = -0),
        (this._offsetPrev = -0),
        (this._weightNext = -0),
        (this._offsetNext = -0),
        (this.DefaultSettings_ = { endingStart: ie, endingEnd: ie });
    }
    intervalChanged_(t, e, n) {
      const i = this.parameterPositions;
      let r = t - 2,
        s = t + 1,
        o = i[r],
        a = i[s];
      if (void 0 === o)
        switch (this.getSettings_().endingStart) {
          case re:
            (r = t), (o = 2 * e - n);
            break;
          case se:
            (r = i.length - 2), (o = e + i[r] - i[r + 1]);
            break;
          default:
            (r = t), (o = n);
        }
      if (void 0 === a)
        switch (this.getSettings_().endingEnd) {
          case re:
            (s = t), (a = 2 * n - e);
            break;
          case se:
            (s = 1), (a = n + i[1] - i[0]);
            break;
          default:
            (s = t - 1), (a = e);
        }
      const l = 0.5 * (n - e),
        c = this.valueSize;
      (this._weightPrev = l / (e - o)),
        (this._weightNext = l / (a - n)),
        (this._offsetPrev = r * c),
        (this._offsetNext = s * c);
    }
    interpolate_(t, e, n, i) {
      const r = this.resultBuffer,
        s = this.sampleValues,
        o = this.valueSize,
        a = t * o,
        l = a - o,
        c = this._offsetPrev,
        h = this._offsetNext,
        u = this._weightPrev,
        d = this._weightNext,
        p = (n - e) / (i - e),
        m = p * p,
        f = m * p,
        g = -u * f + 2 * u * m - u * p,
        v = (1 + u) * f + (-1.5 - 2 * u) * m + (-0.5 + u) * p + 1,
        x = (-1 - d) * f + (1.5 + d) * m + 0.5 * p,
        _ = d * f - d * m;
      for (let t = 0; t !== o; ++t)
        r[t] = g * s[c + t] + v * s[l + t] + x * s[a + t] + _ * s[h + t];
      return r;
    }
  }
  class Yl extends jl {
    constructor(t, e, n, i) {
      super(t, e, n, i);
    }
    interpolate_(t, e, n, i) {
      const r = this.resultBuffer,
        s = this.sampleValues,
        o = this.valueSize,
        a = t * o,
        l = a - o,
        c = (n - e) / (i - e),
        h = 1 - c;
      for (let t = 0; t !== o; ++t) r[t] = s[l + t] * h + s[a + t] * c;
      return r;
    }
  }
  class Xl extends jl {
    constructor(t, e, n, i) {
      super(t, e, n, i);
    }
    interpolate_(t) {
      return this.copySampleValue_(t - 1);
    }
  }
  class ql {
    constructor(t, e, n, i) {
      if (void 0 === t)
        throw new Error("THREE.KeyframeTrack: track name is undefined");
      if (void 0 === e || 0 === e.length)
        throw new Error(
          "THREE.KeyframeTrack: no keyframes in track named " + t
        );
      (this.name = t),
        (this.times = Wl.convertArray(e, this.TimeBufferType)),
        (this.values = Wl.convertArray(n, this.ValueBufferType)),
        this.setInterpolation(i || this.DefaultInterpolation);
    }
    static toJSON(t) {
      const e = t.constructor;
      let n;
      if (e.toJSON !== this.toJSON) n = e.toJSON(t);
      else {
        n = {
          name: t.name,
          times: Wl.convertArray(t.times, Array),
          values: Wl.convertArray(t.values, Array),
        };
        const e = t.getInterpolation();
        e !== t.DefaultInterpolation && (n.interpolation = e);
      }
      return (n.type = t.ValueTypeName), n;
    }
    InterpolantFactoryMethodDiscrete(t) {
      return new Xl(this.times, this.values, this.getValueSize(), t);
    }
    InterpolantFactoryMethodLinear(t) {
      return new Yl(this.times, this.values, this.getValueSize(), t);
    }
    InterpolantFactoryMethodSmooth(t) {
      return new Zl(this.times, this.values, this.getValueSize(), t);
    }
    setInterpolation(t) {
      let e;
      switch (t) {
        case te:
          e = this.InterpolantFactoryMethodDiscrete;
          break;
        case ee:
          e = this.InterpolantFactoryMethodLinear;
          break;
        case ne:
          e = this.InterpolantFactoryMethodSmooth;
      }
      if (void 0 === e) {
        const e =
          "unsupported interpolation for " +
          this.ValueTypeName +
          " keyframe track named " +
          this.name;
        if (void 0 === this.createInterpolant) {
          if (t === this.DefaultInterpolation) throw new Error(e);
          this.setInterpolation(this.DefaultInterpolation);
        }
        return console.warn("THREE.KeyframeTrack:", e), this;
      }
      return (this.createInterpolant = e), this;
    }
    getInterpolation() {
      switch (this.createInterpolant) {
        case this.InterpolantFactoryMethodDiscrete:
          return te;
        case this.InterpolantFactoryMethodLinear:
          return ee;
        case this.InterpolantFactoryMethodSmooth:
          return ne;
      }
    }
    getValueSize() {
      return this.values.length / this.times.length;
    }
    shift(t) {
      if (0 !== t) {
        const e = this.times;
        for (let n = 0, i = e.length; n !== i; ++n) e[n] += t;
      }
      return this;
    }
    scale(t) {
      if (1 !== t) {
        const e = this.times;
        for (let n = 0, i = e.length; n !== i; ++n) e[n] *= t;
      }
      return this;
    }
    trim(t, e) {
      const n = this.times,
        i = n.length;
      let r = 0,
        s = i - 1;
      for (; r !== i && n[r] < t; ) ++r;
      for (; -1 !== s && n[s] > e; ) --s;
      if ((++s, 0 !== r || s !== i)) {
        r >= s && ((s = Math.max(s, 1)), (r = s - 1));
        const t = this.getValueSize();
        (this.times = Wl.arraySlice(n, r, s)),
          (this.values = Wl.arraySlice(this.values, r * t, s * t));
      }
      return this;
    }
    validate() {
      let t = !0;
      const e = this.getValueSize();
      e - Math.floor(e) != 0 &&
        (console.error(
          "THREE.KeyframeTrack: Invalid value size in track.",
          this
        ),
        (t = !1));
      const n = this.times,
        i = this.values,
        r = n.length;
      0 === r &&
        (console.error("THREE.KeyframeTrack: Track is empty.", this), (t = !1));
      let s = null;
      for (let e = 0; e !== r; e++) {
        const i = n[e];
        if ("number" == typeof i && isNaN(i)) {
          console.error(
            "THREE.KeyframeTrack: Time is not a valid number.",
            this,
            e,
            i
          ),
            (t = !1);
          break;
        }
        if (null !== s && s > i) {
          console.error(
            "THREE.KeyframeTrack: Out of order keys.",
            this,
            e,
            i,
            s
          ),
            (t = !1);
          break;
        }
        s = i;
      }
      if (void 0 !== i && Wl.isTypedArray(i))
        for (let e = 0, n = i.length; e !== n; ++e) {
          const n = i[e];
          if (isNaN(n)) {
            console.error(
              "THREE.KeyframeTrack: Value is not a valid number.",
              this,
              e,
              n
            ),
              (t = !1);
            break;
          }
        }
      return t;
    }
    optimize() {
      const t = Wl.arraySlice(this.times),
        e = Wl.arraySlice(this.values),
        n = this.getValueSize(),
        i = this.getInterpolation() === ne,
        r = t.length - 1;
      let s = 1;
      for (let o = 1; o < r; ++o) {
        let r = !1;
        const a = t[o];
        if (a !== t[o + 1] && (1 !== o || a !== t[0]))
          if (i) r = !0;
          else {
            const t = o * n,
              i = t - n,
              s = t + n;
            for (let o = 0; o !== n; ++o) {
              const n = e[t + o];
              if (n !== e[i + o] || n !== e[s + o]) {
                r = !0;
                break;
              }
            }
          }
        if (r) {
          if (o !== s) {
            t[s] = t[o];
            const i = o * n,
              r = s * n;
            for (let t = 0; t !== n; ++t) e[r + t] = e[i + t];
          }
          ++s;
        }
      }
      if (r > 0) {
        t[s] = t[r];
        for (let t = r * n, i = s * n, o = 0; o !== n; ++o) e[i + o] = e[t + o];
        ++s;
      }
      return (
        s !== t.length
          ? ((this.times = Wl.arraySlice(t, 0, s)),
            (this.values = Wl.arraySlice(e, 0, s * n)))
          : ((this.times = t), (this.values = e)),
        this
      );
    }
    clone() {
      const t = Wl.arraySlice(this.times, 0),
        e = Wl.arraySlice(this.values, 0),
        n = new (0, this.constructor)(this.name, t, e);
      return (n.createInterpolant = this.createInterpolant), n;
    }
  }
  (ql.prototype.TimeBufferType = Float32Array),
    (ql.prototype.ValueBufferType = Float32Array),
    (ql.prototype.DefaultInterpolation = ee);
  class Jl extends ql {}
  (Jl.prototype.ValueTypeName = "bool"),
    (Jl.prototype.ValueBufferType = Array),
    (Jl.prototype.DefaultInterpolation = te),
    (Jl.prototype.InterpolantFactoryMethodLinear = void 0),
    (Jl.prototype.InterpolantFactoryMethodSmooth = void 0);
  class Ql extends ql {}
  Ql.prototype.ValueTypeName = "color";
  class Kl extends ql {}
  Kl.prototype.ValueTypeName = "number";
  class $l extends jl {
    constructor(t, e, n, i) {
      super(t, e, n, i);
    }
    interpolate_(t, e, n, i) {
      const r = this.resultBuffer,
        s = this.sampleValues,
        o = this.valueSize,
        a = (n - e) / (i - e);
      let l = t * o;
      for (let t = l + o; l !== t; l += 4)
        Ne.slerpFlat(r, 0, s, l - o, s, l, a);
      return r;
    }
  }
  class tc extends ql {
    InterpolantFactoryMethodLinear(t) {
      return new $l(this.times, this.values, this.getValueSize(), t);
    }
  }
  (tc.prototype.ValueTypeName = "quaternion"),
    (tc.prototype.DefaultInterpolation = ee),
    (tc.prototype.InterpolantFactoryMethodSmooth = void 0);
  class ec extends ql {}
  (ec.prototype.ValueTypeName = "string"),
    (ec.prototype.ValueBufferType = Array),
    (ec.prototype.DefaultInterpolation = te),
    (ec.prototype.InterpolantFactoryMethodLinear = void 0),
    (ec.prototype.InterpolantFactoryMethodSmooth = void 0);
  class nc extends ql {}
  nc.prototype.ValueTypeName = "vector";
  class ic {
    constructor(t, e = -1, n, i = 2500) {
      (this.name = t),
        (this.tracks = n),
        (this.duration = e),
        (this.blendMode = i),
        (this.uuid = ve()),
        this.duration < 0 && this.resetDuration();
    }
    static parse(t) {
      const e = [],
        n = t.tracks,
        i = 1 / (t.fps || 1);
      for (let t = 0, r = n.length; t !== r; ++t) e.push(rc(n[t]).scale(i));
      const r = new this(t.name, t.duration, e, t.blendMode);
      return (r.uuid = t.uuid), r;
    }
    static toJSON(t) {
      const e = [],
        n = t.tracks,
        i = {
          name: t.name,
          duration: t.duration,
          tracks: e,
          uuid: t.uuid,
          blendMode: t.blendMode,
        };
      for (let t = 0, i = n.length; t !== i; ++t) e.push(ql.toJSON(n[t]));
      return i;
    }
    static CreateFromMorphTargetSequence(t, e, n, i) {
      const r = e.length,
        s = [];
      for (let t = 0; t < r; t++) {
        let o = [],
          a = [];
        o.push((t + r - 1) % r, t, (t + 1) % r), a.push(0, 1, 0);
        const l = Wl.getKeyframeOrder(o);
        (o = Wl.sortedArray(o, 1, l)),
          (a = Wl.sortedArray(a, 1, l)),
          i || 0 !== o[0] || (o.push(r), a.push(a[0])),
          s.push(
            new Kl(".morphTargetInfluences[" + e[t].name + "]", o, a).scale(
              1 / n
            )
          );
      }
      return new this(t, -1, s);
    }
    static findByName(t, e) {
      let n = t;
      if (!Array.isArray(t)) {
        const e = t;
        n = (e.geometry && e.geometry.animations) || e.animations;
      }
      for (let t = 0; t < n.length; t++) if (n[t].name === e) return n[t];
      return null;
    }
    static CreateClipsFromMorphTargetSequences(t, e, n) {
      const i = {},
        r = /^([\w-]*?)([\d]+)$/;
      for (let e = 0, n = t.length; e < n; e++) {
        const n = t[e],
          s = n.name.match(r);
        if (s && s.length > 1) {
          const t = s[1];
          let e = i[t];
          e || (i[t] = e = []), e.push(n);
        }
      }
      const s = [];
      for (const t in i)
        s.push(this.CreateFromMorphTargetSequence(t, i[t], e, n));
      return s;
    }
    static parseAnimation(t, e) {
      if (!t)
        return (
          console.error(
            "THREE.AnimationClip: No animation in JSONLoader data."
          ),
          null
        );
      const n = function (t, e, n, i, r) {
          if (0 !== n.length) {
            const s = [],
              o = [];
            Wl.flattenJSON(n, s, o, i),
              0 !== s.length && r.push(new t(e, s, o));
          }
        },
        i = [],
        r = t.name || "default",
        s = t.fps || 30,
        o = t.blendMode;
      let a = t.length || -1;
      const l = t.hierarchy || [];
      for (let t = 0; t < l.length; t++) {
        const r = l[t].keys;
        if (r && 0 !== r.length)
          if (r[0].morphTargets) {
            const t = {};
            let e;
            for (e = 0; e < r.length; e++)
              if (r[e].morphTargets)
                for (let n = 0; n < r[e].morphTargets.length; n++)
                  t[r[e].morphTargets[n]] = -1;
            for (const n in t) {
              const t = [],
                s = [];
              for (let i = 0; i !== r[e].morphTargets.length; ++i) {
                const i = r[e];
                t.push(i.time), s.push(i.morphTarget === n ? 1 : 0);
              }
              i.push(new Kl(".morphTargetInfluence[" + n + "]", t, s));
            }
            a = t.length * s;
          } else {
            const s = ".bones[" + e[t].name + "]";
            n(nc, s + ".position", r, "pos", i),
              n(tc, s + ".quaternion", r, "rot", i),
              n(nc, s + ".scale", r, "scl", i);
          }
      }
      if (0 === i.length) return null;
      return new this(r, a, i, o);
    }
    resetDuration() {
      let t = 0;
      for (let e = 0, n = this.tracks.length; e !== n; ++e) {
        const n = this.tracks[e];
        t = Math.max(t, n.times[n.times.length - 1]);
      }
      return (this.duration = t), this;
    }
    trim() {
      for (let t = 0; t < this.tracks.length; t++)
        this.tracks[t].trim(0, this.duration);
      return this;
    }
    validate() {
      let t = !0;
      for (let e = 0; e < this.tracks.length; e++)
        t = t && this.tracks[e].validate();
      return t;
    }
    optimize() {
      for (let t = 0; t < this.tracks.length; t++) this.tracks[t].optimize();
      return this;
    }
    clone() {
      const t = [];
      for (let e = 0; e < this.tracks.length; e++)
        t.push(this.tracks[e].clone());
      return new this.constructor(this.name, this.duration, t, this.blendMode);
    }
    toJSON() {
      return this.constructor.toJSON(this);
    }
  }
  function rc(t) {
    if (void 0 === t.type)
      throw new Error(
        "THREE.KeyframeTrack: track type undefined, can not parse"
      );
    const e = (function (t) {
      switch (t.toLowerCase()) {
        case "scalar":
        case "double":
        case "float":
        case "number":
        case "integer":
          return Kl;
        case "vector":
        case "vector2":
        case "vector3":
        case "vector4":
          return nc;
        case "color":
          return Ql;
        case "quaternion":
          return tc;
        case "bool":
        case "boolean":
          return Jl;
        case "string":
          return ec;
      }
      throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + t);
    })(t.type);
    if (void 0 === t.times) {
      const e = [],
        n = [];
      Wl.flattenJSON(t.keys, e, n, "value"), (t.times = e), (t.values = n);
    }
    return void 0 !== e.parse
      ? e.parse(t)
      : new e(t.name, t.times, t.values, t.interpolation);
  }
  const sc = {
    enabled: !1,
    files: {},
    add: function (t, e) {
      !1 !== this.enabled && (this.files[t] = e);
    },
    get: function (t) {
      if (!1 !== this.enabled) return this.files[t];
    },
    remove: function (t) {
      delete this.files[t];
    },
    clear: function () {
      this.files = {};
    },
  };
  const oc = new (class {
    constructor(t, e, n) {
      const i = this;
      let r,
        s = !1,
        o = 0,
        a = 0;
      const l = [];
      (this.onStart = void 0),
        (this.onLoad = t),
        (this.onProgress = e),
        (this.onError = n),
        (this.itemStart = function (t) {
          a++, !1 === s && void 0 !== i.onStart && i.onStart(t, o, a), (s = !0);
        }),
        (this.itemEnd = function (t) {
          o++,
            void 0 !== i.onProgress && i.onProgress(t, o, a),
            o === a && ((s = !1), void 0 !== i.onLoad && i.onLoad());
        }),
        (this.itemError = function (t) {
          void 0 !== i.onError && i.onError(t);
        }),
        (this.resolveURL = function (t) {
          return r ? r(t) : t;
        }),
        (this.setURLModifier = function (t) {
          return (r = t), this;
        }),
        (this.addHandler = function (t, e) {
          return l.push(t, e), this;
        }),
        (this.removeHandler = function (t) {
          const e = l.indexOf(t);
          return -1 !== e && l.splice(e, 2), this;
        }),
        (this.getHandler = function (t) {
          for (let e = 0, n = l.length; e < n; e += 2) {
            const n = l[e],
              i = l[e + 1];
            if ((n.global && (n.lastIndex = 0), n.test(t))) return i;
          }
          return null;
        });
    }
  })();
  class ac {
    constructor(t) {
      (this.manager = void 0 !== t ? t : oc),
        (this.crossOrigin = "anonymous"),
        (this.withCredentials = !1),
        (this.path = ""),
        (this.resourcePath = ""),
        (this.requestHeader = {});
    }
    load() {}
    loadAsync(t, e) {
      const n = this;
      return new Promise(function (i, r) {
        n.load(t, i, e, r);
      });
    }
    parse() {}
    setCrossOrigin(t) {
      return (this.crossOrigin = t), this;
    }
    setWithCredentials(t) {
      return (this.withCredentials = t), this;
    }
    setPath(t) {
      return (this.path = t), this;
    }
    setResourcePath(t) {
      return (this.resourcePath = t), this;
    }
    setRequestHeader(t) {
      return (this.requestHeader = t), this;
    }
  }
  const lc = {};
  class cc extends ac {
    constructor(t) {
      super(t);
    }
    load(t, e, n, i) {
      void 0 === t && (t = ""),
        void 0 !== this.path && (t = this.path + t),
        (t = this.manager.resolveURL(t));
      const r = sc.get(t);
      if (void 0 !== r)
        return (
          this.manager.itemStart(t),
          setTimeout(() => {
            e && e(r), this.manager.itemEnd(t);
          }, 0),
          r
        );
      if (void 0 !== lc[t])
        return void lc[t].push({ onLoad: e, onProgress: n, onError: i });
      (lc[t] = []), lc[t].push({ onLoad: e, onProgress: n, onError: i });
      const s = new Request(t, {
        headers: new Headers(this.requestHeader),
        credentials: this.withCredentials ? "include" : "same-origin",
      });
      fetch(s)
        .then((e) => {
          if (200 === e.status || 0 === e.status) {
            if (
              (0 === e.status &&
                console.warn("THREE.FileLoader: HTTP Status 0 received."),
              "undefined" == typeof ReadableStream ||
                void 0 === e.body.getReader)
            )
              return e;
            const n = lc[t],
              i = e.body.getReader(),
              r = e.headers.get("Content-Length"),
              s = r ? parseInt(r) : 0,
              o = 0 !== s;
            let a = 0;
            const l = new ReadableStream({
              start(t) {
                !(function e() {
                  i.read().then(({ done: i, value: r }) => {
                    if (i) t.close();
                    else {
                      a += r.byteLength;
                      const i = new ProgressEvent("progress", {
                        lengthComputable: o,
                        loaded: a,
                        total: s,
                      });
                      for (let t = 0, e = n.length; t < e; t++) {
                        const e = n[t];
                        e.onProgress && e.onProgress(i);
                      }
                      t.enqueue(r), e();
                    }
                  });
                })();
              },
            });
            return new Response(l);
          }
          throw Error(
            `fetch for "${e.url}" responded with ${e.status}: ${e.statusText}`
          );
        })
        .then((t) => {
          switch (this.responseType) {
            case "arraybuffer":
              return t.arrayBuffer();
            case "blob":
              return t.blob();
            case "document":
              return t
                .text()
                .then((t) => new DOMParser().parseFromString(t, this.mimeType));
            case "json":
              return t.json();
            default:
              return t.text();
          }
        })
        .then((e) => {
          sc.add(t, e);
          const n = lc[t];
          delete lc[t];
          for (let t = 0, i = n.length; t < i; t++) {
            const i = n[t];
            i.onLoad && i.onLoad(e);
          }
        })
        .catch((e) => {
          const n = lc[t];
          if (void 0 === n) throw (this.manager.itemError(t), e);
          delete lc[t];
          for (let t = 0, i = n.length; t < i; t++) {
            const i = n[t];
            i.onError && i.onError(e);
          }
          this.manager.itemError(t);
        })
        .finally(() => {
          this.manager.itemEnd(t);
        }),
        this.manager.itemStart(t);
    }
    setResponseType(t) {
      return (this.responseType = t), this;
    }
    setMimeType(t) {
      return (this.mimeType = t), this;
    }
  }
  class hc extends ac {
    constructor(t) {
      super(t);
    }
    load(t, e, n, i) {
      void 0 !== this.path && (t = this.path + t),
        (t = this.manager.resolveURL(t));
      const r = this,
        s = sc.get(t);
      if (void 0 !== s)
        return (
          r.manager.itemStart(t),
          setTimeout(function () {
            e && e(s), r.manager.itemEnd(t);
          }, 0),
          s
        );
      const o = Te("img");
      function a() {
        c(), sc.add(t, this), e && e(this), r.manager.itemEnd(t);
      }
      function l(e) {
        c(), i && i(e), r.manager.itemError(t), r.manager.itemEnd(t);
      }
      function c() {
        o.removeEventListener("load", a, !1),
          o.removeEventListener("error", l, !1);
      }
      return (
        o.addEventListener("load", a, !1),
        o.addEventListener("error", l, !1),
        "data:" !== t.substr(0, 5) &&
          void 0 !== this.crossOrigin &&
          (o.crossOrigin = this.crossOrigin),
        r.manager.itemStart(t),
        (o.src = t),
        o
      );
    }
  }
  class uc extends ac {
    constructor(t) {
      super(t);
    }
    load(t, e, n, i) {
      const r = new Xi(),
        s = new hc(this.manager);
      s.setCrossOrigin(this.crossOrigin), s.setPath(this.path);
      let o = 0;
      function a(n) {
        s.load(
          t[n],
          function (t) {
            (r.images[n] = t),
              o++,
              6 === o && ((r.needsUpdate = !0), e && e(r));
          },
          void 0,
          i
        );
      }
      for (let e = 0; e < t.length; ++e) a(e);
      return r;
    }
  }
  class dc extends ac {
    constructor(t) {
      super(t);
    }
    load(t, e, n, i) {
      const r = new Re(),
        s = new hc(this.manager);
      return (
        s.setCrossOrigin(this.crossOrigin),
        s.setPath(this.path),
        s.load(
          t,
          function (t) {
            (r.image = t), (r.needsUpdate = !0), void 0 !== e && e(r);
          },
          n,
          i
        ),
        r
      );
    }
  }
  class pc extends Fn {
    constructor(t, e = 1) {
      super(),
        (this.type = "Light"),
        (this.color = new ri(t)),
        (this.intensity = e);
    }
    dispose() {}
    copy(t) {
      return (
        super.copy(t),
        this.color.copy(t.color),
        (this.intensity = t.intensity),
        this
      );
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return (
        (e.object.color = this.color.getHex()),
        (e.object.intensity = this.intensity),
        void 0 !== this.groundColor &&
          (e.object.groundColor = this.groundColor.getHex()),
        void 0 !== this.distance && (e.object.distance = this.distance),
        void 0 !== this.angle && (e.object.angle = this.angle),
        void 0 !== this.decay && (e.object.decay = this.decay),
        void 0 !== this.penumbra && (e.object.penumbra = this.penumbra),
        void 0 !== this.shadow && (e.object.shadow = this.shadow.toJSON()),
        e
      );
    }
  }
  pc.prototype.isLight = !0;
  (class extends pc {
    constructor(t, e, n) {
      super(t, n),
        (this.type = "HemisphereLight"),
        this.position.copy(Fn.DefaultUp),
        this.updateMatrix(),
        (this.groundColor = new ri(e));
    }
    copy(t) {
      return (
        pc.prototype.copy.call(this, t),
        this.groundColor.copy(t.groundColor),
        this
      );
    }
  }).prototype.isHemisphereLight = !0;
  const mc = new pn(),
    fc = new ze(),
    gc = new ze();
  class vc {
    constructor(t) {
      (this.camera = t),
        (this.bias = 0),
        (this.normalBias = 0),
        (this.radius = 1),
        (this.blurSamples = 8),
        (this.mapSize = new we(512, 512)),
        (this.map = null),
        (this.mapPass = null),
        (this.matrix = new pn()),
        (this.autoUpdate = !0),
        (this.needsUpdate = !1),
        (this._frustum = new nr()),
        (this._frameExtents = new we(1, 1)),
        (this._viewportCount = 1),
        (this._viewports = [new Pe(0, 0, 1, 1)]);
    }
    getViewportCount() {
      return this._viewportCount;
    }
    getFrustum() {
      return this._frustum;
    }
    updateMatrices(t) {
      const e = this.camera,
        n = this.matrix;
      fc.setFromMatrixPosition(t.matrixWorld),
        e.position.copy(fc),
        gc.setFromMatrixPosition(t.target.matrixWorld),
        e.lookAt(gc),
        e.updateMatrixWorld(),
        mc.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse),
        this._frustum.setFromProjectionMatrix(mc),
        n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1),
        n.multiply(e.projectionMatrix),
        n.multiply(e.matrixWorldInverse);
    }
    getViewport(t) {
      return this._viewports[t];
    }
    getFrameExtents() {
      return this._frameExtents;
    }
    dispose() {
      this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
    }
    copy(t) {
      return (
        (this.camera = t.camera.clone()),
        (this.bias = t.bias),
        (this.radius = t.radius),
        this.mapSize.copy(t.mapSize),
        this
      );
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      const t = {};
      return (
        0 !== this.bias && (t.bias = this.bias),
        0 !== this.normalBias && (t.normalBias = this.normalBias),
        1 !== this.radius && (t.radius = this.radius),
        (512 === this.mapSize.x && 512 === this.mapSize.y) ||
          (t.mapSize = this.mapSize.toArray()),
        (t.camera = this.camera.toJSON(!1).object),
        delete t.camera.matrix,
        t
      );
    }
  }
  class xc extends vc {
    constructor() {
      super(new ji(50, 1, 0.5, 500)), (this.focus = 1);
    }
    updateMatrices(t) {
      const e = this.camera,
        n = 2 * ge * t.angle * this.focus,
        i = this.mapSize.width / this.mapSize.height,
        r = t.distance || e.far;
      (n === e.fov && i === e.aspect && r === e.far) ||
        ((e.fov = n), (e.aspect = i), (e.far = r), e.updateProjectionMatrix()),
        super.updateMatrices(t);
    }
    copy(t) {
      return super.copy(t), (this.focus = t.focus), this;
    }
  }
  xc.prototype.isSpotLightShadow = !0;
  (class extends pc {
    constructor(t, e, n = 0, i = Math.PI / 3, r = 0, s = 1) {
      super(t, e),
        (this.type = "SpotLight"),
        this.position.copy(Fn.DefaultUp),
        this.updateMatrix(),
        (this.target = new Fn()),
        (this.distance = n),
        (this.angle = i),
        (this.penumbra = r),
        (this.decay = s),
        (this.shadow = new xc());
    }
    get power() {
      return this.intensity * Math.PI;
    }
    set power(t) {
      this.intensity = t / Math.PI;
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(t) {
      return (
        super.copy(t),
        (this.distance = t.distance),
        (this.angle = t.angle),
        (this.penumbra = t.penumbra),
        (this.decay = t.decay),
        (this.target = t.target.clone()),
        (this.shadow = t.shadow.clone()),
        this
      );
    }
  }).prototype.isSpotLight = !0;
  const _c = new pn(),
    yc = new ze(),
    bc = new ze();
  class wc extends vc {
    constructor() {
      super(new ji(90, 1, 0.5, 500)),
        (this._frameExtents = new we(4, 2)),
        (this._viewportCount = 6),
        (this._viewports = [
          new Pe(2, 1, 1, 1),
          new Pe(0, 1, 1, 1),
          new Pe(3, 1, 1, 1),
          new Pe(1, 1, 1, 1),
          new Pe(3, 0, 1, 1),
          new Pe(1, 0, 1, 1),
        ]),
        (this._cubeDirections = [
          new ze(1, 0, 0),
          new ze(-1, 0, 0),
          new ze(0, 0, 1),
          new ze(0, 0, -1),
          new ze(0, 1, 0),
          new ze(0, -1, 0),
        ]),
        (this._cubeUps = [
          new ze(0, 1, 0),
          new ze(0, 1, 0),
          new ze(0, 1, 0),
          new ze(0, 1, 0),
          new ze(0, 0, 1),
          new ze(0, 0, -1),
        ]);
    }
    updateMatrices(t, e = 0) {
      const n = this.camera,
        i = this.matrix,
        r = t.distance || n.far;
      r !== n.far && ((n.far = r), n.updateProjectionMatrix()),
        yc.setFromMatrixPosition(t.matrixWorld),
        n.position.copy(yc),
        bc.copy(n.position),
        bc.add(this._cubeDirections[e]),
        n.up.copy(this._cubeUps[e]),
        n.lookAt(bc),
        n.updateMatrixWorld(),
        i.makeTranslation(-yc.x, -yc.y, -yc.z),
        _c.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse),
        this._frustum.setFromProjectionMatrix(_c);
    }
  }
  wc.prototype.isPointLightShadow = !0;
  (class extends pc {
    constructor(t, e, n = 0, i = 1) {
      super(t, e),
        (this.type = "PointLight"),
        (this.distance = n),
        (this.decay = i),
        (this.shadow = new wc());
    }
    get power() {
      return 4 * this.intensity * Math.PI;
    }
    set power(t) {
      this.intensity = t / (4 * Math.PI);
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(t) {
      return (
        super.copy(t),
        (this.distance = t.distance),
        (this.decay = t.decay),
        (this.shadow = t.shadow.clone()),
        this
      );
    }
  }).prototype.isPointLight = !0;
  class Mc extends vc {
    constructor() {
      super(new fr(-5, 5, 5, -5, 0.5, 500));
    }
  }
  Mc.prototype.isDirectionalLightShadow = !0;
  class Sc extends pc {
    constructor(t, e) {
      super(t, e),
        (this.type = "DirectionalLight"),
        this.position.copy(Fn.DefaultUp),
        this.updateMatrix(),
        (this.target = new Fn()),
        (this.shadow = new Mc());
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(t) {
      return (
        super.copy(t),
        (this.target = t.target.clone()),
        (this.shadow = t.shadow.clone()),
        this
      );
    }
  }
  Sc.prototype.isDirectionalLight = !0;
  class Tc extends pc {
    constructor(t, e) {
      super(t, e), (this.type = "AmbientLight");
    }
  }
  Tc.prototype.isAmbientLight = !0;
  (class extends pc {
    constructor(t, e, n = 10, i = 10) {
      super(t, e),
        (this.type = "RectAreaLight"),
        (this.width = n),
        (this.height = i);
    }
    get power() {
      return this.intensity * this.width * this.height * Math.PI;
    }
    set power(t) {
      this.intensity = t / (this.width * this.height * Math.PI);
    }
    copy(t) {
      return (
        super.copy(t), (this.width = t.width), (this.height = t.height), this
      );
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return (e.object.width = this.width), (e.object.height = this.height), e;
    }
  }).prototype.isRectAreaLight = !0;
  class Ec {
    constructor() {
      this.coefficients = [];
      for (let t = 0; t < 9; t++) this.coefficients.push(new ze());
    }
    set(t) {
      for (let e = 0; e < 9; e++) this.coefficients[e].copy(t[e]);
      return this;
    }
    zero() {
      for (let t = 0; t < 9; t++) this.coefficients[t].set(0, 0, 0);
      return this;
    }
    getAt(t, e) {
      const n = t.x,
        i = t.y,
        r = t.z,
        s = this.coefficients;
      return (
        e.copy(s[0]).multiplyScalar(0.282095),
        e.addScaledVector(s[1], 0.488603 * i),
        e.addScaledVector(s[2], 0.488603 * r),
        e.addScaledVector(s[3], 0.488603 * n),
        e.addScaledVector(s[4], n * i * 1.092548),
        e.addScaledVector(s[5], i * r * 1.092548),
        e.addScaledVector(s[6], 0.315392 * (3 * r * r - 1)),
        e.addScaledVector(s[7], n * r * 1.092548),
        e.addScaledVector(s[8], 0.546274 * (n * n - i * i)),
        e
      );
    }
    getIrradianceAt(t, e) {
      const n = t.x,
        i = t.y,
        r = t.z,
        s = this.coefficients;
      return (
        e.copy(s[0]).multiplyScalar(0.886227),
        e.addScaledVector(s[1], 1.023328 * i),
        e.addScaledVector(s[2], 1.023328 * r),
        e.addScaledVector(s[3], 1.023328 * n),
        e.addScaledVector(s[4], 0.858086 * n * i),
        e.addScaledVector(s[5], 0.858086 * i * r),
        e.addScaledVector(s[6], 0.743125 * r * r - 0.247708),
        e.addScaledVector(s[7], 0.858086 * n * r),
        e.addScaledVector(s[8], 0.429043 * (n * n - i * i)),
        e
      );
    }
    add(t) {
      for (let e = 0; e < 9; e++) this.coefficients[e].add(t.coefficients[e]);
      return this;
    }
    addScaledSH(t, e) {
      for (let n = 0; n < 9; n++)
        this.coefficients[n].addScaledVector(t.coefficients[n], e);
      return this;
    }
    scale(t) {
      for (let e = 0; e < 9; e++) this.coefficients[e].multiplyScalar(t);
      return this;
    }
    lerp(t, e) {
      for (let n = 0; n < 9; n++)
        this.coefficients[n].lerp(t.coefficients[n], e);
      return this;
    }
    equals(t) {
      for (let e = 0; e < 9; e++)
        if (!this.coefficients[e].equals(t.coefficients[e])) return !1;
      return !0;
    }
    copy(t) {
      return this.set(t.coefficients);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    fromArray(t, e = 0) {
      const n = this.coefficients;
      for (let i = 0; i < 9; i++) n[i].fromArray(t, e + 3 * i);
      return this;
    }
    toArray(t = [], e = 0) {
      const n = this.coefficients;
      for (let i = 0; i < 9; i++) n[i].toArray(t, e + 3 * i);
      return t;
    }
    static getBasisAt(t, e) {
      const n = t.x,
        i = t.y,
        r = t.z;
      (e[0] = 0.282095),
        (e[1] = 0.488603 * i),
        (e[2] = 0.488603 * r),
        (e[3] = 0.488603 * n),
        (e[4] = 1.092548 * n * i),
        (e[5] = 1.092548 * i * r),
        (e[6] = 0.315392 * (3 * r * r - 1)),
        (e[7] = 1.092548 * n * r),
        (e[8] = 0.546274 * (n * n - i * i));
    }
  }
  Ec.prototype.isSphericalHarmonics3 = !0;
  class Ac extends pc {
    constructor(t = new Ec(), e = 1) {
      super(void 0, e), (this.sh = t);
    }
    copy(t) {
      return super.copy(t), this.sh.copy(t.sh), this;
    }
    fromJSON(t) {
      return (this.intensity = t.intensity), this.sh.fromArray(t.sh), this;
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return (e.object.sh = this.sh.toArray()), e;
    }
  }
  Ac.prototype.isLightProbe = !0;
  class Lc {
    static decodeText(t) {
      if ("undefined" != typeof TextDecoder) return new TextDecoder().decode(t);
      let e = "";
      for (let n = 0, i = t.length; n < i; n++) e += String.fromCharCode(t[n]);
      try {
        return decodeURIComponent(escape(e));
      } catch (t) {
        return e;
      }
    }
    static extractUrlBase(t) {
      const e = t.lastIndexOf("/");
      return -1 === e ? "./" : t.substr(0, e + 1);
    }
    static resolveURL(t, e) {
      return "string" != typeof t || "" === t
        ? ""
        : (/^https?:\/\//i.test(e) &&
            /^\//.test(t) &&
            (e = e.replace(/(^https?:\/\/[^\/]+).*/i, "$1")),
          /^(https?:)?\/\//i.test(t) ||
          /^data:.*,.*$/i.test(t) ||
          /^blob:.*$/i.test(t)
            ? t
            : e + t);
    }
  }
  (class extends _i {
    constructor() {
      super(),
        (this.type = "InstancedBufferGeometry"),
        (this.instanceCount = 1 / 0);
    }
    copy(t) {
      return super.copy(t), (this.instanceCount = t.instanceCount), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      const t = super.toJSON(this);
      return (
        (t.instanceCount = this.instanceCount),
        (t.isInstancedBufferGeometry = !0),
        t
      );
    }
  }).prototype.isInstancedBufferGeometry = !0;
  let Rc;
  (class extends ac {
    constructor(t) {
      super(t),
        "undefined" == typeof createImageBitmap &&
          console.warn(
            "THREE.ImageBitmapLoader: createImageBitmap() not supported."
          ),
        "undefined" == typeof fetch &&
          console.warn("THREE.ImageBitmapLoader: fetch() not supported."),
        (this.options = { premultiplyAlpha: "none" });
    }
    setOptions(t) {
      return (this.options = t), this;
    }
    load(t, e, n, i) {
      void 0 === t && (t = ""),
        void 0 !== this.path && (t = this.path + t),
        (t = this.manager.resolveURL(t));
      const r = this,
        s = sc.get(t);
      if (void 0 !== s)
        return (
          r.manager.itemStart(t),
          setTimeout(function () {
            e && e(s), r.manager.itemEnd(t);
          }, 0),
          s
        );
      const o = {};
      (o.credentials =
        "anonymous" === this.crossOrigin ? "same-origin" : "include"),
        (o.headers = this.requestHeader),
        fetch(t, o)
          .then(function (t) {
            return t.blob();
          })
          .then(function (t) {
            return createImageBitmap(
              t,
              Object.assign(r.options, { colorSpaceConversion: "none" })
            );
          })
          .then(function (n) {
            sc.add(t, n), e && e(n), r.manager.itemEnd(t);
          })
          .catch(function (e) {
            i && i(e), r.manager.itemError(t), r.manager.itemEnd(t);
          }),
        r.manager.itemStart(t);
    }
  }).prototype.isImageBitmapLoader = !0;
  const Cc = function () {
    return (
      void 0 === Rc &&
        (Rc = new (window.AudioContext || window.webkitAudioContext)()),
      Rc
    );
  };
  class Pc extends ac {
    constructor(t) {
      super(t);
    }
    load(t, e, n, i) {
      const r = this,
        s = new cc(this.manager);
      s.setResponseType("arraybuffer"),
        s.setPath(this.path),
        s.setRequestHeader(this.requestHeader),
        s.setWithCredentials(this.withCredentials),
        s.load(
          t,
          function (n) {
            try {
              const t = n.slice(0);
              Cc().decodeAudioData(t, function (t) {
                e(t);
              });
            } catch (e) {
              i ? i(e) : console.error(e), r.manager.itemError(t);
            }
          },
          n,
          i
        );
    }
  }
  (class extends Ac {
    constructor(t, e, n = 1) {
      super(void 0, n);
      const i = new ri().set(t),
        r = new ri().set(e),
        s = new ze(i.r, i.g, i.b),
        o = new ze(r.r, r.g, r.b),
        a = Math.sqrt(Math.PI),
        l = a * Math.sqrt(0.75);
      this.sh.coefficients[0].copy(s).add(o).multiplyScalar(a),
        this.sh.coefficients[1].copy(s).sub(o).multiplyScalar(l);
    }
  }).prototype.isHemisphereLightProbe = !0;
  (class extends Ac {
    constructor(t, e = 1) {
      super(void 0, e);
      const n = new ri().set(t);
      this.sh.coefficients[0]
        .set(n.r, n.g, n.b)
        .multiplyScalar(2 * Math.sqrt(Math.PI));
    }
  }).prototype.isAmbientLightProbe = !0;
  class Dc {
    constructor(t, e, n) {
      let i, r, s;
      switch (((this.binding = t), (this.valueSize = n), e)) {
        case "quaternion":
          (i = this._slerp),
            (r = this._slerpAdditive),
            (s = this._setAdditiveIdentityQuaternion),
            (this.buffer = new Float64Array(6 * n)),
            (this._workIndex = 5);
          break;
        case "string":
        case "bool":
          (i = this._select),
            (r = this._select),
            (s = this._setAdditiveIdentityOther),
            (this.buffer = new Array(5 * n));
          break;
        default:
          (i = this._lerp),
            (r = this._lerpAdditive),
            (s = this._setAdditiveIdentityNumeric),
            (this.buffer = new Float64Array(5 * n));
      }
      (this._mixBufferRegion = i),
        (this._mixBufferRegionAdditive = r),
        (this._setIdentity = s),
        (this._origIndex = 3),
        (this._addIndex = 4),
        (this.cumulativeWeight = 0),
        (this.cumulativeWeightAdditive = 0),
        (this.useCount = 0),
        (this.referenceCount = 0);
    }
    accumulate(t, e) {
      const n = this.buffer,
        i = this.valueSize,
        r = t * i + i;
      let s = this.cumulativeWeight;
      if (0 === s) {
        for (let t = 0; t !== i; ++t) n[r + t] = n[t];
        s = e;
      } else {
        s += e;
        const t = e / s;
        this._mixBufferRegion(n, r, 0, t, i);
      }
      this.cumulativeWeight = s;
    }
    accumulateAdditive(t) {
      const e = this.buffer,
        n = this.valueSize,
        i = n * this._addIndex;
      0 === this.cumulativeWeightAdditive && this._setIdentity(),
        this._mixBufferRegionAdditive(e, i, 0, t, n),
        (this.cumulativeWeightAdditive += t);
    }
    apply(t) {
      const e = this.valueSize,
        n = this.buffer,
        i = t * e + e,
        r = this.cumulativeWeight,
        s = this.cumulativeWeightAdditive,
        o = this.binding;
      if (
        ((this.cumulativeWeight = 0),
        (this.cumulativeWeightAdditive = 0),
        r < 1)
      ) {
        const t = e * this._origIndex;
        this._mixBufferRegion(n, i, t, 1 - r, e);
      }
      s > 0 && this._mixBufferRegionAdditive(n, i, this._addIndex * e, 1, e);
      for (let t = e, r = e + e; t !== r; ++t)
        if (n[t] !== n[t + e]) {
          o.setValue(n, i);
          break;
        }
    }
    saveOriginalState() {
      const t = this.binding,
        e = this.buffer,
        n = this.valueSize,
        i = n * this._origIndex;
      t.getValue(e, i);
      for (let t = n, r = i; t !== r; ++t) e[t] = e[i + (t % n)];
      this._setIdentity(),
        (this.cumulativeWeight = 0),
        (this.cumulativeWeightAdditive = 0);
    }
    restoreOriginalState() {
      const t = 3 * this.valueSize;
      this.binding.setValue(this.buffer, t);
    }
    _setAdditiveIdentityNumeric() {
      const t = this._addIndex * this.valueSize,
        e = t + this.valueSize;
      for (let n = t; n < e; n++) this.buffer[n] = 0;
    }
    _setAdditiveIdentityQuaternion() {
      this._setAdditiveIdentityNumeric(),
        (this.buffer[this._addIndex * this.valueSize + 3] = 1);
    }
    _setAdditiveIdentityOther() {
      const t = this._origIndex * this.valueSize,
        e = this._addIndex * this.valueSize;
      for (let n = 0; n < this.valueSize; n++)
        this.buffer[e + n] = this.buffer[t + n];
    }
    _select(t, e, n, i, r) {
      if (i >= 0.5) for (let i = 0; i !== r; ++i) t[e + i] = t[n + i];
    }
    _slerp(t, e, n, i) {
      Ne.slerpFlat(t, e, t, e, t, n, i);
    }
    _slerpAdditive(t, e, n, i, r) {
      const s = this._workIndex * r;
      Ne.multiplyQuaternionsFlat(t, s, t, e, t, n),
        Ne.slerpFlat(t, e, t, e, t, s, i);
    }
    _lerp(t, e, n, i, r) {
      const s = 1 - i;
      for (let o = 0; o !== r; ++o) {
        const r = e + o;
        t[r] = t[r] * s + t[n + o] * i;
      }
    }
    _lerpAdditive(t, e, n, i, r) {
      for (let s = 0; s !== r; ++s) {
        const r = e + s;
        t[r] = t[r] + t[n + s] * i;
      }
    }
  }
  const Ic = "\\[\\]\\.:\\/",
    Nc = new RegExp("[" + Ic + "]", "g"),
    zc = "[^" + Ic + "]",
    kc = "[^" + Ic.replace("\\.", "") + "]",
    Oc = /((?:WC+[\/:])*)/.source.replace("WC", zc),
    Fc = /(WCOD+)?/.source.replace("WCOD", kc),
    Uc = /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", zc),
    Bc = /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", zc),
    Hc = new RegExp("^" + Oc + Fc + Uc + Bc + "$"),
    Gc = ["material", "materials", "bones"];
  class Vc {
    constructor(t, e, n) {
      (this.path = e),
        (this.parsedPath = n || Vc.parseTrackName(e)),
        (this.node = Vc.findNode(t, this.parsedPath.nodeName) || t),
        (this.rootNode = t),
        (this.getValue = this._getValue_unbound),
        (this.setValue = this._setValue_unbound);
    }
    static create(t, e, n) {
      return t && t.isAnimationObjectGroup
        ? new Vc.Composite(t, e, n)
        : new Vc(t, e, n);
    }
    static sanitizeNodeName(t) {
      return t.replace(/\s/g, "_").replace(Nc, "");
    }
    static parseTrackName(t) {
      const e = Hc.exec(t);
      if (!e) throw new Error("PropertyBinding: Cannot parse trackName: " + t);
      const n = {
          nodeName: e[2],
          objectName: e[3],
          objectIndex: e[4],
          propertyName: e[5],
          propertyIndex: e[6],
        },
        i = n.nodeName && n.nodeName.lastIndexOf(".");
      if (void 0 !== i && -1 !== i) {
        const t = n.nodeName.substring(i + 1);
        -1 !== Gc.indexOf(t) &&
          ((n.nodeName = n.nodeName.substring(0, i)), (n.objectName = t));
      }
      if (null === n.propertyName || 0 === n.propertyName.length)
        throw new Error(
          "PropertyBinding: can not parse propertyName from trackName: " + t
        );
      return n;
    }
    static findNode(t, e) {
      if (
        !e ||
        "" === e ||
        "." === e ||
        -1 === e ||
        e === t.name ||
        e === t.uuid
      )
        return t;
      if (t.skeleton) {
        const n = t.skeleton.getBoneByName(e);
        if (void 0 !== n) return n;
      }
      if (t.children) {
        const n = function (t) {
            for (let i = 0; i < t.length; i++) {
              const r = t[i];
              if (r.name === e || r.uuid === e) return r;
              const s = n(r.children);
              if (s) return s;
            }
            return null;
          },
          i = n(t.children);
        if (i) return i;
      }
      return null;
    }
    _getValue_unavailable() {}
    _setValue_unavailable() {}
    _getValue_direct(t, e) {
      t[e] = this.targetObject[this.propertyName];
    }
    _getValue_array(t, e) {
      const n = this.resolvedProperty;
      for (let i = 0, r = n.length; i !== r; ++i) t[e++] = n[i];
    }
    _getValue_arrayElement(t, e) {
      t[e] = this.resolvedProperty[this.propertyIndex];
    }
    _getValue_toArray(t, e) {
      this.resolvedProperty.toArray(t, e);
    }
    _setValue_direct(t, e) {
      this.targetObject[this.propertyName] = t[e];
    }
    _setValue_direct_setNeedsUpdate(t, e) {
      (this.targetObject[this.propertyName] = t[e]),
        (this.targetObject.needsUpdate = !0);
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(t, e) {
      (this.targetObject[this.propertyName] = t[e]),
        (this.targetObject.matrixWorldNeedsUpdate = !0);
    }
    _setValue_array(t, e) {
      const n = this.resolvedProperty;
      for (let i = 0, r = n.length; i !== r; ++i) n[i] = t[e++];
    }
    _setValue_array_setNeedsUpdate(t, e) {
      const n = this.resolvedProperty;
      for (let i = 0, r = n.length; i !== r; ++i) n[i] = t[e++];
      this.targetObject.needsUpdate = !0;
    }
    _setValue_array_setMatrixWorldNeedsUpdate(t, e) {
      const n = this.resolvedProperty;
      for (let i = 0, r = n.length; i !== r; ++i) n[i] = t[e++];
      this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    _setValue_arrayElement(t, e) {
      this.resolvedProperty[this.propertyIndex] = t[e];
    }
    _setValue_arrayElement_setNeedsUpdate(t, e) {
      (this.resolvedProperty[this.propertyIndex] = t[e]),
        (this.targetObject.needsUpdate = !0);
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(t, e) {
      (this.resolvedProperty[this.propertyIndex] = t[e]),
        (this.targetObject.matrixWorldNeedsUpdate = !0);
    }
    _setValue_fromArray(t, e) {
      this.resolvedProperty.fromArray(t, e);
    }
    _setValue_fromArray_setNeedsUpdate(t, e) {
      this.resolvedProperty.fromArray(t, e),
        (this.targetObject.needsUpdate = !0);
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(t, e) {
      this.resolvedProperty.fromArray(t, e),
        (this.targetObject.matrixWorldNeedsUpdate = !0);
    }
    _getValue_unbound(t, e) {
      this.bind(), this.getValue(t, e);
    }
    _setValue_unbound(t, e) {
      this.bind(), this.setValue(t, e);
    }
    bind() {
      let t = this.node;
      const e = this.parsedPath,
        n = e.objectName,
        i = e.propertyName;
      let r = e.propertyIndex;
      if (
        (t ||
          ((t = Vc.findNode(this.rootNode, e.nodeName) || this.rootNode),
          (this.node = t)),
        (this.getValue = this._getValue_unavailable),
        (this.setValue = this._setValue_unavailable),
        !t)
      )
        return void console.error(
          "THREE.PropertyBinding: Trying to update node for track: " +
            this.path +
            " but it wasn't found."
        );
      if (n) {
        let i = e.objectIndex;
        switch (n) {
          case "materials":
            if (!t.material)
              return void console.error(
                "THREE.PropertyBinding: Can not bind to material as node does not have a material.",
                this
              );
            if (!t.material.materials)
              return void console.error(
                "THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",
                this
              );
            t = t.material.materials;
            break;
          case "bones":
            if (!t.skeleton)
              return void console.error(
                "THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",
                this
              );
            t = t.skeleton.bones;
            for (let e = 0; e < t.length; e++)
              if (t[e].name === i) {
                i = e;
                break;
              }
            break;
          default:
            if (void 0 === t[n])
              return void console.error(
                "THREE.PropertyBinding: Can not bind to objectName of node undefined.",
                this
              );
            t = t[n];
        }
        if (void 0 !== i) {
          if (void 0 === t[i])
            return void console.error(
              "THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",
              this,
              t
            );
          t = t[i];
        }
      }
      const s = t[i];
      if (void 0 === s) {
        const n = e.nodeName;
        return void console.error(
          "THREE.PropertyBinding: Trying to update property for track: " +
            n +
            "." +
            i +
            " but it wasn't found.",
          t
        );
      }
      let o = this.Versioning.None;
      (this.targetObject = t),
        void 0 !== t.needsUpdate
          ? (o = this.Versioning.NeedsUpdate)
          : void 0 !== t.matrixWorldNeedsUpdate &&
            (o = this.Versioning.MatrixWorldNeedsUpdate);
      let a = this.BindingType.Direct;
      if (void 0 !== r) {
        if ("morphTargetInfluences" === i) {
          if (!t.geometry)
            return void console.error(
              "THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",
              this
            );
          if (!t.geometry.isBufferGeometry)
            return void console.error(
              "THREE.PropertyBinding: Can not bind to morphTargetInfluences on THREE.Geometry. Use THREE.BufferGeometry instead.",
              this
            );
          if (!t.geometry.morphAttributes)
            return void console.error(
              "THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",
              this
            );
          void 0 !== t.morphTargetDictionary[r] &&
            (r = t.morphTargetDictionary[r]);
        }
        (a = this.BindingType.ArrayElement),
          (this.resolvedProperty = s),
          (this.propertyIndex = r);
      } else void 0 !== s.fromArray && void 0 !== s.toArray ? ((a = this.BindingType.HasFromToArray), (this.resolvedProperty = s)) : Array.isArray(s) ? ((a = this.BindingType.EntireArray), (this.resolvedProperty = s)) : (this.propertyName = i);
      (this.getValue = this.GetterByBindingType[a]),
        (this.setValue = this.SetterByBindingTypeAndVersioning[a][o]);
    }
    unbind() {
      (this.node = null),
        (this.getValue = this._getValue_unbound),
        (this.setValue = this._setValue_unbound);
    }
  }
  (Vc.Composite = class {
    constructor(t, e, n) {
      const i = n || Vc.parseTrackName(e);
      (this._targetGroup = t), (this._bindings = t.subscribe_(e, i));
    }
    getValue(t, e) {
      this.bind();
      const n = this._targetGroup.nCachedObjects_,
        i = this._bindings[n];
      void 0 !== i && i.getValue(t, e);
    }
    setValue(t, e) {
      const n = this._bindings;
      for (
        let i = this._targetGroup.nCachedObjects_, r = n.length;
        i !== r;
        ++i
      )
        n[i].setValue(t, e);
    }
    bind() {
      const t = this._bindings;
      for (
        let e = this._targetGroup.nCachedObjects_, n = t.length;
        e !== n;
        ++e
      )
        t[e].bind();
    }
    unbind() {
      const t = this._bindings;
      for (
        let e = this._targetGroup.nCachedObjects_, n = t.length;
        e !== n;
        ++e
      )
        t[e].unbind();
    }
  }),
    (Vc.prototype.BindingType = {
      Direct: 0,
      EntireArray: 1,
      ArrayElement: 2,
      HasFromToArray: 3,
    }),
    (Vc.prototype.Versioning = {
      None: 0,
      NeedsUpdate: 1,
      MatrixWorldNeedsUpdate: 2,
    }),
    (Vc.prototype.GetterByBindingType = [
      Vc.prototype._getValue_direct,
      Vc.prototype._getValue_array,
      Vc.prototype._getValue_arrayElement,
      Vc.prototype._getValue_toArray,
    ]),
    (Vc.prototype.SetterByBindingTypeAndVersioning = [
      [
        Vc.prototype._setValue_direct,
        Vc.prototype._setValue_direct_setNeedsUpdate,
        Vc.prototype._setValue_direct_setMatrixWorldNeedsUpdate,
      ],
      [
        Vc.prototype._setValue_array,
        Vc.prototype._setValue_array_setNeedsUpdate,
        Vc.prototype._setValue_array_setMatrixWorldNeedsUpdate,
      ],
      [
        Vc.prototype._setValue_arrayElement,
        Vc.prototype._setValue_arrayElement_setNeedsUpdate,
        Vc.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate,
      ],
      [
        Vc.prototype._setValue_fromArray,
        Vc.prototype._setValue_fromArray_setNeedsUpdate,
        Vc.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate,
      ],
    ]);
  class Wc {
    constructor(t, e, n = null, i = e.blendMode) {
      (this._mixer = t),
        (this._clip = e),
        (this._localRoot = n),
        (this.blendMode = i);
      const r = e.tracks,
        s = r.length,
        o = new Array(s),
        a = { endingStart: ie, endingEnd: ie };
      for (let t = 0; t !== s; ++t) {
        const e = r[t].createInterpolant(null);
        (o[t] = e), (e.settings = a);
      }
      (this._interpolantSettings = a),
        (this._interpolants = o),
        (this._propertyBindings = new Array(s)),
        (this._cacheIndex = null),
        (this._byClipCacheIndex = null),
        (this._timeScaleInterpolant = null),
        (this._weightInterpolant = null),
        (this.loop = 2201),
        (this._loopCount = -1),
        (this._startTime = null),
        (this.time = 0),
        (this.timeScale = 1),
        (this._effectiveTimeScale = 1),
        (this.weight = 1),
        (this._effectiveWeight = 1),
        (this.repetitions = 1 / 0),
        (this.paused = !1),
        (this.enabled = !0),
        (this.clampWhenFinished = !1),
        (this.zeroSlopeAtStart = !0),
        (this.zeroSlopeAtEnd = !0);
    }
    play() {
      return this._mixer._activateAction(this), this;
    }
    stop() {
      return this._mixer._deactivateAction(this), this.reset();
    }
    reset() {
      return (
        (this.paused = !1),
        (this.enabled = !0),
        (this.time = 0),
        (this._loopCount = -1),
        (this._startTime = null),
        this.stopFading().stopWarping()
      );
    }
    isRunning() {
      return (
        this.enabled &&
        !this.paused &&
        0 !== this.timeScale &&
        null === this._startTime &&
        this._mixer._isActiveAction(this)
      );
    }
    isScheduled() {
      return this._mixer._isActiveAction(this);
    }
    startAt(t) {
      return (this._startTime = t), this;
    }
    setLoop(t, e) {
      return (this.loop = t), (this.repetitions = e), this;
    }
    setEffectiveWeight(t) {
      return (
        (this.weight = t),
        (this._effectiveWeight = this.enabled ? t : 0),
        this.stopFading()
      );
    }
    getEffectiveWeight() {
      return this._effectiveWeight;
    }
    fadeIn(t) {
      return this._scheduleFading(t, 0, 1);
    }
    fadeOut(t) {
      return this._scheduleFading(t, 1, 0);
    }
    crossFadeFrom(t, e, n) {
      if ((t.fadeOut(e), this.fadeIn(e), n)) {
        const n = this._clip.duration,
          i = t._clip.duration,
          r = i / n,
          s = n / i;
        t.warp(1, r, e), this.warp(s, 1, e);
      }
      return this;
    }
    crossFadeTo(t, e, n) {
      return t.crossFadeFrom(this, e, n);
    }
    stopFading() {
      const t = this._weightInterpolant;
      return (
        null !== t &&
          ((this._weightInterpolant = null),
          this._mixer._takeBackControlInterpolant(t)),
        this
      );
    }
    setEffectiveTimeScale(t) {
      return (
        (this.timeScale = t),
        (this._effectiveTimeScale = this.paused ? 0 : t),
        this.stopWarping()
      );
    }
    getEffectiveTimeScale() {
      return this._effectiveTimeScale;
    }
    setDuration(t) {
      return (this.timeScale = this._clip.duration / t), this.stopWarping();
    }
    syncWith(t) {
      return (
        (this.time = t.time), (this.timeScale = t.timeScale), this.stopWarping()
      );
    }
    halt(t) {
      return this.warp(this._effectiveTimeScale, 0, t);
    }
    warp(t, e, n) {
      const i = this._mixer,
        r = i.time,
        s = this.timeScale;
      let o = this._timeScaleInterpolant;
      null === o &&
        ((o = i._lendControlInterpolant()), (this._timeScaleInterpolant = o));
      const a = o.parameterPositions,
        l = o.sampleValues;
      return (a[0] = r), (a[1] = r + n), (l[0] = t / s), (l[1] = e / s), this;
    }
    stopWarping() {
      const t = this._timeScaleInterpolant;
      return (
        null !== t &&
          ((this._timeScaleInterpolant = null),
          this._mixer._takeBackControlInterpolant(t)),
        this
      );
    }
    getMixer() {
      return this._mixer;
    }
    getClip() {
      return this._clip;
    }
    getRoot() {
      return this._localRoot || this._mixer._root;
    }
    _update(t, e, n, i) {
      if (!this.enabled) return void this._updateWeight(t);
      const r = this._startTime;
      if (null !== r) {
        const i = (t - r) * n;
        if (i < 0 || 0 === n) return;
        (this._startTime = null), (e = n * i);
      }
      e *= this._updateTimeScale(t);
      const s = this._updateTime(e),
        o = this._updateWeight(t);
      if (o > 0) {
        const t = this._interpolants,
          e = this._propertyBindings;
        if (2501 === this.blendMode)
          for (let n = 0, i = t.length; n !== i; ++n)
            t[n].evaluate(s), e[n].accumulateAdditive(o);
        else
          for (let n = 0, r = t.length; n !== r; ++n)
            t[n].evaluate(s), e[n].accumulate(i, o);
      }
    }
    _updateWeight(t) {
      let e = 0;
      if (this.enabled) {
        e = this.weight;
        const n = this._weightInterpolant;
        if (null !== n) {
          const i = n.evaluate(t)[0];
          (e *= i),
            t > n.parameterPositions[1] &&
              (this.stopFading(), 0 === i && (this.enabled = !1));
        }
      }
      return (this._effectiveWeight = e), e;
    }
    _updateTimeScale(t) {
      let e = 0;
      if (!this.paused) {
        e = this.timeScale;
        const n = this._timeScaleInterpolant;
        if (null !== n) {
          (e *= n.evaluate(t)[0]),
            t > n.parameterPositions[1] &&
              (this.stopWarping(),
              0 === e ? (this.paused = !0) : (this.timeScale = e));
        }
      }
      return (this._effectiveTimeScale = e), e;
    }
    _updateTime(t) {
      const e = this._clip.duration,
        n = this.loop;
      let i = this.time + t,
        r = this._loopCount;
      const s = 2202 === n;
      if (0 === t) return -1 === r || !s || 1 & ~r ? i : e - i;
      if (2200 === n) {
        -1 === r && ((this._loopCount = 0), this._setEndings(!0, !0, !1));
        t: {
          if (i >= e) i = e;
          else {
            if (!(i < 0)) {
              this.time = i;
              break t;
            }
            i = 0;
          }
          this.clampWhenFinished ? (this.paused = !0) : (this.enabled = !1),
            (this.time = i),
            this._mixer.dispatchEvent({
              type: "finished",
              action: this,
              direction: t < 0 ? -1 : 1,
            });
        }
      } else {
        if (
          (-1 === r &&
            (t >= 0
              ? ((r = 0), this._setEndings(!0, 0 === this.repetitions, s))
              : this._setEndings(0 === this.repetitions, !0, s)),
          i >= e || i < 0)
        ) {
          const n = Math.floor(i / e);
          (i -= e * n), (r += Math.abs(n));
          const o = this.repetitions - r;
          if (o <= 0)
            this.clampWhenFinished ? (this.paused = !0) : (this.enabled = !1),
              (i = t > 0 ? e : 0),
              (this.time = i),
              this._mixer.dispatchEvent({
                type: "finished",
                action: this,
                direction: t > 0 ? 1 : -1,
              });
          else {
            if (1 === o) {
              const e = t < 0;
              this._setEndings(e, !e, s);
            } else this._setEndings(!1, !1, s);
            (this._loopCount = r),
              (this.time = i),
              this._mixer.dispatchEvent({
                type: "loop",
                action: this,
                loopDelta: n,
              });
          }
        } else this.time = i;
        if (s && !(1 & ~r)) return e - i;
      }
      return i;
    }
    _setEndings(t, e, n) {
      const i = this._interpolantSettings;
      n
        ? ((i.endingStart = re), (i.endingEnd = re))
        : ((i.endingStart = t ? (this.zeroSlopeAtStart ? re : ie) : se),
          (i.endingEnd = e ? (this.zeroSlopeAtEnd ? re : ie) : se));
    }
    _scheduleFading(t, e, n) {
      const i = this._mixer,
        r = i.time;
      let s = this._weightInterpolant;
      null === s &&
        ((s = i._lendControlInterpolant()), (this._weightInterpolant = s));
      const o = s.parameterPositions,
        a = s.sampleValues;
      return (o[0] = r), (a[0] = e), (o[1] = r + t), (a[1] = n), this;
    }
  }
  (class extends pe {
    constructor(t) {
      super(),
        (this._root = t),
        this._initMemoryManager(),
        (this._accuIndex = 0),
        (this.time = 0),
        (this.timeScale = 1);
    }
    _bindAction(t, e) {
      const n = t._localRoot || this._root,
        i = t._clip.tracks,
        r = i.length,
        s = t._propertyBindings,
        o = t._interpolants,
        a = n.uuid,
        l = this._bindingsByRootAndName;
      let c = l[a];
      void 0 === c && ((c = {}), (l[a] = c));
      for (let t = 0; t !== r; ++t) {
        const r = i[t],
          l = r.name;
        let h = c[l];
        if (void 0 !== h) s[t] = h;
        else {
          if (((h = s[t]), void 0 !== h)) {
            null === h._cacheIndex &&
              (++h.referenceCount, this._addInactiveBinding(h, a, l));
            continue;
          }
          const i = e && e._propertyBindings[t].binding.parsedPath;
          (h = new Dc(Vc.create(n, l, i), r.ValueTypeName, r.getValueSize())),
            ++h.referenceCount,
            this._addInactiveBinding(h, a, l),
            (s[t] = h);
        }
        o[t].resultBuffer = h.buffer;
      }
    }
    _activateAction(t) {
      if (!this._isActiveAction(t)) {
        if (null === t._cacheIndex) {
          const e = (t._localRoot || this._root).uuid,
            n = t._clip.uuid,
            i = this._actionsByClip[n];
          this._bindAction(t, i && i.knownActions[0]),
            this._addInactiveAction(t, n, e);
        }
        const e = t._propertyBindings;
        for (let t = 0, n = e.length; t !== n; ++t) {
          const n = e[t];
          0 == n.useCount++ && (this._lendBinding(n), n.saveOriginalState());
        }
        this._lendAction(t);
      }
    }
    _deactivateAction(t) {
      if (this._isActiveAction(t)) {
        const e = t._propertyBindings;
        for (let t = 0, n = e.length; t !== n; ++t) {
          const n = e[t];
          0 == --n.useCount &&
            (n.restoreOriginalState(), this._takeBackBinding(n));
        }
        this._takeBackAction(t);
      }
    }
    _initMemoryManager() {
      (this._actions = []),
        (this._nActiveActions = 0),
        (this._actionsByClip = {}),
        (this._bindings = []),
        (this._nActiveBindings = 0),
        (this._bindingsByRootAndName = {}),
        (this._controlInterpolants = []),
        (this._nActiveControlInterpolants = 0);
      const t = this;
      this.stats = {
        actions: {
          get total() {
            return t._actions.length;
          },
          get inUse() {
            return t._nActiveActions;
          },
        },
        bindings: {
          get total() {
            return t._bindings.length;
          },
          get inUse() {
            return t._nActiveBindings;
          },
        },
        controlInterpolants: {
          get total() {
            return t._controlInterpolants.length;
          },
          get inUse() {
            return t._nActiveControlInterpolants;
          },
        },
      };
    }
    _isActiveAction(t) {
      const e = t._cacheIndex;
      return null !== e && e < this._nActiveActions;
    }
    _addInactiveAction(t, e, n) {
      const i = this._actions,
        r = this._actionsByClip;
      let s = r[e];
      if (void 0 === s)
        (s = { knownActions: [t], actionByRoot: {} }),
          (t._byClipCacheIndex = 0),
          (r[e] = s);
      else {
        const e = s.knownActions;
        (t._byClipCacheIndex = e.length), e.push(t);
      }
      (t._cacheIndex = i.length), i.push(t), (s.actionByRoot[n] = t);
    }
    _removeInactiveAction(t) {
      const e = this._actions,
        n = e[e.length - 1],
        i = t._cacheIndex;
      (n._cacheIndex = i), (e[i] = n), e.pop(), (t._cacheIndex = null);
      const r = t._clip.uuid,
        s = this._actionsByClip,
        o = s[r],
        a = o.knownActions,
        l = a[a.length - 1],
        c = t._byClipCacheIndex;
      (l._byClipCacheIndex = c),
        (a[c] = l),
        a.pop(),
        (t._byClipCacheIndex = null);
      delete o.actionByRoot[(t._localRoot || this._root).uuid],
        0 === a.length && delete s[r],
        this._removeInactiveBindingsForAction(t);
    }
    _removeInactiveBindingsForAction(t) {
      const e = t._propertyBindings;
      for (let t = 0, n = e.length; t !== n; ++t) {
        const n = e[t];
        0 == --n.referenceCount && this._removeInactiveBinding(n);
      }
    }
    _lendAction(t) {
      const e = this._actions,
        n = t._cacheIndex,
        i = this._nActiveActions++,
        r = e[i];
      (t._cacheIndex = i), (e[i] = t), (r._cacheIndex = n), (e[n] = r);
    }
    _takeBackAction(t) {
      const e = this._actions,
        n = t._cacheIndex,
        i = --this._nActiveActions,
        r = e[i];
      (t._cacheIndex = i), (e[i] = t), (r._cacheIndex = n), (e[n] = r);
    }
    _addInactiveBinding(t, e, n) {
      const i = this._bindingsByRootAndName,
        r = this._bindings;
      let s = i[e];
      void 0 === s && ((s = {}), (i[e] = s)),
        (s[n] = t),
        (t._cacheIndex = r.length),
        r.push(t);
    }
    _removeInactiveBinding(t) {
      const e = this._bindings,
        n = t.binding,
        i = n.rootNode.uuid,
        r = n.path,
        s = this._bindingsByRootAndName,
        o = s[i],
        a = e[e.length - 1],
        l = t._cacheIndex;
      (a._cacheIndex = l),
        (e[l] = a),
        e.pop(),
        delete o[r],
        0 === Object.keys(o).length && delete s[i];
    }
    _lendBinding(t) {
      const e = this._bindings,
        n = t._cacheIndex,
        i = this._nActiveBindings++,
        r = e[i];
      (t._cacheIndex = i), (e[i] = t), (r._cacheIndex = n), (e[n] = r);
    }
    _takeBackBinding(t) {
      const e = this._bindings,
        n = t._cacheIndex,
        i = --this._nActiveBindings,
        r = e[i];
      (t._cacheIndex = i), (e[i] = t), (r._cacheIndex = n), (e[n] = r);
    }
    _lendControlInterpolant() {
      const t = this._controlInterpolants,
        e = this._nActiveControlInterpolants++;
      let n = t[e];
      return (
        void 0 === n &&
          ((n = new Yl(
            new Float32Array(2),
            new Float32Array(2),
            1,
            this._controlInterpolantsResultBuffer
          )),
          (n.__cacheIndex = e),
          (t[e] = n)),
        n
      );
    }
    _takeBackControlInterpolant(t) {
      const e = this._controlInterpolants,
        n = t.__cacheIndex,
        i = --this._nActiveControlInterpolants,
        r = e[i];
      (t.__cacheIndex = i), (e[i] = t), (r.__cacheIndex = n), (e[n] = r);
    }
    clipAction(t, e, n) {
      const i = e || this._root,
        r = i.uuid;
      let s = "string" == typeof t ? ic.findByName(i, t) : t;
      const o = null !== s ? s.uuid : t,
        a = this._actionsByClip[o];
      let l = null;
      if ((void 0 === n && (n = null !== s ? s.blendMode : oe), void 0 !== a)) {
        const t = a.actionByRoot[r];
        if (void 0 !== t && t.blendMode === n) return t;
        (l = a.knownActions[0]), null === s && (s = l._clip);
      }
      if (null === s) return null;
      const c = new Wc(this, s, e, n);
      return this._bindAction(c, l), this._addInactiveAction(c, o, r), c;
    }
    existingAction(t, e) {
      const n = e || this._root,
        i = n.uuid,
        r = "string" == typeof t ? ic.findByName(n, t) : t,
        s = r ? r.uuid : t,
        o = this._actionsByClip[s];
      return (void 0 !== o && o.actionByRoot[i]) || null;
    }
    stopAllAction() {
      const t = this._actions;
      for (let e = this._nActiveActions - 1; e >= 0; --e) t[e].stop();
      return this;
    }
    update(t) {
      t *= this.timeScale;
      const e = this._actions,
        n = this._nActiveActions,
        i = (this.time += t),
        r = Math.sign(t),
        s = (this._accuIndex ^= 1);
      for (let o = 0; o !== n; ++o) {
        e[o]._update(i, t, r, s);
      }
      const o = this._bindings,
        a = this._nActiveBindings;
      for (let t = 0; t !== a; ++t) o[t].apply(s);
      return this;
    }
    setTime(t) {
      this.time = 0;
      for (let t = 0; t < this._actions.length; t++) this._actions[t].time = 0;
      return this.update(t);
    }
    getRoot() {
      return this._root;
    }
    uncacheClip(t) {
      const e = this._actions,
        n = t.uuid,
        i = this._actionsByClip,
        r = i[n];
      if (void 0 !== r) {
        const t = r.knownActions;
        for (let n = 0, i = t.length; n !== i; ++n) {
          const i = t[n];
          this._deactivateAction(i);
          const r = i._cacheIndex,
            s = e[e.length - 1];
          (i._cacheIndex = null),
            (i._byClipCacheIndex = null),
            (s._cacheIndex = r),
            (e[r] = s),
            e.pop(),
            this._removeInactiveBindingsForAction(i);
        }
        delete i[n];
      }
    }
    uncacheRoot(t) {
      const e = t.uuid,
        n = this._actionsByClip;
      for (const t in n) {
        const i = n[t].actionByRoot[e];
        void 0 !== i &&
          (this._deactivateAction(i), this._removeInactiveAction(i));
      }
      const i = this._bindingsByRootAndName[e];
      if (void 0 !== i)
        for (const t in i) {
          const e = i[t];
          e.restoreOriginalState(), this._removeInactiveBinding(e);
        }
    }
    uncacheAction(t, e) {
      const n = this.existingAction(t, e);
      null !== n && (this._deactivateAction(n), this._removeInactiveAction(n));
    }
  }).prototype._controlInterpolantsResultBuffer = new Float32Array(1);
  (class extends Ko {
    constructor(t, e, n = 1) {
      super(t, e), (this.meshPerAttribute = n);
    }
    copy(t) {
      return super.copy(t), (this.meshPerAttribute = t.meshPerAttribute), this;
    }
    clone(t) {
      const e = super.clone(t);
      return (e.meshPerAttribute = this.meshPerAttribute), e;
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return (
        (e.isInstancedInterleavedBuffer = !0),
        (e.meshPerAttribute = this.meshPerAttribute),
        e
      );
    }
  }).prototype.isInstancedInterleavedBuffer = !0;
  class jc {
    constructor(t, e, n = 0, i = 1 / 0) {
      (this.ray = new dn(t, e)),
        (this.near = n),
        (this.far = i),
        (this.camera = null),
        (this.layers = new Sn()),
        (this.params = {
          Mesh: {},
          Line: { threshold: 1 },
          LOD: {},
          Points: { threshold: 1 },
          Sprite: {},
        });
    }
    set(t, e) {
      this.ray.set(t, e);
    }
    setFromCamera(t, e) {
      e && e.isPerspectiveCamera
        ? (this.ray.origin.setFromMatrixPosition(e.matrixWorld),
          this.ray.direction
            .set(t.x, t.y, 0.5)
            .unproject(e)
            .sub(this.ray.origin)
            .normalize(),
          (this.camera = e))
        : e && e.isOrthographicCamera
        ? (this.ray.origin
            .set(t.x, t.y, (e.near + e.far) / (e.near - e.far))
            .unproject(e),
          this.ray.direction.set(0, 0, -1).transformDirection(e.matrixWorld),
          (this.camera = e))
        : console.error("THREE.Raycaster: Unsupported camera type: " + e.type);
    }
    intersectObject(t, e = !0, n = []) {
      return Yc(t, this, n, e), n.sort(Zc), n;
    }
    intersectObjects(t, e = !0, n = []) {
      for (let i = 0, r = t.length; i < r; i++) Yc(t[i], this, n, e);
      return n.sort(Zc), n;
    }
  }
  function Zc(t, e) {
    return t.distance - e.distance;
  }
  function Yc(t, e, n, i) {
    if ((t.layers.test(e.layers) && t.raycast(e, n), !0 === i)) {
      const i = t.children;
      for (let t = 0, r = i.length; t < r; t++) Yc(i[t], e, n, !0);
    }
  }
  class Xc {
    constructor(t = 1, e = 0, n = 0) {
      return (this.radius = t), (this.phi = e), (this.theta = n), this;
    }
    set(t, e, n) {
      return (this.radius = t), (this.phi = e), (this.theta = n), this;
    }
    copy(t) {
      return (
        (this.radius = t.radius),
        (this.phi = t.phi),
        (this.theta = t.theta),
        this
      );
    }
    makeSafe() {
      const t = 1e-6;
      return (this.phi = Math.max(t, Math.min(Math.PI - t, this.phi))), this;
    }
    setFromVector3(t) {
      return this.setFromCartesianCoords(t.x, t.y, t.z);
    }
    setFromCartesianCoords(t, e, n) {
      return (
        (this.radius = Math.sqrt(t * t + e * e + n * n)),
        0 === this.radius
          ? ((this.theta = 0), (this.phi = 0))
          : ((this.theta = Math.atan2(t, n)),
            (this.phi = Math.acos(xe(e / this.radius, -1, 1)))),
        this
      );
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const qc = new ze(),
    Jc = new pn(),
    Qc = new pn();
  function Kc(t) {
    const e = [];
    t && t.isBone && e.push(t);
    for (let n = 0; n < t.children.length; n++)
      e.push.apply(e, Kc(t.children[n]));
    return e;
  }
  class $c extends ka {
    constructor(t = 10, e = 10, n = 4473924, i = 8947848) {
      (n = new ri(n)), (i = new ri(i));
      const r = e / 2,
        s = t / e,
        o = t / 2,
        a = [],
        l = [];
      for (let t = 0, c = 0, h = -o; t <= e; t++, h += s) {
        a.push(-o, 0, h, o, 0, h), a.push(h, 0, -o, h, 0, o);
        const e = t === r ? n : i;
        e.toArray(l, c),
          (c += 3),
          e.toArray(l, c),
          (c += 3),
          e.toArray(l, c),
          (c += 3),
          e.toArray(l, c),
          (c += 3);
      }
      const c = new _i();
      c.setAttribute("position", new ui(a, 3)),
        c.setAttribute("color", new ui(l, 3));
      super(c, new Aa({ vertexColors: !0, toneMapped: !1 })),
        (this.type = "GridHelper");
    }
  }
  const th = new Float32Array(1);
  new Int32Array(th.buffer),
    (Va.create = function (t, e) {
      return (
        console.log("THREE.Curve.create() has been deprecated"),
        (t.prototype = Object.create(Va.prototype)),
        (t.prototype.constructor = t),
        (t.prototype.getPoint = e),
        t
      );
    }),
    (cl.prototype.fromPoints = function (t) {
      return (
        console.warn(
          "THREE.Path: .fromPoints() has been renamed to .setFromPoints()."
        ),
        this.setFromPoints(t)
      );
    }),
    ($c.prototype.setColors = function () {
      console.error(
        "THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead."
      );
    }),
    (class extends ka {
      constructor(t) {
        const e = Kc(t),
          n = new _i(),
          i = [],
          r = [],
          s = new ri(0, 0, 1),
          o = new ri(0, 1, 0);
        for (let t = 0; t < e.length; t++) {
          const n = e[t];
          n.parent &&
            n.parent.isBone &&
            (i.push(0, 0, 0),
            i.push(0, 0, 0),
            r.push(s.r, s.g, s.b),
            r.push(o.r, o.g, o.b));
        }
        n.setAttribute("position", new ui(i, 3)),
          n.setAttribute("color", new ui(r, 3));
        super(
          n,
          new Aa({
            vertexColors: !0,
            depthTest: !1,
            depthWrite: !1,
            toneMapped: !1,
            transparent: !0,
          })
        ),
          (this.type = "SkeletonHelper"),
          (this.isSkeletonHelper = !0),
          (this.root = t),
          (this.bones = e),
          (this.matrix = t.matrixWorld),
          (this.matrixAutoUpdate = !1);
      }
      updateMatrixWorld(t) {
        const e = this.bones,
          n = this.geometry,
          i = n.getAttribute("position");
        Qc.copy(this.root.matrixWorld).invert();
        for (let t = 0, n = 0; t < e.length; t++) {
          const r = e[t];
          r.parent &&
            r.parent.isBone &&
            (Jc.multiplyMatrices(Qc, r.matrixWorld),
            qc.setFromMatrixPosition(Jc),
            i.setXYZ(n, qc.x, qc.y, qc.z),
            Jc.multiplyMatrices(Qc, r.parent.matrixWorld),
            qc.setFromMatrixPosition(Jc),
            i.setXYZ(n + 1, qc.x, qc.y, qc.z),
            (n += 2));
        }
        (n.getAttribute("position").needsUpdate = !0),
          super.updateMatrixWorld(t);
      }
    }.prototype.update = function () {
      console.error(
        "THREE.SkeletonHelper: update() no longer needs to be called."
      );
    }),
    (ac.prototype.extractUrlBase = function (t) {
      return (
        console.warn(
          "THREE.Loader: .extractUrlBase() has been deprecated. Use THREE.LoaderUtils.extractUrlBase() instead."
        ),
        Lc.extractUrlBase(t)
      );
    }),
    (ac.Handlers = {
      add: function () {
        console.error(
          "THREE.Loader: Handlers.add() has been removed. Use LoadingManager.addHandler() instead."
        );
      },
      get: function () {
        console.error(
          "THREE.Loader: Handlers.get() has been removed. Use LoadingManager.getHandler() instead."
        );
      },
    }),
    (Fe.prototype.center = function (t) {
      return (
        console.warn("THREE.Box3: .center() has been renamed to .getCenter()."),
        this.getCenter(t)
      );
    }),
    (Fe.prototype.empty = function () {
      return (
        console.warn("THREE.Box3: .empty() has been renamed to .isEmpty()."),
        this.isEmpty()
      );
    }),
    (Fe.prototype.isIntersectionBox = function (t) {
      return (
        console.warn(
          "THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox()."
        ),
        this.intersectsBox(t)
      );
    }),
    (Fe.prototype.isIntersectionSphere = function (t) {
      return (
        console.warn(
          "THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere()."
        ),
        this.intersectsSphere(t)
      );
    }),
    (Fe.prototype.size = function (t) {
      return (
        console.warn("THREE.Box3: .size() has been renamed to .getSize()."),
        this.getSize(t)
      );
    }),
    (rn.prototype.empty = function () {
      return (
        console.warn("THREE.Sphere: .empty() has been renamed to .isEmpty()."),
        this.isEmpty()
      );
    }),
    (nr.prototype.setFromMatrix = function (t) {
      return (
        console.warn(
          "THREE.Frustum: .setFromMatrix() has been renamed to .setFromProjectionMatrix()."
        ),
        this.setFromProjectionMatrix(t)
      );
    }),
    (Me.prototype.flattenToArrayOffset = function (t, e) {
      return (
        console.warn(
          "THREE.Matrix3: .flattenToArrayOffset() has been deprecated. Use .toArray() instead."
        ),
        this.toArray(t, e)
      );
    }),
    (Me.prototype.multiplyVector3 = function (t) {
      return (
        console.warn(
          "THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead."
        ),
        t.applyMatrix3(this)
      );
    }),
    (Me.prototype.multiplyVector3Array = function () {
      console.error("THREE.Matrix3: .multiplyVector3Array() has been removed.");
    }),
    (Me.prototype.applyToBufferAttribute = function (t) {
      return (
        console.warn(
          "THREE.Matrix3: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix3( matrix ) instead."
        ),
        t.applyMatrix3(this)
      );
    }),
    (Me.prototype.applyToVector3Array = function () {
      console.error("THREE.Matrix3: .applyToVector3Array() has been removed.");
    }),
    (Me.prototype.getInverse = function (t) {
      return (
        console.warn(
          "THREE.Matrix3: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead."
        ),
        this.copy(t).invert()
      );
    }),
    (pn.prototype.extractPosition = function (t) {
      return (
        console.warn(
          "THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."
        ),
        this.copyPosition(t)
      );
    }),
    (pn.prototype.flattenToArrayOffset = function (t, e) {
      return (
        console.warn(
          "THREE.Matrix4: .flattenToArrayOffset() has been deprecated. Use .toArray() instead."
        ),
        this.toArray(t, e)
      );
    }),
    (pn.prototype.getPosition = function () {
      return (
        console.warn(
          "THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead."
        ),
        new ze().setFromMatrixColumn(this, 3)
      );
    }),
    (pn.prototype.setRotationFromQuaternion = function (t) {
      return (
        console.warn(
          "THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion()."
        ),
        this.makeRotationFromQuaternion(t)
      );
    }),
    (pn.prototype.multiplyToArray = function () {
      console.warn("THREE.Matrix4: .multiplyToArray() has been removed.");
    }),
    (pn.prototype.multiplyVector3 = function (t) {
      return (
        console.warn(
          "THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) instead."
        ),
        t.applyMatrix4(this)
      );
    }),
    (pn.prototype.multiplyVector4 = function (t) {
      return (
        console.warn(
          "THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead."
        ),
        t.applyMatrix4(this)
      );
    }),
    (pn.prototype.multiplyVector3Array = function () {
      console.error("THREE.Matrix4: .multiplyVector3Array() has been removed.");
    }),
    (pn.prototype.rotateAxis = function (t) {
      console.warn(
        "THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead."
      ),
        t.transformDirection(this);
    }),
    (pn.prototype.crossVector = function (t) {
      return (
        console.warn(
          "THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead."
        ),
        t.applyMatrix4(this)
      );
    }),
    (pn.prototype.translate = function () {
      console.error("THREE.Matrix4: .translate() has been removed.");
    }),
    (pn.prototype.rotateX = function () {
      console.error("THREE.Matrix4: .rotateX() has been removed.");
    }),
    (pn.prototype.rotateY = function () {
      console.error("THREE.Matrix4: .rotateY() has been removed.");
    }),
    (pn.prototype.rotateZ = function () {
      console.error("THREE.Matrix4: .rotateZ() has been removed.");
    }),
    (pn.prototype.rotateByAxis = function () {
      console.error("THREE.Matrix4: .rotateByAxis() has been removed.");
    }),
    (pn.prototype.applyToBufferAttribute = function (t) {
      return (
        console.warn(
          "THREE.Matrix4: .applyToBufferAttribute() has been removed. Use attribute.applyMatrix4( matrix ) instead."
        ),
        t.applyMatrix4(this)
      );
    }),
    (pn.prototype.applyToVector3Array = function () {
      console.error("THREE.Matrix4: .applyToVector3Array() has been removed.");
    }),
    (pn.prototype.makeFrustum = function (t, e, n, i, r, s) {
      return (
        console.warn(
          "THREE.Matrix4: .makeFrustum() has been removed. Use .makePerspective( left, right, top, bottom, near, far ) instead."
        ),
        this.makePerspective(t, e, i, n, r, s)
      );
    }),
    (pn.prototype.getInverse = function (t) {
      return (
        console.warn(
          "THREE.Matrix4: .getInverse() has been removed. Use matrixInv.copy( matrix ).invert(); instead."
        ),
        this.copy(t).invert()
      );
    }),
    ($i.prototype.isIntersectionLine = function (t) {
      return (
        console.warn(
          "THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine()."
        ),
        this.intersectsLine(t)
      );
    }),
    (Ne.prototype.multiplyVector3 = function (t) {
      return (
        console.warn(
          "THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead."
        ),
        t.applyQuaternion(this)
      );
    }),
    (Ne.prototype.inverse = function () {
      return (
        console.warn(
          "THREE.Quaternion: .inverse() has been renamed to invert()."
        ),
        this.invert()
      );
    }),
    (dn.prototype.isIntersectionBox = function (t) {
      return (
        console.warn(
          "THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox()."
        ),
        this.intersectsBox(t)
      );
    }),
    (dn.prototype.isIntersectionPlane = function (t) {
      return (
        console.warn(
          "THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane()."
        ),
        this.intersectsPlane(t)
      );
    }),
    (dn.prototype.isIntersectionSphere = function (t) {
      return (
        console.warn(
          "THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere()."
        ),
        this.intersectsSphere(t)
      );
    }),
    (qn.prototype.area = function () {
      return (
        console.warn("THREE.Triangle: .area() has been renamed to .getArea()."),
        this.getArea()
      );
    }),
    (qn.prototype.barycoordFromPoint = function (t, e) {
      return (
        console.warn(
          "THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord()."
        ),
        this.getBarycoord(t, e)
      );
    }),
    (qn.prototype.midpoint = function (t) {
      return (
        console.warn(
          "THREE.Triangle: .midpoint() has been renamed to .getMidpoint()."
        ),
        this.getMidpoint(t)
      );
    }),
    (qn.prototypenormal = function (t) {
      return (
        console.warn(
          "THREE.Triangle: .normal() has been renamed to .getNormal()."
        ),
        this.getNormal(t)
      );
    }),
    (qn.prototype.plane = function (t) {
      return (
        console.warn(
          "THREE.Triangle: .plane() has been renamed to .getPlane()."
        ),
        this.getPlane(t)
      );
    }),
    (qn.barycoordFromPoint = function (t, e, n, i, r) {
      return (
        console.warn(
          "THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord()."
        ),
        qn.getBarycoord(t, e, n, i, r)
      );
    }),
    (qn.normal = function (t, e, n, i) {
      return (
        console.warn(
          "THREE.Triangle: .normal() has been renamed to .getNormal()."
        ),
        qn.getNormal(t, e, n, i)
      );
    }),
    (hl.prototype.extractAllPoints = function (t) {
      return (
        console.warn(
          "THREE.Shape: .extractAllPoints() has been removed. Use .extractPoints() instead."
        ),
        this.extractPoints(t)
      );
    }),
    (hl.prototype.extrude = function (t) {
      return (
        console.warn(
          "THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead."
        ),
        new Ul(this, t)
      );
    }),
    (hl.prototype.makeGeometry = function (t) {
      return (
        console.warn(
          "THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead."
        ),
        new Hl(this, t)
      );
    }),
    (we.prototype.fromAttribute = function (t, e, n) {
      return (
        console.warn(
          "THREE.Vector2: .fromAttribute() has been renamed to .fromBufferAttribute()."
        ),
        this.fromBufferAttribute(t, e, n)
      );
    }),
    (we.prototype.distanceToManhattan = function (t) {
      return (
        console.warn(
          "THREE.Vector2: .distanceToManhattan() has been renamed to .manhattanDistanceTo()."
        ),
        this.manhattanDistanceTo(t)
      );
    }),
    (we.prototype.lengthManhattan = function () {
      return (
        console.warn(
          "THREE.Vector2: .lengthManhattan() has been renamed to .manhattanLength()."
        ),
        this.manhattanLength()
      );
    }),
    (ze.prototype.setEulerFromRotationMatrix = function () {
      console.error(
        "THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead."
      );
    }),
    (ze.prototype.setEulerFromQuaternion = function () {
      console.error(
        "THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead."
      );
    }),
    (ze.prototype.getPositionFromMatrix = function (t) {
      return (
        console.warn(
          "THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition()."
        ),
        this.setFromMatrixPosition(t)
      );
    }),
    (ze.prototype.getScaleFromMatrix = function (t) {
      return (
        console.warn(
          "THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale()."
        ),
        this.setFromMatrixScale(t)
      );
    }),
    (ze.prototype.getColumnFromMatrix = function (t, e) {
      return (
        console.warn(
          "THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn()."
        ),
        this.setFromMatrixColumn(e, t)
      );
    }),
    (ze.prototype.applyProjection = function (t) {
      return (
        console.warn(
          "THREE.Vector3: .applyProjection() has been removed. Use .applyMatrix4( m ) instead."
        ),
        this.applyMatrix4(t)
      );
    }),
    (ze.prototype.fromAttribute = function (t, e, n) {
      return (
        console.warn(
          "THREE.Vector3: .fromAttribute() has been renamed to .fromBufferAttribute()."
        ),
        this.fromBufferAttribute(t, e, n)
      );
    }),
    (ze.prototype.distanceToManhattan = function (t) {
      return (
        console.warn(
          "THREE.Vector3: .distanceToManhattan() has been renamed to .manhattanDistanceTo()."
        ),
        this.manhattanDistanceTo(t)
      );
    }),
    (ze.prototype.lengthManhattan = function () {
      return (
        console.warn(
          "THREE.Vector3: .lengthManhattan() has been renamed to .manhattanLength()."
        ),
        this.manhattanLength()
      );
    }),
    (Pe.prototype.fromAttribute = function (t, e, n) {
      return (
        console.warn(
          "THREE.Vector4: .fromAttribute() has been renamed to .fromBufferAttribute()."
        ),
        this.fromBufferAttribute(t, e, n)
      );
    }),
    (Pe.prototype.lengthManhattan = function () {
      return (
        console.warn(
          "THREE.Vector4: .lengthManhattan() has been renamed to .manhattanLength()."
        ),
        this.manhattanLength()
      );
    }),
    (Fn.prototype.getChildByName = function (t) {
      return (
        console.warn(
          "THREE.Object3D: .getChildByName() has been renamed to .getObjectByName()."
        ),
        this.getObjectByName(t)
      );
    }),
    (Fn.prototype.renderDepth = function () {
      console.warn(
        "THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead."
      );
    }),
    (Fn.prototype.translate = function (t, e) {
      return (
        console.warn(
          "THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead."
        ),
        this.translateOnAxis(e, t)
      );
    }),
    (Fn.prototype.getWorldRotation = function () {
      console.error(
        "THREE.Object3D: .getWorldRotation() has been removed. Use THREE.Object3D.getWorldQuaternion( target ) instead."
      );
    }),
    (Fn.prototype.applyMatrix = function (t) {
      return (
        console.warn(
          "THREE.Object3D: .applyMatrix() has been renamed to .applyMatrix4()."
        ),
        this.applyMatrix4(t)
      );
    }),
    Object.defineProperties(Fn.prototype, {
      eulerOrder: {
        get: function () {
          return (
            console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."),
            this.rotation.order
          );
        },
        set: function (t) {
          console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."),
            (this.rotation.order = t);
        },
      },
      useQuaternion: {
        get: function () {
          console.warn(
            "THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default."
          );
        },
        set: function () {
          console.warn(
            "THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default."
          );
        },
      },
    }),
    (Oi.prototype.setDrawMode = function () {
      console.error(
        "THREE.Mesh: .setDrawMode() has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary."
      );
    }),
    Object.defineProperties(Oi.prototype, {
      drawMode: {
        get: function () {
          return (
            console.error(
              "THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode."
            ),
            0
          );
        },
        set: function () {
          console.error(
            "THREE.Mesh: .drawMode has been removed. The renderer now always assumes THREE.TrianglesDrawMode. Transform your geometry via BufferGeometryUtils.toTrianglesDrawMode() if necessary."
          );
        },
      },
    }),
    (ba.prototype.initBones = function () {
      console.error("THREE.SkinnedMesh: initBones() has been removed.");
    }),
    (ji.prototype.setLens = function (t, e) {
      console.warn(
        "THREE.PerspectiveCamera.setLens is deprecated. Use .setFocalLength and .filmGauge for a photographic setup."
      ),
        void 0 !== e && (this.filmGauge = e),
        this.setFocalLength(t);
    }),
    Object.defineProperties(pc.prototype, {
      onlyShadow: {
        set: function () {
          console.warn("THREE.Light: .onlyShadow has been removed.");
        },
      },
      shadowCameraFov: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowCameraFov is now .shadow.camera.fov."
          ),
            (this.shadow.camera.fov = t);
        },
      },
      shadowCameraLeft: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowCameraLeft is now .shadow.camera.left."
          ),
            (this.shadow.camera.left = t);
        },
      },
      shadowCameraRight: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowCameraRight is now .shadow.camera.right."
          ),
            (this.shadow.camera.right = t);
        },
      },
      shadowCameraTop: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowCameraTop is now .shadow.camera.top."
          ),
            (this.shadow.camera.top = t);
        },
      },
      shadowCameraBottom: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom."
          ),
            (this.shadow.camera.bottom = t);
        },
      },
      shadowCameraNear: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowCameraNear is now .shadow.camera.near."
          ),
            (this.shadow.camera.near = t);
        },
      },
      shadowCameraFar: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowCameraFar is now .shadow.camera.far."
          ),
            (this.shadow.camera.far = t);
        },
      },
      shadowCameraVisible: {
        set: function () {
          console.warn(
            "THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow.camera ) instead."
          );
        },
      },
      shadowBias: {
        set: function (t) {
          console.warn("THREE.Light: .shadowBias is now .shadow.bias."),
            (this.shadow.bias = t);
        },
      },
      shadowDarkness: {
        set: function () {
          console.warn("THREE.Light: .shadowDarkness has been removed.");
        },
      },
      shadowMapWidth: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowMapWidth is now .shadow.mapSize.width."
          ),
            (this.shadow.mapSize.width = t);
        },
      },
      shadowMapHeight: {
        set: function (t) {
          console.warn(
            "THREE.Light: .shadowMapHeight is now .shadow.mapSize.height."
          ),
            (this.shadow.mapSize.height = t);
        },
      },
    }),
    Object.defineProperties(li.prototype, {
      length: {
        get: function () {
          return (
            console.warn(
              "THREE.BufferAttribute: .length has been deprecated. Use .count instead."
            ),
            this.array.length
          );
        },
      },
      dynamic: {
        get: function () {
          return (
            console.warn(
              "THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead."
            ),
            this.usage === ue
          );
        },
        set: function () {
          console.warn(
            "THREE.BufferAttribute: .dynamic has been deprecated. Use .usage instead."
          ),
            this.setUsage(ue);
        },
      },
    }),
    (li.prototype.setDynamic = function (t) {
      return (
        console.warn(
          "THREE.BufferAttribute: .setDynamic() has been deprecated. Use .setUsage() instead."
        ),
        this.setUsage(!0 === t ? ue : he),
        this
      );
    }),
    (li.prototype.copyIndicesArray = function () {
      console.error(
        "THREE.BufferAttribute: .copyIndicesArray() has been removed."
      );
    }),
    (li.prototype.setArray = function () {
      console.error(
        "THREE.BufferAttribute: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers"
      );
    }),
    (_i.prototype.addIndex = function (t) {
      console.warn(
        "THREE.BufferGeometry: .addIndex() has been renamed to .setIndex()."
      ),
        this.setIndex(t);
    }),
    (_i.prototype.addAttribute = function (t, e) {
      return (
        console.warn(
          "THREE.BufferGeometry: .addAttribute() has been renamed to .setAttribute()."
        ),
        (e && e.isBufferAttribute) || (e && e.isInterleavedBufferAttribute)
          ? "index" === t
            ? (console.warn(
                "THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute."
              ),
              this.setIndex(e),
              this)
            : this.setAttribute(t, e)
          : (console.warn(
              "THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."
            ),
            this.setAttribute(t, new li(arguments[1], arguments[2])))
      );
    }),
    (_i.prototype.addDrawCall = function (t, e, n) {
      void 0 !== n &&
        console.warn(
          "THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset."
        ),
        console.warn(
          "THREE.BufferGeometry: .addDrawCall() is now .addGroup()."
        ),
        this.addGroup(t, e);
    }),
    (_i.prototype.clearDrawCalls = function () {
      console.warn(
        "THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups()."
      ),
        this.clearGroups();
    }),
    (_i.prototype.computeOffsets = function () {
      console.warn("THREE.BufferGeometry: .computeOffsets() has been removed.");
    }),
    (_i.prototype.removeAttribute = function (t) {
      return (
        console.warn(
          "THREE.BufferGeometry: .removeAttribute() has been renamed to .deleteAttribute()."
        ),
        this.deleteAttribute(t)
      );
    }),
    (_i.prototype.applyMatrix = function (t) {
      return (
        console.warn(
          "THREE.BufferGeometry: .applyMatrix() has been renamed to .applyMatrix4()."
        ),
        this.applyMatrix4(t)
      );
    }),
    Object.defineProperties(_i.prototype, {
      drawcalls: {
        get: function () {
          return (
            console.error(
              "THREE.BufferGeometry: .drawcalls has been renamed to .groups."
            ),
            this.groups
          );
        },
      },
      offsets: {
        get: function () {
          return (
            console.warn(
              "THREE.BufferGeometry: .offsets has been renamed to .groups."
            ),
            this.groups
          );
        },
      },
    }),
    (Ko.prototype.setDynamic = function (t) {
      return (
        console.warn(
          "THREE.InterleavedBuffer: .setDynamic() has been deprecated. Use .setUsage() instead."
        ),
        this.setUsage(!0 === t ? ue : he),
        this
      );
    }),
    (Ko.prototype.setArray = function () {
      console.error(
        "THREE.InterleavedBuffer: .setArray has been removed. Use BufferGeometry .setAttribute to replace/resize attribute buffers"
      );
    }),
    (Ul.prototype.getArrays = function () {
      console.error("THREE.ExtrudeGeometry: .getArrays() has been removed.");
    }),
    (Ul.prototype.addShapeList = function () {
      console.error("THREE.ExtrudeGeometry: .addShapeList() has been removed.");
    }),
    (Ul.prototype.addShape = function () {
      console.error("THREE.ExtrudeGeometry: .addShape() has been removed.");
    }),
    (Qo.prototype.dispose = function () {
      console.error("THREE.Scene: .dispose() has been removed.");
    }),
    Object.defineProperties(Qn.prototype, {
      wrapAround: {
        get: function () {
          console.warn("THREE.Material: .wrapAround has been removed.");
        },
        set: function () {
          console.warn("THREE.Material: .wrapAround has been removed.");
        },
      },
      overdraw: {
        get: function () {
          console.warn("THREE.Material: .overdraw has been removed.");
        },
        set: function () {
          console.warn("THREE.Material: .overdraw has been removed.");
        },
      },
      wrapRGB: {
        get: function () {
          return (
            console.warn("THREE.Material: .wrapRGB has been removed."), new ri()
          );
        },
      },
      shading: {
        get: function () {
          console.error(
            "THREE." +
              this.type +
              ": .shading has been removed. Use the boolean .flatShading instead."
          );
        },
        set: function (t) {
          console.warn(
            "THREE." +
              this.type +
              ": .shading has been removed. Use the boolean .flatShading instead."
          ),
            (this.flatShading = 1 === t);
        },
      },
      stencilMask: {
        get: function () {
          return (
            console.warn(
              "THREE." +
                this.type +
                ": .stencilMask has been removed. Use .stencilFuncMask instead."
            ),
            this.stencilFuncMask
          );
        },
        set: function (t) {
          console.warn(
            "THREE." +
              this.type +
              ": .stencilMask has been removed. Use .stencilFuncMask instead."
          ),
            (this.stencilFuncMask = t);
        },
      },
      vertexTangents: {
        get: function () {
          console.warn(
            "THREE." + this.type + ": .vertexTangents has been removed."
          );
        },
        set: function () {
          console.warn(
            "THREE." + this.type + ": .vertexTangents has been removed."
          );
        },
      },
    }),
    Object.defineProperties(Vi.prototype, {
      derivatives: {
        get: function () {
          return (
            console.warn(
              "THREE.ShaderMaterial: .derivatives has been moved to .extensions.derivatives."
            ),
            this.extensions.derivatives
          );
        },
        set: function (t) {
          console.warn(
            "THREE. ShaderMaterial: .derivatives has been moved to .extensions.derivatives."
          ),
            (this.extensions.derivatives = t);
        },
      },
    }),
    (Jo.prototype.clearTarget = function (t, e, n, i) {
      console.warn(
        "THREE.WebGLRenderer: .clearTarget() has been deprecated. Use .setRenderTarget() and .clear() instead."
      ),
        this.setRenderTarget(t),
        this.clear(e, n, i);
    }),
    (Jo.prototype.animate = function (t) {
      console.warn(
        "THREE.WebGLRenderer: .animate() is now .setAnimationLoop()."
      ),
        this.setAnimationLoop(t);
    }),
    (Jo.prototype.getCurrentRenderTarget = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .getCurrentRenderTarget() is now .getRenderTarget()."
        ),
        this.getRenderTarget()
      );
    }),
    (Jo.prototype.getMaxAnisotropy = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .getMaxAnisotropy() is now .capabilities.getMaxAnisotropy()."
        ),
        this.capabilities.getMaxAnisotropy()
      );
    }),
    (Jo.prototype.getPrecision = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .getPrecision() is now .capabilities.precision."
        ),
        this.capabilities.precision
      );
    }),
    (Jo.prototype.resetGLState = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .resetGLState() is now .state.reset()."
        ),
        this.state.reset()
      );
    }),
    (Jo.prototype.supportsFloatTextures = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( 'OES_texture_float' )."
        ),
        this.extensions.get("OES_texture_float")
      );
    }),
    (Jo.prototype.supportsHalfFloatTextures = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( 'OES_texture_half_float' )."
        ),
        this.extensions.get("OES_texture_half_float")
      );
    }),
    (Jo.prototype.supportsStandardDerivatives = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( 'OES_standard_derivatives' )."
        ),
        this.extensions.get("OES_standard_derivatives")
      );
    }),
    (Jo.prototype.supportsCompressedTextureS3TC = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( 'WEBGL_compressed_texture_s3tc' )."
        ),
        this.extensions.get("WEBGL_compressed_texture_s3tc")
      );
    }),
    (Jo.prototype.supportsCompressedTexturePVRTC = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( 'WEBGL_compressed_texture_pvrtc' )."
        ),
        this.extensions.get("WEBGL_compressed_texture_pvrtc")
      );
    }),
    (Jo.prototype.supportsBlendMinMax = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( 'EXT_blend_minmax' )."
        ),
        this.extensions.get("EXT_blend_minmax")
      );
    }),
    (Jo.prototype.supportsVertexTextures = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .supportsVertexTextures() is now .capabilities.vertexTextures."
        ),
        this.capabilities.vertexTextures
      );
    }),
    (Jo.prototype.supportsInstancedArrays = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( 'ANGLE_instanced_arrays' )."
        ),
        this.extensions.get("ANGLE_instanced_arrays")
      );
    }),
    (Jo.prototype.enableScissorTest = function (t) {
      console.warn(
        "THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest()."
      ),
        this.setScissorTest(t);
    }),
    (Jo.prototype.initMaterial = function () {
      console.warn("THREE.WebGLRenderer: .initMaterial() has been removed.");
    }),
    (Jo.prototype.addPrePlugin = function () {
      console.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.");
    }),
    (Jo.prototype.addPostPlugin = function () {
      console.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.");
    }),
    (Jo.prototype.updateShadowMap = function () {
      console.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.");
    }),
    (Jo.prototype.setFaceCulling = function () {
      console.warn("THREE.WebGLRenderer: .setFaceCulling() has been removed.");
    }),
    (Jo.prototype.allocTextureUnit = function () {
      console.warn(
        "THREE.WebGLRenderer: .allocTextureUnit() has been removed."
      );
    }),
    (Jo.prototype.setTexture = function () {
      console.warn("THREE.WebGLRenderer: .setTexture() has been removed.");
    }),
    (Jo.prototype.setTexture2D = function () {
      console.warn("THREE.WebGLRenderer: .setTexture2D() has been removed.");
    }),
    (Jo.prototype.setTextureCube = function () {
      console.warn("THREE.WebGLRenderer: .setTextureCube() has been removed.");
    }),
    (Jo.prototype.getActiveMipMapLevel = function () {
      return (
        console.warn(
          "THREE.WebGLRenderer: .getActiveMipMapLevel() is now .getActiveMipmapLevel()."
        ),
        this.getActiveMipmapLevel()
      );
    }),
    Object.defineProperties(Jo.prototype, {
      shadowMapEnabled: {
        get: function () {
          return this.shadowMap.enabled;
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled."
          ),
            (this.shadowMap.enabled = t);
        },
      },
      shadowMapType: {
        get: function () {
          return this.shadowMap.type;
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type."
          ),
            (this.shadowMap.type = t);
        },
      },
      shadowMapCullFace: {
        get: function () {
          console.warn(
            "THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead."
          );
        },
        set: function () {
          console.warn(
            "THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead."
          );
        },
      },
      context: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderer: .context has been removed. Use .getContext() instead."
            ),
            this.getContext()
          );
        },
      },
      vr: {
        get: function () {
          return (
            console.warn("THREE.WebGLRenderer: .vr has been renamed to .xr"),
            this.xr
          );
        },
      },
      gammaInput: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead."
            ),
            !1
          );
        },
        set: function () {
          console.warn(
            "THREE.WebGLRenderer: .gammaInput has been removed. Set the encoding for textures via Texture.encoding instead."
          );
        },
      },
      gammaOutput: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead."
            ),
            !1
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderer: .gammaOutput has been removed. Set WebGLRenderer.outputEncoding instead."
          ),
            (this.outputEncoding = !0 === t ? le : ae);
        },
      },
      toneMappingWhitePoint: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderer: .toneMappingWhitePoint has been removed."
            ),
            1
          );
        },
        set: function () {
          console.warn(
            "THREE.WebGLRenderer: .toneMappingWhitePoint has been removed."
          );
        },
      },
      gammaFactor: {
        get: function () {
          return (
            console.warn("THREE.WebGLRenderer: .gammaFactor has been removed."),
            2
          );
        },
        set: function () {
          console.warn("THREE.WebGLRenderer: .gammaFactor has been removed.");
        },
      },
    }),
    Object.defineProperties(Uo.prototype, {
      cullFace: {
        get: function () {
          console.warn(
            "THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead."
          );
        },
        set: function () {
          console.warn(
            "THREE.WebGLRenderer: .shadowMap.cullFace has been removed. Set Material.shadowSide instead."
          );
        },
      },
      renderReverseSided: {
        get: function () {
          console.warn(
            "THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead."
          );
        },
        set: function () {
          console.warn(
            "THREE.WebGLRenderer: .shadowMap.renderReverseSided has been removed. Set Material.shadowSide instead."
          );
        },
      },
      renderSingleSided: {
        get: function () {
          console.warn(
            "THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead."
          );
        },
        set: function () {
          console.warn(
            "THREE.WebGLRenderer: .shadowMap.renderSingleSided has been removed. Set Material.shadowSide instead."
          );
        },
      },
    }),
    Object.defineProperties(De.prototype, {
      wrapS: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."
            ),
            this.texture.wrapS
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."
          ),
            (this.texture.wrapS = t);
        },
      },
      wrapT: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."
            ),
            this.texture.wrapT
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."
          ),
            (this.texture.wrapT = t);
        },
      },
      magFilter: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."
            ),
            this.texture.magFilter
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."
          ),
            (this.texture.magFilter = t);
        },
      },
      minFilter: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."
            ),
            this.texture.minFilter
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."
          ),
            (this.texture.minFilter = t);
        },
      },
      anisotropy: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."
            ),
            this.texture.anisotropy
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."
          ),
            (this.texture.anisotropy = t);
        },
      },
      offset: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .offset is now .texture.offset."
            ),
            this.texture.offset
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .offset is now .texture.offset."
          ),
            (this.texture.offset = t);
        },
      },
      repeat: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .repeat is now .texture.repeat."
            ),
            this.texture.repeat
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .repeat is now .texture.repeat."
          ),
            (this.texture.repeat = t);
        },
      },
      format: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .format is now .texture.format."
            ),
            this.texture.format
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .format is now .texture.format."
          ),
            (this.texture.format = t);
        },
      },
      type: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .type is now .texture.type."
            ),
            this.texture.type
          );
        },
        set: function (t) {
          console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."),
            (this.texture.type = t);
        },
      },
      generateMipmaps: {
        get: function () {
          return (
            console.warn(
              "THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."
            ),
            this.texture.generateMipmaps
          );
        },
        set: function (t) {
          console.warn(
            "THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."
          ),
            (this.texture.generateMipmaps = t);
        },
      },
    }),
    (class extends Fn {
      constructor(t) {
        super(),
          (this.type = "Audio"),
          (this.listener = t),
          (this.context = t.context),
          (this.gain = this.context.createGain()),
          this.gain.connect(t.getInput()),
          (this.autoplay = !1),
          (this.buffer = null),
          (this.detune = 0),
          (this.loop = !1),
          (this.loopStart = 0),
          (this.loopEnd = 0),
          (this.offset = 0),
          (this.duration = void 0),
          (this.playbackRate = 1),
          (this.isPlaying = !1),
          (this.hasPlaybackControl = !0),
          (this.source = null),
          (this.sourceType = "empty"),
          (this._startedAt = 0),
          (this._progress = 0),
          (this._connected = !1),
          (this.filters = []);
      }
      getOutput() {
        return this.gain;
      }
      setNodeSource(t) {
        return (
          (this.hasPlaybackControl = !1),
          (this.sourceType = "audioNode"),
          (this.source = t),
          this.connect(),
          this
        );
      }
      setMediaElementSource(t) {
        return (
          (this.hasPlaybackControl = !1),
          (this.sourceType = "mediaNode"),
          (this.source = this.context.createMediaElementSource(t)),
          this.connect(),
          this
        );
      }
      setMediaStreamSource(t) {
        return (
          (this.hasPlaybackControl = !1),
          (this.sourceType = "mediaStreamNode"),
          (this.source = this.context.createMediaStreamSource(t)),
          this.connect(),
          this
        );
      }
      setBuffer(t) {
        return (
          (this.buffer = t),
          (this.sourceType = "buffer"),
          this.autoplay && this.play(),
          this
        );
      }
      play(t = 0) {
        if (!0 === this.isPlaying)
          return void console.warn("THREE.Audio: Audio is already playing.");
        if (!1 === this.hasPlaybackControl)
          return void console.warn(
            "THREE.Audio: this Audio has no playback control."
          );
        this._startedAt = this.context.currentTime + t;
        const e = this.context.createBufferSource();
        return (
          (e.buffer = this.buffer),
          (e.loop = this.loop),
          (e.loopStart = this.loopStart),
          (e.loopEnd = this.loopEnd),
          (e.onended = this.onEnded.bind(this)),
          e.start(this._startedAt, this._progress + this.offset, this.duration),
          (this.isPlaying = !0),
          (this.source = e),
          this.setDetune(this.detune),
          this.setPlaybackRate(this.playbackRate),
          this.connect()
        );
      }
      pause() {
        if (!1 !== this.hasPlaybackControl)
          return (
            !0 === this.isPlaying &&
              ((this._progress +=
                Math.max(this.context.currentTime - this._startedAt, 0) *
                this.playbackRate),
              !0 === this.loop &&
                (this._progress =
                  this._progress % (this.duration || this.buffer.duration)),
              this.source.stop(),
              (this.source.onended = null),
              (this.isPlaying = !1)),
            this
          );
        console.warn("THREE.Audio: this Audio has no playback control.");
      }
      stop() {
        if (!1 !== this.hasPlaybackControl)
          return (
            (this._progress = 0),
            this.source.stop(),
            (this.source.onended = null),
            (this.isPlaying = !1),
            this
          );
        console.warn("THREE.Audio: this Audio has no playback control.");
      }
      connect() {
        if (this.filters.length > 0) {
          this.source.connect(this.filters[0]);
          for (let t = 1, e = this.filters.length; t < e; t++)
            this.filters[t - 1].connect(this.filters[t]);
          this.filters[this.filters.length - 1].connect(this.getOutput());
        } else this.source.connect(this.getOutput());
        return (this._connected = !0), this;
      }
      disconnect() {
        if (this.filters.length > 0) {
          this.source.disconnect(this.filters[0]);
          for (let t = 1, e = this.filters.length; t < e; t++)
            this.filters[t - 1].disconnect(this.filters[t]);
          this.filters[this.filters.length - 1].disconnect(this.getOutput());
        } else this.source.disconnect(this.getOutput());
        return (this._connected = !1), this;
      }
      getFilters() {
        return this.filters;
      }
      setFilters(t) {
        return (
          t || (t = []),
          !0 === this._connected
            ? (this.disconnect(), (this.filters = t.slice()), this.connect())
            : (this.filters = t.slice()),
          this
        );
      }
      setDetune(t) {
        if (((this.detune = t), void 0 !== this.source.detune))
          return (
            !0 === this.isPlaying &&
              this.source.detune.setTargetAtTime(
                this.detune,
                this.context.currentTime,
                0.01
              ),
            this
          );
      }
      getDetune() {
        return this.detune;
      }
      getFilter() {
        return this.getFilters()[0];
      }
      setFilter(t) {
        return this.setFilters(t ? [t] : []);
      }
      setPlaybackRate(t) {
        if (!1 !== this.hasPlaybackControl)
          return (
            (this.playbackRate = t),
            !0 === this.isPlaying &&
              this.source.playbackRate.setTargetAtTime(
                this.playbackRate,
                this.context.currentTime,
                0.01
              ),
            this
          );
        console.warn("THREE.Audio: this Audio has no playback control.");
      }
      getPlaybackRate() {
        return this.playbackRate;
      }
      onEnded() {
        this.isPlaying = !1;
      }
      getLoop() {
        return !1 === this.hasPlaybackControl
          ? (console.warn("THREE.Audio: this Audio has no playback control."),
            !1)
          : this.loop;
      }
      setLoop(t) {
        if (!1 !== this.hasPlaybackControl)
          return (
            (this.loop = t),
            !0 === this.isPlaying && (this.source.loop = this.loop),
            this
          );
        console.warn("THREE.Audio: this Audio has no playback control.");
      }
      setLoopStart(t) {
        return (this.loopStart = t), this;
      }
      setLoopEnd(t) {
        return (this.loopEnd = t), this;
      }
      getVolume() {
        return this.gain.gain.value;
      }
      setVolume(t) {
        return (
          this.gain.gain.setTargetAtTime(t, this.context.currentTime, 0.01),
          this
        );
      }
    }.prototype.load = function (t) {
      console.warn(
        "THREE.Audio: .load has been deprecated. Use THREE.AudioLoader instead."
      );
      const e = this;
      return (
        new Pc().load(t, function (t) {
          e.setBuffer(t);
        }),
        this
      );
    }),
    (Yi.prototype.updateCubeMap = function (t, e) {
      return (
        console.warn("THREE.CubeCamera: .updateCubeMap() is now .update()."),
        this.update(t, e)
      );
    }),
    (Yi.prototype.clear = function (t, e, n, i) {
      return (
        console.warn(
          "THREE.CubeCamera: .clear() is now .renderTarget.clear()."
        ),
        this.renderTarget.clear(t, e, n, i)
      );
    }),
    (Ae.crossOrigin = void 0),
    (Ae.loadTexture = function (t, e, n, i) {
      console.warn(
        "THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead."
      );
      const r = new dc();
      r.setCrossOrigin(this.crossOrigin);
      const s = r.load(t, n, void 0, i);
      return e && (s.mapping = e), s;
    }),
    (Ae.loadTextureCube = function (t, e, n, i) {
      console.warn(
        "THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead."
      );
      const r = new uc();
      r.setCrossOrigin(this.crossOrigin);
      const s = r.load(t, n, void 0, i);
      return e && (s.mapping = e), s;
    }),
    (Ae.loadCompressedTexture = function () {
      console.error(
        "THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead."
      );
    }),
    (Ae.loadCompressedTextureCube = function () {
      console.error(
        "THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead."
      );
    }),
    "undefined" != typeof __THREE_DEVTOOLS__ &&
      __THREE_DEVTOOLS__.dispatchEvent(
        new CustomEvent("register", { detail: { revision: ht } })
      ),
    "undefined" != typeof window &&
      (window.__THREE__
        ? console.warn(
            "WARNING: Multiple instances of Three.js being imported."
          )
        : (window.__THREE__ = ht));
  const eh = { type: "change" },
    nh = { type: "start" },
    ih = { type: "end" };
  class rh extends pe {
    constructor(t, e) {
      super(),
        void 0 === e &&
          console.warn(
            'THREE.OrbitControls: The second parameter "domElement" is now mandatory.'
          ),
        e === document &&
          console.error(
            'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'
          ),
        (this.object = t),
        (this.domElement = e),
        (this.domElement.style.touchAction = "none"),
        (this.enabled = !0),
        (this.target = new ze()),
        (this.minDistance = 0),
        (this.maxDistance = 1 / 0),
        (this.minZoom = 0),
        (this.maxZoom = 1 / 0),
        (this.minPolarAngle = 0),
        (this.maxPolarAngle = Math.PI),
        (this.minAzimuthAngle = -1 / 0),
        (this.maxAzimuthAngle = 1 / 0),
        (this.enableDamping = !1),
        (this.dampingFactor = 0.05),
        (this.enableZoom = !0),
        (this.zoomSpeed = 1),
        (this.enableRotate = !0),
        (this.rotateSpeed = 1),
        (this.enablePan = !0),
        (this.panSpeed = 1),
        (this.screenSpacePanning = !0),
        (this.keyPanSpeed = 7),
        (this.autoRotate = !1),
        (this.autoRotateSpeed = 2),
        (this.keys = {
          LEFT: "ArrowLeft",
          UP: "ArrowUp",
          RIGHT: "ArrowRight",
          BOTTOM: "ArrowDown",
        }),
        (this.mouseButtons = { LEFT: ut, MIDDLE: dt, RIGHT: pt }),
        (this.touches = { ONE: mt, TWO: gt }),
        (this.target0 = this.target.clone()),
        (this.position0 = this.object.position.clone()),
        (this.zoom0 = this.object.zoom),
        (this._domElementKeyEvents = null),
        (this.getPolarAngle = function () {
          return o.phi;
        }),
        (this.getAzimuthalAngle = function () {
          return o.theta;
        }),
        (this.getDistance = function () {
          return this.object.position.distanceTo(this.target);
        }),
        (this.listenToKeyEvents = function (t) {
          t.addEventListener("keydown", V), (this._domElementKeyEvents = t);
        }),
        (this.saveState = function () {
          n.target0.copy(n.target),
            n.position0.copy(n.object.position),
            (n.zoom0 = n.object.zoom);
        }),
        (this.reset = function () {
          n.target.copy(n.target0),
            n.object.position.copy(n.position0),
            (n.object.zoom = n.zoom0),
            n.object.updateProjectionMatrix(),
            n.dispatchEvent(eh),
            n.update(),
            (r = i.NONE);
        }),
        (this.update = (function () {
          const e = new ze(),
            u = new Ne().setFromUnitVectors(t.up, new ze(0, 1, 0)),
            d = u.clone().invert(),
            p = new ze(),
            m = new Ne(),
            f = 2 * Math.PI;
          return function () {
            const t = n.object.position;
            e.copy(t).sub(n.target),
              e.applyQuaternion(u),
              o.setFromVector3(e),
              n.autoRotate &&
                r === i.NONE &&
                M(((2 * Math.PI) / 60 / 60) * n.autoRotateSpeed),
              n.enableDamping
                ? ((o.theta += a.theta * n.dampingFactor),
                  (o.phi += a.phi * n.dampingFactor))
                : ((o.theta += a.theta), (o.phi += a.phi));
            let g = n.minAzimuthAngle,
              v = n.maxAzimuthAngle;
            return (
              isFinite(g) &&
                isFinite(v) &&
                (g < -Math.PI ? (g += f) : g > Math.PI && (g -= f),
                v < -Math.PI ? (v += f) : v > Math.PI && (v -= f),
                (o.theta =
                  g <= v
                    ? Math.max(g, Math.min(v, o.theta))
                    : o.theta > (g + v) / 2
                    ? Math.max(g, o.theta)
                    : Math.min(v, o.theta))),
              (o.phi = Math.max(
                n.minPolarAngle,
                Math.min(n.maxPolarAngle, o.phi)
              )),
              o.makeSafe(),
              (o.radius *= l),
              (o.radius = Math.max(
                n.minDistance,
                Math.min(n.maxDistance, o.radius)
              )),
              !0 === n.enableDamping
                ? n.target.addScaledVector(c, n.dampingFactor)
                : n.target.add(c),
              e.setFromSpherical(o),
              e.applyQuaternion(d),
              t.copy(n.target).add(e),
              n.object.lookAt(n.target),
              !0 === n.enableDamping
                ? ((a.theta *= 1 - n.dampingFactor),
                  (a.phi *= 1 - n.dampingFactor),
                  c.multiplyScalar(1 - n.dampingFactor))
                : (a.set(0, 0, 0), c.set(0, 0, 0)),
              (l = 1),
              !!(
                h ||
                p.distanceToSquared(n.object.position) > s ||
                8 * (1 - m.dot(n.object.quaternion)) > s
              ) &&
                (n.dispatchEvent(eh),
                p.copy(n.object.position),
                m.copy(n.object.quaternion),
                (h = !1),
                !0)
            );
          };
        })()),
        (this.dispose = function () {
          n.domElement.removeEventListener("contextmenu", W),
            n.domElement.removeEventListener("pointerdown", F),
            n.domElement.removeEventListener("pointercancel", H),
            n.domElement.removeEventListener("wheel", G),
            n.domElement.removeEventListener("pointermove", U),
            n.domElement.removeEventListener("pointerup", B),
            null !== n._domElementKeyEvents &&
              n._domElementKeyEvents.removeEventListener("keydown", V);
        });
      const n = this,
        i = {
          NONE: -1,
          ROTATE: 0,
          DOLLY: 1,
          PAN: 2,
          TOUCH_ROTATE: 3,
          TOUCH_PAN: 4,
          TOUCH_DOLLY_PAN: 5,
          TOUCH_DOLLY_ROTATE: 6,
        };
      let r = i.NONE;
      const s = 1e-6,
        o = new Xc(),
        a = new Xc();
      let l = 1;
      const c = new ze();
      let h = !1;
      const u = new we(),
        d = new we(),
        p = new we(),
        m = new we(),
        f = new we(),
        g = new we(),
        v = new we(),
        x = new we(),
        _ = new we(),
        y = [],
        b = {};
      function w() {
        return Math.pow(0.95, n.zoomSpeed);
      }
      function M(t) {
        a.theta -= t;
      }
      function S(t) {
        a.phi -= t;
      }
      const T = (function () {
          const t = new ze();
          return function (e, n) {
            t.setFromMatrixColumn(n, 0), t.multiplyScalar(-e), c.add(t);
          };
        })(),
        E = (function () {
          const t = new ze();
          return function (e, i) {
            !0 === n.screenSpacePanning
              ? t.setFromMatrixColumn(i, 1)
              : (t.setFromMatrixColumn(i, 0), t.crossVectors(n.object.up, t)),
              t.multiplyScalar(e),
              c.add(t);
          };
        })(),
        A = (function () {
          const t = new ze();
          return function (e, i) {
            const r = n.domElement;
            if (n.object.isPerspectiveCamera) {
              const s = n.object.position;
              t.copy(s).sub(n.target);
              let o = t.length();
              (o *= Math.tan(((n.object.fov / 2) * Math.PI) / 180)),
                T((2 * e * o) / r.clientHeight, n.object.matrix),
                E((2 * i * o) / r.clientHeight, n.object.matrix);
            } else
              n.object.isOrthographicCamera
                ? (T(
                    (e * (n.object.right - n.object.left)) /
                      n.object.zoom /
                      r.clientWidth,
                    n.object.matrix
                  ),
                  E(
                    (i * (n.object.top - n.object.bottom)) /
                      n.object.zoom /
                      r.clientHeight,
                    n.object.matrix
                  ))
                : (console.warn(
                    "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."
                  ),
                  (n.enablePan = !1));
          };
        })();
      function L(t) {
        n.object.isPerspectiveCamera
          ? (l /= t)
          : n.object.isOrthographicCamera
          ? ((n.object.zoom = Math.max(
              n.minZoom,
              Math.min(n.maxZoom, n.object.zoom * t)
            )),
            n.object.updateProjectionMatrix(),
            (h = !0))
          : (console.warn(
              "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
            ),
            (n.enableZoom = !1));
      }
      function R(t) {
        n.object.isPerspectiveCamera
          ? (l *= t)
          : n.object.isOrthographicCamera
          ? ((n.object.zoom = Math.max(
              n.minZoom,
              Math.min(n.maxZoom, n.object.zoom / t)
            )),
            n.object.updateProjectionMatrix(),
            (h = !0))
          : (console.warn(
              "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
            ),
            (n.enableZoom = !1));
      }
      function C(t) {
        u.set(t.clientX, t.clientY);
      }
      function P(t) {
        m.set(t.clientX, t.clientY);
      }
      function D() {
        if (1 === y.length) u.set(y[0].pageX, y[0].pageY);
        else {
          const t = 0.5 * (y[0].pageX + y[1].pageX),
            e = 0.5 * (y[0].pageY + y[1].pageY);
          u.set(t, e);
        }
      }
      function I() {
        if (1 === y.length) m.set(y[0].pageX, y[0].pageY);
        else {
          const t = 0.5 * (y[0].pageX + y[1].pageX),
            e = 0.5 * (y[0].pageY + y[1].pageY);
          m.set(t, e);
        }
      }
      function N() {
        const t = y[0].pageX - y[1].pageX,
          e = y[0].pageY - y[1].pageY,
          n = Math.sqrt(t * t + e * e);
        v.set(0, n);
      }
      function z(t) {
        if (1 == y.length) d.set(t.pageX, t.pageY);
        else {
          const e = Y(t),
            n = 0.5 * (t.pageX + e.x),
            i = 0.5 * (t.pageY + e.y);
          d.set(n, i);
        }
        p.subVectors(d, u).multiplyScalar(n.rotateSpeed);
        const e = n.domElement;
        M((2 * Math.PI * p.x) / e.clientHeight),
          S((2 * Math.PI * p.y) / e.clientHeight),
          u.copy(d);
      }
      function k(t) {
        if (1 === y.length) f.set(t.pageX, t.pageY);
        else {
          const e = Y(t),
            n = 0.5 * (t.pageX + e.x),
            i = 0.5 * (t.pageY + e.y);
          f.set(n, i);
        }
        g.subVectors(f, m).multiplyScalar(n.panSpeed), A(g.x, g.y), m.copy(f);
      }
      function O(t) {
        const e = Y(t),
          i = t.pageX - e.x,
          r = t.pageY - e.y,
          s = Math.sqrt(i * i + r * r);
        x.set(0, s),
          _.set(0, Math.pow(x.y / v.y, n.zoomSpeed)),
          L(_.y),
          v.copy(x);
      }
      function F(t) {
        !1 !== n.enabled &&
          (0 === y.length &&
            (n.domElement.setPointerCapture(t.pointerId),
            n.domElement.addEventListener("pointermove", U),
            n.domElement.addEventListener("pointerup", B)),
          (function (t) {
            y.push(t);
          })(t),
          "touch" === t.pointerType
            ? (function (t) {
                switch ((Z(t), y.length)) {
                  case 1:
                    switch (n.touches.ONE) {
                      case mt:
                        if (!1 === n.enableRotate) return;
                        D(), (r = i.TOUCH_ROTATE);
                        break;
                      case ft:
                        if (!1 === n.enablePan) return;
                        I(), (r = i.TOUCH_PAN);
                        break;
                      default:
                        r = i.NONE;
                    }
                    break;
                  case 2:
                    switch (n.touches.TWO) {
                      case gt:
                        if (!1 === n.enableZoom && !1 === n.enablePan) return;
                        n.enableZoom && N(),
                          n.enablePan && I(),
                          (r = i.TOUCH_DOLLY_PAN);
                        break;
                      case vt:
                        if (!1 === n.enableZoom && !1 === n.enableRotate)
                          return;
                        n.enableZoom && N(),
                          n.enableRotate && D(),
                          (r = i.TOUCH_DOLLY_ROTATE);
                        break;
                      default:
                        r = i.NONE;
                    }
                    break;
                  default:
                    r = i.NONE;
                }
                r !== i.NONE && n.dispatchEvent(nh);
              })(t)
            : (function (t) {
                let e;
                switch (t.button) {
                  case 0:
                    e = n.mouseButtons.LEFT;
                    break;
                  case 1:
                    e = n.mouseButtons.MIDDLE;
                    break;
                  case 2:
                    e = n.mouseButtons.RIGHT;
                    break;
                  default:
                    e = -1;
                }
                switch (e) {
                  case dt:
                    if (!1 === n.enableZoom) return;
                    !(function (t) {
                      v.set(t.clientX, t.clientY);
                    })(t),
                      (r = i.DOLLY);
                    break;
                  case ut:
                    if (t.ctrlKey || t.metaKey || t.shiftKey) {
                      if (!1 === n.enablePan) return;
                      P(t), (r = i.PAN);
                    } else {
                      if (!1 === n.enableRotate) return;
                      C(t), (r = i.ROTATE);
                    }
                    break;
                  case pt:
                    if (t.ctrlKey || t.metaKey || t.shiftKey) {
                      if (!1 === n.enableRotate) return;
                      C(t), (r = i.ROTATE);
                    } else {
                      if (!1 === n.enablePan) return;
                      P(t), (r = i.PAN);
                    }
                    break;
                  default:
                    r = i.NONE;
                }
                r !== i.NONE && n.dispatchEvent(nh);
              })(t));
      }
      function U(t) {
        !1 !== n.enabled &&
          ("touch" === t.pointerType
            ? (function (t) {
                switch ((Z(t), r)) {
                  case i.TOUCH_ROTATE:
                    if (!1 === n.enableRotate) return;
                    z(t), n.update();
                    break;
                  case i.TOUCH_PAN:
                    if (!1 === n.enablePan) return;
                    k(t), n.update();
                    break;
                  case i.TOUCH_DOLLY_PAN:
                    if (!1 === n.enableZoom && !1 === n.enablePan) return;
                    !(function (t) {
                      n.enableZoom && O(t), n.enablePan && k(t);
                    })(t),
                      n.update();
                    break;
                  case i.TOUCH_DOLLY_ROTATE:
                    if (!1 === n.enableZoom && !1 === n.enableRotate) return;
                    !(function (t) {
                      n.enableZoom && O(t), n.enableRotate && z(t);
                    })(t),
                      n.update();
                    break;
                  default:
                    r = i.NONE;
                }
              })(t)
            : (function (t) {
                if (!1 === n.enabled) return;
                switch (r) {
                  case i.ROTATE:
                    if (!1 === n.enableRotate) return;
                    !(function (t) {
                      d.set(t.clientX, t.clientY),
                        p.subVectors(d, u).multiplyScalar(n.rotateSpeed);
                      const e = n.domElement;
                      M((2 * Math.PI * p.x) / e.clientHeight),
                        S((2 * Math.PI * p.y) / e.clientHeight),
                        u.copy(d),
                        n.update();
                    })(t);
                    break;
                  case i.DOLLY:
                    if (!1 === n.enableZoom) return;
                    !(function (t) {
                      x.set(t.clientX, t.clientY),
                        _.subVectors(x, v),
                        _.y > 0 ? L(w()) : _.y < 0 && R(w()),
                        v.copy(x),
                        n.update();
                    })(t);
                    break;
                  case i.PAN:
                    if (!1 === n.enablePan) return;
                    !(function (t) {
                      f.set(t.clientX, t.clientY),
                        g.subVectors(f, m).multiplyScalar(n.panSpeed),
                        A(g.x, g.y),
                        m.copy(f),
                        n.update();
                    })(t);
                }
              })(t));
      }
      function B(t) {
        j(t),
          0 === y.length &&
            (n.domElement.releasePointerCapture(t.pointerId),
            n.domElement.removeEventListener("pointermove", U),
            n.domElement.removeEventListener("pointerup", B)),
          n.dispatchEvent(ih),
          (r = i.NONE);
      }
      function H(t) {
        j(t);
      }
      function G(t) {
        !1 !== n.enabled &&
          !1 !== n.enableZoom &&
          r === i.NONE &&
          (t.preventDefault(),
          n.dispatchEvent(nh),
          (function (t) {
            t.deltaY < 0 ? R(w()) : t.deltaY > 0 && L(w()), n.update();
          })(t),
          n.dispatchEvent(ih));
      }
      function V(t) {
        !1 !== n.enabled &&
          !1 !== n.enablePan &&
          (function (t) {
            let e = !1;
            switch (t.code) {
              case n.keys.UP:
                A(0, n.keyPanSpeed), (e = !0);
                break;
              case n.keys.BOTTOM:
                A(0, -n.keyPanSpeed), (e = !0);
                break;
              case n.keys.LEFT:
                A(n.keyPanSpeed, 0), (e = !0);
                break;
              case n.keys.RIGHT:
                A(-n.keyPanSpeed, 0), (e = !0);
            }
            e && (t.preventDefault(), n.update());
          })(t);
      }
      function W(t) {
        !1 !== n.enabled && t.preventDefault();
      }
      function j(t) {
        delete b[t.pointerId];
        for (let e = 0; e < y.length; e++)
          if (y[e].pointerId == t.pointerId) return void y.splice(e, 1);
      }
      function Z(t) {
        let e = b[t.pointerId];
        void 0 === e && ((e = new we()), (b[t.pointerId] = e)),
          e.set(t.pageX, t.pageY);
      }
      function Y(t) {
        const e = t.pointerId === y[0].pointerId ? y[1] : y[0];
        return b[e.pointerId];
      }
      n.domElement.addEventListener("contextmenu", W),
        n.domElement.addEventListener("pointerdown", F),
        n.domElement.addEventListener("pointercancel", H),
        n.domElement.addEventListener("wheel", G, { passive: !1 }),
        this.update();
    }
  }
  var sh = function (t, e, n, i) {
    return new (n || (n = Promise))(function (r, s) {
      function o(t) {
        try {
          l(i.next(t));
        } catch (t) {
          s(t);
        }
      }
      function a(t) {
        try {
          l(i.throw(t));
        } catch (t) {
          s(t);
        }
      }
      function l(t) {
        var e;
        t.done
          ? r(t.value)
          : ((e = t.value),
            e instanceof n
              ? e
              : new n(function (t) {
                  t(e);
                })).then(o, a);
      }
      l((i = i.apply(t, e || [])).next());
    });
  };
  class oh {
    constructor(t, e) {
      if (
        ((this.initialState = t),
        (this.listeners = []),
        (this.actionListeners = []),
        (this.actions = []),
        (this.reducers = {}),
        (this.timeout = (t) => new Promise((e) => setTimeout(e, t))),
        (this.state = (null == e ? void 0 : e.state) || t),
        null == e ? void 0 : e.actions)
      ) {
        (this.state = t), (this.actions = e.actions);
        for (const t of this.actions) this.state = this.reduce(this.state, t);
      }
    }
    getState() {
      return this.state;
    }
    getActions() {
      return this.actions;
    }
    dispatch(t) {
      const e = Date.now(),
        n = Object.assign(Object.assign({}, t), { timestamp: e });
      this.actions.push(n),
        (this.state = this.reduce(this.state, n)),
        this.notifyListeners(n);
    }
    reset() {
      (this.state = this.initialState), (this.actions = []);
    }
    restoreState(t, e) {
      (this.state = t), (this.actions = e);
    }
    replay(t, e) {
      return sh(this, void 0, void 0, function* () {
        this.reset(), (this.actions = []);
        let n = 0;
        null != (null == e ? void 0 : e.until) && (t = t.slice(0, e.until));
        for (const i of t) {
          let t =
            !1 === (null == e ? void 0 : e.animate)
              ? 0
              : n
              ? i.timestamp - n
              : 0;
          (null == e ? void 0 : e.speed) && (t /= e.speed),
            yield this.timeout(t),
            this.actions.push(i),
            (this.state = this.reduce(this.state, i)),
            this.notifyListeners(i),
            (n = i.timestamp);
        }
      });
    }
    subscribe(t) {
      this.listeners.push(t), t(this.state);
    }
    subscribeActions(t) {
      this.actionListeners.push(t);
    }
    unsubscribe(t) {
      const e = this.listeners.indexOf(t);
      -1 !== e && this.listeners.splice(e, 1);
    }
    unsubscribeAll() {
      this.listeners = [];
    }
    addReducer(t, e) {
      this.reducers[t] = e;
    }
    reduce(t, e) {
      const n = this.reducers[e.type];
      return n ? n(t, e.payload) : t;
    }
    notifyListeners(t) {
      for (const t of this.listeners) t(this.state);
      for (const e of this.actionListeners) e(t);
      console.log("Action:", t);
    }
  }
  const ah = (t) => {
    const { config: e, store: n } = t;
    let i, r;
    const s = (function (t) {
      const [e, n] = nt(t.getState());
      return (
        it(() => {
          const e = (t) => {
            n(t);
          };
          return (
            t.subscribe(e),
            () => {
              t.unsubscribe(e);
            }
          );
        }, [t]),
        e
      );
    })(n);
    return (
      it(
        () => (
          (i = new lh({
            width: e.width,
            height: e.height,
            gridDivisions: e.gridDivisions,
            cubePixelSize: e.cubePixelSize,
            htmlElementToAppendTo: r,
          })),
          i &&
            setTimeout(() => {
              null == i || i.restoreObjects(s.cubes),
                n.subscribe((t) => {
                  null == i || i.restoreObjects(t.cubes);
                }),
                null == i || i.onWindowResize();
            }, 10),
          null == r ||
            r.addEventListener("onPositionsChanged", (t) => {
              const e = n.getState().cubes,
                i = t.detail,
                r = i.filter(
                  (t) =>
                    !e.find((e) => e.x === t.x && e.y === t.y && e.z === t.z)
                ),
                s = e.filter(
                  (t) =>
                    !i.find((e) => t.x === e.x && t.y === e.y && t.z === e.z)
                );
              r.forEach((t) => {
                n.dispatch({
                  type: "ADDED_CUBE",
                  payload: { x: t.x, y: t.y, z: t.z },
                });
              }),
                s.forEach((t) => {
                  n.dispatch({
                    type: "REMOVED_CUBE",
                    payload: { x: t.x, y: t.y, z: t.z },
                  });
                });
            }),
          () => {
            i = null;
          }
        ),
        []
      ),
      H(b, {
        children: [
          H("h1", { className: "text-red-500" }),
          H("div", {
            className: "w-full h-full",
            ref: (t) => (r = t),
            children: H("img", {
              className: "hidden",
              id: "arrow-front",
              width: 100,
              src: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='xMidYMid meet' viewBox='261.8571428571428 254.1626632325672 162.22142818995894 146.3691395493506' width='200' height='200'%3E%3Cdefs%3E%3Ctext id='a1z4szAWH' x='224' y='340' font-size='74' font-family='Arial' font-weight='normal' font-style='normal' letter-spacing='0' alignment-baseline='before-edge' transform='matrix(1 0 0 1 42.85714285714266 -35.03511884375507)' style='line-height:100%25' xml:space='preserve' dominant-baseline='text-before-edge'%3E%3Ctspan x='224' dy='0em' alignment-baseline='before-edge' dominant-baseline='text-before-edge' text-anchor='start'%3Efront%3C/tspan%3E%3C/text%3E%3Cpath d='M361.75 292.53L345.54 292.53L345.54 326.2L340.59 326.2L340.59 292.53L322.19 292.53L332.08 273.84L341.97 255.16L351.86 273.84L361.75 292.53Z' id='c7lzESt7db'%3E%3C/path%3E%3C/defs%3E%3Cg%3E%3Cg id='c4VrQc8u2d'%3E%3Cuse xlink:href='%23a1z4szAWH' opacity='1' fill='%23000000' fill-opacity='1'%3E%3C/use%3E%3C/g%3E%3Cg%3E%3Cuse xlink:href='%23c7lzESt7db' opacity='1' fill='%23000000' fill-opacity='1'%3E%3C/use%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
            }),
          }),
        ],
      })
    );
  };
  class lh {
    constructor(t) {
      (this.target = new ze(0, 0, 0)),
        (this.gridDivisions = 4),
        (this.gridSize = 400),
        (this.cubeColor = 46813),
        (this.objects = []),
        (this.mouseMoveRotateActive = !0),
        (this.isRotating = !1),
        (this.domEl =
          t && t.htmlElementToAppendTo
            ? t.htmlElementToAppendTo
            : document.body),
        (this.canvasWidth = t.width ? t.width : this.domEl.clientWidth),
        (this.canvasHeight = t.height ? t.height : this.domEl.clientHeight),
        (this.camera = new ji(
          42,
          this.canvasWidth / this.canvasHeight,
          1,
          1e4
        )),
        this.camera.position.set(200, 600, 1e3),
        this.camera.lookAt(this.target),
        this.camera.setViewOffset(
          this.canvasWidth,
          this.canvasHeight,
          0,
          0,
          this.canvasWidth,
          this.canvasHeight
        ),
        (this.scene = new Qo()),
        (this.scene.background = new ri(16777215)),
        (this.arrowFront = this.domEl.querySelector("#arrow-front")),
        t &&
          t.gridDivisions &&
          t.cubePixelSize &&
          ((this.gridDivisions = t.gridDivisions),
          (this.gridSize = t.gridDivisions * t.cubePixelSize));
      const e = this.gridSize / this.gridDivisions,
        n = new Vl({
          color: this.cubeColor,
          map: new dc().load(this.getCubeTexture("square-1px.png")),
        }),
        i = new Vl({
          color: this.cubeColor,
          opacity: 0.5,
          transparent: !0,
          map: new dc().load(this.getCubeTexture("square-1px.png")),
        }),
        r = new Vl({
          color: 16711680,
          opacity: 0.5,
          transparent: !0,
          map: new dc().load(this.getCubeTexture("square-1px.png")),
        }),
        s = new Ui(e, e, e);
      this.gridDivisions % 2 == 1 &&
        s.applyMatrix4(new pn().makeTranslation(0, e / 2, 0)),
        (this.rollOverMaterial = i),
        (this.rollOverMesh = new Oi(s, this.rollOverMaterial)),
        this.scene.add(this.rollOverMesh),
        (this.cubeGeo = new Ui(e, e, e)),
        this.gridDivisions % 2 == 1 &&
          this.cubeGeo.applyMatrix4(new pn().makeTranslation(0, e / 2, 0)),
        (this.cubeMaterial = n),
        (this.cubeMaterialSelected = r);
      const o = new $c(this.gridSize, this.gridDivisions);
      this.scene.add(o), (this.raycaster = new jc()), (this.mouse = new we());
      const a = new sr(this.gridSize, this.gridSize);
      a.rotateX(-Math.PI / 2),
        (this.plane = new Oi(a, new si({ visible: !1 }))),
        this.plane.applyMatrix4(new pn().makeTranslation(0, -1, 0)),
        this.scene.add(this.plane),
        this.objects.push(this.plane);
      const l = new Tc(6316128);
      this.scene.add(l);
      const c = new Sc(16777215);
      c.position.set(0, 1, 0.75).normalize(),
        this.scene.add(c),
        (this.labelMesh = this.getFrontsideLabel()),
        this.scene.add(this.labelMesh),
        (this.renderer = new Jo({ antialias: !0 })),
        this.renderer.setPixelRatio(window.devicePixelRatio),
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
      const h = this.renderer.domElement;
      h.setAttribute("id", "voxelPainterCanvas"),
        this.domEl.appendChild(h),
        (this.controls = new rh(this.camera, h)),
        (this.controls.enableKeys = !1),
        (this.controls.enablePan = !1),
        (this.controls.enableZoom = !1),
        this.domEl.addEventListener(
          "mousemove",
          (t) => this.onDocumentMouseMove(t),
          !1
        ),
        this.domEl.addEventListener(
          "mousedown",
          (t) => this.onDocumentMouseDown(t),
          !1
        ),
        this.domEl.addEventListener(
          "mouseup",
          (t) => this.onDocumentMouseUp(t),
          !1
        ),
        t.width &&
          t.height &&
          window.addEventListener("resize", () => this.onWindowResize(), !1),
        this.render();
    }
    onWindowResize() {
      (this.canvasWidth = this.domEl.clientWidth),
        (this.canvasHeight = this.domEl.clientHeight),
        (this.camera.aspect = this.canvasWidth / this.canvasHeight),
        this.camera.setViewOffset(
          this.canvasWidth,
          this.canvasHeight,
          0,
          0,
          this.canvasWidth,
          this.canvasHeight
        ),
        this.camera.updateProjectionMatrix(),
        this.renderer.setSize(this.canvasWidth, this.canvasHeight),
        this.render();
    }
    onDocumentMouseMove(t) {
      t.preventDefault();
      const e =
        this.isMouseDown &&
        (Math.abs(t.movementX) > 1 || Math.abs(t.movementY) > 1);
      this.mouseMoveRotateActive && e && (this.isRotating = !0),
        this.setMouseCoordinates(t);
      const n = this.raycaster.intersectObjects(this.objects);
      this.hideCubeHelper(), this.resetCubesOpacity();
      const i = this.gridSize / this.gridDivisions;
      if (n.length > 0) {
        const t = n[0],
          e = this.gridDivisions % 2 == 1;
        (t.point.z = Math.round(t.point.z + (e ? i / 2 : 0))),
          (t.point.x = Math.round(t.point.x + (e ? i / 2 : 0))),
          (t.point.y = Math.round(t.point.y)),
          this.showHelpersMouseOnly(t);
      }
      this.render();
    }
    showHelpersMouseOnly(t) {
      const e = this.isGoingToBePlacedOnTop(t);
      if (!this.isRotating && e) {
        const e = this.gridSize / this.gridDivisions;
        this.rollOverMesh.position.copy(t.point).add(t.face.normal),
          this.rollOverMesh.position.divideScalar(e).floor().multiplyScalar(e),
          this.gridDivisions % 2 == 0 &&
            this.rollOverMesh.position.addScalar(e / 2),
          this.isOutsideGrid(this.rollOverMesh)
            ? this.isTopVoxel(t.object) && this.setCubeOpacity(t.object.uuid)
            : this.showCubeHelper();
      } else !this.isRotating && this.isCube(t.object) && this.setCubeOpacity(t.object.uuid);
    }
    onDocumentMouseDown(t) {
      t.preventDefault(), (this.isMouseDown = !0);
    }
    onDocumentMouseUp(t) {
      (this.isMouseDown = !1),
        this.isRotating || this.handleMouseEvent(t),
        (this.isRotating = !1),
        this.showCubeHelper();
    }
    handleMouseEvent(t) {
      this.setMouseCoordinates(t);
      const e = this.raycaster.intersectObjects(this.objects);
      if (e.length > 0) {
        const t = e[0];
        this.isTopVoxel(t.object) && this.isCube(t.object)
          ? this.removeCube(t)
          : this.isGoingToBePlacedOnTop(t)
          ? this.addNewCube()
          : this.isCube(t.object) && this.removeCube(t),
          this.render();
        const n = new CustomEvent("onPositionsChanged", {
          detail: this.getObjectsPositions(),
          bubbles: !0,
        });
        this.renderer.domElement.dispatchEvent(n);
      }
    }
    addNewCube() {
      const t = new Oi(this.cubeGeo, this.cubeMaterial);
      t.position.copy(this.rollOverMesh.position),
        this.isOutsideGrid(t) || (this.scene.add(t), this.objects.push(t));
    }
    removeCube(t) {
      this.scene.remove(t.object),
        this.objects.splice(this.objects.indexOf(t.object), 1);
    }
    setMouseCoordinates(t) {
      const e = this.getMouseCoordinatesNormalized(t);
      this.mouse.set(e.mouseX, e.mouseY),
        this.raycaster.setFromCamera(this.mouse, this.camera);
    }
    getMouseCoordinatesNormalized(t) {
      return {
        mouseX: (t.offsetX / this.canvasWidth) * 2 - 1,
        mouseY: (-t.offsetY / this.canvasHeight) * 2 + 1,
      };
    }
    isOutsideGrid(t) {
      const e = Math.abs(t.position.x),
        n = Math.abs(t.position.y),
        i = Math.abs(t.position.z),
        r = e > this.gridSize / 2,
        s = n > this.gridSize || t.position.y < 0,
        o = i > this.gridSize / 2;
      return r || s || o;
    }
    isTopVoxel(t) {
      const e = Math.abs(t.position.y),
        n = this.gridSize / this.gridDivisions;
      return e >= this.gridSize - n;
    }
    hideCubeHelper() {
      this.scene.remove(this.rollOverMesh);
    }
    showCubeHelper() {
      this.scene.add(this.rollOverMesh);
    }
    isGridBottom(t) {
      return t.uuid == this.plane.uuid;
    }
    isGoingToBePlacedOnTop(t) {
      const e = t.faceIndex;
      return (
        (this.isGridBottom(t.object) && (0 == e || 1 == e)) || 4 == e || 5 == e
      );
    }
    resetCubesOpacity() {
      this.scene.children.forEach((t) => {
        this.isCube(t) && (t.material = this.cubeMaterial);
      });
    }
    setCubeOpacity(t) {
      this.scene.children.forEach((e) => {
        e.uuid == t
          ? (e.material = this.cubeMaterialSelected)
          : this.isCube(e) && (e.material = this.cubeMaterial);
      });
    }
    isCube(t) {
      const e = this.plane.uuid,
        n = this.labelMesh.uuid,
        i = this.rollOverMesh.uuid;
      return (
        "mesh" == t.type.toLowerCase() &&
        t.uuid != i &&
        t.uuid != e &&
        t.uuid != n
      );
    }
    getFrontsideLabel() {
      const t = this.gridSize,
        e = document.createElement("canvas");
      (e.width = t), (e.height = 200);
      const n = e.width / 2;
      e.getContext("2d").drawImage(this.arrowFront, n - 100, 0);
      const i = new Re(e);
      i.needsUpdate = !0;
      const r = new si({ map: i, side: 2 });
      r.transparent = !0;
      const s = new sr(t, 200);
      s.rotateX(-Math.PI / 2);
      const o = new Oi(s, r),
        a = (this.gridSize + 200) / 2;
      return o.position.set(0, 0, a), o;
    }
    getCubeTexture(t = null) {
      switch (t) {
        case "square-thick.png":
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAVklEQVRo3u3RsQ0AIAwDwYT9dzYlTIAUcd+l8ylV0t/1fSSZMbrP7DX9AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACSXrQBS9IDcNBhO+QAAAAASUVORK5CYII=";
        case "square_thin.png":
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA2LTI2VDE0OjUzOjE2KzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNi0yNlQxNTo1MzoyMCswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNi0yNlQxNTo1MzoyMCswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjZGFhYmRjNy1hMWI0LTMwNGEtOTQ0ZS1lZmYxNjllNWJlYTYiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpmMDhiNWEyOS0wYmY1LTRmNGMtOGZkMS0wMzNiZWFiNzhiNTMiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkZDUzOWRmNy0zYjU2LWRiNDItOTFjMS01Mjk2NWU4YTVkZDkiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmRkNTM5ZGY3LTNiNTYtZGI0Mi05MWMxLTUyOTY1ZThhNWRkOSIgc3RFdnQ6d2hlbj0iMjAyMC0wNi0yNlQxNDo1MzoxNiswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjZGFhYmRjNy1hMWI0LTMwNGEtOTQ0ZS1lZmYxNjllNWJlYTYiIHN0RXZ0OndoZW49IjIwMjAtMDYtMjZUMTU6NTM6MjArMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4yIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6WaHW1AAAAZ0lEQVRoge3PoQGAQAwEwYT+e34EHYAYwY45ezsTa58559gfL+zuzFz6xlcFaAVoBWgFaAVoBWgFaAVoBWgFaAVoBWgFaAVoBWgFaAVoBWgFaAVoBWgFaAVoBWgFaAVoBWgFaAXk726mewN4gL/h6QAAAABJRU5ErkJggg==";
        default:
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTA2LTI2VDE0OjUzOjE2KzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMC0wNi0yNlQxNTo1Mzo1OCswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0wNi0yNlQxNTo1Mzo1OCswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDplMDI3NTUzZC01MGY2LTc5NDUtOWJmMi1iZTExNDQ5OGI4YmIiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo3MGViZWRlZi1hZWYzLTYzNDEtYTAxZi1hNDI4MzU3Yjg5MGMiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0NDhhODBkOC1hZWUyLWFkNDAtOTE1ZS04NTQ2MDgwYjFiMTYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ0OGE4MGQ4LWFlZTItYWQ0MC05MTVlLTg1NDYwODBiMWIxNiIgc3RFdnQ6d2hlbj0iMjAyMC0wNi0yNlQxNDo1MzoxNiswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplMDI3NTUzZC01MGY2LTc5NDUtOWJmMi1iZTExNDQ5OGI4YmIiIHN0RXZ0OndoZW49IjIwMjAtMDYtMjZUMTU6NTM6NTgrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4yIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz44whNcAAAAZ0lEQVRoge3PQQ3AMAzAwGT8OXcc1oc16Q6BPfNzOzPnnDrjo9196oZbBmoGagZqBmoGagZqBmoGagZqBmoGagZqBmoGagZqBmoGagZqBmoGagZqBmoGagZqBmoGagZqBmoGaga49AJT1wN8ckHKHwAAAABJRU5ErkJggg==";
      }
    }
    clearObjects() {
      const t = [];
      this.objects.forEach((e, n) => {
        e.uuid !== this.plane.uuid && t.push(e.uuid);
      }),
        t.forEach((t) => {
          const e = this.objects.findIndex((e) => e.uuid === t);
          -1 != e && this.objects.splice(e, 1);
          const n = this.scene.children.findIndex((e) => e.uuid === t);
          -1 != n && this.scene.children.splice(n, 1);
        });
    }
    render() {
      this.renderer.render(this.scene, this.camera);
    }
    getObjectsPositions() {
      const t = [];
      return (
        this.objects.forEach((e) => {
          if (this.isCube(e)) {
            const n = this.gridDivisions % 2 == 0,
              i = this.gridSize / this.gridDivisions,
              r = -i / 2,
              s = (e.position.y + (n ? r : 0)) / i,
              o = (e.position.x + (this.gridDivisions * i) / 2 + r) / i,
              a = (e.position.z + (this.gridDivisions * i) / 2 + r) / i;
            t.push({ x: o, y: s, z: a });
          }
        }),
        t
      );
    }
    restoreObjects(t) {
      this.clearObjects(),
        t.forEach((t) => {
          const e = new Oi(this.cubeGeo, this.cubeMaterial),
            n = this.gridDivisions % 2 == 0,
            i = this.gridSize / this.gridDivisions,
            r = i / 2,
            s = t.y * i - (n ? -r : 0),
            o = t.x * i - (this.gridDivisions * i) / 2 + r,
            a = t.z * i - (this.gridDivisions * i) / 2 + r;
          e.position.set(o, s, a), this.scene.add(e), this.objects.push(e);
        }),
        this.render();
    }
  }
  var ch = {
    gridDivisions: "2",
    cubePixelSize: "15",
    width: "300",
    height: "300",
  };
  const hh = (t, e, n, i) => {
    let r = ["x", "y", "z"].filter((t) => t !== e);
    const s = [];
    for (let e = 0; e < i; e++)
      for (let n = 0; n < i; n++) {
        const i = t.filter((t) => t[r[0]] == e && t[r[1]] == n).length;
        s.push({ [r[0]]: e, [r[1]]: n, found: i > 0 });
      }
    return s;
  };
  var uh = new (class {
    constructor() {
      (this.typeIdentifier = "blocks"),
        (this.initialState = { cubes: [] }),
        (this.getInstance = (t, e, n) => {
          (e.properties = Object.assign(Object.assign({}, ch), e.properties)),
            (this.config = e);
          const i = n ? JSON.parse(n) : null,
            r = n ? JSON.parse(n).log : null;
          if (
            ((this.store = ((t, e) => {
              const n = new oh(t, e);
              return (
                n.addReducer("ADDED_CUBE", (t, e) => {
                  const n = [...t.cubes, e];
                  return Object.assign(Object.assign({}, t), { cubes: n });
                }),
                n.addReducer("REMOVED_CUBE", (t, e) => {
                  const n = t.cubes.filter(
                    (t) => !(t.x === e.x && t.y === e.y && t.z === e.z)
                  );
                  return Object.assign(Object.assign({}, t), { cubes: n });
                }),
                n
              );
            })(this.initialState)),
            (i || r) && this.store.restoreState(i.state, r),
            (this.shadowdom = t.shadowRoot
              ? t.shadowRoot
              : t.attachShadow({ mode: "open" })),
            this.render(),
            this.store.subscribe(() => {
              const e = {
                  interaction: this,
                  responseIdentifier: this.config.responseIdentifier,
                  valid: !0,
                  value: this.getResponse(),
                },
                n = new CustomEvent("qti-interaction-changed", { detail: e });
              t.dispatchEvent(n);
            }),
            this.config.boundTo && Object.keys(this.config.boundTo).length > 0)
          ) {
            const t = Object.keys(this.config.boundTo)[0],
              e = this.config.boundTo[t],
              n = Object.values(e).some((t) =>
                "object" == typeof t
                  ? Object.values(t).some((t) => void 0 !== t)
                  : void 0 !== t
              );
            n && this.setResponse(e);
          }
          e.onready && e.onready(this);
        }),
        (this.render = () => {
          U(null, this.shadowdom);
          const t = document.createElement("style");
          (t.innerHTML =
            '/*! tailwindcss v4.0.3 | MIT License | https://tailwindcss.com */\n@layer theme, base, components, utilities;\n@layer theme {\n  :root, :host {\n    --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",\n      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";\n    --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;\n    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,\n      "Liberation Mono", "Courier New", monospace;\n    --color-red-50: oklch(0.971 0.013 17.38);\n    --color-red-100: oklch(0.936 0.032 17.717);\n    --color-red-200: oklch(0.885 0.062 18.334);\n    --color-red-300: oklch(0.808 0.114 19.571);\n    --color-red-400: oklch(0.704 0.191 22.216);\n    --color-red-500: oklch(0.637 0.237 25.331);\n    --color-red-600: oklch(0.577 0.245 27.325);\n    --color-red-700: oklch(0.505 0.213 27.518);\n    --color-red-800: oklch(0.444 0.177 26.899);\n    --color-red-900: oklch(0.396 0.141 25.723);\n    --color-red-950: oklch(0.258 0.092 26.042);\n    --color-orange-50: oklch(0.98 0.016 73.684);\n    --color-orange-100: oklch(0.954 0.038 75.164);\n    --color-orange-200: oklch(0.901 0.076 70.697);\n    --color-orange-300: oklch(0.837 0.128 66.29);\n    --color-orange-400: oklch(0.75 0.183 55.934);\n    --color-orange-500: oklch(0.705 0.213 47.604);\n    --color-orange-600: oklch(0.646 0.222 41.116);\n    --color-orange-700: oklch(0.553 0.195 38.402);\n    --color-orange-800: oklch(0.47 0.157 37.304);\n    --color-orange-900: oklch(0.408 0.123 38.172);\n    --color-orange-950: oklch(0.266 0.079 36.259);\n    --color-amber-50: oklch(0.987 0.022 95.277);\n    --color-amber-100: oklch(0.962 0.059 95.617);\n    --color-amber-200: oklch(0.924 0.12 95.746);\n    --color-amber-300: oklch(0.879 0.169 91.605);\n    --color-amber-400: oklch(0.828 0.189 84.429);\n    --color-amber-500: oklch(0.769 0.188 70.08);\n    --color-amber-600: oklch(0.666 0.179 58.318);\n    --color-amber-700: oklch(0.555 0.163 48.998);\n    --color-amber-800: oklch(0.473 0.137 46.201);\n    --color-amber-900: oklch(0.414 0.112 45.904);\n    --color-amber-950: oklch(0.279 0.077 45.635);\n    --color-yellow-50: oklch(0.987 0.026 102.212);\n    --color-yellow-100: oklch(0.973 0.071 103.193);\n    --color-yellow-200: oklch(0.945 0.129 101.54);\n    --color-yellow-300: oklch(0.905 0.182 98.111);\n    --color-yellow-400: oklch(0.852 0.199 91.936);\n    --color-yellow-500: oklch(0.795 0.184 86.047);\n    --color-yellow-600: oklch(0.681 0.162 75.834);\n    --color-yellow-700: oklch(0.554 0.135 66.442);\n    --color-yellow-800: oklch(0.476 0.114 61.907);\n    --color-yellow-900: oklch(0.421 0.095 57.708);\n    --color-yellow-950: oklch(0.286 0.066 53.813);\n    --color-lime-50: oklch(0.986 0.031 120.757);\n    --color-lime-100: oklch(0.967 0.067 122.328);\n    --color-lime-200: oklch(0.938 0.127 124.321);\n    --color-lime-300: oklch(0.897 0.196 126.665);\n    --color-lime-400: oklch(0.841 0.238 128.85);\n    --color-lime-500: oklch(0.768 0.233 130.85);\n    --color-lime-600: oklch(0.648 0.2 131.684);\n    --color-lime-700: oklch(0.532 0.157 131.589);\n    --color-lime-800: oklch(0.453 0.124 130.933);\n    --color-lime-900: oklch(0.405 0.101 131.063);\n    --color-lime-950: oklch(0.274 0.072 132.109);\n    --color-green-50: oklch(0.982 0.018 155.826);\n    --color-green-100: oklch(0.962 0.044 156.743);\n    --color-green-200: oklch(0.925 0.084 155.995);\n    --color-green-300: oklch(0.871 0.15 154.449);\n    --color-green-400: oklch(0.792 0.209 151.711);\n    --color-green-500: oklch(0.723 0.219 149.579);\n    --color-green-600: oklch(0.627 0.194 149.214);\n    --color-green-700: oklch(0.527 0.154 150.069);\n    --color-green-800: oklch(0.448 0.119 151.328);\n    --color-green-900: oklch(0.393 0.095 152.535);\n    --color-green-950: oklch(0.266 0.065 152.934);\n    --color-emerald-50: oklch(0.979 0.021 166.113);\n    --color-emerald-100: oklch(0.95 0.052 163.051);\n    --color-emerald-200: oklch(0.905 0.093 164.15);\n    --color-emerald-300: oklch(0.845 0.143 164.978);\n    --color-emerald-400: oklch(0.765 0.177 163.223);\n    --color-emerald-500: oklch(0.696 0.17 162.48);\n    --color-emerald-600: oklch(0.596 0.145 163.225);\n    --color-emerald-700: oklch(0.508 0.118 165.612);\n    --color-emerald-800: oklch(0.432 0.095 166.913);\n    --color-emerald-900: oklch(0.378 0.077 168.94);\n    --color-emerald-950: oklch(0.262 0.051 172.552);\n    --color-teal-50: oklch(0.984 0.014 180.72);\n    --color-teal-100: oklch(0.953 0.051 180.801);\n    --color-teal-200: oklch(0.91 0.096 180.426);\n    --color-teal-300: oklch(0.855 0.138 181.071);\n    --color-teal-400: oklch(0.777 0.152 181.912);\n    --color-teal-500: oklch(0.704 0.14 182.503);\n    --color-teal-600: oklch(0.6 0.118 184.704);\n    --color-teal-700: oklch(0.511 0.096 186.391);\n    --color-teal-800: oklch(0.437 0.078 188.216);\n    --color-teal-900: oklch(0.386 0.063 188.416);\n    --color-teal-950: oklch(0.277 0.046 192.524);\n    --color-cyan-50: oklch(0.984 0.019 200.873);\n    --color-cyan-100: oklch(0.956 0.045 203.388);\n    --color-cyan-200: oklch(0.917 0.08 205.041);\n    --color-cyan-300: oklch(0.865 0.127 207.078);\n    --color-cyan-400: oklch(0.789 0.154 211.53);\n    --color-cyan-500: oklch(0.715 0.143 215.221);\n    --color-cyan-600: oklch(0.609 0.126 221.723);\n    --color-cyan-700: oklch(0.52 0.105 223.128);\n    --color-cyan-800: oklch(0.45 0.085 224.283);\n    --color-cyan-900: oklch(0.398 0.07 227.392);\n    --color-cyan-950: oklch(0.302 0.056 229.695);\n    --color-sky-50: oklch(0.977 0.013 236.62);\n    --color-sky-100: oklch(0.951 0.026 236.824);\n    --color-sky-200: oklch(0.901 0.058 230.902);\n    --color-sky-300: oklch(0.828 0.111 230.318);\n    --color-sky-400: oklch(0.746 0.16 232.661);\n    --color-sky-500: oklch(0.685 0.169 237.323);\n    --color-sky-600: oklch(0.588 0.158 241.966);\n    --color-sky-700: oklch(0.5 0.134 242.749);\n    --color-sky-800: oklch(0.443 0.11 240.79);\n    --color-sky-900: oklch(0.391 0.09 240.876);\n    --color-sky-950: oklch(0.293 0.066 243.157);\n    --color-blue-50: oklch(0.97 0.014 254.604);\n    --color-blue-100: oklch(0.932 0.032 255.585);\n    --color-blue-200: oklch(0.882 0.059 254.128);\n    --color-blue-300: oklch(0.809 0.105 251.813);\n    --color-blue-400: oklch(0.707 0.165 254.624);\n    --color-blue-500: oklch(0.623 0.214 259.815);\n    --color-blue-600: oklch(0.546 0.245 262.881);\n    --color-blue-700: oklch(0.488 0.243 264.376);\n    --color-blue-800: oklch(0.424 0.199 265.638);\n    --color-blue-900: oklch(0.379 0.146 265.522);\n    --color-blue-950: oklch(0.282 0.091 267.935);\n    --color-indigo-50: oklch(0.962 0.018 272.314);\n    --color-indigo-100: oklch(0.93 0.034 272.788);\n    --color-indigo-200: oklch(0.87 0.065 274.039);\n    --color-indigo-300: oklch(0.785 0.115 274.713);\n    --color-indigo-400: oklch(0.673 0.182 276.935);\n    --color-indigo-500: oklch(0.585 0.233 277.117);\n    --color-indigo-600: oklch(0.511 0.262 276.966);\n    --color-indigo-700: oklch(0.457 0.24 277.023);\n    --color-indigo-800: oklch(0.398 0.195 277.366);\n    --color-indigo-900: oklch(0.359 0.144 278.697);\n    --color-indigo-950: oklch(0.257 0.09 281.288);\n    --color-violet-50: oklch(0.969 0.016 293.756);\n    --color-violet-100: oklch(0.943 0.029 294.588);\n    --color-violet-200: oklch(0.894 0.057 293.283);\n    --color-violet-300: oklch(0.811 0.111 293.571);\n    --color-violet-400: oklch(0.702 0.183 293.541);\n    --color-violet-500: oklch(0.606 0.25 292.717);\n    --color-violet-600: oklch(0.541 0.281 293.009);\n    --color-violet-700: oklch(0.491 0.27 292.581);\n    --color-violet-800: oklch(0.432 0.232 292.759);\n    --color-violet-900: oklch(0.38 0.189 293.745);\n    --color-violet-950: oklch(0.283 0.141 291.089);\n    --color-purple-50: oklch(0.977 0.014 308.299);\n    --color-purple-100: oklch(0.946 0.033 307.174);\n    --color-purple-200: oklch(0.902 0.063 306.703);\n    --color-purple-300: oklch(0.827 0.119 306.383);\n    --color-purple-400: oklch(0.714 0.203 305.504);\n    --color-purple-500: oklch(0.627 0.265 303.9);\n    --color-purple-600: oklch(0.558 0.288 302.321);\n    --color-purple-700: oklch(0.496 0.265 301.924);\n    --color-purple-800: oklch(0.438 0.218 303.724);\n    --color-purple-900: oklch(0.381 0.176 304.987);\n    --color-purple-950: oklch(0.291 0.149 302.717);\n    --color-fuchsia-50: oklch(0.977 0.017 320.058);\n    --color-fuchsia-100: oklch(0.952 0.037 318.852);\n    --color-fuchsia-200: oklch(0.903 0.076 319.62);\n    --color-fuchsia-300: oklch(0.833 0.145 321.434);\n    --color-fuchsia-400: oklch(0.74 0.238 322.16);\n    --color-fuchsia-500: oklch(0.667 0.295 322.15);\n    --color-fuchsia-600: oklch(0.591 0.293 322.896);\n    --color-fuchsia-700: oklch(0.518 0.253 323.949);\n    --color-fuchsia-800: oklch(0.452 0.211 324.591);\n    --color-fuchsia-900: oklch(0.401 0.17 325.612);\n    --color-fuchsia-950: oklch(0.293 0.136 325.661);\n    --color-pink-50: oklch(0.971 0.014 343.198);\n    --color-pink-100: oklch(0.948 0.028 342.258);\n    --color-pink-200: oklch(0.899 0.061 343.231);\n    --color-pink-300: oklch(0.823 0.12 346.018);\n    --color-pink-400: oklch(0.718 0.202 349.761);\n    --color-pink-500: oklch(0.656 0.241 354.308);\n    --color-pink-600: oklch(0.592 0.249 0.584);\n    --color-pink-700: oklch(0.525 0.223 3.958);\n    --color-pink-800: oklch(0.459 0.187 3.815);\n    --color-pink-900: oklch(0.408 0.153 2.432);\n    --color-pink-950: oklch(0.284 0.109 3.907);\n    --color-rose-50: oklch(0.969 0.015 12.422);\n    --color-rose-100: oklch(0.941 0.03 12.58);\n    --color-rose-200: oklch(0.892 0.058 10.001);\n    --color-rose-300: oklch(0.81 0.117 11.638);\n    --color-rose-400: oklch(0.712 0.194 13.428);\n    --color-rose-500: oklch(0.645 0.246 16.439);\n    --color-rose-600: oklch(0.586 0.253 17.585);\n    --color-rose-700: oklch(0.514 0.222 16.935);\n    --color-rose-800: oklch(0.455 0.188 13.697);\n    --color-rose-900: oklch(0.41 0.159 10.272);\n    --color-rose-950: oklch(0.271 0.105 12.094);\n    --color-slate-50: oklch(0.984 0.003 247.858);\n    --color-slate-100: oklch(0.968 0.007 247.896);\n    --color-slate-200: oklch(0.929 0.013 255.508);\n    --color-slate-300: oklch(0.869 0.022 252.894);\n    --color-slate-400: oklch(0.704 0.04 256.788);\n    --color-slate-500: oklch(0.554 0.046 257.417);\n    --color-slate-600: oklch(0.446 0.043 257.281);\n    --color-slate-700: oklch(0.372 0.044 257.287);\n    --color-slate-800: oklch(0.279 0.041 260.031);\n    --color-slate-900: oklch(0.208 0.042 265.755);\n    --color-slate-950: oklch(0.129 0.042 264.695);\n    --color-gray-50: oklch(0.985 0.002 247.839);\n    --color-gray-100: oklch(0.967 0.003 264.542);\n    --color-gray-200: oklch(0.928 0.006 264.531);\n    --color-gray-300: oklch(0.872 0.01 258.338);\n    --color-gray-400: oklch(0.707 0.022 261.325);\n    --color-gray-500: oklch(0.551 0.027 264.364);\n    --color-gray-600: oklch(0.446 0.03 256.802);\n    --color-gray-700: oklch(0.373 0.034 259.733);\n    --color-gray-800: oklch(0.278 0.033 256.848);\n    --color-gray-900: oklch(0.21 0.034 264.665);\n    --color-gray-950: oklch(0.13 0.028 261.692);\n    --color-zinc-50: oklch(0.985 0 0);\n    --color-zinc-100: oklch(0.967 0.001 286.375);\n    --color-zinc-200: oklch(0.92 0.004 286.32);\n    --color-zinc-300: oklch(0.871 0.006 286.286);\n    --color-zinc-400: oklch(0.705 0.015 286.067);\n    --color-zinc-500: oklch(0.552 0.016 285.938);\n    --color-zinc-600: oklch(0.442 0.017 285.786);\n    --color-zinc-700: oklch(0.37 0.013 285.805);\n    --color-zinc-800: oklch(0.274 0.006 286.033);\n    --color-zinc-900: oklch(0.21 0.006 285.885);\n    --color-zinc-950: oklch(0.141 0.005 285.823);\n    --color-neutral-50: oklch(0.985 0 0);\n    --color-neutral-100: oklch(0.97 0 0);\n    --color-neutral-200: oklch(0.922 0 0);\n    --color-neutral-300: oklch(0.87 0 0);\n    --color-neutral-400: oklch(0.708 0 0);\n    --color-neutral-500: oklch(0.556 0 0);\n    --color-neutral-600: oklch(0.439 0 0);\n    --color-neutral-700: oklch(0.371 0 0);\n    --color-neutral-800: oklch(0.269 0 0);\n    --color-neutral-900: oklch(0.205 0 0);\n    --color-neutral-950: oklch(0.145 0 0);\n    --color-stone-50: oklch(0.985 0.001 106.423);\n    --color-stone-100: oklch(0.97 0.001 106.424);\n    --color-stone-200: oklch(0.923 0.003 48.717);\n    --color-stone-300: oklch(0.869 0.005 56.366);\n    --color-stone-400: oklch(0.709 0.01 56.259);\n    --color-stone-500: oklch(0.553 0.013 58.071);\n    --color-stone-600: oklch(0.444 0.011 73.639);\n    --color-stone-700: oklch(0.374 0.01 67.558);\n    --color-stone-800: oklch(0.268 0.007 34.298);\n    --color-stone-900: oklch(0.216 0.006 56.043);\n    --color-stone-950: oklch(0.147 0.004 49.25);\n    --color-black: #000;\n    --color-white: #fff;\n    --spacing: 0.25rem;\n    --breakpoint-sm: 40rem;\n    --breakpoint-md: 48rem;\n    --breakpoint-lg: 64rem;\n    --breakpoint-xl: 80rem;\n    --breakpoint-2xl: 96rem;\n    --container-3xs: 16rem;\n    --container-2xs: 18rem;\n    --container-xs: 20rem;\n    --container-sm: 24rem;\n    --container-md: 28rem;\n    --container-lg: 32rem;\n    --container-xl: 36rem;\n    --container-2xl: 42rem;\n    --container-3xl: 48rem;\n    --container-4xl: 56rem;\n    --container-5xl: 64rem;\n    --container-6xl: 72rem;\n    --container-7xl: 80rem;\n    --text-xs: 0.75rem;\n    --text-xs--line-height: calc(1 / 0.75);\n    --text-sm: 0.875rem;\n    --text-sm--line-height: calc(1.25 / 0.875);\n    --text-base: 1rem;\n    --text-base--line-height: calc(1.5 / 1);\n    --text-lg: 1.125rem;\n    --text-lg--line-height: calc(1.75 / 1.125);\n    --text-xl: 1.25rem;\n    --text-xl--line-height: calc(1.75 / 1.25);\n    --text-2xl: 1.5rem;\n    --text-2xl--line-height: calc(2 / 1.5);\n    --text-3xl: 1.875rem;\n    --text-3xl--line-height: calc(2.25 / 1.875);\n    --text-4xl: 2.25rem;\n    --text-4xl--line-height: calc(2.5 / 2.25);\n    --text-5xl: 3rem;\n    --text-5xl--line-height: 1;\n    --text-6xl: 3.75rem;\n    --text-6xl--line-height: 1;\n    --text-7xl: 4.5rem;\n    --text-7xl--line-height: 1;\n    --text-8xl: 6rem;\n    --text-8xl--line-height: 1;\n    --text-9xl: 8rem;\n    --text-9xl--line-height: 1;\n    --font-weight-thin: 100;\n    --font-weight-extralight: 200;\n    --font-weight-light: 300;\n    --font-weight-normal: 400;\n    --font-weight-medium: 500;\n    --font-weight-semibold: 600;\n    --font-weight-bold: 700;\n    --font-weight-extrabold: 800;\n    --font-weight-black: 900;\n    --tracking-tighter: -0.05em;\n    --tracking-tight: -0.025em;\n    --tracking-normal: 0em;\n    --tracking-wide: 0.025em;\n    --tracking-wider: 0.05em;\n    --tracking-widest: 0.1em;\n    --leading-tight: 1.25;\n    --leading-snug: 1.375;\n    --leading-normal: 1.5;\n    --leading-relaxed: 1.625;\n    --leading-loose: 2;\n    --radius-xs: 0.125rem;\n    --radius-sm: 0.25rem;\n    --radius-md: 0.375rem;\n    --radius-lg: 0.5rem;\n    --radius-xl: 0.75rem;\n    --radius-2xl: 1rem;\n    --radius-3xl: 1.5rem;\n    --radius-4xl: 2rem;\n    --shadow-2xs: 0 1px rgb(0 0 0 / 0.05);\n    --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),\n      0 2px 4px -2px rgb(0 0 0 / 0.1);\n    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),\n      0 4px 6px -4px rgb(0 0 0 / 0.1);\n    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),\n      0 8px 10px -6px rgb(0 0 0 / 0.1);\n    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n    --inset-shadow-2xs: inset 0 1px rgb(0 0 0 / 0.05);\n    --inset-shadow-xs: inset 0 1px 1px rgb(0 0 0 / 0.05);\n    --inset-shadow-sm: inset 0 2px 4px rgb(0 0 0 / 0.05);\n    --drop-shadow-xs: 0 1px 1px rgb(0 0 0 / 0.05);\n    --drop-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.15);\n    --drop-shadow-md: 0 3px 3px rgb(0 0 0 / 0.12);\n    --drop-shadow-lg: 0 4px 4px rgb(0 0 0 / 0.15);\n    --drop-shadow-xl: 0 9px 7px rgb(0 0 0 / 0.1);\n    --drop-shadow-2xl: 0 25px 25px rgb(0 0 0 / 0.15);\n    --ease-in: cubic-bezier(0.4, 0, 1, 1);\n    --ease-out: cubic-bezier(0, 0, 0.2, 1);\n    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);\n    --animate-spin: spin 1s linear infinite;\n    --animate-ping: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;\n    --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n    --animate-bounce: bounce 1s infinite;\n    --blur-xs: 4px;\n    --blur-sm: 8px;\n    --blur-md: 12px;\n    --blur-lg: 16px;\n    --blur-xl: 24px;\n    --blur-2xl: 40px;\n    --blur-3xl: 64px;\n    --perspective-dramatic: 100px;\n    --perspective-near: 300px;\n    --perspective-normal: 500px;\n    --perspective-midrange: 800px;\n    --perspective-distant: 1200px;\n    --aspect-video: 16 / 9;\n    --default-transition-duration: 150ms;\n    --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n    --default-font-family: var(--font-sans);\n    --default-font-feature-settings: var(--font-sans--font-feature-settings);\n    --default-font-variation-settings: var(\n      --font-sans--font-variation-settings\n    );\n    --default-mono-font-family: var(--font-mono);\n    --default-mono-font-feature-settings: var(\n      --font-mono--font-feature-settings\n    );\n    --default-mono-font-variation-settings: var(\n      --font-mono--font-variation-settings\n    );\n  }\n}\n@layer base {\n  *, ::after, ::before, ::backdrop, ::file-selector-button {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n    border: 0 solid;\n  }\n  html, :host {\n    line-height: 1.5;\n    -webkit-text-size-adjust: 100%;\n    -moz-tab-size: 4;\n      -o-tab-size: 4;\n         tab-size: 4;\n    font-family: var( --default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji" );\n    font-feature-settings: var(--default-font-feature-settings, normal);\n    font-variation-settings: var( --default-font-variation-settings, normal );\n    -webkit-tap-highlight-color: transparent;\n  }\n  body {\n    line-height: inherit;\n  }\n  hr {\n    height: 0;\n    color: inherit;\n    border-top-width: 1px;\n  }\n  abbr:where([title]) {\n    -webkit-text-decoration: underline dotted;\n    text-decoration: underline dotted;\n  }\n  h1, h2, h3, h4, h5, h6 {\n    font-size: inherit;\n    font-weight: inherit;\n  }\n  a {\n    color: inherit;\n    -webkit-text-decoration: inherit;\n    text-decoration: inherit;\n  }\n  b, strong {\n    font-weight: bolder;\n  }\n  code, kbd, samp, pre {\n    font-family: var( --default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace );\n    font-feature-settings: var( --default-mono-font-feature-settings, normal );\n    font-variation-settings: var( --default-mono-font-variation-settings, normal );\n    font-size: 1em;\n  }\n  small {\n    font-size: 80%;\n  }\n  sub, sup {\n    font-size: 75%;\n    line-height: 0;\n    position: relative;\n    vertical-align: baseline;\n  }\n  sub {\n    bottom: -0.25em;\n  }\n  sup {\n    top: -0.5em;\n  }\n  table {\n    text-indent: 0;\n    border-color: inherit;\n    border-collapse: collapse;\n  }\n  :-moz-focusring {\n    outline: auto;\n  }\n  progress {\n    vertical-align: baseline;\n  }\n  summary {\n    display: list-item;\n  }\n  ol, ul, menu {\n    list-style: none;\n  }\n  img, svg, video, canvas, audio, iframe, embed, object {\n    display: block;\n    vertical-align: middle;\n  }\n  img, video {\n    max-width: 100%;\n    height: auto;\n  }\n  button, input, select, optgroup, textarea, ::file-selector-button {\n    font: inherit;\n    font-feature-settings: inherit;\n    font-variation-settings: inherit;\n    letter-spacing: inherit;\n    color: inherit;\n    border-radius: 0;\n    background-color: transparent;\n    opacity: 1;\n  }\n  :where(select:is([multiple], [size])) optgroup {\n    font-weight: bolder;\n  }\n  :where(select:is([multiple], [size])) optgroup option {\n    padding-inline-start: 20px;\n  }\n  ::file-selector-button {\n    margin-inline-end: 4px;\n  }\n  ::-moz-placeholder {\n    opacity: 1;\n    color: color-mix(in oklab, currentColor 50%, transparent);\n  }\n  ::placeholder {\n    opacity: 1;\n    color: color-mix(in oklab, currentColor 50%, transparent);\n  }\n  textarea {\n    resize: vertical;\n  }\n  ::-webkit-search-decoration {\n    -webkit-appearance: none;\n  }\n  ::-webkit-date-and-time-value {\n    min-height: 1lh;\n    text-align: inherit;\n  }\n  ::-webkit-datetime-edit {\n    display: inline-flex;\n  }\n  ::-webkit-datetime-edit-fields-wrapper {\n    padding: 0;\n  }\n  ::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {\n    padding-block: 0;\n  }\n  :-moz-ui-invalid {\n    box-shadow: none;\n  }\n  button, input:where([type="button"], [type="reset"], [type="submit"]), ::file-selector-button {\n    -webkit-appearance: button;\n       -moz-appearance: button;\n            appearance: button;\n  }\n  ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {\n    height: auto;\n  }\n  [hidden]:where(:not([hidden="until-found"])) {\n    display: none !important;\n  }\n}\n@layer utilities {\n  .visible {\n    visibility: visible;\n  }\n  .contents {\n    display: contents;\n  }\n  .grid {\n    display: grid;\n  }\n  .hidden {\n    display: none;\n  }\n  .h-full {\n    height: 100%;\n  }\n  .w-full {\n    width: 100%;\n  }\n  .transform {\n    transform: var(--tw-rotate-x) var(--tw-rotate-y) var(--tw-rotate-z) var(--tw-skew-x) var(--tw-skew-y);\n  }\n  .resize {\n    resize: both;\n  }\n  .text-red-500 {\n    color: var(--color-red-500);\n  }\n  .filter {\n    filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);\n  }\n}\n@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n@keyframes ping {\n  75%, 100% {\n    transform: scale(2);\n    opacity: 0;\n  }\n}\n@keyframes pulse {\n  50% {\n    opacity: 0.5;\n  }\n}\n@keyframes bounce {\n  0%, 100% {\n    transform: translateY(-25%);\n    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);\n  }\n  50% {\n    transform: none;\n    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);\n  }\n}\n@property --tw-rotate-x {\n  syntax: "*";\n  inherits: false;\n  initial-value: rotateX(0);\n}\n@property --tw-rotate-y {\n  syntax: "*";\n  inherits: false;\n  initial-value: rotateY(0);\n}\n@property --tw-rotate-z {\n  syntax: "*";\n  inherits: false;\n  initial-value: rotateZ(0);\n}\n@property --tw-skew-x {\n  syntax: "*";\n  inherits: false;\n  initial-value: skewX(0);\n}\n@property --tw-skew-y {\n  syntax: "*";\n  inherits: false;\n  initial-value: skewY(0);\n}\n@property --tw-blur {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-brightness {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-contrast {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-grayscale {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-hue-rotate {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-invert {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-opacity {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-saturate {\n  syntax: "*";\n  inherits: false;\n}\n@property --tw-sepia {\n  syntax: "*";\n  inherits: false;\n}\n'),
            this.shadowdom.appendChild(t),
            U(
              H(ah, { config: this.config.properties, store: this.store }),
              this.shadowdom
            );
        }),
        (this.trigger = (t, e) => {
          (this.config.properties[t] = e),
            window.requestAnimationFrame(() => this.render());
        }),
        (this.resetResponse = () => {
          this.store.unsubscribeAll(), this.store.reset(), this.render();
        }),
        (this.setResponse = (t) => {
          try {
            if (t.base && t.base.string) {
              const e = JSON.parse(t.base.string.toString()),
                n = ((t, e, n) => {
                  var i, r, s, o, a, l, c, h, u;
                  let d = [];
                  const { xPlane: p, yPlane: m, zPlane: f } = t;
                  for (let t = 0; t < n; t++)
                    for (let e = 0; e < n; e++)
                      for (let g = 0; g < n; g++) {
                        let n = !1;
                        (
                          null === (i = p.find((t) => t.y == e && t.z == g)) ||
                          void 0 === i
                            ? void 0
                            : i.found
                        )
                          ? (n =
                              (null ===
                                (r = m.find((e) => e.x == t && e.z == g)) ||
                              void 0 === r
                                ? void 0
                                : r.found) &&
                              (null ===
                                (s = f.find((n) => n.x == t && n.y == e)) ||
                              void 0 === s
                                ? void 0
                                : s.found))
                          : (
                              null ===
                                (o = m.find((e) => e.x == t && e.z == g)) ||
                              void 0 === o
                                ? void 0
                                : o.found
                            )
                          ? (n =
                              (null ===
                                (a = f.find((n) => n.x == t && n.y == e)) ||
                              void 0 === a
                                ? void 0
                                : a.found) &&
                              (null ===
                                (l = p.find((t) => t.y == e && t.z == g)) ||
                              void 0 === l
                                ? void 0
                                : l.found))
                          : (null ===
                              (c = f.find((n) => n.x == t && n.y == e)) ||
                            void 0 === c
                              ? void 0
                              : c.found) &&
                            (n =
                              (null ===
                                (h = p.find((t) => t.y == e && t.z == g)) ||
                              void 0 === h
                                ? void 0
                                : h.found) &&
                              (null ===
                                (u = m.find((e) => e.x == t && e.z == g)) ||
                              void 0 === u
                                ? void 0
                                : u.found)),
                          n && d.push({ x: t, y: e, z: g });
                      }
                  return d;
                })(
                  { xPlane: e.xPlane, yPlane: e.yPlane, zPlane: e.zPlane },
                  this.config.properties.cubePixelSize,
                  +this.config.properties.gridDivisions
                );
              this.resetResponse(), this.store.restoreState({ cubes: n }, []);
            }
          } catch (t) {
            this.resetResponse();
          }
        }),
        (this.off = () => {}),
        (this.on = (t) => {}),
        (this.getResponse = () => {
          var t, e, n, i;
          if (
            (null === (t = this.store) || void 0 === t
              ? void 0
              : t.getState()) &&
            (null === (e = this.store) || void 0 === e
              ? void 0
              : e.getState()) !== this.initialState
          ) {
            this.config.properties.cubePixelSize;
            const t = +this.config.properties.gridDivisions,
              e =
                (null ===
                  (i =
                    null === (n = this.store) || void 0 === n
                      ? void 0
                      : n.getState()) || void 0 === i
                  ? void 0
                  : i.cubes) || [],
              r = hh(e, "y", 0, t),
              s = hh(e, "x", 0, t),
              o = hh(e, "z", 0, t);
            return {
              base: {
                string: JSON.stringify({ xPlane: s, yPlane: r, zPlane: o }),
              },
            };
          }
        }),
        (this.oncompleted = () => {
          this.store.unsubscribeAll();
        }),
        (this.getState = () =>
          JSON.stringify({
            state: this.store.getState(),
            log: this.store.getActions(),
          })),
        p && p.register(this);
    }
  })();
  return uh;
});
