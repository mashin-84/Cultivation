#!/usr/bin/env python3
"""重構階段 2-2:戰鬥核心包裝改為「包裝鏈清單」
winBattle(6)、loseBattle(5)、towerWin(4)、wbWin(4)、playerAct(3)、endBattle(2)、fx.setup(5)、fx.playerAct(3)、fx.playerHit(2)
作法(機械式,各層程式碼一字不改):
  原本  const _wb = winBattle; winBattle = function () { … _wb.apply(this, arguments) … };
  改為  XT.winBattle80 = _wb => function () { … _wb.apply(this, arguments) … };
  原函式改名 xxxCore,原名改成在一處依「原安裝順序」列出所有包裝層並即時組合(未載入的層略過)。
"""
import glob, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js')

def F(prefix):
    g = glob.glob(os.path.join(ROOT, '02_main', prefix + '_*.js')) or glob.glob(os.path.join(ROOT, prefix + '_*.js'))
    assert len(g) == 1, prefix; return g[0]
def rd(p): return open(p, encoding='utf-8', newline='').read()
def wr(p, t): open(p, 'w', encoding='utf-8', newline='').write(t)
def rep(prefix, old, new, cnt=1):
    p = F(prefix); t = rd(p); assert t.count(old) == cnt, (prefix, t.count(old), old[:80]); wr(p, t.replace(old, new))

def layer(prefix, var, target, key):
    """把 const VAR = TARGET; TARGET = function 改成 XT.KEY = VAR => function"""
    p = F(prefix); t = rd(p)
    rx = re.compile(r'const\s+%s\s*=\s*%s\s*;(\s*)%s\s*=\s*function' % (re.escape(var), re.escape(target), re.escape(target)))
    ms = list(rx.finditer(t)); assert len(ms) == 1, (prefix, target, len(ms))
    m = ms[0]
    t = t[:m.start()] + 'XT.%s = %s => function' % (key, var) + t[m.end():]
    assert not re.search(r'(?<![\w$.])%s\s*=\s*function' % re.escape(target), t), (prefix, target, '仍有覆寫')
    wr(p, t)

# ---------- 包裝鏈工具 ----------
rep('000', 'const XT = {};\n',
    'const XT = {};\n'
    '// 包裝鏈:wraps 依原安裝順序(內→外)列出,每個是 next => function(…){ … next.apply(this, arguments) … };\n'
    '// 尚未載入(undefined)的略過。每次呼叫時組合,行為與原本逐層覆寫完全相同。\n'
    'XT.chain = function (self, args, core, wraps) { let f = core; for (const w of wraps) if (w) f = w(f); return f.apply(self, args); };\n')

# ---------- 各層:登記到 XT(內容不變) ----------
L = [
    # winBattle
    ('031', '_wb', 'winBattle', 'winBattle80'), ('034', '_wb', 'winBattle', 'winBattle85'), ('037', '_wb', 'winBattle', 'winBattle88'),
    ('038', '_wb', 'winBattle', 'winBattle90'), ('052', '_w', 'winBattle', 'winBattle100'), ('07', '_wb', 'winBattle', 'winBattle101'),
    # loseBattle
    ('031', '_lb', 'loseBattle', 'loseBattle80'), ('034', '_lb', 'loseBattle', 'loseBattle85'), ('037', '_lb', 'loseBattle', 'loseBattle88'),
    ('052', '_l', 'loseBattle', 'loseBattle100'), ('05', '_lb', 'loseBattle', 'loseBattle101'),
    # towerWin
    ('034', '_tw', 'towerWin', 'towerWin85'), ('035', '_t', 'towerWin', 'towerWin86'), ('037', '_t', 'towerWin', 'towerWin88'), ('068', 'o', 'towerWin', 'towerWin130'),
    # wbWin
    ('034', '_ww', 'wbWin', 'wbWin85'), ('035', '_w', 'wbWin', 'wbWin86'), ('037', '_w', 'wbWin', 'wbWin88'), ('052', '_wbw', 'wbWin', 'wbWin100'),
    # playerAct
    ('051', '_p', 'playerAct', 'playerAct100'), ('054', 'o', 'playerAct', 'playerAct102'), ('07', '_pa', 'playerAct', 'playerAct101'),
    # endBattle
    ('040', '_eb', 'endBattle', 'endBattle92'), ('06', '_eb', 'endBattle', 'endBattle101'),
    # fx
    ('026', '_s', 'fx.setup', 'fxSetup76'), ('033', '_fs', 'fx.setup', 'fxSetup82'), ('050', '_setup', 'fx.setup', 'fxSetup100'),
    ('076', '_s', 'fx.setup', 'fxSetup170'), ('11', '_s', 'fx.setup', 'fxSetup45'),
    ('026', '_pa', 'fx.playerAct', 'fxAct76'), ('050', '_pa', 'fx.playerAct', 'fxAct100'), ('053', '_pa2', 'fx.playerAct', 'fxAct102'),
    ('026', '_ph', 'fx.playerHit', 'fxHit76'), ('050', '_ph', 'fx.playerHit', 'fxHit100'),
]
for a in L: layer(*a)

# ---------- 組合點:原函式改名 Core,原名在一處列出包裝鏈 ----------
def core(prefix, sig, name, wraps, notes):
    lines = ''.join('//   %-16s %s\n' % (w, n) for w, n in zip(wraps, notes))
    new = ('// %s:原為 %d 層包裝,依原安裝順序(內→外)組合:\n%s'
           'function %s { return XT.chain(this, arguments, %sCore, [%s]); }\n'
           % (name, len(wraps), lines, sig, name, ', '.join('XT.' + w for w in wraps)))
    rep(prefix, 'function %s {\n' % sig, new + 'function %s {\n' % sig.replace(name, name + 'Core', 1))

core('009', 'winBattle()', 'winBattle',
     ['winBattle80', 'winBattle85', 'winBattle88', 'winBattle90', 'winBattle100', 'winBattle101'],
     ['v8.0 宗門加成(031)', 'v8.5 統計/圖鑑/X5 靈石(034)', 'v8.8 九重劫勝利接手(037)', 'v9.0 流派道行(038)',
      'v10.0 特殊戰接手・丹修回血(052)', 'v10.1 一般戰靈石/材料加成(script 07)'])
core('009', 'loseBattle()', 'loseBattle',
     ['loseBattle80', 'loseBattle85', 'loseBattle88', 'loseBattle100', 'loseBattle101'],
     ['v8.0 輪迴復生・宗門試煉(031)', 'v8.5 死亡統計(034)', 'v8.8 九重劫敗退接手(037)', 'v10.0 特殊戰敗退接手(052)', 'v10.1 自動歷練戰敗退關(script 05)'])
core('019', 'towerWin()', 'towerWin',
     ['towerWin85', 'towerWin86', 'towerWin88', 'towerWin130'],
     ['v8.5 圖鑑(034)', 'v8.6 器紋石(035)', 'v8.8 仙緣(037)', 'v13.0 塔壁刻字(068)'])
core('022', 'wbWin()', 'wbWin',
     ['wbWin85', 'wbWin86', 'wbWin88', 'wbWin100'],
     ['v8.5 統計/圖鑑(034)', 'v8.6 器紋石(035)', 'v8.8 仙緣(037)', 'v10.0 靈寵蛋/仙緣遺澤(052)'])
core('018', 'playerAct(id)', 'playerAct',
     ['playerAct100', 'playerAct102', 'playerAct101'],
     ['v10.0 流派心法/本命絕學(051)', 'v10.2 流派神通未生效擋下(054)', 'v10.1 神通/絕學演出後才出手(script 07)'])
core('009', 'endBattle()', 'endBattle',
     ['endBattle92', 'endBattle101'],
     ['v9.2 戰鬥中預約切換區域(040)', 'v10.1 戰鬥接續詢問(script 06)'])

# fx:物件方法,於物件定義之後組合
p = F('018'); t = rd(p)
a = t.index('const fx = {\n'); b = t.index('\n};\n', a) + 4
t = t[:b] + (
    '// fx 的 setup/playerAct/playerHit:原為多層包裝,依原安裝順序(內→外)組合\n'
    '//   setup:     fxSetup76 v7.6 生成圖背景/立繪/妖魔(026)、fxSetup82 v8.2 女修立繪(033)、fxSetup100 v10.0 戰場背景(050)、\n'
    '//              fxSetup170 v17.0 劇情敵人立繪(076)、fxSetup45 v45 怪物生成圖(script 11)\n'
    '//   playerAct: fxAct76 v7.6 出手姿勢(026)、fxAct100 v10.0 技能特效貼圖(050)、fxAct102 v10.2 技能名橫幅(053)\n'
    '//   playerHit: fxHit76 v7.6 受擊姿勢(026)、fxHit100 v10.0 受擊特效(050)\n'
    'fx._core = { setup: fx.setup, playerAct: fx.playerAct, playerHit: fx.playerHit };\n'
    'fx.setup = function () { return XT.chain(this, arguments, fx._core.setup, [XT.fxSetup76, XT.fxSetup82, XT.fxSetup100, XT.fxSetup170, XT.fxSetup45]); };\n'
    'fx.playerAct = function () { return XT.chain(this, arguments, fx._core.playerAct, [XT.fxAct76, XT.fxAct100, XT.fxAct102]); };\n'
    'fx.playerHit = function () { return XT.chain(this, arguments, fx._core.playerHit, [XT.fxHit76, XT.fxHit100]); };\n') + t[b:]
wr(p, t)
print('p02 ok')
