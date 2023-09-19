import { RoomDeleteComposer, RoomSettingsSaveErrorEvent, RoomSettingsSaveErrorParser } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import {
    CreateLinkEvent,
    DispatchUiEvent,
    GetMaxVisitorsList,
    IRoomData,
    LocalizeText,
    SendMessageComposer
} from '../../../../api';
import {Base, Button, Column, Flex, LayoutRoomThumbnailView, Text} from '../../../../common';
import { useMessageEvent, useNavigator, useNotification } from '../../../../hooks';
import { RoomWidgetThumbnailEvent } from '../../../../events';

const ROOM_NAME_MIN_LENGTH = 3;
const ROOM_NAME_MAX_LENGTH = 60;
const DESC_MAX_LENGTH = 255;
const TAGS_MAX_LENGTH = 15;

interface NavigatorRoomSettingsTabViewProps
{
    roomData: IRoomData;
    handleChange: (field: string, value: string | number | boolean | string[]) => void;
    onClose: () => void;
}

export const NavigatorRoomSettingsBasicTabView: FC<NavigatorRoomSettingsTabViewProps> = props =>
{
    const { roomData = null, handleChange = null, onClose = null } = props;
    const [ roomName, setRoomName ] = useState<string>('');
    const [ roomDescription, setRoomDescription ] = useState<string>('');
    const [ roomTag1, setRoomTag1 ] = useState<string>('');
    const [ roomTag2, setRoomTag2 ] = useState<string>('');
    const [ tagIndex, setTagIndex ] = useState(0);
    const [ typeError, setTypeError ] = useState<string>('');
    const { showConfirm = null } = useNotification();
    const { categories = null, navigatorData = null } = useNavigator();

    useMessageEvent<RoomSettingsSaveErrorEvent>(RoomSettingsSaveErrorEvent, event =>
    {
        const parser = event.getParser();

        if (!parser) return;

        switch (parser.code)
        {
            case RoomSettingsSaveErrorParser.ERROR_INVALID_TAG:
                setTypeError('navigator.roomsettings.unacceptablewords');
            case RoomSettingsSaveErrorParser.ERROR_NON_USER_CHOOSABLE_TAG:
                setTypeError('navigator.roomsettings.nonuserchoosabletag');
                break;
            default:
                setTypeError('');
                break;
        }
    });

    const deleteRoom = () =>
    {
        showConfirm(LocalizeText('navigator.roomsettings.deleteroom.confirm.message', [ 'room_name' ], [ roomData.roomName ]), () =>
        {
            SendMessageComposer(new RoomDeleteComposer(roomData.roomId));

            if (onClose) onClose();

            CreateLinkEvent('navigator/search/myworld_view');
        },
        null, null, null, LocalizeText('navigator.roomsettings.deleteroom.confirm.title'));
    }

    const saveRoomName = () =>
    {
        if ((roomName === roomData.roomName) || (roomName.length < ROOM_NAME_MIN_LENGTH) || (roomName.length > ROOM_NAME_MAX_LENGTH)) return;

        handleChange('name', roomName);
    }

    const saveRoomDescription = () =>
    {
        if ((roomDescription === roomData.roomDescription) || (roomDescription.length > DESC_MAX_LENGTH)) return;

        handleChange('description', roomDescription);
    }

    const saveTags = (index: number) =>
    {
        if (index === 0 && (roomTag1 === roomData.tags[0]) || (roomTag1.length > TAGS_MAX_LENGTH)) return;

        if (index === 1 && (roomTag2 === roomData.tags[1]) || (roomTag2.length > TAGS_MAX_LENGTH)) return;

        if (roomTag1 === '' && roomTag2 !== '') setRoomTag2('');

        setTypeError('');
        setTagIndex(index);
        handleChange('tags', (roomTag1 === '' && roomTag2 !== '') ? [ roomTag2 ] : [ roomTag1, roomTag2 ]);
    }

    const openCamera = () =>
    {
        DispatchUiEvent(new RoomWidgetThumbnailEvent(RoomWidgetThumbnailEvent.TOGGLE_THUMBNAIL));
    };

    useEffect(() =>
    {
        setRoomName(roomData.roomName);
        setRoomDescription(roomData.roomDescription);
        setRoomTag1((roomData.tags.length > 0 && roomData.tags[0]) ? roomData.tags[0] : '');
        setRoomTag2((roomData.tags.length > 0 && roomData.tags[1]) ? roomData.tags[1] : '');
    }, [ roomData ]);

    return (
        <>
            <div className={ 'p-2' }>
                <LayoutRoomThumbnailView roomId={ roomData.roomId } customUrl={ navigatorData.enteredGuestRoom.officialRoomPicRef } >
                    <i className="icon icon-camera-small position-absolute b-0 r-0 m-1 cursor-pointer top-0"
                        onClick={ () => openCamera() }/>

                </LayoutRoomThumbnailView>


                <Text fullWidth variant={ 'white' }
                    className={ 'text-volter-bold' }>{ LocalizeText('navigator.roomname') }</Text>

                <Column fullWidth gap={ 0 } className={ 'mb-1' }>
                    <input className="form-control room-info-input" value={ roomName }
                        maxLength={ ROOM_NAME_MAX_LENGTH } onChange={ event => setRoomName(event.target.value) }
                        onBlur={ saveRoomName }/>
                    { (roomName.length < ROOM_NAME_MIN_LENGTH) &&
                        <Text bold small >
                            { LocalizeText('navigator.roomsettings.roomnameismandatory') }
                        </Text> }
                </Column>

                <Text fullWidth variant={ 'white' }
                    className={ 'text-volter-bold' }>{ LocalizeText('navigator.roomsettings.desc') }</Text>
                <textarea className="form-control room-info-input mb-1" value={ roomDescription }
                    maxLength={ DESC_MAX_LENGTH } onChange={ event => setRoomDescription(event.target.value) }
                    onBlur={ saveRoomDescription }/>

                <Text fullWidth variant={ 'white' }
                    className={ 'text-volter-bold' }>{ LocalizeText('navigator.category') }</Text>
                <select className="form-select room-info-input mb-1" value={ roomData.categoryId }
                    onChange={ event => handleChange('category', event.target.value) }>
                    { categories && categories.map(category => <option key={ category.id }
                        value={ category.id }>{ LocalizeText(category.name) }</option>) }
                </select>

                <Text fullWidth variant={ 'white' }
                    className={ 'text-volter-bold' }>{ LocalizeText('navigator.maxvisitors') }</Text>
                <select className="form-select room-info-input mb-1" value={ roomData.userCount }
                    onChange={ event => handleChange('max_visitors', event.target.value) }>
                    { GetMaxVisitorsList && GetMaxVisitorsList.map(value => <option key={ value }
                        value={ value }>{ value }</option>) }
                </select>
                <Text fullWidth variant={ 'white' }
                    className={ 'text-volter-bold' }>{ LocalizeText('navigator.tradesettings') }</Text>
                <select className="form-select room-info-input mb-1" value={ roomData.tradeState }
                    onChange={ event => handleChange('trade_state', event.target.value) }>
                    <option value="0">{ LocalizeText('navigator.roomsettings.trade_not_allowed') }</option>
                    <option value="1">{ LocalizeText('navigator.roomsettings.trade_not_with_Controller') }</option>
                    <option value="2">{ LocalizeText('navigator.roomsettings.trade_allowed') }</option>
                </select>

                <Text fullWidth variant={ 'white' }
                    className={ 'text-volter-bold' }>{ LocalizeText('navigator.tags') }</Text>

                <Flex alignItems="center" gap={ 1 } className={ 'mb-2' }>
                    <Column fullWidth gap={ 0 }>
                        <input className="form-control room-info-input" value={ roomTag1 }
                            onChange={ event => setRoomTag1(event.target.value) } onBlur={ () => saveTags(0) }/>
                        { (roomTag1.length > TAGS_MAX_LENGTH) &&
                            <Text bold small >
                                { LocalizeText('navigator.roomsettings.toomanycharacters') }
                            </Text> }
                        { (tagIndex === 0 && typeError != '') &&
                            <Text bold small >
                                { LocalizeText(typeError) }
                            </Text> }
                    </Column>
                    <Column fullWidth gap={ 0 }>
                        <input className="form-control room-info-input" value={ roomTag2 }
                            onChange={ event => setRoomTag2(event.target.value) } onBlur={ () => saveTags(1) }/>
                        { (roomTag2.length > TAGS_MAX_LENGTH) &&
                            <Text bold small >
                                { LocalizeText('navigator.roomsettings.toomanycharacters') }
                            </Text> }
                        { (tagIndex === 1 && typeError != '') &&
                            <Text bold small >
                                { LocalizeText(typeError) }
                            </Text> }
                    </Column>
                </Flex>
                <Flex alignItems="center" gap={ 1 } className={ 'mb-3' }>
                    <input className="form-check-input" type="checkbox" checked={ roomData.allowWalkthrough }
                        onChange={ event => handleChange('allow_walkthrough', event.target.checked) }/>
                    <Text variant={ 'white' }>{ LocalizeText('navigator.roomsettings.allow_walk_through') }</Text>
                </Flex>

                <Text variant="white" underline pointer
                    className="d-flex justify-content-center align-items-center gap-1 text-volter-bold"
                    onClick={ deleteRoom }>
                    <FaTimes className="fa-icon"/>
                    { LocalizeText('navigator.roomsettings.delete') }
                </Text>
            </div>
        </>
    );
};
