// eslint-disable-next-line no-unused-vars
const CookieConsentManager = (() => {
    const create = (config) => {
        const state = {
            consent: null,
            focusableElements: [],
            currentFocusIndex: 0,
            triggerElement: null,
        };
        const cache = {};

        const el = (id) => {
            cache[id] = cache[id] ?? document.getElementById(id);
            return cache[id];
        };

        const log = (...args) => {
            if (config.debug) {
                // eslint-disable-next-line no-console
                console.log('[CC]', ...args);
            }
        };

        const announce = (message) => {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.overflow = 'hidden';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 3000);
        };

        const storage = {
            load() {
                try {
                    const data = JSON.parse(localStorage.getItem(config.storageKey));
                    if (!data) return null;

                    const expiry = new Date(data.timestamp);
                    expiry.setDate(expiry.getDate() + config.expiryDays);
                    if (Date.now() > expiry) {
                        localStorage.removeItem(config.storageKey);
                        return null;
                    }
                    return data.consent;
                } catch (e) {
                    if (config.debug) {
                        // eslint-disable-next-line no-console
                        console.error('[CC]', e);
                    }
                    return null;
                }
            },

            save(consent) {
                try {
                    localStorage.setItem(
                        config.storageKey,
                        JSON.stringify({
                            consent,
                            timestamp: new Date().toISOString(),
                        }),
                    );
                    state.consent = consent;
                } catch (e) {
                    if (config.debug) {
                        // eslint-disable-next-line no-console
                        console.error('[CC]', e);
                    }
                }
            },
        };

        const ui = {
            renderBanner() {
                const banner = el('banner');
                if (!banner) return;

                const message = banner.querySelector('.banner__message');
                const actions = banner.querySelector('.banner__actions');

                if (message) {
                    message.innerHTML = `
                        <strong>${config.banner.heading}</strong> ${config.banner.message}
                        <a href="${config.banner.linkUrl}">${config.banner.linkText}</a>.
                    `;
                }

                if (actions) {
                    actions.innerHTML = `
                        <button class="banner__button" data-action="acceptAll" aria-label="Accept all cookies">
                            ${config.banner.buttons.acceptAll}
                        </button>
                        <button class="banner__button banner__button--secondary" data-action="rejectAll" aria-label="Reject all non-essential cookies">
                            ${config.banner.buttons.rejectAll}
                        </button>
                        <button class="banner__button banner__button--outline" data-action="openSettings" aria-label="Customize cookie preferences">
                            ${config.banner.buttons.customize}
                        </button>
                    `;
                }
            },

            renderPanel() {
                const panel = el('panel');
                if (!panel) return;

                const header = panel.querySelector('.panel__header h2');
                if (header) {
                    header.textContent = config.panel.heading;
                    header.id = 'panel-heading';
                }

                const body = panel.querySelector('.panel__body');
                if (body) {
                    body.innerHTML = Object.entries(config.categories)
                        .filter(([, cat]) => cat.enabled)
                        .map(
                            ([key, cat]) => `
                            <div class="category">
                                <div class="category__header">
                                    <div>
                                        <h3 class="category__title">${cat.title}</h3>
                                        <p class="category__desc" id="cat-${key}-desc">${cat.description}</p>
                                    </div>
                                    <label class="toggle">
                                        <input type="checkbox" data-category="${key}"
                                            aria-label="${cat.title} cookie consent"
                                            aria-describedby="cat-${key}-desc"
                                            ${cat.required ? 'checked disabled aria-disabled="true"' : ''}>
                                        <span class="toggle__slider" aria-hidden="true"></span>
                                    </label>
                                </div>
                            </div>
                        `,
                        )
                        .join('');
                }

                const footer = panel.querySelector('.panel__footer');
                if (footer) {
                    footer.innerHTML = `
                        <button class="panel__button panel__button--secondary" data-action="rejectAll">
                            ${config.panel.buttons.rejectAll}
                        </button>
                        <button class="panel__button" data-action="savePreferences">
                            ${config.panel.buttons.save}
                        </button>
                        <button class="panel__button" data-action="acceptAll">
                            ${config.panel.buttons.acceptAll}
                        </button>
                    `;
                }
            },

            showBanner() {
                el('banner')?.classList.remove('hidden');
                this.adjustPadding(true);
            },

            hideBanner() {
                el('banner')?.classList.add('hidden');
                this.adjustPadding(false);
            },

            adjustPadding(show) {
                const banner = el('banner');
                const paddingValue = show && banner ? `${banner.offsetHeight}px` : '';
                document.body.style.paddingBottom = paddingValue;
            },

            getFocusableElements() {
                const panel = el('panel');
                if (!panel) return [];
                return Array.from(
                    panel.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                    ),
                );
            },

            openSettings() {
                const panel = el('panel');
                const overlay = el('panel__overlay');
                if (!panel || !overlay) return;

                state.triggerElement = document.activeElement;

                Object.entries(config.categories).forEach(([key, cat]) => {
                    if (!cat.required) {
                        const toggle = document.querySelector(`input[data-category="${key}"]`);
                        if (toggle) {
                            toggle.checked = state.consent?.[key] ?? false;
                        }
                    }
                });

                panel.classList.add('active');
                overlay.classList.add('active');
                document.body.classList.add('panel-open');

                state.focusableElements = this.getFocusableElements();
                state.currentFocusIndex = 0;

                setTimeout(() => {
                    if (state.focusableElements.length > 0) {
                        state.focusableElements[0].focus();
                    }
                }, 0);

                announce('Privacy settings panel opened. Press Escape to close.');
            },

            closeSettings() {
                el('panel')?.classList.remove('active');
                el('panel__overlay')?.classList.remove('active');
                document.body.classList.remove('panel-open');

                if (state.triggerElement) {
                    setTimeout(() => {
                        state.triggerElement.focus();
                    }, 0);
                }
            },

            updateStatus() {
                const list = el('consent-status-list');
                if (!list) return;

                if (!state.consent) {
                    list.innerHTML = `<li>${config.statusLabels.noConsent}</li>`;
                    return;
                }

                list.innerHTML = Object.entries(config.categories)
                    .map(
                        ([key, cat]) =>
                            `<li><strong>${cat.title}:</strong> <span class="${state.consent[key] ? 'granted' : 'denied'}">${state.consent[key] ? config.statusLabels.granted : config.statusLabels.denied}</span></li>`,
                    )
                    .join('');
            },
        };

        const actions = {
            openSettings() {
                ui.openSettings();
            },

            acceptAll() {
                const consent = {};
                Object.keys(config.categories).forEach((key) => {
                    consent[key] = true;
                });
                storage.save(consent);
                ui.closeSettings();
                ui.hideBanner();
                actions.loadScripts();
                ui.updateStatus();
                announce('All cookies accepted.');
                log(config.logging.acceptAll);
            },

            rejectAll() {
                const consent = {};
                Object.entries(config.categories).forEach(([key, cat]) => {
                    consent[key] = cat.required;
                });
                storage.save(consent);
                ui.closeSettings();
                ui.hideBanner();
                actions.loadScripts();
                ui.updateStatus();
                announce('Non-essential cookies rejected.');
                log(config.logging.rejectAll);
            },

            savePreferences() {
                const consent = {};
                Object.entries(config.categories).forEach(([key, cat]) => {
                    if (cat.required) {
                        consent[key] = true;
                    } else {
                        const toggle = document.querySelector(`input[data-category="${key}"]`);
                        consent[key] = toggle?.checked ?? false;
                    }
                });
                storage.save(consent);
                ui.closeSettings();
                ui.hideBanner();
                actions.loadScripts();
                ui.updateStatus();
                announce('Cookie preferences saved.');
                log(config.logging.savePreferences, consent);
            },

            loadScripts() {
                if (!state.consent) return;
                Object.entries(config.categories).forEach(([key, cat]) => {
                    if (state.consent[key] && cat.onAccept) {
                        try {
                            cat.onAccept();
                        } catch (e) {
                            if (config.debug) {
                                // eslint-disable-next-line no-console
                                console.error('[CC]', e);
                            }
                        }
                    }
                });
            },
        };

        const events = {
            handleClick(e) {
                const action = e.target?.dataset?.action;
                if (action && typeof actions[action] === 'function') {
                    actions[action]();
                }
            },

            handleKeyboard(e) {
                if (e.key === 'Escape' && el('panel')?.classList.contains('active')) {
                    ui.closeSettings();
                }

                if (el('panel')?.classList.contains('active')) {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const len = state.focusableElements.length;
                        if (len > 0) {
                            const delta = e.shiftKey ? -1 : 1;
                            state.currentFocusIndex =
                                (state.currentFocusIndex + delta + len) % len;
                            state.focusableElements[state.currentFocusIndex].focus();
                        }
                    }
                }
            },

            attach() {
                document.addEventListener('click', this.handleClick.bind(this));
                document.addEventListener('keydown', this.handleKeyboard.bind(this));
                el('panel__overlay')?.addEventListener('click', () => {
                    ui.closeSettings();
                });
            },
        };

        const init = () => {
            ui.renderBanner();
            ui.renderPanel();
            state.consent = storage.load();

            if (!state.consent) {
                ui.showBanner();
            } else {
                actions.loadScripts();
            }

            ui.updateStatus();
            events.attach();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

        return {
            acceptAll: actions.acceptAll,
            rejectAll: actions.rejectAll,
            openSettings: ui.openSettings.bind(ui),
            closeSettings: ui.closeSettings.bind(ui),
            savePreferences: actions.savePreferences,
            hasConsent: (cat) => state.consent?.[cat] === true,
            revokeConsent: () => {
                localStorage.removeItem(config.storageKey);
                window.location.reload();
            },
            getConsent: () => state.consent,
            getConfig: () => config,
            updateConfig(updates) {
                Object.assign(config, updates);
                ui.renderBanner();
                ui.renderPanel();
            },
        };
    };

    return { create };
})();
