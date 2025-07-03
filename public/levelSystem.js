// Level System for MRAXOSlot Game
// Manages user XP, levels, and slot machine unlocking with Firebase integration

class LevelSystem {
    constructor() {
        this.currentLevel = 1;
        this.currentXP = 0;
        this.isGuest = true;
        this.userId = null;
        this.userData = null;
        this.initialized = false;
        this.pendingXP = 0; // Buffer for XP while not initialized
        
        // Level configuration
        this.levelConfig = {
            maxLevel: 50,
            baseXPRequired: 100,
            xpMultiplier: 1.5,
            slotUnlocks: {
                1: ['SlotMachine1'], // Starting slot (always unlocked)
                3: ['SlotMachine2'],
                5: ['SlotMachine3'],
                8: ['SlotMachine4'],
                12: ['SlotMachine5'],
                16: ['SlotMachine6'],
                20: ['SlotMachine7'],
                25: ['SlotMachine8'],
                30: ['SlotMachine9'],
                35: ['SlotMachine10'],
                40: ['SlotMachine11'],
                45: ['SlotMachine12'],
                50: ['SpecialSlot1'] // Max level unlock
            }
        };
        
        // XP rewards for different actions (improved balance)
        this.xpRewards = {
            spin: 2,           // Base XP per spin (increased from 1)
            smallWin: 3,       // Win less than 5x bet
            mediumWin: 8,      // Win 5-20x bet
            bigWin: 15,        // Win 20-100x bet
            jackpot: 30,       // Win 100x+ bet
            dailyBonus: 100,   // Daily login bonus (increased)
            achievement: 150,  // Special achievements
            firstLogin: 50,    // First time login bonus
            comeback: 25       // Comeback bonus after 3+ days
        };
        
        // Initialize the system
        this.init();
    }
    
    async init() {
        console.log('🎯 Initializing Level System...');
        
        // Wait for Firebase to be available
        await this.waitForFirebase();
        
        // Setup auth state listener
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
        }
        
        // Load initial data (guest mode by default)
        await this.loadUserData();
        
        this.initialized = true;
        
        // Process any pending XP
        if (this.pendingXP > 0) {
            console.log(`🎯 Processing ${this.pendingXP} pending XP`);
            await this.awardXP(this.pendingXP, 'pending_actions');
            this.pendingXP = 0;
        }
        
        console.log('✅ Level System initialized');
    }
    
    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebase && window.firebase.auth && window.firebase.firestore) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }
    
    async onAuthStateChanged(user) {
        console.log('🔄 Auth state changed:', user ? user.email : 'logged out');
        
        if (user) {
            // User logged in
            this.isGuest = false;
            this.userId = user.uid;
            await this.loadUserData();
            await this.syncWithFirebase();
        } else {
            // User logged out - switch to guest mode
            this.isGuest = true;
            this.userId = null;
            this.userData = null;
            await this.loadGuestData();
        }
        
        // Update UI
        this.updateUI();
        this.updateSlotAvailability();
    }
    
    async loadUserData() {
        if (this.isGuest) {
            await this.loadGuestData();
        } else {
            await this.loadFirebaseData();
        }
    }
    
    async loadGuestData() {
        console.log('👤 Loading guest data');
        
        // For guests, always start at level 1 with 0 XP
        this.currentLevel = 1;
        this.currentXP = 0;
        
        console.log('✅ Guest data loaded:', { level: this.currentLevel, xp: this.currentXP });
    }
    
    async loadFirebaseData() {
        if (!this.userId) return;
        
        console.log('☁️ Loading Firebase data for user:', this.userId);
        
        try {
            const db = window.firebase.firestore();
            const userRef = db.collection('users').doc(this.userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                this.userData = userDoc.data();
                this.currentLevel = this.userData.level || 1;
                this.currentXP = this.userData.xp || 0;
                
                console.log('✅ Firebase data loaded:', { 
                    level: this.currentLevel, 
                    xp: this.currentXP 
                });
            } else {
                // First time user - create initial level data
                await this.createInitialLevelData();
            }
        } catch (error) {
            console.error('❌ Error loading Firebase data:', error);
            // Fallback to level 1
            this.currentLevel = 1;
            this.currentXP = 0;
        }
    }
    
    async createInitialLevelData() {
        if (!this.userId) return;
        
        console.log('🆕 Creating initial level data for user');
        
        try {
            const db = window.firebase.firestore();
            const userRef = db.collection('users').doc(this.userId);
            
            const initialData = {
                level: 1,
                xp: 0,
                totalXP: 0,
                unlockedSlots: ['SlotMachine1'],
                achievements: [],
                lastDailyBonus: null,
                levelUpHistory: [],
                updatedAt: new Date()
            };
            
            await userRef.update(initialData);
            
            this.currentLevel = 1;
            this.currentXP = 0;
            this.userData = { ...this.userData, ...initialData };
            
            console.log('✅ Initial level data created');
        } catch (error) {
            console.error('❌ Error creating initial level data:', error);
        }
    }
    
    async syncWithFirebase() {
        if (this.isGuest || !this.userId) return;
        
        try {
            const db = window.firebase.firestore();
            const userRef = db.collection('users').doc(this.userId);
            
            const updateData = {
                level: this.currentLevel,
                xp: this.currentXP,
                totalXP: this.getTotalXP(),
                unlockedSlots: this.getUnlockedSlots(),
                updatedAt: new Date()
            };
            
            await userRef.update(updateData);
            console.log('☁️ Data synced to Firebase:', updateData);
        } catch (error) {
            console.error('❌ Error syncing to Firebase:', error);
        }
    }
    
    // Public method for slot games to award XP
    async awardXP(amount, reason = 'game_action') {
        if (!this.initialized) {
            // Buffer XP if not initialized yet
            this.pendingXP += amount;
            console.log(`🎯 Buffering ${amount} XP for later (system not initialized)`);
            return false;
        }
        
        // Allow XP for guests, but only store it in memory
        // if (this.isGuest) {
        //    console.log('👤 XP not awarded in guest mode');
        //    return false;
        // }
        
        if (!amount || amount <= 0) return false;
        
        console.log(`🎯 Awarding ${amount} XP for: ${reason}`);
        
        const oldLevel = this.currentLevel;
        this.currentXP += amount;
        
        // Check for level up
        let leveledUp = false;
        while (this.currentLevel < this.levelConfig.maxLevel) {
            const xpNeededForNext = this.getXPRequiredForLevel(this.currentLevel + 1);
            const currentLevelProgress = this.getCurrentLevelProgress();
            
            if (currentLevelProgress.current >= currentLevelProgress.needed) {
                this.currentLevel++;
                this.currentXP = currentLevelProgress.current - currentLevelProgress.needed;
                leveledUp = true;
                console.log(`🎯 Leveled up to ${this.currentLevel}!`);
            } else {
                break;
            }
        }
        
        if (leveledUp) {
            await this.levelUp(oldLevel, this.currentLevel);
        }
        
        // Sync with Firebase only if not a guest
        if (!this.isGuest) {
            await this.syncWithFirebase();
        }
        
        // Update UI
        this.updateUI();
        
        return true;
    }
    
    // Award XP based on spin result (improved logic)
    async awardSpinXP(betAmount, winAmount) {
        // Remove the early return for guests to allow them to gain XP
        // if (this.isGuest) return false;
        
        let xpAmount = this.xpRewards.spin; // Base spin XP
        
        // Bet amount bonus (higher bets = more XP)
        const betBonus = Math.floor(betAmount / 100); // 1 extra XP per 100 coins bet
        xpAmount += Math.min(betBonus, 5); // Cap at 5 bonus XP
        
        if (winAmount > 0) {
            const winMultiplier = winAmount / betAmount;
            
            if (winMultiplier >= 100) {
                xpAmount += this.xpRewards.jackpot;
            } else if (winMultiplier >= 20) {
                xpAmount += this.xpRewards.bigWin;
            } else if (winMultiplier >= 5) {
                xpAmount += this.xpRewards.mediumWin;
            } else {
                xpAmount += this.xpRewards.smallWin;
            }
            
            // Bonus XP for very large wins
            if (winAmount >= 10000) {
                xpAmount += 10; // Bonus for huge wins
            }
        }
        
        return await this.awardXP(xpAmount, `spin_result (bet: ${betAmount}, win: ${winAmount})`);
    }
    
    // Calculate level based on total XP
    calculateLevel(totalXP) {
        let level = 1;
        let xpNeeded = 0;
        
        while (level < this.levelConfig.maxLevel) {
            const xpForNextLevel = this.getXPRequiredForLevel(level + 1);
            if (totalXP >= xpNeeded + xpForNextLevel) {
                xpNeeded += xpForNextLevel;
                level++;
            } else {
                break;
            }
        }
        
        return level;
    }
    
    // Get XP required for a specific level
    getXPRequiredForLevel(level) {
        if (level <= 1) return 0;
        return Math.floor(this.levelConfig.baseXPRequired * Math.pow(this.levelConfig.xpMultiplier, level - 2));
    }
    
    // Get total XP needed to reach current level
    getTotalXPForLevel(level) {
        let totalXP = 0;
        for (let i = 2; i <= level; i++) {
            totalXP += this.getXPRequiredForLevel(i);
        }
        return totalXP;
    }
    
    // Get XP progress for current level
    getCurrentLevelProgress() {
        const totalXP = this.getTotalXP();
        const currentLevelStartXP = this.getTotalXPForLevel(this.currentLevel);
        const nextLevelStartXP = this.getTotalXPForLevel(this.currentLevel + 1);
        
        const currentLevelXP = totalXP - currentLevelStartXP;
        const xpNeededForNextLevel = nextLevelStartXP - currentLevelStartXP;
        
        return {
            current: currentLevelXP,
            needed: xpNeededForNextLevel,
            percentage: Math.floor((currentLevelXP / xpNeededForNextLevel) * 100)
        };
    }
    
    // Get total XP earned
    getTotalXP() {
        if (this.userData && this.userData.totalXP) {
            return this.userData.totalXP;
        }
        return this.getTotalXPForLevel(this.currentLevel) + this.currentXP;
    }
    
    // Handle level up (improved with multiple level support)
    async levelUp(oldLevel, newLevel) {
        console.log(`🎉 LEVEL UP! ${oldLevel} → ${newLevel}`);
        
        // Update level up history
        if (!this.isGuest && this.userData) {
            if (!this.userData.levelUpHistory) this.userData.levelUpHistory = [];
            this.userData.levelUpHistory.push({
                fromLevel: oldLevel,
                toLevel: newLevel,
                timestamp: new Date(),
                totalXP: this.getTotalXP()
            });
        }
        
        // Check for new slot unlocks
        const newUnlocks = this.checkForNewUnlocks(oldLevel, newLevel);
        if (newUnlocks.length > 0) {
            this.showUnlockNotification(newUnlocks);
        }
        
        // Show level up notification
        this.showLevelUpNotification(oldLevel, newLevel);
        
        // Update slot availability
        this.updateSlotAvailability();
        
        // Award level up bonus (small balance bonus)
        if (window.balanceManager && newLevel % 5 === 0) {
            const bonus = newLevel * 50; // 50 coins per level every 5 levels
            await window.balanceManager.adjustBalance(bonus);
            console.log(`💰 Level ${newLevel} bonus: +${bonus} coins`);
        }
    }
    
    // Check for new slot machine unlocks
    checkForNewUnlocks(oldLevel, newLevel) {
        const newUnlocks = [];
        
        for (let level = oldLevel + 1; level <= newLevel; level++) {
            if (this.levelConfig.slotUnlocks[level]) {
                newUnlocks.push(...this.levelConfig.slotUnlocks[level]);
            }
        }
        
        return newUnlocks;
    }
    
    // Get all unlocked slot machines
    getUnlockedSlots() {
        const unlockedSlots = [];
        
        for (let level = 1; level <= this.currentLevel; level++) {
            if (this.levelConfig.slotUnlocks[level]) {
                unlockedSlots.push(...this.levelConfig.slotUnlocks[level]);
            }
        }
        
        return unlockedSlots;
    }
    
    // Check if a specific slot is unlocked
    isSlotUnlocked(slotId) {
        if (this.isGuest) {
            // Guests can only access the first slot
            return slotId === 'SlotMachine1';
        }
        
        return this.getUnlockedSlots().includes(slotId);
    }
    
    // Get level required to unlock a slot
    getLevelRequiredForSlot(slotId) {
        for (const [level, slots] of Object.entries(this.levelConfig.slotUnlocks)) {
            if (slots.includes(slotId)) {
                return parseInt(level);
            }
        }
        return 999; // Slot not found
    }
    
    // Update slot machine availability in UI
    updateSlotAvailability() {
        console.log('🎰 Updating slot availability');
        
        // Find all slot cards
        const slotCards = document.querySelectorAll('.game-card');
        
        slotCards.forEach((card, index) => {
            const slotId = `SlotMachine${index + 1}`;
            const isUnlocked = this.isSlotUnlocked(slotId);
            
            // Update card appearance
            if (isUnlocked) {
                card.classList.remove('locked');
                card.classList.add('unlocked');
                
                // Enable click events
                card.style.pointerEvents = 'auto';
                card.style.opacity = '1';
                
                // Remove lock overlay if it exists
                const lockOverlay = card.querySelector('.lock-overlay');
                if (lockOverlay) {
                    lockOverlay.remove();
                }
            } else {
                card.classList.remove('unlocked');
                card.classList.add('locked');
                
                // Disable click events
                card.style.pointerEvents = 'none';
                card.style.opacity = '0.5';
                
                // Add lock overlay if it doesn't exist
                if (!card.querySelector('.lock-overlay')) {
                    this.addLockOverlay(card, slotId);
                }
            }
        });
    }
    
    // Add lock overlay to locked slots
    addLockOverlay(card, slotId) {
        const requiredLevel = this.getLevelRequiredForSlot(slotId);
        
        const overlay = document.createElement('div');
        overlay.className = 'lock-overlay';
        overlay.innerHTML = `
            <div class="lock-content">
                <i class="fas fa-lock"></i>
                <p>Level ${requiredLevel} Required</p>
                ${this.isGuest ? '<p class="guest-note">Login required for progression</p>' : ''}
            </div>
        `;
        
        card.appendChild(overlay);
    }
    
    // Update UI elements
    updateUI() {
        // Update level display
        const levelDisplay = document.getElementById('player-level');
        if (levelDisplay) {
            levelDisplay.textContent = this.isGuest ? 'Guest' : `Level ${this.currentLevel}`;
        }
        
        // Update XP bar
        this.updateXPBar();
        
        // Update header info
        this.updateHeaderInfo();
    }
    
    // Update XP progress bar
    updateXPBar() {
        const xpBar = document.getElementById('xp-progress-bar');
        const xpText = document.getElementById('xp-progress-text');
        
        if (!xpBar) return;
        
        const progress = this.getCurrentLevelProgress();
        
        // Update progress bar
        xpBar.style.width = `${progress.percentage}%`;
        
        // Update progress text
        if (xpText) {
            xpText.textContent = `${progress.current}/${progress.needed} XP`;
        }
    }
    
    // Update header information
    updateHeaderInfo() {
        // Update header level number
        const headerLevel = document.getElementById('header-level-number');
        if (headerLevel) {
            headerLevel.textContent = this.currentLevel;
        }
        
        // Update header XP text
        const headerXpText = document.getElementById('header-xp-text');
        if (headerXpText) {
            const progress = this.getCurrentLevelProgress();
            headerXpText.textContent = `${progress.current} XP / ${progress.needed} XP`;
        }
        
        // Update header XP bar
        const headerXpBar = document.querySelector('.xp-progress-fill');
        if (headerXpBar) {
            const progress = this.getCurrentLevelProgress();
            headerXpBar.style.width = `${progress.percentage}%`;
        }
    }
    
    // Show level up notification
    showLevelUpNotification(oldLevel, newLevel) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 LEVEL UP!</h3>
                <p>Level ${oldLevel} → ${newLevel}</p>
                <div class="notification-buttons">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">Awesome!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Show unlock notification
    showUnlockNotification(unlockedSlots) {
        const notification = document.createElement('div');
        notification.className = 'unlock-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🔓 NEW SLOTS UNLOCKED!</h3>
                <p>${unlockedSlots.join(', ')}</p>
                <div class="notification-buttons">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">Cool!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 7 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 7000);
    }
    
    // Daily bonus system (improved)
    async claimDailyBonus() {
        if (this.isGuest) return { success: false, reason: 'guest_mode' };
        
        const now = new Date();
        const lastBonus = this.userData?.lastDailyBonus;
        
        if (lastBonus) {
            const lastBonusDate = new Date(lastBonus.toDate ? lastBonus.toDate() : lastBonus);
            const hoursDiff = Math.floor((now - lastBonusDate) / (1000 * 60 * 60));
            
            if (hoursDiff < 20) { // Allow claiming after 20 hours instead of 24
                return { success: false, reason: 'too_early', nextClaim: new Date(lastBonusDate.getTime() + 20 * 60 * 60 * 1000) };
            }
        }
        
        let bonusXP = this.xpRewards.dailyBonus;
        let bonusCoins = 500; // Base daily bonus
        
        // Streak bonus calculation
        const daysSinceLastBonus = lastBonus ? Math.floor((now - new Date(lastBonus.toDate ? lastBonus.toDate() : lastBonus)) / (1000 * 60 * 60 * 24)) : 999;
        
        if (daysSinceLastBonus === 1) {
            // Consecutive day - streak bonus
            const currentStreak = (this.userData?.dailyStreak || 0) + 1;
            const streakBonus = Math.min(currentStreak * 50, 500); // Max 500 bonus XP
            bonusXP += streakBonus;
            bonusCoins += currentStreak * 100; // Coin streak bonus
            
            console.log(`🔥 Daily streak: ${currentStreak} days (+${streakBonus} XP, +${currentStreak * 100} coins)`);
        } else if (daysSinceLastBonus >= 3) {
            // Comeback bonus
            bonusXP += this.xpRewards.comeback;
            console.log(`🎁 Comeback bonus: +${this.xpRewards.comeback} XP`);
        }
        
        // Award daily bonus XP
        await this.awardXP(bonusXP, 'daily_bonus');
        
        // Award coins
        if (window.balanceManager) {
            await window.balanceManager.adjustBalance(bonusCoins);
        }
        
        // Update daily bonus data
        if (!this.isGuest) {
            try {
                const db = window.firebase.firestore();
                const userRef = db.collection('users').doc(this.userId);
                const updateData = {
                    lastDailyBonus: now,
                    dailyStreak: daysSinceLastBonus === 1 ? (this.userData?.dailyStreak || 0) + 1 : 1,
                    totalDailyBonuses: (this.userData?.totalDailyBonuses || 0) + 1
                };
                
                await userRef.update(updateData);
                
                if (this.userData) {
                    Object.assign(this.userData, updateData);
                }
            } catch (error) {
                console.error('❌ Error updating daily bonus:', error);
            }
        }
        
        return { 
            success: true, 
            xp: bonusXP, 
            coins: bonusCoins, 
            streak: this.userData?.dailyStreak || 1 
        };
    }
    
    // Get player stats
    getPlayerStats() {
        return {
            level: this.currentLevel,
            xp: this.currentXP,
            totalXP: this.getTotalXP(),
            progress: this.getCurrentLevelProgress(),
            unlockedSlots: this.getUnlockedSlots(),
            isGuest: this.isGuest,
            nextUnlock: this.getNextUnlock()
        };
    }
    
    // Get next slot unlock info
    getNextUnlock() {
        const currentUnlocks = this.getUnlockedSlots();
        
        for (const [level, slots] of Object.entries(this.levelConfig.slotUnlocks)) {
            const levelNum = parseInt(level);
            if (levelNum > this.currentLevel) {
                const newSlots = slots.filter(slot => !currentUnlocks.includes(slot));
                if (newSlots.length > 0) {
                    return {
                        level: levelNum,
                        slots: newSlots,
                        levelsToGo: levelNum - this.currentLevel
                    };
                }
            }
        }
        
        return null; // All slots unlocked
    }
}

// Create global instance
window.levelSystem = new LevelSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LevelSystem;
}

console.log('🎯 Level System script loaded');
