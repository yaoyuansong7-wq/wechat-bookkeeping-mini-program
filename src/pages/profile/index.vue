<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import BottomNav from '@/components/bottom-nav.vue'
import { normalizeDateInShanghai } from '@/domain/date'
import { services } from '@/services'
import { sessionStore } from '@/stores'
import { maskOpenId } from './presenter'

const syncing = ref(false)
const syncError = ref('')
const recordCount = ref<number | null>(null)
const lastSyncedAt = ref('')
const identityText = computed(() => sessionStore.state.session ? maskOpenId(sessionStore.state.session.openId) : '尚未识别')

async function checkCloudSync() {
  if (sessionStore.state.status !== 'authenticated' || syncing.value) return
  syncing.value = true
  syncError.value = ''
  const monthKey = normalizeDateInShanghai(new Date()).slice(0, 7)
  const result = await services.bookkeeping.list(monthKey)
  syncing.value = false
  if (!result.ok) { syncError.value = result.error.message; return }
  recordCount.value = result.data.items.length
  lastSyncedAt.value = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
}

onShow(() => void checkCloudSync())
</script>

<template>
  <view class="page">
    <text class="title">我的</text>
    <view class="identity-card">
      <view class="avatar">微</view>
      <view><text class="identity-title">微信用户</text><text class="identity-subtitle">{{ identityText }}</text></view>
      <text class="status-badge" :class="sessionStore.state.status">{{ sessionStore.state.status === 'authenticated' ? '已登录' : '连接中' }}</text>
    </view>
    <view class="card">
      <view class="row"><text class="row-label">云端同步</text><text class="connected">{{ syncError ? '同步异常' : syncing ? '检查中…' : '已连接' }}</text></view>
      <view class="row"><text class="row-label">本月云端记录</text><text>{{ recordCount === null ? '—' : `${recordCount} 笔` }}</text></view>
      <view class="row"><text class="row-label">最近同步</text><text>{{ lastSyncedAt || '—' }}</text></view>
      <text v-if="syncError" class="error">{{ syncError }}</text>
      <button class="sync-button" :loading="syncing" @tap="checkCloudSync">立即同步</button>
    </view>
    <view class="privacy-card"><text class="privacy-title">数据安全</text><text class="privacy-text">账目保存在微信云端，并按当前微信身份隔离。其他用户无法读取或修改你的账目。</text></view>
    <BottomNav current="profile" />
  </view>
</template>

<style scoped>
.page { min-height: 100vh; padding: 42rpx 32rpx 180rpx; box-sizing: border-box; background: #f5f6f3; }
.title { color: #1d2e25; font-size: 42rpx; font-weight: 700; }
.identity-card { display: flex; align-items: center; gap: 22rpx; margin-top: 30rpx; padding: 30rpx; border-radius: 26rpx; background: #fff; }
.avatar { width: 88rpx; height: 88rpx; border-radius: 50%; text-align: center; color: #fff; background: #1d7048; font-size: 36rpx; line-height: 88rpx; }
.identity-title { display: block; color: #26372e; font-size: 31rpx; font-weight: 650; }
.identity-subtitle { display: block; margin-top: 6rpx; color: #909991; font-size: 23rpx; }
.status-badge { margin-left: auto; padding: 8rpx 16rpx; border-radius: 18rpx; color: #1d7048; background: #e8f4ed; font-size: 22rpx; }
.card { margin-top: 24rpx; padding: 10rpx 28rpx 28rpx; border-radius: 24rpx; background: #fff; }
.row { display: flex; justify-content: space-between; padding: 26rpx 0; border-bottom: 1rpx solid #eef0ec; color: #33443b; font-size: 28rpx; }
.row-label { color: #808a82; }
.connected { color: #1d7048; }
.error { display: block; padding-top: 20rpx; color: #b04439; font-size: 24rpx; }
.sync-button { margin-top: 26rpx; border-radius: 18rpx; color: #fff; background: #1d7048; font-size: 28rpx; }
.sync-button::after { border: 0; }
.privacy-card { margin-top: 24rpx; padding: 28rpx; border-radius: 22rpx; background: #eef3ef; }
.privacy-title { display: block; color: #405449; font-size: 27rpx; font-weight: 600; }
.privacy-text { display: block; margin-top: 10rpx; color: #7c887f; font-size: 24rpx; line-height: 1.65; }
</style>
