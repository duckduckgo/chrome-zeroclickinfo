class Site{
    constructor(domain, scoreFunction) {
        this.domain = domain,
        this.trackers = [],
        this.score = 'none';

        this.potential = 0; // count of potential trackers, not blocked
        this.trackerCount = 0;

        // this.scoreFunction = scoreFunction;
        this.setWhitelistStatusFromGlobal(domain)
    }

    setWhitelisted(value){ 
        this.whiteListed = value;
        this.setGlobalWhitelist();
    };

    setGlobalWhitelist(){
        let globalWhitelist = settings.getSetting('whitelist') || {};

        if(this.whiteListed){
            globalWhitelist[this.domain] = true;
        }
        else {
            delete globalWhitelist[this.domain];
        }

        settings.updateSetting('whitelist', globalWhitelist);
    };

    notifyWhitelistChanged(){
        chrome.runtime.sendMessage({'whitelistChanged': true});
    };

    isWhiteListed(){ return this.whiteListed };
    
    addTracker(tracker){ 
        if(this.trackers.indexOf(tracker) === -1){
            this.trackers.push(tracker);
        }
    };

    getScore() {
        // this.score = this.scoreFunction();

        if (this.specialDomain()) {
            this.score = 'none';
            return this.score;
        }

        console.log(`tracker count for ${this.domain} : ${this.trackerCount}`);

        if (this.trackerCount == 0) {
            if (this.potential > 0)    // most likely whitelisted
                this.score = 'B';
            else
                this.score = 'A';
        }
        else {
            this.score = 'B';
        }

        return this.score;
    };

    setWhitelistStatusFromGlobal(domain){
        let globalWhitelist = settings.getSetting('whitelist') || {};

        if(globalWhitelist[this.domain]){
            this.setWhitelisted(true);
        }
        else{
            this.setWhitelisted(false);
        }
    };

    getTrackers(){ return this.trackers };
    setTrackers(newTrackers){ this.trackers = newTrackers };
    setScore(newScore){ this.score = newScore };



    /*
     * specialDomain
     *
     * determine if domain is a special page
     *
     * returns: a useable special page description string.
     *          or false if not a special page.
     */
    specialDomain() {
        if (this.domain === 'extensions')
            return "extensions";

        if (this.domain === chrome.runtime.id)
            return "options";

        if (this.domain === 'newtab')
            return "new tab";

        return false;
    }
}
