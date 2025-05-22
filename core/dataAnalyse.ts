import {Api} from "./api.ts";
import type {tags} from "../types/dataAnalyse.types.ts";

export class DataAnalyse {

    private api: Api = new Api();

    public async analysesposts(subreddit: string) {

        const data = await this.api.getTopPosts(subreddit, 1000, 'year');
        let tags: tags[] = [];

        data.map((post) => {
            if (!tags.some(value => value.tag === post.data.link_flair_text)) {
                tags.push({
                    tag: post.data.link_flair_text,
                    amount: 0,
                })
            }
        });

        data.map((post) => {
            tags.map(tag => {
                if(tag.tag === post.data.link_flair_text) {
                    tag.amount++;
                }
            })
        });

        console.log('total posts analysed: ', data.length);
        console.log(`amount of tags: ${tags.length}`);
        console.log(tags.sort((a, b) => b.amount - a.amount));
    }

}