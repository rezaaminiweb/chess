import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyPassword } from '@/lib/auth'

// Custom Instagram Provider
const InstagramProvider = {
  id: 'instagram',
  name: 'Instagram',
  type: 'oauth' as const,
  authorization: {
    url: 'https://api.instagram.com/oauth/authorize',
    params: {
      scope: 'user_profile,user_media',
      response_type: 'code',
    },
  },
  token: 'https://api.instagram.com/oauth/access_token',
  userinfo: 'https://graph.instagram.com/me?fields=id,username,account_type,media_count',
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.id,
      name: profile.username,
      email: `${profile.username}@instagram.local`,
      image: null,
    }
  },
}

// Custom Telegram Provider
const TelegramProvider = {
  id: 'telegram',
  name: 'Telegram',
  type: 'oauth' as const,
  authorization: {
    url: 'https://oauth.telegram.org/auth',
    params: {
      bot_id: process.env.TELEGRAM_BOT_TOKEN?.split(':')[0],
      origin: process.env.NEXTAUTH_URL,
      return_to: `${process.env.NEXTAUTH_URL}/api/auth/callback/telegram`,
    },
  },
  token: 'https://oauth.telegram.org/auth',
  userinfo: 'https://oauth.telegram.org/auth',
  clientId: process.env.TELEGRAM_BOT_TOKEN?.split(':')[0],
  clientSecret: process.env.TELEGRAM_BOT_TOKEN,
  profile(profile: any) {
    return {
      id: profile.id,
      name: profile.first_name + (profile.last_name ? ` ${profile.last_name}` : ''),
      email: `${profile.username || profile.id}@telegram.local`,
      image: profile.photo_url,
    }
  },
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    InstagramProvider as any,
    TelegramProvider as any,
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isValidPassword = await verifyPassword(credentials.password, user.password)
        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.username,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.username = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github' || account?.provider === 'facebook') {
        // Check if user exists, if not create username from email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          // Generate username from email
          const baseUsername = user.email!.split('@')[0]
          let username = baseUsername
          let counter = 1

          // Ensure username is unique
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`
            counter++
          }

          // Update user with generated username
          await prisma.user.update({
            where: { email: user.email! },
            data: { username }
          })
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  },
})

export { handler as GET, handler as POST }

