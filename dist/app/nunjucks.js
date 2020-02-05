"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nunjucks_1 = __importDefault(require("nunjucks"));
function configureNunjucks(config, viewdir) {
    const nun = nunjucks_1.default.configure(viewdir, config);
    return nun;
}
exports.default = configureNunjucks;
//# sourceMappingURL=nunjucks.js.map