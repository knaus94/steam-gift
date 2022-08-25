const SteamGift = require('../index.js');
const StdLib = require('@doctormckay/stdlib');

/**
 * Add friend
 * @param {string} steamId Steam ID
 * @param {function} [callback]
 * @returns {Promise}
 */
SteamGift.prototype.addFriend = function (steamId, callback) {
    return StdLib.Promises.callbackPromise(null, callback, true, (accept, reject) => {
        this.request.post({
            "uri": "https://steamcommunity.com/actions/AddFriendAjax",
            "from": {
                "accept_invite": 0,
                "sessionID": this.getSessionID(),
                "steamid": steamId
            },
            "json": true
        }, (err, response, body) => {
            if (this._checkHttpError(err, response, reject)) {
                return;
            }

            if (body.success) {
                return accept();
            } else {
                return reject(new Error("Unknown error"));
            }
        });
    });
};