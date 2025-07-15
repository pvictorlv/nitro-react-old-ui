import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { GetSessionDataManager, LocalizeText, WiredCreatorTools, WiredFurniParams, WiredFurniType, WiredSelectionVisualizer } from '../../../api';
import { Button, Column, Flex, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../common';
import { useWired } from '../../../hooks';
import { WiredCreatorToolsView } from './WiredCreatorToolsView';
import { WiredFurniSelectorView } from './WiredFurniSelectorView';
import { WiredVariableManagerView } from './WiredVariableManagerView';

export interface WiredBaseViewProps
{
    wiredType: string;
    requiresFurni: number;
    hasSpecialInput: boolean;
    save: () => void;
    validate?: () => boolean;
}

export const WiredBaseView: FC<PropsWithChildren<WiredBaseViewProps>> = props =>
{
    const { wiredType = '', requiresFurni = WiredFurniType.STUFF_SELECTION_OPTION_NONE, save = null, validate = null, children = null, hasSpecialInput = false } = props;
    const [ wiredName, setWiredName ] = useState<string>(null);
    const [ wiredDescription, setWiredDescription ] = useState<string>(null);
    const [ needsSave, setNeedsSave ] = useState<boolean>(false);
    const [ showVariableManager, setShowVariableManager ] = useState<boolean>(false);
    const [ showCreatorTools, setShowCreatorTools ] = useState<boolean>(false);
    const { trigger = null, setTrigger = null, setIntParams = null, setStringParam = null, setFurniIds = null, setAllowsFurni = null, saveWired = null } = useWired();

    const onClose = () => setTrigger(null);
    
    const onSave = () =>
    {
        if(validate && !validate()) return;

        if(save) save();

        setNeedsSave(true);
    }

    useEffect(() =>
    {
        if(!needsSave) return;

        saveWired();

        setNeedsSave(false);
    }, [ needsSave, saveWired ]);

    useEffect(() =>
    {
        if(!trigger) return;

        const spriteId = (trigger.spriteId || -1);
        const furniData = GetSessionDataManager().getFloorItemData(spriteId);

        if(!furniData)
        {
            setWiredName(('NAME: ' + spriteId));
            setWiredDescription(('NAME: ' + spriteId));
        }
        else
        {
            setWiredName(furniData.name);
            setWiredDescription(furniData.description);
        }

        if(hasSpecialInput)
        {
            setIntParams(trigger.intData);
            setStringParam(trigger.stringData);
        }
        
        if(requiresFurni > WiredFurniType.STUFF_SELECTION_OPTION_NONE)
        {
            setFurniIds(prevValue =>
            {
                if(prevValue && prevValue.length) WiredSelectionVisualizer.clearSelectionShaderFromFurni(prevValue);

                if(trigger.selectedItems && trigger.selectedItems.length)
                {
                    WiredSelectionVisualizer.applySelectionShaderToFurni(trigger.selectedItems);

                    return trigger.selectedItems;
                }

                return [];
            });
        }

        setAllowsFurni(requiresFurni);
        
        // Initialize creator tools if not already done
        WiredCreatorTools.initialize();
    }, [ trigger, hasSpecialInput, requiresFurni, setIntParams, setStringParam, setFurniIds, setAllowsFurni ]);

    if (showVariableManager)
    {
        return (
            <NitroCardView uniqueKey="nitro-wired-variables" className="nitro-wired" theme="wired">
                <NitroCardHeaderView headerText={ LocalizeText('wiredfurni.params.variables.title') } onCloseClick={ () => setShowVariableManager(false) } />
                <NitroCardContentView>
                    <WiredVariableManagerView onClose={ () => setShowVariableManager(false) } />
                </NitroCardContentView>
            </NitroCardView>
        );
    }

    if (showCreatorTools)
    {
        return (
            <NitroCardView uniqueKey="nitro-wired-creator-tools" className="nitro-wired" theme="wired">
                <NitroCardHeaderView headerText={ LocalizeText('wiredcreatortools.title') } onCloseClick={ () => setShowCreatorTools(false) } />
                <NitroCardContentView>
                    <WiredCreatorToolsView onClose={ () => setShowCreatorTools(false) } />
                </NitroCardContentView>
            </NitroCardView>
        );
    }

    return (
        <NitroCardView uniqueKey="nitro-wired" className="nitro-wired" theme="wired">
            <NitroCardHeaderView headerText={ LocalizeText('wiredfurni.title') } onCloseClick={ onClose } />
            <NitroCardContentView>
                <Column gap={ 1 }>
                    <Flex alignItems="center" gap={ 1 }>
                        <i className={ `icon icon-wired-${ wiredType }` } />
                        <Text variant={ 'white' } className={'text-volter-bold'}>{ wiredName }</Text>
                    </Flex>
                    <Text variant={ 'white' }>{ wiredDescription }</Text>
                </Column>
                
                {/* Advanced Tools Bar */}
                {WiredCreatorTools.getConfig().enableAdvancedMode && (
                    <>
                        <hr className="m-0 bg-dark" />
                        <Flex gap={ 1 }>
                            <Button size="sm" variant="secondary" onClick={ () => setShowVariableManager(true) }>
                                {LocalizeText('wiredfurni.params.variables.button', 'Variables')}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={ () => setShowCreatorTools(true) }>
                                {LocalizeText('wiredcreatortools.button', 'Tools')}
                            </Button>
                        </Flex>
                    </>
                )}

                {/* Variable availability info */}
                {WiredCreatorTools.getConfig().showVariables && WiredFurniParams.getAvailableParamVariables().size > 0 && (
                    <>
                        <hr className="m-0 bg-dark" />
                        <Column gap={ 1 }>
                            <Text variant="white" bold fontSize={ 6 }>
                                {LocalizeText('wiredfurni.params.variables.availability', 'Available Variables')}:
                            </Text>
                            <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                {Array.from(WiredFurniParams.getAvailableParamVariables().entries()).map(([key, variable]) => (
                                    <Text key={key} variant="muted" fontSize={ 6 }>
                                        {key}: {String((variable as any).value)} ({(variable as any).type})
                                    </Text>
                                ))}
                            </div>
                        </Column>
                    </>
                )}

                { !!children && <hr className="m-0 bg-dark" /> }
                { children }
                { (requiresFurni > WiredFurniType.STUFF_SELECTION_OPTION_NONE) &&
                    <>
                        <hr className="m-0 bg-dark" />
                        <WiredFurniSelectorView />
                    </> }
                <Flex alignItems="center" gap={ 1 }>
                    <Button fullWidth variant="dark" onClick={ onSave }>{ LocalizeText('wiredfurni.ready') }</Button>
                    <Button fullWidth variant="dark" onClick={ onClose }>{ LocalizeText('cancel') }</Button>
                </Flex>
            </NitroCardContentView>
        </NitroCardView>
    );
}
