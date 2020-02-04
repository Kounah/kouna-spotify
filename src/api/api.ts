import request, { ResponseParser } from "./request";

export interface ApiConfig {
  token: string;
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

  async getCurentlyPlaying() {
    const track = new ResponseParser(await request({
      url: "https://api.spotify.com/v1/me/player/currently-playing",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`
      },
      "method": "GET"
    }))
      .status((status) => status >- 200 && status < 300)
      .json();

    return track;
  }
}