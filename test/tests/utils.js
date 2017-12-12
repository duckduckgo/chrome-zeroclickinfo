(function() {
  QUnit.module("utils");
  QUnit.test("Utils", function (assert) {

  var tests = [
    { url: 'https://duckduckgo.com', hostname: 'duckduckgo.com', protocol: 'https:'},
    { url: 'http://duckduckgo.com/?q=something', hostname: 'duckduckgo.com', protocol: 'http:'}
  ];

  tests.forEach(function(test) {
          var host = bkg.utils.extractHostFromURL(test.url);
          var protocol = bkg.utils.getProtocol(test.url)
          assert.ok(host === test.hostname, 'extracted correct host from url');
          assert.ok(protocol === test.protocol, 'extracted correct protocol from url');
  });

  bkg.utils.hashSHA256('foobar').then((hash) => {
      var expected = 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2'
      assert.ok(hash === expected, 'generated hash of string correctly')
  })

  });
})();
