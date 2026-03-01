const Achievement = require('../models/Achievement');
const Profile = require('../models/Profile');
const Vocabulary = require('../models/Vocabulary');
const Grammar = require('../models/Grammar');
const Conversation = require('../models/Conversation');
const Text = require('../models/Text');
const Song = require('../models/Song');
const Movie = require('../models/Movie');
const Flashcard = require('../models/Flashcard');
const IrregularVerb = require('../models/IrregularVerb');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const {
  getAchievementsWithProgress,
  initializeAchievements,
  CATEGORY_TO_STAT
} = require('../utils/achievementHelper');

// ─── Obtener conteos actuales de todos los componentes ────────────────────

const getCurrentCounts = async (userId) => {
  const [
    vocabulary,
    grammar,
    conversation,
    text,
    song,
    movie,
    flashcard,
    irregularVerb
  ] = await Promise.all([
    Vocabulary.countDocuments({ user: userId }),
    Grammar.countDocuments({ user: userId }),
    Conversation.countDocuments({ user: userId }),
    Text.countDocuments({ user: userId }),
    Song.countDocuments({ user: userId }),
    Movie.countDocuments({ user: userId }),
    Flashcard.countDocuments({ user: userId }),
    IrregularVerb.countDocuments({ user: userId })
  ]);

  const profile = await Profile.findOne({ user: userId });
  const streak = profile?.statistics?.streakDays || 0;

  return {
    vocabulary,
    grammar,
    conversation,
    text,
    song,
    movie,
    flashcard,
    irregularVerb,
    streak
  };
};

// ─── Obtener todos los logros del usuario ─────────────────────────────────

exports.getAllAchievements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, unlocked } = req.query;

    const counts = await getCurrentCounts(userId);
    let achievements = await getAchievementsWithProgress(userId, counts);

    // Filtrar por categoría
    if (category) {
      const validCategories = Object.keys(CATEGORY_TO_STAT);
      if (!validCategories.includes(category)) {
        const error = new AppError('Categoría de logro inválida', 400);
        return next(error);
      }
      achievements = achievements.filter(a => a.category === category);
    }

    // Filtrar por estado de desbloqueo
    if (unlocked !== undefined) {
      const isUnlocked = unlocked === 'true';
      achievements = achievements.filter(a => a.unlocked === isUnlocked);
    }

    const totalUnlocked = achievements.filter(a => a.unlocked).length;

    res.status(200).json({
      success: true,
      count: achievements.length,
      totalUnlocked,
      achievements
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo logros: ${error.message}`);
    next(error);
  }
};

// ─── Obtener logros por categoría ─────────────────────────────────────────

exports.getByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const userId = req.user.id;

    const validCategories = Object.keys(CATEGORY_TO_STAT);
    if (!validCategories.includes(category)) {
      const error = new AppError('Categoría de logro inválida', 400);
      return next(error);
    }

    const counts = await getCurrentCounts(userId);
    const allAchievements = await getAchievementsWithProgress(userId, counts);
    const achievements = allAchievements.filter(a => a.category === category);

    const unlocked = achievements.filter(a => a.unlocked).length;

    res.status(200).json({
      success: true,
      category,
      count: achievements.length,
      unlocked,
      achievements
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo logros por categoría: ${error.message}`);
    next(error);
  }
};

// ─── Obtener estadísticas de logros ───────────────────────────────────────

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Asegurar que los logros existan
    await initializeAchievements(userId);

    const profile = await Profile.findOne({ user: userId });

    const totalAchievements = await Achievement.countDocuments({ user: userId });
    const unlockedAchievements = await Achievement.countDocuments({ user: userId, unlocked: true });

    // Contar por categoría
    const byCategory = await Achievement.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          unlocked: { $sum: { $cond: ['$unlocked', 1, 0] } }
        }
      }
    ]);

    // Total XP ganado por logros
    const totalXpFromAchievements = await Achievement.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), unlocked: true } },
      { $group: { _id: null, total: { $sum: '$xpReward' } } }
    ]);

    // Últimos logros desbloqueados
    const recentAchievements = await Achievement.find({
      user: userId,
      unlocked: true
    })
      .sort({ unlockedDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalAchievements,
        unlockedAchievements,
        completionPercentage: totalAchievements > 0
          ? Math.round((unlockedAchievements / totalAchievements) * 100)
          : 0,
        experience: profile?.experience || 0,
        level: profile?.level || 1,
        totalXpFromAchievements: totalXpFromAchievements[0]?.total || 0,
        streak: {
          current: profile?.statistics?.streakDays || 0,
          longest: profile?.statistics?.longestStreak || 0,
          lastLogin: profile?.statistics?.lastLoginDate
        },
        byCategory,
        recentAchievements
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};
