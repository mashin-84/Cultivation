# 《一念飛仙》交接說明（最終版155）

## 新對話第一步
1. 把 GitHub 倉庫 `mashin-84/Cultivation` 加進對話（要推送權限）。
2. 原始碼在 **`source` 分支**，網站在 `main` 分支：
   ```
   git clone -b source https://github.com/mashin-84/Cultivation /home/claude/rf
   git clone https://github.com/mashin-84/Cultivation /home/claude/cultivation
   ```
3. 先讀本檔與 `README.md`，再開始改。

## 作業規則（使用者的固定要求）
- 全程繁體中文回覆。使用者在 Android 主畫面 PWA 上玩：https://mashin-84.github.io/Cultivation/
- **不要貼整份程式碼**；用 Python 檢查結構、簡短回報。
- 討論型問題先評估、提方案；使用者說「做」或明確同意才動手。
- 不要提「輕量版」，要做就做完整版。存檔格式必須相容舊存檔。
- 紅點規則：能點的東西，在它自己的位置和底部導覽分頁都要有紅點。
- 遊戲本身要保護存檔，不要讓玩家自己備份。
- 圖片提示詞：開頭放完整風格聖經原文、結尾加 Reminder；洋紅 #FF00FF 背景、寫「EXACTLY N」、一張盡量多塞；用可直接複製的區塊貼在對話裡。敵人一律面向左（面向主角），方向錯的切圖時翻轉即可。
  風格聖經原文：
  > Style bible: quiet fantasy-journey anime aesthetic set in ancient China. Soft muted pastel palette (pale sky blue, sage green, cream white, lavender, warm beige) with small accents of cinnabar red and jade green, thin delicate line art with slightly stronger outer silhouette lines, soft cel shading with slightly feathered shadow edges, subtle highlights, slender natural proportions, restrained but distinct expressions, each character with a small signature gesture. Luminous light, soft haze, layered depth in any scenery; backgrounds look hand-painted with watercolor-like texture. Icons and items in the same soft pastel cel style with thin dark outlines and one soft highlight, readable at small size.

## 開發流程
- 只改 `src/`。打包檢查：`python3 build.py dist/vNNN.html --check`
- 發佈網站：`python3 tools/deploy.py "最終版NNN:說明"`（會打包網站版、推到 main）。發佈後也要把 `src/` 的變更 commit 並 push 到 `source` 分支。
- 改程式用 Python 腳本做精確字串取代並 assert 次數為 1。
- 重要戰鬥模組有兩份要同步改：`src/js/35_v113_重要戰鬥.js` 與 `tools/patches/p48_bf.js`（後者是同內容去掉檔尾「接上劇情戰」以後的部分）。
- 測試：playwright（Chromium 已預裝）載入 `dist/*.html`，用使用者存檔注入 localStorage `XIUXIAN_SAVE_V2`。存檔不放在倉庫裡，需要時請使用者匯出貼上。

## 近期完成（v113–v127）
- 重要戰鬥獨立畫面 BF113（回合制 + QTE + 自動、逃離）：劇情戰 8 場、守山長老、九九登天塔塔主（每 9 層）與第 100 層心魔、九重劫、渡劫心魔、天地異種、秘境/輔修守關者、天道之戰（第 8 章 8.5 的真正最終戰）。
- 難度：劇情戰固定掛自動約五成勝率；其他戰鬥依原本敵我強弱換算勝率。
- 選招面板：左主角半身（CP124，血量 <30% 換負傷表情）、右直列技能，本命絕學大格動態。
- QTE 美術（QT124）：卷軸時機條、玉符連點、護盾按鈕＋細紅線格擋（判定瞬間發光、錯過碎裂）、白玉蓄力鈕、完美光爆。
- 本命絕學傷害 = 最強攻擊神通總倍率 ×1.6（保底 5），正常暴擊，吃最強神通的增傷加成。
- 敵人圖全部換成高解析新圖並面向左（A45 系列、GEN3 的 K1–K8 塔主、W1–W8 天地異種）。
- 主角戰鬥背影（BP114，目前只有新手服 o1）、本命特寫（UC121，男主已改長髮）。

- 材料取得途徑（v137，`src/js/36_v137_材料取得途徑.js`）：任何畫面點到「只含一種材料名的短文字」（配方材料格、戰利品、紀錄）就跳出途徑視窗（X5 sheet `src`）；本身是按鈕的不攔。歷練掉落讀 AREAS_DATA；靈田讀 `X5.CROPS`；每日秘境讀 `SR17.defs()` 判斷今日有沒有開；坊市、熔爐、器紋、天機閣、登天塔、天地異種、九重劫依各自程式的產出規則寫在 `sysRows()`，改那些系統的產出時要同步改這裡。未隨劇情開啟（UNLOCK9）的系統不列。「前往」歷練＝切區域並開自動歷練，戰鬥中則等打完再切。行囊物品視窗另加「取得途徑」鈕。`MAT37.rows(id)` 可直接看某材料的途徑。

- 圖示補完（v138，`src/js/37_v138_圖示補完.js`、`src/assets/IC138/`）：歷練地圖路線改用生成圖（石盤三態、營地、旗、男女主角打坐、首領紅框內嵌首領怪物圖，經 `MONART26`）；淨塵蓮子、清心化毒丹有圖；重要戰鬥「逃離」「自動」套木/金按鈕底圖＋圖示；熔爐勾選框、靈田/靈寵升級箭頭、道途錄章節、劇情回顧 ▶、改名鉛筆都換圖。

- 流派戰鬥動作（v142，p64）：圖鍵 `BP/{M|F}_{外觀}_{magic|body|pill}_{1..9}`，劍修沿用 `{M|F}_{外觀}_{n}`；該外觀沒有流派圖就沿用該外觀劍修圖（`pkey()`）。法修原地施法（飛符 `BP/talisman`、天降光柱 `fxSky`），體修同劍修衝上前，丹修攻擊神通與絕學前先服丹（動作 4）。切圖：`python3 tools/art/bp_slice.py M o1_magic 表.jpg`（look 參數帶流派即可，補圖格數可含脫手道具）。目前只有新手服男款的三流派。

- 第一章〈妖潮夜〉劇情戰（v145，p66）：1.2 兩個選項都進戰鬥。`script:'c1kid'` 孩童持鋤（只有揮鋤＋格擋，第 5 回合被撲倒、劇情殺不出敗北畫面），`script:'c1mo'` 墨塵（普攻、4 神通、酒葫蘆、絕學「一劍青雲」，依序引導）。引擎掛鉤：`B.A`（角色與腳本）、`B.G`（引導允許的按鈕與提示）、`SCR` 物件在 35_v113 的「v145 劇情戰腳本」。圖在 `src/assets/C1/` 與 `BP/M_mc_*`，切圖 `tools/art/c1_slice.py`。墨塵第 5 格（格擋）圖是正面，但腳本裡妖狼不蓄力所以用不到。
- 本命絕學依流派（v148，p69）：重要戰鬥 ULT 物件帶 `k/f/fl`（倍率係數、保底），`ultM()` 依流派；附加效果在 doUlt 結尾（法：灼燒+60% 定身、體：40% 護盾、丹：回 30%+攻 25%），模擬 `sim()` 同步。神通頁「本命絕學」卡片讀 `BF113.ultInfo()`（054 的 XT.skills）。
- **測試開關 FREE143（v143，目前開著）**：`src/js/02_main/000_…js` 第 2 行 `window.FREE143 = true`，換流派免靈石、無冷卻，劇情開始後也能換男女。測完要改成 `false` 恢復限制。

## 待辦
- （已完成）男女五套外觀（o1–o5）的背影、本命特寫、選招半身全部完成（v133）。特寫切圖 `python3 tools/art/uc_slice.py F o2 特寫表.jpg`（依 3x2 格線切：劍/法/體/丹絕學、戰意、負傷）。Gemini 生的第 3 格（攻擊神通）常朝左，切完要左右翻轉再量 TIPS。女款第 3、8 格 TIPS 自動判斷不準，已手動量測。切背影圖用 `python3 tools/art/bp_slice.py M o2 主表.jpg [補圖.jpg 4,7]`，會印出 TIPS 要補進兩份戰鬥模組。特寫 UC 與半身 CP 已依外觀取圖（鍵 `F_o2_sword`、`F_o2_n`），缺圖退回只分性別的舊圖。
- 流派戰鬥動作其餘 12 張（新手服、素白、墨羽男女、赤霞男女已完成；素白女法修 4、9 取自另一張表；女丹修第 4 格暫用第 7 格；其他 4 套外觀男女各 3 張）。
- 其餘 6 場劇情戰的專屬台詞（目前只有顧青衍、天道有）。
- 使用者之後提供的音效檔。
