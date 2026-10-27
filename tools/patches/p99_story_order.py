# 最終版189:劇情依境界層數出現 —— 主線前若有層數更低、尚未看的機緣/遊學(opt+auto),先播它
import glob
def P(pat, pairs):
    f = glob.glob('src/js/' + pat)[0]; t = open(f, encoding='utf8').read()
    for a, b in pairs:
        n = t.count(a); assert n == 1, (f, a[:40], n); t = t.replace(a, b)
    open(f, 'w', encoding='utf8').write(t); print('OK', f, len(pairs))
P('02_main/055_v11_0*.js', [
 ("  let nowPend = 0;   /* v188",
  "  /* v189 依層數:主線前若有層數更低、尚未看的機緣/遊學,先播它 */\n"
  "  const keyOf = n => { const a = n && n.at, q = a && (a._rq || a._yx); return q ? [q[0], q[1]] : null; };\n"
  "  const lowerK = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);\n"
  "  const silentOpt = n => (n.sys && window.UNLOCK9 && UNLOCK9.on(n.sys)) || (n.cyc && (SD().cycle || 1) > 1);\n"
  "  function before(m) { const km = keyOf(m); if (!km) return null; return NODES.filter(n => n.opt && n.auto && !declined[n.id] && !seen(n.id) && (!n.after || seen(n.after)) && safe(n.at) && !silentOpt(n) && keyOf(n) && lowerK(keyOf(n), km)).sort((a, b) => lowerK(keyOf(a), keyOf(b)) ? -1 : lowerK(keyOf(b), keyOf(a)) ? 1 : 0)[0] || null; }\n"
  "  ST.before = before;\n"
  "  let nowPend = 0;   /* v188"),
 ("nowPend = 0; play(m.id); } catch (e) { } };",
  "nowPend = 0; play((before(m) || m).id); } catch (e) { } };"),
 ("      play(m.id); return; }\n    /* 機緣節點",
  "      play((before(m) || m).id); return; }\n    /* 機緣節點"),
])
P('39_v160*.js', [(
 "const m = A.nodes.find(n => !n.opt && !seen(n.id)); if (m && ok(m.at)) return m;",
 "const m = A.nodes.find(n => !n.opt && !seen(n.id)); if (m && ok(m.at)) return (A.before && A.before(m)) || m;   /* v189 依層數 */")])
