#!/usr/bin/env python3
"""一次性工具:把單檔 HTML 拆成 src/(之後日常只改 src/,用 build.py 打包)。
用法:python3 tools/split.py 一念飛仙_最終版71.html src
"""
import re, sys, os, base64, json, shutil

SRC_HTML, OUT = sys.argv[1], sys.argv[2]
s = open(SRC_HTML, encoding='utf-8', newline='').read()
assert '@@' not in s

# ---------- 1. 圖片 ----------
IMG_RE = re.compile(r'data:image/webp;base64,([A-Za-z0-9+/=]+)')
imgs = [(m.start(), m.end(), m.group(1)) for m in IMG_RE.finditer(s)]
# 先換成占位符,方便判斷所在資料表
tmp, last, parts = [], 0, []
for i, (a, b, _) in enumerate(imgs):
    parts.append(s[last:a]); parts.append('\x00%d\x00' % i); last = b
parts.append(s[last:]); t = ''.join(parts)
toks = [m.start() for m in re.finditer(r'\x00\d+\x00', t)]

def clean(x):
    x = re.sub(r'[^\w㐀-鿿・\-]', '_', x)
    x = re.sub(r'_+', '_', x)
    return x.strip('_') or 'x'

def key_of(pos):
    pre = t[max(0, pos - 120):pos]
    for rx in (r'\[\s*[\'"]([^\'"]+)[\'"]\s*\]\s*=\s*[\'"]$',
               r'[\'"]([^\'"{},]+)[\'"]\s*:\s*[\'"]$',
               r'([\w$]+)\s*:\s*[\'"]$',
               r'([\w$.]+)\s*=\s*[\'"]$'):
        m = re.search(rx, pre)
        if m: return m.group(1)
    if re.search(r'url\(\s*[\'"]?$', pre): return 'css'
    if re.search(r'src=[\'"]$', pre): return 'html'
    return None

def owner_of(pos):
    """往回找未配對的 '{',取其前方的名稱;最多兩層(如 P.bg)。"""
    names, depth, i, lim = [], 0, pos, max(0, pos - 400000)
    while i > lim and len(names) < 2:
        i -= 1; c = t[i]
        if c == '}': depth += 1
        elif c == '{':
            if depth: depth -= 1; continue
            pre = t[max(0, i - 80):i]
            m = (re.search(r'Object\.assign\(\s*([\w$.]+)\s*,\s*$', pre) or
                 re.search(r'([\w$.]+)\s*=\s*$', pre) or
                 re.search(r'[\'"]([^\'"{},]+)[\'"]\s*:\s*$', pre) or
                 re.search(r'([\w$]+)\s*:\s*$', pre))
            if not m: break
            names.append(m.group(1).replace('window.', ''))
            if '=' in pre[m.end(1) - len(pre):] or re.search(r'=\s*$', pre): break
    return '.'.join(reversed(names)) if names else None

os.makedirs(OUT, exist_ok=True)
adir = os.path.join(OUT, 'assets')
used, manifest, tokmap = set(), [], {}
for i, (a, b, data) in enumerate(imgs):
    k, o = key_of(toks[i]), owner_of(toks[i])
    pre = t[max(0, toks[i] - 200):toks[i]]
    m = re.search(r'([\w$.]+)\[\s*[\'"][^\'"]+[\'"]\s*\]\s*=\s*[\'"]$', pre)
    if m: o = m.group(1)                                   # P.mon['顧青衍']='...'
    if k == 'css': o, k = '_css', 'title_bg'
    if k == 'src' and re.search(r'<img src=[\'"]$', pre): o, k = '_html', 'img'
    if k is None:                                        # 陣列元素:取陣列所屬鍵 + 序號
        mm = list(re.finditer(r'[\'"]([\w$]+)[\'"]\s*:\s*\[', t[max(0, toks[i] - 4000):toks[i]]))
        if mm: k = mm[-1].group(1)
    o = {'bg': 'FUR68.bg'}.get(o, o)
    folder = clean(o) if o else '_misc'
    name = clean(k) if k else '%03d' % i
    rel, n = '%s/%s' % (folder, name), 1
    while rel in used: rel = '%s/%s_%d' % (folder, name, n); n += 1
    used.add(rel)
    p = os.path.join(adir, rel + '.webp'); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'wb').write(base64.b64decode(data))
    tokmap[i] = rel
    manifest.append({'id': rel, 'order': i, 'table': o, 'key': k, 'bytes': len(data) * 3 // 4})
json.dump(manifest, open(os.path.join(adir, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
t = re.sub(r'\x00(\d+)\x00', lambda m: 'data:image/webp;base64,@@IMG:%s@@' % tokmap[int(m.group(1))], t)

# ---------- 2. CSS / JS ----------
def write(rel, body):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='').write(body)

def title_of(body, default):
    m = re.search(r'/\*\s*=+\s*(.*?)\*/', body[:600], re.S)
    if not m: return default
    for line in m.group(1).split('\n'):
        line = line.strip(' =*\t')
        if line: return clean(line)[:28]
    return default

out, last, si, ci = [], 0, 0, 0
for m in re.finditer(r'(<(script|style)\b[^>]*>)(.*?)(</\2>)', t, re.S):
    out.append(t[last:m.start(3)])
    body, kind = m.group(3), m.group(2)
    if kind == 'style':
        idm = re.search(r'id="([^"]+)"', m.group(1))
        rel = 'css/%02d_%s.css' % (ci, idm.group(1) if idm else 'style'); ci += 1
        write(rel, body); out.append('@@INC:%s@@' % rel)
    else:
        if len(body) > 300000:  # 主腳本:依區段標頭切檔
            d = 'js/%02d_main' % si
            heads = [h.start() for h in re.finditer(r'/\*\s*=+', body)]
            cuts = [0] + heads[1:] + [len(body)]
            for j in range(len(cuts) - 1):
                chunk = body[cuts[j]:cuts[j + 1]]
                write('%s/%03d_%s.js' % (d, j, title_of(chunk, 'part')), chunk)
            out.append('@@INC:%s/@@' % d)
        else:
            NAMES = {0: 'head_A46_洞府場景・導覽・流派神通圖', 1: 'head_A47_介面小圖示',
                     3: 'title34_標題畫面點擊進入', 21: 'v69_FUR68_丹爐器爐塔圖・分頁背景'}
            rel = 'js/%02d_%s.js' % (si, NAMES.get(si) or title_of(body, 'script'))
            write(rel, body); out.append('@@INC:%s@@' % rel)
        si += 1
    last = m.end(3)
out.append(t[last:])
write('index.html', ''.join(out))
print('images', len(imgs), 'scripts', si, 'styles', ci)
