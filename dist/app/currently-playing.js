"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
function createGetCurrentlyPlayingMiddleware() {
    return (req, res, next) => {
        req.api.getCurentlyPlaying()
            .then((result) => {
            req.currentlyPlaying = result;
            next();
        })
            .catch((err) => {
            next(err);
        });
    };
}
exports.createGetCurrentlyPlayingMiddleware = createGetCurrentlyPlayingMiddleware;
function createCurrentlyPlayingArtistsEndpoint() {
    return (req, res) => {
        res.status(200);
        if (req.accepts("html")) {
            return res.render("currently-playing/artists.html", {
                artists: req.currentlyPlaying.item.artists.map(artist => artist.name)
            });
        }
        if (req.accepts("json")) {
            return res.json(req.currentlyPlaying.item.artists.map(artist => artist.name));
        }
    };
}
exports.createCurrentlyPlayingArtistsEndpoint = createCurrentlyPlayingArtistsEndpoint;
function createCurrentlyPlayingRouter() {
    const router = express_1.default.Router();
    router.use(createGetCurrentlyPlayingMiddleware());
    router.get("/artists", createCurrentlyPlayingArtistsEndpoint());
    return router;
}
exports.default = createCurrentlyPlayingRouter;
//# sourceMappingURL=currently-playing.js.map