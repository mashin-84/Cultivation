# v179 通用動畫接口:n_節點id 於節點開頭播;end_結局id 於結局記錄時播
A=('  function play(id, o) {\n', "  function play(id, o) {\n    if (window.MOV174 && !(o && o._mv) && MOV174.has('n_' + id)) { MOV174.play('n_' + id).then(() => play(id, Object.assign({}, o, { _mv: 1 }))); return; }   /* v179 節點開頭動畫 n_節點id */\n")
B=("flash('📜 結局已記錄:' + (ENM[b.edg] || b.edg)); } continue; }", "flash('📜 結局已記錄:' + (ENM[b.edg] || b.edg)); } if (window.MOV174 && MOV174.has('end_' + b.edg)) { MOV174.play('end_' + b.edg).then(() => next()); return; } continue; }   /* v179 結局動畫 end_fly/slay/one */")
