export type TransactionType = 'income' | 'expense'

export type ExpenseCategoryId =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'housing'
  | 'entertainment'
  | 'healthcare'
  | 'education'
  | 'other-expense'

export type IncomeCategoryId =
  | 'salary'
  | 'bonus'
  | 'investment'
  | 'gift'
  | 'other-income'

export type CategoryId = ExpenseCategoryId | IncomeCategoryId

export interface Category {
  id: CategoryId
  type: TransactionType
  name: string
}

export const CATEGORIES = [
  { id: 'food', type: 'expense', name: '餐饮' },
  { id: 'transport', type: 'expense', name: '交通' },
  { id: 'shopping', type: 'expense', name: '购物' },
  { id: 'housing', type: 'expense', name: '住房' },
  { id: 'entertainment', type: 'expense', name: '娱乐' },
  { id: 'healthcare', type: 'expense', name: '医疗' },
  { id: 'education', type: 'expense', name: '学习' },
  { id: 'other-expense', type: 'expense', name: '其他支出' },
  { id: 'salary', type: 'income', name: '工资' },
  { id: 'bonus', type: 'income', name: '奖金' },
  { id: 'investment', type: 'income', name: '投资收益' },
  { id: 'gift', type: 'income', name: '礼金' },
  { id: 'other-income', type: 'income', name: '其他收入' },
] as const satisfies readonly Category[]

export interface TransactionInput {
  type: TransactionType
  amountFen: number
  categoryId: CategoryId
  occurredAt: string
  note?: string
}

export interface TransactionRecord extends TransactionInput {
  id: string
  ownerOpenId: string
  monthKey: string
  createdAt: string
  updatedAt: string
}

export interface TransactionPage {
  items: TransactionRecord[]
  nextCursor: string | null
}

export interface DailyExpense {
  date: string
  amountFen: number
}

export interface CategoryExpense {
  categoryId: CategoryId
  amountFen: number
  ratio: number
}

export interface MonthlyFinancialInsights {
  monthKey: string
  incomeFen: number
  expenseFen: number
  balanceFen: number
  dailyExpenses: DailyExpense[]
  categoryExpenses: CategoryExpense[]
}
