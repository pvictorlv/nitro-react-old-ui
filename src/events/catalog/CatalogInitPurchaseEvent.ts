import { CatalogEvent } from './CatalogEvent';

export class CatalogInitPurchaseEvent extends CatalogEvent
{
    private _pageId: number;
    private _offerId: number;
    private _extraData: string;

    constructor(pageId: number, offerId: number, extraData: string)
    {
        super(CatalogEvent.INIT_PURCHASE);

        this._pageId = pageId;
        this._offerId = offerId;
        this._extraData = extraData;
    }

    public get pageId(): number
    {
        return this._pageId;
    }

    public get offerId(): number
    {
        return this._offerId;
    }

    public get extraData(): string
    {
        return this._extraData;
    }
}
