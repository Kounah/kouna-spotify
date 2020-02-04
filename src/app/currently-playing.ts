import Api, { CurrentlyPlaying } from "../api/api";
import express from "express";
import { Middleware } from ".";

declare global {
  namespace Express {
    export interface Request {
      currentlyPlaying?: CurrentlyPlaying;
    }
  }
}

export function createGetCurrentlyPlayingMiddleware(): Middleware {
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

export function createCurrentlyPlayingArtistsEndpoint(): Middleware {
  return (req, res) => {
    res.status(200);

    if(req.accepts("html")) {
      return res.render("currently-playing/artists.html", {
        artists: req.currentlyPlaying.item.artists.map(artist => artist.name)
      });
    }

    if(req.accepts("json")) {
      return res.json(req.currentlyPlaying.item.artists.map(artist => artist.name));
    }
  }
}

export default function createCurrentlyPlayingRouter() {
  const router = express.Router();

  router.use(createGetCurrentlyPlayingMiddleware());
  router.get("/artists", createCurrentlyPlayingArtistsEndpoint());

  return router;
}