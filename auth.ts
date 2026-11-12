
import NextAuth, { type DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

declare module "next-auth" {
	interface User {
		role?: string;
		sessionVersion?: number;
	}

	interface Session {
		user: {
			id: string;
			role?: string;
		} & DefaultSession["user"];
		invalidated?: boolean;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id?: string;
		role?: string;
		sessionVersion?: number;
		invalidated?: boolean;
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		Google,

		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
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

				const isPasswordValid = await bcrypt.compare(
					password,
					user.password
				);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
					sessionVersion: user.sessionVersion,
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
					role: adminEmails.includes(email)
						? "HR_ADMIN"
						: "EMPLOYEE",
				},
			});

			return true;
		},

		async jwt({ token, user, account }) {
			// --------------------------------
			// 1. Initial Google login
			// --------------------------------

			if (user && account?.provider === "google" && user.email) {
				const databaseUser = await prisma.user.findUnique({
					where: {
						email: user.email.trim().toLowerCase(),
					},
				});

				if (!databaseUser) {
					throw new Error("Google account was not persisted.");
				}

				token.id = databaseUser.id;
				token.name = databaseUser.name;
				token.email = databaseUser.email;
				token.role = databaseUser.role;
				token.sessionVersion = databaseUser.sessionVersion;
				token.invalidated = false;
			}

			// --------------------------------
			// 2. Initial Credentials login
			// --------------------------------

			else if (user) {
				token.id = user.id;
				token.name = user.name;
				token.email = user.email;
				token.role = user.role;
				token.sessionVersion = user.sessionVersion;
				token.invalidated = false;
			}

			// --------------------------------
			// 3. Keep invalidated JWT invalid
			// --------------------------------

			if (token.invalidated === true) {
				return token;
			}

			// --------------------------------
			// 4. Validate JWT against database
			// --------------------------------

			if (!token.id || token.sessionVersion === undefined) {
				token.invalidated = true;
				return token;
			}

			const databaseUser = await prisma.user.findUnique({
				where: {
					id: token.id,
				},
				select: {
					sessionVersion: true,
				},
			});

			if (
				!databaseUser ||
				databaseUser.sessionVersion !== token.sessionVersion
			) {
				token.invalidated = true;
			}

			return token;
		},

		// --------------------------------
		// 5. Expose session information
		// --------------------------------

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id ?? "";
				session.user.name = token.name ?? null;
				session.user.email = token.email ?? "";
				session.user.role = token.role;
			}

			session.invalidated = token.invalidated === true;

			return session;
		},
	},
});
