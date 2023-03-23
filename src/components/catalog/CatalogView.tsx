import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect } from 'react';
import { AddEventLinkTracker, GetConfiguration, LocalizeText, RemoveLinkEventTracker } from '../../api';
import {
    AutoGrid,
    Column, DraggableWindow, DraggableWindowPosition,
    Flex,
    Grid,
    NitroCardContentView,
    NitroCardHeaderView,
    NitroCardTabsItemView,
    NitroCardTabsView,
    NitroCardView
} from '../../common';
import { useCatalog } from '../../hooks';
import { CatalogIconView } from './views/catalog-icon/CatalogIconView';
import { CatalogGiftView } from './views/gift/CatalogGiftView';
import { CatalogNavigationView } from './views/navigation/CatalogNavigationView';
import { GetCatalogLayout } from './views/page/layout/GetCatalogLayout';
import { MarketplacePostOfferView } from './views/page/layout/marketplace/MarketplacePostOfferView';
import { CatalogSearchView } from './views/page/common/CatalogSearchView';
import {CatalogPurchaseConfirmView} from './views/CatalogPurchaseConfirmView';

export const CatalogView: FC<{}> = props =>
{
    const {
        isVisible = false,
        setIsVisible = null,
        rootNode = null,
        currentPage = null,
        navigationHidden = false,
        setNavigationHidden = null,
        activeNodes = [],
        searchResult = null,
        setSearchResult = null,
        openPageByName = null,
        openPageByOfferId = null,
        activateNode = null,
        getNodeById
    } = useCatalog();

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if (parts.length < 2) return;

                switch (parts[1])
                {
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                    case 'toggle':
                        setIsVisible(prevValue => !prevValue);
                        return;
                    case 'open':
                        if (parts.length > 2)
                        {
                            if (parts.length === 4)
                            {
                                switch (parts[2])
                                {
                                    case 'offerId':
                                        openPageByOfferId(parseInt(parts[3]));
                                        return;
                                }
                            }
                            else
                            {
                                openPageByName(parts[2]);
                            }
                        }
                        else
                        {
                            setIsVisible(true);
                        }

                        return;
                }
            },
            eventUrlPrefix: 'catalog/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ setIsVisible, openPageByOfferId, openPageByName ]);

    return (
        <>
            { isVisible &&
                <DraggableWindow uniqueKey={ 'catalog' } handleSelector={ '.drag-handler' } windowPosition={ DraggableWindowPosition.TOP_LEFT } disableDrag={ false }>

                    <div className="nitro-catalog">

                        <Flex className={ 'catalog-main-header drag-handler' }></Flex>

                    <Flex className={ 'h-100 grid gap-0' } gap={ 0 }>

                            <div className={ 'catalog-content' }>
                                <Column size={ 12 } overflow={ 'hidden' } gap={ 2 } className={ 'catalog-background' }>
                                    { GetCatalogLayout(currentPage, () => setNavigationHidden(true)) }
                                </Column>
                            </div>
                            <Flex overflow={ 'hidden' }
                                className={ 'overflow-hidden position-relative flex-column nitro-card theme-primary-slim catalog-nav' }>
                                <NitroCardHeaderView headerText={ LocalizeText('catalog') }
                                    onCloseClick={ function ()
                                    {
                                    } }/>
                                <Column fullHeight size={ 12 } overflow="hidden" gap={ 1 }>
                                    <Column
                                        className="nitro-catalog-navigation-grid-container p-0"
                                        overflow="hidden">
                                        <AutoGrid id="nitro-catalog-main-navigation" gap={ 0 } columnCount={ 1 }>
                                            { rootNode && <CatalogNavigationView key={ rootNode.pageId } node={ rootNode }/>}
                                            { rootNode && !searchResult && (rootNode.children.length > 0) && rootNode.children.map(child =>
                                            {
                                                return (
                                                    <CatalogNavigationView key={ child.pageId } node={ child }/>
                                                )
                                            }) }
                                        </AutoGrid>
                                    </Column>
                                    <CatalogSearchView/>
                                </Column>
                            </Flex>

                        </Flex>
                    </div>
                </DraggableWindow> }
            <CatalogGiftView/>
            <CatalogPurchaseConfirmView/>
            <MarketplacePostOfferView/>
        </>
    );
}
