"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importStar(require("./request"));
const url_1 = require("url");
class Api {
    constructor(config) {
        this.token = config.token;
    }
    headers() {
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
        };
    }
    getMyCurentlyPlaying() {
        return __awaiter(this, void 0, void 0, function* () {
            const track = new request_1.ResponseParser(yield request_1.default({
                url: "https://api.spotify.com/v1/me/player/currently-playing",
                headers: this.headers(),
                method: "GET"
            }))
                .status((status) => status >= 200 && status < 300)
                .json();
            return track;
        });
    }
    getMyProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new request_1.ResponseParser(yield request_1.default({
                url: "https://api.spotify.com/v1/me",
                headers: this.headers(),
                method: "GET"
            }))
                .status((status) => status >= 200 && status < 300)
                .json();
            return user;
        });
    }
}
exports.default = Api;
exports.refreshTimeouts = new Map();
function expiryDate(expires) {
    const d = new Date();
    d.setSeconds(d.getSeconds() + expires);
    return d;
}
exports.expiryDate = expiryDate;
function updateTimeout(user, config) {
    if (exports.refreshTimeouts.has(user._id)) {
        clearTimeout(exports.refreshTimeouts.get(user._id));
    }
    const delay = new Date().getTime() - user.expires.getTime();
    exports.refreshTimeouts.set(user._id, setTimeout(() => {
        refreshToken(user, config);
    }, delay));
}
exports.updateTimeout = updateTimeout;
function token(code, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const t = yield new request_1.ResponseParser(yield request_1.default({
            url: "https://accounts.spotify.com/api/token",
            form: {
                grant_type: "authorization_code",
                code,
                redirect_uri: url_1.format({
                    protocol: config.redirect.protocol,
                    slashes: true,
                    hostname: config.redirect.hostname,
                    port: config.redirect.port,
                    pathname: "/cb/code"
                })
            },
            headers: {
                "Authorization": "Basic " + Buffer.from(config.clientId + ":" + config.clientSecret)
                    .toString("base64")
            },
            method: "POST"
        }))
            .status((status) => status >= 200 && status < 300)
            .json();
        if (yield global.User.exists({
            $or: [
                { code },
                { refreshToken: code }
            ]
        })) {
            const user = yield global.User
                .findOne({
                $or: [
                    { code },
                    { refreshToken: code }
                ]
            })
                .exec();
            user.accessToken = t.access_token,
                user.tokenType = t.token_type,
                user.scope = t.scope,
                user.expires = expiryDate(t.expires_in),
                user.refreshToken = t.refresh_token;
            updateTimeout(user, config);
            return yield user.save();
        }
        else {
            const user = yield global.User.create({
                code,
                accessToken: t.access_token,
                tokenType: t.token_type,
                scope: t.scope,
                expires: expiryDate(t.expires_in),
                refreshToken: t.refresh_token
            });
            updateTimeout(user, config);
            return user;
        }
    });
}
exports.token = token;
function refreshToken(user, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const t = yield new request_1.ResponseParser(yield request_1.default({
            url: "https://accounts.spotify.com/api/token",
            form: {
                grant_type: "refresh_token",
                refresh_token: user.refreshToken
            },
            headers: {
                "Authorization": "Basic " + Buffer.from(config.clientId + ":" + config.clientSecret, "utf8")
                    .toString("base64")
            },
            method: "POST"
        }))
            .status((status) => status >= 200 && status < 300)
            .json();
        user.accessToken = t.access_token,
            user.tokenType = t.token_type;
        user.scope = t.scope;
        user.expires = expiryDate(t.expires_in),
            updateTimeout(user, config);
        return yield user.save();
    });
}
exports.refreshToken = refreshToken;
//# sourceMappingURL=api.js.map