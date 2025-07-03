import {GetOfficialSongIdMessageComposer, ISongInfo, MusicPriorities, OfficialSongIdMessageEvent, TraxSongInfoMessageEvent} from "@nitrots/nitro-renderer";
import {FC, useEffect, useState} from "react";

import {GetConfiguration, GetNitroInstance, LocalizeText, ProductTypeEnum, SendMessageComposer} from "../../../../../api";
import {Button, Column, Flex, Grid, LayoutImage, Text} from "../../../../../common";
import {useCatalog, useMessageEvent} from "../../../../../hooks";
import {CatalogHeaderView} from "../../catalog-header/CatalogHeaderView";
import {CatalogAddOnBadgeWidgetView} from "../widgets/CatalogAddOnBadgeWidgetView";
import {CatalogItemGridWidgetView} from "../widgets/CatalogItemGridWidgetView";
import {CatalogLimitedItemWidgetView} from "../widgets/CatalogLimitedItemWidgetView";
import {CatalogPurchaseWidgetView} from "../widgets/CatalogPurchaseWidgetView";
import {CatalogSpinnerWidgetView} from "../widgets/CatalogSpinnerWidgetView";
import {CatalogTotalPriceWidget} from "../widgets/CatalogTotalPriceWidget";
import {CatalogViewProductWidgetView} from "../widgets/CatalogViewProductWidgetView";
import {CatalogLayoutProps} from "./CatalogLayout.types";

export const CatalogLayoutSoundMachineView: FC<CatalogLayoutProps> = props => {
  let _traxSongInfoEvent: TraxSongInfoMessageEvent;

  const {page = null} = props;
  const [songId, setSongId] = useState(-1);
  const [duration, setDuration] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [officialSongId, setOfficialSongId] = useState("");
  const [songName, setSongName] = useState("");
  const {currentOffer = null, currentPage = null} = useCatalog();

  const previewSong = (previewSongId: number) => (
    GetNitroInstance().soundManager.musicController?.playSong(previewSongId, MusicPriorities.PRIORITY_PURCHASE_PREVIEW, 15, 0, 0, 0), setIsPlaying(true)
  );
  const stopPreviewSong = () => (GetNitroInstance().soundManager.musicController?.stop(MusicPriorities.PRIORITY_PURCHASE_PREVIEW), setIsPlaying(false));

  const displaySongName = (songData: ISongInfo): void => {
    const duration = songData.length;
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / 1000 / 60) % 60);

    setDuration([minutes.toString(), seconds.toString().padStart(2, "0")].join(":"));

    setSongName(`${songData.creator} - ${songData.name}`);
  };

  useMessageEvent<OfficialSongIdMessageEvent>(OfficialSongIdMessageEvent, event => {
    const parser = event.getParser();

    if (parser.officialSongId !== officialSongId) return;

    const thisSongId = parser.songId;
    setSongId(thisSongId);

    _traxSongInfoEvent = new TraxSongInfoMessageEvent((event: TraxSongInfoMessageEvent): void => {
      const parser = event.getParser();

      for (const song of parser.songs) {
        if (thisSongId !== song.id) continue;
        displaySongName(song as unknown as ISongInfo);
        break;
      }

      clearTraxSongInfoEvent();
    });
    GetNitroInstance().communication.connection.addMessageEvent(_traxSongInfoEvent);

    const songData = GetNitroInstance().soundManager.musicController?.getSongInfo(thisSongId);
    if (songData) displaySongName(songData);
  });

  const clearTraxSongInfoEvent = (): void => {
    if (_traxSongInfoEvent) GetNitroInstance().communication.connection.removeMessageEvent(_traxSongInfoEvent);
  };

  useEffect(() => {
    if (!currentOffer) return;

    const product = currentOffer.product;

    if (!product) return;

    if (product.extraParam.length > 0) {
      const id = parseInt(product.extraParam);

      if (id > 0) {
        setSongId(id);
      } else {
        setOfficialSongId(product.extraParam);
        SendMessageComposer(new GetOfficialSongIdMessageComposer(product.extraParam));
      }
    } else {
      setOfficialSongId("");
      setSongId(-1);
    }

    return () => (GetNitroInstance().soundManager.musicController?.stop(MusicPriorities.PRIORITY_PURCHASE_PREVIEW), setIsPlaying(false));
  }, [currentOffer]);

  useEffect(() => {
    return () => {
      GetNitroInstance().soundManager.musicController?.stop(MusicPriorities.PRIORITY_PURCHASE_PREVIEW), setIsPlaying(false);
      clearTraxSongInfoEvent();
    };
  }, []);

  return (
    <>
      <Grid>
        <Column size={7} overflow="hidden">
          {GetConfiguration("catalog.headers") && <CatalogHeaderView imageUrl={currentPage.localization.getImage(0)} />}
          <CatalogItemGridWidgetView />
        </Column>
        <Column center={!currentOffer} size={5} overflow="hidden">
          {!currentOffer && (
            <>
              {!!page.localization.getImage(1) && <LayoutImage imageUrl={page.localization.getImage(1)} />}
              <Text center dangerouslySetInnerHTML={{__html: page.localization.getText(0)}} />
            </>
          )}
          {currentOffer && (
            <>
              <Flex center overflow="hidden" style={{height: 140}}>
                {currentOffer.product.productType !== ProductTypeEnum.BADGE && (
                  <>
                    <CatalogViewProductWidgetView />
                    <CatalogAddOnBadgeWidgetView className="bg-muted rounded bottom-1 end-1" />
                  </>
                )}
                {currentOffer.product.productType === ProductTypeEnum.BADGE && <CatalogAddOnBadgeWidgetView className="scale-2" />}
              </Flex>
              <Column grow gap={1}>
                <CatalogLimitedItemWidgetView fullWidth />
                <Text grow truncate>
                  {songName ?? currentOffer.localizationName}
                </Text>
                <Text>
                  {LocalizeText("catalog.song.length", ["min", "sec"], [duration.split(":")[0], duration.split(":")[1]])}
                </Text>
                {songId > -1 && (
                  <Button onClick={() => (!isPlaying ? previewSong(songId) : stopPreviewSong())}>
                    {LocalizeText(!isPlaying ? "play_preview_button" : "playlist.editor.button.preview.stop")}
                  </Button>
                )}
                <Flex justifyContent="between">
                  <Column gap={1}>
                    <CatalogSpinnerWidgetView />
                  </Column>
                  <CatalogTotalPriceWidget justifyContent="end" alignItems="end" />
                </Flex>
                <CatalogPurchaseWidgetView />
              </Column>
            </>
          )}
        </Column>
      </Grid>
    </>
  );
};
