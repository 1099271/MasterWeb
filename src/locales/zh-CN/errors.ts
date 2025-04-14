export const errors = {
  auth: {
    // 登录相关错误
    login: {
      failed: "邮箱或密码错误，请重试",
      accountDeactivated: "账户已被禁用，请联系管理员",
      notVerified: "账户尚未验证，请先验证邮箱",
    },
    // 注册相关错误
    register: {
      emailExists: "该邮箱已被注册",
      usernameTaken: "该用户名已被使用",
      passwordTooWeak: "密码强度不足",
      generalError: "注册失败，请稍后重试",
    },
    // 找回密码相关错误
    forgotPassword: {
      emailNotFound: "该邮箱未注册",
      sendFailed: "发送重置密码邮件失败，请检查邮箱是否正确，或稍后重试",
    },
    // 重置密码相关错误
    resetPassword: {
      invalidLink: "无效的重置密码链接，请重新发起找回密码请求",
      tokenExpired: "重置密码链接已过期，请重新发起找回密码请求",
      resetFailed: "重置密码失败，可能是链接已过期，请重新发起找回密码请求",
    },
    // 邮箱验证相关错误
    emailVerification: {
      sendFailed: "发送验证邮件失败，请稍后重试",
      verifyFailed: "验证邮箱失败，请重新尝试",
    },
  },
  user: {
    // 用户信息更新相关错误
    profile: {
      updateFailed: "更新个人信息失败，请稍后重试",
    },
    // 修改密码相关错误
    password: {
      wrongPassword: "当前密码不正确",
      mismatch: "两次输入的密码不一致",
      tooShort: "密码长度至少为8位",
      changeFailed: "修改密码失败，请稍后重试",
    },
  },
  validation: {
    // 表单验证错误
    required: {
      username: "请输入用户名",
      email: "请输入邮箱",
      password: "请输入密码",
      currentPassword: "请输入当前密码",
      newPassword: "请输入新密码",
      confirmPassword: "请确认密码",
    },
    format: {
      email: "邮箱格式不正确",
    },
    passwordStrength: "密码长度至少为8位",
    passwordMismatch: "两次输入的密码不一致",
  },
  server: {
    networkError: "网络连接错误，请检查网络连接",
    serverError: "服务器错误，请稍后重试",
    notFound: "请求的资源不存在",
    unauthorized: "未授权操作，请重新登录",
  },
  general: {
    unknown: "发生未知错误，请稍后重试",
  },
};
