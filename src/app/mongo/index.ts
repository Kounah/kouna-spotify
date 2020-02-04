import mongoose, { ConnectionOptions } from "mongoose";

export interface MongoConfig {
  connection: {
    url: string;
    options: ConnectionOptions;
  }
}

export default function mongoInit(config: MongoConfig) {
  mongoose.connect(config.connection.url, config.connection.options);
}