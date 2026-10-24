#!/usr/bin/env python3
"""最終版109:修為平衡
1. 修為丹改為「當前境界修為上限的百分比」:同階丹 = 12%;每低一階 ×0.4;高一階 ×1.5(最多 20%)
   (聚氣丹視為第 0 階,太清仙丹視為第 5 階,培元丹~金霞丹為第 1~7 階)
   同層連服丹毒照舊(前 3 顆全效,之後每顆減半);洗髓丹不再洗去丹毒(仍永久加吐納)
2. 減量:修為丹配方改為靈材 ×5 + 妖獸材料 ×2(原 3 + 1);天地異種寶箱的修為丹減半
3. 聚靈陣:每級除了原本 +4/秒,另加吐納 +2%(Lv.1 不加)
   悟性:每次點擊 = 吐納 ×(0.6 + 0.1 × 悟性等級)秒 + 悟性 ×3(原為固定 0.6 秒)
"""
import os, glob
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new, n=1):
    p = glob.glob(os.path.join(SRC, path))[0]; s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (path, old[:60], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
P8 = 'js/02_main/008_*.js'
sub(P8, "function pillEff() {", """/* v109 修為丹按境界上限百分比 */
const QIP_TIER = t => t === 'pill_1' ? 0 : t === 'pill_6' ? 5 : /^yq_\\d$/.test(t) ? +t.slice(3) : -1;
function qiPillVal(key) {
  const t = QIP_TIER(key); if (t < 0) return (ITEMS[key] && ITEMS[key].val) || 0;
  const cur = Math.min(7, state.realmIdx || 0), d = t - cur, pct = d >= 0 ? Math.min(.2, .12 * Math.pow(1.5, d)) : .12 * Math.pow(.4, -d);
  return Math.floor(getRealmInfo().maxQi * pct);
}
function pillEff() {""")
sub(P8, "const room = info.maxQi - state.qi, eff = pillEff(), raw = item.val * eff, add = Math.min(room, raw);",
        "const room = info.maxQi - state.qi, eff = pillEff(), raw = qiPillVal(key) * eff, add = Math.min(room, raw);")
sub(P8, "    const add = Math.min(room, item.val * eff);", "    const add = Math.min(room, qiPillVal(key) * eff);")
sub(P8, "    state.permQiRate += gain;\n    state.pillTox = 0;\n    msg = `服下洗髓丹 ×${n}，體內濁氣盡褪，丹毒盡消，吐納速度永久+${gain}/秒！`;",
        "    state.permQiRate += gain;\n    msg = `服下洗髓丹 ×${n}，體內濁氣盡褪，吐納速度永久+${gain}/秒！`;")
# 配方與寶箱
sub('js/02_main/020_*.js', "need: [nd(`hb_${t}`, 3), nd(`bp_${t}`, 1)], giveId: `yq_${t}`, desc: `${TIER_NAME[t]}靈材凝練的丹藥,服用增加 ${formatNum(YQ_VAL[t])} 點修為。` });",
    "need: [nd(`hb_${t}`, 5), nd(`bp_${t}`, 2)], giveId: `yq_${t}`, desc: `${TIER_NAME[t]}靈材凝練的丹藥,同階服用增加當前境界修為上限的 12%。` });")
sub('js/02_main/022_*.js', "else give(t >= 1 ? `yq_${t}` : 'pill_1', 5, '丹藥');", "else give(t >= 1 ? `yq_${t}` : 'pill_1', 3, '丹藥');")
sub('js/02_main/022_*.js', "  else give(t >= 1 ? `yq_${t}` : 'pill_1', 3 + t, '大批丹藥');", "  else give(t >= 1 ? `yq_${t}` : 'pill_1', 2 + Math.ceil(t / 2), '大批丹藥');")
# 聚靈陣、悟性
sub('js/02_main/005_*.js', "rawQiRate = Math.floor(rawQiRate * resMult);", "rawQiRate = Math.floor(rawQiRate * resMult);\n  rawQiRate = Math.floor(rawQiRate * (1 + 0.02 * Math.max(0, (state.arrayLevel || 1) - 1)));   // v109 聚靈陣每級吐納 +2%")
sub('js/02_main/007_*.js', "  const baseGain = stats.qiRate * TAP_QI_RATE_MULT;", "  const baseGain = stats.qiRate * (TAP_QI_RATE_MULT + 0.1 * (state.insightLevel || 1));   // v109 悟性越高,一次點擊抵越多秒吐納")
sub('js/02_main/006_*.js', "arrayQiBonus.innerText = `+${state.arrayLevel * 4}/秒`;", "arrayQiBonus.innerText = `+${state.arrayLevel * 4}/秒・吐納 +${2 * Math.max(0, state.arrayLevel - 1)}%`;")
sub('js/02_main/006_*.js', "insightBonus.innerText = `+${state.insightLevel * TAP_INSIGHT_PER_LV} 修為`;", "insightBonus.innerText = `約 ${(TAP_QI_RATE_MULT + 0.1 * state.insightLevel).toFixed(1)} 秒吐納 +${state.insightLevel * TAP_INSIGHT_PER_LV}`;")
# 說明文字
sub('js/02_main/002_*.js', "desc: '服用直接增加 500 點氣海修為(只能服到圓滿;同層連服積丹毒,藥力遞減)' },", "desc: '服用增加修為(第 0 階;練氣期為上限 12%,境界越高藥效越弱;只能服到圓滿;同層連服積丹毒)' },")
sub('js/02_main/002_*.js', "desc: '服下體內濁氣盡褪，永久增加吐納速度+5/秒,並洗去當層丹毒' },", "desc: '服下體內濁氣盡褪，永久增加吐納速度+5/秒' },")
sub('js/02_main/002_*.js', "desc: '仙家妙藥，服用直接增加 100 萬點修為(只能服到圓滿;同層連服積丹毒)' },", "desc: '仙家妙藥(第 5 階),真仙境服用增加修為上限 12%,高於或低於此境藥效隨之增減(只能服到圓滿;同層連服積丹毒)' },")
sub('js/02_main/002_*.js', "desc: '基礎修真靈丹，服用立增 500 點修為。' }", "desc: '基礎修真靈丹,練氣期服用增加修為上限 12%。' }")
sub('js/02_main/002_*.js', "desc: '仙界妙藥，服用立增 100 萬點修為。' }", "desc: '仙界妙藥,真仙境服用增加修為上限 12%。' }")
sub('js/02_main/020_*.js', "desc: `服用直接增加 ${formatNum(YQ_VAL[t])} 點修為(只能服到圓滿;同層連服積丹毒)。` };",
    "desc: `第 ${t} 階修為丹:${TIER_NAME[t]}服用增加修為上限 12%,境界越高藥效越弱(只能服到圓滿;同層連服積丹毒)。` };")
print('p41 ok')
