const SteamGift = require('../index.js');
const SteamID = require('steamid');

/**
 * Add friend
 * @param {string|SteamID} userID Steam ID
 * @param {function} [callback]
 * @returns {Promise}
 */
SteamGift.prototype.addFriend = function (userID, callback) {
    if (typeof userID === 'string') {
        userID = new SteamID(userID);
    }

    return StdLib.Promises.callbackPromise(null, callback, true, (accept, reject) => {
        this.request.post({
            "uri": "https://steamcommunity.com/actions/AddFriendAjax",
            "from": {
                "accept_invite": 0,
                "sessionID": this.getSessionID(),
                "steamid": userID.toString()
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