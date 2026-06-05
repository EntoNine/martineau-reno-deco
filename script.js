// --- BARRE NOIRE FIXE APRÈS SCROLL — BUREAU SEULEMENT (> 800px) ---
(function () {
    if (!window.matchMedia('(min-width: 801px)').matches) return;

    const navbarSection = document.querySelector('.navbar-section');
    if (!navbarSection) return;

    const triggerHeight = navbarSection.offsetHeight; // 150px

    // Spacer : maintient l'espace dans le flux quand la navbar est fixed
    const spacer = document.createElement('div');
    spacer.setAttribute('aria-hidden', 'true');
    spacer.style.height  = triggerHeight + 'px';
    spacer.style.display = 'none';
    navbarSection.insertAdjacentElement('afterend', spacer);

    let isStuck = false;

    window.addEventListener('scroll', function () {
        const shouldBeStuck = window.scrollY >= triggerHeight;

        // ── ENTRÉE (scroll bas) ─────────────────────────────────────
        if (shouldBeStuck && !isStuck) {
            isStuck = true;
            spacer.style.display = 'block';
            navbarSection.classList.add('is-stuck');
        }

        // ── SORTIE (scroll haut) ────────────────────────────────────
        else if (!shouldBeStuck && isStuck) {
            isStuck = false;

            // 1. Crée un ghost visuel de la barre noire (CSS l'anime en slide+fade out)
            const ghost = document.createElement('div');
            ghost.className = 'navbar-bottom-ghost';
            document.body.appendChild(ghost);
            ghost.addEventListener('animationend', () => ghost.remove());

            // 2. Remet la vraie navbar dans le flux IMMÉDIATEMENT — aucun délai visible
            navbarSection.classList.remove('is-stuck');
            spacer.style.display = 'none';
        }
    }, { passive: true });
})();

// --- LOGIQUE DU MENU HAMBURGER MOBILE ---
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function(event) {
        event.stopPropagation();
        this.classList.toggle('is-active');
        mobileMenu.classList.toggle('is-open');
    });
}

// --- LOGIQUE DES DROPDOWNS MOBILES (Nos services & Langue) ---
const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');

mobileDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(event) {
        event.stopPropagation();
        // Ferme les autres dropdowns mobiles ouverts avant d'ouvrir celui-ci
        mobileDropdownToggles.forEach(other => {
            if (other !== toggle) other.classList.remove('open');
        });
        this.classList.toggle('open');
    });
});

// --- LOGIQUE DES DROPDOWNS DESKTOP (Nos services & Langue) ---
const desktopDropdownToggles = document.querySelectorAll('.navbar .bottom .links span.not-active');

desktopDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(event) {
        event.stopPropagation();
        // Ferme l'autre dropdown desktop ouvert avant d'ouvrir celui-ci
        desktopDropdownToggles.forEach(other => {
            if (other !== toggle) other.classList.remove('open');
        });
        this.classList.toggle('open');
    });
});

// Fermer tous les menus si on clique en dehors
document.addEventListener('click', function() {
    desktopDropdownToggles.forEach(toggle => toggle.classList.remove('open'));
});

// --- SYNCHRONISATION ET MISE À JOUR DE LA LANGUE ---
const langOptions = document.querySelectorAll('[data-lang]');

langOptions.forEach(option => {
    option.addEventListener('click', function(event) {
        // Empêche le comportement par défaut du lien (#) et la fermeture immédiate bizarre
        event.preventDefault(); 
        
        const targetLang = this.getAttribute('data-lang');
        const targetFlag = this.getAttribute('data-flag');
        
        // 1. Mettre à jour la version Desktop
        const desktopPicker = document.getElementById('desktop-lang-picker');
        if (desktopPicker) {
            desktopPicker.querySelector('.current-flag').src = targetFlag;
            desktopPicker.querySelector('.current-flag').alt = targetLang.toUpperCase();
            desktopPicker.querySelector('.current-text').textContent = targetLang.toUpperCase();
        }

        // 2. Mettre à jour la version Mobile
        const mobilePicker = document.getElementById('mobile-lang-picker');
        if (mobilePicker) {
            mobilePicker.querySelector('.current-flag').src = targetFlag;
            mobilePicker.querySelector('.current-flag').alt = targetLang.toUpperCase();
            // On récupère le texte formaté pour le mobile (ex: "Français" ou "English")
            const mobileText = targetLang === 'fr' ? 'Français' : 'English';
            mobilePicker.querySelector('.current-text').textContent = mobileText;
        }

        // --- APPEL À LA FONCTION DE TRADUCTION I18N ---
        i18n.changeLanguage(targetLang);
        
        // Synchronise les sélecteurs de langue
        syncLanguagePicker();
        
        console.log(`Langue changée pour : ${targetLang}`);
        
        // Optionnel : Fermer le dropdown après la sélection
        if (this.closest('.dropdown')) {
            this.closest('.not-active').classList.remove('open');
        }
        if (this.closest('.mobile-dropdown')) {
            this.closest('.mobile-dropdown-toggle').classList.remove('open');
        }
    });
});

// --- INITIALISATION DU SYSTÈME I18N ---
document.addEventListener('DOMContentLoaded', async function() {
    await i18n.initI18n();
    
    // Synchronise le sélecteur de langue avec la langue courante
    syncLanguagePicker();
});

// --- SYNCHRONISE LE SÉLECTEUR DE LANGUE (drapeau + texte) AVEC LA LANGUE ACTUELLE ---
function syncLanguagePicker() {
    const currentLang = i18n.getCurrentLanguage();
    const flagMap = {
        'fr': 'icons/qc.webp',
        'en': 'icons/us.webp'
    };
    const textMap = {
        'fr': 'FR',
        'en': 'EN'
    };
    const mobileTextMap = {
        'fr': 'Français',
        'en': 'English'
    };
    
    // Mettre à jour Desktop
    const desktopPicker = document.getElementById('desktop-lang-picker');
    if (desktopPicker) {
        desktopPicker.querySelector('.current-flag').src = flagMap[currentLang];
        desktopPicker.querySelector('.current-flag').alt = textMap[currentLang];
        desktopPicker.querySelector('.current-text').textContent = textMap[currentLang];
    }
    
    // Mettre à jour Mobile
    const mobilePicker = document.getElementById('mobile-lang-picker');
    if (mobilePicker) {
        mobilePicker.querySelector('.current-flag').src = flagMap[currentLang];
        mobilePicker.querySelector('.current-flag').alt = textMap[currentLang];
        mobilePicker.querySelector('.current-text').textContent = mobileTextMap[currentLang];
    }
}

// --- GESTION DE LA BANNIÈRE DE CONFIDENTIALITÉ LOI 25 ---
document.addEventListener("DOMContentLoaded", () => {
    const privacyBanner = document.getElementById("privacy-banner");
    const closePrivacyBtn = document.getElementById("btn-close-privacy");

    if (privacyBanner && closePrivacyBtn) {
        // On réutilise le localStorage (déjà présent pour ta langue) pour mémoriser la fermeture
        const hasAcknowledged = localStorage.getItem("privacyAcknowledged");

        if (!hasAcknowledged) {
            // Apparition élégante après 1.5 seconde
            setTimeout(() => {
                privacyBanner.classList.add("show");
            }, 1500);
        }

        closePrivacyBtn.addEventListener("click", () => {
            localStorage.setItem("privacyAcknowledged", "true");
            privacyBanner.classList.remove("show");
        });
    }
});