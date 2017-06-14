/*
 * Copyright (C) 2012, 2016 DuckDuckGo, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var trackers = require('trackers');
var utils = require('utils');
var settings = require('settings');
var stats = require('stats');
const httpsWhitelist = load.JSONfromLocalFile(settings.getSetting('httpsWhitelist'));

// Set browser for popup asset paths
// chrome doesn't have getBrowserInfo so we'll default to chrome
// and try to detect if this is firefox
var browser = "chrome";
try {
    chrome.runtime.getBrowserInfo((info) => {
        if (info.name === "Firefox")
            browser = "moz";
    });
}
catch(e){
};

function Background() {
  $this = this;

  // clearing last search on browser startup
  settings.updateSetting('last_search', '');

  var os = "o";
  if (window.navigator.userAgent.indexOf("Windows") != -1) os = "w";
  if (window.navigator.userAgent.indexOf("Mac") != -1) os = "m";
  if (window.navigator.userAgent.indexOf("Linux") != -1) os = "l";

  localStorage['os'] = os;

  chrome.tabs.query({currentWindow: true, status: 'complete'}, function(savedTabs){
      for(var i = 0; i < savedTabs.length; i++){ 
          var tab = savedTabs[i];
          if(tab.url){
            tabManager.create(tab);
          }
      }
  });

  chrome.runtime.onInstalled.addListener(function(details) {
    // only run the following section on install
    if (details.reason === "install") {
        ATB.onInstalled();
        ATB.startUpPage();
    }
  });
}

var background = new Background();

chrome.omnibox.onInputEntered.addListener(function(text) {
  chrome.tabs.query({
    'currentWindow': true,
    'active': true
  }, function(tabs) {
    chrome.tabs.update(tabs[0].id, {
      url: "https://duckduckgo.com/?q=" + encodeURIComponent(text) + "&bext=" + localStorage['os'] + "cl"
    });
  });
});

//This adds Context Menu when user select some text.
//create context menu
chrome.contextMenus.create({
  title: 'Search DuckDuckGo for "%s"',
  contexts: ["selection"],
  onclick: function(info) {
    var queryText = info.selectionText;
    chrome.tabs.create({
      url: "https://duckduckgo.com/?q=" + queryText + "&bext=" + localStorage['os'] + "cr"
    });
  }
});

// Add ATB param and block tracker requests
chrome.webRequest.onBeforeRequest.addListener(
    function (requestData) {

      let tabId = requestData.tabId;

      // Add ATB for DDG URLs
      let ddgAtbRewrite = ATB.redirectURL(requestData);
      if(ddgAtbRewrite)
          return ddgAtbRewrite;
      
      // all privacy features are off
      // version.js will set this flag to turn tracking/https off or on
      if (!settings.getSetting('extensionIsEnabled')) {
          return;
      }

      // skip requests to background tabs
      if(tabId === -1){
          return;
      }

      let thisTab = tabManager.get(requestData);

      // for main_frame requests: create a new tab instance whenever we either
      // don't have a tab instance for this tabId or this is a new requestId.
      if (requestData.type === "main_frame") {
          if (!thisTab || (thisTab.requestId !== requestData.requestId)) {
            thisTab = tabManager.create(requestData);
          }
      }
      else {
          // check that we have a valid tab
          // there is a chance this tab was closed before
          // we got the webrequest event
          if (!(thisTab.url && thisTab.id)) {
              return;
          }

          // update badge here to display a 0 count
          updateBadge(thisTab.id, thisTab.getBadgeTotal());
          chrome.runtime.sendMessage({"rerenderPopup": true});
      
          var tracker =  trackers.isTracker(requestData.url, thisTab.url, thisTab.id, requestData);
      
          if (tracker) {
              // record all trackers on a site even if we don't block them
              thisTab.site.addTracker(tracker.url);

              
              // record potential blocked trackers for this tab
              thisTab.addToPotentialBlocked(tracker.url);
              
              // Block the request if the site is not whitelisted
              if (!thisTab.site.whiteListed) {
                  thisTab.addOrUpdateTracker(tracker);
                  updateBadge(thisTab.id, thisTab.getBadgeTotal());
                  chrome.runtime.sendMessage({"rerenderPopup": true});

                  console.info( utils.extractHostFromURL(thisTab.url)
                               + " [" + tracker.parentCompany + "] " + tracker.url);
                  
                  // tell Chrome to cancel this webrequest
                  return {cancel: true};
              }
          }
      }

      // upgrade to https if the site isn't whitelisted or in our list
      // of known broken https sites
      if (!(thisTab.site.whiteListed || httpsWhitelist[thisTab.site.domain])) {
          let upgradeStatus = onBeforeRequest(requestData);
          
          // check for an upgraded main_frame request to use
          // in our site score calculations
          if (requestData.type === "main_frame" && upgradeStatus && upgradeStatus.redirectUrl) {
              thisTab.upgradedHttps = true;
          }

          return upgradeStatus;
      }

    },
    {
        urls: [
            "<all_urls>",
        ],
        types: settings.getSetting('requestListenerTypes')
    },
    ["blocking"]
);

function updateBadge(tabId, numBlocked){
    if(numBlocked === 0){
        chrome.browserAction.setBadgeBackgroundColor({tabId: tabId, color: "#00cc00"});
    } 
    else {
        chrome.browserAction.setBadgeBackgroundColor({tabId: tabId, color: "#cc0000"});
    }
    chrome.browserAction.setBadgeText({tabId: tabId, text: numBlocked + ""});
}

chrome.webRequest.onCompleted.addListener(
        ATB.updateSetAtb,
    {
        urls: [
            "*://duckduckgo.com/?*",
            "*://*.duckduckgo.com/?*"
        ]
    }
);
