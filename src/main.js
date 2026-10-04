import './style.css';
import './coaches-orbit.css';
import './holographic-tree.css';
import './movement-line.css';
import './pillars-canvas.css';
import Swiper from 'swiper';
import { EffectCoverflow, Mousewheel, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCoachesOrbit } from './coaches-orbit.js';
import { initHolographicTree } from './holographic-tree.js';
import { initMovementLine } from './movement-line.js';
import { initPillarsCanvas } from './pillars-canvas.js';

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     0. HAUTE PRELOADER CALIBRATION & REVEAL
     ========================================================================== */
  const preloader = document.getElementById('site-preloader');
  if (preloader) {
    const bar = document.getElementById('preloader-bar');
    const counter = document.getElementById('preloader-counter');
    let progress = 0;
    
    const updateProgress = () => {
      progress += Math.floor(Math.random() * 18) + 12;
      if (progress > 100) progress = 100;
      if (bar) bar.style.width = `${progress}%`;
      if (counter) counter.textContent = `${String(progress).padStart(2, '0')}%`;
      
      if (progress < 100) {
        setTimeout(updateProgress, 50);
      } else {
        setTimeout(() => {
          preloader.classList.add('loaded');
          setTimeout(() => {
            try { preloader.remove(); } catch (_) {}
          }, 850);
        }, 200);
      }
    };
    
    updateProgress();
    
    window.addEventListener('load', () => {
      if (bar) bar.style.width = '100%';
      if (counter) counter.textContent = '100%';
      setTimeout(() => {
        preloader?.classList.add('loaded');
      }, 180);
    }, { once: true });
  }

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
  let drawerBackdrop = document.querySelector('.mobile-drawer-backdrop');

  if (!drawerBackdrop && mobileDrawer) {
    drawerBackdrop = document.createElement('div');
    drawerBackdrop.className = 'mobile-drawer-backdrop';
    document.body.appendChild(drawerBackdrop);
  }

  const openDrawer = () => {
    mobileDrawer?.classList.add('open');
    drawerBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    openDrawer();
  });
  drawerClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDrawer();
  });
  drawerBackdrop?.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

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
     4. INTERACTIVE CLASSICAL BALLET & OPERA MUSIC (Ponchielli: La Gioconda)
     ========================================================================== */
  const audioBtn = document.getElementById('audio-play-btn');
  const eqBars = document.querySelectorAll('.eq-bar, .dock-eq-bar');
  const dockThumb = document.getElementById('dock-track-thumb');
  const tryPassBtn = document.querySelectorAll('.btn-try-pill, .btn-claim-pass, .dock-pill-link');

  let isPlaying = false;
  let hasUserStopped = false; // Tracks if user manually clicked pause/stop

  // Original Grand Symphonic Orchestra recording (Ponchielli: La Gioconda - Danza delle Ore)
  const balletAudio = new Audio();
  balletAudio.src = '/dance_of_the_hours_lso.mp3';
  balletAudio.preload = 'auto';
  balletAudio.loop = true;
  balletAudio.volume = 0.7;

  // The iconic Allegro Vivacissimo Galop hook starts at 6:42 (402s)
  const BALLET_HOOK_START = 402;
  let hasCuedHook = false;

  const updateAudioUI = (playing) => {
    isPlaying = playing;
    if (audioBtn) {
      audioBtn.innerHTML = playing ? '❚❚' : '▶';
      audioBtn.setAttribute('title', playing ? 'Pause Ballet Music' : 'Play Ballet Theme (Ponchielli: Danza delle Ore)');
      audioBtn.setAttribute('aria-label', playing ? 'Pause Ballet Music' : 'Play Ballet Music');
    }
    if (dockThumb) {
      if (playing) {
        dockThumb.classList.add('playing');
      } else {
        dockThumb.classList.remove('playing');
      }
    }
    eqBars.forEach(bar => {
      bar.style.animationPlayState = playing ? 'running' : 'paused';
    });
  };

  const playBalletMusic = async () => {
    try {
      if (!hasCuedHook && balletAudio.currentTime < 10) {
        balletAudio.currentTime = BALLET_HOOK_START;
        hasCuedHook = true;
      }
      await balletAudio.play();
      updateAudioUI(true);
    } catch (err) {
      // Browser autoplay policy requires user gesture before playing unmuted sound
      updateAudioUI(false);
    }
  };

  const pauseBalletMusic = () => {
    try {
      balletAudio.pause();
    } catch (_) {}
    updateAudioUI(false);
  };

  // Toggle button click
  audioBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isPlaying) {
      hasUserStopped = true;
      pauseBalletMusic();
    } else {
      hasUserStopped = false;
      playBalletMusic();
    }
  });

  // Attempt initial playback on load, with smart gesture fallback for browser autoplay policies
  const initBalletAutoplay = () => {
    // 1. Immediate play attempt
    playBalletMusic();

    // 2. Browser autoplay fallback: activate on very first user interaction
    const onFirstUserGesture = () => {
      if (!isPlaying && !hasUserStopped) {
        playBalletMusic();
      }
      cleanupGestureListeners();
    };

    const gestureEvents = ['pointerdown', 'touchstart', 'scroll', 'keydown'];
    const cleanupGestureListeners = () => {
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, onFirstUserGesture, { passive: true });
      });
    };

    gestureEvents.forEach(evt => {
      window.addEventListener(evt, onFirstUserGesture, { passive: true, once: true });
    });
  };

  initBalletAutoplay();

  // Resource & battery conservation: pause on tab background / page unload
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying) {
      pauseBalletMusic();
    }
  });

  window.addEventListener('pagehide', () => {
    pauseBalletMusic();
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
  const heroVideoMobile = document.getElementById('hero-bg-video-mobile');
  [heroVideo, heroVideoMobile].forEach(v => {
    if (v) v.play().catch(() => {});
  });
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

    // 1. Hero background video cinematic zoom & parallax pan (Desktop only)
    if (heroVideo && scrollY < window.innerHeight * 1.5) {
      if (window.innerWidth >= 768) {
        const scale = 1.05 + scrollY * 0.0003;
        const translateY = scrollY * 0.32;
        heroVideo.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      } else {
        heroVideo.style.transform = 'none';
      }
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
  const sanitizeText = (str, maxLen = 200) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, maxLen);
  };

  const demoBookingForm = document.getElementById('demo-booking-form');
  demoBookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawName = document.getElementById('demo-name')?.value || '';
    const rawContact = document.getElementById('demo-contact')?.value || '';
    const rawDiscipline = document.getElementById('demo-discipline')?.value || '';
    const rawMessage = document.getElementById('demo-message')?.value || '';
    const submitBtn = demoBookingForm.querySelector('.demo-submit-btn');

    // Strict validation & defensive length bounding (mitigates URI buffer overflow / injection)
    const name = sanitizeText(rawName, 80);
    const contact = sanitizeText(rawContact, 40);
    const discipline = sanitizeText(rawDiscipline, 60);
    const message = sanitizeText(rawMessage, 600);

    if (!name || !contact) return;

    const formattedMessage = `Hello The Performerz Academy!\nI would like to book a demo class.\n\n✦ Name: ${name}\n✦ Contact: ${contact}\n✦ Preferred Discipline: ${discipline}\n✦ Message: ${message || 'I would like to schedule a demo class trial.'}`;
    const whatsappUrl = `https://wa.me/918169729704?text=${encodeURIComponent(formattedMessage)}`;

    if (submitBtn) {
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Opening WhatsApp... ✦</span>';
      submitBtn.style.background = '#22bf5b';
      submitBtn.style.color = '#ffffff';

      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
      }, 350);
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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

  // Secure Delegated Click Handler for Instagram Reels (replaces inline onclick)
  document.querySelectorAll('.reel-coverflow-slide').forEach(slide => {
    slide.addEventListener('click', () => {
      const reelUrl = slide.getAttribute('data-reel-url');
      if (reelUrl && reelUrl.startsWith('https://www.instagram.com/reel/')) {
        window.open(reelUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });

  document.querySelectorAll('#year, .current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

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

  // Recalibrate trigger positions once layout settles
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);

  window.addEventListener('load', () => {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  }, { once: true });

  /* ==========================================================================
     16. STUDENT REVIEWS & ESSAYS MODAL ENGINE (Strict Whitelist & Safe Sanitization)
     ========================================================================== */
  const modalBackdrop = document.getElementById('review-modal-backdrop');
  const modalCloseBtn = document.getElementById('review-modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalAuthor = document.getElementById('modal-author');
  const modalBody = document.getElementById('modal-body');

  const ALLOWED_CONTENT_IDS = new Set([
    'content-zoey',
    'content-myra',
    'content-bosky',
    'content-sanvika',
    'content-minakshi',
    'content-anushka'
  ]);

  const openReviewModal = (triggerEl) => {
    if (!modalBackdrop) return;
    const cat = sanitizeText(triggerEl.getAttribute('data-modal-category') || 'STUDENT REFLECTION', 50);
    const title = sanitizeText(triggerEl.getAttribute('data-modal-title') || '', 100);
    const author = sanitizeText(triggerEl.getAttribute('data-modal-author') || '', 60);
    const rawImgUrl = triggerEl.getAttribute('data-modal-img') || '';
    const contentId = triggerEl.getAttribute('data-modal-content-id');

    if (modalCategory) modalCategory.textContent = cat;
    if (modalTitle) modalTitle.textContent = title;
    if (modalAuthor) modalAuthor.textContent = author;

    // Secure Image URL validation (prevents javascript: protocol injection)
    if (modalImg) {
      if (rawImgUrl && (rawImgUrl.startsWith('/') || rawImgUrl.startsWith('https://'))) {
        modalImg.src = rawImgUrl;
        modalImg.style.display = 'block';
      } else {
        modalImg.style.display = 'none';
        modalImg.removeAttribute('src');
      }
    }

    // Strict Whitelist Validation before DOM population
    if (modalBody) {
      modalBody.innerHTML = '';
      if (contentId && ALLOWED_CONTENT_IDS.has(contentId)) {
        const sourceEl = document.getElementById(contentId);
        if (sourceEl) {
          modalBody.innerHTML = sourceEl.innerHTML;
        }
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

  /* ==========================================================================
     12. POLICY TABLE OF CONTENTS SCROLLSPY
     ========================================================================== */
  const tocLinks = document.querySelectorAll('.policy-toc-link');
  if (tocLinks.length > 0) {
    const policySections = document.querySelectorAll('.policy-section-block');
    const updateTocSpy = () => {
      const scrollPos = window.scrollY + 160;
      policySections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
          tocLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    };
    window.addEventListener('scroll', updateTocSpy, { passive: true });
    updateTocSpy();
  }

  /* ==========================================================================
     13. GLOBAL COOKIE CONSENT BANNER & PREFERENCES MODAL
     ========================================================================== */
  const COOKIE_STORAGE_KEY = 'performerz_cookie_consent';

  const getSavedCookiePreferences = () => {
    try {
      const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  };

  const saveCookiePreferences = (prefs) => {
    try {
      const payload = {
        essential: true,
        performance: !!prefs.performance,
        analytics: !!prefs.analytics,
        marketing: !!prefs.marketing,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(payload));
      return payload;
    } catch (e) {
      console.warn('Cookie preferences could not be stored in localStorage:', e);
      return prefs;
    }
  };

  // Create & Inject Banner & Modal if not present in DOM
  const injectCookieUI = () => {
    if (document.getElementById('cookie-consent-banner')) return;

    // Banner HTML
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-banner-content-grid">
        <div class="cookie-banner-text-wrap">
          <div class="cookie-banner-tag">
            <span>✦</span> ATELIER PRIVACY &bull; COOKIE DIRECTIVE
          </div>
          <div class="cookie-banner-title">We value your privacy and digital motion experience</div>
          <p class="cookie-banner-desc">
            We use essential cookies and performance caching to calibrate high-fidelity 60fps video reels and provide instant WhatsApp admissions booking. Learn more in our 
            <a href="/privacy-policy.html">Privacy Policy</a> and <a href="/cookie-policy.html">Cookie Policy</a>.
          </p>
        </div>
        <div class="cookie-banner-actions">
          <button type="button" class="cookie-btn cookie-btn-link" id="cookie-customize-btn">Customize</button>
          <button type="button" class="cookie-btn cookie-btn-secondary" id="cookie-reject-btn">Essential Only</button>
          <button type="button" class="cookie-btn cookie-btn-primary" id="cookie-accept-all-btn">Accept All</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // Modal HTML
    const modal = document.createElement('div');
    modal.id = 'cookie-preferences-modal';
    modal.className = 'cookie-modal-backdrop';
    modal.innerHTML = `
      <div class="cookie-modal-card" role="dialog" aria-labelledby="cookie-modal-heading" aria-modal="true">
        <div class="cookie-modal-header">
          <div>
            <h3 class="cookie-modal-title" id="cookie-modal-heading">Cookie Preferences</h3>
            <p class="cookie-modal-subtitle">Manage how The Performerz Academy utilizes tracking technologies.</p>
          </div>
          <button type="button" class="cookie-modal-close" id="cookie-modal-close-btn" aria-label="Close Modal">&times;</button>
        </div>
        <div class="cookie-modal-body">
          <div class="cookie-pref-card">
            <div class="cookie-pref-info">
              <div class="cookie-pref-title">
                <span>Strictly Necessary</span>
                <span class="cookie-badge-always">Required</span>
              </div>
              <p class="cookie-pref-desc">
                Vital for site navigation, asset preloader calibration, and system security. Cannot be disabled.
              </p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" checked disabled />
              <span class="cookie-slider"></span>
            </label>
          </div>

          <div class="cookie-pref-card">
            <div class="cookie-pref-info">
              <div class="cookie-pref-title">
                <span>Performance &amp; 60fps Video Buffer</span>
              </div>
              <p class="cookie-pref-desc">
                Caches high-resolution choreography video frames and audio ambience states for smooth playback.
              </p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" id="modal-pref-performance" checked />
              <span class="cookie-slider"></span>
            </label>
          </div>

          <div class="cookie-pref-card">
            <div class="cookie-pref-info">
              <div class="cookie-pref-title">
                <span>Analytics &amp; Experience Metrics</span>
              </div>
              <p class="cookie-pref-desc">
                Helps us evaluate curriculum popularity and optimize atelier navigation anonymously.
              </p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" id="modal-pref-analytics" checked />
              <span class="cookie-slider"></span>
            </label>
          </div>

          <div class="cookie-pref-card">
            <div class="cookie-pref-info">
              <div class="cookie-pref-title">
                <span>Social Media &amp; Reels Embedding</span>
              </div>
              <p class="cookie-pref-desc">
                Allows embedded Instagram showcase reels and seamless WhatsApp direct consultation.
              </p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" id="modal-pref-marketing" checked />
              <span class="cookie-slider"></span>
            </label>
          </div>
        </div>
        <div class="cookie-modal-footer">
          <button type="button" class="btn btn-outline" id="modal-reject-all-btn" style="padding: 10px 20px; font-size: 11px;">Essential Only</button>
          <button type="button" class="btn btn-amber" id="modal-save-prefs-btn" style="padding: 10px 24px; font-size: 11px;">Save Preferences</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  injectCookieUI();

  const cookieBanner = document.getElementById('cookie-consent-banner');
  const cookieModal = document.getElementById('cookie-preferences-modal');
  const modalPerformanceCheckbox = document.getElementById('modal-pref-performance');
  const modalAnalyticsCheckbox = document.getElementById('modal-pref-analytics');
  const modalMarketingCheckbox = document.getElementById('modal-pref-marketing');

  const pagePerfCheckbox = document.getElementById('pref-performance-page');
  const pageAnalyticsCheckbox = document.getElementById('pref-analytics-page');
  const pageMarketingCheckbox = document.getElementById('pref-marketing-page');

  const syncCheckboxes = (prefs) => {
    const p = prefs || { performance: true, analytics: true, marketing: true };
    if (modalPerformanceCheckbox) modalPerformanceCheckbox.checked = p.performance !== false;
    if (modalAnalyticsCheckbox) modalAnalyticsCheckbox.checked = p.analytics !== false;
    if (modalMarketingCheckbox) modalMarketingCheckbox.checked = p.marketing !== false;

    if (pagePerfCheckbox) pagePerfCheckbox.checked = p.performance !== false;
    if (pageAnalyticsCheckbox) pageAnalyticsCheckbox.checked = p.analytics !== false;
    if (pageMarketingCheckbox) pageMarketingCheckbox.checked = p.marketing !== false;
  };

  const existingPrefs = getSavedCookiePreferences();
  if (existingPrefs) {
    syncCheckboxes(existingPrefs);
  } else {
    // Show banner after brief cinematic delay
    setTimeout(() => {
      cookieBanner?.classList.add('active');
    }, 1200);
  }

  const openPreferencesModal = () => {
    const current = getSavedCookiePreferences() || { performance: true, analytics: true, marketing: true };
    syncCheckboxes(current);
    cookieModal?.classList.add('active');
  };

  const closePreferencesModal = () => {
    cookieModal?.classList.remove('active');
  };

  // Banner Actions
  document.getElementById('cookie-accept-all-btn')?.addEventListener('click', () => {
    saveCookiePreferences({ performance: true, analytics: true, marketing: true });
    cookieBanner?.classList.remove('active');
    syncCheckboxes({ performance: true, analytics: true, marketing: true });
  });

  document.getElementById('cookie-reject-btn')?.addEventListener('click', () => {
    saveCookiePreferences({ performance: false, analytics: false, marketing: false });
    cookieBanner?.classList.remove('active');
    syncCheckboxes({ performance: false, analytics: false, marketing: false });
  });

  document.getElementById('cookie-customize-btn')?.addEventListener('click', () => {
    cookieBanner?.classList.remove('active');
    openPreferencesModal();
  });

  // Modal Actions
  document.getElementById('cookie-modal-close-btn')?.addEventListener('click', closePreferencesModal);
  
  cookieModal?.addEventListener('click', (e) => {
    if (e.target === cookieModal) closePreferencesModal();
  });

  document.getElementById('modal-save-prefs-btn')?.addEventListener('click', () => {
    const prefs = {
      performance: modalPerformanceCheckbox?.checked ?? true,
      analytics: modalAnalyticsCheckbox?.checked ?? true,
      marketing: modalMarketingCheckbox?.checked ?? true
    };
    saveCookiePreferences(prefs);
    syncCheckboxes(prefs);
    closePreferencesModal();
    cookieBanner?.classList.remove('active');
  });

  document.getElementById('modal-reject-all-btn')?.addEventListener('click', () => {
    const prefs = { performance: false, analytics: false, marketing: false };
    saveCookiePreferences(prefs);
    syncCheckboxes(prefs);
    closePreferencesModal();
    cookieBanner?.classList.remove('active');
  });

  // Global triggers for opening cookie settings
  document.querySelectorAll('#open-cookie-settings-btn, [data-open-cookie-settings]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openPreferencesModal();
    });
  });

  // In-Page Cookie Policy Interactive Controls
  const savePagePrefsBtn = document.getElementById('save-page-preferences-btn');
  const acceptAllPageBtn = document.getElementById('accept-all-page-btn');
  const prefStatusMsg = document.getElementById('pref-status-message');

  savePagePrefsBtn?.addEventListener('click', () => {
    const prefs = {
      performance: pagePerfCheckbox?.checked ?? true,
      analytics: pageAnalyticsCheckbox?.checked ?? true,
      marketing: pageMarketingCheckbox?.checked ?? true
    };
    saveCookiePreferences(prefs);
    syncCheckboxes(prefs);
    if (prefStatusMsg) {
      prefStatusMsg.style.display = 'block';
      setTimeout(() => { prefStatusMsg.style.display = 'none'; }, 4000);
    }
  });

  acceptAllPageBtn?.addEventListener('click', () => {
    const prefs = { performance: true, analytics: true, marketing: true };
    saveCookiePreferences(prefs);
    syncCheckboxes(prefs);
    if (prefStatusMsg) {
      prefStatusMsg.textContent = '✓ All cookies have been accepted and preferences saved!';
      prefStatusMsg.style.display = 'block';
      setTimeout(() => { prefStatusMsg.style.display = 'none'; }, 4000);
    }
  });
});


