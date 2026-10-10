<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { CATEGORIES, type MonthlyFinancialInsights, type TransactionRecord } from '@/domain/models'
import { normalizeDateInShanghai } from '@/domain/date'
import { formatFenAsCny } from '@/domain/money'
import { services } from '@/services'
import { sessionStore } from '@/stores'
import { loadDashboard } from './dashboard'
import BottomNav from '@/components/bottom-nav.vue'

const monthKey = normalizeDateInShanghai(new Date()).slice(0, 7)
const insights = ref<MonthlyFinancialInsights | null>(null)
const recent = ref<TransactionRecord[]>([])
const loading = ref(false)
const dashboardError = ref('')
const monthTitle = computed(() => { const [year, month] = monthKey.split('-'); return `${year} 年 ${Number(month)} 月` })

function categoryName(record: TransactionRecord) { return CATEGORIES.find((item) => item.id === record.categoryId)?.name ?? '其他' }
function amountText(record: TransactionRecord) { return `${record.type === 'expense' ? '-' : '+'}${formatFenAsCny(record.amountFen)}` }

async function refreshDashboard() {
  if (sessionStore.state.status !== 'authenticated' || loading.value) return
  loading.value = true
  dashboardError.value = ''
  const result = await loadDashboard(services.insights, services.bookkeeping, monthKey)
  loading.value = false
  if (!result.ok) { dashboardError.value = result.error.message; return }
  insights.value = result.insights
  recent.value = result.recent
}

function openEntry() { uni.navigateTo({ url: '/pages/entry/index' }) }
function openRecords() { uni.navigateTo({ url: '/pages/records/index' }) }
function openStatistics() { uni.navigateTo({ url: '/pages/statistics/index' }) }
function openRecord(record: TransactionRecord) {
  uni.setStorageSync('selectedTransaction', record)
  uni.navigateTo({ url: `/pages/record-detail/index?id=${record.id}` })
}

watch(() => sessionStore.state.status, (status) => { if (status === 'authenticated') void refreshDashboard() }, { immediate: true })
onShow(() => void refreshDashboard())
</script>

<template>
  <view class="page">
    <template v-if="sessionStore.state.status === 'authenticated'">
      <view class="header">
        <view><text class="eyebrow">我的账本</text><text class="month-title">{{ monthTitle }}</text></view>
        <button class="add-button" @tap="openEntry">＋ 记一笔</button>
      </view>
      <view v-if="loading && !insights" class="state-card">正在加载本月数据…</view>
      <view v-else-if="dashboardError" class="state-card error-state"><text>{{ dashboardError }}</text><button class="retry" @tap="refreshDashboard">重新加载</button></view>
      <template v-else-if="insights">
        <view class="summary-card">
          <view><text class="summary-label">本月结余</text><text class="balance-value">{{ formatFenAsCny(insights.balanceFen) }}</text></view>
          <view class="summary-row">
            <view><text class="summary-label">收入</text><text class="summary-value">{{ formatFenAsCny(insights.incomeFen) }}</text></view>
            <view><text class="summary-label">支出</text><text class="summary-value">{{ formatFenAsCny(insights.expenseFen) }}</text></view>
          </view>
        </view>
        <text class="statistics-link" @tap="openStatistics">查看统计分析 →</text>
        <view class="section-header"><text class="section-title">最近账目</text><text class="section-link" @tap="openRecords">查看全部</text></view>
        <view v-if="recent.length === 0" class="state-card"><text class="empty-title">本月还没有账目</text><text class="empty-description">点击“记一笔”，开始记录第一笔收支。</text></view>
        <view v-else class="recent-list">
          <view v-for="record in recent" :key="record.id" class="record-card" @tap="openRecord(record)">
            <view><text class="category">{{ categoryName(record) }}</text><text class="record-date">{{ record.occurredAt }}</text></view>
            <text class="record-amount" :class="record.type">{{ amountText(record) }}</text>
          </view>
        </view>
      </template>
    </template>
    <template v-else-if="sessionStore.state.status === 'error'">
      <view class="center-state"><text class="title">暂时无法登录</text><text class="description">{{ sessionStore.state.error?.message }}</text><button class="retry" @tap="sessionStore.retry">重新尝试</button></view>
    </template>
    <template v-else><view class="center-state"><text class="title">正在登录</text><text class="description">正在连接微信云服务…</text></view></template>
    <BottomNav current="home" />
  </view>
</template>

<style scoped>
.page { min-height: 100vh; padding: 42rpx 32rpx 180rpx; box-sizing: border-box; background: #f5f6f3; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30rpx; }
.eyebrow, .summary-label { display: block; color: #7d887f; font-size: 25rpx; }
.month-title { display: block; margin-top: 8rpx; color: #17251e; font-size: 40rpx; font-weight: 700; }
.add-button { margin: 0; padding: 0 26rpx; border-radius: 18rpx; color: #fff; background: #1d7048; font-size: 27rpx; line-height: 72rpx; }
.add-button::after, .retry::after { border: 0; }
.summary-card { padding: 34rpx; border-radius: 28rpx; color: #fff; background: linear-gradient(145deg, #276f4d, #164d34); box-shadow: 0 14rpx 32rpx rgba(30,87,58,.16); }
.summary-card .summary-label { color: rgba(255,255,255,.7); }
.balance-value { display: block; margin-top: 10rpx; font-size: 54rpx; font-weight: 700; }
.summary-row { display: flex; margin-top: 38rpx; gap: 90rpx; }
.summary-value { display: block; margin-top: 8rpx; font-size: 30rpx; font-weight: 600; }
.statistics-link { display: block; padding: 22rpx 4rpx 0; text-align: right; color: #397454; font-size: 26rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin: 42rpx 4rpx 20rpx; }
.section-title { color: #22332a; font-size: 32rpx; font-weight: 650; }
.section-link { color: #397454; font-size: 26rpx; }
.state-card { padding: 56rpx 30rpx; border-radius: 24rpx; text-align: center; color: #7d877e; background: #fff; }
.empty-title { display: block; color: #34473d; font-size: 30rpx; font-weight: 600; }
.empty-description { display: block; margin-top: 12rpx; font-size: 25rpx; }
.error-state { color: #a63c32; }
.retry { margin-top: 22rpx; color: #fff; background: #256b45; font-size: 27rpx; }
.recent-list { display: flex; flex-direction: column; gap: 16rpx; }
.record-card { display: flex; justify-content: space-between; align-items: center; padding: 28rpx; border-radius: 22rpx; background: #fff; }
.category { display: block; color: #24362d; font-size: 30rpx; font-weight: 600; }
.record-date { display: block; margin-top: 8rpx; color: #949c95; font-size: 24rpx; }
.record-amount { color: #2d3e35; font-size: 31rpx; font-weight: 650; }
.record-amount.income { color: #1d7048; }
.center-state { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16rpx; }
.title { color: #1d241e; font-size: 44rpx; font-weight: 600; }
.description { color: #798078; font-size: 28rpx; }
</style>
