"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
exports.userSchema = new mongoose_1.default.Schema({
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
exports.userModelName = "User";
exports.User = mongoose_1.default.model(exports.userModelName, exports.userSchema);
//# sourceMappingURL=user.js.map