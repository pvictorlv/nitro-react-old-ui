import {FC, KeyboardEvent, useEffect, useState} from 'react';
import {FaSearch} from 'react-icons/fa';
import {INavigatorSearchFilter, LocalizeText, SearchFilterOptions} from '../../../../api';
import {Button, Flex} from '../../../../common';
import {useNavigator} from '../../../../hooks';
import Select from 'react-select/base';
import ReactSelect from 'react-select';

export interface NavigatorSearchViewProps
{
    sendSearch: (searchValue: string, contextCode: string) => void;
}

export const NavigatorSearchView: FC<NavigatorSearchViewProps> = props =>
{
    const {sendSearch = null} = props;
    const [ searchFilterIndex, setSearchFilterIndex ] = useState(0);
    const [ searchValue, setSearchValue ] = useState('');
    const {topLevelContext = null, searchResult = null} = useNavigator();

    const processSearch = () =>
    {
        if (!topLevelContext) return;

        let searchFilter = SearchFilterOptions[searchFilterIndex];

        if (!searchFilter) searchFilter = SearchFilterOptions[0];

        const searchQuery = ((searchFilter.query ? (searchFilter.query + ':') : '') + searchValue);

        sendSearch((searchQuery || ''), topLevelContext.code);
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    {
        if (event.key !== 'Enter') return;

        processSearch();
    };

    useEffect(() =>
    {
        if (!searchResult) return;

        const split = searchResult.data.split(':');

        let filter: INavigatorSearchFilter = null;
        let value: string = '';

        if (split.length >= 2)
        {
            const [ query, ...rest ] = split;

            filter = SearchFilterOptions.find(option => (option.query === query));
            value = rest.join(':');
        }
        else
        {
            value = searchResult.data;
        }

        if (!filter) filter = SearchFilterOptions[0];

        setSearchFilterIndex(SearchFilterOptions.findIndex(option => (option === filter)));
        setSearchValue(value);
    }, [ searchResult ]);


    const vehicles = [
        {
            id: 1,
            make: 'Ford',
            model: 'Fiesta',
            year: 2003,
        },
        // I hope that you did let the two dots on purpose
        // .
        // .
        {
            id: 7,
            make: 'Audi',
            model: 'A4',
            year: 2009,
        },
    ];

    const getOptions = function (): any[]
    {
        return SearchFilterOptions.map((filter, index) =>
        {
            return {value: index.toString(), label: LocalizeText('navigator.filter.' + filter.name)};
        });
    };
    const style = {
        control: base => ({
            ...base,
            // This line disable the blue border
            boxShadow: 'none'
        }),
    };

    return (
        <Flex fullWidth gap={ 1 } className={ 'nitro-border' }>
            <Flex shrink>
                <ReactSelect styles={ style } classNamePrefix="react-select" options={ getOptions() }

                             className="input-dropdown" value={ searchFilterIndex }
                             classNames={ {
                                 option: () =>
                                     'react-select-option',
                             } }
                             onChange={ event => setSearchFilterIndex(event) }/>
            </Flex>
            <Flex fullWidth gap={ 1 }>
                <input type="text" className="white-input-border"
                       placeholder={ LocalizeText('navigator.filter.input.placeholder') } value={ searchValue }
                       onChange={ event => setSearchValue(event.target.value) }
                       onKeyDown={ event => handleKeyDown(event) }/>
                <Button variant="primary" onClick={ processSearch }>
                    <div className="catalog-searchicon"></div>
                </Button>
            </Flex>
        </Flex>
    );
}
