(function () {
    'use strict';

    // ========================================
    // CONFIG
    // ========================================
    const CONFIG = {
        API_BASE: '/api',
        STORAGE_PREFIX: 'urworld_',
        DAILY_RESET_MS: 86400000,
        LEADERBOARD_LIMIT: 10,
        CERTIFICATE_THRESHOLD: 80
    };

    const BADGES = {
        FIRST_STEP: { name: 'First Step', icon: '🎯', points: 50 },
        SPEED_DEMON: { name: 'Speed Demon', icon: '⚡', points: 100 },
        PERFECT_SCORE: { name: 'Perfect Score', icon: '💯', points: 150 },
        STREAK_MASTER: { name: 'Streak Master', icon: '🔥', points: 200 },
        MODULE_MASTER: { name: 'Module Master', icon: '📚', points: 300 },
        QUIZ_CHAMPION: { name: 'Quiz Champion', icon: '👑', points: 500 }
    };

    // ========================================
    // STORAGE HELPERS (lebih aman)
    // ========================================
    const Storage = {
        get(key, fallback = null) {
            try {
                const data = localStorage.getItem(`${CONFIG.STORAGE_PREFIX}${key}`);
                return data ? JSON.parse(data) : fallback;
            } catch {
                return fallback;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(`${CONFIG.STORAGE_PREFIX}${key}`, JSON.stringify(value));
            } catch (err) {
                console.error(`Storage error: ${key}`, err);
            }
        }
    };

    // ========================================
    // DASHBOARD STATE
    // ========================================
    const DashboardState = {
        userData: null,

        init() {
            this.userData = Storage.get('profile', this.defaultUser());
        },

        defaultUser() {
            return {
                name: 'Pengguna UR WORLD',
                email: '',
                level: 1,
                xp: 0,
                totalPoints: 0,
                completedModules: 0,
                perfectQuizzes: 0,
                streak: 0,
                badges: [],
                joinDate: new Date().toISOString()
            };
        },

        save() {
            Storage.set('profile', this.userData);
        }
    };

    // ========================================
    // DAILY CHALLENGE
    // ========================================
    const DailyChallenge = {
        generate() {
            const challenges = [
                { id: 'complete_quiz', title: 'Quiz Master', description: 'Selesaikan 1 kuis hari ini', icon: '📝', reward: 50, type: 'quiz', target: 1 },
                { id: 'perfect_score', title: 'Perfect Day', description: 'Dapatkan skor 100%', icon: '💯', reward: 100, type: 'perfect', target: 1 },
                { id: 'read_modules', title: 'Knowledge Seeker', description: 'Baca 2 modul', icon: '📚', reward: 75, type: 'module', target: 2 },
                { id: 'speed_run', title: 'Speed Runner', description: 'Kuis dalam 60 detik', icon: '⚡', reward: 150, type: 'speed', target: 60 }
            ];

            const today = new Date().toDateString();
            const seed = [...today].reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0);
            const choice = challenges[Math.abs(seed) % challenges.length];

            return { ...choice, date: today, progress: 0, completed: false, rewarded: false };
        },

        updateProgress(type, value) {
            let challenge = Storage.get('daily_challenge');

            if (!challenge || challenge.date !== new Date().toDateString()) {
                challenge = this.generate();
            }

            if (challenge.type === type && !challenge.completed) {
                if (type === 'speed') {
                    if (value <= challenge.target) challenge.completed = true;
                } else {
                    challenge.progress = Math.min(challenge.progress + 1, challenge.target);
                    if (challenge.progress >= challenge.target) challenge.completed = true;
                }

                if (challenge.completed && !challenge.rewarded) {
                    this.reward(challenge);
                    challenge.rewarded = true;
                }

                Storage.set('daily_challenge', challenge);
                this.render(challenge);
            }

            return challenge;
        },

        reward(challenge) {
            DashboardState.init();
            DashboardState.userData.totalPoints += challenge.reward;
            DashboardState.userData.xp += challenge.reward;
            DashboardState.save();
        },

        render(challenge) {
            const el = document.getElementById('dailyChallengeContainer');
            if (!el) return;

            const progress = (challenge.progress / challenge.target) * 100;

            el.innerHTML = `
                <div class="daily-challenge-card ${challenge.completed ? 'completed' : ''}">
                    <div class="challenge-header">
                        <span class="challenge-icon">${challenge.icon}</span>
                        <div>
                            <h3>${challenge.title}</h3>
                            <p>${challenge.description}</p>
                        </div>
                        <div class="challenge-reward">+${challenge.reward} XP</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${progress}%"></div>
                    </div>
                    <div class="progress-text">${challenge.progress}/${challenge.target}</div>
                </div>`;
        }
    };

    // ========================================
    // LEADERBOARD (diringkas)
    // ========================================
    const Leaderboard = {
        generateMock() {
            const names = [
                'Budi Santoso', 'Ani Wijaya', 'Citra Dewi', 'Dimas Pratama',
                'Eka Putri', 'Fajar Rahman', 'Gita Sari', 'Hadi Kusuma',
                'Indah Lestari', 'Joko Widodo'
            ];

            DashboardState.init();
            const user = DashboardState.userData;

            const data = names.map((n, i) => ({
                name: n,
                points: 1000 - i * 100,
                level: Math.floor((1000 - i * 100) / 500) + 1
            }));

            data.push({
                name: user.name,
                points: user.totalPoints,
                level: user.level,
                isCurrentUser: true
            });

            return data
                .sort((a, b) => b.points - a.points)
                .slice(0, CONFIG.LEADERBOARD_LIMIT)
                .map((entry, i) => ({ ...entry, rank: i + 1 }));
        },

        render(data) {
            const container = document.getElementById('leaderboardContainer');
            if (!container) return;

            container.innerHTML = `
                <div class="leaderboard-card">
                    <h2>🏆 Leaderboard</h2>
                    ${data
                        .map(
                            e => `
                        <div class="leaderboard-entry ${e.isCurrentUser ? 'current-user' : ''}">
                            <span class="rank">${e.rank <= 3 ? ['🥇','🥈','🥉'][e.rank-1] : '#' + e.rank}</span>
                            <span class="name">${e.name}</span>
                            <span class="points">${e.points} XP</span>
                        </div>
                    `
                        )
                        .join('')}
                </div>`;
        }
    };

    // ========================================
    // EXPORT / INIT
    // ========================================
    DashboardState.init();

})();
