import {
    BadgePointLimitsEvent,
    ILinkEventTracker,
    IRoomSession,
    RoomEngineObjectEvent,
    RoomEngineObjectPlacedEvent,
    RoomPreviewer,
    RoomSessionEvent
} from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import {
    AddEventLinkTracker,
    GetLocalization,
    GetRoomEngine,
    isObjectMoverRequested,
    LocalizeText,
    RemoveLinkEventTracker,
    setObjectMoverRequested,
    UnseenItemCategory
} from '../../api';
import {
    Button, ButtonGroup,
    NitroCardContentView,
    NitroCardHeaderView,
    NitroCardTabsItemView,
    NitroCardTabsView,
    NitroCardView
} from '../../common';
import {
    useInventoryTrade,
    useInventoryUnseenTracker,
    useMessageEvent,
    useRoomEngineEvent,
    useRoomSessionManagerEvent
} from '../../hooks';
import { InventoryBadgeView } from './views/badge/InventoryBadgeView';
import { InventoryBotView } from './views/bot/InventoryBotView';
import { InventoryFurnitureView } from './views/furniture/InventoryFurnitureView';
import { InventoryTradeView } from './views/furniture/InventoryTradeView';
import { InventoryPetView } from './views/pet/InventoryPetView';
import { InventoryAchievementView } from './views/achievement/InventoryAchievementView';

const TAB_FURNITURE: string = 'inventory.furni';
const TAB_BOTS: string = 'inventory.bots';
const TAB_PETS: string = 'inventory.furni.tab.pets';
const TAB_BADGES: string = 'inventory.badges';
const TAB_ACHIEVEMENTS: string = 'inventory.achievements';
const TABS = [ TAB_FURNITURE, TAB_BADGES, TAB_ACHIEVEMENTS ];
const UNSEEN_CATEGORIES = [ UnseenItemCategory.FURNI, UnseenItemCategory.BADGE, UnseenItemCategory.ACHIEVEMENTS ];

export const InventoryView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ currentTab, setCurrentTab ] = useState<string>(TABS[0]);
    const [ roomSession, setRoomSession ] = useState<IRoomSession>(null);
    const [ roomPreviewer, setRoomPreviewer ] = useState<RoomPreviewer>(null);
    const { isTrading = false, stopTrading = null } = useInventoryTrade();
    const { getCount = null, resetCategory = null } = useInventoryUnseenTracker();

    const onClose = () =>
    {
        if (isTrading) stopTrading();

        setIsVisible(false);
    }

    useRoomEngineEvent<RoomEngineObjectPlacedEvent>(RoomEngineObjectEvent.PLACED, event =>
    {
        if (!isObjectMoverRequested()) return;

        setObjectMoverRequested(false);

        if (!event.placedInRoom) setIsVisible(true);
    });

    useRoomSessionManagerEvent<RoomSessionEvent>([
        RoomSessionEvent.CREATED,
        RoomSessionEvent.ENDED
    ], event =>
    {
        switch (event.type)
        {
            case RoomSessionEvent.CREATED:
                setRoomSession(event.session);
                return;
            case RoomSessionEvent.ENDED:
                setRoomSession(null);
                setIsVisible(false);
                return;
        }
    });

    useMessageEvent<BadgePointLimitsEvent>(BadgePointLimitsEvent, event =>
    {
        const parser = event.getParser();

        for (const data of parser.data) GetLocalization().setBadgePointLimit(data.badgeId, data.limit);
    });

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if (parts.length < 2) return;

                switch (parts[1])
                {
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                    case 'toggle':
                        setIsVisible(prevValue => !prevValue);
                        return;
                }
            },
            eventUrlPrefix: 'inventory/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    useEffect(() =>
    {
        setRoomPreviewer(new RoomPreviewer(GetRoomEngine(), ++RoomPreviewer.PREVIEW_COUNTER));

        return () =>
        {
            setRoomPreviewer(prevValue =>
            {
                prevValue.dispose();

                return null;
            });
        }
    }, []);

    useEffect(() =>
    {
        if (!isVisible && isTrading) setIsVisible(true);
    }, [ isVisible, isTrading ]);

    if (!isVisible) return null;

    return (
        <NitroCardView uniqueKey={ 'inventory' } className="nitro-inventory" theme={ isTrading ? 'primary-slim' : '' }>
            <NitroCardHeaderView headerText={ LocalizeText('inventory.title') } onCloseClick={ onClose }/>
            { !isTrading &&
                <>
                    <NitroCardTabsView>
                        { TABS.map((name, index) =>
                        {
                            return (
                                <NitroCardTabsItemView key={ index } isActive={ (currentTab === name) }
                                    onClick={ event => setCurrentTab(name) }
                                    count={ getCount(UNSEEN_CATEGORIES[index]) }>
                                    { LocalizeText(name) }
                                </NitroCardTabsItemView>
                            );
                        }) }
                    </NitroCardTabsView>
                    <NitroCardContentView>
                        { (currentTab === TAB_FURNITURE || currentTab === TAB_BOTS || currentTab === TAB_PETS) &&
                            <ButtonGroup fullWidth>
                                <Button active={ currentTab === TAB_FURNITURE } onClick={ event => setCurrentTab('inventory.furni') }>
                                    { LocalizeText('inventory.furni') }
                                </Button>
                                <Button active={ currentTab === TAB_BOTS } onClick={ event => setCurrentTab('inventory.bots') }>
                                    { LocalizeText('inventory.bots') }
                                </Button>
                                <Button active={ currentTab === TAB_PETS } onClick={ event => setCurrentTab('inventory.furni.tab.pets') }>
                                    { LocalizeText('inventory.furni.tab.pets') }
                                </Button>
                            </ButtonGroup>
                        }
                        { (currentTab === TAB_FURNITURE) &&
                            <InventoryFurnitureView roomSession={ roomSession } roomPreviewer={ roomPreviewer }/> }
                        { (currentTab === TAB_BOTS) &&
                            <InventoryBotView roomSession={ roomSession } roomPreviewer={ roomPreviewer }/> }
                        { (currentTab === TAB_PETS) &&
                            <InventoryPetView roomSession={ roomSession } roomPreviewer={ roomPreviewer }/> }
                        { (currentTab === TAB_BADGES) &&
                            <InventoryBadgeView/> }
                        { (currentTab === TAB_ACHIEVEMENTS) &&
                            <InventoryAchievementView/> }
                    </NitroCardContentView>
                </> }
            { isTrading &&
                <NitroCardContentView>
                    <InventoryTradeView cancelTrade={ onClose }/>
                </NitroCardContentView> }
        </NitroCardView>
    );
}
