import {FC, useMemo} from 'react';
import {Flex, FlexProps} from '../..';

export const NitroCardTabsView: FC<FlexProps> = props =>
{
    const {justifyContent = 'start', gap = 1, classNames = [], children = null, ...rest} = props;

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'container-fluid', 'nitro-card-tabs', 'pt-1' ];

        if (classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ classNames ]);

    return (
        <Flex className={ 'z-100' } gap={ 2 }>
            <Flex justifyContent={ justifyContent } classNames={ getClassNames } { ...rest }>
                { children }
            </Flex>
        </Flex>
    );
}
