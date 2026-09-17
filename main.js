document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Preloader ---------- */
    var loaderTexts = ['Storing energy', 'Storing heat', 'Reducing waste', 'Powering industry', 'Beyond boundaries'];
    var textEl = document.getElementById('loaderText');
    var pctEl = document.getElementById('loaderPct');
    var progressCircle = document.querySelector('.loader-ring .progress');
    var preloader = document.getElementById('preloader');
    var circumference = 251.2;

    loaderTexts.forEach(function (t, i) {
        var span = document.createElement('span');
        span.textContent = t;
        if (i === 0) span.classList.add('active');
        textEl.appendChild(span);
    });

    document.documentElement.classList.add('no-scroll');

    var step = 0;
    var totalSteps = loaderTexts.length;
    var stepDuration = 280; // ms per text/step
    var pct = 0;

    var textInterval = setInterval(function () {
        step++;
        var spans = textEl.querySelectorAll('span');
        spans.forEach(function (s) { s.classList.remove('active'); });
        if (spans[step]) spans[step].classList.add('active');
        if (step >= totalSteps - 1) clearInterval(textInterval);
    }, stepDuration);

    var pctInterval = setInterval(function () {
        pct = Math.min(100, pct + 2);
        pctEl.textContent = pct + '%';
        progressCircle.style.strokeDashoffset = circumference - (circumference * pct / 100);
        if (pct >= 100) {
            clearInterval(pctInterval);
            setTimeout(finishLoading, 250);
        }
    }, stepDuration * totalSteps / 50);

    var preloaderDone = false;
    var pendingTypewriters = [];

    function finishLoading() {
        preloader.classList.add('done');
        document.documentElement.classList.remove('no-scroll');
        document.querySelectorAll('.fade-up, .reveal-line').forEach(function (el, i) {
            if (el.closest('.hero')) {
                setTimeout(function () { el.classList.add('in-view'); }, 100 + i * 80);
            }
        });
        if (window.ScrollTrigger) ScrollTrigger.refresh();

        preloaderDone = true;
        pendingTypewriters.forEach(typeOut);
        pendingTypewriters = [];
    }

    /* ---------- Header scroll state ---------- */
    var header = document.getElementById('siteHeader');
    function onScroll() {
        if (window.scrollY > 40) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll);

    /* ---------- Mobile nav toggle ---------- */
    var navToggle = document.getElementById('navToggle');
    var siteNav = document.getElementById('siteNav');
    navToggle.addEventListener('click', function () {
        navToggle.classList.toggle('open');
        siteNav.classList.toggle('open');
    });
    siteNav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            navToggle.classList.remove('open');
            siteNav.classList.remove('open');
        });
    });

    /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.fade-up, .reveal-line').forEach(function (el) {
        if (!el.closest('.hero')) revealObserver.observe(el);
    });

    /* ---------- Mission statement typewriter ----------
       Above-the-fold heroes (e.g. careers.html/newsroom.html, where this
       is the very first section) count as "in view" the instant the
       observer starts, which is before the preloader finishes — typing
       the text out during the preload would mean it's already fully
       typed by the time the preloader fades away. So: if the preloader
       hasn't finished yet, queue the element and let finishLoading()
       kick off the typing once it's actually visible to the user. */
    function typeOut(el) {
        var text = el.textContent;
        var speed = parseInt(el.dataset.speed, 10) || 40;
        el.textContent = '';
        var i = 0;
        var typeInterval = setInterval(function () {
            i++;
            el.textContent = text.slice(0, i);
            if (i >= text.length) clearInterval(typeInterval);
        }, speed);
    }

    var missionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            missionObserver.unobserve(entry.target);
            if (preloaderDone) typeOut(entry.target);
            else pendingTypewriters.push(entry.target);
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.mission-statement .typewriter').forEach(function (el) {
        missionObserver.observe(el);
    });

    /* ---------- Accordion ---------- */
    document.querySelectorAll('.accordion').forEach(function (group) {
        var items = group.querySelectorAll('.accordion-item');
        items.forEach(function (item) {
            var head = item.querySelector('.accordion-head');
            var panel = item.querySelector('.accordion-panel');
            if (item.classList.contains('active')) {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
            head.addEventListener('click', function () {
                var isActive = item.classList.contains('active');
                items.forEach(function (other) {
                    other.classList.remove('active');
                    other.querySelector('.accordion-panel').style.maxHeight = 0;
                });
                if (!isActive) {
                    item.classList.add('active');
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });
    });

    window.addEventListener('resize', function () {
        document.querySelectorAll('.accordion-item.active .accordion-panel').forEach(function (panel) {
            panel.style.maxHeight = panel.scrollHeight + 'px';
        });
    });

    /* ---------- Lenis smooth scroll + GSAP ScrollTrigger parallax ---------- */
    function initScrollFx() {
        if (typeof Lenis !== 'undefined') {
            var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
            lenis.on('scroll', function () {
                if (window.ScrollTrigger) ScrollTrigger.update();
            });
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            document.querySelectorAll('[data-parallax]').forEach(function (el) {
                var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
                gsap.to(el, {
                    yPercent: speed * 100,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            });
        }
    }

    // Give the deferred CDN scripts a beat to attach before initialising
    setTimeout(initScrollFx, 300);
});
