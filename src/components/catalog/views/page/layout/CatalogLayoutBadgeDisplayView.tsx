import {FC} from 'react';
import {LocalizeText} from '../../../../../api';
import {Base, Column, Flex, Grid, Text} from '../../../../../common';
import {useCatalog} from '../../../../../hooks';
import {CatalogBadgeSelectorWidgetView} from '../widgets/CatalogBadgeSelectorWidgetView';
import {CatalogFirstProductSelectorWidgetView} from '../widgets/CatalogFirstProductSelectorWidgetView';
import {CatalogItemGridWidgetView} from '../widgets/CatalogItemGridWidgetView';
import {CatalogLimitedItemWidgetView} from '../widgets/CatalogLimitedItemWidgetView';
import {CatalogPurchaseWidgetView} from '../widgets/CatalogPurchaseWidgetView';
import {CatalogTotalPriceWidget} from '../widgets/CatalogTotalPriceWidget';
import {CatalogViewProductWidgetView} from '../widgets/CatalogViewProductWidgetView';
import {CatalogLayoutProps} from './CatalogLayout.types';
import {CatalogHeaderView} from '../../catalog-header/CatalogHeaderView';

export const CatalogLayoutBadgeDisplayView: FC<CatalogLayoutProps> = props =>
{
    const {page = null} = props;
    const {currentOffer = null} = useCatalog();

    return (
        <>
            <Column size={ 12 }>
                <CatalogHeaderView imageUrl={ page.localization.getImage(0) }/>
                <Text variant={ 'black' } center> { page.localization.getText(0) }</Text>
            </Column>
            <CatalogFirstProductSelectorWidgetView/>
            <Grid className={ 'catalog-main-content' }>
                <Column size={ 7 } overflow="hidden">
                    <CatalogItemGridWidgetView shrink/>
                    <Column className={ 'p-2' } gap={ 1 } overflow="hidden">
                        <Text truncate shrink fontWeight="bold">{ LocalizeText('catalog_selectbadge') }</Text>
                        <CatalogBadgeSelectorWidgetView/>
                    </Column>
                </Column>
                <Column center={ !currentOffer } size={ 5 } overflow="hidden">
                    { !currentOffer &&
                        <>
                            { !!page.localization.getImage(1) && <img alt="" src={ page.localization.getImage(1) }/> }
                            <Text center dangerouslySetInnerHTML={ {__html: page.localization.getText(0)} }/>
                        </> }
                    { currentOffer &&
                        <>
                            <Base position="relative" overflow="hidden">
                                <CatalogViewProductWidgetView/>
                            </Base>
                            <Column grow gap={ 1 }>
                                <CatalogLimitedItemWidgetView fullWidth/>
                                <Text truncate
                                      className={ 'text-volter-bold' }>{ currentOffer.localizationName }</Text>
                                <Text grow>{ currentOffer.localizationDescription }</Text>
                                <Base className={ 'catalog-price-info' }>

                                    <Flex justifyContent="end">
                                        <CatalogTotalPriceWidget alignItems="end"/>
                                    </Flex>
                                    <CatalogPurchaseWidgetView/>
                                </Base>
                            </Column>
                        </> }
                </Column>
            </Grid>
        </>
    );
}
