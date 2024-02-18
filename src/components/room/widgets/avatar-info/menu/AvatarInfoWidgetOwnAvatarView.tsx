import {
    AvatarAction,
    AvatarExpressionEnum,
    RoomControllerLevel,
    RoomObjectCategory,
    RoomUnitDropHandItemComposer
} from '@nitrots/nitro-renderer';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
    AvatarInfoUser,
    CreateLinkEvent,
    DispatchUiEvent,
    GetCanStandUp,
    GetCanUseExpression,
    GetOwnPosture,
    GetUserProfile,
    HasHabboClub,
    HasHabboVip,
    IsRidingHorse,
    LocalizeText,
    PostureTypeEnum,
    SendMessageComposer
} from '../../../../../api';
import { ColorVariantType, Flex, LayoutCurrencyIcon } from '../../../../../common';
import { HelpNameChangeEvent } from '../../../../../events';
import { useRoom } from '../../../../../hooks';
import { ContextMenuHeaderView } from '../../context-menu/ContextMenuHeaderView';
import { ContextMenuListItemView } from '../../context-menu/ContextMenuListItemView';
import { ContextMenuView } from '../../context-menu/ContextMenuView';
import {
    Base,
    Button,
    Column,
    LayoutBadgeImageView,
    LayoutLimitedEditionCompactPlateView,
    LayoutRarityLevelView,
    Text,
    UserProfileIconView
} from '../../../../../common';

interface AvatarInfoWidgetOwnAvatarViewProps
{
    avatarInfo: AvatarInfoUser;
    isDancing: boolean;
    setIsDecorating: Dispatch<SetStateAction<boolean>>;
    onClose: () => void;
}

const MODE_NORMAL = 0;
const MODE_CLUB_DANCES = 1;
const MODE_NAME_CHANGE = 2;
const MODE_EXPRESSIONS = 3;
const MODE_SIGNS = 4;

export const AvatarInfoWidgetOwnAvatarView: FC<AvatarInfoWidgetOwnAvatarViewProps> = props =>
{
    const { avatarInfo = null, isDancing = false, setIsDecorating = null, onClose = null } = props;
    const [ mode, setMode ] = useState((isDancing && HasHabboClub()) ? MODE_CLUB_DANCES : MODE_NORMAL);
    const { roomSession = null } = useRoom();

    const processAction = (name: string) =>
    {
        let hideMenu = true;

        if (name)
        {
            if (name.startsWith('sign_'))
            {
                const sign = parseInt(name.split('_')[1]);

                roomSession.sendSignMessage(sign);
            }
            else
            {
                switch (name)
                {
                    case 'decorate':
                        setIsDecorating(true);
                        break;
                    case 'change_name':
                        DispatchUiEvent(new HelpNameChangeEvent(HelpNameChangeEvent.INIT));
                        break;
                    case 'change_looks':
                        CreateLinkEvent('avatar-editor/show');
                        break;
                    case 'expressions':
                        hideMenu = false;
                        setMode(MODE_EXPRESSIONS);
                        break;
                    case 'sit':
                        roomSession.sendPostureMessage(PostureTypeEnum.POSTURE_SIT);
                        break;
                    case 'stand':
                        roomSession.sendPostureMessage(PostureTypeEnum.POSTURE_STAND);
                        break;
                    case 'wave':
                        roomSession.sendExpressionMessage(AvatarExpressionEnum.WAVE.ordinal);
                        break;
                    case 'blow':
                        roomSession.sendExpressionMessage(AvatarExpressionEnum.BLOW.ordinal);
                        break;
                    case 'laugh':
                        roomSession.sendExpressionMessage(AvatarExpressionEnum.LAUGH.ordinal);
                        break;
                    case 'idle':
                        roomSession.sendExpressionMessage(AvatarExpressionEnum.IDLE.ordinal);
                        break;
                    case 'dance_menu':
                        hideMenu = false;
                        setMode(MODE_CLUB_DANCES);
                        break;
                    case 'dance':
                        roomSession.sendDanceMessage(1);
                        break;
                    case 'dance_stop':
                        roomSession.sendDanceMessage(0);
                        break;
                    case 'dance_1':
                    case 'dance_2':
                    case 'dance_3':
                    case 'dance_4':
                        roomSession.sendDanceMessage(parseInt(name.charAt((name.length - 1))));
                        break;
                    case 'signs':
                        hideMenu = false;
                        setMode(MODE_SIGNS);
                        break;
                    case 'back':
                        hideMenu = false;
                        setMode(MODE_NORMAL);
                        break;
                    case 'drop_carry_item':
                        SendMessageComposer(new RoomUnitDropHandItemComposer());
                        break;
                }
            }
        }

        if (hideMenu) onClose();
    }

    const isShowDecorate = () => (avatarInfo.amIOwner || avatarInfo.amIAnyRoomController || (avatarInfo.roomControllerLevel > RoomControllerLevel.GUEST));

    const isRidingHorse = IsRidingHorse();

    return (
        <Flex gap={ 1 } justifyContent="end">

            { (mode === MODE_NORMAL) &&
                <>
                    { avatarInfo.allowNameChange &&
                        <Button variant="dark" onClick={ event => processAction('change_name') }>
                            { LocalizeText('widget.avatar.change_name') } 
                        </Button> }
                    { isShowDecorate() &&
                        <Button variant={ 'dark' } onClick={ event => processAction('decorate') }>
                            { LocalizeText('widget.avatar.decorate') }
                        </Button> }
                    <Button variant={ 'dark' } onClick={ event => processAction('change_looks') }>
                        { LocalizeText('widget.memenu.myclothes') } 
                    </Button>
                    { (HasHabboClub() && !isRidingHorse) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('dance_menu') }>
                            { LocalizeText('widget.memenu.dance') } 
                        </Button> }
                    { (!isDancing && !HasHabboClub() && !isRidingHorse) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('dance') }>
                            { LocalizeText('widget.memenu.dance') }
                        </Button> }
                    { (isDancing && !HasHabboClub() && !isRidingHorse) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('dance_stop') }>
                            { LocalizeText('widget.memenu.dance.stop') }
                        </Button> }
                    <Button variant={ 'dark' } onClick={ event => processAction('expressions') }>
                        { LocalizeText('infostand.link.expressions') }
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('signs') }>
                        { LocalizeText('infostand.show.signs') }
                    </Button>
                    { (avatarInfo.carryItem > 0) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('drop_carry_item') }>
                            { LocalizeText('avatar.widget.drop_hand_item') } 
                        </Button> }
                </> }
            { (mode === MODE_CLUB_DANCES) &&
                <>
                    { isDancing &&
                        <Button variant={ 'dark' } onClick={ event => processAction('dance_stop') }>
                            { LocalizeText('widget.memenu.dance.stop') }
                        </Button> }
                    <Button variant={ 'dark' } onClick={ event => processAction('dance_1') }>
                        { LocalizeText('widget.memenu.dance1') }
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('dance_2') }>
                        { LocalizeText('widget.memenu.dance2') }
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('dance_3') }>
                        { LocalizeText('widget.memenu.dance3') }
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('dance_4') }>
                        { LocalizeText('widget.memenu.dance4') }
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('back') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
            { (mode === MODE_EXPRESSIONS) &&
                <>
                    { (GetOwnPosture() === AvatarAction.POSTURE_STAND) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('sit') }>
                            { LocalizeText('widget.memenu.sit') }
                        </Button> }
                    { GetCanStandUp() &&
                        <Button variant={ 'dark' } onClick={ event => processAction('stand') }>
                            { LocalizeText('widget.memenu.stand') }
                        </Button> }
                    { GetCanUseExpression() &&
                        <Button variant={ 'dark' } onClick={ event => processAction('wave') }>
                            { LocalizeText('widget.memenu.wave') }
                        </Button> }
                    { GetCanUseExpression() &&
                        <Button variant={ 'dark' } disabled={ !HasHabboVip() }
                            onClick={ event => processAction('laugh') }>

                            { LocalizeText('widget.memenu.laugh') }
                        </Button> }
                    { GetCanUseExpression() &&
                        <Button variant={ 'dark' } disabled={ !HasHabboVip() }
                            onClick={ event => processAction('blow') }>
                            { LocalizeText('widget.memenu.blow') }
                        </Button> }
                    <Button variant={ 'dark' } onClick={ event => processAction('idle') }>
                        { LocalizeText('widget.memenu.idle') }
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('back') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
            { (mode === MODE_SIGNS) &&
                <>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_1') }>
                                1
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_2') }>
                                 2
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_3') }>
                                3
                        </Button>
                    </Flex>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_4') }>
                                4
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_5') }>
                               5
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_6') }>
                                  6
                        </Button>
                    </Flex>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_7') }>
                                  7
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_8') }>
                               8
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_9') }>
                               9
                        </Button>
                    </Flex>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_10') }>
                               10
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_11') }>
                            <i className="icon icon-sign-heart"/>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_12') }>
                            <i className="icon icon-sign-skull"/>
                        </Button>
                    </Flex>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_0') }>
                               0
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_13') }>
                            <i className="icon icon-sign-exclamation"/>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_15') }>
                            <i className="icon icon-sign-smile"/>
                        </Button>
                    </Flex>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_14') }>
                            <i className="icon icon-sign-soccer"/>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_17') }>
                            <i className="icon icon-sign-yellow"/>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_16') }>
                            <i className="icon icon-sign-red"/>
                        </Button>
                    </Flex>
                    <Button variant={ 'dark' } onClick={ event => processAction('back') }>
                        { LocalizeText('generic.back') }
                    </Button>
                </> }
        </Flex>
    );
}
