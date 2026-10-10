<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TransactionForm from '@/components/transaction-form.vue'
import type { TransactionInput, TransactionRecord } from '@/domain/models'
import { services } from '@/services'
import { saveTransaction } from './submission'

const submitting = ref(false)
const saveError = ref('')
const transactionId = ref<string>()
const initialValue = ref<TransactionInput | null>(null)

onLoad((options) => {
  transactionId.value = typeof options?.id === 'string' ? options.id : undefined
  if (!transactionId.value) return

  const stored = uni.getStorageSync('editingTransaction') as TransactionRecord | undefined
  if (stored?.id === transactionId.value) {
    initialValue.value = {
      type: stored.type,
      amountFen: stored.amountFen,
      categoryId: stored.categoryId,
      occurredAt: stored.occurredAt,
      note: stored.note,
    }
  }
})

async function handleSubmit(value: TransactionInput) {
  if (submitting.value) return
  submitting.value = true
  saveError.value = ''
  uni.showLoading({ title: '正在保存', mask: true })

  let result
  try {
    result = await saveTransaction(services.bookkeeping, value, {
      transactionId: transactionId.value,
    })
  } finally {
    submitting.value = false
    uni.hideLoading()
  }

  if (!result.ok) {
    saveError.value = result.error.message
    return
  }

  if (transactionId.value) uni.removeStorageSync('editingTransaction')
  uni.showToast({ title: transactionId.value ? '修改成功' : '记账成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 500)
}
</script>

<template>
  <view class="page">
    <view class="heading">
      <text class="title">记一笔</text>
      <text class="subtitle">每一笔认真记录，都会让生活更清晰</text>
    </view>
    <text v-if="saveError" class="save-error">{{ saveError }}</text>
    <TransactionForm
      :mode="transactionId ? 'edit' : 'create'"
      :initial-value="initialValue"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </view>
</template>

<style scoped>
.page { min-height: 100vh; padding: 32rpx; box-sizing: border-box; background: #f5f6f3; }
.heading { margin: 16rpx 0 34rpx; }
.title { display: block; color: #17251e; font-size: 44rpx; font-weight: 700; }
.subtitle { display: block; margin-top: 10rpx; color: #818981; font-size: 26rpx; }
.save-error { display: block; margin-bottom: 20rpx; padding: 20rpx 24rpx; border-radius: 16rpx; color: #a63c32; background: #fff0ee; font-size: 26rpx; }
</style>
