'use client'; // Marking this as a client component

import { SessionProvider } from "next-auth/react"; // Import SessionProvider

import { ReactNode } from "react";
import { Session } from "next-auth";

const ClientSessionWrapper = ({ children, session }: { children: ReactNode; session: Session | null }) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default ClientSessionWrapper;
