/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import BraintreeDropIn from 'Util/Braintree';
import { paymentMethodsType } from 'Type/Checkout';

import { BRAINTREE_CONTAINER_ID } from 'Component/Braintree/Braintree.component';
import { BILLING_STEP } from 'Route/Checkout/Checkout.component';
import CheckoutPayments, { BRAINTREE, STRIPE } from './CheckoutPayments.component';
import { BRAINTREE_CONTAINER_ID } from 'Component/Braintree/Braintree.component';

export class CheckoutPaymentsContainer extends PureComponent {
    static propTypes = {
        onPaymentMethodSelect: PropTypes.func.isRequired,
        paymentMethods: paymentMethodsType.isRequired
    };

    containerFunctions = {
        initBraintree: this.initBraintree.bind(this),
        setStripeRef: this.setStripeRef.bind(this),
        selectPaymentMethod: this.selectPaymentMethod.bind(this),
        getBraintreeData: this.getBraintreeData.bind(this),
        getStripeData: this.getStripeData.bind(this),
    };

    braintree = new BraintreeDropIn(BRAINTREE_CONTAINER_ID);

    braintree = new BraintreeDropIn(BRAINTREE_CONTAINER_ID);

    dataMap = {
        [BRAINTREE]: this.getBraintreeData.bind(this),
        [STRIPE]: this.getStripeData.bind(this)
    };

    constructor(props) {
        super(props);

        const { paymentMethods } = props;
        const [{ code }] = paymentMethods;
        this.state = { selectedPaymentCode: code };
    }

    componentDidMount() {
        if (window.formPortalCollector) {
            window.formPortalCollector.subscribe(BILLING_STEP, this.collectAdditionalData, 'CheckoutPaymentsContainer');
        }
    }

    componentWillUnmount() {
        if (window.formPortalCollector) {
            window.formPortalCollector.unsubscribe(BILLING_STEP, 'CheckoutPaymentsContainer');
        }
    }

    getBraintreeData() {
        return { asyncData: this.braintree.requestPaymentNonce() };
    }

    /**
     * Set Ref for stripe
     * @param ref
     */
    setStripeRef(ref) {
        this.stripeRef = ref;
    }

    /**
     * Get Braintree data
     * @returns {{asyncData: *}}
     */
    getBraintreeData() {
        return { asyncData: this.braintree.requestPaymentNonce() };
    }

    /**
     * Get Stripe data
     * @returns {{asyncData: *}}
     */
    getStripeData() {
        return { asyncData: this.stripeRef.submit() };
    }

    collectAdditionalData = () => {
        const { selectedPaymentCode } = this.state;
        const additionalDataGetter = this.dataMap[selectedPaymentCode];
        if (!additionalDataGetter) return {};
        return additionalDataGetter();
    };

    initBraintree() {
        return this.braintree.create();
    }

    /**
     * Request stripe token
     * @param token
     * @returns {Promise<{token: *}>}
     */
    async requestStripeToken(token) {
        return { token };
    }

    selectPaymentMethod(paymentMethod) {
        const { onPaymentMethodSelect } = this.props;
        const { code } = paymentMethod;
        this.setState({ selectedPaymentCode: code });
        onPaymentMethodSelect(code);
    }

    render() {
        return (
            <CheckoutPayments
              { ...this.props }
              { ...this.containerFunctions }
              { ...this.state }
            />
        );
    }
}

export default CheckoutPaymentsContainer;
