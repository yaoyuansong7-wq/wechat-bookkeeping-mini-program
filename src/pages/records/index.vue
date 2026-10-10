<script setup lang="ts">
import { computed, ref } from 'vue'
import { onReachBottom, onShow } from '@dcloudio/uni-app'
import { CATEGORIES, type TransactionRecord } from '@/domain/models'
import { normalizeDateInShanghai } from '@/domain/date'
import { formatFenAsCny } from '@/domain/money'
import { services } from '@/services'
import { mergeTransactionPages, shiftMonth } from './records-state'
import BottomNav from '@/components/bottom-nav.vue'

const monthKey = ref(normalizeDateInShanghai(new Date()).slice(0, 7))
const records = ref<TransactionRecord[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(false)
const loadingMore = ref(false)
const errorMessage = ref('')
const monthTitle = computed(() => { const [year, month] = monthKey.value.split('-'); return `${year} 年 ${Number(month)} 月` })

function categoryName(record: TransactionRecord) { return CATEGORIES.find((item) => item.id === record.categoryId)?.name ?? '其他' }
function signedAmount(record: TransactionRecord) { return `${record.type === 'expense' ? '-' : '+'}${formatFenAsCny(record.amountFen)}` }

async function loadRecords(append = false) {
  if (loading.value || loadingMore.value) return
  append ? (loadingMore.value = true) : (loading.value = true)
  errorMessage.value = ''
  const result = await services.bookkeeping.list(monthKey.value, append ? nextCursor.value ?? undefined : undefined)
  loading.value = false
  loadingMore.value = false
  if (!result.ok) { errorMessage.value = result.error.message; return }
  records.value = mergeTransactionPages(append ? records.value : [], result.data.items)
  nextCursor.value = result.data.nextCursor
}

function changeMonth(offset: number) {
  monthKey.value = shiftMonth(monthKey.value, offset)
  records.value = []
  nextCursor.value = null
  void loadRecords()
}

function onMonthChange(event: Event) {
  const value = (event as Event & { detail?: { value?: string } }).detail?.value
  if (!value || value === monthKey.value) return
  monthKey.value = value
  records.value = []
  nextCursor.value = null
  void loadRecords()
}

function openRecord(record: TransactionRecord) {
  uni.setStorageSync('selectedTransaction', record)
  uni.navigateTo({ url: `/pages/record-detail/index?id=${record.id}` })
}

onShow(() => void loadRecords())
onReachBottom(() => { if (nextCursor.value) void loadRecords(true) })
</script>

<template>
  <view class="page">
    <view class="month-bar">
      <button class="month-arrow" @tap="changeMonth(-1)">‹</button>
      <picker mode="date" fields="month" :value="monthKey" @change="onMonthChange"><view class="month-title">{{ monthTitle }}</view></picker>
      <button class="month-arrow" @tap="changeMonth(1)">›</button>
    </view>
    <view v-if="loading" class="state-card">正在加载账目…</view>
    <view v-else-if="errorMessage" class="state-card error-state"><text>{{ errorMessage }}</text><button class="retry-button" @tap="loadRecords(false)">重新加载</button></view>
    <view v-else-if="records.length === 0" class="state-card"><text class="empty-title">这个月还没有账目</text><text class="empty-description">记下第一笔收支，月度变化就会清晰起来。</text></view>
    <view v-else class="record-list">
      <view v-for="record in records" :key="record.id" class="record-card" @tap="openRecord(record)">
        <view class="record-main"><view><text class="category">{{ categoryName(record) }}</text><text class="record-date">{{ record.occurredAt }}</text></view><text class="amount" :class="record.type">{{ signedAmount(record) }}</text></view>
        <text v-if="record.note" class="record-note">{{ record.note }}</text>
      </view>
      <view class="page-footer">{{ loadingMore ? '正在加载更多…' : nextCursor ? '继续上拉加载' : '已经到底了' }}</view>
    </view>
    <BottomNav current="records" />
  </view>
</template>

<style scoped>
.page { min-height: 100vh; padding: 30rpx 32rpx 180rpx; box-sizing: border-box; background: #f5f6f3; }
.month-bar { display: flex; align-items: center; justify-content: center; gap: 32rpx; margin: 12rpx 0 30rpx; }
.month-title { min-width: 220rpx; text-align: center; color: #17251e; font-size: 34rpx; font-weight: 650; }
.month-arrow { margin: 0; padding: 0; width: 64rpx; height: 64rpx; border-radius: 50%; color: #315441; background: #fff; font-size: 42rpx; line-height: 58rpx; }
.month-arrow::after, .retry-button::after { border: 0; }
.state-card { padding: 70rpx 32rpx; border-radius: 24rpx; text-align: center; color: #758077; background: #fff; font-size: 28rpx; }
.empty-title { display: block; color: #283a30; font-size: 32rpx; font-weight: 600; }
.empty-description { display: block; margin-top: 14rpx; line-height: 1.6; }
.error-state { color: #a63c32; }
.retry-button { margin-top: 24rpx; width: 220rpx; color: #fff; background: #1d7048; font-size: 27rpx; }
.record-list { display: flex; flex-direction: column; gap: 18rpx; }
.record-card { padding: 28rpx; border-radius: 22rpx; background: #fff; }
.record-main { display: flex; align-items: center; justify-content: space-between; }
.category { display: block; color: #203029; font-size: 31rpx; font-weight: 600; }
.record-date { display: block; margin-top: 8rpx; color: #929a93; font-size: 24rpx; }
.amount { font-size: 33rpx; font-weight: 650; }
.amount.expense { color: #293a31; }
.amount.income { color: #1d7048; }
.record-note { display: block; margin-top: 18rpx; padding-top: 18rpx; border-top: 1rpx solid #eef0ec; color: #747d75; font-size: 25rpx; }
.page-footer { padding: 24rpx; text-align: center; color: #a0a7a1; font-size: 24rpx; }
</style>
