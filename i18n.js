// === I18N SYSTEM - TRANSLATION MANAGER ===

let translations = {};
let currentLanguage = localStorage.getItem('language') || 'fr';

async function loadTranslations() {
    try {
        const response = await fetch('translations.json');
        translations = await response.json();
        localStorage.setItem('language', currentLanguage);
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }
    return value || key;
}

function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translated = t(key);

        if (element.tagName === 'OPTION') {
            // Options: update text content directly
            element.textContent = translated;
        } else if (element.hasAttribute('placeholder')) {
            element.setAttribute('placeholder', translated);
        } else if (element.tagName === 'LABEL') {
            // Labels: update only the first text node, preserve child elements (e.g. <span class="important">)
            const firstTextNode = Array.from(element.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
            if (firstTextNode) {
                firstTextNode.textContent = translated + ' ';
            } else {
                element.insertBefore(document.createTextNode(translated + ' '), element.firstChild);
            }
        } else if (element.hasAttribute('value')) {
            element.setAttribute('value', translated);
        } else {
            if (translated && translated.includes('<')) {
                element.innerHTML = translated;
            } else {
                element.textContent = translated;
            }
        }
    });

    document.documentElement.lang = currentLanguage;
    translateFooter();
    translateNosServices();
    updateActiveNav();
}

// Translate footer static elements (shared across all pages)
function translateFooter() {
    // Footer column titles
    document.querySelectorAll('.footer-col-title').forEach((el, i) => {
        const titles = {
            fr: ['Navigation', 'Nous joindre', "Heures d'ouverture"],
            en: ['Navigation', 'Contact Us', 'Opening Hours']
        };
        if (titles[currentLanguage][i] !== undefined) el.textContent = titles[currentLanguage][i];
    });

    // Footer nav links
    const footerNavLinks = document.querySelectorAll('.footer-nav a');
    const footerNavTexts = {
        fr: ['Accueil', 'Nos Services', 'Soumission', 'À Propos', 'Nous Contacter'],
        en: ['Home', 'Our Services', 'Submission', 'About', 'Contact Us']
    };
    footerNavLinks.forEach((el, i) => {
        if (footerNavTexts[currentLanguage][i] !== undefined) el.textContent = footerNavTexts[currentLanguage][i];
    });

    // Footer tagline
    document.querySelectorAll('.footer-tagline').forEach(el => {
        el.innerHTML = t('footer.tagline');
    });

    // Footer copyright
    document.querySelectorAll('.footer-bottom p').forEach(el => {
        el.innerHTML = t('footer.copyright');
    });

    // Footer RBQ label
    document.querySelectorAll('.footer-rbq-label').forEach(el => {
        el.textContent = t('footer.rbqLicense');
    });

    // Footer hours
    const dayEls = document.querySelectorAll('.footer-hours-day');
    const timeEls = document.querySelectorAll('.footer-hours-time');
    const days = [t('footer.mondayFriday'), t('footer.saturday'), t('footer.sunday')];
    const times = [t('footer.workingHours'), t('footer.byRequest'), t('footer.byRequest')];
    dayEls.forEach((el, i) => { if (days[i]) el.textContent = days[i]; });
    timeEls.forEach((el, i) => { if (times[i]) el.textContent = times[i]; });

    // Footer CTA band
    const ctaLabel = document.querySelector('.footer-cta-label');
    if (ctaLabel) ctaLabel.textContent = t('footer.readyToStart');
    const ctaSub = document.querySelector('.footer-cta-sub');
    if (ctaSub) ctaSub.textContent = t('footer.demandSubmission');
    const ctaBtn = document.querySelector('.footer-cta-btn span');
    if (ctaBtn) ctaBtn.textContent = t('hero.requestSubmission');

    // Navbar "Demander une soumission" buttons (upper bar)
    document.querySelectorAll('.navbar .soumission .diamond-plate span, .soumission-mobile-btn .diamond-plate span').forEach(el => {
        el.textContent = t('hero.requestSubmission');
    });

    // Ruban endroits
    document.querySelectorAll('.ruban-endroits p').forEach(el => {
        el.textContent = t('locations');
    });
}

// Translate nos-services.html specific content
function translateNosServices() {
    // Hero
    _setText('.services-hero__eyebrow', 'services.eyebrow');
    _setHtml('.services-hero h1', () => {
        const lang = currentLanguage;
        return lang === 'fr'
            ? 'Tant qu\'à faire,<br>Bien <em>Faire!</em>'
            : 'If you\'re going to do it,<br>Do it <em>Right!</em>';
    });
    _setText('.services-hero__desc', 'services.heroDesc');

    // Hero actions
    const heroCtas = document.querySelectorAll('.services-hero__actions .diamond-plate span');
    heroCtas.forEach(el => el.textContent = t('services.heroCta'));
    const heroGhost = document.querySelector('.services-hero__actions .btn-ghost');
    if (heroGhost) {
        // Preserve the SVG, only update text node
        const tn = Array.from(heroGhost.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
        if (tn) tn.textContent = ' ' + t('services.heroSeeServices');
    }

    // Hero badges
    const badges = document.querySelectorAll('.hero-badge');
    const badgeKeys = ['services.badge1','services.badge2','services.badge3','services.badge4'];
    badges.forEach((badge, i) => {
        // The text is after the icon div — find it as a text node or after the icon
        const icon = badge.querySelector('.hero-badge__icon');
        if (icon) {
            // Update the text node after icon
            let tn = icon.nextSibling;
            while (tn && tn.nodeType !== Node.TEXT_NODE) tn = tn.nextSibling;
            if (tn) tn.textContent = '\n                    ' + t(badgeKeys[i]) + '\n                ';
            else badge.appendChild(document.createTextNode(' ' + t(badgeKeys[i])));
        }
    });

    // Intro strip
    const introH2 = document.querySelector('.services-intro-strip__text h2');
    if (introH2) introH2.innerHTML = t('services.introTitle') + '<br><span>' + t('services.introTitleSpan') + '</span>';
    _setText('.services-intro-strip__text p', 'services.introDesc');

    // Category header
    _setText('.cat-header__eyebrow', 'services.catEyebrow');
    _setText('.cat-header h2', 'services.catTitle');

    // Service sections — badges, titles, descriptions, bullet points, CTA buttons
    const svcData = [
        { section: '#charpente', badge: 'svc1Badge', title: 'svc1Title', desc: 'svc1Desc', points: ['svc1p1','svc1p2','svc1p3','svc1p4'], cta: 'svc1Cta' },
        { section: '#agrandissement', badge: 'svc2Badge', title: 'svc2Title', desc: 'svc2Desc', points: ['svc2p1','svc2p2','svc2p3','svc2p4'], cta: 'svc2Cta' },
        { section: '#garage', badge: 'svc3Badge', title: 'svc3Title', desc: 'svc3Desc', points: ['svc3p1','svc3p2','svc3p3','svc3p4'], cta: 'svc3Cta' },
        { section: '#cabanon', badge: 'svc4Badge', title: 'svc4Title', desc: 'svc4Desc', points: ['svc4p1','svc4p2','svc4p3','svc4p4'], cta: 'svc4Cta' },
    ];

    svcData.forEach(({ section, badge, title, desc, points, cta }) => {
        const el = document.querySelector(section);
        if (!el) return;
        const badgeEl = el.querySelector('.svc-section__img-badge');
        if (badgeEl) badgeEl.textContent = t('services.' + badge);
        const titleEl = el.querySelector('.svc-section__title');
        if (titleEl) titleEl.innerHTML = t('services.' + title).replace('\n', '<br>');
        const descEl = el.querySelector('.svc-section__desc');
        if (descEl) descEl.textContent = t('services.' + desc);
        const liEls = el.querySelectorAll('.svc-section__points li');
        liEls.forEach((li, i) => { if (points[i]) li.textContent = t('services.' + points[i]); });
        const ctaEl = el.querySelector('.svc-section__cta');
        if (ctaEl) {
            const tn = Array.from(ctaEl.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
            if (tn) tn.textContent = t('services.' + cta) + ' ';
            else ctaEl.insertBefore(document.createTextNode(t('services.' + cta) + ' '), ctaEl.firstChild);
        }
    });

    // Autres services section
    _setText('.autres-section .section-label__text', 'services.autresLabel');
    const autresTitleEl = document.querySelector('.autres-section .section-title');
    if (autresTitleEl) autresTitleEl.textContent = t('services.autresTitle');

    const autreCards = document.querySelectorAll('.autre-card');
    const autreData = [
        { title: 'renov_title', desc: 'renov_desc', cta: 'renov_cta' },
        { title: 'ext_title',   desc: 'ext_desc',   cta: 'ext_cta'   },
    ];
    autreCards.forEach((card, i) => {
        if (!autreData[i]) return;
        const titleEl = card.querySelector('.autre-card__title');
        if (titleEl) titleEl.textContent = t('services.' + autreData[i].title);
        const descEl = card.querySelector('.autre-card__desc');
        if (descEl) descEl.textContent = t('services.' + autreData[i].desc);
        const ctaEl = card.querySelector('.autre-card__link');
        if (ctaEl) {
            const tn = Array.from(ctaEl.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
            if (tn) tn.textContent = t('services.' + autreData[i].cta) + ' ';
        }
    });

    // Testimonial section
    _setText('.avis-label span:not(.avis-label-line)', 'testimonials.label');
    _setText('.avis-texte', 'testimonials.content');
    _setText('.avis-nom', 'testimonials.author');
}

// Helper: set textContent if element exists
function _setText(selector, key) {
    const el = document.querySelector(selector);
    if (el) el.textContent = t(key);
}

// Helper: set innerHTML via callback if element exists
function _setHtml(selector, htmlFn) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = htmlFn();
}

function changeLanguage(lang) {
    const availableLanguages = ['fr', 'en'];
    if (availableLanguages.includes(lang)) {
        currentLanguage = lang;
        localStorage.setItem('language', currentLanguage);
        translatePage();
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
    }
}

function getCurrentLanguage() {
    return currentLanguage;
}

function setElementText(elementId, key) {
    const element = document.getElementById(elementId);
    if (element) {
        const translated = t(key);
        if (translated.includes('<')) {
            element.innerHTML = translated;
        } else {
            element.textContent = translated;
        }
    }
}

function updateActiveNav() {
    const navLinks = document.querySelectorAll('.navbar .links a, .mobile-links a');
    const pathParts = window.location.pathname.split('/');
    const currentPage = pathParts[pathParts.length - 1] || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Extrait le nom de fichier du href en ignorant les ancres (#section)
        const hrefPage = href.split('#')[0].split('/').pop() || 'index.html';

        if (hrefPage === currentPage || (currentPage === '' && hrefPage === 'index.html')) {
            link.classList.add('active');
            link.classList.remove('not-active');
        } else {
            link.classList.remove('active');
            if (!link.classList.contains('lang-toggle')) {
                link.classList.add('not-active');
            }
        }
    });
}

async function initI18n() {
    await loadTranslations();
    translatePage();
}

const i18n = {
    t,
    changeLanguage,
    getCurrentLanguage,
    setElementText,
    translatePage,
    initI18n
};