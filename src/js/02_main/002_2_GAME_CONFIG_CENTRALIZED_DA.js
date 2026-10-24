/* ==========================================================================
   2. GAME CONFIG & CENTRALIZED DATA DICTIONARY (OPT-O2, OPT-O3, OPT-O4)
   ========================================================================== */
// OPT-O3: 境界階梯設定與預期耗時平衡
const REALM_DATA = [
  { name: '練氣期', subMax: 9, baseQi: 480, maxLifespan: 100, isMajor: false, desc: '吞吐天地靈氣，引氣入體鍛煉肉胎。(全程約20分鐘,視吐納速度而定)' },
  { name: '築基期', subMax: 6, baseQi: 9600, maxLifespan: 200, isMajor: true, desc: '築就仙道基石，真元液化，壽增百載。(每層約3~6分鐘)' },
  { name: '金丹期', subMax: 6, baseQi: 64000, maxLifespan: 500, isMajor: true, desc: '九轉金丹始凝結，我命由我不由天！(每層約12~25分鐘)' },
  { name: '元嬰期', subMax: 6, baseQi: 340000, maxLifespan: 1000, isMajor: true, desc: '元嬰出竅，神遊太虛，得大自在！(每層約40~70分鐘)' },
  { name: '化神期', subMax: 6, baseQi: 1680000, maxLifespan: 3000, isMajor: true, desc: '神融造化，身合五行，凡界之頂點！圓滿後可引動「飛升雷劫」，破碎虛空前往仙界。(每層約2~4小時)' },
  // ===== 仙界(飛升之後) =====
  { name: '真仙境', subMax: 6, baseQi: 6000000, maxLifespan: 20000, isMajor: true, desc: '羽化登仙，位列仙班。仙界靈氣濃郁，吐納大增。(每層約50~90分鐘)' },
  { name: '玄仙境', subMax: 6, baseQi: 12000000, maxLifespan: 50000, isMajor: true, desc: '參悟玄妙，道法自然，言出法隨。(每層約1~2小時)' },
  { name: '金仙境', subMax: 6, baseQi: 24000000, maxLifespan: 200000, isMajor: true, desc: '金身不朽，萬劫不磨，距大羅僅一步之遙。(每層約1.5~3小時)' },
  { name: '大羅金仙', subMax: 1, baseQi: 60000000, maxLifespan: 999999, isMajor: false, desc: '超脫輪迴，證道大羅，萬古長存！(仙途終點)' }
];
// 仙界靈氣:飛升後各境界的吐納速度倍率(對應 REALM_DATA 索引),覺得仙界太快/太慢改這裡
const IMMORTAL_QI_MULT = [1, 1, 1, 1, 1, 3, 4, 5, 6];

// OPT-O2 & FIX-B3 & FIX-B4: 集中式 ITEMS 資料表
const ITEMS = {
  'herb_1': { id: 'herb_1', name: '凝露靈草', icon: '🌿', type: 'material', price: 10, desc: '靈氣凝聚的初階仙草，可煉聚氣丹、回春丹' },
  'herb_2': { id: 'herb_2', name: '洗髓花', icon: '🌸', type: 'material', price: 30, desc: '淨化經脈的稀有靈花，可煉洗髓丹、渡劫丹' },
  'herb_3': { id: 'herb_3', name: '天雷竹', icon: '🎋', type: 'material', price: 70, desc: '常年沐浴雷霆之異木，可煉渡劫丹與法寶' },
  'herb_4': { id: 'herb_4', name: '龍血果', icon: '🍎', type: 'material', price: 180, desc: '蘊含真龍氣血之神物，可煉九轉延壽丹' },
  'ore_1': { id: 'ore_1', name: '寒鐵石', icon: '⛏️', type: 'material', price: 15, desc: '鍛造堅韌法器的靈礦，可鍛造青鋒劍與道袍' },
  'ore_2': { id: 'ore_2', name: '赤陽銅', icon: '🔥', type: 'material', price: 40, desc: '蘊藏地火精華的赤金，可鍛造赤陽劍與寶戒' },
  'ore_3': { id: 'ore_3', name: '紫霄玄晶', icon: '⚡', type: 'material', price: 90, desc: '沐浴紫霄神雷淬煉之晶石，強化高階法寶' },

  'pill_1': { id: 'pill_1', name: '聚氣丹', icon: '💊', type: 'consumable', price: 25, val: 500, desc: '服用增加修為(第 0 階;練氣期為上限 12%,境界越高藥效越弱;只能服到圓滿;同層連服積丹毒)' },
  'pill_2': { id: 'pill_2', name: '洗髓丹', icon: '💊', type: 'consumable', price: 80, val: 5, desc: '服下體內濁氣盡褪，永久增加吐納速度+5/秒' },
  'pill_3': { id: 'pill_3', name: '渡劫丹', icon: '⚡', type: 'special', price: 200, val: 20, desc: '突破天劫成功率+20%，且天劫失敗時修為損失減半' }, // FIX-B2
  'pill_4': { id: 'pill_4', name: '回春丹', icon: '❤️', type: 'battle_heal', price: 35, val: 200, desc: '服用可恢復 200 點或 30% 氣血(取較高者),歷練戰鬥中與歷練途中皆可服用' },
  'pill_5': { id: 'pill_5', name: '九轉延壽丹', icon: '⏳', type: 'consumable', price: 300, val: 30, desc: '逆天奪壽，服用後增加壽元上限 +30 歲' }, // FIX-B8

  'equip_sword_1': { id: 'equip_sword_1', name: '寒鐵青鋒劍', icon: '⚔️', type: 'equipment', slot: 'weapon', quality: 'common', atk: 35, def: 0, hp: 0, price: 60, desc: '寒鐵精鋼鍛造的初階飛劍，攻擊+35' },
  'equip_armor_1': { id: 'equip_armor_1', name: '天罡八卦道袍', icon: '🥋', type: 'equipment', slot: 'armor', quality: 'uncommon', atk: 0, def: 25, hp: 140, price: 90, desc: '繪有避塵符籙的中階道袍，防禦+25，氣血+140' },
  'equip_sword_2': { id: 'equip_sword_2', name: '赤陽焚天劍', icon: '🗡️', type: 'equipment', slot: 'weapon', quality: 'rare', atk: 120, def: 10, hp: 0, price: 250, desc: '吸納地火精華，出鞘烈焰燎原！攻擊+120，防禦+10' },
  'equip_art_1': { id: 'equip_art_1', name: '乾坤聚寶戒', icon: '💍', type: 'equipment', slot: 'artifact', quality: 'rare', atk: 45, def: 40, hp: 320, price: 300, desc: '護身異寶，攻防兼備，攻擊+45，防禦+40，氣血+320' }, // FIX-B3
  'equip_art_2': { id: 'equip_art_2', name: '昊天乾坤鏡', icon: '🪞', type: 'equipment', slot: 'artifact', quality: 'epic', atk: 90, def: 85, hp: 650, price: 800, desc: '太古玄晶打磨的上古寶鏡，攻擊+90，防禦+85，氣血+650' },
  'equip_sword_3': { id: 'equip_sword_3', name: '紫霄斬仙劍', icon: '⚡', type: 'equipment', slot: 'weapon', quality: 'epic', atk: 260, def: 35, hp: 200, price: 1000, desc: '紫極神雷灌注之斬仙神器！攻擊+260，防禦+35，氣血+200' },
  'equip_armor_2': { id: 'equip_armor_2', name: '混元真仙甲', icon: '🛡️', type: 'equipment', slot: 'armor', quality: 'epic', atk: 25, def: 130, hp: 850, price: 950, desc: '混元造化所鑄寶甲，防禦+130，氣血+850，攻擊+25' },

  // ===== 仙界道具 =====
  'herb_5': { id: 'herb_5', name: '蟠桃仙露', icon: '🍑', type: 'material', price: 400, desc: '仙界瑤池所產的仙露，可煉太清仙丹與鍛造仙器' },
  'ore_4': { id: 'ore_4', name: '九天玄晶', icon: '💠', type: 'material', price: 300, desc: '仙界天闕深處的玄奧晶石，鍛造仙器的核心材料' },
  'pill_6': { id: 'pill_6', name: '太清仙丹', icon: '🌟', type: 'consumable', price: 1200, val: 1000000, desc: '仙家妙藥(第 5 階),真仙境服用增加修為上限 12%,高於或低於此境藥效隨之增減(只能服到圓滿;同層連服積丹毒)' },
  'equip_sword_4': { id: 'equip_sword_4', name: '誅仙劍', icon: '🗡️', type: 'equipment', slot: 'weapon', quality: 'immortal', atk: 520, def: 60, hp: 400, price: 2500, desc: '仙界殺伐至寶，劍出誅仙！攻擊+520，防禦+60，氣血+400' },
  'equip_armor_3': { id: 'equip_armor_3', name: '九天流雲仙衣', icon: '👘', type: 'equipment', slot: 'armor', quality: 'immortal', atk: 50, def: 260, hp: 1800, price: 2400, desc: '以九天流雲織就的仙衣，防禦+260，氣血+1800，攻擊+50' },
  'equip_art_3': { id: 'equip_art_3', name: '太虛混元珠', icon: '🔮', type: 'equipment', slot: 'artifact', quality: 'immortal', atk: 190, def: 170, hp: 1400, price: 3000, desc: '內藏一方太虛的混元寶珠，攻擊+190，防禦+170，氣血+1400' }
};

// OPT-O7: 功法靜態定義 (最大等級提升為 10 重)
const TECHNIQUES_DATA = [
  { id: 'tech_1', name: '《太乙聚氣訣》', realmReq: 0, cost: 50, maxLevel: 10, bonusType: 'qiRate', bonusVal: 4, desc: '太乙門入門呼吸心法，增強靈氣吐納。' },
  { id: 'tech_2', name: '《金剛不壞真言》', realmReq: 0, cost: 120, maxLevel: 10, bonusType: 'def', bonusVal: 15, desc: '佛道交融淬體法門，極大增強防禦。' },
  { id: 'tech_3', name: '《青蓮劍典》', realmReq: 1, cost: 350, maxLevel: 10, bonusType: 'atk', bonusVal: 35, desc: '太白青蓮劍仙所傳劍道，提升攻擊。' },
  { id: 'tech_4', name: '《九轉元神功》', realmReq: 2, cost: 1000, maxLevel: 10, bonusType: 'hp', bonusVal: 200, desc: '凝練識海神魂，大幅增加生命氣血。' },
  { id: 'tech_5', name: '《紫霄御雷真訣》', realmReq: 3, cost: 3000, maxLevel: 10, bonusType: 'crit', bonusVal: 5, desc: '掌天劫御神雷，大幅提升會心率。' },
  { id: 'tech_6', name: '《太上忘情錄》', realmReq: 5, cost: 50000, maxLevel: 10, bonusType: 'qiRate', bonusVal: 30, desc: '仙界無上心法，忘情絕欲，吐納天地仙氣。' },
  { id: 'tech_7', name: '《九天誅仙劍經》', realmReq: 5, cost: 80000, maxLevel: 10, bonusType: 'atk', bonusVal: 120, desc: '誅仙劍道的最高傳承，劍出萬法皆斬。' }
];

// OPT-O7: 被動天賦樹定義 (消耗大境界道心點)
// v9.2:天賦第 4 級起,每級效果為前 3 級的 30%,道心點花費遞增
const TAL_COSTS = [1, 1, 1, 2, 3, 4, 5, 6, 8, 10];
const talCost = (tal, lvl) => TAL_COSTS[Math.min(9, lvl)];
const talEff = lvl => Math.min(lvl, 3) + Math.max(0, lvl - 3) * 0.3;
const TALENTS_DATA = [
  { id: 'talent_1', name: '氣海通玄', cost: 1, maxLevel: 10, stat: 'hp', mult: 0.15, desc: '每次升級提升氣血 +15%' },
  { id: 'talent_2', name: '劍道獨尊', cost: 1, maxLevel: 10, stat: 'atk', mult: 0.15, desc: '每次升級提升攻擊 +15%' },
  { id: 'talent_3', name: '玄武磐石', cost: 1, maxLevel: 10, stat: 'def', mult: 0.15, desc: '每次升級提升防禦 +15%' },
  { id: 'talent_4', name: '窺破天機', cost: 1, maxLevel: 10, stat: 'crit', val: 5, desc: '每次升級增加會心率 +5%' },
  { id: 'talent_5', name: '萬壽長春', cost: 1, maxLevel: 10, stat: 'maxAge', val: 100, desc: '每次升級增延壽元上限 +100歲' },
  { id: 'talent_6', name: '奪天地造化', cost: 1, maxLevel: 10, stat: 'qiRate', mult: 0.20, desc: '每次升級提升吐納 +20%' }
];

// OPT-O4: 歷練區域與豐富化怪物資料 (含五行、專屬技能與 emoji)
const AREAS_DATA = [
  {
    id: 0, name: '青雲後山', realmReq: 0, maxSteps: 10, desc: '青雲宗外門後山，多出沒小靈猴、赤蛇與初階靈草。', element: 'wood',
    milestoneReward: { stones: 80, herb_1: 3 },
    firstClearReward: { stones: 200, equip: 'equip_sword_1' },
    monsters: [
      { id: 'm_0_1', name: '採藥靈猴', emoji: '🐵', element: 'wood', skillName: '靈木飛擲', skillDesc: '擲出木靈毒果，造成木傷並降低防禦', hp: 90, atk: 14, def: 5, drops: [{ item: 'herb_1', chance: 0.8 }, { item: 'stone', count: 15 }] },
      { id: 'm_0_2', name: '斑斕彩蟒', emoji: '🐍', element: 'water', skillName: '水霧纏繞', skillDesc: '噴出水靈毒霧，吸取部分氣血', hp: 140, atk: 20, def: 8, drops: [{ item: 'herb_1', chance: 0.7 }, { item: 'ore_1', chance: 0.5 }, { item: 'stone', count: 25 }] },
      { id: 'm_0_3', name: '狂暴青狼王', emoji: '🐺', element: 'wood', isBoss: true, skillName: '嗜血咆哮', skillDesc: '發動妖狼狂暴，下回合傷害提升40%', hp: 300, atk: 30, def: 12, drops: [{ item: 'herb_2', chance: 0.9 }, { item: 'equip_sword_1', chance: 0.5 }, { item: 'stone', count: 90 }] }
    ]
  },
  {
    id: 1, name: '萬妖幽谷', realmReq: 1, maxSteps: 10, desc: '終年雲霧繚繞，瘴氣瀰漫，築基妖修橫行之地。', element: 'water',
    milestoneReward: { stones: 180, herb_2: 2 },
    firstClearReward: { stones: 400, equip: 'equip_armor_1' },
    monsters: [
      { id: 'm_1_1', name: '幽冥鬼蛛', emoji: '🕷️', element: 'earth', skillName: '地羅蛛網', skillDesc: '噴吐地脈黏網，減緩敵方行動', hp: 380, atk: 48, def: 22, drops: [{ item: 'herb_2', chance: 0.7 }, { item: 'ore_1', chance: 0.6 }, { item: 'stone', count: 50 }] },
      { id: 'm_1_2', name: '狂暴通臂猿', emoji: '🦍', element: 'earth', skillName: '金剛裂地', skillDesc: '重錘震盪大地，破開護體罡氣', hp: 650, atk: 75, def: 38, drops: [{ item: 'ore_2', chance: 0.6 }, { item: 'stone', count: 90 }] },
      { id: 'm_1_3', name: '千年幽冥蛟', emoji: '🐉', element: 'water', isBoss: true, skillName: '寒冰吐息', skillDesc: '寒氣襲體，造成強大水靈霜凍傷害', hp: 1400, atk: 115, def: 52, drops: [{ item: 'herb_3', chance: 0.9 }, { item: 'equip_armor_1', chance: 0.5 }, { item: 'stone', count: 300 }] }
    ]
  },
  {
    id: 2, name: '焚天火穴', realmReq: 2, maxSteps: 10, desc: '地底火脈奔騰噴發，孕育狂暴火煞魔物。', element: 'fire',
    milestoneReward: { stones: 350, ore_2: 3 },
    firstClearReward: { stones: 800, equip: 'equip_sword_2' },
    monsters: [
      { id: 'm_2_1', name: '地火毒蠍', emoji: '🦂', element: 'fire', skillName: '赤陽毒尾', skillDesc: '火毒入髓，附加熾熱灼燒傷害', hp: 1300, atk: 155, def: 85, drops: [{ item: 'ore_2', chance: 0.8 }, { item: 'stone', count: 140 }] },
      { id: 'm_2_2', name: '烈焰火鱗雕', emoji: '🦅', element: 'fire', skillName: '燎原火羽', skillDesc: '烈羽如雨，引動三昧地火轟擊', hp: 2500, atk: 270, def: 125, isBoss: true, drops: [{ item: 'herb_4', chance: 0.9 }, { item: 'equip_sword_2', chance: 0.4 }, { item: 'stone', count: 700 }] }
    ]
  },
  {
    id: 3, name: '九天雷崖', realmReq: 3, maxSteps: 10, desc: '直插雲霄，劫雷轟頂，乃淬鍊法寶與斬滅巨擘之絕地。', element: 'metal',
    milestoneReward: { stones: 800, herb_3: 3 },
    firstClearReward: { stones: 1800, equip: 'equip_art_1' },
    monsters: [
      { id: 'm_3_1', name: '紫霄雷靈', emoji: '⚡', element: 'metal', skillName: '九天玄雷', skillDesc: '引動紫霄神雷，造成破防雷霆爆裂', hp: 4800, atk: 440, def: 210, drops: [{ item: 'herb_3', chance: 0.9 }, { item: 'ore_3', chance: 0.7 }, { item: 'stone', count: 450 }] },
      { id: 'm_3_2', name: '滅世雷煞魔尊', emoji: '👹', element: 'metal', isBoss: true, skillName: '煞雷滅世', skillDesc: '雷煞滅魂，會心率提升50%！', hp: 9800, atk: 780, def: 360, drops: [{ item: 'equip_art_1', chance: 0.6 }, { item: 'ore_3', chance: 0.9 }, { item: 'stone', count: 2000 }] }
    ]
  },
  {
    id: 4, name: '縹緲仙宮', realmReq: 4, maxSteps: 10, desc: '遠古仙人遺留的天外宮闕，混沌至寶沉浮其中。', element: 'earth',
    milestoneReward: { stones: 2000, ore_3: 5 },
    firstClearReward: { stones: 5000, equip: 'equip_sword_3' },
    monsters: [
      { id: 'm_4_1', name: '天門神將', emoji: '🛡️', element: 'metal', skillName: '金光神咒', skillDesc: '金仙法相，巨額防禦並反彈微弱傷害', hp: 19000, atk: 1350, def: 620, drops: [{ item: 'ore_3', chance: 0.9 }, { item: 'stone', count: 1800 }] },
      { id: 'm_4_2', name: '混沌造化真龍', emoji: '🐉', element: 'water', isBoss: true, skillName: '混沌龍息', skillDesc: '混沌無極，抹殺一切護體罡氣！', hp: 48000, atk: 2600, def: 1250, drops: [{ item: 'equip_art_2', chance: 0.5 }, { item: 'stone', count: 9999 }] }
    ]
  },
  // ===== 仙界歷練(飛升後) =====
  {
    id: 5, name: '九重天闕', realmReq: 5, maxSteps: 10, desc: '仙界門戶，天兵天將列陣守關。踏入此地，方知凡界之渺小。', element: 'metal',
    milestoneReward: { stones: 6000, ore_4: 3 },
    firstClearReward: { stones: 15000, equip: 'equip_armor_3' },
    monsters: [
      { id: 'm_5_1', name: '巡天仙衛', emoji: '👼', element: 'metal', skillName: '天罡劍陣', skillDesc: '仙衛結陣，劍光交織斬落', hp: 42000, atk: 2900, def: 1300, drops: [{ item: 'ore_4', chance: 0.7 }, { item: 'herb_5', chance: 0.3 }, { item: 'stone', count: 4000 }] },
      { id: 'm_5_2', name: '司雷天將', emoji: '⚡', element: 'metal', isBoss: true, skillName: '五雷天罰', skillDesc: '召來五方雷霆轟頂', hp: 100000, atk: 5200, def: 2300, drops: [{ item: 'equip_sword_4', chance: 0.4 }, { item: 'ore_4', chance: 0.9 }, { item: 'stone', count: 20000 }] }
    ]
  },
  {
    id: 6, name: '太虛瑤池', realmReq: 6, maxSteps: 10, desc: '蟠桃仙露匯聚成海的仙家瑤池，亦有護池神獸盤踞。', element: 'water',
    milestoneReward: { stones: 15000, herb_5: 3 },
    firstClearReward: { stones: 40000, equip: 'equip_art_3' },
    monsters: [
      { id: 'm_6_1', name: '瑤池靈蓮妖', emoji: '🪷', element: 'water', skillName: '蓮華凈世', skillDesc: '蓮華綻放，淨化一切護體仙光', hp: 95000, atk: 6400, def: 2900, drops: [{ item: 'herb_5', chance: 0.8 }, { item: 'ore_4', chance: 0.5 }, { item: 'stone', count: 9000 }] },
      { id: 'm_6_2', name: '弱水玄龜', emoji: '🐢', element: 'water', isBoss: true, skillName: '弱水沉淵', skillDesc: '弱水三千，鴻毛不浮', hp: 240000, atk: 11500, def: 5200, drops: [{ item: 'equip_art_3', chance: 0.4 }, { item: 'herb_5', chance: 0.9 }, { item: 'stone', count: 45000 }] }
    ]
  },
  {
    id: 7, name: '混沌天淵', realmReq: 7, maxSteps: 10, desc: '天地未開時殘存的混沌深淵，吞噬一切光明，唯金仙可入。', element: 'earth',
    milestoneReward: { stones: 40000, ore_4: 6 },
    firstClearReward: { stones: 120000, equip: 'equip_sword_4' },
    monsters: [
      { id: 'm_7_1', name: '虛空吞噬者', emoji: '🌑', element: 'earth', skillName: '虛空吞噬', skillDesc: '張開虛空之口，吞噬仙力', hp: 210000, atk: 13000, def: 5800, drops: [{ item: 'ore_4', chance: 0.9 }, { item: 'herb_5', chance: 0.5 }, { item: 'stone', count: 22000 }] },
      { id: 'm_7_2', name: '混沌魔神·渾沌', emoji: '👁️', element: 'earth', isBoss: true, skillName: '開天闢地', skillDesc: '混沌初開之力，抹殺一切', hp: 560000, atk: 24000, def: 11000, drops: [{ item: 'pill_6', chance: 0.6 }, { item: 'ore_4', chance: 1.0 }, { item: 'stone', count: 120000 }] }
    ]
  }
];

// OPT-O2: 煉丹配方表
const ALCHEMY_RECIPES = [
  { id: 'pill_1', name: '聚氣丹', need: [{ item: 'herb_1', name: '凝露靈草', count: 2 }], giveId: 'pill_1', desc: '基礎修真靈丹,練氣期服用增加修為上限 12%。' },
  { id: 'pill_2', name: '洗髓丹', need: [{ item: 'herb_2', name: '洗髓花', count: 2 }], giveId: 'pill_2', desc: '洗滌奇經八脈，永久提升吐納速度 +5/秒。' },
  { id: 'pill_3', name: '渡劫丹', need: [{ item: 'herb_3', name: '天雷竹', count: 1 }, { item: 'herb_2', name: '洗髓花', count: 2 }], giveId: 'pill_3', desc: '天劫突破成功率+20%，且失敗時修為損失減半！' }, // FIX-B2
  { id: 'pill_4', name: '回春丹', need: [{ item: 'herb_1', name: '凝露靈草', count: 2 }], giveId: 'pill_4', desc: '外傷聖藥，服用可恢復 200 點或 30% 氣血(取較高者)。' },
  { id: 'pill_5', name: '九轉延壽丹', need: [{ item: 'herb_4', name: '龍血果', count: 1 }, { item: 'herb_2', name: '洗髓花', count: 2 }], giveId: 'pill_5', desc: '奪天地造化，服用後增延壽元上限 +30 歲。' }, // FIX-B8
  { id: 'pill_6', name: '太清仙丹', need: [{ item: 'herb_5', name: '蟠桃仙露', count: 2 }, { item: 'herb_2', name: '洗髓花', count: 3 }], giveId: 'pill_6', desc: '仙界妙藥,真仙境服用增加修為上限 12%。' }
];

// OPT-O2 & FIX-B4: 鍛造配方表 (鍛造出裝備進入背包)
const FORGE_RECIPES = [
  { id: 'forge_1', name: '寒鐵青鋒劍', slot: 'weapon', giveItem: 'equip_sword_1', need: [{ item: 'ore_1', name: '寒鐵石', count: 3 }], desc: '寒鐵精鋼鍛造的下品飛劍，攻擊+35' },
  { id: 'forge_2', name: '天罡八卦道袍', slot: 'armor', giveItem: 'equip_armor_1', need: [{ item: 'ore_1', name: '寒鐵石', count: 2 }, { item: 'herb_1', name: '凝露靈草', count: 3 }], desc: '繪有避塵符籙的道袍，防禦+25，氣血+140' },
  { id: 'forge_3', name: '赤陽焚天劍', slot: 'weapon', giveItem: 'equip_sword_2', need: [{ item: 'ore_2', name: '赤陽銅', count: 4 }], desc: '吸納地火精華，劍出烈焰燎原！攻擊+120，防禦+10' },
  { id: 'forge_4', name: '乾坤聚寶戒', slot: 'artifact', giveItem: 'equip_art_1', need: [{ item: 'ore_2', name: '赤陽銅', count: 2 }, { item: 'herb_3', name: '天雷竹', count: 2 }], desc: '護身異寶，攻防兼備，攻擊+45，防禦+40，氣血+320' },
  { id: 'forge_5', name: '誅仙劍', slot: 'weapon', giveItem: 'equip_sword_4', need: [{ item: 'ore_4', name: '九天玄晶', count: 6 }, { item: 'ore_3', name: '紫霄玄晶', count: 4 }], desc: '仙界殺伐至寶，攻擊+520，防禦+60，氣血+400' },
  { id: 'forge_6', name: '九天流雲仙衣', slot: 'armor', giveItem: 'equip_armor_3', need: [{ item: 'ore_4', name: '九天玄晶', count: 5 }, { item: 'herb_5', name: '蟠桃仙露', count: 2 }], desc: '九天流雲織就，防禦+260，氣血+1800，攻擊+50' },
  { id: 'forge_7', name: '太虛混元珠', slot: 'artifact', giveItem: 'equip_art_3', need: [{ item: 'ore_4', name: '九天玄晶', count: 6 }, { item: 'herb_5', name: '蟠桃仙露', count: 3 }], desc: '內藏太虛，攻擊+190，防禦+170，氣血+1400' }
];

// OPT-O2: 集中式坊市商品清單
const MARKET_OFFERS = [
  { id: 'm_herb1', name: '凝露靈草 x3', cost: 30, give: { item: 'herb_1', count: 3 } },
  { id: 'm_ore1', name: '寒鐵石 x2', cost: 45, give: { item: 'ore_1', count: 2 } },
  { id: 'm_herb2', name: '洗髓花 x1', cost: 80, give: { item: 'herb_2', count: 1 } },
  { id: 'm_pill3', name: '渡劫保命丹 x1', cost: 200, give: { item: 'pill_3', count: 1 } },
  { id: 'm_pill4', name: '回春急救丹 x2', cost: 60, give: { item: 'pill_4', count: 2 } },
  { id: 'm_ore2', name: '赤陽銅 x1', cost: 100, give: { item: 'ore_2', count: 1 } }
];

// OPT-O8: 轉世道心閣商品
const DAO_SHOP_ITEMS = [
  { id: 'dao_qi', name: '混沌道體', cost: 2, desc: '歷練輪迴得天道庇佑，永久吐納速度提升 +15%' },
  { id: 'dao_drop', name: '氣運亨通', cost: 2, desc: '福緣深厚，歷練斬妖掉落率永久提升 +15%' },
  { id: 'dao_stone', name: '前輩贈禮', cost: 1, desc: '轉世重生獲得本門前輩贈禮，初始靈石 +200' },
  { id: 'dao_offline', name: '神遊太虛', cost: 2, desc: '元神離體神遊更久，離線打坐時長上限 +2小時' }
];

// OPT-O9: 每日任務清單
const DAILY_QUESTS_DATA = [
  { id: 'quest_tap', name: '靜坐冥想', target: 20, desc: '手動或自動吐納累積 20 次', reward: { stones: 60, qi: 100 } },
  { id: 'quest_explore', name: '踏破山河', target: 5, desc: '探尋歷練秘境累積 5 步', reward: { stones: 80, item: 'herb_1', count: 2 } },
  { id: 'quest_alchemy', name: '丹鼎大師', target: 1, desc: '於丹閣開爐成功煉丹 1 次', reward: { stones: 100, item: 'herb_2', count: 1 } }
];

// OPT-O2: 成就系統定義
const ACHIEVEMENTS_DATA = [
  { id: 'ach_1', title: '初入道途', desc: '達到練氣一層', check: (s) => s.realmIdx >= 0, rewardStones: 50 },
  { id: 'ach_2', title: '築基成仙', desc: '成功渡過築基大劫', check: (s) => s.realmIdx >= 1, rewardStones: 150 },
  { id: 'ach_3', title: '金丹大道', desc: '凝結九轉無暇金丹', check: (s) => s.realmIdx >= 2, rewardStones: 500 },
  { id: 'ach_4', title: '元嬰顯聖', desc: '元嬰離體神遊太虛', check: (s) => s.realmIdx >= 3, rewardStones: 1200 },
  { id: 'ach_5', title: '神兵護體', desc: '同時穿戴武器、道袍與法寶', check: (s) => !!s.equipment.weapon && !!s.equipment.armor && !!s.equipment.artifact, rewardStones: 300 },
  { id: 'ach_6', title: '輪迴重生', desc: '經歷過至少一次轉世重修', check: (s) => s.reincarnationCount > 0, rewardStones: 400 },
  { id: 'ach_7', title: '羽化飛升', desc: '渡過飛升雷劫，踏入仙界', check: (s) => s.realmIdx >= 5, rewardStones: 20000 },
  { id: 'ach_8', title: '證道大羅', desc: '修成大羅金仙，仙途圓滿', check: (s) => s.realmIdx >= 8, rewardStones: 200000 }
];


