import amqplib from "amqplib";

export const sendTweetToQueue = async (tweet: any) => {
    const queue = 'tweetsGeneric';
    const conn = await amqplib.connect('amqp://guest:guest@10.2.113.62:5672/');
    const ch2 = await conn.createChannel();
    const ok = ch2.assertQueue(queue, {durable: false});
    ok.then(() => ch2.sendToQueue(queue, Buffer.from(JSON.stringify(tweet)))).then(() => console.log(`Added to ${queue}`))
}

