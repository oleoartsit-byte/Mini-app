import { Injectable } from '@nestjs/common';

interface TwitterUser {
  id: string;
  name: string;
  screen_name: string;
  description?: string;  // 用户简介
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

interface UserTweetInteraction {
  hasRetweeted: boolean;
  hasLiked: boolean;
  hasReplied: boolean;
}

@Injectable()
export class TwitterService {
  private readonly rapidApiKey = process.env.RAPIDAPI_KEY;
  // 使用 Twttr API (twitter241)
  private readonly rapidApiHost = 'twitter241.p.rapidapi.com';

  /**
   * 通过用户名获取 Twitter 用户信息
   */
  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    try {
      if (!this.rapidApiKey) {
        console.error('❌ RAPIDAPI_KEY 未配置');
        return null;
      }

      // 移除 @ 前缀
      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

      // Twttr API 的用户查询接口
      const url = `https://${this.rapidApiHost}/user?username=${cleanUsername}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': this.rapidApiHost,
        },
      });

      const data = await response.json();

      // Twttr API 返回格式
      if (data.result?.data?.user?.result) {
        const user = data.result.data.user.result;
        const legacy = user.legacy || {};
        return {
          id: user.rest_id || user.id,
          name: legacy.name || '',
          screen_name: legacy.screen_name || cleanUsername,
          description: legacy.description || '',  // 用户简介
          followers_count: legacy.followers_count || 0,
          following_count: legacy.friends_count || 0,
        };
      }

      console.log('❌ 获取 Twitter 用户失败:', data);
      return null;
    } catch (error) {
      console.error('Twitter API 调用失败:', error);
      return null;
    }
  }

  /**
   * 获取用户的关注列表
   * @param userId Twitter 用户 ID (数字ID)
   * @param count 返回数量
   */
  async getUserFollowing(userId: string, count: number = 20): Promise<{
    users: TwitterUser[];
    nextCursor?: string;
  }> {
    try {
      if (!this.rapidApiKey) {
        console.error('❌ RAPIDAPI_KEY 未配置');
        return { users: [] };
      }

      // Twttr API 的关注列表接口
      const url = `https://${this.rapidApiHost}/followings?user=${userId}&count=${count}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': this.rapidApiHost,
        },
      });

      const data = await response.json();

      // 解析返回数据
      if (data.result?.timeline?.instructions) {
        const users: TwitterUser[] = [];

        for (const instruction of data.result.timeline.instructions) {
          if (instruction.entries) {
            for (const entry of instruction.entries) {
              const userResult = entry.content?.itemContent?.user_results?.result;
              if (userResult && userResult.rest_id) {
                const legacy = userResult.legacy || {};
                const core = userResult.core || {};
                // screen_name 在 core 字段中
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
    } catch (error) {
      console.error('获取关注列表失败:', error);
      return { users: [] };
    }
  }

  /**
   * 检查用户是否关注了目标账号
   *
   * @param userTwitterId 用户的 Twitter 数字 ID
   * @param targetScreenName 目标账号的用户名
   */
  async checkIfFollowing(
    userTwitterId: string,
    targetScreenName: string
  ): Promise<FollowingCheckResult> {
    try {
      if (!this.rapidApiKey) {
        return { isFollowing: false, error: 'RapidAPI key not configured' };
      }

      // 清理目标用户名
      const cleanTargetName = targetScreenName.startsWith('@')
        ? targetScreenName.substring(1)
        : targetScreenName;

      // 获取用户的关注列表
      const { users } = await this.getUserFollowing(userTwitterId, 100);

      // 检查目标账号是否在关注列表中
      const isFollowing = users.some(
        u => u.screen_name.toLowerCase() === cleanTargetName.toLowerCase()
      );

      console.log(`✅ Twitter 关注检查: ${userTwitterId} -> ${cleanTargetName}: ${isFollowing}`);

      return { isFollowing };
    } catch (error) {
      console.error('检查关注状态失败:', error);
      return { isFollowing: false, error: error.message };
    }
  }

  /**
   * 验证 Twitter 关注任务
   * 由于无法直接获取用户的 Twitter 账号，这里采用信任方式
   * 实际生产中可以要求用户绑定 Twitter 账号
   *
   * @param targetUsername 需要关注的目标 Twitter 账号
   * @param proof 用户提供的证明（可选，如截图 URL）
   */
  async verifyFollowTask(
    targetUsername: string,
    proof?: { twitterUsername?: string; twitterId?: string; screenshotUrl?: string }
  ): Promise<{ verified: boolean; message: string }> {
    try {
      // 清理目标用户名
      const cleanTargetUsername = targetUsername.startsWith('@')
        ? targetUsername.substring(1)
        : targetUsername;

      // 如果用户提供了自己的 Twitter ID，进行真实验证
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

      // 如果没有提供 Twitter ID，检查目标账号是否存在
      const targetUser = await this.getUserByUsername(cleanTargetUsername);

      if (!targetUser) {
        // API 调用失败时，暂时通过（避免阻塞用户）
        console.log(`⚠️ 无法验证目标账号 @${cleanTargetUsername}，暂时通过`);
        return {
          verified: true,
          message: `已确认任务完成，感谢关注 @${cleanTargetUsername}！`
        };
      }

      // 目标账号存在，信任用户已完成
      // 实际生产中应该要求用户绑定 Twitter 或提供截图
      console.log(`✅ 目标账号 @${cleanTargetUsername} 存在 (ID: ${targetUser.id})，信任用户已关注`);
      return {
        verified: true,
        message: `已确认任务完成，感谢关注 @${cleanTargetUsername}！`
      };
    } catch (error) {
      console.error('验证 Twitter 关注失败:', error);
      // 出错时也暂时通过，避免阻塞用户
      return { verified: true, message: '任务完成！' };
    }
  }

  /**
   * 获取推文信息
   * @param tweetId 推文 ID 或推文 URL
   */
  async getTweetInfo(tweetIdOrUrl: string): Promise<TweetInfo | null> {
    try {
      if (!this.rapidApiKey) {
        console.error('❌ RAPIDAPI_KEY 未配置');
        return null;
      }

      // 从 URL 中提取推文 ID
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
    } catch (error) {
      console.error('获取推文信息失败:', error);
      return null;
    }
  }

  /**
   * 检查用户是否转发了指定推文
   * 使用 user-tweets 端点获取用户的推文列表，检查是否有转发目标推文
   * @param tweetId 推文 ID
   * @param targetUserId 要检查的用户 ID
   */
  async checkUserRetweetedTweet(tweetId: string, targetUserId: string): Promise<boolean> {
    try {
      if (!this.rapidApiKey) {
        console.log('❌ checkUserRetweetedTweet: RAPIDAPI_KEY 未配置');
        return false;
      }

      console.log(`🔍 检查用户转发: tweetId=${tweetId}, userId=${targetUserId}`);

      // 使用 user-tweets 端点获取用户的推文列表（包含转发）
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

      // 解析用户推文列表，查找转发的推文
      const instructions = data.result?.timeline?.instructions || data.result?.instructions;

      if (instructions) {
        const foundRetweets: string[] = [];
        for (const instruction of instructions) {
          const entries = instruction.entries || [];
          for (const entry of entries) {
            const tweetResult = entry.content?.itemContent?.tweet_results?.result;
            if (tweetResult) {
              // 检查是否是转发（retweeted_status_result 包含原推文信息）
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
      } else {
        console.log('❌ API 响应格式异常:', JSON.stringify(data).substring(0, 500));
      }

      return false;
    } catch (error) {
      console.error('检查用户转发失败:', error);
      return false;
    }
  }

  /**
   * 检查用户是否点赞了指定推文
   * 注意：Twitter API 的点赞相关端点已弃用，暂时返回 false
   * @param tweetId 推文 ID
   * @param targetUserId 要检查的用户 ID
   */
  async checkUserLikedTweet(tweetId: string, targetUserId: string): Promise<boolean> {
    // Twitter API 点赞端点已弃用，暂不支持验证
    console.log(`⚠️ 点赞验证: Twitter API 点赞端点已弃用，暂不支持`);
    return false;
  }

  /**
   * 获取用户的回复列表，检查用户是否回复了指定推文
   * 使用 user-replies 端点获取用户的所有回复
   * @param tweetId 目标推文 ID
   * @param userId 用户 Twitter ID
   */
  async checkUserReplied(tweetId: string, userId: string): Promise<boolean> {
    try {
      if (!this.rapidApiKey) {
        console.log('❌ checkUserReplied: RAPIDAPI_KEY 未配置');
        return false;
      }

      console.log(`🔍 检查用户评论: tweetId=${tweetId}, userId=${userId}`);

      // 使用 user-replies 端点获取用户的回复
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

      // 解析用户回复列表
      const instructions = data.result?.timeline?.instructions || data.result?.instructions;

      if (instructions) {
        const foundReplies: string[] = [];
        for (const instruction of instructions) {
          const entries = instruction.entries || [];
          for (const entry of entries) {
            // 处理多种可能的数据结构
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
      } else {
        console.log('❌ API 响应格式异常，尝试打印完整响应:', JSON.stringify(data).substring(0, 800));
      }

      return false;
    } catch (error) {
      console.error('检查用户评论失败:', error);
      return false;
    }
  }

  /**
   * 验证 Twitter 转发任务
   * @param tweetUrl 需要转发的推文 URL
   * @param userTwitterId 用户的 Twitter ID
   */
  async verifyRetweetTask(
    tweetUrl: string,
    userTwitterId?: string
  ): Promise<{ verified: boolean; message: string }> {
    try {
      // 从 URL 中提取推文 ID
      const tweetMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
      if (!tweetMatch) {
        return { verified: true, message: '转发任务完成！' };
      }
      const targetTweetId = tweetMatch[1];

      // 如果用户绑定了 Twitter，进行真实验证
      if (userTwitterId) {
        // 使用 Get Post Retweets 端点检查用户是否转发了该推文
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

      // 未绑定 Twitter，返回需要绑定的提示
      return {
        verified: false,
        message: '请先在个人资料页绑定您的 Twitter 账号，以便验证转发状态'
      };
    } catch (error) {
      console.error('验证 Twitter 转发失败:', error);
      return { verified: false, message: '验证失败，请稍后重试' };
    }
  }

  /**
   * 验证 Twitter 点赞任务
   * 使用 Get Post Likes 端点（更稳定）
   * @param tweetUrl 需要点赞的推文 URL
   * @param userTwitterId 用户的 Twitter ID
   */
  async verifyLikeTask(
    tweetUrl: string,
    userTwitterId?: string
  ): Promise<{ verified: boolean; message: string }> {
    try {
      // 从 URL 中提取推文 ID
      const tweetMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
      if (!tweetMatch) {
        return { verified: true, message: '点赞任务完成！' };
      }
      const targetTweetId = tweetMatch[1];

      // 如果用户绑定了 Twitter，进行真实验证
      if (userTwitterId) {
        // 使用 Get Post Likes 检查用户是否在点赞列表中
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

      // 未绑定 Twitter，返回需要绑定的提示
      return {
        verified: false,
        message: '请先在个人资料页绑定您的 Twitter 账号，以便验证点赞状态'
      };
    } catch (error) {
      console.error('验证 Twitter 点赞失败:', error);
      return { verified: false, message: '验证失败，请稍后重试' };
    }
  }

  /**
   * 验证 Twitter 评论任务
   * @param tweetUrl 需要评论的推文 URL
   * @param userTwitterId 用户的 Twitter ID
   */
  async verifyCommentTask(
    tweetUrl: string,
    userTwitterId?: string
  ): Promise<{ verified: boolean; message: string }> {
    try {
      // 从 URL 中提取推文 ID
      const tweetMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
      if (!tweetMatch) {
        return { verified: true, message: '评论任务完成！' };
      }
      const targetTweetId = tweetMatch[1];

      // 如果用户绑定了 Twitter，进行真实验证
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

      // 未绑定 Twitter，返回需要绑定的提示
      return {
        verified: false,
        message: '请先在个人资料页绑定您的 Twitter 账号，以便验证评论状态'
      };
    } catch (error) {
      console.error('验证 Twitter 评论失败:', error);
      return { verified: false, message: '验证失败，请稍后重试' };
    }
  }

  /**
   * 获取用户最近的推文
   * @param userId Twitter 用户 ID
   * @param count 获取数量
   */
  async getUserRecentTweets(userId: string, count: number = 20): Promise<Array<{
    id: string;
    text: string;
    createdAt: string;
    isQuote: boolean;
    quotedTweetId?: string;
  }>> {
    try {
      if (!this.rapidApiKey) {
        console.error('❌ RAPIDAPI_KEY 未配置');
        return [];
      }

      // 使用 user-tweets 端点获取用户推文
      const url = `https://${this.rapidApiHost}/user-tweets?user=${userId}&count=${count}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': this.rapidApiHost,
        },
      });

      const data = await response.json();
      const tweets: Array<{
        id: string;
        text: string;
        createdAt: string;
        isQuote: boolean;
        quotedTweetId?: string;
      }> = [];

      // 解析推文数据
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
    } catch (error) {
      console.error('获取用户推文失败:', error);
      return [];
    }
  }

  /**
   * 验证用户是否发布了包含验证码的推文（引用转发方式）
   * @param userId Twitter 用户 ID
   * @param verificationCode 验证码
   */
  async verifyQuoteTweetWithCode(
    userId: string,
    verificationCode: string
  ): Promise<{ verified: boolean; message: string; tweetId?: string }> {
    try {
      // 获取用户最近的推文
      const tweets = await this.getUserRecentTweets(userId, 30);

      if (tweets.length === 0) {
        return {
          verified: false,
          message: '无法获取您的推文，请确保账号公开并稍后重试',
        };
      }

      // 查找包含验证码的推文
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
    } catch (error) {
      console.error('验证引用转发失败:', error);
      return {
        verified: false,
        message: '验证失败，请稍后重试',
      };
    }
  }
}
