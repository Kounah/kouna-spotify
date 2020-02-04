"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importStar(require("./request"));
class Api {
    constructor(config) {
        this.token = config.token;
    }
    getCurentlyPlaying() {
        return __awaiter(this, void 0, void 0, function* () {
            const track = new request_1.ResponseParser(yield request_1.default({
                url: "https://api.spotify.com/v1/me/player/currently-playing",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                },
                "method": "GET"
            }))
                .status((status) => status > -200 && status < 300)
                .json();
            return track;
        });
    }
}
exports.default = Api;
//# sourceMappingURL=api.js.map