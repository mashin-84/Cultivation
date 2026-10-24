/* ==========================================================================
   10. CANVAS VISUALS (Qi Particles & Thunder Tribulation) (FIX-B11)
   ========================================================================== */
let qiParticles = [];
let animFrameId = null;

function initQiCanvas() {
  const canvas = document.getElementById('qi-particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // FIX: 重複呼叫時先取消舊迴圈,避免動畫疊加
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = null;

  function resize() {
    if (!canvas.parentElement) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  // FIX: resize 監聽只綁定一次
  if (!window.__qiResizeBound) {
    window.addEventListener('resize', () => {
      const c = document.getElementById('qi-particles-canvas');
      if (c && c.parentElement) { c.width = c.parentElement.clientWidth; c.height = c.parentElement.clientHeight; }
    });
    window.__qiResizeBound = true;
  }

  qiParticles = [];
  for (let i = 0; i < 35; i++) {
    qiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.8 - 0.2,
      alpha: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.4 ? 'rgba(45, 212, 191,' : 'rgba(250, 204, 21,'
    });
  }

  function loop() {
    // FIX-B11: 背景分頁時暫停粒子繪製循環
    if (document.hidden) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    qiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#2dd4bf';
      ctx.fill();
    });
    animFrameId = requestAnimationFrame(loop);
  }
  loop();
}

function startTribulationCanvas() {
  const canvas = document.getElementById('tribulation-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}

function triggerLightningFlash() {
  const canvas = document.getElementById('tribulation-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#facc15';

  let curX = canvas.width / 2 + (Math.random() * 40 - 20);
  let curY = 0;
  ctx.beginPath();
  ctx.moveTo(curX, curY);

  while (curY < canvas.height) {
    curX += (Math.random() - 0.5) * 40;
    curY += Math.random() * 25 + 10;
    ctx.lineTo(curX, curY);
  }
  ctx.stroke();

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 250);
}

