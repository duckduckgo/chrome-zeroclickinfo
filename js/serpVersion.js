let version = document.querySelector('html').getAttribute('data-extensionversion');    
if (version === "beta") chrome.runtime.sendMessage({versionFlag: version});
