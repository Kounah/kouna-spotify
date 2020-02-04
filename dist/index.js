"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("./config");
const app_1 = __importDefault(require("./app"));
const confPath = path.join(os.homedir(), ".spotify.json");
let config = config_1.defaultConfig;
if (fs.existsSync(confPath)) {
    config = JSON.parse(fs.readFileSync(confPath)
        .toString());
}
else {
    fs.writeFileSync(confPath, JSON.stringify(config_1.defaultConfig, null, "  "));
}
const app = new app_1.default(config.app);
//# sourceMappingURL=index.js.map