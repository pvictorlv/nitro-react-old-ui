import { FC, useEffect, useState } from 'react';
import { Base, Column, Flex, Grid, Text } from '../../../../../common';
import { useCatalog } from '../../../../../hooks';
import { CatalogItemGridWidgetView } from '../widgets/CatalogItemGridWidgetView';
import { CatalogPurchaseWidgetView } from '../widgets/CatalogPurchaseWidgetView';
import { CatalogTotalPriceWidget } from '../widgets/CatalogTotalPriceWidget';
import { CatalogViewProductWidgetView } from '../widgets/CatalogViewProductWidgetView';
import { CatalogLayoutProps } from './CatalogLayout.types';
import { CatalogHeaderView } from '../../catalog-header/CatalogHeaderView';

export const CatalogLayoutTrophiesView: FC<CatalogLayoutProps> = props =>
{
    const { page = null } = props;
    const [ trophyText, setTrophyText ] = useState<string>('');
    const { currentOffer = null, setPurchaseOptions = null } = useCatalog();

    useEffect(() =>
    {
        if (!currentOffer) return;

        setPurchaseOptions(prevValue =>
        {
            const newValue = { ...prevValue };

            newValue.extraData = trophyText;

            return newValue;
        });
    }, [ currentOffer, trophyText, setPurchaseOptions ]);

    return (
        <>
            <CatalogHeaderView imageUrl={ page.localization.getImage(0) }/>
            <Text variant={ 'black' } center> { page.localization.getText(0) }</Text>
            <Grid>

                <Column size={ 7 } overflow="hidden">
                    <CatalogItemGridWidgetView/>
                    <textarea className="flex-grow-1 form-control w-100" defaultValue={ trophyText || '' }
                        onChange={ event => setTrophyText(event.target.value) }/>
                </Column>
                <Column center={ !currentOffer } size={ 5 } overflow="hidden">
                    { !currentOffer &&
                        <>
                            { !!page.localization.getImage(1) && <img alt="" src={ page.localization.getImage(1) }/> }
                            <Text center dangerouslySetInnerHTML={ { __html: page.localization.getText(0) } }/>
                        </> }
                    { currentOffer &&
                        <>
                            <CatalogViewProductWidgetView/>


                            <Column gap={ 1 } fullHeight>
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
