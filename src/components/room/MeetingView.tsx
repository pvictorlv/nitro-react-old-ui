import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { AddEventLinkTracker, GetSessionDataManager, LocalizeText, RemoveLinkEventTracker } from '../../api';
import { DraggableWindowPosition, NitroCardHeaderView, NitroCardView } from '../../common';
import { useRoom } from '../../hooks';

import { JitsiMeeting } from '@jitsi/react-sdk';

export const MeetingView: FC<{}> = props => 
{
    const [ isVisible, setIsVisible ] = useState(true);
    const { roomSession = null } = useRoom();

    const onClose = () => 
    {
        setIsVisible(false);
    }


    useEffect(() => 
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) => 
            {
                const parts = url.split('/');

                if (parts.length < 2) return;

                switch (parts[1]) 
                {
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                    case 'toggle':
                        setIsVisible(prevValue => !prevValue);
                        return;
                }
            },
            eventUrlPrefix: 'meeting/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    //if(!isVisible) return null;

    return (
        <NitroCardView uniqueKey={ 'meeting' } className="nitro-meeting" theme={ isVisible ? '' : 'hidden' }
            windowPosition={ DraggableWindowPosition.CENTER }>
            <NitroCardHeaderView headerText={ LocalizeText('meeting.title') } onCloseClick={ onClose }/>
            <JitsiMeeting
                domain={ 'interno.meet2.cnhreciclagem.com.br' }
                userInfo={ { displayName: GetSessionDataManager().userName, email: null } }
                getIFrameRef={ iframeRef => 
                {
                    iframeRef.style.height = '100vh';
                } }
                configOverwrite={ {
                    toolbarButtons: [
                        'microphone', 'camera', 'fodeviceselection',
                        'sharedvideo', 'settings', 'participants-pane', 'highlight', 'noisesuppression',
                        'filmstrip', 'tileview', 'download', 'whiteboard',
                        'mute-everyone', 'select-background', 'mute-video-everyone', 'desktop', 'shareaudio'
                    ],
                    disableDeepLinking: true,
                    startWithAudioMuted: true, startWithVideoMuted: true, prejoinPageEnabled: false, prejoinConfig: {
                        enabled: false
                    }
                } }
                interfaceConfigOverwrite={ {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    JITSI_WATERMARK_LINK: '#',
                    SHOW_CHROME_EXTENSION_BANNER: false,
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    SET_FILMSTRIP_ENABLED: false,
                    DISABLE_FOCUS_INDICATOR: true,
                    DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
                    INVITATION_POWERED_BY: false,
                    MOBILE_APP_PROMO: false,
                    OPEN_IN_MOBILE_BROWSER: true

                } }
                roomName={ 'Drivin/Sala ' + roomSession.roomId }
            />
        </NitroCardView>
    );
}
