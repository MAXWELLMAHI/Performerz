/**
 * pillars-canvas.js
 *
 * "Our Four Pillars of Motion / Kinetic Atelier"
 * - Desktop (>= 1024px): Full-width scroll-scrubbed transparent canvas dancer sequence with GSAP ScrollTrigger pinning.
 * - Mobile (< 1024px): Canvas scroll-jacking is completely disabled. Replaced with native touch momentum swipeable
 *   card deck with synchronized indicators and zero performance overhead.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Prevent mobile address bar height fluctuations from resetting ScrollTrigger pins
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
});

// Measured center X of dancer inside each 1280x720 video frame extracted from dancer sequence
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
  if (!section) return;

  const canvas = document.querySelector('#dancer-scrub-canvas');
  const loader = document.querySelector('#pillars-loader');
  const loaderPct = document.querySelector('#pillars-loader-pct');
  const panels = Array.from(document.querySelectorAll('.pillar-panel'));
  const segmentDots = Array.from(document.querySelectorAll('.pillar-segment-dot'));
  const currNumSpan = document.querySelector('#pillars-curr-num');
  const staticPoster = document.querySelector('#dancer-static-poster');
  const reducedMotionTabs = Array.from(document.querySelectorAll('.reduced-motion-tab'));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileViewport = () => window.innerWidth < 1024;

  /* ==========================================================================
     A. MOBILE / TABLET (< 1024px): NATIVE TOUCH CARD DECK & MOMENTUM SCROLL
     Canvas scrubbing and 120-image loading are completely bypassed.
     ========================================================================== */
  function initMobilePillars() {
    if (loader) loader.classList.add('is-hidden');
    if (canvas) canvas.style.display = 'none';

    const mobileDeck = document.querySelector('.pillars-mobile-deck');
    const mobileDots = Array.from(document.querySelectorAll('.pillars-mobile-dot'));
    const mobileCurrNum = document.querySelector('#pillars-mobile-curr-num');
    const mobileCards = Array.from(document.querySelectorAll('.pillar-mobile-card'));

    if (!mobileDeck || mobileCards.length === 0) return;

    // Active card tracking via scroll snap position
    let isScrollingDeck = false;
    const updateActiveMobileCard = () => {
      const deckScrollLeft = mobileDeck.scrollLeft;
      const cardWidth = mobileCards[0].offsetWidth + 16; // card width + gap
      const activeIdx = Math.min(mobileCards.length - 1, Math.max(0, Math.round(deckScrollLeft / cardWidth)));

      mobileDots.forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx === activeIdx);
      });
      if (mobileCurrNum) {
        mobileCurrNum.textContent = `0${activeIdx + 1}`;
      }
    };

    mobileDeck.addEventListener('scroll', () => {
      if (!isScrollingDeck) {
        requestAnimationFrame(() => {
          updateActiveMobileCard();
          isScrollingDeck = false;
        });
        isScrollingDeck = true;
      }
    }, { passive: true });

    // Tapping dot smooth-scrolls to the card
    mobileDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const targetCard = mobileCards[idx];
        if (targetCard) {
          mobileDeck.scrollTo({
            left: targetCard.offsetLeft - mobileDeck.offsetLeft,
            behavior: 'smooth'
          });
        }
      });
    });

    updateActiveMobileCard();
  }

  /* ==========================================================================
     B. PREFERS-REDUCED-MOTION DESKTOP FALLBACK
     ========================================================================== */
  if (prefersReducedMotion && !isMobileViewport()) {
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

  // If on mobile / tablet, activate native touch experience immediately
  if (isMobileViewport()) {
    initMobilePillars();
    return;
  }

  /* ==========================================================================
     C. DESKTOP (>= 1024px): 120-FRAME CANVAS SCRUB & GSAP PIN ENGINE
     ========================================================================== */
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const TOTAL_FRAMES = 120;
  const loadedImages = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let isReady = false;
  let stInstance = null;

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

  // Hard safety timeout: never block longer than 400ms regardless of network
  setTimeout(() => dismissLoader(), 400);

  // Background fetch remaining frames only on desktop
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

  let currentFrameIndex = 0;
  let lastDrawnProgress = -1;

  function renderFrame(index, progress = 0) {
    if (!canvas || !ctx) return;

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

    // Desktop scale & positioning
    const targetScale = (canvasHeight * 0.82) / 720;
    const drawW = 1280 * targetScale;
    const drawH = 720 * targetScale;
    const baselineY = canvasHeight * 0.86;
    const drawY = baselineY - (633 * targetScale);

    const screenTargetX = canvasWidth * (0.24 + (progress * 0.58));
    const dancerCenterX = DANCER_CENTERS[index] || 540;
    const drawX = screenTargetX - (dancerCenterX * targetScale);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    lastDrawnProgress = progress;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    renderFrame(currentFrameIndex, currentProgress);
  }

  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // Only refresh if horizontal viewport width actually shifted (orientation or desktop resize)
    if (Math.abs(window.innerWidth - lastWidth) > 30) {
      lastWidth = window.innerWidth;
      if (isMobileViewport()) {
        if (stInstance) {
          stInstance.kill();
          stInstance = null;
        }
        initMobilePillars();
      } else {
        ScrollTrigger.refresh();
        resizeCanvas();
      }
    }
  }, { passive: true });

  let targetProgress = 0;
  let currentProgress = 0;
  let activePillarIndex = 0;
  let rafId = null;
  let isSectionVisible = false;

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

    const hasPendingWork = Math.abs(targetProgress - currentProgress) > 0.0004;
    if (!document.hidden && (hasPendingWork || isSectionVisible)) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null;
    }
  }

  function resumeLoopIfNeeded() {
    if (isReady && isSectionVisible && !document.hidden && !rafId) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function forceResumeLoop() {
    if (isReady && !document.hidden && !rafId) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function pauseLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function setupScrollScrub() {
    const viewport = section.querySelector('.pillars-sticky-viewport');
    if (!viewport) return;

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

    stInstance = ScrollTrigger.create({
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
        forceResumeLoop();
      }
    });

    segmentDots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        if (stInstance && isFinite(stInstance.start) && isFinite(stInstance.end)) {
          const targetP = (idx + 0.12) / 4;
          const targetScroll = stInstance.start + targetP * (stInstance.end - stInstance.start);
          if (isFinite(targetScroll)) {
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          }
        } else {
          setActiveTabPillar(idx);
        }
      });
    });

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

    updatePillarsUI(0);
    renderFrame(0, 0);
  }
}
