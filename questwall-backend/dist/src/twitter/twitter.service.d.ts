interface TwitterUser {
    id: string;
    name: string;
    screen_name: string;
    description?: string;
    followers_count: number;
    following_count: number;
}
interface FollowingCheckResult {
    isFollowing: boolean;
    error?: string;
}
interface TweetInfo {
    id: string;
    text: string;
    author_id: string;
    retweet_count: number;
    like_count: number;
    reply_count: number;
}
export declare class TwitterService {
    private readonly rapidApiKey;
    private readonly rapidApiHost;
    getUserByUsername(username: string): Promise<TwitterUser | null>;
    getUserFollowing(userId: string, count?: number): Promise<{
        users: TwitterUser[];
        nextCursor?: string;
    }>;
    checkIfFollowing(userTwitterId: string, targetScreenName: string): Promise<FollowingCheckResult>;
    verifyFollowTask(targetUsername: string, proof?: {
        twitterUsername?: string;
        twitterId?: string;
        screenshotUrl?: string;
    }): Promise<{
        verified: boolean;
        message: string;
    }>;
    getTweetInfo(tweetIdOrUrl: string): Promise<TweetInfo | null>;
    checkUserRetweetedTweet(tweetId: string, targetUserId: string): Promise<boolean>;
    checkUserLikedTweet(tweetId: string, targetUserId: string): Promise<boolean>;
    checkUserReplied(tweetId: string, userId: string): Promise<boolean>;
    verifyRetweetTask(tweetUrl: string, userTwitterId?: string): Promise<{
        verified: boolean;
        message: string;
    }>;
    verifyLikeTask(tweetUrl: string, userTwitterId?: string): Promise<{
        verified: boolean;
        message: string;
    }>;
    verifyCommentTask(tweetUrl: string, userTwitterId?: string): Promise<{
        verified: boolean;
        message: string;
    }>;
    getUserRecentTweets(userId: string, count?: number): Promise<Array<{
        id: string;
        text: string;
        createdAt: string;
        isQuote: boolean;
        quotedTweetId?: string;
    }>>;
    verifyQuoteTweetWithCode(userId: string, verificationCode: string): Promise<{
        verified: boolean;
        message: string;
        tweetId?: string;
    }>;
}
export {};
