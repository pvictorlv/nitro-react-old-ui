import {FC, useState} from 'react';

export const CatalogPurchaseConfirmView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState<boolean>(false);
    const [ pageId, setPageId ] = useState<number>(0);
    const [ offerId, setOfferId ] = useState<number>(0);
    const [ extraData, setExtraData ] = useState<string>('');

    const {} = props;

    return (
        <div></div>
    );
}
