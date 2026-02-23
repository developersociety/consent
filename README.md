# Cookie Consent Manager

A WCAG AA accessible, production-ready cookie consent library with multi-tier consent management, localStorage persistence, and conditional script loading.

## Features

- ✅ **WCAG AA Compliant** - Full keyboard navigation, screen reader support, proper color contrast
- ✅ **Multi-tier Consent** - Manage multiple cookie categories with granular control
- ✅ **Smart Persistence** - LocalStorage with automatic expiry (configurable days)
- ✅ **Conditional Script Loading** - Execute scripts only when consent is granted
- ✅ **Keyboard Accessible** - Tab navigation, focus trap, Escape to close
- ✅ **Screen Reader Support** - ARIA labels, live regions, announcements
- ✅ **Reduced Motion Support** - Respects `prefers-reduced-motion` preference
- ✅ **High Contrast Support** - Enhanced focus indicators for high contrast mode
- ✅ **Minimal Dependencies** - Pure vanilla JavaScript, no frameworks required
- ✅ **Production Ready** - Fully linted, tested, zero console errors

## Quick Start

### 1. Include the Library

```html
<link rel="stylesheet" href="path/to/consent.css">
<script src="path/to/consent.js"></script>
```

### 2. Add HTML Structure

```html
<!-- Cookie Banner -->
<div class="banner hidden" id="banner" role="region" aria-label="Cookie consent banner">
    <div class="banner__content">
        <div class="banner__message"></div>
        <div class="banner__actions"></div>
    </div>
</div>

<!-- Settings Panel Overlay -->
<div class="panel__overlay" id="panel__overlay"></div>

<!-- Settings Panel -->
<div class="panel" id="panel" role="dialog" aria-labelledby="panel-heading" aria-modal="true">
    <div class="panel__header">
        <h2 id="panel-heading"></h2>
        <button class="panel__close" onclick="cookieConsent.closeSettings()" aria-label="Close preferences panel">×</button>
    </div>
    <div class="panel__content">
        <div class="panel__body"></div>
    </div>
    <div class="panel__footer"></div>
</div>

<!-- Status Display (optional) -->
<ul id="consent-status-list" role="status" aria-live="polite" aria-atomic="true"></ul>
```

### 3. Initialize with Configuration

```javascript
const cookieConsentConfig = {
    debug: false,
    storageKey: 'cookie-consent-preferences',
    expiryDays: 365,

    banner: {
        heading: 'We use cookies',
        message: 'to improve your experience. We use different types of cookies for analytics and marketing.',
        linkText: 'Learn more about our privacy policy',
        linkUrl: '#privacy-policy',
        buttons: {
            acceptAll: 'Accept All',
            rejectAll: 'Reject All',
            customize: 'Customize'
        }
    },

    panel: {
        heading: 'Privacy Settings',
        buttons: {
            rejectAll: 'Reject All',
            save: 'Save'
        }
    },

    categories: {
        necessary: {
            enabled: true,
            required: true,
            title: 'Necessary',
            description: 'Essential cookies required for the website to function.',
            onAccept: null
        },
        analytics: {
            enabled: true,
            required: false,
            title: 'Analytics',
            description: 'Help us understand how visitors use our website.',
            onAccept: function() {
                // Load Google Analytics or similar
                if (window.gtag) {
                    window.gtag('consent', 'update', {
                        'analytics_storage': 'granted'
                    });
                }
            }
        },
        marketing: {
            enabled: true,
            required: false,
            title: 'Marketing',
            description: 'Used to deliver relevant advertising.',
            onAccept: function() {
                // Load marketing scripts
            }
        },
        preferences: {
            enabled: true,
            required: false,
            title: 'Preferences',
            description: 'Remember your settings and personalize features.',
            onAccept: null
        }
    },

    statusLabels: {
        granted: '✓ Granted',
        denied: '✗ Denied',
        noConsent: 'No consent given yet'
    },

    logging: {
        acceptAll: '✅ All cookies accepted',
        rejectAll: '❌ All optional cookies rejected',
        savePreferences: '💾 Preferences saved'
    }
};

const cookieConsent = CookieConsentManager.create(cookieConsentConfig);
window.cookieConsent = cookieConsent;
```

## API Reference

### Initialization

```javascript
const manager = CookieConsentManager.create(config);
```

### Methods

**User Actions:**
```javascript
manager.acceptAll()           // Accept all categories
manager.rejectAll()           // Reject non-essential categories
manager.savePreferences()     // Save selected preferences
manager.openSettings()        // Open preferences panel
manager.closeSettings()       // Close preferences panel
```

**Queries:**
```javascript
manager.hasConsent('analytics')    // Check if category is consented
manager.getConsent()               // Get full consent object
manager.getConfig()                // Get current configuration
```

**Management:**
```javascript
manager.revokeConsent()            // Clear preferences and reload page
manager.updateConfig(updates)      // Update config and re-render
```

## Configuration Options

### Top Level
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debug` | boolean | false | Enable console logging |
| `storageKey` | string | 'cookie-consent-preferences' | LocalStorage key |
| `expiryDays` | number | 365 | Days until preferences expire |

### Banner
| Option | Type | Description |
|--------|------|-------------|
| `heading` | string | Banner title |
| `message` | string | Banner description |
| `linkText` | string | Privacy policy link text |
| `linkUrl` | string | Privacy policy URL |
| `buttons` | object | Button labels: acceptAll, rejectAll, customize |

### Categories
Each category can have:
```javascript
{
    enabled: boolean,              // Show this category
    required: boolean,             // Can't be unchecked
    title: string,                 // Category name
    description: string,           // Category description
    onAccept: function() { }       // Callback when accepted
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate forward through elements |
| `Shift + Tab` | Navigate backward |
| `Enter` / `Space` | Activate buttons, toggle checkboxes |
| `Escape` | Close preferences panel |

## Accessibility Features

✅ **WCAG AA Level Compliance:**
- **Color Contrast:** All text meets 4.5:1 (normal) or 3:1 (large) ratio
- **Focus Indicators:** Visible 2px outline on all interactive elements
- **Keyboard Navigation:** Full tab navigation with focus trap in modal
- **Screen Readers:**
  - ARIA labels on all controls
  - Live regions for status updates
  - Dialog role with proper labeling
  - Semantic HTML structure
- **Touch Targets:** Minimum 44×44px for all clickable elements
- **Motion:** Respects `prefers-reduced-motion` setting
- **Contrast:** Supports `prefers-contrast` mode with enhanced outlines

### Screen Reader Announcements

- "Cookie consent banner" when banner appears
- "Privacy settings panel opened. Press Escape to close." when opening preferences
- "All cookies accepted" / "Preferences saved" / "Rejected" after actions
- All category names and descriptions announced with toggles
- Required categories marked as disabled with "aria-disabled"

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

All with full keyboard and screen reader support.

## Event Flow

1. **Page Load** → Check localStorage for existing preferences
2. **First Visit** → Show banner to new users
3. **User Action:**
   - Accept All → Save all categories, hide banner, load scripts
   - Reject All → Save only required, hide banner
   - Customize → Open panel for granular control
4. **Panel Interaction:**
   - User toggles categories
   - Click Save → Save preferences, close panel, load scripts
   - Click Reject All → Revert to required only
   - Press Escape / Click overlay → Close without saving
5. **Subsequent Visits** → Use saved preferences, no banner shown
6. **Expiry** → After configured days, preferences cleared and banner shown again

## Customization

### Styling

All classes use BEM naming convention with short names:

```css
.banner              /* Main banner container */
.banner__message     /* Banner text content */
.banner__actions     /* Button container */
.banner__button      /* Individual button */

.panel               /* Settings panel */
.panel__overlay      /* Dark overlay behind panel */
.panel__header       /* Panel title area */
.panel__body         /* Categories list */
.panel__footer       /* Action buttons */

.category            /* Individual category */
.category__title     /* Category name */
.category__desc      /* Category description */

.toggle              /* Checkbox wrapper */
.toggle__slider      /* Visual switch indicator */
```

### Colors

Key colors (easily customizable):

```css
/* Primary: Blue */
#3b82f6 - Primary button, enabled toggle
#2563eb - Primary button hover
#1d4ed8 - Primary button active

/* Secondary: Dark gray-blue */
#334155 - Secondary button, disabled state
#1e293b - Text, focus indicators, close button

/* Light backgrounds */
#ffffff - Panel background
#f9fafb - Panel footer background
#f1f5f9 - Hover states

/* Text colors */
#334155 - Body text (4.94:1 contrast)
#475569 - Descriptions (6.37:1 contrast)
```

### Adding Custom Categories

```javascript
cookieConsent.updateConfig({
    categories: {
        myCustomCategory: {
            enabled: true,
            required: false,
            title: 'My Category',
            description: 'What this category does',
            onAccept: () => {
                console.log('Custom category accepted!');
                // Load your custom scripts
            }
        }
    }
});
```

## Testing

### Automated
```bash
# Accessibility checks
npx axe-core demo.html
npx pa11y demo.html

# Lighthouse audit
lighthouse demo.html --view
```

### Manual
1. **Keyboard:** Tab through all elements, use Escape to close
2. **Screen Reader:** Test with NVDA (Windows), JAWS, or VoiceOver (Mac)
3. **Color:** Use browser DevTools color picker to verify contrast
4. **Motion:** Enable "Reduce motion" in OS settings to verify transitions disabled

## Demo

Open `demo.html` in a browser to see the full implementation with:
- Working banner and panel
- All accessibility features
- Configuration examples
- Console debugging

## License

MIT - Use freely in your projects

## Contributing

Pull requests welcome. Please ensure:
- All changes pass `make lint` (ESLint + Prettier)
- WCAG AA compliance maintained
- No new console warnings/errors
- Keyboard navigation still works
- Screen reader announcements make sense

## Support

For questions or issues, check the implementation in `demo.html` or review the API reference above.

---

**Built with accessibility in mind for all users.**
