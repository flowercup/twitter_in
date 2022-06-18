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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTweetToQueue = void 0;
const amqplib = require('amqplib');
const sendTweetToQueue = (tweet) => __awaiter(void 0, void 0, void 0, function* () {
    const queue = 'tweetsGeneric';
    const conn = yield amqplib.connect('amqp://guest:guest@10.2.113.62:5672/');
    const ch2 = yield conn.createChannel();
    const ok = ch2.assertQueue(queue, { durable: false });
    ok.then(() => ch2.sendToQueue(queue, Buffer.from(JSON.stringify(tweet))));
});
exports.sendTweetToQueue = sendTweetToQueue;
