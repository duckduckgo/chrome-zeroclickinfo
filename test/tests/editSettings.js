let bkg = chrome.extension.getBackgroundPage()
const defaultSettings = bkg.settings.getDefaults()

function buildTable (newSettings) {
    let settings = newSettings || bkg.settings.getSetting()
    let elements = []
    
    // generate output table
    let output = '<h2>Settings</h2><table><th>Name</th><th>Value</th>'
    
    for(let setting in settings) {
        let value = (typeof settings[setting] === 'object') ? JSON.stringify(settings[setting]) : settings[setting]
        output += `<tr><td class='setting-name'>${setting}</td><td><input type='text' id=${setting} value=${value}></td></tr>`
        elements.push(setting)
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
