import {
    AvatarAction,
    AvatarExpressionEnum,
    RoomControllerLevel,
    RoomObjectCategory,
    RoomUnitDropHandItemComposer
} from '@nitrots/nitro-renderer';
import {Dispatch, FC, SetStateAction, useState} from 'react';
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa';
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
import {ColorVariantType, Flex, LayoutCurrencyIcon} from '../../../../../common';
import {HelpNameChangeEvent} from '../../../../../events';
import {useRoom} from '../../../../../hooks';
import {ContextMenuHeaderView} from '../../context-menu/ContextMenuHeaderView';
import {ContextMenuListItemView} from '../../context-menu/ContextMenuListItemView';
import {ContextMenuView} from '../../context-menu/ContextMenuView';
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
    const {avatarInfo = null, isDancing = false, setIsDecorating = null, onClose = null} = props;
    const [ mode, setMode ] = useState((isDancing && HasHabboClub()) ? MODE_CLUB_DANCES : MODE_NORMAL);
    const {roomSession = null} = useRoom();

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
                            <span className={ 'text-white' }>  { LocalizeText('widget.avatar.change_name') } </span>
                        </Button> }
                    { isShowDecorate() &&
                        <Button variant={ 'dark' } onClick={ event => processAction('decorate') }>
                            <span className={ 'text-white' }>  { LocalizeText('widget.avatar.decorate') }</span>
                        </Button> }
                    <Button variant={ 'dark' } onClick={ event => processAction('change_looks') }>
                        <span className={ 'text-white' }>{ LocalizeText('widget.memenu.myclothes') } </span>
                    </Button>
                    { (HasHabboClub() && !isRidingHorse) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('dance_menu') }>
                            <span className={ 'text-white' }>  { LocalizeText('widget.memenu.dance') } </span>
                        </Button> }
                    { (!isDancing && !HasHabboClub() && !isRidingHorse) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('dance') }>
                            <span className={ 'text-white' }>  { LocalizeText('widget.memenu.dance') }</span>
                        </Button> }
                    { (isDancing && !HasHabboClub() && !isRidingHorse) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('dance_stop') }>
                            <span className={ 'text-white' }>   { LocalizeText('widget.memenu.dance.stop') }</span>
                        </Button> }
                    <Button variant={ 'dark' } onClick={ event => processAction('expressions') }>
                        <span className={ 'text-white' }>  { LocalizeText('infostand.link.expressions') }</span>
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('signs') }>
                        <span className={ 'text-white' }>  { LocalizeText('infostand.show.signs') }</span>
                    </Button>
                    { (avatarInfo.carryItem > 0) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('drop_carry_item') }>
                            <span
                                className={ 'text-white' }>    { LocalizeText('avatar.widget.drop_hand_item') } </span>
                        </Button> }
                </> }
            { (mode === MODE_CLUB_DANCES) &&
                <>
                    { isDancing &&
                        <Button variant={ 'dark' } onClick={ event => processAction('dance_stop') }>
                            <span className={ 'text-white' }> { LocalizeText('widget.memenu.dance.stop') }</span>
                        </Button> }
                    <Button variant={ 'dark' } onClick={ event => processAction('dance_1') }>
                        <span className={ 'text-white' }>  { LocalizeText('widget.memenu.dance1') }</span>
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('dance_2') }>
                        <span className={ 'text-white' }>   { LocalizeText('widget.memenu.dance2') }</span>
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('dance_3') }>
                        <span className={ 'text-white' }>   { LocalizeText('widget.memenu.dance3') }</span>
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('dance_4') }>
                        <span className={ 'text-white' }> { LocalizeText('widget.memenu.dance4') }</span>
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('back') }>
                        <span className={ 'text-white' }>{ LocalizeText('generic.back') }</span>
                    </Button>
                </> }
            { (mode === MODE_EXPRESSIONS) &&
                <>
                    { (GetOwnPosture() === AvatarAction.POSTURE_STAND) &&
                        <Button variant={ 'dark' } onClick={ event => processAction('sit') }>
                            <span className={ 'text-white' }> { LocalizeText('widget.memenu.sit') }</span>
                        </Button> }
                    { GetCanStandUp() &&
                        <Button variant={ 'dark' } onClick={ event => processAction('stand') }>
                            <span className={ 'text-white' }>  { LocalizeText('widget.memenu.stand') }</span>
                        </Button> }
                    { GetCanUseExpression() &&
                        <Button variant={ 'dark' } onClick={ event => processAction('wave') }>
                            <span className={ 'text-white' }>   { LocalizeText('widget.memenu.wave') }</span>
                        </Button> }
                    { GetCanUseExpression() &&
                        <Button variant={ 'dark' } disabled={ !HasHabboVip() }
                                onClick={ event => processAction('laugh') }>
                            { !HasHabboVip() && <LayoutCurrencyIcon type="hc"/> }
                            <span className={ 'text-white' }>  { LocalizeText('widget.memenu.laugh') }</span>
                        </Button> }
                    { GetCanUseExpression() &&
                        <Button variant={ 'dark' } disabled={ !HasHabboVip() }
                                onClick={ event => processAction('blow') }>
                            { !HasHabboVip() && <LayoutCurrencyIcon type="hc"/> }
                            <span className={ 'text-white' }>  { LocalizeText('widget.memenu.blow') }</span>
                        </Button> }
                    <Button variant={ 'dark' } onClick={ event => processAction('idle') }>
                        <span className={ 'text-white' }>  { LocalizeText('widget.memenu.idle') }</span>
                    </Button>
                    <Button variant={ 'dark' } onClick={ event => processAction('back') }>
                        <span className={ 'text-white' }>  { LocalizeText('generic.back') }</span>
                    </Button>
                </> }
            { (mode === MODE_SIGNS) &&
                <>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_1') }>
                            <span className={ 'text-white' }>    1</span>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_2') }>
                            <span className={ 'text-white' }>     2</span>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_3') }>
                            <span className={ 'text-white' }>    3</span>
                        </Button>
                    </Flex>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_4') }>
                            <span className={ 'text-white' }>    4</span>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_5') }>
                            <span className={ 'text-white' }>   5</span>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_6') }>
                            <span className={ 'text-white' }>      6</span>
                        </Button>
                    </Flex>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_7') }>
                            <span className={ 'text-white' }>      7</span>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_8') }>
                            <span className={ 'text-white' }>   8</span>
                        </Button>
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_9') }>
                            <span className={ 'text-white' }>   9</span>
                        </Button>
                    </Flex>
                    <Flex className="menu-list-split-3">
                        <Button variant={ 'dark' } onClick={ event => processAction('sign_10') }>
                            <span className={ 'text-white' }>   10</span>
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
                            <span className={ 'text-white' }>   0</span>
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
                        <span className={ 'text-white' }> { LocalizeText('generic.back') }</span>
                    </Button>
                </> }
        </Flex>
    );
}
