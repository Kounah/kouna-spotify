import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { defaultConfig, Config } from "./config";
import Api from "./api/api";
import App from "./app";

const confPath = path.join(os.homedir(), ".spotify.json");
let config: Config = defaultConfig;

if(fs.existsSync(confPath)) {
  config = JSON.parse(fs.readFileSync(confPath)
    .toString()) as Config;
} else {
  fs.writeFileSync(confPath, JSON.stringify(defaultConfig, null, "  "));
}

const app = new App(config.app);
