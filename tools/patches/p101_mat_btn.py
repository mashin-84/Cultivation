# 最終版191:點的是按鈕(如圖鑑「領取」)而材料名在同一張卡片別處時,不攔成材料途徑
f = 'src/js/36_v137_材料取得途徑.js'; t = open(f, encoding='utf8').read()
a = "    const btn = h.el.closest('button,a,[data-mk111],[role=\"button\"]');\n"
assert t.count(a) == 1
t = t.replace(a, a + "    { const tb = t.closest('button,a,[data-mk111],[role=\"button\"]'); if (tb && tb !== h.el && h.el.contains(tb)) return; }   /* v191 點到卡片裡的按鈕(領取等)→ 不攔 */\n")
open(f, 'w', encoding='utf8').write(t); print('OK')
