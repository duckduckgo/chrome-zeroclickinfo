const bel = require('bel');

module.exports = function () {

        return bel`<section class="sliding-subview sliding-subview--trackers-blocked sliding-subview--has-fixed-header">
            <nav class="sliding-subview__header card">
                <a href="#" class="sliding-subview__header__title sliding-subview__header__title--has-icon js-sliding-subview-close">
                    <span class="icon icon__arrow icon__arrow--left pull-left"></span>
                </a>
            </nav>
            <div>Put site score explanation here...</div>
        </section>`

}

