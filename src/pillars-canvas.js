/**
 * pillars-canvas.js
 *
 * "Our Four Pillars of Motion"
 * Full-width scroll-scrubbed transparent canvas dancer sequence with GSAP ScrollTrigger pinning.
 * Works on both desktop and mobile — mobile uses the same animation, just resized to fit the screen.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Measured center X of dancer inside each 1280x720 video frame extracted from i_want_this_video_background_t.mp4
const DANCER_CENTERS = [
  463.5, 464.5, 459.5, 462.0, 466.5, 469.0, 470.5, 473.0, 479.0, 480.5,
  482.0, 485.0, 486.0, 485.0, 485.5, 496.0, 503.5, 501.5, 499.5, 501.5,
  499.5, 521.5, 516.5, 492.5, 512.0, 530.0, 542.5, 565.0, 542.5, 571.0,
  575.5, 561.0, 540.0, 527.5, 532.5, 536.0, 545.0, 571.0, 594.0, 617.0,
  624.0, 617.5, 602.0, 598.5, 609.5, 619.5, 626.0, 625.5, 622.5, 618.5,
  604.5, 594.5, 584.0, 570.5, 586.0, 620.0, 631.0, 624.5, 621.5, 633.0,
  663.5, 680.0, 691.0, 696.5, 705.0, 713.0, 719.0, 715.5, 711.0, 705.0,
  703.5, 699.5, 696.0, 691.0, 683.5, 661.5, 599.0, 591.5, 574.5, 548.0,
  526.0, 512.0, 504.0, 500.0, 499.5, 503.5, 517.0, 517.5, 498.5, 483.5,
  479.0, 480.5, 474.0, 471.5, 471.5, 488.0, 490.5, 489.5, 485.5, 476.5,
  480.5, 483.5, 482.0, 482.5, 487.5, 489.5, 489.0, 493.5, 497.5, 498.5,
  500.0, 499.5, 500.0, 504.0, 512.5, 526.5, 544.5, 553.5, 565.0, 562.0
];

export function initPillarsCanvas() {
  const section = document.querySelector('.four-pillars-section');
  const canvas = document.querySelector('#dancer-scrub-canvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  const loader = document.querySelector('#pillars-loader');
  const loaderPct = document.querySelector('#pillars-loader-pct');
  const panels = Array.from(document.querySelectorAll('.pillar-panel'));
  const segmentDots = Array.from(document.querySelectorAll('.pillar-segment-dot'));
  const currNumSpan = document.querySelector('#pillars-curr-num');
  const staticPoster = document.querySelector('#dancer-static-poster');
  const reducedMotionTabs = Array.from(document.querySelectorAll('.reduced-motion-tab'));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. PREFERS-REDUCED-MOTION FALLBACK
     ========================================================================== */
  if (prefersReducedMotion) {
    if (loader) loader.classList.add('is-hidden');
    if (staticPoster) {
      staticPoster.src = '/frames/poster.webp';
      staticPoster.style.display = 'block';
    }

    function setActiveReducedPillar(index) {
      panels.forEach((p, i) => { p.classList.toggle('is-active', i === index); });
      reducedMotionTabs.forEach((tab, i) => { tab.classList.toggle('is-active', i === index); });
      if (currNumSpan) currNumSpan.textContent = `0${index + 1}`;
    }

    reducedMotionTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => setActiveReducedPillar(i));
    });
    setActiveReducedPillar(0);
    return;
  }

  /* ==========================================================================
     2. FAST PROGRESSIVE FRAME PRELOADER (120 Transparent WebP frames)
        Works on BOTH desktop and mobile — same animation, mobile-resized
     ========================================================================== */
  const TOTAL_FRAMES = 120;
  const loadedImages = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let isReady = false;

  function dismissLoader() {
    if (isReady) return;
    isReady = true;
    if (loader) loader.classList.add('is-hidden');
    resizeCanvas();
    setupScrollScrub();
  }

  // Preload frame 0 immediately — dismiss loader the moment it arrives
  const firstFrame = new Image();
  firstFrame.src = '/frames/frame_000.webp';
  firstFrame.onload = () => {
    loadedImages[0] = firstFrame;
    loadedCount++;
    dismissLoader();
  };
  firstFrame.onerror = () => dismissLoader();

  // Hard safety timeout: never block longer than 600ms regardless of network
  setTimeout(() => dismissLoader(), 600);

  // Background fetch remaining frames
  for (let i = 1; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    const padIndex = String(i).padStart(3, '0');
    img.src = `/frames/frame_${padIndex}.webp`;
    img.onload = () => {
      loadedImages[i] = img;
      loadedCount++;
      if (loaderPct) {
        loaderPct.textContent = `${Math.round((loadedCount / TOTAL_FRAMES) * 100)}%`;
      }
      if (loadedCount >= TOTAL_FRAMES) dismissLoader();
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_FRAMES) dismissLoader();
    };
  }

  /* ==========================================================================
     3. FULL-WIDTH CANVAS RENDERING & LEFT-TO-RIGHT STAGE TRAVEL
        Mobile: dancer is centered, scaled to ~70% of viewport height
        Desktop: dancer travels left (0.24) to right (0.80) across the stage
     ========================================================================== */
  let currentFrameIndex = 0;
  let lastDrawnIndex = -1;
  let lastDrawnProgress = -1;

  function renderFrame(index, progress = 0) {
    if (!canvas) return;

    // Find requested frame or nearest loaded frame for zero-lag rendering
    let img = loadedImages[index];
    if (!img) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (index - offset >= 0 && loadedImages[index - offset]) {
          img = loadedImages[index - offset];
          break;
        }
        if (index + offset < TOTAL_FRAMES && loadedImages[index + offset]) {
          img = loadedImages[index + offset];
          break;
        }
      }
    }
    if (!img) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const isMobile = window.innerWidth < 768;

    // Scale dancer to occupy ~70% of viewport height on mobile, ~82% on desktop
    const heightFraction = isMobile ? 0.72 : 0.82;
    const targetScale = (canvasHeight * heightFraction) / 720;
    const drawW = 1280 * targetScale;
    const drawH = 720 * targetScale;

    // Baseline: foot contact point in original frame is at y=633
    // Place baseline at 88% of viewport height on mobile, 86% on desktop
    const baselineFraction = isMobile ? 0.88 : 0.86;
    const baselineY = canvasHeight * baselineFraction;
    const drawY = baselineY - (633 * targetScale);

    // Horizontal travel:
    // Desktop: travels from 0.24 (left, behind text) to 0.80 (right side)
    // Mobile:  travels from 0.15 to 0.85 — full width for full dramatic effect
    const startXFraction = isMobile ? 0.15 : 0.24;
    const travelSpan = isMobile ? 0.70 : 0.58;
    const screenTargetX = canvasWidth * (startXFraction + (progress * travelSpan));

    // Align dancer's specific center-of-mass with screenTargetX
    const dancerCenterX = DANCER_CENTERS[index] || 540;
    const drawX = screenTargetX - (dancerCenterX * targetScale);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    lastDrawnIndex = index;
    lastDrawnProgress = progress;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    renderFrame(currentFrameIndex, currentProgress);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  /* ==========================================================================
     4. REQUEST-ANIMATION-FRAME SCROLL SCRUB & CROSSFADE LOGIC
     ========================================================================== */
  let targetProgress = 0;
  let currentProgress = 0;
  let activePillarIndex = 0;
  let rafId = null;

  function updatePillarsUI(progress) {
    const sliceIndex = Math.min(3, Math.max(0, Math.floor(progress * 4)));

    if (sliceIndex !== activePillarIndex) {
      activePillarIndex = sliceIndex;

      panels.forEach((panel, idx) => {
        panel.classList.toggle('is-active', idx === sliceIndex);
      });

      segmentDots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === sliceIndex);
        dot.classList.toggle('is-passed', idx < sliceIndex);
      });

      if (currNumSpan) currNumSpan.textContent = `0${sliceIndex + 1}`;
    }
  }

  function loop() {
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0004) {
      currentProgress += diff * 0.18;
    } else {
      currentProgress = targetProgress;
    }

    const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(currentProgress * (TOTAL_FRAMES - 1))));
    if (frameIdx !== currentFrameIndex || Math.abs(currentProgress - lastDrawnProgress) > 0.002) {
      currentFrameIndex = frameIdx;
      renderFrame(currentFrameIndex, currentProgress);
    }

    updatePillarsUI(currentProgress);
    if (isSectionVisible && !document.hidden) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null;
    }
  }

  let isSectionVisible = false;

  function resumeLoopIfNeeded() {
    if (isReady && isSectionVisible && !document.hidden && !rafId) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function pauseLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /* ==========================================================================
     5. GSAP SCROLLTRIGGER — PIN STICKY VIEWPORT & SCRUB ANIMATION
        Same on desktop and mobile. Mobile uses 200dvh scroll budget.
     ========================================================================== */
  function setupScrollScrub() {
    const viewport = section.querySelector('.pillars-sticky-viewport');

    function setActiveTabPillar(index) {
      panels.forEach((p, i) => { p.classList.toggle('is-active', i === index); });
      reducedMotionTabs.forEach((tab, i) => { tab.classList.toggle('is-active', i === index); });
      if (currNumSpan) currNumSpan.textContent = `0${index + 1}`;
      targetProgress = (index + 0.1) / 4;
      currentProgress = targetProgress;
      currentFrameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(currentProgress * (TOTAL_FRAMES - 1))));
      renderFrame(currentFrameIndex, currentProgress);
    }

    reducedMotionTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => setActiveTabPillar(i));
    });

    let st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: viewport,
      pinSpacing: false,
      anticipatePin: 1,
      scrub: 0.5,
      invalidateOnRefresh: true,
      onUpdate(self) {
        targetProgress = self.progress;
        resumeLoopIfNeeded();
      }
    });

    // Segment dots: click to jump to that pillar
    segmentDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        if (st) {
          const targetP = (idx + 0.12) / 4;
          const targetScroll = st.start + targetP * (st.end - st.start);
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        } else {
          setActiveTabPillar(idx);
        }
      });
    });

    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
      resizeCanvas();
    }, { passive: true });

    // Pause RAF when section is offscreen to save battery
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isSectionVisible = entry.isIntersecting;
        if (isSectionVisible) resumeLoopIfNeeded();
        else pauseLoop();
      });
    }, { threshold: 0.01 });

    visibilityObserver.observe(section);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseLoop();
      else resumeLoopIfNeeded();
    });

    // Initialize first frame & UI state
    updatePillarsUI(0);
    renderFrame(0, 0);
  }
}
