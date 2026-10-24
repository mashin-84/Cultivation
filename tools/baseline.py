#!/usr/bin/env python3
"""基準線/回歸檢查:用指定存檔開遊戲,截圖六個分頁、記錄數值快照、存檔往返、console 錯誤。
用法:python3 tools/baseline.py <遊戲.html> <存檔代碼.txt> <輸出資料夾> [--ref 舊輸出資料夾]
有 --ref 時,會比對 stats.json / roundtrip.json,印出差異。
"""
import sys, os, json, base64, time
from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:] if not a.startswith('--')]
HTML, SAVE, OUT = args[:3]
REF = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else None
if REF in args: args.remove(REF)
os.makedirs(OUT, exist_ok=True)

save = json.loads(base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode('utf-8'))
save['lastSave'] = int(time.time() * 1000)  # 避免離線補算讓每次結果不同
raw = json.dumps(save, ensure_ascii=False)

TABS = ['tab-abode', 'tab-techniques', 'tab-adventure', 'tab-crafting', 'tab-inventory', 'tab-records']
SNAP = r"""() => {
  const r = {};
  const num = o => JSON.parse(JSON.stringify(o, (k, v) => typeof v === 'number' ? +v.toPrecision(10) : v));
  try { r.stats = num(calculateTotalStats()); } catch (e) { r.stats_err = String(e); }
  try { r.x5 = num(window.X5.E()); } catch (e) { r.x5_err = String(e); }
  try { r.realm = getRealmInfo().title; } catch (e) {}
  try { r.tower = [1, 9, 50, 99, 100].map(f => { const m = towerMonster(f); return {f, name: m.name, hp: m.maxHp || m.hp, atk: m.atk, def: m.def}; }); } catch (e) { r.tower_err = String(e); }
  return r;
}"""

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=1)
    pg.on('console', lambda m: m.type == 'error' and errors.append(m.text))
    pg.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
    pg.add_init_script("if(!sessionStorage.getItem('bl')){sessionStorage.setItem('bl','1');localStorage.clear();localStorage.setItem('XIUXIAN_SAVE_V2'," + json.dumps(raw) + ");}")
    pg.goto('file://' + os.path.abspath(HTML))
    pg.wait_for_timeout(2500)
    pg.evaluate("() => { const t = document.getElementById('title34'); t && t.click(); try{audio.enabled=false}catch(e){} }")
    pg.wait_for_timeout(1500)
    # 關掉開場可能彈出的視窗(劇情/提示),不做任何遊戲操作
    snap = pg.evaluate(SNAP)
    json.dump(snap, open(os.path.join(OUT, 'stats.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    for i, t in enumerate(TABS):
        pg.evaluate("id => goToTab(id)", t); pg.wait_for_timeout(900)
        pg.screenshot(path=os.path.join(OUT, '%d_%s.png' % (i, t)))
    # 存檔往返:讀入後立即存出,比對欄位
    pg.evaluate("() => saveGame()")
    back = json.loads(pg.evaluate("() => localStorage.getItem('XIUXIAN_SAVE_V2')"))
    b.close()

diff = {'missing': sorted(set(save) - set(back)), 'added': sorted(set(back) - set(save)),
        'changed': sorted(k for k in save if k in back and save[k] != back[k])}
json.dump({'diff': diff, 'keys_in': len(save), 'keys_out': len(back)}, open(os.path.join(OUT, 'roundtrip.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(errors, open(os.path.join(OUT, 'errors.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('realm', snap.get('realm'), '| combatPower', snap.get('stats', {}).get('combatPower'))
print('roundtrip', diff)
print('console errors', len(errors), errors[:5])

if REF:
    bad = 0
    for f in ('stats.json', 'roundtrip.json'):
        a = json.load(open(os.path.join(REF, f), encoding='utf-8')); c = json.load(open(os.path.join(OUT, f), encoding='utf-8'))
        same = a == c; bad += not same
        print('比對', f, '相同' if same else '不同!')
    sys.exit(1 if bad else 0)
