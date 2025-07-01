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
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    console.log('🔧 Firebase config:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        apiKey: firebaseConfig.apiKey.substring(0, 10) + '...'
    });
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Firebase Auth Settings
console.log('🔧 Firebase Auth instance:', auth);
console.log('🔧 Firebase Auth settings:', {
    tenantId: auth.tenantId,
    languageCode: auth.languageCode,
    emulatorConfig: auth.emulatorConfig
});

// Debug: Check Firebase Auth methods
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ User is signed in:', user.email);
        console.log('🆔 User UID:', user.uid);
    } else {
        console.log('ℹ️ User is signed out');
    }
});

// Auth State Management
let currentUser = null;

// User Data Management
async function createUserProfile(user, additionalData = {}) {
    if (!user) {
        console.error('❌ Cannot create profile: no user provided');
        return null;
    }
    
    console.log('👤 Creating user profile for:', user.email);
    
    const userRef = db.collection('users').doc(user.uid);
    
    try {
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            const { email, uid } = user;
            const createdAt = new Date();
            
            // Check for existing guest balance
            const existingGuestBalance = parseInt(localStorage.getItem('slot_player_balance')) || 1000;
            
            const profileData = {
                uid,
                email,
                username: additionalData.username || email.split('@')[0],
                balance: existingGuestBalance, // Verwende Guest-Balance als Startwert
                createdAt,
                gamesPlayed: 0,
                totalWinnings: 0,
                achievements: [],
                settings: {
                    soundEnabled: true,
                    musicEnabled: true,
                    notifications: true
                }
            };
            
            await userRef.set(profileData);
            console.log('✅ User profile created successfully for:', email, 'with balance:', existingGuestBalance);
        } else {
            console.log('ℹ️ User profile already exists for:', user.email);
        }
        
        return userRef;
    } catch (error) {
        console.error('❌ Error creating user profile:', error);
        throw error; // Re-throw so calling function can handle it
    }
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

async function checkUserExists(email) {
    console.log('🔍 Checking if user exists:', email);
    
    try {
        // Firebase doesn't provide a direct way to check if email exists
        // We'll use fetchSignInMethodsForEmail which is deprecated but still works
        const methods = await auth.fetchSignInMethodsForEmail(email);
        console.log('🔍 Sign-in methods for', email, ':', methods);
        
        return {
            exists: methods.length > 0,
            methods: methods
        };
    } catch (error) {
        console.error('❌ Error checking user existence:', error);
        
        // If the method is not available, return uncertain
        return {
            exists: null,
            error: error.message
        };
    }
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
    console.log('🚀 Attempting to register user:', email);
    console.log('🔧 Password length:', password.length);
    console.log('🔧 Email format valid:', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    console.log('🔧 Username:', username);
    
    // Zusätzliche Validierung
    if (!email || email.trim() === '') {
        console.error('❌ Empty email provided');
        return { success: false, error: 'auth/invalid-email', message: 'E-Mail-Adresse darf nicht leer sein.' };
    }
    
    if (!password || password.length < 6) {
        console.error('❌ Invalid password provided');
        return { success: false, error: 'auth/weak-password', message: 'Das Passwort muss mindestens 6 Zeichen lang sein.' };
    }
    
    // Email normalisieren
    email = email.trim().toLowerCase();
    console.log('🔧 Normalized email:', email);
    
    try {
        console.log('🔥 Creating user with Firebase Auth...');
        console.log('🔧 Using auth instance:', !!auth);
        console.log('🔧 Auth currentUser before:', auth.currentUser);
        
        // Warte kurz für Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Erstelle den User
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ User created successfully!');
        console.log('🆔 User UID:', userCredential.user.uid);
        console.log('📧 User email:', userCredential.user.email);
        console.log('✅ User credential object:', {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            emailVerified: userCredential.user.emailVerified
        });
        
        try {
            // Erstelle User-Profil in Firestore
            console.log('📄 Creating user profile in Firestore...');
            await createUserProfile(userCredential.user, { username });
            console.log('✅ User profile created successfully');
        } catch (profileError) {
            console.error('⚠️ User created but profile creation failed:', profileError);
            // User wurde bereits erstellt, aber Profil-Erstellung fehlgeschlagen
            // Trotzdem als Erfolg behandeln, da der User existiert
        }
        
        // Setze den currentUser
        currentUser = userCredential.user;
        console.log('✅ Current user set:', currentUser.email);
        
        console.log('✅ Registration completed successfully for:', email);
        return { success: true, user: userCredential.user };
        
    } catch (error) {
        console.error('❌ Registration error details:');
        console.error('   - Error object:', error);
        console.error('   - Error code:', error.code);
        console.error('   - Error message:', error.message);
        
        // Versuche herauszufinden, ob der User trotzdem erstellt wurde
        try {
            console.log('🔍 Checking if user was created despite error...');
            const methods = await auth.fetchSignInMethodsForEmail(email);
            console.log('📧 Sign-in methods after error:', methods);
            if (methods && methods.length > 0) {
                console.log('⚠️ User was created despite error! Treating as success.');
                // User existiert bereits - versuche anzumelden
                try {
                    const loginResult = await auth.signInWithEmailAndPassword(email, password);
                    console.log('✅ Auto-login successful after failed registration');
                    return { success: true, user: loginResult.user };
                } catch (loginError) {
                    console.error('❌ Auto-login failed:', loginError);
                }
            }
        } catch (checkError) {
            console.log('ℹ️ Could not check if user exists:', checkError.code);
        }
        
        // Standard Fehlerbehandlung
        let errorMessage = 'Registrierung fehlgeschlagen.';
        let errorCode = error.code || 'unknown';
        
        switch (errorCode) {
            case 'auth/operation-not-allowed':
                errorMessage = 'E-Mail/Passwort-Authentifizierung ist nicht aktiviert.';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Das Passwort ist zu schwach.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Ungültige E-Mail-Adresse.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.';
                break;
            default:
                errorMessage = `Registrierung fehlgeschlagen: ${error.message || errorCode}`;
        }
        
        return { success: false, error: errorCode, message: errorMessage };
    }
}

async function loginUser(email, password) {
    console.log('🚀 Attempting to login user:', email);
    console.log('🔍 Password length:', password ? password.length : 'undefined');
    console.log('🔍 Email format valid:', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ User logged in successfully:', userCredential.user.email);
        console.log('🆔 User UID:', userCredential.user.uid);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('❌ Login error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Zusätzliche Debug-Informationen
        if (error.code === 'auth/invalid-credential') {
            console.log('🔍 Invalid credential details:');
            console.log('- Email:', email);
            console.log('- Password provided:', !!password);
            console.log('- Error suggests either email not found or wrong password');
        }
        
        return { success: false, error: error.code || error.message };
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

// Legacy functions für Backward Compatibility
function getLocalBalance() {
    return parseInt(localStorage.getItem('slot_player_balance')) || 1000;
}

function setLocalBalance(balance) {
    localStorage.setItem('slot_player_balance', balance.toString());
}

function migrateLocalToFirebase(user) {
    // Diese Funktion wird jetzt vom balanceManager.js gehandhabt
    console.log('Migration handled by BalanceManager');
}

function getCurrentUser() {
    return auth.currentUser;
}

// Debug function to list all users (development only)
async function debugListUsers() {
    console.log('🔍 Debug: Attempting to list users...');
    
    try {
        // Note: This only works if we have users in Firestore
        const usersSnapshot = await db.collection('users').limit(10).get();
        console.log('👥 Users in database:');
        
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            console.log(`- ${userData.email} (${userData.username}) - Balance: ${userData.balance}`);
        });
        
        if (usersSnapshot.empty) {
            console.log('❌ No users found in database');
        }
    } catch (error) {
        console.error('❌ Error listing users:', error);
    }
}

// Make debug function available in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugListUsers = debugListUsers;
    console.log('🛠️ Debug mode: Use debugListUsers() to see registered users');
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
    migrateLocalToFirebase,
    checkUserExists
};