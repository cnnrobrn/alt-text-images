import Be, { useState as $, useEffect as gr } from "react";
import { framer as re } from "framer-plugin";
var ee = { exports: {} }, V = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var We;
function vr() {
  if (We) return V;
  We = 1;
  var E = Be, Y = Symbol.for("react.element"), y = Symbol.for("react.fragment"), O = Object.prototype.hasOwnProperty, h = E.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, C = { key: !0, ref: !0, __self: !0, __source: !0 };
  function S(A, x, k) {
    var g, w = {}, j = null, b = null;
    k !== void 0 && (j = "" + k), x.key !== void 0 && (j = "" + x.key), x.ref !== void 0 && (b = x.ref);
    for (g in x) O.call(x, g) && !C.hasOwnProperty(g) && (w[g] = x[g]);
    if (A && A.defaultProps) for (g in x = A.defaultProps, x) w[g] === void 0 && (w[g] = x[g]);
    return { $$typeof: Y, type: A, key: j, ref: b, props: w, _owner: h.current };
  }
  return V.Fragment = y, V.jsx = S, V.jsxs = S, V;
}
var M = {}, ze;
function hr() {
  if (ze) return M;
  ze = 1;
  var E = {};
  /**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  return E.NODE_ENV !== "production" && (function() {
    var Y = Be, y = Symbol.for("react.element"), O = Symbol.for("react.portal"), h = Symbol.for("react.fragment"), C = Symbol.for("react.strict_mode"), S = Symbol.for("react.profiler"), A = Symbol.for("react.provider"), x = Symbol.for("react.context"), k = Symbol.for("react.forward_ref"), g = Symbol.for("react.suspense"), w = Symbol.for("react.suspense_list"), j = Symbol.for("react.memo"), b = Symbol.for("react.lazy"), K = Symbol.for("react.offscreen"), P = Symbol.iterator, te = "@@iterator";
    function ne(e) {
      if (e === null || typeof e != "object")
        return null;
      var r = P && e[P] || e[te];
      return typeof r == "function" ? r : null;
    }
    var I = Y.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function m(e) {
      {
        for (var r = arguments.length, t = new Array(r > 1 ? r - 1 : 0), n = 1; n < r; n++)
          t[n - 1] = arguments[n];
        ae("error", e, t);
      }
    }
    function ae(e, r, t) {
      {
        var n = I.ReactDebugCurrentFrame, l = n.getStackAddendum();
        l !== "" && (r += "%s", t = t.concat([l]));
        var f = t.map(function(s) {
          return String(s);
        });
        f.unshift("Warning: " + r), Function.prototype.apply.call(console[e], console, f);
      }
    }
    var J = !1, oe = !1, a = !1, u = !1, c = !1, d;
    d = Symbol.for("react.module.reference");
    function F(e) {
      return !!(typeof e == "string" || typeof e == "function" || e === h || e === S || c || e === C || e === g || e === w || u || e === K || J || oe || a || typeof e == "object" && e !== null && (e.$$typeof === b || e.$$typeof === j || e.$$typeof === A || e.$$typeof === x || e.$$typeof === k || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      e.$$typeof === d || e.getModuleId !== void 0));
    }
    function L(e, r, t) {
      var n = e.displayName;
      if (n)
        return n;
      var l = r.displayName || r.name || "";
      return l !== "" ? t + "(" + l + ")" : t;
    }
    function q(e) {
      return e.displayName || "Context";
    }
    function D(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && m("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case h:
          return "Fragment";
        case O:
          return "Portal";
        case S:
          return "Profiler";
        case C:
          return "StrictMode";
        case g:
          return "Suspense";
        case w:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case x:
            var r = e;
            return q(r) + ".Consumer";
          case A:
            var t = e;
            return q(t._context) + ".Provider";
          case k:
            return L(e, e.render, "ForwardRef");
          case j:
            var n = e.displayName || null;
            return n !== null ? n : D(e.type) || "Memo";
          case b: {
            var l = e, f = l._payload, s = l._init;
            try {
              return D(s(f));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var W = Object.assign, U = 0, ge, ve, he, xe, ye, me, be;
    function _e() {
    }
    _e.__reactDisabledLog = !0;
    function Ge() {
      {
        if (U === 0) {
          ge = console.log, ve = console.info, he = console.warn, xe = console.error, ye = console.group, me = console.groupCollapsed, be = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: _e,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        U++;
      }
    }
    function Le() {
      {
        if (U--, U === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: W({}, e, {
              value: ge
            }),
            info: W({}, e, {
              value: ve
            }),
            warn: W({}, e, {
              value: he
            }),
            error: W({}, e, {
              value: xe
            }),
            group: W({}, e, {
              value: ye
            }),
            groupCollapsed: W({}, e, {
              value: me
            }),
            groupEnd: W({}, e, {
              value: be
            })
          });
        }
        U < 0 && m("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var ie = I.ReactCurrentDispatcher, se;
    function H(e, r, t) {
      {
        if (se === void 0)
          try {
            throw Error();
          } catch (l) {
            var n = l.stack.trim().match(/\n( *(at )?)/);
            se = n && n[1] || "";
          }
        return `
` + se + e;
      }
    }
    var le = !1, X;
    {
      var Ue = typeof WeakMap == "function" ? WeakMap : Map;
      X = new Ue();
    }
    function Re(e, r) {
      if (!e || le)
        return "";
      {
        var t = X.get(e);
        if (t !== void 0)
          return t;
      }
      var n;
      le = !0;
      var l = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var f;
      f = ie.current, ie.current = null, Ge();
      try {
        if (r) {
          var s = function() {
            throw Error();
          };
          if (Object.defineProperty(s.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(s, []);
            } catch (R) {
              n = R;
            }
            Reflect.construct(e, [], s);
          } else {
            try {
              s.call();
            } catch (R) {
              n = R;
            }
            e.call(s.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (R) {
            n = R;
          }
          e();
        }
      } catch (R) {
        if (R && n && typeof R.stack == "string") {
          for (var i = R.stack.split(`
`), _ = n.stack.split(`
`), p = i.length - 1, v = _.length - 1; p >= 1 && v >= 0 && i[p] !== _[v]; )
            v--;
          for (; p >= 1 && v >= 0; p--, v--)
            if (i[p] !== _[v]) {
              if (p !== 1 || v !== 1)
                do
                  if (p--, v--, v < 0 || i[p] !== _[v]) {
                    var T = `
` + i[p].replace(" at new ", " at ");
                    return e.displayName && T.includes("<anonymous>") && (T = T.replace("<anonymous>", e.displayName)), typeof e == "function" && X.set(e, T), T;
                  }
                while (p >= 1 && v >= 0);
              break;
            }
        }
      } finally {
        le = !1, ie.current = f, Le(), Error.prepareStackTrace = l;
      }
      var G = e ? e.displayName || e.name : "", z = G ? H(G) : "";
      return typeof e == "function" && X.set(e, z), z;
    }
    function Ne(e, r, t) {
      return Re(e, !1);
    }
    function Ve(e) {
      var r = e.prototype;
      return !!(r && r.isReactComponent);
    }
    function Z(e, r, t) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return Re(e, Ve(e));
      if (typeof e == "string")
        return H(e);
      switch (e) {
        case g:
          return H("Suspense");
        case w:
          return H("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case k:
            return Ne(e.render);
          case j:
            return Z(e.type, r, t);
          case b: {
            var n = e, l = n._payload, f = n._init;
            try {
              return Z(f(l), r, t);
            } catch {
            }
          }
        }
      return "";
    }
    var N = Object.prototype.hasOwnProperty, Ee = {}, Te = I.ReactDebugCurrentFrame;
    function Q(e) {
      if (e) {
        var r = e._owner, t = Z(e.type, e._source, r ? r.type : null);
        Te.setExtraStackFrame(t);
      } else
        Te.setExtraStackFrame(null);
    }
    function Me(e, r, t, n, l) {
      {
        var f = Function.call.bind(N);
        for (var s in e)
          if (f(e, s)) {
            var i = void 0;
            try {
              if (typeof e[s] != "function") {
                var _ = Error((n || "React class") + ": " + t + " type `" + s + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[s] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw _.name = "Invariant Violation", _;
              }
              i = e[s](r, s, n, t, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (p) {
              i = p;
            }
            i && !(i instanceof Error) && (Q(l), m("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", n || "React class", t, s, typeof i), Q(null)), i instanceof Error && !(i.message in Ee) && (Ee[i.message] = !0, Q(l), m("Failed %s type: %s", t, i.message), Q(null));
          }
      }
    }
    var Ke = Array.isArray;
    function ce(e) {
      return Ke(e);
    }
    function Je(e) {
      {
        var r = typeof Symbol == "function" && Symbol.toStringTag, t = r && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t;
      }
    }
    function qe(e) {
      try {
        return we(e), !1;
      } catch {
        return !0;
      }
    }
    function we(e) {
      return "" + e;
    }
    function je(e) {
      if (qe(e))
        return m("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Je(e)), we(e);
    }
    var Ce = I.ReactCurrentOwner, He = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Se, Ae;
    function Xe(e) {
      if (N.call(e, "ref")) {
        var r = Object.getOwnPropertyDescriptor(e, "ref").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.ref !== void 0;
    }
    function Ze(e) {
      if (N.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning)
          return !1;
      }
      return e.key !== void 0;
    }
    function Qe(e, r) {
      typeof e.ref == "string" && Ce.current;
    }
    function er(e, r) {
      {
        var t = function() {
          Se || (Se = !0, m("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "key", {
          get: t,
          configurable: !0
        });
      }
    }
    function rr(e, r) {
      {
        var t = function() {
          Ae || (Ae = !0, m("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", r));
        };
        t.isReactWarning = !0, Object.defineProperty(e, "ref", {
          get: t,
          configurable: !0
        });
      }
    }
    var tr = function(e, r, t, n, l, f, s) {
      var i = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: y,
        // Built-in properties that belong on the element
        type: e,
        key: r,
        ref: t,
        props: s,
        // Record the component responsible for creating this element.
        _owner: f
      };
      return i._store = {}, Object.defineProperty(i._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(i, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: n
      }), Object.defineProperty(i, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: l
      }), Object.freeze && (Object.freeze(i.props), Object.freeze(i)), i;
    };
    function nr(e, r, t, n, l) {
      {
        var f, s = {}, i = null, _ = null;
        t !== void 0 && (je(t), i = "" + t), Ze(r) && (je(r.key), i = "" + r.key), Xe(r) && (_ = r.ref, Qe(r, l));
        for (f in r)
          N.call(r, f) && !He.hasOwnProperty(f) && (s[f] = r[f]);
        if (e && e.defaultProps) {
          var p = e.defaultProps;
          for (f in p)
            s[f] === void 0 && (s[f] = p[f]);
        }
        if (i || _) {
          var v = typeof e == "function" ? e.displayName || e.name || "Unknown" : e;
          i && er(s, v), _ && rr(s, v);
        }
        return tr(e, i, _, l, n, Ce.current, s);
      }
    }
    var ue = I.ReactCurrentOwner, ke = I.ReactDebugCurrentFrame;
    function B(e) {
      if (e) {
        var r = e._owner, t = Z(e.type, e._source, r ? r.type : null);
        ke.setExtraStackFrame(t);
      } else
        ke.setExtraStackFrame(null);
    }
    var fe;
    fe = !1;
    function de(e) {
      return typeof e == "object" && e !== null && e.$$typeof === y;
    }
    function Pe() {
      {
        if (ue.current) {
          var e = D(ue.current.type);
          if (e)
            return `

Check the render method of \`` + e + "`.";
        }
        return "";
      }
    }
    function ar(e) {
      return "";
    }
    var Oe = {};
    function or(e) {
      {
        var r = Pe();
        if (!r) {
          var t = typeof e == "string" ? e : e.displayName || e.name;
          t && (r = `

Check the top-level render call using <` + t + ">.");
        }
        return r;
      }
    }
    function Ie(e, r) {
      {
        if (!e._store || e._store.validated || e.key != null)
          return;
        e._store.validated = !0;
        var t = or(r);
        if (Oe[t])
          return;
        Oe[t] = !0;
        var n = "";
        e && e._owner && e._owner !== ue.current && (n = " It was passed a child from " + D(e._owner.type) + "."), B(e), m('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', t, n), B(null);
      }
    }
    function Fe(e, r) {
      {
        if (typeof e != "object")
          return;
        if (ce(e))
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            de(n) && Ie(n, r);
          }
        else if (de(e))
          e._store && (e._store.validated = !0);
        else if (e) {
          var l = ne(e);
          if (typeof l == "function" && l !== e.entries)
            for (var f = l.call(e), s; !(s = f.next()).done; )
              de(s.value) && Ie(s.value, r);
        }
      }
    }
    function ir(e) {
      {
        var r = e.type;
        if (r == null || typeof r == "string")
          return;
        var t;
        if (typeof r == "function")
          t = r.propTypes;
        else if (typeof r == "object" && (r.$$typeof === k || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        r.$$typeof === j))
          t = r.propTypes;
        else
          return;
        if (t) {
          var n = D(r);
          Me(t, e.props, "prop", n, e);
        } else if (r.PropTypes !== void 0 && !fe) {
          fe = !0;
          var l = D(r);
          m("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", l || "Unknown");
        }
        typeof r.getDefaultProps == "function" && !r.getDefaultProps.isReactClassApproved && m("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function sr(e) {
      {
        for (var r = Object.keys(e.props), t = 0; t < r.length; t++) {
          var n = r[t];
          if (n !== "children" && n !== "key") {
            B(e), m("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", n), B(null);
            break;
          }
        }
        e.ref !== null && (B(e), m("Invalid attribute `ref` supplied to `React.Fragment`."), B(null));
      }
    }
    var De = {};
    function $e(e, r, t, n, l, f) {
      {
        var s = F(e);
        if (!s) {
          var i = "";
          (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (i += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var _ = ar();
          _ ? i += _ : i += Pe();
          var p;
          e === null ? p = "null" : ce(e) ? p = "array" : e !== void 0 && e.$$typeof === y ? (p = "<" + (D(e.type) || "Unknown") + " />", i = " Did you accidentally export a JSX literal instead of a component?") : p = typeof e, m("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", p, i);
        }
        var v = nr(e, r, t, l, f);
        if (v == null)
          return v;
        if (s) {
          var T = r.children;
          if (T !== void 0)
            if (n)
              if (ce(T)) {
                for (var G = 0; G < T.length; G++)
                  Fe(T[G], e);
                Object.freeze && Object.freeze(T);
              } else
                m("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Fe(T, e);
        }
        if (N.call(r, "key")) {
          var z = D(e), R = Object.keys(r).filter(function(pr) {
            return pr !== "key";
          }), pe = R.length > 0 ? "{key: someKey, " + R.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!De[z + pe]) {
            var dr = R.length > 0 ? "{" + R.join(": ..., ") + ": ...}" : "{}";
            m(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, pe, z, dr, z), De[z + pe] = !0;
          }
        }
        return e === h ? sr(v) : ir(v), v;
      }
    }
    function lr(e, r, t) {
      return $e(e, r, t, !0);
    }
    function cr(e, r, t) {
      return $e(e, r, t, !1);
    }
    var ur = cr, fr = lr;
    M.Fragment = h, M.jsx = ur, M.jsxs = fr;
  })(), M;
}
var Ye;
function xr() {
  if (Ye) return ee.exports;
  Ye = 1;
  var E = {};
  return E.NODE_ENV === "production" ? ee.exports = vr() : ee.exports = hr(), ee.exports;
}
var o = xr();
function br() {
  const [E, Y] = $(""), [y, O] = $([]), [h, C] = $(/* @__PURE__ */ new Set()), [S, A] = $(!1), [x, k] = $(!1), [g, w] = $(!1), [j, b] = $(""), [K, P] = $("");
  gr(() => {
    const a = localStorage.getItem("openai_api_key");
    a && Y(a);
  }, []);
  const te = () => {
    localStorage.setItem("openai_api_key", E), b("API key saved"), setTimeout(() => b(""), 3e3);
  }, ne = async () => {
    A(!0), P(""), O([]);
    try {
      const a = await re.getCurrentPageNodes(), u = [];
      for (const c of a)
        if (c.type === "Image" || c.__class === "ImageNode")
          try {
            const d = await c.getImageUrl?.() || c.image || "", F = await c.getAltText?.() || c.altText || await c.getPluginData?.("altText") || null;
            d && !F && u.push({
              nodeId: c.id,
              url: d,
              currentAltText: F
            });
          } catch (d) {
            console.error(`Error processing node ${c.id}:`, d);
          }
      O(u), b(`Found ${u.length} images without alt text`), C(new Set(u.map((c) => c.nodeId)));
    } catch (a) {
      P(`Error analyzing page: ${a.message}`);
    } finally {
      A(!1);
    }
  }, I = async (a) => {
    const u = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${E}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate concise, descriptive alt text for this image. The alt text should be brief but descriptive (under 125 characters), describe what the image shows, and be written in a natural way."
              },
              {
                type: "image_url",
                image_url: {
                  url: a,
                  detail: "auto"
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });
    if (!u.ok) {
      const d = await u.json();
      throw new Error(d.error?.message || "Failed to generate alt text");
    }
    return (await u.json()).choices[0].message.content.trim();
  }, m = async () => {
    if (!E) {
      P("Please enter your OpenAI API key");
      return;
    }
    if (h.size === 0) {
      P("Please select at least one image");
      return;
    }
    k(!0), P(""), b("Generating alt text...");
    const a = [...y];
    let u = 0, c = 0;
    for (let d = 0; d < a.length; d++) {
      const F = a[d];
      if (h.has(F.nodeId))
        try {
          b(`Generating alt text for image ${u + c + 1}/${h.size}...`), u > 0 && await new Promise((q) => setTimeout(q, 2e3));
          const L = await I(F.url);
          a[d].generatedAltText = L, u++;
        } catch (L) {
          console.error(`Error generating alt text for ${F.url}:`, L), c++;
        }
    }
    O(a), b(`Generated alt text for ${u} images${c > 0 ? `, ${c} failed` : ""}`), k(!1);
  }, ae = async () => {
    w(!0), P(""), b("Applying alt text...");
    let a = 0, u = 0;
    try {
      for (const c of y)
        if (c.generatedAltText)
          try {
            const d = await re.getNode(c.nodeId);
            d && (d.setAltText ? await d.setAltText(c.generatedAltText) : d.setPluginData ? await d.setPluginData("altText", c.generatedAltText) : await re.setAttributes(c.nodeId, {
              altText: c.generatedAltText
            }), a++);
          } catch (d) {
            console.error(`Error applying alt text to ${c.nodeId}:`, d), u++;
          }
      b(`Applied alt text to ${a} images${u > 0 ? `, ${u} failed` : ""}`), a > 0 && setTimeout(() => {
        O([]), C(/* @__PURE__ */ new Set());
      }, 2e3);
    } catch (c) {
      P(`Error applying alt text: ${c.message}`);
    } finally {
      w(!1);
    }
  }, J = (a) => {
    const u = new Set(h);
    u.has(a) ? u.delete(a) : u.add(a), C(u);
  }, oe = () => {
    h.size === y.length ? C(/* @__PURE__ */ new Set()) : C(new Set(y.map((a) => a.nodeId)));
  };
  return /* @__PURE__ */ o.jsxs("div", { style: { padding: "20px", fontFamily: "Inter, sans-serif", height: "100%", overflowY: "auto" }, children: [
    /* @__PURE__ */ o.jsx("h2", { style: { marginBottom: "20px" }, children: "🖼️ Alt Text Generator" }),
    /* @__PURE__ */ o.jsxs("div", { style: { marginBottom: "20px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "8px" }, children: [
      /* @__PURE__ */ o.jsx("label", { style: { display: "block", marginBottom: "8px", fontWeight: "bold" }, children: "OpenAI API Key" }),
      /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
        /* @__PURE__ */ o.jsx(
          "input",
          {
            type: "password",
            value: E,
            onChange: (a) => Y(a.target.value),
            placeholder: "sk-...",
            style: {
              flex: 1,
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }
          }
        ),
        /* @__PURE__ */ o.jsx(
          "button",
          {
            onClick: te,
            style: {
              padding: "8px 16px",
              backgroundColor: "#0099ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            },
            children: "Save"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ o.jsx("div", { style: { marginBottom: "20px" }, children: /* @__PURE__ */ o.jsx(
      "button",
      {
        onClick: ne,
        disabled: S || x || g,
        style: {
          width: "100%",
          padding: "12px",
          backgroundColor: S ? "#ccc" : "#0099ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: S ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "bold"
        },
        children: S ? "Analyzing..." : "🔍 Find Images Without Alt Text"
      }
    ) }),
    j && /* @__PURE__ */ o.jsx("div", { style: {
      padding: "10px",
      backgroundColor: "#e3f2fd",
      color: "#1976d2",
      borderRadius: "4px",
      marginBottom: "15px"
    }, children: j }),
    K && /* @__PURE__ */ o.jsx("div", { style: {
      padding: "10px",
      backgroundColor: "#ffebee",
      color: "#c62828",
      borderRadius: "4px",
      marginBottom: "15px"
    }, children: K }),
    y.length > 0 && /* @__PURE__ */ o.jsxs(o.Fragment, { children: [
      /* @__PURE__ */ o.jsxs("div", { style: { marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center" }, children: [
        /* @__PURE__ */ o.jsx(
          "button",
          {
            onClick: oe,
            style: {
              padding: "6px 12px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer"
            },
            children: h.size === y.length ? "Deselect All" : "Select All"
          }
        ),
        /* @__PURE__ */ o.jsxs("span", { style: { fontSize: "14px", color: "#666" }, children: [
          h.size,
          " of ",
          y.length,
          " selected"
        ] })
      ] }),
      /* @__PURE__ */ o.jsx("div", { style: {
        maxHeight: "300px",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "4px",
        marginBottom: "15px"
      }, children: y.map((a) => /* @__PURE__ */ o.jsx(
        "div",
        {
          style: {
            padding: "10px",
            borderBottom: "1px solid #eee",
            backgroundColor: h.has(a.nodeId) ? "#f0f8ff" : "white",
            cursor: "pointer"
          },
          onClick: () => J(a.nodeId),
          children: /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", alignItems: "start", gap: "10px" }, children: [
            /* @__PURE__ */ o.jsx(
              "input",
              {
                type: "checkbox",
                checked: h.has(a.nodeId),
                onChange: () => J(a.nodeId),
                onClick: (u) => u.stopPropagation(),
                style: { marginTop: "2px" }
              }
            ),
            /* @__PURE__ */ o.jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ o.jsxs("div", { style: { fontSize: "12px", color: "#666", marginBottom: "4px" }, children: [
                a.url.split("/").pop()?.substring(0, 30),
                "..."
              ] }),
              a.generatedAltText && /* @__PURE__ */ o.jsxs("div", { style: {
                fontSize: "13px",
                color: "#2e7d32",
                padding: "4px 8px",
                backgroundColor: "#e8f5e9",
                borderRadius: "4px",
                marginTop: "4px"
              }, children: [
                "✓ ",
                a.generatedAltText
              ] })
            ] }),
            /* @__PURE__ */ o.jsx(
              "img",
              {
                src: a.url,
                alt: "Preview",
                style: {
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  borderRadius: "4px"
                },
                onError: (u) => {
                  u.currentTarget.style.display = "none";
                }
              }
            )
          ] })
        },
        a.nodeId
      )) }),
      /* @__PURE__ */ o.jsxs("div", { style: { display: "flex", gap: "10px" }, children: [
        /* @__PURE__ */ o.jsx(
          "button",
          {
            onClick: m,
            disabled: !E || h.size === 0 || x || g,
            style: {
              flex: 1,
              padding: "10px",
              backgroundColor: !E || h.size === 0 || x ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: !E || h.size === 0 || x ? "not-allowed" : "pointer"
            },
            children: x ? "Generating..." : "🤖 Generate Alt Text"
          }
        ),
        /* @__PURE__ */ o.jsx(
          "button",
          {
            onClick: ae,
            disabled: y.filter((a) => a.generatedAltText).length === 0 || g,
            style: {
              flex: 1,
              padding: "10px",
              backgroundColor: y.filter((a) => a.generatedAltText).length === 0 || g ? "#ccc" : "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: y.filter((a) => a.generatedAltText).length === 0 || g ? "not-allowed" : "pointer"
            },
            children: g ? "Applying..." : "✅ Apply Alt Text"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ o.jsxs("div", { style: {
      marginTop: "20px",
      padding: "15px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      fontSize: "14px"
    }, children: [
      /* @__PURE__ */ o.jsx("h4", { style: { marginTop: 0 }, children: "How to use:" }),
      /* @__PURE__ */ o.jsxs("ol", { style: { marginLeft: "20px", lineHeight: "1.6" }, children: [
        /* @__PURE__ */ o.jsx("li", { children: "Enter your OpenAI API key and save it" }),
        /* @__PURE__ */ o.jsx("li", { children: 'Click "Find Images Without Alt Text" to scan the current page' }),
        /* @__PURE__ */ o.jsx("li", { children: "Select the images you want to generate alt text for" }),
        /* @__PURE__ */ o.jsx("li", { children: 'Click "Generate Alt Text" to create descriptions' }),
        /* @__PURE__ */ o.jsx("li", { children: "Review the generated text" }),
        /* @__PURE__ */ o.jsx("li", { children: 'Click "Apply Alt Text" to update your Framer project' }),
        /* @__PURE__ */ o.jsx("li", { children: "Publish your project to make changes live" })
      ] })
    ] })
  ] });
}
re.showUI({
  title: "Alt Text Generator",
  width: 450,
  height: 600,
  resizable: !0
});
export {
  br as AltTextGenerator
};
