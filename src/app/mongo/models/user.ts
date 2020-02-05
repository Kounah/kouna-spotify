import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  code: string;
  spotifyId: string;
  accessToken: string;
  tokenType: string;
  scope: string;
  expires: Date;
  refreshToken: string;
}

export const userSchema = new mongoose.Schema({
  code: {
    type: String
  },
  spotifyId: {
    type: String
  },
  accessToken: {
    type: String
  },
  tokenType: {
    type: String
  },
  scope: {
    type: String
  },
  expires: {
    type: Date
  },
  refreshToken: {
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
