import { MouseEventType, RoomObjectCategory } from '@nitrots/nitro-renderer';
import {
    Dispatch,
    FC,
    MouseEventHandler,
    PropsWithChildren,
    ReactNode,
    SetStateAction,
    useEffect, useMemo,
    useRef,
    useState
} from 'react';
import {
    CreateLinkEvent,
    DispatchUiEvent,
    GetConfiguration,
    GetRoomEngine,
    GetRoomSession,
    GetSessionDataManager,
    GetUserProfile, VisitDesktop
} from '../../api';
import { Base, Flex, LayoutItemCountView } from '../../common';
import { GuideToolEvent } from '../../events';

interface ToolbarIconProps
{
    icon: string;
    maxFrames: number;
    onClick: MouseEventHandler;
    children?: ReactNode;
    classNames?: string[];
    className?: string | undefined;
}

export const ToolbarIcon: FC<PropsWithChildren<ToolbarIconProps>> = props =>
{
    const { icon = '', onClick = null, className = '', classNames = [], children = null, maxFrames = 1, ...rest } = props;
    const elementRef = useRef<HTMLDivElement>();


    let currInterval = null;
    let
        [ currFrame, setCurrFrame ] = useState<number>(0);

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'navigation-item', 'icon' ];

        newClassNames.push(icon)

        return newClassNames;
    }, [ icon ]);

    const getClassName = useMemo(() =>
    {
        let newClassName = getClassNames.join(' ');

        if (className.length) newClassName += (' ' + className);

        return newClassName.trim();
    }, [ className, getClassNames ]);

    return (
        <Base innerRef={ elementRef } pointer className={ getClassName }
            data-frame={ currFrame }
            onMouseEnter={ event =>
            {
                if (maxFrames <= 0)
                    return;

                if (currInterval)
                    clearInterval(currInterval);

                currInterval = setInterval(() =>
                {
                    if (currFrame > maxFrames)
                    {
                        clearInterval(currInterval);
                        return;
                    }

                    setCurrFrame(currFrame++);
                }, 55);

            } } onMouseLeave={ event =>
            {
                if (maxFrames <= 0)
                    return;

                clearInterval(currInterval);

                currInterval = setInterval(() =>
                {
                    if (currFrame <= 0)
                    {
                        clearInterval(currInterval);
                        setCurrFrame(0);
                        return;
                    }

                    setCurrFrame(currFrame--);
                }, 55);
            } }
            onClick={ onClick }>
            { children }
        </Base>
    );
}
