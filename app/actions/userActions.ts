
'use server';

import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';

type CreateUserResult = {
  success: boolean;
  message: string;
};

export async function createUser(
  formData: FormData
): Promise<CreateUserResult> {
  try {
    const email = (formData.get('email') as string | null)
      ?.trim()
      .toLowerCase();

    const password = formData.get('password') as string | null;

    if (!email || !password?.trim()) {
      return {
        success: false,
        message: 'Email and password are required.',
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Email already exists. Please sign in instead.',
      };
    }

    const adminEmails =
      process.env.ADMIN_EMAILS
        ?.split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean) ?? [];

    const role = adminEmails.includes(email)
      ? 'HR_ADMIN'
      : 'EMPLOYEE';

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        password: hashedPassword,
        role,
      },
    });

    return {
      success: true,
      message: 'Account created successfully!',
    };
  } catch (err: unknown) {
    // Handle duplicate emails even if two requests arrive together.
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      err.code === 'P2002'
    ) {
      return {
        success: false,
        message: 'Email already exists. Please log in instead.',
      };
    }

    // Keep unexpected database/server details out of the response.
    console.error('Signup failed:', err);

    return {
      success: false,
      message: 'Unable to create your account. Please try again.',
    };
  }
}
