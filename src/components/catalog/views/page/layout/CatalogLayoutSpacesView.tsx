import {NitroPoint} from '@nitrots/nitro-renderer';
import {FC, useEffect} from 'react';
import {Base, Column, Flex, Grid, Text} from '../../../../../common';
import {useCatalog} from '../../../../../hooks';
import {CatalogPurchaseWidgetView} from '../widgets/CatalogPurchaseWidgetView';
import {CatalogSpacesWidgetView} from '../widgets/CatalogSpacesWidgetView';
import {CatalogTotalPriceWidget} from '../widgets/CatalogTotalPriceWidget';
import {CatalogViewProductWidgetView} from '../widgets/CatalogViewProductWidgetView';
import {CatalogLayoutProps} from './CatalogLayout.types';
import {CatalogHeaderView} from '../../catalog-header/CatalogHeaderView';
import {CatalogSpinnerWidgetView} from '../widgets/CatalogSpinnerWidgetView';

export const CatalogLayoutSpacesView: FC<CatalogLayoutProps> = props =>
{
    const {page = null} = props;
    const {currentOffer = null, roomPreviewer = null} = useCatalog();

    useEffect(() =>
    {
        roomPreviewer.updatePreviewObjectBoundingRectangle(new NitroPoint());
    }, [ roomPreviewer ]);

    return (
        <Grid>
            <Column size={ 12 }>
                <CatalogHeaderView imageUrl={ page.localization.getImage(0) }/>
                <Text variant={ 'black' } center> { page.localization.getText(0) }</Text>
            </Column>
            <Column size={ 7 } overflow="hidden">
                <CatalogSpacesWidgetView/>
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
                        <Text grow></Text>
                        <Text truncate className={ 'text-volter-bold' }>{ currentOffer.localizationName }</Text>
                        <Text>{ currentOffer.localizationDescription }</Text>

                        <Column gap={ 1 } className={ 'catalog-price-info' }>
                            <Flex justifyContent="end">
                                <CatalogTotalPriceWidget alignItems="end"/>
                            </Flex>
                            <CatalogPurchaseWidgetView/>
                        </Column>

                    </> }
            </Column>
        </Grid>
    );
}
