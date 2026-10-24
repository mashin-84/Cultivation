

/* ==========================================================================
   一念飛仙 - 掌上放置修真RPG 核心系統重構 (V2)
   修正 Bug: B1~B12 | 優化項目: O1~O10
   ========================================================================== */
// 重構:擴充步驟登記表。原本後期模組用「const _f=f; f=function(){_f();…}」層層包裝舊函式,
// 現改為各模組把自己的步驟登記在 XT,由原函式依原執行順序呼叫(未載入的步驟自動略過)。
const XT = {};
// 包裝鏈:wraps 依原安裝順序(內→外)列出,每個是 next => function(…){ … next.apply(this, arguments) … };
// 尚未載入(undefined)的略過。每次呼叫時組合,行為與原本逐層覆寫完全相同。
XT.chain = function (self, args, core, wraps) { let f = core; for (const w of wraps) if (w) f = w(f); return f.apply(self, args); };

