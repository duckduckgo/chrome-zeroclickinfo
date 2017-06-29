var extVersion = document.querySelector('html').getAttribute('data-extensionversion');   
console.log("Setting extension version ", extVersion);
if (extVersion === "beta") chrome.runtime.sendMessage({versionFlag: extVersion});
