import {Client} from "twitter-api-sdk";
import dotenv from "dotenv";
import {sendTweetToQueue} from "./rabbitMqService";

dotenv.config();

export const startSteam = async () => {
    const client = new Client(process.env.TWITTER_BEARER_TOKEN as string);
    await client.tweets.addOrDeleteRules(
        {
            add: [
                {
                    value: 'context:174.1007360414114435072 -is:retweet -is:reply lang:en -has:links',
                    tag: 'BTC'
                },
                {
                    value: 'context:174.1007361429752594432 -is:retweet -is:reply lang:en -has:links',
                    tag: 'ETH'
                },
                {
                    value: 'context:174.1007349748829786112 -is:retweet -is:reply lang:en -has:links',
                    tag: 'XRP'
                },
                {
                    value: 'context:174.1468157909318045697 -is:retweet -is:reply lang:en -has:links',
                    tag: 'SOL'
                }
            ],

        }
    );
    const stream = client.tweets.searchStream({
        "tweet.fields": ["author_id", "geo", "text", "entities", "created_at", "non_public_metrics", "public_metrics"],

    });
    for await (const tweet of stream) {
        const text = tweet.data?.text;
        if (text) {
            sendTweetToQueue(tweet);
        }
    }
}

export const getRules = async () => {
    const client = new Client(process.env.TWITTER_BEARER_TOKEN as string);
    const rules = await client.tweets.getRules();
    console.log(rules);
}

export const deleteAllRules = async () => {
    const client = new Client(process.env.TWITTER_BEARER_TOKEN as string);
    const rules = await client.tweets.getRules();
    client.tweets.addOrDeleteRules(
        {
            delete: {ids: rules.data.map((rule: any) => rule.id)}

        }
    ).then(rules => console.log('Deleted', rules));

}
