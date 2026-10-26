/* ===== v172 生死交鋒預告:下一場「一定會發生」的重要戰鬥(劇情戰/境主首戰) ===== */
window.SJ172 = (() => {
  /* 這段劇情是否一定會打:直接出現戰鬥、或分歧的每一條路都會打 */
  function must(beats) {
    return (beats || []).some(x => {
      if (!x || typeof x !== 'object') return false;
      if (x.fight && x.fight.name) return true;
      if (x.if !== undefined) return must(x.a) && must(x.b);
      if (x.ch && Array.isArray(x.opts) && x.opts.length) return x.opts.every(o => must(o.r));
      return false;
    });
  }
  const has = n => !!(n && !n.opt && must(n.beats));
  const rn = r => (REALM_DATA[r] || {}).name || '';
  function when(n) {
    const q = n.at && n.at._rq; if (!q) return '';
    return q[2] ? rn(q[0]) + '圓滿' : q[1] > 1 ? `${rn(q[0])}第${q[1]}層` : rn(q[0]);
  }
  function nextStory() {
    try { const S = ST28.S(); return ST28.nodes.find(n => !n.opt && !S.seen[n.id] && has(n)) || null; } catch (e) { return null; }
  }
  function nextBoss() {
    try {
      const i = state.realmIdx || 0, a = AREAS_DATA[i]; if (!a || (state.areaFirstClear || {})[a.id]) return null;
      const b = a.monsters.find(m => m.isBoss); return b ? { i, area: a.name, boss: b.name } : null;
    } catch (e) { return null; }
  }
  function card() {
    const n = nextStory(), b = nextBoss(); if (!n && !b) return '';
    let h = `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#fcd34d;font-size:14px">⚔ 下一場生死交鋒</b>`;
    if (n) h += `<div class="x5-row" style="margin-top:6px"><div style="flex:1;min-width:0">劇情〈${n.title}〉<div class="x5-sub" style="margin-top:2px">${when(n) ? '約於【' + when(n) + '】開啟' : '依主線推進'}</div></div></div>`;
    if (b) h += `<div class="x5-row" style="margin-top:6px"><div style="flex:1;min-width:0">【${b.area}】境主・${b.boss}<div class="x5-sub" style="margin-top:2px">第一次交手為生死交鋒;大境界圓滿前必須斬殺</div></div></div>`;
    return h + `</div>`;
  }
  return { must, has, nextStory, nextBoss, card };
})();
