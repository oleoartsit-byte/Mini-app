"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('开始插入示例教程...');
    await prisma.tutorial.deleteMany({});
    await prisma.tutorial.create({
        data: {
            type: client_1.TutorialType.ARTICLE,
            category: 'telegram',
            title: '如何完成 Telegram 频道任务',
            titleEn: 'How to Complete Telegram Channel Tasks',
            description: '一步步教你关注频道并完成验证，轻松获取奖励',
            descriptionEn: 'Step-by-step guide to follow channels and complete verification',
            content: `## 任务流程

### 第一步：找到任务
在首页或任务列表中找到 Telegram 频道任务，点击任务卡片进入详情。

### 第二步：前往关注
点击"前往关注"按钮，会自动跳转到对应的 Telegram 频道页面。

### 第三步：关注频道
在 Telegram 中点击"加入"或"Join"按钮关注该频道。

### 第四步：返回验证
关注成功后返回 Quest Wall，点击"验证"按钮。

### 第五步：获取奖励
系统会自动验证你是否已关注，验证通过后奖励将自动发放到你的账户！

> 💡 提示：请确保使用的是登录 Quest Wall 的同一个 Telegram 账号`,
            contentEn: `## Task Flow

### Step 1: Find the Task
Find the Telegram channel task on the home page or task list, click the task card to enter details.

### Step 2: Go to Follow
Click the "Go to Follow" button, it will automatically redirect to the corresponding Telegram channel page.

### Step 3: Join the Channel
Click the "Join" button in Telegram to follow the channel.

### Step 4: Return and Verify
After successfully following, return to Quest Wall and click the "Verify" button.

### Step 5: Get Rewards
The system will automatically verify if you have followed, and rewards will be automatically sent to your account after verification!

> 💡 Tip: Make sure to use the same Telegram account used to log in to Quest Wall`,
            icon: '📢',
            sortOrder: 1,
            status: client_1.TutorialStatus.PUBLISHED,
        },
    });
    await prisma.tutorial.create({
        data: {
            type: client_1.TutorialType.VIDEO,
            category: 'twitter',
            title: '【视频】Twitter 任务完整操作流程',
            titleEn: '[Video] Complete Twitter Task Guide',
            description: '观看视频，3分钟学会绑定 Twitter 并完成所有推特任务',
            descriptionEn: 'Watch the video, learn to bind Twitter and complete all tasks in 3 minutes',
            content: `本视频详细讲解了：

1. 如何绑定你的 Twitter 账号
2. 如何完成关注任务
3. 如何完成转发任务
4. 如何完成点赞任务
5. 常见问题解答

视频时长约 3 分钟，建议全屏观看。`,
            contentEn: `This video explains in detail:

1. How to bind your Twitter account
2. How to complete follow tasks
3. How to complete retweet tasks
4. How to complete like tasks
5. FAQ

Video duration is about 3 minutes, full screen viewing is recommended.`,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            coverImage: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=300&fit=crop',
            icon: '🎬',
            sortOrder: 2,
            status: client_1.TutorialStatus.PUBLISHED,
        },
    });
    await prisma.tutorial.create({
        data: {
            type: client_1.TutorialType.IMAGE_TEXT,
            category: 'wallet',
            title: '【图文】提现 USDT 完整教程',
            titleEn: '[Gallery] Complete USDT Withdrawal Guide',
            description: '通过截图一步步教你如何将赚取的 USDT 提现到钱包',
            descriptionEn: 'Step-by-step screenshots showing how to withdraw earned USDT to your wallet',
            content: `按照下方图片步骤操作即可完成提现：

1️⃣ 进入奖励页面，点击"提现"按钮
2️⃣ 选择提现资产类型（USDT）
3️⃣ 输入提现金额
4️⃣ 填写你的钱包地址（TRC20）
5️⃣ 确认提现信息
6️⃣ 等待审核通过（通常24小时内）

⚠️ 注意事项：
- 最低提现金额为 5 USDT
- 请确保钱包地址正确，转错无法找回
- 建议使用 TRC20 网络，手续费更低`,
            contentEn: `Follow the image steps below to complete withdrawal:

1️⃣ Go to Rewards page, click "Withdraw" button
2️⃣ Select withdrawal asset type (USDT)
3️⃣ Enter withdrawal amount
4️⃣ Fill in your wallet address (TRC20)
5️⃣ Confirm withdrawal information
6️⃣ Wait for approval (usually within 24 hours)

⚠️ Notes:
- Minimum withdrawal amount is 5 USDT
- Please ensure wallet address is correct, wrong transfers cannot be recovered
- TRC20 network is recommended for lower fees`,
            images: [
                'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
            ],
            coverImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop',
            icon: '💰',
            sortOrder: 3,
            status: client_1.TutorialStatus.PUBLISHED,
        },
    });
    await prisma.tutorial.create({
        data: {
            type: client_1.TutorialType.ARTICLE,
            category: 'invite',
            title: '邀请好友，双方都能赚',
            titleEn: 'Invite Friends, Both Earn Rewards',
            description: '了解邀请机制和返佣规则，最大化你的收益',
            descriptionEn: 'Learn invitation mechanism and commission rules to maximize your earnings',
            content: `## 邀请奖励机制

### 🎁 邀请奖励
每成功邀请一位新用户注册，你和你的好友各获得 **0.5 USDT** 奖励！

### 💵 任务返佣
好友完成任务后，你还能获得额外返佣：
- 好友完成任务奖励的 **10%** 将作为返佣发放给你

### 📱 如何邀请
1. 在首页找到邀请卡片
2. 点击"复制链接"复制你的专属邀请链接
3. 或点击"分享到 Telegram"直接分享
4. 好友通过链接注册即算邀请成功

### 📊 查看收益
在"我的"页面可以查看：
- 已邀请人数
- 邀请奖励总额
- 返佣收益明细

> 🚀 没有上限！邀请越多，赚得越多！`,
            contentEn: `## Invitation Reward Mechanism

### 🎁 Invitation Bonus
For each new user you successfully invite, both you and your friend receive **0.5 USDT** reward!

### 💵 Task Commission
When your friend completes tasks, you also get extra commission:
- **10%** of your friend's task reward will be given to you as commission

### 📱 How to Invite
1. Find the invitation card on the home page
2. Click "Copy Link" to copy your exclusive invitation link
3. Or click "Share to Telegram" to share directly
4. Friends who register through your link count as successful invitations

### 📊 View Earnings
On the "Profile" page you can view:
- Number of people invited
- Total invitation rewards
- Commission earnings details

> 🚀 No limit! The more you invite, the more you earn!`,
            icon: '🎁',
            sortOrder: 4,
            status: client_1.TutorialStatus.PUBLISHED,
        },
    });
    await prisma.tutorial.create({
        data: {
            type: client_1.TutorialType.VIDEO,
            category: 'telegram',
            title: '【B站视频】新手入门完整指南',
            titleEn: '[Bilibili] Complete Beginner Guide',
            description: '适合新手的入门视频，了解 Quest Wall 的所有功能',
            descriptionEn: 'Beginner-friendly video covering all Quest Wall features',
            content: `这是一个适合新手的完整入门视频，涵盖：

📌 账号注册与登录
📌 界面功能介绍
📌 如何完成第一个任务
📌 如何查看和提取奖励
📌 邀请好友赚钱技巧

适合所有新用户观看！`,
            contentEn: `This is a complete beginner guide video covering:

📌 Account registration and login
📌 Interface features introduction
📌 How to complete your first task
📌 How to view and withdraw rewards
📌 Tips for inviting friends to earn money

Suitable for all new users!`,
            videoUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
            coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
            icon: '📺',
            sortOrder: 5,
            status: client_1.TutorialStatus.PUBLISHED,
        },
    });
    await prisma.tutorial.create({
        data: {
            type: client_1.TutorialType.ARTICLE,
            category: 'other',
            title: '【草稿】即将上线的新功能',
            titleEn: '[Draft] Upcoming New Features',
            description: '这是一个草稿教程，用户看不到',
            descriptionEn: 'This is a draft tutorial, invisible to users',
            content: '草稿内容...',
            contentEn: 'Draft content...',
            icon: '📝',
            sortOrder: 99,
            status: client_1.TutorialStatus.DRAFT,
        },
    });
    console.log('✅ 示例教程插入完成！');
    const count = await prisma.tutorial.count();
    const published = await prisma.tutorial.count({ where: { status: client_1.TutorialStatus.PUBLISHED } });
    console.log(`总共 ${count} 个教程，其中 ${published} 个已发布`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-tutorials.js.map