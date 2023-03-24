import { CatalogEvent } from './CatalogEvent';

export class CatalogInitPurchaseEvent extends CatalogEvent
{
    private _pageId: number;
    private _offerId: number;
    private _extraData: string;
    private _noGiftOption: boolean;
    private _purchaseCallback: () => void;

    constructor(pageId: number, offerId: number, extraData: string, noGiftOption: boolean,
        purchaseCallback: () => void)
    {
        super(CatalogEvent.INIT_PURCHASE);

        this._pageId = pageId;
        this._offerId = offerId;
        this._extraData = extraData;
        this._noGiftOption = noGiftOption;
        this._purchaseCallback = purchaseCallback;
    }

    public get pageId(): number
    {
        return this._pageId;
    }

    public get purchaseCallback(): () => void
    {
        return this._purchaseCallback;
    }

    public get noGiftOption(): boolean
    {
        return this._noGiftOption;
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
