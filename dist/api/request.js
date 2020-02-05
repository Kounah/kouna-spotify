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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const url = __importStar(require("url"));
const form_urlencoded_1 = __importDefault(require("form-urlencoded"));
class ResponseParser {
    constructor(response) {
        this.res = response;
    }
    status(fn) {
        if (!fn(this.res.statusCode)) {
            this.raw()
                .then(content => {
                try {
                    console.error(`invalid status code: ${this.res.statusCode}`, JSON.parse(content));
                }
                catch (err) {
                    console.error(`invalid status code: ${this.res.statusCode}`, content);
                }
            });
            throw new Error(`invalid status code: ${this.res.statusCode} ${this.res.statusMessage}`);
        }
        return this;
    }
    raw() {
        return new Promise((resolve, reject) => {
            let content = "";
            this.res.on("data", (chunk) => {
                content += chunk;
            });
            this.res.on("error", (err) => {
                console.error(err);
                reject(err);
            });
            this.res.on("close", () => {
                resolve(content);
            });
        });
    }
    json() {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.parse(yield this.raw());
        });
    }
}
exports.ResponseParser = ResponseParser;
function request(options) {
    if (typeof options.url !== "undefined") {
        if (typeof options.url === "string") {
            options.url = url.parse(options.url);
        }
        options.protocol = options.url.protocol;
        options.auth = options.url.auth;
        options.hostname = options.url.hostname;
        options.port = options.url.port;
        options.path = options.url.pathname + (options.url.search ? options.url.search : "");
    }
    if (typeof options.headers !== "object")
        options.headers = {};
    return new Promise((resolve, reject) => {
        let r = http.request;
        if (options.protocol === "https:") {
            r = https.request;
        }
        if (typeof options.json !== "undefined") {
            options.headers["Content-Type"] = "application/json; charset=utf-8";
            options.body = JSON.stringify(options.json);
        }
        if (typeof options.form !== "undefined") {
            options.headers["Content-Type"] = "application/x-www-form-urlencoded";
            options.body = form_urlencoded_1.default(options.form);
        }
        const req = r(options, (res) => {
            resolve(res);
        });
        if (options.body instanceof Buffer) {
            req.write(options.body);
        }
        else if (typeof options.body === "string") {
            req.write(options.body);
        }
        req.end();
    });
}
exports.default = request;
//# sourceMappingURL=request.js.map