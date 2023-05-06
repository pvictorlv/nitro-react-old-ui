import {PurchaseFromCatalogComposer} from '@nitrots/nitro-renderer';
import {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {
    CatalogPurchaseState,
    CreateLinkEvent,
    DispatchUiEvent,
    GetClubMemberLevel,
    LocalizeText,
    LocalStorageKeys, NotificationAlertType,
    Offer,
    SendMessageComposer
} from '../../../../../api';
import {Button, LayoutLoadingSpinnerView} from '../../../../../common';
import {
    CatalogEvent,
    CatalogInitGiftEvent,
    CatalogPurchasedEvent,
    CatalogPurchaseFailureEvent,
    CatalogPurchaseNotAllowedEvent,
    CatalogPurchaseSoldOutEvent
} from '../../../../../events';
import {useCatalog, useLocalStorage, useNotification, usePurse, useUiEvent} from '../../../../../hooks';
import {CatalogInitPurchaseEvent} from '../../../../../events/catalog/CatalogInitPurchaseEvent';

interface CatalogPurchaseWidgetViewProps
{
    noGiftOption?: boolean;
    showGift?: boolean;
    purchaseCallback?: () => void;
}

export const CatalogPurchaseWidgetView: FC<CatalogPurchaseWidgetViewProps> = props =>
{
    const {showGift = false, noGiftOption = false, purchaseCallback = null} = props;
    const [ purchaseWillBeGift, setPurchaseWillBeGift ] = useState(false);
    const [ purchaseState, setPurchaseState ] = useState(CatalogPurchaseState.NONE);
    const [ catalogSkipPurchaseConfirmation, setCatalogSkipPurchaseConfirmation ] = useLocalStorage(LocalStorageKeys.CATALOG_SKIP_PURCHASE_CONFIRMATION, false);
    const {currentOffer = null, currentPage = null, purchaseOptions = null, setPurchaseOptions = null} = useCatalog();
    const {getCurrencyAmount = null} = usePurse();
    const { simpleAlert = null } = useNotification();

    const onCatalogEvent = useCallback((event: CatalogEvent) =>
    {
        switch (event.type)
        {
            case CatalogPurchasedEvent.PURCHASE_SUCCESS:
                setPurchaseState(CatalogPurchaseState.NONE);
                return;
            case CatalogPurchaseFailureEvent.PURCHASE_FAILED:
                setPurchaseState(CatalogPurchaseState.FAILED);
                return;
            case CatalogPurchaseNotAllowedEvent.NOT_ALLOWED:
                setPurchaseState(CatalogPurchaseState.FAILED);
                return;
            case CatalogPurchaseSoldOutEvent.SOLD_OUT:
                setPurchaseState(CatalogPurchaseState.SOLD_OUT);
                return;
        }
    }, []);

    useUiEvent(CatalogPurchasedEvent.PURCHASE_SUCCESS, onCatalogEvent);
    useUiEvent(CatalogPurchaseFailureEvent.PURCHASE_FAILED, onCatalogEvent);
    useUiEvent(CatalogPurchaseNotAllowedEvent.NOT_ALLOWED, onCatalogEvent);
    useUiEvent(CatalogPurchaseSoldOutEvent.SOLD_OUT, onCatalogEvent);

    const isLimitedSoldOut = useMemo(() =>
    {
        if (!currentOffer) return false;

        if (purchaseOptions.extraParamRequired && (!purchaseOptions.extraData || !purchaseOptions.extraData.length)) return false;

        if (currentOffer.pricingModel === Offer.PRICING_MODEL_SINGLE)
        {
            const product = currentOffer.product;

            if (product && product.isUniqueLimitedItem) return !product.uniqueLimitedItemsLeft;
        }

        return false;
    }, [ currentOffer, purchaseOptions ]);

    const purchase = (isGift: boolean = false) =>
    {
        if (!currentOffer) return;

        if (GetClubMemberLevel() < currentOffer.clubLevel)
        {
            CreateLinkEvent('habboUI/open/hccenter');

            return;
        }

        const priceCredits = (currentOffer.priceInCredits * purchaseOptions.quantity);
        const pricePoints = (currentOffer.priceInActivityPoints * purchaseOptions.quantity);

        if(isLimitedSoldOut)
        {
            simpleAlert(LocalizeText('catalog.alert.limited_edition_sold_out.title'));

            return;
        }

        if(priceCredits > getCurrencyAmount(-1))
        {
            simpleAlert(LocalizeText('catalog.alert.notenough.credits.description'), NotificationAlertType.DEFAULT, null, null, LocalizeText('catalog.alert.notenough.title'));

            return;
        }

        if(pricePoints > getCurrencyAmount(currentOffer.activityPointType))
        {
            simpleAlert(LocalizeText('catalog.alert.notenough.credits.description'), NotificationAlertType.DEFAULT, null, null, LocalizeText('catalog.alert.notenough.title'));

            return;
        }


        if (isGift)
        {
            DispatchUiEvent(new CatalogInitGiftEvent(currentOffer.page.pageId, currentOffer.offerId, purchaseOptions.extraData));

            return;
        }

        DispatchUiEvent(new CatalogInitPurchaseEvent(currentOffer.page.pageId, currentOffer.offerId, purchaseOptions.extraData, noGiftOption, purchaseCallback));

    }

    useEffect(() =>
    {
        if (!currentOffer) return;

        setPurchaseState(CatalogPurchaseState.NONE);
    }, [ currentOffer, setPurchaseOptions ]);

    useEffect(() =>
    {
        let timeout: ReturnType<typeof setTimeout> = null;

        if ((purchaseState === CatalogPurchaseState.CONFIRM) || (purchaseState === CatalogPurchaseState.FAILED))
        {
            timeout = setTimeout(() => setPurchaseState(CatalogPurchaseState.NONE), 3000);
        }

        return () =>
        {
            if (timeout) clearTimeout(timeout);
        }
    }, [ purchaseState ]);

    if (!currentOffer) return null;

    const PurchaseButton = () =>
    {
        const priceCredits = (currentOffer.priceInCredits * purchaseOptions.quantity);
        const pricePoints = (currentOffer.priceInActivityPoints * purchaseOptions.quantity);

        if (GetClubMemberLevel() < currentOffer.clubLevel) return <Button 
                                                                          disabled>{ LocalizeText('catalog.alert.hc.required') }</Button>;

        if (isLimitedSoldOut) return <Button 
                                             disabled>{ LocalizeText('catalog.alert.limited_edition_sold_out.title') }</Button>;

        if (priceCredits > getCurrencyAmount(-1)) return <Button 
                                                                 disabled>{ LocalizeText('catalog.alert.notenough.title') }</Button>;

        if (pricePoints > getCurrencyAmount(currentOffer.activityPointType)) return <Button 
                                                                                            disabled>{ LocalizeText('catalog.alert.notenough.activitypoints.title.' + currentOffer.activityPointType) }</Button>;

        switch (purchaseState)
        {
            case CatalogPurchaseState.CONFIRM:
                return <Button variant="warning"
                               onClick={ event => purchase() }>{ LocalizeText('catalog.marketplace.confirm_title') }</Button>;
            case CatalogPurchaseState.PURCHASE:
                return (<Button
                    disabled={ (purchaseOptions.extraParamRequired && (!purchaseOptions.extraData || !purchaseOptions.extraData.length)) }
                    onClick={ event => setPurchaseState(CatalogPurchaseState.CONFIRM) }>{ LocalizeText('catalog.purchase_confirmation.' + (currentOffer.isRentOffer ? 'rent' : 'buy')) }</Button>);
            case CatalogPurchaseState.FAILED:
                return <Button >{ LocalizeText('generic.failed') }</Button>;
            case CatalogPurchaseState.SOLD_OUT:
                return <Button
                    >{ LocalizeText('generic.failed') + ' - ' + LocalizeText('catalog.alert.limited_edition_sold_out.title') }</Button>;
            case CatalogPurchaseState.NONE:
            default:
                return <Button
                    disabled={ (purchaseOptions.extraParamRequired && (!purchaseOptions.extraData || !purchaseOptions.extraData.length)) }
                    onClick={ event => setPurchaseState(CatalogPurchaseState.CONFIRM) }>{ LocalizeText('catalog.purchase_confirmation.' + (currentOffer.isRentOffer ? 'rent' : 'buy')) }</Button>;
        }
    }

    return (
        <>
            <Button
                disabled={ ((purchaseOptions.extraParamRequired && (!purchaseOptions.extraData || !purchaseOptions.extraData.length)) || isLimitedSoldOut) }
                onClick={ event => purchase(false) }>{ LocalizeText('catalog.purchase_confirmation.' + (currentOffer.isRentOffer ? 'rent' : 'buy')) }</Button>
            { (showGift && !currentOffer.isRentOffer) &&
                <Button disabled={ ((purchaseOptions.quantity > 1) || !currentOffer.giftable || isLimitedSoldOut || (purchaseOptions.extraParamRequired && (!purchaseOptions.extraData || !purchaseOptions.extraData.length))) } onClick={ event => purchase(true) }>
                    { LocalizeText('catalog.purchase_confirmation.gift') }
                </Button> }
        </>
    );
}
