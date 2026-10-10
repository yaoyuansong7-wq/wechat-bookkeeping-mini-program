<script setup lang="ts">
import type { MainTab } from './bottom-nav-routes'
import { routeForTab } from './bottom-nav-routes'

defineProps<{ current: MainTab }>()

function openTab(tab: MainTab) {
  uni.reLaunch({ url: routeForTab(tab) })
}

function openEntry() {
  uni.navigateTo({ url: '/pages/entry/index' })
}
</script>

<template>
  <view class="nav-shell">
    <view class="nav-bar">
      <view class="nav-item" :class="{ active: current === 'home' }" @tap="openTab('home')"><text class="nav-icon">⌂</text><text>首页</text></view>
      <view class="nav-item" :class="{ active: current === 'records' }" @tap="openTab('records')"><text class="nav-icon">≡</text><text>明细</text></view>
      <view class="entry-wrap" @tap="openEntry"><view class="entry-circle">＋</view><text class="entry-label">记账</text></view>
      <view class="nav-item" :class="{ active: current === 'statistics' }" @tap="openTab('statistics')"><text class="nav-icon">▥</text><text>统计</text></view>
      <view class="nav-item" :class="{ active: current === 'profile' }" @tap="openTab('profile')"><text class="nav-icon">○</text><text>我的</text></view>
    </view>
  </view>
</template>

<style scoped>
.nav-shell { position: fixed; z-index: 20; right: 0; bottom: 0; left: 0; padding-bottom: env(safe-area-inset-bottom); background: #fff; box-shadow: 0 -6rpx 24rpx rgba(34, 55, 43, .08); }
.nav-bar { height: 104rpx; display: grid; grid-template-columns: repeat(5, 1fr); align-items: center; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 4rpx; color: #929a93; font-size: 21rpx; }
.nav-item.active { color: #1d7048; font-weight: 600; }
.nav-icon { font-size: 34rpx; line-height: 34rpx; }
.entry-wrap { align-self: stretch; display: flex; flex-direction: column; align-items: center; color: #1d7048; font-size: 21rpx; }
.entry-circle { width: 84rpx; height: 84rpx; margin-top: -30rpx; border: 8rpx solid #f5f6f3; border-radius: 50%; text-align: center; color: #fff; background: #1d7048; font-size: 48rpx; line-height: 80rpx; box-shadow: 0 8rpx 20rpx rgba(29, 112, 72, .24); }
.entry-label { margin-top: 2rpx; }
</style>
