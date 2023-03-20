import { MouseEventType, RoomObjectCategory } from '@nitrots/nitro-renderer';
import {
    Dispatch,
    FC,
    MouseEventHandler,
    PropsWithChildren,
    ReactNode,
    SetStateAction,
    useEffect,
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

}

export const ToolbarIcon: FC<PropsWithChildren<ToolbarIconProps>> = props =>
{
    const { icon = '', onClick = null, children = null, maxFrames = 1, ...rest } = props;
    const elementRef = useRef<HTMLDivElement>();


    let currInterval = null;
    let
        [ currFrame, setCurrFrame ] = useState<number>(0);


    return (
        <Base innerRef={ elementRef } pointer className={ 'navigation-item icon ' + icon } data-frame={ currFrame }
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
                }, 50);

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
                }, 50);
            } }
            onClick={ onClick }>
            {children}
        </Base>
    );
}
