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
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../api/api"));
const express_1 = __importDefault(require("express"));
const currently_playing_1 = __importDefault(require("./currently-playing"));
const nunjucks_1 = __importDefault(require("./nunjucks"));
const path_1 = __importDefault(require("path"));
const url_1 = __importDefault(require("url"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongo_1 = __importDefault(require("./mongo"));
class App {
    constructor(config) {
        mongo_1.default(config.mongo);
        this.app = express_1.default();
        this.app.get("/login", (req, res) => {
            const scopes = 'user-read-private user-read-email';
            res.redirect('https://accounts.spotify.com/authorize' +
                '?response_type=code' +
                '&client_id=' + config.clientId +
                (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
                '&redirect_uri=' + encodeURIComponent(url_1.default.format({
                protocol: config.redirect.protocol,
                slashes: true,
                hostname: config.redirect.hostname,
                port: config.redirect.port,
                pathname: "/login-complete"
            })));
        });
        this.app.get("/login-complete", body_parser_1.default.json({
            type: "application/json"
        }), (req, res) => {
            console.log("cat");
        });
        const apiRouter = express_1.default.Router();
        apiRouter.use("/currently-playing", currently_playing_1.default());
        this.app.use("/api/:userId", (req, res, next) => {
            Promise.resolve(() => __awaiter(this, void 0, void 0, function* () {
                if (yield global.User.exists({ spotifyId: req.params.userId })) {
                    const user = yield global.User.findOne({ spotifyId: req.params.userId });
                    req.api = new api_1.default({
                        token: user.token
                    });
                    return;
                }
                else
                    throw new Error("userid does not exist");
            }))
                .then(() => {
                next();
            })
                .catch((err) => {
                next(err);
            });
        }, apiRouter);
        config.nunjucks.express = this.app;
        nunjucks_1.default(config.nunjucks, path_1.default.join(__dirname, '../../view'));
        this.app.listen(config.port);
    }
}
exports.default = App;
//# sourceMappingURL=index.js.map