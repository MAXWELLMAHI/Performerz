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
}


