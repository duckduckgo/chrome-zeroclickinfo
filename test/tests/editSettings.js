let bkg = chrome.extension.getBackgroundPage()
const defaultSettings = bkg.settings.getDefaults()

// map setting names to categories so we can build a nice table
let categories = {
    'Block Lists and Settings': ['entityMap', 'entityList', 'easylists', 'blocking', 'generalEasylist', 'privacyEasylist' ],
    'Whitelists': ['trackersWhitelist', 'trackersWhitelistTemporary', 'httpsWhitelist'],
    "Other": []
}

// build a regex string of categories to make filtering easier when we build the table
let defaultCategories = ['Block Lists and Settings', 'Whitelists'].map((category) => categories[category].join('|')).join('|')

function settingsByCategory(settings) {
    for(let setting in settings) {
        if(!setting.match(defaultCategories)) {
            categories.Other.push(setting)
        }
    }
    return categories
}

function buildTable (newSettings) {
    let settings = settingsByCategory(newSettings || bkg.settings.getSetting())
    let elements = []
   
    // generate output table
    let output = '<h2>Settings</h2><table><th>Name</th><th>Value</th>'

    for(let category in categories) {
        for(let setting in categories[category]) {
            let value = (typeof settings[setting] === 'object') ? JSON.stringify(settings[setting]) : settings[setting]
            output += `<tr><td class='setting-name'>${setting}</td><td><input type='text' id=${setting} value=${value}></td></tr>`
            elements.push(setting)
        }
    }

    output += '</table>'
    $('#settings').append(output)
    
    // add on change to each element in the table
    elements.forEach((element) => {
        let el = `#${element}`
        
        $(el).change(() => {
            let name = element
            let value
            
            // maybe json
            try {
                value = JSON.parse($(el).val())
            }
            catch(e) {
                value = $(el).val()
            }
            
            bkg.settings.updateSetting(name,value)
            $(el).addClass('saved')
            window.setInterval(() => $(el).removeClass('saved'), 500)
        });
    })
}


function resetSettings (data) {
    let settings = data.userSettings || defaultSettings
    for(let setting in settings) {
        let value = settings[setting]
        bkg.settings.updateSetting(setting, value)
    }
    window.location.reload()
}

function exportSettings () {
    $('#export-settings').append(JSON.stringify(bkg.settings.getSetting()))
}

function loadSettingsFromUser () {
    let userSettings = $('#load-settings').val()
    if (userSettings) {
        let parsed = JSON.parse(userSettings)
        resetSettings({userSettings: parsed})
        $('#settings').empty()
        buildTable(parsed)
    }
}

$('#reset').on('click', resetSettings)
$('#export').on('click', exportSettings)
$('#load').on('click', loadSettingsFromUser)
$('#reload').on('click', () => chrome.runtime.reload())

buildTable()

$(document).ready(() => {
    $("tr:even").css("background-color", "#eeeeee");
    $("tr:odd").css("background-color", "#ffffff");
});
