/**
 * Power Rangers RPG Character Creator - PDF Export
 * Version: 2.13
 *
 * This file handles PDF generation using the official fillable character sheet.
 * Uses pdf-lib to fill form fields in the template PDF.
 */

'use strict';

// =============================================================================
// PDF TEMPLATE CONFIGURATION
// =============================================================================

const PDF_TEMPLATE_PATH = 'assets/Power Rangers Fillable Character Sheet.pdf';

// =============================================================================
// FIELD MAPPING - Maps character data to PDF form field names
// =============================================================================

const PDF_FIELD_MAP = {
    // Basic Info
    characterName: 'Character Name',
    pronouns: 'Pronouns',
    description: 'Description',
    languages: 'Languages',
    origin: 'Origin',
    role: 'Role',
    level: 'Level',
    influences: 'Influences',
    hangUps: 'Hang Ups',
    movement: 'Movement',
    personalPower: 'Personal Power',
    health: 'Health',

    // Essence Scores
    strength: 'Strength',
    speed: 'Speed',
    smarts: 'Smarts',
    social: 'Social',

    // Defense Values
    toughness: 'Toughness',
    evasion: 'Evasion',
    willpower: 'Willpower',
    cleverness: 'Cleverness',

    // Essence Breakdown Fields
    strEss: 'Str Ess',
    strPerk: 'Str Perk',
    strArm: 'Str Arm',
    strMorph: 'Str Morph',

    spdEss: 'Spd Ess',
    spdPerk: 'Spd Perk',
    spdBon: 'Spd Bon',
    spdMorph: 'Spd Morph',

    smaEss: 'Sma Ess',
    smaPerk: 'Sma Perk',
    smaBon: 'Sma Bon',
    smaMorph: 'Sma Morph',

    socEss: 'Soc Ess',
    socPerk: 'Soc Perk',
    socBon: 'Soc Bon',
    socMorph: 'Soc Morph',

    // Page 2 Text Areas
    powers: 'POWERS',
    perks: 'PERKS',
    backgroundBonds: 'BACKGROUND BONDS',
    skillNotes: 'SKILL NOTES',
    features: 'FEATURES',
    inventory: 'Inventory',
    notes: 'Notes',

    // Zord
    zordName: 'Zord Name',
    zordStr: 'Zord Str',
    zordSpd: 'Zord Spd',
    zordT: 'Zord T',
    zordEva: 'Zord Eva',
    zordMove: 'Zord Move',
    zordHealth: 'Zord Health',
    zordSize: 'Size'
};

// Skill checkbox mapping: skill name -> checkbox prefix
const SKILL_CHECKBOX_MAP = {
    'Athletics': 'ath',
    'Acrobatics': 'acr',
    'Alertness': 'ale',
    'Animal Handling': 'ani',
    'Brawn': 'bra',
    'Conditioning': 'Cond',  // Note: Capital C
    'Culture': 'cul',
    'Deception': 'dec',
    'Driving': 'dri',
    'Finesse': 'fin',
    'Infiltration': 'inf',
    'Initiative': 'ini',
    'Intimidation': 'int',
    'Might': 'mig',
    'Performance': 'per',
    'Persuasion': 'prs',
    'Science': 'sci',
    'Streetwise': 'str',
    'Survival': 'sur',
    'Targeting': 'tar',
    'Technology': 'tec'
};

// Skill specialization text field mapping
const SKILL_SPEC_MAP = {
    'Athletics': 'Ath Sp',
    'Acrobatics': 'Acr Sp',
    'Alertness': 'Ale Sp',
    'Animal Handling': 'Ani Sp',
    'Brawn': 'Bra Sp',
    'Culture': 'Cul Sp',
    'Deception': 'Dec Sp',
    'Driving': 'Dri Sp',
    'Finesse': 'Fin Sp',
    'Infiltration': 'Inf Sp',
    'Intimidation': 'Int Sp',
    'Might': 'Mig Sp',
    'Performance': 'Per Sp',
    'Persuasion': 'Prs Sp',
    'Science': 'Sci Sp',
    'Streetwise': 'Str Sp',
    'Survival': 'Sur Sp',
    'Targeting': 'Tar Sp',
    'Technology': 'Tec Sp'
};

// =============================================================================
// HELPER FUNCTION (fallback if utils.js not loaded)
// =============================================================================

/**
 * Shows a notification - uses showNotification if available, otherwise alert
 */
function pdfNotify(message, type = 'info') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else if (type === 'error' || type === 'warning') {
        alert(message);
    } else {
        console.log('[PDF Export]', message);
    }
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Exports the character to a filled PDF.
 * @param {object} [char] - The character data object (defaults to global 'character')
 * @param {object} [data] - The game data (defaults to global 'GAME_DATA')
 */
async function exportToPDF(char, data) {
    // Use global variables if not passed (for backward compatibility)
    const character = char || (typeof window !== 'undefined' && window.character) || {};
    const gameData = data || (typeof window !== 'undefined' && window.GAME_DATA) || {};

    // Debug: show that function was called
    console.log('exportToPDF called', { character, gameData });

    try {
        // Check if PDFLib is available
        if (typeof PDFLib === 'undefined') {
            pdfNotify('PDF library is loading. Please wait and try again.', 'warning');
            return;
        }

        console.log('PDFLib loaded, fetching template...');

        const { PDFDocument } = PDFLib;

        // Fetch the template PDF
        const templateUrl = PDF_TEMPLATE_PATH;
        console.log('Fetching:', templateUrl);
        const response = await fetch(templateUrl);

        if (!response.ok) {
            throw new Error(`Failed to load PDF template: ${response.status}`);
        }

        console.log('Template loaded, processing...');

        const templateBytes = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Get the form
        const form = pdfDoc.getForm();

        // Fill the form fields
        await fillBasicInfo(form, character, gameData);
        await fillEssenceAndDefenses(form, character, gameData);
        await fillSkills(form, character, gameData);
        await fillAttacks(form, character, gameData);
        await fillPage2(form, character, gameData);
        await fillZord(form, character, gameData);
        await fillWeaponsAndArmor(form, character, gameData);

        // Save and download
        const pdfBytes = await pdfDoc.save();
        downloadPDF(pdfBytes, character.name || 'Character');

        pdfNotify('Character sheet PDF generated!', 'success');

    } catch (error) {
        console.error('PDF export error:', error);
        pdfNotify('Error generating PDF: ' + error.message, 'error');
    }
}

// =============================================================================
// FORM FILLING FUNCTIONS
// =============================================================================

/**
 * Fills basic character info fields.
 */
async function fillBasicInfo(form, character, gameData) {
    const origin = gameData.origins[character.origin];
    const role = gameData.roles[character.role];

    // Basic text fields
    setTextField(form, 'Character Name', character.name || '');
    setTextField(form, 'Pronouns', character.pronouns || '');
    setTextField(form, 'Description', character.concept || '');
    setTextField(form, 'Origin', origin?.name || '');
    setTextField(form, 'Role', role?.name || '');
    setTextField(form, 'Level', String(character.level || 1));

    // Languages from origin
    const languages = origin?.languages || '';
    setTextField(form, 'Languages', languages);

    // Movement
    const movement = origin?.groundMovement || 30;
    setTextField(form, 'Movement', `${movement}ft`);

    // Personal Power
    const maxPower = getPowerCapacityForExport(character.level, character.role, gameData);
    setTextField(form, 'Personal Power', String(maxPower));

    // Health
    const maxHealth = getMaxHealthForExport(character, gameData);
    setTextField(form, 'Health', String(maxHealth));

    // Influences
    const influenceNames = character.influences.map(key => {
        const inf = gameData.influences[key];
        return inf?.name || key;
    }).join(', ');
    setTextField(form, 'Influences', influenceNames);

    // Hang-ups (from 2nd and 3rd influences)
    const hangUps = [];
    for (let i = 1; i < character.influences.length; i++) {
        const infKey = character.influences[i];
        const inf = gameData.influences[infKey];
        if (inf?.hangUpOptions) {
            const hangUpIdx = character.influenceHangUpChoices?.[infKey] || 0;
            hangUps.push(inf.hangUpOptions[hangUpIdx]);
        }
    }
    setTextField(form, 'Hang Ups', hangUps.join('; '));
}

/**
 * Fills essence scores and defense values.
 */
async function fillEssenceAndDefenses(form, character, gameData) {
    const finalEssence = getFinalEssenceForExport(character, gameData);
    const role = gameData.roles[character.role];
    const armorBonus = getArmorBonusForExport(character, gameData);

    // Strength column
    setTextField(form, 'Strength', String(finalEssence.Strength || 0));
    setTextField(form, 'Str Ess', String(finalEssence.Strength || 0));
    setTextField(form, 'Str Perk', '0');  // Perk bonuses would need tracking
    setTextField(form, 'Str Arm', String(armorBonus));
    const toughness = 10 + (finalEssence.Strength || 0);
    setTextField(form, 'Toughness', String(toughness));
    setTextField(form, 'Str Morph', String(toughness + armorBonus));

    // Speed column
    setTextField(form, 'Speed', String(finalEssence.Speed || 0));
    setTextField(form, 'Spd Ess', String(finalEssence.Speed || 0));
    setTextField(form, 'Spd Perk', '0');
    setTextField(form, 'Spd Bon', '0');
    const evasion = 10 + (finalEssence.Speed || 0);
    setTextField(form, 'Evasion', String(evasion));
    setTextField(form, 'Spd Morph', String(evasion));

    // Smarts column
    setTextField(form, 'Smarts', String(finalEssence.Smarts || 0));
    setTextField(form, 'Sma Ess', String(finalEssence.Smarts || 0));
    setTextField(form, 'Sma Perk', '0');
    setTextField(form, 'Sma Bon', '0');
    const willpower = 10 + (finalEssence.Smarts || 0);
    setTextField(form, 'Willpower', String(willpower));
    setTextField(form, 'Sma Morph', String(willpower));

    // Social column
    setTextField(form, 'Social', String(finalEssence.Social || 0));
    setTextField(form, 'Soc Ess', String(finalEssence.Social || 0));
    setTextField(form, 'Soc Perk', '0');
    setTextField(form, 'Soc Bon', '0');
    const cleverness = 10 + (finalEssence.Social || 0);
    setTextField(form, 'Cleverness', String(cleverness));
    setTextField(form, 'Soc Morph', String(cleverness));
}

/**
 * Fills skill checkboxes and specializations.
 */
async function fillSkills(form, character, gameData) {
    // Build final skills including role bonuses
    const finalSkills = buildFinalSkills(character, gameData);

    for (const [skillName, ranks] of Object.entries(finalSkills)) {
        if (ranks <= 0) continue;

        const checkboxPrefix = SKILL_CHECKBOX_MAP[skillName];
        if (!checkboxPrefix) continue;

        // Check the appropriate dice checkboxes (1-6 = d2, d4, d6, d8, d10, d12)
        for (let i = 1; i <= ranks && i <= 6; i++) {
            const fieldName = `${checkboxPrefix}${i}`;
            setCheckBox(form, fieldName, true);
        }

        // Fill specializations if any
        const specs = character.skillSpecializations?.[skillName] || [];
        const specPrefix = SKILL_SPEC_MAP[skillName];
        if (specPrefix && specs.length > 0) {
            for (let i = 0; i < specs.length && i < 3; i++) {
                setTextField(form, `${specPrefix} ${i + 1}`, specs[i]);
                // Also check the spec checkbox
                const specCheckbox = `${checkboxPrefix} spec ${i + 1}`;
                setCheckBox(form, specCheckbox, true);
            }
        }
    }
}

/**
 * Fills attack fields on page 1.
 */
async function fillAttacks(form, character, gameData) {
    const role = gameData.roles[character.role];
    if (!role) return;

    let attackIndex = 1;

    // Add Blade Blaster (all rangers have this)
    setTextField(form, `Att Name ${attackIndex}`, 'Blade Blaster');
    setTextField(form, `Att Rng ${attackIndex}`, '40/100ft');
    setTextField(form, `Att ${attackIndex}`, 'Targeting');
    setTextField(form, `Att Eff ${attackIndex}`, '1 Energy');
    attackIndex++;

    // Add role-specific power weapons if defined
    if (role.powerWeapon) {
        setTextField(form, `Att Name ${attackIndex}`, role.powerWeapon.name || 'Power Weapon');
        setTextField(form, `Att Rng ${attackIndex}`, role.powerWeapon.range || 'Melee');
        setTextField(form, `Att ${attackIndex}`, role.powerWeapon.skill || 'Might/Finesse');
        setTextField(form, `Att Eff ${attackIndex}`, role.powerWeapon.damage || '2');
        attackIndex++;
    }

    // Unarmed attack
    setTextField(form, `Att Name ${attackIndex}`, 'Unarmed');
    setTextField(form, `Att Rng ${attackIndex}`, 'Melee');
    setTextField(form, `Att ${attackIndex}`, 'Might/Finesse');
    setTextField(form, `Att Eff ${attackIndex}`, '1 Blunt');
}

/**
 * Fills page 2 text areas (powers, perks, bonds, etc.).
 */
async function fillPage2(form, character, gameData) {
    // Powers (Grid Powers)
    const powers = character.selectedGridPowers || [];
    const powersText = powers.map(name => {
        const power = GRID_POWERS?.find(p => p.name === name);
        return power ? `${name}: ${power.description}` : name;
    }).join('\n\n');
    setTextField(form, 'POWERS', powersText);

    // Perks - combine influence perks, general perks, and role perks
    const perksLines = [];

    // Role perks
    if (character.role && typeof ROLE_PERKS !== 'undefined') {
        const rolePerks = ROLE_PERKS[character.role] || [];
        const universalPerks = ROLE_PERKS.universal || [];
        const allRolePerks = [...universalPerks, ...rolePerks]
            .filter(p => p.level <= character.level)
            .sort((a, b) => a.level - b.level);

        if (allRolePerks.length > 0) {
            perksLines.push('== ROLE PERKS ==');
            allRolePerks.forEach(perk => {
                perksLines.push(`${perk.name} (Lvl ${perk.level})`);
            });
            perksLines.push('');
        }
    }

    // Influence perks
    if (character.influences.length > 0) {
        perksLines.push('== INFLUENCE PERKS ==');
        character.influences.forEach(infKey => {
            const inf = gameData.influences[infKey];
            if (inf) {
                perksLines.push(`${inf.name}: ${inf.perk}`);
            }
        });
        perksLines.push('');
    }

    // General perks
    const generalPerks = [...(character.selectedPerks || [])];
    // Add level-up general perks
    for (const lvl in character.levelUpChoices) {
        if (character.levelUpChoices[lvl]?.generalPerk) {
            generalPerks.push(character.levelUpChoices[lvl].generalPerk);
        }
    }
    if (generalPerks.length > 0) {
        perksLines.push('== GENERAL PERKS ==');
        generalPerks.forEach(name => perksLines.push(name));
    }

    setTextField(form, 'PERKS', perksLines.join('\n'));

    // Background Bonds
    const bondsLines = [];
    character.influences.forEach(infKey => {
        const inf = gameData.influences[infKey];
        const bonds = character.influenceBonds?.[infKey] || [];
        bonds.forEach(bondIdx => {
            if (inf?.bonds?.[bondIdx]) {
                bondsLines.push(`${inf.name}: ${inf.bonds[bondIdx]}`);
            }
        });
    });
    setTextField(form, 'BACKGROUND BONDS', bondsLines.join('\n'));

    // Features - Zord features and other notable features
    const featuresLines = [];
    if (character.zord?.additionalFeatures?.length > 0) {
        featuresLines.push('Zord Features: ' + character.zord.additionalFeatures.join(', '));
    }
    setTextField(form, 'FEATURES', featuresLines.join('\n'));

    // Inventory and Notes
    setTextField(form, 'Inventory', '');
    setTextField(form, 'Notes', '');
}

/**
 * Fills Zord section on page 2.
 */
async function fillZord(form, character, gameData) {
    const zord = character.zord;
    if (!zord) return;

    setTextField(form, 'Zord Name', zord.name || '');

    // Baseline Zord stats
    let zordStr = 6;
    let zordSpd = 4;
    let zordHealth = 6;
    let zordArmor = 1;

    // Apply team type modifiers
    if (zord.teamType && typeof ZORD_TEAM_TYPES !== 'undefined') {
        const teamType = ZORD_TEAM_TYPES[zord.teamType];
        if (teamType?.features) {
            if (teamType.features.includes('Heavy Chassis')) {
                zordStr += 1;
                zordHealth += 1;
            }
        }
    }

    // Apply growth choices
    if (zord.growthChoices) {
        for (const choice of Object.values(zord.growthChoices)) {
            if (choice === 'health') zordHealth += 1;
            if (choice === 'armor') zordArmor += 1;
        }
    }

    setTextField(form, 'Zord Str', String(zordStr));
    setTextField(form, 'Zord Spd', String(zordSpd));
    setTextField(form, 'Zord T', String(10 + zordStr + zordArmor));
    setTextField(form, 'Zord Eva', String(10 + zordSpd));
    setTextField(form, 'Zord Move', '40ft');
    setTextField(form, 'Zord Health', String(zordHealth));
    setTextField(form, 'Size', 'Huge');

    // Zord weapons
    setTextField(form, 'ZW1', 'Melee Attack');
    setTextField(form, 'ZW Rng 1', 'Reach');
    setTextField(form, 'ZW Eff 1', '2 Blunt/Sharp');

    setTextField(form, 'ZW2', 'Ranged Attack');
    setTextField(form, 'ZW Rng 2', '50/120ft');
    setTextField(form, 'ZW Eff 2', '2 Energy');
}

/**
 * Fills weapons and armor sections on page 2.
 */
async function fillWeaponsAndArmor(form, character, gameData) {
    const role = gameData.roles[character.role];
    if (!role) return;

    // Weapons
    let weaponIndex = 1;

    // Blade Blaster (all rangers)
    setTextField(form, `Wea${weaponIndex}`, 'Blade Blaster');
    setTextField(form, `W Rng ${weaponIndex}`, '40/100ft');
    setTextField(form, `W Hands ${weaponIndex}`, '1');
    setTextField(form, `W Traits ${weaponIndex}`, 'Morphed');
    setTextField(form, `W Att ${weaponIndex}`, 'Targeting');
    setTextField(form, `W Eff ${weaponIndex}`, '1 Energy');
    weaponIndex++;

    // Power Weapon
    if (role.powerWeapon) {
        setTextField(form, `Wea${weaponIndex}`, role.powerWeapon.name || 'Power Weapon');
        setTextField(form, `W Rng ${weaponIndex}`, role.powerWeapon.range || 'Melee');
        setTextField(form, `W Hands ${weaponIndex}`, role.powerWeapon.hands || '1-2');
        setTextField(form, `W Traits ${weaponIndex}`, role.powerWeapon.traits || 'Versatile');
        setTextField(form, `W Att ${weaponIndex}`, role.powerWeapon.skill || 'Might');
        setTextField(form, `W Eff ${weaponIndex}`, role.powerWeapon.damage || '2');
    }

    // Armor
    const armorTraining = getArmorTrainingForExport(character, gameData);
    if (armorTraining) {
        setTextField(form, 'A T 1', armorTraining.maxType);
        setTextField(form, 'A Desc 1', 'Morphed Armor Shell');
        setTextField(form, 'A Eff 1', `+${armorTraining.maxBonus} Toughness`);
        setTextField(form, 'A Traits 1', 'While Morphed');
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely sets a text field value.
 */
function setTextField(form, fieldName, value) {
    try {
        const field = form.getTextField(fieldName);
        if (field) {
            field.setText(value || '');
        }
    } catch (e) {
        // Field doesn't exist - that's okay
        console.debug(`PDF field not found: ${fieldName}`);
    }
}

/**
 * Safely sets a checkbox value.
 */
function setCheckBox(form, fieldName, checked) {
    try {
        const field = form.getCheckBox(fieldName);
        if (field) {
            if (checked) {
                field.check();
            } else {
                field.uncheck();
            }
        }
    } catch (e) {
        // Field doesn't exist - that's okay
        console.debug(`PDF checkbox not found: ${fieldName}`);
    }
}

/**
 * Downloads the PDF bytes as a file.
 */
function downloadPDF(pdfBytes, characterName) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(characterName)}_PowerRangers.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Sanitizes a filename.
 */
function sanitizeFilename(name) {
    return (name || 'Character').replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Builds final skill ranks including role bonuses.
 */
function buildFinalSkills(character, gameData) {
    const skills = { ...character.skills };
    const role = gameData.roles[character.role];

    // Add role starting skills
    if (role?.startingSkillRanks) {
        for (const [skill, ranks] of Object.entries(role.startingSkillRanks)) {
            skills[skill] = (skills[skill] || 0) + ranks;
        }
    }

    // Add role skill choice
    if (character.roleSkillChoice) {
        skills[character.roleSkillChoice] = (skills[character.roleSkillChoice] || 0) + 1;
    }

    // Add level-up skill ranks
    for (const lvl in character.levelUpChoices) {
        const choices = character.levelUpChoices[lvl];
        if (choices?.skillRanks) {
            for (const sr of choices.skillRanks) {
                skills[sr.skill] = (skills[sr.skill] || 0) + 1;
            }
        }
    }

    return skills;
}

/**
 * Calculates final essence scores.
 */
function getFinalEssenceForExport(character, gameData) {
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

/**
 * Calculates max health.
 */
function getMaxHealthForExport(character, gameData) {
    const origin = gameData.origins[character.origin];
    const baseHealth = origin?.startingHealth || 10;
    const skills = buildFinalSkills(character, gameData);
    const conditioningRanks = skills['Conditioning'] || 0;
    return baseHealth + conditioningRanks;
}

/**
 * Calculates power capacity.
 */
function getPowerCapacityForExport(level, roleKey, gameData) {
    if (!roleKey || !gameData.roles[roleKey]) return 2;

    const role = gameData.roles[roleKey];
    let base = 2;

    const growth = role.powerCapacityGrowth || '';
    if (growth.includes('Fast')) {
        base += Math.floor((level - 1) / 4) * 2;
    } else if (growth.includes('Moderate')) {
        base += Math.floor((level - 1) / 3);
    } else {
        base += Math.floor((level - 1) / 5) * 2;
    }

    return base;
}

/**
 * Gets armor training info.
 */
function getArmorTrainingForExport(character, gameData) {
    const armorByRole = {
        red: { types: ['Light', 'Medium', 'Heavy'], maxBonus: 4, maxType: 'Heavy' },
        blue: { types: ['Light', 'Medium'], maxBonus: 2, maxType: 'Medium' },
        yellow: { types: ['Light'], maxBonus: 1, maxType: 'Light' },
        pink: { types: ['Light'], maxBonus: 1, maxType: 'Light' },
        green: { types: ['Light', 'Medium'], maxBonus: 2, maxType: 'Medium' },
        black: { types: ['Light', 'Medium'], maxBonus: 2, maxType: 'Medium' },
        white: { types: ['Light', 'Medium'], maxBonus: 2, maxType: 'Medium' }
    };

    let training = armorByRole[character.role] || { types: ['Light'], maxBonus: 1, maxType: 'Light' };

    // Check for armor shell perks
    if (character.selectedPerks?.includes('Medium Armor Shell') && training.maxBonus < 2) {
        training = { types: [...training.types, 'Medium'], maxBonus: 2, maxType: 'Medium' };
    }
    if (character.selectedPerks?.includes('Heavy Armor Shell') && training.maxBonus < 4) {
        training = { types: [...training.types, 'Heavy'], maxBonus: 4, maxType: 'Heavy' };
    }
    if (character.selectedPerks?.includes('Ultra-Heavy Armor Shell')) {
        training = { types: [...training.types, 'Ultra-Heavy'], maxBonus: 6, maxType: 'Ultra-Heavy' };
    }

    return training;
}

/**
 * Gets armor bonus.
 */
function getArmorBonusForExport(character, gameData) {
    const training = getArmorTrainingForExport(character, gameData);
    return training.maxBonus || 1;
}

// =============================================================================
// EXPORTS (for module usage if needed)
// =============================================================================

// If using ES6 modules, uncomment the following:
// export { exportToPDF };
