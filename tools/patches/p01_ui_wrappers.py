#!/usr/bin/env python3
"""重構階段 2-1:合併 UI 類函式包裝
updateTopBar(5 層)、calculateTotalStats(3)、redFlags(2)、renderInventory(2)、renderSkills(2,其中原版+v7.1 已被 v10.2 完整取代)
作法:原函式內依「原安裝順序」呼叫各模組登記在 XT 的步驟;模組尚未載入時 XT.x 不存在 → 自動略過(與原本「那層包裝還沒裝上」同義)。
"""
import glob, os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js')

def F(prefix):
    g = glob.glob(os.path.join(ROOT, '02_main', prefix + '_*.js')) or glob.glob(os.path.join(ROOT, prefix + '_*.js'))
    assert len(g) == 1, prefix; return g[0]

def rep(prefix, old, new, cnt=1):
    p = F(prefix); t = open(p, encoding='utf-8', newline='').read()
    assert t.count(old) == cnt, (prefix, t.count(old), old[:80])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))

# ---------- 登記表 ----------
rep('000', '   ========================================================================== */\n',
    '   ========================================================================== */\n'
    '// 重構:擴充步驟登記表。原本後期模組用「const _f=f; f=function(){_f();…}」層層包裝舊函式,\n'
    '// 現改為各模組把自己的步驟登記在 XT,由原函式依原執行順序呼叫(未載入的步驟自動略過)。\n'
    'const XT = {};\n', 1)

# ---------- updateTopBar ----------
rep('006', '  updateTutorialBanner();\n}\n',
    '  updateTutorialBanner();\n'
    '\n  // —— 擴充步驟(原為 5 層包裝,依原安裝順序)——\n'
    '  XT.topBar78Hook && XT.topBar78Hook();      // v7.8 戰力回饋・突破見證(028)\n'
    '  XT.topBar78Gate && XT.topBar78Gate();      // v7.8 突破卡:被境界見證擋住時改顯示提示(028)\n'
    '  XT.topBar79Unlock && XT.topBar79Unlock();  // v7.9 系統逐步開放(029)\n'
    '  XT.topBar80Sect && XT.topBar80Sect();      // v8.0 宗門卡・導覽鎖(031)\n'
    '  XT.topBar131Tre && XT.topBar131Tre();      // v13.1 首通秘境法寶補發(069)\n'
    '}\n')
rep('028', '  const _utb = updateTopBar;\n  updateTopBar = function () { _utb.apply(this, arguments); try { hook(); } catch (e) { } };\n',
    '  XT.topBar78Hook = function () { try { hook(); } catch (e) { } };   // 由 updateTopBar 呼叫\n')
rep('028', '  const _utb2 = updateTopBar;\n  updateTopBar = function () {\n    _utb2.apply(this, arguments);\n    try {',
    '  XT.topBar78Gate = function () {   // 由 updateTopBar 呼叫\n    try {')
rep('029', '  const _utb = updateTopBar;\n  updateTopBar = function () { _utb.apply(this, arguments); try { tick(); } catch (e) { } };\n',
    '  XT.topBar79Unlock = function () { try { tick(); } catch (e) { } };   // 由 updateTopBar 呼叫\n')
rep('031', '  const _utb = updateTopBar;\n  updateTopBar = function () {\n    _utb.apply(this, arguments);\n    try {\n      init(); const s = cur();',
    '  XT.topBar80Sect = function () {   // 由 updateTopBar 呼叫\n    try {\n      init(); const s = cur();')
rep('069', '  { const o = updateTopBar; updateTopBar = function () {\n    const r = o.apply(this, arguments);\n    try {\n      if (treOK() && state.tPend',
    '  { XT.topBar131Tre = function () {   // 由 updateTopBar 呼叫\n    try {\n      if (treOK() && state.tPend')
rep('069', "        if (n) { showToast(`💠 先前首通秘境所得的 ${n} 件法寶,隨殘玉共鳴一併歸入。`); saveGame(); }\n      }\n    } catch (e) { }\n    return r;\n  }; }\n",
    "        if (n) { showToast(`💠 先前首通秘境所得的 ${n} 件法寶,隨殘玉共鳴一併歸入。`); saveGame(); }\n      }\n    } catch (e) { }\n  }; }\n")

# ---------- calculateTotalStats ----------
rep('005', '  return { hp, atk, def, crit, qiRate, combatPower, isResonanceActive };\n}\n',
    '  const s = { hp, atk, def, crit, qiRate, combatPower, isResonanceActive };\n'
    '  // —— 擴充步驟(原為 3 層包裝,依原安裝順序;各步驟直接修改 s)——\n'
    '  XT.stats78Realm && XT.stats78Realm(s);   // v7.8 境界乘數(028)\n'
    '  XT.stats80Sect && XT.stats80Sect(s);     // v8.0 宗門功法加成(031)\n'
    '  XT.stats85X5 && XT.stats85X5(s);         // v8.5 X5 共用加成:圖鑑/稱號/器紋/流派…(034)\n'
    '  return s;\n}\n')
rep('028', '  const _cts = calculateTotalStats;\n  calculateTotalStats = function () {\n    const s = _cts.apply(this, arguments), m = realmPow(state.realmIdx, state.subRealm);',
    '  XT.stats78Realm = function (s) {   // 由 calculateTotalStats 呼叫\n    const m = realmPow(state.realmIdx, state.subRealm);')
rep('028', '    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);\n    return s;\n  };\n  /* 區域怪物校準',
    '    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);\n  };\n  /* 區域怪物校準')
rep('031', '  const _cts = calculateTotalStats;\n  calculateTotalStats = function () {\n    const s = _cts.apply(this, arguments), E = effects();',
    '  XT.stats80Sect = function (s) {   // 由 calculateTotalStats 呼叫\n    const E = effects();')
rep('031', "    s.crit += (E.crit || 0); s.qiRate = Math.max(1, Math.floor(s.qiRate * (1 + (E.qiP || 0))));\n    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);\n    return s;\n  };\n",
    "    s.crit += (E.crit || 0); s.qiRate = Math.max(1, Math.floor(s.qiRate * (1 + (E.qiP || 0))));\n    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);\n  };\n")
rep('034', '  const _cts = calculateTotalStats;\n  calculateTotalStats = function () {\n    const s = _cts.apply(this, arguments), E = X5.E();',
    '  XT.stats85X5 = function (s) {   // 由 calculateTotalStats 呼叫\n    const E = X5.E();')
rep('034', "    if (E.crit) s.crit += E.crit; if (E.qiP) s.qiRate = Math.max(1, Math.floor(s.qiRate * (1 + E.qiP)));\n    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);\n    return s;\n  };\n",
    "    if (E.crit) s.crit += E.crit; if (E.qiP) s.qiRate = Math.max(1, Math.floor(s.qiRate * (1 + E.qiP)));\n    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);\n  };\n")

# ---------- redFlags ----------
rep('019', "f.treasure || f.pet;\n  return f;\n}\n",
    "f.treasure || f.pet;\n"
    "  // —— 擴充步驟(原為 2 層包裝)——\n"
    "  XT.flags85Garden && XT.flags85Garden(f);   // v8.5 靈田可收成 → 洞府紅點(034)\n"
    "  XT.flags87Secret && XT.flags87Secret(f);   // v8.7 秘境派遣完成 → 歷練紅點(036)\n"
    "  return f;\n}\n")
rep('034', "  { const _rf = redFlags; redFlags = function () { const f = _rf.apply(this, arguments); try { gdInit();",
    "  { XT.flags85Garden = function (f) { try { gdInit();")
rep('034', "f['tab-abode'] = r > 0 || cxAlert(); } catch (e) { } return f; }; }",
    "f['tab-abode'] = r > 0 || cxAlert(); } catch (e) { } }; }   // 由 redFlags 呼叫")
rep('036', "  { const _rf = redFlags; redFlags = function () { const f = _rf.apply(this, arguments); try { if (Object.values(SRs().runs).some(r => r.s === 'done')) f['tab-adventure'] = true; } catch (e) { } return f; }; }",
    "  { XT.flags87Secret = function (f) { try { if (Object.values(SRs().runs).some(r => r.s === 'done')) f['tab-adventure'] = true; } catch (e) { } }; }   // 由 redFlags 呼叫")

# ---------- renderInventory ----------
rep('006', 'function renderInventory() {\n',
    'function renderInventory() {\n  (() => { // 原本體(內含提前 return,以箭頭函式包住,確保下方擴充步驟照舊執行)\n')
rep('006', '  renderEquipSlots(); // v7: 七欄裝備顯示\n}\n',
    '  renderEquipSlots(); // v7: 七欄裝備顯示\n  })();\n'
    '  // —— 擴充步驟(原為 2 層包裝)——\n'
    '  XT.inv81Grid && XT.inv81Grid();   // v8.1 儲物袋改格狀+分類籤(032)\n'
    '  XT.inv54Page && XT.inv54Page();   // v12.3 行囊格子分頁重排(script 19)\n'
    '}\n')
rep('032', "  const _ri = renderInventory;\n  renderInventory = function () {\n    _ri.apply(this, arguments);              // 保留原有:裝備欄、容量、相關連動\n",
    "  XT.inv81Grid = function () {   // 由 renderInventory 在原本體(裝備欄、容量、相關連動)之後呼叫\n")
rep('19', "  if (typeof renderInventory === 'function') { const _ri = renderInventory; renderInventory = function () { const r = _ri.apply(this, arguments); try { pg.dataset.s = ''; layout(); } catch (e) { } return r; }; }",
    "  XT.inv54Page = function () { try { pg.dataset.s = ''; layout(); } catch (e) { } };   // 由 renderInventory 呼叫")

# ---------- renderSkills:v10.2 版為唯一實作 ----------
p = F('017'); t = open(p, encoding='utf-8', newline='').read()
a = t.index('function renderSkills(force) {\n'); b = t.index('\n}\n', a) + 3
assert t[b - 40:b].rstrip().endswith("root.innerHTML = h + '</div>';\n}") or "root.innerHTML = h + '</div>';" in t[b - 60:b]
t = t[:a] + ('// 神通面板:實作在 v10.2 功法整併(054,XT.skills)。原 v6-A 版與 v7.1「一鍵領悟」包裝已被它完整取代,重構時移除。\n'
             'function renderSkills(force) { XT.skills && XT.skills(force); }\n') + t[b:]
open(p, 'w', encoding='utf-8', newline='').write(t)
p = F('023'); t = open(p, encoding='utf-8', newline='').read()
a = t.index('const _renderSkills0 = renderSkills;\n'); b = t.index('\n};\n', a) + 4
assert t[b:].startswith('/* ---- 裝備:全部強化 ---- */')
t = t[:a] + '// (原「一鍵領悟」按鈕包裝已移除:v10.2 的 renderSkills 自帶此按鈕)\n' + t[b:]
open(p, 'w', encoding='utf-8', newline='').write(t)
rep('054', '  const _rs = renderSkills;\n  renderSkills = function (force) {\n',
    '  XT.skills = function (force) {   // renderSkills 的唯一實作\n')
print('p01 ok')
