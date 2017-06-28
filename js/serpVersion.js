var extensionVersionFlag = document.querySelector('html').getAttribute('data-extensionversion');

if (extensionVersionFlag) {
    chrome.runtime.sendMessage({versionFlag: extensionVersionFlag});
}
