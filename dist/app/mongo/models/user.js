"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
exports.userSchema = new mongoose_1.default.Schema({
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
exports.userModelName = "User";
exports.User = mongoose_1.default.model(exports.userModelName, exports.userSchema);
global.User = exports.User;
//# sourceMappingURL=user.js.map