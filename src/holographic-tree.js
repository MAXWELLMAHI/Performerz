/**
 * holographic-tree.js
 * Procedural bioluminescent holographic tree schematic for Performerz Academy.
 * Maps:
 *  - Upper Canopy: Brand Philosophy (WE ARE / WE DO)
 *  - Lower Trunk & Roots: Five Pillars of Motion
 * Interactive features:
 *  - Dynamic SVG leader lines from tree nodes to floating data cards
 *  - Synchronized hover glow between cards, lines, and tree filaments
 *  - Scroll entrance reveal with stroke-dashoffset drawing
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Node Anchor Coordinates in SVG coordinate space (1000 x 1480) ─────────────
const NODE_COORDINATES = [
  // Canopy Philosophy Nodes (1 to 5)
  { id: 'node-canopy-1', x: 370, y: 170, cardClass: 'card-canopy-1', color: 'cyan' },
  { id: 'node-canopy-2', x: 630, y: 150, cardClass: 'card-canopy-2', color: 'cyan' },
  { id: 'node-canopy-3', x: 330, y: 320, cardClass: 'card-canopy-3', color: 'violet' },
  { id: 'node-canopy-4', x: 670, y: 300, cardClass: 'card-canopy-4', color: 'cyan' },
  { id: 'node-canopy-5', x: 420, y: 470, cardClass: 'card-canopy-5', color: 'violet' },

  // Trunk & Root Pillars Nodes (6 to 10)
  { id: 'node-pillar-1', x: 530, y: 640, cardClass: 'card-pillar-1', color: 'amber' },
  { id: 'node-pillar-2', x: 470, y: 800, cardClass: 'card-pillar-2', color: 'amber' },
  { id: 'node-pillar-3', x: 540, y: 900, cardClass: 'card-pillar-3', color: 'neon' },
  { id: 'node-pillar-4', x: 360, y: 1100, cardClass: 'card-pillar-4', color: 'amber' },
  { id: 'node-pillar-5', x: 640, y: 1160, cardClass: 'card-pillar-5', color: 'amber' },
];

export function initHolographicTree() {
  const section = document.querySelector('.holographic-tree-section');
  const container = document.querySelector('.holo-diagram-container');
  const svg = document.querySelector('.holo-tree-svg');
  const leaderGroup = document.getElementById('holo-leader-lines');
  if (!section || !container || !svg || !leaderGroup) return;

  const cards = Array.from(document.querySelectorAll('.holo-data-card'));
  const nodes = Array.from(document.querySelectorAll('.holo-tree-node'));

  // ── Calculate and Draw Leader Lines ───────────────────────────────────────
  function updateLeaderLines() {
    if (window.innerWidth < 768) {
      leaderGroup.innerHTML = '';
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const svgWidth = 1000;
    const svgHeight = 1480;

    // Clear existing dynamic lines
    leaderGroup.innerHTML = '';

    NODE_COORDINATES.forEach((item) => {
      const cardEl = document.querySelector(`.${item.cardClass}`);
      if (!cardEl) return;

      const cardRect = cardEl.getBoundingClientRect();

      // Convert card anchor position into SVG space
      // For cards on the right of the center trunk (x > 500), connect to card's left edge
      // For cards on the left of the center trunk, connect to card's right edge
      const isRightCard = (cardRect.left - containerRect.left) > (containerRect.width / 2);
      const cardAnchorX_dom = isRightCard ? cardRect.left : cardRect.right;
      const cardAnchorY_dom = cardRect.top + (cardRect.height / 2);

      // Scale DOM pixels into SVG coordinate system (1000 x 1480)
      const scaleX = svgWidth / containerRect.width;
      const scaleY = svgHeight / containerRect.height;

      const targetX = (cardAnchorX_dom - containerRect.left) * scaleX;
      const targetY = (cardAnchorY_dom - containerRect.top) * scaleY;

      // Draw technical angled schematic leader line
      // From node (item.x, item.y) -> corner bend -> target (targetX, targetY)
      const midX = isRightCard ? targetX - 35 : targetX + 35;

      const pathData = `M ${item.x} ${item.y} L ${midX} ${targetY} L ${targetX} ${targetY}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('class', `holo-leader-line ${item.color === 'cyan' ? 'line-cyan' : ''}`);
      path.setAttribute('id', `line-${item.id}`);

      // Small anchor terminal ring on the card edge
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', targetX);
      circle.setAttribute('cy', targetY);
      circle.setAttribute('r', '2.5');
      circle.setAttribute('fill', item.color === 'cyan' ? 'var(--studio-cyan)' : 'var(--studio-amber)');
      circle.setAttribute('opacity', '0.7');

      leaderGroup.appendChild(path);
      leaderGroup.appendChild(circle);
    });
  }

  // Initial draw after layout stabilization
  requestAnimationFrame(() => {
    updateLeaderLines();
  });

  // Debounced resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateLeaderLines, 80);
  }, { passive: true });

  // ── Synchronized Hover Effects ────────────────────────────────────────────
  cards.forEach((card) => {
    const cardClass = Array.from(card.classList).find(c => c.startsWith('card-'));
    if (!cardClass) return;

    const matched = NODE_COORDINATES.find(n => n.cardClass === cardClass);
    if (!matched) return;

    const nodeEl = document.getElementById(matched.id);

    card.addEventListener('mouseenter', () => {
      card.classList.add('active');
      nodeEl?.classList.add('active');
      const lineEl = document.getElementById(`line-${matched.id}`);
      if (lineEl) {
        lineEl.classList.add(matched.color === 'cyan' ? 'active-cyan' : 'active');
      }
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('active');
      nodeEl?.classList.remove('active');
      const lineEl = document.getElementById(`line-${matched.id}`);
      if (lineEl) {
        lineEl.classList.remove('active', 'active-cyan');
      }
    });
  });

  // Hover on SVG Nodes highlights corresponding Card
  nodes.forEach((node) => {
    const nodeId = node.getAttribute('id');
    const matched = NODE_COORDINATES.find(n => n.id === nodeId);
    if (!matched) return;

    const cardEl = document.querySelector(`.${matched.cardClass}`);

    node.addEventListener('mouseenter', () => {
      node.classList.add('active');
      cardEl?.classList.add('active');
      const lineEl = document.getElementById(`line-${matched.id}`);
      if (lineEl) {
        lineEl.classList.add(matched.color === 'cyan' ? 'active-cyan' : 'active');
      }
    });

    node.addEventListener('mouseleave', () => {
      node.classList.remove('active');
      cardEl?.classList.remove('active');
      const lineEl = document.getElementById(`line-${matched.id}`);
      if (lineEl) {
        lineEl.classList.remove('active', 'active-cyan');
      }
    });

    // Mobile click / tap scroll into view
    node.addEventListener('click', () => {
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardEl.classList.add('active');
        setTimeout(() => cardEl.classList.remove('active'), 2500);
      }
    });
  });

  // ── Entrance Animation with ScrollTrigger ──────────────────────────────────
  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    once: true,
    onEnter() {
      // 1. Fade in the SVG tree structure
      gsap.fromTo(
        '.holo-filament',
        { opacity: 0.1, strokeDashoffset: 100 },
        { opacity: 1, strokeDashoffset: 0, duration: 1.4, stagger: 0.05, ease: 'power2.out' }
      );

      // 2. Pop in the glowing tree nodes
      gsap.fromTo(
        '.holo-tree-node',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.4, ease: 'back.out(2)' }
      );

      // 3. Draw on the leader lines
      gsap.fromTo(
        '.holo-leader-line',
        { opacity: 0 },
        { opacity: 0.5, duration: 0.8, delay: 0.7, stagger: 0.05, ease: 'power2.out' }
      );

      // 4. Cascade floating data cards
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.6, stagger: 0.09, ease: 'power3.out' }
      );
    }
  });
}
