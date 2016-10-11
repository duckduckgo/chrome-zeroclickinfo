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


function Background() {
  $this = this;

  // clearing last search on borwser startup
  localStorage['last_search'] = '';

  var os = "o";
  if (window.navigator.userAgent.indexOf("Windows") != -1) os = "w";
  if (window.navigator.userAgent.indexOf("Mac") != -1) os = "m";
  if (window.navigator.userAgent.indexOf("Linux") != -1) os = "l";

  localStorage['os'] = os;

  chrome.runtime.onInstalled.addListener(function(details) {
    // only run the following section on install
    if (details.reason !== "install") {
      return;
    }

    if (localStorage['atb'] === undefined) {
        var oneWeek = 604800000,
            oneDay = 86400000,
            oneHour = 3600000,
            oneMinute = 60000,
            estEpoch = 1456290000000,
            localDate = new Date(),
            localTime = localDate.getTime(),
            utcTime = localTime + (localDate.getTimezoneOffset() * oneMinute),
            est = new Date(utcTime + (oneHour * -5)),
            dstStartDay = 13 - ((est.getFullYear() - 2016) % 6),
            dstStopDay = 6 - ((est.getFullYear() - 2016) % 6),
            isDST = (est.getMonth() > 2 || (est.getMonth() == 2 && est.getDate() >= dstStartDay)) && (est.getMonth() < 10 || (est.getMonth() == 10 && est.getDate() < dstStopDay)),
            epoch = isDST ? estEpoch - oneHour : estEpoch,
            timeSinceEpoch = new Date().getTime() - epoch,
            majorVersion = Math.ceil(timeSinceEpoch / oneWeek),
            minorVersion = Math.ceil(timeSinceEpoch % oneWeek / oneDay);

        localStorage['atb'] = 'v' + majorVersion + '-' + minorVersion;
    }

    // inject the oninstall script to opened DuckDuckGo tab.
    chrome.tabs.query({ url: 'https://*.duckduckgo.com/*' }, function (tabs) {
      var i = tabs.length, tab;
      while (i--) {
        tab = tabs[i];
        chrome.tabs.executeScript(tab.id, {
          file: 'js/oninstall.js'
        });
        chrome.tabs.insertCSS(tab.id, {
          file: 'css/noatb.css'
        });
      }
    });

    // Show search engine settings along with steps required to make DuckDuckGo
    // the default for platforms where the override does not work.
    if (os !== 'w') {
      chrome.tabs.create({ url: 'chrome://settings/searchEngines' });
      chrome.notifications.create({
        type: "basic",
        iconUrl: "./img/icon_128.png",
        title: "One more step!",
        message: "Click 'Make Default' next to DuckDuckGo in the list below."
      });
    }
  });

  chrome.extension.onMessage.addListener(function(request, sender, callback) {
    if (request.options) {
      callback(localStorage);
    }

    if (request.current_url) {
      chrome.tabs.getSelected(function(tab) {
        var url = tab.url;
        callback(url);
      });
    }

    if (!localStorage['set_atb'] && request.atb) {
      localStorage['atb'] = request.atb;
      localStorage['set_atb'] = true;
    }

    return true;
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

// Add ATB param
chrome.webRequest.onBeforeRequest.addListener(
    function (e) {
      // Only change the URL if there is no ATB param specified.
      if (e.url.indexOf('atb=') !== -1) {
        return;
      }

      // Only change the URL if there is an ATB saved in localStorage
      if (localStorage['atb'] === undefined) {
        return;
      }

      var newURL = e.url + "&atb=" + localStorage['atb'];
      return {
        redirectUrl: newURL
      };
    },
    {
        urls: [
            "*://duckduckgo.com/?*",
            "*://*.duckduckgo.com/?*",
        ],
        types: ["main_frame"]
    },
    ["blocking"]
);
