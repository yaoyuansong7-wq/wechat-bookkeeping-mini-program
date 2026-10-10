<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { normalizeDateInShanghai } from '@/domain/date'
import { yuanTextToFen } from '@/domain/money'
import {
  CATEGORIES,
  type CategoryId,
  type TransactionInput,
  type TransactionType,
} from '@/domain/models'
import { validateTransactionInput, type TransactionField } from '@/domain/validation'

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  initialValue?: TransactionInput | null
  submitting?: boolean
}>(), {
  mode: 'create',
  initialValue: null,
  submitting: false,
})

const emit = defineEmits<{
  submit: [value: TransactionInput]
}>()

const createInitialForm = () => ({
  type: props.initialValue?.type ?? 'expense' as TransactionType,
  amountText: props.initialValue ? (props.initialValue.amountFen / 100).toFixed(2) : '',
  categoryId: props.initialValue?.categoryId ?? '' as CategoryId | '',
  occurredAt: props.initialValue?.occurredAt ?? normalizeDateInShanghai(new Date()),
  note: props.initialValue?.note ?? '',
})

const form = reactive(createInitialForm())
const errors = ref<Partial<Record<TransactionField, string>>>({})

const availableCategories = computed(() => CATEGORIES.filter((item) => item.type === form.type))
const categoryNames = computed(() => availableCategories.value.map((item) => item.name))
const selectedCategoryIndex = computed(() => Math.max(
  0,
  availableCategories.value.findIndex((item) => item.id === form.categoryId),
))
const selectedCategoryName = computed(() => (
  availableCategories.value.find((item) => item.id === form.categoryId)?.name ?? '请选择分类'
))

watch(() => props.initialValue, (value) => {
  if (!value) return
  Object.assign(form, {
    type: value.type,
    amountText: (value.amountFen / 100).toFixed(2),
    categoryId: value.categoryId,
    occurredAt: value.occurredAt,
    note: value.note ?? '',
  })
}, { deep: true })

function selectType(type: TransactionType) {
  if (form.type === type) return
  form.type = type
  form.categoryId = ''
  errors.value.type = undefined
  errors.value.categoryId = undefined
}

function eventValue(event: Event): string {
  return String((event as Event & { detail?: { value?: string | number } }).detail?.value ?? '')
}

function onAmountInput(event: Event) {
  form.amountText = eventValue(event)
  errors.value.amountFen = undefined
}

function onCategoryChange(event: Event) {
  const category = availableCategories.value[Number(eventValue(event))]
  form.categoryId = category?.id ?? ''
  errors.value.categoryId = undefined
}

function onDateChange(event: Event) {
  form.occurredAt = eventValue(event)
  errors.value.occurredAt = undefined
}

function onNoteInput(event: Event) {
  form.note = eventValue(event)
  errors.value.note = undefined
}

function submitForm() {
  const amountFen = yuanTextToFen(form.amountText)
  const candidate: Partial<TransactionInput> = {
    type: form.type,
    amountFen: amountFen ?? undefined,
    categoryId: form.categoryId || undefined,
    occurredAt: form.occurredAt,
    note: form.note.trim() || undefined,
  }
  const issues = validateTransactionInput(candidate)
  errors.value = Object.fromEntries(issues.map((issue) => [issue.field, issue.message]))

  if (issues.length > 0 || amountFen === null || !form.categoryId) return

  emit('submit', {
    type: form.type,
    amountFen,
    categoryId: form.categoryId,
    occurredAt: form.occurredAt,
    note: form.note.trim() || undefined,
  })
}

defineExpose({ form, errors, categoryNames, submitForm, selectType })
</script>

<template>
  <view class="transaction-form">
    <view class="type-switch" aria-label="收支类型">
      <button
        class="type-button"
        :class="{ active: form.type === 'expense' }"
        data-test="expense-type"
        @click="selectType('expense')"
      >支出</button>
      <button
        class="type-button"
        :class="{ active: form.type === 'income' }"
        data-test="income-type"
        @click="selectType('income')"
      >收入</button>
    </view>

    <view class="field amount-field">
      <text class="label">金额</text>
      <view class="amount-input-row">
        <text class="currency">¥</text>
        <input
          class="amount-input"
          data-test="amount"
          type="digit"
          maxlength="12"
          placeholder="0.00"
          :value="form.amountText"
          @input="onAmountInput"
        />
      </view>
      <text v-if="errors.amountFen" class="error" data-test="amount-error">{{ errors.amountFen }}</text>
    </view>

    <view class="field">
      <text class="label">分类</text>
      <picker
        data-test="category"
        :range="categoryNames"
        :value="selectedCategoryIndex"
        @change="onCategoryChange"
      >
        <view class="picker-value" :class="{ placeholder: !form.categoryId }">
          {{ selectedCategoryName }}
        </view>
      </picker>
      <text v-if="errors.categoryId" class="error" data-test="category-error">{{ errors.categoryId }}</text>
    </view>

    <view class="field">
      <text class="label">日期</text>
      <picker data-test="date" mode="date" :value="form.occurredAt" @change="onDateChange">
        <view class="picker-value">{{ form.occurredAt }}</view>
      </picker>
      <text v-if="errors.occurredAt" class="error">{{ errors.occurredAt }}</text>
    </view>

    <view class="field">
      <text class="label">备注（选填）</text>
      <textarea
        class="note-input"
        data-test="note"
        maxlength="100"
        placeholder="写点什么，最多 100 字"
        :value="form.note"
        @input="onNoteInput"
      />
      <view class="note-count">{{ form.note.length }}/100</view>
      <text v-if="errors.note" class="error">{{ errors.note }}</text>
    </view>

    <button
      class="save-button"
      data-test="submit"
      :loading="submitting"
      :disabled="submitting"
      @tap="submitForm"
    >{{ submitting ? '保存中…' : mode === 'edit' ? '保存修改' : '保存账目' }}</button>
  </view>
</template>

<style scoped>
.transaction-form { display: flex; flex-direction: column; gap: 24rpx; }
.type-switch { display: flex; padding: 8rpx; border-radius: 20rpx; background: #e9ebe6; }
.type-button { flex: 1; margin: 0; border: 0; border-radius: 16rpx; color: #687068; background: transparent; font-size: 30rpx; line-height: 76rpx; }
.type-button::after { border: 0; }
.type-button.active { color: #173b2b; background: #fff; font-weight: 600; box-shadow: 0 4rpx 14rpx rgba(35, 72, 54, 0.08); }
.field { padding: 28rpx; border-radius: 24rpx; background: #fff; }
.label { display: block; margin-bottom: 18rpx; color: #566058; font-size: 26rpx; }
.amount-input-row { display: flex; align-items: center; }
.currency { margin-right: 12rpx; color: #17251e; font-size: 48rpx; font-weight: 600; }
.amount-input { flex: 1; height: 80rpx; color: #17251e; font-size: 58rpx; font-weight: 600; }
.picker-value { min-height: 52rpx; color: #17251e; font-size: 32rpx; }
.placeholder { color: #a0a7a1; }
.note-input { width: 100%; min-height: 130rpx; color: #17251e; font-size: 30rpx; }
.note-count { text-align: right; color: #a0a7a1; font-size: 24rpx; }
.error { display: block; margin-top: 12rpx; color: #c4493d; font-size: 24rpx; }
.save-button { margin-top: 12rpx; width: 100%; border-radius: 20rpx; background: #1d7048; font-size: 32rpx; line-height: 92rpx; }
.save-button::after { border: 0; }
</style>
