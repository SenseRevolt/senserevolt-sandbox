(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {





        /* ─── BURGER → відкриває правильне меню ─── */
        var burger = document.getElementById('burger-btn');
        var tabletMenu = document.getElementById('tablet-menu');
        var mobileMenu = document.getElementById('mobile-menu');

        function getActiveMenu() {
            if (mobileMenu && getComputedStyle(mobileMenu).display !== 'none') return mobileMenu;
            if (tabletMenu && getComputedStyle(tabletMenu).display !== 'none') return tabletMenu;
            return null;
        }

        function openMenu() {
            var menu = getActiveMenu();
            if (!menu || !burger) return;
            burger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            menu.hidden = false;
            menu.offsetHeight;
        }

        function closeAllMenus() {
            if (!burger) return;
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';

            [tabletMenu, mobileMenu].forEach(function(menu) {
                if (!menu || menu.hidden) return;
                var panel = menu.querySelector('.tablet-menu-panel, .mobile-menu-panel');
                if (panel) {
                    panel.addEventListener('transitionend', function h() {
                        menu.hidden = true;
                        panel.removeEventListener('transitionend', h);
                    }, { once: true });
                } else {
                    menu.hidden = true;
                }
            });
        }

        if (burger) burger.addEventListener('click', function() {
            var isOpen = this.getAttribute('aria-expanded') === 'true';
            if (isOpen) closeAllMenus(); else openMenu();
        });

        /* Закрити по backdrop */
        [tabletMenu, mobileMenu].forEach(function(menu) {
            if (!menu) return;
            var backdrop = menu.querySelector('.tablet-menu-backdrop, .mobile-menu-backdrop');
            if (backdrop) backdrop.addEventListener('click', closeAllMenus);
        });

        /* Закрити по × */
        document.querySelectorAll('.tablet-close-btn, .mobile-close-btn').forEach(function(btn) {
            btn.addEventListener('click', closeAllMenus);
        });

        /* Escape */
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeAllMenus();
        });

        /* ─── TABLET MENU: підсвітка активного розділу в правому стовпці
               + заповнення лівого стовпця підменю ─── */

        var SUBMENUS = {
            'somatic': [
                { label: 'Our Method',  href: '/en/somatic-tools/our-method/' },
                { label: 'All Kits',    href: '/en/somatic-tools/all-kits/' },
                { label: 'Bundles',     href: '/en/somatic-tools/bundles/' },
                { label: 'Extras',      href: '/en/somatic-tools/extras/' }
            ]
        };

        var arrowSVG = '<svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true"><path d="M1 1l5 5-5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        function fillTabletSubmenu(key, baseurl) {
            var col = document.getElementById('tablet-submenu-col');
            if (!col) return;
            var items = SUBMENUS[key] || [];
            col.innerHTML = items.map(function(item) {
                return '<a href="' + (baseurl || '') + item.href + '" class="tablet-sub-link">' +
                       '<span>' + item.label + '</span>' + arrowSVG + '</a>';
            }).join('');
        }

        /* Визначаємо baseurl з наявних посилань */
        var sampleLink = document.querySelector('.main-nav .nav-link[href]');
        var baseurl = '';
        if (sampleLink) {
            var href = sampleLink.getAttribute('href');
            /* Jekyll baseurl — беремо все до /en/ */
            var match = href.match(/^(.*?)\/en\//);
            if (match) baseurl = match[1];
        }

        /* При відкритті tablet menu — показуємо підменю активного розділу */
        if (tabletMenu) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(m) {
                    if (m.attributeName === 'hidden' && !tabletMenu.hidden) {
                        /* Знаходимо активний пункт */
                        var active = tabletMenu.querySelector('.tablet-nav-link.is-active');
                        var key = active ? active.getAttribute('data-has-sub') : null;
                        if (!key) {
                            /* Якщо немає активного — показуємо somatic за замовчуванням */
                            key = 'somatic';
                        }
                        fillTabletSubmenu(key, baseurl);
                        /* Підсвічуємо в правому стовпці */
                        tabletMenu.querySelectorAll('.tablet-nav-link').forEach(function(l) {
                            l.classList.toggle('is-active', l.getAttribute('data-has-sub') === key);
                        });
                    }
                });
            });
            observer.observe(tabletMenu, { attributes: true });
        }

        /* Клік по пункту в правому стовпці → оновлює лівий */
        document.querySelectorAll('.tablet-nav-link[data-has-sub]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var key = this.getAttribute('data-has-sub');
                fillTabletSubmenu(key, baseurl);
                document.querySelectorAll('.tablet-nav-link').forEach(function(l) {
                    l.classList.toggle('is-active', l === link);
                });
            });
        });

        /* ─── MOBILE MENU: accordion підменю ─── */
        document.querySelectorAll('.mobile-nav-trigger').forEach(function(trigger) {
            trigger.addEventListener('click', function() {
                var subId = this.getAttribute('aria-controls');
                var sub = document.getElementById(subId);
                if (!sub) return;

                var isOpen = this.getAttribute('aria-expanded') === 'true';
                /* Закрити всі інші */
                document.querySelectorAll('.mobile-nav-trigger').forEach(function(t) {
                    if (t !== trigger) {
                        t.setAttribute('aria-expanded', 'false');
                        var s = document.getElementById(t.getAttribute('aria-controls'));
                        if (s) s.hidden = true;
                    }
                });

                this.setAttribute('aria-expanded', String(!isOpen));
                sub.hidden = isOpen;
            });
        });

        /* ─── LANGUAGE SWITCHER ─── */
        document.querySelectorAll('.lang-switch').forEach(function(sw) {
            var btn = sw.querySelector('.lang-current-btn');
            var list = sw.querySelector('.lang-list');
            if (!btn || !list) return;

            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var isOpen = btn.getAttribute('aria-expanded') === 'true';
                /* Закрити всі інші switcher-и */
                document.querySelectorAll('.lang-current-btn').forEach(function(b) {
                    if (b !== btn) {
                        b.setAttribute('aria-expanded', 'false');
                        var l = b.parentElement.querySelector('.lang-list');
                        if (l) l.hidden = true;
                    }
                });
                btn.setAttribute('aria-expanded', String(!isOpen));
                list.hidden = isOpen;
            });

            /* Клік по мові */
            list.querySelectorAll('.lang-option').forEach(function(opt) {
                opt.addEventListener('click', function(e) {
                    e.preventDefault();
                    var lang = this.getAttribute('data-lang');
                    /* Оновлюємо текст кнопки */
                    sw.querySelectorAll('.lang-current-text').forEach(function(t) { t.textContent = lang; });
                    /* Позначаємо активну */
                    list.querySelectorAll('.lang-option').forEach(function(o) {
                        o.classList.toggle('lang-option--active', o === opt);
                    });
                    btn.setAttribute('aria-expanded', 'false');
                    list.hidden = true;
                });
            });
        });

        /* Клік поза switcher → закрити */
        document.addEventListener('click', function() {
            document.querySelectorAll('.lang-current-btn').forEach(function(btn) {
                btn.setAttribute('aria-expanded', 'false');
                var l = btn.parentElement.querySelector('.lang-list');
                if (l) l.hidden = true;
            });
        });

        /* ─── АКТИВНА СТОРІНКА — підсвітка ─── */
        var path = window.location.pathname;

        function markActive(selector) {
            document.querySelectorAll(selector).forEach(function(link) {
                var href = link.getAttribute('href');
                if (!href) return;
                try {
                    var lp = new URL(href, window.location.origin).pathname;
                    if (lp !== '/' && path.startsWith(lp)) {
                        link.classList.add('is-active');
                    }
                } catch(e) {}
            });
        }

        markActive('.main-nav .nav-link');
        markActive('.tablet-nav-link');
        markActive('.mobile-nav-link');

        /* ─── ТАЙМЕР ─── */
        var LAUNCH_DATE = new Date('2025-12-31T00:00:00');
        var launchBar = document.querySelector('.top-bar--launch');
        if (launchBar && launchBar.style.display !== 'none') {
            function pad(n) { return n < 10 ? '0'+n : String(n); }
            function tick() {
                var diff = LAUNCH_DATE - new Date();
                if (diff < 0) diff = 0;
                var d = Math.floor(diff/86400000);
                var h = Math.floor((diff%86400000)/3600000);
                var m = Math.floor((diff%3600000)/60000);
                var s = Math.floor((diff%60000)/1000);
                var el = function(id) { return document.getElementById(id); };
                if (el('tb-days'))  el('tb-days').textContent  = pad(d);
                if (el('tb-hours')) el('tb-hours').textContent = pad(h);
                if (el('tb-mins'))  el('tb-mins').textContent  = pad(m);
                if (el('tb-secs'))  el('tb-secs').textContent  = pad(s);
            }
            tick();
            setInterval(tick, 1000);
        }

    });
}());
