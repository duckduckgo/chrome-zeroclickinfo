// npm module defined in tldjs.js
let tldjs

require.scopes.utils = ( () => {

    function extractHostFromURL (url) {
        if (!url) return;

        let urlObj = tldjs.parse(url);
        let hostname = urlObj.hostname;
        hostname = hostname.replace(/^www\./,'');
        return hostname;
    }

    function extractTopSubdomainFromHost (host) {
         if (typeof host !== 'string') return false
         const rgx = /\./g
         if (host.match(rgx) && host.match(rgx).length > 1) {
             return host.split('.')[0]
         }
         return false
     }

    function getProtocol (url){
        var a = document.createElement('a');
        a.href = url;
        return a.protocol;
    }

    function parseUserAgentString (uaString) {
        if (!uaString) uaString = window.navigator.userAgent
        const rgx = uaString.match(/(Firefox|Chrome)\/([0-9]+)/)
        return {
            browser: rgx[1],
            majorVersion: rgx[2]
        }
    }

    function syncToStorage (data){
        chrome.storage.local.set(data, function() { });
    }

    function getFromStorage (key, callback) {
        chrome.storage.local.get(key, function (result) {
            callback(result[key])
        })
    }

    function getCurrentURL(callback){
        chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function(tabData) {
            if(tabData.length){
                callback(tabData[0].url)
            }
        });
    }

    function getCurrentTab () {
        return new Promise( (resolve, reject) => {
            chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function(tabData) {
                if(tabData.length){
                    resolve(tabData[0])
                }
            });
        })
    }

    chrome.runtime.onMessage.addListener( (req, sender, res) => {
        if (req.getCurrentTab) {
            getCurrentTab().then((tab) => {
                res(tab)
            })
        }
        return true;
    })

    // Utilizes native window.crypto.subtle api
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    function hashSHA256 (string) {
        return new Promise((resolve, reject) => {

            function sha256 (str) {
                // We transform the string into an arraybuffer.
                var buffer = new TextEncoder('utf-8').encode(str)
                return crypto.subtle.digest('SHA-256', buffer).then(function (hash) {
                    return hex(hash)
                })
            }

            function hex (buffer) {
                var hexCodes = []
                var view = new DataView(buffer)
                for (var i = 0; i < view.byteLength; i += 4) {
                    var value = view.getUint32(i)
                    var stringValue = value.toString(16)
                    var padding = '00000000'
                    var paddedValue = (padding + stringValue).slice(-padding.length)
                    hexCodes.push(paddedValue)
                }
                // join all the hex strings into one
                return hexCodes.join('')
            }

            sha256(string).then(function (digest) {
                resolve(digest)
            })
        })
    }

    return {
        extractHostFromURL: extractHostFromURL,
        extractTopSubdomainFromHost: extractTopSubdomainFromHost,
        parseUserAgentString: parseUserAgentString,
        syncToStorage: syncToStorage,
        getFromStorage: getFromStorage,
        getCurrentURL: getCurrentURL,
        getCurrentTab: getCurrentTab,
        getProtocol: getProtocol,
        hashSHA256: hashSHA256
    }
})();
