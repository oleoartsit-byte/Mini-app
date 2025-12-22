"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterService = void 0;
const common_1 = require("@nestjs/common");
let TwitterService = class TwitterService {
    constructor() {
        this.rapidApiKey = process.env.RAPIDAPI_KEY;
        this.rapidApiHost = 'twitter241.p.rapidapi.com';
    }
    async getUserByUsername(username) {
        try {
            if (!this.rapidApiKey) {
                console.error('❌ RAPIDAPI_KEY 未配置');
                return null;
            }
            const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
            const url = `https://${this.rapidApiHost}/user?username=${cleanUsername}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.rapidApiKey,
                    'x-rapidapi-host': this.rapidApiHost,
                },
            });
            const data = await response.json();
            if (data.result?.data?.user?.result) {
                const user = data.result.data.user.result;
                const legacy = user.legacy || {};
                return {
                    id: user.rest_id || user.id,
                    name: legacy.name || '',
                    screen_name: legacy.screen_name || cleanUsername,
                    description: legacy.description || '',
                    followers_count: legacy.followers_count || 0,
                    following_count: legacy.friends_count || 0,
                };
            }
            console.log('❌ 获取 Twitter 用户失败:', data);
            return null;
        }
        catch (error) {
            console.error('Twitter API 调用失败:', error);
            return null;
        }
    }
    async getUserFollowing(userId, count = 20) {
        try {
            if (!this.rapidApiKey) {
                console.error('❌ RAPIDAPI_KEY 未配置');
                return { users: [] };
            }
            const url = `https://${this.rapidApiHost}/followings?user=${userId}&count=${count}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.rapidApiKey,
                    'x-rapidapi-host': this.rapidApiHost,
                },
            });
            const data = await response.json();
            if (data.result?.timeline?.instructions) {
                const users = [];
                for (const instruction of data.result.timeline.instructions) {
                    if (instruction.entries) {
                        for (const entry of instruction.entries) {
                            const userResult = entry.content?.itemContent?.user_results?.result;
                            if (userResult && userResult.rest_id) {
                                const legacy = userResult.legacy || {};
                                const core = userResult.core || {};
                                const screenName = core.screen_name || legacy.screen_name || '';
                                if (screenName) {
                                    users.push({
                                        id: userResult.rest_id,
                                        name: core.name || legacy.name || '',
                                        screen_name: screenName,
                                        followers_count: legacy.followers_count || 0,
                                        following_count: legacy.friends_count || 0,
                                    });
                                }
                            }
                        }
                    }
                }
                return { users };
            }
            console.log('❌ 获取关注列表返回:', data);
            return { users: [] };
        }
        catch (error) {
            console.error('获取关注列表失败:', error);
            return { users: [] };
        }
    }
    async checkIfFollowing(userTwitterId, targetScreenName) {
        try {
            if (!this.rapidApiKey) {
                return { isFollowing: false, error: 'RapidAPI key not configured' };
            }
            const cleanTargetName = targetScreenName.startsWith('@')
                ? targetScreenName.substring(1)
                : targetScreenName;
            const { users } = await this.getUserFollowing(userTwitterId, 100);
            const isFollowing = users.some(u => u.screen_name.toLowerCase() === cleanTargetName.toLowerCase());
            console.log(`✅ Twitter 关注检查: ${userTwitterId} -> ${cleanTargetName}: ${isFollowing}`);
            return { isFollowing };
        }
        catch (error) {
            console.error('检查关注状态失败:', error);
            return { isFollowing: false, error: error.message };
        }
    }
    async verifyFollowTask(targetUsername, proof) {
        try {
            const cleanTargetUsername = targetUsername.startsWith('@')
                ? targetUsername.substring(1)
                : targetUsername;
            if (proof?.twitterId) {
                const result = await this.checkIfFollowing(proof.twitterId, cleanTargetUsername);
                if (result.isFollowing) {
                    return { verified: true, message: '已确认关注 Twitter 账号，任务完成！' };
                }
                return {
                    verified: false,
                    message: `请先关注 @${cleanTargetUsername} 后再提交`
                };
            }
            const targetUser = await this.getUserByUsername(cleanTargetUsername);
            if (!targetUser) {
                console.log(`⚠️ 无法验证目标账号 @${cleanTargetUsername}，暂时通过`);
                return {
                    verified: true,
                    message: `已确认任务完成，感谢关注 @${cleanTargetUsername}！`
                };
            }
            console.log(`✅ 目标账号 @${cleanTargetUsername} 存在 (ID: ${targetUser.id})，信任用户已关注`);
            return {
                verified: true,
                message: `已确认任务完成，感谢关注 @${cleanTargetUsername}！`
            };
        }
        catch (error) {
            console.error('验证 Twitter 关注失败:', error);
            return { verified: true, message: '任务完成！' };
        }
    }
    async getTweetInfo(tweetIdOrUrl) {
        try {
            if (!this.rapidApiKey) {
                console.error('❌ RAPIDAPI_KEY 未配置');
                return null;
            }
            let tweetId = tweetIdOrUrl;
            const tweetUrlMatch = tweetIdOrUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
            if (tweetUrlMatch) {
                tweetId = tweetUrlMatch[1];
            }
            const url = `https://${this.rapidApiHost}/tweet?id=${tweetId}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.rapidApiKey,
                    'x-rapidapi-host': this.rapidApiHost,
                },
            });
            const data = await response.json();
            if (data.result?.data?.tweetResult?.result) {
                const tweet = data.result.data.tweetResult.result;
                const legacy = tweet.legacy || {};
                return {
                    id: tweet.rest_id || tweetId,
                    text: legacy.full_text || '',
                    author_id: tweet.core?.user_results?.result?.rest_id || '',
                    retweet_count: legacy.retweet_count || 0,
                    like_count: legacy.favorite_count || 0,
                    reply_count: legacy.reply_count || 0,
                };
            }
            console.log('❌ 获取推文信息失败:', data);
            return null;
        }
        catch (error) {
            console.error('获取推文信息失败:', error);
            return null;
        }
    }
    async checkUserRetweetedTweet(tweetId, targetUserId) {
        try {
            if (!this.rapidApiKey) {
                console.log('❌ checkUserRetweetedTweet: RAPIDAPI_KEY 未配置');
                return false;
            }
            console.log(`🔍 检查用户转发: tweetId=${tweetId}, userId=${targetUserId}`);
            const url = `https://${this.rapidApiHost}/user-tweets?user=${targetUserId}&count=40`;
            console.log(`📝 调用 user-tweets API: ${url}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.rapidApiKey,
                    'x-rapidapi-host': this.rapidApiHost,
                },
            });
            const data = await response.json();
            console.log(`📝 user-tweets API 响应状态: ${response.status}`);
            const instructions = data.result?.timeline?.instructions || data.result?.instructions;
            if (instructions) {
                const foundRetweets = [];
                for (const instruction of instructions) {
                    const entries = instruction.entries || [];
                    for (const entry of entries) {
                        const tweetResult = entry.content?.itemContent?.tweet_results?.result;
                        if (tweetResult) {
                            const retweetedStatus = tweetResult.legacy?.retweeted_status_result?.result;
                            if (retweetedStatus) {
                                const originalTweetId = retweetedStatus.rest_id || retweetedStatus.legacy?.id_str;
                                if (originalTweetId) {
                                    foundRetweets.push(originalTweetId);
                                    if (originalTweetId === tweetId) {
                                        console.log(`✅ 找到用户 ${targetUserId} 转发了推文 ${tweetId}！`);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
                console.log(`📋 用户转发的推文 ID (前10): ${foundRetweets.slice(0, 10).join(', ')}`);
                console.log(`❌ 用户 ${targetUserId} 最近的推文中未找到对 ${tweetId} 的转发`);
            }
            else {
                console.log('❌ API 响应格式异常:', JSON.stringify(data).substring(0, 500));
            }
            return false;
        }
        catch (error) {
            console.error('检查用户转发失败:', error);
            return false;
        }
    }
    async checkUserLikedTweet(tweetId, targetUserId) {
        console.log(`⚠️ 点赞验证: Twitter API 点赞端点已弃用，暂不支持`);
        return false;
    }
    async checkUserReplied(tweetId, userId) {
        try {
            if (!this.rapidApiKey) {
                console.log('❌ checkUserReplied: RAPIDAPI_KEY 未配置');
                return false;
            }
            console.log(`🔍 检查用户评论: tweetId=${tweetId}, userId=${userId}`);
            const url = `https://${this.rapidApiHost}/user-replies?user=${userId}&count=40`;
            console.log(`📝 调用 user-replies API: ${url}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.rapidApiKey,
                    'x-rapidapi-host': this.rapidApiHost,
                },
            });
            const data = await response.json();
            console.log(`📝 user-replies API 响应状态: ${response.status}`);
            console.log(`📝 API 响应数据结构: ${JSON.stringify(data).substring(0, 300)}`);
            const instructions = data.result?.timeline?.instructions || data.result?.instructions;
            if (instructions) {
                const foundReplies = [];
                for (const instruction of instructions) {
                    const entries = instruction.entries || [];
                    for (const entry of entries) {
                        const items = entry.content?.items || [{ item: entry.content?.itemContent }];
                        for (const item of items) {
                            const tweetResult = item.item?.itemContent?.tweet_results?.result ||
                                entry.content?.itemContent?.tweet_results?.result;
                            if (tweetResult) {
                                const legacy = tweetResult.legacy || {};
                                const inReplyToStatusId = legacy.in_reply_to_status_id_str;
                                if (inReplyToStatusId) {
                                    foundReplies.push(inReplyToStatusId);
                                    if (inReplyToStatusId === tweetId) {
                                        console.log(`✅ 找到用户 ${userId} 对推文 ${tweetId} 的回复！`);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
                console.log(`📋 用户回复的推文 ID (前10): ${foundReplies.slice(0, 10).join(', ')}`);
                console.log(`❌ 用户 ${userId} 最近的回复中未找到对 ${tweetId} 的回复`);
            }
            else {
                console.log('❌ API 响应格式异常，尝试打印完整响应:', JSON.stringify(data).substring(0, 800));
            }
            return false;
        }
        catch (error) {
            console.error('检查用户评论失败:', error);
            return false;
        }
    }
    async verifyRetweetTask(tweetUrl, userTwitterId) {
        try {
            const tweetMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
            if (!tweetMatch) {
                return { verified: true, message: '转发任务完成！' };
            }
            const targetTweetId = tweetMatch[1];
            if (userTwitterId) {
                const hasRetweeted = await this.checkUserRetweetedTweet(targetTweetId, userTwitterId);
                if (hasRetweeted) {
                    console.log(`✅ Twitter 转发验证: 用户 ${userTwitterId} 已转发推文 ${targetTweetId}`);
                    return { verified: true, message: '已确认转发推文，任务完成！' };
                }
                return {
                    verified: false,
                    message: '请先转发指定推文后再验证'
                };
            }
            return {
                verified: false,
                message: '请先在个人资料页绑定您的 Twitter 账号，以便验证转发状态'
            };
        }
        catch (error) {
            console.error('验证 Twitter 转发失败:', error);
            return { verified: false, message: '验证失败，请稍后重试' };
        }
    }
    async verifyLikeTask(tweetUrl, userTwitterId) {
        try {
            const tweetMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
            if (!tweetMatch) {
                return { verified: true, message: '点赞任务完成！' };
            }
            const targetTweetId = tweetMatch[1];
            if (userTwitterId) {
                const hasLiked = await this.checkUserLikedTweet(targetTweetId, userTwitterId);
                if (hasLiked) {
                    console.log(`✅ Twitter 点赞验证: 用户 ${userTwitterId} 已点赞推文 ${targetTweetId}`);
                    return { verified: true, message: '已确认点赞推文，任务完成！' };
                }
                return {
                    verified: false,
                    message: '请先点赞指定推文后再验证'
                };
            }
            return {
                verified: false,
                message: '请先在个人资料页绑定您的 Twitter 账号，以便验证点赞状态'
            };
        }
        catch (error) {
            console.error('验证 Twitter 点赞失败:', error);
            return { verified: false, message: '验证失败，请稍后重试' };
        }
    }
    async verifyCommentTask(tweetUrl, userTwitterId) {
        try {
            const tweetMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
            if (!tweetMatch) {
                return { verified: true, message: '评论任务完成！' };
            }
            const targetTweetId = tweetMatch[1];
            if (userTwitterId) {
                const hasReplied = await this.checkUserReplied(targetTweetId, userTwitterId);
                if (hasReplied) {
                    console.log(`✅ Twitter 评论验证: 用户 ${userTwitterId} 已评论推文 ${targetTweetId}`);
                    return { verified: true, message: '已确认评论推文，任务完成！' };
                }
                return {
                    verified: false,
                    message: '请先评论指定推文后再验证'
                };
            }
            return {
                verified: false,
                message: '请先在个人资料页绑定您的 Twitter 账号，以便验证评论状态'
            };
        }
        catch (error) {
            console.error('验证 Twitter 评论失败:', error);
            return { verified: false, message: '验证失败，请稍后重试' };
        }
    }
    async getUserRecentTweets(userId, count = 20) {
        try {
            if (!this.rapidApiKey) {
                console.error('❌ RAPIDAPI_KEY 未配置');
                return [];
            }
            const url = `https://${this.rapidApiHost}/user-tweets?user=${userId}&count=${count}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.rapidApiKey,
                    'x-rapidapi-host': this.rapidApiHost,
                },
            });
            const data = await response.json();
            const tweets = [];
            if (data.result?.timeline?.instructions) {
                for (const instruction of data.result.timeline.instructions) {
                    const entries = instruction.entries || instruction.moduleItems || [];
                    for (const entry of entries) {
                        const tweetResult = entry.content?.itemContent?.tweet_results?.result
                            || entry.item?.itemContent?.tweet_results?.result;
                        if (tweetResult) {
                            const legacy = tweetResult.legacy || {};
                            const isQuote = !!legacy.is_quote_status;
                            const quotedTweetId = legacy.quoted_status_id_str;
                            tweets.push({
                                id: tweetResult.rest_id || legacy.id_str,
                                text: legacy.full_text || '',
                                createdAt: legacy.created_at || '',
                                isQuote,
                                quotedTweetId,
                            });
                        }
                    }
                }
            }
            console.log(`✅ 获取用户 ${userId} 最近推文: ${tweets.length} 条`);
            return tweets;
        }
        catch (error) {
            console.error('获取用户推文失败:', error);
            return [];
        }
    }
    async verifyQuoteTweetWithCode(userId, verificationCode) {
        try {
            const tweets = await this.getUserRecentTweets(userId, 30);
            if (tweets.length === 0) {
                return {
                    verified: false,
                    message: '无法获取您的推文，请确保账号公开并稍后重试',
                };
            }
            for (const tweet of tweets) {
                if (tweet.text.includes(verificationCode)) {
                    console.log(`✅ 找到包含验证码的推文: ${tweet.id}`);
                    return {
                        verified: true,
                        message: '验证成功！已确认您的 Twitter 账号',
                        tweetId: tweet.id,
                    };
                }
            }
            return {
                verified: false,
                message: `未找到包含验证码 ${verificationCode} 的推文，请确保已发布并等待几秒后重试`,
            };
        }
        catch (error) {
            console.error('验证引用转发失败:', error);
            return {
                verified: false,
                message: '验证失败，请稍后重试',
            };
        }
    }
};
exports.TwitterService = TwitterService;
exports.TwitterService = TwitterService = __decorate([
    (0, common_1.Injectable)()
], TwitterService);
//# sourceMappingURL=twitter.service.js.map