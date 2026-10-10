import { createWechatServices } from '../platforms/wechat/services'
import { callWechatCloudFunction } from '../platforms/wechat/runtime'

export const services = createWechatServices(callWechatCloudFunction)
