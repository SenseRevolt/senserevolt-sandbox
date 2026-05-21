/* ==============================
   HEADER JS — SenseRevolt
   Додати в scripts.html або підключити окремо
============================== */

(function () {
    'use strict';

    // ─────────────────────────────────
    // Утиліта: запускати після DOM ready
    // ─────────────────────────────────
    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {

        // ─────────────────────────────────
        // BURGER + MOBILE MENU
        // ─────────────────────────────────
        var burgerBtn   = document.querySelector('.burger-btn');
        var mobileMenu  = document.getElementById('mobile-menu');
        var closeBtn    = document.querySelector('.close-btn');
        var backdrop    = document.querySelector('.mobile-menu-backdrop');

        function openMenu() {
            if (!mobileMenu || !burgerBtn) return;
            mobileMenu.hidden = false;
            burgerBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            // Форсуємо reflow щоб transition спрацював
            mobileMenu.offsetHeight;
        }

        function closeMenu() {
            if (!mobileMenu || !burgerBtn) return;
            burgerBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';

            // Чекаємо завершення transition перед hidden
            var panel = mobileMenu.querySelector('.mobile-menu-panel');
            if (panel) {
                panel.addEventListener('transitionend', function handler() {
                    mobileMenu.hidden = true;
                    // Закриваємо підменю якщо відкрите
                    closeAllSubmenus();
                    panel.removeEventListener('transitionend', handler);
                }, { once: true });
            } else {
                mobileMenu.hidden = true;
                closeAllSubmenus();
            }
        }

        if (burgerBtn) {
            burgerBtn.addEventListener('click', function () {
                var isOpen = this.getAttribute('aria-expanded') === 'true';
                if (isOpen) closeMenu();
                else openMenu();
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        if (backdrop) backdrop.addEventListener('click', closeMenu);

        // Закрити на Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu && !mobileMenu.hidden) {
                closeMenu();
            }
        });

        // ─────────────────────────────────
        // MOBILE SUBMENU (slide-in)
        // ─────────────────────────────────
        function closeAllSubmenus() {
            document.querySelectorAll('.mobile-submenu').forEach(function (sub) {
                sub.hidden = true;
                sub.style.transform = '';
            });
            document.querySelectorAll('.mobile-nav-trigger').forEach(function (btn) {
                btn.setAttribute('aria-expanded', 'false');
            });
        }

        document.querySelectorAll('.mobile-nav-trigger').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var targetId = this.getAttribute('aria-controls');
                var submenu  = document.getElementById(targetId);
                if (!submenu) return;

                submenu.hidden = false;
                // Форсуємо reflow
                submenu.offsetHeight;
                this.setAttribute('aria-expanded', 'true');
            });
        });

        document.querySelectorAll('.mobile-submenu-back').forEach(function (backBtn) {
            backBtn.addEventListener('click', function () {
                var submenu = this.closest('.mobile-submenu');
                if (!submenu) return;

                submenu.addEventListener('transitionend', function handler() {
                    submenu.hidden = true;
                    submenu.removeEventListener('transitionend', handler);
                }, { once: true });

                // Повертаємо transform назад — CSS transition підхопить
                submenu.style.transform = 'translateX(100%)';

                // Знімаємо aria-expanded з тригера
                var triggerId = submenu.id;
                var trigger = document.querySelector('[aria-controls="' + triggerId + '"]');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        });

        // ─────────────────────────────────
        // ТАЙМЕР ЗВОРОТНОГО ВІДЛІКУ
        // Встановити дату запуску нижче
        // ─────────────────────────────────
        var LAUNCH_DATE = new Date('2025-12-31T00:00:00'); // <-- змінити на реальну дату

        var tbDays  = document.getElementById('tb-days');
        var tbHours = document.getElementById('tb-hours');
        var tbMins  = document.getElementById('tb-mins');
        var tbSecs  = document.getElementById('tb-secs');

        function pad(n) {
            return n < 10 ? '0' + n : String(n);
        }

        function updateTimer() {
            if (!tbDays || !tbHours || !tbMins || !tbSecs) return;
            var now  = new Date();
            var diff = LAUNCH_DATE - now;

            if (diff <= 0) {
                tbDays.textContent = tbHours.textContent = tbMins.textContent = tbSecs.textContent = '00';
                return;
            }

            var d = Math.floor(diff / 86400000);
            var h = Math.floor((diff % 86400000) / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            var s = Math.floor((diff % 60000) / 1000);

            tbDays.textContent  = pad(d);
            tbHours.textContent = pad(h);
            tbMins.textContent  = pad(m);
            tbSecs.textContent  = pad(s);
        }

        // Таймер активний тільки якщо launch top-bar видимий
        var launchBar = document.querySelector('.top-bar--launch');
        if (launchBar && launchBar.style.display !== 'none') {
            updateTimer();
            setInterval(updateTimer, 1000);
        }

        // ─────────────────────────────────
        // АКТИВНА СТОРІНКА — підсвітка nav
        // ─────────────────────────────────
        var path = window.location.pathname;

        document.querySelectorAll('.main-nav .nav-link, .mobile-nav-link, .mobile-sub-link').forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href) return;

            // Порівнюємо pathname (без домену)
            try {
                var linkPath = new URL(href, window.location.origin).pathname;
                // Точне співпадіння або вкладений шлях
                if (path === linkPath || (linkPath !== '/' && path.startsWith(linkPath))) {
                    link.classList.add('is-active');
                }
            } catch (e) {}
        });

    }); // end ready

}());
