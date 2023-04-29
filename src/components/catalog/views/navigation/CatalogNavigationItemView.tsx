import {FC} from 'react';
import {FaCaretDown, FaCaretUp} from 'react-icons/fa';
import {ICatalogNode} from '../../../../api';
import {Base, LayoutGridItem, Text} from '../../../../common';
import {useCatalog} from '../../../../hooks';
import {CatalogIconView} from '../catalog-icon/CatalogIconView';
import {CatalogNavigationSetView} from './CatalogNavigationSetView';

export interface CatalogNavigationItemViewProps
{
    node: ICatalogNode;
    child?: boolean;
}

export const CatalogNavigationItemView: FC<CatalogNavigationItemViewProps> = props =>
{
    const {node = null, child = false} = props;
    const {activateNode = null} = useCatalog();

    return (
        <Base className="nitro-catalog-navigation-section">
            <LayoutGridItem noBorder={ true } gap={ 1 } column={ false } itemActive={ node.isActive }
                            onClick={ event => activateNode(node) }
                            className={ child ? 'catalog-nav-item inset' : 'catalog-nav-item ' }>
                <div className={ child ? '' : 'catalog-icon-holder' }>
                    <CatalogIconView icon={ node.iconId }/>
                </div>
                <Text grow truncate>{ node.localization }</Text>
                { node.isBranch &&
                    <>
                        { node.isOpen && <FaCaretUp className="fa-icon text-black"/> }
                        { !node.isOpen && <FaCaretDown className="fa-icon text-black"/> }
                    </> }
            </LayoutGridItem>
            { node.isOpen && node.isBranch &&
                <CatalogNavigationSetView node={ node } child={ true }/> }
        </Base>
    );
}
