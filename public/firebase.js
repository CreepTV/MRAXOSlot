// Firebase Configuration (Compat Version)
const firebaseConfig = {
  apiKey: "AIzaSyCugqadOCZFRKNmeRttjZ40OUYuj-6F_ks",
  authDomain: "clubrey-73a17.firebaseapp.com",
  projectId: "clubrey-73a17",
  storageBucket: "clubrey-73a17.firebasestorage.app",
  messagingSenderId: "59236673476",
  appId: "1:59236673476:web:803189e9ca5ec8edd9a691",
  measurementId: "G-CE08ZCJNN3"
};

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Auth State Management
let currentUser = null;

// User Data Management
async function createUserProfile(user, additionalData = {}) {
    if (!user) return;
    
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
        const { email, uid } = user;
        const createdAt = new Date();
        
        try {
            await userRef.set({
                uid,
                email,
                username: additionalData.username || email.split('@')[0],
                balance: 1000, // Startguthaben
                createdAt,
                gamesPlayed: 0,
                totalWinnings: 0,
                achievements: [],
                settings: {
                    soundEnabled: true,
                    musicEnabled: true,
                    notifications: true
                }
            });
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }
    
    return userRef;
}

async function getUserData(userId) {
    if (!userId) return null;
    
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            return userDoc.data();
        }
    } catch (error) {
        console.error('Error getting user data:', error);
    }
    
    return null;
}

async function updateUserBalance(userId, newBalance) {
    if (!userId) return;
    
    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            balance: newBalance,
            lastUpdated: new Date()
        });
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

async function updateUserStats(userId, stats) {
    if (!userId) return;
    
    try {
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            ...stats,
            lastUpdated: new Date()
        });
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

// Auth Functions
async function registerUser(email, password, username) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await createUserProfile(userCredential.user, { username });
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function logoutUser() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Auth State Listener
function onAuthChange(callback) {
    return auth.onAuthStateChanged(callback);
}

// Local Storage für Gastmodus
function getLocalBalance() {
    return parseInt(localStorage.getItem('slot1_balance')) || 1000;
}

function setLocalBalance(balance) {
    localStorage.setItem('slot1_balance', balance.toString());
}

function migrateLocalToFirebase(user) {
    // Migration von lokalen Daten zu Firebase wenn User sich anmeldet
    // Diese Funktion resettet lokale Daten und nutzt Firebase
    localStorage.removeItem('slot1_balance');
    // Weitere lokale Daten können hier entfernt werden
}

function getCurrentUser() {
    return auth.currentUser;
}

// Global verfügbar machen
window.firebaseAuth = {
    registerUser,
    loginUser,
    logoutUser,
    onAuthChange,
    getUserData,
    updateUserBalance,
    updateUserStats,
    createUserProfile,
    getCurrentUser,
    getLocalBalance,
    setLocalBalance,
    migrateLocalToFirebase
};