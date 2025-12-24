import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LikeVerificationResult {
  isValid: boolean;
  confidence: number;  // 0-1 之间的置信度
  reason: string;
  needsManualReview: boolean;
  detectedUsername?: string;  // AI 识别到的用户名
  usernameMatch?: boolean;    // 用户名是否匹配
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured, AI verification will be disabled');
    }
  }

  /**
   * 验证 Twitter 点赞截图
   * @param imageUrl 截图 URL
   * @param boundTwitterUsername 用户绑定的 Twitter 用户名（用于验证截图是否来自该用户）
   * @param targetUrl 目标推文 URL（可选）
   * @returns 验证结果
   */
  async verifyLikeScreenshot(
    imageUrl: string,
    boundTwitterUsername: string,
    targetUrl?: string
  ): Promise<LikeVerificationResult> {
    if (!this.apiKey) {
      this.logger.warn('Gemini API key not configured, skipping AI verification');
      return {
        isValid: false,
        confidence: 0,
        reason: 'AI 验证服务未配置',
        needsManualReview: true,
      };
    }

    if (!boundTwitterUsername) {
      return {
        isValid: false,
        confidence: 0,
        reason: '未绑定 Twitter 账号',
        needsManualReview: false,
      };
    }

    try {
      // 1. 获取图片数据（Base64）
      const imageData = await this.fetchImageAsBase64(imageUrl);
      if (!imageData) {
        return {
          isValid: false,
          confidence: 0,
          reason: '无法获取图片数据',
          needsManualReview: true,
        };
      }

      // 2. 构建 Gemini 请求
      const prompt = this.buildVerificationPrompt(boundTwitterUsername, targetUrl);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: imageData.mimeType,
                  data: imageData.base64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,  // 低温度，更确定性的输出
          maxOutputTokens: 500,
        },
      };

      // 3. 调用 Gemini API
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API error: ${response.status} - ${errorText}`);
        return {
          isValid: false,
          confidence: 0,
          reason: 'AI 服务暂时不可用',
          needsManualReview: true,
        };
      }

      const result = await response.json();

      // 4. 解析 AI 响应
      return this.parseVerificationResponse(result, boundTwitterUsername, targetUrl);

    } catch (error) {
      this.logger.error('AI verification error:', error);
      return {
        isValid: false,
        confidence: 0,
        reason: 'AI 验证过程出错',
        needsManualReview: true,
      };
    }
  }

  /**
   * 构建验证提示词（包含用户名验证和推文作者验证）
   */
  private buildVerificationPrompt(boundTwitterUsername: string, targetUrl?: string): string {
    // 移除 @ 符号（如果有）
    const username = boundTwitterUsername.replace(/^@/, '');

    // 从 targetUrl 提取推文作者
    let targetTweetAuthor = '';
    if (targetUrl) {
      const urlMatch = targetUrl.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/);
      if (urlMatch) {
        targetTweetAuthor = urlMatch[1];
      }
    }

    let prompt = `你是一个专业的图片审核员，负责验证 Twitter/X 点赞截图的真实性和用户身份。

请仔细分析这张截图，完成以下验证任务：

【重要】验证要求：
1. 确认这是一张 Twitter/X 的截图（手机或电脑版均可，包括长截图/滚动截图）
2. 确认截图中能看到点赞按钮已被点击（红色/粉色的实心心形图标）
3. 【关键】确认截图中显示的当前登录用户是否为：@${username}
   - 在手机版：通常在底部导航栏的头像处、或顶部显示用户名
   - 在电脑版：通常在左侧边栏底部显示当前用户信息
   - 在个人主页：会显示用户的 @用户名
`;

    if (targetTweetAuthor) {
      prompt += `4. 【关键】确认截图中被点赞的推文作者是否为：@${targetTweetAuthor}
   - 推文作者通常显示在推文内容上方
   - 需要区分：推文作者 vs 当前登录用户（两者不同）
`;
    }

    prompt += `
识别方法：
- 当前登录用户：查找侧边栏或导航栏显示的用户名
- 推文作者：查找推文内容上方显示的用户名
- 注意：这是两个不同的用户，都需要验证

请用以下 JSON 格式回复（只回复 JSON，不要其他内容）：
{
  "isTwitterScreenshot": true/false,
  "isLiked": true/false,
  "detectedUsername": "截图中识别到的当前登录用户名（不含@）",
  "usernameMatch": true/false,
  "detectedTweetAuthor": "截图中被点赞推文的作者用户名（不含@）",
  "tweetAuthorMatch": true/false,
  "confidence": 0.0-1.0,
  "reason": "简短说明判断理由"
}

注意：
- detectedUsername：当前登录用户的用户名，无法识别则填 null
- usernameMatch：当前登录用户名是否与 "${username}" 匹配（忽略大小写）
- detectedTweetAuthor：被点赞推文的作者用户名，无法识别则填 null
- tweetAuthorMatch：推文作者是否与 "${targetTweetAuthor || '（无指定）'}" 匹配（忽略大小写）
- 如果无法确定某项，对应的 confidence 应降低，match 填 false`;

    return prompt;
  }

  /**
   * 解析 Gemini 的响应（包含用户名验证和推文作者验证）
   */
  private parseVerificationResponse(result: any, boundTwitterUsername: string, targetUrl?: string): LikeVerificationResult {
    try {
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // 尝试从响应中提取 JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn('Could not extract JSON from AI response:', text);
        return {
          isValid: false,
          confidence: 0,
          reason: 'AI 响应格式异常',
          needsManualReview: true,
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const isTwitterScreenshot = parsed.isTwitterScreenshot === true;
      const isLiked = parsed.isLiked === true;
      const detectedUsername = parsed.detectedUsername || null;
      const detectedTweetAuthor = parsed.detectedTweetAuthor || null;
      const confidence = parsed.confidence || 0;

      // 用户名匹配验证（忽略大小写和 @ 符号）
      const normalizedBound = boundTwitterUsername.replace(/^@/, '').toLowerCase();
      const normalizedDetected = (detectedUsername || '').replace(/^@/, '').toLowerCase();
      const usernameMatch = normalizedDetected === normalizedBound;

      // 推文作者匹配验证
      let targetTweetAuthor = '';
      let tweetAuthorMatch = true; // 如果没有指定目标作者，默认通过
      if (targetUrl) {
        const urlMatch = targetUrl.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/);
        if (urlMatch) {
          targetTweetAuthor = urlMatch[1].toLowerCase();
          const normalizedDetectedAuthor = (detectedTweetAuthor || '').replace(/^@/, '').toLowerCase();
          tweetAuthorMatch = normalizedDetectedAuthor === targetTweetAuthor;
        }
      }

      // 综合判断：必须是 Twitter 截图 + 已点赞 + 用户名匹配 + 推文作者匹配
      const isValid = isTwitterScreenshot && isLiked && usernameMatch && tweetAuthorMatch;

      // 需要人工审核的情况：
      // 1. 验证不通过
      // 2. 置信度低于 0.7
      // 3. 无法识别用户名或推文作者但其他条件满足
      const needsManualReview = !isValid || confidence < 0.7 ||
        (!detectedUsername && isTwitterScreenshot && isLiked) ||
        (targetTweetAuthor && !detectedTweetAuthor && isTwitterScreenshot && isLiked);

      let reason = parsed.reason || '';
      if (!isTwitterScreenshot) {
        reason = '截图不是 Twitter/X 界面';
      } else if (!isLiked) {
        reason = '未检测到点赞状态';
      } else if (!usernameMatch) {
        if (detectedUsername) {
          reason = `截图用户 @${detectedUsername} 与绑定账号 @${boundTwitterUsername} 不一致`;
        } else {
          reason = '无法识别截图中的登录用户';
        }
      } else if (!tweetAuthorMatch && targetTweetAuthor) {
        if (detectedTweetAuthor) {
          reason = `点赞的推文作者 @${detectedTweetAuthor} 与目标 @${targetTweetAuthor} 不一致`;
        } else {
          reason = '无法识别截图中的推文作者';
        }
      } else {
        reason = `验证通过，用户 @${boundTwitterUsername} 已点赞${targetTweetAuthor ? ` @${targetTweetAuthor} 的推文` : ''}`;
      }

      return {
        isValid,
        confidence,
        reason,
        needsManualReview,
        detectedUsername,
        usernameMatch,
      };
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
      return {
        isValid: false,
        confidence: 0,
        reason: '解析 AI 响应失败',
        needsManualReview: true,
      };
    }
  }

  /**
   * 获取图片并转换为 Base64
   */
  private async fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string } | null> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        this.logger.error(`Failed to fetch image: ${response.status}`);
        return null;
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return {
        base64,
        mimeType: contentType,
      };
    } catch (error) {
      this.logger.error('Error fetching image:', error);
      return null;
    }
  }

  /**
   * 检查 AI 服务是否可用
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}
