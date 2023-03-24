import {FC} from 'react';
import {GetConfiguration, LocalizeText, ProductTypeEnum} from '../../../../../api';
import {Base, Column, Flex, Grid, LayoutImage, Text} from '../../../../../common';
import {useCatalog} from '../../../../../hooks';
import {CatalogHeaderView} from '../../catalog-header/CatalogHeaderView';
import {CatalogAddOnBadgeWidgetView} from '../widgets/CatalogAddOnBadgeWidgetView';
import {CatalogItemGridWidgetView} from '../widgets/CatalogItemGridWidgetView';
import {CatalogLimitedItemWidgetView} from '../widgets/CatalogLimitedItemWidgetView';
import {CatalogPurchaseWidgetView} from '../widgets/CatalogPurchaseWidgetView';
import {CatalogSpinnerWidgetView} from '../widgets/CatalogSpinnerWidgetView';
import {CatalogTotalPriceWidget} from '../widgets/CatalogTotalPriceWidget';
import {CatalogViewProductWidgetView} from '../widgets/CatalogViewProductWidgetView';
import {CatalogLayoutProps} from './CatalogLayout.types';

export const CatalogLayoutDefaultView: FC<CatalogLayoutProps> = props =>
{
    const {page = null} = props;
    const {currentOffer = null, currentPage = null} = useCatalog();

    return (
        <>
            <CatalogHeaderView imageUrl={ currentPage.localization.getImage(0) }/>
            <Text variant={ 'black' } center> { currentPage.localization.getText(0) }</Text>
            <Column gap={ 2 } fullHeight overflow={ 'hidden' } justifyContent={ 'between' }>
                <div className={ 'h-100 overflow-auto catalog-padding-top' }>
                    <Text variant={ 'black' } className={ 'text-volter-bold catalog-select-text' }
                          center> { LocalizeText('catalog_selectproduct') }</Text>

                    <Flex fullWidth className={ 'catalog-flex-content' } justifyContent={ 'center' }
                          overflow={ 'hidden' } gap={ 4 }>
                        <Column size={ 5 } gap={ 1 } overflow="hidden">
                            <CatalogItemGridWidgetView/>
                        </Column>
                        <Column center={ !currentOffer } size={ 6 } overflow="hidden"
                                className={ 'catalog-furni-info' }>
                            { !currentOffer &&
                                <>
                                    { !!page.localization.getImage(1) &&
                                        <LayoutImage imageUrl={ page.localization.getImage(1) }/> }
                                    <Text center dangerouslySetInnerHTML={ {__html: page.localization.getText(0)} }/>
                                </> }
                            { currentOffer &&
                                <>
                                    <Flex center overflow="hidden" style={ {height: '100%'} }>
                                        { (currentOffer.product.productType !== ProductTypeEnum.BADGE) &&
                                            <>
                                                <CatalogViewProductWidgetView/>
                                                <CatalogAddOnBadgeWidgetView
                                                    className="bg-muted rounded bottom-1 end-1"/>
                                            </> }
                                        { (currentOffer.product.productType === ProductTypeEnum.BADGE) &&
                                            <CatalogAddOnBadgeWidgetView className="scale-2"/> }
                                    </Flex>
                                    <Column gap={ 1 } fullHeight>
                                        <CatalogLimitedItemWidgetView fullWidth/>
                                        <Text grow></Text>
                                        <Text truncate
                                              className={ 'text-volter-bold' }>{ currentOffer.localizationName }</Text>
                                        <Text>{ currentOffer.localizationDescription }</Text>
                                        <Base className={ 'catalog-price-info' }>
                                        <Flex justifyContent="between">
                                            <Column gap={ 1 }>
                                                <CatalogSpinnerWidgetView/>
                                            </Column>
                                            <CatalogTotalPriceWidget justifyContent="end" alignItems="end"/>
                                        </Flex>
                                        <CatalogPurchaseWidgetView/>
                                        </Base>
                                    </Column>
                                </> }
                        </Column>
                    </Flex>
                </div>
            </Column>

        </>
    );
}
