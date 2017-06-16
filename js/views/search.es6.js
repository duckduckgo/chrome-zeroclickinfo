const Parent = window.DDG.base.View;
let bkg = chrome.extension.getBackgroundPage();

function Search (ops) {

    this.model = ops.model;
    this.pageView = ops.pageView;
    this.template = ops.template;
    this.model.browser = bkg.browser;

    Parent.call(this, ops);

    this._cacheElems('.js-search', [ 'form', 'input', 'go' ]);

    this.bindEvents([
      [this.$input, 'keyup', this._handleKeyup],
      [this.$go, 'click', this._handleSubmit],
      [this.$form, 'submit', this._handleSubmit]
    ]);

};

Search.prototype = $.extend({},
    Parent.prototype,
    {

        _handleKeyup: function (e) {
            this.model.set('searchText', this.$input.val());
        },

        _handleSubmit: function (e) {
            console.log(`Search submit for ${this.$input.val()}`);
            this.model.doSearch(this.$input.val());
        }
    }

);

module.exports = Search;
