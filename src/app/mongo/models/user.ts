import mongoose, { Model } from "mongoose";

export interface IUser extends mongoose.Document {
  token: string;
  spotifyId: string;
}

export const userSchema = new mongoose.Schema({
  token: {
    type: String
  },
  spotifyId: {
    type: String
  }
}, {
  timestamps: {
    createdAt: "created",
    updatedAt: "updated"
  }
});

export const userModelName = "User";
export const User = mongoose.model<IUser>(userModelName, userSchema);

declare global {
  namespace NodeJS {
    interface Global {
      User: Model<IUser>
    }
  }
}

global.User = User;