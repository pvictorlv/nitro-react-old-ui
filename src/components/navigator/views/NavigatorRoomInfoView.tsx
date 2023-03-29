import {
    DeleteFavouriteRoomMessageComposer,
    GetCustomRoomFilterMessageComposer,
    NavigatorSearchComposer, RateFlatMessageComposer,
    RoomMuteComposer,
    RoomSettingsComposer,
    SecurityLevel,
    ToggleStaffPickMessageComposer,
    UpdateHomeRoomMessageComposer
} from '@nitrots/nitro-renderer';
import {FC, useEffect, useState} from 'react';
import {FaLink} from 'react-icons/fa';
import {
    CreateLinkEvent,
    DispatchUiEvent, GetConfiguration,
    GetGroupInformation,
    GetSessionDataManager,
    LocalizeText,
    ReportType,
    SendMessageComposer, VisitDesktop
} from '../../../api';
import {
    Base,
    Button,
    classNames,
    Column,
    Flex, Grid,
    LayoutBadgeImageView,
    LayoutRoomThumbnailView,
    NitroCardContentView,
    NitroCardHeaderView,
    NitroCardView,
    Text,
    UserProfileIconView
} from '../../../common';
import {RoomWidgetThumbnailEvent} from '../../../events';
import {useHelp, useNavigator} from '../../../hooks';
import {AddFavouriteRoomMessageComposer} from '@nitrots/nitro-renderer/src/nitro/communication/messages';

export class NavigatorRoomInfoViewProps
{
    onCloseClick: () => void;
}

export const NavigatorRoomInfoView: FC<NavigatorRoomInfoViewProps> = props =>
{
    const {onCloseClick = null} = props;
    const [ isRoomPicked, setIsRoomPicked ] = useState(false);
    const [ isRoomMuted, setIsRoomMuted ] = useState(false);
    const {report = null} = useHelp();
    const {navigatorData = null} = useNavigator();
    const {favouriteRooms = []} = useNavigator();

    const hasPermission = (permission: string) =>
    {
        switch (permission)
        {
            case 'settings':
                return (GetSessionDataManager().userId === navigatorData.enteredGuestRoom.ownerId || GetSessionDataManager().isModerator);
            case 'staff_pick':
                return GetSessionDataManager().securityLevel >= SecurityLevel.COMMUNITY;
            default:
                return false;
        }
    }

    const processAction = (action: string, value?: string) =>
    {
        if (!navigatorData || !navigatorData.enteredGuestRoom) return;

        switch (action)
        {

            case 'chat_history':
                CreateLinkEvent('chat-history/toggle');
                return;
            case 'set_home_room':
                let newRoomId = -1;

                if (navigatorData.homeRoomId !== navigatorData.enteredGuestRoom.roomId)
                {
                    newRoomId = navigatorData.enteredGuestRoom.roomId;
                }

                if (newRoomId > 0) SendMessageComposer(new UpdateHomeRoomMessageComposer(newRoomId));
                return

            case 'like_room':
                SendMessageComposer(new RateFlatMessageComposer(1));
                return;
            case 'fav_room':
                if (navigatorData.enteredGuestRoom.roomId > 0 && favouriteRooms.indexOf(navigatorData.enteredGuestRoom.roomId) === -1)
                    SendMessageComposer(new AddFavouriteRoomMessageComposer(navigatorData.enteredGuestRoom.roomId));
                return;
            case 'unfav_room':
                if (navigatorData.enteredGuestRoom.roomId > 0 && favouriteRooms.indexOf(navigatorData.enteredGuestRoom.roomId) !== -1)
                    SendMessageComposer(new DeleteFavouriteRoomMessageComposer(navigatorData.enteredGuestRoom.roomId));
                return;
            case 'navigator_search_tag':
                CreateLinkEvent(`navigator/search/hotel_view/tag:${ value }`);
           //     SendMessageComposer(new NavigatorSearchComposer('hotel_view', `tag:${ value }`));
                return;
            case 'open_room_thumbnail_camera':
                DispatchUiEvent(new RoomWidgetThumbnailEvent(RoomWidgetThumbnailEvent.TOGGLE_THUMBNAIL));
                return;
            case 'open_group_info':
                GetGroupInformation(navigatorData.enteredGuestRoom.habboGroupId);
                return;
            case 'toggle_room_link':
                CreateLinkEvent('navigator/toggle-room-link');
                return;
            case 'open_room_settings':
                onCloseClick();
                SendMessageComposer(new RoomSettingsComposer(navigatorData.enteredGuestRoom.roomId));
                return;
            case 'toggle_pick':
                setIsRoomPicked(value => !value);
                SendMessageComposer(new ToggleStaffPickMessageComposer(navigatorData.enteredGuestRoom.roomId));
                return;
            case 'toggle_mute':
                setIsRoomMuted(value => !value);
                SendMessageComposer(new RoomMuteComposer());
                return;
            case 'room_filter':
                SendMessageComposer(new GetCustomRoomFilterMessageComposer(navigatorData.enteredGuestRoom.roomId));
                return;
            case 'open_floorplan_editor':
                CreateLinkEvent('floor-editor/toggle');
                return;
            case 'report_room':
                report(ReportType.ROOM, {
                    roomId: navigatorData.enteredGuestRoom.roomId,
                    roomName: navigatorData.enteredGuestRoom.roomName
                });
                return;
            case 'close':
                onCloseClick();
                return;
        }

    }

    useEffect(() =>
    {
        if (!navigatorData) return;

        setIsRoomPicked(navigatorData.currentRoomIsStaffPick);

        if (navigatorData.enteredGuestRoom) setIsRoomMuted(navigatorData.enteredGuestRoom.allInRoomMuted);
    }, [ navigatorData ]);

    if (!navigatorData.enteredGuestRoom) return null;

    return (
        <Column className="nitro-room-info">
            <div className={ 'nitro-room-info-content py-1' }>
                <Flex>
                    <Column center position="relative" className={ 'container-fluid' } gap={ 0 }>
                        <Flex fullWidth>
                            <Text className={ 'text-volter-bold' }
                                  variant={ 'white' }>{ navigatorData.enteredGuestRoom.roomName }</Text>
                        </Flex>
                        <Flex fullWidth gap={ 1 } alignItems={ 'center' }>
                            <Text className={ 'text-volter-bold' }
                                  variant={ 'white' }>{ LocalizeText('navigator.roomownercaption') } </Text>
                            <Text variant={ 'white' }>{ navigatorData.enteredGuestRoom.ownerName }</Text>
                        </Flex>


                    </Column>

                    <i onClick={ () => processAction('set_home_room') }
                       className={ classNames('flex-shrink-0 icon icon-house-small cursor-pointer', ((navigatorData.homeRoomId !== navigatorData.enteredGuestRoom.roomId) && 'gray')) }/>

                    <i className="end-2 infostand-close p-2"
                          onMouseDownCapture={ event =>
                          {
                              event.stopPropagation();
                              event.nativeEvent.stopImmediatePropagation();
                          } } onClick={ () => processAction('close') }/>
                </Flex>


                <NitroCardContentView className="text-white container-fluid">
                    { navigatorData.enteredGuestRoom &&
                        <>
                            <Flex gap={ 2 } overflow="hidden">

                                <Column grow gap={ 1 } overflow="hidden">
                                    <Flex gap={ 1 }>
                                        <Column grow gap={ 1 }>


                                            { (navigatorData.enteredGuestRoom.tags.length > 0) &&
                                                <Flex alignItems="center" gap={ 1 }>
                                                    { navigatorData.enteredGuestRoom.tags.map(tag =>
                                                    {
                                                        return <Text key={ tag } pointer
                                                                     className="rounded room-tag"
                                                                     onClick={ event => processAction('navigator_search_tag', tag) }>{ tag }</Text>
                                                    }) }
                                                </Flex> }


                                            <Flex alignItems="center" gap={ 1 } fullWidth>
                                                <Text variant="white"
                                                      className={ 'text-volter-bold' }>{ LocalizeText('navigator.roomrating') }</Text>
                                                <Text variant="white">{ navigatorData.currentRoomRating }</Text>
                                            </Flex>
                                        </Column>

                                    </Flex>
                                    <Text overflow="auto"
                                          style={ {maxHeight: 50} }>{ navigatorData.enteredGuestRoom.description }</Text>
                                    { (navigatorData.enteredGuestRoom.habboGroupId > 0) &&
                                        <Flex pointer alignItems="center" gap={ 1 }
                                              onClick={ () => processAction('open_group_info') }>
                                            <LayoutBadgeImageView className="flex-none"
                                                                  badgeCode={ navigatorData.enteredGuestRoom.groupBadgeCode }
                                                                  isGroup={ true }/>
                                            <Text underline variant={ 'white' }>
                                                { LocalizeText('navigator.guildbase', [ 'groupName' ], [ navigatorData.enteredGuestRoom.groupName ]) }
                                            </Text>
                                        </Flex> }
                                </Column>
                            </Flex>

                            { navigatorData.canRate && <Button fullWidth onClick={ () => processAction('like_room') }>
                                { LocalizeText('room.like.button.text') }
                            </Button> }

                            { favouriteRooms.includes(navigatorData.enteredGuestRoom.roomId) &&
                                <Button fullWidth onClick={ () => processAction('unfav_room') }>
                                    { LocalizeText('navigator.roominfo.removefromfavourites') }
                                </Button> }

                            { !favouriteRooms.includes(navigatorData.enteredGuestRoom.roomId) &&
                                <Button fullWidth onClick={ () => processAction('fav_room') }>
                                    { LocalizeText('navigator.roominfo.addtofavourites') }
                                </Button> }

                            { hasPermission('staff_pick') &&
                                <Button fullWidth onClick={ () => processAction('toggle_pick') }>
                                    { LocalizeText(isRoomPicked ? 'navigator.staffpicks.unpick' : 'navigator.staffpicks.pick') }
                                </Button> }

                            <Grid columnCount={ 2 } fullWidth>
                                { hasPermission('settings') &&
                                    <Button fullWidth onClick={ () => processAction('open_room_settings') }>
                                        { LocalizeText('navigator.roomsettings') }
                                    </Button> }
                                <Button fullWidth onClick={ () => processAction('report_room') }>
                                    { LocalizeText('help.emergency.main.report.room') }
                                </Button>
                                { hasPermission('settings') &&
                                    <>
                                        <Button onClick={ () => processAction('toggle_mute') }>
                                            { LocalizeText(isRoomMuted ? 'navigator.muteall_on' : 'navigator.muteall_off') }
                                        </Button>
                                        <Button onClick={ () => processAction('room_filter') }>
                                            { LocalizeText('navigator.roomsettings.roomfilter') }
                                        </Button>
                                    </> }
                            </Grid>
                        </> }

                </NitroCardContentView>

            </div>

            <div className={ 'nitro-room-info-content py-1' }>
                <Flex>
                    <Column center position="relative" className={ 'container-fluid' }>
                        <Flex fullWidth className={ 'text-volter-bold' }>
                            { LocalizeText('navigator.embed.caption') } </Flex>
                    </Column>
                </Flex>
                <NitroCardContentView className="d-flex align-items-center">
                    <Flex gap={ 2 }>
                        <Column center position="relative" className={ 'container-fluid' }>
                            <Text variant={ 'white' }>{ LocalizeText('navigator.embed.info') }</Text>
                            <input type="text" readOnly className="form-control room-info-input"
                                   value={ LocalizeText('navigator.embed.src', [ 'roomId' ], [ navigatorData.enteredGuestRoom.roomId.toString() ]).replace('${url.prefix}', GetConfiguration<string>('url.prefix', '')) }/>
                        </Column>
                    </Flex>
                </NitroCardContentView>
            </div>

            <Flex fullWidth>
                <Button fullWidth className={ 'm-1' } onClick={ () => processAction('chat_history') }>
                    { LocalizeText('room.chathistory.button.text') }
                </Button>
                <Button fullWidth className={ 'm-1' } onClick={ () =>
                {
                    onCloseClick();
                    VisitDesktop();
                } }>
                    { LocalizeText('navigator.hotelview') }
                </Button>
            </Flex>
        </Column>

    );
};
