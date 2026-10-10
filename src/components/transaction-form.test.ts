// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TransactionForm from './transaction-form.vue'

const global = {
  config: {
    compilerOptions: {
      isCustomElement: (tag: string) => ['view', 'text', 'picker'].includes(tag),
    },
  },
}

describe('TransactionForm', () => {
  it('shows required errors and does not submit an empty form', async () => {
    const wrapper = mount(TransactionForm, { global })

    await wrapper.get('[data-test="submit"]').trigger('tap')

    expect(wrapper.get('[data-test="amount-error"]').text()).toContain('请输入大于零')
    expect(wrapper.get('[data-test="category-error"]').text()).toContain('请选择有效分类')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits a normalized expense after valid fields are entered', async () => {
    const wrapper = mount(TransactionForm, { global })
    const exposed = wrapper.vm as unknown as {
      form: { amountText: string; categoryId: string; occurredAt: string; note: string }
      submitForm: () => void
    }

    exposed.form.amountText = '12.50'
    exposed.form.categoryId = 'food'
    exposed.form.occurredAt = '2026-10-09'
    exposed.form.note = ' 午餐 '
    exposed.submitForm()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      type: 'expense',
      amountFen: 1250,
      categoryId: 'food',
      occurredAt: '2026-10-09',
      note: '午餐',
    }])
  })

  it('uses the same component for edit mode and switches category choices with type', async () => {
    const wrapper = mount(TransactionForm, {
      global,
      props: {
        mode: 'edit',
        initialValue: {
          type: 'expense',
          amountFen: 3200,
          categoryId: 'shopping',
          occurredAt: '2026-10-08',
          note: '日用品',
        },
      },
    })
    const exposed = wrapper.vm as unknown as {
      form: { amountText: string; categoryId: string }
      categoryNames: string[]
      selectType: (type: 'income' | 'expense') => void
    }

    expect(exposed.form.amountText).toBe('32.00')
    expect(wrapper.get('[data-test="submit"]').text()).toBe('保存修改')
    exposed.selectType('income')
    await wrapper.vm.$nextTick()
    expect(exposed.form.categoryId).toBe('')
    expect(exposed.categoryNames).toContain('工资')
  })
})
