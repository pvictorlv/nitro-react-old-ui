import {FC, useMemo} from 'react';
import {
    GetGroupChatData, GetRoomEngine,
    GetSessionDataManager,
    LocalizeText,
    MessengerGroupType,
    MessengerThread,
    MessengerThreadChat,
    MessengerThreadChatGroup
} from '../../../../../api';
import {Base, Flex, LayoutAvatarImageView} from '../../../../../common';
import {RoomObjectCategory} from '@nitrots/nitro-renderer';

export const FriendsMessengerThreadGroup: FC<{ thread: MessengerThread, group: MessengerThreadChatGroup }> = props =>
{
    const {thread = null, group = null} = props;

    const groupChatData = useMemo(() => ((group.type === MessengerGroupType.GROUP_CHAT) && GetGroupChatData(group.chats[0].extraData)), [ group ]);

    const isOwnChat = useMemo(() =>
    {
        if (!thread || !group) return false;

        if ((group.type === MessengerGroupType.PRIVATE_CHAT) && (group.userId === GetSessionDataManager().userId)) return true;

        if (groupChatData && group.chats.length && (groupChatData.userId === GetSessionDataManager().userId)) return true;

        return false;
    }, [ thread, group, groupChatData ]);

    if (!thread || !group) return null;

    if (!group.userId)
    {
        return (
            <>
                { group.chats.map((chat, index) =>
                {
                    return (
                        <Flex key={ index } fullWidth gap={ 2 } justifyContent="start">
                            <Base className="w-100 text-break">
                                { (chat.type === MessengerThreadChat.SECURITY_NOTIFICATION) &&
                                    <Flex gap={ 2 } alignItems="center"
                                          className="bg-light px-2 py-1 small text-muted">
                                        <Base className="nitro-friends-spritesheet icon-warning flex-shrink-0"/>
                                        <Base>{ chat.message }</Base>
                                    </Flex> }
                                { (chat.type === MessengerThreadChat.ROOM_INVITE) &&
                                    <Flex gap={ 2 } alignItems="center"
                                          className="bg-light px-2 py-1 small text-black">
                                        <Base className="messenger-notification-icon flex-shrink-0"/>
                                        <Base>{ (LocalizeText('messenger.invitation') + ' ') }{ chat.message }</Base>
                                    </Flex> }
                            </Base>
                        </Flex>
                    );
                }) }
            </>
        );
    }

    return (
        <Flex fullWidth justifyContent={ 'start' } gap={ 2 }>
            <Base
                className={ 'text-black  messages-group-' + (isOwnChat ? 'right' : 'left') }>

                { group.chats.map((chat, index) =>
                {
                    return (<Base key={ index }
                                  className="text-break chat-message">
                        { chat.date.getHours() }:{ chat.date.getMinutes() }: { chat.message }  </Base>);
                }) }
            </Base>

        </Flex>
    );
}
