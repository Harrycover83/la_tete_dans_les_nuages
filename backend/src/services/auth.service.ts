import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { config } from '../utils/config';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer';

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  dateOfBirth?: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, 12);
  const emailVerifyToken = uuidv4();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      emailVerifyToken,
      card: { create: {} },
    },
  });

  await sendVerificationEmail(email, emailVerifyToken);
  return { id: user.id, email: user.email };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) throw new Error('INVALID_TOKEN');

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = uuidv4();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
    },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const accessToken = generateAccessToken(stored.user.id, stored.user.role);
  return { accessToken };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // silently ignore for security

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpiry: expiresAt },
  });

  await sendPasswordResetEmail(email, token);
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() },
    },
  });
  if (!user) throw new Error('INVALID_OR_EXPIRED_TOKEN');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
  });
}

function generateAccessToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}
