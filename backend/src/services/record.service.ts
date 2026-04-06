import prisma from '../utils/prisma'
import { CreateRecordInput, UpdateRecordInput, RecordQueryInput } from '../schemas'
import { AuthUser } from '../middleware/authenticate'

export const recordService = {
  async getAll(user: AuthUser, query: RecordQueryInput) {
    const page = parseInt(query.page ?? '1')
    const limit = parseInt(query.limit ?? '10')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      deletedAt: null,
      ...(user.role === 'VIEWER' || user.role === 'ANALYST' ? { userId: user.id } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.category ? { category: { contains: query.category } } : {}),
      ...(query.from || query.to
        ? {
            date: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.financialRecord.count({ where }),
    ])

    return { records, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string, user: AuthUser) {
    const record = await prisma.financialRecord.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!record) throw new Error('Record not found')
    return record
  },

  async create(data: CreateRecordInput, userId: string) {
    return prisma.financialRecord.create({
      data: { ...data, date: new Date(data.date), userId },
      include: { user: { select: { name: true, email: true } } },
    })
  },

  async update(id: string, data: UpdateRecordInput, user: AuthUser) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, deletedAt: null },
    })
    if (!record) throw new Error('Record not found')

    return prisma.financialRecord.update({
      where: { id },
      data: { ...data, ...(data.date ? { date: new Date(data.date) } : {}) },
      include: { user: { select: { name: true, email: true } } },
    })
  },

  async softDelete(id: string) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, deletedAt: null },
    })
    if (!record) throw new Error('Record not found')

    return prisma.financialRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },
}
