const bel = require('bel');

module.exports = function () {
    return bel`<section>
        <form class="search-form js-search-form card" name="x">
          <input type="text" autocomplete="off" placeholder="Search DuckDuckGo" name="q" class="search-form__input js-search-input" value="${this.model.searchText}" />
          <input class="search-form__go js-search-go" tabindex="2" value="" type="button" />
          <input type="submit" class="search-form__submit" />
          <span class="ddg-logo-${this.model.browser}"></span>
        </form>
    </section>`;
}
