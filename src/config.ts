import AppConfig from "./app/config";

export interface Config {
  app: AppConfig;
}

export const defaultConfig: Config = {
  app: {
    clientId: "",
    clientSecret: "",
    nunjucks: { },
    port: 42069,
    redirect: {
      hostname: "",
      port: 42069,
      protocol: "https"
    },
    mongo: {
      connection: {
        url: "mongodb://127.0.0.1:27017/kouna-spotify",
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true
        }
      }
    }
  }
}
