var version = (() => {
    let name;
    let legacyOptionPage = chrome.extension.getURL("/html/legacy/version/1/options.html");
    let newOptionPage = chrome.extension.getURL("/html/options.html");

    /*
     * Rewrite the old options page to the new one
     */
    let optionPageRequestListener = ((req) => { 
        if (version.name === "beta" && req.url && req.url === legacyOptionPage) {
            return {redirectUrl: newOptionPage};
        }
    });

    return {
        update: (value) => {
            if (value === "beta") {
                version.betaStateOn();
            }
            else {
                version.betaStateOff();
            }
            version.name = value;
            settings.updateSetting('version', value);
            return version.name;
        },

        betaStateOn: () => {
            chrome.browserAction.setPopup({popup:'html/trackers.html'});
            version.firefoxOptionPage = newOptionPage;
            settings.updateSetting('extensionIsEnabled', true);
            settings.updateSetting('httpsEverywhereEnabled', true);
            settings.updateSetting('trackerBlockingEnabled', true);
            settings.updateSetting('embeddedTweetsEnabled', false);
        },

        betaStateOff: () => {
            chrome.browserAction.setPopup({popup:'html/legacy/version/1/popup.html'});
            version.firefoxOptionPage = legacyOptionPage;
            settings.updateSetting('extensionIsEnabled', false);
            settings.updateSetting('httpsEverywhereEnabled', false);
            settings.updateSetting('trackerBlockingEnabled', false);
            settings.updateSetting('embeddedTweetsEnabled', true);
        },

        startup: () => {
            // call out own update method to make sure all setting 
            // are in the correct state
            version.update(settings.getSetting('version'));
            
            // register listener to rewrite the options page request
            chrome.webRequest.onBeforeRequest.addListener(optionPageRequestListener, {
                urls: ['<all_urls>']
            }, ['blocking']);

            // serpVersion.js will will check the serp for an extension version to use
            chrome.runtime.onMessage.addListener((message) => {
                if (message && message.versionFlag) {
                    console.log("Setting version to: ", message.versionFlag);
                    version.update(message.versionFlag)
                }
            });
        }
    }
})();

/*
 * On startup check the saved version in default settings
 * Update the popup and privacy feature settings
 */
version.startup();

