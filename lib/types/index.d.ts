export = SteamGift;

declare class SteamGift {
  /**
   * @param options Options
   */
  constructor(options?: Options);

  /**
   * Store initialization
   *  @param cookies Cookie set
   */
  setCookies(cookies: any): void;

  /**
   * Removing the Cart.
   */
  forgetCart(): Promise<void>;

  /**
   * Add game to Cart
   *  @param subId Game Sub Id
   */
  addToCart(subId: number): Promise<AddToCartInterface>;

  /**
   * Comparing a shopping Cart with a list of items
   */
  checkoutGiftCart(items: CheckoutGiftCartItemsInterface[]): Promise<void>;

  /**
   * Transaction initialization. Returns the Steam transaction ID if successful
   * @param region Bot Region
   * @param gifteeAccountID Giftee Account ID
   * @param gifteeName Giftee Name
   * @param giftMessage Gift Message
   * @param giftSentiment Gift Sentiment
   */
  initTransaction(
    region: string,
    gifteeAccountID: number,
    gifteeName: string,
    giftMessage: string,
    giftSentiment: string
  ): Promise<string>;

  /**
   * @param count Count Items in Cart
   * @param transid Steam Transaction ID
   */
  getFinalPrice(count: number, transid: string): Promise<void>;

  /**
   * Finalize transaction
   * @param transid Steam Transaction ID
   */
  finalizeTransaction(transid: string): Promise<void>;
}

interface Options {
  timeout?: number;
  userAgent?: string;
}

interface AddToCartInterface {
  appId: number;
  subId: number;
}

interface CheckoutGiftCartItemsInterface {
  subId: number;
  appId: number;
}
