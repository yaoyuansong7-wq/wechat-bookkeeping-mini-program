'use strict'

const cloud = require('wx-server-sdk')
const { createMonthlyInsightsHandler } = require('./handler')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const collection = cloud.database().collection('transactions')

exports.main = createMonthlyInsightsHandler({
  getOpenId: () => cloud.getWXContext().OPENID,
  repository: {
    async listByMonth(ownerOpenId, monthKey) {
      const result = await collection.where({ ownerOpenId, monthKey }).limit(1000).get()
      return result.data
    },
  },
})
