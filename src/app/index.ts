import Api, { CurrentlyPlaying } from "../api/api";
import express from "express";
import createCurrentlyPlayingRouter from "./currently-playing";
import AppConfig from "./config";
import configureNunjucks from "./nunjucks";
import path from "path";
import url from "url";
import bodyParser from "body-parser";
import mongoInit from "./mongo";

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
      const scopes = 'user-read-private user-read-email';
      res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + config.clientId +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(url.format({
          protocol: config.redirect.protocol,
          slashes: true,
          hostname: config.redirect.hostname,
          port: config.redirect.port,
          pathname: "/login-complete"
        })));
    });

    this.app.get("/login-complete", bodyParser.json({
      type: "application/json"
    }), (req, res) => {
      console.log("cat");
    });

    const apiRouter = express.Router();
    apiRouter.use("/currently-playing", createCurrentlyPlayingRouter());

    this.app.use<{userId: string}>("/api/:userId", (req, res, next) => {
      Promise.resolve(async () => {
        if(await global.User.exists({spotifyId: req.params.userId})) {
          const user = await global.User.findOne({spotifyId: req.params.userId});
          req.api = new Api({
            token: user.token
          });

          return;
        } else throw new Error("userid does not exist");
      })
        .then(() => {
          next();
        })
        .catch((err) => {
          next(err);
        })
    }, apiRouter);

    config.nunjucks.express = this.app;
    configureNunjucks(config.nunjucks, path.join(__dirname, '../../view'))

    this.app.listen(config.port);
  }
}