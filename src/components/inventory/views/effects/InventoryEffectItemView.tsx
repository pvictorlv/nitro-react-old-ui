import { FC, PropsWithChildren } from 'react';
import { UnseenItemCategory } from '../../../../api';
import {  LayoutGridItem } from '../../../../common';
import { useInventoryEffects, useInventoryUnseenTracker } from '../../../../hooks';

export const InventoryEffectItemView: FC<PropsWithChildren<{ effectCode: number }>> = props =>
{
    const { effectCode = 0, children = null, ...rest } = props;
    const { selectedEffectCode = null, setSelectedEffectCode = null, toggleEffect = null } = useInventoryEffects();

    return (
        <LayoutGridItem
          itemImage={ null }
          itemActive={ (selectedEffectCode === effectCode) } itemUnseen={ true }
          onMouseDown={ event => setSelectedEffectCode(effectCode) } onDoubleClick={ event => toggleEffect(selectedEffectCode) } { ...rest }>
            { children }
        </LayoutGridItem>
    );
}
