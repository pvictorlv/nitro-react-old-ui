import {FollowFriendMessageComposer, ILinkEventTracker, Nitro} from '@nitrots/nitro-renderer';
import {FC, KeyboardEvent, useEffect, useRef, useState} from 'react';
import {
    AddEventLinkTracker,
    GetSessionDataManager,
    GetUserProfile,
    LocalizeText,
    RemoveLinkEventTracker,
    ReportType,
    SendMessageComposer
} from '../../../../api';
import {
    ButtonGroup,
    Column,
    DraggableWindowPosition,
    Flex,
    LayoutAvatarImageView,
    LayoutBadgeImageView,
    LayoutItemCountView,
    NitroCardContentView,
    NitroCardHeaderView,
    NitroCardView
} from '../../../../common';
import {LayoutMessengerGrid} from '../../../../common/layout/LayoutMessengerGrid';
import {useHelp, useMessenger} from '../../../../hooks';
import {FriendsMessengerThreadView} from './messenger-thread/FriendsMessengerThreadView';
import {NitroCardFriendContentView} from '../../../../common/card/NitroCardFriendContentView';

export const FriendsMessengerView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ lastThreadId, setLastThreadId ] = useState(-1);
    const [ messageText, setMessageText ] = useState('');
    const {
        visibleThreads = [],
        activeThread = null,
        getMessageThread = null,
        sendMessage = null,
        setActiveThreadId = null,
        closeThread = null
    } = useMessenger();
    const {report = null} = useHelp();
    const messagesBox = useRef<HTMLDivElement>();


    const followFriend = () => (activeThread && activeThread.participant && SendMessageComposer(new FollowFriendMessageComposer(activeThread.participant.id)));
    const openProfile = () => (activeThread && activeThread.participant && GetUserProfile(activeThread.participant.id));

    const send = () =>
    {
        if (!activeThread || !messageText.length) return;

        sendMessage(activeThread, GetSessionDataManager().userId, messageText);

        setMessageText('');
    }

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) =>
    {
        if (event.key !== 'Enter') return;

        send();
    }

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if (parts.length === 2)
                {
                    if (parts[1] === 'open')
                    {
                        setIsVisible(true);

                        return;
                    }
                    if (parts[1] === 'toggle')
                    {
                        setIsVisible(prevValue => !prevValue);
                        return;
                    }
                    const thread = getMessageThread(parseInt(parts[1]));

                    if (!thread) return;

                    setActiveThreadId(thread.threadId);
                    setIsVisible(true);

                }
            },
            eventUrlPrefix: 'friends-messenger/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ getMessageThread, setActiveThreadId ]);

    useEffect(() =>
    {
        if (!isVisible || !activeThread) return;

        messagesBox.current.scrollTop = messagesBox.current.scrollHeight;
    }, [ isVisible, activeThread ]);

    useEffect(() =>
    {
        if (isVisible && !activeThread)
        {
            if (lastThreadId > 0)
            {
                setActiveThreadId(lastThreadId);
            }
            else
            {
                if (visibleThreads.length > 0) setActiveThreadId(visibleThreads[0].threadId);
            }

            return;
        }

        if (!isVisible && activeThread)
        {
            setLastThreadId(activeThread.threadId);
            setActiveThreadId(-1);
        }
    }, [ isVisible, activeThread, lastThreadId, visibleThreads, setActiveThreadId ]);

    if (!isVisible) return null;

    return (
        <NitroCardView className="nitro-friends-messenger nitro-friends" uniqueKey="nitro-friends-messenger"
                       theme="primary-slim"
                       windowPosition={ DraggableWindowPosition.CENTER_LEFT }>
            <NitroCardHeaderView
                headerText={ (activeThread && activeThread.participant.name) || LocalizeText('messenger.window.title') }
                onCloseClick={ event => setIsVisible(false) }/>
            <NitroCardFriendContentView className={ 'text-black friend-content-area nitro-friends-messenger-content' } overflow={ 'hidden' }>
                <Column fullWidth size={ 4 }>
                    <div className="d-flex h-100 messenger-friend-heads ">
                        { visibleThreads && (visibleThreads.length > 0) && visibleThreads.map(thread =>
                        {
                            return (
                                <LayoutMessengerGrid key={ thread.threadId } itemActive={ (activeThread === thread) }
                                                     onClick={ event => setActiveThreadId(thread.threadId) }>
                                    { thread.unread &&
                                        <LayoutItemCountView count={ thread.unreadCount }/> }
                                    <Flex fullWidth alignItems="center" gap={ 1 }>
                                        <Flex alignItems="center" className="friend-head px-1">
                                            { (thread.participant.id > 0) &&
                                                <LayoutAvatarImageView figure={ thread.participant.figure }
                                                                       headOnly={ true } scale={ 0.7 }
                                                                       direction={ 2 }/> }
                                            { (thread.participant.id <= 0) &&
                                                <LayoutBadgeImageView
                                                    style={ {backgroundImage: `url(${ Nitro.instance.getConfiguration<string>('badge.asset.grouparts.url') }/${ thread.participant.figure }.gif`} }
                                                    isGroup={ true } badgeCode={ '' }/> }
                                        </Flex>
                                    </Flex>
                                </LayoutMessengerGrid>
                            );
                        }) }
                    </div>
                </Column>
                <Column size={ 8 } overflow="auto" className="w-100 nitro-messenger-messages">
                    { activeThread &&
                        <>
                            <Flex alignItems="center" justifyContent="between" gap={ 1 }>
                                <Flex gap={ 1 }>
                                    <ButtonGroup className="gap-1">
                                        <div className="btn btn-sm btn-primary" onClick={ followFriend }>
                                            <div className={'follow'}></div>
                                        </div>
                                        <button className="btn btn-sm btn-primary profile" onClick={ openProfile }/>
                                    </ButtonGroup>
                                    <button className="messenger-button fw-bold px-3"
                                            onClick={ () => report(ReportType.IM, {reportedUserId: activeThread.participant.id}) }>
                                        { LocalizeText('messenger.window.button.report') }
                                    </button>
                                </Flex>
                                <button className="close-messenger"
                                        onClick={ event => closeThread(activeThread.threadId) }/>
                            </Flex>
                            <Column fit className="chat-messages">
                                <Column innerRef={ messagesBox } gap={ 0 } overflow="auto">
                                    <FriendsMessengerThreadView thread={ activeThread }/>
                                </Column>
                            </Column>
                        </> }
                </Column>

            </NitroCardFriendContentView>
            { activeThread &&
                <Flex gap={ 1 } className={ 'px-1 py-2' }>
                    <textarea
                        className="chat-input-form w-100" maxLength={ 255 }
                        placeholder={ LocalizeText('messenger.window.input.default', [ 'FRIEND_NAME' ], [ activeThread.participant.name ]) }
                        onChange={ event => setMessageText(event.target.value) }
                        value={ messageText }
                        onKeyDown={ onKeyDown }/></Flex>
            }
        </NitroCardView>
    );
}
