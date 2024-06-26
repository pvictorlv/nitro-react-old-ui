import {FC} from 'react';
import {LocalizeText} from '../../../api';
import {Column, Text} from '../../../common';
import {useWired} from '../../../hooks';

export const WiredFurniSelectorView: FC<{}> = props =>
{
    const {trigger = null, furniIds = []} = useWired();

    return (
        <Column gap={ 1 }>
            <Text
                className={ 'text-volter-bold' }>{ LocalizeText('wiredfurni.pickfurnis.caption', [ 'count', 'limit' ], [ furniIds.length.toString(), trigger.maximumItemSelectionCount.toString() ]) }</Text>
            <Text variant={ 'white' }>{ LocalizeText('wiredfurni.pickfurnis.desc') }</Text>
        </Column>
    );
}
