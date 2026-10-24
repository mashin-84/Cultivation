
/* ===== v12.4 淺色收尾:頂部資源列・山門・圖鑑・靈田・天機・戰鬥按鈕 ===== */
(function () {
  const hd = document.querySelector('#game-app>header'); if (hd) hd.classList.add('ink53', 'hd68');
  const st = document.createElement('style');
  st.textContent = `
#game-app>header.hd68{background:linear-gradient(180deg,#f6efdf,#ece2cb)!important;border-bottom:1px solid #cdbf9f!important;box-shadow:0 2px 6px rgba(80,60,20,.12)}
#game-app>header.hd68 .bg-slate-900\\/90{background:rgba(255,252,244,.8)!important;border-color:#d6c9ab!important}
#game-app>header.hd68 .bg-slate-950{background:#e4d9c0!important;border-color:#d6c9ab!important}
#game-app>header.hd68 .bg-slate-800{background:rgba(255,252,244,.85)!important;border-color:#c9b994!important;color:#4a4035!important}
#game-app>header.hd68 #player-name-display{color:#2a241c!important}
#game-app>header.hd68 button{color:#4a4035}
#game-app>header.hd68 #btn-story28,#game-app>header.hd68 #btn-menu25{background:rgba(255,252,244,.85)!important;border-color:#c9b994!important}
.x5-bar{background:#e4d9c0!important;border-color:#d6c9ab!important}
#nav25{background:linear-gradient(180deg,#efe6d2,#e4d8bd)!important;border-top:1px solid #cdbf9f!important}
#nav25 button span{color:#6b5f4f!important}#nav25 button.on span{color:#9e2b25!important;font-weight:900}
/* 山門 */
#sm44-b .rw{background:rgba(255,252,244,.78)!important;border-color:#d6c9ab!important}
#sm44-b .rw .h{color:#2a241c!important}#sm44-b .rw .h i{color:#6b5f4f!important}#sm44-b .rw .s{color:#4a4035!important}
#sm44-b .rw.ok{border-color:#3f7d4e!important}#sm44-b .rw.go{background:#fbf1d8!important;border-color:#b07d1a!important}
#sm44-b .eqb{background:#2b2620!important;border-color:#2b2620!important;color:#f3ead6!important}#sm44-b .eqb.on{background:#2f7a6e!important;border-color:#2f7a6e!important}
#rec44{background:rgba(255,252,244,.78)!important;border-color:#d6c9ab!important}#rec44 .t{color:#8a5a12!important;border-color:#d6c9ab!important}
/* 圖鑑・稱號 */
.cx-i{background:rgba(255,252,244,.82)!important;border-color:#d6c9ab!important}
.cx-i .nm{color:#2a241c!important}.cx-i .sb{color:#6b5f4f!important}.cx-i.lk .nm{color:#8a7f6e!important}
.cx-row button{background:rgba(255,252,244,.82)!important;border-color:#c9b994!important;color:#8a5a12!important}
.tt-r{background:rgba(255,252,244,.82)!important;border-color:#d6c9ab!important}.tt-r.on{background:#fbf1d8!important;border-color:#b07d1a!important}
.tt-r .d{color:#6b5f4f!important}.tt-r .e{color:#2f7a3e!important}
/* 靈田 */
.gd-t{background:rgba(255,252,244,.85)!important;border-color:#c9b994!important;color:#2a241c!important}
.gd-t .st{color:#6b5f4f!important}.gd-t.em{color:#8a7f6e!important}
.gd-t.rdy{border-color:#b07d1a!important;box-shadow:0 0 8px rgba(176,125,26,.35)}.gd-t.rdy .st{color:#8a5a12!important}
.gd-pk button{background:rgba(255,252,244,.85)!important;border-color:#c9b994!important;color:#2a241c!important}.gd-pk span{color:#6b5f4f!important}
/* 天機悟道等列 */
.xb-r{background:rgba(255,252,244,.82)!important;border-color:#d6c9ab!important}.xb-r .n{color:#2a241c}.xb-r .d{color:#6b5f4f!important}
/* 戰鬥 */
#battle-skill-bar button[data-skbtn]:not([data-ult26]){background:rgba(255,252,244,.92)!important;color:#2a241c!important}
#battle-skill-bar button[data-skbtn][disabled]{opacity:.5}
#battle-modal #battle-skill-bar button[data-ult26]{background:linear-gradient(135deg,#fbf1d8,#efd9a8)!important;color:#6e3a0c!important;border-color:#b07d1a!important}
#btn-battle-flee{background:rgba(255,252,244,.92)!important;color:#2a241c!important;border:1px solid #c9b994!important}
#blog26{background:rgba(255,252,244,.82)!important;border-color:#d6c9ab!important;color:#6b5f4f!important}
#blog26 div:last-child{color:#8a5a12!important}
#battle-modal .bg-slate-900\\/80,#battle-modal .bg-slate-950{background:rgba(255,252,244,.82)!important}
`;
  document.head.appendChild(st);
})();

