import {
    Dispose,
    DropBounce,
    EaseOut,
    JumpBy,
    Motions,
    NitroToolbarAnimateIconEvent,
    PerkAllowancesMessageEvent,
    PerkEnum,
    Queue, RoomEntryInfoMessageEvent,
    Wait
} from '@nitrots/nitro-renderer';
import { FC, useState } from 'react';
import {
    CreateLinkEvent,
    GetConfiguration, GetRoomEngine,
    GetSessionDataManager, LocalizeText,
    MessengerIconState,
    OpenMessengerChat,
    VisitDesktop
} from '../../api';
import {
    Base,
    Flex,
    Text,
    LayoutAvatarImageView,
    LayoutItemCountView,
    TransitionAnimation,
    TransitionAnimationTypes, classNames
} from '../../common';
import {
    useAchievements,
    useFriends,
    useInventoryUnseenTracker,
    useMessageEvent,
    useMessenger, useRoom,
    useRoomEngineEvent,
    useSessionInfo
} from '../../hooks';
import { ToolbarMeView } from './ToolbarMeView';
import { ToolbarIcon } from './ToolbarIcon';

export const ToolbarView: FC<{ isInRoom: boolean }> = props =>
{
    const { isInRoom } = props;
    const [ isMeExpanded, setMeExpanded ] = useState(false);
    const [ useGuideTool, setUseGuideTool ] = useState(false);
    const [ hoverFrame, setHoverFrame ] = useState(0);
    const { userFigure = null } = useSessionInfo();
    const { getFullCount = 0 } = useInventoryUnseenTracker();
    const { getTotalUnseen = 0 } = useAchievements();
    const { requests = [] } = useFriends();
    const { iconState = MessengerIconState.HIDDEN } = useMessenger();
    const isMod = GetSessionDataManager().isModerator;
    const [ isZoomedIn, setIsZoomedIn ] = useState<boolean>(false);


    useMessageEvent<PerkAllowancesMessageEvent>(PerkAllowancesMessageEvent, event =>
    {
        const parser = event.getParser();

        setUseGuideTool(parser.isAllowed(PerkEnum.USE_GUIDE_TOOL));
    });

    useMessageEvent<RoomEntryInfoMessageEvent>(RoomEntryInfoMessageEvent, event =>
    {
        setIsZoomedIn(false);
    });

    useRoomEngineEvent<NitroToolbarAnimateIconEvent>(NitroToolbarAnimateIconEvent.ANIMATE_ICON, event =>
    {
        const animationIconToToolbar = (iconName: string, image: HTMLImageElement, x: number, y: number) =>
        {
            const target = (document.body.getElementsByClassName(iconName)[0] as HTMLElement);

            if (!target) return;

            image.className = 'toolbar-icon-animation';
            image.style.visibility = 'visible';
            image.style.left = (x + 'px');
            image.style.top = (y + 'px');

            document.body.append(image);

            const targetBounds = target.getBoundingClientRect();
            const imageBounds = image.getBoundingClientRect();

            const left = (imageBounds.x - targetBounds.x);
            const top = (imageBounds.y - targetBounds.y);
            const squared = Math.sqrt(((left * left) + (top * top)));
            const wait = (500 - Math.abs(((((1 / squared) * 100) * 500) * 0.5)));
            const height = 20;

            const motionName = (`ToolbarBouncing[${ iconName }]`);

            if (!Motions.getMotionByTag(motionName))
            {
                Motions.runMotion(new Queue(new Wait((wait + 8)), new DropBounce(target, 400, 12))).tag = motionName;
            }

            const motion = new Queue(new EaseOut(new JumpBy(image, wait, ((targetBounds.x - imageBounds.x) + height), (targetBounds.y - imageBounds.y), 100, 1), 1), new Dispose(image));

            Motions.runMotion(motion);
        }

        animationIconToToolbar('icon-inventory', event.image, event.x, event.y);
    });

    const { roomSession = null } = useRoom();

    var lastRoomClick = null;
    const handleToolClick = (action: string, value?: string) =>
    {
        switch (action)
        {
            case 'zoom':
                lastRoomClick = roomSession.roomId;
                setIsZoomedIn(prevValue =>
                {
                    let scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(roomSession.roomId, 1);

                    if (!prevValue) scale /= 2;
                    else scale *= 2;

                    GetRoomEngine().setRoomInstanceRenderingCanvasScale(roomSession.roomId, 1, scale);

                    return !prevValue;
                });
                return;
        }
    };

    return (
        <>
            <TransitionAnimation type={ TransitionAnimationTypes.FADE_IN } inProp={ isMeExpanded } timeout={ isMeExpanded ? 0 : 250 }>
                <ToolbarMeView useGuideTool={ useGuideTool } unseenAchievementCount={ getTotalUnseen }
                    setMeExpanded={ setMeExpanded }/>
            </TransitionAnimation>
            <Flex alignItems="center" justifyContent="between" gap={ 4 }
                className="nitro-toolbar py-1 px-2 flex-column">
                <Flex gap={ 2 } alignItems="center">
                    <Flex alignItems="center" gap={ 1 } className={ 'flex-column' }>

                        <ToolbarIcon icon="icon-rooms" maxFrames={ 4 }
                            onClick={ event => CreateLinkEvent('navigator/toggle') }/>
                        <Text truncate className="text-volter-bold" variant={ 'white' }>
                            { LocalizeText('toolbar.icon.label.navigator') }
                        </Text>
                        { (requests.length > 0) ?
                            <ToolbarIcon icon="icon-friends-requests" maxFrames={ 0 }
                                onClick={ event => CreateLinkEvent('friends/toggle') }/> :
                            <ToolbarIcon icon="icon-friends" maxFrames={ 5 }
                                onClick={ event => CreateLinkEvent('friends/toggle') }/> }
                        <Text truncate className="text-volter-bold" variant={ 'white' }>
                            { LocalizeText('toolbar.icon.label.friendlist') }
                        </Text>


                        <ToolbarIcon icon={ 'icon-catalog' } maxFrames={ 7 }
                            onClick={ event => CreateLinkEvent('catalog/toggle') }/>
                        <Text truncate className="text-volter-bold" variant={ 'white' }>
                            { LocalizeText('toolbar.icon.label.catalogue') }
                        </Text>


                        <Base pointer className="navigation-item icon icon-inventory"
                            onClick={ event => CreateLinkEvent('inventory/toggle') }>
                            { (getFullCount > 0) &&
                                <LayoutItemCountView count={ getFullCount }/> }
                        </Base>
                        <Text truncate className="text-volter-bold" variant={ 'white' }>
                            { LocalizeText('toolbar.icon.label.inventory') }
                        </Text>



                        { ((iconState === MessengerIconState.SHOW) || (iconState === MessengerIconState.UNREAD)) &&
                            <Base pointer
                                className={ `navigation-item icon icon-message ${ (iconState === MessengerIconState.UNREAD) && 'is-unseen' }` }
                                onClick={ event => OpenMessengerChat() }/> }
                        <Text truncate className="text-volter-bold" variant={ 'white' }>
                            { LocalizeText('toolbar.icon.label.messenger') }
                        </Text>
                        { isInRoom &&
                            <Base pointer className="navigation-item icon icon-camera"
                                onClick={ event => CreateLinkEvent('camera/toggle') }/> }


                        { !isInRoom &&
                            <Base pointer className="navigation-item icon icon-house"
                                onClick={ event => CreateLinkEvent('navigator/goto/home') }/> }

                        { isMod &&
                            <Base pointer className="navigation-item icon icon-modtools"
                                  onClick={ event => CreateLinkEvent('mod-tools/toggle') }/> }
                    </Flex>
                </Flex>

                <Flex gap={ 2 } alignItems="center">
                    <Flex alignItems="center" gap={ 2 } className={ 'flex-column' }>
                        { isInRoom &&
                            <ToolbarIcon icon={ (!isZoomedIn ? 'icon-room-zoom' : 'icon-room-zoom-inverse') }
                                onClick={ () => handleToolClick('zoom') }
                                maxFrames={ !isZoomedIn ? 5 : 6 }></ToolbarIcon> }
                        { isInRoom && <Text truncate className="text-volter-bold" variant={ 'white' }>
                            { LocalizeText('toolbar.icon.label.zoom') }
                        </Text> }
                        { isInRoom &&
                            <Base pointer className="navigation-item icon icon-room-info"
                                onClick={ event => CreateLinkEvent('navigator/toggle-room-info') }/> }

                        { isInRoom && <Text truncate className="text-volter-bold" variant={ 'white' }>
                            { LocalizeText('toolbar.icon.label.roominfo') }
                        </Text> }

                        <Flex center pointer
                            className={ 'navigation-item item-avatar ' + (isMeExpanded ? 'active ' : '') }
                            onClick={ event => setMeExpanded(!isMeExpanded) }>
                            <LayoutAvatarImageView headOnly={ true } figure={ userFigure } direction={ 3 }
                                position="absolute"/>
                            { (getTotalUnseen > 0) &&
                                <LayoutItemCountView count={ getTotalUnseen }/> }
                        </Flex>

                        <Text truncate className="text-volter-bold" variant={ 'white' }>
                            { LocalizeText('toolbar.icon.label.memenu') }
                        </Text>
                    </Flex>
                    <Flex alignItems="center" id="toolbar-chat-input-container"/>

                </Flex>
            </Flex>
        </>
    );
}
