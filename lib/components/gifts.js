const Cheerio = require('cheerio');
const StdLib = require('@doctormckay/stdlib');
const SteamGift = require('../index.js');
const SetCookieParser = require('set-cookie-parser');
const SteamID = require('steamid');

const EResult = require('../resources/EResult.js');
SteamGift.prototype.EResult = EResult;

/**
 * forget Cart
 * @param {function} [callback]
 * @returns {Promise}
 */
SteamGift.prototype.forgetCart = function (callback) {
    return StdLib.Promises.callbackPromise(null, callback, true, (accept, reject) => {
        this.delCookie(`shoppingCartGID`);
        this.delCookie(`beginCheckoutCart`);

        return accept();
    });
};

/**
 * Add to cart
 * @param {number} subId - SubId Game to buy
 * @param {function} [callback]
 * @returns {Promise}
 */
SteamGift.prototype.addToCart = function (subId, callback) {
    return StdLib.Promises.callbackPromise(null, callback, true, (accept, reject) => {
        this.request.post({
            "uri": "https://store.steampowered.com/cart/",
            "formData": {
                "sessionid": this.getSessionID(),
                "action": 'add_to_cart',
                "snr": '1_5_9__403',
                "originating_snr": '1_store-navigation__',
                "subid": subId,
            }
        }, (err, response, body) => {
            if (this._checkHttpError(err, response, reject)) {
                return;
            }

            const shoppingCartGID = SetCookieParser.parse(response).find((cookie) => cookie.value === 'shoppingCartGID')
            if (shoppingCartGID !== undefined) {
                this.setCookie(`shoppingCartGID=${shoppingCartGID.value}`)
                this.setCookie(`beginCheckoutCart=${shoppingCartGID.value}`)
            }

            const $ = Cheerio.load(body);

            const formattedAppId = $('.cart_row.even').attr('data-ds-appid');

            if (formattedAppId === undefined) {
                return reject(new Error(`Error formatted AppID Id`));
            }

            return accept({
                appId: Number(formattedAppId),
                subId,
            });
        });
    });
};

/**
 * Comparing a shopping cart with a list of items
 * @param {Object[]} items
 * @param {number} items[].subId
 * @param {number} items[].appId
 * @param {function} [callback]
 * @returns {Promise}
 */
SteamGift.prototype.checkoutGiftCart = function (items, callback) {
    return StdLib.Promises.callbackPromise(null, callback, true, (accept, reject) => {
        this.request.get("https://store.steampowered.com/cart/", (err, response, body) => {
            if (this._checkHttpError(err, response, reject)) {
                return;
            }

            const $ = Cheerio.load(body);

            /**
             * @type {number[]}
             */
            const cart = [];

            $('.cart_row').each((i, element) => {
                cart[i] = Number($(element).attr('data-ds-appid'));
            });

            if (cart.length !== items.length) {
                return reject(new Error(`Carts don't match`));
            }

            for (const itm of items) {
                const i = cart.findIndex((item) => item === itm.appId)

                if (i === -1) {
                    return reject(new Error(`Not found in cart AppID: ${itm.appId}`));
                }
            }

            return accept()
        });
    });
};

/**
 * init Transaction
 * @param {string} region Bot Region
 * @param {string|SteamID} steamID Giftee Steam ID
 * @param {string} gifteeName Giftee Name
 * @param {string} giftMessage Gift Message
 * @param {string} giftSentiment Gift Sentiment
 * @param {function} [callback]
 * @returns {Promise} 
 */
SteamGift.prototype.initTransaction = function (region, steamID, gifteeName, giftMessage, giftSentiment, callback) {
    if (typeof steamID === 'string') {
        steamID = new SteamID(steamID);
    }

    return StdLib.Promises.callbackPromise(null, callback, true, (accept, reject) => {
        const cartId = this.getCartId();

        if (cartId === null) {
            return reject(new Error(`Cookie CartId Not Found`))
        }

        this.request.post({
            "uri": "https://store.steampowered.com/checkout/inittransaction/",
            "formData": {
                "sessionid": this.getSessionID(),
                "gidShoppingCart": cartId,
                "gidReplayOfTransID": -1,
                "PaymentMethod": 'steamaccount',
                "abortPendingTransactions": 0,
                "bHasCardInfo": 0,
                "Country": region,
                "bIsGift": 1,
                "GifteeAccountID": steamID.accountid,
                "ScheduledSendOnDate": 0,
                "bSaveBillingAddress": 1,
                "bUseRemainingSteamAccount": 1,
                "bPreAuthOnly": 0,
                "GifteeName": gifteeName,
                "GiftMessage": giftMessage,
                "Sentiment": giftSentiment,
            },
            "json": true
        }, (err, response, body) => {
            if (this._checkHttpError(err, response, reject)) {
                return;
            }

            if (body.success != EResult.OK) {
                return reject(new Error(EResult[body.success] || "Error " + body.purchaseresultdetail));
            }

            if (!data.transid) {
                return reject(new Error('Failed to get steam transid'));
            }


            return accept(data.transid);
        });
    });
};

/**
 * get Final Price
 * @param {string} count Count items
 * @param {string} transid trans id steam
 * @param {function} [callback]
 * @returns {Promise}
 */
SteamGift.prototype.getFinalPrice = function (count, transid, callback) {
    return StdLib.Promises.callbackPromise(null, callback, true, (accept, reject) => {
        const cartId = this.getCartId();

        if (cartId === null) {
            return reject(new Error(`Cookie CartId Not Found`))
        }

        this.request.get({
            "uri": "https://store.steampowered.com/checkout/getfinalprice/",
            "qs": {
                "count": count,
                "transid": transid,
                "purchasetype": 'gift',
                "microtxnid": -1,
                "cart": cartId,
                "gidReplayOfTransID": -1,
            }
        }, (err, response, body) => {
            if (this._checkHttpError(err, response, reject)) {
                return;
            }

            return accept();
        });
    });
};

/**
 * finalize Transaction
 * @param {string} transid steam transid
 * @param {function} [callback]
 * @returns {Promise} 
 */
SteamGift.prototype.finalizeTransaction = function (transid, callback) {
    return StdLib.Promises.callbackPromise(null, callback, true, (accept, reject) => {
        this.request.post({
            "uri": "https://store.steampowered.com/checkout/inittransaction/",
            "form": {
                "transid": transid,
                "CardCVV2": '',
            }
        }, (err, response, body) => {
            if (this._checkHttpError(err, response, reject)) {
                return;
            }

            if (data.success === EResult.Pending || data.success === EResult.OK) {
                return accept();
            }

            return reject(new Error(EResult[body.success] || "Error " + body.purchaseresultdetail));
        });
    });
};