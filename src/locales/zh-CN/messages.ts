export const messages = {
  success: {
    login: "登录成功",
    register: "注册成功",
    logout: "已成功退出登录",
    passwordReset: "密码重置成功，请使用新密码登录",
    passwordChanged: "密码修改成功",
    profileUpdated: "个人资料已更新",
    emailVerified: "邮箱验证成功",
    resetLinkSent: "重置密码链接已发送到您的邮箱，请查收",
  },
  error: {
    general: "发生错误，请稍后重试",
    login: "登录失败，请检查用户名和密码",
    register: "注册失败，请稍后重试",
    invalidCredentials: "用户名或密码不正确",
    invalidResetLink: "无效的重置密码链接，请重新发起找回密码请求",
    passwordMismatch: "两次输入的密码不一致",
    passwordComplexity: "密码必须包含字母、数字和特殊字符",
    emailInUse: "该邮箱已被注册",
    usernameInUse: "该用户名已被使用",
    unauthorized: "请先登录后再访问此页面",
    forbidden: "您没有权限访问此页面",
    notFound: "您访问的页面不存在",
    serverError: "服务器错误，请稍后重试",
    networkError: "网络连接错误，请检查您的网络连接",
    timeout: "请求超时，请稍后重试",
    incorrectPassword: "当前密码不正确",
  },
  confirm: {
    deleteAccount: "确定要删除您的账户吗？此操作无法撤销",
    logout: "确定要退出登录吗？",
    discard: "确定要放弃未保存的更改吗？",
  },
  info: {
    loading: "加载中...",
    processing: "处理中...",
    sending: "发送中...",
    saving: "保存中...",
    uploading: "上传中...",
    redirecting: "正在跳转...",
    passwordRequirements: "密码需包含至少8个字符，包括字母、数字和特殊符号",
    emailVerification: "验证邮件已发送，请查收邮箱完成验证",
    sessionExpired: "您的会话已过期，请重新登录",
    maintenanceMode: "系统维护中，请稍后再试",
  },
  auth: {
    loginRequired: "请先登录",
    verificationRequired: "请先验证您的邮箱",
    passwordResetSuccess: "密码已重置，请使用新密码登录",
    accountLocked: "账户已被锁定，请联系管理员",
    accountDisabled: "账户已被禁用",
    tooManyAttempts: "登录尝试次数过多，请稍后再试",
  },
};
