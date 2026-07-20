(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* ═══════════ Safety net — the interface must always appear ═══════════
     Whatever else happens, hide the loader / reveal the page. This runs
     independently of everything below, so a single feature failing can
     never leave the site stuck on the loading screen. */
  function showInterface() { document.body.classList.add('loaded'); }
  window.addEventListener('error', showInterface);
  window.addEventListener('DOMContentLoaded', () => setTimeout(showInterface, 1750));
  setTimeout(showInterface, 3000); // hard fallback no matter what

  /* Small helper so any one enhancement can fail without breaking the rest */
  function safe(label, fn) {
    try { fn(); } catch (err) { console.warn(`[birthday-site] "${label}" skipped:`, err); }
  }

  const cfg = window.BIRTHDAY_CONFIG || {
    name: 'Friend', date: '', title: document.title,
    message: 'Happy Birthday!', music: '', heroPhoto: '', photos: [],
    memories: [], wishes: [], giftMessage: '', colors: {}
  };

  /* ═══════════ Core setup ═══════════ */
  safe('title + theme colors', () => {
    document.title = cfg.title || document.title;
    if (cfg.colors) {
      document.documentElement.style.setProperty('--pink', cfg.colors.accent || '#ff6b9d');
      document.documentElement.style.setProperty('--gold', cfg.colors.gold || '#f6c77d');
      document.documentElement.style.setProperty('--violet', cfg.colors.violet || '#8e7dff');
    }
    document.documentElement.style.setProperty('--hero-photo', `url("${cfg.heroPhoto || (cfg.photos && cfg.photos[0]) || ''}")`);
    $$('[data-name]').forEach(e => e.textContent = cfg.name || 'Friend');
  });

  const audio = $('#birthday-audio');
  safe('audio source', () => { if (audio && cfg.music) { audio.src = cfg.music; audio.volume = .55; } });

  /* ═══════════ Gallery — populated solely from config ═══════════ */
  safe('gallery', () => {
    const gallery = $('#gallery-grid');
    if (!gallery) return;
    const makePhoto = (src, i) => {
      const el = document.createElement('button');
      el.className = 'photo';
      el.innerHTML = `<img src="${src}" alt="Memory ${i + 1}" loading="lazy">`;
      el.onclick = () => openLightbox(src);
      gallery.append(el);
    };
    if (cfg.photos && cfg.photos.length) {
      cfg.photos.forEach(makePhoto);
      const help = $('#gallery-help'); if (help) help.hidden = true;
    } else {
      [1, 2, 3, 4, 5, 6].forEach(i => {
        const el = document.createElement('div');
        el.className = 'photo placeholder-photo';
        el.innerHTML = `<span>✦</span> A treasured moment ${i}`;
        gallery.append(el);
      });
    }
  });

  /* ═══════════ Timeline — same data source, small icon flourish ═══════════ */
  safe('timeline', () => {
    const timeline = $('#timeline-list');
    if (!timeline || !cfg.memories) return;
    const timelineIcons = ['✦', '♥', '✧', '☾', '❋'];
    cfg.memories.forEach((m, i) => {
      const card = document.createElement('article');
      card.className = 'memory glass reveal';
      card.innerHTML = `<span class="memory-icon">${timelineIcons[i % timelineIcons.length]}</span><div class="date">${m.date}</div><h3>${m.title}</h3><p>${m.text}</p>`;
      timeline.append(card);
    });
  });

  /* ═══════════ Wishes wall ═══════════ */
  safe('wishes', () => {
    const wishes = $('#wishes-wall');
    if (!wishes || !cfg.wishes) return;
    cfg.wishes.forEach((w, i) => {
      const card = document.createElement('article');
      card.className = 'wish glass reveal';
      card.style.animationDelay = `-${i * 1.2}s`;
      card.textContent = w;
      wishes.append(card);
    });
  });

  /* ═══════════ Lightbox ═══════════ */
  const lb = $('#lightbox');
  function openLightbox(src) { if (!lb) return; lb.querySelector('img').src = src; lb.classList.add('open'); }
  safe('lightbox close', () => {
    if (!lb) return;
    lb.onclick = e => { if (e.target === lb || e.target.tagName === 'BUTTON') lb.classList.remove('open'); };
  });

  /* ═══════════ Typewriter letter ═══════════ */
  const letter = $('#typed-letter'), full = cfg.message || '';
  let typingTimer, typed = false;
  function typeLetter() {
    if (typed || !letter) return; typed = true; let i = 0; letter.textContent = '';
    typingTimer = setInterval(() => { letter.textContent += full[i++] || ''; if (i >= full.length) clearInterval(typingTimer); }, 13);
  }
  safe('finish-letter button', () => {
    const btn = $('#finish-letter');
    if (btn) btn.onclick = () => { clearInterval(typingTimer); if (letter) letter.textContent = full; typed = true; };
  });

  /* ═══════════ Candles / wish ═══════════ */
  safe('candles', () => {
    const candles = $('#candles'), wish = $('#wish-status');
    if (!candles) return;
    let blown = 0;
    for (let i = 0; i < 5; i++) {
      const c = document.createElement('button');
      c.className = 'candle';
      c.setAttribute('aria-label', 'Blow out candle');
      c.innerHTML = '<span class="flame"></span>';
      c.onclick = () => {
        if (c.classList.contains('out')) return;
        c.classList.add('out'); blown++;
        if (blown === 5) { if (wish) wish.textContent = 'Your wish is on its way. ✨'; launchCelebration(120); }
      };
      candles.append(c);
    }
  });

  /* ═══════════ Gift box ═══════════ */
  safe('gift box', () => {
    const gift = $('#gift-box');
    if (!gift) return;
    gift.onclick = () => {
      gift.classList.toggle('open');
      const msg = $('#gift-message');
      if (msg) msg.textContent = gift.classList.contains('open') ? (cfg.giftMessage || '') : 'Click the gift to unwrap a note.';
      if (gift.classList.contains('open')) launchCelebration(45);
    };
  });

  /* ═══════════ Audio: fade / play / controls ═══════════ */
  let fadeTimer;
  function fadeTo(target, done) {
    if (!audio) return;
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      const step = .05;
      audio.volume = Math.abs(audio.volume - target) < step ? target : audio.volume + (audio.volume < target ? step : -step);
      if (audio.volume === target) { clearInterval(fadeTimer); if (done) done(); }
    }, 45);
  }
  function playMusic() {
    if (!audio) return;
    const volumeInput = $('#volume');
    audio.volume = 0;
    audio.play().then(() => {
      fadeTo(volumeInput ? Number(volumeInput.value) : .55);
      const playBtn = $('#audio-play'); if (playBtn) playBtn.textContent = '❚❚';
      const toggleBtn = $('#music-toggle'); if (toggleBtn) toggleBtn.textContent = '♫';
    }).catch(() => {});
  }
  safe('open-surprise button', () => {
    const btn = $('#open-surprise');
    if (btn) btn.onclick = () => {
      playMusic(); launchCelebration(180);
      setTimeout(() => { const el = $('#celebrate'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 500);
    };
  });
  safe('audio controls', () => {
    const playBtn = $('#audio-play');
    if (playBtn) playBtn.onclick = () => { if (!audio) return; audio.paused ? playMusic() : (audio.pause(), playBtn.textContent = '▶'); };
    const toggleBtn = $('#music-toggle');
    if (toggleBtn) toggleBtn.onclick = () => { if (!audio) return; audio.paused ? playMusic() : fadeTo(0, () => audio.pause()); };
    const muteBtn = $('#audio-mute');
    if (muteBtn) muteBtn.onclick = () => { if (!audio) return; audio.muted = !audio.muted; muteBtn.textContent = audio.muted ? '◉' : '◔'; };
    const volumeInput = $('#volume');
    if (volumeInput) volumeInput.oninput = e => { if (audio) { audio.volume = e.target.value; audio.muted = false; } };
    const replayBtn = $('#replay');
    if (replayBtn) replayBtn.onclick = () => { launchCelebration(260); window.scrollTo({ top: 0, behavior: 'smooth' }); playMusic(); };
  });

  /* ═══════════ Celebration canvas — confetti + fireworks ═══════════
     Same trigger API (launchCelebration(count)) as before; shapes vary
     (square / circle / heart) for a richer premium feel. Silently no-ops
     if canvas 2D isn't available, instead of crashing the page. */
  const canvas = $('#celebration-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let bits = [], raf;
  function resize() {
    if (!canvas || !ctx) return;
    canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  safe('canvas resize', resize);
  addEventListener('resize', () => safe('canvas resize', resize));

  const palette = ['#ff6b9d', '#f6c77d', '#8e7dff', '#ffffff'];
  function launchCelebration(count = 100) {
    if (!ctx) return;
    for (let i = 0; i < count; i++) {
      const fire = i % 8 === 0;
      const x = fire ? Math.random() * innerWidth : innerWidth * .2 + Math.random() * innerWidth * .6;
      const y = fire ? innerHeight * (.1 + Math.random() * .4) : -15;
      const shapeRoll = Math.random();
      const shape = shapeRoll < .12 ? 'heart' : shapeRoll < .5 ? 'circle' : 'square';
      bits.push({
        x, y,
        vx: (Math.random() - .5) * (fire ? 8 : 4),
        vy: fire ? (Math.random() - .5) * 8 : Math.random() * 3 + 2,
        g: .055 + Math.random() * .08,
        a: 1,
        s: 3 + Math.random() * 5,
        r: Math.random() * Math.PI * 2,
        vr: (Math.random() - .5) * .2,
        c: palette[i % palette.length],
        shape, fire
      });
    }
    if (!raf) animateBits();
  }
  function drawHeart(x, y, s, c) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = c;
    ctx.beginPath();
    const top = -s * .3;
    ctx.moveTo(0, top);
    ctx.bezierCurveTo(s, top - s, s * 1.6, top + s * .6, 0, s * 1.6);
    ctx.bezierCurveTo(-s * 1.6, top + s * .6, -s, top - s, 0, top);
    ctx.fill(); ctx.restore();
  }
  function animateBits() {
    if (!ctx) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    bits.forEach(b => {
      b.x += b.vx; b.y += b.vy; b.vy += b.g; b.a -= .008; b.r += b.vr;
      ctx.globalAlpha = Math.max(0, b.a);
      ctx.fillStyle = b.c;
      if (b.shape === 'heart') {
        drawHeart(b.x, b.y, b.s * .9, b.c);
      } else if (b.shape === 'circle') {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.s * .6, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s); ctx.restore();
      }
    });
    ctx.globalAlpha = 1;
    bits = bits.filter(b => b.a > 0 && b.y < innerHeight + 20);
    raf = bits.length ? requestAnimationFrame(animateBits) : null;
  }

  /* ═══════════ Scroll reveal + typewriter trigger ═══════════ */
  safe('scroll reveal', () => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); if (e.target.closest('#letter')) typeLetter(); }
    }), { threshold: .16 });
    $$('.reveal').forEach(el => observer.observe(el));
  });

  /* ═══════════ Cursor glow + spotlight (mouse effects) ═══════════ */
  safe('cursor glow + spotlight', () => {
    const cursorGlow = $('#cursor-glow');
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2, spotlightRaf;
    function updateSpotlight() {
      document.documentElement.style.setProperty('--mx', `${(mouseX / innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--my', `${(mouseY / innerHeight) * 100}%`);
      spotlightRaf = null;
    }
    addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (cursorGlow) cursorGlow.style.transform = `translate(${mouseX}px,${mouseY}px)`;
      document.body.classList.add('mouse-active');
      if (!spotlightRaf) spotlightRaf = requestAnimationFrame(updateSpotlight);
    });
  });

  /* ═══════════ Nav: scroll-spy active indicator + glass elevation ═══════════ */
  safe('nav scroll-spy', () => {
    const navEl = $('.nav');
    const navLinks = $$('#nav-links a[data-nav]');
    const navIndicator = $('#nav-indicator');
    if (!navEl || !navIndicator || !navLinks.length) return;
    const navSections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    function moveIndicatorTo(link) {
      if (!link) { navIndicator.classList.remove('ready'); return; }
      const linkBox = link.getBoundingClientRect();
      const parentBox = navIndicator.parentElement.getBoundingClientRect();
      navIndicator.style.width = `${linkBox.width}px`;
      navIndicator.style.transform = `translateX(${linkBox.left - parentBox.left}px)`;
      navIndicator.classList.add('ready');
      navLinks.forEach(a => a.classList.toggle('active', a === link));
    }

    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const match = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
          if (match) moveIndicatorTo(match);
        }
      });
    }, { threshold: .5 });
    navSections.forEach(sec => navObserver.observe(sec));

    addEventListener('scroll', () => navEl.classList.toggle('scrolled', scrollY > 40), { passive: true });
    addEventListener('resize', () => { const active = navLinks.find(a => a.classList.contains('active')); if (active) moveIndicatorTo(active); });
  });

  /* ═══════════ Ripple + magnetic feel for premium buttons ═══════════ */
  safe('button micro-interactions', () => {
    function attachRipple(el) {
      el.addEventListener('click', e => {
        const rect = el.getBoundingClientRect();
        const span = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        span.className = 'ripple';
        span.style.width = span.style.height = `${size}px`;
        span.style.left = `${e.clientX - rect.left - size / 2}px`;
        span.style.top = `${e.clientY - rect.top - size / 2}px`;
        el.appendChild(span);
        setTimeout(() => span.remove(), 700);
      });
    }
    function attachMagnetic(el, strength = 14) {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${(relX / rect.width) * strength}px, ${(relY / rect.height) * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    }
    $$('.primary-btn').forEach(el => { attachRipple(el); attachMagnetic(el); });
  });

  /* ═══════════ Audio progress bar (additive UI) ═══════════ */
  safe('audio progress bar', () => {
    const progressTrack = $('#audio-progress-track');
    const progressFill = $('#audio-progress-fill');
    if (!audio || !progressTrack || !progressFill) return;
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      progressFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    });
    progressTrack.addEventListener('click', e => {
      if (!audio.duration) return;
      const rect = progressTrack.getBoundingClientRect();
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });
  });

  /* ═══════════ Ambient star field + drifting sparkles ═══════════ */
  safe('star field', () => {
    const starField = $('#star-field');
    if (!starField) return;
    const starCount = innerWidth < 700 ? 46 : 90;
    for (let i = 0; i < starCount; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 2 + .6;
      s.style.width = s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.animationDuration = `${2.5 + Math.random() * 4}s`;
      s.style.animationDelay = `-${Math.random() * 4}s`;
      starField.append(s);
    }
  });
  safe('sparkle field', () => {
    const sparkleField = $('#sparkle-field');
    if (!sparkleField) return;
    const sparkleGlyphs = ['✦', '✧', '·', '✨'];
    const sparkleCount = innerWidth < 700 ? 6 : 12;
    for (let i = 0; i < sparkleCount; i++) {
      const sp = document.createElement('span');
      sp.className = 'sparkle-drift';
      sp.textContent = sparkleGlyphs[i % sparkleGlyphs.length];
      sp.style.left = `${Math.random() * 100}%`;
      sp.style.fontSize = `${.6 + Math.random() * .8}rem`;
      sp.style.animationDuration = `${14 + Math.random() * 12}s`;
      sp.style.animationDelay = `-${Math.random() * 20}s`;
      sparkleField.append(sp);
    }
  });
})();
