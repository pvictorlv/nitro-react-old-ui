import { RoomDataParser } from '@nitrots/nitro-renderer';
import { FC, MouseEvent } from 'react';
import { FaUser } from 'react-icons/fa';
import { CreateRoomSession, DoorStateType, GetSessionDataManager, TryVisitRoom } from '../../../../api';
import {
    Column,
    Flex,
    LayoutBadgeImageView,
    LayoutGridItemProps,
    LayoutRoomThumbnailView,
    Text
} from '../../../../common';
import { useNavigator } from '../../../../hooks';
import { NavigatorSearchResultItemInfoView } from './NavigatorSearchResultItemInfoView';

export interface NavigatorSearchResultItemViewProps extends LayoutGridItemProps
{
    roomData: RoomDataParser
    thumbnail?: boolean
}

export const NavigatorSearchResultItemView: FC<NavigatorSearchResultItemViewProps> = props =>
{
    const { roomData = null, children = null, thumbnail = false, ...rest } = props;
    const { setDoorData = null, navigatorData = null } = useNavigator();
    const getUserCounterColor = () =>
    {
        const num: number = (100 * (roomData.userCount / roomData.maxUserCount));

        let bg = 'room-bg-primary';

        if (num >= 95)
        {
            bg = 'room-bg-full';
        }
        else if (num >= 25)
        {
            bg = 'room-bg-warning';
        }
        else if (num >= 50)
        {
            bg = 'room-bg-danger';
        }
        else if (num > 0)
        {
            bg = 'room-bg-success';
        }

        return bg;
    }

    const visitRoom = (event: MouseEvent) =>
    {
        if (roomData.ownerId !== GetSessionDataManager().userId)
        {
            if (roomData.habboGroupId !== 0)
            {
                TryVisitRoom(roomData.roomId);

                return;
            }

            switch (roomData.doorMode)
            {
                case RoomDataParser.DOORBELL_STATE:
                    setDoorData(prevValue =>
                    {
                        const newValue = { ...prevValue };

                        newValue.roomInfo = roomData;
                        newValue.state = DoorStateType.START_DOORBELL;

                        return newValue;
                    });
                    return;
                case RoomDataParser.PASSWORD_STATE:
                    setDoorData(prevValue =>
                    {
                        const newValue = { ...prevValue };

                        newValue.roomInfo = roomData;
                        newValue.state = DoorStateType.START_PASSWORD;

                        return newValue;
                    });
                    return;
            }
        }

        CreateRoomSession(roomData.roomId);
    }

    if (thumbnail) return (
        <Column pointer overflow="hidden" alignItems="center" onClick={ visitRoom } gap={ 0 }
            className="navigator-item p-1 bg-light rounded-3 mb-1 flex-column border border-muted" { ...rest }>
            <LayoutRoomThumbnailView roomId={ roomData.roomId } customUrl={ roomData.officialRoomPicRef }
                className="d-flex flex-column align-items-center justify-content-end mb-1">
                { roomData.habboGroupId > 0 &&
                    <LayoutBadgeImageView badgeCode={ roomData.groupBadgeCode } isGroup={ true }
                        className={ 'position-absolute top-0 start-0 m-1' }/> }
                <Flex center className={ 'position-absolute m-1 text-volter user-count-badge ' + getUserCounterColor() } gap={ 1 }>
                    { roomData.userCount }
                </Flex>
                { (roomData.doorMode !== RoomDataParser.OPEN_STATE) &&
                    <i className={ ('position-absolute end-0 mb-1 me-1 icon icon-navigator-room-' + ((roomData.doorMode === RoomDataParser.DOORBELL_STATE) ? 'locked' : (roomData.doorMode === RoomDataParser.PASSWORD_STATE) ? 'password' : (roomData.doorMode === RoomDataParser.INVISIBLE_STATE) ? 'invisible' : '')) }/> }
            </LayoutRoomThumbnailView>
            <Flex className="w-100">
                <Text truncate className="flex-grow-1 text-crisp">{ roomData.roomName }</Text>
                <Flex reverse alignItems="center" gap={ 1 }>
                    <NavigatorSearchResultItemInfoView roomData={ roomData }/>
                </Flex>
                { children }
            </Flex>

        </Column>
    );

    return (
        <Flex pointer overflow="hidden" alignItems="center" onClick={ visitRoom } gap={ 2 }
            className="navigator-item px-2 py-1 small" { ...rest }>

            <Text truncate grow className={ 'text-volter text-crisp' }>{ roomData.roomName }</Text>

            <Flex reverse alignItems="center" gap={ 1 }>
                <NavigatorSearchResultItemInfoView roomData={ roomData }/>
                { roomData.habboGroupId > 0 && <i className="icon icon-navigator-room-group"/> }
                { navigatorData.homeRoomId === roomData.roomId && <i className="icon icon-navigator-room-home"/> }
                { (roomData.doorMode !== RoomDataParser.OPEN_STATE) &&
                    <i className={ ('icon icon-navigator-room-' + ((roomData.doorMode === RoomDataParser.DOORBELL_STATE) ? 'locked' : (roomData.doorMode === RoomDataParser.PASSWORD_STATE) ? 'password' : (roomData.doorMode === RoomDataParser.INVISIBLE_STATE) ? 'invisible' : '')) }/> }
            </Flex>
            <Flex center className={ 'user-count-badge text-volter ' + getUserCounterColor() } gap={ 1 }>
                { roomData.userCount }
            </Flex>
            { children }
        </Flex>
    );
}
