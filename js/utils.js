/**
 * Power Rangers RPG Character Creator - Utility Functions
 * Version: 2.13
 *
 * This file contains reusable helper functions, input sanitization,
 * error handling, and common operations used throughout the application.
 */

'use strict';

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitizes a string to prevent XSS attacks by escaping HTML special characters.
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') {
        return String(str);
    }
    return str.replace(SANITIZE_REGEX, char => SANITIZE_MAP[char] || char);
}

/**
 * Validates and sanitizes character name input.
 * @param {string} name - The character name to validate
 * @returns {object} - { valid: boolean, sanitized: string, error: string|null }
 */
function validateCharacterName(name) {
    const result = {
        valid: true,
        sanitized: '',
        error: null
    };

    if (!name || typeof name !== 'string') {
        result.valid = false;
        result.error = VALIDATION_MESSAGES.nameRequired;
        return result;
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
        result.valid = false;
        result.error = VALIDATION_MESSAGES.nameRequired;
        return result;
    }

    if (trimmed.length > GAME_CONSTANTS.maxNameLength) {
        result.valid = false;
        result.error = VALIDATION_MESSAGES.nameTooLong;
        return result;
    }

    result.sanitized = sanitizeHTML(trimmed);
    return result;
}

/**
 * Validates and sanitizes concept/description input.
 * @param {string} text - The text to validate
 * @returns {object} - { valid: boolean, sanitized: string, error: string|null }
 */
function validateTextInput(text, maxLength = GAME_CONSTANTS.maxConceptLength) {
    const result = {
        valid: true,
        sanitized: '',
        error: null
    };

    if (!text || typeof text !== 'string') {
        result.sanitized = '';
        return result;
    }

    const trimmed = text.trim();

    if (trimmed.length > maxLength) {
        result.valid = false;
        result.error = `Text must be ${maxLength} characters or less.`;
        return result;
    }

    result.sanitized = sanitizeHTML(trimmed);
    return result;
}

// =============================================================================
// LOCAL STORAGE HELPERS (with error handling)
// =============================================================================

/**
 * Safely saves data to localStorage with error handling.
 * @param {string} key - The storage key
 * @param {any} data - The data to store (will be JSON stringified)
 * @returns {boolean} - True if successful, false otherwise
 */
function safeStorageSave(key, data) {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('Storage save error:', error);
        // Check for quota exceeded
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            showNotification('Storage full. Unable to save character.', 'error');
        }
        return false;
    }
}

/**
 * Safely loads data from localStorage with error handling.
 * @param {string} key - The storage key
 * @param {any} defaultValue - Default value if key doesn't exist or parse fails
 * @returns {any} - The parsed data or default value
 */
function safeStorageLoad(key, defaultValue = null) {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) {
            return defaultValue;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Storage load error:', error);
        showNotification('Error loading saved data. Starting fresh.', 'warning');
        return defaultValue;
    }
}

/**
 * Safely removes data from localStorage.
 * @param {string} key - The storage key to remove
 * @returns {boolean} - True if successful
 */
function safeStorageRemove(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Storage remove error:', error);
        return false;
    }
}

// =============================================================================
// NOTIFICATION SYSTEM
// =============================================================================

/**
 * Shows a temporary notification message to the user.
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'warning', or 'info'
 * @param {number} duration - How long to show the message (ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notifications
    const existing = document.querySelector('.notification-toast');
    if (existing) {
        existing.remove();
    }

    const colors = {
        success: '#4ecdc4',
        error: '#ff6b6b',
        warning: '#ffaa00',
        info: '#00f0ff'
    };

    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: #0a0a12;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        font-family: 'Orbitron', sans-serif;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
        font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// =============================================================================
// GAME CALCULATION HELPERS
// =============================================================================

/**
 * Gets the skill die for a given number of ranks.
 * @param {number} ranks - Number of skill ranks
 * @returns {string} - The dice notation (e.g., "d6")
 */
function getSkillDie(ranks) {
    if (ranks < 0 || ranks >= DICE_PROGRESSION.length) {
        return DICE_PROGRESSION[0];
    }
    return DICE_PROGRESSION[ranks];
}

/**
 * Calculates defense value from essence score.
 * @param {number} essenceScore - The essence score
 * @returns {number} - The defense value
 */
function calculateDefense(essenceScore) {
    return GAME_CONSTANTS.baseDefense + essenceScore;
}

/**
 * Calculates power capacity based on level and capacity type.
 * @param {number} level - Character level
 * @param {string} capacityType - 'slow', 'moderate', or 'fast'
 * @returns {number} - Power capacity
 */
function calculatePowerCapacity(level, capacityType) {
    let base = GAME_CONSTANTS.basePowerCapacity;

    switch (capacityType) {
        case POWER_CAPACITY_TYPES.FAST:
            base += Math.floor((level - 1) / 4) * 2;
            break;
        case POWER_CAPACITY_TYPES.MODERATE:
            base += Math.floor((level - 1) / 3);
            break;
        case POWER_CAPACITY_TYPES.SLOW:
        default:
            base += Math.floor((level - 1) / 5) * 2;
            break;
    }

    return base;
}

/**
 * Gets the essence type for a given skill name.
 * @param {string} skillName - The skill name
 * @param {object} skillsData - The skills data object
 * @returns {string|null} - The essence type or null
 */
function getSkillEssence(skillName, skillsData) {
    for (const [essence, data] of Object.entries(skillsData)) {
        if (data.skills && data.skills.includes(skillName)) {
            return essence;
        }
    }
    return null;
}

// =============================================================================
// TEXT FORMATTING HELPERS
// =============================================================================

/**
 * Wraps text to fit within a maximum character width.
 * @param {string} text - The text to wrap
 * @param {number} maxCharsPerLine - Maximum characters per line
 * @returns {string[]} - Array of lines
 */
function wrapText(text, maxCharsPerLine = PDF_CONFIG.maxCharsPerLine) {
    if (!text) return [];

    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a camelCase or snake_case string to Title Case.
 * @param {string} str - The string to convert
 * @returns {string} - The title case string
 */
function toTitleCase(str) {
    if (!str) return '';
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => capitalize(word.toLowerCase()))
        .join(' ')
        .trim();
}

// =============================================================================
// ARRAY AND OBJECT HELPERS
// =============================================================================

/**
 * Deep clones an object.
 * @param {any} obj - The object to clone
 * @returns {any} - The cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.error('Deep clone error:', error);
        return obj;
    }
}

/**
 * Merges two objects deeply.
 * @param {object} target - The target object
 * @param {object} source - The source object
 * @returns {object} - The merged object
 */
function deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }

    return result;
}

/**
 * Checks if an array includes a value (case-insensitive for strings).
 * @param {any[]} arr - The array to search
 * @param {any} value - The value to find
 * @returns {boolean} - True if found
 */
function includesIgnoreCase(arr, value) {
    if (!Array.isArray(arr)) return false;

    if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        return arr.some(item =>
            typeof item === 'string' && item.toLowerCase() === lowerValue
        );
    }

    return arr.includes(value);
}

// =============================================================================
// DOM HELPERS
// =============================================================================

/**
 * Safely gets an element by ID.
 * @param {string} id - The element ID
 * @returns {HTMLElement|null} - The element or null
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Safely sets innerHTML with sanitization.
 * @param {HTMLElement|string} elementOrId - The element or its ID
 * @param {string} html - The HTML to set (will NOT be sanitized - use for trusted content only)
 */
function setInnerHTML(elementOrId, html) {
    const element = typeof elementOrId === 'string'
        ? getElement(elementOrId)
        : elementOrId;

    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Creates an HTML element with optional attributes and content.
 * @param {string} tag - The tag name
 * @param {object} attributes - Attributes to set
 * @param {string} content - Text content (will be sanitized)
 * @returns {HTMLElement} - The created element
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);

    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('data')) {
            element.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    }

    if (content) {
        element.textContent = content; // Safe - uses textContent, not innerHTML
    }

    return element;
}

// =============================================================================
// DEBOUNCE/THROTTLE
// =============================================================================

/**
 * Creates a debounced version of a function.
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in ms
 * @returns {Function} - The debounced function
 */
function debounce(func, wait = APP_CONFIG.autoSaveDelay) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Creates a throttled version of a function.
 * @param {Function} func - The function to throttle
 * @param {number} limit - The minimum time between calls in ms
 * @returns {Function} - The throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Checks if a character meets a perk prerequisite.
 * @param {string} prereq - The prerequisite string
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {boolean} - True if prerequisite is met
 */
function meetsPrerequisite(prereq, character, gameData) {
    if (!prereq) return true;

    const prereqLower = prereq.toLowerCase();

    // Level requirements
    const levelMatch = prereq.match(/level\s*(\d+)\+?/i);
    if (levelMatch) {
        const requiredLevel = parseInt(levelMatch[1], 10);
        if (character.level < requiredLevel) return false;
    }

    // Essence requirements
    for (const essence of ESSENCE_LIST) {
        const essenceMatch = prereq.match(new RegExp(`${essence}\\s*(\\d+)\\+?`, 'i'));
        if (essenceMatch) {
            const required = parseInt(essenceMatch[1], 10);
            const finalEssence = calculateFinalEssence(character, gameData);
            if ((finalEssence[essence] || 0) < required) return false;
        }
    }

    // Skill requirements
    const skillMatch = prereq.match(/(\w+(?:\s+\w+)?)\s+d(\d+)\+?/i);
    if (skillMatch) {
        const skillName = skillMatch[1];
        const requiredDie = parseInt(skillMatch[2], 10);
        const currentRanks = character.skills[skillName] || 0;
        const dieIndex = DICE_PROGRESSION.findIndex(d => d === `d${requiredDie}`);
        if (currentRanks < dieIndex) return false;
    }

    // Armor training requirements
    if (prereqLower.includes('light armor training')) {
        const roleTraining = gameData.roles[character.role]?.armorTraining || [];
        if (!roleTraining.includes('Light')) return false;
    }
    if (prereqLower.includes('medium armor training')) {
        const roleTraining = gameData.roles[character.role]?.armorTraining || [];
        if (!roleTraining.includes('Medium') && !character.selectedPerks.includes('Medium Armor Shell')) {
            return false;
        }
    }
    if (prereqLower.includes('heavy armor training')) {
        const roleTraining = gameData.roles[character.role]?.armorTraining || [];
        if (!roleTraining.includes('Heavy') && !character.selectedPerks.includes('Heavy Armor Shell')) {
            return false;
        }
    }

    return true;
}

/**
 * Calculates the final essence scores including all bonuses.
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {object} - Final essence scores
 */
function calculateFinalEssence(character, gameData) {
    const result = { ...character.essence };

    // Origin bonus
    if (character.originEssenceChoice) {
        result[character.originEssenceChoice] = (result[character.originEssenceChoice] || 0) + 1;
    }

    // Role adjustments
    if (character.role && gameData.roles[character.role]) {
        const role = gameData.roles[character.role];
        for (const [ess, val] of Object.entries(role.essenceAdjustments || {})) {
            result[ess] = (result[ess] || 0) + val;
        }
    }

    return result;
}

// =============================================================================
// CSS ANIMATION KEYFRAMES (add to document)
// =============================================================================

// Add notification animation keyframes if not already present
(function addAnimationStyles() {
    if (document.getElementById('utils-animations')) return;

    const style = document.createElement('style');
    style.id = 'utils-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();

// =============================================================================
// EXPORTS (for module usage if needed)
// =============================================================================

// If using ES6 modules, uncomment the following:
// export {
//     sanitizeHTML,
//     validateCharacterName,
//     validateTextInput,
//     safeStorageSave,
//     safeStorageLoad,
//     safeStorageRemove,
//     showNotification,
//     getSkillDie,
//     calculateDefense,
//     calculatePowerCapacity,
//     getSkillEssence,
//     wrapText,
//     capitalize,
//     toTitleCase,
//     deepClone,
//     deepMerge,
//     includesIgnoreCase,
//     getElement,
//     setInnerHTML,
//     createElement,
//     debounce,
//     throttle,
//     meetsPrerequisite,
//     calculateFinalEssence
// };
