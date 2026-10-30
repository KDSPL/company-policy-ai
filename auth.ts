import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		Google,
		Credentials({
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: {
					label: "Password",
					type: "password",
				},
			},

			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const email = String(credentials.email).trim().toLowerCase();
				const password = String(credentials.password);

				const user = await prisma.user.findUnique({
					where: { email },
				});

				if (!user?.password) {
					return null;
				}

				const isPasswordValid = await bcrypt.compare(password, user.password);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],

	session: {
		strategy: "jwt",
	},

	pages: {
		signIn: "/signin",
	},

	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider !== "google") {
				return true;
			}

			const email = user.email?.trim().toLowerCase();
			if (!email) {
				return false;
			}

			const adminEmails =
				process.env.ADMIN_EMAILS?.split(",")
					.map((adminEmail) => adminEmail.trim().toLowerCase())
					.filter(Boolean) ?? [];

			await prisma.user.upsert({
				where: { email },
				update: {},
				create: {
					email,
					name: user.name?.trim() || email.split("@")[0],
					password: null,
					role: adminEmails.includes(email) ? "HR_ADMIN" : "EMPLOYEE",
				},
			});

			return true;
		},

		async jwt({ token, user, account }) {
			if (user && account?.provider === "google" && user.email) {
				const databaseUser = await prisma.user.findUnique({
					where: { email: user.email.trim().toLowerCase() },
				});

				if (!databaseUser) {
					throw new Error("Google account was not persisted.");
				}

				token.id = databaseUser.id;
				token.name = databaseUser.name;
				token.email = databaseUser.email;
				token.role = databaseUser.role;
			} else if (user) {
				token.id = user.id;
				token.name = user.name;
				token.email = user.email;
				token.role = (user as { role?: string }).role;
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.name = token.name as string;
				session.user.email = token.email as string;
				(session.user as { role?: string }).role = token.role as string;
			}

			return session;
		},
	},
});
