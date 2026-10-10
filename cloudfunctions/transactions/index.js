'use strict'

const cloud = require('wx-server-sdk')
const { createTransactionsHandler } = require('./handler')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const collection = db.collection('transactions')

const repository = {
  async create(data) {
    const result = await collection.add({ data })
    return { id: result._id, ...data }
  },
  async listByMonth(ownerOpenId, monthKey, offset, pageSize) {
    const result = await collection
      .where({ ownerOpenId, monthKey })
      .orderBy('occurredAt', 'desc')
      .orderBy('createdAt', 'desc')
      .skip(offset)
      .limit(pageSize + 1)
      .get()
    return {
      items: result.data.slice(0, pageSize).map(({ _id, ...record }) => ({ id: _id, ...record })),
      hasMore: result.data.length > pageSize,
    }
  },
  async updateOwned(id, ownerOpenId, data) {
    const owned = await collection.where({ _id: id, ownerOpenId }).limit(1).get()
    if (!owned.data.length) return null
    await collection.doc(id).update({ data })
    return { ...owned.data[0], ...data, id }
  },
  async deleteOwned(id, ownerOpenId) {
    const result = await collection.where({ _id: id, ownerOpenId }).remove()
    return result.stats.removed > 0
  },
}

exports.main = createTransactionsHandler({
  getOpenId: () => cloud.getWXContext().OPENID,
  repository,
})
