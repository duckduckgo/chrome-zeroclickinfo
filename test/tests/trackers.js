(function() {
  QUnit.module("trackers");
  var fakeRequest = {type: 'script'};
  let fakeTab = {
      tabId: 0,
      url: 'http://test.com',
      site: {domain: 'test.com'}
  }

  var basicBlocking = [
    { url: 'https://doubleclick.net', block: true},
    { url: 'https://duckduckgo.com', block: false},
    { url: 'https://developers.google.com', block: true},
    { url: 'https://x.y.z.doubleclick.net', block: true},
    { url: 'https://logx.optimizely.com/log/event', block: true}
  ];

  QUnit.test("block url", function (assert) {
      // turn social blocking on for this test
      bkg.settings.updateSetting('socialBlockingIsEnabled', true);

      basicBlocking.forEach(function(test) {
          bkg.settings.updateSetting('trackerBlockingEnabled', true);
          var toBlock = bkg.trackers.isTracker(test.url, fakeTab, fakeRequest);
          toBlock = toBlock ? true : false;
          assert.ok(toBlock === test.block, 'url should be blocked');
      });
  });

  // These abp blocking tests are based on actual entries from
  // the easylist. These tests could fail in the future if the easylist
  // entries are changed or whitelisted.
  var abpBlocking = [
    { url: 'https://s.yimg.com/rq/darla/boot.js', block: false, options:{}}, // ||yimg.com/rq/darla/$domain=yahoo.com
    { url: 'https://s.yimg.com/rq/darla/boot.js', block: true, options:{domain: 'yahoo.com'}}, // ||yimg.com/rq/darla/$domain=yahoo.com
    { url: 'https://somesite.com/_ad6.', block: true, options:{}}, // _ad6.
    { url: 'https://googleads.g.doubleclick.net/pagead/id', block: true, options:{}}, // /googleads.
    { url: 'https://www.redditstatic.com/moat/moatframe.js', block: true, options:{}}, // ||redditstatic.com/moat/
    { url: 'http://ads.rubiconproject.com/header/11078.js', block: true, options:{}}, //  ||rubiconproject.com^$third-party
    { url: 'https://s.yimg.com/rq/darla/3-0-2/js/g-r-min.js', block: false, options: {domain: 'yahoo.com'}}, // @@||yimg.com/rq/darla/*/g-r-min.js$domain=yahoo.com
    { url: 'https://s.yimg.com/zz/combo?yt/y7/assets/1.0.81/js/components/darla/client-js/darla.js', block: false, options:{}}, // whitelisted by @@||yimg.com/zz/combo?*&*.js
    { url: 'https://aax.amazon-adsystem.com/', block: true, options:{}}, // ||amazon-adsystem.com^$third-party
    { url: 'https://0914.global.ssl.fastly.net/ad2/script/x.js?cb=1510932127199', block: false, options:{}}, // whitelisted by @@||fastly.net/ad2/$script
    { url: 'https://securepubads.g.doubleclick.net/gpt/pubads_impl_168.js', block: true, options:{}}, // /securepubads.
    { url: 'https://shim.btrll.com/', block: true, options:{}}, // ||btrll.com^$third-party
    { url: 'https:/somesite.com/webservices/jsparselinks.aspx?q=1', block: true, options: {type: 'SCRIPT'}}, // /webservices/jsparselinks.aspx?$script
    { url: 'https:/somesite.com/webservices/jsparselinks.aspx?q=1', block: false, options: {type: 'OBJECT'}}, // /webservices/jsparselinks.aspx?$script
    { url: 'http://ads.blogherads.com/73/7399/header.js', block: true, options: {type: 'OBJECT'}}, // /webservices/jsparselinks.aspx?$script
    { url: 'https://radar.cedexis.com/1/14290/radar.js', block: true, options: {type: 'OBJECT'}}, // from easy privacy, ||cedexis.com^$third-party
    { url: 'https://connect.facebook.net/en_US/fbevents.js', block: true, options: {type: 'OBJECT'}}, // from easy privacy,  ||connect.facebook.net^*/fbevents.js$third-party
    { url: 'https://connect.facebook.net/en_US/fbevents.js', block: false, options: {domain: 'facebook.com', type: 'OBJECT'}}, // from easy privacy,  ||connect.facebook.net^*/fbevents.js$third-party
    { url: 'https://www.facebook.com/rsrc.php/v3/y6/r/69R6jxYtiKN.js', block: true, options: {domain: 'up-4ever.com', type: 'OBJECT'}}, // |https://$third-party,script,domain=up-4ever.com
    { url: 'https://v.shopify.com/storefront/page?referrer=https%3A%2F%2Fwww.pinkbike.com&eventType=page', block: true, options: {domain: 'facebook.com', type: 'OBJECT'}}, // from easy privacy ||shopify.com/storefront/page?*&eventtype=
    { url: 'https://secureinclude.ebaystatic.com/js/v/us/pulsar.js', block: true, options: {type: 'SCRIPT', domain: 'ebay.com'}}, // easy privacy, ||ebaystatic.com^*/pulsar.js, tests domain anchor and wildcard
    { url: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js', block: false, options: {type: 'SCRIPT', domain: 'destructoid.com'}}, // @@||maxcdn.bootstrapcdn.com^$script,domain=destructoid.com, test whitelist with options
  ];

  QUnit.test("abp blocking url", function (assert) {
      // turn social blocking on for this test
      bkg.settings.updateSetting('socialBlockingIsEnabled', true);

      abpBlocking.forEach(function(test) {
          bkg.settings.updateSetting('trackerBlockingEnabled', true);

          let testTab = Object.assign({}, JSON.parse(JSON.stringify(fakeTab)))

          if(test.options.domain) {
              testTab.url = test.options.domain
              testTab.site.domain = test.options.domain
          }

          if (test.options.type)
              fakeRequest.type = test.options.type

          let toBlock = bkg.trackers.isTracker(test.url, testTab, fakeRequest);
          toBlock = toBlock ? toBlock.block : false;
          assert.ok(toBlock === test.block, `abp blocking decision.. url: ${test.url} ${toBlock} === ${test.block}`);
      });
  });

  QUnit.test("turn off blocking", function (assert) {
      basicBlocking.forEach(function(test) {
          bkg.settings.updateSetting('trackerBlockingEnabled', false);
          var toBlock = bkg.trackers.isTracker(test.url, fakeTab, fakeRequest);
          toBlock = toBlock ? toBlock.block : false;
          assert.ok(toBlock === false, 'url should not be');
      });
  });

  var thirdPartyTests = [
      { url: 'https://facebook.com', potentialTracker: 'https://facebook.com', block: false, message: 'don\'t block first party requests'},
      { url: 'https://independent.co.uk', potentialTracker: 'https://amazon.co.uk', block: true, message: 'handle two part tld'},
      { url: 'https://independent.co.uk', potentialTracker: 'https://subdomain.amazon.co.uk', block: true, message: 'handle two part tld'},
      { url: 'https://amazon.co.uk', potentialTracker: 'https://subdomain.amazon.co.uk', block: false, message: 'handle two part tld'},
      { url: 'https://facebook.com', potentialTracker: 'https://reddit.com', block: true, message: 'should block third party request'},
      { url: 'https://facebook.com', potentialTracker: 'https://instagram.com', block: false, message: 'should not block third party requests owned by same parent company'}
  ];

  QUnit.test("third party blocking", function (assert) {
      thirdPartyTests.forEach(function(test) {
          bkg.settings.updateSetting('trackerBlockingEnabled', true);
          bkg.settings.updateSetting('socialBlockingIsEnabled', true);

          let testTab = {
              tabId: 0,
              url: test.url,
              site: {domain: utils.extractHostFromURL(test.url)}
          }

          var toBlock = bkg.trackers.isTracker(test.potentialTracker, testTab, fakeRequest);
          toBlock = toBlock ? toBlock.block : false;
          assert.ok(toBlock === test.block, test.message);
      });
  });

  QUnit.test('cache trackers block/noblock lookups', function (assert) {
      var test = thirdPartyTests[1]
      bkg.settings.updateSetting('trackerBlockingEnabled', true)
      bkg.settings.updateSetting('socialBlockingIsEnabled', true)

      let testTab = {
          tabId: 0,
          url: test.url,
          site: {domain: utils.extractHostFromURL(test.url)}
      }

      var toBlock = bkg.trackers.isTracker(test.potentialTracker, testTab, fakeRequest)
      bkg.trackers.addToCache(test.potentialTracker, testTab.url, toBlock)
      assert.ok(toBlock.block === test.block, test.message)
      setTimeout(function () {
          bkg.trackers
              .isCached(test.potentialTracker, testTab.url)
              .then((cachedResult) => {
                  assert.ok(cachedResult.block === toBlock.block, `cache result of ${test.message}`)
              })
      }, 200)
  })

  QUnit.test('do not cache tracker lookups when tracker blocking is disabled', function (assert) {
      bkg.settings.updateSetting('trackerBlockingEnabled', false)
      assert.ok(bkg.settings.getSetting('trackerBlockingEnabled') === false, 'tracker blocking is disabled')

      const pageUrl = 'http://foo123.com/foo'
      const potentialTracker = 'http://bar123.com/bar'
      let testTab = {
          tabId: 0,
          url: pageUrl,
          site: {domain: utils.extractHostFromURL(pageUrl)}
      }

      var toBlock = true
      bkg.trackers.addToCache(potentialTracker, testTab.url, toBlock)
      setTimeout(function () {
          bkg.trackers
              .isCached(potentialTracker, testTab.url)
              .then((cachedResult) => {
                  assert.ok(cachedResult === undefined, `do not cache tracker blocking decision when tracker blocking is disabled`)
              })
      }, 200)
  })

  QUnit.test('do not cache tracker lookups on 1st party requests', function (assert) {
      var test = thirdPartyTests[0]
      bkg.settings.updateSetting('trackerBlockingEnabled', true)
      bkg.settings.updateSetting('socialBlockingIsEnabled', true)

      let testTab = {
          tabId: 0,
          url: test.url,
          site: {domain: utils.extractHostFromURL(test.url)}
      }

      var toBlock = bkg.trackers.isTracker(test.potentialTracker, testTab, fakeRequest)
      assert.ok(toBlock === undefined, test.message)
      bkg.trackers.addToCache(test.potentialTracker, testTab.url)
      setTimeout(function () {
          bkg.trackers
              .isCached(test.potentialTracker, testTab.url)
              .then((cachedResult) => {
                  assert.ok(cachedResult.cancel === undefined, `do not cache result of ${test.message}`)
              })
      }, 200)
  })

  var socialBlocking = [
    { url: 'https://facebook.com/?q=something&param=a'},
    { url: 'http://twitter.com/somescript.js'}
  ];

  QUnit.test("social blocking", function (assert) {
      socialBlocking.forEach(function(test) {
          bkg.settings.updateSetting('trackerBlockingEnabled', true);
          bkg.settings.updateSetting('socialBlockingIsEnabled', true);
          let toBlock = bkg.trackers.isTracker(test.url, fakeTab, fakeRequest);
          toBlock = toBlock ? toBlock.block : false;
          assert.ok(toBlock === true, 'url should be blocked');
      });

      socialBlocking.forEach(function(test) {
          bkg.settings.updateSetting('trackerBlockingEnabled', true);
          bkg.settings.updateSetting('socialBlockingIsEnabled', false);
          let toBlock = bkg.trackers.isTracker(test.url, fakeTab, fakeRequest);
          toBlock = toBlock ? toBlock.block : false;
          assert.ok(toBlock === false, 'url should be blocked');
      });
  });

  // Some basic tests for the abp module. These should be expanded to cover all abp filter options
  QUnit.test("Test abp matching", (assert) => {

      // testEasylist is defined in testEasylist.js
      let fakeEasylist = testEasylist.join('\n')
      let fakeRegexList = regexList.join('\n')

      let parsedList = {}
      abp.parse(fakeEasylist, parsedList)
      abp.parse(fakeRegexList, parsedList)

      easylistTestCases.forEach((e) => {
          let domain = e.options.domain || 'test.com'
          let type = e.options.type || 'SCRIPT'

          let match = abp.matches(parsedList, e.url, {
              domain: domain,
              elementTypeMask:abp.elementTypes[type]
          })

          assert.ok(match === e.block, `Got correct blocking decision. ${match} === ${e.block}, ${e.url} ${JSON.stringify(e.options)}`)
      })
  })

})();
