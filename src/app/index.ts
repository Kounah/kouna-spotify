import express from "express";
import path from "path";
import url from "url";
import Api, { token, refreshToken, updateTimeout } from "../api/api";
import AppConfig from "./config";
import createCurrentlyPlayingRouter from "./currently-playing";
import mongoInit from "./mongo";
import configureNunjucks from "./nunjucks";
import { User } from "./mongo/models/user";

export type Middleware = (req: express.Request, res: express.Response, next?: express.NextFunction) => void;

declare global {
  namespace Express {
    export interface Request {
      api: Api
    }
  }
}

export default class App {
  protected app: express.Express;
  protected api: Api;

  constructor(config: AppConfig) {
    mongoInit(config.mongo);

    this.app = express();

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
        "&redirect_uri=" + encodeURIComponent(url.format({
          protocol: config.redirect.protocol,
          slashes: true,
          hostname: config.redirect.hostname,
          port: config.redirect.port,
          pathname: "/cb/code"
        })));
    });

    this.app.get("/cb/code", (req, res) => {
      Promise.resolve((async () => {
        const user = await token(req.query.code, config);
        const api = new Api({
          token: user.accessToken
        });

        const profile = (await api.getMyProfile());
        user.spotifyId = profile.id;

        if(await User.exists({spotifyId: profile.id})) {
          await user.remove();

          return await User.findOne(profile.id)
            .exec()
        }

        return user.save();
      })())
        .then((user) => {
          res.redirect(`/api/${user.spotifyId}/token`)
        });
    });

    const apiRouter = express.Router();
    apiRouter.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
    })
    apiRouter.use("/token", (req, res) => {
      if(req.accepts("json")) {
        res
          .status(200)
          .json(req.api);
      }
    })
    apiRouter.use("/currently-playing", createCurrentlyPlayingRouter());

    this.app.use<{userId: string}>("/api/:userId", (req, res, next) => {
      Promise.resolve((async () => {
        if(await global.User.exists({spotifyId: req.params.userId})) {
          const user = await global.User.findOne({spotifyId: req.params.userId});
          req.api = new Api({
            token: user.accessToken
          });

          return;
        } else throw new Error("userid does not exist");
      })())
        .then(() => {
          next();
        })
        .catch((err) => {
          next(err);
        })
    }, apiRouter);

    Promise.resolve((async () => {
      const expired = await User.find({
        expires: {
          $lte: new Date()
        }
      })
        .exec()

      expired.forEach(user => {
        refreshToken(user, config);
      })

      const unexpired = await User.find({
        expires: {
          $gt: new Date()
        }
      })
        .exec()

      unexpired.forEach(user => {
        updateTimeout(user, config);
      })
    })())

    config.nunjucks.express = this.app;
    configureNunjucks(config.nunjucks, path.join(__dirname, '../../view'))

    this.app.listen(config.port);
  }
}