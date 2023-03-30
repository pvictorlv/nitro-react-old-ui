import {
    RoomControllerLevel,
    RoomObjectCategory,
    RoomObjectVariable,
    RoomUnitGiveHandItemComposer,
    SetRelationshipStatusComposer,
    TradingOpenComposer
} from '@nitrots/nitro-renderer';
import {FC, useEffect, useMemo, useState} from 'react';
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa';
import {
    AvatarInfoUser,
    CreateLinkEvent,
    DispatchUiEvent,
    GetOwnRoomObject,
    GetSessionDataManager,
    GetUserProfile,
    LocalizeText,
    MessengerFriend,
    ReportType,
    RoomWidgetUpdateChatInputContentEvent,
    SendMessageComposer
} from '../../../../../api';
import {Base, Flex, Button} from '../../../../../common';
import {useFriends, useHelp, useRoom, useSessionInfo} from '../../../../../hooks';
import {ContextMenuHeaderView} from '../../context-menu/ContextMenuHeaderView';

interface AvatarInfoWidgetAvatarViewProps
{
    avatarInfo: AvatarInfoUser;
    onClose: () => void;
}

const MODE_NORMAL = 0;
const MODE_MODERATE = 1;
const MODE_MODERATE_BAN = 2;
const MODE_MODERATE_MUTE = 3;
const MODE_AMBASSADOR = 4;
const MODE_AMBASSADOR_MUTE = 5;
const MODE_RELATIONSHIP = 6;

export const AvatarInfoWidgetAvatarView: FC<AvatarInfoWidgetAvatarViewProps> = props =>
{
    const {avatarInfo = null, onClose = null} = props;
    const [ mode, setMode ] = useState(MODE_NORMAL);
    const {canRequestFriend = null} = useFriends();
    const {report = null} = useHelp();
    const {roomSession = null} = useRoom();
    const {userRespectRemaining = 0, respectUser = null} = useSessionInfo();

    const isShowGiveRights = useMemo(() =>
    {
        return (avatarInfo.amIOwner && (avatarInfo.targetRoomControllerLevel < RoomControllerLevel.GUEST) && !avatarInfo.isGuildRoom);
    }, [ avatarInfo ]);

    const isShowRemoveRights = useMemo(() =>
    {
        return (avatarInfo.amIOwner && (avatarInfo.targetRoomControllerLevel === RoomControllerLevel.GUEST) && !avatarInfo.isGuildRoom);
    }, [ avatarInfo ]);

    const moderateMenuHasContent = useMemo(() =>
    {
        return (avatarInfo.canBeKicked || avatarInfo.canBeBanned || avatarInfo.canBeMuted || isShowGiveRights || isShowRemoveRights);
    }, [ isShowGiveRights, isShowRemoveRights, avatarInfo ]);

    const canGiveHandItem = useMemo(() =>
    {
        let flag = false;

        const roomObject = GetOwnRoomObject();

        if (roomObject)
        {
            const carryId = roomObject.model.getValue<number>(RoomObjectVariable.FIGURE_CARRY_OBJECT);

            if ((carryId > 0) && (carryId < 999999)) flag = true;
        }

        return flag;
    }, []);

    const processAction = (name: string) =>
    {
        let hideMenu = true;

        if (name)
        {
            switch (name)
            {
                case 'moderate':
                    hideMenu = false;
                    setMode(MODE_MODERATE);
                    break;
                case 'ban':
                    hideMenu = false;
                    setMode(MODE_MODERATE_BAN);
                    break;
                case 'mute':
                    hideMenu = false;
                    setMode(MODE_MODERATE_MUTE);
                    break;
                case 'ambassador':
                    hideMenu = false;
                    setMode(MODE_AMBASSADOR);
                    break;
                case 'ambassador_mute':
                    hideMenu = false;
                    setMode(MODE_AMBASSADOR_MUTE);
                    break;
                case 'back_moderate':
                    hideMenu = false;
                    setMode(MODE_MODERATE);
                    break;
                case 'back_ambassador':
                    hideMenu = false;
                    setMode(MODE_AMBASSADOR);
                    break;
                case 'back':
                    hideMenu = false;
                    setMode(MODE_NORMAL);
                    break;
                case 'whisper':
                    DispatchUiEvent(new RoomWidgetUpdateChatInputContentEvent(RoomWidgetUpdateChatInputContentEvent.WHISPER, avatarInfo.name));
                    break;
                case 'friend':
                    CreateLinkEvent(`friends/request/${ avatarInfo.webID }/${ avatarInfo.name }`);
                    break;
                case 'relationship':
                    hideMenu = false;
                    setMode(MODE_RELATIONSHIP);
                    break;
                case 'respect':
                {
                    respectUser(avatarInfo.webID);

                    if ((userRespectRemaining - 1) >= 1) hideMenu = false;
                    break;
                }
                case 'ignore':
                    GetSessionDataManager().ignoreUser(avatarInfo.name);
                    break;
                case 'unignore':
                    GetSessionDataManager().unignoreUser(avatarInfo.name);
                    break;
                case 'kick':
                    roomSession.sendKickMessage(avatarInfo.webID);
                    break;
                case 'ban_hour':
                    roomSession.sendBanMessage(avatarInfo.webID, 'RWUAM_BAN_USER_HOUR');
                    break;
                case 'ban_day':
                    roomSession.sendBanMessage(avatarInfo.webID, 'RWUAM_BAN_USER_DAY');
                    break;
                case 'perm_ban':
                    roomSession.sendBanMessage(avatarInfo.webID, 'RWUAM_BAN_USER_PERM');
                    break;
                case 'mute_2min':
                    roomSession.sendMuteMessage(avatarInfo.webID, 2);
                    break;
                case 'mute_5min':
                    roomSession.sendMuteMessage(avatarInfo.webID, 5);
                    break;
                case 'mute_10min':
                    roomSession.sendMuteMessage(avatarInfo.webID, 10);
                    break;
                case 'give_rights':
                    roomSession.sendGiveRightsMessage(avatarInfo.webID);
                    break;
                case 'remove_rights':
                    roomSession.sendTakeRightsMessage(avatarInfo.webID);
                    break;
                case 'trade':
                    SendMessageComposer(new TradingOpenComposer(avatarInfo.roomIndex));
                    break;
                case 'report':
                    report(ReportType.BULLY, {reportedUserId: avatarInfo.webID});
                    break;
                case 'pass_hand_item':
                    SendMessageComposer(new RoomUnitGiveHandItemComposer(avatarInfo.webID));
                    break;
                case 'ambassador_alert':
                    roomSession.sendAmbassadorAlertMessage(avatarInfo.webID);
                    break;
                case 'ambassador_kick':
                    roomSession.sendKickMessage(avatarInfo.webID);
                    break;
                case 'ambassador_mute_2min':
                    roomSession.sendMuteMessage(avatarInfo.webID, 2);
                    break;
                case 'ambassador_mute_10min':
                    roomSession.sendMuteMessage(avatarInfo.webID, 10);
                    break;
                case 'ambassador_mute_60min':
                    roomSession.sendMuteMessage(avatarInfo.webID, 60);
                    break;
                case 'ambassador_mute_18hour':
                    roomSession.sendMuteMessage(avatarInfo.webID, 1080);
                    break;
                case 'rship_heart':
                    SendMessageComposer(new SetRelationshipStatusComposer(avatarInfo.webID, MessengerFriend.RELATIONSHIP_HEART));
                    break;
                case 'rship_smile':
                    SendMessageComposer(new SetRelationshipStatusComposer(avatarInfo.webID, MessengerFriend.RELATIONSHIP_SMILE));
                    break;
                case 'rship_bobba':
                    SendMessageComposer(new SetRelationshipStatusComposer(avatarInfo.webID, MessengerFriend.RELATIONSHIP_BOBBA));
                    break;
                case 'rship_none':
                    SendMessageComposer(new SetRelationshipStatusComposer(avatarInfo.webID, MessengerFriend.RELATIONSHIP_NONE));
                    break;
            }
        }

        if (hideMenu) onClose();
    }

    useEffect(() =>
    {
        setMode(MODE_NORMAL);
    }, [ avatarInfo ]);

    return (
        <Flex gap={ 1 } justifyContent="end">


            { (mode === MODE_NORMAL) &&
                <>
                    { canRequestFriend(avatarInfo.webID) &&
                        <Button variant={'dark'} onClick={ event => processAction('friend') }>
                            { LocalizeText('infostand.button.friend') }
                        </Button> }
                    <Button variant={'dark'} onClick={ event => processAction('trade') }>
                        { LocalizeText('infostand.button.trade') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('whisper') }>
                        { LocalizeText('infostand.button.whisper') }
                    </Button>
                    { (userRespectRemaining > 0) &&
                        <Button variant={'dark'} onClick={ event => processAction('respect') }>
                            { LocalizeText('infostand.button.respect', [ 'count' ], [ userRespectRemaining.toString() ]) }
                        </Button> }
                    { !canRequestFriend(avatarInfo.webID) &&
                        <Button variant={'dark'} onClick={ event => processAction('relationship') }>
                            { LocalizeText('infostand.link.relationship') }
                            <FaChevronRight className="right fa-icon"/>
                        </Button> }
                    { !avatarInfo.isIgnored &&
                        <Button variant={'dark'} onClick={ event => processAction('ignore') }>
                            { LocalizeText('infostand.button.ignore') }
                        </Button> }
                    { avatarInfo.isIgnored &&
                        <Button variant={'dark'} onClick={ event => processAction('unignore') }>
                            { LocalizeText('infostand.button.unignore') }
                        </Button> }
                    <Button variant={'dark'} onClick={ event => processAction('report') }>
                        { LocalizeText('infostand.button.report') }
                    </Button>
                    { moderateMenuHasContent &&
                        <Button variant={'dark'} onClick={ event => processAction('moderate') }>
                            { LocalizeText('infostand.link.moderate') }
                        </Button> }
                    { avatarInfo.isAmbassador &&
                        <Button variant={'dark'} onClick={ event => processAction('ambassador') }>
                            { LocalizeText('infostand.link.ambassador') }
                        </Button> }
                    { canGiveHandItem &&
                        <Button variant={'dark'} onClick={ event => processAction('pass_hand_item') }>
                            { LocalizeText('avatar.widget.pass_hand_item') }
                        </Button> }
                </> }
            { (mode === MODE_MODERATE) &&
                <>
                    <Button variant={'dark'} onClick={ event => processAction('kick') }>
                        { LocalizeText('infostand.button.kick') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('mute') }>
                        { LocalizeText('infostand.button.mute') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('ban') }>
                        { LocalizeText('infostand.button.ban') }
                    </Button>
                    { isShowGiveRights &&
                        <Button variant={'dark'} onClick={ event => processAction('give_rights') }>
                            { LocalizeText('infostand.button.giverights') }
                        </Button> }
                    { isShowRemoveRights &&
                        <Button variant={'dark'} onClick={ event => processAction('remove_rights') }>
                            { LocalizeText('infostand.button.removerights') }
                        </Button> }
                    <Button variant={'dark'} onClick={ event => processAction('back') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
            { (mode === MODE_MODERATE_BAN) &&
                <>
                    <Button variant={'dark'} onClick={ event => processAction('ban_hour') }>
                        { LocalizeText('infostand.button.ban_hour') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('ban_day') }>
                        { LocalizeText('infostand.button.ban_day') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('perm_ban') }>
                        { LocalizeText('infostand.button.perm_ban') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('back_moderate') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
            { (mode === MODE_MODERATE_MUTE) &&
                <>
                    <Button variant={'dark'} onClick={ event => processAction('mute_2min') }>
                        { LocalizeText('infostand.button.mute_2min') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('mute_5min') }>
                        { LocalizeText('infostand.button.mute_5min') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('mute_10min') }>
                        { LocalizeText('infostand.button.mute_10min') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('back_moderate') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
            { (mode === MODE_AMBASSADOR) &&
                <>
                    <Button variant={'dark'} onClick={ event => processAction('ambassador_alert') }>
                        { LocalizeText('infostand.button.alert') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('ambassador_kick') }>
                        { LocalizeText('infostand.button.kick') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('ambassador_mute') }>
                        { LocalizeText('infostand.button.mute') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('back') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
            { (mode === MODE_AMBASSADOR_MUTE) &&
                <>
                    <Button variant={'dark'} onClick={ event => processAction('ambassador_mute_2min') }>
                        { LocalizeText('infostand.button.mute_2min') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('ambassador_mute_10min') }>
                        { LocalizeText('infostand.button.mute_10min') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('ambassador_mute_60min') }>
                        { LocalizeText('infostand.button.mute_60min') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('ambassador_mute_18hr') }>
                        { LocalizeText('infostand.button.mute_18hour') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('back_ambassador') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
            { (mode === MODE_RELATIONSHIP) &&
                <>
                    <Flex className="menu-list-split-3">
                        <Button variant={'dark'} onClick={ event => processAction('rship_heart') }>
                            <Base pointer className="nitro-friends-spritesheet icon-heart"/>
                        </Button>
                        <Button variant={'dark'} onClick={ event => processAction('rship_smile') }>
                            <Base pointer className="nitro-friends-spritesheet icon-smile"/>
                        </Button>
                        <Button variant={'dark'} onClick={ event => processAction('rship_bobba') }>
                            <Base pointer className="nitro-friends-spritesheet icon-bobba"/>
                        </Button>
                    </Flex>
                    <Button variant={'dark'} onClick={ event => processAction('rship_none') }>
                        { LocalizeText('avatar.widget.clear_relationship') }
                    </Button>
                    <Button variant={'dark'} onClick={ event => processAction('back') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
        </Flex>
    );
}
