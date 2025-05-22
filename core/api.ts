import type {accessToken, RedditListingResponse, RedditPost} from "../types/api.types.ts";

export class Api {

    constructor() {
        this.getAccessToken();
    }

    private accessToken: string | null = null;

    private clientId = process.env.CLIENT_ID;
    private clientSecret = process.env.CLIENT_SECRET;
    private username = process.env.REDDIT_USERNAME;
    private password = process.env.REDDIT_PASSWORD;

    private async getAccessToken() {
        const tokenUrl = 'https://www.reddit.com/api/v1/access_token';
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        try {
            const params = new URLSearchParams();
            params.set('grant_type', 'password');

            if (this.username && this.password) {
                params.set('username', this.username);
                params.set('password', this.password);
            } else {
                throw new Error('Username or password is undefined');
            }

            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'User-Agent': 'meinAppName/0.1 by ' + this.username,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Fehler beim Abrufen des Tokens:', errorData);
                return null;
            }

            const data = await response.json() as accessToken;
            this.accessToken = data.access_token;
        } catch (error: any) {
            console.error('Fehler beim Abrufen des Tokens:', error.message);
            return null;
        }
    }

    public async getTopPosts(
        subreddit: string,
        totalLimit: number = 300,
        timeFrame: string = 'month'
    ): Promise<RedditPost[]> {

        if (!this.accessToken) {
            await this.getAccessToken();
        }

        const accessToken = this.accessToken as string;
        const username = this.username as string;
        const allPosts: RedditPost[] = [];
        let after: string | null = null;

        while (allPosts.length < totalLimit) {
            const remaining = totalLimit - allPosts.length;
            const limit = remaining > 100 ? 100 : remaining;

            const url = new URL(`https://oauth.reddit.com/r/${subreddit}/new`);
            url.searchParams.append('t', timeFrame);
            url.searchParams.append('limit', limit.toString());
            if (after) {
                url.searchParams.append('after', after);
            }

            try {
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': `meinAppName/0.1 by ${username}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Fehler beim Abrufen der Posts:', errorData);
                    break;
                }

                const data: RedditListingResponse = await response.json() as RedditListingResponse;
                const children = data.data.children;

                if (children.length === 0) break;

                allPosts.push(...children);
                after = data.data.after;
                if (!after) break;

            } catch (err: any) {
                console.error('Fehler beim Abrufen der Posts:', err.message || err);
                break;
            }
        }

        return allPosts;
    }

}