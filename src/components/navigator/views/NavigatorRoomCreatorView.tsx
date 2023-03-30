/* eslint-disable no-template-curly-in-string */
import {CreateFlatMessageComposer, HabboClubLevelEnum} from '@nitrots/nitro-renderer';
import {FC, useEffect, useState} from 'react';
import {
    CreateLinkEvent,
    FigureData,
    GetClubMemberLevel,
    GetConfiguration,
    IRoomModel,
    LocalizeText,
    SendMessageComposer
} from '../../../api';
import {
    AutoGrid, Button, Column, Flex, Grid, LayoutCurrencyIcon,
    LayoutGridItem, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text
} from '../../../common';
import {useNavigator} from '../../../hooks';
import {RoomCreatorGridItem} from '../../../common/layout/RoomCreatorGridItem';


export interface NavigatorRoomCreatorViewProps
{
    closeFunction: Function;

}

export const NavigatorRoomCreatorView: FC<NavigatorRoomCreatorViewProps> = props =>
{
    const [ maxVisitorsList, setMaxVisitorsList ] = useState<number[]>(null);
    const [ name, setName ] = useState<string>(null);
    const [ description, setDescription ] = useState<string>(null);
    const [ category, setCategory ] = useState<number>(null);
    const [ visitorsCount, setVisitorsCount ] = useState<number>(null);
    const [ tradesSetting, setTradesSetting ] = useState<number>(0);
    const [ roomModels, setRoomModels ] = useState<IRoomModel[]>([]);
    const [ selectedModelName, setSelectedModelName ] = useState<string>('');
    const {categories = null} = useNavigator();

    const hcDisabled = GetConfiguration<boolean>('hc.disabled', false);

    const getRoomModelImage = (name: string) => GetConfiguration<string>('images.url') + `/navigator/models/model_${ name }.png`;

    const selectModel = (model: IRoomModel, index: number) =>
    {
        if (!model || (model.clubLevel > GetClubMemberLevel())) return;

        setSelectedModelName(roomModels[index].name);
    };

    const createRoom = () =>
    {
        SendMessageComposer(new CreateFlatMessageComposer(name, description, 'model_' + selectedModelName, Number(category), Number(visitorsCount), tradesSetting));
    };

    useEffect(() =>
    {
        if (!maxVisitorsList)
        {
            const list = [];

            for (let i = 10; i <= 100; i = i + 10) list.push(i);

            setMaxVisitorsList(list);
            setVisitorsCount(list[0]);
        }
    }, [ maxVisitorsList ]);

    useEffect(() =>
    {
        if (categories && categories.length) setCategory(categories[0].id);
    }, [ categories ]);

    useEffect(() =>
    {
        const models = GetConfiguration<IRoomModel[]>('navigator.room.models');

        if (models && models.length)
        {
            setRoomModels(models);
            setSelectedModelName(models[0].name);
        }
    }, []);

    return (
        <NitroCardView className="nitro-room-creator" theme="primary">
            <NitroCardHeaderView headerText={ LocalizeText('navigator.createroom.title') }
                                 onCloseClick={ event => props.closeFunction() }/>
            <NitroCardContentView>
                <Column overflow="hidden">
                    <Grid overflow="hidden">
                        <Column size={ 12 } gap={ 1 } overflow="auto">
                            <AutoGrid className="room-creator-grid" columnCount={ 12 } columnMinWidth={ 137 }
                                      columnMinHeight={ 50 } overflow="unset">
                                {
                                    roomModels.map((model, index) =>
                                    {
                                        return (<RoomCreatorGridItem fullHeight key={ model.name }
                                                                     onClick={ () => selectModel(model, index) }
                                                                     itemActive={ (selectedModelName === model.name) }
                                                                     overflow="unset" gap={ 0 } className="py-3"
                                                                     disabled={ (GetClubMemberLevel() < model.clubLevel) }>
                                            <Flex fullHeight center overflow="hidden">
                                                <img alt="" src={ getRoomModelImage(model.name) }/>
                                            </Flex>

                                            <Text position="absolute"
                                                  className="bottom-1"><i className={ 'icon icon-tiles ' }/> { model.tileSize } { LocalizeText('navigator.createroom.tilesize') }</Text>
                                            { !hcDisabled && model.clubLevel > HabboClubLevelEnum.NO_CLUB &&
                                                <LayoutCurrencyIcon position="absolute" className="top-1 end-1"
                                                                    type="hc"/> }
                                            { selectedModelName && <i className="active-arrow"/> }
                                        </RoomCreatorGridItem>);
                                    })
                                }
                            </AutoGrid>
                        </Column>
                        <Column size={ 12 } gap={ 1 } overflow="auto" className="px-2 py-1">
                            <Column gap={ 1 }>
                                <Text
                                    className={ 'text-volter-bold' }>{ LocalizeText('navigator.createroom.roomnameinfo') }</Text>
                                <input type="text" className="room-creator-form" minLength={ 1 } maxLength={ 60 }
                                       onChange={ event => setName(event.target.value) }
                                       placeholder={ LocalizeText('navigator.createroom.roomnameinfo') }/>

                            </Column>


                            <Flex gap={ 2 }>
                                <Button fullWidth className="volter-bold-button" onClick={ createRoom }
                                        disabled={ (!name || (name.length < 3)) }>{ LocalizeText('navigator.createroom.create') }</Button>
                                <Button fullWidth className="volter-button"
                                        onClick={ event => props.closeFunction() }>{ LocalizeText('cancel') }</Button>
                            </Flex>
                        </Column>

                    </Grid>
                </Column>

            </NitroCardContentView>
        </NitroCardView>
    );
}
