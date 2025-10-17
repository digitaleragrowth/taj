
import React, { useState, useEffect, useRef, memo } from 'react';
import { createRoot } from 'react-dom/client';

declare const gsap: any;

// --- DATA & CONFIG ---

const servicesSubLinks = [
  { name: 'Architectural Design', href: 'architectural-design.html' },
  { name: 'Engineering Consultancy', href: 'engineering-consultancy.html' },
  { name: 'Project Management Consultancy', href: 'project-management.html' },
  { name: 'Sustainability & Energy', href: 'sustainability-energy.html' },
];

const navLinks = [
  { name: 'Home', href: '/index.html' },
  { name: 'About Us', href: 'about.html' },
  { name: 'Works/Projects', href: '#works' },
  { name: 'Services', href: '#our-services', subLinks: servicesSubLinks },
  { name: 'Blog', href: '#blog' },
  { name: 'Contact', href: 'contact.html' },
];


// --- SHARED & LAYOUT COMPONENTS ---

const OptimizedImage = ({ src, alt, width, height, className = '', lazy = true, sizes = '(max-width: 768px) 100vw, 50vw' }) => {
    if (!src) return null;

    const getSrcSet = (baseUrl) => {
        if (!baseUrl || !(baseUrl.includes('unsplash.com') || baseUrl.includes('pexels.com'))) {
            return undefined;
        }
        try {
            const url = new URL(baseUrl);
            const widths = [400, 600, 800, 1200, 1600];
            
            if (baseUrl.includes('unsplash.com')) {
                url.searchParams.delete('w');
                return widths.map(w => `${url.toString()}&w=${w} ${w}w`).join(', ');
            }
            if (baseUrl.includes('pexels.com')) {
                const cleanUrl = baseUrl.split('?')[0];
                return widths.map(w => `${cleanUrl}?auto=compress&cs=tinysrgb&fit=crop&w=${w} ${w}w`).join(', ');
            }
        } catch (e) {
            console.error("Invalid image URL for srcset:", baseUrl);
            return undefined;
        }
        return undefined;
    };

    const srcSet = getSrcSet(src);

    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
            className={className}
            srcSet={srcSet}
            sizes={srcSet ? sizes : undefined}
        />
    );
};

const MobileNav = ({ isOpen, onClose }) => {
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const navContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const focusableElements = navContainerRef.current?.querySelectorAll<HTMLElement>(
                'a[href], button, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusableElements || focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            setTimeout(() => firstElement.focus(), 100);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                    return;
                }
                if (e.key === 'Tab') {
                    if (e.shiftKey) { 
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else { 
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            };
            
            const container = navContainerRef.current;
            container?.addEventListener('keydown', handleKeyDown);
            return () => container?.removeEventListener('keydown', handleKeyDown);

        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, onClose]);

    const handleServicesToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsServicesOpen(prev => !prev);
    }
    
    return (
        <div ref={navContainerRef} className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!isOpen} id="mobile-nav">
            <button className="mobile-nav-close" onClick={onClose} aria-label="Close navigation menu">
                <i className="fas fa-times" aria-hidden="true"></i>
            </button>
            <nav className="mobile-nav">
                <ul>
                    {navLinks.map(link => (
                         <li key={link.name}>
                             <a 
                                href={link.subLinks ? '#' : link.href} 
                                onClick={(e) => {
                                    if (link.subLinks) {
                                        handleServicesToggle(e);
                                    } else {
                                        onClose();
                                    }
                                }}
                                aria-haspopup={!!link.subLinks}
                                aria-expanded={link.subLinks ? isServicesOpen : undefined}
                                aria-controls={link.subLinks ? `mobile-${link.name}-submenu` : undefined}
                                id={link.subLinks ? `mobile-${link.name}-toggle` : undefined}
                             >
                                 {link.name}
                                 {link.subLinks && <i className={`fas fa-chevron-down dropdown-indicator ${isServicesOpen ? 'open' : ''}`} aria-hidden="true"></i>}
                             </a>
                             {link.subLinks && (
                                 <ul id={`mobile-${link.name}-submenu`} className={`mobile-submenu ${isServicesOpen ? 'open' : ''}`} aria-hidden={!isServicesOpen}>
                                     {link.subLinks.map(subLink => (
                                         <li key={subLink.name}><a href={subLink.href} onClick={onClose}>{subLink.name}</a></li>
                                     ))}
                                 </ul>
                             )}
                         </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

const SkipToContentLink = () => (
    <a href="#main-content" className="skip-to-content-link">
        Skip to main content
    </a>
);

const Header = ({ theme }) => {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLUListElement>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  
  const burgerMenuRef = useRef<HTMLButtonElement>(null);
  const servicesToggleRef = useRef<HTMLAnchorElement>(null);
  const servicesDropdownContainerRef = useRef<HTMLLIElement>(null);

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
    burgerMenuRef.current?.focus();
  };

  const closeServicesDropdown = (shouldFocusToggle = true) => {
    if (isServicesDropdownOpen) {
      setIsServicesDropdownOpen(false);
      if (shouldFocusToggle) {
        servicesToggleRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    if (isServicesDropdownOpen) {
      const firstItem = servicesDropdownContainerRef.current?.querySelector<HTMLAnchorElement>('.dropdown-menu a');
      firstItem?.focus();
    }
  }, [isServicesDropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeServicesDropdown();
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesDropdownContainerRef.current && !servicesDropdownContainerRef.current.contains(event.target as Node)) {
        closeServicesDropdown(false);
      }
    };

    if (isServicesDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServicesDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const timer = setTimeout(() => navRef.current?.classList.add('animate-in'), 300);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timer);
    };
  }, []);

  const handleServicesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsServicesDropdownOpen(prev => !prev);
  };
  
  const handleDropdownItemKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    const items = Array.from(
      servicesDropdownContainerRef.current?.querySelectorAll<HTMLAnchorElement>('.dropdown-menu a') || []
    );
    const currentIndex = items.indexOf(e.currentTarget);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Tab' && !e.shiftKey && currentIndex === items.length - 1) {
      closeServicesDropdown(false);
    } else if (e.key === 'Tab' && e.shiftKey && currentIndex === 0) {
      closeServicesDropdown(false);
    }
  };

  const headerClasses = `app-header ${scrolled ? 'scrolled' : ''} on-${theme}`;

  return (
    <header className={headerClasses}>
      <div className="logo">
        <a href="/index.html" aria-label="Taj Design Consult - Homepage">
          <img src="/logo.png" alt="Taj Design Consult Logo" className="logo-image" />
        </a>
      </div>
      <nav className="main-nav" aria-label="Main navigation">
        <ul ref={navRef}>
          {navLinks.map((link) => (
            <li 
              key={link.name} 
              className={`${link.subLinks ? 'has-dropdown' : ''} ${link.name === 'Services' && isServicesDropdownOpen ? 'open' : ''}`}
              ref={link.name === 'Services' ? servicesDropdownContainerRef : null}
            >
              <a 
                href={link.href}
                ref={link.name === 'Services' ? servicesToggleRef : null}
                id={link.name === 'Services' ? 'services-menu-toggle' : undefined}
                onClick={link.name === 'Services' ? handleServicesClick : undefined}
                aria-haspopup={!!link.subLinks}
                aria-expanded={link.name === 'Services' ? isServicesDropdownOpen : undefined}
                aria-controls={link.name === 'Services' ? 'services-dropdown-menu' : undefined}
              >
                {link.name}
                {link.subLinks && <i className="fas fa-chevron-down dropdown-indicator" aria-hidden="true"></i>}
              </a>
              {link.subLinks && (
                <ul id="services-dropdown-menu" className="dropdown-menu" role="menu" aria-labelledby="services-menu-toggle">
                  {link.subLinks.map((subLink) => (
                    <li key={subLink.name} role="presentation">
                      <a href={subLink.href} role="menuitem" onKeyDown={handleDropdownItemKeyDown}>{subLink.name}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <button 
        ref={burgerMenuRef}
        className="burger-menu" 
        onClick={() => setIsMobileNavOpen(true)}
        aria-label="Open navigation menu"
        aria-controls="mobile-nav"
        aria-expanded={isMobileNavOpen}
      >
        <i className="fas fa-bars" aria-hidden="true"></i>
      </button>
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </header>
  );
};

const LeftSidebar = ({ pageName }) => {
  return (
    <aside className="left-sidebar">
      <div className="sidebar-top">
        <div className="divider" />
        <div className="home-text">{pageName}</div>
      </div>
      <div className="social-icons">
        <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" aria-hidden="true"></i></a>
        <a href="#" aria-label="Twitter"><i className="fab fa-twitter" aria-hidden="true"></i></a>
        <a href="#" aria-label="Instagram"><i className="fab fa-instagram" aria-hidden="true"></i></a>
        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in" aria-hidden="true"></i></a>
      </div>
      <div className="sidebar-footer">
        <p>© Taj Design Consult 2024. All rights reserved.</p>
      </div>
    </aside>
  );
};

const WaveAnimation = memo(() => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId: number;

        const waves = [
            { amp: 15, freq: 0.02, phase: 0, color: 'rgba(212, 175, 55, 0.2)', speed: 0.01 },
            { amp: 20, freq: 0.015, phase: 1, color: 'rgba(212, 175, 55, 0.3)', speed: 0.015 },
            { amp: 25, freq: 0.01, phase: 2, color: 'rgba(212, 175, 55, 0.4)', speed: 0.02 },
        ];
        
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            waves.forEach(wave => {
                wave.phase += wave.speed;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height);
                for (let x = 0; x < canvas.width; x++) {
                    const y = Math.sin(x * wave.freq + wave.phase) * wave.amp + (canvas.height / 1.5);
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();
                ctx.fillStyle = wave.color;
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(draw);
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} id="footer-wave-canvas" aria-hidden="true" />;
});

const Footer = () => {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer id="footer" className="app-footer scroll-trigger fade-up">
            <WaveAnimation />
            <div className="container">
                <div className="copyright-section">
                    <span>2024 © Taj Design Consult. All rights reserved.</span>
                    <button className="to-top" onClick={scrollToTop} aria-label="Scroll back to top">To Top ↑</button>
                </div>
            </div>
          </footer>
    )
}

const CustomCursor = memo(() => {
    const dotRef = useRef<HTMLDivElement>(null);
    const outlineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const dot = dotRef.current;
        const outline = outlineRef.current;
        if (!dot || !outline) return;

        gsap.set([dot, outline], { xPercent: -50, yPercent: -50 });

        const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
        const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
        const outlineX = gsap.quickTo(outline, "x", { duration: 0.25, ease: "power3" });
        const outlineY = gsap.quickTo(outline, "y", { duration: 0.25, ease: "power3" });

        const mouseMove = (e: MouseEvent) => {
            dotX(e.clientX);
            dotY(e.clientY);
            outlineX(e.clientX);
            outlineY(e.clientY);
        };
        
        const showCursor = () => {
            dot.classList.add('visible');
            outline.classList.add('visible');
        };
        const hideCursor = () => {
            dot.classList.remove('visible');
            outline.classList.remove('visible');
        };
        
        const handleMouseEnterHoverTarget = () => {
            dot.classList.add('cursor-hover');
            outline.classList.add('cursor-hover');
        };

        const handleMouseLeaveHoverTarget = () => {
            dot.classList.remove('cursor-hover');
            outline.classList.remove('cursor-hover');
        };
        
        window.addEventListener("mousemove", mouseMove);
        document.body.addEventListener("mouseleave", hideCursor);
        document.body.addEventListener("mouseenter", showCursor);

        const hoverTargets = document.querySelectorAll(
            'a, button, [role="button"], input, .testimonial-slide, .dot, .service-item, .process-item, .blog-item, .work-image, .lightbox-close, .job-item-header, .sector-item, .whatsapp-widget, select, textarea, label'
        );
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', handleMouseEnterHoverTarget);
            target.addEventListener('mouseleave', handleMouseLeaveHoverTarget);
        });

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            document.body.removeEventListener("mouseleave", hideCursor);
            document.body.removeEventListener("mouseenter", showCursor);
            hoverTargets.forEach(target => {
                target.removeEventListener('mouseenter', handleMouseEnterHoverTarget);
                target.removeEventListener('mouseleave', handleMouseLeaveHoverTarget);
            });
        };
    }, []);

    return (
        <>
            <div ref={outlineRef} className="custom-cursor-outline"></div>
            <div ref={dotRef} className="custom-cursor-dot"></div>
        </>
    );
});

const WhatsAppChatWidget = () => (
    <a
        href="https://wa.me/97477123400"
        className="whatsapp-widget"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
    >
        <div className="whatsapp-ring"></div>
        <div className="whatsapp-ring-delay"></div>
        <i className="fab fa-whatsapp whatsapp-icon" aria-hidden="true"></i>
    </a>
);

// --- HOME PAGE & COMPONENTS ---
const ParticleCanvas = memo(() => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const particleCount = 150;

        class Particle {
            x: number; y: number; vx: number; vy: number; radius: number; color: string; shadowBlur: number;
            constructor() {
                this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3;
                this.radius = Math.random() * 1.2 + 0.3;
                const alpha = Math.random() * 0.7 + 0.1;
                this.color = `rgba(212, 175, 55, ${alpha})`; this.shadowBlur = Math.random() * 8 + 4;
            }
            draw() {
                ctx.save(); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.shadowColor = 'rgba(212, 175, 55, 0.8)'; ctx.shadowBlur = this.shadowBlur;
                ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x > canvas.width + this.radius) this.x = -this.radius; else if (this.x < -this.radius) this.x = canvas.width + this.radius;
                if (this.y > canvas.height + this.radius) this.y = -this.radius; else if (this.y < -this.radius) this.y = canvas.height + this.radius;
                this.draw();
            }
        }
        
        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };
        const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => particle.update());
            animationFrameId = requestAnimationFrame(animate);
        };

        handleResize(); animate();
        window.addEventListener('resize', handleResize);
        return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
    }, []);

    return <canvas ref={canvasRef} id="particle-canvas" />;
});

const BlueprintAnimation = memo(() => {
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const paths = document.querySelectorAll('.blueprint-path');
        if (!paths.length) return;

        const tl = gsap.timeline();
        paths.forEach(path => {
            const length = (path as SVGPathElement).getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        });
        tl.to(paths, { strokeDashoffset: 0, duration: 4, ease: 'power1.inOut', stagger: 0.2, delay: 1.5 });
    }, []);

    return (
        <div className="blueprint-container" aria-hidden="true">
            <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
                <g>
                    <path className="blueprint-path" d="M 5,5 L 95,5 L 95,95 L 5,95 Z" />
                    <path className="blueprint-path" d="M 5,50 L 95,50" />
                    <path className="blueprint-path" d="M 50,5 L 50,95" />
                    <path className="blueprint-path" d="M 5,30 L 30,5" />
                    <path className="blueprint-path" d="M 70,5 L 95,30" />
                    <path className="blueprint-path" d="M 5,70 L 30,95" />
                    <path className="blueprint-path" d="M 70,95 L 95,70" />
                    <path className="blueprint-path" d="M 50,30 A 20,20 0 1,1 49.9,30.05" />
                    <path className="blueprint-path" d="M 50,30 L 50,15" />
                    <path className="blueprint-path" d="M 64.14,35.86 L 74.95,25.05" />
                    <path className="blueprint-path" d="M 70,50 L 85,50" />
                    <path className="blueprint-path" d="M 20,80 Q 35,70 50,80 T 80,80" />
                </g>
            </svg>
        </div>
    );
});

const HeroSection = () => {
    const [offsetY, setOffsetY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const titleLines = ["WE DESIGN", "STRUCTURES"];
    const fullTitle = titleLines.join(' ');

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const handleScroll = () => setOffsetY(window.pageYOffset);
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e; const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth) - 0.5; const y = (clientY / innerHeight) - 0.5;
            setMousePos({ x, y });
        };

        window.addEventListener('scroll', handleScroll); window.addEventListener('mousemove', handleMouseMove);
        return () => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('mousemove', handleMouseMove); };
    }, []);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            gsap.set('.letter', { opacity: 1 });
            return;
        }

        gsap.fromTo('.letter',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.05, delay: 0.8 }
        );
    }, []);

    const contentMouseParallax = 60;

    return (
        <section className="hero-section">
            <video autoPlay loop muted playsInline className="hero-video" src="https://videos.pexels.com/video-files/4120241/4120241-uhd_3840_2160_25fps.mp4" aria-hidden="true" />
            <BlueprintAnimation />
            <ParticleCanvas />
            <div className="hero-content" style={{
                transform: `translate(${mousePos.x * contentMouseParallax}px, ${(offsetY * 0.7) + (mousePos.y * contentMouseParallax)}px)`,
                opacity: Math.max(0, 1 - offsetY / (window.innerHeight * 0.8))
            }}>
                <h1 className="reveal-text" aria-label={fullTitle}>
                    {titleLines.map((line, lineIndex) => (
                        <div className="hero-title-line" key={lineIndex}>
                            {line.split('').map((char, index) => (
                                <span className="letter" key={`${char}-${index}`} aria-hidden="true">
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                        </div>
                    ))}
                </h1>
                <a href="#works" className="explore-btn">Explore Our Work</a>
            </div>
             <a href="#about" className="scroll-down-indicator" aria-label="Scroll down to about section">
                <i className="fas fa-arrow-down" aria-hidden="true"></i>
            </a>
        </section>
    );
};

const AnimatedCounter = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    if (prefersReducedMotion) { setCount(end); return; }
                    const stepTime = Math.abs(Math.floor(duration / end));
                    timerRef.current = setInterval(() => {
                        start += 1; setCount(start);
                        if (start === end) { if (timerRef.current) clearInterval(timerRef.current); }
                    }, stepTime);
                    observer.disconnect();
                }
            }, { threshold: 0.5 }
        );

        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); if (timerRef.current) clearInterval(timerRef.current); };
    }, [end, duration]);

    return <div ref={ref} className="num">{count}</div>;
};

const TestimonialsCarousel = ({ testimonials }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resetTimeout = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        resetTimeout();
        timeoutRef.current = setTimeout(() => setCurrentIndex((prev) => prev === testimonials.length - 1 ? 0 : prev + 1), 5000);
        return () => resetTimeout();
    }, [currentIndex, testimonials.length]);

    const goToPrev = () => setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
    const goToNext = () => setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
    const goToSlide = (slideIndex) => setCurrentIndex(slideIndex);

    return (
        <div className="testimonials-carousel" aria-roledescription="carousel" aria-label="Customer testimonials">
             <div className="sr-only" aria-live="polite" aria-atomic="true">
                Showing testimonial {currentIndex + 1} of {testimonials.length}
            </div>
            <div className="testimonials-wrapper">
                <div className="testimonials-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {testimonials.map((testimonial, index) => (
                        <div className="testimonial-slide" key={index} role="group" aria-roledescription="slide" aria-hidden={currentIndex !== index}>
                            <div className="testimonial-card">
                                <OptimizedImage 
                                    src={testimonial.image} 
                                    alt={testimonial.author} 
                                    className="testimonial-avatar" 
                                    width="80" 
                                    height="80"
                                    lazy={true}
                                />
                                <p className="testimonial-quote">"{testimonial.quote}"</p>
                                <span className="testimonial-author">{testimonial.author}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={goToPrev} className="carousel-btn prev" aria-label="Previous testimonial"><i className="fas fa-chevron-left" aria-hidden="true"></i></button>
            <button onClick={goToNext} className="carousel-btn next" aria-label="Next testimonial"><i className="fas fa-chevron-right" aria-hidden="true"></i></button>
            <div className="carousel-dots">
                {testimonials.map((_, slideIndex) => (
                    <div
                        key={slideIndex} role="button" tabIndex={0} aria-label={`Go to testimonial ${slideIndex + 1}`}
                        className={`dot ${currentIndex === slideIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(slideIndex)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { goToSlide(slideIndex); }}}
                    ></div>
                ))}
            </div>
        </div>
    );
};

const ClientsCarousel = () => {
    const [logosPerPage, setLogosPerPage] = useState(6);
    const [isPaused, setIsPaused] = useState(false);
    const clientLogos = [
        "https://amecdesign.com/wp-content/uploads/2024/01/rose-sweet.jpg", "https://amecdesign.com/wp-content/uploads/2024/01/papa-johns.jpg",
        "https://amecdesign.com/wp-content/uploads/2024/01/madi.jpg", "https://amecdesign.com/wp-content/uploads/2024/01/Loydence.jpg",
        "https://amecdesign.com/wp-content/uploads/2024/01/holiday-villa.jpeg", "https://amecdesign.com/wp-content/uploads/2024/01/dipndip.jpg",
        "https://amecdesign.com/wp-content/uploads/2024/01/almana.jpg", "https://amecdesign.com/wp-content/uploads/2024/01/Adwar.jpg",
        "https://amecdesign.com/wp-content/uploads/2024/01/AAC.jpg", "https://amecdesign.com/wp-content/uploads/2024/01/Macdonald2.jpg",
        "https://amecdesign.com/wp-content/uploads/2024/01/mavi-bonjuk2.jpg", "https://amecdesign.com/wp-content/uploads/2024/01/talabat2.jpg"
    ];
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 576) setLogosPerPage(3);
            else if (window.innerWidth <= 992) setLogosPerPage(4);
            else setLogosPerPage(6);
        };
        handleResize(); window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const totalPages = logosPerPage > 0 ? Math.ceil(clientLogos.length / logosPerPage) : 0;
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => { setCurrentPage(0); }, [totalPages]);
    
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || totalPages <= 1) return;
        const timer = setInterval(() => { if (!isPaused) setCurrentPage(prev => (prev + 1) % totalPages); }, 3000);
        return () => clearInterval(timer);
    }, [totalPages, isPaused]);

    const transformValue = `translateX(-${currentPage * 100}%)`;
    const logoPages = [];
    if (logosPerPage > 0) {
        for (let i = 0; i < clientLogos.length; i += logosPerPage) {
            logoPages.push(clientLogos.slice(i, i + logosPerPage));
        }
    }

    const getClientNameFromUrl = (url: string) => {
        try {
            const fileName = url.substring(url.lastIndexOf('/') + 1);
            const namePart = fileName.split('.')[0]; const name = namePart.replace(/\d+$/, '');
            return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } catch (e) { return `Client logo`; }
    };

    return (
        <div className="clients-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)}>
            <button className="clients-carousel-pause-btn" onClick={() => setIsPaused(p => !p)} aria-label={isPaused ? "Play clients carousel" : "Pause clients carousel"}>
              <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`} aria-hidden="true"></i>
            </button>
            <div className="clients-carousel-wrapper">
                <div className="clients-track" style={{ width: `${totalPages * 100}%`, transform: transformValue }}>
                    {logoPages.map((page, pageIndex) => (
                        <div className="clients-grid" key={pageIndex}>
                             {page.map((logo, logoIndex) => (
                                <div key={logoIndex} className="client-logo">
                                    <img src={logo} alt={`${getClientNameFromUrl(logo)} Logo`} loading="lazy" decoding="async" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Lightbox = ({ image, onClose }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const lastFocusedElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (image) {
            lastFocusedElement.current = document.activeElement as HTMLElement;
            setTimeout(() => { contentRef.current?.focus(); }, 100);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
                else if (e.key === 'Tab') {
                    const focusableElements = contentRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (!focusableElements || focusableElements.length === 0) return;
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    if (e.shiftKey) { if (document.activeElement === firstElement) { lastElement.focus(); e.preventDefault(); }}
                    else { if (document.activeElement === lastElement) { firstElement.focus(); e.preventDefault(); }}
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => { document.removeEventListener('keydown', handleKeyDown); lastFocusedElement.current?.focus(); };
        }
    }, [image, onClose]);

    if (!image) return null;

    return (
        <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${image.title} - Project image viewer`}>
            <div ref={contentRef} className="lightbox-content" onClick={(e) => e.stopPropagation()} tabIndex={-1}>
                <img src={image.src} alt={image.title} className="lightbox-image" />
                <button onClick={onClose} className="lightbox-close" aria-label="Close image viewer">&times;</button>
            </div>
        </div>
    );
};

const SectionDivider = () => (
    <div className="section-divider-wrapper">
        <div className="section-divider" />
    </div>
);

const useSmoothScroll = () => {
    useEffect(() => {
        const scrollToTarget = (targetId: string, smooth: boolean) => {
            // Use a timeout to ensure that any layout shifts or animations have completed
            setTimeout(() => {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const header = document.querySelector<HTMLElement>('.app-header');
                    const headerOffset = header ? header.offsetHeight + 10 : 90;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: smooth ? 'smooth' : 'auto'
                    });
                }
            }, 100);
        };

        const handleAnchorClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a');
            
            // Check for same-page hash links
            if (anchor && anchor.hash && new URL(anchor.href).pathname === window.location.pathname) {
                const targetId = anchor.hash.substring(1);

                if (targetId) {
                    e.preventDefault();
                    scrollToTarget(targetId, true);
                    // Update URL without causing a page jump
                    if (history.pushState) {
                        history.pushState(null, '', anchor.hash);
                    }
                } else {
                    // Handle link to top of page like href="#"
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (history.pushState) {
                        history.pushState("", document.title, window.location.pathname + window.location.search);
                    }
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);

        // Function to handle scrolling on load
        const handleLoadScroll = () => {
            if (window.location.hash) {
                const targetId = window.location.hash.substring(1);
                scrollToTarget(targetId, true);
            }
        };

        // Handle scroll on initial page load if there is a hash in the URL
        if (document.readyState === 'complete') {
            handleLoadScroll();
        } else {
            window.addEventListener('load', handleLoadScroll, { once: true });
        }

        return () => {
            document.removeEventListener('click', handleAnchorClick);
            window.removeEventListener('load', handleLoadScroll);
        };
    }, []);
};

const HomePage = () => {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);
  
  useSmoothScroll();
  
  const workItems = [
    { image: "https://images.adsttc.com/media/images/5de8/8330/3312/fd9f/fd00/01d3/large_jpg/08_Architect-Offices-Rivierstaete-Kantoren-Amsterdam-MVSA-%C2%A9Barwerd_van_der_Plas_W.jpg?1575519018", meta: "Architectural Design & Layout Planning", title: "Jazeera Business Center", description: "Office floors - Glass partitions - Reception & meeting suites" },
    { image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=60", meta: "Architectural Design", title: "Lusail Mixed-Use", description: "Retail podium - Serviced offices - Public realm upgrades" },
    { image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=60", meta: "Space & Layout Planning", title: "Residential Villas", description: "Efficient plans - Daylighting - Contemporary finishes" }
  ];

  const testimonials = [
    { quote: "The design was flawless. Their attention to detail and coordination saved us significant time and budget on our high-rise project.", author: "Project Manager, High-Rise Development", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&auto=format&fit=crop&q=80&dpr=2", },
    { quote: "The supervision and management for our villa were exceptional. The team was professional, transparent, and delivered beyond our expectations.", author: "Private Villa Owner, Doha", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&auto=format&fit=crop&q=80&dpr=2", },
    { quote: "Their innovative approach to engineering challenges is commendable. Taj Design Consult is a reliable partner for any complex construction endeavor.", author: "Lead Architect, Hospitality Project", image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=80&h=80&auto=format&fit=crop&q=80&dpr=2", }
  ];

  const processSteps = [
    { title: 'Consult & Brief', icon: 'fas fa-clipboard-list', description: 'We start by listening. Understanding your vision, goals, and constraints is the foundation of our partnership.' },
    { title: 'Concept Options', icon: 'fas fa-lightbulb', description: 'Exploring possibilities. We develop multiple design concepts, presenting creative solutions that align with the brief.' },
    { title: 'Design Development', icon: 'fas fa-ruler-combined', description: 'Refining the vision. We flesh out the chosen concept with detailed drawings, material selections, and 3D models.' },
    { title: 'Docs & Tender', icon: 'fas fa-file-signature', description: 'Precision in planning. We produce comprehensive construction documents and manage the tendering process.' },
    { title: 'Construction Support', icon: 'fas fa-hard-hat', description: 'Ensuring quality. Our team provides site supervision and support to ensure the design is executed flawlessly.' },
    { title: 'Post-Occupancy', icon: 'fas fa-key', description: 'Beyond completion. We conduct a final review and handover, ensuring you are delighted with the final result.' },
  ];
  
  const services = [
    { icon: 'fas fa-archway', title: 'Architectural Design', description: 'Creating innovative and functional spaces from concept to construction, ensuring aesthetic appeal and structural integrity.', href: 'architectural-design.html' },
    { icon: 'fas fa-cogs', title: 'Engineering Consultancy', description: 'Providing expert technical advice and solutions across various engineering disciplines for robust and efficient project outcomes.', href: 'engineering-consultancy.html' },
    { icon: 'fas fa-tasks', title: 'Project Management Consultancy', description: 'Overseeing projects from inception to completion, ensuring they are delivered on time, within budget, and to the highest quality standards.', href: 'project-management.html' },
    { icon: 'fas fa-leaf', title: 'Sustainability & Energy', description: 'Integrating green building principles and energy-efficient solutions to create environmentally responsible and cost-effective designs.', href: 'sustainability-energy.html' },
  ];

  const sectors = [
    { name: 'Government & Public Sector', icon: 'fas fa-landmark' }, { name: 'Commercial & Mixed-Use', icon: 'fas fa-store-alt' }, { name: 'Residential', icon: 'fas fa-home' },
    { name: 'Industrial', icon: 'fas fa-industry' }, { name: 'Sports & Entertainment', icon: 'fas fa-futbol' }, { name: 'Hospitality & Leisure', icon: 'fas fa-concierge-bell' },
    { name: 'Education & Healthcare', icon: 'fas fa-graduation-cap' },
  ];

  const blogPosts = [
    { image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60", category: "Technology", date: "August 15, 2024", title: "The Future of BIM: AI and Generative Design", href: "blog-bim-ai.html", },
    { image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&auto=format&fit=crop&q=60", category: "Architecture", date: "August 10, 2024", title: "Sustainable Materials in Modern Construction", href: "blog-sustainable-materials.html", },
    { image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60", category: "Interior Design", date: "August 05, 2024", title: "Minimalism and Light: Crafting Serene Spaces", href: "blog-minimalism-light.html", }
  ];

   useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { document.querySelectorAll('.scroll-trigger').forEach(el => el.classList.add('visible')); return; }
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const elementsToReveal = document.querySelectorAll('.scroll-trigger');
    elementsToReveal.forEach((el) => observer.observe(el));
    return () => elementsToReveal.forEach((el) => observer.unobserve(el));
  }, []);

  // Simplified Parallax Effects
  useEffect(() => {
    const projectImageParallaxSpeed = 0.2;
    const workImageContainers = document.querySelectorAll<HTMLElement>('.work-image');
    const servicesSection = document.getElementById('our-services');

    const handleScroll = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        workImageContainers.forEach(container => {
            const image = container.querySelector('img');
            if (!image) return;
            const rect = container.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yOffset = -rect.top * projectImageParallaxSpeed;
                image.style.setProperty('--parallax-y', `${yOffset}px`);
            }
        });

        if(servicesSection) {
            const rect = servicesSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const speed = 0.25;
                const yOffset = rect.top * speed;
                servicesSection.style.setProperty('--bg-parallax-y', `${yOffset}px`);
            }
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      <HeroSection />
      
      <section id="about" className="content-section section-bg-white scroll-trigger fade-up">
        <div className="section-decorator decorator-right scroll-trigger" aria-hidden="true">
            <span className="decorator-text">01</span>
        </div>
        <div className="container">
          <div className="about-section">
            <div className="grid">
              <div className="about-image scroll-trigger fade-up">
                <OptimizedImage 
                  src="https://images.pexels.com/photos/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800&q=60"
                  alt="A modern residential building with a swimming pool and patio."
                  width="480"
                  height="600"
                  lazy={true}
                  sizes="(max-width: 992px) 90vw, 480px"
                />
              </div>
              <div className="about-text">
                <h2 className="section-title scroll-trigger fade-up">WHO <strong>WE ARE</strong></h2>
                <p className="scroll-trigger fade-up" style={{transitionDelay: '0.1s'}}>
                  Taj Consultancy is a leading multidisciplinary firm in Qatar, delivering excellence in Architectural Design, Engineering, Project Management, and Sustainability. With decades of experience and a diverse expert team, we create landmark projects that blend innovation, integrity, and technical precision. From concept to completion, we turn ambitious ideas into sustainable, high-quality realities on time and on budget.
                </p>
                <div className="process-section scroll-trigger fade-up" style={{transitionDelay: '0.3s'}}>
                  <h3 className="sub-section-title">Our Process</h3>
                  <p>A transparent and collaborative path from your first idea to project handover.</p>
                  <div className="process-grid">
                    {processSteps.map((step, index) => (
                       <div className="process-item scroll-trigger fade-up" key={index} style={{ transitionDelay: `${index * 0.1}s` }}>
                          <div className="process-icon-wrapper">
                            <i className={`process-icon ${step.icon}`} aria-hidden="true"></i>
                          </div>
                          <h4><span>0{index + 1}.</span> {step.title}</h4>
                          <p className="process-description">{step.description}</p>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="facts" className="content-section section-bg-dark scroll-trigger fade-up has-divider" style={{backgroundImage: `url(https://images.unsplash.com/photo-1562911791-c9a16a685121?w=1600&auto=format&fit=crop&q=60)`}}>
        <SectionDivider />
        <div className="section-decorator decorator-left scroll-trigger" aria-hidden="true">
            <span className="decorator-text">02</span>
        </div>
        <div className="container">
            <div className="facts-section">
                <div className="grid">
                    <div className="facts-title">
                         <h2 className="section-title scroll-trigger fade-up">Some Interesting <strong>Facts</strong></h2>
                    </div>
                    <div className="facts-text">
                        <p className="scroll-trigger fade-up" style={{transitionDelay: '0.1s'}}><strong>Taj Design Consult</strong> operates on the belief that evidence-led design and technical precision create lasting value.</p>
                        <p className="scroll-trigger fade-up" style={{transitionDelay: '0.2s'}}>Our integrated teams bring together architecture, interiors, landscape, and urban design under one roof — ensuring seamless collaboration and faster delivery.</p>
                         <div className="facts-counters">
                            <div className="counter-item scroll-trigger fade-up" style={{ transitionDelay: '0.3s' }}>
                                <i className="fas fa-building-circle-check counter-icon" aria-hidden="true"></i>
                                <AnimatedCounter end={265} />
                                <p>Finished projects</p>
                            </div>
                            <div className="counter-item scroll-trigger fade-up" style={{ transitionDelay: '0.4s' }}>
                                <i className="fas fa-users-line counter-icon" aria-hidden="true"></i>
                                <AnimatedCounter end={240} />
                                <p>Happy customers</p>
                            </div>
                            <div className="counter-item scroll-trigger fade-up" style={{ transitionDelay: '0.5s' }}>
                                <i className="fas fa-helmet-safety counter-icon" aria-hidden="true"></i>
                                <AnimatedCounter end={36} />
                                <p>Opening Projects</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section id="our-services" className="content-section section-bg-white scroll-trigger fade-up has-divider">
        <SectionDivider />
        <div className="section-decorator decorator-right decorator-03 scroll-trigger" aria-hidden="true">
            <span className="decorator-text">03</span>
        </div>
        <div className="container">
          <h2 className="section-title scroll-trigger fade-up" style={{ textAlign: 'center' }}>Our <strong>Services</strong></h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-item scroll-trigger fade-up" style={{ transitionDelay: `${index * 0.1}s` }} key={index}>
                <svg className="service-border-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect className="service-border-rect" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="7" pathLength="1" />
                </svg>
                <div className="service-icon-wrapper">
                  <i className={`service-icon ${service.icon}`} aria-hidden="true"></i>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href={service.href} className="read-more-btn">Read More<span className="sr-only"> about {service.title}</span> <i className="fas fa-arrow-right" aria-hidden="true"></i></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sectors" className="content-section section-bg-white scroll-trigger fade-up has-divider">
        <SectionDivider />
        <div className="container">
          <h2 className="section-title scroll-trigger fade-up" style={{ textAlign: 'center' }}>Sectors <strong>We Serve</strong></h2>
          <div className="sectors-grid">
            {sectors.map((sector, index) => (
              <div className="sector-item scroll-trigger fade-up" style={{ transitionDelay: `${index * 0.1}s` }} key={index}>
                <svg className="service-border-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect className="service-border-rect" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="7" pathLength="1" />
                </svg>
                <div className="service-icon-wrapper">
                  <i className={`service-icon ${sector.icon}`} aria-hidden="true"></i>
                </div>
                <h3>{sector.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="works" className="content-section section-bg-dark scroll-trigger fade-up has-divider" style={{backgroundImage: `url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=60)`}}>
        <SectionDivider />
        <div className="section-decorator decorator-left scroll-trigger" aria-hidden="true">
            <span className="decorator-text">04</span>
        </div>
        <div className="container">
            <h2 className="section-title scroll-trigger fade-up" style={{textAlign: 'right'}}>Our Featured <strong>Projects</strong></h2>
            <div className="works-list">
                {workItems.map((item, index) => (
                    <div className={`work-item scroll-trigger fade-up ${index % 2 !== 0 ? 'reverse' : ''}`} key={index}>
                        <div className="grid">
                           <div className="work-image">
                                <OptimizedImage 
                                    src={item.image}
                                    alt={item.title}
                                    width="720"
                                    height="480"
                                    lazy={true}
                                    sizes="(max-width: 992px) 90vw, 720px"
                                />
                                <div className="work-title-overlay">
                                    <h3>{item.title}</h3>
                                    <button className="view-projects-btn" onClick={() => setLightboxImage({ src: item.image, title: item.title })}>View Project</button>
                                </div>
                            </div>
                            <div className="work-info">
                                <p className="meta">{item.meta}</p>
                                <p className="work-description">{item.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      <section id="blog" className="content-section section-bg-white scroll-trigger fade-up has-divider">
        <SectionDivider />
        <div className="section-decorator decorator-right decorator-05 scroll-trigger" aria-hidden="true">
            <span className="decorator-text">05</span>
        </div>
        <div className="container">
            <h2 className="section-title scroll-trigger fade-up" style={{ textAlign: 'left' }}>From our <strong>Blog</strong></h2>
            <div className="blog-grid">
                {blogPosts.map((post, index) => (
                    <div className="blog-item scroll-trigger fade-up" style={{ transitionDelay: `${index * 0.1}s` }} key={index}>
                        <div className="blog-item-image">
                            <OptimizedImage
                                src={post.image}
                                alt={post.title}
                                width="380"
                                height="200"
                                lazy={true}
                                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 380px"
                            />
                        </div>
                        <div className="blog-item-content">
                            <div className="blog-item-meta">
                                <span>{post.category}</span> &bull; <span>{post.date}</span>
                            </div>
                            <h3 className="blog-item-title">
                                <a href={post.href}>{post.title}</a>
                            </h3>
                            <a href={post.href} className="blog-item-link">Read More <span className="sr-only"> about {post.title}</span><i className="fas fa-arrow-right" aria-hidden="true"></i></a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section id="clients" className="content-section section-bg-dark scroll-trigger fade-up has-divider" style={{backgroundImage: `url(https://images.unsplash.com/photo-1562911791-c9a16a685121?w=1600&auto=format&fit=crop&q=60)`}}>
        <SectionDivider />
        <div className="section-decorator decorator-right decorator-06 scroll-trigger" aria-hidden="true">
            <span className="decorator-text">06</span>
        </div>
        <div className="container">
            <h2 className="section-title scroll-trigger fade-up" style={{textAlign: 'center'}}>Customer <strong>Feedback</strong></h2>
            <div className="scroll-trigger fade-up" style={{transitionDelay: '0.1s'}}>
                <TestimonialsCarousel testimonials={testimonials} />
            </div>

            <h2 className="section-title scroll-trigger fade-up" style={{marginTop: '120px'}}>Our Valued <strong>Clients</strong></h2>
            <p className="scroll-trigger fade-up" style={{marginBottom: '40px', maxWidth: '600px', transitionDelay: '0.1s'}}>Powered by collaboration and driven by excellence, <strong>Taj Design Consult</strong> takes immense pride in our valued clients who have embarked on transformative journeys with us.</p>
            <div className="scroll-trigger fade-up" style={{transitionDelay: '0.2s'}}>
              <ClientsCarousel />
            </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.body.style.backgroundColor = '#111111'; // Dark theme for home
        const timer = setTimeout(() => setLoading(false), 200);
        return () => {
            document.body.style.backgroundColor = '';
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className={`app ${loading ? 'loading' : ''}`}>
            <SkipToContentLink />
            <CustomCursor />
            <WhatsAppChatWidget />
            <Header theme="dark" />
            <div className="main-container">
                <LeftSidebar pageName="HOME" />
                <main className="main-content" id="main-content" tabIndex={-1}>
                    <HomePage />
                </main>
            </div>
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
