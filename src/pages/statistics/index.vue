<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { MonthlyFinancialInsights } from '@/domain/models'
import { normalizeDateInShanghai } from '@/domain/date'
import { formatFenAsCny } from '@/domain/money'
import { services } from '@/services'
import { shiftMonth } from '@/pages/records/records-state'
import { presentCategoryRanking, presentDailyTrend } from './presenter'
import BottomNav from '@/components/bottom-nav.vue'

const monthKey = ref(normalizeDateInShanghai(new Date()).slice(0, 7))
const insights = ref<MonthlyFinancialInsights | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const monthTitle = computed(() => { const [year, month] = monthKey.value.split('-'); return `${year} 年 ${Number(month)} 月` })
const dailyTrend = computed(() => insights.value ? presentDailyTrend(insights.value) : [])
const categoryRanking = computed(() => insights.value ? presentCategoryRanking(insights.value) : [])

async function loadStatistics() {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''
  const result = await services.insights.getMonthly(monthKey.value)
  loading.value = false
  if (!result.ok) { errorMessage.value = result.error.message; return }
  insights.value = result.data
}

function changeMonth(offset: number) { monthKey.value = shiftMonth(monthKey.value, offset); insights.value = null; void loadStatistics() }
function onMonthChange(event: Event) {
  const value = (event as Event & { detail?: { value?: string } }).detail?.value
  if (!value || value === monthKey.value) return
  monthKey.value = value
  insights.value = null
  void loadStatistics()
}

onShow(() => void loadStatistics())
</script>

<template>
  <view class="page">
    <view class="month-bar"><button class="month-arrow" @tap="changeMonth(-1)">‹</button><picker mode="date" fields="month" :value="monthKey" @change="onMonthChange"><view class="month-title">{{ monthTitle }}</view></picker><button class="month-arrow" @tap="changeMonth(1)">›</button></view>
    <view v-if="loading" class="state-card">正在计算本月统计…</view>
    <view v-else-if="errorMessage" class="state-card error-state"><text>{{ errorMessage }}</text><button class="retry" @tap="loadStatistics">重新加载</button></view>
    <template v-else-if="insights">
      <view class="summary-grid">
        <view class="summary-item balance"><text class="label">结余</text><text class="summary-amount">{{ formatFenAsCny(insights.balanceFen) }}</text></view>
        <view class="summary-item"><text class="label">收入</text><text class="summary-amount income">{{ formatFenAsCny(insights.incomeFen) }}</text></view>
        <view class="summary-item"><text class="label">支出</text><text class="summary-amount">{{ formatFenAsCny(insights.expenseFen) }}</text></view>
      </view>
      <view class="section"><text class="section-title">每日支出趋势</text><view v-if="dailyTrend.length === 0" class="empty">本月暂无支出趋势</view><view v-else class="trend-list"><view v-for="item in dailyTrend" :key="item.date" class="trend-row"><text class="trend-date">{{ item.date.slice(8) }} 日</text><view class="bar-track"><view class="bar" :style="{ width: `${item.widthPercent}%` }" /></view><text class="trend-amount">{{ formatFenAsCny(item.amountFen) }}</text></view></view></view>
      <view class="section"><text class="section-title">支出分类排行</text><view v-if="categoryRanking.length === 0" class="empty">本月没有支出，不计算分类占比</view><view v-else class="ranking-list"><view v-for="item in categoryRanking" :key="item.categoryId" class="ranking-row"><view class="ranking-head"><text class="category">{{ item.name }}</text><text class="ranking-value">{{ formatFenAsCny(item.amountFen) }} · {{ item.percent }}%</text></view><view class="rank-track"><view class="rank-bar" :style="{ width: `${item.percent}%` }" /></view></view></view></view>
    </template>
    <BottomNav current="statistics" />
  </view>
</template>

<style scoped>
.page { min-height: 100vh; padding: 30rpx 32rpx 180rpx; box-sizing: border-box; background: #f5f6f3; }
.month-bar { display: flex; align-items: center; justify-content: center; gap: 32rpx; margin: 12rpx 0 30rpx; }
.month-title { min-width: 220rpx; text-align: center; color: #17251e; font-size: 34rpx; font-weight: 650; }
.month-arrow { margin: 0; padding: 0; width: 64rpx; height: 64rpx; border-radius: 50%; color: #315441; background: #fff; font-size: 42rpx; line-height: 58rpx; }
.month-arrow::after, .retry::after { border: 0; }
.state-card, .section { padding: 30rpx; border-radius: 24rpx; background: #fff; }
.state-card { text-align: center; color: #7d877e; }
.error-state { color: #a63c32; }
.retry { margin-top: 20rpx; color: #fff; background: #1d7048; font-size: 27rpx; }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.summary-item { padding: 28rpx; border-radius: 22rpx; background: #fff; }
.summary-item.balance { grid-column: 1 / 3; color: #fff; background: #1d7048; }
.label { display: block; color: #8a938b; font-size: 24rpx; }
.balance .label { color: rgba(255,255,255,.72); }
.summary-amount { display: block; margin-top: 10rpx; font-size: 36rpx; font-weight: 700; }
.summary-amount.income { color: #1d7048; }
.section { margin-top: 24rpx; }
.section-title { display: block; margin-bottom: 28rpx; color: #26372e; font-size: 31rpx; font-weight: 650; }
.empty { padding: 30rpx 0; text-align: center; color: #929a93; font-size: 25rpx; }
.trend-list, .ranking-list { display: flex; flex-direction: column; gap: 24rpx; }
.trend-row { display: flex; align-items: center; gap: 14rpx; }
.trend-date { width: 68rpx; color: #69736b; font-size: 24rpx; }
.bar-track { flex: 1; height: 16rpx; border-radius: 8rpx; background: #edf0ec; overflow: hidden; }
.bar { height: 100%; border-radius: 8rpx; background: #65a37f; }
.trend-amount { width: 120rpx; text-align: right; color: #33473c; font-size: 24rpx; }
.ranking-head { display: flex; justify-content: space-between; }
.category { color: #33473c; font-size: 27rpx; font-weight: 600; }
.ranking-value { color: #737d75; font-size: 24rpx; }
.rank-track { height: 12rpx; margin-top: 12rpx; border-radius: 6rpx; background: #edf0ec; overflow: hidden; }
.rank-bar { height: 100%; border-radius: 6rpx; background: #d5a25b; }
</style>
