import { AvatarDirectionAngle } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { FigureData } from '../../../api';
import { Base, Column, LayoutAvatarImageView } from '../../../common';
import { AvatarEditorIcon } from './AvatarEditorIcon';

export interface AvatarEditorFigurePreviewViewProps
{
    figureData: FigureData;
}

export const AvatarEditorFigurePreviewView: FC<AvatarEditorFigurePreviewViewProps> = props =>
{
    const { figureData = null } = props;
    const [ updateId, setUpdateId ] = useState(-1);

    const rotateFigure = (direction: number) =>
    {
        if(direction < AvatarDirectionAngle.MIN_DIRECTION)
        {
            direction = (AvatarDirectionAngle.MAX_DIRECTION + (direction + 1));
        }

        if(direction > AvatarDirectionAngle.MAX_DIRECTION)
        {
            direction = (direction - (AvatarDirectionAngle.MAX_DIRECTION + 1));
        }

        figureData.direction = direction;
    }

    useEffect(() =>
    {
        if(!figureData) return;

        figureData.notify = () => setUpdateId(prevValue => (prevValue + 1));

        return () =>
        {
            figureData.notify = null;
        }
    }, [ figureData ] );

    return (
        <Column className="figure-preview-container" overflow="hidden" position="relative" size={ 4}>
            <LayoutAvatarImageView figure={ figureData.getFigureString() } direction={ figureData.direction } scale={ 1 } />
            <Base className="avatar-shadow" />
        </Column>
    );
}
