import * as http from "http";
import * as https from "https";
import * as url from "url";


export interface RequestOptions extends http.RequestOptions {
  url: string | url.UrlWithStringQuery;
  body?: Buffer | string;
  encoding?: BufferEncoding;
  json?: any;
}

export class ResponseParser {
  private res: http.IncomingMessage;

  constructor(response: http.IncomingMessage) {
    this.res = response;
  }

  status(fn: (s: number) => boolean) {
    if(!fn(this.res.statusCode)) {
      this.raw()
        .then(content => {
          try {
            console.error(`invalid status code: ${this.res.statusCode}`, JSON.parse(content))
          } catch(err) {
            console.error(`invalid status code: ${this.res.statusCode}`, content)
          }
        })

      throw new Error(`invalid status code: ${this.res.statusCode} ${this.res.statusMessage}`);
    }

    return this;
  }

  raw() {
    return new Promise<string>((resolve, reject) => {
      let content = "";

      this.res.on("data", (chunk: Buffer) => {
        content += chunk;
      });

      this.res.on("error", (err) => {
        console.error(err);
        reject(err);
      })

      this.res.on("close", () => {
        resolve(content);
      })
    });
  }

  async json() {
    return JSON.parse(await this.raw());
  }
}

export default function request(options: RequestOptions) {
  if(typeof options.url !== "undefined") {
    if(typeof options.url === "string") {
      options.url = url.parse(options.url);
    }

    options.protocol = options.url.protocol;
    options.auth = options.url.auth;
    options.hostname = options.url.hostname;
    options.port = options.url.port;
    options.path = options.url.pathname + (options.url.search ? options.url.search : "");
  }

  return new Promise<http.IncomingMessage>((resolve, reject) => {
    let r = http.request;
    if(options.protocol === "https:") {
      r = https.request;
    }

    if(typeof options.json !== "undefined") {
      options.headers["Content-Type"] = "application/json; charset=utf-8";
      options.body = JSON.stringify(options.json);
    }

    const req = r(options, (res) => {
      resolve(res);
    });


    if(options.body instanceof Buffer) {
      req.write(options.body);
    } else if(typeof options.body === "string") {
      req.write(options.body);
    }

    req.end();
  });
}
