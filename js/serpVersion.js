var extensionVersionFlag = document.querySelector('html').getAttribute('data-chromeversion');
chrome.runtime.sendMessage({versionFlag: extensionVersionFlag});
