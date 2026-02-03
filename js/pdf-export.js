/**
 * Power Rangers RPG Character Creator - PDF Export
 * Version: 2.13
 *
 * This file handles PDF generation and export functionality.
 *
 * FUTURE IMPLEMENTATION NOTE:
 * This module is stubbed for future fillable PDF support.
 * The planned approach is to:
 * 1. Load a pre-made fillable PDF template
 * 2. Use pdf-lib to fill in the form fields
 * 3. Download the filled PDF
 *
 * Required dependencies:
 * - pdf-lib (https://pdf-lib.js.org/)
 *
 * For fillable PDF implementation, you'll need:
 * 1. A PDF template with form fields (AcroForm)
 * 2. Field names that match the character data properties
 */

'use strict';

// =============================================================================
// PDF EXPORT CONFIGURATION
// =============================================================================

const PDF_EXPORT_CONFIG = {
    // Template file path (update this when you have a fillable PDF template)
    templatePath: null, // e.g., './assets/character-sheet-template.pdf'

    // Field mapping from character data to PDF form fields
    // Update these when you create your fillable PDF template
    fieldMapping: {
        // Basic Info
        'characterName': 'name',
        'characterConcept': 'concept',
        'characterLevel': 'level',
        'characterOrigin': null, // Will be resolved from origin key
        'characterRole': null,   // Will be resolved from role key

        // Essence Scores
        'essenceStrength': null,
        'essenceSpeed': null,
        'essenceSmarts': null,
        'essenceSocial': null,

        // Defenses
        'defenseToughness': null,
        'defenseEvasion': null,
        'defenseWillpower': null,
        'defenseCleverness': null,

        // Resources
        'maxHealth': null,
        'maxPower': null,
        'groundMovement': null,

        // Skills (will need individual field names for each skill)
        // 'skillAthletics': null,
        // 'skillBrawn': null,
        // etc.

        // Perks, Powers, Equipment (multi-line text fields)
        'perksText': null,
        'gridPowersText': null,
        'equipmentText': null,
        'influencesText': null,

        // Zord
        'zordName': null,
        'zordType': null,
        'zordFeatures': null
    }
};

// =============================================================================
// PDF GENERATION (Current Implementation - Image-based)
// =============================================================================

/**
 * Exports character to PDF using the current image-based approach.
 * This will be replaced when fillable PDF support is implemented.
 *
 * @param {object} character - The character data
 * @param {object} gameData - The game data (origins, roles, etc.)
 * @returns {Promise<void>}
 */
async function exportToPDF(character, gameData) {
    try {
        // Check if pdf-lib is loaded
        if (typeof PDFLib === 'undefined') {
            showNotification('PDF library is still loading. Please wait and try again.', 'warning');
            return;
        }

        // Check if fillable template is available
        if (PDF_EXPORT_CONFIG.templatePath) {
            await exportToFillablePDF(character, gameData);
            return;
        }

        // Fall back to notification about future implementation
        showNotification('Fillable PDF export coming soon! Use clipboard export for now.', 'info');

        // For now, you can use the exportCharacter() function to copy to clipboard
        // or implement a basic PDF generation here

    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF: ' + error.message, 'error');
    }
}

// =============================================================================
// FILLABLE PDF IMPLEMENTATION (Future)
// =============================================================================

/**
 * Exports character to a fillable PDF template.
 * This is the preferred method once a template is available.
 *
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {Promise<void>}
 */
async function exportToFillablePDF(character, gameData) {
    try {
        const { PDFDocument } = PDFLib;

        // Load the template PDF
        const templateUrl = PDF_EXPORT_CONFIG.templatePath;
        const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Get the form
        const form = pdfDoc.getForm();

        // Get calculated values
        const finalEssence = calculateFinalEssence(character, gameData);
        const origin = gameData.origins[character.origin];
        const role = gameData.roles[character.role];

        // Fill in basic info fields
        fillTextField(form, 'characterName', character.name);
        fillTextField(form, 'characterConcept', character.concept);
        fillTextField(form, 'characterLevel', String(character.level));
        fillTextField(form, 'characterOrigin', origin?.name || '');
        fillTextField(form, 'characterRole', role?.name || '');

        // Fill in essence scores
        for (const essence of ESSENCE_LIST) {
            const fieldName = `essence${essence}`;
            fillTextField(form, fieldName, String(finalEssence[essence] || 0));
        }

        // Fill in defenses
        for (const [essence, defense] of Object.entries(DEFENSE_BY_ESSENCE)) {
            const value = calculateDefense(finalEssence[essence] || 0);
            fillTextField(form, `defense${defense}`, String(value));
        }

        // Fill in health and power
        const maxHealth = calculateMaxHealth(character, gameData);
        const maxPower = calculatePowerCapacityFromRole(character.level, character.role, gameData);
        fillTextField(form, 'maxHealth', String(maxHealth));
        fillTextField(form, 'maxPower', String(maxPower));

        // Fill in movement
        const movement = origin?.groundMovement || 30;
        fillTextField(form, 'groundMovement', `${movement}ft`);

        // Fill in skills
        fillSkillFields(form, character, gameData);

        // Fill in perks
        const perksText = buildPerksText(character, gameData);
        fillTextField(form, 'perksText', perksText);

        // Fill in grid powers
        const powersText = character.selectedGridPowers.join('\n');
        fillTextField(form, 'gridPowersText', powersText);

        // Fill in influences
        const influencesText = buildInfluencesText(character, gameData);
        fillTextField(form, 'influencesText', influencesText);

        // Fill in equipment
        const equipmentText = buildEquipmentText(character, gameData);
        fillTextField(form, 'equipmentText', equipmentText);

        // Fill in zord info
        if (character.zord) {
            fillTextField(form, 'zordName', character.zord.name || '');
            fillTextField(form, 'zordType', character.zord.teamType || '');
        }

        // Flatten the form (makes fields non-editable) - optional
        // form.flatten();

        // Save and download
        const pdfBytes = await pdfDoc.save();
        downloadPDF(pdfBytes, character.name);

        showNotification('Character sheet PDF generated!', 'success');

    } catch (error) {
        console.error('Fillable PDF error:', error);
        throw error;
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely fills a text field in a PDF form.
 * @param {PDFForm} form - The PDF form
 * @param {string} fieldName - The field name
 * @param {string} value - The value to set
 */
function fillTextField(form, fieldName, value) {
    try {
        const field = form.getTextField(fieldName);
        if (field) {
            field.setText(value || '');
        }
    } catch (error) {
        // Field doesn't exist - that's okay, skip it
        console.debug(`PDF field '${fieldName}' not found`);
    }
}

/**
 * Fills skill fields in the PDF form.
 * @param {PDFForm} form - The PDF form
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 */
function fillSkillFields(form, character, gameData) {
    // Build final skills with role bonuses
    const finalSkills = { ...character.skills };
    const role = gameData.roles[character.role];

    if (role?.startingSkillRanks) {
        for (const [skill, ranks] of Object.entries(role.startingSkillRanks)) {
            finalSkills[skill] = (finalSkills[skill] || 0) + ranks;
        }
    }

    if (character.roleSkillChoice) {
        finalSkills[character.roleSkillChoice] = (finalSkills[character.roleSkillChoice] || 0) + 1;
    }

    // Fill each skill field
    for (const [skill, ranks] of Object.entries(finalSkills)) {
        if (ranks > 0) {
            const fieldName = `skill${skill.replace(/\s+/g, '')}`;
            const dieValue = getSkillDie(ranks);
            fillTextField(form, fieldName, dieValue);
        }
    }
}

/**
 * Builds the perks text for the PDF.
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {string} - Formatted perks text
 */
function buildPerksText(character, gameData) {
    const lines = [];

    // Influence perks
    for (const infKey of character.influences) {
        const influence = gameData.influences[infKey];
        if (influence) {
            lines.push(`${influence.name}: ${influence.perk}`);
        }
    }

    // General perks
    for (const perkName of character.selectedPerks) {
        lines.push(perkName);
    }

    // Level-up perks
    for (const lvl in character.levelUpChoices) {
        const choices = character.levelUpChoices[lvl];
        if (choices?.generalPerk) {
            lines.push(`${choices.generalPerk} (Lvl ${lvl})`);
        }
    }

    return lines.join('\n');
}

/**
 * Builds the influences text for the PDF.
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {string} - Formatted influences text
 */
function buildInfluencesText(character, gameData) {
    const lines = [];

    for (let i = 0; i < character.influences.length; i++) {
        const infKey = character.influences[i];
        const influence = gameData.influences[infKey];
        if (!influence) continue;

        let line = influence.name;

        // Add specialty if present
        if (influence.specialtyTable && character.influenceSpecialties[infKey] !== undefined) {
            const specIndex = character.influenceSpecialties[infKey];
            if (Array.isArray(specIndex)) {
                const specs = specIndex.map(idx => influence.specialtyTable.options[idx]);
                line += ` (${specs.join(', ')})`;
            } else {
                line += ` (${influence.specialtyTable.options[specIndex]})`;
            }
        }

        // Mark first influence as free (no hang-up)
        if (i === 0) {
            line += ' [Free]';
        }

        lines.push(line);
    }

    return lines.join('\n');
}

/**
 * Builds the equipment text for the PDF.
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {string} - Formatted equipment text
 */
function buildEquipmentText(character, gameData) {
    const lines = [];
    const role = gameData.roles[character.role];

    if (role?.equipment) {
        for (const item of role.equipment) {
            lines.push(item);
        }
    }

    return lines.join('\n');
}

/**
 * Calculates max health for a character.
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {number} - Max health
 */
function calculateMaxHealth(character, gameData) {
    const origin = gameData.origins[character.origin];
    const baseHealth = origin?.startingHealth || 0;

    // Add conditioning ranks
    let conditioningRanks = character.skills['Conditioning'] || 0;

    // Add role starting conditioning if any
    const role = gameData.roles[character.role];
    if (role?.startingSkillRanks?.['Conditioning']) {
        conditioningRanks += role.startingSkillRanks['Conditioning'];
    }

    // Add level-up conditioning
    for (const lvl in character.levelUpChoices) {
        const choices = character.levelUpChoices[lvl];
        if (choices?.skillRanks) {
            for (const sr of choices.skillRanks) {
                if (sr.skill === 'Conditioning') {
                    conditioningRanks++;
                }
            }
        }
    }

    return baseHealth + conditioningRanks;
}

/**
 * Calculates power capacity from role data.
 * @param {number} level - Character level
 * @param {string} roleKey - The role key
 * @param {object} gameData - The game data
 * @returns {number} - Power capacity
 */
function calculatePowerCapacityFromRole(level, roleKey, gameData) {
    if (!roleKey || !gameData.roles[roleKey]) return 2;

    const role = gameData.roles[roleKey];
    let capacityType = POWER_CAPACITY_TYPES.SLOW;

    if (role.powerCapacityGrowth?.includes('Fast')) {
        capacityType = POWER_CAPACITY_TYPES.FAST;
    } else if (role.powerCapacityGrowth?.includes('Moderate')) {
        capacityType = POWER_CAPACITY_TYPES.MODERATE;
    }

    return calculatePowerCapacity(level, capacityType);
}

/**
 * Downloads a PDF blob.
 * @param {Uint8Array} pdfBytes - The PDF data
 * @param {string} characterName - The character name for filename
 */
function downloadPDF(pdfBytes, characterName) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${characterName || 'Character'}_PowerRangers.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}

// =============================================================================
// CLIPBOARD EXPORT (Alternative)
// =============================================================================

/**
 * Exports character data to clipboard as formatted text.
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {Promise<void>}
 */
async function exportToClipboard(character, gameData) {
    try {
        const text = buildCharacterText(character, gameData);
        await navigator.clipboard.writeText(text);
        showNotification('Character copied to clipboard!', 'success');
    } catch (error) {
        console.error('Clipboard error:', error);
        showNotification('Failed to copy to clipboard.', 'error');
    }
}

/**
 * Builds formatted character text for clipboard/print.
 * @param {object} character - The character data
 * @param {object} gameData - The game data
 * @returns {string} - Formatted text
 */
function buildCharacterText(character, gameData) {
    const lines = [];
    const finalEssence = calculateFinalEssence(character, gameData);
    const origin = gameData.origins[character.origin];
    const role = gameData.roles[character.role];

    lines.push('═'.repeat(50));
    lines.push('POWER RANGERS RPG CHARACTER SHEET');
    lines.push('═'.repeat(50));
    lines.push('');

    // Basic Info
    lines.push(`Name: ${character.name || 'Unnamed Ranger'}`);
    lines.push(`Level: ${character.level}`);
    lines.push(`Origin: ${origin?.name || 'None'}`);
    lines.push(`Role: ${role?.name || 'None'}`);
    lines.push(`Concept: ${character.concept || 'None'}`);
    lines.push('');

    // Essence Scores
    lines.push('─'.repeat(30));
    lines.push('ESSENCE SCORES');
    lines.push('─'.repeat(30));
    for (const essence of ESSENCE_LIST) {
        const value = finalEssence[essence] || 0;
        const defense = DEFENSE_BY_ESSENCE[essence];
        const defValue = calculateDefense(value);
        lines.push(`${essence}: ${value} (${defense}: ${defValue})`);
    }
    lines.push('');

    // Add more sections as needed...

    lines.push('═'.repeat(50));

    return lines.join('\n');
}

// =============================================================================
// EXPORTS
// =============================================================================

// If using ES6 modules:
// export {
//     exportToPDF,
//     exportToFillablePDF,
//     exportToClipboard,
//     PDF_EXPORT_CONFIG
// };
