const Achievement = require('../models/Achievement');
const Profile = require('../models/Profile');
const logger = require('./logger');

// ─── Configuración de milestones por componente ────────────────────────────

const COMPONENT_MILESTONES = [10, 30, 50, 100, 250, 500, 1000];

const COMPONENT_XP = {
    10: 50,
    30: 100,
    50: 150,
    100: 300,
    250: 500,
    500: 750,
    1000: 1500
};

const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];

const STREAK_XP = {
    7: 200,
    14: 400,
    30: 800,
    60: 1500,
    90: 2500,
    180: 5000,
    365: 10000
};

// ─── Configuración de nombres y iconos por categoría ──────────────────────

const CATEGORY_CONFIG = {
    vocabulary: {
        label: 'Vocabulario',
        unit: 'palabras',
        icons: { 10: '📝', 30: '📖', 50: '📚', 100: '🎯', 250: '💎', 500: '👑', 1000: '🏆' }
    },
    grammar: {
        label: 'Gramática',
        unit: 'reglas',
        icons: { 10: '✏️', 30: '📐', 50: '📏', 100: '🎯', 250: '💎', 500: '👑', 1000: '🏆' }
    },
    conversation: {
        label: 'Conversaciones',
        unit: 'conversaciones',
        icons: { 10: '💬', 30: '🗣️', 50: '🎙️', 100: '🎯', 250: '💎', 500: '👑', 1000: '🏆' }
    },
    text: {
        label: 'Textos',
        unit: 'textos',
        icons: { 10: '📄', 30: '📑', 50: '📰', 100: '🎯', 250: '💎', 500: '👑', 1000: '🏆' }
    },
    song: {
        label: 'Canciones',
        unit: 'canciones',
        icons: { 10: '🎵', 30: '🎶', 50: '🎸', 100: '🎯', 250: '💎', 500: '👑', 1000: '🏆' }
    },
    movie: {
        label: 'Películas',
        unit: 'películas',
        icons: { 10: '🎬', 30: '📽️', 50: '🎥', 100: '🎯', 250: '💎', 500: '👑', 1000: '🏆' }
    },
    flashcard: {
        label: 'Flashcards',
        unit: 'flashcards',
        icons: { 10: '🃏', 30: '🗂️', 50: '📇', 100: '🎯', 250: '💎', 500: '👑', 1000: '🏆' }
    },
    irregularVerb: {
        label: 'Verbos Irregulares',
        unit: 'verbos',
        icons: { 10: '🔤', 30: '📋', 50: '📊', 100: '🎯', 250: '💎', 500: '👑', 1000: '🏆' }
    },
    streak: {
        label: 'Racha Diaria',
        unit: 'días',
        icons: { 7: '🔥', 14: '⚡', 30: '💪', 60: '🌟', 90: '✨', 180: '🌈', 365: '🏅' }
    }
};

// ─── Cálculo de nivel basado en XP ────────────────────────────────────────

const calculateLevel = (xp) => {
    // Cada nivel requiere más XP: nivel N requiere N * 500 XP acumulados
    // Nivel 1: 0 XP, Nivel 2: 500 XP, Nivel 3: 1500 XP, Nivel 4: 3000 XP...
    let level = 1;
    let xpRequired = 0;
    while (xpRequired + level * 500 <= xp) {
        xpRequired += level * 500;
        level++;
    }
    return level;
};

// ─── Inicializar logros para un usuario ───────────────────────────────────

const initializeAchievements = async (userId) => {
    const existingCount = await Achievement.countDocuments({ user: userId });
    if (existingCount > 0) return;

    const achievements = [];

    // Logros por componente
    for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
        if (category === 'streak') continue;

        for (const milestone of COMPONENT_MILESTONES) {
            achievements.push({
                user: userId,
                category,
                milestone,
                title: `${config.label}: ${milestone} ${config.unit}`,
                description: `Alcanzaste ${milestone} ${config.unit} en ${config.label.toLowerCase()}`,
                icon: config.icons[milestone],
                xpReward: COMPONENT_XP[milestone],
                unlocked: false
            });
        }
    }

    // Logros de racha
    const streakConfig = CATEGORY_CONFIG.streak;
    for (const milestone of STREAK_MILESTONES) {
        achievements.push({
            user: userId,
            category: 'streak',
            milestone,
            title: `Racha de ${milestone} días`,
            description: `Mantuviste una racha de inicio de sesión por ${milestone} días consecutivos`,
            icon: streakConfig.icons[milestone],
            xpReward: STREAK_XP[milestone],
            unlocked: false
        });
    }

    try {
        await Achievement.insertMany(achievements);
        logger.info(`✅ ${achievements.length} logros inicializados para usuario ${userId}`);
    } catch (error) {
        // Si hay duplicados parciales, ignorar (ya existen)
        if (error.code !== 11000) {
            logger.error(`❌ Error inicializando logros: ${error.message}`);
            throw error;
        }
    }
};

// ─── Verificar y desbloquear logros por componente ────────────────────────

const checkAndUnlockAchievements = async (userId, category, currentCount) => {
    // Primero asegurar que los logros estén inicializados
    await initializeAchievements(userId);

    const unlockedAchievements = [];

    // Buscar milestones no desbloqueados que el usuario ya superó
    const pendingAchievements = await Achievement.find({
        user: userId,
        category,
        unlocked: false,
        milestone: { $lte: currentCount }
    });

    for (const achievement of pendingAchievements) {
        achievement.unlocked = true;
        achievement.unlockedDate = new Date();
        achievement.updatedAt = new Date();
        await achievement.save();

        // Sumar XP al perfil
        await addExperience(userId, achievement.xpReward);

        unlockedAchievements.push(achievement);
        logger.info(`🏆 Logro desbloqueado: "${achievement.title}" (+${achievement.xpReward} XP) para usuario ${userId}`);
    }

    return unlockedAchievements;
};

// ─── Verificar logros de racha ────────────────────────────────────────────

const checkStreakAchievements = async (userId, currentStreak) => {
    // Asegurar que los logros existan
    await initializeAchievements(userId);

    const unlockedAchievements = [];

    const pendingAchievements = await Achievement.find({
        user: userId,
        category: 'streak',
        unlocked: false,
        milestone: { $lte: currentStreak }
    });

    for (const achievement of pendingAchievements) {
        achievement.unlocked = true;
        achievement.unlockedDate = new Date();
        achievement.updatedAt = new Date();
        await achievement.save();

        await addExperience(userId, achievement.xpReward);

        unlockedAchievements.push(achievement);
        logger.info(`🔥 Logro de racha desbloqueado: "${achievement.title}" (+${achievement.xpReward} XP) para usuario ${userId}`);
    }

    return unlockedAchievements;
};

// ─── Actualizar racha de login ────────────────────────────────────────────

const updateLoginStreak = async (userId) => {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return { streakDays: 0, newAchievements: [] };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastLogin = profile.statistics.lastLoginDate
        ? new Date(profile.statistics.lastLoginDate)
        : null;

    let newStreak = profile.statistics.streakDays;

    if (lastLogin) {
        const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
        const diffTime = today.getTime() - lastLoginDay.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Ya inició sesión hoy, no cambiar racha
            return { streakDays: newStreak, newAchievements: [] };
        } else if (diffDays === 1) {
            // Día consecutivo → incrementar racha
            newStreak += 1;
        } else {
            // Se perdió la racha → reiniciar a 1
            newStreak = 1;
            logger.info(`💔 Racha perdida para usuario ${userId}. Reiniciando a 1 día.`);
        }
    } else {
        // Primera vez → comenzar racha en 1
        newStreak = 1;
    }

    // Actualizar longest streak si aplica
    const longestStreak = Math.max(profile.statistics.longestStreak || 0, newStreak);

    profile.statistics.streakDays = newStreak;
    profile.statistics.longestStreak = longestStreak;
    profile.statistics.lastLoginDate = now;
    profile.statistics.lastActiveDate = now;
    profile.updatedAt = now;
    await profile.save();

    logger.info(`🔥 Racha actualizada a ${newStreak} días para usuario ${userId}`);

    // Verificar logros de racha
    const newAchievements = await checkStreakAchievements(userId, newStreak);

    return { streakDays: newStreak, longestStreak, newAchievements };
};

// ─── Sumar experiencia al perfil ──────────────────────────────────────────

const addExperience = async (userId, xp) => {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return;

    profile.experience = (profile.experience || 0) + xp;
    profile.level = calculateLevel(profile.experience);
    profile.updatedAt = new Date();
    await profile.save();

    logger.info(`⭐ +${xp} XP para usuario ${userId}. Total: ${profile.experience} XP (Nivel ${profile.level})`);
};

// ─── Obtener progreso actual de todos los logros ──────────────────────────

const getAchievementsWithProgress = async (userId, counts) => {
    // Asegurar que los logros estén inicializados
    await initializeAchievements(userId);

    const achievements = await Achievement.find({ user: userId }).sort({ category: 1, milestone: 1 });

    return achievements.map(achievement => {
        const currentCount = counts[achievement.category] || 0;
        const progress = achievement.unlocked
            ? 100
            : Math.min(100, Math.round((currentCount / achievement.milestone) * 100));

        return {
            ...achievement.toObject(),
            currentCount,
            progress
        };
    });
};

// ─── Mapping de categoría a campo de estadística del perfil ───────────────

const CATEGORY_TO_STAT = {
    vocabulary: 'totalVocabulary',
    grammar: 'totalGrammarRules',
    conversation: 'totalConversations',
    text: 'totalTexts',
    song: 'totalSongs',
    movie: 'totalMovies',
    flashcard: 'totalFlashcards',
    irregularVerb: 'totalIrregularVerbs',
    streak: 'streakDays'
};

module.exports = {
    COMPONENT_MILESTONES,
    COMPONENT_XP,
    STREAK_MILESTONES,
    STREAK_XP,
    CATEGORY_CONFIG,
    CATEGORY_TO_STAT,
    calculateLevel,
    initializeAchievements,
    checkAndUnlockAchievements,
    checkStreakAchievements,
    updateLoginStreak,
    addExperience,
    getAchievementsWithProgress
};
