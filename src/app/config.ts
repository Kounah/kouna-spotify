import { NunjucksConfig } from "./nunjucks";
import { MongoConfig } from "./mongo";

export default interface AppConfig {
  clientId: string;
  port: number;
  nunjucks: NunjucksConfig;
  redirect: {
    protocol: "http" | "https";
    hostname: string;
    port: number;
  },
  mongo: MongoConfig
}