# Integration Guide

How to integrate Cookie Consent Manager into your project.

## Installation Methods

### 1. Direct File Reference (Simplest)

Copy files to your project:
```
your-project/
├── css/
│   └── consent.css
├── js/
│   └── consent.js
└── index.html
```

In your HTML:
```html
<link rel="stylesheet" href="css/consent.css">
<script src="js/consent.js"></script>
```

### 2. Via npm (Future)

```bash
npm install cookie-consent-manager
```

```javascript
import './node_modules/cookie-consent-manager/src/css/consent.css';
import CookieConsentManager from './node_modules/cookie-consent-manager/src/js/consent.js';
```

### 3. Via CDN (Future)

```html
<link rel="stylesheet" href="https://cdn.example.com/consent.css">
<script src="https://cdn.example.com/consent.js"></script>
```

## Basic Integration (5 minutes)

### Step 1: Add HTML Structure

Copy this HTML to your page (typically at end of `<body>`):

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
```

### Step 2: Link CSS and JS

In your `<head>`:
```html
<link rel="stylesheet" href="path/to/consent.css">
```

Before closing `</body>`:
```html
<script src="path/to/consent.js"></script>
```

### Step 3: Initialize

```html
<script>
const cookieConsentConfig = {
    debug: false,
    storageKey: 'cookie-consent',
    expiryDays: 365,

    banner: {
        heading: 'We use cookies',
        message: 'to improve your experience.',
        linkText: 'Privacy Policy',
        linkUrl: '/privacy',
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
            description: 'Required for core functionality.',
            onAccept: null
        },
        analytics: {
            enabled: true,
            required: false,
            title: 'Analytics',
            description: 'Help us improve.',
            onAccept: function() {
                // Initialize Google Analytics
                if (window.gtag) {
                    window.gtag('consent', 'update', {
                        'analytics_storage': 'granted'
                    });
                }
            }
        }
    },

    statusLabels: {
        granted: '✓ Granted',
        denied: '✗ Denied',
        noConsent: 'No choice made'
    },

    logging: {
        acceptAll: 'All cookies accepted',
        rejectAll: 'Optional cookies rejected',
        savePreferences: 'Preferences saved'
    }
};

const cookieConsent = CookieConsentManager.create(cookieConsentConfig);
window.cookieConsent = cookieConsent;
</script>
```

**Done!** Your consent manager is now active.

## Adding a Preferences Button

Add this to your footer or navigation:

```html
<button onclick="cookieConsent.openSettings()">Cookie Settings</button>
```

## Common Integrations

### Google Analytics

```javascript
analytics: {
    enabled: true,
    required: false,
    title: 'Analytics',
    description: 'Understand how users interact with our site.',
    onAccept: function() {
        // Load Google Analytics
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }
}
```

### Google Tag Manager

```javascript
gtm: {
    enabled: true,
    required: false,
    title: 'Conversion Tracking',
    description: 'Track conversions and user behavior.',
    onAccept: function() {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        }
    }
}
```

### Facebook Pixel

```javascript
facebook: {
    enabled: true,
    required: false,
    title: 'Marketing',
    description: 'Show you relevant ads.',
    onAccept: function() {
        // Initialize Facebook Pixel
        fbq('consent', 'grant');
    }
}
```

### Hotjar

```javascript
hotjar: {
    enabled: true,
    required: false,
    title: 'Session Recording',
    description: 'Analyze user sessions.',
    onAccept: function() {
        // Hotjar will auto-load if hj() is available
        if (typeof hj === 'function') {
            hj('identify', { consentGiven: true });
        }
    }
}
```

## Checking Consent in Your Scripts

After initialization, check if user has consented:

```javascript
// Check single category
if (cookieConsent.hasConsent('analytics')) {
    // Load analytics script
    loadGoogleAnalytics();
}

// Check multiple categories
const consent = cookieConsent.getConsent();
if (consent.analytics && consent.marketing) {
    // Both are consented
}

// Wait for user to make choice
function waitForConsent() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (cookieConsent.getConsent()) {
                clearInterval(interval);
                resolve(cookieConsent.getConsent());
            }
        }, 100);
    });
}
```

## Django Template Integration

For Django users, add to your base template:

```django
<!-- In base.html before </body> -->
{% load static %}

<link rel="stylesheet" href="{% static 'css/consent.css' %}">
<script src="{% static 'js/consent.js' %}"></script>

<div class="banner hidden" id="banner" role="region" aria-label="Cookie consent banner">
    <div class="banner__content">
        <div class="banner__message"></div>
        <div class="banner__actions"></div>
    </div>
</div>

<div class="panel__overlay" id="panel__overlay"></div>

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

<script>
const cookieConsentConfig = {
    // ... your config ...
};
const cookieConsent = CookieConsentManager.create(cookieConsentConfig);
window.cookieConsent = cookieConsent;
</script>
```

## Webpack/Bundler Integration

If using a bundler, you can import the files:

```javascript
import CookieConsentManager from './consent.js';
import './consent.css';

const config = { /* ... */ };
window.cookieConsent = CookieConsentManager.create(config);
```

Or if the library is installed via npm:

```javascript
import CookieConsentManager from 'cookie-consent-manager';
import 'cookie-consent-manager/src/css/consent.css';
```

## Styling Customization

### Using CSS Variables (if implemented)

```css
:root {
    --cc-primary: #3b82f6;
    --cc-secondary: #334155;
    --cc-text: #1e293b;
    --cc-light: #f9fafb;
}
```

### Direct CSS Override

```css
/* Override specific colors */
.banner__button {
    background: #your-color !important;
}

.panel {
    background: #your-background !important;
}
```

### Customize Text via Config

```javascript
banner: {
    heading: 'Your Custom Heading',
    message: 'Your custom message text',
    linkText: 'Your link text',
    linkUrl: 'https://your-url.com',
    buttons: {
        acceptAll: 'Your Accept Text',
        rejectAll: 'Your Reject Text',
        customize: 'Your Customize Text'
    }
}
```

## Troubleshooting

### Banner Not Showing

- Check IDs match: `id="banner"`, `id="panel"`, `id="panel__overlay"`
- Verify CSS is loaded: Check browser DevTools Network tab
- Check console for errors: Open browser console (F12)
- Verify localStorage doesn't have existing consent: `localStorage.removeItem('cookie-consent')`

### Callbacks Not Running

- Ensure `onAccept` functions don't have syntax errors
- Check browser console for errors
- Verify `debug: true` in config to see console logs
- Make sure functions are defined globally or within scope

### Keyboard Navigation Not Working

- Check that modal elements have proper IDs and roles
- Verify `role="dialog"` is present on panel
- Open browser console and enable `debug: true`

### Screen Reader Not Announcing

- Check ARIA attributes are present
- Test with actual screen reader (NVDA on Windows, VoiceOver on Mac)
- Verify `aria-label` and `aria-live` attributes in HTML
- Check that elements aren't hidden with `display: none`

## Accessibility Testing

After integration, test with:

```bash
# Automated checks
npx axe-core your-page.html
npx pa11y your-page.html

# Manual keyboard test
# 1. Tab through all elements
# 2. Verify focus is visible everywhere
# 3. Use Escape to close modal
# 4. Use Enter/Space to activate buttons
```

## Next Steps

1. Review `demo.html` for full working example
2. Test keyboard navigation (Tab, Escape, Enter)
3. Test with screen reader (optional but recommended)
4. Customize colors and text as needed
5. Add callback functions for your tracking scripts
6. Deploy and monitor for issues

For questions or problems, check README.md or review the inline code documentation.
