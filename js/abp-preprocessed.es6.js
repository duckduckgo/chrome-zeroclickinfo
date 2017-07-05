/*
 * Load the abp-filter-parser node module and 
 * pre-process the easylists.
 *
 * This will be browserifyed and turned into abp.js by running 'grunt'
 */
abp = require('abp-filter-parser');
let request = require('request');
cryptoJS = require("crypto"); 

easylists = {
    privacy: {
        url: 'https://easylist.to/easylist/easyprivacy.txt',
        parsed: {}
    },
    general: {
        url: 'https://easylist.to/easylist/easylist.txt',
        parsed: {}
    }
};

/*
 * Get the list data and use abp to parse.
 * The parsed list data will be added to 
 * the easyLists object.
 */
for (let list in easylists) {
    let url = easylists[list].url;
    let listData = load.loadExtensionFile(url, '', 'external');
    abp.parse(listData, easylists[list].parsed);
}

easylists.loaded = true;
