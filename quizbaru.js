/* ============================================
   FILE 2: quizbaru.js (FINAL & CLEANED)
   ============================================ */

/**
 * UR WORLD - Enhanced Quiz System v2.0 (FINAL)
 * Integrated with module progress tracking and profile auto-update
 *
 * --- PERUBAHAN ---
 * 1. Logika `getScoreMessage` dan `getStarsHTML` diubah menjadi berbasis persentase.
 * Kini berfungsi untuk kuis dengan jumlah soal berapa pun (tidak hanya 3).
 * 2. Menambahkan lebih banyak variasi pesan feedback.
 */

(function() {
    'use strict';
    
    // ========================================
    // QUIZ STATE
    // ========================================
    
    const QuizState = {
        currentQuestion: 1,
        totalQuestions: 3,
        correctAnswers: 0,
        startTime: null,
        endTime: null,
        timerInterval: null,
        quizId: null,
        moduleId: null,
        answers: []
    };
    
    // ========================================
    // SETTINGS
    // ========================================
    
    function getSettings() {
        try {
            const settings = localStorage.getItem('urworld_settings');
            return settings ? JSON.parse(settings) : {
                quizTimer: false,
                sounds: true,
                showExplanations: true
            };
        } catch {
            return {
                quizTimer: false,
                sounds: true,
                showExplanations: true
            };
        }
    }
    
    // ========================================
    // TIMER FUNCTIONALITY
    // ========================================
    
    function startTimer() {
        const settings = getSettings();
        if (!settings.quizTimer) return;
        
        QuizState.startTime = Date.now();
        
        // Create timer display
        const timerEl = document.createElement('div');
        timerEl.id = 'quizTimer';
        timerEl.className = 'quiz-timer';
        // (Timer styles from settings.css are loaded, so inline style is not needed)
        timerEl.innerHTML = '⏱️ <span id="timerValue">00:00</span>';
        document.body.appendChild(timerEl);
        
        // Update timer every second
        QuizState.timerInterval = setInterval(updateTimer, 1000);
    }
    
    function updateTimer() {
        const elapsed = Math.floor((Date.now() - QuizState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const timerValue = document.getElementById('timerValue');
        if (timerValue) {
            timerValue.textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        
        const timerEl = document.getElementById('quizTimer');
        if (elapsed >= 120 && timerEl && !timerEl.classList.contains('warning')) {
            timerEl.classList.add('warning');
        }
    }
    
    function stopTimer() {
        if (QuizState.timerInterval) {
            clearInterval(QuizState.timerInterval);
            QuizState.timerInterval = null;
        }
        
        QuizState.endTime = Date.now();
        
        const timerEl = document.getElementById('quizTimer');
        if (timerEl) {
            timerEl.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => timerEl.remove(), 500);
        }
    }
    
    function getElapsedTime() {
        if (!QuizState.startTime || !QuizState.endTime) return 0;
        return Math.floor((QuizState.endTime - QuizState.startTime) / 1000);
    }
    
    // ========================================
    // SOUND EFFECTS
    // ========================================
    
    function playSound(type) {
        const settings = getSettings();
        if (!settings.sounds) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

            if (type === 'correct') {
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            } else if (type === 'wrong') {
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            } else if (type === 'complete') {
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
            }
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Audio not supported or failed to play.');
        }
    }
    
    // ========================================
    // QUIZ INITIALIZATION
    // ========================================
    
    function initQuiz() {
        const quizOptions = document.querySelectorAll('.quiz-option');
        const feedbackBox = document.getElementById('feedbackBox');
        const feedbackText = document.getElementById('feedbackText');
        const nextBtn = document.getElementById('nextBtn');
        
        if (quizOptions.length === 0) return;
        
        const path = window.location.pathname;
        QuizState.quizId = path.split('/').pop().replace('.html', '');
        
        const baseQuizId = QuizState.quizId.replace(/-\d+$/, '');
        QuizState.moduleId = baseQuizId.replace('kuis-', 'modul-');
        
        const questionHeader = document.querySelector('.quiz-header h2');
        if (questionHeader) {
            const match = questionHeader.textContent.match(/(\d+) dari (\d+)/);
            if (match) {
                QuizState.currentQuestion = parseInt(match[1]);
                QuizState.totalQuestions = parseInt(match[2]);
            }
        }
        
        if (QuizState.currentQuestion === 1) {
            startTimer();
            // Reset correct answers count for this quiz attempt
            // This relies on script re-execution per page.
            // A more robust SPA would clear this in a state manager.
        }
        
        // Load persistent correct answers count for this session
        const storedScore = sessionStorage.getItem(`${baseQuizId}_score`);
        QuizState.correctAnswers = storedScore ? parseInt(storedScore) : 0;
        
        let answerSelected = false;
        
        quizOptions.forEach(option => {
            option.addEventListener('click', function() {
                if (answerSelected) return;
                
                const isCorrect = this.dataset.correct === 'true';
                answerSelected = true;
                
                QuizState.answers.push({
                    question: QuizState.currentQuestion,
                    correct: isCorrect
                });
                
                if (isCorrect) {
                    QuizState.correctAnswers++;
                    playSound('correct');
                } else {
                    playSound('wrong');
                }

                // Save score to session storage to persist across page loads
                sessionStorage.setItem(`${baseQuizId}_score`, QuizState.correctAnswers);
                
                quizOptions.forEach(opt => {
                    opt.disabled = true;
                    const icon = opt.querySelector('.quiz-icon');
                    
                    if (opt.dataset.correct === 'true') {
                        opt.classList.add('correct');
                        if (icon) icon.innerHTML = '<svg class="icon"><use href="#icon-check"></use></svg>';
                    } else {
                        if (opt === this && !isCorrect) {
                            opt.classList.add('wrong');
                            if (icon) icon.innerHTML = '<svg class="icon"><use href="#icon-close"></use></svg>';
                        } else {
                            opt.style.opacity = '0.6';
                        }
                    }
                });
                
                showFeedback(isCorrect, feedbackBox, feedbackText);
                
                if (nextBtn) {
                    nextBtn.classList.remove('hidden');
                    nextBtn.focus();
                    if (QuizState.currentQuestion === QuizState.totalQuestions) {
                        nextBtn.textContent = 'LIHAT HASIL';
                    }
                }
            });
        });
        
        if (nextBtn) {
            nextBtn.addEventListener('click', handleNext);
        }
    }
    
    // ========================================
    // FEEDBACK DISPLAY
    // ========================================
    
    function showFeedback(isCorrect, feedbackBox, feedbackText) {
        if (!feedbackBox || !feedbackText) return;
        
        const settings = getSettings();
        if (!settings.showExplanations) return;

        feedbackBox.classList.remove('hidden');
        
        if (isCorrect) {
            feedbackBox.classList.add('correct');
            feedbackBox.classList.remove('wrong');
            const messages = [
                '🎉 Benar! Jawaban kamu tepat sekali!',
                '✨ Sempurna! Kamu memahami materinya!',
                '🌟 Hebat! Jawaban yang sangat tepat!',
                '👏 Luar biasa! Terus pertahankan!',
                '💯 Tepat! Kamu menguasai materi ini!'
            ];
            feedbackText.textContent = messages[Math.floor(Math.random() * messages.length)];
        } else {
            feedbackBox.classList.add('wrong');
            feedbackBox.classList.remove('correct');
            feedbackText.textContent = '❌ Kurang tepat. Coba perhatikan jawaban yang benar ya!';
        }
        
        feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // ========================================
    // NAVIGATION
    // ========================================
    
    function handleNext() {
        const nextQuizLink = document.getElementById('nextQuiz');
        
        if (QuizState.currentQuestion === QuizState.totalQuestions) {
            stopTimer();
            showResults();
        } else if (nextQuizLink && nextQuizLink.href && nextQuizLink.href !== '#') {
            window.location.href = nextQuizLink.href;
        } else {
            console.warn('Next quiz link not found.');
            window.history.back();
        }
    }
    
    // ========================================
    // RESULTS DISPLAY (FIXED - AUTO UPDATE PROFILE)
    // ========================================
    
    function showResults() {
        const score = Math.round((QuizState.correctAnswers / QuizState.totalQuestions) * 100);
        const elapsedTime = getElapsedTime();
        const isPassing = score >= 60; // Skor kelulusan
        
        // Hapus skor dari session storage
        const baseQuizId = QuizState.quizId.replace(/-\d+$/, '');
        sessionStorage.removeItem(`${baseQuizId}_score`);
        
        // Save quiz result using ModuleProgress
        if (window.URWorldNav && window.URWorldNav.ModuleProgress) {
            window.URWorldNav.ModuleProgress.markQuizAsCompleted(baseQuizId, score);
        }
        
        saveQuizResult(score, elapsedTime);
        
        if (window.URWorldProfile) {
            setTimeout(() => {
                window.URWorldProfile.refresh();
                console.log('Profile updated after quiz completion');
            }, 500);
        }
        
        if (window.URWorldProfile && isPassing) {
            const quizName = baseQuizId.replace(/-/g, ' ').replace('kuis ', '').trim();
            window.URWorldProfile.addActivity(
                `Selesai kuis: ${quizName} (skor ${score}%)`,
                score === 100 ? '🏆' : '⭐'
            );
        }
        
        playSound('complete');
        
        if (score >= 80 && window.URWorldNav && window.URWorldNav.createConfetti) {
            window.URWorldNav.createConfetti();
        }
        
        // Build results HTML (Menggunakan style dari settings.css)
        const resultsHTML = `
            <div class="quiz-score slide-up">
                <h2>${isPassing ? '🎉 Selamat!' : '💪 Tetap Semangat!'}</h2>
                <div class="score-value">${score}%</div>
                <div class="score-message">${getScoreMessage(score)}</div>
                <div class="stars-rating">
                    ${getStarsHTML(score)}
                </div>
                <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px; backdrop-filter: blur(10px);">
                    <div style="margin-bottom: 10px; font-size: 1.1rem;">
                        <strong>✓ Benar:</strong> ${QuizState.correctAnswers} dari ${QuizState.totalQuestions}
                    </div>
                    ${elapsedTime > 0 ? `<div style="font-size: 1.1rem;"><strong>⏱️ Waktu:</strong> ${formatTime(elapsedTime)}</div>` : ''}
                </div>
                ${isPassing ? 
                    `<div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px;">
                        <div style="font-size: 1.1rem; font-weight: 600;">✨ Modul selanjutnya telah terbuka!</div>
                    </div>` : 
                    `<div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px;">
                        <div style="font-size: 1rem;">Skor minimal 60% untuk membuka modul berikutnya</div>
                    </div>`
                }
                <div class="quiz-results-actions">
                    ${!isPassing ? 
                        `<button onclick="window.location.href = window.location.pathname.replace('-${QuizState.totalQuestions}', '-1')" class="btn btn-secondary" style="background: rgba(255,255,255,0.2); border: 2px solid white;">
                            🔄 Coba Lagi
                        </button>` : ''
                    }
                     <a href="dunia-${baseQuizId.includes('fisika') || baseQuizId.includes('merkurius') ? 'fisika' : 'biologi'}.html" class="btn btn-primary-green" style="background: rgba(255,255,255,0.9); color: #0a4d2f; border: none;">
                        Kembali ke Modul
                    </a>
                    <a href="pilih-dunia.html" class="btn btn-primary-green" style="background: rgba(255,255,255,0.9); color: #0a4d2f; border: none;">
                        🏠 Beranda
                    </a>
                </div>
            </div>
        `;
        
        const quizContainer = document.getElementById('quizContainer');
        if (quizContainer) {
            quizContainer.innerHTML = resultsHTML;
        } else {
            const mainContent = document.querySelector('.app-content-white');
            if (mainContent) {
                mainContent.innerHTML = resultsHTML;
            }
        }
        
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.style.display = 'none';
        }
        
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }
    }
    
    // ========================================
    // HELPER FUNCTIONS (FIXED LOGIC)
    // ========================================

    /**
     * [YANG DIPERBAIKI]
     * Logika pesan skor kini berbasis persentase.
     */
    function getScoreMessage(score) {
        switch (true) {
            case (score === 100):
                return '🏆 Sempurna! Kamu menguasai materi ini dengan baik!';
            case (score >= 80):
                return '⭐ Bagus sekali! Pertahankan semangat belajarmu!';
            case (score >= 60):
                return '👍 Lumayan! Kamu berhasil lulus!';
            case (score >= 30):
                return '🤔 Sedikit lagi! Terus tingkatkan pemahamanmu!';
            default:
                return '💪 Jangan menyerah! Baca lagi modulnya dan coba lagi!';
        }
    }

    /**
     * [YANG DIPERBAIKI]
     * Logika bintang kini berbasis persentase.
     * 3 Bintang: >= 90%
     * 2 Bintang: >= 60%
     * 1 Bintang: >= 30%
     * 0 Bintang: < 30%
     */
    function getStarsHTML(score) {
        const stars = score >= 90 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0;
        let html = '';
        
        for (let i = 0; i < 3; i++) {
            if (i < stars) {
                // Bintang Aktif (menggunakan style dari settings.css)
                html += `<span class="star" style="animation-delay: ${0.1 + i * 0.1}s">⭐</span>`;
            } else {
                // Bintang Non-aktif
                html += '<span class="star" style="opacity: 0.3; filter: grayscale(1); animation: none;">⭐</span>';
            }
        }
        return html;
    }

    // --- FUNGSI FORMAT WAKTU ---
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // ========================================
    // DATA PERSISTENCE
    // ========================================
    
    function saveQuizResult(score, time) {
        try {
            const baseQuizId = QuizState.quizId.replace(/-\d+$/, '');
            const history = JSON.parse(localStorage.getItem('urworld_quiz_history') || '{}');
            
            if (!history[baseQuizId]) {
                history[baseQuizId] = [];
            }
            
            history[baseQuizId].push({
                score,
                time,
                date: new Date().toISOString(),
                perfectScore: score === 100,
                answers: QuizState.answers
            });
            
            if (history[baseQuizId].length > 5) {
                history[baseQuizId] = history[baseQuizId].slice(-5);
            }
            
            localStorage.setItem('urworld_quiz_history', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving quiz result:', error);
        }
    }
    
    // ========================================
    // ADD ANIMATIONS
    // ========================================
    
    function addAnimationStyles() {
        // Styles are now in settings.css, but keep this for keyframes
        // just in case settings.css doesn't load.
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes starPop {
                0% { transform: scale(0) rotate(-180deg); opacity: 0; }
                50% { transform: scale(1.2); }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes fadeIn {
                from { opacity: 0; } to { opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            .slide-up { animation: slideUp 0.5s ease; }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    function init() {
        addAnimationStyles();
        initQuiz();
        console.log('%cUR WORLD Enhanced Quiz System v2.1 Loaded (Percentage Scoring)', 'color: #22c55e; font-weight: bold;');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.addEventListener('beforeunload', () => {
        stopTimer();
    });
    
    window.QuizDebug = {
        getState: () => QuizState,
        getSettings,
        playSound
    };
    
})();