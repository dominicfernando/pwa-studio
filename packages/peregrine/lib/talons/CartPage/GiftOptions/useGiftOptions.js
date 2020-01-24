import { useState, useCallback, useEffect, useMemo } from 'react';
import throttle from 'lodash.throttle';
import gql from 'graphql-tag';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';

import { useCartContext } from '@magento/peregrine/lib/context/cart';

const GET_GIFT_OPTIONS_QUERY = gql`
    query getGiftOptions {
        gift_options @client {
            include_gift_receipt
            include_printed_card
            gift_message
        }
    }
`;

const SET_GIFT_OPTIONS_QUERY = gql`
    mutation setGiftOptions(
        $cart_id: String
        $include_gift_receipt: Boolean
        $include_printed_card: Boolean
        $gift_message: String
    ) {
        set_gift_options(
            cart_id: $cart_id
            include_gift_receipt: $include_gift_receipt
            include_printed_card: $include_printed_card
            gift_message: $gift_message
        ) @client
    }
`;

const useToggle = () => {
    const [flag, setFlag] = useState(false);

    const toggleFlag = () => {
        setFlag(!flag);
    };

    return [flag, toggleFlag, setFlag];
};

const useGiftOptions = () => {
    const [
        includeGiftReceipt,
        toggleIncludeGitReceipt,
        setIncludeGiftReceipt
    ] = useToggle(false);
    const [
        includePrintedCard,
        toggleIncludePrintedCard,
        setIncludePrintedCard
    ] = useToggle(false);
    const [giftMessage, setGiftMessage] = useState('');

    const [{ cartId }] = useCartContext();

    const [getGiftOptions, { data }] = useLazyQuery(GET_GIFT_OPTIONS_QUERY, {
        variable: { cartId }
    });

    const [setGiftOptions] = useMutation(SET_GIFT_OPTIONS_QUERY);

    useEffect(getGiftOptions, []);

    useEffect(() => {
        if (data) {
            const {
                include_gift_receipt,
                include_printed_card,
                gift_message
            } = data.gift_options;
            setIncludeGiftReceipt(include_gift_receipt);
            setIncludePrintedCard(include_printed_card);
            setGiftMessage(gift_message);
        }
    }, [setIncludeGiftReceipt, setIncludePrintedCard, data]);

    const updateGiftOptions = useCallback(
        newOptions => {
            setGiftOptions({
                variables: {
                    cart_id: cartId,
                    include_gift_receipt: includeGiftReceipt,
                    include_printed_card: includePrintedCard,
                    gift_message: giftMessage,
                    ...newOptions
                }
            });
        },
        [
            cartId,
            setGiftOptions,
            includeGiftReceipt,
            includePrintedCard,
            giftMessage
        ]
    );

    const throttledMessageUpdate = useMemo(() => {
        return throttle(
            newGiftMessage => {
                console.log('Inside throttle', newGiftMessage);
                updateGiftOptions({
                    gift_message: newGiftMessage
                });
            },
            5000,
            {
                leading: true
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateGiftMessage = useCallback(
        newGiftMessage => {
            setGiftMessage(newGiftMessage);

            throttledMessageUpdate(newGiftMessage);
        },
        [setGiftMessage, throttledMessageUpdate]
    );

    const toggleIncludeGitReceiptFlag = useCallback(() => {
        toggleIncludeGitReceipt();
        updateGiftOptions({
            include_gift_receipt: !includeGiftReceipt
        });
    }, [updateGiftOptions, includeGiftReceipt, toggleIncludeGitReceipt]);

    const toggleIncludePrintedCardFlag = useCallback(() => {
        toggleIncludePrintedCard();
        updateGiftOptions({
            include_printed_card: !includePrintedCard
        });
    }, [updateGiftOptions, includePrintedCard, toggleIncludePrintedCard]);

    return [
        { includeGiftReceipt, includePrintedCard, giftMessage },
        {
            toggleIncludeGitReceiptFlag,
            toggleIncludePrintedCardFlag,
            updateGiftMessage
        }
    ];
};

export default useGiftOptions;
