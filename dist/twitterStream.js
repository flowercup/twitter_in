"use strict";
// Open a realtime stream of Tweets, filtered according to rules
// https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/quick-start
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenToStream = void 0;
const needle = require('needle');
// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = 'AAAAAAAAAAAAAAAAAAAAADV6dwEAAAAAv5DOEXLDSBmRa1Xl0ypnxCH%2B6fc%3DWwRo6r0PulJR2zyejLbFgpJcwA7ZiYKnqrodd1vR5WjTutnMqu';
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';
// this sets up two rules - the value is the search terms to match on, and the tag is an identifier that
// will be applied to the Tweets return to show which rule they matched
// with a standard project with Basic Access, you can add up to 25 concurrent rules to your stream, and
// each rule can be up to 512 characters long
// Edit rules as desired below
const rules = [{
        'value': 'bitcoin',
        'tag': 'bitcoin rule'
    },
];
function getAllRules() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield needle('get', rulesURL, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        });
        if (response.statusCode !== 200) {
            console.log("Error:", response.statusMessage, response.statusCode);
            throw new Error(response.body);
        }
        return (response.body);
    });
}
function deleteAllRules(rules) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Array.isArray(rules.data)) {
            return null;
        }
        const ids = rules.data.map((rule) => rule.id);
        const data = {
            "delete": {
                "ids": ids
            }
        };
        const response = yield needle('post', rulesURL, data, {
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
        if (response.statusCode !== 200) {
            throw new Error(response.body);
        }
        return (response.body);
    });
}
function setRules() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            "add": rules
        };
        const response = yield needle('post', rulesURL, data, {
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${token}`
            }
        });
        if (response.statusCode !== 201) {
            throw new Error(response.body);
        }
        return (response.body);
    });
}
function streamConnect(retryAttempt) {
    const stream = needle.get(streamURL, {
        headers: {
            "User-Agent": "v2FilterStreamJS",
            "Authorization": `Bearer ${token}`
        },
        timeout: 20000
    });
    stream.on('data', (data) => {
        console.log('data');
        try {
            const json = JSON.parse(data);
            console.log(json);
            // A successful connection resets retry count.
            retryAttempt = 0;
        }
        catch (e) {
            if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
                console.log(data.detail);
                process.exit(1);
            }
            else {
                // Keep alive signal received. Do nothing.
            }
        }
    }).on('err', (error) => {
        if (error.code !== 'ECONNRESET') {
            console.log(error.code);
            process.exit(1);
        }
        else {
            // This reconnection logic will attempt to reconnect when a disconnection is detected.
            // To avoid rate limits, this logic implements exponential backoff, so the wait time
            // will increase if the client cannot reconnect to the stream.
            setTimeout(() => {
                console.warn("A connection error occurred. Reconnecting...");
                streamConnect(++retryAttempt);
            }, 2 ** retryAttempt);
        }
    });
    return stream;
}
const listenToStream = () => __awaiter(void 0, void 0, void 0, function* () {
    let currentRules;
    try {
        // Gets the complete list of rules currently applied to the stream
        currentRules = yield getAllRules();
        // Delete all rules. Comment the line below if you want to keep your existing rules.
        yield deleteAllRules(currentRules);
        // Add rules to the stream. Comment the line below if you don't want to add new rules.
        yield setRules();
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
    // Listen to the stream.
    streamConnect(0);
});
exports.listenToStream = listenToStream;
