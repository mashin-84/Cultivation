# 《一念飛仙》原始碼資料夾

從最終版71 拆出來的。之後日常只改 `src/` 裡的小檔,再打包回單一 HTML。

## 打包
```
python3 build.py 一念飛仙_最終版72.html --check
```
- 輸出單檔 HTML(圖片自動內嵌),`--check` 會對每段 `<script>` 跑 `node --check`。
- 未修改任何檔時,輸出與最終版71 逐位元組相同(md5 1b0f2288ed8a087099a108d9e2372a23)。

## 結構
| 路徑 | 內容 |
|---|---|
| `src/index.html` | HTML 外殼。`@@INC:路徑@@` = 插入檔案;路徑以 `/` 結尾 = 資料夾內所有 .js 依檔名排序串接 |
| `src/css/` | 4 段 `<style>`(00 = Tailwind 內嵌) |
| `src/js/00–22_*.js` | 原本 23 段 `<script>`,檔名前兩碼 = 原順序 |
| `src/js/02_main/000–076_*.js` | 主腳本依 77 個區段標頭切開(只是切點,單檔不一定是完整語法,要整段串起來才完整) |
| `src/assets/<資料表>/<鍵>.webp` | 743 張圖。程式裡寫成 `data:image/webp;base64,@@IMG:資料表/鍵@@` |
| `src/assets/manifest.json` | 每張圖的原資料表、鍵、原始順序、大小(參考用,打包不依賴它) |

## 換圖
把新的 webp 以**同檔名**覆蓋 `src/assets/<資料表>/<鍵>.webp`,再打包即可。
新增圖片:放進資料夾,並在程式裡寫 `data:image/webp;base64,@@IMG:資料表/新鍵@@`。

## 擴充步驟登記表 XT(最終版72 起)
原本後期模組用「`const _f = f; f = function(){ _f(); … }`」層層包裝舊函式。合併後改為:各模組把步驟登記在 `XT`,
原函式在本體之後**依原安裝順序**呼叫 `XT.步驟 && XT.步驟()`(模組尚未載入就略過,與原本「那層包裝還沒裝上」同義)。
看一個函式完整做了什麼:打開原函式,底部「擴充步驟」註解列出每一步與所在檔案。
已合併:updateTopBar、calculateTotalStats、redFlags、renderInventory、renderSkills(v10.2 版為唯一實作)。

## 包裝鏈 XT.chain(最終版73 起,戰鬥核心)
winBattle、loseBattle、towerWin、wbWin、playerAct、endBattle、fx.setup/playerAct/playerHit 的各層包裝**程式碼一字未改**,
只是從「`const _wb = winBattle; winBattle = function…`」改成「`XT.winBattle80 = _wb => function…`」登記。
原函式改名 `xxxCore`,原名那一行依原安裝順序(內→外)列出全部包裝層,上方註解寫明每層用途與所在檔案。
要改某層:到註解寫的檔案找 `XT.<名稱> =`。要調整順序或拿掉一層:改那一行清單。

## 介面統一 UI74(最終版74 起)
- 圖片在 `src/assets/UI74/`:`ic_*` 36 個按鈕圖示、`sk_*` 12 個按鈕底圖(九宮格:只拉伸中段)、`xm_*` 塔頂心魔 6 張(男 m/女 f × 0 待機/1 出手/2 受擊)。
- `src/css/04_ui74.css`:圖片變數 `--ic-*`/`--sk-*`;印章/仙途/洞府圓鈕用 CSS 直接換圖;按鈕底圖 `[data-sk74=p|w|j|g|m|ton|toff|con|coff]`。
  (由 `tools/patches/p03_ui74.py` 產生;要改樣式可直接改 css 檔)
- `src/js/23_v74_介面統一・心魔.js`:依按鈕「原本顏色」判定用途套底圖(紅→朱紅 p、橘黃→金 g、綠→青玉 j、紫→紫晶 m、深色→檀木 w),
  `EXPL` 表可逐一指定按鈕種類與前置圖示;心魔用 `XT.fxSetup74` 接在 fx.setup 鏈,並監看 #bs-m 的 matk/hit 換姿勢。
- 換圖:同檔名覆蓋 webp 再打包即可。

## 凍結版面(最終版77 起)
- `src/index.html` 裡「凍結版面」註解以下到 `Main Game JavaScript Bundle` 之前,就是**畫面的最終結構**(人物/仙途/洞府/丹器/行囊的新版容器、按鈕底圖標記都已寫好),
  開檔第一眼就是新版面,不再「先畫舊介面再搬」。
- 原本負責建立這些容器的程式改成「已存在就沿用,不存在才建立」(`tools/patches/p06_reuse.py`),所以舊程式碼仍在、只是不再搬動;下一步(78)才刪除死碼。
- `tools/freeze.py`:由「目前 src 打包後實際跑出來的畫面」產生凍結版面(新開局與存檔兩種狀態合併,只留兩者都一樣的部分;圖片只留標記不嵌入)。
  **已凍結的 src 不要再跑一次**;要重產:還原未凍結的 src → p06 → p07 → freeze(之後再套 p08…)。
- 注意:凡是「元素已存在就略過」的程式,點擊/監看不可只在建立時掛(77 導覽列失靈即此因,p07 已修);改版後用 `tools/listeners.py` 比對。
- 已知且接受的差異:⚙ 按鈕不套底圖(原本就時有時無);世界 Boss/批次事件兩個彈窗固定淺色(原本重繪後才變淺)。

## 網站版與發佈(最終版99 起)
- 網站:https://mashin-84.github.io/Cultivation/ (GitHub Pages,專案 mashin-84/Cultivation),可安裝成 App(PWA)。
- `python3 build.py --site 資料夾`:網站版,圖片不內嵌,改為 `assets/…webp?v=雜湊` 獨立檔(換圖會自動換網址,不會吃到舊快取);連同 `src/pwa/`(manifest、sw.js、圖示、music)一起輸出。
- `python3 tools/deploy.py "修改說明"`:輸出網站版到 /home/claude/cultivation 並推送。
- 單檔版(`python3 build.py 輸出.html`)照舊可用,圖片內嵌,可直接開本機檔(無音樂)。
- sw.js:主檔先抓網路;圖片與音樂先用快取,安裝後在背景依 assets/list.json 存全部圖片,可完整離線。

## 工具
- `tools/split.py`:從單檔 HTML 拆出 src/(一次性,已執行過)。
- `tools/baseline.py`:用存檔開遊戲 → 六分頁截圖、數值快照(戰力/X5/塔怪)、存檔往返、console 錯誤。
  `python3 tools/baseline.py 新版.html baseline/save_v71.txt baseline/新版 --ref baseline/v71`
- `tools/domdiff.py`:等價性測試。固定時鐘與亂數,兩份 HTML 跑同樣 14 步(六分頁、神通面板四種檢視、行囊分類…),逐步比對整頁 DOM、`calculateTotalStats()`、`redFlags()`。
  `python3 tools/domdiff.py 舊.html 新.html baseline/save_v71.txt`(或最後參數用 `new` 測新開局);加 `--full` 多跑約 40 步點擊(各分頁按鈕、面板、彈窗)
- `tools/battlediff.py`:戰鬥等價性測試。17 種情境(一般勝/敗/自然戰鬥、Boss、登天塔勝/Boss/敗、天地異種勝/敗、九重劫勝/敗、劇情戰勝/敗、心魔勝/敗、逃跑),
  每場重新載入,結束後比對完整 state、畫面 DOM、戰報。`python3 tools/battlediff.py 舊.html 新.html baseline/save_v71.txt [情境名…]`(全跑約 6 分鐘)
- `tools/shots.py`:用存檔截 11 張常用畫面(六分頁、流派、裝備卡、靈田、戰鬥、塔頂心魔)。
- `tools/trace_dom.py`:記錄載入與切分頁時每一次 DOM 結構變動是哪個 src 檔第幾行做的。`python3 tools/trace_dom.py 遊戲.html 存檔.txt 輸出.json`
- `tools/listeners.py`:比對兩份 HTML 掛在各元素上的點擊/事件監聽與監看器(MutationObserver 等),找出只在一邊有的。`python3 tools/listeners.py 舊.html 新.html 存檔.txt`(或 `new`)
- `tools/imgusage.py`:跑過分頁、面板、戰鬥,盤點實際用到的圖;未出現的多為條件才出現(劇情、未打到的怪、未取得的物品),不可直接刪。
- `tools/btncheck.py`:逛分頁、開面板,列出文字超出按鈕、或同一列按鈕互相重疊的雲紋按鈕。
- `tools/patches/`:每次重構的補丁腳本(對 src/ 做精確字串替換,保留紀錄)。
- `baseline/v71/`:最終版71 的基準結果(之後每階段都跟它比)。存檔往返只有 ageTimer/lastSave/st15/totalCultivatedQi 會變(遊戲時間流逝,屬正常)。唯一 console 錯誤是 Google 字型連不到(測試環境無網路)。
