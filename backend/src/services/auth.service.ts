import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma'
import { RegisterInput, LoginInput } from '../schemas'

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw new Error('Email already in use')

    const passwordHash = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role ?? 'VIEWER',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    })

    return { user, token }
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user || !user.isActive) throw new Error('Invalid credentials')

    const valid = await bcrypt.compare(data.password, user.passwordHash)
    if (!valid) throw new Error('Invalid credentials')

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    })

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    }
  },

  async me(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    })
  },
}
