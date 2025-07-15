import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { AddEventLinkTracker, LocalizeText, RemoveLinkEventTracker } from '../../../api';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../../common';
import { WiredCreatorToolsView } from './WiredCreatorToolsView';
import { WiredVariableManagerView } from './WiredVariableManagerView';

export const WiredMenuView: FC<{}> = props =>
{
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [activeView, setActiveView] = useState<string>('menu');

    const onClose = useCallback(() =>
    {
        setIsVisible(false);
        setActiveView('menu');
    }, []);

    const openCreatorTools = useCallback(() =>
    {
        setActiveView('creator-tools');
    }, []);

    const openVariableManager = useCallback(() =>
    {
        setActiveView('variable-manager');
    }, []);

    const backToMenu = useCallback(() =>
    {
        setActiveView('menu');
    }, []);

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
                        setIsVisible(true);
                        setActiveView('menu');
                        return;
                    case 'creator-tools':
                        setIsVisible(true);
                        setActiveView('creator-tools');
                        return;
                    case 'variable-manager':
                        setIsVisible(true);
                        setActiveView('variable-manager');
                        return;
                }
            },
            eventUrlPrefix: 'wiredmenu/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    if(!isVisible) return null;

    const renderContent = () =>
    {
        switch(activeView)
        {
            case 'creator-tools':
                return <WiredCreatorToolsView onClose={onClose} />;
            case 'variable-manager':
                return <WiredVariableManagerView onClose={onClose} />;
            default:
                return (
                    <NitroCardContentView>
                        <div className="row">
                            <div className="col-12">
                                <div className="d-grid gap-2">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={openCreatorTools}
                                    >
                                        Wired Creator Tools
                                    </button>
                                    <button 
                                        className="btn btn-primary"
                                        onClick={openVariableManager}
                                    >
                                        Variable Manager
                                    </button>
                                </div>
                            </div>
                        </div>
                    </NitroCardContentView>
                );
        }
    };

    const getTitle = () =>
    {
        switch(activeView)
        {
            case 'creator-tools':
                return 'Wired Creator Tools';
            case 'variable-manager':
                return 'Variable Manager';
            default:
                return 'Wired Menu';
        }
    };

    return (
        <NitroCardView className="nitro-wired-menu" theme="primary-slim">
            <NitroCardHeaderView 
                headerText={getTitle()} 
                onCloseClick={onClose}
                onPrevClick={activeView !== 'menu' ? backToMenu : null}
            />
            {renderContent()}
        </NitroCardView>
    );
};