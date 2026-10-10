'use strict'

const cloud = require('wx-server-sdk')
const { createSessionHandler } = require('./handler')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = createSessionHandler(() => cloud.getWXContext())
