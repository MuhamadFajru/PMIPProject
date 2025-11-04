/**
 * UR WORLD - Enhanced Navigation & Module Progress System v2.0
 * Handles navigation, sidebar, module unlocking, and progress tracking
 */

(function() {
    'use strict';
    
    // ========================================
    // CONFIGURATION
    // ========================================
    
    const CONFIG = {
        animationDuration: 300,
        notificationDuration: 3000,
        scrollBehavior: 'smooth',
        enableSounds: true
    };
    
    // Module Structure Definition
    const MODULE_STRUCTURE = {
        fisika: [
            { id: 'modul-fisika-1', quizId: 'kuis-merkurius', name: 'Merkurius - Konsep Gaya', unlocked: true },
            { id: 'modul-fisika-2', quizId: 'kuis-venus', name: 'Venus - Energi dan Usaha', unlocked: false },
            { id: 'modul-fisika-3', quizId: 'kuis-bumi', name: 'Bumi - Gerak Lurus', unlocked: false },
            { id: 'modul-fisika-4', quizId: 'kuis-mars', name: 'Mars - Hukum Newton', unlocked: false }
        ],
        biologi: [
            { id: 'modul-biologi-1', quizId: 'kuistimbuhan', name: 'Sel Tumbuhan', unlocked: true },
            { id: 'modul-biologi-2', quizId: 'kuis-virus', name: 'Virus & Bakteri', unlocked: false },
            { id: 'modul-biologi-3', quizId: 'kuis-saraf', name: 'Sistem Saraf', unlocked: false },
            { id: 'modul-biologi-4', quizId: 'kuis-ekosistem', name: 'Ekosistem', unlocked: false }
        ]
    };
    
    // ========================================
    // MODULE PROGRESS MANAGER
    // ========================================
    
    const ModuleProgress = {
        // Get all progress data
        getProgress() {
            try {
                const data = localStorage.getItem('urworld_module_progress');
                return data ? JSON.parse(data) : {
                    completedModules: [],
                    completedQuizzes: [],
                    currentModule: null,
                    lastAccessed: null
                };
            } catch (error) {
                console.error('Error loading progress:', error);
                return {
                    completedModules: [],
                    completedQuizzes: [],
                    currentModule: null,
                    lastAccessed: null
                };
            }
        },
        
        // Save progress
        saveProgress(progress) {
            try {
                localStorage.setItem('urworld_module_progress', JSON.stringify(progress));
                return true;
            } catch (error) {
                console.error('Error saving progress:', error);
                return false;
            }
        },
        
        // Mark module as read
        markModuleAsRead(moduleId) {
            const progress = this.getProgress();
            if (!progress.completedModules.includes(moduleId)) {
                progress.completedModules.push(moduleId);
                progress.currentModule = moduleId;
                progress.lastAccessed = new Date().toISOString();
                this.saveProgress(progress);
                showNotification('📚 Modul selesai dibaca!', 'success');
                return true;
            }
            return false;
        },
        
        // Mark quiz as completed
        markQuizAsCompleted(quizId, score) {
            const progress = this.getProgress();
            const quizData = {
                quizId: quizId,
                score: score,
                completedAt: new Date().toISOString()
            };
            
            // Check if quiz already completed
            const existingIndex = progress.completedQuizzes.findIndex(q => q.quizId === quizId);
            if (existingIndex !== -1) {
                // Update if new score is better
                if (score > progress.completedQuizzes[existingIndex].score) {
                    progress.completedQuizzes[existingIndex] = quizData;
                }
            } else {
                progress.completedQuizzes.push(quizData);
            }
            
            this.saveProgress(progress);
            this.unlockNextModule(quizId);
            return true;
        },
        
        // Check if module is unlocked
        isModuleUnlocked(moduleId) {
            const progress = this.getProgress();
            
            // Find module in structure
            for (const subject in MODULE_STRUCTURE) {
                const modules = MODULE_STRUCTURE[subject];
                const moduleIndex = modules.findIndex(m => m.id === moduleId);
                
                if (moduleIndex !== -1) {
                    // First module is always unlocked
                    if (moduleIndex === 0) return true;
                    
                    // Check if previous module's quiz is completed
                    const previousModule = modules[moduleIndex - 1];
                    return progress.completedQuizzes.some(q => q.quizId === previousModule.quizId);
                }
            }
            
            return false;
        },
        
        // Check if quiz is unlocked (module must be read first)
        isQuizUnlocked(quizId) {
            const progress = this.getProgress();
            
            // Find corresponding module
            for (const subject in MODULE_STRUCTURE) {
                const module = MODULE_STRUCTURE[subject].find(m => m.quizId === quizId);
                if (module) {
                    return progress.completedModules.includes(module.id);
                }
            }
            
            return false;
        },
        
        // Unlock next module after quiz completion
        unlockNextModule(completedQuizId) {
            for (const subject in MODULE_STRUCTURE) {
                const modules = MODULE_STRUCTURE[subject];
                const currentIndex = modules.findIndex(m => m.quizId === completedQuizId);
                
                if (currentIndex !== -1 && currentIndex < modules.length - 1) {
                    const nextModule = modules[currentIndex + 1];
                    showNotification(`🎉 Modul baru terbuka: ${nextModule.name}!`, 'success');
                    
                    // Add confetti effect
                    if (typeof createConfetti === 'function') {
                        createConfetti();
                    }
                    return nextModule;
                }
            }
            return null;
        },
        
        // Get module completion status
        getModuleStatus(moduleId) {
            const progress = this.getProgress();
            const isRead = progress.completedModules.includes(moduleId);
            const isUnlocked = this.isModuleUnlocked(moduleId);
            
            // Find quiz for this module
            let quizCompleted = false;
            for (const subject in MODULE_STRUCTURE) {
                const module = MODULE_STRUCTURE[subject].find(m => m.id === moduleId);
                if (module) {
                    quizCompleted = progress.completedQuizzes.some(q => q.quizId === module.quizId);
                    break;
                }
            }
            
            return {
                isUnlocked,
                isRead,
                quizCompleted,
                fullyCompleted: isRead && quizCompleted
            };
        }
    };
    
    // ========================================
    // SIDEBAR NAVIGATION
    // ========================================
    
    function initializeSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebarMenu = document.getElementById('sidebarMenu');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');
        
        if (!menuToggle || !sidebarMenu || !sidebarOverlay) {
            return;
        }
        
        // Open sidebar
        function openSidebar() {
            sidebarMenu.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Accessibility
            sidebarMenu.setAttribute('aria-hidden', 'false');
            menuToggle.setAttribute('aria-expanded', 'true');
            
            // Focus first link
            const firstLink = sidebarMenu.querySelector('.sidebar-nav-link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), CONFIG.animationDuration);
            }
        }
        
        // Close sidebar
        function closeSidebar() {
            sidebarMenu.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Accessibility
            sidebarMenu.setAttribute('aria-hidden', 'true');
            menuToggle.setAttribute('aria-expanded', 'false');
            
            // Return focus to menu button
            menuToggle.focus();
        }
        
        // Toggle sidebar
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isActive = sidebarMenu.classList.contains('active');
            if (isActive) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
        
        // Close button
        if (sidebarClose) {
            sidebarClose.addEventListener('click', function(e) {
                e.preventDefault();
                closeSidebar();
            });
        }
        
        // Overlay click
        sidebarOverlay.addEventListener('click', closeSidebar);
        
        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebarMenu.classList.contains('active')) {
                closeSidebar();
            }
        });
        
        // Close on link click
        const sidebarLinks = sidebarMenu.querySelectorAll('.sidebar-nav-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.textContent.trim().includes('Keluar')) {
                    e.preventDefault();
                    confirmLogout();
                    return;
                }
                setTimeout(closeSidebar, 150);
            });
        });
        
        // Set initial ARIA attributes
        sidebarMenu.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
    
    // ========================================
    // MODULE PAGE INITIALIZATION
    // ========================================
    
    function initializeModulePage() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop();
        
        // Check if on module list page
        if (currentPage.includes('dunia-fisika') || currentPage.includes('dunia-biologi')) {
            updateModuleButtons();
        }
        
        // Check if on module content page
        if (currentPage.includes('modul-')) {
            handleModuleView();
        }
        
        // Check if on quiz page
        if (currentPage.includes('kuis-')) {
            handleQuizAccess();
        }
    }
    
    // Update module buttons based on progress
    function updateModuleButtons() {
        const moduleButtons = document.querySelectorAll('.btn-module-select');
        
        moduleButtons.forEach(button => {
            const href = button.getAttribute('href');
            if (!href) return;
            
            const moduleId = href.replace('.html', '');
            const status = ModuleProgress.getModuleStatus(moduleId);
            
            // Remove all status classes
            button.classList.remove('module-locked', 'module-completed');
            
            if (!status.isUnlocked) {
                // Module is locked
                button.classList.add('module-locked');
                button.disabled = true;
                
                // Remove href to prevent navigation
                button.removeAttribute('href');
                button.style.cursor = 'not-allowed';
                
                // Add lock icon if not exists
                if (!button.querySelector('.lock-icon')) {
                    const lockIcon = document.createElement('span');
                    lockIcon.className = 'lock-icon';
                    lockIcon.textContent = '🔒';
                    button.appendChild(lockIcon);
                }
                
                // Add click handler for locked modules
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    showNotification('🔒 Selesaikan modul sebelumnya terlebih dahulu!', 'warning');
                    this.style.animation = 'wrongShake 0.5s ease';
                    setTimeout(() => {
                        this.style.animation = '';
                    }, 500);
                });
            } else {
                // Module is unlocked
                button.classList.remove('module-locked');
                button.disabled = false;
                button.style.cursor = 'pointer';
                
                // Remove lock icon if exists
                const lockIcon = button.querySelector('.lock-icon');
                if (lockIcon) {
                    lockIcon.remove();
                }
                
                // Add completed badge if fully completed
                if (status.fullyCompleted) {
                    button.classList.add('module-completed');
                    
                    if (!button.querySelector('.completed-badge')) {
                        const badge = document.createElement('span');
                        badge.className = 'completed-badge';
                        badge.textContent = '✓';
                        badge.style.cssText = `
                            position: absolute;
                            right: 50px;
                            font-size: 1.5rem;
                            color: var(--quiz-correct);
                            font-weight: 700;
                        `;
                        button.appendChild(badge);
                    }
                }
            }
        });
    }
    
    // Handle module view (mark as read when user scrolls to bottom)
    function handleModuleView() {
        const currentPath = window.location.pathname;
        const moduleId = currentPath.split('/').pop().replace('.html', '');
        
        // Check if module is unlocked
        if (!ModuleProgress.isModuleUnlocked(moduleId)) {
            showNotification('⚠️ Modul ini masih terkunci!', 'error');
            setTimeout(() => {
                window.location.href = 'pilih-dunia.html';
            }, 2000);
            return;
        }
        
        // Track scroll to mark as read
        let hasScrolledToBottom = false;
        const content = document.querySelector('.modul-content');
        
        if (content) {
            window.addEventListener('scroll', function() {
                if (hasScrolledToBottom) return;
                
                const scrollPosition = window.scrollY + window.innerHeight;
                const contentHeight = document.documentElement.scrollHeight;
                
                // If scrolled to 90% of content
                if (scrollPosition >= contentHeight * 0.9) {
                    hasScrolledToBottom = true;
                    ModuleProgress.markModuleAsRead(moduleId);
                    
                    // Enable quiz button if exists
                    const quizLinks = document.querySelectorAll('a[href*="kuis-"]');
                    quizLinks.forEach(link => {
                        link.classList.add('pulse-animation');
                        setTimeout(() => {
                            link.classList.remove('pulse-animation');
                        }, 2000);
                    });
                }
            });
        }
    }
    
    // Handle quiz access control
    function handleQuizAccess() {
        const currentPath = window.location.pathname;
        const quizId = currentPath.split('/').pop().replace('.html', '');
        
        // Extract base quiz ID (without number)
        const baseQuizId = quizId.replace(/-\d+$/, '');
        
        // Check if quiz is unlocked
        if (!ModuleProgress.isQuizUnlocked(baseQuizId)) {
            showNotification('⚠️ Baca modul terlebih dahulu sebelum mengerjakan kuis!', 'warning');
            setTimeout(() => {
                window.history.back();
            }, 2000);
            return;
        }
    }
    
    // ========================================
    // ACTIVE NAVIGATION HIGHLIGHTING
    // ========================================
    
    function highlightActiveNav() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Highlight sidebar links
        const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.includes(currentPage) || 
                (currentPage === 'index.html' && href.includes('welcome.html')))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Highlight bottom nav
        const bottomNavLinks = document.querySelectorAll('.app-bottom-nav a');
        bottomNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // ========================================
    // ENHANCED BUTTON INTERACTIONS
    // ========================================
    
    function enhanceButtons() {
        // Add ripple effect to all buttons
        const buttons = document.querySelectorAll('.btn, .quiz-option, .social-icon');
        
        buttons.forEach(button => {
            if (button.dataset.enhanced) return;
            button.dataset.enhanced = 'true';
            
            button.addEventListener('click', function(e) {
                if (this.disabled || this.classList.contains('module-locked')) {
                    return;
                }
                createRipple(e, this);
                const originalTransform = this.style.transform;
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = originalTransform;
                }, 100);
            });
            
            button.addEventListener('keydown', function(e) {
                if ((e.key === 'Enter' || e.key === ' ') && !this.disabled) {
                    e.preventDefault();
                    this.click();
                }
            });
        });
        
        // Category buttons hover effect
        const categoryButtons = document.querySelectorAll('.btn-category');
        categoryButtons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease';
            });
        });
    }
    
    // Ripple effect
    function createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        Object.assign(ripple.style, {
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            transform: 'scale(0)',
            animation: 'ripple-animation 0.6s ease-out',
            pointerEvents: 'none'
        });
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
    
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        .pulse-animation {
            animation: pulse 1s ease infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // ========================================
    // FORM VALIDATION & ENHANCEMENT
    // ========================================
    
    function initializeFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitButton = form.querySelector('button[type="submit"]');
                const inputs = form.querySelectorAll('input[required]');
                let isValid = true;
                let firstInvalidInput = null;
                
                inputs.forEach(input => {
                    if (!validateInput(input)) {
                        isValid = false;
                        if (!firstInvalidInput) {
                            firstInvalidInput = input;
                        }
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    if (submitButton) {
                        submitButton.classList.remove('loading');
                        submitButton.disabled = false;
                    }
                    if (firstInvalidInput) {
                        firstInvalidInput.focus();
                    }
                    showNotification('❌ Mohon lengkapi semua field dengan benar!', 'error');
                    return;
                }
                
                if (submitButton) {
                    submitButton.classList.add('loading');
                    submitButton.disabled = true;
                }
                
                setTimeout(() => {
                    showNotification('✅ Berhasil! Mengalihkan...', 'success');
                }, 500);
            });
            
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    validateInput(this);
                });
                input.addEventListener('input', function() {
                    if (this.classList.contains('input-error')) {
                        validateInput(this);
                    }
                });
            });
        });
    }
    
    function validateInput(input) {
        const value = input.value.trim();
        const type = input.type;
        let isValid = true;
        let errorMessage = '';
        
        if (input.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Field ini wajib diisi';
        } else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Format email tidak valid';
            }
        } else if (type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Kata sandi minimal 6 karakter';
            }
        }

        const formGroup = input.closest('.input-group') || input.parentElement;
        let errorElement = formGroup.querySelector('.input-error-message');

        if (!isValid) {
            input.classList.add('input-error');
            if (!errorElement) {
                errorElement = document.createElement('small');
                errorElement.className = 'input-error-message';
                errorElement.style.color = '#ff4d4d';
                errorElement.style.fontSize = '0.85rem';
                errorElement.style.display = 'block';
                errorElement.style.marginTop = '4px';
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
        } else {
            input.classList.remove('input-error');
            if (errorElement) errorElement.textContent = '';
        }

        return isValid;
    }
    
    // ========================================
    // NOTIFICATION SYSTEM
    // ========================================
    
    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.app-notification');
        if (existing) existing.remove();
        
        const notif = document.createElement('div');
        notif.className = `app-notification ${type}`;
        notif.textContent = message;
        
        Object.assign(notif.style, {
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: type === 'error' ? '#ef4444' :
                             type === 'success' ? '#22c55e' :
                             type === 'warning' ? '#fbbf24' : '#3b82f6',
            color: '#fff',
            padding: '14px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            fontSize: '0.95rem',
            fontWeight: '500',
            maxWidth: '90%',
            textAlign: 'center'
        });
        
        document.body.appendChild(notif);
        requestAnimationFrame(() => notif.style.opacity = '1');
        
        setTimeout(() => {
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 500);
        }, CONFIG.notificationDuration);
    }
    
    // ========================================
    // LOGOUT CONFIRMATION
    // ========================================
    
    function confirmLogout() {
        const confirmBox = document.createElement('div');
        confirmBox.className = 'logout-confirm';
        confirmBox.innerHTML = `
            <div class="logout-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 9998; backdrop-filter: blur(4px);"></div>
            <div class="logout-dialog" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 20px; z-index: 9999; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-width: 90%; width: 350px; animation: slideUp 0.3s ease;">
                <h3 style="margin-bottom: 15px; color: var(--dark-green); font-size: 1.5rem;">Konfirmasi Keluar</h3>
                <p style="margin-bottom: 25px; color: var(--text-grey);">Apakah kamu yakin ingin keluar?</p>
                <div class="logout-actions" style="display: flex; gap: 10px;">
                    <button id="logoutNo" class="btn btn-secondary" style="flex: 1; background: #95a5a6; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">Batal</button>
                    <button id="logoutYes" class="btn btn-danger" style="flex: 1; background: #ef4444; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">Ya, Keluar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmBox);
        const overlay = confirmBox.querySelector('.logout-overlay');
        const yes = confirmBox.querySelector('#logoutYes');
        const no = confirmBox.querySelector('#logoutNo');
        
        overlay.addEventListener('click', () => confirmBox.remove());
        no.addEventListener('click', () => confirmBox.remove());
        yes.addEventListener('click', () => {
            showNotification('👋 Kamu telah keluar. Progress tersimpan!', 'success');
            setTimeout(() => window.location.href = 'welcome.html', 1000);
        });
    }
    
    // ========================================
    // CONFETTI EFFECT
    // ========================================
    
    function createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: -10px;
                    z-index: 9999;
                    animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }, i * 30);
        }
    }
    
    const confettiStyle = document.createElement('style');
    confettiStyle.textContent = `
        @keyframes confetti-fall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(confettiStyle);
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeSidebar();
        highlightActiveNav();
        enhanceButtons();
        initializeFormValidation();
        initializeModulePage();
        
        if (CONFIG.scrollBehavior === 'smooth') {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
        
        console.log('%cUR WORLD Enhanced Navigation v2.0 Initialized', 'color: #22c55e; font-weight: bold; font-size: 14px;');
        console.log('%cModule Progress System Active', 'color: #3b82f6; font-weight: bold;');
    });
    
    // Export functions for use in other scripts
    window.URWorldNav = {
        ModuleProgress,
        showNotification,
        createConfetti
    };
    
})();