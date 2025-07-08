import {FC, useEffect, useState} from 'react';
import {
  AchievementUtilities, attemptPetPlacement, GetRoomEngine, GetSessionDataManager,
  LocalizeBadgeDescription,
  LocalizeBadgeName,
  LocalizeText,
  UnseenItemCategory
} from '../../../../api';
import {
  AutoGrid,
  Button,
  Column,
  Flex,
  Grid,
  LayoutBadgeImageView,
  LayoutCurrencyIcon,
  LayoutProgressBar, LayoutRoomPreviewerView,
  Text
} from '../../../../common';
import {AchievementBadgeView} from '../../../achievements/views';
import {Row} from 'react-bootstrap';
import {useInventoryEffects} from '../../../../hooks';
import {InventoryBadgeItemView} from '../badge/InventoryBadgeItemView';
import {InventoryEffectItemView} from './InventoryEffectItemView';
import {AvatarEffect, IRoomSession, RoomObjectVariable, RoomPreviewer} from '@nitrots/nitro-renderer';

interface InventoryEffectViewProps
{
  roomSession: IRoomSession;
  roomPreviewer: RoomPreviewer;
}


export const InventoryEffectView: FC<InventoryEffectViewProps> = props =>
{
  const {roomSession = null, roomPreviewer = null} = props;

  const [ isVisible, setIsVisible ] = useState(false);
  const {
    effectsData = null,
    effectCodes = [],
    effectQuantity,
    activeEffectCode,
    selectedEffectCode = null,
    isWearingEffect = null,
    toggleEffect = null,
    activate = null,
    deactivate = null
  } = useInventoryEffects();


  useEffect(() =>
  {
    if (!selectedEffectCode || !roomPreviewer) return;

    const roomEngine = GetRoomEngine();

    let wallType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_WALL_TYPE);
    let floorType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_FLOOR_TYPE);
    let landscapeType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_LANDSCAPE_TYPE);

    wallType = (wallType && wallType.length) ? wallType : '101';
    floorType = (floorType && floorType.length) ? floorType : '101';
    landscapeType = (landscapeType && landscapeType.length) ? landscapeType : '1.1';

    roomPreviewer.reset(false);
    roomPreviewer.updateRoomWallsAndFloorVisibility(true, true);
    roomPreviewer.updateObjectRoom(floorType, wallType, landscapeType);
    roomPreviewer.addAvatarIntoRoom(GetSessionDataManager().figure, selectedEffectCode);

  }, [ roomPreviewer, selectedEffectCode ]);


  useEffect(() =>
  {
    if (!isVisible) return;

    const id = activate();

    return () => deactivate(id);
  }, [ isVisible, activate, deactivate ]);

  useEffect(() =>
  {
    setIsVisible(true);

    return () => setIsVisible(false);
  }, []);


  return (
    <Grid gap={ 2 } className={ 'inventory-badge' }>
      <Column size={ 7 } overflow="hidden">
        <Text className={ 'text-volter-bold text-center' }>{ LocalizeText('avatareditor.category.effects') }</Text>
        <AutoGrid columnCount={ 4 } className={ 'inventory-badge-list' } gap={ 1 }>
          { effectCodes?.length > 0 && effectCodes.map((effectCode, index) =>
          {
            return (<>
              <InventoryEffectItemView key={ index } effectCode={ effectCode }/>
            </>)
          }) }
        </AutoGrid>
      </Column>
      <Column className="justify-content-between" size={ 5 } overflow="auto">
        <Column overflow="hidden" gap={ 2 }>
          <Text
            className={ 'text-volter-bold text-center' }>{ LocalizeText('inventory.badges.activebadges') }</Text>
          <Column overflow="hidden" position="relative">
            <LayoutRoomPreviewerView roomPreviewer={ roomPreviewer } height={ 140 }/>
          </Column>
          { selectedEffectCode &&
            <Column grow justifyContent="between" gap={ 2 }>
              <Column gap={ 1 }>

                { isWearingEffect(selectedEffectCode) ? (
                  <>
                    <Text className={'text-volter text-center'}>{ LocalizeText('inventory.effects.active', [ 'timeleft', 'duration', 'itemcount' ], [ effectsData?.get(selectedEffectCode).secondsLeftIfActive.toString(), effectsData?.get(selectedEffectCode).duration.toString(),
                      effectQuantity?.get(selectedEffectCode).toString() ]) }</Text>
                    <LayoutProgressBar
                      className={ 'w-100' }
                      progress={ effectsData?.get(selectedEffectCode).secondsLeftIfActive }
                      maxProgress={ effectsData?.get(selectedEffectCode).duration }
                      text={ '' }/>
                  </>
                ) : (
                  <>
                    <Text className={'text-volter text-center'}>{ LocalizeText('inventory.effects.inactive', [ 'duration', 'itemcount' ], [ effectsData?.get(selectedEffectCode).secondsLeftIfActive.toString(),
                      effectQuantity?.get(selectedEffectCode).toString() ]) }</Text>
                    <LayoutProgressBar
                      className={ 'w-100' }
                      progress={ effectsData?.get(selectedEffectCode).secondsLeftIfActive }
                      maxProgress={ effectsData?.get(selectedEffectCode).duration }
                      text={ '' }/>
                  </>
                ) }


                { !!roomSession && (

                  <Button onClick={ event => toggleEffect(selectedEffectCode) }>
                    { LocalizeText('widget.dimmer.button.apply') }
                  </Button>) }
              </Column>

            </Column> }
        </Column>

      </Column>
      {/*{ !!selectedEffectCode &&*/ }
      {/*  <Column size={ 12 } className={ 'inventory-badge-data' }>*/ }
      {/*    <Grid alignItems={ 'center' } className={ 'p-1' }>*/ }
      {/*      <Column size={ 1 }>*/ }
      {/*        <LayoutBadgeImageView shrink badgeCode={ selectedBadgeCode }/>*/ }
      {/*      </Column>*/ }
      {/*      <Column size={ 8 }>*/ }
      {/*        <div className={ 'd-inline' }>*/ }
      {/*          <Text className={ 'text-volter-bold d-block w-80' }>*/ }
      {/*            { LocalizeBadgeName(selectedBadgeCode) }*/ }
      {/*          </Text>*/ }
      {/*          <Text*/ }
      {/*            className={ 'text-volter d-inline' }>{ LocalizeBadgeDescription(selectedBadgeCode) }</Text>*/ }
      {/*        </div>*/ }
      {/*      </Column>*/ }
      {/*      <Column size={ 3 }>*/ }
      {/*        <Button variant={ 'primary' }*/ }
      {/*                disabled={ !isWearingBadge(selectedBadgeCode) && !canWearBadges() }*/ }
      {/*                onClick={ event => toggleBadge(selectedBadgeCode) }>{ LocalizeText(isWearingBadge(selectedBadgeCode) ? 'inventory.badges.clearbadge' : 'inventory.badges.wearbadge') }</Button>*/ }
      {/*      </Column>*/ }
      {/*    </Grid>*/ }
      {/*  </Column> }*/ }

    </Grid>
  );
}
