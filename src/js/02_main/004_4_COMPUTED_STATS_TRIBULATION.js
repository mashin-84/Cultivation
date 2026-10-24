/* ==========================================================================
   4. COMPUTED STATS, TRIBULATION CHANCE & FORMULAS (OPT-O3, FIX-B1, B10)
   ========================================================================== */
// OPT-O9: 數字格式化
function formatNum(num) {
  if (!Number.isFinite(num)) return '0';
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '億';
  if (num >= 10000) return (num / 10000).toFixed(1) + '萬';
  return Math.floor(num).toLocaleString();
}

// 修為節奏旋鈕:各境界「每層需求」倍率(練氣/築基/金丹/元嬰/化神/真仙),覺得太快或太慢只改這裡
const SUB6_GROW = 1.25; // 六層境界的逐層成長
const SUB6_K = 4.1725 / ((Math.pow(SUB6_GROW, 6) - 1) / (SUB6_GROW - 1)); // 讓整個境界的總需求維持原水準
const QI_NEED_MULT = [3, 4 * SUB6_K, 4 * SUB6_K, 1.8 * SUB6_K, 0.62 * SUB6_K, 0.45 * SUB6_K, 0.3 * SUB6_K, 0.25 * SUB6_K, 1]; // v12.0:依主線各章時間預算校準
