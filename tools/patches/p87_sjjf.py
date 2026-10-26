# v172:生死交鋒 A(第一章墨塵點題)+B(預告)+C(境主首戰進重要戰鬥)
import glob
def rep(f, old, new, n=1):
    s = open(f, encoding='utf8').read(); c = s.count(old); assert c == n, (f, old[:40], c)
    open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對', c, '次')
G = lambda p: glob.glob(p)[0]
# ---- A:第一章墨塵救人後點出「生死交鋒」
rep(G('src/js/02_main/057_*.js'),
    "[S('墨塵', 'kind', '躲起來是對的。活著,比什麼都重要。')]),\n",
    "[S('墨塵', 'kind', '躲起來是對的。活著,比什麼都重要。')]),\n"
    "      S('墨塵', 'kind', '記住方才那種感覺——心神凝成一線,生死就懸在一念之間。修士管這叫「生死交鋒」。'),\n"
    "      S('墨塵', 'kind', '平日斬妖除魔,靠的是本事;這種關頭不會常有,可每一回,都是修行路上的一道坎。'),\n")
# ---- B:新模組載入、劇情總覽頂端預告卡、指引列字樣
rep('src/index.html', "@@INC:js/42_v163_歷練戰鬥流派立繪.js@@\n", "@@INC:js/42_v163_歷練戰鬥流派立繪.js@@\n@@INC:js/43_v172_生死交鋒.js@@\n")
rep(G('src/js/02_main/055_*.js'), "    const _top = h.length;\n", "    if (window.SJ172) h += SJ172.card();   /* v172 生死交鋒預告 */\n    const _top = h.length;\n")
f39 = 'src/js/39_v160_體驗修正.js'
rep(f39, "t: `新的劇情:〈${sn.title}〉`", "t: `${window.SJ172 && SJ172.has(sn) ? '生死交鋒將至' : '新的劇情'}:〈${sn.title}〉`")
rep(f39, "t: `前往【${G.area}】斬殺境主【${G.boss}】`", "t: `生死交鋒:前往【${G.area}】斬殺境主【${G.boss}】`")
# ---- C:境主台詞(兩份同步)
BOSS = """      win: '……天道……為何……不語……', lose: '逆者已伏。天門,復歸於靜。' },
    /* v172 八位境主(第一次交手為生死交鋒) */
    '狂暴青狼王': { charge: ['(狼王伏低身軀,四爪扣進岩縫)', '裂風狼牙'],
      intro: '(狼王仰天長嚎,滿山狼群應聲伏低——這片山,是牠的)',
      p2: '(狼王甩去臉上的血,綠眼裡第一次露出忌憚)', p3: '(一聲淒厲長嚎,牠渾身青毛倒豎,狂性大發)',
      win: '(狼王嗚咽著倒地,狼群四散奔逃)', lose: '(狼王低頭嗅了嗅你,轉身踱回巢穴)' },
    '千年幽冥蛟': { charge: ['(蛟身盤起,幽潭之水倒捲上天)', '幽冥吞淵'],
      intro: '千年了……總算又有不知死活的修士,來送道行。',
      p2: '區區人修,竟能傷我鱗甲?', p3: '那便連人帶魂,沉進這幽冥潭底!',
      win: '我修了千年……竟要死在……一個小輩手裡……', lose: '回去再修幾年。你的道行,我日後再收。' },
    '烈焰火鱗雕': { charge: ['(火鱗雕振翅升空,周身烈焰越燒越白)', '焚天俯衝'],
      intro: '(一聲尖唳,熔岩翻湧,火鱗雕自火穴深處破焰而出)',
      p2: '(羽翼間的火鱗片片豎起,熱浪逼得人睜不開眼)', p3: '(火鱗雕燃起本命真火,整座火穴都在震顫)',
      win: '(火光一暗,巨雕墜入熔岩,只留下幾片不滅的火羽)', lose: '(火鱗雕盤旋一周,長唳一聲,飛回火穴深處)' },
    '滅世雷煞魔尊': { charge: ['雷煞匯聚,崖頂天色驟黑', '滅世雷煞'],
      intro: '本尊在這雷崖鎮了三千年。每一道雷,都劈過一個想成仙的蠢貨。',
      p2: '有趣……你的骨頭,比雷還硬。', p3: '那便讓你嘗嘗,真正的滅世之雷!',
      win: '雷……竟也有,劈不動的人……', lose: '又一道雷。這崖上,很快就會多一具骸骨。' },
    '混沌造化真龍': { charge: ['龍吟九霄,造化之氣翻湧', '造化龍息'],
      intro: '凡人修到此處,已是不易。可這仙宮,不是你能踏足的地方。',
      p2: '……你的道,竟有幾分造化之意。', p3: '那便讓吾看看,你能承受幾分真龍之怒!',
      win: '好……這仙宮,今後由你來去。', lose: '回去罷。你的道,尚未成形。' },
    '司雷天將': { charge: ['天鼓擂響,雷光聚於鞭梢', '九天司雷鞭'],
      intro: '奉天庭之令,鎮守天闕。下界修士,止步!',
      p2: '能接下天雷三鞭……你在下界,定是一方人物。', p3: '天規所在,不容僭越——雷部,聽令!',
      win: '……天闕為你而開。可天上,未必如你所想。', lose: '下界之人,終究是下界之人。' },
    '弱水玄龜': { charge: ['(玄龜緩緩縮首,弱水在四周凝成漩渦)', '弱水沉淵'],
      intro: '老龜……睡了很久了。是你,吵醒了老龜?',
      p2: '……疼。很久……沒有疼過了。', p3: '弱水三千,鴻毛不浮……你,沉得下去麼?',
      win: '……好……老龜,可以再睡了……', lose: '去吧……等你輕得能浮在弱水上……再來。' },
    '混沌魔神·渾沌': { charge: ['混沌翻湧,天地輪廓逐漸模糊', '歸墟混沌'],
      intro: '天地未分之前,便有我。你這一念,又算得了什麼?',
      p2: '……一念,竟能在混沌中不散。', p3: '那便讓這一念,也歸於混沌!',
      win: '原來……一念,也能開天……', lose: '歸去吧。萬物,終將歸我。' }"""
OLDB = "      win: '……天道……為何……不語……', lose: '逆者已伏。天門,復歸於靜。' }"
for f in ['src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js']: rep(f, OLDB, BOSS)
# ---- C:境主首戰接進重要戰鬥(只在 35_v113 的 v125 段落)
f35 = 'src/js/35_v113_重要戰鬥.js'
rep(f35, "      if (Bt.isTower && (m.isBoss || id === 'tw_100')) return 'tower';\n      return null;",
    "      if (Bt.isTower && (m.isBoss || id === 'tw_100')) return 'tower';\n"
    "      if (!Bt.isTower && !Bt.isSect && m.isBoss && bossArea(m) >= 0) return 'boss';   /* v172 境主首戰 */\n      return null;")
rep(f35, "    const id100 = m => String(m.id || '') === 'tw_100';\n",
    "    const id100 = m => String(m.id || '') === 'tw_100';\n"
    "    /* v172 境主所屬地區;已首殺的不算(重打維持一般歷練戰鬥) */\n"
    "    function bossArea(m) { try { const i = AREAS_DATA.findIndex(a => a.monsters.some(x => x.isBoss && x.id === m.id)); return i >= 0 && !(state.areaFirstClear || {})[AREAS_DATA[i].id] ? i : -1; } catch (e) { return -1; } }\n")
rep(f35, "      else if (k === 'tb26') {",
    "      else if (k === 'boss') { const i = bossArea(m); c.id = m.id; c.label = `境主・${AREAS_DATA[i].name}`; c.bgSrc = G3()['A' + Math.min(7, i)] || ''; c.auto = !!state.autoExplore; c.turns = 10; }\n"
    "      else if (k === 'tb26') {")

# 修正:境主立繪改用區域怪物圖 MONART26
rep(f35, "c.label = `境主・${AREAS_DATA[i].name}`; c.bgSrc", "c.label = `境主・${AREAS_DATA[i].name}`; { const sa = window.MONART26 && MONART26(m); if (sa) c.art = { src: sa, flip: false }; } c.bgSrc")
