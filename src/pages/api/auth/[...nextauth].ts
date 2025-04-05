
      // CredentialsProvider({
      //   name: "Credentials",
      //   credentials: {
      //     username: { label: "Username", type: "text" },
      //     password: { label: "Password", type: "password" },
      //   },
      //   async authorize(credentials) {
      //     if (credentials && credentials.username === "admin" && credentials.password === "password") {
      //       return { id: "1", name: "Admin", email: "admin@example.com" };
      //     }
      //     return null;
      //   },
      // }),


// src/app/api/auth/[...nextauth].ts
// src/pages/api/auth/[...nextauth].ts

import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.JWT_SECRET, // Optional: required if you're using JWT authentication
  pages: {
    signIn: "/auth/login",  // Optional custom sign-in page
  },
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, authOptions);
};

export default handler;
