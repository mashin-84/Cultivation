#!/usr/bin/env python3
"""最終版91:網頁 App(PWA)——放在固定網址(GitHub Pages)時可「安裝應用程式」、全螢幕、離線遊玩
src/pwa/ 內的 manifest.webmanifest、sw.js、icon-*.png 需與 index.html 一起上傳到同一資料夾。
直接開本機檔案(content:// / file://)時不註冊,行為與以前相同。
"""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '  <title>一念飛仙 - 掌上放置修真RPG</title>'; assert s.count(old) == 1 and 'manifest.webmanifest' not in s
s = s.replace(old, old + '\n  <link rel="manifest" href="manifest.webmanifest">\n  <meta name="theme-color" content="#dfe9f2">\n  <meta name="mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <link rel="apple-touch-icon" href="icon-180.png">\n  <link rel="icon" type="image/png" href="icon-192.png">')
old = '@@INC:js/25_v90_存檔檔案.js@@'; assert s.count(old) == 1
s = s.replace(old, old + "\n/* v91 網頁 App:只在 http(s) 網址註冊離線支援 */\nif ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { }); });")
open(p, 'w', encoding='utf-8', newline='').write(s)
print('p20 ok')
