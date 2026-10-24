/* ============ ⚙ 設定 ============ */
  X.sheet('mn', '⚙ 設定', b => {
    const snd = ($('sound-icon') || {}).textContent || '';
    const row = (a, ic, t, s) => `<button class="x5-card" data-x5="${a}" style="width:100%;text-align:left;display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:22px;width:30px;text-align:center">${ic}</span><span style="flex:1"><b style="color:#fde68a;font-size:14px">${t}</b><br><span class="x5-sub">${s}</span></span><span class="x5-sub">›</span></button>`;
    b.innerHTML = row('mn.snd', '🔔', '音效', '目前:' + (snd.indexOf('開') >= 0 ? '開' : snd.indexOf('關') >= 0 ? '關' : '切換')) + row('mn.bgm', '🎵', '背景音樂', state.bgmOn !== false ? '目前:開' : '目前:關') + row('mn.tsnd', '🎐', '劇情打字音', state.typeSnd === false ? '目前:關(點一下切換 關→輕→中→重)' : '目前:' + ['', '輕', '中', '重'][state.typeVol || 2] + '(點一下切換,會試播一聲)') + row('mn.help', '❓', '仙經・玩法說明', '遊戲的基本規則與系統介紹') + row('mn.guide', '📖', '修行指引', '查看全部指引與獎勵') + row('mn.lite', '🔋', '省電模式', state.lite ? '目前:開(關閉動畫,較省電)' : '目前:關(動畫與特效全開)') + row('mn.stat', '📈', '遊玩統計', '遊玩時數、擊殺與收集紀錄') + row('mn.save', '💾', '存檔管理', '保存・匯出・匯入存檔,換手機前先備份;重新開局') + `<div class="x5-sub" style="text-align:center;margin-top:6px">《一念飛仙》v9.8</div>`;
  });
  X.act('mn.open', () => X.open('mn'));
  X.act('mn.snd', () => { const b = $('btn-sound-toggle'); if (b) b.click(); setTimeout(() => X.refresh('mn'), 60); });
  X.act('mn.bgm', () => { state.bgmOn = state.bgmOn === false; saveGame(); X.refresh('mn'); try { BGM96.sync(true); } catch (e) { } });
  X.act('mn.tsnd', () => { if (state.typeSnd === false) { state.typeSnd = true; state.typeVol = 1; } else if ((state.typeVol || 2) >= 3) state.typeSnd = false; else state.typeVol = (state.typeVol || 2) + 1; saveGame(); X.refresh('mn'); try { audio.init(); if (state.typeSnd !== false) audio.playType('mid'); } catch (e) { } });
  X.act('mn.help', () => { X.close('mn'); const b = $('btn-show-help'); if (b) b.click(); });
  X.act('mn.guide', () => { X.close('mn'); X.open('guide'); });
  X.act('mn.lite', () => { state.lite = !state.lite; window.LITE15 = !!state.lite; document.body.classList.toggle('lite15', !!state.lite); saveGame(); X.refresh('mn'); });
  X.act('mn.save', () => { X.close('mn'); goToTab('tab-records'); setTimeout(() => { const el = $('backup-box'); if (el) el.scrollIntoView({ block: 'center' }); }, 200); });

  