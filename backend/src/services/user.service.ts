import prisma from '../utils/prisma'
import { UpdateUserInput } from '../schemas'

const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}

export const userService = {
  async getAll() {
    return prisma.user.findMany({ select: safeSelect, orderBy: { createdAt: 'desc' } })
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: safeSelect })
    if (!user) throw new Error('User not found')
    return user
  },

  async update(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new Error('User not found')
    return prisma.user.update({ where: { id }, data, select: safeSelect })
  },

  async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new Error('User not found')
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: safeSelect,
    })
  },
}
