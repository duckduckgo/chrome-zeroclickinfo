var extensionVersionFlag = document.querySelector('html').getAttribute('data-chromeversion');

if (extensionVersionFlag) {
    chrome.runtime.sendMessage({versionFlag: extensionVersionFlag});
}
