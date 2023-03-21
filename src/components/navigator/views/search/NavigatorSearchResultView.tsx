import { NavigatorSearchComposer, NavigatorSearchResultList } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaBars, FaMinus, FaPlus, FaTh, FaWindowMaximize, FaWindowRestore } from 'react-icons/fa';
import { LocalizeText, NavigatorSearchResultViewDisplayMode, SendMessageComposer } from '../../../../api';
import { AutoGrid, AutoGridProps, Column, Flex, Grid, Text } from '../../../../common';
import { useNavigator } from '../../../../hooks';
import { NavigatorSearchResultItemView } from './NavigatorSearchResultItemView';

export interface NavigatorSearchResultViewProps extends AutoGridProps
{
    searchResult: NavigatorSearchResultList;
}

export const NavigatorSearchResultView: FC<NavigatorSearchResultViewProps> = props =>
{
    const { searchResult = null, ...rest } = props;
    const [ isExtended, setIsExtended ] = useState(true);
    const [ displayMode, setDisplayMode ] = useState<number>(0);

    const { topLevelContext = null } = useNavigator();

    const getResultTitle = () =>
    {
        let name = searchResult.code;

        if (!name || !name.length || LocalizeText('navigator.searchcode.title.' + name) == ('navigator.searchcode.title.' + name)) return searchResult.data;

        if (name.startsWith('${')) return name.slice(2, (name.length - 1));

        return ('navigator.searchcode.title.' + name);
    }

    const toggleDisplayMode = () =>
    {
        setDisplayMode(prevValue =>
        {
            if (prevValue === NavigatorSearchResultViewDisplayMode.LIST) return NavigatorSearchResultViewDisplayMode.THUMBNAILS;

            return NavigatorSearchResultViewDisplayMode.LIST;
        });
    }

    const showMore = () =>
    {
        if (searchResult.action == 1) SendMessageComposer(new NavigatorSearchComposer(searchResult.code, ''));
        else if (searchResult.action == 2 && topLevelContext) SendMessageComposer(new NavigatorSearchComposer(topLevelContext.code, ''));
    }

    useEffect(() =>
    {
        if (!searchResult) return;

        setIsExtended(!searchResult.closed);

        setDisplayMode(searchResult.mode);
    }, [ searchResult ]);

    const gridHasTwoColumns = (displayMode >= NavigatorSearchResultViewDisplayMode.THUMBNAILS);

    return (
        <Column className="bg-white" gap={ 0 }>
            <Flex fullWidth alignItems="center" justifyContent="between" className="px-2 py-1 navigator-result-header">
                <Flex grow pointer alignItems="center" gap={ 1 }
                    onClick={ event => setIsExtended(prevValue => !prevValue) }>
                    <Text variant={ 'white' } className={ 'text-volter-bold' }>{ LocalizeText(getResultTitle()) }</Text>

                </Flex>
                <Flex gap={ 2 }>

                    { isExtended && <FaChevronUp className="white fa-icon"/> }
                    { !isExtended && <FaChevronDown className="white fa-icon"/> }
                </Flex>

            </Flex> { isExtended &&
            <>
                {
                    gridHasTwoColumns ?
                        <AutoGrid columnCount={ 3 } { ...rest } columnMinWidth={ 80 } columnMinHeight={ 110 }
                            className="mx-2">
                            { searchResult.rooms.length > 0 && searchResult.rooms.map((room, index) =>
                                <NavigatorSearchResultItemView key={ index } roomData={ room } thumbnail={ true }/>) }
                        </AutoGrid> : <Grid columnCount={ 1 } className="navigator-grid" gap={ 0 }>
                            { searchResult.rooms.length > 0 && searchResult.rooms.map((room, index) =>
                                <NavigatorSearchResultItemView key={ index } roomData={ room }/>) }
                        </Grid>
                }
            </>
            }
        </Column>
    );
}
