// ============================================
// FILE 1: profile.js (FIXED - AUTO UPDATE & SVG ICONS)
// ============================================

/**
 * UR WORLD - Profile Page Management (FIXED)
 * --- PERUBAHAN ---
 * 1. Mengganti semua 'icon' emoji (mis. '🎯', '📚') dengan ID ikon SVG (mis. 'icon-target', 'icon-book').
 * 2. Memperbarui 'renderAchievements' dan 'renderActivities' untuk membuat tag <svg> secara dinamis.
 * 3. Menambahkan ID ikon baru untuk 'brain', 'zap', 'trending-up', 'trophy'.
 */

(function() {
    'use strict';
    
    // ========================================
    // USER DATA MANAGEMENT
    // ========================================
    
    const UserProfile = {
        name: 'Pengguna UR WORLD',
        level: 1,
        totalPoints: 0,
        completedModules: 0,
        achievements: 0,
        streak: 0,
        lastVisit: null,
        progress: {
            physics: 0,
            biology: 0
        },
        activities: [],
        achievementList: [
            // --- PERUBAHAN IKON DI SINI ---
            { id: 'first_step', name: 'First Step', desc: 'Selesaikan modul pertama', icon: 'icon-target', unlocked: false },
            { id: 'bookworm', name: 'Bookworm', desc: 'Selesaikan 5 modul', icon: 'icon-book-open', unlocked: false },
            { id: 'quiz_master', name: 'Quiz Master', desc: 'Skor sempurna di 3 kuis', icon: 'icon-brain', unlocked: false }, // Mengganti '🧠' dengan 'icon-brain'
            { id: 'speed_learner', name: 'Speed Learner', desc: 'Selesaikan kuis dalam 30 detik', icon: 'icon-zap', unlocked: false }, // Mengganti '⚡' dengan 'icon-zap'
            { id: 'on_fire', name: 'On Fire', desc: 'Belajar 7 hari beruntun', icon: 'icon-trending-up', unlocked: false }, // Mengganti '🔥' dengan 'icon-trending-up'
            { id: 'champion', name: 'Champion', desc: 'Selesaikan semua modul', icon: 'icon-trophy', unlocked: false } // Mengganti '👑' dengan 'icon-trophy'
        ]
    };
    
    // ========================================
    // LOCAL STORAGE FUNCTIONS
    // ========================================
    
    function loadUserProfile() {
        try {
            const saved = localStorage.getItem('urworld_profile');
            if (saved) {
                // Gabungkan data tersimpan dengan default, jaga agar achievementList tetap terbaru
                const savedProfile = JSON.parse(saved);
                const defaultAchievements = UserProfile.achievementList;
                Object.assign(UserProfile, savedProfile);
                // Pastikan daftar pencapaian dari kode (default) yang digunakan,
                // tetapi pertahankan status 'unlocked' dari data tersimpan
                if (savedProfile.achievementList) {
                    UserProfile.achievementList = defaultAchievements.map(defaultAch => {
                        const savedAch = savedProfile.achievementList.find(sa => sa.id === defaultAch.id);
                        return savedAch ? { ...defaultAch, unlocked: savedAch.unlocked } : defaultAch;
                    });
                }
            }
            
            updateStreak();
            calculateProgress(); // Hitung ulang progres setiap kali memuat
            
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }
    
    function saveUserProfile() {
        try {
            localStorage.setItem('urworld_profile', JSON.stringify(UserProfile));
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    }
    
    // ========================================
    // STREAK CALCULATION
    // ========================================
    
    function updateStreak() {
        const today = new Date().toDateString();
        const lastVisit = UserProfile.lastVisit;
        
        if (!lastVisit) {
            UserProfile.streak = 1;
        } else {
            const lastDate = new Date(lastVisit);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                // Same day, no change
            } else if (diffDays === 1) {
                // Consecutive day
                UserProfile.streak++;
            } else {
                // Streak broken
                UserProfile.streak = 1;
            }
        }
        
        UserProfile.lastVisit = today;
        
        if (UserProfile.streak >= 7) {
            unlockAchievement('on_fire');
        }
        
        saveUserProfile(); // Simpan streak baru
    }
    
    // ========================================
    // PROGRESS CALCULATION (FIXED)
    // ========================================
    
    function calculateProgress() {
        let moduleProgress = { completedQuizzes: [] };
        
        if (window.URWorldNav && window.URWorldNav.ModuleProgress) {
            moduleProgress = window.URWorldNav.ModuleProgress.getProgress();
        }
        
        const physicsQuizzes = moduleProgress.completedQuizzes.filter(q => 
            q.quizId.includes('merkurius') || q.quizId.includes('venus') || 
            q.quizId.includes('bumi') || q.quizId.includes('mars')
        );
        
        const biologyQuizzes = moduleProgress.completedQuizzes.filter(q => 
            q.quizId.includes('tumbuhan') || q.quizId.includes('virus') || 
            q.quizId.includes('saraf') || q.quizId.includes('ekosistem')
        );
        
        const totalPhysicsModules = 4;
        const totalBiologyModules = 4;
        
        UserProfile.progress.physics = Math.round((physicsQuizzes.length / totalPhysicsModules) * 100);
        UserProfile.progress.biology = Math.round((biologyQuizzes.length / totalBiologyModules) * 100);
        
        UserProfile.completedModules = physicsQuizzes.length + biologyQuizzes.length;
        UserProfile.totalPoints = UserProfile.completedModules * 100; // Asumsi 100 poin per modul
        UserProfile.level = Math.floor(UserProfile.totalPoints / 500) + 1;
        
        // Hitung ulang pencapaian yang sudah dibuka berdasarkan daftar
        UserProfile.achievements = UserProfile.achievementList.filter(a => a.unlocked).length;

        // Periksa apakah ada pencapaian baru yang terbuka
        checkModuleAchievements(UserProfile.completedModules);
        checkQuizMasterAchievement(moduleProgress.completedQuizzes);
        
        saveUserProfile(); // Simpan progres yang dihitung ulang
    }
    
    // ========================================
    // ACHIEVEMENT SYSTEM (ENHANCED)
    // ========================================
    
    function checkModuleAchievements(completedCount) {
        if (completedCount >= 1) {
            unlockAchievement('first_step');
        }
        if (completedCount >= 5) {
            unlockAchievement('bookworm');
        }
        if (completedCount >= 8) { // Asumsi 4 fisika + 4 biologi
            unlockAchievement('champion');
        }
    }
    
    function checkQuizMasterAchievement(completedQuizzes) {
        const perfectScores = completedQuizzes.filter(q => q.score === 100);
        
        if (perfectScores.length >= 3) {
            unlockAchievement('quiz_master');
        }
    }
    
    function unlockAchievement(achievementId) {
        const achievement = UserProfile.achievementList.find(a => a.id === achievementId);
        
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            UserProfile.achievements++; // Update hitungan
            
            showToast(`🎉 Pencapaian baru: ${achievement.name}!`, 'success');
            
            // --- PERUBAHAN IKON DI SINI ---
            addActivity(`Membuka pencapaian: ${achievement.name}`, achievement.icon); // Gunakan ID Ikon
            
            saveUserProfile();
            renderAchievements(); // Render ulang grid pencapaian
            animateValue('achievements', UserProfile.achievements - 1, UserProfile.achievements, 500); // Animasikan angka
        }
    }
    
    // ========================================
    // ACTIVITY TRACKING
    // ========================================
    
    // --- PERUBAHAN IKON DI SINI ---
    function addActivity(title, icon = 'icon-book') { // Default icon '📚' diubah ke 'icon-book'
        const activity = {
            title,
            icon,
            timestamp: new Date().toISOString()
        };
        
        UserProfile.activities.unshift(activity);
        
        if (UserProfile.activities.length > 10) {
            UserProfile.activities = UserProfile.activities.slice(0, 10);
        }
        
        saveUserProfile();
        renderActivities(); // Render ulang daftar aktivitas
    }
    
    function formatActivityTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays === 1) return 'Kemarin';
        return `${diffDays} hari yang lalu`;
    }
    
    // ========================================
    // UI RENDERING
    // ========================================
    
    function renderProfile() {
        const userNameEl = document.getElementById('userName');
        const userLevelEl = document.getElementById('userLevel');
        
        if (userNameEl) userNameEl.textContent = UserProfile.name;
        if (userLevelEl) userLevelEl.textContent = UserProfile.level;
        
        // Render nilai statis dulu, baru animasikan
        setValue('completedModules', UserProfile.completedModules);
        setValue('totalPoints', UserProfile.totalPoints);
        setValue('achievements', UserProfile.achievements);
        setValue('streak', UserProfile.streak);
        
        // Animasikan nilai saat dimuat (opsional, bisa dihapus jika terlalu 'ramai')
        // animateValue('completedModules', 0, UserProfile.completedModules, 1000);
        // animateValue('totalPoints', 0, UserProfile.totalPoints, 1000);
        // animateValue('achievements', 0, UserProfile.achievements, 1000);
        // animateValue('streak', 0, UserProfile.streak, 1000);
        
        updateProgressBar('physics', UserProfile.progress.physics);
        updateProgressBar('biology', UserProfile.progress.biology);
        
        renderAchievements();
        renderActivities();
    }

    function setValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
    
    function animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Jika tidak ada perubahan, jangan animasikan
        if (start === end) {
             element.textContent = end;
             return;
        }

        const range = end - start;
        const increment = (range / duration) * 16; // Hitung per frame (sekitar 16ms)
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    function updateProgressBar(subject, percentage) {
        const bar = document.getElementById(`${subject}Bar`);
        const percent = document.getElementById(`${subject}Percent`);
        
        if (bar && percent) {
            setTimeout(() => { // Beri sedikit jeda agar terlihat
                bar.style.width = `${percentage}%`;
                percent.textContent = `${percentage}%`;
            }, 100);
        }
    }
    
    function renderAchievements() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;
        
        // --- PERUBAHAN RENDER DI SINI ---
        grid.innerHTML = UserProfile.achievementList.map(ach => `
            <div classclass="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">
                    <svg class="icon icon-xl"><use href="#${ach.icon}"></use></svg>
                </div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
            </div>
        `).join('');
    }
    
    function renderActivities() {
        const list = document.getElementById('activityList');
        if (!list) return;
        
        if (UserProfile.activities.length === 0) {
            list.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <svg class="icon icon-lg"><use href="#icon-book"></use></svg>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Belum ada aktivitas</div>
                        <div class="activity-time">Mulai belajar sekarang!</div>
                    </div>
                </div>
            `;
            return;
        }
        
        // --- PERUBAHAN RENDER DI SINI ---
        list.innerHTML = UserProfile.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <svg class="icon icon-lg"><use href="#${activity.icon}"></use></svg>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${formatActivityTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // ========================================
    // TOAST NOTIFICATIONS
    // ========================================
    
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // (Gaya toast sekarang ada di components.css)
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.style.opacity = '1');
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // ========================================
    // EDIT PROFILE
    // ========================================
    
    function showEditProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Profil</h3>
                    <button class="modal-close" aria-label="Tutup">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label for="editName">Nama</label>
                        <input type="text" id="editName" value="${UserProfile.name}" class="form-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">Batal</button>
                    <button class="btn btn-primary-green modal-save">Simpan</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-save').addEventListener('click', () => {
            const newName = document.getElementById('editName').value.trim();
            if (newName) {
                UserProfile.name = newName;
                saveUserProfile();
                renderProfile(); // Cukup render ulang, tidak perlu animas
                showToast('Profil berhasil diperbarui!', 'success');
                modal.remove();
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // ========================================
    // LOGOUT CONFIRMATION
    // ========================================
    
    function confirmLogout() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Konfirmasi Keluar</h3>
                    <button class="modal-close" aria-label="Tutup">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Apakah Anda yakin ingin keluar dari akun?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">Batal</button>
                    <button class="btn btn-danger modal-confirm">Ya, Keluar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            showToast('Berhasil keluar. Sampai jumpa!', 'success');
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 1500);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    // ========================================
    // AUTO REFRESH ON STORAGE CHANGE
    // ========================================
    
    function setupStorageListener() {
        // Fungsi ini penting jika Anda membuka 2 tab
        window.addEventListener('storage', function(e) {
            if (e.key === 'urworld_module_progress' || e.key === 'urworld_profile') {
                console.log('Storage updated from other tab, refreshing profile...');
                loadUserProfile(); // Muat ulang data dari storage
                renderProfile(); // Render ulang UI
            }
        });
    }
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    function init() {
        loadUserProfile(); // Muat data
        renderProfile(); // Tampilkan data
        
        setupStorageListener(); // Dengarkan perubahan
        
        // Pasang event listener ke tombol statis
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', showEditProfileModal);
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', confirmLogout);
        }
        
        const avatarEditBtn = document.querySelector('.avatar-edit-btn');
        if (avatarEditBtn) {
            avatarEditBtn.addEventListener('click', () => {
                showToast('Fitur ganti avatar akan segera hadir!', 'info');
            });
        }
        
        console.log('%cUR WORLD Profile Loaded (Auto-Update & SVG Enabled)', 'color: #4caf50; font-weight: bold;');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose fungsi refresh agar bisa dipanggil dari quizbaru.js
    window.URWorldProfile = {
        addActivity,
        unlockAchievement,
        showToast,
        loadUserProfile,
        saveUserProfile,
        refresh: () => {
            console.log('Profile refresh called from quiz...');
            loadUserProfile(); // Muat ulang data terbaru
            renderProfile(); // Render ulang UI dengan data baru
        }
    };
    
})();