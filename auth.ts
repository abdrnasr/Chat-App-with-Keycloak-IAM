import NextAuth from "next-auth"
import { decodeJwt } from "@/lib/utils";
import { CreateNewUserRecord, GetUserPKByUUID } from "./lib/dbquery";
import Keycloak from "next-auth/providers/keycloak"


type KC = {
  preferred_username: string;
  sub: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
};

type Token= {
  dbId: number;
  UUID: string;
  roles: string[];
  username: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Keycloak({
      issuer: process.env.KEYCLOAK_ISSUER!,
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      authorization: { params: { scope: "openid profile email roles" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {

        const accessToken = decodeJwt<KC>(account.access_token);
        const clientId = process.env.KEYCLOAK_CLIENT_ID!;
        const clientRoles = accessToken.resource_access?.[clientId]?.roles ?? [];
        const realmRoles  = accessToken.realm_access?.roles ?? [];
        (token as Token).roles = Array.from(new Set([...clientRoles, ...realmRoles]));

        const username = accessToken.preferred_username;
        const uuid = accessToken.sub;

        // A token can only be issued if a user record exists
        try{
          let id = await GetUserPKByUUID(uuid);
          if (id <= 0) {
            await CreateNewUserRecord(uuid, username);
            id = await GetUserPKByUUID(uuid);
          }
          (token as Token).username = username;
          (token as Token).dbId = id;
          (token as Token).UUID = uuid;
        }catch(err:unknown){
          throw new Error("Login refused: user record error.");
        }

      }
      return token;
    },
    async session({ session, token }) {

      session.user = {
        ...session.user,
        id: (token as Token).UUID ?? null,
        roles: (token as Token).roles ?? [],
        username: (token as Token).username ?? null,
        dbId: (token as Token).dbId ?? null,
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      } as any;

      return session;
    },
  },
})

 