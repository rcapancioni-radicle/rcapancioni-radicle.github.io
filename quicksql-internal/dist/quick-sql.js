function D(p) {
  if (p == null) return p;
  const a = p.toUpperCase();
  return a.endsWith("IES") ? p.substring(0, p.length - 3) + "y" : a.endsWith("ES") || a.endsWith("S") ? p.substring(0, p.length - 1) : p;
}
function We(p) {
  if (p == null) return null;
  const n = "$#_ ";
  let s = !1;
  if (!p.startsWith('"')) {
    if (p.length > 0 && p[0] >= "0" && p[0] <= "9")
      s = !0;
    else
      for (const r of p)
        if (!(r >= "a" && r <= "z" || r >= "A" && r <= "Z" || r >= "0" && r <= "9") && !n.includes(r)) {
          s = !0;
          break;
        }
  }
  return (p.startsWith("_") || p.startsWith("$") || p.startsWith("#")) && (s = !0), s ? '"' + p + '"' : p;
}
function ae(p) {
  if (p == null) return null;
  if (p.charAt(0) === '"') return p;
  const a = We(p);
  return a == null ? null : a.charAt(0) === '"' ? a : a.replace(/ /g, "_");
}
function z(p, a, n) {
  const s = n ?? "";
  let r = !1, l = p, d = a, f = s;
  l.charAt(0) === '"' && (r = !0, l = l.slice(1, -1)), d.charAt(0) === '"' && (r = !0, d = d.slice(1, -1)), f.charAt(0) === '"' && (r = !0, f = f.slice(1, -1));
  const m = l + d + f;
  return r ? '"' + m + '"' : m.toLowerCase();
}
function Y(p) {
  return p.length < 2 ? null : parseInt(p.substring(0, 2));
}
function ce(p, a) {
  const n = new Set(a), s = [];
  let r = "";
  for (const l of p)
    n.has(l) ? (r.length > 0 && (s.push(r), r = ""), s.push(l)) : r += l;
  return r.length > 0 && s.push(r), s;
}
const Ue = -10, me = -11;
class V {
  constructor(a, n, s, r, l, d = 0) {
    this.type = r, this.value = a, this.begin = n, this.end = s, this.line = l, this.col = d, this.lowerValue = a.toLowerCase();
  }
  toString() {
    return `{type:${this.type},value:${this.value}}`;
  }
  /**
   * Returns the token value, converting backtick-quoted identifiers to Oracle
   * alt-quote syntax `q'[...]'`.
   * NOTE: the backtick conversion path currently returns `this.value` unchanged
   * (pre-existing behaviour — the converted string is built but not returned).
   */
  getValue() {
    return this.value.length < 2 ? this.value : this.value;
  }
  /** True when the token is a standard SQL string literal: 'text' or N'text'. */
  isStandardLiteral() {
    if (this.value.length < 2) return !1;
    const a = this.value.charAt(0);
    if (a !== "'" && a !== "n" && a !== "N") return !1;
    let n = this.value;
    if (a === "n" || a === "N") {
      if (n.length < 3) return !1;
      n = n.substring(1);
    }
    return n.charAt(0) === "'" && n.charAt(n.length - 1) === "'";
  }
  /** True when the token is an Oracle alt-quote literal: q'[...]', nq'[...]', etc. */
  isAltLiteral() {
    if (this.value.length < 5) return !1;
    const a = this.value.charAt(0);
    if (a !== "q" && a !== "Q" && a !== "n" && a !== "N") return !1;
    let n = this.value;
    if (a === "q" || a === "Q")
      n = n.substring(1);
    else if ((a === "n" || a === "N") && (this.value.charAt(1) === "q" || this.value.charAt(1) === "Q")) {
      if (n.length < 6) return !1;
      n = n.substring(2);
    } else
      return !1;
    if (n.charAt(0) === "'" && n.charAt(n.length - 1) === "'")
      n = n.substring(1, n.length - 1);
    else
      return !1;
    return Ke(n.charAt(0)) === n.charAt(n.length - 1);
  }
}
function Ke(p) {
  return p === "<" ? ">" : p === "[" ? "]" : p === "{" ? "}" : p === "(" ? ")" : p;
}
function Je(p, a, n, s) {
  const r = p.indexOf("e"), l = p.indexOf("f"), d = p.indexOf("d");
  if (r < 0 && l < 0 && d < 0) return !1;
  let f = n;
  const m = ce(p, "efd");
  for (const h of m) {
    f += h.length;
    const o = h.charAt(0) >= "0" && h.charAt(0) <= "9" ? "constant.numeric" : "identifier";
    a.push(new V(h, f - h.length, f, o, s));
  }
  return !0;
}
function je(p, a, n) {
  const s = [], r = `(){}[]^-|!*+.><='",;:%@?/\\#~` + n, l = ` 
\r	`, d = ce(p, r + l);
  let f = 0, m = 0, h = 0;
  for (let o = 0; o < d.length; o++) {
    const u = d[o], x = s.length > 0 ? s[s.length - 1] : null;
    if (u === `
` ? (m++, h = 0) : h = o > 0 && d[o - 1] !== `
` ? h + d[o - 1].length : 0, f += u.length, x?.type === "comment" && (x.value.lastIndexOf("*/") !== x.value.length - 2 || x.value === "/*/")) {
      x.value = u === "*" || u === "/" ? x.value + u : "/* ... ", x.end = f, x.type === "comment" && x.value.lastIndexOf("*/") === x.value.length - 2 && x.value !== "/*/" && (x.value = p.substring(x.begin, x.end));
      continue;
    }
    if (x !== null && (x.type === "line-comment" || x.type === "dbtools-command")) {
      if (u !== `
`) {
        x.value += u;
        continue;
      }
      x.end = x.begin + x.value.length;
    }
    if (x?.type === "quoted-string" && !(x.isStandardLiteral() || x.isAltLiteral())) {
      x.value += u, x.end = x.begin + x.value.length;
      continue;
    }
    if (x?.type === "dquoted-string" && !(x.value.endsWith('"') && x.value.length > 1)) {
      if (u !== '"') continue;
      x.end = f, x.value = p.substring(x.begin, x.end);
      continue;
    }
    if (x?.type === "bquoted-string" && !(x.value.endsWith("`") && x.value.length > 1)) {
      if (u !== "`") continue;
      x.end = f, x.value = p.substring(x.begin, x.end);
      continue;
    }
    if (u === "*" && x?.value === "/") {
      x.value += u, x.end = x.begin + x.value.length, x.type = "comment";
      continue;
    }
    if (u === "-" && x?.value === "-") {
      x.value += u, x.type = "line-comment";
      continue;
    }
    if (x?.type === "identifier" && x.end === me && x.value.startsWith("@")) {
      if (u !== `
` && u !== "\r") {
        x.value += u;
        continue;
      }
      x.end = f - 1, s.push(new V(u, f - 1, f, "ws", m, h));
      continue;
    }
    if (a && u === "'") {
      const g = x !== null && x.value.length <= 2 ? x.value.toLowerCase() : "";
      g === "q" || g === "n" || g === "u" || g === "nq" ? (x.value += u, x.type = "quoted-string") : s.push(new V(u, f - 1, Ue, "quoted-string", m, h));
      continue;
    }
    if (a && u === '"') {
      s.push(new V(u, f - 1, me, "dquoted-string", m, h));
      continue;
    }
    if (u === "`" && r.includes("`")) {
      s.push(new V(u, f - 1, me, "bquoted-string", m, h));
      continue;
    }
    if (u.length === 1 && r.includes(u)) {
      s.push(new V(u, f - 1, f, "operation", m, h));
      continue;
    }
    if (u.length === 1 && l.includes(u)) {
      s.push(new V(u, f - 1, f, "ws", m, h));
      continue;
    }
    if (u.charAt(0) >= "0" && u.charAt(0) <= "9") {
      if (!Je(u, s, f - u.length, m)) {
        const g = u.charAt(u.length - 1).toUpperCase();
        "KMGTPE".includes(g) ? (s.push(new V(u.slice(0, -1), f - u.length, f - 1, "constant.numeric", m, h)), s.push(new V(u.slice(-1), f - 1, f, "constant.numeric", m, h))) : s.push(new V(u, f - u.length, f, "constant.numeric", m, h));
      }
      continue;
    }
    s.push(new V(u, f - u.length, f, "identifier", m, h));
  }
  return s.length > 0 && (s[s.length - 1].end = p.length), s;
}
function Q(p, a, n, s) {
  const r = [], l = je(p, n, s);
  let d = null;
  for (const f of l) {
    if (f.type === "quoted-string") {
      if (d?.type === "quoted-string") {
        d.value += f.value, d.end = f.end;
        continue;
      }
      if (d?.type === "identifier" && d.value.toUpperCase() === "N" && d.end === f.begin) {
        d.begin = f.begin, d.end = f.end, d.type = f.type, d.value = f.value;
        continue;
      }
    }
    if (f.value.startsWith("@") && (f.end = f.begin + f.value.length), f.value === "#" && d?.type === "identifier") {
      d.end += 1, d.value += "#";
      continue;
    }
    if ((f.type === "identifier" || f.type === "constant.numeric") && d !== null && d.value.endsWith("#") && d.type === "identifier") {
      d.end += f.value.length, d.value += f.value;
      continue;
    }
    f.value.startsWith("$$") && (f.value = "$$VAR"), (a || f.type !== "ws" && f.type !== "comment" && f.type !== "line-comment") && r.push(f), d = f;
  }
  return r;
}
const Ye = {
  ACCESS: "N",
  ADD: "N",
  ALL: "Y",
  ALTER: "Y",
  AND: "Y",
  ANY: "Y",
  AS: "Y",
  ASC: "Y",
  AUDIT: "N",
  BETWEEN: "Y",
  BY: "Y",
  CHAR: "Y",
  CHECK: "Y",
  CLUSTER: "Y",
  COLUMN: "N",
  COMMENT: "N",
  COMPRESS: "Y",
  CONNECT: "Y",
  CREATE: "Y",
  CURRENT: "N",
  DATE: "Y",
  DECIMAL: "Y",
  DEFAULT: "Y",
  DELETE: "Y",
  DESC: "Y",
  DISTINCT: "Y",
  DROP: "Y",
  ELSE: "Y",
  EXCEPT: "Y",
  EXCLUSIVE: "Y",
  EXISTS: "Y",
  FILE: "N",
  FLOAT: "Y",
  FOR: "Y",
  FROM: "Y",
  GRANT: "Y",
  GROUP: "Y",
  HAVING: "Y",
  IDENTIFIED: "Y",
  IMMEDIATE: "N",
  IN: "Y",
  INCREMENT: "N",
  INDEX: "Y",
  INITIAL: "N",
  INSERT: "Y",
  INTEGER: "Y",
  INTERSECT: "Y",
  INTO: "Y",
  IS: "Y",
  LEVEL: "N",
  LIKE: "Y",
  LOCK: "Y",
  LONG: "Y",
  MAXEXTENTS: "N",
  MINUS: "Y",
  MLSLABEL: "N",
  MODE: "Y",
  MODIFY: "N",
  NOAUDIT: "N",
  NOCOMPRESS: "Y",
  NOT: "Y",
  NOWAIT: "Y",
  NULL: "Y",
  NUMBER: "Y",
  OF: "Y",
  OFFLINE: "N",
  ON: "Y",
  ONLINE: "N",
  OPTION: "Y",
  OR: "Y",
  ORDER: "Y",
  PCTFREE: "Y",
  PRIOR: "Y",
  PUBLIC: "Y",
  RAW: "Y",
  RENAME: "Y",
  RESOURCE: "Y",
  REVOKE: "Y",
  ROW: "N",
  ROWID: "N",
  ROWNUM: "N",
  ROWS: "N",
  SELECT: "Y",
  SESSION: "N",
  SET: "Y",
  SHARE: "Y",
  SIZE: "Y",
  SMALLINT: "Y",
  START: "Y",
  SUCCESSFUL: "N",
  SYNONYM: "Y",
  SYSDATE: "N",
  TABLE: "Y",
  THEN: "Y",
  TO: "Y",
  TRIGGER: "Y",
  UID: "N",
  UNION: "Y",
  UNIQUE: "Y",
  UPDATE: "Y",
  USER: "N",
  VALIDATE: "N",
  VALUES: "Y",
  VARCHAR: "Y",
  VARCHAR2: "Y",
  VIEW: "Y",
  WHENEVER: "N",
  WHERE: "Y",
  WITH: "Y"
};
function pe(p) {
  return Ye[p.toUpperCase()] !== void 0 ? "the_" + p : p;
}
const qe = "timestamp with local time zone", Ze = "timestamp with time zone", Qe = "timestamp", se = {
  pk: "_pk",
  fk: "_fk",
  unq: "_unq",
  uk: "_uk",
  ck: "_ck",
  bet: "_bet",
  bi: "_bi",
  bu: "_bu",
  seq: "_seq",
  idx: "_i",
  immutable_prefix: "trg_",
  immutable_suffix: "_insertonly"
}, i = "    ", Xe = ["string", "varchar2", "varchar", "vc", "char"], Ne = ["yn", "boolean", "bool"], ea = ["vect", "vector"], be = ["geometry", "sdo_geometry"];
let ne = [
  "integer",
  "number",
  "num",
  "int",
  "blob",
  "clob",
  "json",
  "file",
  "date",
  "d",
  "tstz",
  "tswtz",
  "tswltz",
  "ts"
];
ne = ne.concat(Xe).concat(Ne).concat(ea).concat(be);
const le = {
  file: [
    { suffix: "_filename", type: (p) => `varchar2(255${p.semantics()})` },
    { suffix: "_mimetype", type: (p) => `varchar2(255${p.semantics()})` },
    { suffix: "_charset", type: (p) => `varchar2(255${p.semantics()})` },
    { suffix: "_lastupd", type: (p) => String(p.getOptionValue("Date Data Type") ?? "").toLowerCase() }
  ]
};
function aa(p, a, n) {
  return p[a].value.endsWith("k") ? n < 32 ? n * 1024 : n * 1024 - 1 : n;
}
function na(p, a, n, s, r, l) {
  return !!(p.endsWith("_id") && n < 0 && s < 0 || a[1] && a[1].value === "id" || p === "quantity" || p.endsWith("_number") || p.endsWith("id") && n < 0 && r + 1 === l);
}
function ia(p, a, n) {
  return !!(0 <= n || p === "hiredate" || p.endsWith("_date") || p.startsWith("date_of_") || p.startsWith("created") || p.startsWith("updated") || 1 < a.length && a[1].value === "d");
}
class he {
  constructor(a, n, s, r) {
    this.one2many2oneUnsupoorted = void 0, this.line = a, this.parent = s, this.children = [], s !== null && s.children.push(this), this.fks = null, this._ctx = r, this.comment = null;
    function l(m) {
      let h = m;
      return h = h.replace(/ timestamp with local time zone/gi, " tswltz"), h = h.replace(/ timestamp with time zone/gi, " tswtz"), h = h.replace(/ timestamp/gi, " ts"), h;
    }
    this.content = l(n), this.annotations = null;
    const d = this.content.indexOf("{");
    if (d > 0 && (this.content.charAt(d - 1) === " " || this.content.charAt(d - 1) === "	")) {
      const m = this.content.indexOf("}", d);
      m > d && (this.annotations = this.content.substring(d + 1, m).trim(), this.content = this.content.substring(0, d) + this.content.substring(m + 1));
    }
    this.src = Q(this.content, !1, !0, "`");
    const f = this.getOptionValue("colprefix");
    f !== null && (this.colprefix = f), this.parsedName = null, this._maxChildNameLen = -1;
  }
  findChild(a) {
    for (let n = 0; n < this.children.length; n++)
      if (this.children[n].parseName() === a) return this.children[n];
    return null;
  }
  descendants() {
    const a = [this];
    for (let n = 0; n < this.children.length; n++)
      a.push(...this.children[n].descendants());
    return a;
  }
  maxChildNameLen() {
    if (this._maxChildNameLen >= 0) return this._maxChildNameLen;
    let a = 2;
    if (this.hasRowKey() && (a = 7), this.hasRowVersion() && (a = Math.max(a, 11)), this.hasAuditCols())
      for (const s of ["createdcol", "createdbycol", "updatedcol", "updatedbycol"]) {
        const r = String(this._ctx.getOptionValue(s) ?? "").length;
        a < r && (a = r);
      }
    if (this._ctx.optionEQvalue("tenantid", !0) && this.findChild("tenant_id") === null && !this.isOption("notenantid") && (a = Math.max(a, 9)), this.fks !== null)
      for (const s in this.fks) {
        let r = s.length;
        const l = this._ctx.find(s);
        l !== null && l.isMany2One() && (r += 3), a < r && (a = r);
      }
    for (let s = 0; s < this.children.length; s++) {
      const r = this.children[s];
      if (0 < r.children.length) continue;
      let l = r.parseName().length;
      for (const d in le)
        if (0 < r.indexOf(d)) {
          let f = 0;
          for (const m of le[d])
            m.suffix.length > f && (f = m.suffix.length);
          l += f;
          break;
        }
      a < l && (a = l);
    }
    const n = this._ctx.additionalColumns();
    for (const s in n) {
      const r = s.length;
      a < r && (a = r);
    }
    return this._maxChildNameLen = a, a;
  }
  getAnnotationValue(a) {
    if (this.annotations === null) return null;
    const n = new RegExp(a + `:?\\s+['"]([^'"]*)['"]`, "i"), s = this.annotations.match(n);
    return s ? s[1] : null;
  }
  getAnnotationPairs() {
    if (this.annotations === null) return [];
    const a = [], n = /(\w+)(?:\s+['"]([^'"]*)['"'])?/g;
    let s;
    for (; (s = n.exec(this.annotations)) !== null; )
      a.push({ label: s[1], value: s[2] !== void 0 ? s[2] : null });
    return a;
  }
  hasAuditCols() {
    return this._ctx.optionEQvalue("Audit Columns", "yes") || this.isOption("auditcols") || this.isOption("audit", "col") || this.isOption("audit", "cols") || this.isOption("audit", "columns");
  }
  hasRowVersion() {
    return this._ctx.optionEQvalue("Row Version Number", "yes") || this.isOption("rowversion");
  }
  hasRowKey() {
    return this._ctx.optionEQvalue("rowkey", !0) || this.isOption("rowkey");
  }
  regularColumns() {
    return this.children.filter((a) => a.children.length === 0 && a.refId() === null);
  }
  apexUser() {
    return this._ctx.optionEQvalue("apex", "yes") ? "coalesce(sys_context('APEX$SESSION','APP_USER'),user)" : "user";
  }
  auditSysDateFn() {
    return String(this._ctx.getOptionValue("auditdate") || this._ctx.getOptionValue("Date Data Type") || "").toLowerCase().indexOf("timestamp") >= 0 ? "systimestamp" : "sysdate";
  }
  indexOf(a, n) {
    const s = a.toLowerCase();
    for (let r = 0; r < this.src.length; r++) {
      const l = this.src[r].lowerValue;
      if (n && l.indexOf(s) === 0) return r;
      if (s === l) return r;
    }
    return -1;
  }
  occursBeforeOption(a, n) {
    const s = this.indexOf(a, n);
    return s <= 0 ? !1 : (this._slashPos === void 0 && (this._slashPos = this.indexOf("/")), this._slashPos < 0 || s < this._slashPos);
  }
  isOption(a, n) {
    for (let s = 2; s < this.src.length; s++)
      if (a === this.src[s].lowerValue && (n == null || s < this.src.length - 1 && n === this.src[s + 1].lowerValue))
        return this.src[s - 1].value === "/";
    return !1;
  }
  getOptionValue(a) {
    if (this.src.length < 3) return null;
    const n = this.indexOf(a);
    if (n < 2 || this.src[n - 1].value !== "/") return null;
    let s = "";
    for (let r = n + 1; r < this.src.length && this.src[r].value !== "/" && this.src[r].value !== "["; r++)
      s += this.src[r].value;
    return s;
  }
  sugarcoatName(a, n) {
    let s = "";
    this.children.length === 0 && this.parent !== void 0 && this.parent !== null && this.parent.colprefix !== void 0 && (s = this.parent.colprefix + "_");
    let r = "";
    const l = "_";
    for (let o = a; o < n; o++) {
      const u = this.src[o].value, x = '"' + u + '"';
      if (this.src[o].type !== "constant.numeric" && u !== ae(x)) {
        r = this.content.substring(this.src[a].begin, this.src[n - 1].end);
        const g = 0 < String(this._ctx.getOptionValue("prefix") ?? "").length, T = ae(r) ?? r, k = g ? T : pe(T);
        return this.parsedName = s + k, this.parsedName;
      }
    }
    for (let o = a; o < n; o++)
      a < o && (r += l), r += this.src[o].value;
    const d = r.charAt(0);
    d >= "0" && d <= "9" && (r = "x" + r);
    const f = 0 < String(this._ctx.getOptionValue("prefix") ?? "").length, m = ae(r) ?? r, h = f ? m : pe(m);
    return this.parsedName = s + h, this.parsedName;
  }
  parseName() {
    if (this.parsedName !== null) return this.parsedName;
    let a = 0, n = this.src[0].value;
    (n === ">" || n === "<") && (n = this.src[1].value, a = 1);
    const s = n.indexOf('"'), r = n.indexOf('"', s + 1);
    if (0 <= s && s < r)
      return n.substring(s, r + 1);
    if (this.src[0].value === "view") return this.src[1].value;
    if (1 < this.src.length && this.src[1].value === "=") return this.src[0].value;
    let l = this.src.length, d = this.indexOf("/");
    0 < d && (l = d), d = this.indexOf("["), 0 < d && d < l && (l = d), d = this.indexOf("="), 0 < d && d < l && (l = d);
    for (let f = 0; f < ne.length; f++) {
      let m = this.indexOf(ne[f]);
      if (m < 0 && (m = this.indexOf(ne[f], !0)), 0 < m && m < l)
        return l = m, this.sugarcoatName(a, l);
    }
    for (let f = a; f < l; f++) {
      const m = this.src[f].lowerValue;
      if (m.charAt(0) === "v" && m.charAt(1) === "c") {
        if (m.charAt(2) === "(") return this.sugarcoatName(a, f);
        if (m.charAt(2) >= "0" && m.charAt(2) <= "9") return this.sugarcoatName(a, f);
      }
    }
    return this.sugarcoatName(a, l);
  }
  _inferTypeFull() {
    const a = this.src, n = a[0].value;
    let s = n.endsWith("_name") || n.startsWith("name") || n.startsWith("email") ? this._ctx.getOptionValue("namelen") || 255 : 4e3;
    const r = this.indexOf("vc", !0);
    if (0 < r) {
      let I = a[r].value.substring(2);
      I === "" && this.indexOf("(") === r + 1 && (I = a[r + 2].value), s = aa(a, r, I !== "" ? parseInt(I) : s);
    }
    let l = "varchar";
    const d = this.indexOf("date");
    this._slashPos === void 0 && (this._slashPos = this.indexOf("/"));
    const f = this._slashPos;
    na(n, a, r, d, f, this.indexOf("pk")) && (l = "number"), this.occursBeforeOption("int", !0) && (l = "integer"), 0 < r && (l = "varchar");
    let m;
    const h = this.vectorType("vector") || this.vectorType("vect");
    h !== null && (l = "vector", m = h.substring(6));
    const o = this.parent, u = z(o.parseName(), "_", this.parseName());
    let x = !1;
    const g = n.endsWith("_yn") || n.startsWith("is_"), T = Ne.some((I) => 0 < this.indexOf(I));
    (g || T) && (l = "varchar", s = 1, x = !0);
    const k = this._ctx.getOptionValue("db");
    x && (this._ctx.getOptionValue("boolean") === "native" || this._ctx.getOptionValue("boolean") !== "yn" && k && k.length > 0 && 23 <= (Y(k) ?? 0)) && (x = !1, l = "boolean");
    const y = l === "boolean";
    this.indexOf("phone_number") === 0 && (l = "number");
    let B;
    const N = this.indexOf("num", !0);
    if (0 < N) {
      l = "number";
      const I = this.indexOf(")");
      0 < I && (B = this.content.substring(a[N + 1].begin, a[I].end).toLowerCase());
    }
    if (ia(n, a, d)) {
      const I = String(this._ctx.getOptionValue("Date Data Type") ?? "").toLowerCase();
      I === Qe ? l = "timestamp" : I === Ze ? l = "tswtz" : I === qe ? l = "tswltz" : l = "date";
    }
    r < 0 && (this.occursBeforeOption("clob") && (l = "clob"), (this.occursBeforeOption("blob") || this.occursBeforeOption("file")) && (l = "blob"), this.occursBeforeOption("json") && (l = "json"));
    for (const I in be) if (this.occursBeforeOption(be[I])) {
      l = "geometry";
      break;
    }
    this.isOption("domain") && k && k.length > 0 && 23 <= (Y(k) ?? 0) && (l = this.getOptionValue("domain") ?? l), this.occursBeforeOption("tswltz") && f !== 0 ? l = "tswltz" : this.occursBeforeOption("tswtz") || this.occursBeforeOption("tstz") ? l = "tswtz" : this.occursBeforeOption("ts") && (l = "timestamp");
    const P = { base: l, colName: n, varcharLen: s, needsBoolCheck: x, isNativeBoolean: y, parent_child: u };
    return B !== void 0 && (P.numericSpec = B), m !== void 0 && (P.vectorSpec = m), P;
  }
  inferType() {
    if (this.children !== null && 0 < this.children.length) return "table";
    const a = this.src;
    if (a[0].value === "view" || 1 < a.length && a[1].value === "=") return "view";
    if (a[0].value === "dv") return "dv";
    if (this.parent === null) return "table";
    const n = this._inferTypeFull();
    if (this.isOption("fk") || 0 < this.indexOf("reference", !0)) {
      let s = "number";
      n.base === "integer" && (s = "integer");
      const r = this.refId(), l = this._ctx.find(r);
      return l !== null && l.getExplicitPkName() !== null && (s = l.getPkType()), s;
    }
    return n.base;
  }
  getPlsqlType() {
    const a = this.inferType();
    return a === "varchar" ? "varchar2" : a;
  }
  vectorType(a) {
    const n = this.indexOf(a, !0), s = this.src;
    if (0 < n) {
      let r = s[n].value.substring(a.length);
      r === "" && this.indexOf("(") === n + 1 && (r = s[n + 2].value);
      let l = "*";
      if (r !== "") {
        let d = 1;
        r.endsWith("k") && (d = 1024), r = r.substring(0, r.length - 1), l = parseInt(r) * d;
      }
      return `vector(${l},*,*)`;
    }
    return null;
  }
  genConstraint(a) {
    let n = "";
    if (this.isOption("check")) {
      let s = "";
      this.parent !== null && (s = z(this.parent.parseName(), "_"));
      const r = z(s, this.parseName());
      let l = i;
      this.parent !== null && (l = " ".repeat(this.parent.maxChildNameLen()));
      const d = this.getGeneralConstraint();
      if (d !== null)
        return this.children !== null && 0 < this.children.length ? (n += i + "constraint " + z(this._ctx.objPrefix(), r, se.ck), n += "  check " + d + `,
`) : (n += " constraint " + z(this._ctx.objPrefix(), r, se.ck) + `
`, n += i + i + l + "check " + d), n;
      const f = this.getValues("check");
      n += " constraint " + z(this._ctx.objPrefix(), r, se.ck) + `
`, n += i + i + l + "check (" + this.parseName() + " in (" + f + "))";
    }
    return n;
  }
  isMany2One() {
    return this.src[0].value === ">";
  }
  getExplicitPkName() {
    if (this.isOption("pk"))
      return this.inferType() === "table" ? this.getOptionValue("pk") : this.parseName();
    for (let a = 0; a < this.children.length; a++)
      if (this.children[a].isOption("pk")) return this.children[a].parseName();
    return null;
  }
  trimmedContent() {
    let a = this.content.trim();
    const n = a.indexOf("["), s = a.indexOf("]");
    this.comment === null && 0 < n && (this.comment = a.substr(n + 1, s - n - 1)), 0 < n && (a = a.substr(0, n) + a.substr(s + 2));
    const r = a.indexOf("--");
    return this.comment === null && 0 < r && (this.comment = a.substr(r + 2)), 0 < r && (a = a.substr(0, r)), a.trim();
  }
  refId() {
    let a = this.trimmedContent();
    a = a.replace(/\/cascade/g, "");
    let n = a.indexOf(" id ");
    if (n < 0 && n === a.length - 3 && (n = a.indexOf(" id")), n < 0 && (n = a.indexOf(" id"), n !== a.length - 3 && (n = -1)), n < 0 && (n = a.indexOf("_id "), n !== a.length - 4 && (n = -1)), n < 0 && (n = a.indexOf("_id"), n !== a.length - 3 && (n = -1)), n < 0 && (n = a.indexOf("Id "), n !== a.length - 3 && (n = -1)), 0 < n) {
      let s = a.substr(0, n) + "s";
      if (this._ctx.find(s) !== null || (s = a.substr(0, n), this._ctx.find(s) !== null)) return s;
    }
    return n = a.indexOf("/fk"), 0 < n ? (a = a.substr(n + 3).trim(), n = a.indexOf("/"), 0 < n && (a = a.substring(0, n).trim()), n = a.indexOf("["), 0 < n && (a = a.substring(0, n).trim()), a.replace(" ", "_")) : (n = a.indexOf("/reference"), 0 < n ? (a = a.substr(n + 10).trim(), a.indexOf("s") === 0 && (a = a.substring(1).trim()), n = a.indexOf("/"), 0 < n && (a = a.substring(0, n).trim()), n = a.indexOf("["), 0 < n && (a = a.substring(0, n).trim()), a.replace(" ", "_")) : null);
  }
  getGeneralConstraint() {
    const a = this.indexOf("check");
    if (0 < a && this.src[a - 1].value === "/" && (this.src[a + 1].value === "(" || this.src[a + 1].lowerValue === "not")) {
      let n = a + 2;
      for (; n < this.src.length && this.src[n].value !== "/" && this.src[n].value !== "["; )
        n++;
      let s = this.content.substring(this.src[a + 1].begin, this.src[n - 1].end);
      return s.charAt(0) !== "(" && (s = "(" + s + ")"), s;
    }
    return null;
  }
  listValues(a) {
    const n = [], s = this.indexOf(a);
    let r = " ";
    for (let f = s + 1; f < this.src.length && this.src[f].value !== "/" && this.src[f].value !== "["; f++)
      if (this.src[f].value === ",") {
        r = ",";
        break;
      } else if (this.src[f].lowerValue === "and") {
        r = this.src[f].value;
        break;
      }
    if (r === " ") {
      for (let f = s + 1; f < this.src.length && this.src[f].value !== "/" && this.src[f].value !== "["; f++) {
        let m = this.src[f].value;
        this.src[f].type === "identifier" && m !== "null" && (m = "'" + m + "'"), m.charAt(0) === "`" && (m = m.substring(1, m.length - 1)), n.push(m);
      }
      return n;
    }
    let l = null, d = null;
    for (let f = s + 1; f < this.src.length && this.src[f].value !== "/" && this.src[f].value !== "["; f++) {
      let m = this.src[f].value;
      const h = this.content.substring(this.src[f - 1].end, this.src[f].begin);
      if (m === r) {
        d === "identifier" && l !== "null" && (l = "'" + l + "'"), n.push(l), l = null, d = null;
        continue;
      }
      m === "(" || m === ")" || (m.charAt(0) === "`" ? m = m.substring(1, m.length - 1) : this.src[f].type === "identifier" && (d = "identifier"), l = l === null ? m : l + h + m);
    }
    return d === "identifier" && (l = "'" + l + "'"), n.push(l), n;
  }
  getValues(a) {
    let n = "";
    const s = this.listValues(a);
    for (let r = 0; r < s.length; r++)
      0 < r && (n += ","), n += s[r];
    return n;
  }
  getDefaultValue() {
    if (!this.isOption("default")) return null;
    let a = "";
    for (let n = this.indexOf("default") + 1; n < this.src.length; n++) {
      const s = this.src[n].getValue();
      if (s === "/" || s === "-" || s === "[") break;
      a += s;
    }
    return a;
  }
  getBetweenClause() {
    if (!this.isOption("between")) return null;
    const a = this.indexOf("between");
    return this.src[a + 1].getValue() + " and " + this.src[a + 3].getValue();
  }
  parseValues() {
    if (this.isOption("check")) return this.listValues("check");
    if (this.isOption("values")) return this.listValues("values");
    if (this.isOption("between")) {
      const a = this.listValues("between"), n = [];
      for (let s = parseInt(String(a[0])); s <= parseInt(String(a[1])); s++)
        n.push(s);
      return n;
    }
    return null;
  }
  apparentDepth() {
    const a = this.content.split(/ |\t/);
    let n = 0;
    for (let s = 0; s < a.length; s++) {
      const r = a[s];
      if (r === "	") {
        n += i.length;
        continue;
      }
      if (r === "") {
        n++;
        continue;
      }
      return n;
    }
    throw new Error("No alphanumerics in the node content");
  }
  depth() {
    return this.parent === null ? 0 : this.parent.depth() + 1;
  }
  isLeaf() {
    return this.children.every((a) => a.children.length === 0);
  }
  getGenIdColName() {
    if (this.inferType() !== "table" || this.getExplicitPkName() !== null) return null;
    if (this._ctx.optionEQvalue("Auto Primary Key", "yes")) {
      let a = "";
      return this.colprefix !== void 0 && (a = this.colprefix + "_"), this._ctx.optionEQvalue("prefixPKwithTname", "yes") && (a = (D(this.parseName()) ?? this.parseName()) + "_"), a + "id";
    }
    return null;
  }
  getPkName() {
    const a = this.getGenIdColName();
    return a === null ? this.getExplicitPkName() : a;
  }
  getPkType() {
    if (this.getGenIdColName() === null) {
      const n = this.getExplicitPkName();
      return this.findChild(n).inferType();
    }
    return "integer";
  }
  lateInitFks() {
    if (this.fks === null && (this.fks = {}), !this.isMany2One()) {
      this.parent !== null && this.inferType() === "table" && ((this.parent.getPkName() ?? "").indexOf(",") < 0 ? this.fks[(D(this.parent.parseName()) ?? this.parent.parseName()) + "_id"] = this.parent.parseName() : this.fks[D(this.parent.getPkName() ?? "") ?? this.parent.parseName()] = this.parent.parseName());
      for (let a = 0; a < this.children.length; a++) {
        const n = this.children[a].refId();
        n !== null && (this.fks[this.children[a].parseName()] = n);
      }
    }
  }
  cardinality() {
    if (this.isOption("insert")) {
      const n = this.indexOf("insert");
      let s = parseInt(this.src[n + 1].value);
      const r = this._ctx.getOptionValue("datalimit");
      return r < s && (s = r), s;
    }
    return 0;
  }
  isArray() {
    return !this.isMany2One() && this.parent !== null;
  }
  hasNonArrayChildId(a) {
    if (!a.endsWith("_id")) return !1;
    const n = a.slice(0, -3);
    return this.children.some((s) => s.children.length > 0 && s.parseName() === n && !s.isArray());
  }
  getTransColumns() {
    const a = [];
    for (let n = 0; n < this.children.length; n++) {
      const s = this.children[n];
      (s.isOption("trans") || s.isOption("translation") || s.isOption("translations")) && a.push(s);
    }
    return a;
  }
  getBaseType() {
    let a = this.inferType(), n = a.indexOf(" not null");
    return n > 0 && (a = a.substring(0, n)), n = a.indexOf(`
`), n > 0 && (a = a.substring(0, n)), a;
  }
}
function Ae(p) {
  const a = p.input;
  let n = [];
  const s = [], r = Q(a + `
`, !0, !0, "`");
  p.data = null;
  let l = null, d = "";
  e: for (let f = 0; f < r.length; f++) {
    const m = r[f];
    if (m.value === `
` && l === null) {
      d = d.replace(/\r/g, "");
      const h = (d.match(/\{/g) ?? []).length, o = (d.match(/\}/g) ?? []).length;
      if (h > o)
        continue;
      if (d.replace(/\r/g, "").replace(/ /g, "") === "") {
        d = "";
        continue;
      }
      let x = new he(m.line - 1, d, null, p), g = !1;
      for (let T = 0; T < n.length; T++) {
        const k = n[T];
        if (x.apparentDepth() <= k.apparentDepth())
          if (0 < T) {
            const y = n[T - 1];
            x = new he(m.line - 1, d, y, p), n[T] = x, n = n.slice(0, T + 1), g = !0;
            break;
          } else
            n[0] = x, n = n.slice(0, 1), s.push(x), g = !0;
      }
      if (!g) {
        if (0 < n.length) {
          const T = n[n.length - 1];
          x = new he(m.line - 1, d, T, p);
        }
        n.push(x), x.apparentDepth() === 0 && s.push(x);
      }
      if (x.isMany2One()) {
        const T = x.parent;
        T.fks === null && (T.fks = {});
        let k = x.refId();
        k === null && (k = x.parseName()), T.fks[x.parseName() + "_id"] = k;
      }
      d = "";
      continue;
    }
    if (l === null && m.value === "#") {
      l = "";
      continue;
    }
    if (l !== null) {
      if (l += m.value, m.value !== `
` && m.value !== "}") continue;
      const h = Q(l, !1, !0, "");
      if (h.length % 4 === 3 && h[1].value === ":") {
        p.setOptions(l), l = null, d = "";
        continue;
      }
      let o = null, u = null;
      for (const x in h) {
        const g = h[x];
        if (o === null && g.value === "flattened") {
          o = "";
          continue;
        }
        if (o !== null) {
          if (o += g.value, o === "=" || o.charAt(o.length - 1) !== "}") continue;
          const T = o.substring(1);
          try {
            p.data = JSON.parse(T), l = null, d = "";
            continue e;
          } catch {
          }
        }
        if (u === null && g.value === "settings") {
          u = "";
          continue;
        }
        if (u !== null) {
          u += g.value;
          try {
            p.setOptions(u), l = null, d = "";
            continue e;
          } catch {
          }
        }
      }
    }
    if (m.type !== "comment") {
      if (m.type === "line-comment") {
        0 < d.trim().length && (d += m.value);
        continue;
      }
      d += m.value;
    }
  }
  return s;
}
const ta = [
  "Sales",
  "Finance",
  "Delivery",
  "Manufacturing",
  "Engineer",
  "Consultant",
  "Architect",
  "Manager",
  "Analyst",
  "Specialist",
  "Evangelist",
  "Salesman"
], Se = [
  "\u300C\u8CA9\u58F2\u300D",
  "\u300C\u8CA1\u52D9\u300D",
  "\u300C\u914D\u9001\u300D",
  "\u300C\u88FD\u9020\u300D",
  "\u300C\u30A8\u30F3\u30B8\u30CB\u30A2\u300D",
  "\u300C\u30B3\u30F3\u30B5\u30EB\u30BF\u30F3\u30C8\u300D",
  "\u300C\u30A2\u30FC\u30AD\u30C6\u30AF\u30C8\u300D",
  "\u300C\u30DE\u30CD\u30FC\u30B8\u30E3\u30FC\u300D",
  "\u300C\u30A2\u30CA\u30EA\u30B9\u30C8\u300D",
  "\u300C\u30B9\u30DA\u30B7\u30E3\u30EA\u30B9\u30C8\u300D",
  "\u300C\u30A8\u30D0\u30F3\u30B8\u30A7\u30EA\u30B9\u30C8\u300D"
], _e = [
  "\uC601\uC5C5",
  "\uAE08\uC735",
  "\uBC30\uC1A1",
  "\uC81C\uC870",
  "\uC5D4\uC9C0\uB2C8\uC5B4",
  "\uCEE8\uC124\uD134\uD2B8",
  "\uAC74\uCD95\uAC00",
  "\uAD00\uB9AC\uC790",
  "\uBD84\uC11D\uAC00",
  "\uC804\uBB38\uAC00",
  "\uC804\uB3C4\uC790",
  "\uD310\uB9E4\uC6D0"
];
function Me(p, a) {
  if (typeof a != "string") return a;
  const n = p.substring(0, 2).toLowerCase();
  if (n === "en") return a;
  const s = a.startsWith("'") ? a.slice(1, -1) : a, r = ta.indexOf(s);
  return r < 0 ? a : n === "jp" && r < Se.length ? "'" + Se[r] + "'" : n === "kr" && r < _e.length ? "'" + _e[r] + "'" : a;
}
function ra(p) {
  return p && p.__esModule && Object.prototype.hasOwnProperty.call(p, "default") ? p.default : p;
}
var te = { exports: {} }, ke;
function oa() {
  return ke || (ke = 1, (function(p, a) {
    (function() {
      var n = 9007199254740992, s = -n, r = "0123456789", l = "abcdefghijklmnopqrstuvwxyz", d = l.toUpperCase(), f = r + "abcdef";
      function m(e) {
        this.name = "UnsupportedError", this.message = e || "This feature is not supported on this platform";
      }
      m.prototype = new Error(), m.prototype.constructor = m;
      var h = Array.prototype.slice;
      function o(e) {
        if (!(this instanceof o))
          return e || (e = null), e === null ? new o() : new o(e);
        if (typeof e == "function")
          return this.random = e, this;
        arguments.length && (this.seed = 0);
        for (var t = 0; t < arguments.length; t++) {
          var c = 0;
          if (Object.prototype.toString.call(arguments[t]) === "[object String]")
            for (var b = 0; b < arguments[t].length; b++) {
              for (var C = 0, M = 0; M < arguments[t].length; M++)
                C = arguments[t].charCodeAt(M) + (C << 6) + (C << 16) - C;
              c += C;
            }
          else
            c = arguments[t];
          this.seed += (arguments.length - t) * c;
        }
        return this.mt = this.mersenne_twister(this.seed), this.bimd5 = this.blueimp_md5(), this.random = function() {
          return this.mt.random(this.seed);
        }, this;
      }
      o.prototype.VERSION = "1.1.13";
      function u(e, t) {
        if (e = e || {}, t)
          for (var c in t)
            typeof e[c] > "u" && (e[c] = t[c]);
        return e;
      }
      function x(e) {
        return Array.apply(null, Array(e)).map(function(t, c) {
          return c;
        });
      }
      function g(e, t) {
        if (e)
          throw new RangeError(t);
      }
      var T = function() {
        throw new Error("No Base64 encoder available.");
      };
      (function() {
        typeof btoa == "function" ? T = btoa : typeof Buffer == "function" && (T = function(t) {
          return new Buffer(t).toString("base64");
        });
      })(), o.prototype.bool = function(e) {
        return e = u(e, { likelihood: 50 }), g(
          e.likelihood < 0 || e.likelihood > 100,
          "Chance: Likelihood accepts values from 0 to 100."
        ), this.random() * 100 < e.likelihood;
      }, o.prototype.falsy = function(e) {
        e = u(e, { pool: [!1, null, 0, NaN, "", void 0] });
        var t = e.pool, c = this.integer({ min: 0, max: t.length - 1 }), b = t[c];
        return b;
      }, o.prototype.animal = function(e) {
        if (e = u(e), typeof e.type < "u")
          return g(
            !this.get("animals")[e.type.toLowerCase()],
            "Please pick from desert, ocean, grassland, forest, zoo, pets, farm."
          ), this.pick(this.get("animals")[e.type.toLowerCase()]);
        var t = ["desert", "forest", "ocean", "zoo", "farm", "pet", "grassland"];
        return this.pick(this.get("animals")[this.pick(t)]);
      }, o.prototype.character = function(e) {
        e = u(e);
        var t = "!@#$%^&*()[]", c, b;
        return e.casing === "lower" ? c = l : e.casing === "upper" ? c = d : c = l + d, e.pool ? b = e.pool : (b = "", e.alpha && (b += c), e.numeric && (b += r), e.symbols && (b += t), b || (b = c + r + t)), b.charAt(this.natural({ max: b.length - 1 }));
      }, o.prototype.floating = function(e) {
        e = u(e, { fixed: 4 }), g(
          e.fixed && e.precision,
          "Chance: Cannot specify both fixed and precision."
        );
        var t, c = Math.pow(10, e.fixed), b = n / c, C = -b;
        g(
          e.min && e.fixed && e.min < C,
          "Chance: Min specified is out of range with fixed. Min should be, at least, " + C
        ), g(
          e.max && e.fixed && e.max > b,
          "Chance: Max specified is out of range with fixed. Max should be, at most, " + b
        ), e = u(e, { min: C, max: b }), t = this.integer({ min: e.min * c, max: e.max * c });
        var M = (t / c).toFixed(e.fixed);
        return parseFloat(M);
      }, o.prototype.integer = function(e) {
        return e = u(e, { min: s, max: n }), g(e.min > e.max, "Chance: Min cannot be greater than Max."), Math.floor(this.random() * (e.max - e.min + 1) + e.min);
      }, o.prototype.natural = function(e) {
        if (e = u(e, { min: 0, max: n }), typeof e.numerals == "number" && (g(e.numerals < 1, "Chance: Numerals cannot be less than one."), e.min = Math.pow(10, e.numerals - 1), e.max = Math.pow(10, e.numerals) - 1), g(e.min < 0, "Chance: Min cannot be less than zero."), e.exclude) {
          g(!Array.isArray(e.exclude), "Chance: exclude must be an array.");
          for (var t in e.exclude)
            g(!Number.isInteger(e.exclude[t]), "Chance: exclude must be numbers.");
          var c = e.min + this.natural({ max: e.max - e.min - e.exclude.length }), b = e.exclude.sort((M, w) => M - w);
          for (var C in b) {
            if (c < b[C])
              break;
            c++;
          }
          return c;
        }
        return this.integer(e);
      }, o.prototype.prime = function(e) {
        e = u(e, { min: 0, max: 1e4 }), g(e.min < 0, "Chance: Min cannot be less than zero."), g(e.min > e.max, "Chance: Min cannot be greater than Max.");
        var t = I.primes[I.primes.length - 1];
        if (e.max > t)
          for (var c = t + 2; c <= e.max; ++c)
            this.is_prime(c) && I.primes.push(c);
        var b = I.primes.filter(function(C) {
          return C >= e.min && C <= e.max;
        });
        return this.pick(b);
      }, o.prototype.is_prime = function(e) {
        if (e % 1 || e < 2)
          return !1;
        if (e % 2 === 0)
          return e === 2;
        if (e % 3 === 0)
          return e === 3;
        for (var t = Math.sqrt(e), c = 5; c <= t; c += 6)
          if (e % c === 0 || e % (c + 2) === 0)
            return !1;
        return !0;
      }, o.prototype.hex = function(e) {
        e = u(e, { min: 0, max: n, casing: "lower" }), g(e.min < 0, "Chance: Min cannot be less than zero.");
        var t = this.natural({ min: e.min, max: e.max });
        return e.casing === "upper" ? t.toString(16).toUpperCase() : t.toString(16);
      }, o.prototype.letter = function(e) {
        e = u(e, { casing: "lower" });
        var t = "abcdefghijklmnopqrstuvwxyz", c = this.character({ pool: t });
        return e.casing === "upper" && (c = c.toUpperCase()), c;
      }, o.prototype.string = function(e) {
        e = u(e, { min: 5, max: 20 }), e.length !== 0 && !e.length && (e.length = this.natural({ min: e.min, max: e.max })), g(e.length < 0, "Chance: Length cannot be less than zero.");
        var t = e.length, c = this.n(this.character, t, e);
        return c.join("");
      };
      function k(e) {
        this.c = e;
      }
      k.prototype = {
        substitute: function() {
          return this.c;
        }
      };
      function y(e) {
        this.c = e;
      }
      y.prototype = {
        substitute: function() {
          if (!/[{}\\]/.test(this.c))
            throw new Error('Invalid escape sequence: "\\' + this.c + '".');
          return this.c;
        }
      };
      function B(e) {
        this.c = e;
      }
      B.prototype = {
        replacers: {
          "#": function(e) {
            return e.character({ pool: r });
          },
          A: function(e) {
            return e.character({ pool: d });
          },
          a: function(e) {
            return e.character({ pool: l });
          }
        },
        substitute: function(e) {
          var t = this.replacers[this.c];
          if (!t)
            throw new Error('Invalid replacement character: "' + this.c + '".');
          return t(e);
        }
      };
      function N(e) {
        for (var t = [], c = "identity", b = 0; b < e.length; b++) {
          var C = e[b];
          switch (c) {
            case "escape":
              t.push(new y(C)), c = "identity";
              break;
            case "identity":
              C === "{" ? c = "replace" : C === "\\" ? c = "escape" : t.push(new k(C));
              break;
            case "replace":
              C === "}" ? c = "identity" : t.push(new B(C));
              break;
          }
        }
        return t;
      }
      o.prototype.template = function(e) {
        if (!e)
          throw new Error("Template string is required");
        var t = this;
        return N(e).map(function(c) {
          return c.substitute(t);
        }).join("");
      }, o.prototype.buffer = function(e) {
        if (typeof Buffer > "u")
          throw new m("Sorry, the buffer() function is not supported on your platform");
        e = u(e, { length: this.natural({ min: 5, max: 20 }) }), g(e.length < 0, "Chance: Length cannot be less than zero.");
        var t = e.length, c = this.n(this.character, t, e);
        return Buffer.from(c);
      }, o.prototype.capitalize = function(e) {
        return e.charAt(0).toUpperCase() + e.substr(1);
      }, o.prototype.mixin = function(e) {
        for (var t in e)
          this[t] = e[t];
        return this;
      }, o.prototype.unique = function(e, t, c) {
        g(
          typeof e != "function",
          "Chance: The first argument must be a function."
        );
        var b = function(_, R) {
          return _.indexOf(R) !== -1;
        };
        c && (b = c.comparator || b);
        for (var C = [], M = 0, w, v = t * 50, A = h.call(arguments, 2); C.length < t; ) {
          var S = JSON.parse(JSON.stringify(A));
          if (w = e.apply(this, S), b(C, w) || (C.push(w), M = 0), ++M > v)
            throw new RangeError("Chance: num is likely too large for sample set");
        }
        return C;
      }, o.prototype.n = function(e, t) {
        g(
          typeof e != "function",
          "Chance: The first argument must be a function."
        ), typeof t > "u" && (t = 1);
        var c = t, b = [], C = h.call(arguments, 2);
        for (c = Math.max(0, c), null; c--; null)
          b.push(e.apply(this, C));
        return b;
      }, o.prototype.pad = function(e, t, c) {
        return c = c || "0", e = e + "", e.length >= t ? e : new Array(t - e.length + 1).join(c) + e;
      }, o.prototype.pick = function(e, t) {
        if (e.length === 0)
          throw new RangeError("Chance: Cannot pick() from an empty array");
        return !t || t === 1 ? e[this.natural({ max: e.length - 1 })] : this.shuffle(e).slice(0, t);
      }, o.prototype.pickone = function(e) {
        if (e.length === 0)
          throw new RangeError("Chance: Cannot pickone() from an empty array");
        return e[this.natural({ max: e.length - 1 })];
      }, o.prototype.pickset = function(e, t) {
        if (t === 0)
          return [];
        if (e.length === 0)
          throw new RangeError("Chance: Cannot pickset() from an empty array");
        if (t < 0)
          throw new RangeError("Chance: Count must be a positive number");
        if (!t || t === 1)
          return [this.pickone(e)];
        var c = e.slice(0), b = c.length;
        return this.n(function() {
          var C = this.natural({ max: --b }), M = c[C];
          return c[C] = c[b], M;
        }, Math.min(b, t));
      }, o.prototype.shuffle = function(e) {
        for (var t = [], c = 0, b = Number(e.length), C = x(b), M = b - 1, w, v = 0; v < b; v++)
          w = this.natural({ max: M }), c = C[w], t[v] = e[c], C[w] = C[M], M -= 1;
        return t;
      }, o.prototype.weighted = function(e, t, c) {
        if (e.length !== t.length)
          throw new RangeError("Chance: Length of array and weights must match");
        for (var b = 0, C, M = 0; M < t.length; ++M) {
          if (C = t[M], isNaN(C))
            throw new RangeError("Chance: All weights must be numbers");
          C > 0 && (b += C);
        }
        if (b === 0)
          throw new RangeError("Chance: No valid entries in array weights");
        var w = this.random() * b, v = 0, A = -1, S;
        for (M = 0; M < t.length; ++M) {
          if (C = t[M], v += C, C > 0) {
            if (w <= v) {
              S = M;
              break;
            }
            A = M;
          }
          M === t.length - 1 && (S = A);
        }
        var _ = e[S];
        return c = typeof c > "u" ? !1 : c, c && (e.splice(S, 1), t.splice(S, 1)), _;
      }, o.prototype.paragraph = function(e) {
        e = u(e);
        var t = e.sentences || this.natural({ min: 3, max: 7 }), c = this.n(this.sentence, t), b = e.linebreak === !0 ? `
` : " ";
        return c.join(b);
      }, o.prototype.sentence = function(e) {
        e = u(e);
        var t = e.words || this.natural({ min: 12, max: 18 }), c = e.punctuation, b, C = this.n(this.word, t);
        return b = C.join(" "), b = this.capitalize(b), c !== !1 && !/^[.?;!:]$/.test(c) && (c = "."), c && (b += c), b;
      }, o.prototype.syllable = function(e) {
        e = u(e);
        for (var t = e.length || this.natural({ min: 2, max: 3 }), c = "bcdfghjklmnprstvwz", b = "aeiou", C = c + b, M = "", w, v = 0; v < t; v++)
          v === 0 ? w = this.character({ pool: C }) : c.indexOf(w) === -1 ? w = this.character({ pool: c }) : w = this.character({ pool: b }), M += w;
        return e.capitalize && (M = this.capitalize(M)), M;
      }, o.prototype.word = function(e) {
        e = u(e), g(
          e.syllables && e.length,
          "Chance: Cannot specify both syllables AND length."
        );
        var t = e.syllables || this.natural({ min: 1, max: 3 }), c = "";
        if (e.length) {
          do
            c += this.syllable();
          while (c.length < e.length);
          c = c.substring(0, e.length);
        } else
          for (var b = 0; b < t; b++)
            c += this.syllable();
        return e.capitalize && (c = this.capitalize(c)), c;
      }, o.prototype.emoji = function(e) {
        e = u(e, { category: "all", length: 1 }), g(
          e.length < 1 || BigInt(e.length) > BigInt(n),
          "Chance: length must be between 1 and " + String(n)
        );
        var t = this.get("emojis");
        e.category === "all" && (e.category = this.pickone(Object.keys(t)));
        var c = t[e.category];
        return g(
          c === void 0,
          "Chance: Unrecognised emoji category: [" + e.category + "]."
        ), this.pickset(c, e.length).map(function(b) {
          return String.fromCodePoint(b);
        }).join("");
      }, o.prototype.age = function(e) {
        e = u(e);
        var t;
        switch (e.type) {
          case "child":
            t = { min: 0, max: 12 };
            break;
          case "teen":
            t = { min: 13, max: 19 };
            break;
          case "adult":
            t = { min: 18, max: 65 };
            break;
          case "senior":
            t = { min: 65, max: 100 };
            break;
          case "all":
            t = { min: 0, max: 100 };
            break;
          default:
            t = { min: 18, max: 65 };
            break;
        }
        return this.natural(t);
      }, o.prototype.birthday = function(e) {
        var t = this.age(e), c = /* @__PURE__ */ new Date(), b = c.getFullYear();
        if (e && e.type) {
          var C = /* @__PURE__ */ new Date(), M = /* @__PURE__ */ new Date();
          C.setFullYear(b - t - 1), M.setFullYear(b - t), e = u(e, {
            min: C,
            max: M
          });
        } else if (e && (e.minAge !== void 0 || e.maxAge !== void 0)) {
          g(e.minAge < 0, "Chance: MinAge cannot be less than zero."), g(e.minAge > e.maxAge, "Chance: MinAge cannot be greater than MaxAge.");
          var w = e.minAge !== void 0 ? e.minAge : 0, v = e.maxAge !== void 0 ? e.maxAge : 100, A = new Date(b - v - 1, c.getMonth(), c.getDate()), S = new Date(b - w, c.getMonth(), c.getDate());
          A.setDate(A.getDate() + 1), S.setDate(S.getDate() + 1), S.setMilliseconds(S.getMilliseconds() - 1), e = u(e, {
            min: A,
            max: S
          });
        } else
          e = u(e, {
            year: b - t
          });
        return this.date(e);
      }, o.prototype.cpf = function(e) {
        e = u(e, {
          formatted: !0
        });
        var t = this.n(this.natural, 9, { max: 9 }), c = t[8] * 2 + t[7] * 3 + t[6] * 4 + t[5] * 5 + t[4] * 6 + t[3] * 7 + t[2] * 8 + t[1] * 9 + t[0] * 10;
        c = 11 - c % 11, c >= 10 && (c = 0);
        var b = c * 2 + t[8] * 3 + t[7] * 4 + t[6] * 5 + t[5] * 6 + t[4] * 7 + t[3] * 8 + t[2] * 9 + t[1] * 10 + t[0] * 11;
        b = 11 - b % 11, b >= 10 && (b = 0);
        var C = "" + t[0] + t[1] + t[2] + "." + t[3] + t[4] + t[5] + "." + t[6] + t[7] + t[8] + "-" + c + b;
        return e.formatted ? C : C.replace(/\D/g, "");
      }, o.prototype.cnpj = function(e) {
        e = u(e, {
          formatted: !0
        });
        var t = this.n(this.natural, 12, { max: 12 }), c = t[11] * 2 + t[10] * 3 + t[9] * 4 + t[8] * 5 + t[7] * 6 + t[6] * 7 + t[5] * 8 + t[4] * 9 + t[3] * 2 + t[2] * 3 + t[1] * 4 + t[0] * 5;
        c = 11 - c % 11, c < 2 && (c = 0);
        var b = c * 2 + t[11] * 3 + t[10] * 4 + t[9] * 5 + t[8] * 6 + t[7] * 7 + t[6] * 8 + t[5] * 9 + t[4] * 2 + t[3] * 3 + t[2] * 4 + t[1] * 5 + t[0] * 6;
        b = 11 - b % 11, b < 2 && (b = 0);
        var C = "" + t[0] + t[1] + "." + t[2] + t[3] + t[4] + "." + t[5] + t[6] + t[7] + "/" + t[8] + t[9] + t[10] + t[11] + "-" + c + b;
        return e.formatted ? C : C.replace(/\D/g, "");
      }, o.prototype.first = function(e) {
        return e = u(e, { gender: this.gender(), nationality: "en" }), this.pick(this.get("firstNames")[e.gender.toLowerCase()][e.nationality.toLowerCase()]);
      }, o.prototype.profession = function(e) {
        return e = u(e), e.rank ? this.pick(["Apprentice ", "Junior ", "Senior ", "Lead "]) + this.pick(this.get("profession")) : this.pick(this.get("profession"));
      }, o.prototype.company = function() {
        return this.pick(this.get("company"));
      }, o.prototype.gender = function(e) {
        return e = u(e, { extraGenders: [] }), this.pick(["Male", "Female"].concat(e.extraGenders));
      }, o.prototype.last = function(e) {
        if (e = u(e, { nationality: "*" }), e.nationality === "*") {
          var t = [], c = this.get("lastNames");
          return Object.keys(c).forEach(function(b) {
            t = t.concat(c[b]);
          }), this.pick(t);
        } else
          return this.pick(this.get("lastNames")[e.nationality.toLowerCase()]);
      }, o.prototype.israelId = function() {
        for (var e = this.string({ pool: "0123456789", length: 8 }), t = 0, c = 0; c < e.length; c++) {
          var b = e[c] * (c / 2 === parseInt(c / 2) ? 1 : 2);
          b = this.pad(b, 2).toString(), b = parseInt(b[0]) + parseInt(b[1]), t = t + b;
        }
        return e = e + (10 - parseInt(t.toString().slice(-1))).toString().slice(-1), e;
      }, o.prototype.mrz = function(e) {
        var t = function(C) {
          var M = "<ABCDEFGHIJKLMNOPQRSTUVWXYXZ".split(""), w = [7, 3, 1], v = 0;
          return typeof C != "string" && (C = C.toString()), C.split("").forEach(function(A, S) {
            var _ = M.indexOf(A);
            _ !== -1 ? A = _ === 0 ? 0 : _ + 9 : A = parseInt(A, 10), A *= w[S % w.length], v += A;
          }), v % 10;
        }, c = function(C) {
          var M = function(v) {
            return new Array(v + 1).join("<");
          }, w = [
            "P<",
            C.issuer,
            C.last.toUpperCase(),
            "<<",
            C.first.toUpperCase(),
            M(39 - (C.last.length + C.first.length + 2)),
            C.passportNumber,
            t(C.passportNumber),
            C.nationality,
            C.dob,
            t(C.dob),
            C.gender,
            C.expiry,
            t(C.expiry),
            M(14),
            t(M(14))
          ].join("");
          return w + t(w.substr(44, 10) + w.substr(57, 7) + w.substr(65, 7));
        }, b = this;
        return e = u(e, {
          first: this.first(),
          last: this.last(),
          passportNumber: this.integer({ min: 1e8, max: 999999999 }),
          dob: (function() {
            var C = b.birthday({ type: "adult" });
            return [
              C.getFullYear().toString().substr(2),
              b.pad(C.getMonth() + 1, 2),
              b.pad(C.getDate(), 2)
            ].join("");
          })(),
          expiry: (function() {
            var C = /* @__PURE__ */ new Date();
            return [
              (C.getFullYear() + 5).toString().substr(2),
              b.pad(C.getMonth() + 1, 2),
              b.pad(C.getDate(), 2)
            ].join("");
          })(),
          gender: this.gender() === "Female" ? "F" : "M",
          issuer: "GBR",
          nationality: "GBR"
        }), c(e);
      }, o.prototype.name = function(e) {
        e = u(e);
        var t = this.first(e), c = this.last(e), b;
        return e.middle ? b = t + " " + this.first(e) + " " + c : e.middle_initial ? b = t + " " + this.character({ alpha: !0, casing: "upper" }) + ". " + c : b = t + " " + c, e.prefix && (b = this.prefix(e) + " " + b), e.suffix && (b = b + " " + this.suffix(e)), b;
      }, o.prototype.name_prefixes = function(e) {
        e = e || "all", e = e.toLowerCase();
        var t = [
          { name: "Doctor", abbreviation: "Dr." }
        ];
        return (e === "male" || e === "all") && t.push({ name: "Mister", abbreviation: "Mr." }), (e === "female" || e === "all") && (t.push({ name: "Miss", abbreviation: "Miss" }), t.push({ name: "Misses", abbreviation: "Mrs." })), t;
      }, o.prototype.prefix = function(e) {
        return this.name_prefix(e);
      }, o.prototype.name_prefix = function(e) {
        return e = u(e, { gender: "all" }), e.full ? this.pick(this.name_prefixes(e.gender)).name : this.pick(this.name_prefixes(e.gender)).abbreviation;
      }, o.prototype.HIDN = function() {
        var e = "0123456789", t = "ABCDEFGHIJKLMNOPQRSTUVWXYXZ", c = "";
        return c += this.string({ pool: e, length: 6 }), c += this.string({ pool: t, length: 2 }), c;
      }, o.prototype.ssn = function(e) {
        e = u(e, { ssnFour: !1, dashes: !0 });
        var t = "1234567890", c, b = e.dashes ? "-" : "";
        return e.ssnFour ? c = this.string({ pool: t, length: 4 }) : c = this.string({ pool: t, length: 3 }) + b + this.string({ pool: t, length: 2 }) + b + this.string({ pool: t, length: 4 }), c;
      }, o.prototype.aadhar = function(e) {
        e = u(e, { onlyLastFour: !1, separatedByWhiteSpace: !0 });
        var t = "1234567890", c, b = e.separatedByWhiteSpace ? " " : "";
        return e.onlyLastFour ? c = this.string({ pool: t, length: 4 }) : c = this.string({ pool: t, length: 4 }) + b + this.string({ pool: t, length: 4 }) + b + this.string({ pool: t, length: 4 }), c;
      }, o.prototype.name_suffixes = function() {
        var e = [
          { name: "Doctor of Osteopathic Medicine", abbreviation: "D.O." },
          { name: "Doctor of Philosophy", abbreviation: "Ph.D." },
          { name: "Esquire", abbreviation: "Esq." },
          { name: "Junior", abbreviation: "Jr." },
          { name: "Juris Doctor", abbreviation: "J.D." },
          { name: "Master of Arts", abbreviation: "M.A." },
          { name: "Master of Business Administration", abbreviation: "M.B.A." },
          { name: "Master of Science", abbreviation: "M.S." },
          { name: "Medical Doctor", abbreviation: "M.D." },
          { name: "Senior", abbreviation: "Sr." },
          { name: "The Third", abbreviation: "III" },
          { name: "The Fourth", abbreviation: "IV" },
          { name: "Bachelor of Engineering", abbreviation: "B.E" },
          { name: "Bachelor of Technology", abbreviation: "B.TECH" }
        ];
        return e;
      }, o.prototype.suffix = function(e) {
        return this.name_suffix(e);
      }, o.prototype.name_suffix = function(e) {
        return e = u(e), e.full ? this.pick(this.name_suffixes()).name : this.pick(this.name_suffixes()).abbreviation;
      }, o.prototype.nationalities = function() {
        return this.get("nationalities");
      }, o.prototype.nationality = function() {
        var e = this.pick(this.nationalities());
        return e.name;
      }, o.prototype.zodiac = function() {
        const e = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        return this.pickone(e);
      }, o.prototype.android_id = function() {
        return "APA91" + this.string({ pool: "0123456789abcefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_", length: 178 });
      }, o.prototype.apple_token = function() {
        return this.string({ pool: "abcdef1234567890", length: 64 });
      }, o.prototype.wp8_anid2 = function() {
        return T(this.hash({ length: 32 }));
      }, o.prototype.wp7_anid = function() {
        return "A=" + this.guid().replace(/-/g, "").toUpperCase() + "&E=" + this.hash({ length: 3 }) + "&W=" + this.integer({ min: 0, max: 9 });
      }, o.prototype.bb_pin = function() {
        return this.hash({ length: 8 });
      }, o.prototype.avatar = function(e) {
        var t = null, c = "//www.gravatar.com/avatar/", b = {
          http: "http",
          https: "https"
        }, C = {
          bmp: "bmp",
          gif: "gif",
          jpg: "jpg",
          png: "png"
        }, M = {
          404: "404",
          // Return 404 if not found
          mm: "mm",
          // Mystery man
          identicon: "identicon",
          // Geometric pattern based on hash
          monsterid: "monsterid",
          // A generated monster icon
          wavatar: "wavatar",
          // A generated face
          retro: "retro",
          // 8-bit icon
          blank: "blank"
          // A transparent png
        }, w = {
          g: "g",
          pg: "pg",
          r: "r",
          x: "x"
        }, v = {
          protocol: null,
          email: null,
          fileExtension: null,
          size: null,
          fallback: null,
          rating: null
        };
        if (!e)
          v.email = this.email(), e = {};
        else if (typeof e == "string")
          v.email = e, e = {};
        else {
          if (typeof e != "object")
            return null;
          if (e.constructor === "Array")
            return null;
        }
        return v = u(e, v), v.email || (v.email = this.email()), v.protocol = b[v.protocol] ? v.protocol + ":" : "", v.size = parseInt(v.size, 0) ? v.size : "", v.rating = w[v.rating] ? v.rating : "", v.fallback = M[v.fallback] ? v.fallback : "", v.fileExtension = C[v.fileExtension] ? v.fileExtension : "", t = v.protocol + c + this.bimd5.md5(v.email) + (v.fileExtension ? "." + v.fileExtension : "") + (v.size || v.rating || v.fallback ? "?" : "") + (v.size ? "&s=" + v.size.toString() : "") + (v.rating ? "&r=" + v.rating : "") + (v.fallback ? "&d=" + v.fallback : ""), t;
      }, o.prototype.color = function(e) {
        function t(F, ie) {
          return [F, F, F].join(ie || "");
        }
        function c(F) {
          var ie = F ? "rgba" : "rgb", ue = F ? "," + this.floating({ min: G, max: W }) : "", de = C ? t(this.natural({ min: M, max: w }), ",") : this.natural({ min: S, max: _ }) + "," + this.natural({ min: R, max: E }) + "," + this.natural({ max: 255 });
          return ie + "(" + de + ue + ")";
        }
        function b(F, ie, ue) {
          var de = ue ? "#" : "", Z = "";
          return C ? (Z = t(this.pad(this.hex({ min: M, max: w }), 2)), e.format === "shorthex" && (Z = t(this.hex({ min: 0, max: 15 })))) : e.format === "shorthex" ? Z = this.pad(this.hex({ min: Math.floor(v / 16), max: Math.floor(A / 16) }), 1) + this.pad(this.hex({ min: Math.floor(S / 16), max: Math.floor(_ / 16) }), 1) + this.pad(this.hex({ min: Math.floor(R / 16), max: Math.floor(E / 16) }), 1) : v !== void 0 || A !== void 0 || S !== void 0 || _ !== void 0 || R !== void 0 || E !== void 0 ? Z = this.pad(this.hex({ min: v, max: A }), 2) + this.pad(this.hex({ min: S, max: _ }), 2) + this.pad(this.hex({ min: R, max: E }), 2) : Z = this.pad(this.hex({ min: M, max: w }), 2) + this.pad(this.hex({ min: M, max: w }), 2) + this.pad(this.hex({ min: M, max: w }), 2), de + Z;
        }
        e = u(e, {
          format: this.pick(["hex", "shorthex", "rgb", "rgba", "0x", "name"]),
          grayscale: !1,
          casing: "lower",
          min: 0,
          max: 255,
          min_red: void 0,
          max_red: void 0,
          min_green: void 0,
          max_green: void 0,
          min_blue: void 0,
          max_blue: void 0,
          min_alpha: 0,
          max_alpha: 1
        });
        var C = e.grayscale, M = e.min, w = e.max, v = e.min_red, A = e.max_red, S = e.min_green, _ = e.max_green, R = e.min_blue, E = e.max_blue, G = e.min_alpha, W = e.max_alpha;
        e.min_red === void 0 && (v = M), e.max_red === void 0 && (A = w), e.min_green === void 0 && (S = M), e.max_green === void 0 && (_ = w), e.min_blue === void 0 && (R = M), e.max_blue === void 0 && (E = w), e.min_alpha === void 0 && (G = 0), e.max_alpha === void 0 && (W = 1), C && M === 0 && w === 255 && v !== void 0 && A !== void 0 && (M = (v + S + R) / 3, w = (A + _ + E) / 3);
        var H;
        if (e.format === "hex")
          H = b.call(this, 2, 6, !0);
        else if (e.format === "shorthex")
          H = b.call(this, 1, 3, !0);
        else if (e.format === "rgb")
          H = c.call(this, !1);
        else if (e.format === "rgba")
          H = c.call(this, !0);
        else if (e.format === "0x")
          H = "0x" + b.call(this, 2, 6);
        else {
          if (e.format === "name")
            return this.pick(this.get("colorNames"));
          throw new RangeError('Invalid format provided. Please provide one of "hex", "shorthex", "rgb", "rgba", "0x" or "name".');
        }
        return e.casing === "upper" && (H = H.toUpperCase()), H;
      }, o.prototype.domain = function(e) {
        return e = u(e), this.word() + "." + (e.tld || this.tld());
      }, o.prototype.email = function(e) {
        return e = u(e), this.word({ length: e.length }) + "@" + (e.domain || this.domain());
      }, o.prototype.fbid = function() {
        return "10000" + this.string({ pool: "1234567890", length: 11 });
      }, o.prototype.google_analytics = function() {
        var e = this.pad(this.natural({ max: 999999 }), 6), t = this.pad(this.natural({ max: 99 }), 2);
        return "UA-" + e + "-" + t;
      }, o.prototype.hashtag = function() {
        return "#" + this.word();
      }, o.prototype.ip = function() {
        return this.natural({ min: 1, max: 254 }) + "." + this.natural({ max: 255 }) + "." + this.natural({ max: 255 }) + "." + this.natural({ min: 1, max: 254 });
      }, o.prototype.ipv6 = function() {
        var e = this.n(this.hash, 8, { length: 4 });
        return e.join(":");
      }, o.prototype.klout = function() {
        return this.natural({ min: 1, max: 99 });
      }, o.prototype.mac = function(e) {
        return e = u(e, { delimiter: ":" }), this.pad(this.natural({ max: 255 }).toString(16), 2) + e.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2) + e.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2) + e.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2) + e.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2) + e.delimiter + this.pad(this.natural({ max: 255 }).toString(16), 2);
      }, o.prototype.semver = function(e) {
        e = u(e, { include_prerelease: !0 });
        var t = this.pickone(["^", "~", "<", ">", "<=", ">=", "="]);
        e.range && (t = e.range);
        var c = "";
        return e.include_prerelease && (c = this.weighted(["", "-dev", "-beta", "-alpha"], [50, 10, 5, 1])), t + this.rpg("3d10").join(".") + c;
      }, o.prototype.tlds = function() {
        return ["com", "org", "edu", "gov", "co.uk", "net", "io", "ac", "ad", "ae", "af", "ag", "ai", "al", "am", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cu", "cv", "cw", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "su", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "ye", "yt", "za", "zm", "zw"];
      }, o.prototype.tld = function() {
        return this.pick(this.tlds());
      }, o.prototype.twitter = function() {
        return "@" + this.word();
      }, o.prototype.url = function(e) {
        e = u(e, { protocol: "http", domain: this.domain(e), domain_prefix: "", path: this.word(), extensions: [] });
        var t = e.extensions.length > 0 ? "." + this.pick(e.extensions) : "", c = e.domain_prefix ? e.domain_prefix + "." + e.domain : e.domain;
        return e.protocol + "://" + c + "/" + e.path + t;
      }, o.prototype.port = function() {
        return this.integer({ min: 0, max: 65535 });
      }, o.prototype.locale = function(e) {
        return e = u(e), e.region ? this.pick(this.get("locale_regions")) : this.pick(this.get("locale_languages"));
      }, o.prototype.locales = function(e) {
        return e = u(e), e.region ? this.get("locale_regions") : this.get("locale_languages");
      }, o.prototype.loremPicsum = function(e) {
        e = u(e, { width: 500, height: 500, greyscale: !1, blurred: !1 });
        var t = e.greyscale ? "g/" : "", c = e.blurred ? "/?blur" : "/?random";
        return "https://picsum.photos/" + t + e.width + "/" + e.height + c;
      }, o.prototype.address = function(e) {
        return e = u(e), this.natural({ min: 5, max: 2e3 }) + " " + this.street(e);
      }, o.prototype.altitude = function(e) {
        return e = u(e, { fixed: 5, min: 0, max: 8848 }), this.floating({
          min: e.min,
          max: e.max,
          fixed: e.fixed
        });
      }, o.prototype.areacode = function(e) {
        e = u(e, { parens: !0 });
        var t = e.exampleNumber ? "555" : this.natural({ min: 2, max: 9 }).toString() + this.natural({ min: 0, max: 8 }).toString() + this.natural({ min: 0, max: 9 }).toString();
        return e.parens ? "(" + t + ")" : t;
      }, o.prototype.city = function() {
        return this.capitalize(this.word({ syllables: 3 }));
      }, o.prototype.coordinates = function(e) {
        return this.latitude(e) + ", " + this.longitude(e);
      }, o.prototype.countries = function() {
        return this.get("countries");
      }, o.prototype.country = function(e) {
        e = u(e);
        var t = this.pick(this.countries());
        return e.raw ? t : e.full ? t.name : t.abbreviation;
      }, o.prototype.depth = function(e) {
        return e = u(e, { fixed: 5, min: -10994, max: 0 }), this.floating({
          min: e.min,
          max: e.max,
          fixed: e.fixed
        });
      }, o.prototype.geohash = function(e) {
        return e = u(e, { length: 7 }), this.string({ length: e.length, pool: "0123456789bcdefghjkmnpqrstuvwxyz" });
      }, o.prototype.geojson = function(e) {
        return this.latitude(e) + ", " + this.longitude(e) + ", " + this.altitude(e);
      }, o.prototype.latitude = function(e) {
        var [t, c, b] = ["ddm", "dms", "dd"];
        e = u(
          e,
          e && e.format && [t, c].includes(e.format.toLowerCase()) ? { min: 0, max: 89, fixed: 4 } : { fixed: 5, min: -90, max: 90, format: b }
        );
        var C = e.format.toLowerCase();
        switch ((C === t || C === c) && (g(e.min < 0 || e.min > 89, "Chance: Min specified is out of range. Should be between 0 - 89"), g(e.max < 0 || e.max > 89, "Chance: Max specified is out of range. Should be between 0 - 89"), g(e.fixed > 4, "Chance: Fixed specified should be below or equal to 4")), C) {
          case t:
            return this.integer({ min: e.min, max: e.max }) + "\xB0" + this.floating({ min: 0, max: 59, fixed: e.fixed });
          case c:
            return this.integer({ min: e.min, max: e.max }) + "\xB0" + this.integer({ min: 0, max: 59 }) + "\u2019" + this.floating({ min: 0, max: 59, fixed: e.fixed }) + "\u201D";
          case b:
          default:
            return this.floating({ min: e.min, max: e.max, fixed: e.fixed });
        }
      }, o.prototype.longitude = function(e) {
        var [t, c, b] = ["ddm", "dms", "dd"];
        e = u(
          e,
          e && e.format && [t, c].includes(e.format.toLowerCase()) ? { min: 0, max: 179, fixed: 4 } : { fixed: 5, min: -180, max: 180, format: b }
        );
        var C = e.format.toLowerCase();
        switch ((C === t || C === c) && (g(e.min < 0 || e.min > 179, "Chance: Min specified is out of range. Should be between 0 - 179"), g(e.max < 0 || e.max > 179, "Chance: Max specified is out of range. Should be between 0 - 179"), g(e.fixed > 4, "Chance: Fixed specified should be below or equal to 4")), C) {
          case t:
            return this.integer({ min: e.min, max: e.max }) + "\xB0" + this.floating({ min: 0, max: 59.9999, fixed: e.fixed });
          case c:
            return this.integer({ min: e.min, max: e.max }) + "\xB0" + this.integer({ min: 0, max: 59 }) + "\u2019" + this.floating({ min: 0, max: 59.9999, fixed: e.fixed }) + "\u201D";
          case b:
          default:
            return this.floating({ min: e.min, max: e.max, fixed: e.fixed });
        }
      }, o.prototype.phone = function(e) {
        var t = this, c, b = function(R) {
          var E = [];
          return R.sections.forEach(function(G) {
            E.push(t.string({ pool: "0123456789", length: G }));
          }), R.area + E.join(" ");
        };
        e = u(e, {
          formatted: !0,
          country: "us",
          mobile: !1,
          exampleNumber: !1
        }), e.formatted || (e.parens = !1);
        var C;
        switch (e.country) {
          case "fr":
            e.mobile ? (c = this.pick(["06", "07"]) + t.string({ pool: "0123456789", length: 8 }), C = e.formatted ? c.match(/../g).join(" ") : c) : (c = this.pick([
              // Valid zone and département codes.
              "01" + this.pick(["30", "34", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "53", "55", "56", "58", "60", "64", "69", "70", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83"]) + t.string({ pool: "0123456789", length: 6 }),
              "02" + this.pick(["14", "18", "22", "23", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "40", "41", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "56", "57", "61", "62", "69", "72", "76", "77", "78", "85", "90", "96", "97", "98", "99"]) + t.string({ pool: "0123456789", length: 6 }),
              "03" + this.pick(["10", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "39", "44", "45", "51", "52", "54", "55", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90"]) + t.string({ pool: "0123456789", length: 6 }),
              "04" + this.pick(["11", "13", "15", "20", "22", "26", "27", "30", "32", "34", "37", "42", "43", "44", "50", "56", "57", "63", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "88", "89", "90", "91", "92", "93", "94", "95", "97", "98"]) + t.string({ pool: "0123456789", length: 6 }),
              "05" + this.pick(["08", "16", "17", "19", "24", "31", "32", "33", "34", "35", "40", "45", "46", "47", "49", "53", "55", "56", "57", "58", "59", "61", "62", "63", "64", "65", "67", "79", "81", "82", "86", "87", "90", "94"]) + t.string({ pool: "0123456789", length: 6 }),
              "09" + t.string({ pool: "0123456789", length: 8 })
            ]), C = e.formatted ? c.match(/../g).join(" ") : c);
            break;
          case "uk":
            e.mobile ? (c = this.pick([
              { area: "07" + this.pick(["4", "5", "7", "8", "9"]), sections: [2, 6] },
              { area: "07624 ", sections: [6] }
            ]), C = e.formatted ? b(c) : b(c).replace(" ", "")) : (c = this.pick([
              //valid area codes of major cities/counties followed by random numbers in required format.
              { area: "01" + this.character({ pool: "234569" }) + "1 ", sections: [3, 4] },
              { area: "020 " + this.character({ pool: "378" }), sections: [3, 4] },
              { area: "023 " + this.character({ pool: "89" }), sections: [3, 4] },
              { area: "024 7", sections: [3, 4] },
              { area: "028 " + this.pick(["25", "28", "37", "71", "82", "90", "92", "95"]), sections: [2, 4] },
              { area: "012" + this.pick(["04", "08", "54", "76", "97", "98"]) + " ", sections: [6] },
              { area: "013" + this.pick(["63", "64", "84", "86"]) + " ", sections: [6] },
              { area: "014" + this.pick(["04", "20", "60", "61", "80", "88"]) + " ", sections: [6] },
              { area: "015" + this.pick(["24", "27", "62", "66"]) + " ", sections: [6] },
              { area: "016" + this.pick(["06", "29", "35", "47", "59", "95"]) + " ", sections: [6] },
              { area: "017" + this.pick(["26", "44", "50", "68"]) + " ", sections: [6] },
              { area: "018" + this.pick(["27", "37", "84", "97"]) + " ", sections: [6] },
              { area: "019" + this.pick(["00", "05", "35", "46", "49", "63", "95"]) + " ", sections: [6] }
            ]), C = e.formatted ? b(c) : b(c).replace(" ", "", "g"));
            break;
          case "za":
            e.mobile ? (c = this.pick([
              "060" + this.pick(["3", "4", "5", "6", "7", "8", "9"]) + t.string({ pool: "0123456789", length: 6 }),
              "061" + this.pick(["0", "1", "2", "3", "4", "5", "8"]) + t.string({ pool: "0123456789", length: 6 }),
              "06" + t.string({ pool: "0123456789", length: 7 }),
              "071" + this.pick(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) + t.string({ pool: "0123456789", length: 6 }),
              "07" + this.pick(["2", "3", "4", "6", "7", "8", "9"]) + t.string({ pool: "0123456789", length: 7 }),
              "08" + this.pick(["0", "1", "2", "3", "4", "5"]) + t.string({ pool: "0123456789", length: 7 })
            ]), C = e.formatted || c) : (c = this.pick([
              "01" + this.pick(["0", "1", "2", "3", "4", "5", "6", "7", "8"]) + t.string({ pool: "0123456789", length: 7 }),
              "02" + this.pick(["1", "2", "3", "4", "7", "8"]) + t.string({ pool: "0123456789", length: 7 }),
              "03" + this.pick(["1", "2", "3", "5", "6", "9"]) + t.string({ pool: "0123456789", length: 7 }),
              "04" + this.pick(["1", "2", "3", "4", "5", "6", "7", "8", "9"]) + t.string({ pool: "0123456789", length: 7 }),
              "05" + this.pick(["1", "3", "4", "6", "7", "8"]) + t.string({ pool: "0123456789", length: 7 })
            ]), C = e.formatted || c);
            break;
          case "us":
            var M = this.areacode(e).toString(), w = this.natural({ min: 2, max: 9 }).toString() + this.natural({ min: 0, max: 9 }).toString() + this.natural({ min: 0, max: 9 }).toString(), v = this.natural({ min: 1e3, max: 9999 }).toString();
            C = e.formatted ? M + " " + w + "-" + v : M + w + v;
            break;
          case "br":
            var A = this.pick(["11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "24", "27", "28", "31", "32", "33", "34", "35", "37", "38", "41", "42", "43", "44", "45", "46", "47", "48", "49", "51", "53", "54", "55", "61", "62", "63", "64", "65", "66", "67", "68", "69", "71", "73", "74", "75", "77", "79", "81", "82", "83", "84", "85", "86", "87", "88", "89", "91", "92", "93", "94", "95", "96", "97", "98", "99"]), S;
            e.mobile ? S = "9" + t.string({ pool: "0123456789", length: 4 }) : S = this.natural({ min: 2e3, max: 5999 }).toString();
            var _ = t.string({ pool: "0123456789", length: 4 });
            C = e.formatted ? "(" + A + ") " + S + "-" + _ : A + S + _;
            break;
        }
        return C;
      }, o.prototype.postal = function() {
        var e = this.character({ pool: "XVTSRPNKLMHJGECBA" }), t = e + this.natural({ max: 9 }) + this.character({ alpha: !0, casing: "upper" }), c = this.natural({ max: 9 }) + this.character({ alpha: !0, casing: "upper" }) + this.natural({ max: 9 });
        return t + " " + c;
      }, o.prototype.postcode = function() {
        var e = this.pick(this.get("postcodeAreas")).code, t = this.natural({ max: 9 }), c = this.bool() ? this.character({ alpha: !0, casing: "upper" }) : "", b = e + t + c, C = this.natural({ max: 9 }), M = this.character({ alpha: !0, casing: "upper" }) + this.character({ alpha: !0, casing: "upper" }), w = C + M;
        return b + " " + w;
      }, o.prototype.counties = function(e) {
        return e = u(e, { country: "uk" }), this.get("counties")[e.country.toLowerCase()];
      }, o.prototype.county = function(e) {
        return this.pick(this.counties(e)).name;
      }, o.prototype.provinces = function(e) {
        return e = u(e, { country: "ca" }), this.get("provinces")[e.country.toLowerCase()];
      }, o.prototype.province = function(e) {
        return e && e.full ? this.pick(this.provinces(e)).name : this.pick(this.provinces(e)).abbreviation;
      }, o.prototype.state = function(e) {
        return e && e.full ? this.pick(this.states(e)).name : this.pick(this.states(e)).abbreviation;
      }, o.prototype.states = function(e) {
        e = u(e, { country: "us", us_states_and_dc: !0 });
        var t;
        switch (e.country.toLowerCase()) {
          case "us":
            var c = this.get("us_states_and_dc"), b = this.get("territories"), C = this.get("armed_forces");
            t = [], e.us_states_and_dc && (t = t.concat(c)), e.territories && (t = t.concat(b)), e.armed_forces && (t = t.concat(C));
            break;
          case "it":
          case "mx":
            t = this.get("country_regions")[e.country.toLowerCase()];
            break;
          case "uk":
            t = this.get("counties")[e.country.toLowerCase()];
            break;
        }
        return t;
      }, o.prototype.street = function(e) {
        e = u(e, { country: "us", syllables: 2 });
        var t;
        switch (e.country.toLowerCase()) {
          case "us":
            t = this.word({ syllables: e.syllables }), t = this.capitalize(t), t += " ", t += e.short_suffix ? this.street_suffix(e).abbreviation : this.street_suffix(e).name;
            break;
          case "it":
            t = this.word({ syllables: e.syllables }), t = this.capitalize(t), t = (e.short_suffix ? this.street_suffix(e).abbreviation : this.street_suffix(e).name) + " " + t;
            break;
        }
        return t;
      }, o.prototype.street_suffix = function(e) {
        return e = u(e, { country: "us" }), this.pick(this.street_suffixes(e));
      }, o.prototype.street_suffixes = function(e) {
        return e = u(e, { country: "us" }), this.get("street_suffixes")[e.country.toLowerCase()];
      }, o.prototype.zip = function(e) {
        var t = this.n(this.natural, 5, { max: 9 });
        return e && e.plusfour === !0 && (t.push("-"), t = t.concat(this.n(this.natural, 4, { max: 9 }))), t.join("");
      }, o.prototype.ampm = function() {
        return this.bool() ? "am" : "pm";
      }, o.prototype.date = function(e) {
        var t, c;
        if (e && (e.min || e.max)) {
          e = u(e, {
            american: !0,
            string: !1
          });
          var b = typeof e.min < "u" ? e.min.getTime() : 1, C = typeof e.max < "u" ? e.max.getTime() : 864e13;
          c = new Date(this.integer({ min: b, max: C }));
        } else {
          var M = this.month({ raw: !0 }), w = M.days;
          e && e.month && (w = this.get("months")[(e.month % 12 + 12) % 12].days), e = u(e, {
            year: parseInt(this.year(), 10),
            // Necessary to subtract 1 because Date() 0-indexes month but not day or year
            // for some reason.
            month: M.numeric - 1,
            day: this.natural({ min: 1, max: w }),
            hour: this.hour({ twentyfour: !0 }),
            minute: this.minute(),
            second: this.second(),
            millisecond: this.millisecond(),
            american: !0,
            string: !1
          }), c = new Date(e.year, e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
        }
        return e.american ? t = c.getMonth() + 1 + "/" + c.getDate() + "/" + c.getFullYear() : t = c.getDate() + "/" + (c.getMonth() + 1) + "/" + c.getFullYear(), e.string ? t : c;
      }, o.prototype.hammertime = function(e) {
        return this.date(e).getTime();
      }, o.prototype.hour = function(e) {
        return e = u(e, {
          min: e && e.twentyfour ? 0 : 1,
          max: e && e.twentyfour ? 23 : 12
        }), g(e.min < 0, "Chance: Min cannot be less than 0."), g(e.twentyfour && e.max > 23, "Chance: Max cannot be greater than 23 for twentyfour option."), g(!e.twentyfour && e.max > 12, "Chance: Max cannot be greater than 12."), g(e.min > e.max, "Chance: Min cannot be greater than Max."), this.natural({ min: e.min, max: e.max });
      }, o.prototype.millisecond = function() {
        return this.natural({ max: 999 });
      }, o.prototype.minute = o.prototype.second = function(e) {
        return e = u(e, { min: 0, max: 59 }), g(e.min < 0, "Chance: Min cannot be less than 0."), g(e.max > 59, "Chance: Max cannot be greater than 59."), g(e.min > e.max, "Chance: Min cannot be greater than Max."), this.natural({ min: e.min, max: e.max });
      }, o.prototype.month = function(e) {
        e = u(e, { min: 1, max: 12 }), g(e.min < 1, "Chance: Min cannot be less than 1."), g(e.max > 12, "Chance: Max cannot be greater than 12."), g(e.min > e.max, "Chance: Min cannot be greater than Max.");
        var t = this.pick(this.months().slice(e.min - 1, e.max));
        return e.raw ? t : t.name;
      }, o.prototype.months = function() {
        return this.get("months");
      }, o.prototype.second = function() {
        return this.natural({ max: 59 });
      }, o.prototype.timestamp = function() {
        return this.natural({ min: 1, max: parseInt((/* @__PURE__ */ new Date()).getTime() / 1e3, 10) });
      }, o.prototype.weekday = function(e) {
        e = u(e, { weekday_only: !1 });
        var t = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        return e.weekday_only || (t.push("Saturday"), t.push("Sunday")), this.pickone(t);
      }, o.prototype.year = function(e) {
        return e = u(e, { min: (/* @__PURE__ */ new Date()).getFullYear() }), e.max = typeof e.max < "u" ? e.max : e.min + 100, this.natural(e).toString();
      }, o.prototype.cc = function(e) {
        e = u(e);
        var t, c, b;
        return t = e.type ? this.cc_type({ name: e.type, raw: !0 }) : this.cc_type({ raw: !0 }), c = t.prefix.split(""), b = t.length - t.prefix.length - 1, c = c.concat(this.n(this.integer, b, { min: 0, max: 9 })), c.push(this.luhn_calculate(c.join(""))), c.join("");
      }, o.prototype.cc_types = function() {
        return this.get("cc_types");
      }, o.prototype.cc_type = function(e) {
        e = u(e);
        var t = this.cc_types(), c = null;
        if (e.name) {
          for (var b = 0; b < t.length; b++)
            if (t[b].name === e.name || t[b].short_name === e.name) {
              c = t[b];
              break;
            }
          if (c === null)
            throw new RangeError("Chance: Credit card type '" + e.name + "' is not supported");
        } else
          c = this.pick(t);
        return e.raw ? c : c.name;
      }, o.prototype.currency_types = function() {
        return this.get("currency_types");
      }, o.prototype.currency = function() {
        return this.pick(this.currency_types());
      }, o.prototype.timezones = function() {
        return this.get("timezones");
      }, o.prototype.timezone = function() {
        return this.pick(this.timezones());
      }, o.prototype.currency_pair = function(e) {
        var t = this.unique(this.currency, 2, {
          comparator: function(c, b) {
            return c.reduce(function(C, M) {
              return C || M.code === b.code;
            }, !1);
          }
        });
        return e ? t[0].code + "/" + t[1].code : t;
      }, o.prototype.dollar = function(e) {
        e = u(e, { max: 1e4, min: 0 });
        var t = this.floating({ min: e.min, max: e.max, fixed: 2 }).toString(), c = t.split(".")[1];
        return c === void 0 ? t += ".00" : c.length < 2 && (t = t + "0"), t < 0 ? "-$" + t.replace("-", "") : "$" + t;
      }, o.prototype.euro = function(e) {
        return Number(this.dollar(e).replace("$", "")).toLocaleString() + "\u20AC";
      }, o.prototype.exp = function(e) {
        e = u(e);
        var t = {};
        return t.year = this.exp_year(), t.year === (/* @__PURE__ */ new Date()).getFullYear().toString() ? t.month = this.exp_month({ future: !0 }) : t.month = this.exp_month(), e.raw ? t : t.month + "/" + t.year;
      }, o.prototype.exp_month = function(e) {
        e = u(e);
        var t, c, b = (/* @__PURE__ */ new Date()).getMonth() + 1;
        if (e.future && b !== 12)
          do
            t = this.month({ raw: !0 }).numeric, c = parseInt(t, 10);
          while (c <= b);
        else
          t = this.month({ raw: !0 }).numeric;
        return t;
      }, o.prototype.exp_year = function() {
        var e = (/* @__PURE__ */ new Date()).getMonth() + 1, t = (/* @__PURE__ */ new Date()).getFullYear();
        return this.year({ min: e === 12 ? t + 1 : t, max: t + 10 });
      }, o.prototype.vat = function(e) {
        switch (e = u(e, { country: "it" }), e.country.toLowerCase()) {
          case "it":
            return this.it_vat();
        }
      }, o.prototype.iban = function() {
        var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", t = e + "0123456789", c = this.string({ length: 2, pool: e }) + this.pad(this.integer({ min: 0, max: 99 }), 2) + this.string({ length: 4, pool: t }) + this.pad(this.natural(), this.natural({ min: 6, max: 26 }));
        return c;
      }, o.prototype.it_vat = function() {
        var e = this.natural({ min: 1, max: 18e5 });
        return e = this.pad(e, 7) + this.pad(this.pick(this.provinces({ country: "it" })).code, 3), e + this.luhn_calculate(e);
      }, o.prototype.cf = function(e) {
        e = e || {};
        var t = e.gender ? e.gender : this.gender(), c = e.first ? e.first : this.first({ gender: t, nationality: "it" }), b = e.last ? e.last : this.last({ nationality: "it" }), C = e.birthday ? e.birthday : this.birthday(), M = e.city ? e.city : this.pickone(["A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", "Z"]) + this.pad(this.natural({ max: 999 }), 3), w = [], v = function(_, R) {
          var E, G = [];
          return _.length < 3 ? G = _.split("").concat("XXX".split("")).splice(0, 3) : (E = _.toUpperCase().split("").map(function(W) {
            return "BCDFGHJKLMNPRSTVWZ".indexOf(W) !== -1 ? W : void 0;
          }).join(""), E.length > 3 && (R ? E = E.substr(0, 3) : E = E[0] + E.substr(2, 2)), E.length < 3 && (G = E, E = _.toUpperCase().split("").map(function(W) {
            return "AEIOU".indexOf(W) !== -1 ? W : void 0;
          }).join("").substr(0, 3 - G.length)), G = G + E), G;
        }, A = function(_, R, E) {
          var G = ["A", "B", "C", "D", "E", "H", "L", "M", "P", "R", "S", "T"];
          return _.getFullYear().toString().substr(2) + G[_.getMonth()] + E.pad(_.getDate() + (R.toLowerCase() === "female" ? 40 : 0), 2);
        }, S = function(_) {
          for (var R = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", E = "ABCDEFGHIJABCDEFGHIJKLMNOPQRSTUVWXYZ", G = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", W = "BAKPLCQDREVOSFTGUHMINJWZYX", H = 0, F = 0; F < 15; F++)
            F % 2 !== 0 ? H += G.indexOf(E[R.indexOf(_[F])]) : H += W.indexOf(E[R.indexOf(_[F])]);
          return G[H % 26];
        };
        return w = w.concat(v(b, !0), v(c), A(C, t, this), M.toUpperCase().split("")).join(""), w += S(w.toUpperCase()), w.toUpperCase();
      }, o.prototype.pl_pesel = function() {
        for (var e = this.natural({ min: 1, max: 9999999999 }), t = this.pad(e, 10).split(""), c = 0; c < t.length; c++)
          t[c] = parseInt(t[c]);
        var b = (1 * t[0] + 3 * t[1] + 7 * t[2] + 9 * t[3] + 1 * t[4] + 3 * t[5] + 7 * t[6] + 9 * t[7] + 1 * t[8] + 3 * t[9]) % 10;
        return b !== 0 && (b = 10 - b), t.join("") + b;
      }, o.prototype.pl_nip = function() {
        for (var e = this.natural({ min: 1, max: 999999999 }), t = this.pad(e, 9).split(""), c = 0; c < t.length; c++)
          t[c] = parseInt(t[c]);
        var b = (6 * t[0] + 5 * t[1] + 7 * t[2] + 2 * t[3] + 3 * t[4] + 4 * t[5] + 5 * t[6] + 6 * t[7] + 7 * t[8]) % 11;
        return b === 10 ? this.pl_nip() : t.join("") + b;
      }, o.prototype.pl_regon = function() {
        for (var e = this.natural({ min: 1, max: 99999999 }), t = this.pad(e, 8).split(""), c = 0; c < t.length; c++)
          t[c] = parseInt(t[c]);
        var b = (8 * t[0] + 9 * t[1] + 2 * t[2] + 3 * t[3] + 4 * t[4] + 5 * t[5] + 6 * t[6] + 7 * t[7]) % 11;
        return b === 10 && (b = 0), t.join("") + b;
      }, o.prototype.music_genre = function(e = "general") {
        if (!(e.toLowerCase() in I.music_genres))
          throw new Error(`Unsupported genre: ${e}`);
        const t = I.music_genres[e.toLowerCase()], c = this.integer({ min: 0, max: t.length - 1 });
        return t[c];
      }, o.prototype.note = function(e) {
        e = u(e, { notes: "flatKey" });
        var t = {
          naturals: ["C", "D", "E", "F", "G", "A", "B"],
          flats: ["D\u266D", "E\u266D", "G\u266D", "A\u266D", "B\u266D"],
          sharps: ["C\u266F", "D\u266F", "F\u266F", "G\u266F", "A\u266F"]
        };
        return t.all = t.naturals.concat(t.flats.concat(t.sharps)), t.flatKey = t.naturals.concat(t.flats), t.sharpKey = t.naturals.concat(t.sharps), this.pickone(t[e.notes]);
      }, o.prototype.midi_note = function(e) {
        var t = 0, c = 127;
        return e = u(e, { min: t, max: c }), this.integer({ min: e.min, max: e.max });
      }, o.prototype.chord_quality = function(e) {
        e = u(e, { jazz: !0 });
        var t = ["maj", "min", "aug", "dim"];
        return e.jazz && (t = [
          "maj7",
          "min7",
          "7",
          "sus",
          "dim",
          "\xF8"
        ]), this.pickone(t);
      }, o.prototype.chord = function(e) {
        return e = u(e), this.note(e) + this.chord_quality(e);
      }, o.prototype.tempo = function(e) {
        var t = 40, c = 320;
        return e = u(e, { min: t, max: c }), this.integer({ min: e.min, max: e.max });
      }, o.prototype.coin = function() {
        return this.bool() ? "heads" : "tails";
      };
      function P(e) {
        return function() {
          return this.natural(e);
        };
      }
      o.prototype.d4 = P({ min: 1, max: 4 }), o.prototype.d6 = P({ min: 1, max: 6 }), o.prototype.d8 = P({ min: 1, max: 8 }), o.prototype.d10 = P({ min: 1, max: 10 }), o.prototype.d12 = P({ min: 1, max: 12 }), o.prototype.d20 = P({ min: 1, max: 20 }), o.prototype.d30 = P({ min: 1, max: 30 }), o.prototype.d100 = P({ min: 1, max: 100 }), o.prototype.rpg = function(e, t) {
        if (t = u(t), e) {
          var c = e.toLowerCase().split("d"), b = [];
          if (c.length !== 2 || !parseInt(c[0], 10) || !parseInt(c[1], 10))
            throw new Error("Chance: Invalid format provided. Please provide #d# where the first # is the number of dice to roll, the second # is the max of each die");
          for (var C = c[0]; C > 0; C--)
            b[C - 1] = this.natural({ min: 1, max: c[1] });
          return typeof t.sum < "u" && t.sum ? b.reduce(function(M, w) {
            return M + w;
          }) : b;
        } else
          throw new RangeError("Chance: A type of die roll must be included");
      }, o.prototype.guid = function(e) {
        e = u(e, { version: 5 });
        var t = "abcdef1234567890", c = "ab89", b = this.string({ pool: t, length: 8 }) + "-" + this.string({ pool: t, length: 4 }) + "-" + // The Version
        e.version + this.string({ pool: t, length: 3 }) + "-" + // The Variant
        this.string({ pool: c, length: 1 }) + this.string({ pool: t, length: 3 }) + "-" + this.string({ pool: t, length: 12 });
        return b;
      }, o.prototype.hash = function(e) {
        e = u(e, { length: 40, casing: "lower" });
        var t = e.casing === "upper" ? f.toUpperCase() : f;
        return this.string({ pool: t, length: e.length });
      }, o.prototype.luhn_check = function(e) {
        var t = e.toString(), c = +t.substring(t.length - 1);
        return c === this.luhn_calculate(+t.substring(0, t.length - 1));
      }, o.prototype.luhn_calculate = function(e) {
        for (var t = e.toString().split("").reverse(), c = 0, b, C = 0, M = t.length; M > C; ++C)
          b = +t[C], C % 2 === 0 && (b *= 2, b > 9 && (b -= 9)), c += b;
        return c * 9 % 10;
      }, o.prototype.md5 = function(e) {
        var t = { str: "", key: null, raw: !1 };
        if (!e)
          t.str = this.string(), e = {};
        else if (typeof e == "string")
          t.str = e, e = {};
        else {
          if (typeof e != "object")
            return null;
          if (e.constructor === "Array")
            return null;
        }
        if (t = u(e, t), !t.str)
          throw new Error("A parameter is required to return an md5 hash.");
        return this.bimd5.md5(t.str, t.key, t.raw);
      }, o.prototype.file = function(e) {
        var t = e || {}, c = "fileExtension", b = Object.keys(this.get("fileExtension")), C, M;
        if (C = this.word({ length: t.length }), t.extension)
          return M = t.extension, C + "." + M;
        if (t.extensions) {
          if (Array.isArray(t.extensions))
            return M = this.pickone(t.extensions), C + "." + M;
          if (t.extensions.constructor === Object) {
            var w = t.extensions, v = Object.keys(w);
            return M = this.pickone(w[this.pickone(v)]), C + "." + M;
          }
          throw new Error("Chance: Extensions must be an Array or Object");
        }
        if (t.fileType) {
          var A = t.fileType;
          if (b.indexOf(A) !== -1)
            return M = this.pickone(this.get(c)[A]), C + "." + M;
          throw new RangeError("Chance: Expect file type value to be 'raster', 'vector', '3d' or 'document'");
        }
        return M = this.pickone(this.get(c)[this.pickone(b)]), C + "." + M;
      }, o.prototype.fileWithContent = function(e) {
        var t = e || {}, c = "fileName" in t ? t.fileName : this.file().split(".")[0];
        if (c += "." + ("fileExtension" in t ? t.fileExtension : this.file().split(".")[1]), typeof t.fileSize != "number")
          throw new Error("File size must be an integer");
        var b = {
          fileData: this.buffer({ length: t.fileSize }),
          fileName: c
        };
        return b;
      };
      var I = {
        firstNames: {
          male: {
            en: ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Charles", "Thomas", "Christopher", "Daniel", "Matthew", "George", "Donald", "Anthony", "Paul", "Mark", "Edward", "Steven", "Kenneth", "Andrew", "Brian", "Joshua", "Kevin", "Ronald", "Timothy", "Jason", "Jeffrey", "Frank", "Gary", "Ryan", "Nicholas", "Eric", "Stephen", "Jacob", "Larry", "Jonathan", "Scott", "Raymond", "Justin", "Brandon", "Gregory", "Samuel", "Benjamin", "Patrick", "Jack", "Henry", "Walter", "Dennis", "Jerry", "Alexander", "Peter", "Tyler", "Douglas", "Harold", "Aaron", "Jose", "Adam", "Arthur", "Zachary", "Carl", "Nathan", "Albert", "Kyle", "Lawrence", "Joe", "Willie", "Gerald", "Roger", "Keith", "Jeremy", "Terry", "Harry", "Ralph", "Sean", "Jesse", "Roy", "Louis", "Billy", "Austin", "Bruce", "Eugene", "Christian", "Bryan", "Wayne", "Russell", "Howard", "Fred", "Ethan", "Jordan", "Philip", "Alan", "Juan", "Randy", "Vincent", "Bobby", "Dylan", "Johnny", "Phillip", "Victor", "Clarence", "Ernest", "Martin", "Craig", "Stanley", "Shawn", "Travis", "Bradley", "Leonard", "Earl", "Gabriel", "Jimmy", "Francis", "Todd", "Noah", "Danny", "Dale", "Cody", "Carlos", "Allen", "Frederick", "Logan", "Curtis", "Alex", "Joel", "Luis", "Norman", "Marvin", "Glenn", "Tony", "Nathaniel", "Rodney", "Melvin", "Alfred", "Steve", "Cameron", "Chad", "Edwin", "Caleb", "Evan", "Antonio", "Lee", "Herbert", "Jeffery", "Isaac", "Derek", "Ricky", "Marcus", "Theodore", "Elijah", "Luke", "Jesus", "Eddie", "Troy", "Mike", "Dustin", "Ray", "Adrian", "Bernard", "Leroy", "Angel", "Randall", "Wesley", "Ian", "Jared", "Mason", "Hunter", "Calvin", "Oscar", "Clifford", "Jay", "Shane", "Ronnie", "Barry", "Lucas", "Corey", "Manuel", "Leo", "Tommy", "Warren", "Jackson", "Isaiah", "Connor", "Don", "Dean", "Jon", "Julian", "Miguel", "Bill", "Lloyd", "Charlie", "Mitchell", "Leon", "Jerome", "Darrell", "Jeremiah", "Alvin", "Brett", "Seth", "Floyd", "Jim", "Blake", "Micheal", "Gordon", "Trevor", "Lewis", "Erik", "Edgar", "Vernon", "Devin", "Gavin", "Jayden", "Chris", "Clyde", "Tom", "Derrick", "Mario", "Brent", "Marc", "Herman", "Chase", "Dominic", "Ricardo", "Franklin", "Maurice", "Max", "Aiden", "Owen", "Lester", "Gilbert", "Elmer", "Gene", "Francisco", "Glen", "Cory", "Garrett", "Clayton", "Sam", "Jorge", "Chester", "Alejandro", "Jeff", "Harvey", "Milton", "Cole", "Ivan", "Andre", "Duane", "Landon"],
            // Data taken from http://www.dati.gov.it/dataset/comune-di-firenze_0163
            it: ["Adolfo", "Alberto", "Aldo", "Alessandro", "Alessio", "Alfredo", "Alvaro", "Andrea", "Angelo", "Angiolo", "Antonino", "Antonio", "Attilio", "Benito", "Bernardo", "Bruno", "Carlo", "Cesare", "Christian", "Claudio", "Corrado", "Cosimo", "Cristian", "Cristiano", "Daniele", "Dario", "David", "Davide", "Diego", "Dino", "Domenico", "Duccio", "Edoardo", "Elia", "Elio", "Emanuele", "Emiliano", "Emilio", "Enrico", "Enzo", "Ettore", "Fabio", "Fabrizio", "Federico", "Ferdinando", "Fernando", "Filippo", "Francesco", "Franco", "Gabriele", "Giacomo", "Giampaolo", "Giampiero", "Giancarlo", "Gianfranco", "Gianluca", "Gianmarco", "Gianni", "Gino", "Giorgio", "Giovanni", "Giuliano", "Giulio", "Giuseppe", "Graziano", "Gregorio", "Guido", "Iacopo", "Jacopo", "Lapo", "Leonardo", "Lorenzo", "Luca", "Luciano", "Luigi", "Manuel", "Marcello", "Marco", "Marino", "Mario", "Massimiliano", "Massimo", "Matteo", "Mattia", "Maurizio", "Mauro", "Michele", "Mirko", "Mohamed", "Nello", "Neri", "Niccol\xF2", "Nicola", "Osvaldo", "Otello", "Paolo", "Pier Luigi", "Piero", "Pietro", "Raffaele", "Remo", "Renato", "Renzo", "Riccardo", "Roberto", "Rolando", "Romano", "Salvatore", "Samuele", "Sandro", "Sergio", "Silvano", "Simone", "Stefano", "Thomas", "Tommaso", "Ubaldo", "Ugo", "Umberto", "Valerio", "Valter", "Vasco", "Vincenzo", "Vittorio"],
            // Data taken from http://www.svbkindernamen.nl/int/nl/kindernamen/index.html
            nl: ["Aaron", "Abel", "Adam", "Adriaan", "Albert", "Alexander", "Ali", "Arjen", "Arno", "Bart", "Bas", "Bastiaan", "Benjamin", "Bob", "Boris", "Bram", "Brent", "Cas", "Casper", "Chris", "Christiaan", "Cornelis", "Daan", "Daley", "Damian", "Dani", "Daniel", "Dani\xEBl", "David", "Dean", "Dirk", "Dylan", "Egbert", "Elijah", "Erik", "Erwin", "Evert", "Ezra", "Fabian", "Fedde", "Finn", "Florian", "Floris", "Frank", "Frans", "Frederik", "Freek", "Geert", "Gerard", "Gerben", "Gerrit", "Gijs", "Guus", "Hans", "Hendrik", "Henk", "Herman", "Hidde", "Hugo", "Jaap", "Jan Jaap", "Jan-Willem", "Jack", "Jacob", "Jan", "Jason", "Jasper", "Jayden", "Jelle", "Jelte", "Jens", "Jeroen", "Jesse", "Jim", "Job", "Joep", "Johannes", "John", "Jonathan", "Joris", "Joshua", "Jo\xEBl", "Julian", "Kees", "Kevin", "Koen", "Lars", "Laurens", "Leendert", "Lennard", "Lodewijk", "Luc", "Luca", "Lucas", "Lukas", "Luuk", "Maarten", "Marcus", "Martijn", "Martin", "Matthijs", "Maurits", "Max", "Mees", "Melle", "Mick", "Mika", "Milan", "Mohamed", "Mohammed", "Morris", "Muhammed", "Nathan", "Nick", "Nico", "Niek", "Niels", "Noah", "Noud", "Olivier", "Oscar", "Owen", "Paul", "Pepijn", "Peter", "Pieter", "Pim", "Quinten", "Reinier", "Rens", "Robin", "Ruben", "Sam", "Samuel", "Sander", "Sebastiaan", "Sem", "Sep", "Sepp", "Siem", "Simon", "Stan", "Stef", "Steven", "Stijn", "Sven", "Teun", "Thijmen", "Thijs", "Thomas", "Tijn", "Tim", "Timo", "Tobias", "Tom", "Victor", "Vince", "Willem", "Wim", "Wouter", "Yusuf"],
            // Data taken from https://fr.wikipedia.org/wiki/Liste_de_pr%C3%A9noms_fran%C3%A7ais_et_de_la_francophonie
            fr: ["Aaron", "Abdon", "Abel", "Ab\xE9lard", "Abelin", "Abondance", "Abraham", "Absalon", "Acace", "Achaire", "Achille", "Adalard", "Adalbald", "Adalb\xE9ron", "Adalbert", "Adalric", "Adam", "Adegrin", "Adel", "Adelin", "Andelin", "Adelphe", "Adam", "Ad\xE9odat", "Adh\xE9mar", "Adjutor", "Adolphe", "Adonis", "Adon", "Adrien", "Agapet", "Agathange", "Agathon", "Agilbert", "Ag\xE9nor", "Agnan", "Aignan", "Agrippin", "Aimable", "Aim\xE9", "Alain", "Alban", "Albin", "Aubin", "Alb\xE9ric", "Albert", "Albertet", "Alcibiade", "Alcide", "Alc\xE9e", "Alcime", "Aldonce", "Aldric", "Ald\xE9ric", "Aleaume", "Alexandre", "Alexis", "Alix", "Alliaume", "Aleaume", "Almine", "Almire", "Alo\xEFs", "Alph\xE9e", "Alphonse", "Alpinien", "Alver\xE8de", "Amalric", "Amaury", "Amandin", "Amant", "Ambroise", "Am\xE9d\xE9e", "Am\xE9lien", "Amiel", "Amour", "Ana\xEBl", "Anastase", "Anatole", "Ancelin", "And\xE9ol", "Andoche", "Andr\xE9", "Andoche", "Ange", "Angelin", "Angilbe", "Anglebert", "Angoustan", "Anicet", "Anne", "Annibal", "Ansbert", "Anselme", "Anthelme", "Antheaume", "Anthime", "Antide", "Antoine", "Antonius", "Antonin", "Apollinaire", "Apollon", "Aquilin", "Arcade", "Archambaud", "Archambeau", "Archange", "Archibald", "Arian", "Ariel", "Ariste", "Aristide", "Armand", "Armel", "Armin", "Arnould", "Arnaud", "Arolde", "Ars\xE8ne", "Arsino\xE9", "Arthaud", "Arth\xE8me", "Arthur", "Ascelin", "Athanase", "Aubry", "Audebert", "Audouin", "Audran", "Audric", "Auguste", "Augustin", "Aur\xE8le", "Aur\xE9lien", "Aurian", "Auxence", "Axel", "Aymard", "Aymeric", "Aymon", "Aymond", "Balthazar", "Baptiste", "Barnab\xE9", "Barth\xE9lemy", "Bartim\xE9e", "Basile", "Bastien", "Baudouin", "B\xE9nigne", "Benjamin", "Beno\xEEt", "B\xE9renger", "B\xE9rard", "Bernard", "Bertrand", "Blaise", "Bon", "Boniface", "Bouchard", "Brice", "Brieuc", "Bruno", "Brunon", "Calixte", "Calliste", "Cam\xE9lien", "Camille", "Camillien", "Candide", "Caribert", "Carloman", "Cassandre", "Cassien", "C\xE9dric", "C\xE9leste", "C\xE9lestin", "C\xE9lien", "C\xE9saire", "C\xE9sar", "Charles", "Charlemagne", "Childebert", "Chilp\xE9ric", "Chr\xE9tien", "Christian", "Christodule", "Christophe", "Chrysostome", "Clarence", "Claude", "Claudien", "Cl\xE9andre", "Cl\xE9ment", "Clotaire", "C\xF4me", "Constance", "Constant", "Constantin", "Corentin", "Cyprien", "Cyriaque", "Cyrille", "Cyril", "Damien", "Daniel", "David", "Delphin", "Denis", "D\xE9sir\xE9", "Didier", "Dieudonn\xE9", "Dimitri", "Dominique", "Dorian", "Doroth\xE9e", "Edgard", "Edmond", "\xC9douard", "\xC9leuth\xE8re", "\xC9lie", "\xC9lis\xE9e", "\xC9meric", "\xC9mile", "\xC9milien", "Emmanuel", "Enguerrand", "\xC9piphane", "\xC9ric", "Esprit", "Ernest", "\xC9tienne", "Eubert", "Eudes", "Eudoxe", "Eug\xE8ne", "Eus\xE8be", "Eustache", "\xC9variste", "\xC9vrard", "Fabien", "Fabrice", "Falba", "F\xE9licit\xE9", "F\xE9lix", "Ferdinand", "Fiacre", "Fid\xE8le", "Firmin", "Flavien", "Flodoard", "Florent", "Florentin", "Florestan", "Florian", "Fortun\xE9", "Foulques", "Francisque", "Fran\xE7ois", "Fran\xE7ais", "Franciscus", "Francs", "Fr\xE9d\xE9ric", "Fulbert", "Fulcran", "Fulgence", "Gabin", "Gabriel", "Ga\xEBl", "Garnier", "Gaston", "Gaspard", "Gatien", "Gaud", "Gautier", "G\xE9d\xE9on", "Geoffroy", "Georges", "G\xE9raud", "G\xE9rard", "Gerbert", "Germain", "Gervais", "Ghislain", "Gilbert", "Gilles", "Girart", "Gislebert", "Gondebaud", "Gonthier", "Gontran", "Gonzague", "Gr\xE9goire", "Gu\xE9rin", "Gui", "Guillaume", "Gustave", "Guy", "Guyot", "Hardouin", "Hector", "H\xE9delin", "H\xE9lier", "Henri", "Herbert", "Herluin", "Herv\xE9", "Hilaire", "Hildebert", "Hincmar", "Hippolyte", "Honor\xE9", "Hubert", "Hugues", "Innocent", "Isabeau", "Isidore", "Jacques", "Japhet", "Jason", "Jean", "Jeannel", "Jeannot", "J\xE9r\xE9mie", "J\xE9r\xF4me", "Joachim", "Joanny", "Job", "Jocelyn", "Jo\xEBl", "Johan", "Jonas", "Jonathan", "Joseph", "Josse", "Josselin", "Jourdain", "Jude", "Judica\xEBl", "Jules", "Julien", "Juste", "Justin", "Lambert", "Landry", "Laurent", "Lazare", "L\xE9andre", "L\xE9on", "L\xE9onard", "L\xE9opold", "Leu", "Loup", "Leufroy", "Lib\xE8re", "Li\xE9tald", "Lionel", "Lo\xEFc", "Longin", "Lorrain", "Lorraine", "Lothaire", "Louis", "Loup", "Luc", "Lucas", "Lucien", "Ludolphe", "Ludovic", "Macaire", "Malo", "Mamert", "Manass\xE9", "Marc", "Marceau", "Marcel", "Marcelin", "Marius", "Marseille", "Martial", "Martin", "Mathurin", "Matthias", "Mathias", "Matthieu", "Maugis", "Maurice", "Mauricet", "Maxence", "Maxime", "Maximilien", "Mayeul", "M\xE9d\xE9ric", "Melchior", "Mence", "Merlin", "M\xE9rov\xE9e", "Micha\xEBl", "Michel", "Mo\xEFse", "Morgan", "Nathan", "Nathana\xEBl", "Narcisse", "N\xE9h\xE9mie", "Nestor", "Nestor", "Nic\xE9phore", "Nicolas", "No\xE9", "No\xEBl", "Norbert", "Normand", "Normands", "Octave", "Odilon", "Odon", "Oger", "Olivier", "Oury", "Pac\xF4me", "Pal\xE9mon", "Parfait", "Pascal", "Paterne", "Patrice", "Paul", "P\xE9pin", "Perceval", "Phil\xE9mon", "Philibert", "Philippe", "Philoth\xE9e", "Pie", "Pierre", "Pierrick", "Prosper", "Quentin", "Raoul", "Rapha\xEBl", "Raymond", "R\xE9gis", "R\xE9jean", "R\xE9mi", "Renaud", "Ren\xE9", "Reybaud", "Richard", "Robert", "Roch", "Rodolphe", "Rodrigue", "Roger", "Roland", "Romain", "Romuald", "Rom\xE9o", "Rome", "Ronan", "Roselin", "Salomon", "Samuel", "Savin", "Savinien", "Scholastique", "S\xE9bastien", "S\xE9raphin", "Serge", "S\xE9verin", "Sidoine", "Sigebert", "Sigismond", "Silv\xE8re", "Simon", "Sim\xE9on", "Sixte", "Stanislas", "St\xE9phane", "Stephan", "Sylvain", "Sylvestre", "Tancr\xE8de", "Tanguy", "Taurin", "Th\xE9odore", "Th\xE9odose", "Th\xE9ophile", "Th\xE9ophraste", "Thibault", "Thibert", "Thierry", "Thomas", "Timol\xE9on", "Timoth\xE9e", "Titien", "Tonnin", "Toussaint", "Trajan", "Tristan", "Turold", "Tim", "Ulysse", "Urbain", "Valentin", "Val\xE8re", "Val\xE9ry", "Venance", "Venant", "Venceslas", "Vianney", "Victor", "Victorien", "Victorin", "Vigile", "Vincent", "Vital", "Vitalien", "Vivien", "Waleran", "Wandrille", "Xavier", "X\xE9nophon", "Yves", "Zacharie", "Zach\xE9", "Z\xE9phirin"]
          },
          female: {
            en: ["Mary", "Emma", "Elizabeth", "Minnie", "Margaret", "Ida", "Alice", "Bertha", "Sarah", "Annie", "Clara", "Ella", "Florence", "Cora", "Martha", "Laura", "Nellie", "Grace", "Carrie", "Maude", "Mabel", "Bessie", "Jennie", "Gertrude", "Julia", "Hattie", "Edith", "Mattie", "Rose", "Catherine", "Lillian", "Ada", "Lillie", "Helen", "Jessie", "Louise", "Ethel", "Lula", "Myrtle", "Eva", "Frances", "Lena", "Lucy", "Edna", "Maggie", "Pearl", "Daisy", "Fannie", "Josephine", "Dora", "Rosa", "Katherine", "Agnes", "Marie", "Nora", "May", "Mamie", "Blanche", "Stella", "Ellen", "Nancy", "Effie", "Sallie", "Nettie", "Della", "Lizzie", "Flora", "Susie", "Maud", "Mae", "Etta", "Harriet", "Sadie", "Caroline", "Katie", "Lydia", "Elsie", "Kate", "Susan", "Mollie", "Alma", "Addie", "Georgia", "Eliza", "Lulu", "Nannie", "Lottie", "Amanda", "Belle", "Charlotte", "Rebecca", "Ruth", "Viola", "Olive", "Amelia", "Hannah", "Jane", "Virginia", "Emily", "Matilda", "Irene", "Kathryn", "Esther", "Willie", "Henrietta", "Ollie", "Amy", "Rachel", "Sara", "Estella", "Theresa", "Augusta", "Ora", "Pauline", "Josie", "Lola", "Sophia", "Leona", "Anne", "Mildred", "Ann", "Beulah", "Callie", "Lou", "Delia", "Eleanor", "Barbara", "Iva", "Louisa", "Maria", "Mayme", "Evelyn", "Estelle", "Nina", "Betty", "Marion", "Bettie", "Dorothy", "Luella", "Inez", "Lela", "Rosie", "Allie", "Millie", "Janie", "Cornelia", "Victoria", "Ruby", "Winifred", "Alta", "Celia", "Christine", "Beatrice", "Birdie", "Harriett", "Mable", "Myra", "Sophie", "Tillie", "Isabel", "Sylvia", "Carolyn", "Isabelle", "Leila", "Sally", "Ina", "Essie", "Bertie", "Nell", "Alberta", "Katharine", "Lora", "Rena", "Mina", "Rhoda", "Mathilda", "Abbie", "Eula", "Dollie", "Hettie", "Eunice", "Fanny", "Ola", "Lenora", "Adelaide", "Christina", "Lelia", "Nelle", "Sue", "Johanna", "Lilly", "Lucinda", "Minerva", "Lettie", "Roxie", "Cynthia", "Helena", "Hilda", "Hulda", "Bernice", "Genevieve", "Jean", "Cordelia", "Marian", "Francis", "Jeanette", "Adeline", "Gussie", "Leah", "Lois", "Lura", "Mittie", "Hallie", "Isabella", "Olga", "Phoebe", "Teresa", "Hester", "Lida", "Lina", "Winnie", "Claudia", "Marguerite", "Vera", "Cecelia", "Bess", "Emilie", "Rosetta", "Verna", "Myrtie", "Cecilia", "Elva", "Olivia", "Ophelia", "Georgie", "Elnora", "Violet", "Adele", "Lily", "Linnie", "Loretta", "Madge", "Polly", "Virgie", "Eugenia", "Lucile", "Lucille", "Mabelle", "Rosalie"],
            // Data taken from http://www.dati.gov.it/dataset/comune-di-firenze_0162
            it: ["Ada", "Adriana", "Alessandra", "Alessia", "Alice", "Angela", "Anna", "Anna Maria", "Annalisa", "Annita", "Annunziata", "Antonella", "Arianna", "Asia", "Assunta", "Aurora", "Barbara", "Beatrice", "Benedetta", "Bianca", "Bruna", "Camilla", "Carla", "Carlotta", "Carmela", "Carolina", "Caterina", "Catia", "Cecilia", "Chiara", "Cinzia", "Clara", "Claudia", "Costanza", "Cristina", "Daniela", "Debora", "Diletta", "Dina", "Donatella", "Elena", "Eleonora", "Elisa", "Elisabetta", "Emanuela", "Emma", "Eva", "Federica", "Fernanda", "Fiorella", "Fiorenza", "Flora", "Franca", "Francesca", "Gabriella", "Gaia", "Gemma", "Giada", "Gianna", "Gina", "Ginevra", "Giorgia", "Giovanna", "Giulia", "Giuliana", "Giuseppa", "Giuseppina", "Grazia", "Graziella", "Greta", "Ida", "Ilaria", "Ines", "Iolanda", "Irene", "Irma", "Isabella", "Jessica", "Laura", "Lea", "Letizia", "Licia", "Lidia", "Liliana", "Lina", "Linda", "Lisa", "Livia", "Loretta", "Luana", "Lucia", "Luciana", "Lucrezia", "Luisa", "Manuela", "Mara", "Marcella", "Margherita", "Maria", "Maria Cristina", "Maria Grazia", "Maria Luisa", "Maria Pia", "Maria Teresa", "Marina", "Marisa", "Marta", "Martina", "Marzia", "Matilde", "Melissa", "Michela", "Milena", "Mirella", "Monica", "Natalina", "Nella", "Nicoletta", "Noemi", "Olga", "Paola", "Patrizia", "Piera", "Pierina", "Raffaella", "Rebecca", "Renata", "Rina", "Rita", "Roberta", "Rosa", "Rosanna", "Rossana", "Rossella", "Sabrina", "Sandra", "Sara", "Serena", "Silvana", "Silvia", "Simona", "Simonetta", "Sofia", "Sonia", "Stefania", "Susanna", "Teresa", "Tina", "Tiziana", "Tosca", "Valentina", "Valeria", "Vanda", "Vanessa", "Vanna", "Vera", "Veronica", "Vilma", "Viola", "Virginia", "Vittoria"],
            // Data taken from http://www.svbkindernamen.nl/int/nl/kindernamen/index.html
            nl: ["Ada", "Arianne", "Afke", "Amanda", "Amber", "Amy", "Aniek", "Anita", "Anja", "Anna", "Anne", "Annelies", "Annemarie", "Annette", "Anouk", "Astrid", "Aukje", "Barbara", "Bianca", "Carla", "Carlijn", "Carolien", "Chantal", "Charlotte", "Claudia", "Dani\xEBlle", "Debora", "Diane", "Dora", "Eline", "Elise", "Ella", "Ellen", "Emma", "Esmee", "Evelien", "Esther", "Erica", "Eva", "Femke", "Fleur", "Floor", "Froukje", "Gea", "Gerda", "Hanna", "Hanneke", "Heleen", "Hilde", "Ilona", "Ina", "Inge", "Ingrid", "Iris", "Isabel", "Isabelle", "Janneke", "Jasmijn", "Jeanine", "Jennifer", "Jessica", "Johanna", "Joke", "Julia", "Julie", "Karen", "Karin", "Katja", "Kim", "Lara", "Laura", "Lena", "Lianne", "Lieke", "Lilian", "Linda", "Lisa", "Lisanne", "Lotte", "Louise", "Maaike", "Manon", "Marga", "Maria", "Marissa", "Marit", "Marjolein", "Martine", "Marleen", "Melissa", "Merel", "Miranda", "Michelle", "Mirjam", "Mirthe", "Naomi", "Natalie", "Nienke", "Nina", "Noortje", "Olivia", "Patricia", "Paula", "Paulien", "Ramona", "Ria", "Rianne", "Roos", "Rosanne", "Ruth", "Sabrina", "Sandra", "Sanne", "Sara", "Saskia", "Silvia", "Sofia", "Sophie", "Sonja", "Suzanne", "Tamara", "Tess", "Tessa", "Tineke", "Valerie", "Vanessa", "Veerle", "Vera", "Victoria", "Wendy", "Willeke", "Yvonne", "Zo\xEB"],
            // Data taken from https://fr.wikipedia.org/wiki/Liste_de_pr%C3%A9noms_fran%C3%A7ais_et_de_la_francophonie
            fr: ["Abdon", "Abel", "Abiga\xEBlle", "Abiga\xEFl", "Acacius", "Acanthe", "Adalbert", "Adalsinde", "Adegrine", "Ad\xE9la\xEFde", "Ad\xE8le", "Ad\xE9lie", "Adeline", "Adeltrude", "Adolphe", "Adonis", "Adrast\xE9e", "Adrehilde", "Adrienne", "Agathe", "Agilbert", "Agla\xE9", "Aignan", "Agnefl\xE8te", "Agn\xE8s", "Agrippine", "Aim\xE9", "Alaine", "Ala\xEFs", "Albane", "Alb\xE9rade", "Alberte", "Alcide", "Alcine", "Alcyone", "Aldegonde", "Aleth", "Alexandrine", "Alexine", "Alice", "Ali\xE9nor", "Aliette", "Aline", "Alix", "Aliz\xE9", "Alo\xEFse", "Aloyse", "Alphonsine", "Alth\xE9e", "Amaliane", "Amalth\xE9e", "Amande", "Amandine", "Amant", "Amarande", "Amaranthe", "Amaryllis", "Ambre", "Ambroisie", "Am\xE9lie", "Am\xE9thyste", "Aminte", "Ana\xEBl", "Ana\xEFs", "Anastasie", "Anatole", "Ancelin", "Andr\xE9e", "An\xE9mone", "Angadr\xEAme", "Ang\xE8le", "Angeline", "Ang\xE9lique", "Angilbert", "Anicet", "Annabelle", "Anne", "Annette", "Annick", "Annie", "Annonciade", "Ansbert", "Anstrudie", "Anthelme", "Antigone", "Antoinette", "Antonine", "Aph\xE9lie", "Apolline", "Apollonie", "Aquiline", "Arabelle", "Arcadie", "Archange", "Argine", "Ariane", "Aricie", "Ariel", "Arielle", "Arlette", "Armance", "Armande", "Armandine", "Armelle", "Armide", "Armelle", "Armin", "Arnaud", "Ars\xE8ne", "Arsino\xE9", "Art\xE9mis", "Arthur", "Ascelin", "Ascension", "Assomption", "Astart\xE9", "Ast\xE9rie", "Astr\xE9e", "Astrid", "Athalie", "Athanasie", "Athina", "Aube", "Albert", "Aude", "Audrey", "Augustine", "Aure", "Aur\xE9lie", "Aur\xE9lien", "Aur\xE8le", "Aurore", "Auxence", "Aveline", "Abiga\xEBlle", "Avoye", "Axelle", "Aymard", "Azal\xE9e", "Ad\xE8le", "Adeline", "Barbe", "Basilisse", "Bathilde", "B\xE9atrice", "B\xE9atrix", "B\xE9n\xE9dicte", "B\xE9reng\xE8re", "Bernadette", "Berthe", "Bertille", "Beuve", "Blanche", "Blanc", "Blandine", "Brigitte", "Brune", "Brunehilde", "Callista", "Camille", "Capucine", "Carine", "Caroline", "Cassandre", "Catherine", "C\xE9cile", "C\xE9leste", "C\xE9lestine", "C\xE9line", "Chantal", "Charl\xE8ne", "Charline", "Charlotte", "Chlo\xE9", "Christelle", "Christiane", "Christine", "Claire", "Clara", "Claude", "Claudine", "Clarisse", "Cl\xE9mence", "Cl\xE9mentine", "Cl\xE9o", "Clio", "Clotilde", "Coline", "Conception", "Constance", "Coralie", "Coraline", "Corentine", "Corinne", "Cyrielle", "Daniel", "Daniel", "Daphn\xE9", "D\xE9bora", "Delphine", "Denise", "Diane", "Dieudonn\xE9", "Dominique", "Doriane", "Doroth\xE9e", "Douce", "\xC9dith", "Edm\xE9e", "\xC9l\xE9onore", "\xC9liane", "\xC9lia", "\xC9liette", "\xC9lisabeth", "\xC9lise", "Ella", "\xC9lodie", "\xC9lo\xEFse", "Elsa", "\xC9meline", "\xC9m\xE9rance", "\xC9m\xE9rentienne", "\xC9m\xE9rencie", "\xC9milie", "Emma", "Emmanuelle", "Emmelie", "Ernestine", "Esther", "Estelle", "Eudoxie", "Eug\xE9nie", "Eulalie", "Euphrasie", "Eus\xE9bie", "\xC9vang\xE9line", "Eva", "\xC8ve", "\xC9velyne", "Fanny", "Fantine", "Faustine", "F\xE9licie", "Fernande", "Flavie", "Fleur", "Flore", "Florence", "Florie", "Fortun\xE9", "France", "Francia", "Fran\xE7oise", "Francine", "Gabrielle", "Ga\xEBlle", "Garance", "Genevi\xE8ve", "Georgette", "Gerberge", "Germaine", "Gertrude", "Gis\xE8le", "Gueni\xE8vre", "Guilhemine", "Guillemette", "Gustave", "Gwenael", "H\xE9l\xE8ne", "H\xE9lo\xEFse", "Henriette", "Hermine", "Hermione", "Hippolyte", "Honorine", "Hortense", "Huguette", "Ines", "Ir\xE8ne", "Irina", "Iris", "Isabeau", "Isabelle", "Iseult", "Isolde", "Ism\xE9rie", "Jacinthe", "Jacqueline", "Jade", "Janine", "Jeanne", "Jocelyne", "Jo\xEBlle", "Jos\xE9phine", "Judith", "Julia", "Julie", "Jules", "Juliette", "Justine", "Katy", "Kathy", "Katie", "Laura", "Laure", "Laureline", "Laurence", "Laurene", "Lauriane", "Laurianne", "Laurine", "L\xE9a", "L\xE9na", "L\xE9onie", "L\xE9on", "L\xE9ontine", "Lorraine", "Lucie", "Lucienne", "Lucille", "Ludivine", "Lydie", "Lydie", "Megane", "Madeleine", "Magali", "Maguelone", "Mallaury", "Manon", "Marceline", "Margot", "Marguerite", "Marianne", "Marie", "Myriam", "Marie", "Marine", "Marion", "Marl\xE8ne", "Marthe", "Martine", "Mathilde", "Maud", "Maureen", "Mauricette", "Maxime", "M\xE9lanie", "Melissa", "M\xE9lissandre", "M\xE9lisande", "M\xE9lodie", "Michel", "Micheline", "Mireille", "Miriam", "Mo\xEFse", "Monique", "Morgane", "Muriel", "Myl\xE8ne", "Nad\xE8ge", "Nadine", "Nathalie", "Nicole", "Nicolette", "Nine", "No\xEBl", "No\xE9mie", "Oc\xE9ane", "Odette", "Odile", "Olive", "Olivia", "Olympe", "Ombline", "Ombeline", "Oph\xE9lie", "Oriande", "Oriane", "Ozanne", "Pascale", "Pascaline", "Paule", "Paulette", "Pauline", "Priscille", "Prisca", "Prisque", "P\xE9cine", "P\xE9lagie", "P\xE9n\xE9lope", "Perrine", "P\xE9tronille", "Philippine", "Philom\xE8ne", "Philoth\xE9e", "Primerose", "Prudence", "Pulch\xE9rie", "Quentine", "Qui\xE9ta", "Quintia", "Quintilla", "Rachel", "Rapha\xEBlle", "Raymonde", "Rebecca", "R\xE9gine", "R\xE9jeanne", "Ren\xE9", "Rita", "Rita", "Rolande", "Romane", "Rosalie", "Rose", "Roseline", "Sabine", "Salom\xE9", "Sandra", "Sandrine", "Sarah", "S\xE9gol\xE8ne", "S\xE9verine", "Sibylle", "Simone", "Sixt", "Solange", "Soline", "Sol\xE8ne", "Sophie", "St\xE9phanie", "Suzanne", "Sylvain", "Sylvie", "Tatiana", "Tha\xEFs", "Th\xE9odora", "Th\xE9r\xE8se", "Tiphaine", "Ursule", "Valentine", "Val\xE9rie", "V\xE9ronique", "Victoire", "Victorine", "Vinciane", "Violette", "Virginie", "Viviane", "Xavi\xE8re", "Yolande", "Ysaline", "Yvette", "Yvonne", "Z\xE9lie", "Zita", "Zo\xE9"]
          }
        },
        lastNames: {
          en: ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes", "Myers", "Ford", "Hamilton", "Graham", "Sullivan", "Wallace", "Woods", "Cole", "West", "Jordan", "Owens", "Reynolds", "Fisher", "Ellis", "Harrison", "Gibson", "McDonald", "Cruz", "Marshall", "Ortiz", "Gomez", "Murray", "Freeman", "Wells", "Webb", "Simpson", "Stevens", "Tucker", "Porter", "Hunter", "Hicks", "Crawford", "Henry", "Boyd", "Mason", "Morales", "Kennedy", "Warren", "Dixon", "Ramos", "Reyes", "Burns", "Gordon", "Shaw", "Holmes", "Rice", "Robertson", "Hunt", "Black", "Daniels", "Palmer", "Mills", "Nichols", "Grant", "Knight", "Ferguson", "Rose", "Stone", "Hawkins", "Dunn", "Perkins", "Hudson", "Spencer", "Gardner", "Stephens", "Payne", "Pierce", "Berry", "Matthews", "Arnold", "Wagner", "Willis", "Ray", "Watkins", "Olson", "Carroll", "Duncan", "Snyder", "Hart", "Cunningham", "Bradley", "Lane", "Andrews", "Ruiz", "Harper", "Fox", "Riley", "Armstrong", "Carpenter", "Weaver", "Greene", "Lawrence", "Elliott", "Chavez", "Sims", "Austin", "Peters", "Kelley", "Franklin", "Lawson", "Fields", "Gutierrez", "Ryan", "Schmidt", "Carr", "Vasquez", "Castillo", "Wheeler", "Chapman", "Oliver", "Montgomery", "Richards", "Williamson", "Johnston", "Banks", "Meyer", "Bishop", "McCoy", "Howell", "Alvarez", "Morrison", "Hansen", "Fernandez", "Garza", "Harvey", "Little", "Burton", "Stanley", "Nguyen", "George", "Jacobs", "Reid", "Kim", "Fuller", "Lynch", "Dean", "Gilbert", "Garrett", "Romero", "Welch", "Larson", "Frazier", "Burke", "Hanson", "Day", "Mendoza", "Moreno", "Bowman", "Medina", "Fowler", "Brewer", "Hoffman", "Carlson", "Silva", "Pearson", "Holland", "Douglas", "Fleming", "Jensen", "Vargas", "Byrd", "Davidson", "Hopkins", "May", "Terry", "Herrera", "Wade", "Soto", "Walters", "Curtis", "Neal", "Caldwell", "Lowe", "Jennings", "Barnett", "Graves", "Jimenez", "Horton", "Shelton", "Barrett", "Obrien", "Castro", "Sutton", "Gregory", "McKinney", "Lucas", "Miles", "Craig", "Rodriquez", "Chambers", "Holt", "Lambert", "Fletcher", "Watts", "Bates", "Hale", "Rhodes", "Pena", "Beck", "Newman", "Haynes", "McDaniel", "Mendez", "Bush", "Vaughn", "Parks", "Dawson", "Santiago", "Norris", "Hardy", "Love", "Steele", "Curry", "Powers", "Schultz", "Barker", "Guzman", "Page", "Munoz", "Ball", "Keller", "Chandler", "Weber", "Leonard", "Walsh", "Lyons", "Ramsey", "Wolfe", "Schneider", "Mullins", "Benson", "Sharp", "Bowen", "Daniel", "Barber", "Cummings", "Hines", "Baldwin", "Griffith", "Valdez", "Hubbard", "Salazar", "Reeves", "Warner", "Stevenson", "Burgess", "Santos", "Tate", "Cross", "Garner", "Mann", "Mack", "Moss", "Thornton", "Dennis", "McGee", "Farmer", "Delgado", "Aguilar", "Vega", "Glover", "Manning", "Cohen", "Harmon", "Rodgers", "Robbins", "Newton", "Todd", "Blair", "Higgins", "Ingram", "Reese", "Cannon", "Strickland", "Townsend", "Potter", "Goodwin", "Walton", "Rowe", "Hampton", "Ortega", "Patton", "Swanson", "Joseph", "Francis", "Goodman", "Maldonado", "Yates", "Becker", "Erickson", "Hodges", "Rios", "Conner", "Adkins", "Webster", "Norman", "Malone", "Hammond", "Flowers", "Cobb", "Moody", "Quinn", "Blake", "Maxwell", "Pope", "Floyd", "Osborne", "Paul", "McCarthy", "Guerrero", "Lindsey", "Estrada", "Sandoval", "Gibbs", "Tyler", "Gross", "Fitzgerald", "Stokes", "Doyle", "Sherman", "Saunders", "Wise", "Colon", "Gill", "Alvarado", "Greer", "Padilla", "Simon", "Waters", "Nunez", "Ballard", "Schwartz", "McBride", "Houston", "Christensen", "Klein", "Pratt", "Briggs", "Parsons", "McLaughlin", "Zimmerman", "French", "Buchanan", "Moran", "Copeland", "Roy", "Pittman", "Brady", "McCormick", "Holloway", "Brock", "Poole", "Frank", "Logan", "Owen", "Bass", "Marsh", "Drake", "Wong", "Jefferson", "Park", "Morton", "Abbott", "Sparks", "Patrick", "Norton", "Huff", "Clayton", "Massey", "Lloyd", "Figueroa", "Carson", "Bowers", "Roberson", "Barton", "Tran", "Lamb", "Harrington", "Casey", "Boone", "Cortez", "Clarke", "Mathis", "Singleton", "Wilkins", "Cain", "Bryan", "Underwood", "Hogan", "McKenzie", "Collier", "Luna", "Phelps", "McGuire", "Allison", "Bridges", "Wilkerson", "Nash", "Summers", "Atkins"],
          // Data taken from http://www.dati.gov.it/dataset/comune-di-firenze_0164 (first 1000)
          it: ["Acciai", "Aglietti", "Agostini", "Agresti", "Ahmed", "Aiazzi", "Albanese", "Alberti", "Alessi", "Alfani", "Alinari", "Alterini", "Amato", "Ammannati", "Ancillotti", "Andrei", "Andreini", "Andreoni", "Angeli", "Anichini", "Antonelli", "Antonini", "Arena", "Ariani", "Arnetoli", "Arrighi", "Baccani", "Baccetti", "Bacci", "Bacherini", "Badii", "Baggiani", "Baglioni", "Bagni", "Bagnoli", "Baldassini", "Baldi", "Baldini", "Ballerini", "Balli", "Ballini", "Balloni", "Bambi", "Banchi", "Bandinelli", "Bandini", "Bani", "Barbetti", "Barbieri", "Barchielli", "Bardazzi", "Bardelli", "Bardi", "Barducci", "Bargellini", "Bargiacchi", "Barni", "Baroncelli", "Baroncini", "Barone", "Baroni", "Baronti", "Bartalesi", "Bartoletti", "Bartoli", "Bartolini", "Bartoloni", "Bartolozzi", "Basagni", "Basile", "Bassi", "Batacchi", "Battaglia", "Battaglini", "Bausi", "Becagli", "Becattini", "Becchi", "Becucci", "Bellandi", "Bellesi", "Belli", "Bellini", "Bellucci", "Bencini", "Benedetti", "Benelli", "Beni", "Benini", "Bensi", "Benucci", "Benvenuti", "Berlincioni", "Bernacchioni", "Bernardi", "Bernardini", "Berni", "Bernini", "Bertelli", "Berti", "Bertini", "Bessi", "Betti", "Bettini", "Biagi", "Biagini", "Biagioni", "Biagiotti", "Biancalani", "Bianchi", "Bianchini", "Bianco", "Biffoli", "Bigazzi", "Bigi", "Biliotti", "Billi", "Binazzi", "Bindi", "Bini", "Biondi", "Bizzarri", "Bocci", "Bogani", "Bolognesi", "Bonaiuti", "Bonanni", "Bonciani", "Boncinelli", "Bondi", "Bonechi", "Bongini", "Boni", "Bonini", "Borchi", "Boretti", "Borghi", "Borghini", "Borgioli", "Borri", "Borselli", "Boschi", "Bottai", "Bracci", "Braccini", "Brandi", "Braschi", "Bravi", "Brazzini", "Breschi", "Brilli", "Brizzi", "Brogelli", "Brogi", "Brogioni", "Brunelli", "Brunetti", "Bruni", "Bruno", "Brunori", "Bruschi", "Bucci", "Bucciarelli", "Buccioni", "Bucelli", "Bulli", "Burberi", "Burchi", "Burgassi", "Burroni", "Bussotti", "Buti", "Caciolli", "Caiani", "Calabrese", "Calamai", "Calamandrei", "Caldini", "Calo'", "Calonaci", "Calosi", "Calvelli", "Cambi", "Camiciottoli", "Cammelli", "Cammilli", "Campolmi", "Cantini", "Capanni", "Capecchi", "Caponi", "Cappelletti", "Cappelli", "Cappellini", "Cappugi", "Capretti", "Caputo", "Carbone", "Carboni", "Cardini", "Carlesi", "Carletti", "Carli", "Caroti", "Carotti", "Carrai", "Carraresi", "Carta", "Caruso", "Casalini", "Casati", "Caselli", "Casini", "Castagnoli", "Castellani", "Castelli", "Castellucci", "Catalano", "Catarzi", "Catelani", "Cavaciocchi", "Cavallaro", "Cavallini", "Cavicchi", "Cavini", "Ceccarelli", "Ceccatelli", "Ceccherelli", "Ceccherini", "Cecchi", "Cecchini", "Cecconi", "Cei", "Cellai", "Celli", "Cellini", "Cencetti", "Ceni", "Cenni", "Cerbai", "Cesari", "Ceseri", "Checcacci", "Checchi", "Checcucci", "Cheli", "Chellini", "Chen", "Cheng", "Cherici", "Cherubini", "Chiaramonti", "Chiarantini", "Chiarelli", "Chiari", "Chiarini", "Chiarugi", "Chiavacci", "Chiesi", "Chimenti", "Chini", "Chirici", "Chiti", "Ciabatti", "Ciampi", "Cianchi", "Cianfanelli", "Cianferoni", "Ciani", "Ciapetti", "Ciappi", "Ciardi", "Ciatti", "Cicali", "Ciccone", "Cinelli", "Cini", "Ciobanu", "Ciolli", "Cioni", "Cipriani", "Cirillo", "Cirri", "Ciucchi", "Ciuffi", "Ciulli", "Ciullini", "Clemente", "Cocchi", "Cognome", "Coli", "Collini", "Colombo", "Colzi", "Comparini", "Conforti", "Consigli", "Conte", "Conti", "Contini", "Coppini", "Coppola", "Corsi", "Corsini", "Corti", "Cortini", "Cosi", "Costa", "Costantini", "Costantino", "Cozzi", "Cresci", "Crescioli", "Cresti", "Crini", "Curradi", "D'Agostino", "D'Alessandro", "D'Amico", "D'Angelo", "Daddi", "Dainelli", "Dallai", "Danti", "Davitti", "De Angelis", "De Luca", "De Marco", "De Rosa", "De Santis", "De Simone", "De Vita", "Degl'Innocenti", "Degli Innocenti", "Dei", "Del Lungo", "Del Re", "Di Marco", "Di Stefano", "Dini", "Diop", "Dobre", "Dolfi", "Donati", "Dondoli", "Dong", "Donnini", "Ducci", "Dumitru", "Ermini", "Esposito", "Evangelisti", "Fabbri", "Fabbrini", "Fabbrizzi", "Fabbroni", "Fabbrucci", "Fabiani", "Facchini", "Faggi", "Fagioli", "Failli", "Faini", "Falciani", "Falcini", "Falcone", "Fallani", "Falorni", "Falsini", "Falugiani", "Fancelli", "Fanelli", "Fanetti", "Fanfani", "Fani", "Fantappie'", "Fantechi", "Fanti", "Fantini", "Fantoni", "Farina", "Fattori", "Favilli", "Fedi", "Fei", "Ferrante", "Ferrara", "Ferrari", "Ferraro", "Ferretti", "Ferri", "Ferrini", "Ferroni", "Fiaschi", "Fibbi", "Fiesoli", "Filippi", "Filippini", "Fini", "Fioravanti", "Fiore", "Fiorentini", "Fiorini", "Fissi", "Focardi", "Foggi", "Fontana", "Fontanelli", "Fontani", "Forconi", "Formigli", "Forte", "Forti", "Fortini", "Fossati", "Fossi", "Francalanci", "Franceschi", "Franceschini", "Franchi", "Franchini", "Franci", "Francini", "Francioni", "Franco", "Frassineti", "Frati", "Fratini", "Frilli", "Frizzi", "Frosali", "Frosini", "Frullini", "Fusco", "Fusi", "Gabbrielli", "Gabellini", "Gagliardi", "Galanti", "Galardi", "Galeotti", "Galletti", "Galli", "Gallo", "Gallori", "Gambacciani", "Gargani", "Garofalo", "Garuglieri", "Gashi", "Gasperini", "Gatti", "Gelli", "Gensini", "Gentile", "Gentili", "Geri", "Gerini", "Gheri", "Ghini", "Giachetti", "Giachi", "Giacomelli", "Gianassi", "Giani", "Giannelli", "Giannetti", "Gianni", "Giannini", "Giannoni", "Giannotti", "Giannozzi", "Gigli", "Giordano", "Giorgetti", "Giorgi", "Giovacchini", "Giovannelli", "Giovannetti", "Giovannini", "Giovannoni", "Giuliani", "Giunti", "Giuntini", "Giusti", "Gonnelli", "Goretti", "Gori", "Gradi", "Gramigni", "Grassi", "Grasso", "Graziani", "Grazzini", "Greco", "Grifoni", "Grillo", "Grimaldi", "Grossi", "Gualtieri", "Guarducci", "Guarino", "Guarnieri", "Guasti", "Guerra", "Guerri", "Guerrini", "Guidi", "Guidotti", "He", "Hoxha", "Hu", "Huang", "Iandelli", "Ignesti", "Innocenti", "Jin", "La Rosa", "Lai", "Landi", "Landini", "Lanini", "Lapi", "Lapini", "Lari", "Lascialfari", "Lastrucci", "Latini", "Lazzeri", "Lazzerini", "Lelli", "Lenzi", "Leonardi", "Leoncini", "Leone", "Leoni", "Lepri", "Li", "Liao", "Lin", "Linari", "Lippi", "Lisi", "Livi", "Lombardi", "Lombardini", "Lombardo", "Longo", "Lopez", "Lorenzi", "Lorenzini", "Lorini", "Lotti", "Lu", "Lucchesi", "Lucherini", "Lunghi", "Lupi", "Madiai", "Maestrini", "Maffei", "Maggi", "Maggini", "Magherini", "Magini", "Magnani", "Magnelli", "Magni", "Magnolfi", "Magrini", "Malavolti", "Malevolti", "Manca", "Mancini", "Manetti", "Manfredi", "Mangani", "Mannelli", "Manni", "Mannini", "Mannucci", "Manuelli", "Manzini", "Marcelli", "Marchese", "Marchetti", "Marchi", "Marchiani", "Marchionni", "Marconi", "Marcucci", "Margheri", "Mari", "Mariani", "Marilli", "Marinai", "Marinari", "Marinelli", "Marini", "Marino", "Mariotti", "Marsili", "Martelli", "Martinelli", "Martini", "Martino", "Marzi", "Masi", "Masini", "Masoni", "Massai", "Materassi", "Mattei", "Matteini", "Matteucci", "Matteuzzi", "Mattioli", "Mattolini", "Matucci", "Mauro", "Mazzanti", "Mazzei", "Mazzetti", "Mazzi", "Mazzini", "Mazzocchi", "Mazzoli", "Mazzoni", "Mazzuoli", "Meacci", "Mecocci", "Meini", "Melani", "Mele", "Meli", "Mengoni", "Menichetti", "Meoni", "Merlini", "Messeri", "Messina", "Meucci", "Miccinesi", "Miceli", "Micheli", "Michelini", "Michelozzi", "Migliori", "Migliorini", "Milani", "Miniati", "Misuri", "Monaco", "Montagnani", "Montagni", "Montanari", "Montelatici", "Monti", "Montigiani", "Montini", "Morandi", "Morandini", "Morelli", "Moretti", "Morganti", "Mori", "Morini", "Moroni", "Morozzi", "Mugnai", "Mugnaini", "Mustafa", "Naldi", "Naldini", "Nannelli", "Nanni", "Nannini", "Nannucci", "Nardi", "Nardini", "Nardoni", "Natali", "Ndiaye", "Nencetti", "Nencini", "Nencioni", "Neri", "Nesi", "Nesti", "Niccolai", "Niccoli", "Niccolini", "Nigi", "Nistri", "Nocentini", "Noferini", "Novelli", "Nucci", "Nuti", "Nutini", "Oliva", "Olivieri", "Olmi", "Orlandi", "Orlandini", "Orlando", "Orsini", "Ortolani", "Ottanelli", "Pacciani", "Pace", "Paci", "Pacini", "Pagani", "Pagano", "Paggetti", "Pagliai", "Pagni", "Pagnini", "Paladini", "Palagi", "Palchetti", "Palloni", "Palmieri", "Palumbo", "Pampaloni", "Pancani", "Pandolfi", "Pandolfini", "Panerai", "Panichi", "Paoletti", "Paoli", "Paolini", "Papi", "Papini", "Papucci", "Parenti", "Parigi", "Parisi", "Parri", "Parrini", "Pasquini", "Passeri", "Pecchioli", "Pecorini", "Pellegrini", "Pepi", "Perini", "Perrone", "Peruzzi", "Pesci", "Pestelli", "Petri", "Petrini", "Petrucci", "Pettini", "Pezzati", "Pezzatini", "Piani", "Piazza", "Piazzesi", "Piazzini", "Piccardi", "Picchi", "Piccini", "Piccioli", "Pieraccini", "Pieraccioni", "Pieralli", "Pierattini", "Pieri", "Pierini", "Pieroni", "Pietrini", "Pini", "Pinna", "Pinto", "Pinzani", "Pinzauti", "Piras", "Pisani", "Pistolesi", "Poggesi", "Poggi", "Poggiali", "Poggiolini", "Poli", "Pollastri", "Porciani", "Pozzi", "Pratellesi", "Pratesi", "Prosperi", "Pruneti", "Pucci", "Puccini", "Puccioni", "Pugi", "Pugliese", "Puliti", "Querci", "Quercioli", "Raddi", "Radu", "Raffaelli", "Ragazzini", "Ranfagni", "Ranieri", "Rastrelli", "Raugei", "Raveggi", "Renai", "Renzi", "Rettori", "Ricci", "Ricciardi", "Ridi", "Ridolfi", "Rigacci", "Righi", "Righini", "Rinaldi", "Risaliti", "Ristori", "Rizzo", "Rocchi", "Rocchini", "Rogai", "Romagnoli", "Romanelli", "Romani", "Romano", "Romei", "Romeo", "Romiti", "Romoli", "Romolini", "Rontini", "Rosati", "Roselli", "Rosi", "Rossetti", "Rossi", "Rossini", "Rovai", "Ruggeri", "Ruggiero", "Russo", "Sabatini", "Saccardi", "Sacchetti", "Sacchi", "Sacco", "Salerno", "Salimbeni", "Salucci", "Salvadori", "Salvestrini", "Salvi", "Salvini", "Sanesi", "Sani", "Sanna", "Santi", "Santini", "Santoni", "Santoro", "Santucci", "Sardi", "Sarri", "Sarti", "Sassi", "Sbolci", "Scali", "Scarpelli", "Scarselli", "Scopetani", "Secci", "Selvi", "Senatori", "Senesi", "Serafini", "Sereni", "Serra", "Sestini", "Sguanci", "Sieni", "Signorini", "Silvestri", "Simoncini", "Simonetti", "Simoni", "Singh", "Sodi", "Soldi", "Somigli", "Sorbi", "Sorelli", "Sorrentino", "Sottili", "Spina", "Spinelli", "Staccioli", "Staderini", "Stefanelli", "Stefani", "Stefanini", "Stella", "Susini", "Tacchi", "Tacconi", "Taddei", "Tagliaferri", "Tamburini", "Tanganelli", "Tani", "Tanini", "Tapinassi", "Tarchi", "Tarchiani", "Targioni", "Tassi", "Tassini", "Tempesti", "Terzani", "Tesi", "Testa", "Testi", "Tilli", "Tinti", "Tirinnanzi", "Toccafondi", "Tofanari", "Tofani", "Tognaccini", "Tonelli", "Tonini", "Torelli", "Torrini", "Tosi", "Toti", "Tozzi", "Trambusti", "Trapani", "Tucci", "Turchi", "Ugolini", "Ulivi", "Valente", "Valenti", "Valentini", "Vangelisti", "Vanni", "Vannini", "Vannoni", "Vannozzi", "Vannucchi", "Vannucci", "Ventura", "Venturi", "Venturini", "Vestri", "Vettori", "Vichi", "Viciani", "Vieri", "Vigiani", "Vignoli", "Vignolini", "Vignozzi", "Villani", "Vinci", "Visani", "Vitale", "Vitali", "Viti", "Viviani", "Vivoli", "Volpe", "Volpi", "Wang", "Wu", "Xu", "Yang", "Ye", "Zagli", "Zani", "Zanieri", "Zanobini", "Zecchi", "Zetti", "Zhang", "Zheng", "Zhou", "Zhu", "Zingoni", "Zini", "Zoppi"],
          // http://www.voornamelijk.nl/meest-voorkomende-achternamen-in-nederland-en-amsterdam/
          nl: ["Albers", "Alblas", "Appelman", "Baars", "Baas", "Bakker", "Blank", "Bleeker", "Blok", "Blom", "Boer", "Boers", "Boldewijn", "Boon", "Boot", "Bos", "Bosch", "Bosma", "Bosman", "Bouma", "Bouman", "Bouwman", "Brands", "Brouwer", "Burger", "Buijs", "Buitenhuis", "Ceder", "Cohen", "Dekker", "Dekkers", "Dijkman", "Dijkstra", "Driessen", "Drost", "Engel", "Evers", "Faber", "Franke", "Gerritsen", "Goedhart", "Goossens", "Groen", "Groenenberg", "Groot", "Haan", "Hart", "Heemskerk", "Hendriks", "Hermans", "Hoekstra", "Hofman", "Hopman", "Huisman", "Jacobs", "Jansen", "Janssen", "Jonker", "Jaspers", "Keijzer", "Klaassen", "Klein", "Koek", "Koenders", "Kok", "Kool", "Koopman", "Koopmans", "Koning", "Koster", "Kramer", "Kroon", "Kuijpers", "Kuiper", "Kuipers", "Kurt", "Koster", "Kwakman", "Los", "Lubbers", "Maas", "Markus", "Martens", "Meijer", "Mol", "Molenaar", "Mulder", "Nieuwenhuis", "Peeters", "Peters", "Pengel", "Pieters", "Pool", "Post", "Postma", "Prins", "Pronk", "Reijnders", "Rietveld", "Roest", "Roos", "Sanders", "Schaap", "Scheffer", "Schenk", "Schilder", "Schipper", "Schmidt", "Scholten", "Schouten", "Schut", "Schutte", "Schuurman", "Simons", "Smeets", "Smit", "Smits", "Snel", "Swinkels", "Tas", "Terpstra", "Timmermans", "Tol", "Tromp", "Troost", "Valk", "Veenstra", "Veldkamp", "Verbeek", "Verheul", "Verhoeven", "Vermeer", "Vermeulen", "Verweij", "Vink", "Visser", "Voorn", "Vos", "Wagenaar", "Wiersema", "Willems", "Willemsen", "Witteveen", "Wolff", "Wolters", "Zijlstra", "Zwart", "de Beer", "de Boer", "de Bruijn", "de Bruin", "de Graaf", "de Groot", "de Haan", "de Haas", "de Jager", "de Jong", "de Jonge", "de Koning", "de Lange", "de Leeuw", "de Ridder", "de Rooij", "de Ruiter", "de Vos", "de Vries", "de Waal", "de Wit", "de Zwart", "van Beek", "van Boven", "van Dam", "van Dijk", "van Dongen", "van Doorn", "van Egmond", "van Eijk", "van Es", "van Gelder", "van Gelderen", "van Houten", "van Hulst", "van Kempen", "van Kesteren", "van Leeuwen", "van Loon", "van Mill", "van Noord", "van Ommen", "van Ommeren", "van Oosten", "van Oostveen", "van Rijn", "van Schaik", "van Veen", "van Vliet", "van Wijk", "van Wijngaarden", "van den Poel", "van de Pol", "van den Ploeg", "van de Ven", "van den Berg", "van den Bosch", "van den Brink", "van den Broek", "van den Heuvel", "van der Heijden", "van der Horst", "van der Hulst", "van der Kroon", "van der Laan", "van der Linden", "van der Meer", "van der Meij", "van der Meulen", "van der Molen", "van der Sluis", "van der Spek", "van der Veen", "van der Velde", "van der Velden", "van der Vliet", "van der Wal"],
          // https://surnames.behindthename.com/top/lists/england-wales/1991
          uk: ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Johnson", "Roberts", "Robinson", "Thompson", "Wright", "Walker", "White", "Edwards", "Hughes", "Green", "Hall", "Lewis", "Harris", "Clarke", "Patel", "Jackson", "Wood", "Turner", "Martin", "Cooper", "Hill", "Ward", "Morris", "Moore", "Clark", "Lee", "King", "Baker", "Harrison", "Morgan", "Allen", "James", "Scott", "Phillips", "Watson", "Davis", "Parker", "Price", "Bennett", "Young", "Griffiths", "Mitchell", "Kelly", "Cook", "Carter", "Richardson", "Bailey", "Collins", "Bell", "Shaw", "Murphy", "Miller", "Cox", "Richards", "Khan", "Marshall", "Anderson", "Simpson", "Ellis", "Adams", "Singh", "Begum", "Wilkinson", "Foster", "Chapman", "Powell", "Webb", "Rogers", "Gray", "Mason", "Ali", "Hunt", "Hussain", "Campbell", "Matthews", "Owen", "Palmer", "Holmes", "Mills", "Barnes", "Knight", "Lloyd", "Butler", "Russell", "Barker", "Fisher", "Stevens", "Jenkins", "Murray", "Dixon", "Harvey", "Graham", "Pearson", "Ahmed", "Fletcher", "Walsh", "Kaur", "Gibson", "Howard", "Andrews", "Stewart", "Elliott", "Reynolds", "Saunders", "Payne", "Fox", "Ford", "Pearce", "Day", "Brooks", "West", "Lawrence", "Cole", "Atkinson", "Bradley", "Spencer", "Gill", "Dawson", "Ball", "Burton", "O'brien", "Watts", "Rose", "Booth", "Perry", "Ryan", "Grant", "Wells", "Armstrong", "Francis", "Rees", "Hayes", "Hart", "Hudson", "Newman", "Barrett", "Webster", "Hunter", "Gregory", "Carr", "Lowe", "Page", "Marsh", "Riley", "Dunn", "Woods", "Parsons", "Berry", "Stone", "Reid", "Holland", "Hawkins", "Harding", "Porter", "Robertson", "Newton", "Oliver", "Reed", "Kennedy", "Williamson", "Bird", "Gardner", "Shah", "Dean", "Lane", "Cooke", "Bates", "Henderson", "Parry", "Burgess", "Bishop", "Walton", "Burns", "Nicholson", "Shepherd", "Ross", "Cross", "Long", "Freeman", "Warren", "Nicholls", "Hamilton", "Byrne", "Sutton", "Mcdonald", "Yates", "Hodgson", "Robson", "Curtis", "Hopkins", "O'connor", "Harper", "Coleman", "Watkins", "Moss", "Mccarthy", "Chambers", "O'neill", "Griffin", "Sharp", "Hardy", "Wheeler", "Potter", "Osborne", "Johnston", "Gordon", "Doyle", "Wallace", "George", "Jordan", "Hutchinson", "Rowe", "Burke", "May", "Pritchard", "Gilbert", "Willis", "Higgins", "Read", "Miles", "Stevenson", "Stephenson", "Hammond", "Arnold", "Buckley", "Walters", "Hewitt", "Barber", "Nelson", "Slater", "Austin", "Sullivan", "Whitehead", "Mann", "Frost", "Lambert", "Stephens", "Blake", "Akhtar", "Lynch", "Goodwin", "Barton", "Woodward", "Thomson", "Cunningham", "Quinn", "Barnett", "Baxter", "Bibi", "Clayton", "Nash", "Greenwood", "Jennings", "Holt", "Kemp", "Poole", "Gallagher", "Bond", "Stokes", "Tucker", "Davidson", "Fowler", "Heath", "Norman", "Middleton", "Lawson", "Banks", "French", "Stanley", "Jarvis", "Gibbs", "Ferguson", "Hayward", "Carroll", "Douglas", "Dickinson", "Todd", "Barlow", "Peters", "Lucas", "Knowles", "Hartley", "Miah", "Simmons", "Morton", "Alexander", "Field", "Morrison", "Norris", "Townsend", "Preston", "Hancock", "Thornton", "Baldwin", "Burrows", "Briggs", "Parkinson", "Reeves", "Macdonald", "Lamb", "Black", "Abbott", "Sanders", "Thorpe", "Holden", "Tomlinson", "Perkins", "Ashton", "Rhodes", "Fuller", "Howe", "Bryant", "Vaughan", "Dale", "Davey", "Weston", "Bartlett", "Whittaker", "Davison", "Kent", "Skinner", "Birch", "Morley", "Daniels", "Glover", "Howell", "Cartwright", "Pugh", "Humphreys", "Goddard", "Brennan", "Wall", "Kirby", "Bowen", "Savage", "Bull", "Wong", "Dobson", "Smart", "Wilkins", "Kirk", "Fraser", "Duffy", "Hicks", "Patterson", "Bradshaw", "Little", "Archer", "Warner", "Waters", "O'sullivan", "Farrell", "Brookes", "Atkins", "Kay", "Dodd", "Bentley", "Flynn", "John", "Schofield", "Short", "Haynes", "Wade", "Butcher", "Henry", "Sanderson", "Crawford", "Sheppard", "Bolton", "Coates", "Giles", "Gould", "Houghton", "Gibbons", "Pratt", "Manning", "Law", "Hooper", "Noble", "Dyer", "Rahman", "Clements", "Moran", "Sykes", "Chan", "Doherty", "Connolly", "Joyce", "Franklin", "Hobbs", "Coles", "Herbert", "Steele", "Kerr", "Leach", "Winter", "Owens", "Duncan", "Naylor", "Fleming", "Horton", "Finch", "Fitzgerald", "Randall", "Carpenter", "Marsden", "Browne", "Garner", "Pickering", "Hale", "Dennis", "Vincent", "Chadwick", "Chandler", "Sharpe", "Nolan", "Lyons", "Hurst", "Collier", "Peacock", "Howarth", "Faulkner", "Rice", "Pollard", "Welch", "Norton", "Gough", "Sinclair", "Blackburn", "Bryan", "Conway", "Power", "Cameron", "Daly", "Allan", "Hanson", "Gardiner", "Boyle", "Myers", "Turnbull", "Wallis", "Mahmood", "Sims", "Swift", "Iqbal", "Pope", "Brady", "Chamberlain", "Rowley", "Tyler", "Farmer", "Metcalfe", "Hilton", "Godfrey", "Holloway", "Parkin", "Bray", "Talbot", "Donnelly", "Nixon", "Charlton", "Benson", "Whitehouse", "Barry", "Hope", "Lord", "North", "Storey", "Connor", "Potts", "Bevan", "Hargreaves", "Mclean", "Mistry", "Bruce", "Howells", "Hyde", "Parkes", "Wyatt", "Fry", "Lees", "O'donnell", "Craig", "Forster", "Mckenzie", "Humphries", "Mellor", "Carey", "Ingram", "Summers", "Leonard"],
          // https://surnames.behindthename.com/top/lists/germany/2017
          de: ["M\xFCller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Sch\xE4fer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schr\xF6der", "Neumann", "Schwarz", "Zimmermann", "Braun", "Kr\xFCger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner", "Schmitz", "Krause", "Meier", "Lehmann", "Schmid", "Schulze", "Maier", "K\xF6hler", "Herrmann", "K\xF6nig", "Walter", "Mayer", "Huber", "Kaiser", "Fuchs", "Peters", "Lang", "Scholz", "M\xF6ller", "Wei\xDF", "Jung", "Hahn", "Schubert", "Vogel", "Friedrich", "Keller", "G\xFCnther", "Frank", "Berger", "Winkler", "Roth", "Beck", "Lorenz", "Baumann", "Franke", "Albrecht", "Schuster", "Simon", "Ludwig", "B\xF6hm", "Winter", "Kraus", "Martin", "Schumacher", "Kr\xE4mer", "Vogt", "Stein", "J\xE4ger", "Otto", "Sommer", "Gro\xDF", "Seidel", "Heinrich", "Brandt", "Haas", "Schreiber", "Graf", "Schulte", "Dietrich", "Ziegler", "Kuhn", "K\xFChn", "Pohl", "Engel", "Horn", "Busch", "Bergmann", "Thomas", "Voigt", "Sauer", "Arnold", "Wolff", "Pfeiffer"],
          // http://www.japantimes.co.jp/life/2009/10/11/lifestyle/japans-top-100-most-common-family-names/
          jp: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Saito", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Yamazaki", "Mori", "Abe", "Ikeda", "Hashimoto", "Yamashita", "Ishikawa", "Nakajima", "Maeda", "Fujita", "Ogawa", "Goto", "Okada", "Hasegawa", "Murakami", "Kondo", "Ishii", "Saito", "Sakamoto", "Endo", "Aoki", "Fujii", "Nishimura", "Fukuda", "Ota", "Miura", "Fujiwara", "Okamoto", "Matsuda", "Nakagawa", "Nakano", "Harada", "Ono", "Tamura", "Takeuchi", "Kaneko", "Wada", "Nakayama", "Ishida", "Ueda", "Morita", "Hara", "Shibata", "Sakai", "Kudo", "Yokoyama", "Miyazaki", "Miyamoto", "Uchida", "Takagi", "Ando", "Taniguchi", "Ohno", "Maruyama", "Imai", "Takada", "Fujimoto", "Takeda", "Murata", "Ueno", "Sugiyama", "Masuda", "Sugawara", "Hirano", "Kojima", "Otsuka", "Chiba", "Kubo", "Matsui", "Iwasaki", "Sakurai", "Kinoshita", "Noguchi", "Matsuo", "Nomura", "Kikuchi", "Sano", "Onishi", "Sugimoto", "Arai"],
          // http://www.lowchensaustralia.com/names/popular-spanish-names.htm
          es: ["Garcia", "Fernandez", "Lopez", "Martinez", "Gonzalez", "Rodriguez", "Sanchez", "Perez", "Martin", "Gomez", "Ruiz", "Diaz", "Hernandez", "Alvarez", "Jimenez", "Moreno", "Munoz", "Alonso", "Romero", "Navarro", "Gutierrez", "Torres", "Dominguez", "Gil", "Vazquez", "Blanco", "Serrano", "Ramos", "Castro", "Suarez", "Sanz", "Rubio", "Ortega", "Molina", "Delgado", "Ortiz", "Morales", "Ramirez", "Marin", "Iglesias", "Santos", "Castillo", "Garrido", "Calvo", "Pena", "Cruz", "Cano", "Nunez", "Prieto", "Diez", "Lozano", "Vidal", "Pascual", "Ferrer", "Medina", "Vega", "Leon", "Herrero", "Vicente", "Mendez", "Guerrero", "Fuentes", "Campos", "Nieto", "Cortes", "Caballero", "Ibanez", "Lorenzo", "Pastor", "Gimenez", "Saez", "Soler", "Marquez", "Carrasco", "Herrera", "Montero", "Arias", "Crespo", "Flores", "Andres", "Aguilar", "Hidalgo", "Cabrera", "Mora", "Duran", "Velasco", "Rey", "Pardo", "Roman", "Vila", "Bravo", "Merino", "Moya", "Soto", "Izquierdo", "Reyes", "Redondo", "Marcos", "Carmona", "Menendez"],
          // Data taken from https://fr.wikipedia.org/wiki/Liste_des_noms_de_famille_les_plus_courants_en_France
          fr: ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lef\xE8vre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard", "Bonnet", "Dupont", "Lambert", "Fontaine", "Rousseau", "Vincent", "M\xFCller", "Lef\xE8vre", "Faure", "Andr\xE9", "Mercier", "Blanc", "Gu\xE9rin", "Boyer", "Garnier", "Chevalier", "Fran\xE7ois", "Legrand", "Gauthier", "Garcia", "Perrin", "Robin", "Cl\xE9ment", "Morin", "Nicolas", "Henry", "Roussel", "Matthieu", "Gautier", "Masson", "Marchand", "Duval", "Denis", "Dumont", "Marie", "Lemaire", "No\xEBl", "Meyer", "Dufour", "Meunier", "Brun", "Blanchard", "Giraud", "Joly", "Rivi\xE8re", "Lucas", "Brunet", "Gaillard", "Barbier", "Arnaud", "Mart\xEDnez", "G\xE9rard", "Roche", "Renard", "Schmitt", "Roy", "Leroux", "Colin", "Vidal", "Caron", "Picard", "Roger", "Fabre", "Aubert", "Lemoine", "Renaud", "Dumas", "Lacroix", "Olivier", "Philippe", "Bourgeois", "Pierre", "Beno\xEEt", "Rey", "Leclerc", "Payet", "Rolland", "Leclercq", "Guillaume", "Lecomte", "L\xF3pez", "Jean", "Dupuy", "Guillot", "Hubert", "Berger", "Carpentier", "S\xE1nchez", "Dupuis", "Moulin", "Louis", "Deschamps", "Huet", "Vasseur", "Perez", "Boucher", "Fleury", "Royer", "Klein", "Jacquet", "Adam", "Paris", "Poirier", "Marty", "Aubry", "Guyot", "Carr\xE9", "Charles", "Renault", "Charpentier", "M\xE9nard", "Maillard", "Baron", "Bertin", "Bailly", "Herv\xE9", "Schneider", "Fern\xE1ndez", "Le GallGall", "Collet", "L\xE9ger", "Bouvier", "Julien", "Pr\xE9vost", "Millet", "Perrot", "Daniel", "Le RouxRoux", "Cousin", "Germain", "Breton", "Besson", "Langlois", "R\xE9mi", "Le GoffGoff", "Pelletier", "L\xE9v\xEAque", "Perrier", "Leblanc", "Barr\xE9", "Lebrun", "Marchal", "Weber", "Mallet", "Hamon", "Boulanger", "Jacob", "Monnier", "Michaud", "Rodr\xEDguez", "Guichard", "Gillet", "\xC9tienne", "Grondin", "Poulain", "Tessier", "Chevallier", "Collin", "Chauvin", "Da SilvaSilva", "Bouchet", "Gay", "Lema\xEEtre", "B\xE9nard", "Mar\xE9chal", "Humbert", "Reynaud", "Antoine", "Hoarau", "Perret", "Barth\xE9lemy", "Cordier", "Pichon", "Lejeune", "Gilbert", "Lamy", "Delaunay", "Pasquier", "Carlier", "LaporteLaporte"]
        },
        // Data taken from http://geoportal.statistics.gov.uk/datasets/ons-postcode-directory-latest-centroids
        postcodeAreas: [{ code: "AB" }, { code: "AL" }, { code: "B" }, { code: "BA" }, { code: "BB" }, { code: "BD" }, { code: "BH" }, { code: "BL" }, { code: "BN" }, { code: "BR" }, { code: "BS" }, { code: "BT" }, { code: "CA" }, { code: "CB" }, { code: "CF" }, { code: "CH" }, { code: "CM" }, { code: "CO" }, { code: "CR" }, { code: "CT" }, { code: "CV" }, { code: "CW" }, { code: "DA" }, { code: "DD" }, { code: "DE" }, { code: "DG" }, { code: "DH" }, { code: "DL" }, { code: "DN" }, { code: "DT" }, { code: "DY" }, { code: "E" }, { code: "EC" }, { code: "EH" }, { code: "EN" }, { code: "EX" }, { code: "FK" }, { code: "FY" }, { code: "G" }, { code: "GL" }, { code: "GU" }, { code: "GY" }, { code: "HA" }, { code: "HD" }, { code: "HG" }, { code: "HP" }, { code: "HR" }, { code: "HS" }, { code: "HU" }, { code: "HX" }, { code: "IG" }, { code: "IM" }, { code: "IP" }, { code: "IV" }, { code: "JE" }, { code: "KA" }, { code: "KT" }, { code: "KW" }, { code: "KY" }, { code: "L" }, { code: "LA" }, { code: "LD" }, { code: "LE" }, { code: "LL" }, { code: "LN" }, { code: "LS" }, { code: "LU" }, { code: "M" }, { code: "ME" }, { code: "MK" }, { code: "ML" }, { code: "N" }, { code: "NE" }, { code: "NG" }, { code: "NN" }, { code: "NP" }, { code: "NR" }, { code: "NW" }, { code: "OL" }, { code: "OX" }, { code: "PA" }, { code: "PE" }, { code: "PH" }, { code: "PL" }, { code: "PO" }, { code: "PR" }, { code: "RG" }, { code: "RH" }, { code: "RM" }, { code: "S" }, { code: "SA" }, { code: "SE" }, { code: "SG" }, { code: "SK" }, { code: "SL" }, { code: "SM" }, { code: "SN" }, { code: "SO" }, { code: "SP" }, { code: "SR" }, { code: "SS" }, { code: "ST" }, { code: "SW" }, { code: "SY" }, { code: "TA" }, { code: "TD" }, { code: "TF" }, { code: "TN" }, { code: "TQ" }, { code: "TR" }, { code: "TS" }, { code: "TW" }, { code: "UB" }, { code: "W" }, { code: "WA" }, { code: "WC" }, { code: "WD" }, { code: "WF" }, { code: "WN" }, { code: "WR" }, { code: "WS" }, { code: "WV" }, { code: "YO" }, { code: "ZE" }],
        // Data taken from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
        countries: [{ name: "Afghanistan", abbreviation: "AF" }, { name: "\xC5land Islands", abbreviation: "AX" }, { name: "Albania", abbreviation: "AL" }, { name: "Algeria", abbreviation: "DZ" }, { name: "American Samoa", abbreviation: "AS" }, { name: "Andorra", abbreviation: "AD" }, { name: "Angola", abbreviation: "AO" }, { name: "Anguilla", abbreviation: "AI" }, { name: "Antarctica", abbreviation: "AQ" }, { name: "Antigua and Barbuda", abbreviation: "AG" }, { name: "Argentina", abbreviation: "AR" }, { name: "Armenia", abbreviation: "AM" }, { name: "Aruba", abbreviation: "AW" }, { name: "Australia", abbreviation: "AU" }, { name: "Austria", abbreviation: "AT" }, { name: "Azerbaijan", abbreviation: "AZ" }, { name: "Bahamas", abbreviation: "BS" }, { name: "Bahrain", abbreviation: "BH" }, { name: "Bangladesh", abbreviation: "BD" }, { name: "Barbados", abbreviation: "BB" }, { name: "Belarus", abbreviation: "BY" }, { name: "Belgium", abbreviation: "BE" }, { name: "Belize", abbreviation: "BZ" }, { name: "Benin", abbreviation: "BJ" }, { name: "Bermuda", abbreviation: "BM" }, { name: "Bhutan", abbreviation: "BT" }, { name: "Plurinational State of Bolivia", abbreviation: "BO" }, { name: "Bonaire, Sint Eustatius and Saba", abbreviation: "BQ" }, { name: "Bosnia and Herzegovina", abbreviation: "BA" }, { name: "Botswana", abbreviation: "BW" }, { name: "Bouvet Island", abbreviation: "BV" }, { name: "Brazil", abbreviation: "BR" }, { name: "British Indian Ocean Territory", abbreviation: "IO" }, { name: "Brunei Darussalam", abbreviation: "BN" }, { name: "Bulgaria", abbreviation: "BG" }, { name: "Burkina Faso", abbreviation: "BF" }, { name: "Burundi", abbreviation: "BI" }, { name: "Cabo Verde", abbreviation: "CV" }, { name: "Cambodia", abbreviation: "KH" }, { name: "Cameroon", abbreviation: "CM" }, { name: "Canada", abbreviation: "CA" }, { name: "Cayman Islands", abbreviation: "KY" }, { name: "Central African Republic", abbreviation: "CF" }, { name: "Chad", abbreviation: "TD" }, { name: "Chile", abbreviation: "CL" }, { name: "China", abbreviation: "CN" }, { name: "Christmas Island", abbreviation: "CX" }, { name: "Cocos (Keeling) Islands", abbreviation: "CC" }, { name: "Colombia", abbreviation: "CO" }, { name: "Comoros", abbreviation: "KM" }, { name: "Congo", abbreviation: "CG" }, { name: "Democratic Republic of the Congo", abbreviation: "CD" }, { name: "Cook Islands", abbreviation: "CK" }, { name: "Costa Rica", abbreviation: "CR" }, { name: "C\xF4te d'Ivoire", abbreviation: "CI" }, { name: "Croatia", abbreviation: "HR" }, { name: "Cuba", abbreviation: "CU" }, { name: "Cura\xE7ao", abbreviation: "CW" }, { name: "Cyprus", abbreviation: "CY" }, { name: "Czechia", abbreviation: "CZ" }, { name: "Denmark", abbreviation: "DK" }, { name: "Djibouti", abbreviation: "DJ" }, { name: "Dominica", abbreviation: "DM" }, { name: "Dominican Republic", abbreviation: "DO" }, { name: "Ecuador", abbreviation: "EC" }, { name: "Egypt", abbreviation: "EG" }, { name: "El Salvador", abbreviation: "SV" }, { name: "Equatorial Guinea", abbreviation: "GQ" }, { name: "Eritrea", abbreviation: "ER" }, { name: "Estonia", abbreviation: "EE" }, { name: "Eswatini", abbreviation: "SZ" }, { name: "Ethiopia", abbreviation: "ET" }, { name: "Falkland Islands (Malvinas)", abbreviation: "FK" }, { name: "Faroe Islands", abbreviation: "FO" }, { name: "Fiji", abbreviation: "FJ" }, { name: "Finland", abbreviation: "FI" }, { name: "France", abbreviation: "FR" }, { name: "French Guiana", abbreviation: "GF" }, { name: "French Polynesia", abbreviation: "PF" }, { name: "French Southern Territories", abbreviation: "TF" }, { name: "Gabon", abbreviation: "GA" }, { name: "Gambia", abbreviation: "GM" }, { name: "Georgia", abbreviation: "GE" }, { name: "Germany", abbreviation: "DE" }, { name: "Ghana", abbreviation: "GH" }, { name: "Gibraltar", abbreviation: "GI" }, { name: "Greece", abbreviation: "GR" }, { name: "Greenland", abbreviation: "GL" }, { name: "Grenada", abbreviation: "GD" }, { name: "Guadeloupe", abbreviation: "GP" }, { name: "Guam", abbreviation: "GU" }, { name: "Guatemala", abbreviation: "GT" }, { name: "Guernsey", abbreviation: "GG" }, { name: "Guinea", abbreviation: "GN" }, { name: "Guinea-Bissau", abbreviation: "GW" }, { name: "Guyana", abbreviation: "GY" }, { name: "Haiti", abbreviation: "HT" }, { name: "Heard Island and McDonald Islands", abbreviation: "HM" }, { name: "Holy See", abbreviation: "VA" }, { name: "Honduras", abbreviation: "HN" }, { name: "Hong Kong", abbreviation: "HK" }, { name: "Hungary", abbreviation: "HU" }, { name: "Iceland", abbreviation: "IS" }, { name: "India", abbreviation: "IN" }, { name: "Indonesia", abbreviation: "ID" }, { name: "Islamic Republic of Iran", abbreviation: "IR" }, { name: "Iraq", abbreviation: "IQ" }, { name: "Ireland", abbreviation: "IE" }, { name: "Isle of Man", abbreviation: "IM" }, { name: "Israel", abbreviation: "IL" }, { name: "Italy", abbreviation: "IT" }, { name: "Jamaica", abbreviation: "JM" }, { name: "Japan", abbreviation: "JP" }, { name: "Jersey", abbreviation: "JE" }, { name: "Jordan", abbreviation: "JO" }, { name: "Kazakhstan", abbreviation: "KZ" }, { name: "Kenya", abbreviation: "KE" }, { name: "Kiribati", abbreviation: "KI" }, { name: "Democratic People's Republic of Korea", abbreviation: "KP" }, { name: "Republic of Korea", abbreviation: "KR" }, { name: "Kuwait", abbreviation: "KW" }, { name: "Kyrgyzstan", abbreviation: "KG" }, { name: "Lao People's Democratic Republic", abbreviation: "LA" }, { name: "Latvia", abbreviation: "LV" }, { name: "Lebanon", abbreviation: "LB" }, { name: "Lesotho", abbreviation: "LS" }, { name: "Liberia", abbreviation: "LR" }, { name: "Libya", abbreviation: "LY" }, { name: "Liechtenstein", abbreviation: "LI" }, { name: "Lithuania", abbreviation: "LT" }, { name: "Luxembourg", abbreviation: "LU" }, { name: "Macao", abbreviation: "MO" }, { name: "Madagascar", abbreviation: "MG" }, { name: "Malawi", abbreviation: "MW" }, { name: "Malaysia", abbreviation: "MY" }, { name: "Maldives", abbreviation: "MV" }, { name: "Mali", abbreviation: "ML" }, { name: "Malta", abbreviation: "MT" }, { name: "Marshall Islands", abbreviation: "MH" }, { name: "Martinique", abbreviation: "MQ" }, { name: "Mauritania", abbreviation: "MR" }, { name: "Mauritius", abbreviation: "MU" }, { name: "Mayotte", abbreviation: "YT" }, { name: "Mexico", abbreviation: "MX" }, { name: "Federated States of Micronesia", abbreviation: "FM" }, { name: "Republic of Moldova", abbreviation: "MD" }, { name: "Monaco", abbreviation: "MC" }, { name: "Mongolia", abbreviation: "MN" }, { name: "Montenegro", abbreviation: "ME" }, { name: "Montserrat", abbreviation: "MS" }, { name: "Morocco", abbreviation: "MA" }, { name: "Mozambique", abbreviation: "MZ" }, { name: "Myanmar", abbreviation: "MM" }, { name: "Namibia", abbreviation: "NA" }, { name: "Nauru", abbreviation: "NR" }, { name: "Nepal", abbreviation: "NP" }, { name: "Kingdom of the Netherlands", abbreviation: "NL" }, { name: "New Caledonia", abbreviation: "NC" }, { name: "New Zealand", abbreviation: "NZ" }, { name: "Nicaragua", abbreviation: "NI" }, { name: "Niger", abbreviation: "NE" }, { name: "Nigeria", abbreviation: "NG" }, { name: "Niue", abbreviation: "NU" }, { name: "Norfolk Island", abbreviation: "NF" }, { name: "North Macedonia", abbreviation: "MK" }, { name: "Northern Mariana Islands", abbreviation: "MP" }, { name: "Norway", abbreviation: "NO" }, { name: "Oman", abbreviation: "OM" }, { name: "Pakistan", abbreviation: "PK" }, { name: "Palau", abbreviation: "PW" }, { name: "State of Palestine", abbreviation: "PS" }, { name: "Panama", abbreviation: "PA" }, { name: "Papua New Guinea", abbreviation: "PG" }, { name: "Paraguay", abbreviation: "PY" }, { name: "Peru", abbreviation: "PE" }, { name: "Philippines", abbreviation: "PH" }, { name: "Pitcairn", abbreviation: "PN" }, { name: "Poland", abbreviation: "PL" }, { name: "Portugal", abbreviation: "PT" }, { name: "Puerto Rico", abbreviation: "PR" }, { name: "Qatar", abbreviation: "QA" }, { name: "R\xE9union", abbreviation: "RE" }, { name: "Romania", abbreviation: "RO" }, { name: "Russian Federation", abbreviation: "RU" }, { name: "Rwanda", abbreviation: "RW" }, { name: "Saint Barth\xE9lemy", abbreviation: "BL" }, { name: "Saint Helena, Ascension and Tristan da Cunha", abbreviation: "SH" }, { name: "Saint Kitts and Nevis", abbreviation: "KN" }, { name: "Saint Lucia", abbreviation: "LC" }, { name: "Saint Martin (French part)", abbreviation: "MF" }, { name: "Saint Pierre and Miquelon", abbreviation: "PM" }, { name: "Saint Vincent and the Grenadines", abbreviation: "VC" }, { name: "Samoa", abbreviation: "WS" }, { name: "San Marino", abbreviation: "SM" }, { name: "Sao Tome and Principe", abbreviation: "ST" }, { name: "Saudi Arabia", abbreviation: "SA" }, { name: "Senegal", abbreviation: "SN" }, { name: "Serbia", abbreviation: "RS" }, { name: "Seychelles", abbreviation: "SC" }, { name: "Sierra Leone", abbreviation: "SL" }, { name: "Singapore", abbreviation: "SG" }, { name: "Sint Maarten (Dutch part)", abbreviation: "SX" }, { name: "Slovakia", abbreviation: "SK" }, { name: "Slovenia", abbreviation: "SI" }, { name: "Solomon Islands", abbreviation: "SB" }, { name: "Somalia", abbreviation: "SO" }, { name: "South Africa", abbreviation: "ZA" }, { name: "South Georgia and the South Sandwich Islands", abbreviation: "GS" }, { name: "South Sudan", abbreviation: "SS" }, { name: "Spain", abbreviation: "ES" }, { name: "Sri Lanka", abbreviation: "LK" }, { name: "Sudan", abbreviation: "SD" }, { name: "Suriname", abbreviation: "SR" }, { name: "Svalbard and Jan Mayen", abbreviation: "SJ" }, { name: "Sweden", abbreviation: "SE" }, { name: "Switzerland", abbreviation: "CH" }, { name: "Syrian Arab Republic", abbreviation: "SY" }, { name: "Taiwan, Province of China", abbreviation: "TW" }, { name: "Tajikistan", abbreviation: "TJ" }, { name: "United Republic of Tanzania", abbreviation: "TZ" }, { name: "Thailand", abbreviation: "TH" }, { name: "Timor-Leste", abbreviation: "TL" }, { name: "Togo", abbreviation: "TG" }, { name: "Tokelau", abbreviation: "TK" }, { name: "Tonga", abbreviation: "TO" }, { name: "Trinidad and Tobago", abbreviation: "TT" }, { name: "Tunisia", abbreviation: "TN" }, { name: "T\xFCrkiye", abbreviation: "TR" }, { name: "Turkmenistan", abbreviation: "TM" }, { name: "Turks and Caicos Islands", abbreviation: "TC" }, { name: "Tuvalu", abbreviation: "TV" }, { name: "Uganda", abbreviation: "UG" }, { name: "Ukraine", abbreviation: "UA" }, { name: "United Arab Emirates", abbreviation: "AE" }, { name: "United Kingdom of Great Britain and Northern Ireland", abbreviation: "GB" }, { name: "United States Minor Outlying Islands", abbreviation: "UM" }, { name: "United States of America", abbreviation: "US" }, { name: "Uruguay", abbreviation: "UY" }, { name: "Uzbekistan", abbreviation: "UZ" }, { name: "Vanuatu", abbreviation: "VU" }, { name: "Bolivarian Republic of Venezuela", abbreviation: "VE" }, { name: "Viet Nam", abbreviation: "VN" }, { name: "Virgin Islands (British)", abbreviation: "VG" }, { name: "Virgin Islands (U.S.)", abbreviation: "VI" }, { name: "Wallis and Futuna", abbreviation: "WF" }, { name: "Western Sahara", abbreviation: "EH" }, { name: "Yemen", abbreviation: "YE" }, { name: "Zambia", abbreviation: "ZM" }, { name: "Zimbabwe", abbreviation: "ZW" }],
        counties: {
          // Data taken from http://www.downloadexcelfiles.com/gb_en/download-excel-file-list-counties-uk
          uk: [
            { name: "Bath and North East Somerset" },
            { name: "Aberdeenshire" },
            { name: "Anglesey" },
            { name: "Angus" },
            { name: "Bedford" },
            { name: "Blackburn with Darwen" },
            { name: "Blackpool" },
            { name: "Bournemouth" },
            { name: "Bracknell Forest" },
            { name: "Brighton & Hove" },
            { name: "Bristol" },
            { name: "Buckinghamshire" },
            { name: "Cambridgeshire" },
            { name: "Carmarthenshire" },
            { name: "Central Bedfordshire" },
            { name: "Ceredigion" },
            { name: "Cheshire East" },
            { name: "Cheshire West and Chester" },
            { name: "Clackmannanshire" },
            { name: "Conwy" },
            { name: "Cornwall" },
            { name: "County Antrim" },
            { name: "County Armagh" },
            { name: "County Down" },
            { name: "County Durham" },
            { name: "County Fermanagh" },
            { name: "County Londonderry" },
            { name: "County Tyrone" },
            { name: "Cumbria" },
            { name: "Darlington" },
            { name: "Denbighshire" },
            { name: "Derby" },
            { name: "Derbyshire" },
            { name: "Devon" },
            { name: "Dorset" },
            { name: "Dumfries and Galloway" },
            { name: "Dundee" },
            { name: "East Lothian" },
            { name: "East Riding of Yorkshire" },
            { name: "East Sussex" },
            { name: "Edinburgh?" },
            { name: "Essex" },
            { name: "Falkirk" },
            { name: "Fife" },
            { name: "Flintshire" },
            { name: "Gloucestershire" },
            { name: "Greater London" },
            { name: "Greater Manchester" },
            { name: "Gwent" },
            { name: "Gwynedd" },
            { name: "Halton" },
            { name: "Hampshire" },
            { name: "Hartlepool" },
            { name: "Herefordshire" },
            { name: "Hertfordshire" },
            { name: "Highlands" },
            { name: "Hull" },
            { name: "Isle of Wight" },
            { name: "Isles of Scilly" },
            { name: "Kent" },
            { name: "Lancashire" },
            { name: "Leicester" },
            { name: "Leicestershire" },
            { name: "Lincolnshire" },
            { name: "Lothian" },
            { name: "Luton" },
            { name: "Medway" },
            { name: "Merseyside" },
            { name: "Mid Glamorgan" },
            { name: "Middlesbrough" },
            { name: "Milton Keynes" },
            { name: "Monmouthshire" },
            { name: "Moray" },
            { name: "Norfolk" },
            { name: "North East Lincolnshire" },
            { name: "North Lincolnshire" },
            { name: "North Somerset" },
            { name: "North Yorkshire" },
            { name: "Northamptonshire" },
            { name: "Northumberland" },
            { name: "Nottingham" },
            { name: "Nottinghamshire" },
            { name: "Oxfordshire" },
            { name: "Pembrokeshire" },
            { name: "Perth and Kinross" },
            { name: "Peterborough" },
            { name: "Plymouth" },
            { name: "Poole" },
            { name: "Portsmouth" },
            { name: "Powys" },
            { name: "Reading" },
            { name: "Redcar and Cleveland" },
            { name: "Rutland" },
            { name: "Scottish Borders" },
            { name: "Shropshire" },
            { name: "Slough" },
            { name: "Somerset" },
            { name: "South Glamorgan" },
            { name: "South Gloucestershire" },
            { name: "South Yorkshire" },
            { name: "Southampton" },
            { name: "Southend-on-Sea" },
            { name: "Staffordshire" },
            { name: "Stirlingshire" },
            { name: "Stockton-on-Tees" },
            { name: "Stoke-on-Trent" },
            { name: "Strathclyde" },
            { name: "Suffolk" },
            { name: "Surrey" },
            { name: "Swindon" },
            { name: "Telford and Wrekin" },
            { name: "Thurrock" },
            { name: "Torbay" },
            { name: "Tyne and Wear" },
            { name: "Warrington" },
            { name: "Warwickshire" },
            { name: "West Berkshire" },
            { name: "West Glamorgan" },
            { name: "West Lothian" },
            { name: "West Midlands" },
            { name: "West Sussex" },
            { name: "West Yorkshire" },
            { name: "Western Isles" },
            { name: "Wiltshire" },
            { name: "Windsor and Maidenhead" },
            { name: "Wokingham" },
            { name: "Worcestershire" },
            { name: "Wrexham" },
            { name: "York" }
          ]
        },
        provinces: {
          ca: [
            { name: "Alberta", abbreviation: "AB" },
            { name: "British Columbia", abbreviation: "BC" },
            { name: "Manitoba", abbreviation: "MB" },
            { name: "New Brunswick", abbreviation: "NB" },
            { name: "Newfoundland and Labrador", abbreviation: "NL" },
            { name: "Nova Scotia", abbreviation: "NS" },
            { name: "Ontario", abbreviation: "ON" },
            { name: "Prince Edward Island", abbreviation: "PE" },
            { name: "Quebec", abbreviation: "QC" },
            { name: "Saskatchewan", abbreviation: "SK" },
            // The case could be made that the following are not actually provinces
            // since they are technically considered "territories" however they all
            // look the same on an envelope!
            { name: "Northwest Territories", abbreviation: "NT" },
            { name: "Nunavut", abbreviation: "NU" },
            { name: "Yukon", abbreviation: "YT" }
          ],
          it: [
            { name: "Agrigento", abbreviation: "AG", code: 84 },
            { name: "Alessandria", abbreviation: "AL", code: 6 },
            { name: "Ancona", abbreviation: "AN", code: 42 },
            { name: "Aosta", abbreviation: "AO", code: 7 },
            { name: "L'Aquila", abbreviation: "AQ", code: 66 },
            { name: "Arezzo", abbreviation: "AR", code: 51 },
            { name: "Ascoli-Piceno", abbreviation: "AP", code: 44 },
            { name: "Asti", abbreviation: "AT", code: 5 },
            { name: "Avellino", abbreviation: "AV", code: 64 },
            { name: "Bari", abbreviation: "BA", code: 72 },
            { name: "Barletta-Andria-Trani", abbreviation: "BT", code: 72 },
            { name: "Belluno", abbreviation: "BL", code: 25 },
            { name: "Benevento", abbreviation: "BN", code: 62 },
            { name: "Bergamo", abbreviation: "BG", code: 16 },
            { name: "Biella", abbreviation: "BI", code: 96 },
            { name: "Bologna", abbreviation: "BO", code: 37 },
            { name: "Bolzano", abbreviation: "BZ", code: 21 },
            { name: "Brescia", abbreviation: "BS", code: 17 },
            { name: "Brindisi", abbreviation: "BR", code: 74 },
            { name: "Cagliari", abbreviation: "CA", code: 92 },
            { name: "Caltanissetta", abbreviation: "CL", code: 85 },
            { name: "Campobasso", abbreviation: "CB", code: 70 },
            { name: "Carbonia Iglesias", abbreviation: "CI", code: 70 },
            { name: "Caserta", abbreviation: "CE", code: 61 },
            { name: "Catania", abbreviation: "CT", code: 87 },
            { name: "Catanzaro", abbreviation: "CZ", code: 79 },
            { name: "Chieti", abbreviation: "CH", code: 69 },
            { name: "Como", abbreviation: "CO", code: 13 },
            { name: "Cosenza", abbreviation: "CS", code: 78 },
            { name: "Cremona", abbreviation: "CR", code: 19 },
            { name: "Crotone", abbreviation: "KR", code: 101 },
            { name: "Cuneo", abbreviation: "CN", code: 4 },
            { name: "Enna", abbreviation: "EN", code: 86 },
            { name: "Fermo", abbreviation: "FM", code: 86 },
            { name: "Ferrara", abbreviation: "FE", code: 38 },
            { name: "Firenze", abbreviation: "FI", code: 48 },
            { name: "Foggia", abbreviation: "FG", code: 71 },
            { name: "Forli-Cesena", abbreviation: "FC", code: 71 },
            { name: "Frosinone", abbreviation: "FR", code: 60 },
            { name: "Genova", abbreviation: "GE", code: 10 },
            { name: "Gorizia", abbreviation: "GO", code: 31 },
            { name: "Grosseto", abbreviation: "GR", code: 53 },
            { name: "Imperia", abbreviation: "IM", code: 8 },
            { name: "Isernia", abbreviation: "IS", code: 94 },
            { name: "La-Spezia", abbreviation: "SP", code: 66 },
            { name: "Latina", abbreviation: "LT", code: 59 },
            { name: "Lecce", abbreviation: "LE", code: 75 },
            { name: "Lecco", abbreviation: "LC", code: 97 },
            { name: "Livorno", abbreviation: "LI", code: 49 },
            { name: "Lodi", abbreviation: "LO", code: 98 },
            { name: "Lucca", abbreviation: "LU", code: 46 },
            { name: "Macerata", abbreviation: "MC", code: 43 },
            { name: "Mantova", abbreviation: "MN", code: 20 },
            { name: "Massa-Carrara", abbreviation: "MS", code: 45 },
            { name: "Matera", abbreviation: "MT", code: 77 },
            { name: "Medio Campidano", abbreviation: "VS", code: 77 },
            { name: "Messina", abbreviation: "ME", code: 83 },
            { name: "Milano", abbreviation: "MI", code: 15 },
            { name: "Modena", abbreviation: "MO", code: 36 },
            { name: "Monza-Brianza", abbreviation: "MB", code: 36 },
            { name: "Napoli", abbreviation: "NA", code: 63 },
            { name: "Novara", abbreviation: "NO", code: 3 },
            { name: "Nuoro", abbreviation: "NU", code: 91 },
            { name: "Ogliastra", abbreviation: "OG", code: 91 },
            { name: "Olbia Tempio", abbreviation: "OT", code: 91 },
            { name: "Oristano", abbreviation: "OR", code: 95 },
            { name: "Padova", abbreviation: "PD", code: 28 },
            { name: "Palermo", abbreviation: "PA", code: 82 },
            { name: "Parma", abbreviation: "PR", code: 34 },
            { name: "Pavia", abbreviation: "PV", code: 18 },
            { name: "Perugia", abbreviation: "PG", code: 54 },
            { name: "Pesaro-Urbino", abbreviation: "PU", code: 41 },
            { name: "Pescara", abbreviation: "PE", code: 68 },
            { name: "Piacenza", abbreviation: "PC", code: 33 },
            { name: "Pisa", abbreviation: "PI", code: 50 },
            { name: "Pistoia", abbreviation: "PT", code: 47 },
            { name: "Pordenone", abbreviation: "PN", code: 93 },
            { name: "Potenza", abbreviation: "PZ", code: 76 },
            { name: "Prato", abbreviation: "PO", code: 100 },
            { name: "Ragusa", abbreviation: "RG", code: 88 },
            { name: "Ravenna", abbreviation: "RA", code: 39 },
            { name: "Reggio-Calabria", abbreviation: "RC", code: 35 },
            { name: "Reggio-Emilia", abbreviation: "RE", code: 35 },
            { name: "Rieti", abbreviation: "RI", code: 57 },
            { name: "Rimini", abbreviation: "RN", code: 99 },
            { name: "Roma", abbreviation: "Roma", code: 58 },
            { name: "Rovigo", abbreviation: "RO", code: 29 },
            { name: "Salerno", abbreviation: "SA", code: 65 },
            { name: "Sassari", abbreviation: "SS", code: 90 },
            { name: "Savona", abbreviation: "SV", code: 9 },
            { name: "Siena", abbreviation: "SI", code: 52 },
            { name: "Siracusa", abbreviation: "SR", code: 89 },
            { name: "Sondrio", abbreviation: "SO", code: 14 },
            { name: "Taranto", abbreviation: "TA", code: 73 },
            { name: "Teramo", abbreviation: "TE", code: 67 },
            { name: "Terni", abbreviation: "TR", code: 55 },
            { name: "Torino", abbreviation: "TO", code: 1 },
            { name: "Trapani", abbreviation: "TP", code: 81 },
            { name: "Trento", abbreviation: "TN", code: 22 },
            { name: "Treviso", abbreviation: "TV", code: 26 },
            { name: "Trieste", abbreviation: "TS", code: 32 },
            { name: "Udine", abbreviation: "UD", code: 30 },
            { name: "Varese", abbreviation: "VA", code: 12 },
            { name: "Venezia", abbreviation: "VE", code: 27 },
            { name: "Verbania", abbreviation: "VB", code: 27 },
            { name: "Vercelli", abbreviation: "VC", code: 2 },
            { name: "Verona", abbreviation: "VR", code: 23 },
            { name: "Vibo-Valentia", abbreviation: "VV", code: 102 },
            { name: "Vicenza", abbreviation: "VI", code: 24 },
            { name: "Viterbo", abbreviation: "VT", code: 56 }
          ]
        },
        // from: https://github.com/samsargent/Useful-Autocomplete-Data/blob/master/data/nationalities.json
        nationalities: [
          { name: "Afghan" },
          { name: "Albanian" },
          { name: "Algerian" },
          { name: "American" },
          { name: "Andorran" },
          { name: "Angolan" },
          { name: "Antiguans" },
          { name: "Argentinean" },
          { name: "Armenian" },
          { name: "Australian" },
          { name: "Austrian" },
          { name: "Azerbaijani" },
          { name: "Bahami" },
          { name: "Bahraini" },
          { name: "Bangladeshi" },
          { name: "Barbadian" },
          { name: "Barbudans" },
          { name: "Batswana" },
          { name: "Belarusian" },
          { name: "Belgian" },
          { name: "Belizean" },
          { name: "Beninese" },
          { name: "Bhutanese" },
          { name: "Bolivian" },
          { name: "Bosnian" },
          { name: "Brazilian" },
          { name: "British" },
          { name: "Bruneian" },
          { name: "Bulgarian" },
          { name: "Burkinabe" },
          { name: "Burmese" },
          { name: "Burundian" },
          { name: "Cambodian" },
          { name: "Cameroonian" },
          { name: "Canadian" },
          { name: "Cape Verdean" },
          { name: "Central African" },
          { name: "Chadian" },
          { name: "Chilean" },
          { name: "Chinese" },
          { name: "Colombian" },
          { name: "Comoran" },
          { name: "Congolese" },
          { name: "Costa Rican" },
          { name: "Croatian" },
          { name: "Cuban" },
          { name: "Cypriot" },
          { name: "Czech" },
          { name: "Danish" },
          { name: "Djibouti" },
          { name: "Dominican" },
          { name: "Dutch" },
          { name: "East Timorese" },
          { name: "Ecuadorean" },
          { name: "Egyptian" },
          { name: "Emirian" },
          { name: "Equatorial Guinean" },
          { name: "Eritrean" },
          { name: "Estonian" },
          { name: "Ethiopian" },
          { name: "Fijian" },
          { name: "Filipino" },
          { name: "Finnish" },
          { name: "French" },
          { name: "Gabonese" },
          { name: "Gambian" },
          { name: "Georgian" },
          { name: "German" },
          { name: "Ghanaian" },
          { name: "Greek" },
          { name: "Grenadian" },
          { name: "Guatemalan" },
          { name: "Guinea-Bissauan" },
          { name: "Guinean" },
          { name: "Guyanese" },
          { name: "Haitian" },
          { name: "Herzegovinian" },
          { name: "Honduran" },
          { name: "Hungarian" },
          { name: "I-Kiribati" },
          { name: "Icelander" },
          { name: "Indian" },
          { name: "Indonesian" },
          { name: "Iranian" },
          { name: "Iraqi" },
          { name: "Irish" },
          { name: "Israeli" },
          { name: "Italian" },
          { name: "Ivorian" },
          { name: "Jamaican" },
          { name: "Japanese" },
          { name: "Jordanian" },
          { name: "Kazakhstani" },
          { name: "Kenyan" },
          { name: "Kittian and Nevisian" },
          { name: "Kuwaiti" },
          { name: "Kyrgyz" },
          { name: "Laotian" },
          { name: "Latvian" },
          { name: "Lebanese" },
          { name: "Liberian" },
          { name: "Libyan" },
          { name: "Liechtensteiner" },
          { name: "Lithuanian" },
          { name: "Luxembourger" },
          { name: "Macedonian" },
          { name: "Malagasy" },
          { name: "Malawian" },
          { name: "Malaysian" },
          { name: "Maldivan" },
          { name: "Malian" },
          { name: "Maltese" },
          { name: "Marshallese" },
          { name: "Mauritanian" },
          { name: "Mauritian" },
          { name: "Mexican" },
          { name: "Micronesian" },
          { name: "Moldovan" },
          { name: "Monacan" },
          { name: "Mongolian" },
          { name: "Moroccan" },
          { name: "Mosotho" },
          { name: "Motswana" },
          { name: "Mozambican" },
          { name: "Namibian" },
          { name: "Nauruan" },
          { name: "Nepalese" },
          { name: "New Zealander" },
          { name: "Nicaraguan" },
          { name: "Nigerian" },
          { name: "Nigerien" },
          { name: "North Korean" },
          { name: "Northern Irish" },
          { name: "Norwegian" },
          { name: "Omani" },
          { name: "Pakistani" },
          { name: "Palauan" },
          { name: "Panamanian" },
          { name: "Papua New Guinean" },
          { name: "Paraguayan" },
          { name: "Peruvian" },
          { name: "Polish" },
          { name: "Portuguese" },
          { name: "Qatari" },
          { name: "Romani" },
          { name: "Russian" },
          { name: "Rwandan" },
          { name: "Saint Lucian" },
          { name: "Salvadoran" },
          { name: "Samoan" },
          { name: "San Marinese" },
          { name: "Sao Tomean" },
          { name: "Saudi" },
          { name: "Scottish" },
          { name: "Senegalese" },
          { name: "Serbian" },
          { name: "Seychellois" },
          { name: "Sierra Leonean" },
          { name: "Singaporean" },
          { name: "Slovakian" },
          { name: "Slovenian" },
          { name: "Solomon Islander" },
          { name: "Somali" },
          { name: "South African" },
          { name: "South Korean" },
          { name: "Spanish" },
          { name: "Sri Lankan" },
          { name: "Sudanese" },
          { name: "Surinamer" },
          { name: "Swazi" },
          { name: "Swedish" },
          { name: "Swiss" },
          { name: "Syrian" },
          { name: "Taiwanese" },
          { name: "Tajik" },
          { name: "Tanzanian" },
          { name: "Thai" },
          { name: "Togolese" },
          { name: "Tongan" },
          { name: "Trinidadian or Tobagonian" },
          { name: "Tunisian" },
          { name: "Turkish" },
          { name: "Tuvaluan" },
          { name: "Ugandan" },
          { name: "Ukrainian" },
          { name: "Uruguaya" },
          { name: "Uzbekistani" },
          { name: "Venezuela" },
          { name: "Vietnamese" },
          { name: "Wels" },
          { name: "Yemenit" },
          { name: "Zambia" },
          { name: "Zimbabwe" }
        ],
        // http://www.loc.gov/standards/iso639-2/php/code_list.php (ISO-639-1 codes)
        locale_languages: [
          "aa",
          "ab",
          "ae",
          "af",
          "ak",
          "am",
          "an",
          "ar",
          "as",
          "av",
          "ay",
          "az",
          "ba",
          "be",
          "bg",
          "bh",
          "bi",
          "bm",
          "bn",
          "bo",
          "br",
          "bs",
          "ca",
          "ce",
          "ch",
          "co",
          "cr",
          "cs",
          "cu",
          "cv",
          "cy",
          "da",
          "de",
          "dv",
          "dz",
          "ee",
          "el",
          "en",
          "eo",
          "es",
          "et",
          "eu",
          "fa",
          "ff",
          "fi",
          "fj",
          "fo",
          "fr",
          "fy",
          "ga",
          "gd",
          "gl",
          "gn",
          "gu",
          "gv",
          "ha",
          "he",
          "hi",
          "ho",
          "hr",
          "ht",
          "hu",
          "hy",
          "hz",
          "ia",
          "id",
          "ie",
          "ig",
          "ii",
          "ik",
          "io",
          "is",
          "it",
          "iu",
          "ja",
          "jv",
          "ka",
          "kg",
          "ki",
          "kj",
          "kk",
          "kl",
          "km",
          "kn",
          "ko",
          "kr",
          "ks",
          "ku",
          "kv",
          "kw",
          "ky",
          "la",
          "lb",
          "lg",
          "li",
          "ln",
          "lo",
          "lt",
          "lu",
          "lv",
          "mg",
          "mh",
          "mi",
          "mk",
          "ml",
          "mn",
          "mr",
          "ms",
          "mt",
          "my",
          "na",
          "nb",
          "nd",
          "ne",
          "ng",
          "nl",
          "nn",
          "no",
          "nr",
          "nv",
          "ny",
          "oc",
          "oj",
          "om",
          "or",
          "os",
          "pa",
          "pi",
          "pl",
          "ps",
          "pt",
          "qu",
          "rm",
          "rn",
          "ro",
          "ru",
          "rw",
          "sa",
          "sc",
          "sd",
          "se",
          "sg",
          "si",
          "sk",
          "sl",
          "sm",
          "sn",
          "so",
          "sq",
          "sr",
          "ss",
          "st",
          "su",
          "sv",
          "sw",
          "ta",
          "te",
          "tg",
          "th",
          "ti",
          "tk",
          "tl",
          "tn",
          "to",
          "tr",
          "ts",
          "tt",
          "tw",
          "ty",
          "ug",
          "uk",
          "ur",
          "uz",
          "ve",
          "vi",
          "vo",
          "wa",
          "wo",
          "xh",
          "yi",
          "yo",
          "za",
          "zh",
          "zu"
        ],
        // From http://data.okfn.org/data/core/language-codes#resource-language-codes-full (IETF language tags)
        locale_regions: [
          "agq-CM",
          "asa-TZ",
          "ast-ES",
          "bas-CM",
          "bem-ZM",
          "bez-TZ",
          "brx-IN",
          "cgg-UG",
          "chr-US",
          "dav-KE",
          "dje-NE",
          "dsb-DE",
          "dua-CM",
          "dyo-SN",
          "ebu-KE",
          "ewo-CM",
          "fil-PH",
          "fur-IT",
          "gsw-CH",
          "gsw-FR",
          "gsw-LI",
          "guz-KE",
          "haw-US",
          "hsb-DE",
          "jgo-CM",
          "jmc-TZ",
          "kab-DZ",
          "kam-KE",
          "kde-TZ",
          "kea-CV",
          "khq-ML",
          "kkj-CM",
          "kln-KE",
          "kok-IN",
          "ksb-TZ",
          "ksf-CM",
          "ksh-DE",
          "lag-TZ",
          "lkt-US",
          "luo-KE",
          "luy-KE",
          "mas-KE",
          "mas-TZ",
          "mer-KE",
          "mfe-MU",
          "mgh-MZ",
          "mgo-CM",
          "mua-CM",
          "naq-NA",
          "nmg-CM",
          "nnh-CM",
          "nus-SD",
          "nyn-UG",
          "rof-TZ",
          "rwk-TZ",
          "sah-RU",
          "saq-KE",
          "sbp-TZ",
          "seh-MZ",
          "ses-ML",
          "shi-Latn",
          "shi-Latn-MA",
          "shi-Tfng",
          "shi-Tfng-MA",
          "smn-FI",
          "teo-KE",
          "teo-UG",
          "twq-NE",
          "tzm-Latn",
          "tzm-Latn-MA",
          "vai-Latn",
          "vai-Latn-LR",
          "vai-Vaii",
          "vai-Vaii-LR",
          "vun-TZ",
          "wae-CH",
          "xog-UG",
          "yav-CM",
          "zgh-MA",
          "af-NA",
          "af-ZA",
          "ak-GH",
          "am-ET",
          "ar-001",
          "ar-AE",
          "ar-BH",
          "ar-DJ",
          "ar-DZ",
          "ar-EG",
          "ar-EH",
          "ar-ER",
          "ar-IL",
          "ar-IQ",
          "ar-JO",
          "ar-KM",
          "ar-KW",
          "ar-LB",
          "ar-LY",
          "ar-MA",
          "ar-MR",
          "ar-OM",
          "ar-PS",
          "ar-QA",
          "ar-SA",
          "ar-SD",
          "ar-SO",
          "ar-SS",
          "ar-SY",
          "ar-TD",
          "ar-TN",
          "ar-YE",
          "as-IN",
          "az-Cyrl",
          "az-Cyrl-AZ",
          "az-Latn",
          "az-Latn-AZ",
          "be-BY",
          "bg-BG",
          "bm-Latn",
          "bm-Latn-ML",
          "bn-BD",
          "bn-IN",
          "bo-CN",
          "bo-IN",
          "br-FR",
          "bs-Cyrl",
          "bs-Cyrl-BA",
          "bs-Latn",
          "bs-Latn-BA",
          "ca-AD",
          "ca-ES",
          "ca-ES-VALENCIA",
          "ca-FR",
          "ca-IT",
          "cs-CZ",
          "cy-GB",
          "da-DK",
          "da-GL",
          "de-AT",
          "de-BE",
          "de-CH",
          "de-DE",
          "de-LI",
          "de-LU",
          "dz-BT",
          "ee-GH",
          "ee-TG",
          "el-CY",
          "el-GR",
          "en-001",
          "en-150",
          "en-AG",
          "en-AI",
          "en-AS",
          "en-AU",
          "en-BB",
          "en-BE",
          "en-BM",
          "en-BS",
          "en-BW",
          "en-BZ",
          "en-CA",
          "en-CC",
          "en-CK",
          "en-CM",
          "en-CX",
          "en-DG",
          "en-DM",
          "en-ER",
          "en-FJ",
          "en-FK",
          "en-FM",
          "en-GB",
          "en-GD",
          "en-GG",
          "en-GH",
          "en-GI",
          "en-GM",
          "en-GU",
          "en-GY",
          "en-HK",
          "en-IE",
          "en-IM",
          "en-IN",
          "en-IO",
          "en-JE",
          "en-JM",
          "en-KE",
          "en-KI",
          "en-KN",
          "en-KY",
          "en-LC",
          "en-LR",
          "en-LS",
          "en-MG",
          "en-MH",
          "en-MO",
          "en-MP",
          "en-MS",
          "en-MT",
          "en-MU",
          "en-MW",
          "en-MY",
          "en-NA",
          "en-NF",
          "en-NG",
          "en-NR",
          "en-NU",
          "en-NZ",
          "en-PG",
          "en-PH",
          "en-PK",
          "en-PN",
          "en-PR",
          "en-PW",
          "en-RW",
          "en-SB",
          "en-SC",
          "en-SD",
          "en-SG",
          "en-SH",
          "en-SL",
          "en-SS",
          "en-SX",
          "en-SZ",
          "en-TC",
          "en-TK",
          "en-TO",
          "en-TT",
          "en-TV",
          "en-TZ",
          "en-UG",
          "en-UM",
          "en-US",
          "en-US-POSIX",
          "en-VC",
          "en-VG",
          "en-VI",
          "en-VU",
          "en-WS",
          "en-ZA",
          "en-ZM",
          "en-ZW",
          "eo-001",
          "es-419",
          "es-AR",
          "es-BO",
          "es-CL",
          "es-CO",
          "es-CR",
          "es-CU",
          "es-DO",
          "es-EA",
          "es-EC",
          "es-ES",
          "es-GQ",
          "es-GT",
          "es-HN",
          "es-IC",
          "es-MX",
          "es-NI",
          "es-PA",
          "es-PE",
          "es-PH",
          "es-PR",
          "es-PY",
          "es-SV",
          "es-US",
          "es-UY",
          "es-VE",
          "et-EE",
          "eu-ES",
          "fa-AF",
          "fa-IR",
          "ff-CM",
          "ff-GN",
          "ff-MR",
          "ff-SN",
          "fi-FI",
          "fo-FO",
          "fr-BE",
          "fr-BF",
          "fr-BI",
          "fr-BJ",
          "fr-BL",
          "fr-CA",
          "fr-CD",
          "fr-CF",
          "fr-CG",
          "fr-CH",
          "fr-CI",
          "fr-CM",
          "fr-DJ",
          "fr-DZ",
          "fr-FR",
          "fr-GA",
          "fr-GF",
          "fr-GN",
          "fr-GP",
          "fr-GQ",
          "fr-HT",
          "fr-KM",
          "fr-LU",
          "fr-MA",
          "fr-MC",
          "fr-MF",
          "fr-MG",
          "fr-ML",
          "fr-MQ",
          "fr-MR",
          "fr-MU",
          "fr-NC",
          "fr-NE",
          "fr-PF",
          "fr-PM",
          "fr-RE",
          "fr-RW",
          "fr-SC",
          "fr-SN",
          "fr-SY",
          "fr-TD",
          "fr-TG",
          "fr-TN",
          "fr-VU",
          "fr-WF",
          "fr-YT",
          "fy-NL",
          "ga-IE",
          "gd-GB",
          "gl-ES",
          "gu-IN",
          "gv-IM",
          "ha-Latn",
          "ha-Latn-GH",
          "ha-Latn-NE",
          "ha-Latn-NG",
          "he-IL",
          "hi-IN",
          "hr-BA",
          "hr-HR",
          "hu-HU",
          "hy-AM",
          "id-ID",
          "ig-NG",
          "ii-CN",
          "is-IS",
          "it-CH",
          "it-IT",
          "it-SM",
          "ja-JP",
          "ka-GE",
          "ki-KE",
          "kk-Cyrl",
          "kk-Cyrl-KZ",
          "kl-GL",
          "km-KH",
          "kn-IN",
          "ko-KP",
          "ko-KR",
          "ks-Arab",
          "ks-Arab-IN",
          "kw-GB",
          "ky-Cyrl",
          "ky-Cyrl-KG",
          "lb-LU",
          "lg-UG",
          "ln-AO",
          "ln-CD",
          "ln-CF",
          "ln-CG",
          "lo-LA",
          "lt-LT",
          "lu-CD",
          "lv-LV",
          "mg-MG",
          "mk-MK",
          "ml-IN",
          "mn-Cyrl",
          "mn-Cyrl-MN",
          "mr-IN",
          "ms-Latn",
          "ms-Latn-BN",
          "ms-Latn-MY",
          "ms-Latn-SG",
          "mt-MT",
          "my-MM",
          "nb-NO",
          "nb-SJ",
          "nd-ZW",
          "ne-IN",
          "ne-NP",
          "nl-AW",
          "nl-BE",
          "nl-BQ",
          "nl-CW",
          "nl-NL",
          "nl-SR",
          "nl-SX",
          "nn-NO",
          "om-ET",
          "om-KE",
          "or-IN",
          "os-GE",
          "os-RU",
          "pa-Arab",
          "pa-Arab-PK",
          "pa-Guru",
          "pa-Guru-IN",
          "pl-PL",
          "ps-AF",
          "pt-AO",
          "pt-BR",
          "pt-CV",
          "pt-GW",
          "pt-MO",
          "pt-MZ",
          "pt-PT",
          "pt-ST",
          "pt-TL",
          "qu-BO",
          "qu-EC",
          "qu-PE",
          "rm-CH",
          "rn-BI",
          "ro-MD",
          "ro-RO",
          "ru-BY",
          "ru-KG",
          "ru-KZ",
          "ru-MD",
          "ru-RU",
          "ru-UA",
          "rw-RW",
          "se-FI",
          "se-NO",
          "se-SE",
          "sg-CF",
          "si-LK",
          "sk-SK",
          "sl-SI",
          "sn-ZW",
          "so-DJ",
          "so-ET",
          "so-KE",
          "so-SO",
          "sq-AL",
          "sq-MK",
          "sq-XK",
          "sr-Cyrl",
          "sr-Cyrl-BA",
          "sr-Cyrl-ME",
          "sr-Cyrl-RS",
          "sr-Cyrl-XK",
          "sr-Latn",
          "sr-Latn-BA",
          "sr-Latn-ME",
          "sr-Latn-RS",
          "sr-Latn-XK",
          "sv-AX",
          "sv-FI",
          "sv-SE",
          "sw-CD",
          "sw-KE",
          "sw-TZ",
          "sw-UG",
          "ta-IN",
          "ta-LK",
          "ta-MY",
          "ta-SG",
          "te-IN",
          "th-TH",
          "ti-ER",
          "ti-ET",
          "to-TO",
          "tr-CY",
          "tr-TR",
          "ug-Arab",
          "ug-Arab-CN",
          "uk-UA",
          "ur-IN",
          "ur-PK",
          "uz-Arab",
          "uz-Arab-AF",
          "uz-Cyrl",
          "uz-Cyrl-UZ",
          "uz-Latn",
          "uz-Latn-UZ",
          "vi-VN",
          "yi-001",
          "yo-BJ",
          "yo-NG",
          "zh-Hans",
          "zh-Hans-CN",
          "zh-Hans-HK",
          "zh-Hans-MO",
          "zh-Hans-SG",
          "zh-Hant",
          "zh-Hant-HK",
          "zh-Hant-MO",
          "zh-Hant-TW",
          "zu-ZA"
        ],
        us_states_and_dc: [
          { name: "Alabama", abbreviation: "AL" },
          { name: "Alaska", abbreviation: "AK" },
          { name: "Arizona", abbreviation: "AZ" },
          { name: "Arkansas", abbreviation: "AR" },
          { name: "California", abbreviation: "CA" },
          { name: "Colorado", abbreviation: "CO" },
          { name: "Connecticut", abbreviation: "CT" },
          { name: "Delaware", abbreviation: "DE" },
          { name: "District of Columbia", abbreviation: "DC" },
          { name: "Florida", abbreviation: "FL" },
          { name: "Georgia", abbreviation: "GA" },
          { name: "Hawaii", abbreviation: "HI" },
          { name: "Idaho", abbreviation: "ID" },
          { name: "Illinois", abbreviation: "IL" },
          { name: "Indiana", abbreviation: "IN" },
          { name: "Iowa", abbreviation: "IA" },
          { name: "Kansas", abbreviation: "KS" },
          { name: "Kentucky", abbreviation: "KY" },
          { name: "Louisiana", abbreviation: "LA" },
          { name: "Maine", abbreviation: "ME" },
          { name: "Maryland", abbreviation: "MD" },
          { name: "Massachusetts", abbreviation: "MA" },
          { name: "Michigan", abbreviation: "MI" },
          { name: "Minnesota", abbreviation: "MN" },
          { name: "Mississippi", abbreviation: "MS" },
          { name: "Missouri", abbreviation: "MO" },
          { name: "Montana", abbreviation: "MT" },
          { name: "Nebraska", abbreviation: "NE" },
          { name: "Nevada", abbreviation: "NV" },
          { name: "New Hampshire", abbreviation: "NH" },
          { name: "New Jersey", abbreviation: "NJ" },
          { name: "New Mexico", abbreviation: "NM" },
          { name: "New York", abbreviation: "NY" },
          { name: "North Carolina", abbreviation: "NC" },
          { name: "North Dakota", abbreviation: "ND" },
          { name: "Ohio", abbreviation: "OH" },
          { name: "Oklahoma", abbreviation: "OK" },
          { name: "Oregon", abbreviation: "OR" },
          { name: "Pennsylvania", abbreviation: "PA" },
          { name: "Rhode Island", abbreviation: "RI" },
          { name: "South Carolina", abbreviation: "SC" },
          { name: "South Dakota", abbreviation: "SD" },
          { name: "Tennessee", abbreviation: "TN" },
          { name: "Texas", abbreviation: "TX" },
          { name: "Utah", abbreviation: "UT" },
          { name: "Vermont", abbreviation: "VT" },
          { name: "Virginia", abbreviation: "VA" },
          { name: "Washington", abbreviation: "WA" },
          { name: "West Virginia", abbreviation: "WV" },
          { name: "Wisconsin", abbreviation: "WI" },
          { name: "Wyoming", abbreviation: "WY" }
        ],
        territories: [
          { name: "American Samoa", abbreviation: "AS" },
          { name: "Federated States of Micronesia", abbreviation: "FM" },
          { name: "Guam", abbreviation: "GU" },
          { name: "Marshall Islands", abbreviation: "MH" },
          { name: "Northern Mariana Islands", abbreviation: "MP" },
          { name: "Puerto Rico", abbreviation: "PR" },
          { name: "Virgin Islands, U.S.", abbreviation: "VI" }
        ],
        armed_forces: [
          { name: "Armed Forces Europe", abbreviation: "AE" },
          { name: "Armed Forces Pacific", abbreviation: "AP" },
          { name: "Armed Forces the Americas", abbreviation: "AA" }
        ],
        country_regions: {
          it: [
            { name: "Valle d'Aosta", abbreviation: "VDA" },
            { name: "Piemonte", abbreviation: "PIE" },
            { name: "Lombardia", abbreviation: "LOM" },
            { name: "Veneto", abbreviation: "VEN" },
            { name: "Trentino Alto Adige", abbreviation: "TAA" },
            { name: "Friuli Venezia Giulia", abbreviation: "FVG" },
            { name: "Liguria", abbreviation: "LIG" },
            { name: "Emilia Romagna", abbreviation: "EMR" },
            { name: "Toscana", abbreviation: "TOS" },
            { name: "Umbria", abbreviation: "UMB" },
            { name: "Marche", abbreviation: "MAR" },
            { name: "Abruzzo", abbreviation: "ABR" },
            { name: "Lazio", abbreviation: "LAZ" },
            { name: "Campania", abbreviation: "CAM" },
            { name: "Puglia", abbreviation: "PUG" },
            { name: "Basilicata", abbreviation: "BAS" },
            { name: "Molise", abbreviation: "MOL" },
            { name: "Calabria", abbreviation: "CAL" },
            { name: "Sicilia", abbreviation: "SIC" },
            { name: "Sardegna", abbreviation: "SAR" }
          ],
          mx: [
            { name: "Aguascalientes", abbreviation: "AGU" },
            { name: "Baja California", abbreviation: "BCN" },
            { name: "Baja California Sur", abbreviation: "BCS" },
            { name: "Campeche", abbreviation: "CAM" },
            { name: "Chiapas", abbreviation: "CHP" },
            { name: "Chihuahua", abbreviation: "CHH" },
            { name: "Ciudad de M\xE9xico", abbreviation: "DIF" },
            { name: "Coahuila", abbreviation: "COA" },
            { name: "Colima", abbreviation: "COL" },
            { name: "Durango", abbreviation: "DUR" },
            { name: "Guanajuato", abbreviation: "GUA" },
            { name: "Guerrero", abbreviation: "GRO" },
            { name: "Hidalgo", abbreviation: "HID" },
            { name: "Jalisco", abbreviation: "JAL" },
            { name: "M\xE9xico", abbreviation: "MEX" },
            { name: "Michoac\xE1n", abbreviation: "MIC" },
            { name: "Morelos", abbreviation: "MOR" },
            { name: "Nayarit", abbreviation: "NAY" },
            { name: "Nuevo Le\xF3n", abbreviation: "NLE" },
            { name: "Oaxaca", abbreviation: "OAX" },
            { name: "Puebla", abbreviation: "PUE" },
            { name: "Quer\xE9taro", abbreviation: "QUE" },
            { name: "Quintana Roo", abbreviation: "ROO" },
            { name: "San Luis Potos\xED", abbreviation: "SLP" },
            { name: "Sinaloa", abbreviation: "SIN" },
            { name: "Sonora", abbreviation: "SON" },
            { name: "Tabasco", abbreviation: "TAB" },
            { name: "Tamaulipas", abbreviation: "TAM" },
            { name: "Tlaxcala", abbreviation: "TLA" },
            { name: "Veracruz", abbreviation: "VER" },
            { name: "Yucat\xE1n", abbreviation: "YUC" },
            { name: "Zacatecas", abbreviation: "ZAC" }
          ]
        },
        street_suffixes: {
          us: [
            { name: "Avenue", abbreviation: "Ave" },
            { name: "Boulevard", abbreviation: "Blvd" },
            { name: "Center", abbreviation: "Ctr" },
            { name: "Circle", abbreviation: "Cir" },
            { name: "Court", abbreviation: "Ct" },
            { name: "Drive", abbreviation: "Dr" },
            { name: "Extension", abbreviation: "Ext" },
            { name: "Glen", abbreviation: "Gln" },
            { name: "Grove", abbreviation: "Grv" },
            { name: "Heights", abbreviation: "Hts" },
            { name: "Highway", abbreviation: "Hwy" },
            { name: "Junction", abbreviation: "Jct" },
            { name: "Key", abbreviation: "Key" },
            { name: "Lane", abbreviation: "Ln" },
            { name: "Loop", abbreviation: "Loop" },
            { name: "Manor", abbreviation: "Mnr" },
            { name: "Mill", abbreviation: "Mill" },
            { name: "Park", abbreviation: "Park" },
            { name: "Parkway", abbreviation: "Pkwy" },
            { name: "Pass", abbreviation: "Pass" },
            { name: "Path", abbreviation: "Path" },
            { name: "Pike", abbreviation: "Pike" },
            { name: "Place", abbreviation: "Pl" },
            { name: "Plaza", abbreviation: "Plz" },
            { name: "Point", abbreviation: "Pt" },
            { name: "Ridge", abbreviation: "Rdg" },
            { name: "River", abbreviation: "Riv" },
            { name: "Road", abbreviation: "Rd" },
            { name: "Square", abbreviation: "Sq" },
            { name: "Street", abbreviation: "St" },
            { name: "Terrace", abbreviation: "Ter" },
            { name: "Trail", abbreviation: "Trl" },
            { name: "Turnpike", abbreviation: "Tpke" },
            { name: "View", abbreviation: "Vw" },
            { name: "Way", abbreviation: "Way" }
          ],
          it: [
            { name: "Accesso", abbreviation: "Acc." },
            { name: "Alzaia", abbreviation: "Alz." },
            { name: "Arco", abbreviation: "Arco" },
            { name: "Archivolto", abbreviation: "Acv." },
            { name: "Arena", abbreviation: "Arena" },
            { name: "Argine", abbreviation: "Argine" },
            { name: "Bacino", abbreviation: "Bacino" },
            { name: "Banchi", abbreviation: "Banchi" },
            { name: "Banchina", abbreviation: "Ban." },
            { name: "Bastioni", abbreviation: "Bas." },
            { name: "Belvedere", abbreviation: "Belv." },
            { name: "Borgata", abbreviation: "B.ta" },
            { name: "Borgo", abbreviation: "B.go" },
            { name: "Calata", abbreviation: "Cal." },
            { name: "Calle", abbreviation: "Calle" },
            { name: "Campiello", abbreviation: "Cam." },
            { name: "Campo", abbreviation: "Cam." },
            { name: "Canale", abbreviation: "Can." },
            { name: "Carraia", abbreviation: "Carr." },
            { name: "Cascina", abbreviation: "Cascina" },
            { name: "Case sparse", abbreviation: "c.s." },
            { name: "Cavalcavia", abbreviation: "Cv." },
            { name: "Circonvallazione", abbreviation: "Cv." },
            { name: "Complanare", abbreviation: "C.re" },
            { name: "Contrada", abbreviation: "C.da" },
            { name: "Corso", abbreviation: "C.so" },
            { name: "Corte", abbreviation: "C.te" },
            { name: "Cortile", abbreviation: "C.le" },
            { name: "Diramazione", abbreviation: "Dir." },
            { name: "Fondaco", abbreviation: "F.co" },
            { name: "Fondamenta", abbreviation: "F.ta" },
            { name: "Fondo", abbreviation: "F.do" },
            { name: "Frazione", abbreviation: "Fr." },
            { name: "Isola", abbreviation: "Is." },
            { name: "Largo", abbreviation: "L.go" },
            { name: "Litoranea", abbreviation: "Lit." },
            { name: "Lungolago", abbreviation: "L.go lago" },
            { name: "Lungo Po", abbreviation: "l.go Po" },
            { name: "Molo", abbreviation: "Molo" },
            { name: "Mura", abbreviation: "Mura" },
            { name: "Passaggio privato", abbreviation: "pass. priv." },
            { name: "Passeggiata", abbreviation: "Pass." },
            { name: "Piazza", abbreviation: "P.zza" },
            { name: "Piazzale", abbreviation: "P.le" },
            { name: "Ponte", abbreviation: "P.te" },
            { name: "Portico", abbreviation: "P.co" },
            { name: "Rampa", abbreviation: "Rampa" },
            { name: "Regione", abbreviation: "Reg." },
            { name: "Rione", abbreviation: "R.ne" },
            { name: "Rio", abbreviation: "Rio" },
            { name: "Ripa", abbreviation: "Ripa" },
            { name: "Riva", abbreviation: "Riva" },
            { name: "Rond\xF2", abbreviation: "Rond\xF2" },
            { name: "Rotonda", abbreviation: "Rot." },
            { name: "Sagrato", abbreviation: "Sagr." },
            { name: "Salita", abbreviation: "Sal." },
            { name: "Scalinata", abbreviation: "Scal." },
            { name: "Scalone", abbreviation: "Scal." },
            { name: "Slargo", abbreviation: "Sl." },
            { name: "Sottoportico", abbreviation: "Sott." },
            { name: "Strada", abbreviation: "Str." },
            { name: "Stradale", abbreviation: "Str.le" },
            { name: "Strettoia", abbreviation: "Strett." },
            { name: "Traversa", abbreviation: "Trav." },
            { name: "Via", abbreviation: "V." },
            { name: "Viale", abbreviation: "V.le" },
            { name: "Vicinale", abbreviation: "Vic.le" },
            { name: "Vicolo", abbreviation: "Vic." }
          ],
          uk: [
            { name: "Avenue", abbreviation: "Ave" },
            { name: "Close", abbreviation: "Cl" },
            { name: "Court", abbreviation: "Ct" },
            { name: "Crescent", abbreviation: "Cr" },
            { name: "Drive", abbreviation: "Dr" },
            { name: "Garden", abbreviation: "Gdn" },
            { name: "Gardens", abbreviation: "Gdns" },
            { name: "Green", abbreviation: "Gn" },
            { name: "Grove", abbreviation: "Gr" },
            { name: "Lane", abbreviation: "Ln" },
            { name: "Mount", abbreviation: "Mt" },
            { name: "Place", abbreviation: "Pl" },
            { name: "Park", abbreviation: "Pk" },
            { name: "Ridge", abbreviation: "Rdg" },
            { name: "Road", abbreviation: "Rd" },
            { name: "Square", abbreviation: "Sq" },
            { name: "Street", abbreviation: "St" },
            { name: "Terrace", abbreviation: "Ter" },
            { name: "Valley", abbreviation: "Val" }
          ]
        },
        months: [
          { name: "January", short_name: "Jan", numeric: "01", days: 31 },
          // Not messing with leap years...
          { name: "February", short_name: "Feb", numeric: "02", days: 28 },
          { name: "March", short_name: "Mar", numeric: "03", days: 31 },
          { name: "April", short_name: "Apr", numeric: "04", days: 30 },
          { name: "May", short_name: "May", numeric: "05", days: 31 },
          { name: "June", short_name: "Jun", numeric: "06", days: 30 },
          { name: "July", short_name: "Jul", numeric: "07", days: 31 },
          { name: "August", short_name: "Aug", numeric: "08", days: 31 },
          { name: "September", short_name: "Sep", numeric: "09", days: 30 },
          { name: "October", short_name: "Oct", numeric: "10", days: 31 },
          { name: "November", short_name: "Nov", numeric: "11", days: 30 },
          { name: "December", short_name: "Dec", numeric: "12", days: 31 }
        ],
        // http://en.wikipedia.org/wiki/Bank_card_number#Issuer_identification_number_.28IIN.29
        cc_types: [
          { name: "American Express", short_name: "amex", prefix: "34", length: 15 },
          { name: "Bankcard", short_name: "bankcard", prefix: "5610", length: 16 },
          { name: "China UnionPay", short_name: "chinaunion", prefix: "62", length: 16 },
          { name: "Diners Club Carte Blanche", short_name: "dccarte", prefix: "300", length: 14 },
          { name: "Diners Club enRoute", short_name: "dcenroute", prefix: "2014", length: 15 },
          { name: "Diners Club International", short_name: "dcintl", prefix: "36", length: 14 },
          { name: "Diners Club United States & Canada", short_name: "dcusc", prefix: "54", length: 16 },
          { name: "Discover Card", short_name: "discover", prefix: "6011", length: 16 },
          { name: "InstaPayment", short_name: "instapay", prefix: "637", length: 16 },
          { name: "JCB", short_name: "jcb", prefix: "3528", length: 16 },
          { name: "Laser", short_name: "laser", prefix: "6304", length: 16 },
          { name: "Maestro", short_name: "maestro", prefix: "5018", length: 16 },
          { name: "Mastercard", short_name: "mc", prefix: "51", length: 16 },
          { name: "Solo", short_name: "solo", prefix: "6334", length: 16 },
          { name: "Switch", short_name: "switch", prefix: "4903", length: 16 },
          { name: "Visa", short_name: "visa", prefix: "4", length: 16 },
          { name: "Visa Electron", short_name: "electron", prefix: "4026", length: 16 }
        ],
        //return all world currency by ISO 4217
        currency_types: [
          { code: "AED", name: "United Arab Emirates Dirham" },
          { code: "AFN", name: "Afghanistan Afghani" },
          { code: "ALL", name: "Albania Lek" },
          { code: "AMD", name: "Armenia Dram" },
          { code: "ANG", name: "Netherlands Antilles Guilder" },
          { code: "AOA", name: "Angola Kwanza" },
          { code: "ARS", name: "Argentina Peso" },
          { code: "AUD", name: "Australia Dollar" },
          { code: "AWG", name: "Aruba Guilder" },
          { code: "AZN", name: "Azerbaijan New Manat" },
          { code: "BAM", name: "Bosnia and Herzegovina Convertible Marka" },
          { code: "BBD", name: "Barbados Dollar" },
          { code: "BDT", name: "Bangladesh Taka" },
          { code: "BGN", name: "Bulgaria Lev" },
          { code: "BHD", name: "Bahrain Dinar" },
          { code: "BIF", name: "Burundi Franc" },
          { code: "BMD", name: "Bermuda Dollar" },
          { code: "BND", name: "Brunei Darussalam Dollar" },
          { code: "BOB", name: "Bolivia Boliviano" },
          { code: "BRL", name: "Brazil Real" },
          { code: "BSD", name: "Bahamas Dollar" },
          { code: "BTN", name: "Bhutan Ngultrum" },
          { code: "BWP", name: "Botswana Pula" },
          { code: "BYR", name: "Belarus Ruble" },
          { code: "BZD", name: "Belize Dollar" },
          { code: "CAD", name: "Canada Dollar" },
          { code: "CDF", name: "Congo/Kinshasa Franc" },
          { code: "CHF", name: "Switzerland Franc" },
          { code: "CLP", name: "Chile Peso" },
          { code: "CNY", name: "China Yuan Renminbi" },
          { code: "COP", name: "Colombia Peso" },
          { code: "CRC", name: "Costa Rica Colon" },
          { code: "CUC", name: "Cuba Convertible Peso" },
          { code: "CUP", name: "Cuba Peso" },
          { code: "CVE", name: "Cape Verde Escudo" },
          { code: "CZK", name: "Czech Republic Koruna" },
          { code: "DJF", name: "Djibouti Franc" },
          { code: "DKK", name: "Denmark Krone" },
          { code: "DOP", name: "Dominican Republic Peso" },
          { code: "DZD", name: "Algeria Dinar" },
          { code: "EGP", name: "Egypt Pound" },
          { code: "ERN", name: "Eritrea Nakfa" },
          { code: "ETB", name: "Ethiopia Birr" },
          { code: "EUR", name: "Euro Member Countries" },
          { code: "FJD", name: "Fiji Dollar" },
          { code: "FKP", name: "Falkland Islands (Malvinas) Pound" },
          { code: "GBP", name: "United Kingdom Pound" },
          { code: "GEL", name: "Georgia Lari" },
          { code: "GGP", name: "Guernsey Pound" },
          { code: "GHS", name: "Ghana Cedi" },
          { code: "GIP", name: "Gibraltar Pound" },
          { code: "GMD", name: "Gambia Dalasi" },
          { code: "GNF", name: "Guinea Franc" },
          { code: "GTQ", name: "Guatemala Quetzal" },
          { code: "GYD", name: "Guyana Dollar" },
          { code: "HKD", name: "Hong Kong Dollar" },
          { code: "HNL", name: "Honduras Lempira" },
          { code: "HRK", name: "Croatia Kuna" },
          { code: "HTG", name: "Haiti Gourde" },
          { code: "HUF", name: "Hungary Forint" },
          { code: "IDR", name: "Indonesia Rupiah" },
          { code: "ILS", name: "Israel Shekel" },
          { code: "IMP", name: "Isle of Man Pound" },
          { code: "INR", name: "India Rupee" },
          { code: "IQD", name: "Iraq Dinar" },
          { code: "IRR", name: "Iran Rial" },
          { code: "ISK", name: "Iceland Krona" },
          { code: "JEP", name: "Jersey Pound" },
          { code: "JMD", name: "Jamaica Dollar" },
          { code: "JOD", name: "Jordan Dinar" },
          { code: "JPY", name: "Japan Yen" },
          { code: "KES", name: "Kenya Shilling" },
          { code: "KGS", name: "Kyrgyzstan Som" },
          { code: "KHR", name: "Cambodia Riel" },
          { code: "KMF", name: "Comoros Franc" },
          { code: "KPW", name: "Korea (North) Won" },
          { code: "KRW", name: "Korea (South) Won" },
          { code: "KWD", name: "Kuwait Dinar" },
          { code: "KYD", name: "Cayman Islands Dollar" },
          { code: "KZT", name: "Kazakhstan Tenge" },
          { code: "LAK", name: "Laos Kip" },
          { code: "LBP", name: "Lebanon Pound" },
          { code: "LKR", name: "Sri Lanka Rupee" },
          { code: "LRD", name: "Liberia Dollar" },
          { code: "LSL", name: "Lesotho Loti" },
          { code: "LTL", name: "Lithuania Litas" },
          { code: "LYD", name: "Libya Dinar" },
          { code: "MAD", name: "Morocco Dirham" },
          { code: "MDL", name: "Moldova Leu" },
          { code: "MGA", name: "Madagascar Ariary" },
          { code: "MKD", name: "Macedonia Denar" },
          { code: "MMK", name: "Myanmar (Burma) Kyat" },
          { code: "MNT", name: "Mongolia Tughrik" },
          { code: "MOP", name: "Macau Pataca" },
          { code: "MRO", name: "Mauritania Ouguiya" },
          { code: "MUR", name: "Mauritius Rupee" },
          { code: "MVR", name: "Maldives (Maldive Islands) Rufiyaa" },
          { code: "MWK", name: "Malawi Kwacha" },
          { code: "MXN", name: "Mexico Peso" },
          { code: "MYR", name: "Malaysia Ringgit" },
          { code: "MZN", name: "Mozambique Metical" },
          { code: "NAD", name: "Namibia Dollar" },
          { code: "NGN", name: "Nigeria Naira" },
          { code: "NIO", name: "Nicaragua Cordoba" },
          { code: "NOK", name: "Norway Krone" },
          { code: "NPR", name: "Nepal Rupee" },
          { code: "NZD", name: "New Zealand Dollar" },
          { code: "OMR", name: "Oman Rial" },
          { code: "PAB", name: "Panama Balboa" },
          { code: "PEN", name: "Peru Nuevo Sol" },
          { code: "PGK", name: "Papua New Guinea Kina" },
          { code: "PHP", name: "Philippines Peso" },
          { code: "PKR", name: "Pakistan Rupee" },
          { code: "PLN", name: "Poland Zloty" },
          { code: "PYG", name: "Paraguay Guarani" },
          { code: "QAR", name: "Qatar Riyal" },
          { code: "RON", name: "Romania New Leu" },
          { code: "RSD", name: "Serbia Dinar" },
          { code: "RUB", name: "Russia Ruble" },
          { code: "RWF", name: "Rwanda Franc" },
          { code: "SAR", name: "Saudi Arabia Riyal" },
          { code: "SBD", name: "Solomon Islands Dollar" },
          { code: "SCR", name: "Seychelles Rupee" },
          { code: "SDG", name: "Sudan Pound" },
          { code: "SEK", name: "Sweden Krona" },
          { code: "SGD", name: "Singapore Dollar" },
          { code: "SHP", name: "Saint Helena Pound" },
          { code: "SLL", name: "Sierra Leone Leone" },
          { code: "SOS", name: "Somalia Shilling" },
          { code: "SPL", name: "Seborga Luigino" },
          { code: "SRD", name: "Suriname Dollar" },
          { code: "STD", name: "S\xE3o Tom\xE9 and Pr\xEDncipe Dobra" },
          { code: "SVC", name: "El Salvador Colon" },
          { code: "SYP", name: "Syria Pound" },
          { code: "SZL", name: "Swaziland Lilangeni" },
          { code: "THB", name: "Thailand Baht" },
          { code: "TJS", name: "Tajikistan Somoni" },
          { code: "TMT", name: "Turkmenistan Manat" },
          { code: "TND", name: "Tunisia Dinar" },
          { code: "TOP", name: "Tonga Pa'anga" },
          { code: "TRY", name: "Turkey Lira" },
          { code: "TTD", name: "Trinidad and Tobago Dollar" },
          { code: "TVD", name: "Tuvalu Dollar" },
          { code: "TWD", name: "Taiwan New Dollar" },
          { code: "TZS", name: "Tanzania Shilling" },
          { code: "UAH", name: "Ukraine Hryvnia" },
          { code: "UGX", name: "Uganda Shilling" },
          { code: "USD", name: "United States Dollar" },
          { code: "UYU", name: "Uruguay Peso" },
          { code: "UZS", name: "Uzbekistan Som" },
          { code: "VEF", name: "Venezuela Bolivar" },
          { code: "VND", name: "Viet Nam Dong" },
          { code: "VUV", name: "Vanuatu Vatu" },
          { code: "WST", name: "Samoa Tala" },
          { code: "XAF", name: "Communaut\xE9 Financi\xE8re Africaine (BEAC) CFA Franc BEAC" },
          { code: "XCD", name: "East Caribbean Dollar" },
          { code: "XDR", name: "International Monetary Fund (IMF) Special Drawing Rights" },
          { code: "XOF", name: "Communaut\xE9 Financi\xE8re Africaine (BCEAO) Franc" },
          { code: "XPF", name: "Comptoirs Fran\xE7ais du Pacifique (CFP) Franc" },
          { code: "YER", name: "Yemen Rial" },
          { code: "ZAR", name: "South Africa Rand" },
          { code: "ZMW", name: "Zambia Kwacha" },
          { code: "ZWD", name: "Zimbabwe Dollar" }
        ],
        // return the names of all valide colors
        colorNames: [
          "AliceBlue",
          "Black",
          "Navy",
          "DarkBlue",
          "MediumBlue",
          "Blue",
          "DarkGreen",
          "Green",
          "Teal",
          "DarkCyan",
          "DeepSkyBlue",
          "DarkTurquoise",
          "MediumSpringGreen",
          "Lime",
          "SpringGreen",
          "Aqua",
          "Cyan",
          "MidnightBlue",
          "DodgerBlue",
          "LightSeaGreen",
          "ForestGreen",
          "SeaGreen",
          "DarkSlateGray",
          "LimeGreen",
          "MediumSeaGreen",
          "Turquoise",
          "RoyalBlue",
          "SteelBlue",
          "DarkSlateBlue",
          "MediumTurquoise",
          "Indigo",
          "DarkOliveGreen",
          "CadetBlue",
          "CornflowerBlue",
          "RebeccaPurple",
          "MediumAquaMarine",
          "DimGray",
          "SlateBlue",
          "OliveDrab",
          "SlateGray",
          "LightSlateGray",
          "MediumSlateBlue",
          "LawnGreen",
          "Chartreuse",
          "Aquamarine",
          "Maroon",
          "Purple",
          "Olive",
          "Gray",
          "SkyBlue",
          "LightSkyBlue",
          "BlueViolet",
          "DarkRed",
          "DarkMagenta",
          "SaddleBrown",
          "Ivory",
          "White",
          "DarkSeaGreen",
          "LightGreen",
          "MediumPurple",
          "DarkViolet",
          "PaleGreen",
          "DarkOrchid",
          "YellowGreen",
          "Sienna",
          "Brown",
          "DarkGray",
          "LightBlue",
          "GreenYellow",
          "PaleTurquoise",
          "LightSteelBlue",
          "PowderBlue",
          "FireBrick",
          "DarkGoldenRod",
          "MediumOrchid",
          "RosyBrown",
          "DarkKhaki",
          "Silver",
          "MediumVioletRed",
          "IndianRed",
          "Peru",
          "Chocolate",
          "Tan",
          "LightGray",
          "Thistle",
          "Orchid",
          "GoldenRod",
          "PaleVioletRed",
          "Crimson",
          "Gainsboro",
          "Plum",
          "BurlyWood",
          "LightCyan",
          "Lavender",
          "DarkSalmon",
          "Violet",
          "PaleGoldenRod",
          "LightCoral",
          "Khaki",
          "AliceBlue",
          "HoneyDew",
          "Azure",
          "SandyBrown",
          "Wheat",
          "Beige",
          "WhiteSmoke",
          "MintCream",
          "GhostWhite",
          "Salmon",
          "AntiqueWhite",
          "Linen",
          "LightGoldenRodYellow",
          "OldLace",
          "Red",
          "Fuchsia",
          "Magenta",
          "DeepPink",
          "OrangeRed",
          "Tomato",
          "HotPink",
          "Coral",
          "DarkOrange",
          "LightSalmon",
          "Orange",
          "LightPink",
          "Pink",
          "Gold",
          "PeachPuff",
          "NavajoWhite",
          "Moccasin",
          "Bisque",
          "MistyRose",
          "BlanchedAlmond",
          "PapayaWhip",
          "LavenderBlush",
          "SeaShell",
          "Cornsilk",
          "LemonChiffon",
          "FloralWhite",
          "Snow",
          "Yellow",
          "LightYellow"
        ],
        // Data taken from https://www.sec.gov/rules/other/4-460list.htm
        company: [
          "3Com Corp",
          "3M Company",
          "A.G. Edwards Inc.",
          "Abbott Laboratories",
          "Abercrombie & Fitch Co.",
          "ABM Industries Incorporated",
          "Ace Hardware Corporation",
          "ACT Manufacturing Inc.",
          "Acterna Corp.",
          "Adams Resources & Energy, Inc.",
          "ADC Telecommunications, Inc.",
          "Adelphia Communications Corporation",
          "Administaff, Inc.",
          "Adobe Systems Incorporated",
          "Adolph Coors Company",
          "Advance Auto Parts, Inc.",
          "Advanced Micro Devices, Inc.",
          "AdvancePCS, Inc.",
          "Advantica Restaurant Group, Inc.",
          "The AES Corporation",
          "Aetna Inc.",
          "Affiliated Computer Services, Inc.",
          "AFLAC Incorporated",
          "AGCO Corporation",
          "Agilent Technologies, Inc.",
          "Agway Inc.",
          "Apartment Investment and Management Company",
          "Air Products and Chemicals, Inc.",
          "Airborne, Inc.",
          "Airgas, Inc.",
          "AK Steel Holding Corporation",
          "Alaska Air Group, Inc.",
          "Alberto-Culver Company",
          "Albertson's, Inc.",
          "Alcoa Inc.",
          "Alleghany Corporation",
          "Allegheny Energy, Inc.",
          "Allegheny Technologies Incorporated",
          "Allergan, Inc.",
          "ALLETE, Inc.",
          "Alliant Energy Corporation",
          "Allied Waste Industries, Inc.",
          "Allmerica Financial Corporation",
          "The Allstate Corporation",
          "ALLTEL Corporation",
          "The Alpine Group, Inc.",
          "Amazon.com, Inc.",
          "AMC Entertainment Inc.",
          "American Power Conversion Corporation",
          "Amerada Hess Corporation",
          "AMERCO",
          "Ameren Corporation",
          "America West Holdings Corporation",
          "American Axle & Manufacturing Holdings, Inc.",
          "American Eagle Outfitters, Inc.",
          "American Electric Power Company, Inc.",
          "American Express Company",
          "American Financial Group, Inc.",
          "American Greetings Corporation",
          "American International Group, Inc.",
          "American Standard Companies Inc.",
          "American Water Works Company, Inc.",
          "AmerisourceBergen Corporation",
          "Ames Department Stores, Inc.",
          "Amgen Inc.",
          "Amkor Technology, Inc.",
          "AMR Corporation",
          "AmSouth Bancorp.",
          "Amtran, Inc.",
          "Anadarko Petroleum Corporation",
          "Analog Devices, Inc.",
          "Anheuser-Busch Companies, Inc.",
          "Anixter International Inc.",
          "AnnTaylor Inc.",
          "Anthem, Inc.",
          "AOL Time Warner Inc.",
          "Aon Corporation",
          "Apache Corporation",
          "Apple Computer, Inc.",
          "Applera Corporation",
          "Applied Industrial Technologies, Inc.",
          "Applied Materials, Inc.",
          "Aquila, Inc.",
          "ARAMARK Corporation",
          "Arch Coal, Inc.",
          "Archer Daniels Midland Company",
          "Arkansas Best Corporation",
          "Armstrong Holdings, Inc.",
          "Arrow Electronics, Inc.",
          "ArvinMeritor, Inc.",
          "Ashland Inc.",
          "Astoria Financial Corporation",
          "AT&T Corp.",
          "Atmel Corporation",
          "Atmos Energy Corporation",
          "Audiovox Corporation",
          "Autoliv, Inc.",
          "Automatic Data Processing, Inc.",
          "AutoNation, Inc.",
          "AutoZone, Inc.",
          "Avaya Inc.",
          "Avery Dennison Corporation",
          "Avista Corporation",
          "Avnet, Inc.",
          "Avon Products, Inc.",
          "Baker Hughes Incorporated",
          "Ball Corporation",
          "Bank of America Corporation",
          "The Bank of New York Company, Inc.",
          "Bank One Corporation",
          "Banknorth Group, Inc.",
          "Banta Corporation",
          "Barnes & Noble, Inc.",
          "Bausch & Lomb Incorporated",
          "Baxter International Inc.",
          "BB&T Corporation",
          "The Bear Stearns Companies Inc.",
          "Beazer Homes USA, Inc.",
          "Beckman Coulter, Inc.",
          "Becton, Dickinson and Company",
          "Bed Bath & Beyond Inc.",
          "Belk, Inc.",
          "Bell Microproducts Inc.",
          "BellSouth Corporation",
          "Belo Corp.",
          "Bemis Company, Inc.",
          "Benchmark Electronics, Inc.",
          "Berkshire Hathaway Inc.",
          "Best Buy Co., Inc.",
          "Bethlehem Steel Corporation",
          "Beverly Enterprises, Inc.",
          "Big Lots, Inc.",
          "BJ Services Company",
          "BJ's Wholesale Club, Inc.",
          "The Black & Decker Corporation",
          "Black Hills Corporation",
          "BMC Software, Inc.",
          "The Boeing Company",
          "Boise Cascade Corporation",
          "Borders Group, Inc.",
          "BorgWarner Inc.",
          "Boston Scientific Corporation",
          "Bowater Incorporated",
          "Briggs & Stratton Corporation",
          "Brightpoint, Inc.",
          "Brinker International, Inc.",
          "Bristol-Myers Squibb Company",
          "Broadwing, Inc.",
          "Brown Shoe Company, Inc.",
          "Brown-Forman Corporation",
          "Brunswick Corporation",
          "Budget Group, Inc.",
          "Burlington Coat Factory Warehouse Corporation",
          "Burlington Industries, Inc.",
          "Burlington Northern Santa Fe Corporation",
          "Burlington Resources Inc.",
          "C. H. Robinson Worldwide Inc.",
          "Cablevision Systems Corp",
          "Cabot Corp",
          "Cadence Design Systems, Inc.",
          "Calpine Corp.",
          "Campbell Soup Co.",
          "Capital One Financial Corp.",
          "Cardinal Health Inc.",
          "Caremark Rx Inc.",
          "Carlisle Cos. Inc.",
          "Carpenter Technology Corp.",
          "Casey's General Stores Inc.",
          "Caterpillar Inc.",
          "CBRL Group Inc.",
          "CDI Corp.",
          "CDW Computer Centers Inc.",
          "CellStar Corp.",
          "Cendant Corp",
          "Cenex Harvest States Cooperatives",
          "Centex Corp.",
          "CenturyTel Inc.",
          "Ceridian Corp.",
          "CH2M Hill Cos. Ltd.",
          "Champion Enterprises Inc.",
          "Charles Schwab Corp.",
          "Charming Shoppes Inc.",
          "Charter Communications Inc.",
          "Charter One Financial Inc.",
          "ChevronTexaco Corp.",
          "Chiquita Brands International Inc.",
          "Chubb Corp",
          "Ciena Corp.",
          "Cigna Corp",
          "Cincinnati Financial Corp.",
          "Cinergy Corp.",
          "Cintas Corp.",
          "Circuit City Stores Inc.",
          "Cisco Systems Inc.",
          "Citigroup, Inc",
          "Citizens Communications Co.",
          "CKE Restaurants Inc.",
          "Clear Channel Communications Inc.",
          "The Clorox Co.",
          "CMGI Inc.",
          "CMS Energy Corp.",
          "CNF Inc.",
          "Coca-Cola Co.",
          "Coca-Cola Enterprises Inc.",
          "Colgate-Palmolive Co.",
          "Collins & Aikman Corp.",
          "Comcast Corp.",
          "Comdisco Inc.",
          "Comerica Inc.",
          "Comfort Systems USA Inc.",
          "Commercial Metals Co.",
          "Community Health Systems Inc.",
          "Compass Bancshares Inc",
          "Computer Associates International Inc.",
          "Computer Sciences Corp.",
          "Compuware Corp.",
          "Comverse Technology Inc.",
          "ConAgra Foods Inc.",
          "Concord EFS Inc.",
          "Conectiv, Inc",
          "Conoco Inc",
          "Conseco Inc.",
          "Consolidated Freightways Corp.",
          "Consolidated Edison Inc.",
          "Constellation Brands Inc.",
          "Constellation Emergy Group Inc.",
          "Continental Airlines Inc.",
          "Convergys Corp.",
          "Cooper Cameron Corp.",
          "Cooper Industries Ltd.",
          "Cooper Tire & Rubber Co.",
          "Corn Products International Inc.",
          "Corning Inc.",
          "Costco Wholesale Corp.",
          "Countrywide Credit Industries Inc.",
          "Coventry Health Care Inc.",
          "Cox Communications Inc.",
          "Crane Co.",
          "Crompton Corp.",
          "Crown Cork & Seal Co. Inc.",
          "CSK Auto Corp.",
          "CSX Corp.",
          "Cummins Inc.",
          "CVS Corp.",
          "Cytec Industries Inc.",
          "D&K Healthcare Resources, Inc.",
          "D.R. Horton Inc.",
          "Dana Corporation",
          "Danaher Corporation",
          "Darden Restaurants Inc.",
          "DaVita Inc.",
          "Dean Foods Company",
          "Deere & Company",
          "Del Monte Foods Co",
          "Dell Computer Corporation",
          "Delphi Corp.",
          "Delta Air Lines Inc.",
          "Deluxe Corporation",
          "Devon Energy Corporation",
          "Di Giorgio Corporation",
          "Dial Corporation",
          "Diebold Incorporated",
          "Dillard's Inc.",
          "DIMON Incorporated",
          "Dole Food Company, Inc.",
          "Dollar General Corporation",
          "Dollar Tree Stores, Inc.",
          "Dominion Resources, Inc.",
          "Domino's Pizza LLC",
          "Dover Corporation, Inc.",
          "Dow Chemical Company",
          "Dow Jones & Company, Inc.",
          "DPL Inc.",
          "DQE Inc.",
          "Dreyer's Grand Ice Cream, Inc.",
          "DST Systems, Inc.",
          "DTE Energy Co.",
          "E.I. Du Pont de Nemours and Company",
          "Duke Energy Corp",
          "Dun & Bradstreet Inc.",
          "DURA Automotive Systems Inc.",
          "DynCorp",
          "Dynegy Inc.",
          "E*Trade Group, Inc.",
          "E.W. Scripps Company",
          "Earthlink, Inc.",
          "Eastman Chemical Company",
          "Eastman Kodak Company",
          "Eaton Corporation",
          "Echostar Communications Corporation",
          "Ecolab Inc.",
          "Edison International",
          "EGL Inc.",
          "El Paso Corporation",
          "Electronic Arts Inc.",
          "Electronic Data Systems Corp.",
          "Eli Lilly and Company",
          "EMC Corporation",
          "Emcor Group Inc.",
          "Emerson Electric Co.",
          "Encompass Services Corporation",
          "Energizer Holdings Inc.",
          "Energy East Corporation",
          "Engelhard Corporation",
          "Enron Corp.",
          "Entergy Corporation",
          "Enterprise Products Partners L.P.",
          "EOG Resources, Inc.",
          "Equifax Inc.",
          "Equitable Resources Inc.",
          "Equity Office Properties Trust",
          "Equity Residential Properties Trust",
          "Estee Lauder Companies Inc.",
          "Exelon Corporation",
          "Exide Technologies",
          "Expeditors International of Washington Inc.",
          "Express Scripts Inc.",
          "ExxonMobil Corporation",
          "Fairchild Semiconductor International Inc.",
          "Family Dollar Stores Inc.",
          "Farmland Industries Inc.",
          "Federal Mogul Corp.",
          "Federated Department Stores Inc.",
          "Federal Express Corp.",
          "Felcor Lodging Trust Inc.",
          "Ferro Corp.",
          "Fidelity National Financial Inc.",
          "Fifth Third Bancorp",
          "First American Financial Corp.",
          "First Data Corp.",
          "First National of Nebraska Inc.",
          "First Tennessee National Corp.",
          "FirstEnergy Corp.",
          "Fiserv Inc.",
          "Fisher Scientific International Inc.",
          "FleetBoston Financial Co.",
          "Fleetwood Enterprises Inc.",
          "Fleming Companies Inc.",
          "Flowers Foods Inc.",
          "Flowserv Corp",
          "Fluor Corp",
          "FMC Corp",
          "Foamex International Inc",
          "Foot Locker Inc",
          "Footstar Inc.",
          "Ford Motor Co",
          "Forest Laboratories Inc.",
          "Fortune Brands Inc.",
          "Foster Wheeler Ltd.",
          "FPL Group Inc.",
          "Franklin Resources Inc.",
          "Freeport McMoran Copper & Gold Inc.",
          "Frontier Oil Corp",
          "Furniture Brands International Inc.",
          "Gannett Co., Inc.",
          "Gap Inc.",
          "Gateway Inc.",
          "GATX Corporation",
          "Gemstar-TV Guide International Inc.",
          "GenCorp Inc.",
          "General Cable Corporation",
          "General Dynamics Corporation",
          "General Electric Company",
          "General Mills Inc",
          "General Motors Corporation",
          "Genesis Health Ventures Inc.",
          "Gentek Inc.",
          "Gentiva Health Services Inc.",
          "Genuine Parts Company",
          "Genuity Inc.",
          "Genzyme Corporation",
          "Georgia Gulf Corporation",
          "Georgia-Pacific Corporation",
          "Gillette Company",
          "Gold Kist Inc.",
          "Golden State Bancorp Inc.",
          "Golden West Financial Corporation",
          "Goldman Sachs Group Inc.",
          "Goodrich Corporation",
          "The Goodyear Tire & Rubber Company",
          "Granite Construction Incorporated",
          "Graybar Electric Company Inc.",
          "Great Lakes Chemical Corporation",
          "Great Plains Energy Inc.",
          "GreenPoint Financial Corp.",
          "Greif Bros. Corporation",
          "Grey Global Group Inc.",
          "Group 1 Automotive Inc.",
          "Guidant Corporation",
          "H&R Block Inc.",
          "H.B. Fuller Company",
          "H.J. Heinz Company",
          "Halliburton Co.",
          "Harley-Davidson Inc.",
          "Harman International Industries Inc.",
          "Harrah's Entertainment Inc.",
          "Harris Corp.",
          "Harsco Corp.",
          "Hartford Financial Services Group Inc.",
          "Hasbro Inc.",
          "Hawaiian Electric Industries Inc.",
          "HCA Inc.",
          "Health Management Associates Inc.",
          "Health Net Inc.",
          "Healthsouth Corp",
          "Henry Schein Inc.",
          "Hercules Inc.",
          "Herman Miller Inc.",
          "Hershey Foods Corp.",
          "Hewlett-Packard Company",
          "Hibernia Corp.",
          "Hillenbrand Industries Inc.",
          "Hilton Hotels Corp.",
          "Hollywood Entertainment Corp.",
          "Home Depot Inc.",
          "Hon Industries Inc.",
          "Honeywell International Inc.",
          "Hormel Foods Corp.",
          "Host Marriott Corp.",
          "Household International Corp.",
          "Hovnanian Enterprises Inc.",
          "Hub Group Inc.",
          "Hubbell Inc.",
          "Hughes Supply Inc.",
          "Humana Inc.",
          "Huntington Bancshares Inc.",
          "Idacorp Inc.",
          "IDT Corporation",
          "IKON Office Solutions Inc.",
          "Illinois Tool Works Inc.",
          "IMC Global Inc.",
          "Imperial Sugar Company",
          "IMS Health Inc.",
          "Ingles Market Inc",
          "Ingram Micro Inc.",
          "Insight Enterprises Inc.",
          "Integrated Electrical Services Inc.",
          "Intel Corporation",
          "International Paper Co.",
          "Interpublic Group of Companies Inc.",
          "Interstate Bakeries Corporation",
          "International Business Machines Corp.",
          "International Flavors & Fragrances Inc.",
          "International Multifoods Corporation",
          "Intuit Inc.",
          "IT Group Inc.",
          "ITT Industries Inc.",
          "Ivax Corp.",
          "J.B. Hunt Transport Services Inc.",
          "J.C. Penny Co.",
          "J.P. Morgan Chase & Co.",
          "Jabil Circuit Inc.",
          "Jack In The Box Inc.",
          "Jacobs Engineering Group Inc.",
          "JDS Uniphase Corp.",
          "Jefferson-Pilot Co.",
          "John Hancock Financial Services Inc.",
          "Johnson & Johnson",
          "Johnson Controls Inc.",
          "Jones Apparel Group Inc.",
          "KB Home",
          "Kellogg Company",
          "Kellwood Company",
          "Kelly Services Inc.",
          "Kemet Corp.",
          "Kennametal Inc.",
          "Kerr-McGee Corporation",
          "KeyCorp",
          "KeySpan Corp.",
          "Kimball International Inc.",
          "Kimberly-Clark Corporation",
          "Kindred Healthcare Inc.",
          "KLA-Tencor Corporation",
          "K-Mart Corp.",
          "Knight-Ridder Inc.",
          "Kohl's Corp.",
          "KPMG Consulting Inc.",
          "Kroger Co.",
          "L-3 Communications Holdings Inc.",
          "Laboratory Corporation of America Holdings",
          "Lam Research Corporation",
          "LandAmerica Financial Group Inc.",
          "Lands' End Inc.",
          "Landstar System Inc.",
          "La-Z-Boy Inc.",
          "Lear Corporation",
          "Legg Mason Inc.",
          "Leggett & Platt Inc.",
          "Lehman Brothers Holdings Inc.",
          "Lennar Corporation",
          "Lennox International Inc.",
          "Level 3 Communications Inc.",
          "Levi Strauss & Co.",
          "Lexmark International Inc.",
          "Limited Inc.",
          "Lincoln National Corporation",
          "Linens 'n Things Inc.",
          "Lithia Motors Inc.",
          "Liz Claiborne Inc.",
          "Lockheed Martin Corporation",
          "Loews Corporation",
          "Longs Drug Stores Corporation",
          "Louisiana-Pacific Corporation",
          "Lowe's Companies Inc.",
          "LSI Logic Corporation",
          "The LTV Corporation",
          "The Lubrizol Corporation",
          "Lucent Technologies Inc.",
          "Lyondell Chemical Company",
          "M & T Bank Corporation",
          "Magellan Health Services Inc.",
          "Mail-Well Inc.",
          "Mandalay Resort Group",
          "Manor Care Inc.",
          "Manpower Inc.",
          "Marathon Oil Corporation",
          "Mariner Health Care Inc.",
          "Markel Corporation",
          "Marriott International Inc.",
          "Marsh & McLennan Companies Inc.",
          "Marsh Supermarkets Inc.",
          "Marshall & Ilsley Corporation",
          "Martin Marietta Materials Inc.",
          "Masco Corporation",
          "Massey Energy Company",
          "MasTec Inc.",
          "Mattel Inc.",
          "Maxim Integrated Products Inc.",
          "Maxtor Corporation",
          "Maxxam Inc.",
          "The May Department Stores Company",
          "Maytag Corporation",
          "MBNA Corporation",
          "McCormick & Company Incorporated",
          "McDonald's Corporation",
          "The McGraw-Hill Companies Inc.",
          "McKesson Corporation",
          "McLeodUSA Incorporated",
          "M.D.C. Holdings Inc.",
          "MDU Resources Group Inc.",
          "MeadWestvaco Corporation",
          "Medtronic Inc.",
          "Mellon Financial Corporation",
          "The Men's Wearhouse Inc.",
          "Merck & Co., Inc.",
          "Mercury General Corporation",
          "Merrill Lynch & Co. Inc.",
          "Metaldyne Corporation",
          "Metals USA Inc.",
          "MetLife Inc.",
          "Metris Companies Inc",
          "MGIC Investment Corporation",
          "MGM Mirage",
          "Michaels Stores Inc.",
          "Micron Technology Inc.",
          "Microsoft Corporation",
          "Milacron Inc.",
          "Millennium Chemicals Inc.",
          "Mirant Corporation",
          "Mohawk Industries Inc.",
          "Molex Incorporated",
          "The MONY Group Inc.",
          "Morgan Stanley Dean Witter & Co.",
          "Motorola Inc.",
          "MPS Group Inc.",
          "Murphy Oil Corporation",
          "Nabors Industries Inc",
          "Nacco Industries Inc",
          "Nash Finch Company",
          "National City Corp.",
          "National Commerce Financial Corporation",
          "National Fuel Gas Company",
          "National Oilwell Inc",
          "National Rural Utilities Cooperative Finance Corporation",
          "National Semiconductor Corporation",
          "National Service Industries Inc",
          "Navistar International Corporation",
          "NCR Corporation",
          "The Neiman Marcus Group Inc.",
          "New Jersey Resources Corporation",
          "New York Times Company",
          "Newell Rubbermaid Inc",
          "Newmont Mining Corporation",
          "Nextel Communications Inc",
          "Nicor Inc",
          "Nike Inc",
          "NiSource Inc",
          "Noble Energy Inc",
          "Nordstrom Inc",
          "Norfolk Southern Corporation",
          "Nortek Inc",
          "North Fork Bancorporation Inc",
          "Northeast Utilities System",
          "Northern Trust Corporation",
          "Northrop Grumman Corporation",
          "NorthWestern Corporation",
          "Novellus Systems Inc",
          "NSTAR",
          "NTL Incorporated",
          "Nucor Corp",
          "Nvidia Corp",
          "NVR Inc",
          "Northwest Airlines Corp",
          "Occidental Petroleum Corp",
          "Ocean Energy Inc",
          "Office Depot Inc.",
          "OfficeMax Inc",
          "OGE Energy Corp",
          "Oglethorpe Power Corp.",
          "Ohio Casualty Corp.",
          "Old Republic International Corp.",
          "Olin Corp.",
          "OM Group Inc",
          "Omnicare Inc",
          "Omnicom Group",
          "On Semiconductor Corp",
          "ONEOK Inc",
          "Oracle Corp",
          "Oshkosh Truck Corp",
          "Outback Steakhouse Inc.",
          "Owens & Minor Inc.",
          "Owens Corning",
          "Owens-Illinois Inc",
          "Oxford Health Plans Inc",
          "Paccar Inc",
          "PacifiCare Health Systems Inc",
          "Packaging Corp. of America",
          "Pactiv Corp",
          "Pall Corp",
          "Pantry Inc",
          "Park Place Entertainment Corp",
          "Parker Hannifin Corp.",
          "Pathmark Stores Inc.",
          "Paychex Inc",
          "Payless Shoesource Inc",
          "Penn Traffic Co.",
          "Pennzoil-Quaker State Company",
          "Pentair Inc",
          "Peoples Energy Corp.",
          "PeopleSoft Inc",
          "Pep Boys Manny, Moe & Jack",
          "Potomac Electric Power Co.",
          "Pepsi Bottling Group Inc.",
          "PepsiAmericas Inc.",
          "PepsiCo Inc.",
          "Performance Food Group Co.",
          "Perini Corp",
          "PerkinElmer Inc",
          "Perot Systems Corp",
          "Petco Animal Supplies Inc.",
          "Peter Kiewit Sons', Inc.",
          "PETsMART Inc",
          "Pfizer Inc",
          "Pacific Gas & Electric Corp.",
          "Pharmacia Corp",
          "Phar Mor Inc.",
          "Phelps Dodge Corp.",
          "Philip Morris Companies Inc.",
          "Phillips Petroleum Co",
          "Phillips Van Heusen Corp.",
          "Phoenix Companies Inc",
          "Pier 1 Imports Inc.",
          "Pilgrim's Pride Corporation",
          "Pinnacle West Capital Corp",
          "Pioneer-Standard Electronics Inc.",
          "Pitney Bowes Inc.",
          "Pittston Brinks Group",
          "Plains All American Pipeline LP",
          "PNC Financial Services Group Inc.",
          "PNM Resources Inc",
          "Polaris Industries Inc.",
          "Polo Ralph Lauren Corp",
          "PolyOne Corp",
          "Popular Inc",
          "Potlatch Corp",
          "PPG Industries Inc",
          "PPL Corp",
          "Praxair Inc",
          "Precision Castparts Corp",
          "Premcor Inc.",
          "Pride International Inc",
          "Primedia Inc",
          "Principal Financial Group Inc.",
          "Procter & Gamble Co.",
          "Pro-Fac Cooperative Inc.",
          "Progress Energy Inc",
          "Progressive Corporation",
          "Protective Life Corp",
          "Provident Financial Group",
          "Providian Financial Corp.",
          "Prudential Financial Inc.",
          "PSS World Medical Inc",
          "Public Service Enterprise Group Inc.",
          "Publix Super Markets Inc.",
          "Puget Energy Inc.",
          "Pulte Homes Inc",
          "Qualcomm Inc",
          "Quanta Services Inc.",
          "Quantum Corp",
          "Quest Diagnostics Inc.",
          "Questar Corp",
          "Quintiles Transnational",
          "Qwest Communications Intl Inc",
          "R.J. Reynolds Tobacco Company",
          "R.R. Donnelley & Sons Company",
          "Radio Shack Corporation",
          "Raymond James Financial Inc.",
          "Raytheon Company",
          "Reader's Digest Association Inc.",
          "Reebok International Ltd.",
          "Regions Financial Corp.",
          "Regis Corporation",
          "Reliance Steel & Aluminum Co.",
          "Reliant Energy Inc.",
          "Rent A Center Inc",
          "Republic Services Inc",
          "Revlon Inc",
          "RGS Energy Group Inc",
          "Rite Aid Corp",
          "Riverwood Holding Inc.",
          "RoadwayCorp",
          "Robert Half International Inc.",
          "Rock-Tenn Co",
          "Rockwell Automation Inc",
          "Rockwell Collins Inc",
          "Rohm & Haas Co.",
          "Ross Stores Inc",
          "RPM Inc.",
          "Ruddick Corp",
          "Ryder System Inc",
          "Ryerson Tull Inc",
          "Ryland Group Inc.",
          "Sabre Holdings Corp",
          "Safeco Corp",
          "Safeguard Scientifics Inc.",
          "Safeway Inc",
          "Saks Inc",
          "Sanmina-SCI Inc",
          "Sara Lee Corp",
          "SBC Communications Inc",
          "Scana Corp.",
          "Schering-Plough Corp",
          "Scholastic Corp",
          "SCI Systems Onc.",
          "Science Applications Intl. Inc.",
          "Scientific-Atlanta Inc",
          "Scotts Company",
          "Seaboard Corp",
          "Sealed Air Corp",
          "Sears Roebuck & Co",
          "Sempra Energy",
          "Sequa Corp",
          "Service Corp. International",
          "ServiceMaster Co",
          "Shaw Group Inc",
          "Sherwin-Williams Company",
          "Shopko Stores Inc",
          "Siebel Systems Inc",
          "Sierra Health Services Inc",
          "Sierra Pacific Resources",
          "Silgan Holdings Inc.",
          "Silicon Graphics Inc",
          "Simon Property Group Inc",
          "SLM Corporation",
          "Smith International Inc",
          "Smithfield Foods Inc",
          "Smurfit-Stone Container Corp",
          "Snap-On Inc",
          "Solectron Corp",
          "Solutia Inc",
          "Sonic Automotive Inc.",
          "Sonoco Products Co.",
          "Southern Company",
          "Southern Union Company",
          "SouthTrust Corp.",
          "Southwest Airlines Co",
          "Southwest Gas Corp",
          "Sovereign Bancorp Inc.",
          "Spartan Stores Inc",
          "Spherion Corp",
          "Sports Authority Inc",
          "Sprint Corp.",
          "SPX Corp",
          "St. Jude Medical Inc",
          "St. Paul Cos.",
          "Staff Leasing Inc.",
          "StanCorp Financial Group Inc",
          "Standard Pacific Corp.",
          "Stanley Works",
          "Staples Inc",
          "Starbucks Corp",
          "Starwood Hotels & Resorts Worldwide Inc",
          "State Street Corp.",
          "Stater Bros. Holdings Inc.",
          "Steelcase Inc",
          "Stein Mart Inc",
          "Stewart & Stevenson Services Inc",
          "Stewart Information Services Corp",
          "Stilwell Financial Inc",
          "Storage Technology Corporation",
          "Stryker Corp",
          "Sun Healthcare Group Inc.",
          "Sun Microsystems Inc.",
          "SunGard Data Systems Inc.",
          "Sunoco Inc.",
          "SunTrust Banks Inc",
          "Supervalu Inc",
          "Swift Transportation, Co., Inc",
          "Symbol Technologies Inc",
          "Synovus Financial Corp.",
          "Sysco Corp",
          "Systemax Inc.",
          "Target Corp.",
          "Tech Data Corporation",
          "TECO Energy Inc",
          "Tecumseh Products Company",
          "Tektronix Inc",
          "Teleflex Incorporated",
          "Telephone & Data Systems Inc",
          "Tellabs Inc.",
          "Temple-Inland Inc",
          "Tenet Healthcare Corporation",
          "Tenneco Automotive Inc.",
          "Teradyne Inc",
          "Terex Corp",
          "Tesoro Petroleum Corp.",
          "Texas Industries Inc.",
          "Texas Instruments Incorporated",
          "Textron Inc",
          "Thermo Electron Corporation",
          "Thomas & Betts Corporation",
          "Tiffany & Co",
          "Timken Company",
          "TJX Companies Inc",
          "TMP Worldwide Inc",
          "Toll Brothers Inc",
          "Torchmark Corporation",
          "Toro Company",
          "Tower Automotive Inc.",
          "Toys 'R' Us Inc",
          "Trans World Entertainment Corp.",
          "TransMontaigne Inc",
          "Transocean Inc",
          "TravelCenters of America Inc.",
          "Triad Hospitals Inc",
          "Tribune Company",
          "Trigon Healthcare Inc.",
          "Trinity Industries Inc",
          "Trump Hotels & Casino Resorts Inc.",
          "TruServ Corporation",
          "TRW Inc",
          "TXU Corp",
          "Tyson Foods Inc",
          "U.S. Bancorp",
          "U.S. Industries Inc.",
          "UAL Corporation",
          "UGI Corporation",
          "Unified Western Grocers Inc",
          "Union Pacific Corporation",
          "Union Planters Corp",
          "Unisource Energy Corp",
          "Unisys Corporation",
          "United Auto Group Inc",
          "United Defense Industries Inc.",
          "United Parcel Service Inc",
          "United Rentals Inc",
          "United Stationers Inc",
          "United Technologies Corporation",
          "UnitedHealth Group Incorporated",
          "Unitrin Inc",
          "Universal Corporation",
          "Universal Forest Products Inc",
          "Universal Health Services Inc",
          "Unocal Corporation",
          "Unova Inc",
          "UnumProvident Corporation",
          "URS Corporation",
          "US Airways Group Inc",
          "US Oncology Inc",
          "USA Interactive",
          "USFreighways Corporation",
          "USG Corporation",
          "UST Inc",
          "Valero Energy Corporation",
          "Valspar Corporation",
          "Value City Department Stores Inc",
          "Varco International Inc",
          "Vectren Corporation",
          "Veritas Software Corporation",
          "Verizon Communications Inc",
          "VF Corporation",
          "Viacom Inc",
          "Viad Corp",
          "Viasystems Group Inc",
          "Vishay Intertechnology Inc",
          "Visteon Corporation",
          "Volt Information Sciences Inc",
          "Vulcan Materials Company",
          "W.R. Berkley Corporation",
          "W.R. Grace & Co",
          "W.W. Grainger Inc",
          "Wachovia Corporation",
          "Wakenhut Corporation",
          "Walgreen Co",
          "Wallace Computer Services Inc",
          "Wal-Mart Stores Inc",
          "Walt Disney Co",
          "Walter Industries Inc",
          "Washington Mutual Inc",
          "Washington Post Co.",
          "Waste Management Inc",
          "Watsco Inc",
          "Weatherford International Inc",
          "Weis Markets Inc.",
          "Wellpoint Health Networks Inc",
          "Wells Fargo & Company",
          "Wendy's International Inc",
          "Werner Enterprises Inc",
          "WESCO International Inc",
          "Western Digital Inc",
          "Western Gas Resources Inc",
          "WestPoint Stevens Inc",
          "Weyerhauser Company",
          "WGL Holdings Inc",
          "Whirlpool Corporation",
          "Whole Foods Market Inc",
          "Willamette Industries Inc.",
          "Williams Companies Inc",
          "Williams Sonoma Inc",
          "Winn Dixie Stores Inc",
          "Wisconsin Energy Corporation",
          "Wm Wrigley Jr Company",
          "World Fuel Services Corporation",
          "WorldCom Inc",
          "Worthington Industries Inc",
          "WPS Resources Corporation",
          "Wyeth",
          "Wyndham International Inc",
          "Xcel Energy Inc",
          "Xerox Corp",
          "Xilinx Inc",
          "XO Communications Inc",
          "Yellow Corporation",
          "York International Corp",
          "Yum Brands Inc.",
          "Zale Corporation",
          "Zions Bancorporation"
        ],
        fileExtension: {
          raster: ["bmp", "gif", "gpl", "ico", "jpeg", "psd", "png", "psp", "raw", "tiff"],
          vector: ["3dv", "amf", "awg", "ai", "cgm", "cdr", "cmx", "dxf", "e2d", "egt", "eps", "fs", "odg", "svg", "xar"],
          "3d": ["3dmf", "3dm", "3mf", "3ds", "an8", "aoi", "blend", "cal3d", "cob", "ctm", "iob", "jas", "max", "mb", "mdx", "obj", "x", "x3d"],
          document: ["doc", "docx", "dot", "html", "xml", "odt", "odm", "ott", "csv", "rtf", "tex", "xhtml", "xps"]
        },
        // Data taken from https://github.com/dmfilipenko/timezones.json/blob/master/timezones.json
        timezones: [
          {
            name: "Dateline Standard Time",
            abbr: "DST",
            offset: -12,
            isdst: !1,
            text: "(UTC-12:00) International Date Line West",
            utc: [
              "Etc/GMT+12"
            ]
          },
          {
            name: "UTC-11",
            abbr: "U",
            offset: -11,
            isdst: !1,
            text: "(UTC-11:00) Coordinated Universal Time-11",
            utc: [
              "Etc/GMT+11",
              "Pacific/Midway",
              "Pacific/Niue",
              "Pacific/Pago_Pago"
            ]
          },
          {
            name: "Hawaiian Standard Time",
            abbr: "HST",
            offset: -10,
            isdst: !1,
            text: "(UTC-10:00) Hawaii",
            utc: [
              "Etc/GMT+10",
              "Pacific/Honolulu",
              "Pacific/Johnston",
              "Pacific/Rarotonga",
              "Pacific/Tahiti"
            ]
          },
          {
            name: "Alaskan Standard Time",
            abbr: "AKDT",
            offset: -8,
            isdst: !0,
            text: "(UTC-09:00) Alaska",
            utc: [
              "America/Anchorage",
              "America/Juneau",
              "America/Nome",
              "America/Sitka",
              "America/Yakutat"
            ]
          },
          {
            name: "Pacific Standard Time (Mexico)",
            abbr: "PDT",
            offset: -7,
            isdst: !0,
            text: "(UTC-08:00) Baja California",
            utc: [
              "America/Santa_Isabel"
            ]
          },
          {
            name: "Pacific Daylight Time",
            abbr: "PDT",
            offset: -7,
            isdst: !0,
            text: "(UTC-07:00) Pacific Time (US & Canada)",
            utc: [
              "America/Dawson",
              "America/Los_Angeles",
              "America/Tijuana",
              "America/Vancouver",
              "America/Whitehorse"
            ]
          },
          {
            name: "Pacific Standard Time",
            abbr: "PST",
            offset: -8,
            isdst: !1,
            text: "(UTC-08:00) Pacific Time (US & Canada)",
            utc: [
              "America/Dawson",
              "America/Los_Angeles",
              "America/Tijuana",
              "America/Vancouver",
              "America/Whitehorse",
              "PST8PDT"
            ]
          },
          {
            name: "US Mountain Standard Time",
            abbr: "UMST",
            offset: -7,
            isdst: !1,
            text: "(UTC-07:00) Arizona",
            utc: [
              "America/Creston",
              "America/Dawson_Creek",
              "America/Hermosillo",
              "America/Phoenix",
              "Etc/GMT+7"
            ]
          },
          {
            name: "Mountain Standard Time (Mexico)",
            abbr: "MDT",
            offset: -6,
            isdst: !0,
            text: "(UTC-07:00) Chihuahua, La Paz, Mazatlan",
            utc: [
              "America/Chihuahua",
              "America/Mazatlan"
            ]
          },
          {
            name: "Mountain Standard Time",
            abbr: "MDT",
            offset: -6,
            isdst: !0,
            text: "(UTC-07:00) Mountain Time (US & Canada)",
            utc: [
              "America/Boise",
              "America/Cambridge_Bay",
              "America/Denver",
              "America/Edmonton",
              "America/Inuvik",
              "America/Ojinaga",
              "America/Yellowknife",
              "MST7MDT"
            ]
          },
          {
            name: "Central America Standard Time",
            abbr: "CAST",
            offset: -6,
            isdst: !1,
            text: "(UTC-06:00) Central America",
            utc: [
              "America/Belize",
              "America/Costa_Rica",
              "America/El_Salvador",
              "America/Guatemala",
              "America/Managua",
              "America/Tegucigalpa",
              "Etc/GMT+6",
              "Pacific/Galapagos"
            ]
          },
          {
            name: "Central Standard Time",
            abbr: "CDT",
            offset: -5,
            isdst: !0,
            text: "(UTC-06:00) Central Time (US & Canada)",
            utc: [
              "America/Chicago",
              "America/Indiana/Knox",
              "America/Indiana/Tell_City",
              "America/Matamoros",
              "America/Menominee",
              "America/North_Dakota/Beulah",
              "America/North_Dakota/Center",
              "America/North_Dakota/New_Salem",
              "America/Rainy_River",
              "America/Rankin_Inlet",
              "America/Resolute",
              "America/Winnipeg",
              "CST6CDT"
            ]
          },
          {
            name: "Central Standard Time (Mexico)",
            abbr: "CDT",
            offset: -5,
            isdst: !0,
            text: "(UTC-06:00) Guadalajara, Mexico City, Monterrey",
            utc: [
              "America/Bahia_Banderas",
              "America/Cancun",
              "America/Merida",
              "America/Mexico_City",
              "America/Monterrey"
            ]
          },
          {
            name: "Canada Central Standard Time",
            abbr: "CCST",
            offset: -6,
            isdst: !1,
            text: "(UTC-06:00) Saskatchewan",
            utc: [
              "America/Regina",
              "America/Swift_Current"
            ]
          },
          {
            name: "SA Pacific Standard Time",
            abbr: "SPST",
            offset: -5,
            isdst: !1,
            text: "(UTC-05:00) Bogota, Lima, Quito",
            utc: [
              "America/Bogota",
              "America/Cayman",
              "America/Coral_Harbour",
              "America/Eirunepe",
              "America/Guayaquil",
              "America/Jamaica",
              "America/Lima",
              "America/Panama",
              "America/Rio_Branco",
              "Etc/GMT+5"
            ]
          },
          {
            name: "Eastern Standard Time",
            abbr: "EDT",
            offset: -4,
            isdst: !0,
            text: "(UTC-05:00) Eastern Time (US & Canada)",
            utc: [
              "America/Detroit",
              "America/Havana",
              "America/Indiana/Petersburg",
              "America/Indiana/Vincennes",
              "America/Indiana/Winamac",
              "America/Iqaluit",
              "America/Kentucky/Monticello",
              "America/Louisville",
              "America/Montreal",
              "America/Nassau",
              "America/New_York",
              "America/Nipigon",
              "America/Pangnirtung",
              "America/Port-au-Prince",
              "America/Thunder_Bay",
              "America/Toronto",
              "EST5EDT"
            ]
          },
          {
            name: "US Eastern Standard Time",
            abbr: "UEDT",
            offset: -4,
            isdst: !0,
            text: "(UTC-05:00) Indiana (East)",
            utc: [
              "America/Indiana/Marengo",
              "America/Indiana/Vevay",
              "America/Indianapolis"
            ]
          },
          {
            name: "Venezuela Standard Time",
            abbr: "VST",
            offset: -4.5,
            isdst: !1,
            text: "(UTC-04:30) Caracas",
            utc: [
              "America/Caracas"
            ]
          },
          {
            name: "Paraguay Standard Time",
            abbr: "PYT",
            offset: -4,
            isdst: !1,
            text: "(UTC-04:00) Asuncion",
            utc: [
              "America/Asuncion"
            ]
          },
          {
            name: "Atlantic Standard Time",
            abbr: "ADT",
            offset: -3,
            isdst: !0,
            text: "(UTC-04:00) Atlantic Time (Canada)",
            utc: [
              "America/Glace_Bay",
              "America/Goose_Bay",
              "America/Halifax",
              "America/Moncton",
              "America/Thule",
              "Atlantic/Bermuda"
            ]
          },
          {
            name: "Central Brazilian Standard Time",
            abbr: "CBST",
            offset: -4,
            isdst: !1,
            text: "(UTC-04:00) Cuiaba",
            utc: [
              "America/Campo_Grande",
              "America/Cuiaba"
            ]
          },
          {
            name: "SA Western Standard Time",
            abbr: "SWST",
            offset: -4,
            isdst: !1,
            text: "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",
            utc: [
              "America/Anguilla",
              "America/Antigua",
              "America/Aruba",
              "America/Barbados",
              "America/Blanc-Sablon",
              "America/Boa_Vista",
              "America/Curacao",
              "America/Dominica",
              "America/Grand_Turk",
              "America/Grenada",
              "America/Guadeloupe",
              "America/Guyana",
              "America/Kralendijk",
              "America/La_Paz",
              "America/Lower_Princes",
              "America/Manaus",
              "America/Marigot",
              "America/Martinique",
              "America/Montserrat",
              "America/Port_of_Spain",
              "America/Porto_Velho",
              "America/Puerto_Rico",
              "America/Santo_Domingo",
              "America/St_Barthelemy",
              "America/St_Kitts",
              "America/St_Lucia",
              "America/St_Thomas",
              "America/St_Vincent",
              "America/Tortola",
              "Etc/GMT+4"
            ]
          },
          {
            name: "Pacific SA Standard Time",
            abbr: "PSST",
            offset: -4,
            isdst: !1,
            text: "(UTC-04:00) Santiago",
            utc: [
              "America/Santiago",
              "Antarctica/Palmer"
            ]
          },
          {
            name: "Newfoundland Standard Time",
            abbr: "NDT",
            offset: -2.5,
            isdst: !0,
            text: "(UTC-03:30) Newfoundland",
            utc: [
              "America/St_Johns"
            ]
          },
          {
            name: "E. South America Standard Time",
            abbr: "ESAST",
            offset: -3,
            isdst: !1,
            text: "(UTC-03:00) Brasilia",
            utc: [
              "America/Sao_Paulo"
            ]
          },
          {
            name: "Argentina Standard Time",
            abbr: "AST",
            offset: -3,
            isdst: !1,
            text: "(UTC-03:00) Buenos Aires",
            utc: [
              "America/Argentina/La_Rioja",
              "America/Argentina/Rio_Gallegos",
              "America/Argentina/Salta",
              "America/Argentina/San_Juan",
              "America/Argentina/San_Luis",
              "America/Argentina/Tucuman",
              "America/Argentina/Ushuaia",
              "America/Buenos_Aires",
              "America/Catamarca",
              "America/Cordoba",
              "America/Jujuy",
              "America/Mendoza"
            ]
          },
          {
            name: "SA Eastern Standard Time",
            abbr: "SEST",
            offset: -3,
            isdst: !1,
            text: "(UTC-03:00) Cayenne, Fortaleza",
            utc: [
              "America/Araguaina",
              "America/Belem",
              "America/Cayenne",
              "America/Fortaleza",
              "America/Maceio",
              "America/Paramaribo",
              "America/Recife",
              "America/Santarem",
              "Antarctica/Rothera",
              "Atlantic/Stanley",
              "Etc/GMT+3"
            ]
          },
          {
            name: "Greenland Standard Time",
            abbr: "GDT",
            offset: -3,
            isdst: !0,
            text: "(UTC-03:00) Greenland",
            utc: [
              "America/Godthab"
            ]
          },
          {
            name: "Montevideo Standard Time",
            abbr: "MST",
            offset: -3,
            isdst: !1,
            text: "(UTC-03:00) Montevideo",
            utc: [
              "America/Montevideo"
            ]
          },
          {
            name: "Bahia Standard Time",
            abbr: "BST",
            offset: -3,
            isdst: !1,
            text: "(UTC-03:00) Salvador",
            utc: [
              "America/Bahia"
            ]
          },
          {
            name: "UTC-02",
            abbr: "U",
            offset: -2,
            isdst: !1,
            text: "(UTC-02:00) Coordinated Universal Time-02",
            utc: [
              "America/Noronha",
              "Atlantic/South_Georgia",
              "Etc/GMT+2"
            ]
          },
          {
            name: "Mid-Atlantic Standard Time",
            abbr: "MDT",
            offset: -1,
            isdst: !0,
            text: "(UTC-02:00) Mid-Atlantic - Old",
            utc: []
          },
          {
            name: "Azores Standard Time",
            abbr: "ADT",
            offset: 0,
            isdst: !0,
            text: "(UTC-01:00) Azores",
            utc: [
              "America/Scoresbysund",
              "Atlantic/Azores"
            ]
          },
          {
            name: "Cape Verde Standard Time",
            abbr: "CVST",
            offset: -1,
            isdst: !1,
            text: "(UTC-01:00) Cape Verde Is.",
            utc: [
              "Atlantic/Cape_Verde",
              "Etc/GMT+1"
            ]
          },
          {
            name: "Morocco Standard Time",
            abbr: "MDT",
            offset: 1,
            isdst: !0,
            text: "(UTC) Casablanca",
            utc: [
              "Africa/Casablanca",
              "Africa/El_Aaiun"
            ]
          },
          {
            name: "UTC",
            abbr: "UTC",
            offset: 0,
            isdst: !1,
            text: "(UTC) Coordinated Universal Time",
            utc: [
              "America/Danmarkshavn",
              "Etc/GMT"
            ]
          },
          {
            name: "GMT Standard Time",
            abbr: "GMT",
            offset: 0,
            isdst: !1,
            text: "(UTC) Edinburgh, London",
            utc: [
              "Europe/Isle_of_Man",
              "Europe/Guernsey",
              "Europe/Jersey",
              "Europe/London"
            ]
          },
          {
            name: "British Summer Time",
            abbr: "BST",
            offset: 1,
            isdst: !0,
            text: "(UTC+01:00) Edinburgh, London",
            utc: [
              "Europe/Isle_of_Man",
              "Europe/Guernsey",
              "Europe/Jersey",
              "Europe/London"
            ]
          },
          {
            name: "GMT Standard Time",
            abbr: "GDT",
            offset: 1,
            isdst: !0,
            text: "(UTC) Dublin, Lisbon",
            utc: [
              "Atlantic/Canary",
              "Atlantic/Faeroe",
              "Atlantic/Madeira",
              "Europe/Dublin",
              "Europe/Lisbon"
            ]
          },
          {
            name: "Greenwich Standard Time",
            abbr: "GST",
            offset: 0,
            isdst: !1,
            text: "(UTC) Monrovia, Reykjavik",
            utc: [
              "Africa/Abidjan",
              "Africa/Accra",
              "Africa/Bamako",
              "Africa/Banjul",
              "Africa/Bissau",
              "Africa/Conakry",
              "Africa/Dakar",
              "Africa/Freetown",
              "Africa/Lome",
              "Africa/Monrovia",
              "Africa/Nouakchott",
              "Africa/Ouagadougou",
              "Africa/Sao_Tome",
              "Atlantic/Reykjavik",
              "Atlantic/St_Helena"
            ]
          },
          {
            name: "W. Europe Standard Time",
            abbr: "WEDT",
            offset: 2,
            isdst: !0,
            text: "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
            utc: [
              "Arctic/Longyearbyen",
              "Europe/Amsterdam",
              "Europe/Andorra",
              "Europe/Berlin",
              "Europe/Busingen",
              "Europe/Gibraltar",
              "Europe/Luxembourg",
              "Europe/Malta",
              "Europe/Monaco",
              "Europe/Oslo",
              "Europe/Rome",
              "Europe/San_Marino",
              "Europe/Stockholm",
              "Europe/Vaduz",
              "Europe/Vatican",
              "Europe/Vienna",
              "Europe/Zurich"
            ]
          },
          {
            name: "Central Europe Standard Time",
            abbr: "CEDT",
            offset: 2,
            isdst: !0,
            text: "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
            utc: [
              "Europe/Belgrade",
              "Europe/Bratislava",
              "Europe/Budapest",
              "Europe/Ljubljana",
              "Europe/Podgorica",
              "Europe/Prague",
              "Europe/Tirane"
            ]
          },
          {
            name: "Romance Standard Time",
            abbr: "RDT",
            offset: 2,
            isdst: !0,
            text: "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
            utc: [
              "Africa/Ceuta",
              "Europe/Brussels",
              "Europe/Copenhagen",
              "Europe/Madrid",
              "Europe/Paris"
            ]
          },
          {
            name: "Central European Standard Time",
            abbr: "CEDT",
            offset: 2,
            isdst: !0,
            text: "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
            utc: [
              "Europe/Sarajevo",
              "Europe/Skopje",
              "Europe/Warsaw",
              "Europe/Zagreb"
            ]
          },
          {
            name: "W. Central Africa Standard Time",
            abbr: "WCAST",
            offset: 1,
            isdst: !1,
            text: "(UTC+01:00) West Central Africa",
            utc: [
              "Africa/Algiers",
              "Africa/Bangui",
              "Africa/Brazzaville",
              "Africa/Douala",
              "Africa/Kinshasa",
              "Africa/Lagos",
              "Africa/Libreville",
              "Africa/Luanda",
              "Africa/Malabo",
              "Africa/Ndjamena",
              "Africa/Niamey",
              "Africa/Porto-Novo",
              "Africa/Tunis",
              "Etc/GMT-1"
            ]
          },
          {
            name: "Namibia Standard Time",
            abbr: "NST",
            offset: 1,
            isdst: !1,
            text: "(UTC+01:00) Windhoek",
            utc: [
              "Africa/Windhoek"
            ]
          },
          {
            name: "GTB Standard Time",
            abbr: "GDT",
            offset: 3,
            isdst: !0,
            text: "(UTC+02:00) Athens, Bucharest",
            utc: [
              "Asia/Nicosia",
              "Europe/Athens",
              "Europe/Bucharest",
              "Europe/Chisinau"
            ]
          },
          {
            name: "Middle East Standard Time",
            abbr: "MEDT",
            offset: 3,
            isdst: !0,
            text: "(UTC+02:00) Beirut",
            utc: [
              "Asia/Beirut"
            ]
          },
          {
            name: "Egypt Standard Time",
            abbr: "EST",
            offset: 2,
            isdst: !1,
            text: "(UTC+02:00) Cairo",
            utc: [
              "Africa/Cairo"
            ]
          },
          {
            name: "Syria Standard Time",
            abbr: "SDT",
            offset: 3,
            isdst: !0,
            text: "(UTC+02:00) Damascus",
            utc: [
              "Asia/Damascus"
            ]
          },
          {
            name: "E. Europe Standard Time",
            abbr: "EEDT",
            offset: 3,
            isdst: !0,
            text: "(UTC+02:00) E. Europe",
            utc: [
              "Asia/Nicosia",
              "Europe/Athens",
              "Europe/Bucharest",
              "Europe/Chisinau",
              "Europe/Helsinki",
              "Europe/Kiev",
              "Europe/Mariehamn",
              "Europe/Nicosia",
              "Europe/Riga",
              "Europe/Sofia",
              "Europe/Tallinn",
              "Europe/Uzhgorod",
              "Europe/Vilnius",
              "Europe/Zaporozhye"
            ]
          },
          {
            name: "South Africa Standard Time",
            abbr: "SAST",
            offset: 2,
            isdst: !1,
            text: "(UTC+02:00) Harare, Pretoria",
            utc: [
              "Africa/Blantyre",
              "Africa/Bujumbura",
              "Africa/Gaborone",
              "Africa/Harare",
              "Africa/Johannesburg",
              "Africa/Kigali",
              "Africa/Lubumbashi",
              "Africa/Lusaka",
              "Africa/Maputo",
              "Africa/Maseru",
              "Africa/Mbabane",
              "Etc/GMT-2"
            ]
          },
          {
            name: "FLE Standard Time",
            abbr: "FDT",
            offset: 3,
            isdst: !0,
            text: "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
            utc: [
              "Europe/Helsinki",
              "Europe/Kiev",
              "Europe/Mariehamn",
              "Europe/Riga",
              "Europe/Sofia",
              "Europe/Tallinn",
              "Europe/Uzhgorod",
              "Europe/Vilnius",
              "Europe/Zaporozhye"
            ]
          },
          {
            name: "Turkey Standard Time",
            abbr: "TDT",
            offset: 3,
            isdst: !1,
            text: "(UTC+03:00) Istanbul",
            utc: [
              "Europe/Istanbul"
            ]
          },
          {
            name: "Israel Standard Time",
            abbr: "JDT",
            offset: 3,
            isdst: !0,
            text: "(UTC+02:00) Jerusalem",
            utc: [
              "Asia/Jerusalem"
            ]
          },
          {
            name: "Libya Standard Time",
            abbr: "LST",
            offset: 2,
            isdst: !1,
            text: "(UTC+02:00) Tripoli",
            utc: [
              "Africa/Tripoli"
            ]
          },
          {
            name: "Jordan Standard Time",
            abbr: "JST",
            offset: 3,
            isdst: !1,
            text: "(UTC+03:00) Amman",
            utc: [
              "Asia/Amman"
            ]
          },
          {
            name: "Arabic Standard Time",
            abbr: "AST",
            offset: 3,
            isdst: !1,
            text: "(UTC+03:00) Baghdad",
            utc: [
              "Asia/Baghdad"
            ]
          },
          {
            name: "Kaliningrad Standard Time",
            abbr: "KST",
            offset: 3,
            isdst: !1,
            text: "(UTC+02:00) Kaliningrad",
            utc: [
              "Europe/Kaliningrad"
            ]
          },
          {
            name: "Arab Standard Time",
            abbr: "AST",
            offset: 3,
            isdst: !1,
            text: "(UTC+03:00) Kuwait, Riyadh",
            utc: [
              "Asia/Aden",
              "Asia/Bahrain",
              "Asia/Kuwait",
              "Asia/Qatar",
              "Asia/Riyadh"
            ]
          },
          {
            name: "E. Africa Standard Time",
            abbr: "EAST",
            offset: 3,
            isdst: !1,
            text: "(UTC+03:00) Nairobi",
            utc: [
              "Africa/Addis_Ababa",
              "Africa/Asmera",
              "Africa/Dar_es_Salaam",
              "Africa/Djibouti",
              "Africa/Juba",
              "Africa/Kampala",
              "Africa/Khartoum",
              "Africa/Mogadishu",
              "Africa/Nairobi",
              "Antarctica/Syowa",
              "Etc/GMT-3",
              "Indian/Antananarivo",
              "Indian/Comoro",
              "Indian/Mayotte"
            ]
          },
          {
            name: "Moscow Standard Time",
            abbr: "MSK",
            offset: 3,
            isdst: !1,
            text: "(UTC+03:00) Moscow, St. Petersburg, Volgograd, Minsk",
            utc: [
              "Europe/Kirov",
              "Europe/Moscow",
              "Europe/Simferopol",
              "Europe/Volgograd",
              "Europe/Minsk"
            ]
          },
          {
            name: "Samara Time",
            abbr: "SAMT",
            offset: 4,
            isdst: !1,
            text: "(UTC+04:00) Samara, Ulyanovsk, Saratov",
            utc: [
              "Europe/Astrakhan",
              "Europe/Samara",
              "Europe/Ulyanovsk"
            ]
          },
          {
            name: "Iran Standard Time",
            abbr: "IDT",
            offset: 4.5,
            isdst: !0,
            text: "(UTC+03:30) Tehran",
            utc: [
              "Asia/Tehran"
            ]
          },
          {
            name: "Arabian Standard Time",
            abbr: "AST",
            offset: 4,
            isdst: !1,
            text: "(UTC+04:00) Abu Dhabi, Muscat",
            utc: [
              "Asia/Dubai",
              "Asia/Muscat",
              "Etc/GMT-4"
            ]
          },
          {
            name: "Azerbaijan Standard Time",
            abbr: "ADT",
            offset: 5,
            isdst: !0,
            text: "(UTC+04:00) Baku",
            utc: [
              "Asia/Baku"
            ]
          },
          {
            name: "Mauritius Standard Time",
            abbr: "MST",
            offset: 4,
            isdst: !1,
            text: "(UTC+04:00) Port Louis",
            utc: [
              "Indian/Mahe",
              "Indian/Mauritius",
              "Indian/Reunion"
            ]
          },
          {
            name: "Georgian Standard Time",
            abbr: "GET",
            offset: 4,
            isdst: !1,
            text: "(UTC+04:00) Tbilisi",
            utc: [
              "Asia/Tbilisi"
            ]
          },
          {
            name: "Caucasus Standard Time",
            abbr: "CST",
            offset: 4,
            isdst: !1,
            text: "(UTC+04:00) Yerevan",
            utc: [
              "Asia/Yerevan"
            ]
          },
          {
            name: "Afghanistan Standard Time",
            abbr: "AST",
            offset: 4.5,
            isdst: !1,
            text: "(UTC+04:30) Kabul",
            utc: [
              "Asia/Kabul"
            ]
          },
          {
            name: "West Asia Standard Time",
            abbr: "WAST",
            offset: 5,
            isdst: !1,
            text: "(UTC+05:00) Ashgabat, Tashkent",
            utc: [
              "Antarctica/Mawson",
              "Asia/Aqtau",
              "Asia/Aqtobe",
              "Asia/Ashgabat",
              "Asia/Dushanbe",
              "Asia/Oral",
              "Asia/Samarkand",
              "Asia/Tashkent",
              "Etc/GMT-5",
              "Indian/Kerguelen",
              "Indian/Maldives"
            ]
          },
          {
            name: "Yekaterinburg Time",
            abbr: "YEKT",
            offset: 5,
            isdst: !1,
            text: "(UTC+05:00) Yekaterinburg",
            utc: [
              "Asia/Yekaterinburg"
            ]
          },
          {
            name: "Pakistan Standard Time",
            abbr: "PKT",
            offset: 5,
            isdst: !1,
            text: "(UTC+05:00) Islamabad, Karachi",
            utc: [
              "Asia/Karachi"
            ]
          },
          {
            name: "India Standard Time",
            abbr: "IST",
            offset: 5.5,
            isdst: !1,
            text: "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
            utc: [
              "Asia/Kolkata"
            ]
          },
          {
            name: "Sri Lanka Standard Time",
            abbr: "SLST",
            offset: 5.5,
            isdst: !1,
            text: "(UTC+05:30) Sri Jayawardenepura",
            utc: [
              "Asia/Colombo"
            ]
          },
          {
            name: "Nepal Standard Time",
            abbr: "NST",
            offset: 5.75,
            isdst: !1,
            text: "(UTC+05:45) Kathmandu",
            utc: [
              "Asia/Kathmandu"
            ]
          },
          {
            name: "Central Asia Standard Time",
            abbr: "CAST",
            offset: 6,
            isdst: !1,
            text: "(UTC+06:00) Nur-Sultan (Astana)",
            utc: [
              "Antarctica/Vostok",
              "Asia/Almaty",
              "Asia/Bishkek",
              "Asia/Qyzylorda",
              "Asia/Urumqi",
              "Etc/GMT-6",
              "Indian/Chagos"
            ]
          },
          {
            name: "Bangladesh Standard Time",
            abbr: "BST",
            offset: 6,
            isdst: !1,
            text: "(UTC+06:00) Dhaka",
            utc: [
              "Asia/Dhaka",
              "Asia/Thimphu"
            ]
          },
          {
            name: "Myanmar Standard Time",
            abbr: "MST",
            offset: 6.5,
            isdst: !1,
            text: "(UTC+06:30) Yangon (Rangoon)",
            utc: [
              "Asia/Rangoon",
              "Indian/Cocos"
            ]
          },
          {
            name: "SE Asia Standard Time",
            abbr: "SAST",
            offset: 7,
            isdst: !1,
            text: "(UTC+07:00) Bangkok, Hanoi, Jakarta",
            utc: [
              "Antarctica/Davis",
              "Asia/Bangkok",
              "Asia/Hovd",
              "Asia/Jakarta",
              "Asia/Phnom_Penh",
              "Asia/Pontianak",
              "Asia/Saigon",
              "Asia/Vientiane",
              "Etc/GMT-7",
              "Indian/Christmas"
            ]
          },
          {
            name: "N. Central Asia Standard Time",
            abbr: "NCAST",
            offset: 7,
            isdst: !1,
            text: "(UTC+07:00) Novosibirsk",
            utc: [
              "Asia/Novokuznetsk",
              "Asia/Novosibirsk",
              "Asia/Omsk"
            ]
          },
          {
            name: "China Standard Time",
            abbr: "CST",
            offset: 8,
            isdst: !1,
            text: "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
            utc: [
              "Asia/Hong_Kong",
              "Asia/Macau",
              "Asia/Shanghai"
            ]
          },
          {
            name: "North Asia Standard Time",
            abbr: "NAST",
            offset: 8,
            isdst: !1,
            text: "(UTC+08:00) Krasnoyarsk",
            utc: [
              "Asia/Krasnoyarsk"
            ]
          },
          {
            name: "Singapore Standard Time",
            abbr: "MPST",
            offset: 8,
            isdst: !1,
            text: "(UTC+08:00) Kuala Lumpur, Singapore",
            utc: [
              "Asia/Brunei",
              "Asia/Kuala_Lumpur",
              "Asia/Kuching",
              "Asia/Makassar",
              "Asia/Manila",
              "Asia/Singapore",
              "Etc/GMT-8"
            ]
          },
          {
            name: "W. Australia Standard Time",
            abbr: "WAST",
            offset: 8,
            isdst: !1,
            text: "(UTC+08:00) Perth",
            utc: [
              "Antarctica/Casey",
              "Australia/Perth"
            ]
          },
          {
            name: "Taipei Standard Time",
            abbr: "TST",
            offset: 8,
            isdst: !1,
            text: "(UTC+08:00) Taipei",
            utc: [
              "Asia/Taipei"
            ]
          },
          {
            name: "Ulaanbaatar Standard Time",
            abbr: "UST",
            offset: 8,
            isdst: !1,
            text: "(UTC+08:00) Ulaanbaatar",
            utc: [
              "Asia/Choibalsan",
              "Asia/Ulaanbaatar"
            ]
          },
          {
            name: "North Asia East Standard Time",
            abbr: "NAEST",
            offset: 8,
            isdst: !1,
            text: "(UTC+08:00) Irkutsk",
            utc: [
              "Asia/Irkutsk"
            ]
          },
          {
            name: "Japan Standard Time",
            abbr: "JST",
            offset: 9,
            isdst: !1,
            text: "(UTC+09:00) Osaka, Sapporo, Tokyo",
            utc: [
              "Asia/Dili",
              "Asia/Jayapura",
              "Asia/Tokyo",
              "Etc/GMT-9",
              "Pacific/Palau"
            ]
          },
          {
            name: "Korea Standard Time",
            abbr: "KST",
            offset: 9,
            isdst: !1,
            text: "(UTC+09:00) Seoul",
            utc: [
              "Asia/Pyongyang",
              "Asia/Seoul"
            ]
          },
          {
            name: "Cen. Australia Standard Time",
            abbr: "CAST",
            offset: 9.5,
            isdst: !1,
            text: "(UTC+09:30) Adelaide",
            utc: [
              "Australia/Adelaide",
              "Australia/Broken_Hill"
            ]
          },
          {
            name: "AUS Central Standard Time",
            abbr: "ACST",
            offset: 9.5,
            isdst: !1,
            text: "(UTC+09:30) Darwin",
            utc: [
              "Australia/Darwin"
            ]
          },
          {
            name: "E. Australia Standard Time",
            abbr: "EAST",
            offset: 10,
            isdst: !1,
            text: "(UTC+10:00) Brisbane",
            utc: [
              "Australia/Brisbane",
              "Australia/Lindeman"
            ]
          },
          {
            name: "AUS Eastern Standard Time",
            abbr: "AEST",
            offset: 10,
            isdst: !1,
            text: "(UTC+10:00) Canberra, Melbourne, Sydney",
            utc: [
              "Australia/Melbourne",
              "Australia/Sydney"
            ]
          },
          {
            name: "West Pacific Standard Time",
            abbr: "WPST",
            offset: 10,
            isdst: !1,
            text: "(UTC+10:00) Guam, Port Moresby",
            utc: [
              "Antarctica/DumontDUrville",
              "Etc/GMT-10",
              "Pacific/Guam",
              "Pacific/Port_Moresby",
              "Pacific/Saipan",
              "Pacific/Truk"
            ]
          },
          {
            name: "Tasmania Standard Time",
            abbr: "TST",
            offset: 10,
            isdst: !1,
            text: "(UTC+10:00) Hobart",
            utc: [
              "Australia/Currie",
              "Australia/Hobart"
            ]
          },
          {
            name: "Yakutsk Standard Time",
            abbr: "YST",
            offset: 9,
            isdst: !1,
            text: "(UTC+09:00) Yakutsk",
            utc: [
              "Asia/Chita",
              "Asia/Khandyga",
              "Asia/Yakutsk"
            ]
          },
          {
            name: "Central Pacific Standard Time",
            abbr: "CPST",
            offset: 11,
            isdst: !1,
            text: "(UTC+11:00) Solomon Is., New Caledonia",
            utc: [
              "Antarctica/Macquarie",
              "Etc/GMT-11",
              "Pacific/Efate",
              "Pacific/Guadalcanal",
              "Pacific/Kosrae",
              "Pacific/Noumea",
              "Pacific/Ponape"
            ]
          },
          {
            name: "Vladivostok Standard Time",
            abbr: "VST",
            offset: 11,
            isdst: !1,
            text: "(UTC+11:00) Vladivostok",
            utc: [
              "Asia/Sakhalin",
              "Asia/Ust-Nera",
              "Asia/Vladivostok"
            ]
          },
          {
            name: "New Zealand Standard Time",
            abbr: "NZST",
            offset: 12,
            isdst: !1,
            text: "(UTC+12:00) Auckland, Wellington",
            utc: [
              "Antarctica/McMurdo",
              "Pacific/Auckland"
            ]
          },
          {
            name: "UTC+12",
            abbr: "U",
            offset: 12,
            isdst: !1,
            text: "(UTC+12:00) Coordinated Universal Time+12",
            utc: [
              "Etc/GMT-12",
              "Pacific/Funafuti",
              "Pacific/Kwajalein",
              "Pacific/Majuro",
              "Pacific/Nauru",
              "Pacific/Tarawa",
              "Pacific/Wake",
              "Pacific/Wallis"
            ]
          },
          {
            name: "Fiji Standard Time",
            abbr: "FST",
            offset: 12,
            isdst: !1,
            text: "(UTC+12:00) Fiji",
            utc: [
              "Pacific/Fiji"
            ]
          },
          {
            name: "Magadan Standard Time",
            abbr: "MST",
            offset: 12,
            isdst: !1,
            text: "(UTC+12:00) Magadan",
            utc: [
              "Asia/Anadyr",
              "Asia/Kamchatka",
              "Asia/Magadan",
              "Asia/Srednekolymsk"
            ]
          },
          {
            name: "Kamchatka Standard Time",
            abbr: "KDT",
            offset: 13,
            isdst: !0,
            text: "(UTC+12:00) Petropavlovsk-Kamchatsky - Old",
            utc: [
              "Asia/Kamchatka"
            ]
          },
          {
            name: "Tonga Standard Time",
            abbr: "TST",
            offset: 13,
            isdst: !1,
            text: "(UTC+13:00) Nuku'alofa",
            utc: [
              "Etc/GMT-13",
              "Pacific/Enderbury",
              "Pacific/Fakaofo",
              "Pacific/Tongatapu"
            ]
          },
          {
            name: "Samoa Standard Time",
            abbr: "SST",
            offset: 13,
            isdst: !1,
            text: "(UTC+13:00) Samoa",
            utc: [
              "Pacific/Apia"
            ]
          }
        ],
        //List source: http://answers.google.com/answers/threadview/id/589312.html
        profession: [
          "Airline Pilot",
          "Academic Team",
          "Accountant",
          "Account Executive",
          "Actor",
          "Actuary",
          "Acquisition Analyst",
          "Administrative Asst.",
          "Administrative Analyst",
          "Administrator",
          "Advertising Director",
          "Aerospace Engineer",
          "Agent",
          "Agricultural Inspector",
          "Agricultural Scientist",
          "Air Traffic Controller",
          "Animal Trainer",
          "Anthropologist",
          "Appraiser",
          "Architect",
          "Art Director",
          "Artist",
          "Astronomer",
          "Athletic Coach",
          "Auditor",
          "Author",
          "Baker",
          "Banker",
          "Bankruptcy Attorney",
          "Benefits Manager",
          "Biologist",
          "Bio-feedback Specialist",
          "Biomedical Engineer",
          "Biotechnical Researcher",
          "Broadcaster",
          "Broker",
          "Building Manager",
          "Building Contractor",
          "Building Inspector",
          "Business Analyst",
          "Business Planner",
          "Business Manager",
          "Buyer",
          "Call Center Manager",
          "Career Counselor",
          "Cash Manager",
          "Ceramic Engineer",
          "Chief Executive Officer",
          "Chief Operation Officer",
          "Chef",
          "Chemical Engineer",
          "Chemist",
          "Child Care Manager",
          "Chief Medical Officer",
          "Chiropractor",
          "Cinematographer",
          "City Housing Manager",
          "City Manager",
          "Civil Engineer",
          "Claims Manager",
          "Clinical Research Assistant",
          "Collections Manager",
          "Compliance Manager",
          "Comptroller",
          "Computer Manager",
          "Commercial Artist",
          "Communications Affairs Director",
          "Communications Director",
          "Communications Engineer",
          "Compensation Analyst",
          "Computer Programmer",
          "Computer Ops. Manager",
          "Computer Engineer",
          "Computer Operator",
          "Computer Graphics Specialist",
          "Construction Engineer",
          "Construction Manager",
          "Consultant",
          "Consumer Relations Manager",
          "Contract Administrator",
          "Copyright Attorney",
          "Copywriter",
          "Corporate Planner",
          "Corrections Officer",
          "Cosmetologist",
          "Credit Analyst",
          "Cruise Director",
          "Chief Information Officer",
          "Chief Technology Officer",
          "Customer Service Manager",
          "Cryptologist",
          "Dancer",
          "Data Security Manager",
          "Database Manager",
          "Day Care Instructor",
          "Dentist",
          "Designer",
          "Design Engineer",
          "Desktop Publisher",
          "Developer",
          "Development Officer",
          "Diamond Merchant",
          "Dietitian",
          "Direct Marketer",
          "Director",
          "Distribution Manager",
          "Diversity Manager",
          "Economist",
          "EEO Compliance Manager",
          "Editor",
          "Education Adminator",
          "Electrical Engineer",
          "Electro Optical Engineer",
          "Electronics Engineer",
          "Embassy Management",
          "Employment Agent",
          "Engineer Technician",
          "Entrepreneur",
          "Environmental Analyst",
          "Environmental Attorney",
          "Environmental Engineer",
          "Environmental Specialist",
          "Escrow Officer",
          "Estimator",
          "Executive Assistant",
          "Executive Director",
          "Executive Recruiter",
          "Facilities Manager",
          "Family Counselor",
          "Fashion Events Manager",
          "Fashion Merchandiser",
          "Fast Food Manager",
          "Film Producer",
          "Film Production Assistant",
          "Financial Analyst",
          "Financial Planner",
          "Financier",
          "Fine Artist",
          "Wildlife Specialist",
          "Fitness Consultant",
          "Flight Attendant",
          "Flight Engineer",
          "Floral Designer",
          "Food & Beverage Director",
          "Food Service Manager",
          "Forestry Technician",
          "Franchise Management",
          "Franchise Sales",
          "Fraud Investigator",
          "Freelance Writer",
          "Fund Raiser",
          "General Manager",
          "Geologist",
          "General Counsel",
          "Geriatric Specialist",
          "Gerontologist",
          "Glamour Photographer",
          "Golf Club Manager",
          "Gourmet Chef",
          "Graphic Designer",
          "Grounds Keeper",
          "Hazardous Waste Manager",
          "Health Care Manager",
          "Health Therapist",
          "Health Service Administrator",
          "Hearing Officer",
          "Home Economist",
          "Horticulturist",
          "Hospital Administrator",
          "Hotel Manager",
          "Human Resources Manager",
          "Importer",
          "Industrial Designer",
          "Industrial Engineer",
          "Information Director",
          "Inside Sales",
          "Insurance Adjuster",
          "Interior Decorator",
          "Internal Controls Director",
          "International Acct.",
          "International Courier",
          "International Lawyer",
          "Interpreter",
          "Investigator",
          "Investment Banker",
          "Investment Manager",
          "IT Architect",
          "IT Project Manager",
          "IT Systems Analyst",
          "Jeweler",
          "Joint Venture Manager",
          "Journalist",
          "Labor Negotiator",
          "Labor Organizer",
          "Labor Relations Manager",
          "Lab Services Director",
          "Lab Technician",
          "Land Developer",
          "Landscape Architect",
          "Law Enforcement Officer",
          "Lawyer",
          "Lead Software Engineer",
          "Lead Software Test Engineer",
          "Leasing Manager",
          "Legal Secretary",
          "Library Manager",
          "Litigation Attorney",
          "Loan Officer",
          "Lobbyist",
          "Logistics Manager",
          "Maintenance Manager",
          "Management Consultant",
          "Managed Care Director",
          "Managing Partner",
          "Manufacturing Director",
          "Manpower Planner",
          "Marine Biologist",
          "Market Res. Analyst",
          "Marketing Director",
          "Materials Manager",
          "Mathematician",
          "Membership Chairman",
          "Mechanic",
          "Mechanical Engineer",
          "Media Buyer",
          "Medical Investor",
          "Medical Secretary",
          "Medical Technician",
          "Mental Health Counselor",
          "Merchandiser",
          "Metallurgical Engineering",
          "Meteorologist",
          "Microbiologist",
          "MIS Manager",
          "Motion Picture Director",
          "Multimedia Director",
          "Musician",
          "Network Administrator",
          "Network Specialist",
          "Network Operator",
          "New Product Manager",
          "Novelist",
          "Nuclear Engineer",
          "Nuclear Specialist",
          "Nutritionist",
          "Nursing Administrator",
          "Occupational Therapist",
          "Oceanographer",
          "Office Manager",
          "Operations Manager",
          "Operations Research Director",
          "Optical Technician",
          "Optometrist",
          "Organizational Development Manager",
          "Outplacement Specialist",
          "Paralegal",
          "Park Ranger",
          "Patent Attorney",
          "Payroll Specialist",
          "Personnel Specialist",
          "Petroleum Engineer",
          "Pharmacist",
          "Photographer",
          "Physical Therapist",
          "Physician",
          "Physician Assistant",
          "Physicist",
          "Planning Director",
          "Podiatrist",
          "Political Analyst",
          "Political Scientist",
          "Politician",
          "Portfolio Manager",
          "Preschool Management",
          "Preschool Teacher",
          "Principal",
          "Private Banker",
          "Private Investigator",
          "Probation Officer",
          "Process Engineer",
          "Producer",
          "Product Manager",
          "Product Engineer",
          "Production Engineer",
          "Production Planner",
          "Professional Athlete",
          "Professional Coach",
          "Professor",
          "Project Engineer",
          "Project Manager",
          "Program Manager",
          "Property Manager",
          "Public Administrator",
          "Public Safety Director",
          "PR Specialist",
          "Publisher",
          "Purchasing Agent",
          "Publishing Director",
          "Quality Assurance Specialist",
          "Quality Control Engineer",
          "Quality Control Inspector",
          "Radiology Manager",
          "Railroad Engineer",
          "Real Estate Broker",
          "Recreational Director",
          "Recruiter",
          "Redevelopment Specialist",
          "Regulatory Affairs Manager",
          "Registered Nurse",
          "Rehabilitation Counselor",
          "Relocation Manager",
          "Reporter",
          "Research Specialist",
          "Restaurant Manager",
          "Retail Store Manager",
          "Risk Analyst",
          "Safety Engineer",
          "Sales Engineer",
          "Sales Trainer",
          "Sales Promotion Manager",
          "Sales Representative",
          "Sales Manager",
          "Service Manager",
          "Sanitation Engineer",
          "Scientific Programmer",
          "Scientific Writer",
          "Securities Analyst",
          "Security Consultant",
          "Security Director",
          "Seminar Presenter",
          "Ship's Officer",
          "Singer",
          "Social Director",
          "Social Program Planner",
          "Social Research",
          "Social Scientist",
          "Social Worker",
          "Sociologist",
          "Software Developer",
          "Software Engineer",
          "Software Test Engineer",
          "Soil Scientist",
          "Special Events Manager",
          "Special Education Teacher",
          "Special Projects Director",
          "Speech Pathologist",
          "Speech Writer",
          "Sports Event Manager",
          "Statistician",
          "Store Manager",
          "Strategic Alliance Director",
          "Strategic Planning Director",
          "Stress Reduction Specialist",
          "Stockbroker",
          "Surveyor",
          "Structural Engineer",
          "Superintendent",
          "Supply Chain Director",
          "System Engineer",
          "Systems Analyst",
          "Systems Programmer",
          "System Administrator",
          "Tax Specialist",
          "Teacher",
          "Technical Support Specialist",
          "Technical Illustrator",
          "Technical Writer",
          "Technology Director",
          "Telecom Analyst",
          "Telemarketer",
          "Theatrical Director",
          "Title Examiner",
          "Tour Escort",
          "Tour Guide Director",
          "Traffic Manager",
          "Trainer Translator",
          "Transportation Manager",
          "Travel Agent",
          "Treasurer",
          "TV Programmer",
          "Underwriter",
          "Union Representative",
          "University Administrator",
          "University Dean",
          "Urban Planner",
          "Veterinarian",
          "Vendor Relations Director",
          "Viticulturist",
          "Warehouse Manager"
        ],
        animals: {
          //list of ocean animals comes from https://owlcation.com/stem/list-of-ocean-animals
          ocean: ["Acantharea", "Anemone", "Angelfish King", "Ahi Tuna", "Albacore", "American Oyster", "Anchovy", "Armored Snail", "Arctic Char", "Atlantic Bluefin Tuna", "Atlantic Cod", "Atlantic Goliath Grouper", "Atlantic Trumpetfish", "Atlantic Wolffish", "Baleen Whale", "Banded Butterflyfish", "Banded Coral Shrimp", "Banded Sea Krait", "Barnacle", "Barndoor Skate", "Barracuda", "Basking Shark", "Bass", "Beluga Whale", "Bluebanded Goby", "Bluehead Wrasse", "Bluefish", "Bluestreak Cleaner-Wrasse", "Blue Marlin", "Blue Shark", "Blue Spiny Lobster", "Blue Tang", "Blue Whale", "Broadclub Cuttlefish", "Bull Shark", "Chambered Nautilus", "Chilean Basket Star", "Chilean Jack Mackerel", "Chinook Salmon", "Christmas Tree Worm", "Clam", "Clown Anemonefish", "Clown Triggerfish", "Cod", "Coelacanth", "Cockscomb Cup Coral", "Common Fangtooth", "Conch", "Cookiecutter Shark", "Copepod", "Coral", "Corydoras", "Cownose Ray", "Crab", "Crown-of-Thorns Starfish", "Cushion Star", "Cuttlefish", "California Sea Otters", "Dolphin", "Dolphinfish", "Dory", "Devil Fish", "Dugong", "Dumbo Octopus", "Dungeness Crab", "Eccentric Sand Dollar", "Edible Sea Cucumber", "Eel", "Elephant Seal", "Elkhorn Coral", "Emperor Shrimp", "Estuarine Crocodile", "Fathead Sculpin", "Fiddler Crab", "Fin Whale", "Flameback", "Flamingo Tongue Snail", "Flashlight Fish", "Flatback Turtle", "Flatfish", "Flying Fish", "Flounder", "Fluke", "French Angelfish", "Frilled Shark", "Fugu (also called Pufferfish)", "Gar", "Geoduck", "Giant Barrel Sponge", "Giant Caribbean Sea Anemone", "Giant Clam", "Giant Isopod", "Giant Kingfish", "Giant Oarfish", "Giant Pacific Octopus", "Giant Pyrosome", "Giant Sea Star", "Giant Squid", "Glowing Sucker Octopus", "Giant Tube Worm", "Goblin Shark", "Goosefish", "Great White Shark", "Greenland Shark", "Grey Atlantic Seal", "Grouper", "Grunion", "Guineafowl Puffer", "Haddock", "Hake", "Halibut", "Hammerhead Shark", "Hapuka", "Harbor Porpoise", "Harbor Seal", "Hatchetfish", "Hawaiian Monk Seal", "Hawksbill Turtle", "Hector's Dolphin", "Hermit Crab", "Herring", "Hoki", "Horn Shark", "Horseshoe Crab", "Humpback Anglerfish", "Humpback Whale", "Icefish", "Imperator Angelfish", "Irukandji Jellyfish", "Isopod", "Ivory Bush Coral", "Japanese Spider Crab", "Jellyfish", "John Dory", "Juan Fernandez Fur Seal", "Killer Whale", "Kiwa Hirsuta", "Krill", "Lagoon Triggerfish", "Lamprey", "Leafy Seadragon", "Leopard Seal", "Limpet", "Ling", "Lionfish", "Lions Mane Jellyfish", "Lobe Coral", "Lobster", "Loggerhead Turtle", "Longnose Sawshark", "Longsnout Seahorse", "Lophelia Coral", "Marrus Orthocanna", "Manatee", "Manta Ray", "Marlin", "Megamouth Shark", "Mexican Lookdown", "Mimic Octopus", "Moon Jelly", "Mollusk", "Monkfish", "Moray Eel", "Mullet", "Mussel", "Megaladon", "Napoleon Wrasse", "Nassau Grouper", "Narwhal", "Nautilus", "Needlefish", "Northern Seahorse", "North Atlantic Right Whale", "Northern Red Snapper", "Norway Lobster", "Nudibranch", "Nurse Shark", "Oarfish", "Ocean Sunfish", "Oceanic Whitetip Shark", "Octopus", "Olive Sea Snake", "Orange Roughy", "Ostracod", "Otter", "Oyster", "Pacific Angelshark", "Pacific Blackdragon", "Pacific Halibut", "Pacific Sardine", "Pacific Sea Nettle Jellyfish", "Pacific White Sided Dolphin", "Pantropical Spotted Dolphin", "Patagonian Toothfish", "Peacock Mantis Shrimp", "Pelagic Thresher Shark", "Penguin", "Peruvian Anchoveta", "Pilchard", "Pink Salmon", "Pinniped", "Plankton", "Porpoise", "Polar Bear", "Portuguese Man o' War", "Pycnogonid Sea Spider", "Quahog", "Queen Angelfish", "Queen Conch", "Queen Parrotfish", "Queensland Grouper", "Ragfish", "Ratfish", "Rattail Fish", "Ray", "Red Drum", "Red King Crab", "Ringed Seal", "Risso's Dolphin", "Ross Seals", "Sablefish", "Salmon", "Sand Dollar", "Sandbar Shark", "Sawfish", "Sarcastic Fringehead", "Scalloped Hammerhead Shark", "Seahorse", "Sea Cucumber", "Sea Lion", "Sea Urchin", "Seal", "Shark", "Shortfin Mako Shark", "Shovelnose Guitarfish", "Shrimp", "Silverside Fish", "Skipjack Tuna", "Slender Snipe Eel", "Smalltooth Sawfish", "Smelts", "Sockeye Salmon", "Southern Stingray", "Sponge", "Spotted Porcupinefish", "Spotted Dolphin", "Spotted Eagle Ray", "Spotted Moray", "Squid", "Squidworm", "Starfish", "Stickleback", "Stonefish", "Stoplight Loosejaw", "Sturgeon", "Swordfish", "Tan Bristlemouth", "Tasseled Wobbegong", "Terrible Claw Lobster", "Threespot Damselfish", "Tiger Prawn", "Tiger Shark", "Tilefish", "Toadfish", "Tropical Two-Wing Flyfish", "Tuna", "Umbrella Squid", "Velvet Crab", "Venus Flytrap Sea Anemone", "Vigtorniella Worm", "Viperfish", "Vampire Squid", "Vaquita", "Wahoo", "Walrus", "West Indian Manatee", "Whale", "Whale Shark", "Whiptail Gulper", "White-Beaked Dolphin", "White-Ring Garden Eel", "White Shrimp", "Wobbegong", "Wrasse", "Wreckfish", "Xiphosura", "Yellowtail Damselfish", "Yelloweye Rockfish", "Yellow Cup Black Coral", "Yellow Tube Sponge", "Yellowfin Tuna", "Zebrashark", "Zooplankton"],
          //list of desert, grassland, and forest animals comes from http://www.skyenimals.com/
          desert: ["Aardwolf", "Addax", "African Wild Ass", "Ant", "Antelope", "Armadillo", "Baboon", "Badger", "Bat", "Bearded Dragon", "Beetle", "Bird", "Black-footed Cat", "Boa", "Brown Bear", "Bustard", "Butterfly", "Camel", "Caracal", "Caracara", "Caterpillar", "Centipede", "Cheetah", "Chipmunk", "Chuckwalla", "Climbing Mouse", "Coati", "Cobra", "Cotton Rat", "Cougar", "Courser", "Crane Fly", "Crow", "Dassie Rat", "Dove", "Dunnart", "Eagle", "Echidna", "Elephant", "Emu", "Falcon", "Fly", "Fox", "Frogmouth", "Gecko", "Geoffroy's Cat", "Gerbil", "Grasshopper", "Guanaco", "Gundi", "Hamster", "Hawk", "Hedgehog", "Hyena", "Hyrax", "Jackal", "Kangaroo", "Kangaroo Rat", "Kestrel", "Kowari", "Kultarr", "Leopard", "Lion", "Macaw", "Meerkat", "Mouse", "Oryx", "Ostrich", "Owl", "Pronghorn", "Python", "Rabbit", "Raccoon", "Rattlesnake", "Rhinoceros", "Sand Cat", "Spectacled Bear", "Spiny Mouse", "Starling", "Stick Bug", "Tarantula", "Tit", "Toad", "Tortoise", "Tyrant Flycatcher", "Viper", "Vulture", "Waxwing", "Xerus", "Zebra"],
          grassland: ["Aardvark", "Aardwolf", "Accentor", "African Buffalo", "African Wild Dog", "Alpaca", "Anaconda", "Ant", "Anteater", "Antelope", "Armadillo", "Baboon", "Badger", "Bandicoot", "Barbet", "Bat", "Bee", "Bee-eater", "Beetle", "Bird", "Bison", "Black-footed Cat", "Black-footed Ferret", "Bluebird", "Boa", "Bowerbird", "Brown Bear", "Bush Dog", "Bushshrike", "Bustard", "Butterfly", "Buzzard", "Caracal", "Caracara", "Cardinal", "Caterpillar", "Cheetah", "Chipmunk", "Civet", "Climbing Mouse", "Clouded Leopard", "Coati", "Cobra", "Cockatoo", "Cockroach", "Common Genet", "Cotton Rat", "Cougar", "Courser", "Coyote", "Crane", "Crane Fly", "Cricket", "Crow", "Culpeo", "Death Adder", "Deer", "Deer Mouse", "Dingo", "Dinosaur", "Dove", "Drongo", "Duck", "Duiker", "Dunnart", "Eagle", "Echidna", "Elephant", "Elk", "Emu", "Falcon", "Finch", "Flea", "Fly", "Flying Frog", "Fox", "Frog", "Frogmouth", "Garter Snake", "Gazelle", "Gecko", "Geoffroy's Cat", "Gerbil", "Giant Tortoise", "Giraffe", "Grasshopper", "Grison", "Groundhog", "Grouse", "Guanaco", "Guinea Pig", "Hamster", "Harrier", "Hartebeest", "Hawk", "Hedgehog", "Helmetshrike", "Hippopotamus", "Hornbill", "Hyena", "Hyrax", "Impala", "Jackal", "Jaguar", "Jaguarundi", "Kangaroo", "Kangaroo Rat", "Kestrel", "Kultarr", "Ladybug", "Leopard", "Lion", "Macaw", "Meerkat", "Mouse", "Newt", "Oryx", "Ostrich", "Owl", "Pangolin", "Pheasant", "Prairie Dog", "Pronghorn", "Przewalski's Horse", "Python", "Quoll", "Rabbit", "Raven", "Rhinoceros", "Shelduck", "Sloth Bear", "Spectacled Bear", "Squirrel", "Starling", "Stick Bug", "Tamandua", "Tasmanian Devil", "Thornbill", "Thrush", "Toad", "Tortoise"],
          forest: ["Agouti", "Anaconda", "Anoa", "Ant", "Anteater", "Antelope", "Armadillo", "Asian Black Bear", "Aye-aye", "Babirusa", "Baboon", "Badger", "Bandicoot", "Banteng", "Barbet", "Basilisk", "Bat", "Bearded Dragon", "Bee", "Bee-eater", "Beetle", "Bettong", "Binturong", "Bird-of-paradise", "Bongo", "Bowerbird", "Bulbul", "Bush Dog", "Bushbaby", "Bushshrike", "Butterfly", "Buzzard", "Caecilian", "Cardinal", "Cassowary", "Caterpillar", "Centipede", "Chameleon", "Chimpanzee", "Cicada", "Civet", "Clouded Leopard", "Coati", "Cobra", "Cockatoo", "Cockroach", "Colugo", "Cotinga", "Cotton Rat", "Cougar", "Crane Fly", "Cricket", "Crocodile", "Crow", "Cuckoo", "Cuscus", "Death Adder", "Deer", "Dhole", "Dingo", "Dinosaur", "Drongo", "Duck", "Duiker", "Eagle", "Echidna", "Elephant", "Finch", "Flat-headed Cat", "Flea", "Flowerpecker", "Fly", "Flying Frog", "Fossa", "Frog", "Frogmouth", "Gaur", "Gecko", "Gorilla", "Grison", "Hawaiian Honeycreeper", "Hawk", "Hedgehog", "Helmetshrike", "Hornbill", "Hyrax", "Iguana", "Jackal", "Jaguar", "Jaguarundi", "Kestrel", "Ladybug", "Lemur", "Leopard", "Lion", "Macaw", "Mandrill", "Margay", "Monkey", "Mouse", "Mouse Deer", "Newt", "Okapi", "Old World Flycatcher", "Orangutan", "Owl", "Pangolin", "Peafowl", "Pheasant", "Possum", "Python", "Quokka", "Rabbit", "Raccoon", "Red Panda", "Red River Hog", "Rhinoceros", "Sloth Bear", "Spectacled Bear", "Squirrel", "Starling", "Stick Bug", "Sun Bear", "Tamandua", "Tamarin", "Tapir", "Tarantula", "Thrush", "Tiger", "Tit", "Toad", "Tortoise", "Toucan", "Trogon", "Trumpeter", "Turaco", "Turtle", "Tyrant Flycatcher", "Viper", "Vulture", "Wallaby", "Warbler", "Wasp", "Waxwing", "Weaver", "Weaver-finch", "Whistler", "White-eye", "Whydah", "Woodswallow", "Worm", "Wren", "Xenops", "Yellowjacket", "Accentor", "African Buffalo", "American Black Bear", "Anole", "Bird", "Bison", "Boa", "Brown Bear", "Chipmunk", "Common Genet", "Copperhead", "Coyote", "Deer Mouse", "Dormouse", "Elk", "Emu", "Fisher", "Fox", "Garter Snake", "Giant Panda", "Giant Tortoise", "Groundhog", "Grouse", "Guanaco", "Himalayan Tahr", "Kangaroo", "Koala", "Numbat", "Quoll", "Raccoon dog", "Tasmanian Devil", "Thornbill", "Turkey", "Vole", "Weasel", "Wildcat", "Wolf", "Wombat", "Woodchuck", "Woodpecker"],
          //list of farm animals comes from https://www.buzzle.com/articles/farm-animals-list.html
          farm: ["Alpaca", "Buffalo", "Banteng", "Cow", "Cat", "Chicken", "Carp", "Camel", "Donkey", "Dog", "Duck", "Emu", "Goat", "Gayal", "Guinea", "Goose", "Horse", "Honey", "Llama", "Pig", "Pigeon", "Rhea", "Rabbit", "Sheep", "Silkworm", "Turkey", "Yak", "Zebu"],
          //list of pet animals comes from https://www.dogbreedinfo.com/pets/pet.htm
          pet: ["Bearded Dragon", "Birds", "Burro", "Cats", "Chameleons", "Chickens", "Chinchillas", "Chinese Water Dragon", "Cows", "Dogs", "Donkey", "Ducks", "Ferrets", "Fish", "Geckos", "Geese", "Gerbils", "Goats", "Guinea Fowl", "Guinea Pigs", "Hamsters", "Hedgehogs", "Horses", "Iguanas", "Llamas", "Lizards", "Mice", "Mule", "Peafowl", "Pigs and Hogs", "Pigeons", "Ponies", "Pot Bellied Pig", "Rabbits", "Rats", "Sheep", "Skinks", "Snakes", "Stick Insects", "Sugar Gliders", "Tarantula", "Turkeys", "Turtles"],
          //list of zoo animals comes from https://bronxzoo.com/animals
          zoo: ["Aardvark", "African Wild Dog", "Aldabra Tortoise", "American Alligator", "American Bison", "Amur Tiger", "Anaconda", "Andean Condor", "Asian Elephant", "Baby Doll Sheep", "Bald Eagle", "Barred Owl", "Blue Iguana", "Boer Goat", "California Sea Lion", "Caribbean Flamingo", "Chinchilla", "Collared Lemur", "Coquerel's Sifaka", "Cuban Amazon Parrot", "Ebony Langur", "Fennec Fox", "Fossa", "Gelada", "Giant Anteater", "Giraffe", "Gorilla", "Grizzly Bear", "Henkel's Leaf-tailed Gecko", "Indian Gharial", "Indian Rhinoceros", "King Cobra", "King Vulture", "Komodo Dragon", "Linne's Two-toed Sloth", "Lion", "Little Penguin", "Madagascar Tree Boa", "Magellanic Penguin", "Malayan Tapir", "Malayan Tiger", "Matschies Tree Kangaroo", "Mini Donkey", "Monarch Butterfly", "Nile crocodile", "North American Porcupine", "Nubian Ibex", "Okapi", "Poison Dart Frog", "Polar Bear", "Pygmy Marmoset", "Radiated Tortoise", "Red Panda", "Red Ruffed Lemur", "Ring-tailed Lemur", "Ring-tailed Mongoose", "Rock Hyrax", "Small Clawed Asian Otter", "Snow Leopard", "Snowy Owl", "Southern White-faced Owl", "Southern White Rhinocerous", "Squirrel Monkey", "Tufted Puffin", "White Cheeked Gibbon", "White-throated Bee Eater", "Zebra"]
        },
        primes: [
          // 1230 first primes, i.e. all primes up to the first one greater than 10000, inclusive.
          2,
          3,
          5,
          7,
          11,
          13,
          17,
          19,
          23,
          29,
          31,
          37,
          41,
          43,
          47,
          53,
          59,
          61,
          67,
          71,
          73,
          79,
          83,
          89,
          97,
          101,
          103,
          107,
          109,
          113,
          127,
          131,
          137,
          139,
          149,
          151,
          157,
          163,
          167,
          173,
          179,
          181,
          191,
          193,
          197,
          199,
          211,
          223,
          227,
          229,
          233,
          239,
          241,
          251,
          257,
          263,
          269,
          271,
          277,
          281,
          283,
          293,
          307,
          311,
          313,
          317,
          331,
          337,
          347,
          349,
          353,
          359,
          367,
          373,
          379,
          383,
          389,
          397,
          401,
          409,
          419,
          421,
          431,
          433,
          439,
          443,
          449,
          457,
          461,
          463,
          467,
          479,
          487,
          491,
          499,
          503,
          509,
          521,
          523,
          541,
          547,
          557,
          563,
          569,
          571,
          577,
          587,
          593,
          599,
          601,
          607,
          613,
          617,
          619,
          631,
          641,
          643,
          647,
          653,
          659,
          661,
          673,
          677,
          683,
          691,
          701,
          709,
          719,
          727,
          733,
          739,
          743,
          751,
          757,
          761,
          769,
          773,
          787,
          797,
          809,
          811,
          821,
          823,
          827,
          829,
          839,
          853,
          857,
          859,
          863,
          877,
          881,
          883,
          887,
          907,
          911,
          919,
          929,
          937,
          941,
          947,
          953,
          967,
          971,
          977,
          983,
          991,
          997,
          1009,
          1013,
          1019,
          1021,
          1031,
          1033,
          1039,
          1049,
          1051,
          1061,
          1063,
          1069,
          1087,
          1091,
          1093,
          1097,
          1103,
          1109,
          1117,
          1123,
          1129,
          1151,
          1153,
          1163,
          1171,
          1181,
          1187,
          1193,
          1201,
          1213,
          1217,
          1223,
          1229,
          1231,
          1237,
          1249,
          1259,
          1277,
          1279,
          1283,
          1289,
          1291,
          1297,
          1301,
          1303,
          1307,
          1319,
          1321,
          1327,
          1361,
          1367,
          1373,
          1381,
          1399,
          1409,
          1423,
          1427,
          1429,
          1433,
          1439,
          1447,
          1451,
          1453,
          1459,
          1471,
          1481,
          1483,
          1487,
          1489,
          1493,
          1499,
          1511,
          1523,
          1531,
          1543,
          1549,
          1553,
          1559,
          1567,
          1571,
          1579,
          1583,
          1597,
          1601,
          1607,
          1609,
          1613,
          1619,
          1621,
          1627,
          1637,
          1657,
          1663,
          1667,
          1669,
          1693,
          1697,
          1699,
          1709,
          1721,
          1723,
          1733,
          1741,
          1747,
          1753,
          1759,
          1777,
          1783,
          1787,
          1789,
          1801,
          1811,
          1823,
          1831,
          1847,
          1861,
          1867,
          1871,
          1873,
          1877,
          1879,
          1889,
          1901,
          1907,
          1913,
          1931,
          1933,
          1949,
          1951,
          1973,
          1979,
          1987,
          1993,
          1997,
          1999,
          2003,
          2011,
          2017,
          2027,
          2029,
          2039,
          2053,
          2063,
          2069,
          2081,
          2083,
          2087,
          2089,
          2099,
          2111,
          2113,
          2129,
          2131,
          2137,
          2141,
          2143,
          2153,
          2161,
          2179,
          2203,
          2207,
          2213,
          2221,
          2237,
          2239,
          2243,
          2251,
          2267,
          2269,
          2273,
          2281,
          2287,
          2293,
          2297,
          2309,
          2311,
          2333,
          2339,
          2341,
          2347,
          2351,
          2357,
          2371,
          2377,
          2381,
          2383,
          2389,
          2393,
          2399,
          2411,
          2417,
          2423,
          2437,
          2441,
          2447,
          2459,
          2467,
          2473,
          2477,
          2503,
          2521,
          2531,
          2539,
          2543,
          2549,
          2551,
          2557,
          2579,
          2591,
          2593,
          2609,
          2617,
          2621,
          2633,
          2647,
          2657,
          2659,
          2663,
          2671,
          2677,
          2683,
          2687,
          2689,
          2693,
          2699,
          2707,
          2711,
          2713,
          2719,
          2729,
          2731,
          2741,
          2749,
          2753,
          2767,
          2777,
          2789,
          2791,
          2797,
          2801,
          2803,
          2819,
          2833,
          2837,
          2843,
          2851,
          2857,
          2861,
          2879,
          2887,
          2897,
          2903,
          2909,
          2917,
          2927,
          2939,
          2953,
          2957,
          2963,
          2969,
          2971,
          2999,
          3001,
          3011,
          3019,
          3023,
          3037,
          3041,
          3049,
          3061,
          3067,
          3079,
          3083,
          3089,
          3109,
          3119,
          3121,
          3137,
          3163,
          3167,
          3169,
          3181,
          3187,
          3191,
          3203,
          3209,
          3217,
          3221,
          3229,
          3251,
          3253,
          3257,
          3259,
          3271,
          3299,
          3301,
          3307,
          3313,
          3319,
          3323,
          3329,
          3331,
          3343,
          3347,
          3359,
          3361,
          3371,
          3373,
          3389,
          3391,
          3407,
          3413,
          3433,
          3449,
          3457,
          3461,
          3463,
          3467,
          3469,
          3491,
          3499,
          3511,
          3517,
          3527,
          3529,
          3533,
          3539,
          3541,
          3547,
          3557,
          3559,
          3571,
          3581,
          3583,
          3593,
          3607,
          3613,
          3617,
          3623,
          3631,
          3637,
          3643,
          3659,
          3671,
          3673,
          3677,
          3691,
          3697,
          3701,
          3709,
          3719,
          3727,
          3733,
          3739,
          3761,
          3767,
          3769,
          3779,
          3793,
          3797,
          3803,
          3821,
          3823,
          3833,
          3847,
          3851,
          3853,
          3863,
          3877,
          3881,
          3889,
          3907,
          3911,
          3917,
          3919,
          3923,
          3929,
          3931,
          3943,
          3947,
          3967,
          3989,
          4001,
          4003,
          4007,
          4013,
          4019,
          4021,
          4027,
          4049,
          4051,
          4057,
          4073,
          4079,
          4091,
          4093,
          4099,
          4111,
          4127,
          4129,
          4133,
          4139,
          4153,
          4157,
          4159,
          4177,
          4201,
          4211,
          4217,
          4219,
          4229,
          4231,
          4241,
          4243,
          4253,
          4259,
          4261,
          4271,
          4273,
          4283,
          4289,
          4297,
          4327,
          4337,
          4339,
          4349,
          4357,
          4363,
          4373,
          4391,
          4397,
          4409,
          4421,
          4423,
          4441,
          4447,
          4451,
          4457,
          4463,
          4481,
          4483,
          4493,
          4507,
          4513,
          4517,
          4519,
          4523,
          4547,
          4549,
          4561,
          4567,
          4583,
          4591,
          4597,
          4603,
          4621,
          4637,
          4639,
          4643,
          4649,
          4651,
          4657,
          4663,
          4673,
          4679,
          4691,
          4703,
          4721,
          4723,
          4729,
          4733,
          4751,
          4759,
          4783,
          4787,
          4789,
          4793,
          4799,
          4801,
          4813,
          4817,
          4831,
          4861,
          4871,
          4877,
          4889,
          4903,
          4909,
          4919,
          4931,
          4933,
          4937,
          4943,
          4951,
          4957,
          4967,
          4969,
          4973,
          4987,
          4993,
          4999,
          5003,
          5009,
          5011,
          5021,
          5023,
          5039,
          5051,
          5059,
          5077,
          5081,
          5087,
          5099,
          5101,
          5107,
          5113,
          5119,
          5147,
          5153,
          5167,
          5171,
          5179,
          5189,
          5197,
          5209,
          5227,
          5231,
          5233,
          5237,
          5261,
          5273,
          5279,
          5281,
          5297,
          5303,
          5309,
          5323,
          5333,
          5347,
          5351,
          5381,
          5387,
          5393,
          5399,
          5407,
          5413,
          5417,
          5419,
          5431,
          5437,
          5441,
          5443,
          5449,
          5471,
          5477,
          5479,
          5483,
          5501,
          5503,
          5507,
          5519,
          5521,
          5527,
          5531,
          5557,
          5563,
          5569,
          5573,
          5581,
          5591,
          5623,
          5639,
          5641,
          5647,
          5651,
          5653,
          5657,
          5659,
          5669,
          5683,
          5689,
          5693,
          5701,
          5711,
          5717,
          5737,
          5741,
          5743,
          5749,
          5779,
          5783,
          5791,
          5801,
          5807,
          5813,
          5821,
          5827,
          5839,
          5843,
          5849,
          5851,
          5857,
          5861,
          5867,
          5869,
          5879,
          5881,
          5897,
          5903,
          5923,
          5927,
          5939,
          5953,
          5981,
          5987,
          6007,
          6011,
          6029,
          6037,
          6043,
          6047,
          6053,
          6067,
          6073,
          6079,
          6089,
          6091,
          6101,
          6113,
          6121,
          6131,
          6133,
          6143,
          6151,
          6163,
          6173,
          6197,
          6199,
          6203,
          6211,
          6217,
          6221,
          6229,
          6247,
          6257,
          6263,
          6269,
          6271,
          6277,
          6287,
          6299,
          6301,
          6311,
          6317,
          6323,
          6329,
          6337,
          6343,
          6353,
          6359,
          6361,
          6367,
          6373,
          6379,
          6389,
          6397,
          6421,
          6427,
          6449,
          6451,
          6469,
          6473,
          6481,
          6491,
          6521,
          6529,
          6547,
          6551,
          6553,
          6563,
          6569,
          6571,
          6577,
          6581,
          6599,
          6607,
          6619,
          6637,
          6653,
          6659,
          6661,
          6673,
          6679,
          6689,
          6691,
          6701,
          6703,
          6709,
          6719,
          6733,
          6737,
          6761,
          6763,
          6779,
          6781,
          6791,
          6793,
          6803,
          6823,
          6827,
          6829,
          6833,
          6841,
          6857,
          6863,
          6869,
          6871,
          6883,
          6899,
          6907,
          6911,
          6917,
          6947,
          6949,
          6959,
          6961,
          6967,
          6971,
          6977,
          6983,
          6991,
          6997,
          7001,
          7013,
          7019,
          7027,
          7039,
          7043,
          7057,
          7069,
          7079,
          7103,
          7109,
          7121,
          7127,
          7129,
          7151,
          7159,
          7177,
          7187,
          7193,
          7207,
          7211,
          7213,
          7219,
          7229,
          7237,
          7243,
          7247,
          7253,
          7283,
          7297,
          7307,
          7309,
          7321,
          7331,
          7333,
          7349,
          7351,
          7369,
          7393,
          7411,
          7417,
          7433,
          7451,
          7457,
          7459,
          7477,
          7481,
          7487,
          7489,
          7499,
          7507,
          7517,
          7523,
          7529,
          7537,
          7541,
          7547,
          7549,
          7559,
          7561,
          7573,
          7577,
          7583,
          7589,
          7591,
          7603,
          7607,
          7621,
          7639,
          7643,
          7649,
          7669,
          7673,
          7681,
          7687,
          7691,
          7699,
          7703,
          7717,
          7723,
          7727,
          7741,
          7753,
          7757,
          7759,
          7789,
          7793,
          7817,
          7823,
          7829,
          7841,
          7853,
          7867,
          7873,
          7877,
          7879,
          7883,
          7901,
          7907,
          7919,
          7927,
          7933,
          7937,
          7949,
          7951,
          7963,
          7993,
          8009,
          8011,
          8017,
          8039,
          8053,
          8059,
          8069,
          8081,
          8087,
          8089,
          8093,
          8101,
          8111,
          8117,
          8123,
          8147,
          8161,
          8167,
          8171,
          8179,
          8191,
          8209,
          8219,
          8221,
          8231,
          8233,
          8237,
          8243,
          8263,
          8269,
          8273,
          8287,
          8291,
          8293,
          8297,
          8311,
          8317,
          8329,
          8353,
          8363,
          8369,
          8377,
          8387,
          8389,
          8419,
          8423,
          8429,
          8431,
          8443,
          8447,
          8461,
          8467,
          8501,
          8513,
          8521,
          8527,
          8537,
          8539,
          8543,
          8563,
          8573,
          8581,
          8597,
          8599,
          8609,
          8623,
          8627,
          8629,
          8641,
          8647,
          8663,
          8669,
          8677,
          8681,
          8689,
          8693,
          8699,
          8707,
          8713,
          8719,
          8731,
          8737,
          8741,
          8747,
          8753,
          8761,
          8779,
          8783,
          8803,
          8807,
          8819,
          8821,
          8831,
          8837,
          8839,
          8849,
          8861,
          8863,
          8867,
          8887,
          8893,
          8923,
          8929,
          8933,
          8941,
          8951,
          8963,
          8969,
          8971,
          8999,
          9001,
          9007,
          9011,
          9013,
          9029,
          9041,
          9043,
          9049,
          9059,
          9067,
          9091,
          9103,
          9109,
          9127,
          9133,
          9137,
          9151,
          9157,
          9161,
          9173,
          9181,
          9187,
          9199,
          9203,
          9209,
          9221,
          9227,
          9239,
          9241,
          9257,
          9277,
          9281,
          9283,
          9293,
          9311,
          9319,
          9323,
          9337,
          9341,
          9343,
          9349,
          9371,
          9377,
          9391,
          9397,
          9403,
          9413,
          9419,
          9421,
          9431,
          9433,
          9437,
          9439,
          9461,
          9463,
          9467,
          9473,
          9479,
          9491,
          9497,
          9511,
          9521,
          9533,
          9539,
          9547,
          9551,
          9587,
          9601,
          9613,
          9619,
          9623,
          9629,
          9631,
          9643,
          9649,
          9661,
          9677,
          9679,
          9689,
          9697,
          9719,
          9721,
          9733,
          9739,
          9743,
          9749,
          9767,
          9769,
          9781,
          9787,
          9791,
          9803,
          9811,
          9817,
          9829,
          9833,
          9839,
          9851,
          9857,
          9859,
          9871,
          9883,
          9887,
          9901,
          9907,
          9923,
          9929,
          9931,
          9941,
          9949,
          9967,
          9973,
          10007
        ],
        emotions: [
          "love",
          "joy",
          "surprise",
          "anger",
          "sadness",
          "fear"
        ],
        music_genres: {
          general: [
            "Rock",
            "Pop",
            "Hip-Hop",
            "Jazz",
            "Classical",
            "Electronic",
            "Country",
            "R&B",
            "Reggae",
            "Blues",
            "Metal",
            "Folk",
            "Alternative",
            "Punk",
            "Disco",
            "Funk",
            "Techno",
            "Indie",
            "Gospel",
            "Dance",
            "Children's",
            "World"
          ],
          alternative: [
            "Art Punk",
            "Alternative Rock",
            "Britpunk",
            "College Rock",
            "Crossover Thrash",
            "Crust Punk",
            "Emo / Emocore",
            "Experimental Rock",
            "Folk Punk",
            "Goth / Gothic Rock",
            "Grunge",
            "Hardcore Punk",
            "Hard Rock",
            "Indie Rock",
            "Lo-fi",
            "Musique Concr\xE8te",
            "New Wave",
            "Progressive Rock",
            "Punk",
            "Shoegaze",
            "Steampunk"
          ],
          blues: [
            "Acoustic Blues",
            "African Blues",
            "Blues Rock",
            "Blues Shouter",
            "British Blues",
            "Canadian Blues",
            "Chicago Blues",
            "Classic Blues",
            "Classic Female Blues",
            "Contemporary Blues",
            "Country Blues",
            "Dark Blues",
            "Delta Blues",
            "Detroit Blues",
            "Doom Blues",
            "Electric Blues",
            "Folk Blues",
            "Gospel Blues",
            "Harmonica Blues",
            "Hill Country Blues",
            "Hokum Blues",
            "Jazz Blues",
            "Jump Blues",
            "Kansas City Blues",
            "Louisiana Blues",
            "Memphis Blues",
            "Modern Blues",
            "New Orlean Blues",
            "NY Blues",
            "Piano Blues",
            "Piedmont Blues",
            "Punk Blues",
            "Ragtime Blues",
            "Rhythm Blues",
            "Soul Blues",
            "St.Louis Blues",
            "Soul Blues",
            "Swamp Blues",
            "Texas Blues",
            "Urban Blues",
            "Vandeville",
            "West Coast Blues"
          ],
          "children's": [
            "Lullabies",
            "Sing - Along",
            "Stories"
          ],
          classical: [
            "Avant-Garde",
            "Ballet",
            "Baroque",
            "Cantata",
            "Chamber Music",
            "String Quartet",
            "Chant",
            "Choral",
            "Classical Crossover",
            "Concerto",
            "Concerto Grosso",
            "Contemporary Classical",
            "Early Music",
            "Expressionist",
            "High Classical",
            "Impressionist",
            "Mass Requiem",
            "Medieval",
            "Minimalism",
            "Modern Composition",
            "Modern Classical",
            "Opera",
            "Oratorio",
            "Orchestral",
            "Organum",
            "Renaissance",
            "Romantic (early period)",
            "Romantic (later period)",
            "Sonata",
            "Symphonic",
            "Symphony",
            "Twelve-tone",
            "Wedding Music"
          ],
          country: [
            "Alternative Country",
            "Americana",
            "Australian Country",
            "Bakersfield Sound",
            "Bluegrass",
            "Blues Country",
            "Cajun Fiddle Tunes",
            "Christian Country",
            "Classic Country",
            "Close Harmony",
            "Contemporary Bluegrass",
            "Contemporary Country",
            "Country Gospel",
            "Country Pop",
            "Country Rap",
            "Country Rock",
            "Country Soul",
            "Cowboy / Western",
            "Cowpunk",
            "Dansband",
            "Honky Tonk",
            "Franco-Country",
            "Gulf and Western",
            "Hellbilly Music",
            "Honky Tonk",
            "Instrumental Country",
            "Lubbock Sound",
            "Nashville Sound",
            "Neotraditional Country",
            "Outlaw Country",
            "Progressive",
            "Psychobilly / Punkabilly",
            "Red Dirt",
            "Sertanejo",
            "Texas County",
            "Traditional Bluegrass",
            "Traditional Country",
            "Truck-Driving Country",
            "Urban Cowboy",
            "Western Swing"
          ],
          dance: [
            "Club / Club Dance",
            "Breakcore",
            "Breakbeat / Breakstep",
            "Chillstep",
            "Deep House",
            "Dubstep",
            "Dancehall",
            "Electro House",
            "Electroswing",
            "Exercise",
            "Future Garage",
            "Garage",
            "Glitch Hop",
            "Glitch Pop",
            "Grime",
            "Hardcore",
            "Hard Dance",
            "Hi-NRG / Eurodance",
            "Horrorcore",
            "House",
            "Jackin House",
            "Jungle / Drum n bass",
            "Liquid Dub",
            "Regstep",
            "Speedcore",
            "Techno",
            "Trance",
            "Trap"
          ],
          electronic: [
            "2-Step",
            "8bit",
            "Ambient",
            "Asian Underground",
            "Bassline",
            "Chillwave",
            "Chiptune",
            "Crunk",
            "Downtempo",
            "Drum & Bass",
            "Hard Step",
            "Electro",
            "Electro-swing",
            "Electroacoustic",
            "Electronica",
            "Electronic Rock",
            "Eurodance",
            "Hardstyle",
            "Hi-Nrg",
            "IDM/Experimental",
            "Industrial",
            "Trip Hop",
            "Vaporwave",
            "UK Garage",
            "House",
            "Dubstep",
            "Deep House",
            "EDM",
            "Future Bass",
            "Psychedelic trance"
          ],
          jazz: [
            "Acid Jazz",
            "Afro-Cuban Jazz",
            "Avant-Garde Jazz",
            "Bebop",
            "Big Band",
            "Blue Note",
            "British Dance Band (Jazz)",
            "Cape Jazz",
            "Chamber Jazz",
            "Contemporary Jazz",
            "Continental Jazz",
            "Cool Jazz",
            "Crossover Jazz",
            "Dark Jazz",
            "Dixieland",
            "Early Jazz",
            "Electro Swing (Jazz)",
            "Ethio-jazz",
            "Ethno-Jazz",
            "European Free Jazz",
            "Free Funk (Avant-Garde / Funk Jazz)",
            "Free Jazz",
            "Fusion",
            "Gypsy Jazz",
            "Hard Bop",
            "Indo Jazz",
            "Jazz Blues",
            "Jazz-Funk (see Free Funk)",
            "Jazz-Fusion",
            "Jazz Rap",
            "Jazz Rock",
            "Kansas City Jazz",
            "Latin Jazz",
            "M-Base Jazz",
            "Mainstream Jazz",
            "Modal Jazz",
            "Neo-Bop",
            "Neo-Swing",
            "Nu Jazz",
            "Orchestral Jazz",
            "Post-Bop",
            "Punk Jazz",
            "Ragtime",
            "Ska Jazz",
            "Skiffle (also Folk)",
            "Smooth Jazz",
            "Soul Jazz",
            "Swing Jazz",
            "Straight-Ahead Jazz",
            "Trad Jazz",
            "Third Stream",
            "Jazz-Funk",
            "Free Jazz",
            "West Coast Jazz"
          ],
          metal: [
            "Heavy Metal",
            "Speed Metal",
            "Thrash Metal",
            "Power Metal",
            "Death Metal",
            "Black Metal",
            "Pagan Metal",
            "Viking Metal",
            "Folk Metal",
            "Symphonic Metal",
            "Gothic Metal",
            "Glam Metal",
            "Hair Metal",
            "Doom Metal",
            "Groove Metal",
            "Industrial Metal",
            "Modern Metal",
            "Neoclassical Metal",
            "New Wave Of British Heavy Metal",
            "Post Metal",
            "Progressive Metal",
            "Avantgarde Metal",
            "Sludge",
            "Djent",
            "Drone",
            "Kawaii Metal",
            "Pirate Metal",
            "Nu Metal",
            "Neue Deutsche H\xE4rte",
            "Math Metal",
            "Crossover",
            "Grindcore",
            "Hardcore",
            "Metalcore",
            "Deathcore",
            "Post Hardcore",
            "Mathcore"
          ],
          folk: [
            "American Folk Revival",
            "Anti - Folk",
            "British Folk Revival",
            "Contemporary Folk",
            "Filk Music",
            "Freak Folk",
            "Indie Folk",
            "Industrial Folk",
            "Neofolk",
            "Progressive Folk",
            "Psychedelic Folk",
            "Sung Poetry",
            "Techno - Folk",
            "Folk Rock",
            "Old-time Music",
            "Bluegrass",
            "Appalachian",
            "Roots Revival",
            "Celtic",
            "Indie Folk"
          ],
          pop: [
            "Adult Contemporary",
            "Arab Pop",
            "Baroque",
            "Britpop",
            "Bubblegum Pop",
            "Chamber Pop",
            "Chanson",
            "Christian Pop",
            "Classical Crossover",
            "Europop",
            "Austropop",
            "Balkan Pop",
            "French Pop",
            "Korean Pop",
            "Japanese Pop",
            "Chinese Pop",
            "Latin Pop",
            "La\xEFk\xF3",
            "Nederpop",
            "Russian Pop",
            "Dance Pop",
            "Dream Pop",
            "Electro Pop",
            "Iranian Pop",
            "Jangle Pop",
            "Latin Ballad",
            "Levenslied",
            "Louisiana Swamp Pop",
            "Mexican Pop",
            "Motorpop",
            "New Romanticism",
            "Orchestral Pop",
            "Pop Rap",
            "Popera",
            "Pop / Rock",
            "Pop Punk",
            "Power Pop",
            "Psychedelic Pop",
            "Russian Pop",
            "Schlager",
            "Soft Rock",
            "Sophisti - Pop",
            "Space Age Pop",
            "Sunshine Pop",
            "Surf Pop",
            "Synthpop",
            "Teen Pop",
            "Traditional Pop Music",
            "Turkish Pop",
            "Vispop",
            "Wonky Pop"
          ],
          "r&b": [
            "(Carolina) Beach Music",
            "Contemporary R & B",
            "Disco",
            "Doo Wop",
            "Funk",
            "Modern Soul",
            "Motown",
            "Neo - Soul",
            "Northern Soul",
            "Psychedelic Soul",
            "Quiet Storm",
            "Soul",
            "Soul Blues",
            "Southern Soul"
          ],
          reggae: [
            "2 - Tone",
            "Dub",
            "Roots Reggae",
            "Reggae Fusion",
            "Reggae en Espa\xF1ol",
            "Spanish Reggae",
            "Reggae 110",
            "Reggae Bultr\xF3n",
            "Romantic Flow",
            "Lovers Rock",
            "Raggamuffin",
            "Ragga",
            "Dancehall",
            "Ska"
          ],
          rock: [
            "Acid Rock",
            "Adult - Oriented Rock",
            "Afro Punk",
            "Adult Alternative",
            "Alternative Rock",
            "American Traditional Rock",
            "Anatolian Rock",
            "Arena Rock",
            "Art Rock",
            "Blues - Rock",
            "British Invasion",
            "Cock Rock",
            "Death Metal / Black Metal",
            "Doom Metal",
            "Glam Rock",
            "Gothic Metal",
            "Grind Core",
            "Hair Metal",
            "Hard Rock",
            "Math Metal",
            "Math Rock",
            "Metal",
            "Metal Core",
            "Noise Rock",
            "Jam Bands",
            "Post Punk",
            "Post Rock",
            "Prog - Rock / Art Rock",
            "Progressive Metal",
            "Psychedelic",
            "Rock & Roll",
            "Rockabilly",
            "Roots Rock",
            "Singer / Songwriter",
            "Southern Rock",
            "Spazzcore",
            "Stoner Metal",
            "Surf",
            "Technical Death Metal",
            "Tex - Mex",
            "Thrash Metal",
            "Time Lord Rock(Trock)",
            "Trip - hop",
            "Yacht Rock",
            "School House Rock"
          ],
          "hip-hop": [
            "Alternative Rap",
            "Avant - Garde",
            "Bounce",
            "Chap Hop",
            "Christian Hip Hop",
            "Conscious Hip Hop",
            "Country - Rap",
            "Grunk",
            "Crunkcore",
            "Cumbia Rap",
            "Dirty South",
            "East Coast",
            "Brick City Club",
            "Hardcore Hip Hop",
            "Mafioso Rap",
            "New Jersey Hip Hop",
            "Freestyle Rap",
            "G - Funk",
            "Gangsta Rap",
            "Golden Age",
            "Grime",
            "Hardcore Rap",
            "Hip - Hop",
            "Hip Pop",
            "Horrorcore",
            "Hyphy",
            "Industrial Hip Hop",
            "Instrumental Hip Hop",
            "Jazz Rap",
            "Latin Rap",
            "Low Bap",
            "Lyrical Hip Hop",
            "Merenrap",
            "Midwest Hip Hop",
            "Chicago Hip Hop",
            "Detroit Hip Hop",
            "Horrorcore",
            "St.Louis Hip Hop",
            "Twin Cities Hip Hop",
            "Motswako",
            "Nerdcore",
            "New Jack Swing",
            "New School Hip Hop",
            "Old School Rap",
            "Rap",
            "Trap",
            "Turntablism",
            "Underground Rap",
            "West Coast Rap",
            "East Coast Rap",
            "Trap",
            "UK Grime",
            "Hyphy",
            "Emo-rap",
            "Cloud rap",
            "G-funk",
            "Boom Bap",
            "Mumble",
            "Drill",
            "UK Drill",
            "Soundcloud Rap",
            "Lo-fi"
          ],
          punk: [
            "Afro-punk",
            "Anarcho punk",
            "Art punk",
            "Christian punk",
            "Crust punk",
            "Deathrock",
            "Egg punk",
            "Garage punk",
            "Glam punk",
            "Hardcore punk",
            "Horror punk",
            "Incelcore/e-punk",
            "Oi!",
            "Peace punk",
            "Punk pathetique",
            "Queercore",
            "Riot Grrrl",
            "Skate punk",
            "Street punk",
            "Taqwacore",
            "Trallpunk"
          ],
          disco: [
            "Nu-disco",
            "Disco-funk",
            "Hi-NRG",
            "Italo Disco",
            "Eurodisco",
            "Boogie",
            "Space Disco",
            "Post-disco",
            "Electro Disco",
            "Disco House",
            "Disco Pop",
            "Soulful House"
          ],
          funk: [
            "Funk Rock",
            "P-Funk (Parliament-Funkadelic)",
            "Psychedelic Funk",
            "Funk Metal",
            "Electro-Funk",
            "Go-go",
            "Boogie-Funk",
            "Jazz-Funk",
            "Soul-Funk",
            "Funky Disco",
            "Nu-Funk",
            "Afrobeat",
            "Latin Funk",
            "G-Funk",
            "Acid Jazz",
            "Funktronica",
            "Folk-Funk",
            "Space Funk",
            "Ambient Funk",
            "Hard Funk",
            "Fusion Funk"
          ],
          techno: [
            "Acid Techno",
            "Ambient Techno",
            "Detroit Techno",
            "Dub Techno",
            "Minimal Techno",
            "Industrial Techno",
            "Hard Techno",
            "Trance",
            "Progressive Techno",
            "Tech House",
            "Electronica",
            "Breakbeat Techno",
            "Electro Techno",
            "Melodic Techno",
            "Experimental Techno",
            "Dark Techno",
            "Ebm",
            "Hypnotic Techno",
            "Psychedelic Techno",
            "Rave Techno",
            "Techno-Pop"
          ],
          indie: [
            "Indie Rock",
            "Indie Pop",
            "Indie Folk",
            "Indie Electronic",
            "Indie Punk",
            "Indie Hip-Hop",
            "Dream Pop",
            "Shoegaze",
            "Lo-fi",
            "Chillwave",
            "Freak Folk",
            "Noise Pop",
            "Math Rock",
            "Post-Punk",
            "Garage Rock",
            "Experimental Indie",
            "Surf Rock",
            "Alternative Country",
            "Indie Soul",
            "Art Rock",
            "Indie R&B",
            "Indietronica",
            "Emo",
            "Post-Rock",
            "Indie Pop-Rock",
            "Indie Synthpop",
            "Noise Rock",
            "Psych Folk",
            "Indie Blues"
          ],
          gospel: [
            "Traditional Gospel",
            "Contemporary Gospel",
            "Southern Gospel",
            "Black Gospel",
            "Urban Contemporary Gospel",
            "Gospel Blues",
            "Bluegrass Gospel",
            "Country Gospel",
            "Praise and Worship",
            "Christian Hip-Hop",
            "Gospel Jazz",
            "Reggae Gospel",
            "African Gospel",
            "Latin Gospel",
            "R&B Gospel",
            "Gospel Choir",
            "Acappella Gospel",
            "Instrumental Gospel",
            "Gospel Rap"
          ],
          world: [
            "African",
            "Arabic",
            "Asian",
            "Caribbean",
            "Celtic",
            "European",
            "Latin American",
            "Middle Eastern",
            "Native American",
            "Polynesian",
            "Reggae",
            "Ska",
            "Salsa",
            "Flamenco",
            "Bossa Nova",
            "Tango",
            "Fado",
            "Klezmer",
            "Balkan",
            "Afrobeat",
            "Mongolian Throat Singing",
            "Indian Classical",
            "Gamelan",
            "Sufi Music",
            "Zydeco",
            "Kora Music",
            "Andean Music",
            "Irish Traditional",
            "Gypsy Jazz",
            "Bollywood",
            "Bhangra",
            "Jawaiian",
            "Hawaiian Slack Key Guitar",
            "Calypso",
            "Cuban Son",
            "Taiko Drumming",
            "African Highlife",
            "Merengue",
            "Tuvan Throat Singing"
          ]
        },
        // Data sourced from https://unicode.org/emoji/charts/full-emoji-list.html
        emojis: {
          smileys_and_emotion: [
            "0x1f600",
            "0x1f603",
            "0x1f604",
            "0x1f601",
            "0x1f606",
            "0x1f605",
            "0x1f923",
            "0x1f602",
            "0x1f642",
            "0x1f643",
            "0x1fae0",
            "0x1f609",
            "0x1f60a",
            "0x1f607",
            "0x1f970",
            "0x1f60d",
            "0x1f929",
            "0x1f618",
            "0x1f617",
            "0x263a",
            "0x1f61a",
            "0x1f619",
            "0x1f972",
            "0x1f60b",
            "0x1f61b",
            "0x1f61c",
            "0x1f92a",
            "0x1f61d",
            "0x1f911",
            "0x1f917",
            "0x1f92d",
            "0x1fae2",
            "0x1fae3",
            "0x1f92b",
            "0x1f914",
            "0x1fae1",
            "0x1f910",
            "0x1f928",
            "0x1f610",
            "0x1f611",
            "0x1f636",
            "0x1fae5",
            "0x1f636",
            "0x200d",
            "0x1f32b",
            "0xfe0f",
            "0x1f60f",
            "0x1f612",
            "0x1f644",
            "0x1f62c",
            "0x1f62e",
            "0x200d",
            "0x1f4a8",
            "0x1f925",
            "0x1fae8",
            "0x1f642",
            "0x200d",
            "0x2194",
            "0xfe0f",
            "0x1f642",
            "0x200d",
            "0x2195",
            "0xfe0f",
            "0x1f60c",
            "0x1f614",
            "0x1f62a",
            "0x1f924",
            "0x1f634",
            "0x1f637",
            "0x1f912",
            "0x1f915",
            "0x1f922",
            "0x1f92e",
            "0x1f927",
            "0x1f975",
            "0x1f976",
            "0x1f974",
            "0x1f635",
            "0x1f635",
            "0x200d",
            "0x1f4ab",
            "0x1f92f",
            "0x1f920",
            "0x1f973",
            "0x1f978",
            "0x1f60e",
            "0x1f913",
            "0x1f9d0",
            "0x1f615",
            "0x1fae4",
            "0x1f61f",
            "0x1f641",
            "0x2639",
            "0x1f62e",
            "0x1f62f",
            "0x1f632",
            "0x1f633",
            "0x1f97a",
            "0x1f979",
            "0x1f626",
            "0x1f627",
            "0x1f628",
            "0x1f630",
            "0x1f625",
            "0x1f622",
            "0x1f62d",
            "0x1f631",
            "0x1f616",
            "0x1f623",
            "0x1f61e",
            "0x1f613",
            "0x1f629",
            "0x1f62b",
            "0x1f971",
            "0x1f624",
            "0x1f621",
            "0x1f620",
            "0x1f92c",
            "0x1f608",
            "0x1f47f",
            "0x1f480",
            "0x2620",
            "0x1f4a9",
            "0x1f921",
            "0x1f479",
            "0x1f47a",
            "0x1f47b",
            "0x1f47d",
            "0x1f47e",
            "0x1f916",
            "0x1f63a",
            "0x1f638",
            "0x1f639",
            "0x1f63b",
            "0x1f63c",
            "0x1f63d",
            "0x1f640",
            "0x1f63f",
            "0x1f63e",
            "0x1f648",
            "0x1f649",
            "0x1f64a",
            "0x1f48c",
            "0x1f498",
            "0x1f49d",
            "0x1f496",
            "0x1f497",
            "0x1f493",
            "0x1f49e",
            "0x1f495",
            "0x1f49f",
            "0x2763",
            "0x1f494",
            "0x2764",
            "0xfe0f",
            "0x200d",
            "0x1f525",
            "0x2764",
            "0xfe0f",
            "0x200d",
            "0x1fa79",
            "0x2764",
            "0x1fa77",
            "0x1f9e1",
            "0x1f49b",
            "0x1f49a",
            "0x1f499",
            "0x1fa75",
            "0x1f49c",
            "0x1f90e",
            "0x1f5a4",
            "0x1fa76",
            "0x1f90d",
            "0x1f48b",
            "0x1f4af",
            "0x1f4a2",
            "0x1f4a5",
            "0x1f4ab",
            "0x1f4a6",
            "0x1f4a8",
            "0x1f573",
            "0x1f4ac",
            "0x1f441",
            "0xfe0f",
            "0x200d",
            "0x1f5e8",
            "0xfe0f",
            "0x1f5e8",
            "0x1f5ef",
            "0x1f4ad",
            "0x1f4a4"
          ],
          people_and_body: [
            "0x1f44b",
            "0x1f91a",
            "0x1f590",
            "0x270b",
            "0x1f596",
            "0x1faf1",
            "0x1faf2",
            "0x1faf3",
            "0x1faf4",
            "0x1faf7",
            "0x1faf8",
            "0x1f44c",
            "0x1f90c",
            "0x1f90f",
            "0x270c",
            "0x1f91e",
            "0x1faf0",
            "0x1f91f",
            "0x1f918",
            "0x1f919",
            "0x1f448",
            "0x1f449",
            "0x1f446",
            "0x1f595",
            "0x1f447",
            "0x261d",
            "0x1faf5",
            "0x1f44d",
            "0x1f44e",
            "0x270a",
            "0x1f44a",
            "0x1f91b",
            "0x1f91c",
            "0x1f44f",
            "0x1f64c",
            "0x1faf6",
            "0x1f450",
            "0x1f932",
            "0x1f91d",
            "0x1f64f",
            "0x270d",
            "0x1f485",
            "0x1f933",
            "0x1f4aa",
            "0x1f9be",
            "0x1f9bf",
            "0x1f9b5",
            "0x1f9b6",
            "0x1f442",
            "0x1f9bb",
            "0x1f443",
            "0x1f9e0",
            "0x1fac0",
            "0x1fac1",
            "0x1f9b7",
            "0x1f9b4",
            "0x1f440",
            "0x1f441",
            "0x1f445",
            "0x1f444",
            "0x1fae6",
            "0x1f476",
            "0x1f9d2",
            "0x1f466",
            "0x1f467",
            "0x1f9d1",
            "0x1f471",
            "0x1f468",
            "0x1f9d4",
            "0x1f9d4",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9d4",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f468",
            "0x200d",
            "0x1f9b0",
            "0x1f468",
            "0x200d",
            "0x1f9b1",
            "0x1f468",
            "0x200d",
            "0x1f9b3",
            "0x1f468",
            "0x200d",
            "0x1f9b2",
            "0x1f469",
            "0x1f469",
            "0x200d",
            "0x1f9b0",
            "0x1f9d1",
            "0x200d",
            "0x1f9b0",
            "0x1f469",
            "0x200d",
            "0x1f9b1",
            "0x1f9d1",
            "0x200d",
            "0x1f9b1",
            "0x1f469",
            "0x200d",
            "0x1f9b3",
            "0x1f9d1",
            "0x200d",
            "0x1f9b3",
            "0x1f469",
            "0x200d",
            "0x1f9b2",
            "0x1f9d1",
            "0x200d",
            "0x1f9b2",
            "0x1f471",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f471",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9d3",
            "0x1f474",
            "0x1f475",
            "0x1f64d",
            "0x1f64d",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f64d",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f64e",
            "0x1f64e",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f64e",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f645",
            "0x1f645",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f645",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f646",
            "0x1f646",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f646",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f481",
            "0x1f481",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f481",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f64b",
            "0x1f64b",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f64b",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9cf",
            "0x1f9cf",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9cf",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f647",
            "0x1f647",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f647",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f926",
            "0x1f926",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f926",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f937",
            "0x1f937",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f937",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9d1",
            "0x200d",
            "0x2695",
            "0xfe0f",
            "0x1f468",
            "0x200d",
            "0x2695",
            "0xfe0f",
            "0x1f469",
            "0x200d",
            "0x2695",
            "0xfe0f",
            "0x1f9d1",
            "0x200d",
            "0x1f393",
            "0x1f468",
            "0x200d",
            "0x1f393",
            "0x1f469",
            "0x200d",
            "0x1f393",
            "0x1f9d1",
            "0x200d",
            "0x1f3eb",
            "0x1f468",
            "0x200d",
            "0x1f3eb",
            "0x1f469",
            "0x200d",
            "0x1f3eb",
            "0x1f9d1",
            "0x200d",
            "0x2696",
            "0xfe0f",
            "0x1f468",
            "0x200d",
            "0x2696",
            "0xfe0f",
            "0x1f469",
            "0x200d",
            "0x2696",
            "0xfe0f",
            "0x1f9d1",
            "0x200d",
            "0x1f33e",
            "0x1f468",
            "0x200d",
            "0x1f33e",
            "0x1f469",
            "0x200d",
            "0x1f33e",
            "0x1f9d1",
            "0x200d",
            "0x1f373",
            "0x1f468",
            "0x200d",
            "0x1f373",
            "0x1f469",
            "0x200d",
            "0x1f373",
            "0x1f9d1",
            "0x200d",
            "0x1f527",
            "0x1f468",
            "0x200d",
            "0x1f527",
            "0x1f469",
            "0x200d",
            "0x1f527",
            "0x1f9d1",
            "0x200d",
            "0x1f3ed",
            "0x1f468",
            "0x200d",
            "0x1f3ed",
            "0x1f469",
            "0x200d",
            "0x1f3ed",
            "0x1f9d1",
            "0x200d",
            "0x1f4bc",
            "0x1f468",
            "0x200d",
            "0x1f4bc",
            "0x1f469",
            "0x200d",
            "0x1f4bc",
            "0x1f9d1",
            "0x200d",
            "0x1f52c",
            "0x1f468",
            "0x200d",
            "0x1f52c",
            "0x1f469",
            "0x200d",
            "0x1f52c",
            "0x1f9d1",
            "0x200d",
            "0x1f4bb",
            "0x1f468",
            "0x200d",
            "0x1f4bb",
            "0x1f469",
            "0x200d",
            "0x1f4bb",
            "0x1f9d1",
            "0x200d",
            "0x1f3a4",
            "0x1f468",
            "0x200d",
            "0x1f3a4",
            "0x1f469",
            "0x200d",
            "0x1f3a4",
            "0x1f9d1",
            "0x200d",
            "0x1f3a8",
            "0x1f468",
            "0x200d",
            "0x1f3a8",
            "0x1f469",
            "0x200d",
            "0x1f3a8",
            "0x1f9d1",
            "0x200d",
            "0x2708",
            "0xfe0f",
            "0x1f468",
            "0x200d",
            "0x2708",
            "0xfe0f",
            "0x1f469",
            "0x200d",
            "0x2708",
            "0xfe0f",
            "0x1f9d1",
            "0x200d",
            "0x1f680",
            "0x1f468",
            "0x200d",
            "0x1f680",
            "0x1f469",
            "0x200d",
            "0x1f680",
            "0x1f9d1",
            "0x200d",
            "0x1f692",
            "0x1f468",
            "0x200d",
            "0x1f692",
            "0x1f469",
            "0x200d",
            "0x1f692",
            "0x1f46e",
            "0x1f46e",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f46e",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f575",
            "0x1f575",
            "0xfe0f",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f575",
            "0xfe0f",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f482",
            "0x1f482",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f482",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f977",
            "0x1f477",
            "0x1f477",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f477",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1fac5",
            "0x1f934",
            "0x1f478",
            "0x1f473",
            "0x1f473",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f473",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f472",
            "0x1f9d5",
            "0x1f935",
            "0x1f935",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f935",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f470",
            "0x1f470",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f470",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f930",
            "0x1fac3",
            "0x1fac4",
            "0x1f931",
            "0x1f469",
            "0x200d",
            "0x1f37c",
            "0x1f468",
            "0x200d",
            "0x1f37c",
            "0x1f9d1",
            "0x200d",
            "0x1f37c",
            "0x1f47c",
            "0x1f385",
            "0x1f936",
            "0x1f9d1",
            "0x200d",
            "0x1f384",
            "0x1f9b8",
            "0x1f9b8",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9b8",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9b9",
            "0x1f9b9",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9b9",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9d9",
            "0x1f9d9",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9d9",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9da",
            "0x1f9da",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9da",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9db",
            "0x1f9db",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9db",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9dc",
            "0x1f9dc",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9dc",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9dd",
            "0x1f9dd",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9dd",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9de",
            "0x1f9de",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9de",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9df",
            "0x1f9df",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9df",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9cc",
            "0x1f486",
            "0x1f486",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f486",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f487",
            "0x1f487",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f487",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f6b6",
            "0x1f6b6",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f6b6",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f6b6",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f6b6",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f6b6",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f9cd",
            "0x1f9cd",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9cd",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9ce",
            "0x1f9ce",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9ce",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9ce",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f9ce",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f9ce",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f9d1",
            "0x200d",
            "0x1f9af",
            "0x1f9d1",
            "0x200d",
            "0x1f9af",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f468",
            "0x200d",
            "0x1f9af",
            "0x1f468",
            "0x200d",
            "0x1f9af",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f469",
            "0x200d",
            "0x1f9af",
            "0x1f469",
            "0x200d",
            "0x1f9af",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f9d1",
            "0x200d",
            "0x1f9bc",
            "0x1f9d1",
            "0x200d",
            "0x1f9bc",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f468",
            "0x200d",
            "0x1f9bc",
            "0x1f468",
            "0x200d",
            "0x1f9bc",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f469",
            "0x200d",
            "0x1f9bc",
            "0x1f469",
            "0x200d",
            "0x1f9bc",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f9d1",
            "0x200d",
            "0x1f9bd",
            "0x1f9d1",
            "0x200d",
            "0x1f9bd",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f468",
            "0x200d",
            "0x1f9bd",
            "0x1f468",
            "0x200d",
            "0x1f9bd",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f469",
            "0x200d",
            "0x1f9bd",
            "0x1f469",
            "0x200d",
            "0x1f9bd",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f3c3",
            "0x1f3c3",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f3c3",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f3c3",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f3c3",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f3c3",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x200d",
            "0x27a1",
            "0xfe0f",
            "0x1f483",
            "0x1f57a",
            "0x1f574",
            "0x1f46f",
            "0x1f46f",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f46f",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9d6",
            "0x1f9d6",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9d6",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9d7",
            "0x1f9d7",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9d7",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f93a",
            "0x1f3c7",
            "0x26f7",
            "0x1f3c2",
            "0x1f3cc",
            "0x1f3cc",
            "0xfe0f",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f3cc",
            "0xfe0f",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f3c4",
            "0x1f3c4",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f3c4",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f6a3",
            "0x1f6a3",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f6a3",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f3ca",
            "0x1f3ca",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f3ca",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x26f9",
            "0x26f9",
            "0xfe0f",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x26f9",
            "0xfe0f",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f3cb",
            "0x1f3cb",
            "0xfe0f",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f3cb",
            "0xfe0f",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f6b4",
            "0x1f6b4",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f6b4",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f6b5",
            "0x1f6b5",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f6b5",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f938",
            "0x1f938",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f938",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f93c",
            "0x1f93c",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f93c",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f93d",
            "0x1f93d",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f93d",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f93e",
            "0x1f93e",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f93e",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f939",
            "0x1f939",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f939",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f9d8",
            "0x1f9d8",
            "0x200d",
            "0x2642",
            "0xfe0f",
            "0x1f9d8",
            "0x200d",
            "0x2640",
            "0xfe0f",
            "0x1f6c0",
            "0x1f6cc",
            "0x1f9d1",
            "0x200d",
            "0x1f91d",
            "0x200d",
            "0x1f9d1",
            "0x1f46d",
            "0x1f46b",
            "0x1f46c",
            "0x1f48f",
            "0x1f469",
            "0x200d",
            "0x2764",
            "0xfe0f",
            "0x200d",
            "0x1f48b",
            "0x200d",
            "0x1f468",
            "0x1f468",
            "0x200d",
            "0x2764",
            "0xfe0f",
            "0x200d",
            "0x1f48b",
            "0x200d",
            "0x1f468",
            "0x1f469",
            "0x200d",
            "0x2764",
            "0xfe0f",
            "0x200d",
            "0x1f48b",
            "0x200d",
            "0x1f469",
            "0x1f491",
            "0x1f469",
            "0x200d",
            "0x2764",
            "0xfe0f",
            "0x200d",
            "0x1f468",
            "0x1f468",
            "0x200d",
            "0x2764",
            "0xfe0f",
            "0x200d",
            "0x1f468",
            "0x1f469",
            "0x200d",
            "0x2764",
            "0xfe0f",
            "0x200d",
            "0x1f469",
            "0x1f468",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x1f468",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f466",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f467",
            "0x1f468",
            "0x200d",
            "0x1f468",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f468",
            "0x200d",
            "0x1f467",
            "0x1f468",
            "0x200d",
            "0x1f468",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f468",
            "0x200d",
            "0x1f466",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f468",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f467",
            "0x1f469",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f466",
            "0x1f469",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x1f469",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f466",
            "0x1f469",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f466",
            "0x200d",
            "0x1f466",
            "0x1f469",
            "0x200d",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f467",
            "0x1f468",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f466",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f467",
            "0x1f468",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f466",
            "0x1f468",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f467",
            "0x1f469",
            "0x200d",
            "0x1f466",
            "0x1f469",
            "0x200d",
            "0x1f466",
            "0x200d",
            "0x1f466",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f466",
            "0x1f469",
            "0x200d",
            "0x1f467",
            "0x200d",
            "0x1f467",
            "0x1f5e3",
            "0x1f464",
            "0x1f465",
            "0x1fac2",
            "0x1f46a",
            "0x1f9d1",
            "0x200d",
            "0x1f9d1",
            "0x200d",
            "0x1f9d2",
            "0x1f9d1",
            "0x200d",
            "0x1f9d1",
            "0x200d",
            "0x1f9d2",
            "0x200d",
            "0x1f9d2",
            "0x1f9d1",
            "0x200d",
            "0x1f9d2",
            "0x1f9d1",
            "0x200d",
            "0x1f9d2",
            "0x200d",
            "0x1f9d2",
            "0x1f463"
          ],
          animals_and_nature: [
            "0x1f435",
            "0x1f412",
            "0x1f98d",
            "0x1f9a7",
            "0x1f436",
            "0x1f415",
            "0x1f9ae",
            "0x1f415",
            "0x200d",
            "0x1f9ba",
            "0x1f429",
            "0x1f43a",
            "0x1f98a",
            "0x1f99d",
            "0x1f431",
            "0x1f408",
            "0x1f408",
            "0x200d",
            "0x2b1b",
            "0x1f981",
            "0x1f42f",
            "0x1f405",
            "0x1f406",
            "0x1f434",
            "0x1face",
            "0x1facf",
            "0x1f40e",
            "0x1f984",
            "0x1f993",
            "0x1f98c",
            "0x1f9ac",
            "0x1f42e",
            "0x1f402",
            "0x1f403",
            "0x1f404",
            "0x1f437",
            "0x1f416",
            "0x1f417",
            "0x1f43d",
            "0x1f40f",
            "0x1f411",
            "0x1f410",
            "0x1f42a",
            "0x1f42b",
            "0x1f999",
            "0x1f992",
            "0x1f418",
            "0x1f9a3",
            "0x1f98f",
            "0x1f99b",
            "0x1f42d",
            "0x1f401",
            "0x1f400",
            "0x1f439",
            "0x1f430",
            "0x1f407",
            "0x1f43f",
            "0x1f9ab",
            "0x1f994",
            "0x1f987",
            "0x1f43b",
            "0x1f43b",
            "0x200d",
            "0x2744",
            "0xfe0f",
            "0x1f428",
            "0x1f43c",
            "0x1f9a5",
            "0x1f9a6",
            "0x1f9a8",
            "0x1f998",
            "0x1f9a1",
            "0x1f43e",
            "0x1f983",
            "0x1f414",
            "0x1f413",
            "0x1f423",
            "0x1f424",
            "0x1f425",
            "0x1f426",
            "0x1f427",
            "0x1f54a",
            "0x1f985",
            "0x1f986",
            "0x1f9a2",
            "0x1f989",
            "0x1f9a4",
            "0x1fab6",
            "0x1f9a9",
            "0x1f99a",
            "0x1f99c",
            "0x1fabd",
            "0x1f426",
            "0x200d",
            "0x2b1b",
            "0x1fabf",
            "0x1f426",
            "0x200d",
            "0x1f525",
            "0x1f438",
            "0x1f40a",
            "0x1f422",
            "0x1f98e",
            "0x1f40d",
            "0x1f432",
            "0x1f409",
            "0x1f995",
            "0x1f996",
            "0x1f433",
            "0x1f40b",
            "0x1f42c",
            "0x1f9ad",
            "0x1f41f",
            "0x1f420",
            "0x1f421",
            "0x1f988",
            "0x1f419",
            "0x1f41a",
            "0x1fab8",
            "0x1fabc",
            "0x1f40c",
            "0x1f98b",
            "0x1f41b",
            "0x1f41c",
            "0x1f41d",
            "0x1fab2",
            "0x1f41e",
            "0x1f997",
            "0x1fab3",
            "0x1f577",
            "0x1f578",
            "0x1f982",
            "0x1f99f",
            "0x1fab0",
            "0x1fab1",
            "0x1f9a0",
            "0x1f490",
            "0x1f338",
            "0x1f4ae",
            "0x1fab7",
            "0x1f3f5",
            "0x1f339",
            "0x1f940",
            "0x1f33a",
            "0x1f33b",
            "0x1f33c",
            "0x1f337",
            "0x1fabb",
            "0x1f331",
            "0x1fab4",
            "0x1f332",
            "0x1f333",
            "0x1f334",
            "0x1f335",
            "0x1f33e",
            "0x1f33f",
            "0x2618",
            "0x1f340",
            "0x1f341",
            "0x1f342",
            "0x1f343",
            "0x1fab9",
            "0x1faba",
            "0x1f344"
          ],
          food_and_drink: [
            "0x1f347",
            "0x1f348",
            "0x1f349",
            "0x1f34a",
            "0x1f34b",
            "0x1f34b",
            "0x200d",
            "0x1f7e9",
            "0x1f34c",
            "0x1f34d",
            "0x1f96d",
            "0x1f34e",
            "0x1f34f",
            "0x1f350",
            "0x1f351",
            "0x1f352",
            "0x1f353",
            "0x1fad0",
            "0x1f95d",
            "0x1f345",
            "0x1fad2",
            "0x1f965",
            "0x1f951",
            "0x1f346",
            "0x1f954",
            "0x1f955",
            "0x1f33d",
            "0x1f336",
            "0x1fad1",
            "0x1f952",
            "0x1f96c",
            "0x1f966",
            "0x1f9c4",
            "0x1f9c5",
            "0x1f95c",
            "0x1fad8",
            "0x1f330",
            "0x1fada",
            "0x1fadb",
            "0x1f344",
            "0x200d",
            "0x1f7eb",
            "0x1f35e",
            "0x1f950",
            "0x1f956",
            "0x1fad3",
            "0x1f968",
            "0x1f96f",
            "0x1f95e",
            "0x1f9c7",
            "0x1f9c0",
            "0x1f356",
            "0x1f357",
            "0x1f969",
            "0x1f953",
            "0x1f354",
            "0x1f35f",
            "0x1f355",
            "0x1f32d",
            "0x1f96a",
            "0x1f32e",
            "0x1f32f",
            "0x1fad4",
            "0x1f959",
            "0x1f9c6",
            "0x1f95a",
            "0x1f373",
            "0x1f958",
            "0x1f372",
            "0x1fad5",
            "0x1f963",
            "0x1f957",
            "0x1f37f",
            "0x1f9c8",
            "0x1f9c2",
            "0x1f96b",
            "0x1f371",
            "0x1f358",
            "0x1f359",
            "0x1f35a",
            "0x1f35b",
            "0x1f35c",
            "0x1f35d",
            "0x1f360",
            "0x1f362",
            "0x1f363",
            "0x1f364",
            "0x1f365",
            "0x1f96e",
            "0x1f361",
            "0x1f95f",
            "0x1f960",
            "0x1f961",
            "0x1f980",
            "0x1f99e",
            "0x1f990",
            "0x1f991",
            "0x1f9aa",
            "0x1f366",
            "0x1f367",
            "0x1f368",
            "0x1f369",
            "0x1f36a",
            "0x1f382",
            "0x1f370",
            "0x1f9c1",
            "0x1f967",
            "0x1f36b",
            "0x1f36c",
            "0x1f36d",
            "0x1f36e",
            "0x1f36f",
            "0x1f37c",
            "0x1f95b",
            "0x2615",
            "0x1fad6",
            "0x1f375",
            "0x1f376",
            "0x1f37e",
            "0x1f377",
            "0x1f378",
            "0x1f379",
            "0x1f37a",
            "0x1f37b",
            "0x1f942",
            "0x1f943",
            "0x1fad7",
            "0x1f964",
            "0x1f9cb",
            "0x1f9c3",
            "0x1f9c9",
            "0x1f9ca",
            "0x1f962",
            "0x1f37d",
            "0x1f374",
            "0x1f944",
            "0x1f52a",
            "0x1fad9",
            "0x1f3fa"
          ],
          travel_and_places: [
            "0x1f30d",
            "0x1f30e",
            "0x1f30f",
            "0x1f310",
            "0x1f5fa",
            "0x1f5fe",
            "0x1f9ed",
            "0x1f3d4",
            "0x26f0",
            "0x1f30b",
            "0x1f5fb",
            "0x1f3d5",
            "0x1f3d6",
            "0x1f3dc",
            "0x1f3dd",
            "0x1f3de",
            "0x1f3df",
            "0x1f3db",
            "0x1f3d7",
            "0x1f9f1",
            "0x1faa8",
            "0x1fab5",
            "0x1f6d6",
            "0x1f3d8",
            "0x1f3da",
            "0x1f3e0",
            "0x1f3e1",
            "0x1f3e2",
            "0x1f3e3",
            "0x1f3e4",
            "0x1f3e5",
            "0x1f3e6",
            "0x1f3e8",
            "0x1f3e9",
            "0x1f3ea",
            "0x1f3eb",
            "0x1f3ec",
            "0x1f3ed",
            "0x1f3ef",
            "0x1f3f0",
            "0x1f492",
            "0x1f5fc",
            "0x1f5fd",
            "0x26ea",
            "0x1f54c",
            "0x1f6d5",
            "0x1f54d",
            "0x26e9",
            "0x1f54b",
            "0x26f2",
            "0x26fa",
            "0x1f301",
            "0x1f303",
            "0x1f3d9",
            "0x1f304",
            "0x1f305",
            "0x1f306",
            "0x1f307",
            "0x1f309",
            "0x2668",
            "0x1f3a0",
            "0x1f6dd",
            "0x1f3a1",
            "0x1f3a2",
            "0x1f488",
            "0x1f3aa",
            "0x1f682",
            "0x1f683",
            "0x1f684",
            "0x1f685",
            "0x1f686",
            "0x1f687",
            "0x1f688",
            "0x1f689",
            "0x1f68a",
            "0x1f69d",
            "0x1f69e",
            "0x1f68b",
            "0x1f68c",
            "0x1f68d",
            "0x1f68e",
            "0x1f690",
            "0x1f691",
            "0x1f692",
            "0x1f693",
            "0x1f694",
            "0x1f695",
            "0x1f696",
            "0x1f697",
            "0x1f698",
            "0x1f699",
            "0x1f6fb",
            "0x1f69a",
            "0x1f69b",
            "0x1f69c",
            "0x1f3ce",
            "0x1f3cd",
            "0x1f6f5",
            "0x1f9bd",
            "0x1f9bc",
            "0x1f6fa",
            "0x1f6b2",
            "0x1f6f4",
            "0x1f6f9",
            "0x1f6fc",
            "0x1f68f",
            "0x1f6e3",
            "0x1f6e4",
            "0x1f6e2",
            "0x26fd",
            "0x1f6de",
            "0x1f6a8",
            "0x1f6a5",
            "0x1f6a6",
            "0x1f6d1",
            "0x1f6a7",
            "0x2693",
            "0x1f6df",
            "0x26f5",
            "0x1f6f6",
            "0x1f6a4",
            "0x1f6f3",
            "0x26f4",
            "0x1f6e5",
            "0x1f6a2",
            "0x2708",
            "0x1f6e9",
            "0x1f6eb",
            "0x1f6ec",
            "0x1fa82",
            "0x1f4ba",
            "0x1f681",
            "0x1f69f",
            "0x1f6a0",
            "0x1f6a1",
            "0x1f6f0",
            "0x1f680",
            "0x1f6f8",
            "0x1f6ce",
            "0x1f9f3",
            "0x231b",
            "0x23f3",
            "0x231a",
            "0x23f0",
            "0x23f1",
            "0x23f2",
            "0x1f570",
            "0x1f55b",
            "0x1f567",
            "0x1f550",
            "0x1f55c",
            "0x1f551",
            "0x1f55d",
            "0x1f552",
            "0x1f55e",
            "0x1f553",
            "0x1f55f",
            "0x1f554",
            "0x1f560",
            "0x1f555",
            "0x1f561",
            "0x1f556",
            "0x1f562",
            "0x1f557",
            "0x1f563",
            "0x1f558",
            "0x1f564",
            "0x1f559",
            "0x1f565",
            "0x1f55a",
            "0x1f566",
            "0x1f311",
            "0x1f312",
            "0x1f313",
            "0x1f314",
            "0x1f315",
            "0x1f316",
            "0x1f317",
            "0x1f318",
            "0x1f319",
            "0x1f31a",
            "0x1f31b",
            "0x1f31c",
            "0x1f321",
            "0x2600",
            "0x1f31d",
            "0x1f31e",
            "0x1fa90",
            "0x2b50",
            "0x1f31f",
            "0x1f320",
            "0x1f30c",
            "0x2601",
            "0x26c5",
            "0x26c8",
            "0x1f324",
            "0x1f325",
            "0x1f326",
            "0x1f327",
            "0x1f328",
            "0x1f329",
            "0x1f32a",
            "0x1f32b",
            "0x1f32c",
            "0x1f300",
            "0x1f308",
            "0x1f302",
            "0x2602",
            "0x2614",
            "0x26f1",
            "0x26a1",
            "0x2744",
            "0x2603",
            "0x26c4",
            "0x2604",
            "0x1f525",
            "0x1f4a7",
            "0x1f30a"
          ],
          activities: [
            "0x1f383",
            "0x1f384",
            "0x1f386",
            "0x1f387",
            "0x1f9e8",
            "0x2728",
            "0x1f388",
            "0x1f389",
            "0x1f38a",
            "0x1f38b",
            "0x1f38d",
            "0x1f38e",
            "0x1f38f",
            "0x1f390",
            "0x1f391",
            "0x1f9e7",
            "0x1f380",
            "0x1f381",
            "0x1f397",
            "0x1f39f",
            "0x1f3ab",
            "0x1f396",
            "0x1f3c6",
            "0x1f3c5",
            "0x1f947",
            "0x1f948",
            "0x1f949",
            "0x26bd",
            "0x26be",
            "0x1f94e",
            "0x1f3c0",
            "0x1f3d0",
            "0x1f3c8",
            "0x1f3c9",
            "0x1f3be",
            "0x1f94f",
            "0x1f3b3",
            "0x1f3cf",
            "0x1f3d1",
            "0x1f3d2",
            "0x1f94d",
            "0x1f3d3",
            "0x1f3f8",
            "0x1f94a",
            "0x1f94b",
            "0x1f945",
            "0x26f3",
            "0x26f8",
            "0x1f3a3",
            "0x1f93f",
            "0x1f3bd",
            "0x1f3bf",
            "0x1f6f7",
            "0x1f94c",
            "0x1f3af",
            "0x1fa80",
            "0x1fa81",
            "0x1f52b",
            "0x1f3b1",
            "0x1f52e",
            "0x1fa84",
            "0x1f3ae",
            "0x1f579",
            "0x1f3b0",
            "0x1f3b2",
            "0x1f9e9",
            "0x1f9f8",
            "0x1fa85",
            "0x1faa9",
            "0x1fa86",
            "0x2660",
            "0x2665",
            "0x2666",
            "0x2663",
            "0x265f",
            "0x1f0cf",
            "0x1f004",
            "0x1f3b4",
            "0x1f3ad",
            "0x1f5bc",
            "0x1f3a8",
            "0x1f9f5",
            "0x1faa1",
            "0x1f9f6",
            "0x1faa2"
          ],
          objects: [
            "0x1f453",
            "0x1f576",
            "0x1f97d",
            "0x1f97c",
            "0x1f9ba",
            "0x1f454",
            "0x1f455",
            "0x1f456",
            "0x1f9e3",
            "0x1f9e4",
            "0x1f9e5",
            "0x1f9e6",
            "0x1f457",
            "0x1f458",
            "0x1f97b",
            "0x1fa71",
            "0x1fa72",
            "0x1fa73",
            "0x1f459",
            "0x1f45a",
            "0x1faad",
            "0x1f45b",
            "0x1f45c",
            "0x1f45d",
            "0x1f6cd",
            "0x1f392",
            "0x1fa74",
            "0x1f45e",
            "0x1f45f",
            "0x1f97e",
            "0x1f97f",
            "0x1f460",
            "0x1f461",
            "0x1fa70",
            "0x1f462",
            "0x1faae",
            "0x1f451",
            "0x1f452",
            "0x1f3a9",
            "0x1f393",
            "0x1f9e2",
            "0x1fa96",
            "0x26d1",
            "0x1f4ff",
            "0x1f484",
            "0x1f48d",
            "0x1f48e",
            "0x1f507",
            "0x1f508",
            "0x1f509",
            "0x1f50a",
            "0x1f4e2",
            "0x1f4e3",
            "0x1f4ef",
            "0x1f514",
            "0x1f515",
            "0x1f3bc",
            "0x1f3b5",
            "0x1f3b6",
            "0x1f399",
            "0x1f39a",
            "0x1f39b",
            "0x1f3a4",
            "0x1f3a7",
            "0x1f4fb",
            "0x1f3b7",
            "0x1fa97",
            "0x1f3b8",
            "0x1f3b9",
            "0x1f3ba",
            "0x1f3bb",
            "0x1fa95",
            "0x1f941",
            "0x1fa98",
            "0x1fa87",
            "0x1fa88",
            "0x1f4f1",
            "0x1f4f2",
            "0x260e",
            "0x1f4de",
            "0x1f4df",
            "0x1f4e0",
            "0x1f50b",
            "0x1faab",
            "0x1f50c",
            "0x1f4bb",
            "0x1f5a5",
            "0x1f5a8",
            "0x2328",
            "0x1f5b1",
            "0x1f5b2",
            "0x1f4bd",
            "0x1f4be",
            "0x1f4bf",
            "0x1f4c0",
            "0x1f9ee",
            "0x1f3a5",
            "0x1f39e",
            "0x1f4fd",
            "0x1f3ac",
            "0x1f4fa",
            "0x1f4f7",
            "0x1f4f8",
            "0x1f4f9",
            "0x1f4fc",
            "0x1f50d",
            "0x1f50e",
            "0x1f56f",
            "0x1f4a1",
            "0x1f526",
            "0x1f3ee",
            "0x1fa94",
            "0x1f4d4",
            "0x1f4d5",
            "0x1f4d6",
            "0x1f4d7",
            "0x1f4d8",
            "0x1f4d9",
            "0x1f4da",
            "0x1f4d3",
            "0x1f4d2",
            "0x1f4c3",
            "0x1f4dc",
            "0x1f4c4",
            "0x1f4f0",
            "0x1f5de",
            "0x1f4d1",
            "0x1f516",
            "0x1f3f7",
            "0x1f4b0",
            "0x1fa99",
            "0x1f4b4",
            "0x1f4b5",
            "0x1f4b6",
            "0x1f4b7",
            "0x1f4b8",
            "0x1f4b3",
            "0x1f9fe",
            "0x1f4b9",
            "0x2709",
            "0x1f4e7",
            "0x1f4e8",
            "0x1f4e9",
            "0x1f4e4",
            "0x1f4e5",
            "0x1f4e6",
            "0x1f4eb",
            "0x1f4ea",
            "0x1f4ec",
            "0x1f4ed",
            "0x1f4ee",
            "0x1f5f3",
            "0x270f",
            "0x2712",
            "0x1f58b",
            "0x1f58a",
            "0x1f58c",
            "0x1f58d",
            "0x1f4dd",
            "0x1f4bc",
            "0x1f4c1",
            "0x1f4c2",
            "0x1f5c2",
            "0x1f4c5",
            "0x1f4c6",
            "0x1f5d2",
            "0x1f5d3",
            "0x1f4c7",
            "0x1f4c8",
            "0x1f4c9",
            "0x1f4ca",
            "0x1f4cb",
            "0x1f4cc",
            "0x1f4cd",
            "0x1f4ce",
            "0x1f587",
            "0x1f4cf",
            "0x1f4d0",
            "0x2702",
            "0x1f5c3",
            "0x1f5c4",
            "0x1f5d1",
            "0x1f512",
            "0x1f513",
            "0x1f50f",
            "0x1f510",
            "0x1f511",
            "0x1f5dd",
            "0x1f528",
            "0x1fa93",
            "0x26cf",
            "0x2692",
            "0x1f6e0",
            "0x1f5e1",
            "0x2694",
            "0x1f4a3",
            "0x1fa83",
            "0x1f3f9",
            "0x1f6e1",
            "0x1fa9a",
            "0x1f527",
            "0x1fa9b",
            "0x1f529",
            "0x2699",
            "0x1f5dc",
            "0x2696",
            "0x1f9af",
            "0x1f517",
            "0x26d3",
            "0xfe0f",
            "0x200d",
            "0x1f4a5",
            "0x26d3",
            "0x1fa9d",
            "0x1f9f0",
            "0x1f9f2",
            "0x1fa9c",
            "0x2697",
            "0x1f9ea",
            "0x1f9eb",
            "0x1f9ec",
            "0x1f52c",
            "0x1f52d",
            "0x1f4e1",
            "0x1f489",
            "0x1fa78",
            "0x1f48a",
            "0x1fa79",
            "0x1fa7c",
            "0x1fa7a",
            "0x1fa7b",
            "0x1f6aa",
            "0x1f6d7",
            "0x1fa9e",
            "0x1fa9f",
            "0x1f6cf",
            "0x1f6cb",
            "0x1fa91",
            "0x1f6bd",
            "0x1faa0",
            "0x1f6bf",
            "0x1f6c1",
            "0x1faa4",
            "0x1fa92",
            "0x1f9f4",
            "0x1f9f7",
            "0x1f9f9",
            "0x1f9fa",
            "0x1f9fb",
            "0x1faa3",
            "0x1f9fc",
            "0x1fae7",
            "0x1faa5",
            "0x1f9fd",
            "0x1f9ef",
            "0x1f6d2",
            "0x1f6ac",
            "0x26b0",
            "0x1faa6",
            "0x26b1",
            "0x1f9ff",
            "0x1faac",
            "0x1f5ff",
            "0x1faa7",
            "0x1faaa"
          ],
          symbols: [
            "0x1f3e7",
            "0x1f6ae",
            "0x1f6b0",
            "0x267f",
            "0x1f6b9",
            "0x1f6ba",
            "0x1f6bb",
            "0x1f6bc",
            "0x1f6be",
            "0x1f6c2",
            "0x1f6c3",
            "0x1f6c4",
            "0x1f6c5",
            "0x26a0",
            "0x1f6b8",
            "0x26d4",
            "0x1f6ab",
            "0x1f6b3",
            "0x1f6ad",
            "0x1f6af",
            "0x1f6b1",
            "0x1f6b7",
            "0x1f4f5",
            "0x1f51e",
            "0x2622",
            "0x2623",
            "0x2b06",
            "0x2197",
            "0x27a1",
            "0x2198",
            "0x2b07",
            "0x2199",
            "0x2b05",
            "0x2196",
            "0x2195",
            "0x2194",
            "0x21a9",
            "0x21aa",
            "0x2934",
            "0x2935",
            "0x1f503",
            "0x1f504",
            "0x1f519",
            "0x1f51a",
            "0x1f51b",
            "0x1f51c",
            "0x1f51d",
            "0x1f6d0",
            "0x269b",
            "0x1f549",
            "0x2721",
            "0x2638",
            "0x262f",
            "0x271d",
            "0x2626",
            "0x262a",
            "0x262e",
            "0x1f54e",
            "0x1f52f",
            "0x1faaf",
            "0x2648",
            "0x2649",
            "0x264a",
            "0x264b",
            "0x264c",
            "0x264d",
            "0x264e",
            "0x264f",
            "0x2650",
            "0x2651",
            "0x2652",
            "0x2653",
            "0x26ce",
            "0x1f500",
            "0x1f501",
            "0x1f502",
            "0x25b6",
            "0x23e9",
            "0x23ed",
            "0x23ef",
            "0x25c0",
            "0x23ea",
            "0x23ee",
            "0x1f53c",
            "0x23eb",
            "0x1f53d",
            "0x23ec",
            "0x23f8",
            "0x23f9",
            "0x23fa",
            "0x23cf",
            "0x1f3a6",
            "0x1f505",
            "0x1f506",
            "0x1f4f6",
            "0x1f6dc",
            "0x1f4f3",
            "0x1f4f4",
            "0x2640",
            "0x2642",
            "0x26a7",
            "0x2716",
            "0x2795",
            "0x2796",
            "0x2797",
            "0x1f7f0",
            "0x267e",
            "0x203c",
            "0x2049",
            "0x2753",
            "0x2754",
            "0x2755",
            "0x2757",
            "0x3030",
            "0x1f4b1",
            "0x1f4b2",
            "0x2695",
            "0x267b",
            "0x269c",
            "0x1f531",
            "0x1f4db",
            "0x1f530",
            "0x2b55",
            "0x2705",
            "0x2611",
            "0x2714",
            "0x274c",
            "0x274e",
            "0x27b0",
            "0x27bf",
            "0x303d",
            "0x2733",
            "0x2734",
            "0x2747",
            "0x00a9",
            "0x00ae",
            "0x2122",
            "0x0023",
            "0xfe0f",
            "0x20e3",
            "0x002a",
            "0xfe0f",
            "0x20e3",
            "0x0030",
            "0xfe0f",
            "0x20e3",
            "0x0031",
            "0xfe0f",
            "0x20e3",
            "0x0032",
            "0xfe0f",
            "0x20e3",
            "0x0033",
            "0xfe0f",
            "0x20e3",
            "0x0034",
            "0xfe0f",
            "0x20e3",
            "0x0035",
            "0xfe0f",
            "0x20e3",
            "0x0036",
            "0xfe0f",
            "0x20e3",
            "0x0037",
            "0xfe0f",
            "0x20e3",
            "0x0038",
            "0xfe0f",
            "0x20e3",
            "0x0039",
            "0xfe0f",
            "0x20e3",
            "0x1f51f",
            "0x1f520",
            "0x1f521",
            "0x1f522",
            "0x1f523",
            "0x1f524",
            "0x1f170",
            "0x1f18e",
            "0x1f171",
            "0x1f191",
            "0x1f192",
            "0x1f193",
            "0x2139",
            "0x1f194",
            "0x24c2",
            "0x1f195",
            "0x1f196",
            "0x1f17e",
            "0x1f197",
            "0x1f17f",
            "0x1f198",
            "0x1f199",
            "0x1f19a",
            "0x1f201",
            "0x1f202",
            "0x1f237",
            "0x1f236",
            "0x1f22f",
            "0x1f250",
            "0x1f239",
            "0x1f21a",
            "0x1f232",
            "0x1f251",
            "0x1f238",
            "0x1f234",
            "0x1f233",
            "0x3297",
            "0x3299",
            "0x1f23a",
            "0x1f235",
            "0x1f534",
            "0x1f7e0",
            "0x1f7e1",
            "0x1f7e2",
            "0x1f535",
            "0x1f7e3",
            "0x1f7e4",
            "0x26ab",
            "0x26aa",
            "0x1f7e5",
            "0x1f7e7",
            "0x1f7e8",
            "0x1f7e9",
            "0x1f7e6",
            "0x1f7ea",
            "0x1f7eb",
            "0x2b1b",
            "0x2b1c",
            "0x25fc",
            "0x25fb",
            "0x25fe",
            "0x25fd",
            "0x25aa",
            "0x25ab",
            "0x1f536",
            "0x1f537",
            "0x1f538",
            "0x1f539",
            "0x1f53a",
            "0x1f53b",
            "0x1f4a0",
            "0x1f518",
            "0x1f533",
            "0x1f532"
          ],
          flags: [
            "0x1f3c1",
            "0x1f6a9",
            "0x1f38c",
            "0x1f3f4",
            "0x1f3f3",
            "0x1f3f3",
            "0xfe0f",
            "0x200d",
            "0x1f308",
            "0x1f3f3",
            "0xfe0f",
            "0x200d",
            "0x26a7",
            "0xfe0f",
            "0x1f3f4",
            "0x200d",
            "0x2620",
            "0xfe0f",
            "0x1f1e6",
            "0x1f1e8",
            "0x1f1e6",
            "0x1f1e9",
            "0x1f1e6",
            "0x1f1ea",
            "0x1f1e6",
            "0x1f1eb",
            "0x1f1e6",
            "0x1f1ec",
            "0x1f1e6",
            "0x1f1ee",
            "0x1f1e6",
            "0x1f1f1",
            "0x1f1e6",
            "0x1f1f2",
            "0x1f1e6",
            "0x1f1f4",
            "0x1f1e6",
            "0x1f1f6",
            "0x1f1e6",
            "0x1f1f7",
            "0x1f1e6",
            "0x1f1f8",
            "0x1f1e6",
            "0x1f1f9",
            "0x1f1e6",
            "0x1f1fa",
            "0x1f1e6",
            "0x1f1fc",
            "0x1f1e6",
            "0x1f1fd",
            "0x1f1e6",
            "0x1f1ff",
            "0x1f1e7",
            "0x1f1e6",
            "0x1f1e7",
            "0x1f1e7",
            "0x1f1e7",
            "0x1f1e9",
            "0x1f1e7",
            "0x1f1ea",
            "0x1f1e7",
            "0x1f1eb",
            "0x1f1e7",
            "0x1f1ec",
            "0x1f1e7",
            "0x1f1ed",
            "0x1f1e7",
            "0x1f1ee",
            "0x1f1e7",
            "0x1f1ef",
            "0x1f1e7",
            "0x1f1f1",
            "0x1f1e7",
            "0x1f1f2",
            "0x1f1e7",
            "0x1f1f3",
            "0x1f1e7",
            "0x1f1f4",
            "0x1f1e7",
            "0x1f1f6",
            "0x1f1e7",
            "0x1f1f7",
            "0x1f1e7",
            "0x1f1f8",
            "0x1f1e7",
            "0x1f1f9",
            "0x1f1e7",
            "0x1f1fb",
            "0x1f1e7",
            "0x1f1fc",
            "0x1f1e7",
            "0x1f1fe",
            "0x1f1e7",
            "0x1f1ff",
            "0x1f1e8",
            "0x1f1e6",
            "0x1f1e8",
            "0x1f1e8",
            "0x1f1e8",
            "0x1f1e9",
            "0x1f1e8",
            "0x1f1eb",
            "0x1f1e8",
            "0x1f1ec",
            "0x1f1e8",
            "0x1f1ed",
            "0x1f1e8",
            "0x1f1ee",
            "0x1f1e8",
            "0x1f1f0",
            "0x1f1e8",
            "0x1f1f1",
            "0x1f1e8",
            "0x1f1f2",
            "0x1f1e8",
            "0x1f1f3",
            "0x1f1e8",
            "0x1f1f4",
            "0x1f1e8",
            "0x1f1f5",
            "0x1f1e8",
            "0x1f1f7",
            "0x1f1e8",
            "0x1f1fa",
            "0x1f1e8",
            "0x1f1fb",
            "0x1f1e8",
            "0x1f1fc",
            "0x1f1e8",
            "0x1f1fd",
            "0x1f1e8",
            "0x1f1fe",
            "0x1f1e8",
            "0x1f1ff",
            "0x1f1e9",
            "0x1f1ea",
            "0x1f1e9",
            "0x1f1ec",
            "0x1f1e9",
            "0x1f1ef",
            "0x1f1e9",
            "0x1f1f0",
            "0x1f1e9",
            "0x1f1f2",
            "0x1f1e9",
            "0x1f1f4",
            "0x1f1e9",
            "0x1f1ff",
            "0x1f1ea",
            "0x1f1e6",
            "0x1f1ea",
            "0x1f1e8",
            "0x1f1ea",
            "0x1f1ea",
            "0x1f1ea",
            "0x1f1ec",
            "0x1f1ea",
            "0x1f1ed",
            "0x1f1ea",
            "0x1f1f7",
            "0x1f1ea",
            "0x1f1f8",
            "0x1f1ea",
            "0x1f1f9",
            "0x1f1ea",
            "0x1f1fa",
            "0x1f1eb",
            "0x1f1ee",
            "0x1f1eb",
            "0x1f1ef",
            "0x1f1eb",
            "0x1f1f0",
            "0x1f1eb",
            "0x1f1f2",
            "0x1f1eb",
            "0x1f1f4",
            "0x1f1eb",
            "0x1f1f7",
            "0x1f1ec",
            "0x1f1e6",
            "0x1f1ec",
            "0x1f1e7",
            "0x1f1ec",
            "0x1f1e9",
            "0x1f1ec",
            "0x1f1ea",
            "0x1f1ec",
            "0x1f1eb",
            "0x1f1ec",
            "0x1f1ec",
            "0x1f1ec",
            "0x1f1ed",
            "0x1f1ec",
            "0x1f1ee",
            "0x1f1ec",
            "0x1f1f1",
            "0x1f1ec",
            "0x1f1f2",
            "0x1f1ec",
            "0x1f1f3",
            "0x1f1ec",
            "0x1f1f5",
            "0x1f1ec",
            "0x1f1f6",
            "0x1f1ec",
            "0x1f1f7",
            "0x1f1ec",
            "0x1f1f8",
            "0x1f1ec",
            "0x1f1f9",
            "0x1f1ec",
            "0x1f1fa",
            "0x1f1ec",
            "0x1f1fc",
            "0x1f1ec",
            "0x1f1fe",
            "0x1f1ed",
            "0x1f1f0",
            "0x1f1ed",
            "0x1f1f2",
            "0x1f1ed",
            "0x1f1f3",
            "0x1f1ed",
            "0x1f1f7",
            "0x1f1ed",
            "0x1f1f9",
            "0x1f1ed",
            "0x1f1fa",
            "0x1f1ee",
            "0x1f1e8",
            "0x1f1ee",
            "0x1f1e9",
            "0x1f1ee",
            "0x1f1ea",
            "0x1f1ee",
            "0x1f1f1",
            "0x1f1ee",
            "0x1f1f2",
            "0x1f1ee",
            "0x1f1f3",
            "0x1f1ee",
            "0x1f1f4",
            "0x1f1ee",
            "0x1f1f6",
            "0x1f1ee",
            "0x1f1f7",
            "0x1f1ee",
            "0x1f1f8",
            "0x1f1ee",
            "0x1f1f9",
            "0x1f1ef",
            "0x1f1ea",
            "0x1f1ef",
            "0x1f1f2",
            "0x1f1ef",
            "0x1f1f4",
            "0x1f1ef",
            "0x1f1f5",
            "0x1f1f0",
            "0x1f1ea",
            "0x1f1f0",
            "0x1f1ec",
            "0x1f1f0",
            "0x1f1ed",
            "0x1f1f0",
            "0x1f1ee",
            "0x1f1f0",
            "0x1f1f2",
            "0x1f1f0",
            "0x1f1f3",
            "0x1f1f0",
            "0x1f1f5",
            "0x1f1f0",
            "0x1f1f7",
            "0x1f1f0",
            "0x1f1fc",
            "0x1f1f0",
            "0x1f1fe",
            "0x1f1f0",
            "0x1f1ff",
            "0x1f1f1",
            "0x1f1e6",
            "0x1f1f1",
            "0x1f1e7",
            "0x1f1f1",
            "0x1f1e8",
            "0x1f1f1",
            "0x1f1ee",
            "0x1f1f1",
            "0x1f1f0",
            "0x1f1f1",
            "0x1f1f7",
            "0x1f1f1",
            "0x1f1f8",
            "0x1f1f1",
            "0x1f1f9",
            "0x1f1f1",
            "0x1f1fa",
            "0x1f1f1",
            "0x1f1fb",
            "0x1f1f1",
            "0x1f1fe",
            "0x1f1f2",
            "0x1f1e6",
            "0x1f1f2",
            "0x1f1e8",
            "0x1f1f2",
            "0x1f1e9",
            "0x1f1f2",
            "0x1f1ea",
            "0x1f1f2",
            "0x1f1eb",
            "0x1f1f2",
            "0x1f1ec",
            "0x1f1f2",
            "0x1f1ed",
            "0x1f1f2",
            "0x1f1f0",
            "0x1f1f2",
            "0x1f1f1",
            "0x1f1f2",
            "0x1f1f2",
            "0x1f1f2",
            "0x1f1f3",
            "0x1f1f2",
            "0x1f1f4",
            "0x1f1f2",
            "0x1f1f5",
            "0x1f1f2",
            "0x1f1f6",
            "0x1f1f2",
            "0x1f1f7",
            "0x1f1f2",
            "0x1f1f8",
            "0x1f1f2",
            "0x1f1f9",
            "0x1f1f2",
            "0x1f1fa",
            "0x1f1f2",
            "0x1f1fb",
            "0x1f1f2",
            "0x1f1fc",
            "0x1f1f2",
            "0x1f1fd",
            "0x1f1f2",
            "0x1f1fe",
            "0x1f1f2",
            "0x1f1ff",
            "0x1f1f3",
            "0x1f1e6",
            "0x1f1f3",
            "0x1f1e8",
            "0x1f1f3",
            "0x1f1ea",
            "0x1f1f3",
            "0x1f1eb",
            "0x1f1f3",
            "0x1f1ec",
            "0x1f1f3",
            "0x1f1ee",
            "0x1f1f3",
            "0x1f1f1",
            "0x1f1f3",
            "0x1f1f4",
            "0x1f1f3",
            "0x1f1f5",
            "0x1f1f3",
            "0x1f1f7",
            "0x1f1f3",
            "0x1f1fa",
            "0x1f1f3",
            "0x1f1ff",
            "0x1f1f4",
            "0x1f1f2",
            "0x1f1f5",
            "0x1f1e6",
            "0x1f1f5",
            "0x1f1ea",
            "0x1f1f5",
            "0x1f1eb",
            "0x1f1f5",
            "0x1f1ec",
            "0x1f1f5",
            "0x1f1ed",
            "0x1f1f5",
            "0x1f1f0",
            "0x1f1f5",
            "0x1f1f1",
            "0x1f1f5",
            "0x1f1f2",
            "0x1f1f5",
            "0x1f1f3",
            "0x1f1f5",
            "0x1f1f7",
            "0x1f1f5",
            "0x1f1f8",
            "0x1f1f5",
            "0x1f1f9",
            "0x1f1f5",
            "0x1f1fc",
            "0x1f1f5",
            "0x1f1fe",
            "0x1f1f6",
            "0x1f1e6",
            "0x1f1f7",
            "0x1f1ea",
            "0x1f1f7",
            "0x1f1f4",
            "0x1f1f7",
            "0x1f1f8",
            "0x1f1f7",
            "0x1f1fa",
            "0x1f1f7",
            "0x1f1fc",
            "0x1f1f8",
            "0x1f1e6",
            "0x1f1f8",
            "0x1f1e7",
            "0x1f1f8",
            "0x1f1e8",
            "0x1f1f8",
            "0x1f1e9",
            "0x1f1f8",
            "0x1f1ea",
            "0x1f1f8",
            "0x1f1ec",
            "0x1f1f8",
            "0x1f1ed",
            "0x1f1f8",
            "0x1f1ee",
            "0x1f1f8",
            "0x1f1ef",
            "0x1f1f8",
            "0x1f1f0",
            "0x1f1f8",
            "0x1f1f1",
            "0x1f1f8",
            "0x1f1f2",
            "0x1f1f8",
            "0x1f1f3",
            "0x1f1f8",
            "0x1f1f4",
            "0x1f1f8",
            "0x1f1f7",
            "0x1f1f8",
            "0x1f1f8",
            "0x1f1f8",
            "0x1f1f9",
            "0x1f1f8",
            "0x1f1fb",
            "0x1f1f8",
            "0x1f1fd",
            "0x1f1f8",
            "0x1f1fe",
            "0x1f1f8",
            "0x1f1ff",
            "0x1f1f9",
            "0x1f1e6",
            "0x1f1f9",
            "0x1f1e8",
            "0x1f1f9",
            "0x1f1e9",
            "0x1f1f9",
            "0x1f1eb",
            "0x1f1f9",
            "0x1f1ec",
            "0x1f1f9",
            "0x1f1ed",
            "0x1f1f9",
            "0x1f1ef",
            "0x1f1f9",
            "0x1f1f0",
            "0x1f1f9",
            "0x1f1f1",
            "0x1f1f9",
            "0x1f1f2",
            "0x1f1f9",
            "0x1f1f3",
            "0x1f1f9",
            "0x1f1f4",
            "0x1f1f9",
            "0x1f1f7",
            "0x1f1f9",
            "0x1f1f9",
            "0x1f1f9",
            "0x1f1fb",
            "0x1f1f9",
            "0x1f1fc",
            "0x1f1f9",
            "0x1f1ff",
            "0x1f1fa",
            "0x1f1e6",
            "0x1f1fa",
            "0x1f1ec",
            "0x1f1fa",
            "0x1f1f2",
            "0x1f1fa",
            "0x1f1f3",
            "0x1f1fa",
            "0x1f1f8",
            "0x1f1fa",
            "0x1f1fe",
            "0x1f1fa",
            "0x1f1ff",
            "0x1f1fb",
            "0x1f1e6",
            "0x1f1fb",
            "0x1f1e8",
            "0x1f1fb",
            "0x1f1ea",
            "0x1f1fb",
            "0x1f1ec",
            "0x1f1fb",
            "0x1f1ee",
            "0x1f1fb",
            "0x1f1f3",
            "0x1f1fb",
            "0x1f1fa",
            "0x1f1fc",
            "0x1f1eb",
            "0x1f1fc",
            "0x1f1f8",
            "0x1f1fd",
            "0x1f1f0",
            "0x1f1fe",
            "0x1f1ea",
            "0x1f1fe",
            "0x1f1f9",
            "0x1f1ff",
            "0x1f1e6",
            "0x1f1ff",
            "0x1f1f2",
            "0x1f1ff",
            "0x1f1fc",
            "0x1f3f4",
            "0xe0067",
            "0xe0062",
            "0xe0065",
            "0xe006e",
            "0xe0067",
            "0xe007f",
            "0x1f3f4",
            "0xe0067",
            "0xe0062",
            "0xe0073",
            "0xe0063",
            "0xe0074",
            "0xe007f",
            "0x1f3f4",
            "0xe0067",
            "0xe0062",
            "0xe0077",
            "0xe006c",
            "0xe0073",
            "0xe007f"
          ]
        }
      }, $ = Object.prototype.hasOwnProperty, fe = Object.keys || function(e) {
        var t = [];
        for (var c in e)
          $.call(e, c) && t.push(c);
        return t;
      };
      function X(e, t) {
        for (var c = fe(e), b, C = 0, M = c.length; C < M; C++)
          b = c[C], t[b] = e[b] || t[b];
      }
      function Ve(e, t) {
        for (var c = 0, b = e.length; c < b; c++)
          t[c] = e[c];
      }
      function ye(e, t) {
        var c = Array.isArray(e), b = t || (c ? new Array(e.length) : {});
        return c ? Ve(e, b) : X(e, b), b;
      }
      o.prototype.get = function(e) {
        return ye(I[e]);
      }, o.prototype.mac_address = function(e) {
        e = u(e), e.separator || (e.separator = e.networkVersion ? "." : ":");
        var t = "ABCDEF1234567890", c = "";
        return e.networkVersion ? c = this.n(this.string, 3, { pool: t, length: 4 }).join(e.separator) : c = this.n(this.string, 6, { pool: t, length: 2 }).join(e.separator), c;
      }, o.prototype.normal = function(e) {
        if (e = u(e, { mean: 0, dev: 1, pool: [] }), g(
          e.pool.constructor !== Array,
          "Chance: The pool option must be a valid array."
        ), g(
          typeof e.mean != "number",
          "Chance: Mean (mean) must be a number"
        ), g(
          typeof e.dev != "number",
          "Chance: Standard deviation (dev) must be a number"
        ), e.pool.length > 0)
          return this.normal_pool(e);
        var t, c, b, C, M = e.mean, w = e.dev;
        do
          c = this.random() * 2 - 1, b = this.random() * 2 - 1, t = c * c + b * b;
        while (t >= 1);
        return C = c * Math.sqrt(-2 * Math.log(t) / t), w * C + M;
      }, o.prototype.normal_pool = function(e) {
        var t = 0;
        do {
          var c = Math.round(this.normal({ mean: e.mean, dev: e.dev }));
          if (c < e.pool.length && c >= 0)
            return e.pool[c];
          t++;
        } while (t < 100);
        throw new RangeError("Chance: Your pool is too small for the given mean and standard deviation. Please adjust.");
      }, o.prototype.radio = function(e) {
        e = u(e, { side: "?" });
        var t = "";
        switch (e.side.toLowerCase()) {
          case "east":
          case "e":
            t = "W";
            break;
          case "west":
          case "w":
            t = "K";
            break;
          default:
            t = this.character({ pool: "KW" });
            break;
        }
        return t + this.character({ alpha: !0, casing: "upper" }) + this.character({ alpha: !0, casing: "upper" }) + this.character({ alpha: !0, casing: "upper" });
      }, o.prototype.set = function(e, t) {
        typeof e == "string" ? I[e] = t : I = ye(e, I);
      }, o.prototype.tv = function(e) {
        return this.radio(e);
      }, o.prototype.cnpj = function() {
        var e = this.n(this.natural, 8, { max: 9 }), t = 2 + e[7] * 6 + e[6] * 7 + e[5] * 8 + e[4] * 9 + e[3] * 2 + e[2] * 3 + e[1] * 4 + e[0] * 5;
        t = 11 - t % 11, t >= 10 && (t = 0);
        var c = t * 2 + 3 + e[7] * 7 + e[6] * 8 + e[5] * 9 + e[4] * 2 + e[3] * 3 + e[2] * 4 + e[1] * 5 + e[0] * 6;
        return c = 11 - c % 11, c >= 10 && (c = 0), "" + e[0] + e[1] + "." + e[2] + e[3] + e[4] + "." + e[5] + e[6] + e[7] + "/0001-" + t + c;
      }, o.prototype.emotion = function() {
        return this.pick(this.get("emotions"));
      }, o.prototype.mersenne_twister = function(e) {
        return new U(e);
      }, o.prototype.blueimp_md5 = function() {
        return new L();
      };
      var U = function(e) {
        e === void 0 && (e = Math.floor(Math.random() * Math.pow(10, 13))), this.N = 624, this.M = 397, this.MATRIX_A = 2567483615, this.UPPER_MASK = 2147483648, this.LOWER_MASK = 2147483647, this.mt = new Array(this.N), this.mti = this.N + 1, this.init_genrand(e);
      };
      U.prototype.init_genrand = function(e) {
        for (this.mt[0] = e >>> 0, this.mti = 1; this.mti < this.N; this.mti++)
          e = this.mt[this.mti - 1] ^ this.mt[this.mti - 1] >>> 30, this.mt[this.mti] = (((e & 4294901760) >>> 16) * 1812433253 << 16) + (e & 65535) * 1812433253 + this.mti, this.mt[this.mti] >>>= 0;
      }, U.prototype.init_by_array = function(e, t) {
        var c = 1, b = 0, C, M;
        for (this.init_genrand(19650218), C = this.N > t ? this.N : t; C; C--)
          M = this.mt[c - 1] ^ this.mt[c - 1] >>> 30, this.mt[c] = (this.mt[c] ^ (((M & 4294901760) >>> 16) * 1664525 << 16) + (M & 65535) * 1664525) + e[b] + b, this.mt[c] >>>= 0, c++, b++, c >= this.N && (this.mt[0] = this.mt[this.N - 1], c = 1), b >= t && (b = 0);
        for (C = this.N - 1; C; C--)
          M = this.mt[c - 1] ^ this.mt[c - 1] >>> 30, this.mt[c] = (this.mt[c] ^ (((M & 4294901760) >>> 16) * 1566083941 << 16) + (M & 65535) * 1566083941) - c, this.mt[c] >>>= 0, c++, c >= this.N && (this.mt[0] = this.mt[this.N - 1], c = 1);
        this.mt[0] = 2147483648;
      }, U.prototype.genrand_int32 = function() {
        var e, t = new Array(0, this.MATRIX_A);
        if (this.mti >= this.N) {
          var c;
          for (this.mti === this.N + 1 && this.init_genrand(5489), c = 0; c < this.N - this.M; c++)
            e = this.mt[c] & this.UPPER_MASK | this.mt[c + 1] & this.LOWER_MASK, this.mt[c] = this.mt[c + this.M] ^ e >>> 1 ^ t[e & 1];
          for (; c < this.N - 1; c++)
            e = this.mt[c] & this.UPPER_MASK | this.mt[c + 1] & this.LOWER_MASK, this.mt[c] = this.mt[c + (this.M - this.N)] ^ e >>> 1 ^ t[e & 1];
          e = this.mt[this.N - 1] & this.UPPER_MASK | this.mt[0] & this.LOWER_MASK, this.mt[this.N - 1] = this.mt[this.M - 1] ^ e >>> 1 ^ t[e & 1], this.mti = 0;
        }
        return e = this.mt[this.mti++], e ^= e >>> 11, e ^= e << 7 & 2636928640, e ^= e << 15 & 4022730752, e ^= e >>> 18, e >>> 0;
      }, U.prototype.genrand_int31 = function() {
        return this.genrand_int32() >>> 1;
      }, U.prototype.genrand_real1 = function() {
        return this.genrand_int32() * (1 / 4294967295);
      }, U.prototype.random = function() {
        return this.genrand_int32() * (1 / 4294967296);
      }, U.prototype.genrand_real3 = function() {
        return (this.genrand_int32() + 0.5) * (1 / 4294967296);
      }, U.prototype.genrand_res53 = function() {
        var e = this.genrand_int32() >>> 5, t = this.genrand_int32() >>> 6;
        return (e * 67108864 + t) * (1 / 9007199254740992);
      };
      var L = function() {
      };
      L.prototype.VERSION = "1.0.1", L.prototype.safe_add = function(t, c) {
        var b = (t & 65535) + (c & 65535), C = (t >> 16) + (c >> 16) + (b >> 16);
        return C << 16 | b & 65535;
      }, L.prototype.bit_roll = function(e, t) {
        return e << t | e >>> 32 - t;
      }, L.prototype.md5_cmn = function(e, t, c, b, C, M) {
        return this.safe_add(this.bit_roll(this.safe_add(this.safe_add(t, e), this.safe_add(b, M)), C), c);
      }, L.prototype.md5_ff = function(e, t, c, b, C, M, w) {
        return this.md5_cmn(t & c | ~t & b, e, t, C, M, w);
      }, L.prototype.md5_gg = function(e, t, c, b, C, M, w) {
        return this.md5_cmn(t & b | c & ~b, e, t, C, M, w);
      }, L.prototype.md5_hh = function(e, t, c, b, C, M, w) {
        return this.md5_cmn(t ^ c ^ b, e, t, C, M, w);
      }, L.prototype.md5_ii = function(e, t, c, b, C, M, w) {
        return this.md5_cmn(c ^ (t | ~b), e, t, C, M, w);
      }, L.prototype.binl_md5 = function(e, t) {
        e[t >> 5] |= 128 << t % 32, e[(t + 64 >>> 9 << 4) + 14] = t;
        var c, b, C, M, w, v = 1732584193, A = -271733879, S = -1732584194, _ = 271733878;
        for (c = 0; c < e.length; c += 16)
          b = v, C = A, M = S, w = _, v = this.md5_ff(v, A, S, _, e[c], 7, -680876936), _ = this.md5_ff(_, v, A, S, e[c + 1], 12, -389564586), S = this.md5_ff(S, _, v, A, e[c + 2], 17, 606105819), A = this.md5_ff(A, S, _, v, e[c + 3], 22, -1044525330), v = this.md5_ff(v, A, S, _, e[c + 4], 7, -176418897), _ = this.md5_ff(_, v, A, S, e[c + 5], 12, 1200080426), S = this.md5_ff(S, _, v, A, e[c + 6], 17, -1473231341), A = this.md5_ff(A, S, _, v, e[c + 7], 22, -45705983), v = this.md5_ff(v, A, S, _, e[c + 8], 7, 1770035416), _ = this.md5_ff(_, v, A, S, e[c + 9], 12, -1958414417), S = this.md5_ff(S, _, v, A, e[c + 10], 17, -42063), A = this.md5_ff(A, S, _, v, e[c + 11], 22, -1990404162), v = this.md5_ff(v, A, S, _, e[c + 12], 7, 1804603682), _ = this.md5_ff(_, v, A, S, e[c + 13], 12, -40341101), S = this.md5_ff(S, _, v, A, e[c + 14], 17, -1502002290), A = this.md5_ff(A, S, _, v, e[c + 15], 22, 1236535329), v = this.md5_gg(v, A, S, _, e[c + 1], 5, -165796510), _ = this.md5_gg(_, v, A, S, e[c + 6], 9, -1069501632), S = this.md5_gg(S, _, v, A, e[c + 11], 14, 643717713), A = this.md5_gg(A, S, _, v, e[c], 20, -373897302), v = this.md5_gg(v, A, S, _, e[c + 5], 5, -701558691), _ = this.md5_gg(_, v, A, S, e[c + 10], 9, 38016083), S = this.md5_gg(S, _, v, A, e[c + 15], 14, -660478335), A = this.md5_gg(A, S, _, v, e[c + 4], 20, -405537848), v = this.md5_gg(v, A, S, _, e[c + 9], 5, 568446438), _ = this.md5_gg(_, v, A, S, e[c + 14], 9, -1019803690), S = this.md5_gg(S, _, v, A, e[c + 3], 14, -187363961), A = this.md5_gg(A, S, _, v, e[c + 8], 20, 1163531501), v = this.md5_gg(v, A, S, _, e[c + 13], 5, -1444681467), _ = this.md5_gg(_, v, A, S, e[c + 2], 9, -51403784), S = this.md5_gg(S, _, v, A, e[c + 7], 14, 1735328473), A = this.md5_gg(A, S, _, v, e[c + 12], 20, -1926607734), v = this.md5_hh(v, A, S, _, e[c + 5], 4, -378558), _ = this.md5_hh(_, v, A, S, e[c + 8], 11, -2022574463), S = this.md5_hh(S, _, v, A, e[c + 11], 16, 1839030562), A = this.md5_hh(A, S, _, v, e[c + 14], 23, -35309556), v = this.md5_hh(v, A, S, _, e[c + 1], 4, -1530992060), _ = this.md5_hh(_, v, A, S, e[c + 4], 11, 1272893353), S = this.md5_hh(S, _, v, A, e[c + 7], 16, -155497632), A = this.md5_hh(A, S, _, v, e[c + 10], 23, -1094730640), v = this.md5_hh(v, A, S, _, e[c + 13], 4, 681279174), _ = this.md5_hh(_, v, A, S, e[c], 11, -358537222), S = this.md5_hh(S, _, v, A, e[c + 3], 16, -722521979), A = this.md5_hh(A, S, _, v, e[c + 6], 23, 76029189), v = this.md5_hh(v, A, S, _, e[c + 9], 4, -640364487), _ = this.md5_hh(_, v, A, S, e[c + 12], 11, -421815835), S = this.md5_hh(S, _, v, A, e[c + 15], 16, 530742520), A = this.md5_hh(A, S, _, v, e[c + 2], 23, -995338651), v = this.md5_ii(v, A, S, _, e[c], 6, -198630844), _ = this.md5_ii(_, v, A, S, e[c + 7], 10, 1126891415), S = this.md5_ii(S, _, v, A, e[c + 14], 15, -1416354905), A = this.md5_ii(A, S, _, v, e[c + 5], 21, -57434055), v = this.md5_ii(v, A, S, _, e[c + 12], 6, 1700485571), _ = this.md5_ii(_, v, A, S, e[c + 3], 10, -1894986606), S = this.md5_ii(S, _, v, A, e[c + 10], 15, -1051523), A = this.md5_ii(A, S, _, v, e[c + 1], 21, -2054922799), v = this.md5_ii(v, A, S, _, e[c + 8], 6, 1873313359), _ = this.md5_ii(_, v, A, S, e[c + 15], 10, -30611744), S = this.md5_ii(S, _, v, A, e[c + 6], 15, -1560198380), A = this.md5_ii(A, S, _, v, e[c + 13], 21, 1309151649), v = this.md5_ii(v, A, S, _, e[c + 4], 6, -145523070), _ = this.md5_ii(_, v, A, S, e[c + 11], 10, -1120210379), S = this.md5_ii(S, _, v, A, e[c + 2], 15, 718787259), A = this.md5_ii(A, S, _, v, e[c + 9], 21, -343485551), v = this.safe_add(v, b), A = this.safe_add(A, C), S = this.safe_add(S, M), _ = this.safe_add(_, w);
        return [v, A, S, _];
      }, L.prototype.binl2rstr = function(e) {
        var t, c = "";
        for (t = 0; t < e.length * 32; t += 8)
          c += String.fromCharCode(e[t >> 5] >>> t % 32 & 255);
        return c;
      }, L.prototype.rstr2binl = function(e) {
        var t, c = [];
        for (c[(e.length >> 2) - 1] = void 0, t = 0; t < c.length; t += 1)
          c[t] = 0;
        for (t = 0; t < e.length * 8; t += 8)
          c[t >> 5] |= (e.charCodeAt(t / 8) & 255) << t % 32;
        return c;
      }, L.prototype.rstr_md5 = function(e) {
        return this.binl2rstr(this.binl_md5(this.rstr2binl(e), e.length * 8));
      }, L.prototype.rstr_hmac_md5 = function(e, t) {
        var c, b = this.rstr2binl(e), C = [], M = [], w;
        for (C[15] = M[15] = void 0, b.length > 16 && (b = this.binl_md5(b, e.length * 8)), c = 0; c < 16; c += 1)
          C[c] = b[c] ^ 909522486, M[c] = b[c] ^ 1549556828;
        return w = this.binl_md5(C.concat(this.rstr2binl(t)), 512 + t.length * 8), this.binl2rstr(this.binl_md5(M.concat(w), 640));
      }, L.prototype.rstr2hex = function(e) {
        var t = "0123456789abcdef", c = "", b, C;
        for (C = 0; C < e.length; C += 1)
          b = e.charCodeAt(C), c += t.charAt(b >>> 4 & 15) + t.charAt(b & 15);
        return c;
      }, L.prototype.str2rstr_utf8 = function(e) {
        return unescape(encodeURIComponent(e));
      }, L.prototype.raw_md5 = function(e) {
        return this.rstr_md5(this.str2rstr_utf8(e));
      }, L.prototype.hex_md5 = function(e) {
        return this.rstr2hex(this.raw_md5(e));
      }, L.prototype.raw_hmac_md5 = function(e, t) {
        return this.rstr_hmac_md5(this.str2rstr_utf8(e), this.str2rstr_utf8(t));
      }, L.prototype.hex_hmac_md5 = function(e, t) {
        return this.rstr2hex(this.raw_hmac_md5(e, t));
      }, L.prototype.md5 = function(e, t, c) {
        return t ? c ? this.raw_hmac_md5(t, e) : this.hex_hmac_md5(t, e) : c ? this.raw_md5(e) : this.hex_md5(e);
      }, p.exports && (a = p.exports = o), a.Chance = o, typeof importScripts < "u" && (chance = new o(), self.Chance = o), typeof window == "object" && typeof window.document == "object" && (window.Chance = o, window.chance = new o());
    })();
  })(te, te.exports)), te.exports;
}
var sa = oa();
const la = /* @__PURE__ */ ra(sa);
function Te(p, a, n, s) {
  const r = new la(ve++), l = n.toUpperCase(), d = p.toUpperCase(), f = a.toUpperCase();
  if (s != null && 0 < s.length) {
    const h = s.length;
    let o = s[Math.floor(ee() * (h - 0)) + 0];
    return !l.startsWith("INTEGER") && !l.startsWith("NUMBER") && !l.startsWith("DATE") && (!o.toLowerCase || o.toLowerCase() !== "null") && (!o.charAt || o.charAt(0) !== "q" && o.charAt(1) !== "'") && (o.charAt && o.charAt(0) === "'" && (o = o.substring(1, o.length - 1)), o = o.split("'").join("''"), o = "'" + o + "'"), o;
  }
  if (f === "NAME" && 0 <= d.indexOf("DEPARTMENT")) {
    const m = ["Sales", "Finance", "Delivery", "Manufacturing"];
    return "'" + m[Math.floor(ee() * m.length)] + "'";
  }
  if (r[f.toLowerCase()] !== void 0 && f.indexOf("NAME") < 0)
    return "'" + r[f.toLowerCase()]() + "'";
  if (f === "FIRST_NAME")
    return "'" + r.first() + "'";
  if (f === "LAST_NAME")
    return "'" + r.last() + "'";
  if (0 <= f.indexOf("NAME"))
    return "'" + r.name() + "'";
  if (0 < f.indexOf("ADDRESS"))
    return "'" + r.address() + "'";
  if (f === "LOCATION")
    return "'" + r.city() + "'";
  if (f === "DESCRIPTION") {
    let m = r.paragraph({ sentences: 2 });
    const h = Q(n, !1, !0, "");
    let o = 400, u = -1;
    for (let x = 0; x < h.length; x++) {
      const g = h[x].value;
      if (g === "(") {
        u = x + 1;
        continue;
      }
      if (0 < u && g === ")") {
        o = parseInt(h[u].value);
        break;
      }
    }
    return o < m.length && (m = m.substring(0, o)), "'" + m + "'";
  }
  if (f === "JOB") {
    const m = ["Engineer", "Consultant", "Architect", "Manager", "Analyst", "Specialist", "Evangelist", "Salesman"];
    return "'" + m[Math.floor(ee() * m.length)] + "'";
  }
  return l.startsWith("INTEGER") || l.startsWith("NUMBER") ? Math.floor(ee() * 100) : l.startsWith("DATE") || l.startsWith("TIMESTAMP") ? "sysdate-" + Math.floor(ee() * 100) : l === "BLOB" || l === "LONG" ? "null" : "'N/A'";
}
let ve = 1;
function ca() {
  ve = 1;
}
function ee() {
  const p = Math.sin(ve++) * 1e4;
  return p - Math.floor(p);
}
function we(p) {
  return p.lastIndexOf(`,
`) === p.length - 2 && (p = p.substring(0, p.length - 2) + `
`), p;
}
function Le(p, a, n, s) {
  let r = [];
  if (p == null || typeof p != "object") return null;
  const l = p[n];
  l != null && a === s && r.push(l);
  for (const d in p) {
    const f = p[d], m = Le(f, d, n, s);
    m !== null && (r = r.concat(m));
  }
  return r;
}
class fa {
  constructor(a) {
    this._ddl = a;
  }
  // ── Shared helpers ────────────────────────────────────────────────────────
  /**
   * Resolve the dialect column type for a FK column by inspecting the
   * referenced table's explicit PK. Returns null for auto-generated PKs
   * so the caller can fall back to the FK column's own convention type.
   */
  _fkColType(a) {
    const n = a.getExplicitPkName();
    if (n == null || n.includes(",")) return null;
    const s = a.findChild(n);
    return s != null ? this.colType(s._inferTypeFull()) : a.getPkType();
  }
  // ── Shared: ERD generation ────────────────────────────────────────────────
  generateERD() {
    const a = this._ddl.descendants(), n = { items: [], links: [] };
    for (const r of a) {
      if (r.inferType() !== "table") continue;
      const l = {
        name: this._ddl.objPrefix("no schema") + r.parseName(),
        schema: this._ddl.getOptionValue("schema") || null,
        columns: []
      };
      n.items.push(l);
      const d = r.getGenIdColName();
      if (d != null && !r.isOption("pk"))
        l.columns.push({ name: d, datatype: "number" });
      else {
        const h = r.getExplicitPkName();
        if (h != null && !h.includes(",")) {
          const o = r.findChild(h);
          l.columns.push({ name: h, datatype: o ? this.colType(o._inferTypeFull()) : "number" });
        }
      }
      r.lateInitFks();
      for (const h in r.fks ?? {}) {
        const o = r.fks[h];
        if (h.includes(",")) {
          const k = this._ddl.find(o);
          for (const y of ce(h, ", ")) {
            if (y === ",") continue;
            const B = k?.findChild(y);
            l.columns.push({ name: y, datatype: B ? this.colType(B._inferTypeFull()) : "number" });
          }
          continue;
        }
        const u = r.findChild(h);
        let x = u ? u.inferType() : "number", g = h;
        const T = this._ddl.find(o);
        T != null ? x = this._fkColType(T) ?? x : this._ddl.find(h)?.isMany2One?.() && !h.endsWith("_id") && (g = (D(h) ?? h) + "_id"), l.columns.push({ name: g, datatype: x });
      }
      const f = r.getExplicitPkName();
      for (const h of r.children)
        if (h.inferType() !== "table" && h.refId() == null && h.parseName() !== f && (l.columns.push({ name: h.parseName(), datatype: this.colType(h._inferTypeFull()) }), h.indexOf("file") > 0)) {
          const o = h.parseName(), u = { base: "varchar", varcharLen: 255, colName: o, needsBoolCheck: !1, isNativeBoolean: !1, parent_child: "" }, x = { base: "date", colName: o, needsBoolCheck: !1, isNativeBoolean: !1, parent_child: "" };
          l.columns.push({ name: o + "_filename", datatype: this.colType(u) }), l.columns.push({ name: o + "_mimetype", datatype: this.colType(u) }), l.columns.push({ name: o + "_charset", datatype: this.colType(u) }), l.columns.push({ name: o + "_lastupd", datatype: this.colType(x) });
        }
      const m = r.trimmedContent().toUpperCase();
      if (this._ddl.optionEQvalue("rowkey", !0) || m.includes("/ROWKEY")) {
        const h = { base: "varchar", varcharLen: 30, colName: "row_key", needsBoolCheck: !1, isNativeBoolean: !1, parent_child: "" };
        l.columns.push({ name: "row_key", datatype: this.colType(h) });
      }
      if ((this._ddl.optionEQvalue("rowVersion", "yes") || m.includes("/ROWVERSION")) && l.columns.push({ name: "row_version", datatype: "integer" }), this._ddl.optionEQvalue("Audit Columns", "yes") || m.includes("/AUDITCOLS")) {
        let h = this._ddl.getOptionValue("auditdate") || "";
        h || (h = this._ddl.getOptionValue("Date Data Type") ?? "date");
        const o = { base: h.toLowerCase(), colName: "", needsBoolCheck: !1, isNativeBoolean: !1, parent_child: "" }, u = { base: "varchar", varcharLen: 255, colName: "", needsBoolCheck: !1, isNativeBoolean: !1, parent_child: "" };
        l.columns.push({ name: this._ddl.getOptionValue("createdcol"), datatype: this.colType(o) }), l.columns.push({ name: this._ddl.getOptionValue("createdbycol"), datatype: this.colType(u) }), l.columns.push({ name: this._ddl.getOptionValue("updatedcol"), datatype: this.colType(o) }), l.columns.push({ name: this._ddl.getOptionValue("updatedbycol"), datatype: this.colType(u) });
      }
      if (this._ddl.optionEQvalue("tenantid", !0) && !r.isOption("notenantid") && r.findChild("tenant_id") === null) {
        const h = { base: "number", colName: "tenant_id", needsBoolCheck: !1, isNativeBoolean: !1, parent_child: "" };
        l.columns.push({ name: "tenant_id", datatype: this.colType(h) });
      }
    }
    for (const r of a)
      if (r.inferType() === "table") {
        this.generateDDL(r);
        for (const l in r.fks ?? {}) {
          const d = r.fks[l], f = this._ddl.find(d);
          if (f == null) continue;
          const m = f.getExplicitPkName() ?? "id", h = r.findChild(l), o = h == null || h.isOption("nn") || h.isOption("notnull"), u = {
            source: this._ddl.objPrefix("no schema") + d,
            source_id: m,
            target: this._ddl.objPrefix("no schema") + r.parseName(),
            target_id: l
          };
          o && (u.mandatory = o), n.links.push(u);
        }
      }
    if (this._ddl.optionEQvalue("tenantid", !0)) {
      const r = String(this._ddl.getOptionValue("tenantref") || "tenants"), l = this._ddl.find(r);
      if (l != null) {
        const d = l.getExplicitPkName() ?? "id", f = this._ddl.objPrefix("no schema") + r;
        for (const m of a)
          m.inferType() === "table" && (m.isOption("notenantid") || m.findChild("tenant_id") === null && n.links.push({
            source: f,
            source_id: d,
            target: this._ddl.objPrefix("no schema") + m.parseName(),
            target_id: "tenant_id",
            mandatory: !0
          }));
      }
    }
    const s = {};
    for (const r of a) {
      if (r.inferType() !== "table") continue;
      const l = r.getAnnotationValue("TGROUP");
      l != null && (s[l] || (s[l] = []), s[l].push(this._ddl.objPrefix("no schema") + r.parseName()));
    }
    return Object.keys(s).length > 0 && (n.groups = s), n;
  }
  // ── Shared: INSERT data generation ────────────────────────────────────────
  /**
   * Dialect hook: SQL to reset an IDENTITY/sequence column after bulk inserts.
   * Return empty string if the dialect needs no reset statement.
   */
  identityRestartSql(a, n, s) {
    return "";
  }
  _isContainedIn(a, n) {
    for (const s of n)
      if (s.parseName() === a.parseName()) return !0;
    return !1;
  }
  _orderedTableNodes(a) {
    const n = [a];
    for (const s of a.descendants().slice(1))
      s.children.length !== 0 && (s.isMany2One() ? this._isContainedIn(s, n) || n.unshift(s) : this._isContainedIn(s, n) || n.push(s));
    return n;
  }
  generateData(a, n) {
    if (ca(), this._ddl.optionEQvalue("inserts", !1)) return "";
    const s = this.inserts4tbl(a, n), r = this._orderedTableNodes(a);
    let l = "";
    for (const d of r) {
      const f = this._ddl.objPrefix() + d.parseName(), m = s[f];
      m != null && (l += m);
    }
    return l;
  }
  inserts4tbl(a, n) {
    let s = {};
    if (this._ddl.optionEQvalue("inserts", !1)) return {};
    const r = this._ddl.objPrefix() + a.parseName();
    let l = "";
    for (let f = 0; f < a.cardinality(); f++) {
      let m = null;
      if (n != null) {
        const h = n[r];
        h != null && Array.isArray(h) && (m = h[f]);
      }
      l += this._buildInsertStatement(a, f, m, r);
    }
    l !== "" && (l += `
commit;

`);
    const d = a.getGenIdColName();
    d != null && 1 < a.cardinality() && !this._ddl.optionEQvalue("pk", "guid") && (l += this.identityRestartSql(r, d, a.cardinality() + 1)), s[r] = l;
    for (const f of a.children)
      f.children.length > 0 && (s = { ...s, ...this.inserts4tbl(f, n) });
    return s;
  }
  _buildInsertStatement(a, n, s, r) {
    let l = "insert into " + r + ` (
`;
    const d = a.getGenIdColName();
    let f = null, m = null;
    d != null ? (f = d, l += i + f + `,
`) : (f = a.getExplicitPkName(), f != null && (l += i + f + `,
`));
    for (let h in a.fks ?? {}) {
      let o = a.fks[h], u = "", x = this._ddl.find(o);
      x == null && (x = this._ddl.find(h), x?.isMany2One?.() && !h.endsWith("_id") && (o = h, h = D(h) ?? h, u = "_id")), l += i + h + u + `,
`;
    }
    for (const h of a.regularColumns())
      d != null && h.parseName() === "id" || h.isOption("pk") || (l += i + h.parseName() + `,
`);
    if (l = we(l), l += `) values (
`, d != null)
      m = n + 1, l += i + m + `,
`;
    else if (f != null) {
      const h = f, o = Le(this._ddl.data, null, h, a.parseName());
      let u = -1;
      s != null && (u = s[h]), o != null && o[n] != null && (u = o[n]), u !== -1 && typeof u == "string" && (u = "'" + u + "'"), m = u !== -1 ? u : n + 1, l += i + m + `,
`;
    }
    for (const h in a.fks ?? {}) {
      const o = a.fks[h], { type: u, values: x } = this._resolveFkSampleValues(a, h, o, s, m, r), g = String(this._ddl.getOptionValue("Data Language") ?? "EN");
      l += i + String(Me(g, Te(r, (D(o) ?? o) + "_id", u, x))) + `,
`;
    }
    for (const h of a.regularColumns()) {
      if (d != null && h.parseName() === "id" || h.parseName() === a.getExplicitPkName()) continue;
      let o = h.parseValues();
      const u = h.parseName();
      if (s != null) {
        const T = s[u];
        T != null && (o = [T]);
      }
      const x = String(this._ddl.getOptionValue("Data Language") ?? "EN"), g = Te(r, u, this.colType(h._inferTypeFull()), o);
      l += i + String(Me(x, g)) + `,
`;
    }
    return l = we(l), l += `);
`, l;
  }
  _resolveFkSampleValues(a, n, s, r, l, d) {
    const f = this._ddl.find(s);
    let m = [], h = "INTEGER";
    for (let o = 1; o <= (f?.cardinality() ?? 0); o++) m.push(o);
    if (r != null) {
      const o = r, u = o[n];
      if (u != null)
        typeof u == "string" && (h = "STRING"), m = [u];
      else {
        const x = d + "_" + s, g = this._ddl.data?.[x];
        if (g != null)
          for (const T in g) {
            const k = g[T];
            if (k[d + "_id"] === l) {
              const y = k[n];
              y != null && (typeof y == "string" && (h = "STRING"), m = [y]);
              break;
            }
          }
        else {
          const T = f?.getPkName() ?? null, k = T != null ? o[T] : void 0;
          k != null && (typeof k == "string" && (h = "STRING"), m = [k]);
        }
      }
    }
    return { type: h, values: m };
  }
}
const ua = "generated by default on null as identity";
function De(p, a, n) {
  switch (p.base) {
    case "varchar":
      return `varchar2(${p.varcharLen ?? 4e3}${a})`;
    case "number":
      return p.numericSpec ? `number${p.numericSpec}` : "number";
    case "integer":
      return "integer";
    case "date":
      return "date";
    case "timestamp":
      return "timestamp";
    case "tswtz":
      return "timestamp with time zone";
    case "tswltz":
      return "timestamp with local time zone";
    case "clob":
      return "clob";
    case "blob":
      return "blob";
    case "boolean":
      return "boolean";
    case "geometry":
      return "sdo_geometry";
    case "json":
      return n ? "json" : `clob check (${p.colName} is json)`;
    case "vector":
      return `vector${p.vectorSpec ?? "(*,*,*)"}`;
    default:
      return p.base;
  }
}
function Re(p) {
  const a = p.getOptionValue("db");
  return a != null && a.length > 0 && 23 <= (Y(a) ?? 0);
}
function Ge(p, a, n) {
  return a.optionEQvalue("pk", "identityDataType") ? ua : a.optionEQvalue("pk", "seq") ? ("default on null " + p + n.seq + ".NEXTVAL ").toLowerCase() : a.optionEQvalue("pk", "guid") ? "default on null to_number(sys_guid(), 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') " : "not null";
}
function da(p) {
  return p.lastIndexOf(`,
`) === p.length - 2 && (p = p.substring(0, p.length - 2) + `
`), p;
}
class ma {
  constructor(a, n) {
    this.ctx = a, this.naming = n;
  }
  generateView(a) {
    if (a.inferType() !== "view" && a.inferType() !== "dv") return "";
    if (this.ctx.optionEQvalue("Duality View", "yes") || a.inferType() === "dv")
      try {
        return this.generateDualityView(a);
      } catch (m) {
        if (m.message === a.one2many2oneUnsupoorted) return "";
        throw m;
      }
    const n = this.ctx.objPrefix() + a.parseName(), s = a.src, r = this._buildViewSetup(a, s);
    if (r === null) return "";
    let l = "create or replace view " + n;
    a.annotations !== null && (l += `
annotations (` + a.annotations + ")"), l += ` as
`, l += `select
`, l += this._buildViewColList(a, s, r.aliasMap, r.tblCache, r.colCnts, r.tblTransCols, r.maxLen), l = da(l);
    const { sortedTables: d, joinConditions: f } = this._sortViewTables(a, s, r.tblCache);
    return l += `from
`, l += this._buildViewFromClause(a, d, r.aliasMap, f, r.tblTransCols, r.tblCache), l = l.toLowerCase(), l.endsWith(`
`) && (l = l.trimEnd()), l.endsWith(`
`) || (l += `
`), l += `/
`, l.toLowerCase();
  }
  _buildViewSetup(a, n) {
    const s = {}, r = {};
    for (let m = 2; m < n.length; m++)
      s[n[m].value] = pe(n[m].value), r[n[m].value] = this.ctx.find(n[m].value);
    let l = 0;
    for (let m = 2; m < n.length; m++) {
      const h = r[n[m].value];
      if (h === null) return null;
      const o = s[n[m].value];
      let u = (o + ".id").length;
      l < u && (l = u);
      for (const x of h.children)
        u = (o + "." + x.parseName()).length, l < u && (l = u);
    }
    const d = {};
    for (let m = 2; m < n.length; m++) {
      const h = r[n[m].value];
      if (h !== null)
        for (const o of h.children)
          d[o.parseName()] = (d[o.parseName()] ?? 0) + 1;
    }
    for (let m = 2; m < n.length; m++) {
      const h = (D(n[m].value) ?? n[m].value) + "_id";
      d[h] = (d[h] ?? 0) + 1;
    }
    const f = {};
    for (let m = 2; m < n.length; m++) {
      const h = r[n[m].value];
      if (h !== null) {
        const o = h.getTransColumns();
        if (o.length > 0) {
          const u = {};
          for (const x of o) u[x.parseName()] = !0;
          f[n[m].value] = u;
        }
      }
    }
    return { aliasMap: s, tblCache: r, maxLen: l, colCnts: d, tblTransCols: f };
  }
  _buildViewColList(a, n, s, r, l, d, f) {
    let m = "";
    for (let h = 2; h < n.length; h++) {
      const o = r[n[h].value];
      if (o === null) continue;
      const u = n[h].value, x = s[u], g = d[u] ?? {}, T = " ".repeat(f - (x.length + 1 + 2));
      m += i + x + ".id" + i + T + (D(u) ?? u) + `_id,
`;
      for (const k of o.children)
        if (k.children.length === 0) {
          const y = k.parseName();
          let B = "";
          if (1 < (l[y] ?? 0) && (B = (D(u) ?? u) + "_"), g[y]) {
            const P = `coalesce(${"t_" + u}.trans_${y}, ${x}.${y})`;
            m += i + P + i + B + y + `,
`;
          } else {
            const N = " ".repeat(f - (x.length + 1 + y.length));
            m += i + x + "." + y + i + N + B + y + `,
`;
          }
        }
      if (o.hasRowVersion()) {
        const k = i + " ".repeat(o.maxChildNameLen() - 11);
        m += i + x + ".row_version" + k + (D(u) ?? u) + `_row_version,
`;
      }
      if (o.hasRowKey()) {
        const k = i + " ".repeat(o.maxChildNameLen() - 7);
        m += i + x + ".ROW_KEY" + k + (D(u) ?? u) + `_ROW_KEY,
`;
      }
      if (o.hasAuditCols())
        for (const k of ["createdcol", "createdbycol", "updatedcol", "updatedbycol"]) {
          const y = String(this.ctx.getOptionValue(k) ?? ""), B = i + " ".repeat(o.maxChildNameLen() - y.length);
          m += i + x + "." + y + B + (D(u) ?? u) + "_" + y + `,
`;
        }
    }
    return m;
  }
  _sortViewTables(a, n, s) {
    const r = {};
    for (let h = 2; h < n.length; h++) r[n[h].value] = !0;
    const l = {};
    for (let h = 2; h < n.length; h++) {
      const o = n[h].value, u = s[o];
      if (u !== null)
        for (const x in u.fks) {
          const g = u.fks[x];
          r[g] && g !== o && (l[o] || (l[o] = []), l[o].push({ fkCol: x, parentTable: g }));
        }
    }
    const d = {}, f = [];
    for (let h = 2; h < n.length; h++) {
      const o = n[h].value;
      l[o] || (f.push(o), d[o] = !0);
    }
    let m = [];
    for (let h = 2; h < n.length; h++)
      l[n[h].value] && m.push(n[h].value);
    for (; m.length > 0; ) {
      let h = !1;
      const o = [];
      for (const u of m)
        l[u].every((g) => d[g.parentTable]) ? (f.push(u), d[u] = !0, h = !0) : o.push(u);
      if (m = o, !h) {
        for (const u of m)
          f.push(u), d[u] = !0;
        break;
      }
    }
    return { sortedTables: f, joinConditions: l };
  }
  _buildViewFromClause(a, n, s, r, l, d) {
    let f = "";
    const m = this.ctx.getOptionValue("transcontext");
    for (let h = 0; h < n.length; h++) {
      const o = n[h], u = s[o];
      let x = u;
      if (this.ctx.objPrefix() && (x = this.ctx.objPrefix() + o + " " + u), h === 0)
        f += i + x + `
`;
      else if (r[o]) {
        const g = r[o];
        f += i + "left join " + x + `
`;
        for (let T = 0; T < g.length; T++) {
          const k = s[g[T].parentTable], y = T === 0 ? "on " : "and ";
          f += i + i + y + u + "." + g[T].fkCol + " = " + k + `.id
`;
        }
      } else
        f += i + "cross join " + x + `
`;
      if (l[o]) {
        const g = d[o], T = this.ctx.objPrefix() + o + "_trans", k = "t_" + o, y = (D(o) ?? o) + "_id", B = g.getGenIdColName() ?? g.getExplicitPkName() ?? "id";
        f += i + "left join " + T + " " + k + `
`, f += i + i + "on " + k + "." + y + " = " + u + "." + B + `
`, f += i + i + "and " + k + ".language_code = " + m + `
`;
      }
    }
    return f;
  }
  generateDualityView(a) {
    const n = a.src;
    if (n.length < 3)
      return `/* duality view requires at least a view name and one table */
`;
    const s = this.ctx.objPrefix() + n[0].value, r = n[2].value, l = this.ctx.find(r);
    if (l === null)
      return "/* duality view: table " + r + ` not found */
`;
    l.lateInitFks();
    const d = "@insert @update @delete";
    let f = "create or replace json relational duality view " + s + ` as
`;
    f += this.ctx.objPrefix() + l.parseName() + " " + d + `
`, f += `{
`;
    const m = l.getGenIdColName() ?? l.getExplicitPkName() ?? "id";
    let h = 3;
    for (const u of l.children) {
      if (u.children.length > 0 || u.refId() !== null) continue;
      const x = u.parseName().length;
      x > h && (h = x);
    }
    for (let u = 3; u < n.length; u++) {
      const x = n[u].value.length;
      x > h && (h = x);
    }
    f += i + "_id" + " ".repeat(h - 3) + " : " + m + `,
`;
    const o = {};
    if (l.fks !== null) for (const u in l.fks) o[u] = !0;
    for (const u of l.regularColumns()) {
      const x = u.parseName();
      x === m || o[x] || (f += i + x + " ".repeat(h - x.length) + " : " + x + `,
`);
    }
    for (let u = 3; u < n.length; u++) {
      const x = n[u].value, g = this.ctx.find(x);
      if (g === null) continue;
      g.lateInitFks();
      let T = !1;
      if (g.fks !== null) {
        for (const I in g.fks)
          if (g.fks[I] === l.parseName()) {
            T = !0;
            break;
          }
      }
      const k = g.getGenIdColName() ?? g.getExplicitPkName() ?? "id";
      let y = 3;
      for (const I of g.children) {
        if (I.children.length > 0 || I.refId() !== null) continue;
        const $ = I.parseName().length;
        $ > y && (y = $);
      }
      const B = {};
      if (g.fks !== null) for (const I in g.fks) B[I] = !0;
      const N = T ? `[{
` : `{
`, P = T ? "}]" : "}";
      f += i + x + " ".repeat(h - x.length) + " : " + this.ctx.objPrefix() + g.parseName() + " " + d + `
`, f += i + N, f += i + i + "_id" + " ".repeat(y - 3) + " : " + k + `,
`;
      for (const I of g.regularColumns()) {
        const $ = I.parseName();
        $ === k || B[$] || (f += i + i + $ + " ".repeat(y - $.length) + " : " + $ + `,
`);
      }
      f = f.replace(/,\n$/, `
`), f += i + P + `,
`;
    }
    return f = f.replace(/,\n$/, `
`), f += `};

`, f.toLowerCase();
  }
  generateTransTable(a) {
    if (a.inferType() !== "table") return "";
    const n = a.getTransColumns();
    if (n.length === 0) return "";
    const s = this.ctx.objPrefix() + a.parseName(), r = s + "_trans", l = this.ctx.semantics(), d = Re(this.ctx);
    let f = 13;
    const m = (D(a.parseName()) ?? a.parseName()) + "_id";
    m.length > f && (f = m.length);
    for (const x of n) {
      const g = "trans_" + x.parseName();
      g.length > f && (f = g.length);
    }
    2 > f && (f = 2);
    let h = "create table " + r + ` (
`, o = i + " ".repeat(f - 2);
    h += i + "id" + o + "number " + Ge(r, this.ctx, this.naming) + `
`, h += i + i + " ".repeat(f) + "constraint " + r + "_id" + this.naming.pk + ` primary key,
`, o = i + " ".repeat(f - m.length), h += i + m + o + `number not null,
`, o = i + " ".repeat(f - 13), h += i + "language_code" + o + `varchar2(5${l}) not null,
`;
    for (const x of n) {
      const g = "trans_" + x.parseName();
      o = i + " ".repeat(f - g.length);
      const T = De(x._inferTypeFull(), l, d);
      h += i + g + o + T + `,
`;
    }
    h += i + "constraint " + r + this.naming.uk + " unique (" + m + `, language_code)
`, h += `);

`;
    let u = a.parseName();
    return u.length > 2 && (u = u.substring(0, 2)), h += "alter table " + r + " add constraint " + r + "_" + u + "_id" + this.naming.fk + `
`, h += i + "foreign key (" + m + ") references " + s + `;

`, h += "alter table " + r + " add constraint " + r + "_lang" + this.naming.fk + `
`, h += i + "foreign key (language_code) references " + this.ctx.objPrefix() + `language (code);

`, h += "create index " + r + this.naming.idx + "1 on " + r + " (" + m + `);
`, h += "create index " + r + this.naming.idx + "2 on " + r + ` (language_code);

`, h;
  }
  generateResolvedView(a) {
    if (a.inferType() !== "table") return "";
    const n = a.getTransColumns();
    if (n.length === 0) return "";
    const s = this.ctx.objPrefix() + a.parseName(), r = s + "_trans", l = s + "_resolved", d = (D(a.parseName()) ?? a.parseName()) + "_id", f = this.ctx.getOptionValue("transcontext");
    let m = "create or replace view " + l + ` as
select `;
    const h = [], o = a.getPkName();
    o !== null && h.push("k." + o), a.lateInitFks();
    for (const x in a.fks ?? {}) {
      if (0 < x.indexOf(",")) continue;
      const g = this.ctx.find(a.fks[x]);
      let T = "";
      g !== null && g.isMany2One && g.isMany2One() && !x.endsWith("_id") && (T = "_id"), h.push("k." + x + T);
    }
    const u = {};
    for (const x of n) u[x.parseName()] = !0;
    for (const x of a.regularColumns()) {
      const g = x.parseName();
      o !== null && g === "id" || g !== a.getExplicitPkName() && (u[g] ? h.push("coalesce(t.trans_" + g + ", k." + g + ") as " + g) : h.push("k." + g));
    }
    m += h[0] + `,
`;
    for (let x = 1; x < h.length; x++)
      m += i + i + " " + h[x], x < h.length - 1 && (m += ","), m += `
`;
    return m += "from " + s + ` k
`, m += "left join " + r + ` t
`, m += i + "on t." + d + " = k." + (o ?? a.getExplicitPkName()) + `
`, m += i + "and t.language_code = " + f + `;

`, m;
  }
}
function Be(p) {
  return p.isOption("lower") ? "lower" : p.isOption("upper") ? "upper" : "";
}
function ha(p) {
  const a = p.getExplicitPkName();
  if (a == null || a.includes(",")) return null;
  const n = p.findChild(a);
  return n != null ? n.getPlsqlType() : p.getPkType();
}
class xa {
  constructor(a, n) {
    this.ctx = a, this.naming = n;
  }
  // ── ORDS ──────────────────────────────────────────────────────────────────
  restEnable(a) {
    if (a.inferType() !== "table" || !a.isOption("rest")) return "";
    const n = a.parseName(), s = n.indexOf('"') === 0;
    let r = this.ctx.objPrefix() + n;
    return s ? r = this.ctx.objPrefix() + n.substring(1, n.length - 1) : r = (this.ctx.objPrefix() + n).toUpperCase(), `begin
` + i + "ords.enable_object(p_enabled=>TRUE, p_object=>'" + r + `');
end;
/
`;
  }
  // ── Triggers ──────────────────────────────────────────────────────────────
  generateTrigger(a) {
    return a.inferType() !== "table" || a.isOption("soda") ? "" : this._generateBITrigger(a) + this._generateBUTrigger(a);
  }
  _generateBITrigger(a) {
    const n = this.ctx.optionEQvalue("editionable", "yes") ? " editionable" : "", s = (this.ctx.objPrefix() + a.parseName()).toLowerCase();
    let r = `create or replace${n} trigger ${s}${this.naming.bi}
`;
    r += `    before insert
`, r += "    on " + s + `
`, r += `    for each row
`, a.hasRowKey() && (r += `declare
    function compress_int (n in integer ) return varchar2
    as
        ret       varchar2(30);
        quotient  integer;
        remainder integer;
        digit     char(1);
    begin
        ret := null; quotient := n;
        <<compress_loop>>
        while quotient > 0
        loop
            remainder := mod(quotient, 10 + 26);
            quotient := floor(quotient  / (10 + 26));
            if remainder < 26 then
                digit := chr(ascii('A') + remainder);
            else
                digit := chr(ascii('0') + remainder - 26);
            end if;
            ret := digit || ret;
        end loop compress_loop;
        if length(ret) < 5 then ret := lpad(ret, 4, 'A'); end if ;
        return upper(ret);
    end compress_int;
`), r += `begin
`;
    let l = !1;
    const d = a.apexUser();
    a.hasRowKey() && (r += `    :new.row_key := compress_int(row_key_seq.nextval);
`, l = !0);
    for (const m of a.children) {
      const h = Be(m);
      h !== "" && (r += "    :new." + m.parseName().toLowerCase() + " := " + h + "(:new." + m.parseName().toLowerCase() + `);
`, l = !0);
    }
    if (a.hasRowVersion() && (r += `    :new.row_version := 1;
`, l = !0), a.hasAuditCols()) {
      const m = a.auditSysDateFn();
      r += "    :new." + this.ctx.getOptionValue("createdcol") + " := " + m + `;
`, r += "    :new." + this.ctx.getOptionValue("createdbycol") + " := " + d + `;
`, r += "    :new." + this.ctx.getOptionValue("updatedcol") + " := " + m + `;
`, r += "    :new." + this.ctx.getOptionValue("updatedbycol") + " := " + d + `;
`, l = !0;
    }
    const f = this.ctx.additionalColumns();
    for (const m in f) {
      const h = f[m];
      r += "    if :new." + m + ` is null then
`, h.startsWith("INT") ? r += "        " + m + ` := 0;
` : r += "        " + m + ` := 'N/A';
`, r += `    end if;
`, l = !0;
    }
    return l ? (r += "end " + s + this.naming.bi + `;
/

`, r) : "";
  }
  _generateBUTrigger(a) {
    if (a.isOption("immutable")) return "";
    let n = !1;
    for (const h of a.children)
      if (h.isOption("lower") || h.isOption("upper")) {
        n = !0;
        break;
      }
    const s = a.hasRowVersion(), r = a.hasAuditCols();
    if (!n && !s && !r) return "";
    const l = this.ctx.optionEQvalue("editionable", "yes") ? " editionable" : "", d = (this.ctx.objPrefix() + a.parseName()).toLowerCase();
    let f = `create or replace${l} trigger ${d}${this.naming.bu}
`;
    f += `    before update
    on ` + d + `
    for each row
begin
`;
    const m = a.apexUser();
    for (const h of a.children) {
      const o = Be(h);
      o !== "" && (f += "    :new." + h.parseName().toLowerCase() + " := " + o + "(:new." + h.parseName().toLowerCase() + `);
`);
    }
    if (s && (f += `    :new.row_version := nvl(:old.row_version, 0) + 1;
`), r) {
      const h = a.auditSysDateFn();
      f += "    :new." + this.ctx.getOptionValue("updatedcol") + " := " + h + `;
`, f += "    :new." + this.ctx.getOptionValue("updatedbycol") + " := " + m + `;
`;
    }
    return f += "end " + d + this.naming.bu + `;
/

`, f;
  }
  generateImmutableTrigger(a) {
    if (a.inferType() !== "table" || !a.isOption("immutable")) return "";
    const n = this.ctx.getOptionValue("db");
    if (n && n.length > 0 && 23 <= (Y(n) ?? 0)) return "";
    const s = this.ctx.objPrefix() + a.parseName();
    let r = "create or replace trigger " + this.naming.immutable_prefix + s.toLowerCase() + this.naming.immutable_suffix + `
`;
    return r += `    before update or delete
    on ` + s.toLowerCase() + `
declare
`, r += `    co_immutable_err  constant pls_integer      := -20055;
`, r += "    co_immutable_msg  constant varchar2(200 char) := '" + s.toLowerCase() + ` is immutable';
`, r += `begin
    raise_application_error(co_immutable_err, co_immutable_msg);
end;
/

`, r;
  }
  // ── Table API (TAPI) ──────────────────────────────────────────────────────
  /** True when tenant_id is injected synthetically (global tenantid:yes, not via FK hierarchy). */
  _hasSyntheticTenantId(a) {
    return this.ctx.optionEQvalue("tenantid", !0) && !a.isOption("notenantid") && a.findChild("tenant_id") === null && !Object.prototype.hasOwnProperty.call(a.fks ?? {}, "tenant_id");
  }
  procDecl(a, n) {
    const s = n !== "get" ? " default null" : "", r = n !== "get" ? " in" : "out";
    let l = i + "procedure " + n + `_row (
`;
    const d = a.getPkName(), f = a.getGenIdColName() !== null ? null : a.findChild(a.getExplicitPkName()), m = f ? f.getPlsqlType() : a.getPkType();
    l += i + i + "p_" + d + "        in  " + m + s, this._hasSyntheticTenantId(a) && (l += `,
` + i + i + "p_tenant_id   " + r + "  integer" + s);
    for (const h in a.fks ?? {}) {
      const o = a.fks[h];
      let u = "integer";
      const x = this.ctx.find(o);
      x !== null && (u = ha(x) ?? u), l += `,
` + i + i + "P_" + h + "   " + r + "  " + u + s;
    }
    for (const h of a.regularColumns())
      l += `,
` + i + i + "P_" + h.parseName() + "   " + r + "  " + h.getPlsqlType() + s;
    return l += `
    )`, l;
  }
  _getRowBody(a) {
    const n = a.getPkName(), s = this.ctx.objPrefix() + a.parseName(), r = this._hasSyntheticTenantId(a);
    let l = i + `is 
` + i + `begin 
`;
    const d = [], f = [];
    r && (d.push("tenant_id"), f.push("p_tenant_id"));
    for (const m in a.fks ?? {})
      d.push(m), f.push("p_" + m);
    for (const m of a.regularColumns()) {
      const h = m.parseName().toLowerCase();
      d.push(h), f.push("p_" + h);
    }
    if (d.length > 0) {
      const m = i + i + "       ";
      l += i + i + "select " + d.join(`,
` + m) + `
`, l += i + i + "  into " + f.join(`,
` + m) + `
`, l += i + i + "  from " + s + `
`, l += i + i + " where " + n + " = p_" + n, r && (l += `
` + i + i + "   and tenant_id = p_tenant_id"), l += `;
`;
    }
    return l += i + `exception
` + i + i + `when no_data_found then
` + i + i + i + `null;
`, l += i + `end get_row;
 
`, l;
  }
  _insertRowBody(a) {
    const n = a.getPkName(), s = this.ctx.objPrefix() + a.parseName(), r = this._hasSyntheticTenantId(a);
    let l = i + `is 
` + i + `begin 
`;
    l += i + i + "insert into " + s + ` ( 
` + i + i + i + n, r && (l += `,
` + i + i + i + "tenant_id");
    for (const d in a.fks ?? {}) l += `,
` + i + i + i + d;
    for (const d of a.regularColumns()) l += `,
` + i + i + i + d.parseName().toLowerCase();
    l += `
` + i + i + `) values ( 
` + i + i + i + "p_" + n, r && (l += `,
` + i + i + i + "p_tenant_id");
    for (const d in a.fks ?? {}) l += `,
` + i + i + i + "p_" + d;
    for (const d of a.regularColumns()) l += `,
` + i + i + i + "p_" + d.parseName();
    return l += `
` + i + i + ");", l += `
` + i + `end insert_row;
 
 
`, l;
  }
  _updateRowBody(a) {
    const n = a.getPkName(), s = this.ctx.objPrefix() + a.parseName(), r = this._hasSyntheticTenantId(a);
    let l = i + `is 
` + i + `begin 
`;
    l += i + i + "update  " + s + ` set 
` + i + i + i + n + " = p_" + n;
    for (const d in a.fks ?? {}) l += `,
` + i + i + i + d + " = P_" + d;
    for (const d of a.regularColumns())
      l += `,
` + i + i + i + d.parseName().toLowerCase() + " = P_" + d.parseName().toLowerCase();
    return l += `
` + i + i + "where " + n + " = p_" + n, r && (l += `
` + i + i + "  and tenant_id = p_tenant_id"), l += ";", l += `
` + i + `end update_row;
 
 
`, l;
  }
  // ── Layered TAPI ─────────────────────────────────────────────────────────
  _hasAuditLog(a) {
    return a.isOption("auditlog");
  }
  _hasVersionCol(a) {
    return a.hasRowVersion() || a.children.some(
      (n) => n.children.length === 0 && n.parseName().toLowerCase() === "row_version"
    );
  }
  _hasUniqueCol(a) {
    return a.children.some((n) => n.isOption("unique"));
  }
  // Non-PK, non-version regular columns used as SVC scalar parameters.
  _svcCols(a) {
    return a.children.filter(
      (n) => n.children.length === 0 && n.refId() === null && n.parseName().toLowerCase() !== "row_version"
    );
  }
  _generateDalSpec(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_dal", r = a.children.filter((d) => d.isOption("unique"));
    let l = `create or replace package ${s} as

`;
    l += `${i}subtype t_id is ${n}.id%type;

`, l += `${i}function get_by_id  (p_id in t_id) return ${n}%rowtype;
`, l += `${i}function lock_by_id (p_id in t_id) return ${n}%rowtype;

`;
    for (const d of r) {
      const f = d.parseName().toLowerCase();
      l += `${i}function get_by_${f} (p_${f} in ${n}.${f}%type) return ${n}%rowtype;

`;
    }
    return l += `${i}type t_cursor is ref cursor return ${n}%rowtype;
`, l += `${i}function get_all return t_cursor;

`, l += `${i}procedure insert_row (p_row in out nocopy ${n}%rowtype);

`, l += `${i}procedure update_row (p_row in out nocopy ${n}%rowtype);

`, l += `${i}procedure delete_row (p_id in t_id);

`, l += `${i}c_err_stale_data constant pls_integer := -20001;
`, l += `${i}c_err_not_found  constant pls_integer := -20002;
`, l += `${i}c_err_locked     constant pls_integer := -20003;

`, l += `end ${s};
/
`, l;
  }
  _generateDalBody(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_dal", r = (a.getPkName() ?? "id").toLowerCase(), l = this._hasVersionCol(a), d = a.hasAuditCols(), f = this._svcCols(a), m = Object.keys(a.fks ?? {}), h = a.children.filter((k) => k.isOption("unique"));
    let o = `create or replace package body ${s} as

`;
    o += `${i}resource_busy exception;
`, o += `${i}pragma exception_init(resource_busy, -54);

`, o += `${i}function get_by_id (p_id in t_id) return ${n}%rowtype is
`, o += `${i}${i}l_row ${n}%rowtype;
`, o += `${i}begin
`, o += `${i}${i}select * into l_row from ${n} where ${r} = p_id;
`, o += `${i}${i}return l_row;
`, o += `${i}end get_by_id;

`, o += `${i}function lock_by_id (p_id in t_id) return ${n}%rowtype is
`, o += `${i}${i}l_row ${n}%rowtype;
`, o += `${i}begin
`, o += `${i}${i}select * into l_row
`, o += `${i}${i}from   ${n}
`, o += `${i}${i}where  ${r} = p_id
`, o += `${i}${i}for update nowait;
`, o += `${i}${i}return l_row;
`, o += `${i}exception
`, o += `${i}${i}when no_data_found then
`, o += `${i}${i}${i}raise_application_error(c_err_not_found, '${n}: record not found (id=' || p_id || ')');
`, o += `${i}${i}when resource_busy then
`, o += `${i}${i}${i}raise_application_error(c_err_locked, '${n}: record locked by another session');
`, o += `${i}end lock_by_id;

`;
    for (const k of h) {
      const y = k.parseName().toLowerCase();
      o += `${i}function get_by_${y} (p_${y} in ${n}.${y}%type) return ${n}%rowtype is
`, o += `${i}${i}l_row ${n}%rowtype;
`, o += `${i}begin
`, o += `${i}${i}select * into l_row from ${n} where ${y} = p_${y};
`, o += `${i}${i}return l_row;
`, o += `${i}end get_by_${y};

`;
    }
    o += `${i}function get_all return t_cursor is
`, o += `${i}${i}l_cur t_cursor;
`, o += `${i}begin
`, o += `${i}${i}open l_cur for select * from ${n};
`, o += `${i}${i}return l_cur;
`, o += `${i}end get_all;

`;
    const u = this._hasSyntheticTenantId(a), x = [
      ...u ? ["tenant_id"] : [],
      ...m.map((k) => k.toLowerCase()),
      ...f.map((k) => k.parseName().toLowerCase())
    ], g = [
      ...u ? ["p_row.tenant_id"] : [],
      ...m.map((k) => `p_row.${k.toLowerCase()}`),
      ...f.map((k) => `p_row.${k.parseName().toLowerCase()}`)
    ];
    if (o += `${i}procedure insert_row (p_row in out nocopy ${n}%rowtype) is
`, o += `${i}begin
`, o += `${i}${i}insert into ${n} (
`, o += `${i}${i}${i}` + x.join(`,
${i}${i}${i}`) + `
`, o += `${i}${i}) values (
`, o += `${i}${i}${i}` + g.join(`,
${i}${i}${i}`) + `
`, o += `${i}${i})`, l) {
      const k = String(this.ctx.getOptionValue("createdcol") ?? "created"), y = String(this.ctx.getOptionValue("createdbycol") ?? "created_by"), B = [`${r}`, "row_version"], N = [`p_row.${r}`, "p_row.row_version"];
      d && (B.push(k, y), N.push(`p_row.${k}`, `p_row.${y}`)), o += `
${i}${i}returning ${B.join(", ")}
`, o += `${i}${i}     into ${N.join(", ")}`;
    } else
      o += `
${i}${i}returning ${r}
`, o += `${i}${i}     into p_row.${r}`;
    o += `;
`, o += `${i}end insert_row;

`;
    const T = [
      ...m.map((k) => `${k.toLowerCase()} = p_row.${k.toLowerCase()}`),
      ...f.map((k) => `${k.parseName().toLowerCase()} = p_row.${k.parseName().toLowerCase()}`)
    ];
    return o += `${i}procedure update_row (p_row in out nocopy ${n}%rowtype) is
`, o += `${i}${i}l_id t_id;
`, o += `${i}begin
`, o += `${i}${i}l_id := p_row.${r};
`, o += `${i}${i}update ${n} set
`, o += `${i}${i}${i}` + T.join(`,
${i}${i}${i}`) + `
`, o += `${i}${i}where ${r} = l_id`, l && (o += `
${i}${i}  and row_version = p_row.row_version`), o += `;
`, l && (o += `${i}${i}if sql%rowcount = 0 then
`, o += `${i}${i}${i}declare l_dummy pls_integer;
`, o += `${i}${i}${i}begin
`, o += `${i}${i}${i}${i}select 1 into l_dummy from ${n} where ${r} = l_id;
`, o += `${i}${i}${i}${i}raise_application_error(c_err_stale_data, 'row modified by another session. reload and retry.');
`, o += `${i}${i}${i}exception
`, o += `${i}${i}${i}${i}when no_data_found then
`, o += `${i}${i}${i}${i}${i}raise_application_error(c_err_not_found, 'record ' || l_id || ' does not exist.');
`, o += `${i}${i}${i}end;
`, o += `${i}${i}end if;
`), o += `${i}end update_row;

`, o += `${i}procedure delete_row (p_id in t_id) is
`, o += `${i}begin
`, o += `${i}${i}delete from ${n} where ${r} = p_id;
`, o += `${i}end delete_row;

`, o += `end ${s};
/
`, o;
  }
  _generateHksSpec(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_dal", r = n + "_hks";
    let l = `create or replace package ${r} as

`;
    return l += `${i}procedure validate (
`, l += `${i}${i}p_operation in varchar2,
`, l += `${i}${i}p_row       in out nocopy ${n}%rowtype
`, l += `${i});

`, l += `${i}procedure before_insert (p_row in out nocopy ${n}%rowtype);
`, l += `${i}procedure before_update (p_row in out nocopy ${n}%rowtype);
`, l += `${i}procedure before_delete (p_id in ${s}.t_id);

`, l += `${i}procedure after_insert (p_row in ${n}%rowtype);
`, l += `${i}procedure after_update (p_row in ${n}%rowtype);
`, l += `${i}procedure after_delete (p_id in ${s}.t_id);

`, l += `end ${r};
/
`, l;
  }
  _generateHksBody(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_dal", r = n + "_hks";
    let l = `create or replace package body ${r} as
`;
    return l += `-- warning: this file is generated once and must not be overwritten

`, l += `${i}procedure validate (
`, l += `${i}${i}p_operation in varchar2,
`, l += `${i}${i}p_row       in out nocopy ${n}%rowtype
`, l += `${i}) is begin null; end validate;

`, l += `${i}procedure before_insert (p_row in out nocopy ${n}%rowtype) is begin null; end;
`, l += `${i}procedure before_update (p_row in out nocopy ${n}%rowtype) is begin null; end;
`, l += `${i}procedure before_delete (p_id in ${s}.t_id) is begin null; end;

`, l += `${i}procedure after_insert  (p_row in ${n}%rowtype) is begin null; end;
`, l += `${i}procedure after_update  (p_row in ${n}%rowtype) is begin null; end;
`, l += `${i}procedure after_delete  (p_id in ${s}.t_id)     is begin null; end;

`, l += `end ${r};
/
`, l;
  }
  /**
   * Ordered list of t_rec / APX parameter descriptors: FK cols → tenant_id → regular cols.
   * Single source of truth for SVC t_rec fields and APX parameter lists.
   */
  _svcParamCols(a) {
    const n = [];
    for (const s of Object.keys(a.fks ?? {}))
      n.push({ name: s.toLowerCase(), nullable: !0 });
    this._hasSyntheticTenantId(a) && n.push({ name: "tenant_id", nullable: !1 });
    for (const s of this._svcCols(a))
      n.push({ name: s.parseName().toLowerCase(), nullable: !s.isOption("nn") });
    return n;
  }
  _generateSvcSpec(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_svc", r = (a.getPkName() ?? "id").toLowerCase(), l = this._hasVersionCol(a), d = this._svcParamCols(a);
    let f = `create or replace package ${s} as

`;
    return f += `${i}type t_rec is record (
`, f += d.map(({ name: m }) => `${i}${i}${m.padEnd(20)}${n}.${m}%type`).join(`,
`) + `
`, f += `${i});

`, f += `${i}function get (p_id in ${n}.${r}%type) return ${n}%rowtype;

`, f += `${i}procedure create_rec (
`, f += `${i}${i}p_rec in  t_rec,
`, f += `${i}${i}x_id  out ${n}.${r}%type
`, f += `${i});

`, f += `${i}procedure update_rec (
`, f += `${i}${i}p_id  in ${n}.${r}%type,
`, f += `${i}${i}p_rec in t_rec`, l && (f += `,
${i}${i}p_row_version in ${n}.row_version%type`), f += `
${i});

`, f += `${i}procedure delete_rec (p_id in ${n}.${r}%type);

`, f += `end ${s};
/
`, f;
  }
  _generateSvcBody(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_dal", r = n + "_hks", l = n + "_svc", d = n + "_audit", f = (a.getPkName() ?? "id").toLowerCase(), m = this._hasVersionCol(a), h = this._hasUniqueCol(a), o = this._hasAuditLog(a), u = this._svcParamCols(a);
    let x = `create or replace package body ${l} as

`;
    x += `${i}function get (p_id in ${n}.${f}%type) return ${n}%rowtype is
`, x += `${i}begin
`, x += `${i}${i}return ${s}.get_by_id(p_id => p_id);
`, x += `${i}end get;

`, x += `${i}procedure p_do_create (
`, x += `${i}${i}p_rec in  t_rec,
`, x += `${i}${i}l_row in out nocopy ${n}%rowtype
`, x += `${i}) is
`, x += `${i}begin
`;
    for (const { name: g } of u)
      x += `${i}${i}l_row.${g} := p_rec.${g};
`;
    x += `${i}${i}${r}.validate(p_operation => 'insert', p_row => l_row);
`, x += `${i}${i}${r}.before_insert(p_row => l_row);
`, x += `${i}${i}${s}.insert_row(p_row => l_row);
`, x += `${i}${i}${r}.after_insert(p_row => l_row);
`, o && (x += `${i}${i}${d}.log_insert(p_row => l_row);
`), x += `${i}end p_do_create;

`, x += `${i}procedure create_rec (
`, x += `${i}${i}p_rec in  t_rec,
`, x += `${i}${i}x_id  out ${n}.${f}%type
`, x += `${i}) is
`, x += `${i}${i}l_row ${n}%rowtype;
`, x += `${i}begin
`, x += `${i}${i}p_do_create(p_rec => p_rec, l_row => l_row);
`, x += `${i}${i}x_id := l_row.${f};
`, h && (x += `${i}exception
`, x += `${i}${i}when dup_val_on_index then
`, x += `${i}${i}${i}raise_application_error(-20010, 'duplicate value on unique constraint.');
`), x += `${i}end create_rec;

`, x += `${i}procedure update_rec (
`, x += `${i}${i}p_id  in ${n}.${f}%type,
`, x += `${i}${i}p_rec in t_rec`, m && (x += `,
${i}${i}p_row_version in ${n}.row_version%type`), x += `
${i}) is
`, x += `${i}${i}l_row ${n}%rowtype;
`, o && (x += `${i}${i}l_old_row ${n}%rowtype;
`), x += `${i}begin
`, x += `${i}${i}l_row := ${s}.get_by_id(p_id => p_id);
`, o && (x += `${i}${i}l_old_row := l_row;
`);
    for (const { name: g } of u)
      x += `${i}${i}l_row.${g} := p_rec.${g};
`;
    return m && (x += `${i}${i}l_row.row_version := p_row_version;
`), x += `${i}${i}${r}.validate(p_operation => 'update', p_row => l_row);
`, x += `${i}${i}${r}.before_update(p_row => l_row);
`, x += `${i}${i}${s}.update_row(p_row => l_row);
`, x += `${i}${i}${r}.after_update(p_row => l_row);
`, o && (x += `${i}${i}${d}.log_update(p_old_row => l_old_row, p_new_row => l_row);
`), x += `${i}end update_rec;

`, x += `${i}procedure delete_rec (p_id in ${n}.${f}%type) is
`, o && (x += `${i}${i}l_old_row ${n}%rowtype;
`), x += `${i}begin
`, o && (x += `${i}${i}l_old_row := ${s}.get_by_id(p_id => p_id);
`), x += `${i}${i}${r}.before_delete(p_id => p_id);
`, x += `${i}${i}${s}.delete_row(p_id => p_id);
`, x += `${i}${i}${r}.after_delete(p_id => p_id);
`, o && (x += `${i}${i}${d}.log_delete(p_old_row => l_old_row);
`), x += `${i}end delete_rec;

`, x += `end ${l};
/
`, x;
  }
  _generateApxSpec(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_apx", r = (a.getPkName() ?? "id").toLowerCase(), l = this._hasVersionCol(a), d = a.hasAuditCols(), f = this._svcParamCols(a), m = String(this.ctx.getOptionValue("createdcol") ?? "created"), h = String(this.ctx.getOptionValue("createdbycol") ?? "created_by"), o = String(this.ctx.getOptionValue("updatedcol") ?? "updated"), u = String(this.ctx.getOptionValue("updatedbycol") ?? "updated_by");
    let x = `create or replace package ${s} as

`;
    x += `${i}procedure get (
`, x += `${i}${i}p_id          in  ${n}.${r}%type`;
    for (const { name: k } of f)
      x += `,
${i}${i}p_${k.padEnd(13)} out ${n}.${k}%type`;
    l && (x += `,
${i}${i}p_row_version  out ${n}.row_version%type`), d && (x += `,
${i}${i}p_${m.padEnd(13)} out ${n}.${m}%type`, x += `,
${i}${i}p_${h.padEnd(13)} out ${n}.${h}%type`, x += `,
${i}${i}p_${o.padEnd(13)} out ${n}.${o}%type`, x += `,
${i}${i}p_${u.padEnd(13)} out ${n}.${u}%type`), x += `
${i});

`, x += `${i}procedure ins (
`;
    const g = [];
    for (const { name: k, nullable: y } of f)
      g.push(`${i}${i}p_${k.padEnd(13)} in  ${n}.${k}%type${y ? " default null" : ""}`);
    g.push(`${i}${i}p_id           out ${n}.${r}%type`), x += g.join(`,
`) + `
${i});

`, x += `${i}procedure upd (
`;
    const T = [];
    T.push(`${i}${i}p_id           in  ${n}.${r}%type`);
    for (const { name: k, nullable: y } of f)
      T.push(`${i}${i}p_${k.padEnd(13)} in  ${n}.${k}%type${y ? " default null" : ""}`);
    return l && T.push(`${i}${i}p_row_version  in  ${n}.row_version%type`), x += T.join(`,
`) + `
${i});

`, x += `${i}procedure del (p_id in ${n}.${r}%type);

`, x += `end ${s};
/
`, x;
  }
  _generateApxBody(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_svc", r = n + "_apx", l = (a.getPkName() ?? "id").toLowerCase(), d = this._hasVersionCol(a), f = a.hasAuditCols(), m = this._svcParamCols(a), h = String(this.ctx.getOptionValue("createdcol") ?? "created"), o = String(this.ctx.getOptionValue("createdbycol") ?? "created_by"), u = String(this.ctx.getOptionValue("updatedcol") ?? "updated"), x = String(this.ctx.getOptionValue("updatedbycol") ?? "updated_by");
    let g = `create or replace package body ${r} as

`;
    g += `${i}procedure get (
`, g += `${i}${i}p_id          in  ${n}.${l}%type`;
    for (const { name: y } of m)
      g += `,
${i}${i}p_${y.padEnd(13)} out ${n}.${y}%type`;
    d && (g += `,
${i}${i}p_row_version  out ${n}.row_version%type`), f && (g += `,
${i}${i}p_${h.padEnd(13)} out ${n}.${h}%type`, g += `,
${i}${i}p_${o.padEnd(13)} out ${n}.${o}%type`, g += `,
${i}${i}p_${u.padEnd(13)} out ${n}.${u}%type`, g += `,
${i}${i}p_${x.padEnd(13)} out ${n}.${x}%type`), g += `
${i}) is
`, g += `${i}${i}l_row ${n}%rowtype;
`, g += `${i}begin
`, g += `${i}${i}l_row := ${s}.get(p_id => p_id);
`;
    for (const { name: y } of m)
      g += `${i}${i}p_${y} := l_row.${y};
`;
    d && (g += `${i}${i}p_row_version := l_row.row_version;
`), f && (g += `${i}${i}p_${h} := l_row.${h};
`, g += `${i}${i}p_${o} := l_row.${o};
`, g += `${i}${i}p_${u} := l_row.${u};
`, g += `${i}${i}p_${x} := l_row.${x};
`), g += `${i}end get;

`, g += `${i}procedure ins (
`;
    const T = [];
    for (const { name: y, nullable: B } of m)
      T.push(`${i}${i}p_${y.padEnd(13)} in  ${n}.${y}%type${B ? " default null" : ""}`);
    T.push(`${i}${i}p_id           out ${n}.${l}%type`), g += T.join(`,
`) + `
${i}) is
`, g += `${i}${i}l_rec ${s}.t_rec;
`, g += `${i}begin
`;
    for (const { name: y } of m)
      g += `${i}${i}l_rec.${y} := p_${y};
`;
    g += `${i}${i}${s}.create_rec(p_rec => l_rec, x_id => p_id);
`, g += `${i}end ins;

`, g += `${i}procedure upd (
`;
    const k = [];
    k.push(`${i}${i}p_id           in  ${n}.${l}%type`);
    for (const { name: y, nullable: B } of m)
      k.push(`${i}${i}p_${y.padEnd(13)} in  ${n}.${y}%type${B ? " default null" : ""}`);
    d && k.push(`${i}${i}p_row_version  in  ${n}.row_version%type`), g += k.join(`,
`) + `
${i}) is
`, g += `${i}${i}l_rec ${s}.t_rec;
`, g += `${i}begin
`;
    for (const { name: y } of m)
      g += `${i}${i}l_rec.${y} := p_${y};
`;
    return g += `${i}${i}${s}.update_rec(
`, g += `${i}${i}${i}p_id  => p_id,
`, g += `${i}${i}${i}p_rec => l_rec`, d && (g += `,
${i}${i}${i}p_row_version => p_row_version`), g += `
${i}${i});
`, g += `${i}end upd;

`, g += `${i}procedure del (p_id in ${n}.${l}%type) is
`, g += `${i}begin
`, g += `${i}${i}${s}.delete_rec(p_id => p_id);
`, g += `${i}end del;

`, g += `end ${r};
/
`, g;
  }
  _generateAuditSpec(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_audit";
    let r = `create or replace package ${s} as

`;
    return r += `${i}g_enabled boolean := true;

`, r += `${i}procedure log_insert (p_row     in ${n}%rowtype);
`, r += `${i}procedure log_update (p_old_row in ${n}%rowtype, p_new_row in ${n}%rowtype);
`, r += `${i}procedure log_delete (p_old_row in ${n}%rowtype);

`, r += `end ${s};
/
`, r;
  }
  _generateAuditBody(a) {
    const n = (this.ctx.objPrefix() + a.parseName()).toLowerCase(), s = n + "_dal", r = n + "_audit", l = (a.getPkName() ?? "id").toLowerCase(), d = String(a.getOptionValue("auditlog") || "").trim() || "app_audit_log", f = (this.ctx.objPrefix() + d).toLowerCase(), m = f + "_svc", h = this._hasVersionCol(a), o = Object.keys(a.fks ?? {}).map((B) => B.toLowerCase()), u = this._svcCols(a).map((B) => B.parseName().toLowerCase()), g = (this.ctx.find(d)?.children ?? []).some((B) => B.parseName().toLowerCase() === "old_values"), T = this._hasSyntheticTenantId(a), k = [l, ...T ? ["tenant_id"] : [], ...o, ...u];
    h && k.push("row_version");
    let y = `create or replace package body ${r} as

`;
    if (g) {
      const B = k.map((N) => `${i}${i}${i}'${N}' value p_row.${N}`);
      y += `${i}function f_to_json (p_row in ${n}%rowtype) return clob is
`, y += `${i}begin
`, y += `${i}${i}return json_object(
`, y += B.join(`,
`) + `
`, y += `${i}${i}${i}returning clob
`, y += `${i}${i});
`, y += `${i}end f_to_json;

`;
    }
    return y += `${i}procedure p_log (
`, y += `${i}${i}p_operation  in varchar2,
`, y += `${i}${i}p_id         in ${s}.t_id`, g ? (y += `,
${i}${i}p_old_values in clob default null,
`, y += `${i}${i}p_new_values in clob default null
`) : y += `
`, y += `${i}) is
`, y += `${i}${i}pragma autonomous_transaction;
`, y += `${i}${i}l_rec ${m}.t_rec;
`, y += `${i}${i}l_id ${f}.id%type;
`, y += `${i}begin
`, y += `${i}${i}if not g_enabled then return; end if;
`, y += `${i}${i}l_rec.entity    := '${n}';
`, y += `${i}${i}l_rec.entity_id := p_id;
`, y += `${i}${i}l_rec.operation := p_operation;
`, g && (y += `${i}${i}l_rec.old_values := p_old_values;
`, y += `${i}${i}l_rec.new_values := p_new_values;
`), y += `${i}${i}${m}.create_rec(p_rec => l_rec, x_id => l_id);
`, y += `${i}${i}-- l_id holds the generated audit record id.
`, y += `${i}${i}-- use it here if needed, e.g. to notify, correlate, or route downstream:
`, y += `${i}${i}-- your_pkg.on_audit(p_audit_id => l_id, p_entity => '${n}', p_operation => p_operation);
`, y += `${i}${i}commit;
`, y += `${i}end p_log;

`, y += `${i}procedure log_insert (p_row in ${n}%rowtype) is
`, y += `${i}begin
`, g ? y += `${i}${i}p_log(p_operation => 'INSERT', p_id => p_row.${l}, p_new_values => f_to_json(p_row));
` : y += `${i}${i}p_log(p_operation => 'INSERT', p_id => p_row.${l});
`, y += `${i}end log_insert;

`, y += `${i}procedure log_update (p_old_row in ${n}%rowtype, p_new_row in ${n}%rowtype) is
`, y += `${i}begin
`, g ? y += `${i}${i}p_log(p_operation => 'UPDATE', p_id => p_new_row.${l}, p_old_values => f_to_json(p_old_row), p_new_values => f_to_json(p_new_row));
` : y += `${i}${i}p_log(p_operation => 'UPDATE', p_id => p_new_row.${l});
`, y += `${i}end log_update;

`, y += `${i}procedure log_delete (p_old_row in ${n}%rowtype) is
`, y += `${i}begin
`, g ? y += `${i}${i}p_log(p_operation => 'DELETE', p_id => p_old_row.${l}, p_old_values => f_to_json(p_old_row));
` : y += `${i}${i}p_log(p_operation => 'DELETE', p_id => p_old_row.${l});
`, y += `${i}end log_delete;

`, y += `end ${r};
/
`, y;
  }
  generateLayeredTAPI(a) {
    if (a.inferType() !== "table" || a.children.length === 0) return "";
    const n = this._hasAuditLog(a), s = String(this.ctx.getOptionValue("ifc") ?? "apex").toLowerCase();
    let r = this._generateDalSpec(a) + `
` + this._generateDalBody(a) + `
` + this._generateHksSpec(a) + `
` + this._generateHksBody(a) + `
` + this._generateSvcSpec(a) + `
`;
    return n && (r += this._generateAuditSpec(a) + `
`), r += this._generateSvcBody(a), n && (r += `
` + this._generateAuditBody(a)), (s === "apex" || s === "") && (r += `
` + this._generateApxSpec(a) + `
` + this._generateApxBody(a)), r;
  }
  generateTAPI(a) {
    if (a.children.length === 0) return "";
    const n = this.ctx.objPrefix() + a.parseName(), s = a.getPkName(), r = this._hasSyntheticTenantId(a), l = r ? `,
        p_tenant_id           in integer` : "", d = s + " = p_" + s + (r ? " and tenant_id = p_tenant_id" : "");
    let f = ("create or replace package " + n.toLowerCase() + `_API
is

`).toLowerCase();
    return f += this.procDecl(a, "get") + `;

`, f += this.procDecl(a, "insert") + `;

`, f += this.procDecl(a, "update") + `;

`, f += `    procedure delete_row (
        p_` + s + "              in integer" + l + `
    );
end ` + n.toLowerCase() + `_api;
/

`, f += ("create or replace package body " + n.toLowerCase() + `_API
is

`).toLowerCase(), f += this.procDecl(a, "get") + `
` + this._getRowBody(a), f += this.procDecl(a, "insert") + `
` + this._insertRowBody(a), f += this.procDecl(a, "update") + `
` + this._updateRowBody(a), f += `    procedure delete_row (
        p_` + s + "              in integer" + l + `
    )
    is
    begin
        delete from ` + n.toLowerCase() + " where " + d + `;
    end delete_row;
end ` + n.toLowerCase() + `_api;
/
`, f.toLowerCase();
  }
}
const pa = " not null";
function ba(p) {
  return p.lastIndexOf(`,
`) === p.length - 2 && (p = p.substring(0, p.length - 2) + `
`), p;
}
class ga extends fa {
  constructor(a, n) {
    super(a), this._naming = n ?? se, this._view = new ma(a, this._naming), this._plsql = new xa(a, this._naming);
  }
  /** Map a SemanticType to an Oracle DDL column type string. */
  colType(a) {
    return this._toOracleType(a);
  }
  _pkTypeModifier(a, n) {
    return Ge(a, this._ddl, n ?? this._naming);
  }
  _globalOnDelete() {
    const a = this._ddl.getOptionValue("ondelete") ?? "";
    return a === "cascade" ? " on delete cascade" : a === "set null" ? " on delete set null" : a === "restrict" ? " on delete restrict" : "";
  }
  /** Constraint-line prefix — aligns 'constraint' keyword under the type column. */
  _cpad(a) {
    return i + i + " ".repeat(a.parent.maxChildNameLen());
  }
  _fkColType(a) {
    const n = a.getExplicitPkName();
    if (n === null || n.includes(",")) return null;
    const s = a.findChild(n);
    return s !== null ? this._toOracleType(s._inferTypeFull()) : a.getPkType();
  }
  _toOracleType(a) {
    return De(a, this._ddl.semantics(), Re(this._ddl));
  }
  _buildColumnConstraints(a, n, s) {
    if (a.isOption("unique") || a.isOption("uk")) {
      const l = a.parent !== null && a.parent.isOption("notenantid");
      (!this._ddl.optionEQvalue("tenantid", !0) || l) && (n += `
`, n += this._cpad(a) + "constraint " + z(this._ddl.objPrefix(), s.parent_child, this._naming.unq) + " unique");
    }
    let r = "'";
    if ((n.startsWith("integer") || n.startsWith("number") || n.startsWith("date")) && (r = ""), a.isOption("default")) {
      const l = a.getDefaultValue() ?? "", d = ["sysdate", "current_date", "current_timestamp", "systimestamp", "localtimestamp"];
      if (s.isNativeBoolean) {
        const f = l.toUpperCase() === "Y" || l.toLowerCase() === "true" ? "true" : "false";
        n += " default on null " + f;
      } else d.includes(l.toLowerCase()) ? n += " default on null " + l : n += " default on null " + r + l + r;
    }
    if ((a.isOption("nn") || a.indexOf("not") + 1 === a.indexOf("null")) && a.indexOf("pk") < 0 && (n += " not null"), (a.isOption("hidden") || a.isOption("invincible")) && (n += " invisible"), s.isNativeBoolean || (n += a.genConstraint(r)), s.needsBoolCheck && (n += `
` + this._cpad(a) + "constraint " + z(this._ddl.objPrefix(), s.parent_child) + ` check (${a.parseName()} in ('Y','N'))`), a.isOption("between")) {
      const l = a.getBetweenClause() ?? "";
      n += " constraint " + z(s.parent_child, this._naming.bet) + `
`, n += "           check (" + a.parseName() + " between " + l + ")";
    }
    if (a.isOption("pk")) {
      const l = n.startsWith("number") ? " " + this._pkTypeModifier(this._ddl.objPrefix() + a.parent.parseName()) : " not null";
      n += l + `
`, n += this._cpad(a) + "constraint " + z(this._ddl.objPrefix(), s.parent_child, this._naming.pk) + " primary key";
    }
    return a.annotations !== null && (0 <= n.indexOf(`
`) ? n += `
` + this._cpad(a) + "annotations (" + a.annotations + ")" : n += " annotations (" + a.annotations + ")"), n;
  }
  _genSequence(a, n) {
    return this._ddl.optionEQvalue("pk", "SEQ") && this._ddl.optionEQvalue("genpk", !0) ? "create sequence  " + n + `_seq;

` : "";
  }
  _genTableHeader(a, n, s, r) {
    let l = "create " + s + "table " + n + ` (
`;
    const d = i + " ".repeat(a.maxChildNameLen() - 2);
    if (r !== null && !a.isOption("pk")) {
      l += i + r + d + "number " + this._pkTypeModifier(n) + `
`;
      const f = z(this._ddl.objPrefix("no schema") + a.parseName(), "_", r);
      l += i + i + " ".repeat(a.maxChildNameLen()) + "constraint " + z(f, this._naming.pk) + ` primary key,
`;
    } else {
      const f = a.getExplicitPkName();
      if (f !== null && f.indexOf(",") < 0) {
        const m = i + " ".repeat(a.maxChildNameLen() - f.length);
        let h = "number";
        const o = a.findChild(f);
        o !== null && (h = this.parseType(o)), l += i + f + m + h + `,
`;
      }
    }
    return l;
  }
  _genFkColumns(a, n) {
    let s = "";
    for (let r in a.fks) {
      let l = a.fks[r];
      if (0 < r.indexOf(",")) {
        const T = this._ddl.find(l), k = ce(r, ", ");
        for (let y = 0; y < k.length; y++) {
          const B = k[y];
          if (B === ",") continue;
          const N = T?.findChild(B), P = i + " ".repeat(a.maxChildNameLen() - B.length);
          s += i + B + P + (N ? this._toOracleType(N._inferTypeFull()) : "number") + `,
`;
        }
        continue;
      }
      let d = "number";
      const f = a.findChild(r);
      f !== null && (d = f.inferType());
      let m = this._ddl.find(l), h = "";
      m !== null ? d = this._fkColType(m) ?? d : (m = this._ddl.find(r), m?.isMany2One?.() && !r.endsWith("_id") && (l = r, r = D(r) ?? r, h = "_id"));
      const o = i + " ".repeat(a.maxChildNameLen() - r.length);
      s += i + r + h + o + d;
      const u = this._ddl.find(l) !== null ? this._ddl.objPrefix() : "", x = r + h;
      if (this._ddl.optionEQvalue("tenantid", !0) && !a.isOption("notenantid") && m !== null && !m.isOption("notenantid") && x !== "tenant_id") {
        s += `,
`;
        const T = u + l, k = T + "_tid_id_uix", y = T + "_tid_id_uq", B = `create unique index ${k}
    on ${T} (tenant_id, id);
`, N = `alter table ${T}
    add constraint ${y}
    unique (tenant_id, id) using index ${k};
`;
        this._ddl.postponedAltersSet.has(B) || (this._ddl.postponedAlters.push(B), this._ddl.postponedAltersSet.add(B), this._ddl.postponedAlters.push(N), this._ddl.postponedAltersSet.add(N));
        let P = "";
        a.isOption("cascade") ? P = " on delete cascade" : a.isOption("setnull") && (P = " on delete set null");
        for (const fe in a.children) {
          const X = a.children[fe];
          if (x === X.parseName()) {
            X.isOption("cascade") ? P = " on delete cascade" : X.isOption("setnull") && (P = " on delete set null");
            break;
          }
        }
        P || (P = this._globalOnDelete());
        const I = n + "_" + x + this._naming.fk, $ = "alter table " + n + " add constraint " + I + `
    foreign key (tenant_id, ` + x + `)
    references ` + u + l + " (tenant_id, id)" + P + `;
`;
        this._ddl.postponedAltersSet.has($) || (this._ddl.postponedAlters.push($), this._ddl.postponedAltersSet.add($));
      } else if (m !== null && (m.line < a.line || m.isMany2One())) {
        s += i + i + " ".repeat(a.maxChildNameLen()) + "constraint " + n + "_" + r + this._naming.fk + `
`;
        let T = "";
        a.isOption("cascade") ? T = " on delete cascade" : a.isOption("setnull") && (T = " on delete set null");
        let k = "";
        for (const y in a.children) {
          const B = a.children[y];
          if (r === B.parseName()) {
            (B.isOption("nn") || B.isOption("notnull")) && (k = pa), B.isOption("cascade") ? T = " on delete cascade" : B.isOption("setnull") && (T = " on delete set null");
            break;
          }
        }
        T || (T = this._globalOnDelete()), s += i + i + " ".repeat(a.maxChildNameLen()) + "references " + u + l + T + k + `,
`;
      } else {
        s += `,
`;
        let T = "";
        a.isOption("cascade") ? T = " on delete cascade" : a.isOption("setnull") && (T = " on delete set null");
        for (const y in a.children) {
          const B = a.children[y];
          if (r === B.parseName()) {
            B.isOption("cascade") ? T = " on delete cascade" : B.isOption("setnull") && (T = " on delete set null");
            break;
          }
        }
        T || (T = this._globalOnDelete());
        const k = "alter table " + n + " add constraint " + n + "_" + r + "_fk foreign key (" + r + ") references " + u + l + T + `;
`;
        this._ddl.postponedAltersSet.has(k) || (this._ddl.postponedAlters.push(k), this._ddl.postponedAltersSet.add(k));
      }
    }
    return s;
  }
  _genTenantIdColumn(a) {
    if (!this._ddl.optionEQvalue("tenantid", !0) || a.isOption("notenantid") || a.findChild("tenant_id") !== null) return "";
    const n = i + " ".repeat(a.maxChildNameLen() - 9), s = a.isOption("insert") ? "" : " not null";
    return i + "tenant_id" + n + "number" + s + `,
`;
  }
  _genTenantIdFk(a, n) {
    if (!this._ddl.optionEQvalue("tenantid", !0) || a.isOption("notenantid") || a.findChild("tenant_id") !== null) return;
    const s = String(this._ddl.getOptionValue("tenantref") || "tenants");
    if (this._ddl.find(s) === null) return;
    const r = this._ddl.objPrefix() + s, l = n + "_tenant_id" + this._naming.fk, d = `alter table ${n} add constraint ${l}
    foreign key (tenant_id) references ${r} (id);
`;
    this._ddl.postponedAltersSet.has(d) || (this._ddl.postponedAlters.push(d), this._ddl.postponedAltersSet.add(d));
  }
  _genRowKeyColumn(a, n) {
    if (!a.hasRowKey()) return "";
    const s = i + " ".repeat(a.maxChildNameLen() - 7);
    let r = i + "row_key" + s + `varchar2(30${this._ddl.semantics()})
`;
    return r += i + i + " ".repeat(a.maxChildNameLen()) + "constraint " + n + "_row_key" + this._naming.unq + ` unique not null,
`, r;
  }
  _genRegularColumns(a, n, s) {
    let r = "";
    for (let l = 0; l < a.children.length; l++) {
      const d = a.children[l];
      if (!(s !== null && d.parseName() === "id") && !(0 < d.children.length) && d.refId() === null) {
        if (d.parseName() === a.getExplicitPkName()) continue;
        r += i + this.generateTable(d) + `,
`;
        for (const f in le)
          if (0 < d.indexOf(f)) {
            const m = d.parseName().toUpperCase();
            for (const h of le[f]) {
              const o = m + h.suffix.toUpperCase(), u = i + " ".repeat(a.maxChildNameLen() - o.length);
              r += i + o.toLowerCase() + u + h.type(this._ddl) + `,
`;
            }
            break;
          }
      }
    }
    return r;
  }
  _genRowVersionColumn(a) {
    if (!a.hasRowVersion()) return "";
    const n = i + " ".repeat(a.maxChildNameLen() - 11);
    return i + "row_version" + n + `integer not null,
`;
  }
  _genAuditColumns(a) {
    if (!a.hasAuditCols()) return "";
    let n = String(this._ddl.getOptionValue("auditdate") || this._ddl.getOptionValue("Date Data Type") || "").toLowerCase(), s = "";
    const r = String(this._ddl.getOptionValue("createdcol") ?? "");
    s += i + r + i + " ".repeat(a.maxChildNameLen() - r.length) + n + ` not null,
`;
    const l = String(this._ddl.getOptionValue("createdbycol") ?? "");
    s += i + l + i + " ".repeat(a.maxChildNameLen() - l.length) + `varchar2(255${this._ddl.semantics()}) not null,
`;
    const d = String(this._ddl.getOptionValue("updatedcol") ?? "");
    s += i + d + i + " ".repeat(a.maxChildNameLen() - d.length) + n + ` not null,
`;
    const f = String(this._ddl.getOptionValue("updatedbycol") ?? "");
    return s += i + f + i + " ".repeat(a.maxChildNameLen() - f.length) + `varchar2(255${this._ddl.semantics()}) not null,
`, s;
  }
  _genAdditionalColumns(a) {
    let n = "";
    const s = this._ddl.additionalColumns();
    for (const r in s) {
      const l = s[r], d = i + " ".repeat(a.maxChildNameLen() - r.length);
      n += i + r.toUpperCase() + d + l + ` not null,
`;
    }
    return n;
  }
  _genTableFooter(a, n, s, r) {
    const l = a.annotations !== null ? `
annotations (` + a.annotations + ")" : "";
    let d = "";
    (this._ddl.optionEQvalue("compress", "yes") || a.isOption("compress")) && (d = r ? " row store compress advanced" : " compress");
    let f = s !== "" ? `
no drop until 0 days idle
no delete until 16 days after insert` : "";
    f !== "" && d !== "" && (d = `
` + d.trimStart());
    let m = ")" + f + d + l + `;

`;
    if (a.isOption("audit") && !a.isOption("auditcols") && !a.isOption("audit", "col") && !a.isOption("audit", "cols") && !a.isOption("audit", "columns") && (m += "audit all on " + n + `;

`), a.isOption("flashback") || a.isOption("fda")) {
      const h = String(a.getOptionValue("flashback") || a.getOptionValue("fda") || "").trim();
      m += "alter table " + n + " flashback archive" + (0 < h.length ? " " + h : "") + `;

`;
    }
    return m;
  }
  _genMultiColFkAlters(a, n) {
    let s = "";
    for (const r in a.fks)
      if (0 < r.indexOf(",")) {
        const l = a.fks[r];
        s += "alter table " + n + " add constraint " + l + "_" + n + "_fk foreign key (" + r + ") references " + l + `;

`;
      }
    return s;
  }
  _genIndexes(a, n, s) {
    let r = "", l = 1;
    const d = this._ddl.optionEQvalue("tenantid", !0), f = a.isOption("notenantid");
    for (const o in a.fks)
      if (!a.isMany2One()) {
        const u = o ?? D(a.fks[o]) + "_id";
        l === 1 && (r += `-- table index
`);
        const x = this._ddl.find(a.fks[o]), g = x !== null && x.isOption("notenantid"), k = !d || f || u === "tenant_id" || g ? u : `tenant_id, ${u}`;
        r += "create index " + n + this._naming.idx + l++ + " on " + n + " (" + k + `);

`;
      }
    const m = a.getOptionValue("pk");
    m && (r += "alter table " + n + " add constraint " + n + this._naming.pk + " primary key (" + m + `);

`);
    const h = a.getOptionValue("unique") ?? a.getOptionValue("uk");
    if (h !== null) {
      const o = d && !f ? `tenant_id, ${h}` : h;
      r += "alter table " + n + " add constraint " + n + this._naming.uk + " unique (" + o + `);

`;
    }
    if (d && !f)
      for (let o = 0; o < a.children.length; o++) {
        const u = a.children[o];
        if (u.isOption("unique") || u.isOption("uk")) {
          const x = u.parseName(), g = n + "_tid_" + x + "_uix";
          r += `create unique index ${g}
    on ${n} (tenant_id, ${x});

`;
        }
      }
    for (let o = 0; o < a.children.length; o++) {
      const u = a.children[o];
      if (u.isOption("idx") || u.isOption("index")) {
        l === 1 && (r += `-- table index
`);
        const x = d && !f ? `tenant_id, ${u.parseName()}` : u.parseName();
        r += "create index " + n + this._naming.idx + l++ + " on " + n + " (" + x + `);
`;
      }
    }
    if (s)
      for (let o = 0; o < a.children.length; o++) {
        const u = a.children[o];
        u.children.length === 0 && u.inferType() === "vector" && (r += "create vector index " + n + "_vi" + l++ + " on " + n + " (" + u.parseName() + `)
`, r += `    organization neighbor partitions
`, r += `    with distance cosine;

`);
      }
    for (let o = 0; o < a.children.length; o++) {
      const u = a.children[o];
      u.children.length === 0 && u.inferType() === "geometry" && (r += "create index " + n + "_si" + l++ + " on " + n + " (" + u.parseName() + `)
`, r += `    indextype is mdsys.spatial_index_v2;

`);
    }
    return r;
  }
  _genComments(a, n) {
    let s = "";
    const r = a.getAnnotationValue("DESCRIPTION") || a.comment;
    r !== null && (s += "comment on table " + n + " is '" + r + `';
`);
    for (let l = 0; l < a.children.length; l++) {
      const d = a.children[l], f = d.getAnnotationValue("DESCRIPTION") || d.comment;
      f !== null && d.children.length === 0 && (s += "comment on column " + n + "." + d.parseName() + " is '" + f + `';
`);
    }
    return s;
  }
  parseType(a) {
    if (a.children !== null && 0 < a.children.length) return "table";
    const n = a.inferType();
    if (n === "view" || n === "dv") return n;
    if (a.parent === null) return "table";
    const s = a._inferTypeFull();
    return this._buildColumnConstraints(a, this._toOracleType(s), s);
  }
  generateTable(a) {
    if (a.children.length === 0 && 0 < a.apparentDepth()) {
      let m = i;
      return a.parent !== void 0 && a.parent !== null && (m += " ".repeat(a.parent.maxChildNameLen() - a.parseName().length)), a.parseName() + m + this.parseType(a);
    }
    a.lateInitFks();
    const n = this._ddl.objPrefix() + a.parseName();
    if (a.isOption("soda")) {
      let m = "create table " + n + ` (
`;
      return m += i + "id              varchar2(255" + this._ddl.semantics() + `) not null
`, m += i + "                constraint " + n + `_id_pk primary key,
`, m += i + `created_on      timestamp default sys_extract_utc(systimestamp) not null,
`, m += i + `last_modified   timestamp default sys_extract_utc(systimestamp) not null,
`, m += i + "version         varchar2(255" + this._ddl.semantics() + `) not null,
`, m += i + `json_document   json
`, m += `);

`, m;
    }
    const s = this._ddl.getOptionValue("db"), r = s !== null && s.length > 0 && 23 <= (Y(s) ?? 0);
    let l = "";
    a.isOption("immutable") && r && (l = "immutable ");
    const d = a.getGenIdColName();
    let f = this._genSequence(a, n);
    return f += this._genTableHeader(a, n, l, d), f += this._genTenantIdColumn(a), f += this._genFkColumns(a, n), f += this._genRowKeyColumn(a, n), f += this._genRegularColumns(a, n, d), f += this._genRowVersionColumn(a), f += this._genAuditColumns(a), f += this._genAdditionalColumns(a), f += a.genConstraint(), f = ba(f), f += this._genTableFooter(a, n, l, r), f += this._genMultiColFkAlters(a, n), f += this._genIndexes(a, n, r), this._genTenantIdFk(a, n), f += this._genComments(a, n), f += `
`, f;
  }
  generateDDL(a) {
    if (a.inferType() === "view" || a.inferType() === "dv") return "";
    const n = this._orderedTableNodes(a);
    let s = "";
    for (let r = 0; r < n.length; r++) s += this.generateTable(n[r]);
    return s;
  }
  generateDrop(a) {
    const n = this._ddl.objPrefix() + a.parseName(), s = this._ddl.getOptionValue("db"), r = s && s.length > 0 && 23 <= (Y(s) ?? 0) ? "if exists " : "";
    let l = "";
    return a.inferType() === "view" && (l = "drop view " + r + n + `;
`), a.inferType() === "table" && (l = "drop table " + r + n + ` cascade constraints;
`, this._ddl.optionEQvalue("api", "layered") && a.trimmedContent().toLowerCase().includes("/api") ? (l += "drop package " + r + n + `_dal;
`, l += "drop package " + r + n + `_hooks;
`, l += "drop package " + r + n + `_svc;
`, a.isOption("auditlog") && (l += "drop package " + r + n + `_audit;
`)) : this._ddl.optionEQvalue("api", "yes") && (l += "drop package " + r + n + `_api;
`), this._ddl.optionEQvalue("pk", "SEQ") && (l += "drop sequence " + r + n + this._naming.seq + `;
`)), l.toLowerCase();
  }
  identityRestartSql(a, n, s) {
    return "alter table " + a + `
modify ` + n + " generated always  as identity restart start with " + s + `;

`;
  }
  // ── View / trans-table delegates ──────────────────────────────────────────
  generateView(a) {
    return this._view.generateView(a);
  }
  generateDualityView(a) {
    return this._view.generateDualityView(a);
  }
  generateTransTable(a) {
    return this._view.generateTransTable(a);
  }
  generateResolvedView(a) {
    return this._view.generateResolvedView(a);
  }
  // ── PL/SQL / ORDS / triggers delegates ───────────────────────────────────────
  restEnable(a) {
    return this._plsql.restEnable(a);
  }
  generateTrigger(a) {
    return this._plsql.generateTrigger(a);
  }
  generateImmutableTrigger(a) {
    return this._plsql.generateImmutableTrigger(a);
  }
  generateTAPI(a) {
    return this._plsql.generateTAPI(a);
  }
  generateLayeredTAPI(a) {
    return this._plsql.generateLayeredTAPI(a);
  }
  generateFullDDL() {
    const a = this._ddl.forest, n = this._ddl.descendants();
    let s = "";
    if (this._ddl.optionEQvalue("Include Drops", "yes"))
      for (const o of n) {
        const u = this.generateDrop(o);
        u && (s += u);
      }
    if (this._ddl.optionEQvalue("rowkey", !0))
      s += `create sequence  row_key_seq;

`;
    else
      for (const o of a)
        if (o.trimmedContent().toUpperCase().includes("/ROWKEY")) {
          s += `create sequence  row_key_seq;

`;
          break;
        }
    s += `-- create tables

`;
    for (const o of a)
      s += this.generateDDL(o) + `
`;
    for (const o of this._ddl.postponedAlters)
      s += o + `
`;
    if (n.some((o) => o.getTransColumns().length > 0)) {
      const o = this._ddl.semantics(), u = this._ddl.objPrefix();
      s += `-- translation support

`, s += `create table ${u}language (
`, s += `    code           varchar2(5${o}) not null
`, s += `                   constraint ${u}language_code_pk primary key,
`, s += `    locale         varchar2(28${o}) not null
`, s += `                   constraint ${u}language_locale_unq unique,
`, s += `    name           varchar2(1024${o}),
`, s += `    native_name    varchar2(1024${o})
`, s += `);

`, s += `create index ${u}language_i1 on ${u}language (locale);

`;
      for (const x of n) {
        const g = this.generateTransTable(x);
        g && (s += g);
      }
    }
    let l = 0;
    for (const o of n) {
      const u = this.generateTrigger(o);
      u && (l++ === 0 && (s += `-- triggers
`), s += u + `
`);
    }
    for (const o of n) {
      const u = this.generateImmutableTrigger(o);
      u && (l++ === 0 && (s += `-- immutable triggers
`), s += u);
    }
    for (const o of n) {
      const u = this.restEnable(o);
      u && (s += u + `
`);
    }
    l = 0;
    const d = this._ddl.optionEQvalue("api", "layered");
    for (const o of n) {
      const u = o.trimmedContent().toLowerCase().includes("/api");
      if (d) {
        if (!u) continue;
        const x = this.generateLayeredTAPI(o);
        x && (l++ === 0 && (s += `-- APIs
`), s += x + `
`);
      } else {
        if (this._ddl.optionEQvalue("api", !1) && !u) continue;
        const x = this.generateTAPI(o);
        x && (l++ === 0 && (s += `-- APIs
`), s += x + `
`);
      }
    }
    l = 0;
    for (const o of a) {
      const u = this.generateView(o);
      u && (l++ === 0 && (s += `-- create views
`), s += u + `
`);
    }
    for (const o of n) {
      const u = this.generateResolvedView(o);
      u && (l++ === 0 && (s += `-- create views
`), s += u);
    }
    const f = {};
    for (const o of n) {
      if (o.inferType() !== "table") continue;
      const u = o.getAnnotationValue("TGROUP");
      u != null && (f[u] || (f[u] = []), f[u].push(this._ddl.objPrefix() + o.parseName()));
    }
    const m = Object.keys(f);
    if (m.length > 0) {
      s += `-- table groups
`;
      for (const o of m) {
        s += `insert into user_annotations_groups$ (group_name) values ('${o}');
`;
        for (const u of f[o])
          s += `insert into user_annotations_group_members$ (group_name, object_name) values ('${o}', '${u.toUpperCase()}');
`;
      }
      s += `
`;
    }
    const h = this._ddl.getOptionValue("db");
    if (this._ddl.optionEQvalue("aienrichment", !0) && h != null && h.length >= 2 && (Y(h) ?? 0) >= 26) {
      const o = [], u = {}, x = this._ddl.objPrefix();
      for (const g of a) {
        const T = g.inferType(), k = g.getAnnotationPairs(), y = (x + g.parseName()).toUpperCase();
        if (T === "table") {
          for (const B of k) {
            if (B.label.toUpperCase() === "TGROUP") {
              B.value != null && (u[B.value] || (u[B.value] = []), u[B.value].push(y));
              continue;
            }
            B.value != null && o.push(`    metadata_annotations.set('${B.label}', '${B.value}', '${y}');`);
          }
          for (const B of g.children) {
            if (B.children.length > 0) continue;
            const N = B.getAnnotationPairs(), P = y + "." + B.parseName().toUpperCase();
            for (const I of N)
              I.value != null && o.push(`    metadata_annotations.set('${I.label}', '${I.value}', '${P}', 'TABLE COLUMN');`);
          }
        } else if (T === "view")
          for (const B of k)
            B.value != null && o.push(`    metadata_annotations.set('${B.label}', '${B.value}', '${y}', 'VIEW');`);
      }
      for (const g of Object.keys(u)) {
        o.push(`    metadata_annotations.create_group('${g}');`);
        for (const T of u[g])
          o.push(`    metadata_annotations.add_to_group('${g}', '${T}', 'TABLE');`);
      }
      o.length > 0 && (s += `-- AI enrichment
begin
` + o.join(`
`) + `
end;
/

`);
    }
    l = 0;
    for (const o of a) {
      const u = this.generateData(o, this._ddl.data);
      u && (l++ === 0 && (s += `-- load data

`), s += u + `
`);
    }
    return s;
  }
}
const ge = {
  oracle: (p) => new ga(p)
};
function Fa(p, a) {
  ge[p.toLowerCase()] = a;
}
function Ie(p) {
  const a = String(p.getOptionValue("dialect") ?? "oracle").toLowerCase(), n = ge[a];
  if (n == null) {
    const s = Object.keys(ge).join(", ");
    throw new Error(`Unknown SQL dialect: "${a}". Registered dialects: ${s}`);
  }
  return n(p);
}
function re(p) {
  let a = "";
  for (let n = 0; n < p; n++)
    a += "   ";
  return a;
}
function Ca(p, a) {
  for (const n in p)
    if (JSON.stringify(p[n]) === JSON.stringify(a))
      return !0;
  return !1;
}
function xe(p) {
  const a = ["_id", "Id"];
  if (p.id != null)
    return { key: "id", value: p.id };
  for (let n = 0; n < a.length; n++) {
    const s = a[n];
    for (const r in p)
      if (r.endsWith(s))
        return { key: r, value: p[r] };
  }
  return null;
}
function va(p) {
  if (p == null || typeof p != "object") return !1;
  for (const a in p)
    if (!(p[a] != null && typeof p[a] == "object"))
      return !0;
  return !1;
}
function ya(p) {
  let a = null;
  e: for (const n in p)
    if (n === "0")
      for (const s in p[n]) {
        a = s;
        break e;
      }
    else {
      a = n;
      break e;
    }
  return a == null || a.toLowerCase() === "id" ? null : a.toLowerCase().endsWith("_id") ? a.substring(0, a.length - 3) : a.endsWith("Id") ? a.substring(0, a.length - 2) : null;
}
function Aa(p, a, n) {
  let s = !1, r = !1;
  for (const l in p)
    for (let d = 0; d < l; d++)
      if (p[l][a] === p[d][a] && p[l][n] !== p[d][n] ? s = !0 : p[l][a] !== p[d][a] && p[l][n] === p[d][n] && (r = !0), s && r) return !0;
  return !1;
}
function q(p) {
  if (p == null || typeof p != "object") return "";
  let a = "(";
  for (const n in p) {
    if (n === "0")
      return q(p[n]);
    p[n] != null && typeof p[n] == "object" || (a += n + ",");
  }
  return a.lastIndexOf(",") === a.length - 1 && (a = a.substring(0, a.length - 1)), a + ")";
}
function Pe(p, a) {
  let n = p, s = a;
  const r = n.indexOf("(");
  0 < r && (n = n.substring(0, r));
  const l = s.indexOf("(");
  return 0 < l && (s = s.substring(0, l)), n + "_" + s + "(" + n + "_id," + s + "_id)";
}
class Sa {
  constructor() {
    this.tableContent = {}, this.notNormalized = [], this.tableSignatures = [], this.child2parent = {}, this.objCounts = {}, this.idSeq = 1;
  }
  output(a, n, s, r) {
    if (r !== !1 && this.notNormalized.includes(a)) {
      const f = Pe(this.parent(a) ?? "", a), m = this.tableContent[f];
      if (m != null) {
        const h = `
` + re(s) + this.tableName(f) + " /insert " + m.length;
        if (Aa(m, this.refIdName(this.parent(a) ?? ""), this.refIdName(a)))
          return h + this.output(a, n, s + 1, !1);
      }
    }
    const l = this.notNormalized.includes(a) ? ">" : "";
    let d = `
` + re(s) + l + this.tableName(a);
    if (typeof n == "number" && (d += " num", a.endsWith("_id") || a.endsWith("Id")))
      return d += " /pk", d;
    if (a === "id")
      return `
` + re(s) + "id vc32 /pk";
    e: if (n != null && typeof n == "object") {
      if (Array.isArray(n))
        for (const m in n) {
          if (1 <= m)
            break;
          const h = n[m];
          d = this.output(a, h, s, r);
          break e;
        }
      else
        a !== "" && (this.tableContent[a] == null, d += "  /insert " + this.tableContent[a].length);
      let f = "";
      this.tableSignatures.includes(a) || (d = "", s--);
      for (const m in n) {
        const h = n[m];
        if (m != null) {
          const u = D(a) ?? "", x = m.toLowerCase();
          if (a != null && u + "_id" === x && 0 < s && (f = m), u + "_id" === x || !isNaN(m) && !Array.isArray(n))
            continue;
        }
        const o = this.output(m + q(h), h, s + 1);
        d += o;
      }
      f !== "" && (d += `
` + re(s) + f);
    }
    return d;
  }
  flatten(a, n, s) {
    const r = {};
    for (const f in n) {
      const m = n[f];
      if (m != null && typeof m == "object") {
        let h = a, o = s;
        if (isNaN(f)) {
          h = f + q(m);
          const u = xe(r);
          u != null && (o = u);
        }
        this.flatten(h, m, o);
      } else
        r[f] = m;
    }
    !this.notNormalized.includes(a) && s != null && Object.keys(r).length && (r[s.key] = s.value);
    const l = 0 < Object.keys(r).length;
    let d = this.tableContent[a];
    if (l) {
      if (d == null && (d = []), Ca(d, r) || d.push(r), this.notNormalized.includes(a)) {
        const f = this.parent(a);
        if (f != null) {
          const m = Pe(f, a);
          let h = this.tableContent[m];
          h == null && (h = []);
          const o = {};
          o[this.refIdName(f)] = s?.value;
          let u = xe(r);
          u == null && (r.id = this.idSeq++, u = xe(r)), o[this.refIdName(a)] = u.value, h.push(o), this.tableContent[m] = h;
        }
      }
      this.tableContent[a] = d;
    } else d == null && (this.tableContent[a] = []);
  }
  duplicatesAndParents(a, n) {
    const s = '"' + a + '":' + JSON.stringify(n);
    let r = this.objCounts[s] ?? 0, l = !1;
    for (const f in n) {
      const m = n[f];
      if (m != null && typeof m == "object") {
        let h = a;
        if (isNaN(f))
          h = f + q(m);
        else if (!Array.isArray(n))
          continue;
        h !== a && (this.child2parent[h] = a), this.duplicatesAndParents(h, m), l = !0;
      }
    }
    va(n) && !this.tableSignatures.includes(a) && this.tableSignatures.push(a), l || (this.objCounts[s] = r + 1), 1 < this.objCounts[s] && !this.notNormalized.includes(a) && this.notNormalized.push(a);
  }
  parent(a) {
    const n = this.child2parent[a];
    return n != null && !this.tableSignatures.includes(n) ? this.parent(n) : n ?? null;
  }
  tableName(a) {
    const n = a.indexOf("(");
    if (n < 0) return a;
    const s = a.substring(0, n);
    let r = 0, l = -1;
    for (const d in this.tableSignatures) {
      const f = this.tableSignatures[d];
      f.substring(0, f.indexOf("(")) === s && r++, f === a && (l = r);
    }
    return r < 2 ? s : s + l;
  }
  refIdName(a) {
    return (D(this.tableName(a)) ?? this.tableName(a)) + "_id";
  }
}
function _a(p, a) {
  const n = JSON.parse(p), s = ya(n);
  s != null && (a = s), a == null && (a = "root_tbl");
  const r = new Sa();
  r.duplicatesAndParents(a + q(n), n), r.flatten(a + q(n), n);
  let l = r.output(a + q(n), n, 0);
  l += `

#settings = { genpk: false, drop: true, pk: identityDataType, semantics: char }`, l += `

#flattened = 
`;
  const d = {};
  for (const m in r.tableContent)
    d[r.tableName(m)] = r.tableContent[m];
  return l += JSON.stringify(d, null, 3), l += `
`, l += `

-- Generated by json2qsql.js ` + "2.0.0" + " " + (/* @__PURE__ */ new Date()).toLocaleString() + `

`, l += `#document = 
`, l += JSON.stringify(n, null, 3), l += `
`, l;
}
class j {
  constructor(a, n, s, r) {
    this.from = n, this.to = s ?? new O(n.line, n.depth + 1), this.message = a, this.severity = r ?? "error";
  }
}
class O {
  // 0-based
  constructor(a, n) {
    this.line = a, this.depth = n;
  }
}
const Ma = [
  "api",
  "audit",
  "auditcols",
  "check",
  "colprefix",
  "compress",
  "compressed",
  "flashback",
  "fda",
  "immutable",
  "insert",
  "rest",
  "rowkey",
  "rowversion",
  "soda",
  "unique",
  "uk",
  "pk",
  "cascade",
  "setnull"
], ka = [
  "idx",
  "index",
  "indexed",
  "unique",
  "uk",
  "check",
  "constant",
  "default",
  "domain",
  "hidden",
  "invincible",
  "values",
  "upper",
  "lower",
  "nn",
  "not",
  "between",
  "references",
  "reference",
  "cascade",
  "setnull",
  "fk",
  "pk",
  "trans",
  "translation",
  "translations"
], K = {
  duplicateId: "Explicit ID column conflicts with genpk",
  invalidDatatype: "Invalid Datatype",
  undefinedObject: "Undefined Object: ",
  misalignedAttribute: "Misaligned Table or Column; apparent indent = ",
  tableDirectiveTypo: "Unknown Table directive",
  columnDirectiveTypo: "Unknown Column directive"
};
function Ta(p) {
  const a = p;
  let n = [], s = [];
  for (let l = 0; l < p.forest.length; l++)
    p.forest[l].inferType() === "table" && (s = s.concat(p.forest[l].descendants()));
  n = n.concat(Pa(s));
  const r = a.descendants();
  for (let l = 0; l < r.length; l++) {
    const d = r[l];
    if (a.optionEQvalue("genpk", !0) && r[l].parseName() === "id") {
      const h = d.content.toLowerCase().indexOf("id");
      n.push(new j(K.duplicateId, new O(d.line, h), new O(d.line, h + 2)));
      continue;
    }
    const f = d.src[2];
    if (2 < d.src.length && f.value === "-") {
      const h = f.begin;
      n.push(new j(K.invalidDatatype, new O(d.line, h), new O(d.line, h + 2)));
      continue;
    }
    const m = d.src[1];
    if (1 < d.src.length && m.value === "vc0") {
      const h = m.begin;
      n.push(new j(K.invalidDatatype, new O(d.line, h)));
      continue;
    }
    n = n.concat(Ba(a, d)), n = n.concat(Ia(a, d)), n = n.concat(wa(a, d));
  }
  return n;
}
function wa(p, a) {
  const n = a.inferType() === "table", s = [], r = a.src;
  let l = !1;
  for (let d = 1; d < r.length; d++) {
    if (r[d].value === "/") {
      l = !0;
      continue;
    }
    l && (l = !1, n && Ma.indexOf(r[d].value.toLowerCase()) < 0 && s.push(new j(
      K.tableDirectiveTypo,
      new O(a.line, r[d].begin),
      new O(a.line, r[d].begin + r[d].value.length)
    )), !n && ka.indexOf(r[d].value.toLowerCase()) < 0 && s.push(new j(
      K.columnDirectiveTypo,
      new O(a.line, r[d].begin),
      new O(a.line, r[d].begin + r[d].value.length)
    )));
  }
  return s;
}
function Ba(p, a) {
  const n = [];
  if (a.inferType() === "view") {
    const s = a.src;
    for (let r = 2; r < s.length; r++)
      p.find(s[r].value) == null && n.push(new j(
        K.undefinedObject + s[r].value,
        new O(a.line, s[r].begin),
        new O(a.line, s[r].begin + s[r].value.length)
      ));
  }
  return n;
}
function Ia(p, a) {
  const n = [];
  if (a.isOption("fk") || 0 < a.indexOf("reference", !0)) {
    let s = a.indexOf("fk");
    if (s < 0 && (s = a.indexOf("reference")), s++, a.src.length - 1 < s || a.src[s].value === "/")
      return n;
    p.find(a.src[s].value) == null && n.push(new j(
      K.undefinedObject + a.src[s].value,
      new O(a.line, a.src[s].begin),
      new O(a.line, a.src[s].begin + a.src[s].value.length)
    ));
  }
  return n;
}
function Pa(p) {
  const a = [], n = Ea(p);
  for (let s = 1; s < p.length; s++) {
    const r = p[s], l = $e(r);
    n !== null && l % n !== 0 && a.push(new j(
      K.misalignedAttribute + n,
      new O(r.line, l)
    ));
  }
  return a;
}
function Ea(p) {
  const a = [];
  for (let r = 0; r < p.length; r++)
    a[r] = $e(p[r]);
  const n = {};
  for (let r = 0; r < a.length; r++) {
    const l = Na(a, r);
    if (l != null) {
      const d = a[r] - a[l];
      n[d] = (n[d] ?? 0) + 1;
    }
  }
  let s = null;
  for (const r in n) {
    const l = parseInt(r);
    (s === null || n[s] <= n[l]) && (s = l);
  }
  return s;
}
function $e(p) {
  return p.src[0].begin;
}
function Na(p, a) {
  for (let n = a; 0 <= n; n--)
    if (p[n] < p[a])
      return n;
  return null;
}
const La = Ta, Da = { findErrors: La, messages: K }, Oe = "identityDataType", Ce = "guid", Fe = "Timestamp with time zone", He = "Timestamp with local time zone";
function Ee(p) {
  if (p == null) return null;
  const a = typeof p == "string" ? p.toLowerCase() : p;
  return a === "yes" || a === "y" || a === "true" || a === !0 ? !0 : a === "no" || a === "n" || a === "false" || a === !1 ? !1 : a === Oe.toLowerCase() ? "identity" : a === Ce.toLowerCase() ? "guid" : a === Fe.toLowerCase() ? "tswtz" : a === He.toLowerCase() ? "tswltz" : typeof a == "string" ? a : String(a);
}
const oe = {
  apex: { label: "APEX", value: "no", check: ["yes", "no"] },
  auditcols: { label: "Audit Columns", value: "no", check: ["yes", "no"] },
  createdcol: { label: "Created Column Name", value: "created" },
  createdbycol: { label: "Created By Column Name", value: "created_by" },
  updatedcol: { label: "Updated Column Name", value: "updated" },
  updatedbycol: { label: "Updated By Column Name", value: "updated_by" },
  auditdate: { label: "Audit Column Date Type", value: "" },
  aienrichment: { label: "AI Enrichment", value: "no", check: ["yes", "no"] },
  boolean: { label: "Boolean Datatype", value: "not set", check: ["yn", "native"] },
  genpk: { label: "Auto Primary Key", value: "yes", check: ["yes", "no"] },
  semantics: { label: "Character Strings", value: "CHAR", check: ["BYTE", "CHAR", "Default"] },
  language: { label: "Data Language", value: "EN", check: ["EN", "JP", "KO"] },
  datalimit: { label: "Data Limit Rows", value: 1e4 },
  date: { label: "Date Data Type", value: "DATE", check: ["DATE", "TIMESTAMP", Fe, He] },
  db: { label: "Database Version", value: "not set" },
  dv: { label: "Duality View", value: "no", check: ["yes", "no"] },
  drop: { label: "Include Drops", value: "no", check: ["yes", "no"] },
  editionable: { label: "Editinable", value: "no", check: ["yes", "no"] },
  inserts: { label: "Generate Inserts", value: !0, check: ["yes", "no"] },
  namelen: { label: "Name Character Length", value: 255 },
  overridesettings: { label: "Ignore toDDL() second parameter", value: "no", check: ["yes", "no"] },
  prefix: { label: "Object Prefix", value: "" },
  pk: { label: "Primary Key Maintenance", value: Ce, check: [Oe, Ce, "SEQ", "NONE"] },
  prefixpkwithtname: { label: "Prefix primary keys with table name", value: "no", check: ["yes", "no"] },
  rowkey: { label: "Alphanumeric Row Identifier", value: "no", check: ["yes", "no"] },
  rowversion: { label: "Row Version Number", value: "no", check: ["yes", "no"] },
  schema: { label: "Schema", value: "" },
  api: { label: "Table API", value: "no", check: ["yes", "no"] },
  compress: { label: "Table Compression", value: "no", check: ["yes", "no"] },
  transcontext: { label: "Translation Context", value: "sys_context('APP_CTX','LANG')" },
  dialect: { label: "SQL Dialect", value: "oracle" },
  longvc: { label: "Longer Varchars", value: "no", check: ["yes", "no"] },
  ondelete: { label: "On Delete", value: "", check: ["cascade", "restrict", "set null"] },
  tenantid: { label: "Tenant ID", value: "no", check: ["yes", "no"] },
  tenantref: { label: "Tenant Reference Table", value: "" },
  verbose: { label: "Verbose Output", value: "no", check: ["yes", "no"] }
};
class J {
  constructor(a, n) {
    this._ddl = null, this._erd = null, this._errors = null, this.postponedAlters = [], this.postponedAltersSet = /* @__PURE__ */ new Set(), this._labelToKey = {}, this.name2node = null, this.options = JSON.parse(JSON.stringify(oe)), this.input = a;
    for (const r in this.options) {
      const l = this.options[r].label;
      l != null && (this._labelToKey[l.toLowerCase()] = r);
    }
    let s = "";
    a.toLowerCase().includes("overridesettings") && Ae(this), n !== void 0 && this.optionEQvalue("overrideSettings", !1) && (s = "# settings = " + String(n) + `

`), this.input = s + a, this.forest = Ae(this);
  }
  // ── Option access ─────────────────────────────────────────────────────────
  getOptionValue(a) {
    const n = a.toLowerCase();
    let s = this.options[n];
    if (!(n in this.options)) {
      const r = this._labelToKey[n];
      r != null && (s = this.options[r]);
    }
    return s?.value ?? null;
  }
  optionEQvalue(a, n) {
    return Ee(this.getOptionValue(a)) == Ee(n);
  }
  setOptionValue(a, n) {
    const s = a.toLowerCase();
    if (!(s in this.options)) {
      for (const d in this.options)
        if (this.options[d].label === a) {
          this.options[d].value = n ?? "";
          return;
        }
    }
    const r = n ?? "";
    let l = this.options[s];
    l == null ? (l = { label: s, value: r }, this.options[s] = l) : l.value = r;
  }
  nonDefaultOptions() {
    const a = {};
    for (const n in this.options)
      oe[n] && !this.optionEQvalue(n, oe[n].value) && (a[n] = this.options[n].value);
    return a;
  }
  unknownOptions() {
    const a = [];
    for (const n in this.options)
      oe[n] == null && a.push(n);
    return a;
  }
  setOptions(a) {
    a = a.trim(), a.startsWith("#") && (a = a.substring(1).trim());
    const n = a.indexOf("=");
    let s = a.substring(n + 1).trim();
    s.includes("{") || (s = "{" + a + "}");
    let r = "";
    const l = Q(s, !0, !0, "");
    for (const f of l)
      f.type === "identifier" && f.value !== "true" && f.value !== "false" && f.value !== "null" || f.type === "constant.numeric" && !/^\d+(\.\d+)?$/.test(f.value) ? r += '"' + f.value + '"' : r += f.value;
    const d = JSON.parse(r);
    for (const f in d)
      this.setOptionValue(f.toLowerCase(), d[f]);
  }
  // ── Semantic helpers ──────────────────────────────────────────────────────
  semantics() {
    return this.optionEQvalue("semantics", "CHAR") ? " char" : this.optionEQvalue("semantics", "BYTE") ? " byte" : "";
  }
  objPrefix(a) {
    let n = this.getOptionValue("schema") ?? "";
    n = n !== "" && a == null ? n + "." : "";
    const s = this.getOptionValue("prefix") ?? "", r = s !== "" && !s.endsWith("_") ? "_" : "";
    return (n + s + r).toLowerCase();
  }
  // ── Node lookup ───────────────────────────────────────────────────────────
  find(a) {
    if (this.name2node != null)
      return this.name2node[ae(a)] ?? null;
    this.name2node = {};
    for (const n of this.forest)
      for (const s of n.descendants())
        this.name2node[s.parseName()] = s;
    return this.name2node[ae(a)] ?? null;
  }
  descendants() {
    const a = [];
    for (const n of this.forest)
      a.push(...n.descendants());
    return a;
  }
  additionalColumns() {
    const a = {}, n = this.getOptionValue("Auxiliary Columns");
    if (n == null) return a;
    for (const s of n.split(",")) {
      const r = s.trim(), l = r.indexOf(" ");
      l > 0 ? a[r.substring(0, l)] = r.substring(l + 1).toUpperCase() : a[r] = "VARCHAR2(4000)";
    }
    return a;
  }
  // ── Output generators ─────────────────────────────────────────────────────
  getERD() {
    return this._erd != null ? this._erd : (this._erd = Ie(this).generateERD(), this._erd);
  }
  getDDL() {
    return this._ddl != null ? this._ddl : (this._ddl = Ie(this).generateFullDDL() + this._makeFooter(), this._ddl);
  }
  _makeFooter() {
    const a = (s) => s.replace(/#.+/g, `
`).replace(/\/\*/g, "--<--").replace(/\*\//g, "-->--").replace(/\/*\s*Non-default options:/g, "");
    let n = `-- Generated by Radicle QuickSQL ${this.version()} ${(/* @__PURE__ */ new Date()).toLocaleString()}

`;
    n += `/*
`, n += a(this.input), n += `
`;
    for (const s of this.unknownOptions())
      n += "*** Unknown setting: " + s + `
`;
    return n += `
 Non-default options:
# settings = ` + JSON.stringify(this.nonDefaultOptions()) + `
`, n += `
*/`, n;
  }
  getErrors() {
    return this._errors != null ? this._errors : (this._errors = Da.findErrors(this), this._errors);
  }
  version() {
    return ze();
  }
}
function Ra(p, a) {
  return _a(p, a);
}
function Ga(p, a) {
  return new J(p, a).getERD();
}
function $a(p, a) {
  return new J(p, a).getDDL();
}
function Oa(p, a) {
  return new J(p, a).getErrors();
}
function ze() {
  return "2.0.0";
}
J.toDDL = $a;
J.toERD = Ga;
J.toErrors = Oa;
J.fromJSON = Ra;
J.version = ze;
J.lexer = Q;
export {
  fa as BaseGenerator,
  J as default,
  Ra as fromJSON,
  ze as qsql_version,
  J as quicksql,
  Fa as registerGenerator,
  $a as toDDL,
  Ga as toERD,
  Oa as toErrors
};
