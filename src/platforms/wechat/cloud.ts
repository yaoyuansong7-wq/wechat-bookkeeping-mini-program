import { cloudConfig } from '../../config/cloud'

declare const wx: {
  cloud?: {
    init(options: { env: string; traceUser: boolean }): void
  }
}

export function initializeWechatCloud(): void {
  if (typeof wx === 'undefined' || !wx.cloud) {
    throw new Error('当前运行环境不支持微信云开发。')
  }

  wx.cloud.init({
    env: cloudConfig.wechatEnvironmentId,
    traceUser: true,
  })
}
