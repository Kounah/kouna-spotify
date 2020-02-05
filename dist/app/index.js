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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const url_1 = __importDefault(require("url"));
const api_1 = __importStar(require("../api/api"));
const currently_playing_1 = __importDefault(require("./currently-playing"));
const mongo_1 = __importDefault(require("./mongo"));
const nunjucks_1 = __importDefault(require("./nunjucks"));
class App {
    constructor(config) {
        mongo_1.default(config.mongo);
        this.app = express_1.default();
        this.app.get("/login", (req, res) => {
            const scopes = [
                "user-read-private",
                "user-read-email",
                "user-read-currently-playing"
            ].join(" ");
            res.redirect("https://accounts.spotify.com/authorize" +
                "?response_type=code" +
                "&client_id=" + config.clientId +
                (scopes ? '&scope=' + encodeURIComponent(scopes) : "") +
                "&redirect_uri=" + encodeURIComponent(url_1.default.format({
                protocol: config.redirect.protocol,
                slashes: true,
                hostname: config.redirect.hostname,
                port: config.redirect.port,
                pathname: "/cb/code"
            })));
        });
        this.app.get("/cb/code", (req, res) => {
            Promise.resolve((() => __awaiter(this, void 0, void 0, function* () {
                const user = yield api_1.token(req.query.code, config);
                const api = new api_1.default({
                    token: user.accessToken
                });
                const profile = (yield api.getMyProfile());
                user.spotifyId = profile.id;
                if ((yield global.User.countDocuments({ spotifyId: profile.id })) >= 1) {
                    yield user.remove();
                    return yield global.User.findOne({ spotifyId: profile.id })
                        .exec();
                }
                return user.save();
            }))())
                .then((user) => {
                res.redirect(`/api/${user.spotifyId}/token`);
            });
        });
        const apiRouter = express_1.default.Router();
        apiRouter.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });
        apiRouter.use("/token", (req, res) => {
            if (req.accepts("json")) {
                res
                    .status(200)
                    .json(req.api);
            }
        });
        apiRouter.use("/currently-playing", currently_playing_1.default());
        this.app.use("/api/:userId", (req, res, next) => {
            Promise.resolve((() => __awaiter(this, void 0, void 0, function* () {
                if (yield global.User.exists({ spotifyId: req.params.userId })) {
                    const user = yield global.User.findOne({ spotifyId: req.params.userId });
                    req.api = new api_1.default({
                        token: user.accessToken
                    });
                    return;
                }
                else
                    throw new Error("userid does not exist");
            }))())
                .then(() => {
                next();
            })
                .catch((err) => {
                next(err);
            });
        }, apiRouter);
        Promise.resolve((() => __awaiter(this, void 0, void 0, function* () {
            const expired = yield global.User.find({
                expires: {
                    $lte: new Date()
                }
            })
                .exec();
            expired.forEach(user => {
                api_1.refreshToken(user, config);
            });
            const unexpired = yield global.User.find({
                expires: {
                    $gt: new Date()
                }
            })
                .exec();
            unexpired.forEach(user => {
                api_1.updateTimeout(user, config);
            });
        }))());
        config.nunjucks.express = this.app;
        nunjucks_1.default(config.nunjucks, path_1.default.join(__dirname, '../../view'));
        this.app.listen(config.port);
    }
}
exports.default = App;
//# sourceMappingURL=index.js.map