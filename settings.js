// ============================================
// FILE 3: settings.js (NO CHANGES NEEDED - ALREADY WORKING)
// ============================================

/**
 * UR WORLD - Settings Management
 * Handles app settings, preferences, and configurations
 */

(function() {
    'use strict';
    
    // ========================================
    // DEFAULT SETTINGS
    // ========================================
    
    const defaultSettings = {
        darkMode: false,
        animations: true,
        achievementNotifications: true,
        studyReminders: false,
        sounds: true,
        practiceMode: true,
        showExplanations: true,
        quizTimer: false
    };
    
    let settings = { ...defaultSettings };
    
    // ========================================
    // LOAD SETTINGS
    // ========================================
    
    function loadSettings() {
        try {
            const saved = localStorage.getItem('urworld_settings');
            if (saved) {
                settings = { ...defaultSettings, ...JSON.parse(saved) };
            }
            applySettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            settings = { ...defaultSettings };
        }
    }
    
    function saveSettings() {
        try {
            localStorage.setItem('urworld_settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    // ========================================
    // APPLY SETTINGS
    // ========================================
    
    function applySettings() {
        // Apply dark mode
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Apply animations
        if (!settings.animations) {
            document.body.style.setProperty('--animation-duration', '0s');
        } else {
            document.body.style.removeProperty('--animation-duration');
        }
        
        // Update toggle switches
        updateToggles();
    }
    
    function updateToggles() {
        const toggles = {
            darkModeToggle: settings.darkMode,
            animationToggle: settings.animations,
            achievementNotif: settings.achievementNotifications,
            studyReminder: settings.studyReminders,
            soundToggle: settings.sounds,
            practiceMode: settings.practiceMode,
            showExplanation: settings.showExplanations,
            quizTimer: settings.quizTimer
        };
        
        Object.entries(toggles).forEach(([id, value]) => {
            const toggle = document.getElementById(id);
            if (toggle) {
                toggle.checked = value;
            }
        });
    }
    
    // ========================================
    // TOGGLE HANDLERS
    // ========================================
    
    function setupToggles() {
        // Dark Mode
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', function() {
                settings.darkMode = this.checked;
                applySettings();
                saveSettings();
                showToast(
                    `Mode ${this.checked ? 'gelap' : 'terang'} diaktifkan`, 
                    'success'
                );
            });
        }
        
        // Animation
        const animationToggle = document.getElementById('animationToggle');
        if (animationToggle) {
            animationToggle.addEventListener('change', function() {
                settings.animations = this.checked;
                applySettings();
                saveSettings();
                showToast(
                    `Animasi ${this.checked ? 'diaktifkan' : 'dinonaktifkan'}`, 
                    'info'
                );
            });
        }
        
        // Achievement Notifications
        const achievementNotif = document.getElementById('achievementNotif');
        if (achievementNotif) {
            achievementNotif.addEventListener('change', function() {
                settings.achievementNotifications = this.checked;
                saveSettings();
                showToast(
                    `Notifikasi pencapaian ${this.checked ? 'diaktifkan' : 'dinonaktifkan'}`, 
                    'info'
                );
            });
        }
        
        // Study Reminders
        const studyReminder = document.getElementById('studyReminder');
        if (studyReminder) {
            studyReminder.addEventListener('change', function() {
                settings.studyReminders = this.checked;
                saveSettings();
                
                if (this.checked) {
                    requestNotificationPermission();
                }
                
                showToast(
                    `Pengingat belajar ${this.checked ? 'diaktifkan' : 'dinonaktifkan'}`, 
                    'info'
                );
            });
        }
        
        // Sound
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', function() {
                settings.sounds = this.checked;
                saveSettings();
                showToast(
                    `Suara ${this.checked ? 'diaktifkan' : 'dinonaktifkan'}`, 
                    'info'
                );
            });
        }
        
        // Practice Mode
        const practiceMode = document.getElementById('practiceMode');
        if (practiceMode) {
            practiceMode.addEventListener('change', function() {
                settings.practiceMode = this.checked;
                saveSettings();
                showToast(
                    `Mode latihan ${this.checked ? 'diaktifkan' : 'dinonaktifkan'}`, 
                    'info'
                );
            });
        }
        
        // Show Explanations
        const showExplanation = document.getElementById('showExplanation');
        if (showExplanation) {
            showExplanation.addEventListener('change', function() {
                settings.showExplanations = this.checked;
                saveSettings();
                showToast(
                    `Pembahasan ${this.checked ? 'akan ditampilkan' : 'disembunyikan'}`, 
                    'info'
                );
            });
        }
        
        // Quiz Timer
        const quizTimer = document.getElementById('quizTimer');
        if (quizTimer) {
            quizTimer.addEventListener('change', function() {
                settings.quizTimer = this.checked;
                saveSettings();
                showToast(
                    `Timer kuis ${this.checked ? 'diaktifkan' : 'dinonaktifkan'}`, 
                    'info'
                );
            });
        }
    }
    
    // ========================================
    // NOTIFICATION PERMISSION
    // ========================================
    
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showToast('Notifikasi diizinkan!', 'success');
                } else {
                    showToast('Notifikasi ditolak', 'warning');
                    settings.studyReminders = false;
                    saveSettings();
                    updateToggles();
                }
            });
        }
    }
    
    // ========================================
    // DATA MANAGEMENT
    // ========================================
    
    function exportData() {
        try {
            const data = {
                profile: JSON.parse(localStorage.getItem('urworld_profile') || '{}'),
                settings: settings,
                completedModules: JSON.parse(localStorage.getItem('completedModules') || '[]'),
                progress: JSON.parse(localStorage.getItem('urworld_module_progress') || '{}'),
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `urworld-data-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showToast('Data berhasil diekspor!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Gagal mengekspor data', 'error');
        }
    }
    
    function clearProgress() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ Hapus Progress</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 15px;">
                        <strong>Peringatan!</strong> Tindakan ini akan menghapus semua progress belajar Anda, termasuk:
                    </p>
                    <ul style="margin-left: 20px; margin-bottom: 15px;">
                        <li>Modul yang telah diselesaikan</li>
                        <li>Skor kuis</li>
                        <li>Pencapaian yang telah dibuka</li>
                        <li>Statistik belajar</li>
                    </ul>
                    <p><strong>Tindakan ini tidak dapat dibatalkan!</strong></p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">Batal</button>
                    <button class="btn btn-danger modal-confirm">Ya, Hapus</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            try {
                localStorage.removeItem('urworld_profile');
                localStorage.removeItem('urworld_module_progress');
                localStorage.removeItem('completedModules');
                localStorage.removeItem('urworld_quiz_history');
                
                showToast('Progress berhasil dihapus', 'success');
                modal.remove();
                
                setTimeout(() => {
                    window.location.href = 'pilih-dunia.html';
                }, 1500);
            } catch (error) {
                console.error('Error clearing progress:', error);
                showToast('Gagal menghapus progress', 'error');
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    function resetSettings() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reset Pengaturan</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Kembalikan semua pengaturan ke default?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">Batal</button>
                    <button class="btn btn-primary-green modal-confirm">Ya, Reset</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            settings = { ...defaultSettings };
            saveSettings();
            applySettings();
            showToast('Pengaturan berhasil direset', 'success');
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // ========================================
    // TOAST NOTIFICATION
    // ========================================
    
    function showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        Object.assign(toast.style, {
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
        
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.style.opacity = '1');
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    function init() {
        loadSettings();
        setupToggles();
        
        // Export Data Button
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportData);
        }
        
        // Clear Progress Button
        const clearBtn = document.getElementById('clearProgressBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearProgress);
        }
        
        // Reset Settings Button
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetSettings);
        }
        
        // About links
        const aboutLinks = document.querySelectorAll('.about-link');
        aboutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showToast('Fitur ini akan segera hadir!', 'info');
            });
        });
        
        console.log('%cUR WORLD Settings Loaded', 'color: #4caf50; font-weight: bold;');
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export settings for use in other scripts
    window.URWorldSettings = {
        get: () => settings,
        save: saveSettings,
        showToast
    };
    
})();