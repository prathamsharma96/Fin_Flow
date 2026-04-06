import prisma from '../utils/prisma'
import { AuthUser } from '../middleware/authenticate'

export const dashboardService = {
  async getSummary(user: AuthUser) {
    const where = {
      deletedAt: null,
      ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
    }

    const [incomeAgg, expenseAgg, totalRecords, recentRecords] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'income' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.financialRecord.aggregate({
        where: { ...where, type: 'expense' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.financialRecord.count({ where }),
      prisma.financialRecord.findMany({
        where,
        take: 5,
        orderBy: { date: 'desc' },
        select: { id: true, amount: true, type: true, category: true, date: true, notes: true },
      }),
    ])

    const totalIncome = incomeAgg._sum.amount ?? 0
    const totalExpense = expenseAgg._sum.amount ?? 0

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      totalRecords,
      incomeCount: incomeAgg._count,
      expenseCount: expenseAgg._count,
      recentRecords,
    }
  },

  async getTrends(user: AuthUser) {
    const where = {
      deletedAt: null,
      ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
    }

    const records = await prisma.financialRecord.findMany({
      where,
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    })

    const monthMap: Record<string, { month: string; income: number; expense: number }> = {}

    records.forEach((r) => {
      const key = r.date.toISOString().slice(0, 7)
      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expense: 0 }
      if (r.type === 'income') monthMap[key].income += r.amount
      else monthMap[key].expense += r.amount
    })

    return Object.values(monthMap).slice(-6)
  },

  async getCategories(user: AuthUser) {
    const where = {
      deletedAt: null,
      ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
    }

    const grouped = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    })

    return grouped.map((g) => ({
      category: g.category,
      type: g.type,
      total: g._sum.amount ?? 0,
      count: g._count,
    }))
  },
}
