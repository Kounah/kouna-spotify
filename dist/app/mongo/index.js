"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("./models/user");
function mongoInit(config) {
    mongoose_1.default.connect(config.connection.url, config.connection.options);
    global.User = user_1.User;
}
exports.default = mongoInit;
//# sourceMappingURL=index.js.map