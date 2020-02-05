import request, { ResponseParser } from "./request";
import AppConfig from "../app/config";
import { format } from "url";
import { IUser } from "../app/mongo/models/user";

export interface ApiConfig {
  code?: string;
  token?: string;
}

export interface Artist {
  external_urls: {[key: string]: string};
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface Image {
  height: number;
  width: number;
  url: string;
}

export interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  external_urls: {[key: string]: string};
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: Date | string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface Track {
  album: Album;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {[key: string]: string};
  external_urls: {[key: string]: string};
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export interface User {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean,
    filter_locked: boolean
  },
  external_urls: {[key: string]: string},
  followers: {
    href: string,
    total: number
  },
  href: string,
  id: string,
  images: Image[],
  product: "preium" | "free" | "open",
  type: string,
  uri: string
}

export interface CurrentlyPlaying {
  timestamp: number;
  item: Track;
  currently_playing_type: string;
  actions: any;
  is_playing: boolean;
}

export default class Api {
  private token: string;

  constructor(config: ApiConfig) {
    this.token = config.token;
  }

  headers() {
    return {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`
    }
  }

  async getMyCurentlyPlaying() {
    const track = new ResponseParser<CurrentlyPlaying>(await request({
      url: "https://api.spotify.com/v1/me/player/currently-playing",
      headers: this.headers(),
      method: "GET"
    }))
      .status((status) => status >= 200 && status < 300)
      .json();

    return track;
  }

  async getMyProfile() {
    const user = new ResponseParser<User>(await request({
      url: "https://api.spotify.com/v1/me",
      headers: this.headers(),
      method: "GET"
    }))
      .status((status) => status >= 200 && status < 300)
      .json()

    return user;
  }
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export const refreshTimeouts: Map<string, NodeJS.Timeout> = new Map();

export function expiryDate(expires: number) {
  const d = new Date();
  d.setSeconds(d.getSeconds() + expires);

  return d;
}

export function updateTimeout(user: IUser, config: AppConfig) {
  if(refreshTimeouts.has(user._id)) {
    clearTimeout(refreshTimeouts.get(user._id));
  }

  const delay = new Date().getTime() - user.expires.getTime();
  refreshTimeouts.set(user._id, setTimeout(() => {
    refreshToken(user, config);
  }, delay));
}

export async function token(code: string, config: AppConfig) {
  const t = await new ResponseParser<TokenResponse>(await request({
    url: "https://accounts.spotify.com/api/token",
    form: {
      grant_type: "authorization_code",
      code,
      redirect_uri: format({
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

  if(await global.User.exists({
    $or: [
      { code },
      { refreshToken: code }
    ]
  })) {
    const user = await global.User
      .findOne({
        $or: [
          { code },
          { refreshToken: code }
        ]
      })
      .exec();

    user.accessToken =  t.access_token,
    user.tokenType =  t.token_type,
    user.scope =  t.scope,
    user.expires =  expiryDate(t.expires_in),
    user.refreshToken =  t.refresh_token
    updateTimeout(user, config);

    return await user.save();
  } else {
    const user = await global.User.create({
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

}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

export async function refreshToken(user: IUser, config: AppConfig) {
  const t = await new ResponseParser<RefreshTokenResponse>(await request({
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

  user.accessToken =  t.access_token,
  user.tokenType = t.token_type;
  user.scope = t.scope;
  user.expires =  expiryDate(t.expires_in),
  updateTimeout(user, config);

  return await user.save();
}