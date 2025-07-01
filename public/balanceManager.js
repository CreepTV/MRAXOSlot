// Vereinfachtes Balance Management System
// Jeder Spieler hat sein eigenes Geld, das zwischen allen Slot-Maschinen synchronisiert wird

console.log('💰 Loading Simplified Balance Manager...');

class BalanceManager {
    constructor() {
        this.currentBalance = 1000;
        this.isLoggedIn = false;
        this.currentUser = null;
        this.callbacks = [];
        this.STORAGE_KEY = 'player_balance';
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        console.log('💰 Initializing Balance Manager...');
        
        // Lade sofort lokale Balance
        this.loadLocalBalance();
        
        // Warte kurz auf Firebase, dann prüfe Auth
        setTimeout(() => this.checkFirebaseAuth(), 1000);
        
        this.isInitialized = true;
        console.log('💰 Balance Manager initialized with balance:', this.currentBalance);
    }

    async checkFirebaseAuth() {
        try {
            if (window.firebaseAuth && typeof window.firebaseAuth.getCurrentUser === 'function') {
                const user = window.firebaseAuth.getCurrentUser();
                if (user) {
                    console.log('💰 User logged in:', user.email);
                    this.isLoggedIn = true;
                    this.currentUser = user;
                    await this.syncWithFirebase();
                } else {
                    console.log('💰 No user logged in, using local storage');
                }
                
                // Setup auth listener
                this.setupAuthListener();
            } else {
                console.log('💰 Firebase not available, using local storage only');
            }
        } catch (error) {
            console.error('❌ Error checking Firebase auth:', error);
        }
    }

    setupAuthListener() {
        if (window.firebaseAuth && typeof window.firebaseAuth.onAuthChange === 'function') {
            console.log('💰 Setting up Firebase auth listener...');
            window.firebaseAuth.onAuthChange(async (user) => {
                if (user) {
                    console.log('💰 User logged in:', user.email);
                    this.isLoggedIn = true;
                    this.currentUser = user;
                    await this.syncWithFirebase();
                } else {
                    console.log('💰 User logged out');
                    this.isLoggedIn = false;
                    this.currentUser = null;
                    this.loadLocalBalance();
                }
            });
        }
    }

    async syncWithFirebase() {
        try {
            if (!this.currentUser) return;
            
            console.log('💰 Syncing balance with Firebase...');
            
            // Hole Firebase Balance
            const userData = await window.firebaseAuth.getUserData(this.currentUser.uid);
            
            if (userData && typeof userData.balance === 'number') {
                // Firebase hat Balance - verwende diese
                console.log('💰 Using Firebase balance:', userData.balance);
                this.currentBalance = userData.balance;
            } else {
                // Kein Firebase Balance - speichere aktuelle lokale Balance
                console.log('💰 Saving local balance to Firebase:', this.currentBalance);
                await window.firebaseAuth.updateUserBalance(this.currentUser.uid, this.currentBalance);
            }
            
            this.saveLocalBalance();
            this.notifyCallbacks();
        } catch (error) {
            console.error('❌ Error syncing with Firebase:', error);
        }
    }

    loadLocalBalance() {
        // Migration von alten Keys
        const oldBalance1 = parseInt(localStorage.getItem('slot_player_balance')) || 0;
        const oldBalance2 = parseInt(localStorage.getItem('slot1_balance')) || 0;
        const currentBalance = parseInt(localStorage.getItem(this.STORAGE_KEY)) || 0;
        
        // Nehme den höchsten Wert oder 1000 als Default
        this.currentBalance = Math.max(oldBalance1, oldBalance2, currentBalance) || 1000;
        
        // Speichere unter neuem Key und lösche alte
        this.saveLocalBalance();
        localStorage.removeItem('slot_player_balance');
        localStorage.removeItem('slot1_balance');
        localStorage.removeItem('slot1_guest_balance');
        
        console.log('💰 Loaded local balance:', this.currentBalance);
        this.notifyCallbacks();
    }

    saveLocalBalance() {
        localStorage.setItem(this.STORAGE_KEY, this.currentBalance.toString());
        console.log('💰 Saved local balance:', this.currentBalance);
    }

    // API für andere Module
    async getBalance() {
        // Warte bis initialisiert
        let attempts = 0;
        while (!this.isInitialized && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        return this.currentBalance;
    }

    async setBalance(newBalance) {
        const balance = Math.max(0, parseInt(newBalance) || 0);
        this.currentBalance = balance;
        
        console.log('💰 Setting balance to:', balance);
        
        // Speichere lokal
        this.saveLocalBalance();
        
        // Speichere in Firebase wenn eingeloggt
        if (this.isLoggedIn && this.currentUser) {
            try {
                await window.firebaseAuth.updateUserBalance(this.currentUser.uid, balance);
                console.log('💰 Balance saved to Firebase');
            } catch (error) {
                console.error('❌ Error saving to Firebase:', error);
            }
        }
        
        this.notifyCallbacks();
        return balance;
    }

    async adjustBalance(amount) {
        const newBalance = this.currentBalance + amount;
        return await this.setBalance(newBalance);
    }

    // Callback System
    onBalanceChange(callback) {
        this.callbacks.push(callback);
        // Sofort aufrufen mit aktueller Balance
        try {
            callback(this.currentBalance);
        } catch (error) {
            console.error('❌ Error in balance callback:', error);
        }
    }

    notifyCallbacks() {
        this.callbacks.forEach(callback => {
            try {
                callback(this.currentBalance);
            } catch (error) {
                console.error('❌ Error in balance callback:', error);
            }
        });
    }

    // Utility-Funktionen
    async canAfford(amount) {
        return this.currentBalance >= amount;
    }

    async deductBalance(amount) {
        if (this.currentBalance >= amount) {
            return await this.adjustBalance(-amount);
        }
        throw new Error('Insufficient balance');
    }

    async addWinnings(amount) {
        return await this.adjustBalance(amount);
    }

    // Debug Info
    getDebugInfo() {
        return {
            currentBalance: this.currentBalance,
            isLoggedIn: this.isLoggedIn,
            isInitialized: this.isInitialized,
            userEmail: this.currentUser ? this.currentUser.email : null
        };
    }
}

// Erstelle globale Instanz
const balanceManager = new BalanceManager();

// Global verfügbar machen
window.balanceManager = balanceManager;

// Legacy-Support für bestehenden Code
window.globalBalance = balanceManager;
window.getCurrentBalance = () => balanceManager.getBalance();
window.setBalance = (balance) => balanceManager.setBalance(balance);
window.adjustBalance = (amount) => balanceManager.adjustBalance(amount);
window.updateUserBalance = (balance) => balanceManager.setBalance(balance);

console.log('✅ Simplified Balance Manager loaded and ready');
