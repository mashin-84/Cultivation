#!/usr/bin/env python3
"""最終版148:重要戰鬥本命絕學依流派分開(與一般戰鬥設計一致),神通頁加「本命絕學」卡片
- 劍修 劍氣縱橫:最強攻擊神通 ×1.6
- 法修 五行法陣:×1.6 + 灼燒 3 回合 + 定身 1 回合(40% 被抵抗)
- 體修 金身怒目:×1.6 + 氣血 40% 護盾
- 丹修 丹爐煉化:×1.0 + 回復 30% 氣血 + 攻擊 +25%(3 回合)
模擬(難度校準)同步"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(s, old, new, f, n=1):
    assert s.count(old) == n, (f, old[:70], s.count(old)); return s.replace(old, new)
E = []
E.append(("  const ULT = { sword: { n: '劍氣縱橫', ic: '🌬️', cd: 5 }, magic: { n: '五行法陣', ic: '🔯', cd: 6 }, body: { n: '金身怒目', ic: '🪬', cd: 6 }, pill: { n: '丹爐煉化', ic: '♨️', cd: 6 } };",
"""  const ULT = { sword: { k: 'sword', n: '劍氣縱橫', ic: '🌬️', cd: 5, f: 1.6, fl: 5 }, magic: { k: 'magic', n: '五行法陣', ic: '🔯', cd: 6, f: 1.6, fl: 5 }, body: { k: 'body', n: '金身怒目', ic: '🪬', cd: 6, f: 1.6, fl: 5 }, pill: { k: 'pill', n: '丹爐煉化', ic: '♨️', cd: 6, f: 1, fl: 3 } };
  const ULTD = { sword: '純粹的劍氣,一擊貫穿。', magic: '法陣灼燒敵人 3 回合,並定身 1 回合(有 40% 機率被抵抗)。', body: '激發金身,獲得氣血 40% 的護盾。', pill: '當場煉丹:回復 30% 氣血,攻擊提升 25%(3 回合)。' };
  const ultBestOf = X => { let m = 0, by = null; (X.sk || []).forEach(k => { if (k.c && k.c.mult) { const v = k.c.mult * (k.sk.type === 'atk' ? (k.c.hits || 1) : 1); if (v > m) { m = v; by = k.sk; } } }); return { m, by }; };"""))
E.append(("  const ultM = X => { let m = 0; (X.sk || []).forEach(k => { if (k.c && k.c.mult) m = Math.max(m, k.c.mult * (k.sk.type === 'atk' ? (k.c.hits || 1) : 1)); }); return Math.max(5, m * 1.6); };",
"  const ultM = X => { const u = X.ult || {}, f = u.f || 1.6; return Math.max(u.fl || 5, ultBestOf(X).m * f); };"))
# 模擬
E.append(("      else if (a[0] === 'ult') { S.cd.ULT = X.ult.cd + 1; dmg = baseOf(X, ultM(X) * Q.u, S.buff) * cr * ultDm(X); }",
"""      else if (a[0] === 'ult') { S.cd.ULT = X.ult.cd + 1; dmg = baseOf(X, ultM(X) * Q.u, S.buff) * cr * ultDm(X); const uk = X.ult.k;
        if (uk === 'magic') { S.dot = { d: baseOf(X, .35, S.buff), t: 3 }; if (Math.random() < .6) { S.stun = 1; S.ch = 0; } }
        else if (uk === 'body') S.sh = Math.max(S.sh, X.p.max * .4);
        else if (uk === 'pill') { S.php = Math.min(X.p.max, S.php + X.p.max * .3); S.buff = { pct: .25, turns: 4 }; } }"""))
# 實戰
E.append(("    log(q === 'pf' ? '本命絕學全力爆發!' : `本命絕學【${B.ult.n}】!`);",
"""    const uk = !B.A && B.ult.k;
    if (uk === 'magic' && B.e.hp > 0) { B.e.dot = { dmg: Math.max(1, Math.floor(base(.35))), turns: 3 }; num('e', '灼燒', 'tx'); await sleep(250); if (Math.random() < .6) { B.e.stun = 1; B.e.charge = 0; num('e', '定身', 'tx'); } else num('e', '抵抗', 'tx'); }
    else if (uk === 'body') { B.p.sh = Math.max(B.p.sh, Math.floor(B.p.max * .4)); fxAura('sh'); num('p', '🛡' + fm(B.p.sh), 'hl'); }
    else if (uk === 'pill') { const h = Math.floor(B.p.max * .3); B.p.hp = Math.min(B.p.max, B.p.hp + h); B.p.buff = { pct: .25, turns: 4 }; fxAura('hl'); num('p', '+' + fm(h), 'hl'); await sleep(250); num('p', '攻↑', 'tx'); }
    ui();
    log(q === 'pf' ? '本命絕學全力爆發!' : `本命絕學【${B.ult.n}】!` + (uk ? ULTD[uk].replace(/。$/, '') + '。' : ''));"""))
# 對外:神通頁用
E.append(("    bgm: () => 'tianjie',", """    bgm: () => 'tianjie',
    ultInfo() {
      const u = ultOf(); if (!u) return null;
      const S = skState(), slots = skSlots(), sk = S.equipped.slice(0, slots).filter(id => id && S.learned[id] && SK_BY_ID[id]).map(id => ({ id, sk: SK_BY_ID[id], c: skCalc(SK_BY_ID[id], S.learned[id].lv) }));
      const X = { sk, ult: u }, b = ultBestOf(X);
      return { k: u.k, n: u.n, ic: u.ic, cd: u.cd, f: u.f, fl: u.fl, mult: ultM(X), from: b.by ? b.by.name : '', desc: ULTD[u.k] };
    },"""))
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    p = os.path.join(R, f); s = open(p, encoding='utf-8', newline='').read()
    for o, n in E: s = rep(s, o, n, f)
    open(p, 'w', encoding='utf-8', newline='').write(s)
# 神通頁卡片
p = os.path.join(R, 'src/js/02_main/054_v10_2_功法整併_共通_流派_宗門_流派專屬神通.js'); s = open(p, encoding='utf-8', newline='').read()
s = rep(s, "    h += `<div class=\"sk27c\">${VIEWS.map(", """    { let U = null; try { U = window.BF113 && BF113.ultInfo(); } catch (e) { }
      const lk = !(R() >= 1 && window.UNLOCK9 && UNLOCK9.on('school')), m = U ? (Math.round(U.mult * 10) / 10) : 0;
      h += `<div class="ult148 ${U ? '' : 'off'}"><div class="ic">${U ? `<b>${U.ic}</b>` : '<b>🔒</b>'}</div><div class="tx"><div class="hd">本命絕學${U ? `・<b>${U.n}</b><span>${SCN[U.k]}</span>` : ''}</div>`
        + (U ? `<div class="ef">${U.desc}</div><div class="nb">傷害倍率 <b>×${m}</b>${U.from ? `(${U.from} ×${U.f}${U.mult > U.fl + .01 ? '' : `,保底 ×${U.fl}`})` : `(未裝備攻擊神通,保底 ×${U.fl})`}・重要戰鬥冷卻 ${U.cd} 回合</div><div class="sb">倍率跟著最強的攻擊神通走,換裝或升級神通會一起變強;並吃該神通的增傷加成。</div>`
          : `<div class="ef">${lk ? '流派隨劇情開放(築基期後)。' : '擇定本命流派後,便能領悟該流派的本命絕學。'}</div>`) + '</div></div>';
    }
    h += `<div class="sk27c">${VIEWS.map(""", p)
s = rep(s, "  XT.skills = function (force) {   // renderSkills 的唯一實作", """  { const st = document.createElement('style'); st.textContent = `.ult148{display:flex;gap:10px;align-items:flex-start;margin:8px 0 2px;padding:10px;border-radius:12px;border:1px solid #d6a84a;background:linear-gradient(135deg,rgba(254,243,199,.85),rgba(255,251,235,.75));color:#3b2a14}
.ult148.off{border-color:#cdbf9f;background:rgba(255,252,244,.6);opacity:.75}
.ult148 .ic{width:44px;height:44px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#fff7d6,#f5d38a);box-shadow:0 0 0 2px #d6a84a inset;font-size:24px}
.ult148 .tx{flex:1;min-width:0}.ult148 .hd{font-family:'Noto Serif TC',serif;font-weight:800;font-size:14px}.ult148 .hd span{margin-left:6px;font-size:10.5px;padding:1px 6px;border-radius:99px;background:#9e2b25;color:#fff;vertical-align:1px}
.ult148 .ef{font-size:12px;margin-top:2px}.ult148 .nb{font-size:12px;margin-top:3px;color:#7c4a03}.ult148 .nb b{font-size:15px;color:#9e2b25}.ult148 .sb{font-size:10.5px;color:#8a7a62;margin-top:2px}`; document.head.appendChild(st); }
  XT.skills = function (force) {   // renderSkills 的唯一實作""", p)
s = rep(s, "    const sig = JSON.stringify([S, slots,", "    const sig = JSON.stringify([state.realmIdx && window.UNLOCK9 && UNLOCK9.on('school'), S, slots,", p)
open(p, 'w', encoding='utf-8', newline='').write(s)
print('p69 ok')
