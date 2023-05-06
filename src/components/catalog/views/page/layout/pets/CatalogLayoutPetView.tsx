import {
    ApproveNameMessageComposer,
    ApproveNameMessageEvent,
    ColorConverter,
    GetSellablePetPalettesComposer,
    PurchaseFromCatalogComposer,
    SellablePetPaletteData
} from '@nitrots/nitro-renderer';
import {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {FaFillDrip} from 'react-icons/fa';
import {
    DispatchUiEvent,
    GetPetAvailableColors,
    GetPetIndexFromLocalization,
    LocalizeText, SearchFilterOptions,
    SendMessageComposer
} from '../../../../../../api';
import {
    AutoGrid,
    Base,
    Button,
    Column,
    Flex,
    Grid,
    LayoutGridItem,
    LayoutPetImageView,
    Text
} from '../../../../../../common';
import {CatalogPurchaseFailureEvent} from '../../../../../../events';
import {useCatalog, useMessageEvent} from '../../../../../../hooks';
import {CatalogAddOnBadgeWidgetView} from '../../widgets/CatalogAddOnBadgeWidgetView';
import {CatalogPurchaseWidgetView} from '../../widgets/CatalogPurchaseWidgetView';
import {CatalogTotalPriceWidget} from '../../widgets/CatalogTotalPriceWidget';
import {CatalogViewProductWidgetView} from '../../widgets/CatalogViewProductWidgetView';
import {CatalogLayoutProps} from '../CatalogLayout.types';
import {CatalogHeaderView} from '../../../catalog-header/CatalogHeaderView';
import {LayoutGridColorPickerItem} from '../../../../../../common/layout/LayoutGridColorPickerItem';
import ReactSelect from 'react-select';

export const CatalogLayoutPetView: FC<CatalogLayoutProps> = props =>
{
    const {page = null} = props;
    const [ petIndex, setPetIndex ] = useState(-1);
    const [ sellablePalettes, setSellablePalettes ] = useState<SellablePetPaletteData[]>([]);
    const [ selectedPaletteIndex, setSelectedPaletteIndex ] = useState(-1);
    const [ sellableColors, setSellableColors ] = useState<number[][]>([]);
    const [ selectedColorIndex, setSelectedColorIndex ] = useState(-1);
    const [ colorsShowing, setColorsShowing ] = useState(false);
    const [ petName, setPetName ] = useState('');
    const [ approvalPending, setApprovalPending ] = useState(true);
    const [ approvalResult, setApprovalResult ] = useState(-1);
    const {
        currentOffer = null,
        setCurrentOffer = null,
        setPurchaseOptions = null,
        catalogOptions = null,
        roomPreviewer = null
    } = useCatalog();
    const {petPalettes = null} = catalogOptions;

    const getColor = useMemo(() =>
    {
        if (!sellableColors.length || (selectedColorIndex === -1)) return 0xFFFFFF;

        return sellableColors[selectedColorIndex][0];
    }, [ sellableColors, selectedColorIndex ]);

    const petPurchaseString = useMemo(() =>
    {
        if (!sellablePalettes.length || (selectedPaletteIndex === -1)) return '';

        const paletteId = sellablePalettes[selectedPaletteIndex].paletteId;

        let color = 0xFFFFFF;

        if (petIndex <= 7)
        {
            if (selectedColorIndex === -1) return '';

            color = sellableColors[selectedColorIndex][0];
        }

        let colorString = color.toString(16).toUpperCase();

        while (colorString.length < 6) colorString = ('0' + colorString);

        return `${ paletteId }\n${ colorString }`;
    }, [ sellablePalettes, selectedPaletteIndex, petIndex, sellableColors, selectedColorIndex ]);

    const validationErrorMessage = useMemo(() =>
    {
        let key: string = '';

        switch (approvalResult)
        {
            case 1:
                key = 'catalog.alert.petname.long';
                break;
            case 2:
                key = 'catalog.alert.petname.short';
                break;
            case 3:
                key = 'catalog.alert.petname.chars';
                break;
            case 4:
                key = 'catalog.alert.petname.bobba';
                break;
        }

        if (!key || !key.length) return '';

        return LocalizeText(key);
    }, [ approvalResult ]);

    const purchasePet = useCallback(() =>
    {
        if (approvalResult === -1)
        {
            SendMessageComposer(new ApproveNameMessageComposer(petName, 1));

            return;
        }

        if (approvalResult === 0)
        {
            SendMessageComposer(new PurchaseFromCatalogComposer(page.pageId, currentOffer.offerId, `${ petName }\n${ petPurchaseString }`, 1));

            return;
        }
    }, [ page, currentOffer, petName, petPurchaseString, approvalResult ]);

    useMessageEvent<ApproveNameMessageEvent>(ApproveNameMessageEvent, event =>
    {

    });

    useEffect(() =>
    {
        if (!page || !page.offers.length) return;

        const offer = page.offers[0];

        setCurrentOffer(offer);
        setPetIndex(GetPetIndexFromLocalization(offer.localizationId));
        setColorsShowing(false);
    }, [ page, setCurrentOffer ]);

    useEffect(() =>
    {
        if (!currentOffer) return;

        const productData = currentOffer.product.productData;

        if (!productData) return;

        if (petPalettes)
        {
            for (const paletteData of petPalettes)
            {
                if (paletteData.breed !== productData.type) continue;

                const palettes: SellablePetPaletteData[] = [];

                for (const palette of paletteData.palettes)
                {
                    if (!palette.sellable) continue;

                    palettes.push(palette);
                }

                setSelectedPaletteIndex((palettes.length ? 0 : -1));
                setSellablePalettes(palettes);

                return;
            }
        }

        setSelectedPaletteIndex(-1);
        setSellablePalettes([]);

        SendMessageComposer(new GetSellablePetPalettesComposer(productData.type));
    }, [ currentOffer, petPalettes ]);

    useEffect(() =>
    {
        if (petIndex === -1) return;

        const colors = GetPetAvailableColors(petIndex, sellablePalettes);

        setSelectedColorIndex((colors.length ? 0 : -1));
        setSellableColors(colors);
    }, [ petIndex, sellablePalettes ]);

    useEffect(() =>
    {
        if (!roomPreviewer) return;

        roomPreviewer.reset(false);

        if ((petIndex === -1) || !sellablePalettes.length || (selectedPaletteIndex === -1)) return;

        let petFigureString = `${ petIndex } ${ sellablePalettes[selectedPaletteIndex].paletteId }`;

        if (petIndex <= 7) petFigureString += ` ${ getColor.toString(16) }`;

        roomPreviewer.addPetIntoRoom(petFigureString);
    }, [ roomPreviewer, petIndex, sellablePalettes, selectedPaletteIndex, getColor ]);

    useEffect(() =>
    {
        setApprovalResult(-1);
    }, [ petName ]);

    if (!currentOffer) return null;


    const getOptions = function (): any[]
    {
        return sellablePalettes.map((palette, index) =>
        {
            var petName = '';
            if (!((petIndex < 0) || !sellablePalettes.length || (index < 0)))
            {
                petName = LocalizeText(`pet.breed.${ petIndex }.${ sellablePalettes[index].breedId }`);
            }


            return {
                value: palette.paletteId,
                label: petName
            };
        });
    };

    const style = {
        control: base => ({
            ...base,
            // This line disable the blue border
            boxShadow: 'none'
        })
    };

    return (
        <>
            <Column size={ 12 }>
                <CatalogHeaderView imageUrl={ page.localization.getImage(0) }/>
                <Text variant={ 'black' } center> { page.localization.getText(0) }</Text>
            </Column>
            <Grid className={ 'catalog-alternative-flex' }>
                <Column size={ 7 } overflow="hidden">
                    <AutoGrid className={ 'catalog-grid' } columnCount={ 5 } columnMinWidth={ colorsShowing ? 11 : 40 }>

                        { (sellableColors.length > 0) && sellableColors.map((colorSet, index) =>
                            <LayoutGridColorPickerItem itemHighlight key={ index }
                                                       itemActive={ (selectedColorIndex === index) }
                                                       itemColor={ ColorConverter.int2rgb(colorSet[0]) }
                                                       className="clear-bg"
                                                       onClick={ event => setSelectedColorIndex(index) }/>) }
                    </AutoGrid>
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

                                { selectedPaletteIndex >= 0 &&
                                    <LayoutPetImageView scale={ 2 } typeId={ petIndex } petColor={ getColor }
                                                        paletteId={ sellablePalettes[selectedPaletteIndex].paletteId }
                                                        direction={ 2 }
                                                        headOnly={ false }/> }

                                <CatalogAddOnBadgeWidgetView position="absolute"
                                                             className="bg-muted rounded bottom-1 end-1"/>
                                { ((petIndex > -1) && (petIndex <= 7)) &&
                                    <Button position="absolute" className="bottom-1 start-1"
                                            onClick={ event => setColorsShowing(!colorsShowing) }>
                                        <FaFillDrip className="fa-icon"/>
                                    </Button> }
                            </Base>
                            <Column grow gap={ 1 }>

                                <ReactSelect styles={ style } classNamePrefix="react-select"
                                             options={ getOptions() }

                                             className="input-dropdown"
                                             classNames={ {
                                                 option: () =>
                                                     'react-select-option',
                                             } }
                                             onChange={ event => setSelectedPaletteIndex(event.value) }/>
                                <Column grow gap={ 1 }>
                                    <input type="text" className="form-control form-control-sm w-100"
                                           placeholder={ LocalizeText('widgets.petpackage.name.title') }
                                           value={ petName }
                                           onChange={ event => setPetName(event.target.value) }/>
                                    { (approvalResult > 0) &&
                                        <Base
                                            className="invalid-feedback d-block m-0">{ validationErrorMessage }</Base> }
                                </Column>
                                <Base className={ 'catalog-price-info' }>

                                    <Flex justifyContent="end">
                                        <CatalogTotalPriceWidget justifyContent="end" alignItems="end"/>
                                    </Flex>
                                    <CatalogPurchaseWidgetView showGift={ true } noGiftOption={ true }
                                                               purchaseCallback={ purchasePet }/>

                                </Base>
                            </Column>
                        </> }
                </Column>
            </Grid>
        </>
    )
        ;
}
