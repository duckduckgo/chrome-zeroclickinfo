var PARAMS = getParams();
var NUMBER_TO_TEST = PARAMS.numberToTest || 10;
var IS_RANDOM = PARAMS.random || false;
var SITES = buildSitesToTest(NUMBER_TO_TEST);


var screenshots = [];

$(document).ready(function() {

    /*
     * Get test params from the url and set any defaults
     */
    if (PARAMS.url) {
        processSite(PARAMS.url);
        return;
    }
    else {
        NUMBER_TO_TEST = Math.min(NUMBER_TO_TEST, top500Sites.length);
        processTopSites();
    }
});


/*
 * Build a summary table of results with
 * side by side screenshots
 */
function buildSummary() {
    let table = '<table><tr><td><b>Tracker Blocking ON</b></td><td><b>Tracker Blocking OFF</b></td></tr>';

    screenshots.forEach((x) => {
        table += '<tr><td>Site Score: ' + x.score + ' <a href="' + x.url + '">' + x.url + '</a></td><td></tr>';
        table += '<tr><td><img id="on" src="' + x.on + '" /></td>';
        table += '<td><img id="off" src="' + x.off + '" /></td></tr>';
    });
    table += '</table>';

    // add the screenshots to the page
    PARAMS.screenshots ? $('#screenshots').prepend(table) : null

    if (PARAMS.json) {
        // remove image data before printing on the screen
        screenshots.map((x) => {
            delete x.on
            delete x.off
        })
        $('#screenshots').append(`<h2>JSON Output</h2><p id="websites-data">${JSON.stringify(screenshots, null, 4)}</p>`);
        $('#screenshots').append(`<h2>Top Blocked Output</h2><p id="top-blocked-data">${JSON.stringify(bkg.Companies.getTopBlockedByPages(20), null, 4)}</p>`);
        $('#screenshots').append(`<h2>Top Blocked Output</h2><p id="total-pages-data">${bkg.utils.getFromStorage('totalPages', (n) => console.log(n))}</p>`);
    }
    bkg.utils.getFromStorage('totalPages', (n) => console.log(n))
}

/*
 * Test single specified URL
 * First turn privacy settings on, visit the site, record data, and take a screenshot
 * repeat with privacy settings off.
 * Stop when all sites have been processed. Base case calls the buildSummary funciton
 */
function processSite(url) {

    newScreenshots = {url};

    // turn tracker blocking and https on
    resetSettings(true);

    // run test with tracker blocking and https
    runTest(url).then(() => {

        if (PARAMS.compare) {
            // turn tracker blocking off
            resetSettings(false);

            runTest(url).then(() => {
                screenshots.push(newScreenshots);
                buildSummary();
                return;
            });
        }
        else {
            screenshots.push(newScreenshots);
            buildSummary();
            return;
        }
    });
}

/*
 * Recurse through the list of sites to process.
 * First turn privacy settings on, visit the site, record data, and take a screenshot
 * repeat with privacy settings off.
 * Stop when all sites have been processed. Base case calls the buildSummary funciton
 */
function processTopSites() {
    let site = SITES.pop();

    // base case, return and build table
    if(!site){
        buildSummary();
        return;
    }

    //let url = "http://" + site + '/';
    let url = site + '/';

    newScreenshots = {url};

    // turn tracker blocking and https on
    resetSettings(true);

    // run test with tracker blocking and https
    runTest(url).then(() => {

        if (PARAMS.compare) {
            // turn tracker blocking off
            resetSettings(false);
            
            runTest(url).then(() => {
                screenshots.push(newScreenshots)
                processTopSites();
            });
        }
        else {
            screenshots.push(newScreenshots)
            processTopSites();
        }
    });
}

/*
 * Navigate to a url, take a screenshot and record the page load time
 */
function runTest(url) {
    return new Promise((resolve) => {

        let blockingOnStartTime = Date.now();

        chrome.tabs.create({url}, (t) => {

            getLoadedTabById(t.id, blockingOnStartTime, 8000, 1000).then((tab) => {
                let blocking = bkg.settings.getSetting('trackerBlockingEnabled')
                let tabObj = bkg.tabManager.get({'tabId': tab.id});

                if (blocking) {
                    newScreenshots.scoreObj = tabObj.site.score;
                    newScreenshots.score = tabObj.site.score.get()
                }

                takeScreenshot().then((image) => {
                    blocking ? newScreenshots.on = image : newScreenshots.off = image
                    chrome.tabs.remove(tab.id);
                    resolve();
                })
            })
        });
    });
}

/* Build list of sites to test */
function buildSitesToTest(amount) {
    // build array of sites to test. Either random or in order
    let sites = [];
    if (IS_RANDOM) {
        sites = [];

        while (sites.length < amount) {
            let site = top500Sites[Math.floor(Math.random()*top500Sites.length)];

            // don't add duplicate sites to test
            if (sites.indexOf(site) === -1) {
                sites.push(site);
            }
        }
    }
    else {
        sites = top500Sites.slice(0, amount);
    }
    return sites;
}
