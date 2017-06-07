const Parent = window.DDG.base.Model;

var backgroundPage = chrome.extension.getBackgroundPage();

// TODO move to settings?
const httpsStates = {
        'default':  'Secure Connection',
        'upgraded': 'Forced Secure Connection',
        'none':     'Secure Connection Unavailable'
    };

function Site (attrs) {

    attrs.disabled = true;     // disabled by default
    attrs.httpsState = 'none';

    // set message and icon based on httpsState
    attrs.httpsStatusText = httpsStates[attrs.httpsState];

    Parent.call(this, attrs);

};


Site.prototype = $.extend({},
  Parent.prototype,
  {

      modelName: 'site',

      toggleWhitelist: function () {
          if(this.tab.site){
              this.isWhitelisted = !this.isWhitelisted;
              this.tab.site.setWhitelisted(this.isWhitelisted);
              this.tab.site.notifyWhitelistChanged();
          }
      },

      setSiteObj: function() {
          if (!this.tab) {
              // firefox new tab page doesn't fire an onUpdated event so we don't have a tab yet
              if (backgroundPage.browser === "moz")
                  this.domain = "new tab";
              else
                this.domain = '-';    // should not happen
          }
          else {
              this.isWhitelisted = this.tab.site.whiteListed;
              
              let special = this.tab.site.specialDomain();
              if (special) {
                  this.domain = special;    // eg "extensions", "options", "new tab"
              }
              else {
                  this.disabled = false;
              }
          }
      },

      updateTrackerCount: function() {
          if(this.tab){
            this.trackerCount = this.tab.getBadgeTotal();
            this.potential = Object.keys(this.tab.potentialBlocked).length;
            this.updateSiteScore();
          }
      },

      updateSiteScore: function() {
          if (this.trackerCount == 0 && this.potential > 0)
              this.siteRating = 'B'
          else if (this.trackerCount > 8 ) // arbitrary demo
              this.siteRating = 'C';
          else if (this.trackerCount > 0 )
              this.siteRating = 'B';
          else if (this.trackerCount == 0 && this.potential == 0)
              this.siteRating = 'A';
          else
              this.siteRating = 'none';
      }, 

      setHttpsMessage: function() {
          if (!this.tab) {
              return;
          }

          if (this.tab.upgradedHttps) {
              this.httpsState = 'upgraded';
          }
          else if (/^https/.exec(this.tab.url)) {
              this.httpsState = 'default';
          }

          this.httpsStatusText = httpsStates[this.httpsState];
      }
  }
);

module.exports = Site;
