const bel = require('bel');

module.exports = function (site, text, klass) {

    return bel`
    <button class="${klass}"
            type="button">
    ${text}
    </button>`;
}

