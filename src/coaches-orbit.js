/**
 * coaches-orbit.js
 * Interactive dual-orbital coaches stage driven by GSAP ScrollTrigger.
 * Inspired by Art Circles:
 *  - Left circular orbit: Faculty mentors
 *  - Right circular orbit: Dance disciplines
 *  - Center: Unified cohesive tripartite focal card ([Portrait] [Info] [Action Photo])
 *  - Vertical scroll drives dual circular orbit rotation & smooth crossfades
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Coach & Discipline Data ───────────────────────────────────────────────────
const COACHES = [
  {
    name: 'Nansi Shahri',
    discipline: 'Ballet & Contemporary Teacher | Certified ARBTA',
    bio: 'Certified ARBTA Teacher with dance training since 2015. Scholarship at the National Ballet Academy, New York (2024) and full scholarship at Ballet Manila, Philippines (2025). Focuses on building strong foundations in technique, discipline, and artistic expression for children, while empowering adults to step outside their comfort zones.',
    years: '10+ Yrs',
    students: 'Certified ARBTA',
    portrait: '/coach_nansi.jpg',
    danceImg: '/dance_contemporary.jpg',
    index: '01',
  },
  {
    name: 'Sohil Hussain Shaikh',
    discipline: 'Aerial Silk Faculty | National Gold Medalist',
    bio: 'National-level Aerial Silk Gold Medalist and Mallakhamb athlete with over 5 years of teaching experience. Sohil brings exceptional strength, flexibility, balance, and body awareness to his classes, focusing on strong fundamentals, physical conditioning, and safety.',
    years: '5+ Yrs',
    students: 'Gold Medalist',
    portrait: '/coach_sohil.jpg',
    danceImg: 'https://framerusercontent.com/images/RHd0yaLWnnyK7yve0hM2pjBlYuM.jpg',
    index: '02',
  },
  {
    name: 'Poonam Sharma',
    discipline: 'Gymnastics, Mallakhamb & Aerial Arts',
    bio: 'State-Level Gymnastics athlete and National-Level Mallakhamb & Aerial Arts player and performer. Poonam brings competitive experience and a deep understanding of movement, flexibility, and discipline to create an encouraging environment where students build confidence and skill.',
    years: 'National',
    students: 'Multi-Sport',
    portrait: '/coach_poonam.jpg',
    danceImg: '/dance_gymnastics.jpg',
    index: '03',
  },
  {
    name: 'Ganesh Pawar',
    discipline: 'Acrobatics Gymnast | Asian Championship Rep',
    bio: 'Represented India in the 13th Acrobatics Gymnastics Asian Championship and 38th National Games silver medalist. With participation in 3 National Championships, Ganesh trains performers in dynamic acrobatics, partner balance, and power tumbling.',
    years: 'Team India',
    students: 'National Silver',
    portrait: '/coach_ganesh.jpg',
    danceImg: '/dance_acrobatics.jpg',
    index: '04',
  },
];

// Base spacing: 4 nodes evenly spaced 90° apart
const BASE_ANGLES = [0, 90, 180, 270];

// Node styles by distance from active
const NODE_STYLES = [
  { scale: 1.18, opacity: 1,    blur: 0 },   // active (0 away)
  { scale: 0.85, opacity: 0.65, blur: 0 },   // 1 away
  { scale: 0.68, opacity: 0.35, blur: 1.5 }, // 2 away (opposite)
  { scale: 0.85, opacity: 0.65, blur: 0 },   // 3 away (adjacent other side)
];

const THUMB_BASE_SIZE = 50; // px

export function initCoachesOrbit() {
  const wrapperSection = document.querySelector('.coaches-orbit-wrapper');
  const stage = document.getElementById('coaches-orbit-stage');
  const focalCard = document.getElementById('coaches-focal-card');
  if (!wrapperSection || !stage || !focalCard) return;

  const leftNodes    = Array.from(document.querySelectorAll('.coaches-orbit-left .orbit-node'));
  const rightNodes   = Array.from(document.querySelectorAll('.coaches-orbit-right .orbit-node'));
  const svgLeft      = document.getElementById('orbit-svg-left');
  const svgRight     = document.getElementById('orbit-svg-right');

  const portraitImg  = document.getElementById('coach-portrait-img');
  const danceformImg = document.getElementById('coach-danceform-img');
  const nameEl       = document.getElementById('coach-name');
  const discEl       = document.getElementById('coach-discipline');
  const bioEl        = document.getElementById('coach-bio');
  const yearsEl      = document.getElementById('coach-years');
  const studentsEl   = document.getElementById('coach-students');
  const indexEl      = document.getElementById('coach-index-label');
  const danceLabel   = document.getElementById('coach-danceform-label');
  const dots         = Array.from(document.querySelectorAll('.coach-dot'));

  if (!portraitImg || !danceformImg) return;

  let currentIndex = 0;
  let currentAngle = 0;
  const totalRotation = 360;

  // ── Calculate dual circle geometry ─────────────────────────────────────────
  function getOrbitGeometry() {
    const sw = stage.offsetWidth;
    const sh = stage.offsetHeight;
    if (sw <= 0 || sh <= 0) return null;

    const cardRect = focalCard.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const cardLeftRel = cardRect.left - stageRect.left;
    const cardRightRel = cardRect.right - stageRect.left;
    const cardCenterY = (cardRect.top - stageRect.top) + (cardRect.height / 2);

    // Left circle: centered between left screen edge and left edge of card
    const leftMargin = Math.max(30, cardLeftRel);
    const cx_left = Math.max(80, leftMargin / 2);
    const cy_left = cardCenterY;
    const r_left = Math.min(220, Math.max(100, (leftMargin * 0.46)));

    // Right circle: centered between right edge of card and right screen edge
    const rightMargin = Math.max(30, sw - cardRightRel);
    const cx_right = Math.min(sw - 80, cardRightRel + (rightMargin / 2));
    const cy_right = cardCenterY;
    const r_right = Math.min(220, Math.max(100, (rightMargin * 0.46)));

    return { sw, sh, cx_left, cy_left, r_left, cx_right, cy_right, r_right };
  }

  // ── Position both sets of orbital nodes ────────────────────────────────────
  function updateOrbitPositions(activeIdx, rotDeg) {
    const geo = getOrbitGeometry();
    if (!geo) return;

    const { cx_left, cy_left, r_left, cx_right, cy_right, r_right } = geo;

    // Update SVG guide paths dynamically
    if (svgLeft) {
      svgLeft.setAttribute('cx', cx_left.toFixed(1));
      svgLeft.setAttribute('cy', cy_left.toFixed(1));
      svgLeft.setAttribute('r', r_left.toFixed(1));
    }
    if (svgRight) {
      svgRight.setAttribute('cx', cx_right.toFixed(1));
      svgRight.setAttribute('cy', cy_right.toFixed(1));
      svgRight.setAttribute('r', r_right.toFixed(1));
    }

    // 1. Position Left Orbit Nodes (Coaches)
    // In left circle, 0° points right (directly towards focal card)
    leftNodes.forEach((node, i) => {
      const angleDeg = BASE_ANGLES[i] + rotDeg;
      const rad = (angleDeg * Math.PI) / 180;
      const x = cx_left + r_left * Math.cos(rad);
      const y = cy_left + r_left * Math.sin(rad);

      const relIdx = (i - activeIdx + COACHES.length) % COACHES.length;
      const style = NODE_STYLES[Math.min(relIdx, NODE_STYLES.length - 1)];
      const scaled = THUMB_BASE_SIZE * style.scale;
      const offset = scaled / 2;

      gsap.set(node, {
        left: x - offset,
        top: y - offset,
        scale: style.scale,
        opacity: style.opacity,
        filter: style.blur > 0 ? `blur(${style.blur}px)` : 'none',
        zIndex: Math.round(style.opacity * 10),
      });

      node.classList.toggle('orbit-active', relIdx === 0);
    });

    // 2. Position Right Orbit Nodes (Dance Disciplines)
    // In right circle, 180° points left (directly towards focal card)
    rightNodes.forEach((node, i) => {
      const angleDeg = BASE_ANGLES[i] + rotDeg + 180;
      const rad = (angleDeg * Math.PI) / 180;
      const x = cx_right + r_right * Math.cos(rad);
      const y = cy_right + r_right * Math.sin(rad);

      const relIdx = (i - activeIdx + COACHES.length) % COACHES.length;
      const style = NODE_STYLES[Math.min(relIdx, NODE_STYLES.length - 1)];
      const scaled = THUMB_BASE_SIZE * style.scale;
      const offset = scaled / 2;

      gsap.set(node, {
        left: x - offset,
        top: y - offset,
        scale: style.scale,
        opacity: style.opacity,
        filter: style.blur > 0 ? `blur(${style.blur}px)` : 'none',
        zIndex: Math.round(style.opacity * 10),
      });

      node.classList.toggle('orbit-active', relIdx === 0);
    });
  }

  // ── Smooth crossfade to coach ─────────────────────────────────────────────
  function transitionToCoach(idx, direction = 1) {
    if (idx === currentIndex) return;
    currentIndex = idx;
    const c = COACHES[idx];

    // Update dots
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));

    // Crossfade center info
    const infoInner = document.getElementById('coach-info-inner');
    if (infoInner) {
      gsap.to(infoInner, {
        opacity: 0,
        y: direction > 0 ? -8 : 8,
        duration: 0.20,
        ease: 'power2.in',
        onComplete: () => {
          if (nameEl) nameEl.textContent = c.name;
          if (discEl) discEl.textContent = c.discipline;
          if (bioEl) bioEl.textContent = c.bio;
          if (yearsEl) yearsEl.textContent = c.years;
          if (studentsEl) studentsEl.textContent = c.students;
          if (indexEl) indexEl.textContent = c.index;
          if (danceLabel) danceLabel.textContent = c.discipline;
          gsap.to(infoInner, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
        }
      });
    }

    // Crossfade Left Coach Portrait
    const portraitWrapper = document.getElementById('coaches-portrait-frame');
    if (portraitWrapper) {
      gsap.to(portraitWrapper, {
        opacity: 0.2,
        scale: 0.98,
        duration: 0.22,
        ease: 'power1.in',
        onComplete: () => {
          portraitImg.src = c.portrait;
          portraitImg.alt = c.name;
          gsap.to(portraitWrapper, { opacity: 1, scale: 1, duration: 0.38, ease: 'power2.out' });
        }
      });
    }

    // Crossfade Right Dance Action Photo
    const danceWrapper = document.getElementById('coaches-danceform-frame');
    if (danceWrapper) {
      gsap.to(danceWrapper, {
        opacity: 0.2,
        scale: 0.98,
        duration: 0.22,
        ease: 'power1.in',
        onComplete: () => {
          danceformImg.src = c.danceImg;
          danceformImg.alt = c.discipline;
          gsap.to(danceWrapper, { opacity: 1, scale: 1, duration: 0.38, ease: 'power2.out' });
        }
      });
    }

    updateOrbitPositions(idx, currentAngle);
  }

  // ── Initial position ──────────────────────────────────────────────────────
  // Allow DOM to layout first
  requestAnimationFrame(() => {
    updateOrbitPositions(0, 0);
  });

  window.addEventListener('resize', () => {
    updateOrbitPositions(currentIndex, currentAngle);
  }, { passive: true });

  // ── Interactive Navigation ──────────────────────────────────────────────────
  function selectCoach(targetIdx) {
    if (targetIdx < 0 || targetIdx >= COACHES.length) return;
    const direction = targetIdx >= currentIndex ? 1 : -1;
    currentAngle = -targetIdx * 90;
    transitionToCoach(targetIdx, direction);
  }

  // Clicks on Left Orbit (Coaches)
  leftNodes.forEach((node) => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(node.getAttribute('data-index') || '0', 10);
      selectCoach(idx);
    });
  });

  // Clicks on Right Orbit (Disciplines)
  rightNodes.forEach((node) => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(node.getAttribute('data-index') || '0', 10);
      selectCoach(idx);
    });
  });

  // Clicks on Progress Dots
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      selectCoach(idx);
    });
  });

  // ── Auto-cycle when in view (pauses on mouse hover) ──────────────────────
  let autoTimer = null;
  let isHovered = false;

  const startAutoCycle = () => {
    if (autoTimer) return;
    autoTimer = setInterval(() => {
      if (!isHovered) {
        const nextIdx = (currentIndex + 1) % COACHES.length;
        selectCoach(nextIdx);
      }
    }, 4500);
  };

  const stopAutoCycle = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  wrapperSection.addEventListener('mouseenter', () => { isHovered = true; });
  wrapperSection.addEventListener('mouseleave', () => { isHovered = false; });

  let isSectionInView = false;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoCycle();
    } else if (isSectionInView && !isHovered) {
      startAutoCycle();
    }
  });

  // IntersectionObserver for entrance & auto-cycle activation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isSectionInView = entry.isIntersecting;
      if (isSectionInView) {
        if (!document.hidden) startAutoCycle();
        gsap.fromTo(focalCard,
          { opacity: 0, y: 30, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
        );
        gsap.fromTo('.coaches-headline',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        );
      } else {
        stopAutoCycle();
      }
    });
  }, { threshold: 0.2 });

  observer.observe(wrapperSection);
}
