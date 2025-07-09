import {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from 'react';
import {useCatalog, usePurse, useUiEvent} from '../../../hooks';
import {CatalogEvent, CatalogInitGiftEvent, CatalogPurchasedEvent} from '../../../events';
import {
  Base,
  Button,
  ButtonGroup,
  Column,
  Flex, LayoutFurniImageView,
  NitroCardContentView,
  NitroCardHeaderView,
  NitroCardView,
  Text
} from '../../../common';
import {
  CatalogPurchaseState,
  CreateLinkEvent,
  DispatchUiEvent,
  GetClubMemberLevel,
  LocalizeText, Offer, ProductTypeEnum,
  SendMessageComposer
} from '../../../api';
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {CatalogInitPurchaseEvent} from '../../../events/catalog/CatalogInitPurchaseEvent';
import {PurchaseFromCatalogComposer} from '@nitrots/nitro-renderer';
import {CatalogGridOfferView} from './page/common/CatalogGridOfferView';


export const CatalogPurchaseConfirmView: FC<{}> = props =>
{
  const [ isVisible, setIsVisible ] = useState<boolean>(false);
  const [ noGiftOption, setNoGiftOption ] = useState<boolean>(false);
  const [ pageId, setPageId ] = useState<number>(0);
  const [ purchaseCallback, setPurchaseCallback ] = useState<() => void>(null);
  const [ teste, setTeste ] = useState<string>(null);
  const [ offerId, setOfferId ] = useState<number>(0);
  const [ extraData, setExtraData ] = useState<string>('');
  const {currentOffer = null, currentPage = null, purchaseOptions = null, setPurchaseOptions = null} = useCatalog();
  const {purse = null, hcDisabled = false} = usePurse();

  const onClose = useCallback(() =>
  {
    setIsVisible(false);
    setNoGiftOption(false);
    setPageId(0);
    setOfferId(0);
    setExtraData('');
    setPurchaseCallback(null);
    setTeste('vazio')
  }, []);

  const purchase = (isGift: boolean = false) =>
  {
    if (!currentOffer) return;

    if (GetClubMemberLevel() < currentOffer.clubLevel)
    {
      CreateLinkEvent('habboUI/open/hccenter');

      return;
    }

    if (isGift)
    {
      DispatchUiEvent(new CatalogInitGiftEvent(currentOffer.page.pageId, currentOffer.offerId, purchaseOptions.extraData));

      return;
    }


    if (purchaseCallback)
    {
      purchaseCallback();

      return;
    }

    let pageId = currentOffer.page.pageId;

    // if(pageId === -1)
    // {
    //     const nodes = getNodesByOfferId(currentOffer.offerId);

    //     if(nodes) pageId = nodes[0].pageId;
    // }

    SendMessageComposer(new PurchaseFromCatalogComposer(pageId, currentOffer.offerId, purchaseOptions.extraData, purchaseOptions.quantity));
  }

  useUiEvent([
    CatalogPurchasedEvent.PURCHASE_SUCCESS,
    CatalogEvent.INIT_PURCHASE, CatalogEvent.INIT_GIFT ], event =>
  {
    switch (event.type)
    {
      case CatalogEvent.INIT_GIFT:
      case CatalogPurchasedEvent.PURCHASE_SUCCESS:
        onClose();
        return;

      case CatalogEvent.INIT_PURCHASE:
        const castedEvent = (event as CatalogInitPurchaseEvent);

        // onClose();

        setPageId(castedEvent.pageId);
        setOfferId(castedEvent.offerId);
        setExtraData(castedEvent.extraData);
        setIsVisible(true);
        setNoGiftOption(castedEvent.noGiftOption);
        setPurchaseCallback(castedEvent.purchaseCallback);
        setTeste('teste');
        return;
    }
  });

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

  if (!isVisible)
    return null;

  if (!currentOffer)
  {
    onClose();
    return null;
  }

  var searchPoint = currentOffer.activityPointType;
  if (currentOffer.activityPointType >= 100)
    searchPoint = searchPoint - 100;

  var getBalanceAfterPurchase = function ()
  {
    if (currentOffer.priceInActivityPoints > 0)
    {

      if (currentOffer.priceInCredits <= 0)
        return purse.activityPoints.get(searchPoint) - currentOffer.priceInActivityPoints + ' ' + LocalizeText('achievements.activitypoint.' + searchPoint);
      else
        return `${ purse.credits - currentOffer.priceInCredits } ${ LocalizeText('credits') } + ${ purse.activityPoints.get(searchPoint) - currentOffer.priceInActivityPoints } ${ LocalizeText('achievements.activitypoint.' + searchPoint) }`;
    }

    return purse.credits - currentOffer.priceInCredits + ' ' + LocalizeText('credits');
  }

  var getCostCurrency = function ()
  {
    if (currentOffer.priceInActivityPoints > 0)
    {
      if (currentOffer.priceInCredits <= 0)
        return `${ currentOffer.priceInActivityPoints } ${ LocalizeText('achievements.activitypoint.' + searchPoint) }`;
      else
        return `${ currentOffer.priceInCredits } ${ LocalizeText('credits') } + ${ currentOffer.priceInActivityPoints } ${ LocalizeText('achievements.activitypoint.' + searchPoint) }`;
    }

    return currentOffer.priceInCredits + ' ' + LocalizeText('credits');
  }


  return (
    <NitroCardView uniqueKey="catalog-gift" className="nitro-catalog-gift" theme="primary-slim">
      <NitroCardHeaderView headerText={ LocalizeText('catalog.purchase_confirmation.title') }
                           onCloseClick={ onClose }/>
      <NitroCardContentView className="text-black catalog-confirmation-view">

        <Flex fullWidth alignItems="center" gap={ 2 }>
          <Column>
            <CatalogGridOfferView itemActive={ true } offer={ currentOffer } selectOffer={ function ()
            {
              return;
            } }/>
          </Column>
          <Column>

            <Text>
              { LocalizeText('catalog.purchase.confirmation.dialog.costs', [ 'offer_name', 'price' ],
                [ currentOffer.localizationName, getCostCurrency() ]) }
            </Text>

            <Text>
              { LocalizeText('catalog.purchase.confirmation.dialog.remaining', [ 'remaining' ],
                [ getBalanceAfterPurchase() ]) }
            </Text>
          </Column>

        </Flex>
        <Flex fullWidth alignItems="center" gap={ 2 }>
          <Button fullWidth onClick={ () => purchase(false) }>
            { LocalizeText('catalog.purchase_confirmation.buy') }
          </Button>
          <Button fullWidth onClick={ () => purchase(true) }
                  disabled={ ((purchaseOptions.quantity > 1) || !currentOffer.giftable || isLimitedSoldOut
                      || (purchaseOptions.extraParamRequired && (!purchaseOptions.extraData || !purchaseOptions.extraData.length)))
                    || !!purchaseCallback || noGiftOption }>
            { LocalizeText('catalog.purchase_confirmation.gift') }
          </Button>
          <Button fullWidth onClick={ () => onClose() }>
            { LocalizeText('catalog.purchase_confirmation.cancel') }
          </Button>
        </Flex>
      </NitroCardContentView>
    </NitroCardView>

  );
}
