import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * 扩展Session接口，添加自定义字段
   */
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  /**
   * 扩展User接口，添加自定义字段
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展JWT接口，添加自定义字段
   */
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}
