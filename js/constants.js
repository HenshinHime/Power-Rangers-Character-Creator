/**
 * Power Rangers RPG Character Creator - Constants
 * Version: 2.13
 *
 * This file contains all magic values, configuration constants, and
 * application-wide settings. Centralizing these values makes the
 * codebase easier to maintain and modify.
 */

'use strict';

// =============================================================================
// APPLICATION CONFIGURATION
// =============================================================================

const APP_CONFIG = {
    version: '2.13',
    storageKey: 'prpgCharacter',
    autoSaveDelay: 500, // milliseconds
    maxLevel: 20,
    minLevel: 1,
    totalSteps: 10
};

// =============================================================================
// GAME MECHANICS CONSTANTS
// =============================================================================

const GAME_CONSTANTS = {
    // Essence and skill allocation
    essencePointsAtLevel1: 16,
    freeEssencePointsAtLevel1: 12,
    baseDefense: 10,
    basePowerCapacity: 2,

    // Influence limits
    maxInfluences: 3,
    freeInfluences: 1,

    // Skill limits
    maxSkillRanks: 6,

    // Character name limits
    maxNameLength: 50,
    maxConceptLength: 500
};

// =============================================================================
// DICE PROGRESSION
// =============================================================================

const DICE_PROGRESSION = ["-", "d2", "d4", "d6", "d8", "d10", "d12"];

// =============================================================================
// ESSENCE TYPES
// =============================================================================

const ESSENCE_TYPES = {
    STRENGTH: 'Strength',
    SPEED: 'Speed',
    SMARTS: 'Smarts',
    SOCIAL: 'Social'
};

const ESSENCE_LIST = Object.values(ESSENCE_TYPES);

// =============================================================================
// DEFENSE TYPES (mapped to essences)
// =============================================================================

const DEFENSE_BY_ESSENCE = {
    Strength: 'Toughness',
    Speed: 'Evasion',
    Smarts: 'Willpower',
    Social: 'Cleverness'
};

// =============================================================================
// ARMOR TRAINING
// =============================================================================

const ARMOR_TYPES = {
    LIGHT: 'Light',
    MEDIUM: 'Medium',
    HEAVY: 'Heavy',
    ULTRA_HEAVY: 'Ultra-Heavy'
};

const ARMOR_BONUSES = {
    'Light': 1,
    'Medium': 2,
    'Heavy': 4,
    'Ultra-Heavy': 6
};

// =============================================================================
// LEVEL PROGRESSION MILESTONES
// =============================================================================

const LEVEL_MILESTONES = {
    generalPerkLevels: [4, 8, 12, 16, 19],
    zordGrowthLevels: [5, 10, 15, 20],
    gridPowerLevels: [6, 11, 16]
};

// =============================================================================
// POWER CAPACITY FORMULAS
// =============================================================================

const POWER_CAPACITY_TYPES = {
    SLOW: 'slow',      // +2 per 5 levels
    MODERATE: 'moderate', // +1 per 3 levels
    FAST: 'fast'       // +2 per 4 levels
};

// =============================================================================
// ROLE COLORS
// =============================================================================

const ROLE_COLORS = {
    red: '#e31837',
    blue: '#0057b8',
    yellow: '#ffd700',
    pink: '#ff69b4',
    green: '#00a651',
    black: '#2d2d2d',
    white: '#f0f0f0'
};

// =============================================================================
// STEP NAMES
// =============================================================================

const STEP_NAMES = [
    'Concept',
    'Origin',
    'Role',
    'Influences',
    'Essence',
    'Skills',
    'Perks',
    'Zord',
    'Level Up',
    'Sheet'
];

// =============================================================================
// RESOURCE COLORS
// =============================================================================

const RESOURCE_COLORS = {
    health: {
        high: '#4ecdc4',
        medium: '#ffaa00',
        low: '#ff6b6b'
    },
    power: '#0080ff',
    ideaPoints: '#0057b8',
    quipsSpeechs: '#2d2d2d',
    zord: '#9b59b6'
};

// =============================================================================
// ZORD BASELINE STATISTICS
// =============================================================================

const BASELINE_ZORD_STATS = {
    size: 'Huge',
    health: 6,
    strength: 6,
    speed: 4,
    toughness: 17,
    evasion: 14,
    groundMovement: 40,
    armor: 1
};

// =============================================================================
// PDF CONFIGURATION
// =============================================================================

const PDF_CONFIG = {
    pageWidth: 612,  // 8.5 inches * 72 DPI
    pageHeight: 810, // Approximate height
    fontSize: {
        large: 12,
        normal: 10,
        small: 8,
        tiny: 7,
        micro: 6
    },
    maxCharsPerLine: 55
};

// =============================================================================
// VALIDATION MESSAGES
// =============================================================================

const VALIDATION_MESSAGES = {
    nameRequired: 'Please enter a character name.',
    nameTooLong: `Character name must be ${GAME_CONSTANTS.maxNameLength} characters or less.`,
    originRequired: 'Please select an Origin.',
    roleRequired: 'Please select a Role.',
    essencePointsRemaining: 'You have unspent Essence points.',
    skillPointsRemaining: 'You have unspent Skill points.',
    invalidCharacter: 'Invalid character in input.',
    storageError: 'Error saving character data.',
    loadError: 'Error loading character data.'
};

// =============================================================================
// SPECIAL CHARACTERS REGEX (for input sanitization)
// =============================================================================

const SANITIZE_REGEX = /[<>&"']/g;
const SANITIZE_MAP = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
};

// =============================================================================
// DEFAULT CHARACTER STATE
// =============================================================================

const DEFAULT_CHARACTER = {
    name: '',
    concept: '',
    level: 1,
    origin: null,
    originEssenceChoice: null,
    role: null,
    roleSkillChoice: null,
    influences: [],
    influenceHangUpChoices: {},
    influenceBonds: {},
    influenceSpecialties: {},
    essence: {
        Strength: 1,
        Speed: 1,
        Smarts: 1,
        Social: 1
    },
    skills: {},
    skillSpecializations: {},
    selectedPerks: [],
    selectedGridPowers: [],
    equipmentChoices: {},
    greenWeaponChoice: null,
    zord: {
        name: '',
        teamType: null,
        spectrumFeature: null,
        additionalFeatures: [],
        description: '',
        growthChoices: {}
    },
    levelUpChoices: {},
    morphed: false,
    resources: {
        currentHealth: null,
        currentPower: null,
        currentIdeaPoints: null,
        currentQuipsSpeechs: null,
        currentZordHealth: null
    }
};

// =============================================================================
// EXPORTS (for module usage if needed)
// =============================================================================

// If using ES6 modules, uncomment the following:
// export {
//     APP_CONFIG,
//     GAME_CONSTANTS,
//     DICE_PROGRESSION,
//     ESSENCE_TYPES,
//     ESSENCE_LIST,
//     DEFENSE_BY_ESSENCE,
//     ARMOR_TYPES,
//     ARMOR_BONUSES,
//     LEVEL_MILESTONES,
//     POWER_CAPACITY_TYPES,
//     ROLE_COLORS,
//     STEP_NAMES,
//     RESOURCE_COLORS,
//     BASELINE_ZORD_STATS,
//     PDF_CONFIG,
//     VALIDATION_MESSAGES,
//     SANITIZE_REGEX,
//     SANITIZE_MAP,
//     DEFAULT_CHARACTER
// };
