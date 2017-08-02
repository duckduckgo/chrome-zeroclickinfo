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

            // let legacy extension know the version
            chrome.runtime.sendMessage({'version': value});

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

            // check for existing blocking data and set to beta state there is any
            if (Companies) {
                let topBlocked = Companies.getTopBlocked()
                if (topBlocked.length) {
                    startupVersion = 'beta'
                    settings.updateSetting('version', startupVersion)
                }
            }

            version.update(startupVersion);
            
            // register listener to rewrite the options page request
            chrome.webRequest.onBeforeRequest.addListener(optionPageRequestListener, {
                urls: ['<all_urls>']
            }, ['blocking']);

            // serpVersion.js will will check the serp for an extension version to use
            chrome.runtime.onMessage.addListener((message) => {
                if (message && message.versionFlag) {
                    console.log("Setting version to: ", message.versionFlag);
                    settings.updateSetting('version', message.versionFlag)
                    version.update(message.versionFlag)
                }
            });
        }
    }
})();

