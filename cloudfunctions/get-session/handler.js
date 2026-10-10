'use strict'

function createSessionHandler(getWxContext) {
  return async function getSession() {
    try {
      const context = getWxContext()
      const openId = context?.OPENID

      if (!openId) {
        return {
          ok: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: '无法识别微信用户身份，请重试。',
          },
        }
      }

      return {
        ok: true,
        data: { openId },
      }
    } catch {
      return {
        ok: false,
        error: {
          code: 'AUTH_UNAVAILABLE',
          message: '微信身份服务暂时不可用，请稍后重试。',
        },
      }
    }
  }
}

module.exports = { createSessionHandler }
