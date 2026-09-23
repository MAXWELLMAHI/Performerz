import './style.css';
import './coaches-orbit.css';
import './holographic-tree.css';
import './movement-line.css';
import './pillars-canvas.css';
import Swiper from 'swiper';
import { EffectCoverflow, Mousewheel, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { initCoachesOrbit } from './coaches-orbit.js';
import { initHolographicTree } from './holographic-tree.js';
import { initMovementLine } from './movement-line.js';
import { initPillarsCanvas } from './pillars-canvas.js';

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. STICKY NAVBAR & ROUTE HIGHLIGHTING
     ========================================================================== */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  const navLinks = document.querySelectorAll('.nav-link, .drawer-link');
  const updateActiveLink = () => {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPage = href.split("/").pop();
      
      if ((page === "" || page === "index.html") && (linkPage === "" || linkPage === "index.html" || linkPage === "/")) {
        link.classList.add('active');
      } else if (page !== "" && page !== "index.html" && linkPage === page) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };
  updateActiveLink();

  /* ==========================================================================
     2. MOBILE DRAWER NAVIGATION
     ========================================================================== */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerClose = document.querySelector('.drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  menuToggle?.addEventListener('click', () => mobileDrawer?.classList.add('open'));
  drawerClose?.addEventListener('click', () => mobileDrawer?.classList.remove('open'));
  drawerLinks.forEach(link => link.addEventListener('click', () => mobileDrawer?.classList.remove('open')));

  /* ==========================================================================
     3. 3D COVERFLOW SWIPER REEL CAROUSEL (TOP 10 INSTAGRAM REELS)
        • Optimized on-demand buffering: active + adjacent slides preload
        • Light initial page render without freezing network thread
     ========================================================================== */
  const swiperElement = document.querySelector('.swiper-top-reels');
  if (swiperElement) {

    const getAllReelVideos = () => Array.from(swiperElement.querySelectorAll('video'));

    const pauseAllReels = () => {
      getAllReelVideos().forEach(v => { if (!v.paused) v.pause(); });
    };

    const playActiveReel = () => {
      const activeSlide = swiperElement.querySelector('.swiper-slide-active');
      if (!activeSlide) return;
      const video = activeSlide.querySelector('video');
      if (!video) return;
      video.preload = 'auto';
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          // Unlock on first user gesture (browser autoplay policy)
          const unlock = () => {
            video.play().catch(() => {});
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('scroll', unlock);
          };
          document.addEventListener('click', unlock, { once: true, passive: true });
          document.addEventListener('touchstart', unlock, { once: true, passive: true });
          document.addEventListener('scroll', unlock, { once: true, passive: true });
        });
      }

      // Preload adjacent slides on demand for seamless swipe
      const nextSlide = swiperElement.querySelector('.swiper-slide-next');
      const prevSlide = swiperElement.querySelector('.swiper-slide-prev');
      const nextVideo = nextSlide?.querySelector('video');
      const prevVideo = prevSlide?.querySelector('video');
      if (nextVideo && nextVideo.preload !== 'auto') { nextVideo.preload = 'auto'; }
      if (prevVideo && prevVideo.preload !== 'auto') { prevVideo.preload = 'auto'; }
    };

    const updateReelPlayback = () => {
      pauseAllReels();
      playActiveReel();
    };

    // ── Init Swiper ────────────────────────────────────────────────────────
    const swiper = new Swiper('.swiper-top-reels', {
      modules: [EffectCoverflow, Navigation],
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      initialSlide: 4,
      loop: true,
      speed: 550,
      coverflowEffect: {
        rotate: 12,
        stretch: 0,
        depth: 120,
        modifier: 1,
        scale: 0.9,
        slideShadows: false,
      },
      navigation: {
        nextEl: '.reels-swiper-next',
        prevEl: '.reels-swiper-prev',
      },
      on: {
        init() {
          requestAnimationFrame(() => setTimeout(updateReelPlayback, 80));
        },
      },
    });

    swiper.on('slideChange', updateReelPlayback);
    swiper.on('touchEnd', updateReelPlayback);
    swiper.on('transitionEnd', updateReelPlayback);

    window.addEventListener('load', updateReelPlayback, { once: true });
  }

  /* ==========================================================================
     4. INTERACTIVE MUSIC BEAT WIDGET & SOUND SYNTHESIS (Step Up Club)
     ========================================================================== */
  const audioBtn = document.getElementById('audio-play-btn');
  const eqBars = document.querySelectorAll('.eq-bar, .dock-eq-bar');
  const dockThumb = document.getElementById('dock-track-thumb');
  const tryPassBtn = document.querySelectorAll('.btn-try-pill, .btn-claim-pass, .dock-pill-link');
  let audioContext = null;
  let isPlaying = false;
  let soundInterval = null;

  const playSynthesizedChoreoBeats = () => {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Melodic arpeggio simulation (A minor 7th)
      const notes = [220, 261.63, 329.63, 392, 440, 523.25];
      let step = 0;

      soundInterval = setInterval(() => {
        if (!isPlaying || !audioContext) return;
        const now = audioContext.currentTime;

        // Sub 808 Kick on every 4th beat
        if (step % 4 === 0) {
          const kickOsc = audioContext.createOscillator();
          const kickGain = audioContext.createGain();
          kickOsc.frequency.setValueAtTime(150, now);
          kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.15);
          kickGain.gain.setValueAtTime(0.35, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          kickOsc.connect(kickGain);
          kickGain.connect(audioContext.destination);
          kickOsc.start(now);
          kickOsc.stop(now + 0.26);
        }

        // Melodic synth pluck
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[step % notes.length], now);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.33);

        step++;
      }, 220);
    } catch (err) {
      console.warn('Audio playback note:', err);
    }
  };

  const stopSynthesizedChoreoBeats = () => {
    if (soundInterval) {
      clearInterval(soundInterval);
      soundInterval = null;
    }
  };

  audioBtn?.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      audioBtn.innerHTML = '❚❚';
      audioBtn.setAttribute('title', 'Pause Beat');
      dockThumb?.classList.add('playing');
      eqBars.forEach(bar => {
        bar.style.animationPlayState = 'running';
      });
      playSynthesizedChoreoBeats();
    } else {
      audioBtn.innerHTML = '▶';
      audioBtn.setAttribute('title', 'Play Beat Preview');
      dockThumb?.classList.remove('playing');
      eqBars.forEach(bar => {
        bar.style.animationPlayState = 'paused';
      });
      stopSynthesizedChoreoBeats();
    }
  });

  tryPassBtn.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = document.getElementById('contact');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        const nameInput = document.getElementById('demo-name') || document.querySelector('.subscribe-input');
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 350);
        }
      }
    });
  });

  /* ==========================================================================
     STORYTELLING PARALLAX SCROLL ENGINE & NARRATIVE PROGRESS TRACKER
     ========================================================================== */
  const heroVideo = document.getElementById('hero-bg-video');
  const storyPips = document.querySelectorAll('.story-pip');
  const storySections = [
    'overture',
    'marquee',
    'about',
    'pillars',
    'social-reels',
    'disciplines',
    'coaches',
    'honors',
    'stage',
    'contact'
  ].map(id => document.getElementById(id)).filter(Boolean);

  // Smooth click scroll on story pips
  storyPips.forEach(pip => {
    pip.addEventListener('click', (e) => {
      const targetId = pip.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Story scroll listener with 60fps requestAnimationFrame
  let isTicking = false;
  const onScrollParallax = () => {
    const scrollY = window.scrollY;

    // 1. Hero background video cinematic zoom & parallax pan
    if (heroVideo && scrollY < window.innerHeight * 1.5) {
      const scale = 1.05 + scrollY * 0.0003;
      const translateY = scrollY * 0.32;
      heroVideo.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    }

    // 2. Story rail chapter tracking (ScrollSpy)
    if (storySections.length > 0) {
      const scrollPos = scrollY + window.innerHeight * 0.42;
      let currentSectionId = storySections[0].id;

      for (let i = 0; i < storySections.length; i++) {
        const sec = storySections[i];
        if (sec.offsetTop <= scrollPos) {
          currentSectionId = sec.id;
        }
      }

      storyPips.forEach(pip => {
        if (pip.getAttribute('data-target') === currentSectionId) {
          pip.classList.add('active');
        } else {
          pip.classList.remove('active');
        }
      });
    }

    isTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(onScrollParallax);
      isTicking = true;
    }
  }, { passive: true });

  /* ==========================================================================
     5. INTERACTIVE STAGE GEL SPOTLIGHT ON COACHES (Step Up Club)
     ========================================================================== */
  const coachCards = document.querySelectorAll('.coach-card-deluxe');
  coachCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--spotlight-x', `${x}%`);
      card.style.setProperty('--spotlight-y', `${y}%`);
    });
  });

  /* ==========================================================================
     6. INTERACTIVE TROPHIES ACCORDION EXPANSION (Mint & Marble)
     ========================================================================== */
  const trophyPills = document.querySelectorAll('.trophy-pill');
  trophyPills.forEach(pill => {
    pill.addEventListener('mouseenter', () => {
      trophyPills.forEach(p => p.style.zIndex = '1');
      pill.style.zIndex = '12';
    });
  });

  /* ==========================================================================
     7. 3D PERSPECTIVE CARD TILT WITH SPECULAR CURSOR SHINE (Desktop)
     ========================================================================== */
  if (window.matchMedia('(pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll(
      '.coach-card-deluxe, .discipline-card-deluxe, .pillar-card-deluxe, .music-beat-widget, .stat-item-deluxe, .manifesto-editorial-card'
    );

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (-(y - centerY) / centerY * 6).toFixed(2);
        const rotateY = ((x - centerX) / centerX * 6).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  /* ==========================================================================
     8. AMBIENT STAGE CURSOR GLOW (DESKTOP)
     ========================================================================== */
  const cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let active = false;

    const animateGlow = () => {
      glowX += (mouseX - glowX) * 0.09;
      glowY += (mouseY - glowY) * 0.09;
      cursorGlow.style.left = `${glowX.toFixed(1)}px`;
      cursorGlow.style.top = `${glowY.toFixed(1)}px`;
      requestAnimationFrame(animateGlow);
    };
    requestAnimationFrame(animateGlow);

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!active) {
        active = true;
        cursorGlow.style.opacity = '1';
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
      active = false;
    });
  }

  /* ==========================================================================
     9. SCROLL REVEAL OBSERVER
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.06,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================================
     10. TESTIMONIAL SLIDER CAROUSEL
     ========================================================================== */
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentSlide = 0;
  let slideTimer;

  const showSlide = (idx) => {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (slides[idx]) slides[idx].classList.add('active');
    if (dots[idx]) dots[idx].classList.add('active');
    currentSlide = idx;
  };

  const nextSlide = () => {
    showSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  if (slides.length > 0) {
    slideTimer = setInterval(nextSlide, 7000);
    prevBtn?.addEventListener('click', () => {
      prevSlide();
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 7000);
    });
    nextBtn?.addEventListener('click', () => {
      nextSlide();
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 7000);
    });
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 7000);
      });
    });
  }

  /* ==========================================================================
     11. DEMO CLASS WHATSAPP BOOKING & NEWSLETTER INTERACTIONS
     ========================================================================== */
  const demoBookingForm = document.getElementById('demo-booking-form');
  demoBookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('demo-name')?.value.trim() || '';
    const contact = document.getElementById('demo-contact')?.value.trim() || '';
    const discipline = document.getElementById('demo-discipline')?.value.trim() || '';
    const message = document.getElementById('demo-message')?.value.trim() || '';
    const submitBtn = demoBookingForm.querySelector('.demo-submit-btn');

    const formattedMessage = `Hello The Performerz Academy!\nI would like to book a demo class.\n\n✦ Name: ${name}\n✦ Contact: ${contact}\n✦ Preferred Discipline: ${discipline}\n✦ Message: ${message || 'I would like to schedule a demo class trial.'}`;
    const whatsappUrl = `https://wa.me/918169729704?text=${encodeURIComponent(formattedMessage)}`;

    if (submitBtn) {
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Opening WhatsApp... ✦</span>';
      submitBtn.style.background = '#22bf5b';
      submitBtn.style.color = '#ffffff';

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
      }, 400);
    } else {
      window.open(whatsappUrl, '_blank');
    }
  });

  const form = document.getElementById('newsletter-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.subscribe-input');
    const submitBtn = form.querySelector('.subscribe-btn');
    if (!submitBtn || !input) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribed! ✦';
    submitBtn.style.background = '#e4ff54';
    submitBtn.style.color = '#000000';
    input.value = '';

    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '';
      submitBtn.style.color = '';
    }, 3500);
  });

  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* ==========================================================================
     12. INTERACTIVE COACHES ORBITAL CAROUSEL (GSAP SCROLLTRIGGER)
     ========================================================================== */
  initCoachesOrbit();

  /* ==========================================================================
     13. HOLOGRAPHIC BIOLUMINESCENT TREE SECTION (DATA-NODE SCHEMATIC)
     ========================================================================== */
  initHolographicTree();

  /* ==========================================================================
     14. THE MOVEMENT LINE — SCROLL-DRIVEN PHILOSOPHY & PILLARS SECTION
     ========================================================================== */
  initMovementLine();

  /* ==========================================================================
     15. OUR FOUR PILLARS OF MOTION — PINNED CANVAS SCRUB ENGINE
     ========================================================================== */
  initPillarsCanvas();

  /* ==========================================================================
     16. STUDENT REVIEWS & ESSAYS MODAL ENGINE
     ========================================================================== */
  const modalBackdrop = document.getElementById('review-modal-backdrop');
  const modalCloseBtn = document.getElementById('review-modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalAuthor = document.getElementById('modal-author');
  const modalBody = document.getElementById('modal-body');

  const openReviewModal = (triggerEl) => {
    if (!modalBackdrop) return;
    const cat = triggerEl.getAttribute('data-modal-category') || 'STUDENT REFLECTION';
    const title = triggerEl.getAttribute('data-modal-title') || '';
    const author = triggerEl.getAttribute('data-modal-author') || '';
    const imgUrl = triggerEl.getAttribute('data-modal-img') || '';
    const contentId = triggerEl.getAttribute('data-modal-content-id');

    if (modalCategory) modalCategory.textContent = cat;
    if (modalTitle) modalTitle.textContent = title;
    if (modalAuthor) modalAuthor.textContent = author;

    if (modalImg) {
      if (imgUrl) {
        modalImg.src = imgUrl;
        modalImg.style.display = 'block';
      } else {
        modalImg.style.display = 'none';
        modalImg.src = '';
      }
    }

    if (modalBody && contentId) {
      const sourceEl = document.getElementById(contentId);
      if (sourceEl) {
        modalBody.innerHTML = sourceEl.innerHTML;
      }
    }

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeReviewModal = () => {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-open-review-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openReviewModal(trigger);
    });
  });

  modalCloseBtn?.addEventListener('click', closeReviewModal);

  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeReviewModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('active')) {
      closeReviewModal();
    }
  });
});

