import {RoomObjectCategory} from '@nitrots/nitro-renderer';
import {FC} from 'react';
import {FaTimes} from 'react-icons/fa';
import {LocalizeText, MessengerRequest} from '../../../../api';
import {Base, Button, Column, Flex, Text} from '../../../../common';
import {ObjectLocationView} from '../object-location/ObjectLocationView';

export const FriendRequestDialogView: FC<{
    roomIndex: number,
    request: MessengerRequest,
    hideFriendRequest: (userId: number) => void,
    requestResponse: (requestId: number, flag: boolean) => void
}> = props =>
{
    const {roomIndex = -1, request = null, hideFriendRequest = null, requestResponse = null} = props;

    return (
        <ObjectLocationView objectId={ roomIndex } category={ RoomObjectCategory.UNIT }>
            <Base className="nitro-friend-request-dialog nitro-context-menu p-2">
                <Column>
                    <Flex alignItems="center" justifyContent="between" gap={ 2 } className={'pb-1'}>
                        <Text variant="black"
                              fontSize={ 6 }>{ LocalizeText('widget.friendrequest.from', [ 'username' ], [ request.name ]) }</Text>
                        <FaTimes className="cursor-pointer fa-icon times-border-black"
                                 onClick={ event => hideFriendRequest(request.requesterUserId) }/>
                    </Flex>
                    <Flex justifyContent="end" gap={ 1 }>
                        <Button className={ 'flex-grow-1' }
                                onClick={ event => requestResponse(request.requesterUserId, false) }>{ LocalizeText('widget.friendrequest.decline') }</Button>
                        <Button className={ 'flex-grow-1' }
                                onClick={ event => requestResponse(request.requesterUserId, true) }>{ LocalizeText('widget.friendrequest.accept') }</Button>
                    </Flex>
                </Column>
            </Base>
        </ObjectLocationView>
    );
}
