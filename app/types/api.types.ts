export interface accessToken {
    access_token: string | null
}

export interface RedditPost {
    kind: string;
    data: Record<string, any>;
}

export interface RedditListingResponse {
    data: {
        after: string | null;
        children: RedditPost[];
    };
}