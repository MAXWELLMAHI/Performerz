/**
 * movement-line.js — v2.5
 *
 * Features:
 *  1. Synced WE ARE / WE DO reveal via single shared trigger progress variable (triggered at p = 0.1).
 *  2. Compact hero section (~60-70vh).
 *  3. 7 Horizontal Stroke Philosophy Cards with interactive dancing stroke animations.
 *  4. Horizontal rail smooth scrolling (prev/next buttons + drag-to-scroll).
 *  5. Card expansion drawer ("Read More ↗" & close "✕").
 *  6. Horizontal filmstrip for pillars with single pin and hard scroll budget (~130vh).
 *  7. Mobile fallback (<768px).
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMovementLine() {
  const section = document.querySelector('.movement-line-section');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. COMPACT HERO + SYNCED WE ARE / WE DO REVEAL
     ========================================================================== */
  const heroBlock = document.querySelector('.movement-hero-compact');
  const heroLinePath = document.querySelector('#hero-line-path');
  const wordLeft = document.querySelector('#word-we-are');
  const wordRight = document.querySelector('#word-we-do');
  const heroBg = document.querySelector('.movement-hero-bg');

  if (heroBlock && heroLinePath && wordLeft && wordRight) {
    if (prefersReducedMotion) {
      wordLeft.style.clipPath = 'none';
      wordRight.style.clipPath = 'none';
      wordLeft.style.opacity = '1';
      wordRight.style.opacity = '1';
    } else {
      const pathLength = heroLinePath.getTotalLength ? heroLinePath.getTotalLength() : 600;
      heroLinePath.style.strokeDasharray = pathLength;
      heroLinePath.style.strokeDashoffset = pathLength;

      ScrollTrigger.create({
        trigger: heroBlock,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 0.5,
        onUpdate(self) {
          const p = self.progress; // 0 to 1 through hero block

          // 1. Line draws on its own progress mapping (0 to 0.6)
          const lineP = gsap.utils.clamp(0, 1, p / 0.6);
          heroLinePath.style.strokeDashoffset = pathLength * (1 - lineP);

          // 2. SHARED REVEAL PROGRESS: At progress 0.1, BOTH reveals trigger simultaneously
          const revealProgress = gsap.utils.clamp(0, 1, (p - 0.1) / 0.35);

          const clipPct = (1 - revealProgress) * 100;
          wordLeft.style.clipPath = `inset(0 ${clipPct.toFixed(1)}% 0 0)`;
          wordRight.style.clipPath = `inset(0 0 0 ${clipPct.toFixed(1)}%)`;

          const op = revealProgress > 0.05 ? 1 : 0.1 + (revealProgress * 0.9);
          wordLeft.style.opacity = op.toFixed(2);
          wordRight.style.opacity = op.toFixed(2);

          if (heroBg) {
            heroBg.style.transform = `translate3d(0, ${(p * 35).toFixed(1)}px, 0)`;
          }
        }
      });
    }
  }

  /* ==========================================================================
     2. THE SEVEN KINETIC BEATS — PINNED HORIZONTAL SCROLL SCRUB
     - Pins the section when it reaches the top of the viewport
     - Vertical user scroll drives horizontal movement of the 7 beat cards
     - Unpins ONLY once all 7 beats have fully traversed the screen
     ========================================================================== */
  const philSection = document.querySelector('.philosophy-horizontal-section');
  const strokeRail = document.querySelector('#philosophy-stroke-rail');
  const trackWrap = document.querySelector('.philosophy-stroke-track-wrap');
  const prevBtn = document.querySelector('#phil-prev-btn');
  const nextBtn = document.querySelector('#phil-next-btn');
  const strokeCards = Array.from(document.querySelectorAll('.stroke-philosophy-card'));
  const progressFill = document.querySelector('#phil-progress-fill');
  const counterEl = document.querySelector('#phil-beat-counter');

  if (philSection && strokeRail && trackWrap && strokeCards.length > 0) {
    const isMobile = () => window.innerWidth < 768;

    const getScrollDistance = () => {
      const railWidth = strokeRail.scrollWidth;
      const wrapWidth = trackWrap.clientWidth || window.innerWidth;
      const extraPad = Math.min(80, window.innerWidth * 0.06);
      return Math.max(0, railWidth - wrapWidth + extraPad);
    };

    let horizontalTrigger = null;

    const setupHorizontalScroll = () => {
      if (horizontalTrigger) {
        horizontalTrigger.kill();
        horizontalTrigger = null;
      }

      if (!prefersReducedMotion && !isMobile()) {
        // Desktop: Pinned horizontal GSAP scrub animation
        const horizontalTween = gsap.to(strokeRail, {
          x: () => -getScrollDistance(),
          ease: 'none',
        });

        horizontalTrigger = ScrollTrigger.create({
          id: 'kineticBeatsHorizontalScroll',
          trigger: philSection,
          start: 'top top',
          end: () => `+=${Math.max(1200, getScrollDistance() * 1.15)}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.8,
          animation: horizontalTween,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const p = self.progress;
            if (progressFill) {
              progressFill.style.width = `${(p * 100).toFixed(1)}%`;
            }
            if (counterEl) {
              const currentBeat = Math.min(Math.floor(p * strokeCards.length) + 1, strokeCards.length);
              counterEl.textContent = `0${currentBeat} / 0${strokeCards.length}`;
            }
          },
        });
      } else {
        // Mobile / Reduced Motion: reset transform and rely on native touch scroll
        gsap.set(strokeRail, { clearProps: 'transform,x' });
      }
    };

    setupHorizontalScroll();

    // Mobile touch scroll tracking for progress bar and counter
    strokeRail.addEventListener('scroll', () => {
      if (!isMobile()) return;
      const maxScroll = strokeRail.scrollWidth - strokeRail.clientWidth;
      if (maxScroll <= 0) return;
      const current = strokeRail.scrollLeft;
      const p = Math.min(1, Math.max(0, current / maxScroll));
      if (progressFill) {
        progressFill.style.width = `${(p * 100).toFixed(1)}%`;
      }
      if (counterEl) {
        const currentBeat = Math.min(Math.floor(p * strokeCards.length) + 1, strokeCards.length);
        counterEl.textContent = `0${currentBeat} / 0${strokeCards.length}`;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      setupHorizontalScroll();
      ScrollTrigger.refresh();
    }, { passive: true });

    // Arrow navigation
    const getStepDistance = () => {
      if (!horizontalTrigger) return 300;
      const scrollRange = horizontalTrigger.end - horizontalTrigger.start;
      return scrollRange / (strokeCards.length - 1);
    };

    prevBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (horizontalTrigger && !isMobile()) {
        const step = getStepDistance();
        window.scrollBy({ top: -step, behavior: 'smooth' });
      } else {
        strokeRail.scrollBy({ left: -300, behavior: 'smooth' });
      }
    });

    nextBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (horizontalTrigger && !isMobile()) {
        const step = getStepDistance();
        window.scrollBy({ top: step, behavior: 'smooth' });
      } else {
        strokeRail.scrollBy({ left: 300, behavior: 'smooth' });
      }
    });

    // Card Expansion & Interactive Dance Activation
    strokeCards.forEach((card) => {
      const readMoreBtn = card.querySelector('.card-readmore-btn');
      const closeBtn = card.querySelector('.expanded-drawer-close');

      // Open expansion drawer
      readMoreBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        strokeCards.forEach(c => {
          if (c !== card) c.classList.remove('is-expanded');
        });
        card.classList.add('is-expanded');
      });

      // Close expansion drawer
      closeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('is-expanded');
      });

      // Tap on card triggers dancing stroke pulse
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-readmore-btn') || e.target.closest('.expanded-drawer-close') || e.target.closest('.expanded-drawer-cta')) return;
        card.classList.toggle('is-active');
      });
    });
  }
}

