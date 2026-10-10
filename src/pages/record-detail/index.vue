<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { CATEGORIES, type TransactionRecord } from '@/domain/models'
import { formatFenAsCny } from '@/domain/money'
import { services } from '@/services'
import { deleteTransaction } from './actions'

const record = ref<TransactionRecord | null>(null)
const deleting = ref(false)
const errorMessage = ref('')
const categoryName = computed(() => CATEGORIES.find((item) => item.id === record.value?.categoryId)?.name ?? '其他')
const amountText = computed(() => record.value ? `${record.value.type === 'expense' ? '-' : '+'}${formatFenAsCny(record.value.amountFen)}` : '')

onLoad((options) => {
  const stored = uni.getStorageSync('selectedTransaction') as TransactionRecord | undefined
  if (stored && stored.id === options?.id) record.value = stored
})

function editRecord() {
  if (!record.value) return
  uni.setStorageSync('editingTransaction', record.value)
  uni.navigateTo({ url: `/pages/entry/index?id=${record.value.id}` })
}

async function confirmDelete() {
  if (!record.value || deleting.value) return
  const modal = await uni.showModal({ title: '删除这笔账目？', content: '删除后无法恢复，请确认是否继续。', confirmText: '删除', confirmColor: '#c4493d' })
  const result = await deleteTransaction(services.bookkeeping, record.value.id, modal.confirm)
  if (!result) return

  deleting.value = true
  errorMessage.value = ''
  if (!result.ok) {
    deleting.value = false
    errorMessage.value = result.error.message
    return
  }

  uni.removeStorageSync('selectedTransaction')
  uni.showToast({ title: '删除成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 500)
}
</script>

<template>
  <view class="page">
    <view v-if="record" class="detail-card">
      <text class="category">{{ categoryName }}</text>
      <text class="amount" :class="record.type">{{ amountText }}</text>
      <view class="row"><text class="label">类型</text><text>{{ record.type === 'expense' ? '支出' : '收入' }}</text></view>
      <view class="row"><text class="label">日期</text><text>{{ record.occurredAt }}</text></view>
      <view class="row"><text class="label">备注</text><text>{{ record.note || '无' }}</text></view>
    </view>
    <view v-else class="state-card">账目不存在或已被删除。</view>
    <text v-if="errorMessage" class="error">{{ errorMessage }}</text>
    <view v-if="record" class="actions">
      <button class="edit-button" @tap="editRecord">编辑账目</button>
      <button class="delete-button" :loading="deleting" :disabled="deleting" @tap="confirmDelete">删除账目</button>
    </view>
  </view>
</template>

<style scoped>
.page { min-height: 100vh; padding: 36rpx 32rpx; box-sizing: border-box; background: #f5f6f3; }
.detail-card, .state-card { padding: 36rpx 30rpx; border-radius: 26rpx; background: #fff; }
.category { display: block; text-align: center; color: #68736a; font-size: 28rpx; }
.amount { display: block; margin: 16rpx 0 42rpx; text-align: center; color: #293a31; font-size: 54rpx; font-weight: 700; }
.amount.income { color: #1d7048; }
.row { display: flex; justify-content: space-between; padding: 24rpx 0; border-top: 1rpx solid #eef0ec; color: #26352d; font-size: 29rpx; }
.label { color: #8a938b; }
.state-card { text-align: center; color: #7f8880; }
.error { display: block; margin-top: 20rpx; padding: 20rpx; border-radius: 16rpx; color: #a63c32; background: #fff0ee; }
.actions { margin-top: 32rpx; display: flex; flex-direction: column; gap: 18rpx; }
.edit-button, .delete-button { width: 100%; border-radius: 18rpx; font-size: 30rpx; }
.edit-button { color: #fff; background: #1d7048; }
.delete-button { color: #bd4439; background: #fff; }
.edit-button::after, .delete-button::after { border: 0; }
</style>
