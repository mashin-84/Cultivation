#!/usr/bin/env python3
"""把 src/ 打包成單檔 HTML。
用法:python3 build.py [輸出檔名]   (預設 dist/一念飛仙.html)
      python3 build.py out.html --check   (另外對每段 <script> 跑 node --check)
規則:
  index.html 內 @@INC:路徑@@      → 換成該檔內容;路徑以 / 結尾 = 該資料夾所有檔依檔名排序串接
  任何檔內 @@IMG:資料夾/名稱@@    → 換成 assets/資料夾/名稱.webp 的 base64
      python3 build.py --site 資料夾   (網站版:圖片不內嵌,改為 assets/… 獨立檔;連同 pwa、音樂一起輸出到該資料夾)
"""
import json, os, re, sys, base64, hashlib, subprocess, tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')

def rd(p): return open(p, encoding='utf-8', newline='').read()

def inc(m):
    rel = m.group(1); p = os.path.join(SRC, rel)
    if rel.endswith('/'):
        return ''.join(rd(os.path.join(p, f)) for f in sorted(os.listdir(p)) if f.endswith('.js'))
    return rd(p)

def img(m):
    p = os.path.join(SRC, 'assets', m.group(1) + '.webp')
    return base64.b64encode(open(p, 'rb').read()).decode()

def sfxmap():   # 網站版音效清單 {名稱: 雜湊}
    d = os.path.join(SRC, 'pwa', 'sfx')
    if not os.path.isdir(d): return {}
    return {f[:-4]: hashlib.md5(open(os.path.join(d, f), 'rb').read()).hexdigest()[:8] for f in sorted(os.listdir(d)) if f.endswith('.mp3')}

def movmap():   # 網站版動畫清單 {名稱: 雜湊}
    d = os.path.join(SRC, 'pwa', 'movie')
    if not os.path.isdir(d): return {}
    return {f[:-4]: hashlib.md5(open(os.path.join(d, f), 'rb').read()).hexdigest()[:8] for f in sorted(os.listdir(d)) if f.endswith('.mp4')}

def build(site=False):
    html = re.sub(r'@@INC:([^@]+)@@', inc, rd(os.path.join(SRC, 'index.html')))
    if site:   # 網站版:data URI 整段換成相對路徑
        def ver(k): return hashlib.md5(open(os.path.join(SRC, 'assets', k + '.webp'), 'rb').read()).hexdigest()[:8]
        html = re.sub(r'data:image/webp;base64,@@IMG:([^@]+)@@', lambda m: 'assets/' + m.group(1) + '.webp?v=' + ver(m.group(1)), html)
    html = re.sub(r'@@IMG:([^@]+)@@', img, html)
    html = html.replace('@@SFXMAP@@', json.dumps(sfxmap() if site else {}))
    html = html.replace('@@MOVMAP@@', json.dumps(movmap() if site else {}))
    assert '@@INC:' not in html and '@@IMG:' not in html
    return html

def check(html):
    bad = 0
    for i, body in enumerate(re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)):
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
            f.write(body); fn = f.name
        r = subprocess.run(['node', '--check', fn], capture_output=True, text=True); os.unlink(fn)
        if r.returncode: bad += 1; print('script #%d 語法錯誤:\n%s' % (i, r.stderr[:600]))
    print('node --check:', '全部通過' if not bad else '%d 段失敗' % bad)
    return bad == 0

def build_site(out):
    import shutil, json
    html = build(site=True)
    used = sorted(set(re.findall(r'assets/([^"\'()\s]+?)\.webp\?v=', html)))
    urls = sorted(set(re.findall(r'assets/[^"\'()\s]+?\.webp\?v=[0-9a-f]{8}', html)))
    if os.path.isdir(os.path.join(out, 'assets')): shutil.rmtree(os.path.join(out, 'assets'))
    for k in used:
        d = os.path.join(out, 'assets', os.path.dirname(k)); os.makedirs(d, exist_ok=True)
        shutil.copy(os.path.join(SRC, 'assets', k + '.webp'), d)
    urls += ['sfx/%s.mp3?v=%s' % kv for kv in sfxmap().items()]
    urls += ['movie/%s.mp4?v=%s' % kv for kv in movmap().items()]
    json.dump(['./' + u for u in urls], open(os.path.join(out, 'assets', 'list.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    pwa = os.path.join(SRC, 'pwa')
    for f in os.listdir(pwa):
        s = os.path.join(pwa, f)
        if os.path.isdir(s): shutil.copytree(s, os.path.join(out, f), dirs_exist_ok=True)
        else: shutil.copy(s, out)
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8', newline='').write(html)
    print('網站版輸出', out, 'index.html %.2f MB' % (len(html.encode()) / 1e6), '圖片', len(used), '張')
    return html

if __name__ == '__main__':
    if '--site' in sys.argv:
        out = sys.argv[sys.argv.index('--site') + 1]; html = build_site(out)
        if '--check' in sys.argv and not check(html): sys.exit(1)
        sys.exit(0)
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = args[0] if args else os.path.join(ROOT, 'dist', '一念飛仙.html')
    html = build()
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    open(out, 'w', encoding='utf-8', newline='').write(html)
    b = html.encode()
    print('輸出', out, '%.2f MB' % (len(b) / 1e6), 'md5', hashlib.md5(b).hexdigest())
    if '--check' in sys.argv and not check(html): sys.exit(1)
