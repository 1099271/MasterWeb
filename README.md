# MasterWeb
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

# 密码重置指南

## 前端配置

前端应用需要以下环境变量：

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000  # 后端API地址
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000  # 前端应用地址
```

## 密码重置流程

1. 用户在前端"忘记密码"页面输入邮箱
2. 前端发送请求到后端时包含 `frontend_url` 参数
3. 后端生成重置令牌并创建重置链接：`${frontend_url}/reset-password?token=${token}`
4. 用户点击邮件中的链接，到达 `/reset-password` 页面
5. `/reset-password` 页面自动重定向到 `/auth/reset-password`，保留token参数
6. 用户在重置密码页面输入新密码并提交
7. 后端验证token并更新密码

## 注意事项

- 确保后端API接收并使用 `frontend_url` 参数，以生成正确的重置链接
- 如果使用自定义域名，需要更新 `.env` 文件中的 `NEXT_PUBLIC_FRONTEND_URL` 值
- 在生产环境中，确保使用HTTPS链接
