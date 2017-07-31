const Parent__SlidingSubview = require('./sliding-subview.es6.js');

function SiteScore (ops) {
    this.template = ops.template;
    Parent__SlidingSubview.call(this, ops);
};

SiteScore.prototype = $.extend({},
    Parent__SlidingSubview.prototype,
    {

    }
);

module.exports = SiteScore;
