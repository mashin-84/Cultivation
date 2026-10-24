#!/usr/bin/env python3
"""發佈到 GitHub Pages:把網站版(圖片獨立檔)輸出到網站專案資料夾並推送。
用法:python3 tools/deploy.py "這次的修改說明" [網站專案資料夾,預設 /home/claude/cultivation]"""
import os, sys, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
msg = sys.argv[1]; repo = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/cultivation'
def g(*a): return subprocess.run(['git', '-C', repo] + list(a), check=True, capture_output=True, text=True).stdout
g('fetch', '-q', 'origin', 'main'); g('reset', '-q', '--hard', 'origin/main')
r = subprocess.run([sys.executable, os.path.join(ROOT, 'build.py'), '--site', repo, '--check'], capture_output=True, text=True); print(r.stdout[-400:])
if r.returncode: print(r.stderr); sys.exit(1)
g('add', '-A')
if not g('status', '--porcelain').strip(): print('沒有變更'); sys.exit(0)
g('commit', '-q', '-m', msg + '\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01Eudv1bj25nFF4NszqJcvVs')
print(subprocess.run(['git', '-C', repo, 'push', 'origin', 'HEAD:main'], capture_output=True, text=True).stderr[-300:])
