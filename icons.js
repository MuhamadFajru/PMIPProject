/**
 * UR WORLD - Icons Loader (v2 - Disempurnakan)
 * Memuat sprite ikon SVG ke semua halaman.
 *
 * --- PERUBAHAN ---
 * 1. Menambahkan ikon yang hilang: brain, zap, trending-up, microscope, planet.
 * 2. Menambahkan ikon sosial: google, facebook.
 * 3. Memastikan tidak ada duplikasi pemuatan.
 */

(function() {
    'use strict';
    
    // Cek apakah ikon sudah ada
    if (document.querySelector('.svg-icons')) {
        return;
    }
    
    // --- DEFINISI IKON BARU DITAMBAHKAN DI SINI ---
    const SVG_ICONS = `
<svg class="svg-icons" style="display: none;">
    <defs>
        <symbol id="icon-home" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="icon-arrow-left" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <polyline points="12 19 5 12 12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="icon-arrow-right" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <polyline points="12 5 19 12 12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="icon-menu" viewBox="0 0 24 24">
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </symbol>

        <symbol id="icon-close" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </symbol>

        <symbol id="icon-user" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
        </symbol>

        <symbol id="icon-user-plus" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </symbol>

        <symbol id="icon-camera" viewBox="0 0 24 24">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
        </symbol>

        <symbol id="icon-atom" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <ellipse cx="12" cy="12" rx="10" ry="3" stroke="currentColor" stroke-width="2" fill="none"/>
            <ellipse cx="12" cy="12" rx="3" ry="10" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 12 12)"/>
            <ellipse cx="12" cy="12" rx="3" ry="10" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 12 12)"/>
        </symbol>

        <symbol id="icon-dna" viewBox="0 0 24 24">
            <path d="M2 15c3.3 0 6-2.7 6-6v-2c0-3.3 2.7-6 6-6s6 2.7 6 6v2c0 3.3 2.7 6 6 6M2 9c3.3 0 6 2.7 6 6v2c0 3.3 2.7 6 6 6s6-2.7 6-6v-2c0-3.3 2.7-6 6-6" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M8 15h8M8 9h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </symbol>

        <symbol id="icon-book" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </symbol>

        <symbol id="icon-book-open" viewBox="0 0 24 24">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </symbol>

        <symbol id="icon-clipboard" viewBox="0 0 24 24">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2" fill="none"/>
        </symbol>

        <symbol id="icon-check-circle" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="icon-x-circle" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </symbol>

        <symbol id="icon-check" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </symbol>

        <symbol id="icon-lock" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="icon-award" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="icon-trophy" viewBox="0 0 24 24">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 9h12v3a6 6 0 0 1-12 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M8 22h8M12 19v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </symbol>

        <symbol id="icon-star" viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </symbol>

        <symbol id="icon-target" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2" fill="none"/>
        </symbol>
        
        <symbol id="icon-trending-up" viewBox="0 0 24 24">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <polyline points="17 6 23 6 23 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>
        
        <symbol id="icon-zap" viewBox="0 0 24 24">
             <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </symbol>
        
        <symbol id="icon-brain" viewBox="0 0 24 24">
             <path d="M9.5 2.5a4.5 4.5 0 0 1 5 0 4 4 0 0 1 2.2 3.2 2 2 0 0 1 1.3 1.3 3.5 3.5 0 0 1 0 4 2 2 0 0 1-1.3 1.3 4 4 0 0 1-2.2 3.2 4.5 4.5 0 0 1-5 0 4 4 0 0 1-2.2-3.2 2 2 0 0 1-1.3-1.3 3.5 3.5 0 0 1 0-4 2 2 0 0 1 1.3-1.3A4 4 0 0 1 9.5 2.5z" stroke="currentColor" stroke-width="2" fill="none"/>
             <path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
             <path d="M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </symbol>

        <symbol id="icon-microscope" viewBox="0 0 24 24">
            <path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 8L6 3l5-1 3 5-5 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M7 10l-2 5h9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="icon-planet" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(-30 12 12)"/>
        </symbol>
        
        <symbol id="icon-google" viewBox="0 0 24 24">
            <path d="M21.35 11.1H12.18v2.8h5.13c-.22 1.63-1.04 3.4-2.8 4.6v2.3h2.9c1.7-1.5 2.7-3.9 2.7-6.7 0-.7-.06-1.3-.16-2z" fill="#4285F4"/>
            <path d="M12.18 22c2.6 0 4.8-.8 6.4-2.2l-2.9-2.3c-.8.6-2 1-3.5 1-2.6 0-4.9-1.8-5.7-4.2H3.6v2.4C5.2 20.2 8.4 22 12.18 22z" fill="#34A853"/>
            <path d="M6.48 13.5c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.5H3.6c-.6 1.2-1 2.6-1 4.2s.4 3 1 4.2l2.88-2.4z" fill="#FBBC05"/>
            <path d="M12.18 6.8c1.4 0 2.7.5 3.7 1.4l2.5-2.5C16.9 3.8 14.8 3 12.18 3c-3.8 0-7 2-8.6 4.8l2.9 2.4c.8-2.4 3.1-4.2 5.7-4.2z" fill="#EA4335"/>
        </symbol>
        
        <symbol id="icon-facebook" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" fill="#1877F2" stroke="none"/>
        </symbol>
        <symbol id="icon-settings" viewBox="0 0 24 24">
             <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
             <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2" fill="none"/>
        </symbol>

        <symbol id="icon-log-out" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </symbol>
        
        <symbol id="icon-edit" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </symbol>
    </defs>
</svg>
`;

    // Load icons on DOM ready
    function loadIcons() {
        if (document.querySelector('.svg-icons')) {
            return;
        }
        
        const div = document.createElement('div');
        div.innerHTML = SVG_ICONS;
        document.body.insertBefore(div.firstChild, document.body.firstChild);
        console.log('%cUR WORLD Icons Loaded (v2)', 'color: #22c55e; font-weight: bold;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadIcons);
    } else {
        loadIcons();
    }

})();