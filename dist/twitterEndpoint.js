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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllRules = exports.getRules = exports.startSteam = void 0;
const twitter_api_sdk_1 = require("twitter-api-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
const rabbitMq_1 = require("./rabbitMq");
dotenv_1.default.config();
const startSteam = () => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    var _b;
    const client = new twitter_api_sdk_1.Client(process.env.TWITTER_BEARER_TOKEN);
    yield client.tweets.addOrDeleteRules({
        add: [
            {
                value: 'context:174.1007360414114435072 -is:retweet -is:reply lang:en -has:links',
                tag: 'crypto filter'
            },
            {
                value: 'context:174.1007361429752594432 -is:retweet -is:reply lang:en -has:links',
                tag: 'crypto filter'
            },
            {
                value: 'context:174.1007349748829786112 -is:retweet -is:reply lang:en -has:links',
                tag: 'crypto filter'
            },
            {
                value: 'context:174.1468157909318045697 -is:retweet -is:reply lang:en -has:links',
                tag: 'crypto filter'
            }
        ],
    });
    const rules = yield client.tweets.getRules();
    console.log(rules);
    const stream = client.tweets.searchStream({
        "tweet.fields": ["author_id", "geo", "text", "entities", "created_at", "non_public_metrics", "public_metrics"],
    });
    try {
        for (var stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), !stream_1_1.done;) {
            const tweet = stream_1_1.value;
            const text = (_b = tweet.data) === null || _b === void 0 ? void 0 : _b.text;
            console.log(JSON.stringify(tweet));
            if (text) {
                (0, rabbitMq_1.sendTweetToQueue)(tweet);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (stream_1_1 && !stream_1_1.done && (_a = stream_1.return)) yield _a.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
});
exports.startSteam = startSteam;
const getRules = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = new twitter_api_sdk_1.Client(process.env.TWITTER_BEARER_TOKEN);
    const rules = yield client.tweets.getRules();
    console.log(rules);
});
exports.getRules = getRules;
const deleteAllRules = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = new twitter_api_sdk_1.Client(process.env.TWITTER_BEARER_TOKEN);
    const rules = yield client.tweets.getRules();
    client.tweets.addOrDeleteRules({
        delete: { ids: rules.data.map((rule) => rule.id) }
    }).then(rules => console.log('Deleted', rules));
});
exports.deleteAllRules = deleteAllRules;
