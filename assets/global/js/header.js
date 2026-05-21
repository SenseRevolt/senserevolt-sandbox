(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {

        var burger     = document.getElementById('burger-btn');
        var tabletMenu = document.getElementById('tablet-menu');
        var mobileMenu = document.getElementById('mobile-menu');

        /* ── Яке меню активне по ширині екрану ── */
        function activeMenu() {
            return window.innerWidth <= 767 ? mobileMenu : tabletMenu;
        }

        /* ── Відкрити меню ── */
        function openMenu() {
            var m = activeMenu();
            if (!m) return;
            m.removeAttribute('hidden');
            requestAnimationFrame(function () {
                m.classList.add('is-open');
            });
            if (burger) burger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        /* ── Закрити всі меню ── */
        function closeMenus() {
            [tabletMenu, mobileMenu].forEach(function (m) {
                if (!m) return;
                m.classList.remove('is-open');
                m.addEventListener('transitionend', function h() {
                    if (!m.classList.contains('is-open')) m.setAttribute('hidden', '');
                    m.removeEventListener('transitionend', h);
                }, { once: true });
            });
            if (burger) burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            closeTabletSub();
        }

        /* ── Burger ── */
        if (burger) {
            burger.addEventListener('click', function () {
                if (this.getAttribute('aria-expanded') === 'true') closeMenus();
                else openMenu();
            });
        }

        /* ── Backdrop + close btns ── */
        document.querySelectorAll('.tablet-menu-backdrop, .mobile-menu-backdrop').forEach(function (el) {
            el.addEventListener('click', closeMenus);
        });
        document.querySelectorAll('.tablet-close-btn, .mobile-close-btn').forEach(function (el) {
            el.addEventListener('click', closeMenus);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenus();
        });

        /* ════════════════════════════
           TABLET: підменю slide зліва
        ════════════════════════════ */
        var SUBMENUS = {
            somatic: [
                { label: 'Our Method', href: '/en/somatic-tools/our-method/' },
                { label: 'All Kits',   href: '/en/somatic-tools/all-kits/' },
                { label: 'Bundles',    href: '/en/somatic-tools/bundles/' },
                { label: 'Extras',     href: '/en/somatic-tools/extras/' }
            ]
        };

        /* baseurl з Jekyll */
        var baseurl = '';
        var sample = document.querySelector('.main-nav .nav-link[href]');
        if (sample) {
            var m = sample.getAttribute('href').match(/^(.*?)\/en\//);
            if (m) baseurl = m[1];
        }

        var arrowR = '<svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        function openTabletSub(key) {
            var col = document.getElementById('tablet-submenu-col');
            if (!col) return;
            var items = SUBMENUS[key] || [];
            col.innerHTML = items.map(function (it) {
                return '<a href="' + baseurl + it.href + '" class="tablet-sub-link"><span>' + it.label + '</span>' + arrowR + '</a>';
            }).join('');
            col.removeAttribute('hidden');
            requestAnimationFrame(function () { col.classList.add('is-open'); });
        }

        function closeTabletSub() {
            var col = document.getElementById('tablet-submenu-col');
            if (!col) return;
            col.classList.remove('is-open');
            col.addEventListener('transitionend', function h() {
                col.setAttribute('hidden', '');
                col.removeEventListener('transitionend', h);
            }, { once: true });
            document.querySelectorAll('.tablet-nav-link').forEach(function (l) {
                l.classList.remove('is-active');
            });
        }

        document.querySelectorAll('.tablet-nav-link[data-has-sub]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var col = document.getElementById('tablet-submenu-col');
                var alreadyOpen = col && col.classList.contains('is-open') && this.classList.contains('is-active');
                document.querySelectorAll('.tablet-nav-link').forEach(function (l) { l.classList.remove('is-active'); });
                if (alreadyOpen) {
                    closeTabletSub();
                } else {
                    this.classList.add('is-active');
                    openTabletSub(this.getAttribute('data-has-sub'));
                }
            });
        });

        /* ════════════════════════════
           MOBILE: підменю slide overlay
        ════════════════════════════ */
        document.querySelectorAll('.mobile-nav-trigger').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var sub = document.getElementById(this.getAttribute('aria-controls'));
                if (!sub) return;
                sub.removeAttribute('hidden');
                requestAnimationFrame(function () { sub.classList.add('is-open'); });
                trigger.setAttribute('aria-expanded', 'true');
            });
        });

        document.querySelectorAll('.mobile-sub-back').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var sub = this.closest('.mobile-submenu');
                if (!sub) return;
                sub.classList.remove('is-open');
                sub.addEventListener('transitionend', function h() {
                    sub.setAttribute('hidden', '');
                    sub.removeEventListener('transitionend', h);
                }, { once: true });
                var trigger = document.querySelector('[aria-controls="' + sub.id + '"]');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        });

        /* ════════════════════════════
           LANGUAGE SWITCHER
        ════════════════════════════ */
        document.querySelectorAll('.lang-switch').forEach(function (sw) {
            var btn  = sw.querySelector('.lang-current-btn');
            var list = sw.querySelector('.lang-list');
            if (!btn || !list) return;

            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var open = btn.getAttribute('aria-expanded') === 'true';
                /* закрити всі інші */
                document.querySelectorAll('.lang-current-btn').forEach(function (b) {
                    if (b !== btn) {
                        b.setAttribute('aria-expanded', 'false');
                        var l = b.closest('.lang-switch').querySelector('.lang-list');
                        if (l) l.setAttribute('hidden', '');
                    }
                });
                if (open) {
                    btn.setAttribute('aria-expanded', 'false');
                    list.setAttribute('hidden', '');
                } else {
                    btn.setAttribute('aria-expanded', 'true');
                    list.removeAttribute('hidden');
                }
            });

            list.querySelectorAll('.lang-option').forEach(function (opt) {
                opt.addEventListener('click', function (e) {
                    e.preventDefault();
                    var lang = this.getAttribute('data-lang');
                    /* фіксована ширина кнопки — беремо найширший варіант */
                    sw.querySelectorAll('.lang-current-text').forEach(function (t) { t.textContent = lang; });
                    list.querySelectorAll('.lang-option').forEach(function (o) {
                        o.classList.toggle('lang-option--active', o === opt);
                    });
                    btn.setAttribute('aria-expanded', 'false');
                    list.setAttribute('hidden', '');
                });
            });
        });

        document.addEventListener('click', function () {
            document.querySelectorAll('.lang-current-btn[aria-expanded="true"]').forEach(function (btn) {
                btn.setAttribute('aria-expanded', 'false');
                var l = btn.closest('.lang-switch').querySelector('.lang-list');
                if (l) l.setAttribute('hidden', '');
            });
        });

        /* ════════════════════════════
           АКТИВНА СТОРІНКА
        ════════════════════════════ */
        var path = window.location.pathname;
        document.querySelectorAll('.main-nav .nav-link, .tablet-nav-link, .mobile-nav-link, .mobile-sub-link').forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href) return;
            try {
                var lp = new URL(href, window.location.origin).pathname;
                if (lp !== '/' && path.startsWith(lp)) link.classList.add('is-active');
            } catch (e) {}
        });

        /* ════════════════════════════
           ТАЙМЕР
        ════════════════════════════ */
        var LAUNCH = new Date('2025-12-31T00:00:00');
        var launchBar = document.querySelector('.top-bar--launch');
        if (launchBar && getComputedStyle(launchBar).display !== 'none') {
            function pad(n) { return n < 10 ? '0' + n : '' + n; }
            function tick() {
                var d = Math.max(0, LAUNCH - new Date());
                var el = function (id) { return document.getElementById(id); };
                if (el('tb-days'))  el('tb-days').textContent  = pad(Math.floor(d / 86400000));
                if (el('tb-hours')) el('tb-hours').textContent = pad(Math.floor(d % 86400000 / 3600000));
                if (el('tb-mins'))  el('tb-mins').textContent  = pad(Math.floor(d % 3600000 / 60000));
                if (el('tb-secs'))  el('tb-secs').textContent  = pad(Math.floor(d % 60000 / 1000));
            }
            tick(); setInterval(tick, 1000);
        }

    });
}());
