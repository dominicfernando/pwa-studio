import React, { Fragment, useMemo } from 'react';

import { useCheckoutPage } from '@magento/peregrine/lib/talons/CheckoutPage/useCheckoutPage';

import { Title } from '../../components/Head';
import Button from '../Button';
import PriceSummary from './PriceSummary';
import PaymentInformation from './PaymentInformation';
import ShippingMethod from './ShippingMethod';
import ShippingInformation from './ShippingInformation';
import OrderConfirmationPage from './OrderConfirmationPage';
import PriceAdjustments from './PriceAdjustments';
import ItemsReview from './ItemsReview';

import CREATE_CART_MUTATION from '../../queries/createCart.graphql';
import GET_CART_DETAILS_QUERY from '../../queries/getCartDetails.graphql';

import { mergeClasses } from '../../classify';

import defaultClasses from './checkoutPage.css';

const GuestCheckoutOptions = props => {
    const { classes, handleSignIn } = props;

    return (
        <div className={classes.signin_container}>
            <Button
                className={classes.sign_in}
                onClick={handleSignIn}
                priority="high"
            >
                {'Login and Checkout Faster'}
            </Button>
        </div>
    );
};

const GreetingMessage = props => {
    const { isGuestCheckout, classes } = props;

    return (
        <div className={classes.heading_container}>
            <h1 className={classes.heading}>
                {isGuestCheckout ? 'Guest Checkout' : 'Review and Place Order'}
            </h1>
        </div>
    );
};

const EmptyCartMessage = props => {
    const { classes, isGuestCheckout } = props;

    return (
        <div className={classes.empty_cart_container}>
            <div className={classes.heading_container}>
                <h1 className={classes.heading}>
                    {isGuestCheckout ? 'Guest Checkout' : 'Checkout'}
                </h1>
            </div>
            <h3>There are no items in your cart.</h3>
        </div>
    );
};

export default props => {
    const { classes: propClasses } = props;
    const talonProps = useCheckoutPage({
        createCartMutation: CREATE_CART_MUTATION,
        getCartDetailsQuery: GET_CART_DETAILS_QUERY
    });
    const [
        {
            isGuestCheckout,
            isCartEmpty,
            shippingInformationDone,
            shippingMethodDone,
            paymentInformationDone,
            orderPlaced
        },
        {
            handleSignIn,
            setShippingInformationDone,
            setShippingMethodDone,
            setPaymentInformationDone,
            placeOrder
        }
    ] = talonProps;

    const classes = mergeClasses(defaultClasses, propClasses);

    const guestCheckout = useMemo(() => {
        if (isGuestCheckout) {
            return (
                <GuestCheckoutOptions
                    classes={classes}
                    handleSignIn={handleSignIn}
                />
            );
        } else {
            return null;
        }
    }, [isGuestCheckout, classes, handleSignIn]);

    const priceAdjustments = useMemo(() => {
        const showPriceAdjustments =
            shippingInformationDone &&
            shippingMethodDone &&
            !paymentInformationDone;

        if (showPriceAdjustments) {
            return (
                <div className={classes.price_adjustments_container}>
                    <PriceAdjustments />
                </div>
            );
        } else {
            return null;
        }
    }, [
        classes,
        shippingInformationDone,
        shippingMethodDone,
        paymentInformationDone
    ]);

    const itemsReview = useMemo(() => {
        const showItemsReview =
            shippingInformationDone &&
            shippingMethodDone &&
            paymentInformationDone;

        if (showItemsReview) {
            return (
                <div className={classes.items_review_container}>
                    <ItemsReview />
                </div>
            );
        } else {
            return null;
        }
    }, [
        classes,
        shippingInformationDone,
        shippingMethodDone,
        paymentInformationDone
    ]);

    const orderConfirmation = useMemo(() => {
        if (isCartEmpty && orderPlaced) {
            return <OrderConfirmationPage />;
        } else {
            return null;
        }
    }, [isCartEmpty, orderPlaced]);

    const emptyCart = useMemo(() => {
        if (isCartEmpty && !orderPlaced) {
            return (
                <EmptyCartMessage
                    classes={classes}
                    isGuestCheckout={isGuestCheckout}
                />
            );
        } else {
            return null;
        }
    }, [isCartEmpty, orderPlaced, classes, isGuestCheckout]);

    const checkOutButton = useMemo(() => {
        const { place_order_button, review_order_button } = classes;
        if (shippingInformationDone && shippingMethodDone) {
            if (paymentInformationDone) {
                return (
                    <Button
                        onClick={placeOrder}
                        priority="high"
                        className={place_order_button}
                    >
                        {'Place Order'}
                    </Button>
                );
            } else {
                return (
                    <Button
                        onClick={setPaymentInformationDone}
                        priority="high"
                        className={review_order_button}
                    >
                        {'Review Order'}
                    </Button>
                );
            }
        } else {
            return null;
        }
    }, [
        classes,
        paymentInformationDone,
        shippingInformationDone,
        shippingMethodDone,
        placeOrder,
        setPaymentInformationDone
    ]);

    return (
        <div className={classes.root}>
            <Title>{`Checkout - ${STORE_NAME}`}</Title>
            {!isCartEmpty ? (
                <Fragment>
                    {guestCheckout}
                    <GreetingMessage
                        isGuestCheckout={isGuestCheckout}
                        classes={classes}
                    />
                    <div className={classes.body}>
                        <div className={classes.shipping_information_container}>
                            <ShippingInformation
                                onSave={setShippingInformationDone}
                                doneEditing={shippingInformationDone}
                            />
                        </div>
                        <div className={classes.shipping_method_container}>
                            <ShippingMethod
                                onSave={setShippingMethodDone}
                                doneEditing={shippingMethodDone}
                                showContent={shippingInformationDone}
                            />
                        </div>
                        <div className={classes.payment_information_container}>
                            <PaymentInformation
                                doneEditing={paymentInformationDone}
                                showContent={
                                    shippingInformationDone &&
                                    shippingMethodDone
                                }
                            />
                        </div>
                        {priceAdjustments}
                        {itemsReview}
                        <div className={classes.summary_container}>
                            <div className={classes.summary_contents}>
                                <PriceSummary />
                            </div>
                        </div>
                        {checkOutButton}
                    </div>
                </Fragment>
            ) : null}
            {orderConfirmation}
            {emptyCart}
        </div>
    );
};