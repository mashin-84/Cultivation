#!/usr/bin/env python3
"""最終版90:存檔檔案匯出/匯入 + 備份提醒
1. 存檔管理新增「下載存檔檔案」:存成 一念飛仙存檔_日期_境界.txt(內容與存檔代碼相同,格式不變)
2. 「讀取存檔檔案」:選檔後內容自動填入匯入視窗,再按「確認覆蓋匯入」(沿用原本的確認步驟,避免誤蓋)
3. 開遊戲提醒:從未備份,或距上次備份超過 7 天(代碼或檔案都算)
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = """              <i class="ii ui ii-u_import"></i> 匯入存檔代碼
            </button>
            """
assert s.count(old) == 1
s = s.replace(old, old.rstrip(' ') + """            <button id="btn-save-file" class="tap-effect py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded border border-slate-700">
              <i class="ii ui ii-u_export"></i> 下載存檔檔案
            </button>
            <button id="btn-load-file" class="tap-effect py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded border border-slate-700">
              <i class="ii ui ii-u_import"></i> 讀取存檔檔案
            </button>
            <input id="inp-load-file" type="file" accept=".txt,text/plain" style="display:none">
            """)
o2 = '<button id="btn-manual-save" class="tap-effect py-2'; assert s.count(o2) == 1
s = s.replace(o2, '<button id="btn-manual-save" class="col-span-2 tap-effect py-2')   # 保存進度獨佔一列,代碼/檔案各成一列
old = '@@INC:js/24_v82_彈窗層級.js@@'; assert s.count(old) == 1
s = s.replace(old, old + '\n@@INC:js/25_v90_存檔檔案.js@@')
open(p, 'w', encoding='utf-8', newline='').write(s)
js = os.path.join(ROOT, 'js', '25_v90_存檔檔案.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(r"""/* ===== v90 存檔檔案匯出/匯入 ===== */
(() => {
  const $ = id => document.getElementById(id);
  const code = () => btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  function fname() {
    const d = new Date(), z = n => String(n).padStart(2, '0');
    let rn = ''; try { rn = getRealmInfo().realm.name || ''; } catch (e) { }
    return `一念飛仙存檔_${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${rn ? '_' + rn : ''}.txt`;
  }
  function download() {
    try {
      saveGame(); state.lastExport = Date.now(); const txt = code(); saveGame();
      const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })), a = document.createElement('a');
      a.href = url; a.download = fname(); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      showToast('💾 存檔檔案已下載,請到手機「下載」資料夾查看。');
    } catch (e) { showToast('下載失敗,請改用「匯出存檔代碼」。'); }
  }
  function pick() { const i = $('inp-load-file'); if (i) { i.value = ''; i.click(); } }
  function loaded(f) {
    if (!f) return; const r = new FileReader();
    r.onload = () => {
      const txt = String(r.result || '').replace(/\s+/g, '');
      try { JSON.parse(decodeURIComponent(escape(atob(txt)))); } catch (e) { showToast('這不是有效的存檔檔案。'); return; }
      openSaveModal('import'); const ta = $('save-data-textarea'); if (ta) ta.value = txt;
      showToast('已讀取存檔檔案,確認無誤請按「確認覆蓋匯入」。');
    };
    r.onerror = () => showToast('讀取檔案失敗。'); r.readAsText(f);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#btn-save-file,#btn-load-file'); if (!b) return;
    if (b.id === 'btn-save-file') download(); else pick();
  });
  document.addEventListener('change', e => { if (e.target && e.target.id === 'inp-load-file') loaded(e.target.files && e.target.files[0]); });
  window.SV90 = { download, fname };
})();
""")
f = glob.glob(os.path.join(ROOT, 'js', '02_main', '019_*.js'))[0]; t = open(f, encoding='utf-8', newline='').read()
old = "if ((state.realmIdx || 0) >= 1 && !state.lastExport) showToast('💾 提醒:尚未匯出過存檔代碼,建議到右上 ⚙「存檔管理」匯出備份。');"
assert t.count(old) == 1
t = t.replace(old, "if ((state.realmIdx || 0) >= 1 && !state.lastExport) showToast('💾 提醒:尚未備份過存檔,建議到【仙途】→「存檔管理」下載存檔檔案。'); else if ((state.realmIdx || 0) >= 1 && Date.now() - state.lastExport > 7 * 86400000) showToast('💾 提醒:已超過 7 天沒有備份存檔,建議到【仙途】→「存檔管理」下載存檔檔案。');")
open(f, 'w', encoding='utf-8', newline='').write(t)
print('p19 ok')
