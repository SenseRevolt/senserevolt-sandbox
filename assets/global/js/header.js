(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {

        var burger  = document.getElementById('sr-burger');
        var menu    = document.getElementById('sr-menu');
        var closeBtn = document.getElementById('sr-menu-close');
        var backdrop = document.getElementById('sr-menu-backdrop');

        /* ── Відкрити меню ── */
        function openMenu() {
            if (!menu) return;
            menu.removeAttribute('hidden');
            requestAnimationFrame(function () {
                menu.classList.add('sr-menu--open');
            });
            if (burger) burger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        /* ── Закрити меню ── */
        function closeMenu() {
            if (!menu) return;
            menu.classList.remove('sr-menu--open');
            if (burger) burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            // Ховаємо після transition
            var panel = menu.querySelector('.sr-menu-panel');
            if (panel) {
                panel.addEventListener('transitionend', function h() {
                    menu.setAttribute('hidden', '');
                    panel.removeEventListener('transitionend', h);
                }, { once: true });
            } else {
                menu.setAttribute('hidden', '');
            }
            // Закрити підменю
            closeTabletSub();
            closeMobSub();
        }

        if (burger) burger.addEventListener('click', function () {
            this.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
        });
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        if (backdrop) backdrop.addEventListener('click', closeMenu);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

        /* ══ TABLET підменю ══ */
        var subCol = document.getElementById('sr-sub-col');
        var activeTabletLink = null;

        function openTabletSub(link) {
            if (!subCol) return;
            subCol.removeAttribute('hidden');
            requestAnimationFrame(function () { subCol.classList.add('is-open'); });
            activeTabletLink = link;
        }

        function closeTabletSub() {
            if (!subCol) return;
            subCol.classList.remove('is-open');
            activeTabletLink = null;
        }

        document.querySelectorAll('.sr-menu-link[data-sub]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                if (activeTabletLink === this && subCol && subCol.classList.contains('is-open')) {
                    closeTabletSub();
                } else {
                    openTabletSub(this);
                }
            });
        });

        /* ══ MOBILE підменю ══ */
        function openMobSub(id) {
            var sub = document.getElementById(id);
            if (!sub) return;
            sub.removeAttribute('hidden');
            requestAnimationFrame(function () { sub.classList.add('is-open'); });
        }

        function closeMobSub() {
            document.querySelectorAll('.sr-mob-sub').forEach(function (sub) {
                sub.classList.remove('is-open');
            });
        }

        document.querySelectorAll('.sr-mob-trigger').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openMobSub(this.getAttribute('data-sub'));
            });
        });

        document.querySelectorAll('.sr-mob-back').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var sub = this.closest('.sr-mob-sub');
                if (sub) sub.classList.remove('is-open');
            });
        });

        /* ══ LANGUAGE ══ */
        document.querySelectorAll('.sr-lang').forEach(function (sw) {
            var btn  = sw.querySelector('.sr-lang-btn');
            var list = sw.querySelector('.sr-lang-list');
            if (!btn || !list) return;

            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var open = this.getAttribute('aria-expanded') === 'true';
                // Закрити всі інші
                document.querySelectorAll('.sr-lang-btn[aria-expanded="true"]').forEach(function (b) {
                    if (b !== btn) {
                        b.setAttribute('aria-expanded', 'false');
                        var l = b.closest('.sr-lang').querySelector('.sr-lang-list');
                        if (l) l.setAttribute('hidden', '');
                    }
                });
                this.setAttribute('aria-expanded', open ? 'false' : 'true');
                open ? list.setAttribute('hidden', '') : list.removeAttribute('hidden');
            });

            list.querySelectorAll('.sr-lang-opt').forEach(function (opt) {
                opt.addEventListener('click', function (e) {
                    e.preventDefault();
                    var lang = this.getAttribute('data-lang');
                    // Оновлюємо ВСІ кнопки мови на сторінці
                    document.querySelectorAll('.sr-lang-current').forEach(function (t) { t.textContent = lang; });
                    btn.setAttribute('aria-expanded', 'false');
                    list.setAttribute('hidden', '');
                });
            });
        });

        document.addEventListener('click', function () {
            document.querySelectorAll('.sr-lang-btn[aria-expanded="true"]').forEach(function (btn) {
                btn.setAttribute('aria-expanded', 'false');
                var l = btn.closest('.sr-lang').querySelector('.sr-lang-list');
                if (l) l.setAttribute('hidden', '');
            });
        });

        /* ══ АКТИВНА СТОРІНКА ══ */
        var path = window.location.pathname;
        document.querySelectorAll('.sr-nav-link, .sr-menu-link, .sr-mob-link, .sr-mob-sub-link, .sr-sub-link, .sr-dd-link').forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href) return;
            try {
                var lp = new URL(href, window.location.origin).pathname;
                if (lp !== '/' && path.startsWith(lp)) link.classList.add('is-active');
            } catch (e) {}
        });

        /* ══ ТАЙМЕР ══ */
        var launchBar = document.querySelector('.sr-topbar--launch');
        if (launchBar && launchBar.style.display !== 'none') {
            var LAUNCH = new Date('2025-12-31T00:00:00');
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
