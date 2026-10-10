import type { CloudResponse } from './services'

interface WechatCloudRuntime {
  callFunction(options: {
    name: string
    data?: Record<string, unknown>
  }): Promise<{ result?: unknown }>
}

declare const wx: { cloud?: WechatCloudRuntime }

export async function callWechatCloudFunction<T>(
  name: string,
  data?: Record<string, unknown>,
): Promise<CloudResponse<T>> {
  if (typeof wx === 'undefined' || !wx.cloud) {
    throw new Error('当前运行环境不支持微信云函数。')
  }

  const response = await wx.cloud.callFunction({ name, data })
  return response.result as CloudResponse<T>
}
