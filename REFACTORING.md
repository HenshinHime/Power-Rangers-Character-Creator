# Power Rangers RPG Character Creator - Refactoring Guide

## Overview

This document describes the code quality improvements made to the Power Rangers RPG Character Creator and provides guidance for future development.

## New File Structure

```
Power-Rangers-Character-Creator/
├── css/
│   └── styles.css          # All CSS styles (extracted from main file)
├── js/
│   ├── constants.js        # Magic values, configuration, and constants
│   ├── utils.js            # Reusable helper functions
│   └── pdf-export.js       # PDF generation (stubbed for fillable PDF)
├── power-rangers-character-creator-v2_12.html  # Original file (still works)
└── REFACTORING.md          # This document
```

## Improvements Made

### 1. CSS Extraction (`css/styles.css`)

All CSS has been extracted to a separate file with:
- **CSS Variables (Design Tokens)**: Colors, spacing, radii, and transitions are now defined as CSS custom properties
- **Organized Sections**: Styles are grouped by component (layout, buttons, cards, etc.)
- **Consistent Naming**: BEM-like conventions for clarity
- **Responsive Breakpoints**: Mobile-first responsive design

To use in HTML:
```html
<link rel="stylesheet" href="css/styles.css">
```

### 2. Constants (`js/constants.js`)

All magic values have been extracted:
- `APP_CONFIG`: Version, storage keys, auto-save delay
- `GAME_CONSTANTS`: Essence points, max influences, defense calculations
- `DICE_PROGRESSION`: Skill dice array
- `ESSENCE_TYPES`, `ESSENCE_LIST`: Essence type definitions
- `DEFENSE_BY_ESSENCE`: Mapping of essences to defenses
- `ARMOR_TYPES`, `ARMOR_BONUSES`: Armor training values
- `LEVEL_MILESTONES`: Level-up milestone arrays
- `ROLE_COLORS`: Color definitions for each ranger role
- `STEP_NAMES`: Wizard step names
- `DEFAULT_CHARACTER`: Default character state object
- `VALIDATION_MESSAGES`: User-facing error messages
- `SANITIZE_REGEX`, `SANITIZE_MAP`: XSS protection patterns

### 3. Utility Functions (`js/utils.js`)

Reusable helper functions including:

#### Input Sanitization (XSS Protection)
```javascript
sanitizeHTML(str)           // Escapes HTML special characters
validateCharacterName(name) // Validates and sanitizes names
validateTextInput(text)     // Validates general text input
```

#### Local Storage (with Error Handling)
```javascript
safeStorageSave(key, data)      // Saves with quota error handling
safeStorageLoad(key, default)   // Loads with JSON parse error handling
safeStorageRemove(key)          // Removes safely
```

#### Game Calculations
```javascript
getSkillDie(ranks)              // Gets dice notation for rank
calculateDefense(essence)       // Calculates defense from essence
calculatePowerCapacity(level, type)  // Calculates power capacity
getSkillEssence(skillName, data)     // Gets essence for a skill
calculateFinalEssence(char, data)    // Calculates final essence scores
meetsPrerequisite(prereq, char, data) // Checks perk prerequisites
```

#### DOM Helpers
```javascript
getElement(id)                  // Safe getElementById
setInnerHTML(element, html)     // Set innerHTML
createElement(tag, attrs, text) // Create elements safely
```

#### Text Formatting
```javascript
wrapText(text, maxChars)        // Wraps text for PDF
capitalize(str)                 // Capitalizes first letter
toTitleCase(str)               // Converts to title case
```

#### Performance
```javascript
debounce(func, wait)            // Debounce function calls
throttle(func, limit)           // Throttle function calls
```

### 4. PDF Export (`js/pdf-export.js`)

Stubbed module for future fillable PDF support:

**Current Implementation**: Notification that fillable PDF is coming soon

**Future Implementation Plan**:
1. Load a pre-made fillable PDF template (AcroForm)
2. Use pdf-lib to fill form fields
3. Download the completed PDF

Key functions:
```javascript
exportToPDF(character, gameData)        // Main export function
exportToFillablePDF(character, gameData) // Fillable PDF (future)
exportToClipboard(character, gameData)   // Clipboard export
```

## How to Use the New Files

### Option 1: Include as Scripts (Recommended)

Add to your HTML before the main application script:
```html
<link rel="stylesheet" href="css/styles.css">
<script src="js/constants.js"></script>
<script src="js/utils.js"></script>
<script src="js/pdf-export.js"></script>
<!-- Then your main application script -->
```

### Option 2: ES6 Modules (Future)

The files include commented-out ES6 export statements. To use modules:

1. Uncomment the `export` statements at the bottom of each file
2. Use import statements:
```javascript
import { APP_CONFIG, GAME_CONSTANTS } from './js/constants.js';
import { sanitizeHTML, safeStorageSave } from './js/utils.js';
```

## Migration Guide

### Updating Existing Code

Replace magic values with constants:
```javascript
// Before
const maxInfluences = 3;
const baseDefense = 10;

// After
const maxInfluences = GAME_CONSTANTS.maxInfluences;
const baseDefense = GAME_CONSTANTS.baseDefense;
```

Replace inline sanitization:
```javascript
// Before
const safeValue = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');

// After
const safeValue = sanitizeHTML(value);
```

Replace localStorage operations:
```javascript
// Before
localStorage.setItem('prpgCharacter', JSON.stringify(character));

// After
safeStorageSave(APP_CONFIG.storageKey, character);
```

### Input Handling

Always sanitize user input before rendering:
```javascript
// In input handlers
function updateName(value) {
    const result = validateCharacterName(value);
    if (result.valid) {
        character.name = result.sanitized;
    } else {
        showNotification(result.error, 'warning');
    }
}
```

## Implementing Fillable PDF

To implement fillable PDF export:

1. **Create a PDF Template**
   - Use Adobe Acrobat, LibreOffice, or similar to create a character sheet PDF
   - Add form fields (text fields, checkboxes) with meaningful names
   - Save as a fillable PDF (with AcroForm)

2. **Configure Field Mapping**
   In `js/pdf-export.js`, update `PDF_EXPORT_CONFIG.fieldMapping`:
   ```javascript
   fieldMapping: {
       'characterName': 'name',  // PDF field name: character property
       'skillAthletics': null,    // Will map from character.skills
       // ... add all your field mappings
   }
   ```

3. **Set Template Path**
   ```javascript
   PDF_EXPORT_CONFIG.templatePath = './assets/character-sheet-template.pdf';
   ```

4. **The rest is handled automatically** by `exportToFillablePDF()`

## Future Improvements

### Recommended Next Steps

1. **Extract Game Data** (~3500 lines)
   - Move `GAME_DATA`, `ROLE_PERKS`, `GENERAL_PERKS`, etc. to `js/data.js`
   - Makes the main file much smaller and easier to maintain

2. **Add TypeScript**
   - Type safety for character data structures
   - Better IDE support and refactoring

3. **Component Architecture**
   - Split render functions into separate files by step
   - e.g., `js/components/origin-selector.js`, `js/components/skill-allocator.js`

4. **State Management**
   - Consider a simple state management pattern
   - Enable undo/redo functionality

5. **Testing**
   - Add unit tests for utility functions
   - Add integration tests for character creation flow

### Code Quality Checklist

When adding new features, ensure:
- [ ] User input is sanitized with `sanitizeHTML()` or validation functions
- [ ] localStorage operations use `safeStorageSave/Load()`
- [ ] Magic values are defined in `constants.js`
- [ ] Reusable logic is added to `utils.js`
- [ ] Error handling with `try/catch` and user notifications
- [ ] Mobile-responsive styles

## Version History

- **v2.13**: Code quality improvements
  - Extracted CSS to separate file
  - Created constants module
  - Created utilities module with sanitization and error handling
  - Stubbed PDF export for fillable PDF support
