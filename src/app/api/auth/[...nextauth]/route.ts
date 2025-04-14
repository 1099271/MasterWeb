import NextAuth, { NextAuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { config } from "@/config/env";

// 扩展User接口添加accessToken属性
interface ExtendedUser extends User {
  accessToken?: string;
}

// 扩展Session接口添加accessToken属性
interface ExtendedSession extends Session {
  accessToken?: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// 扩展JWT接口
interface ExtendedToken {
  id?: string;
  accessToken?: string;
  [key: string]: any;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${config.apiUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "登录失败");
          }

          return {
            id: data.id || data.user_id,
            email: data.email,
            name: data.username,
            accessToken: data.access_token,
          };
        } catch (error) {
          console.error("认证错误:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as ExtendedUser).accessToken;
        token.id = user.id;
      }
      return token as ExtendedToken;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;

      if (token) {
        if (!extendedSession.user) {
          extendedSession.user = {
            id: "",
            name: null,
            email: null,
            image: null,
          };
        }

        extendedSession.user.id = (token as ExtendedToken).id as string;
        extendedSession.accessToken = (token as ExtendedToken)
          .accessToken as string;
      }

      return extendedSession;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  debug: config.debug,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
