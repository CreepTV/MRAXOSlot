// account.js - Extended Account Management Functions
import { getCurrentUser, getUserData, updateUserStats, updateUserBalance } from './firebase.js';

// Account utility functions for slot games and other features

export async function getUserProfile() {
    const user = getCurrentUser();
    if (!user) return null;
    
    const userData = await getUserData(user.uid);
    return {
        uid: user.uid,
        email: user.email,
        ...userData
    };
}

export async function updateGameStats(gameData) {
    const user = getCurrentUser();
    if (!user) return;
    
    const currentData = await getUserData(user.uid);
    if (!currentData) return;
    
    const updatedStats = {
        gamesPlayed: (currentData.gamesPlayed || 0) + 1,
        totalWinnings: (currentData.totalWinnings || 0) + (gameData.winAmount || 0),
        lastPlayed: new Date(),
        ...gameData.additionalStats
    };
    
    await updateUserStats(user.uid, updatedStats);
}

export async function addAchievement(achievementId, achievementData) {
    const user = getCurrentUser();
    if (!user) return;
    
    const currentData = await getUserData(user.uid);
    if (!currentData) return;
    
    const achievements = currentData.achievements || [];
    
    // Check if achievement already exists
    if (achievements.find(a => a.id === achievementId)) {
        return; // Already has this achievement
    }
    
    achievements.push({
        id: achievementId,
        unlockedAt: new Date(),
        ...achievementData
    });
    
    await updateUserStats(user.uid, { achievements });
}

export async function saveUserBalance(newBalance) {
    const user = getCurrentUser();
    if (!user) {
        // Guest mode - save to localStorage
        localStorage.setItem('slot1_balance', newBalance.toString());
        return;
    }
    
    await updateUserBalance(user.uid, newBalance);
}

export function isLoggedIn() {
    return getCurrentUser() !== null && localStorage.getItem('isGuestMode') !== 'true';
}

export function isGuestMode() {
    return localStorage.getItem('isGuestMode') === 'true' || getCurrentUser() === null;
}