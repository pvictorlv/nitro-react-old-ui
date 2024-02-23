import {RoomChatSettings, RoomObjectCategory} from '@nitrots/nitro-renderer';
import {FC, useEffect, useMemo, useRef, useState} from 'react';
import {ChatBubbleMessage, GetRoomEngine} from '../../../../api';
import DOMPurify from 'dompurify';

interface ChatWidgetMessageViewProps
{
    chat: ChatBubbleMessage;
    makeRoom: (chat: ChatBubbleMessage) => void;
    bubbleWidth?: number;
}

export const ChatWidgetMessageView: FC<ChatWidgetMessageViewProps> = props =>
{
    const {chat = null, makeRoom = null, bubbleWidth = RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL} = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const [ isReady, setIsReady ] = useState<boolean>(false);
    const elementRef = useRef<HTMLDivElement>();

    const calculateWidth = function (textLen: number)
    {
        var letterWidth = 6;
        var width = textLen * letterWidth;
        return width;
    }


    const calculatePadding = function (textLen: number)
    {
        textLen += 2;

        if (textLen < chat.username.length)
            textLen = chat.username.length + 2;
        else if (textLen >= chat.username.length * 4)
            textLen = 1 + textLen - chat.username.length * 2;
        else if (textLen >= chat.username.length * 3)
        {
            textLen = textLen - chat.username.length;
        }
        else if (textLen >= chat.username.length * 2)
        {
            textLen = textLen + 2 - chat.username.length;
        }
        else
        {
            textLen = textLen + 1 + chat.username.length;
        }

        var letterWidth = 6;
        var padding = textLen * letterWidth;
        return padding;

    }

    const getBubbleWidth = useMemo(() =>
    {
        switch (bubbleWidth)
        {
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL:
                return 350;
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_THIN:
                return 240;
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_WIDE:
                return 2000;
        }
    }, [ bubbleWidth ]);

    useEffect(() =>
    {
        setIsVisible(false);

        const element = elementRef.current;

        if (!element) return;

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        chat.width = width;
        chat.height = height;
        chat.elementRef = element;

        let left = chat.left;
        let top = chat.top;

        if (!left && !top)
        {
            left = (chat.location.x - (width / 2));
            top = (element.parentElement.offsetHeight - height);

            chat.left = left;
            chat.top = top;
        }

        setIsReady(true);

        return () =>
        {
            chat.elementRef = null;

            setIsReady(false);
        }
    }, [ chat ]);

    useEffect(() =>
    {
        if (!isReady || !chat || isVisible) return;

        if (makeRoom) makeRoom(chat);

        setIsVisible(true);
    }, [ chat, isReady, isVisible, makeRoom ]);

    const htmlDecode = (input) =>
    {
        let e = document.createElement('div');
        e.innerHTML = input;

        return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
    }
    return (
        <div ref={ elementRef } className={ `bubble-container ${ isVisible ? 'visible' : 'invisible' }` }
             onClick={ event =>
             {
                 if (chat.formattedText.indexOf('a href') > 0)
                 {
                     var url = chat.formattedText.split('a href="')[1].split('"')[0];
                     if (url.indexOf('image') > 0)
                     {
                         var image = new Image();
                         image.src = url;

                         var w = window.open('');
                         w.document.write(image.outerHTML);
                     }
                     else
                     {
                         window.open(url, '_blank');
                     }
                 }
                 GetRoomEngine().selectRoomObject(chat.roomId, chat.senderId, RoomObjectCategory.UNIT)
             } }>
            { (chat.styleId === 0) &&
                <div className="user-container-bg" style={ {backgroundColor: chat.color} }/> }
            <div className={ `chat-bubble bubble-${ chat.styleId } type-${ chat.type }` }
                 style={ {maxWidth: getBubbleWidth} }>
                <div className="user-container">
                    { chat.imageUrl && (chat.imageUrl.length > 0) &&
                        <div className="user-image" style={ {backgroundImage: `url(${ chat.imageUrl })`} }/> }
                </div>
                <div className="chat-content"
                    //     style={ {paddingRight: calculatePadding(chat.formattedText.length) + 'px'} }
                >
                    <span className="username mr-1" dangerouslySetInnerHTML={ {__html: `${ chat.username }: `} }/>
                    <span className="message"  >
                        { DOMPurify.sanitize(htmlDecode(chat.formattedText), {
                            ALLOWED_TAGS: [ 'b', 'i', 'u', 'strong' ],
                            ALLOWED_ATTR: [ 'color' ]
                        }) }
                    </span>
                </div>
                <div className="pointer"/>
            </div>
        </div>
    );
}
