import mongoose, { ConnectionOptions, Model } from "mongoose";
import { IUser, User } from "./models/user";
export interface MongoConfig {
  connection: {
    url: string;
    options: ConnectionOptions;
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      User: Model<IUser>
    }
  }
}

export default function mongoInit(config: MongoConfig) {
  mongoose.connect(config.connection.url, config.connection.options);

  global.User = User;
}