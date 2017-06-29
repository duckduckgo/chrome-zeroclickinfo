let domNodes = $('[data-extensionversion]')

if (domNodes.length) {
    let node = domNodes[0];
    let version = node.getAttribute('data-extensionversion')
    console.log("Setting version: ", version)
    if (version) chrome.runtime.sendMessage({versionFlag: version});
}
