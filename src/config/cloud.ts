const wechatCloudEnvironmentId = import.meta.env.VITE_WECHAT_CLOUD_ENV_ID?.trim()

if (!wechatCloudEnvironmentId) {
  throw new Error('缺少 VITE_WECHAT_CLOUD_ENV_ID，请检查当前构建环境配置。')
}

export const cloudConfig = {
  wechatEnvironmentId: wechatCloudEnvironmentId,
} as const
