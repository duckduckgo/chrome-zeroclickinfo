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

            return version.name;
        },

        betaStateOn: () => {
            chrome.browserAction.setPopup({popup:'html/trackers.html'});
            version.firefoxOptionPage = newOptionPage;
        },

        betaStateOff: () => {
            chrome.browserAction.setPopup({popup:'html/legacy/version/1/popup.html'});
            version.firefoxOptionPage = legacyOptionPage;
            // remove badge icon numbers
            chrome.tabs.query({currentWindow: true, status: 'complete'}, function(tabs){
                tabs.forEach((tab) => {
                    chrome.browserAction.setBadgeText({tabId: tab.id, text: ''});
                });
            });

        },

        startup: () => {
            // call out own update method to make sure all setting 
            // are in the correct state
            let startupVersion = settings.getSetting('version')
            let atb =  settings.getSetting('atb')

            // fallback to check for company data or a 'w' variant to know if we need to be in v2 mode
            if (!startupVersion && (Companies || atb)) {
                let topBlocked = Companies.getTopBlocked()
                if (topBlocked.length || (atb && atb.match(/v.*w$/))) {
                    startupVersion = 'beta'
                }

                // save this version so we don't have to fallback again
                if (startupVersion === 'beta') {
                    console.warn(`Version: found fallback state, setting version to ${startupVersion}`)
                    settings.updateSetting('version', startupVersion)
                }
            }

            console.log('Version: startup version is ', startupVersion || 'v1')

            version.update(startupVersion);
            
            // register listener to rewrite the options page request
            chrome.webRequest.onBeforeRequest.addListener(optionPageRequestListener, {
                urls: ['<all_urls>']
            }, ['blocking']);

        }
    }
})();

settings.ready().then(() => version.startup())

// serpVersion.js will will check the serp for an extension version to use
chrome.runtime.onMessage.addListener((message) => {
    if (message && message.versionFlag) {
        settings.ready().then(() => {
            console.log("Setting version to: ", message.versionFlag);
            settings.updateSetting('version', message.versionFlag)
            version.update(message.versionFlag)
        })
    }
});

chrome.runtime.onMessage.addListener((req,sender,res) => {
    if (req.firefoxOptionPage) {
        res(version.firefoxOptionPage)
    }
    return true;
});
