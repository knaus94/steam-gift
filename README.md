# SteamGift

A module for interacting with the Steam store site from Node.js.

## Logging In

This module cannot facilitate logins to the store site directly. You'll need to use something like
[`steam-user`](https://www.npmjs.com/package/steam-user) or
[`steamcommunity`](https://www.npmjs.com/package/steamcommunity) to login, and then use
[`setCookies`](#setcookiescookies) to set your login cookies in this module.

The cookies are the same for the store site and for the community site.