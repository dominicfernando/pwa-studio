import React, { Fragment } from 'react';
import gql from 'graphql-tag';
import { Form } from 'informed';
import { useShippingMethods } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/ShippingMethods/useShippingMethods';

import { mergeClasses } from '../../../../classify';
import Button from '../../../Button';
import ShippingForm from './shippingForm';
import defaultClasses from './shippingMethods.css';
import { ShippingMethodsFragment } from './shippingMethodsFragments';
import ShippingRadios from './shippingRadios';

const ShippingMethods = props => {
    const {
        hasMethods,
        isShowingForm,
        selectedShippingFields,
        selectedShippingMethod,
        shippingMethods,
        showForm
    } = useShippingMethods({
        getShippingMethodsQuery: GET_SHIPPING_METHODS
    });

    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <div className={classes.root}>
            <p className={classes.message}>
                For shipping estimates before proceeeding to checkout, please
                provide the Country, State, and ZIP for the destination of your
                order.
            </p>
            {isShowingForm ? (
                <Fragment>
                    <ShippingForm
                        hasMethods={hasMethods}
                        selectedShippingFields={selectedShippingFields}
                    />
                    {hasMethods ? (
                        <Fragment>
                            <h3 className={classes.prompt}>Shipping Methods</h3>
                            <Form>
                                <ShippingRadios
                                    selectedShippingMethod={
                                        selectedShippingMethod
                                    }
                                    shippingMethods={shippingMethods}
                                />
                            </Form>
                        </Fragment>
                    ) : null}
                </Fragment>
            ) : (
                <Button
                    classes={{ root_lowPriority: classes.estimateLink }}
                    priority="low"
                    type="button"
                    onClick={showForm}
                >
                    I want to estimate my shipping
                </Button>
            )}
        </div>
    );
};

export default ShippingMethods;

export const GET_SHIPPING_METHODS = gql`
    query GetShippingMethods($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...ShippingMethodsFragment
        }
    }
    ${ShippingMethodsFragment}
`;
