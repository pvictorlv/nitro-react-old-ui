import { RoomObjectCategory } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { LocalizeText } from '../../../../api';
import { Column, Flex, Text } from '../../../../common';
import { useFurnitureHighScoreWidget } from '../../../../hooks';
import { ContextMenuHeaderView } from '../context-menu/ContextMenuHeaderView';
import { ContextMenuListView } from '../context-menu/ContextMenuListView';
import { ObjectLocationView } from '../object-location/ObjectLocationView';

export const FurnitureHighScoreView: FC<{}> = props =>
{
    const { stuffDatas = null, getScoreType = null, getClearType = null } = useFurnitureHighScoreWidget();

    if (!stuffDatas || !stuffDatas.size) return null;

    return (
        <>
            { Array.from(stuffDatas.entries()).map(([ objectId, stuffData ], index) =>
            {
                return (
                    <ObjectLocationView key={ index } objectId={ objectId } category={ RoomObjectCategory.FLOOR }>
                        <Column className="nitro-widget-high-score" gap={ 0 }>
                            <Flex center className="nitro-widget-high-score-header">
                                { LocalizeText('high.score.display.caption', [ 'scoretype', 'cleartype' ], [ LocalizeText(`high.score.display.scoretype.${ getScoreType(stuffData.scoreType) }`), LocalizeText(`high.score.display.cleartype.${ getClearType(stuffData.clearType) }`) ]) }
                            </Flex>
                            <Column overflow="hidden" gap={ 1 } className="h-100">
                                <Column gap={ 1 }>
                                    <Flex alignItems="center" className="score-board-header mt-1 p-1">
                                        <Text style={ { fontSize: '12px' } } variant="black" className="col-8">
                                            { LocalizeText('high.score.display.users.header') }
                                        </Text>
                                        <Text style={ { fontSize: '12px' } } variant="black" className="col-4">
                                            { LocalizeText('high.score.display.score.header') }
                                        </Text>
                                    </Flex>
                                    <hr className="m-0" />
                                </Column>
                                <Column overflow="auto" gap={ 1 } className="overflow-y-auto high-score-results p-2">
                                    { stuffData.entries.map((entry, index) =>
                                    {
                                        return (
                                            <Flex key={ index } alignItems="center">
                                                <Text style={ { fontSize: '12px' } } className="text-left mx-2" variant="white">
                                                    { entry.users.join(', ') }
                                                </Text>
                                                <Text style={ { fontSize: '12px' } } center variant="white" className="mx-5 high-score-text-number">
                                                    { entry.score }
                                                </Text>
                                            </Flex>
                                        );
                                    }) }
                                </Column>
                                <i className="trophy position-absolute"/>
                                <Flex center className="bottom-text">
                                    <Text small center>{ LocalizeText('high.score.display.congratulations.footer') }</Text>
                                </Flex>
                            </Column>
                        </Column>
                    </ObjectLocationView>
                );
            }) }
        </>
    );
}
