import React, { Fragment } from 'react';

import defaultClasses from './itemsReview.css';

export default () => {
    /**
     * Use talon to get information about items in cart
     * to show a review of them.
     */
    return (
        <Fragment>
            <div>
                New ticket needs to be created for Review of Items in Cart
            </div>
            <div className={defaultClasses.text_content}>
                Review of Items in Cart
            </div>
        </Fragment>
    );
};
