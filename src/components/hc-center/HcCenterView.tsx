import { ClubGiftInfoEvent, FriendlyTime, GetClubGiftInfo, ILinkEventTracker, ScrGetKickbackInfoMessageComposer, ScrKickbackData, ScrSendKickbackInfoMessageEvent } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AddEventLinkTracker, ClubStatus, CreateLinkEvent, GetClubBadge, GetConfiguration, LocalizeText, RemoveLinkEventTracker, SendMessageComposer } from '../../api';
import { Base, Button, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../common';
import { useInventoryBadges, useMessageEvent, usePurse, useSessionInfo } from '../../hooks';


export const HcCenterView: FC<{}> = props =>
{
  const [ isVisible, setIsVisible ] = useState(false);
  const [ kickbackData, setKickbackData ] = useState<ScrKickbackData>(null);
  const [ unclaimedGifts, setUnclaimedGifts ] = useState(0);
  const [ badgeCode, setBadgeCode ] = useState(null);
  const { userFigure = null } = useSessionInfo();
  const { purse = null, clubStatus = null } = usePurse();
  const { badgeCodes = [], activate = null, deactivate = null } = useInventoryBadges();
  const getHcPaydayTime = () => (!kickbackData || kickbackData.timeUntilPayday < 60) ? LocalizeText('hccenter.special.time.soon') : FriendlyTime.shortFormat(kickbackData.timeUntilPayday * 60);
  const getHcPaydayAmount = () => LocalizeText('hccenter.special.sum', [ 'credits' ], [ (kickbackData?.creditRewardForStreakBonus + kickbackData?.creditRewardForMonthlySpent).toString() ]);
  const elapsedMonths = () => Math.ceil(kickbackData?.currentHcStreak / 31).toString();
  const prepaidMonths = () => Math.ceil(((purse.clubPeriods * 31) + purse.clubDays) / 31).toString();
  const prepaidDays = () =>
  {
    if (purse.minutesUntilExpiration > -1)
    {
      return (purse.minutesUntilExpiration / (60*24));
    }
  }
  const arrowLeft = Math.min(prepaidDays() * 5, 150);

  useMessageEvent<ClubGiftInfoEvent>(ClubGiftInfoEvent, event =>
  {
    const parser = event.getParser();

    setUnclaimedGifts(parser.giftsAvailable);
  });

  useMessageEvent<ScrSendKickbackInfoMessageEvent>(ScrSendKickbackInfoMessageEvent, event =>
  {
    const parser = event.getParser();

    setKickbackData(parser.data);
  });

  useEffect(() =>
  {
    const linkTracker: ILinkEventTracker = {
      linkReceived: (url: string) =>
      {
        const parts = url.split('/');

        if(parts.length < 2) return;

        switch(parts[1])
        {
          case 'open':
            if(parts.length > 2)
            {
              switch(parts[2])
              {
                case 'hccenter':
                  setIsVisible(true);
                  break;
              }
            }
            return;
        }
      },
      eventUrlPrefix: 'habboUI/'
    };

    AddEventLinkTracker(linkTracker);

    return () => RemoveLinkEventTracker(linkTracker);
  }, []);

  useEffect(() =>
  {
    setBadgeCode(GetClubBadge(badgeCodes));
  }, [ badgeCodes ]);

  useEffect(() =>
  {
    if(!isVisible) return;

    const id = activate();

    return () => deactivate(id);
  }, [ isVisible, activate, deactivate ]);

  useEffect(() =>
  {
    SendMessageComposer(new GetClubGiftInfo());
    SendMessageComposer(new ScrGetKickbackInfoMessageComposer());
  }, []);

  if(!isVisible) return null;

  const popover = (
    <Popover id="popover-basic" className="ms-3">
      <Popover.Body className="text-black py-2 px-3">
        <h5>{ LocalizeText('hccenter.breakdown.title') }</h5>
        <div>{ LocalizeText('hccenter.breakdown.creditsspent', [ 'credits' ], [ kickbackData?.totalCreditsSpent.toString() ]) }</div>
        <div>{ LocalizeText('hccenter.breakdown.paydayfactor.percent', [ 'percent' ], [ (kickbackData?.kickbackPercentage * 100).toString() ]) }</div>
        <div>{ LocalizeText('hccenter.breakdown.streakbonus', [ 'credits' ], [ kickbackData?.creditRewardForStreakBonus.toString() ]) }</div>
        <hr className="w-100 text-black my-1" />
        <div>{ LocalizeText('hccenter.breakdown.total', [ 'credits', 'actual' ], [ getHcPaydayAmount(), ((((kickbackData?.kickbackPercentage * kickbackData?.totalCreditsSpent) + kickbackData?.creditRewardForStreakBonus) * 100) / 100).toString() ]) }</div>
        <div className="text-primary p-0 text-end cursor-pointer" onClick={ () => CreateLinkEvent('habbopages/' + GetConfiguration('hc.center')['payday.habbopage']) }>
          { LocalizeText('hccenter.special.infolink') }
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <NitroCardView theme="primary" className="nitro-hc-center">
      <NitroCardHeaderView headerText={ LocalizeText('generic.hccenter') } onCloseClick={ () => setIsVisible(false) } />
      <NitroCardContentView>
        <Flex gap={2}>
          <Base className="piccolo-img" />
          <Column size={8} gap={1}>
            <Text bold>{LocalizeText((clubStatus === ClubStatus.ACTIVE) ? 'hccenter.about.active' : 'hccenter.about.inactive')}</Text>
            <Text>{LocalizeText('hccenter.about')}</Text>
          </Column>
        </Flex>
        {GetConfiguration('hc.center')['payday.info'] &&
          <Flex alignItems="center">
            <Column gap={0} className="p-2 payday-special mb-1 ml-1">
              <Text variant="white" bold>{LocalizeText('hccenter.special.title')}</Text>
              <Text variant="white" small>{LocalizeText('hccenter.special.info')}</Text>
              <Text variant="white" small underline className="pt-1 cursor-pointer" onClick={() => CreateLinkEvent('habbopages/' + GetConfiguration('hc.center')['payday.habbopage'])}>{LocalizeText('hccenter.special.infolink')}</Text>

            </Column>
            <Column gap={0} className="payday flex-shrink-0 p-2">
              <Text bold className="ms-2">{LocalizeText('hccenter.special.time.title')}</Text>
              <Flex>
                <i className="clock me-2" />
                <Text className="align-self-center">{getHcPaydayTime()}</Text>
              </Flex>
              {clubStatus === ClubStatus.ACTIVE &&
                <Column gap={1} className="pe-3 pt-3">
                  <Text bold className="ms-2">{LocalizeText('hccenter.special.amount.title')}</Text>
                  <Flex>
                    <Text className="w-100 text-center ms-4n">{getHcPaydayAmount()}</Text>
                    <OverlayTrigger trigger={['click']} placement="right" overlay={popover}>
                                            <span onClick={() => popover} className="pt-4">
                                                <Text underline small variant="primary">
                                                    {LocalizeText('hccenter.breakdown.infolink')}
                                                </Text>
                                            </span>
                    </OverlayTrigger>
                  </Flex>
                </Column>}
            </Column>
          </Flex>}
        {GetConfiguration('hc.center')['gift.info'] &&
          <Flex className="hc-gift-special p-2">
            <Column gap={1}>
              <Text variant="white" bold>{LocalizeText('hccenter.gift.title')}</Text>
              <Text variant="white" dangerouslySetInnerHTML={{ __html: unclaimedGifts > 0 ? LocalizeText('hccenter.unclaimedgifts', ['unclaimedgifts'], [unclaimedGifts.toString()]) : LocalizeText('hccenter.gift.info') }}></Text>
            </Column>
            <Button className="btn-lg align-self-center ms-auto" onClick={() => CreateLinkEvent('catalog/open/' + GetConfiguration('catalog.links')['hc.hc_gifts'])}>
              {LocalizeText(clubStatus === ClubStatus.ACTIVE ? 'hccenter.btn.gifts.redeem' : 'hccenter.btn.gifts.view')}
            </Button>
          </Flex>}
        {GetConfiguration('hc.center')['benefits.info'] &&
          <Column className="benefits py-2">
            <Text bold variant="primary">{LocalizeText('hccenter.general.title')}</Text>
            <Text small dangerouslySetInnerHTML={{ __html: LocalizeText('hccenter.general.info') }} />
            <Text small underline className="cursor-pointer" variant="primary" onClick={() => CreateLinkEvent('habbopages/' + GetConfiguration('hc.center')['benefits.habbopage'])}>
              {LocalizeText('hccenter.general.infolink')}
            </Text>
          </Column>}
        <Flex gap={ 2 } className="timeline">
          <Column size={12} className="streak-info" justifyContent="center" alignItems="center" gap={0}>
            <Column className="arrow-container">
              <div className="arrow" style={ { marginLeft: `${arrowLeft}px` } }></div>
            </Column>
            <Flex className="timeline-track" justifyContent="center" alignItems="center">
              <Flex justifyContent="between" className="time-container">
                <Flex justifyContent="center" alignItems="center" className="elapsed-time">{elapsedMonths() }</Flex>
                <Flex justifyContent="center" alignItems="center" className="prepaid-time">{prepaidMonths() }</Flex>
              </Flex>
            </Flex>
            <Flex justifyContent="center" alignItems="center">
              <Text underline className="info-text" onClick={ event => CreateLinkEvent('catalog/open/' + GetConfiguration('catalog.links')['hc.buy_hc']) } >{ LocalizeText('hccenter.timeline.link') }</Text>
            </Flex>
          </Column>
        </Flex>
        <Flex gap={2} justifyContent="between">
          <Button onClick={ () => setIsVisible(false)}>{LocalizeText('hccenter.btn.closewindow') }</Button>
          <Button onClick={ event => CreateLinkEvent('catalog/open/' + GetConfiguration('catalog.links')['hc.buy_hc']) }>
            { LocalizeText((clubStatus === ClubStatus.ACTIVE) ? 'hccenter.btn.extend' : 'hccenter.btn.buy') }
          </Button>
        </Flex>
      </NitroCardContentView>
    </NitroCardView>
  );
}
