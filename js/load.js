(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function JSONfromLocalFile(path, cb) {
    loadExtensionFile({ url: path, returnType: 'json' }, function (res) {
        return cb(JSON.parse(res));
    });
}

function JSONfromExternalFile(url, cb) {
    try {
        loadExtensionFile({ url: url, returnType: 'json', source: 'external' }, function (res, xhr) {
            return cb(JSON.parse(res), xhr);
        });
    } catch (e) {
        return {};
    }
}

function returnResponse(xhr, returnType) {
    if (returnType === 'xml') {
        return xhr.responseXML;
    } else {
        return xhr.responseText;
    }
}

/*
 * Params:
 *  - url: request URL
 *  - source: requests are internal by default. set source to 'external' for non-extension URLs
 *  - etag: set an if-none-match header
 */
function loadExtensionFile(params, cb) {
    var xhr = new XMLHttpRequest();

    if (params.source === 'external') {
        xhr.open("GET", params.url);
        if (params.etag) {
            xhr.setRequestHeader('If-None-Match', params.etag);
        }
    } else {
        xhr.open("GET", chrome.extension.getURL(params.url));
    }

    xhr.send(null);

    xhr.onreadystatechange = function () {
        var done = XMLHttpRequest.DONE ? XMLHttpRequest.DONE : 4;
        if (xhr.readyState === done && xhr.status === 200) {
            cb(returnResponse(xhr, params.returnType), xhr);
        }
    };
}

var _exports = {
    loadExtensionFile: loadExtensionFile,
    JSONfromLocalFile: JSONfromLocalFile,
    JSONfromExternalFile: JSONfromExternalFile
};

},{}]},{},[1]);
