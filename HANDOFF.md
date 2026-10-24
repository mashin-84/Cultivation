# 《一念飛仙》交接說明（最終版129）

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

## 待辦
- 其他外觀的戰鬥背影與本命特寫（目前沿用新手服）。已完成：男 o2 背影（v128）；女 o2–o5 背影、特寫、半身（v129）。尚缺：男 o3–o5 背影、男 o2–o5 特寫＋半身。特寫切圖 `python3 tools/art/uc_slice.py F o2 特寫表.jpg`（3x2：劍/法/體/丹絕學、戰意、負傷）。女款第 3、8 格 TIPS 自動判斷不準，已手動量測。切背影圖用 `python3 tools/art/bp_slice.py M o2 主表.jpg [補圖.jpg 4,7]`，會印出 TIPS 要補進兩份戰鬥模組。特寫 UC 與半身 CP 已依外觀取圖（鍵 `F_o2_sword`、`F_o2_n`），缺圖退回只分性別的舊圖。
- 其餘 6 場劇情戰的專屬台詞（目前只有顧青衍、天道有）。
- 使用者之後提供的音效檔。
