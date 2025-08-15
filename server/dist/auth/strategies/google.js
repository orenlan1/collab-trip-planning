import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../../prisma/client.js';
import dotenv from 'dotenv';
dotenv.config();
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google Client ID and Secret must be set in environment variables');
}
export const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        const emailVerified = profile.emails?.[0]?.verified ?? true; // some APIs omit this, assume true for dev
        if (!email)
            return done(new Error("No email from Google"), undefined);
        const existingAccount = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: profile.id,
                },
            },
            include: { user: true },
        });
        if (existingAccount) {
            return done(null, existingAccount.user);
        }
        // Try to find existing user by email
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        let user;
        if (existingUser) {
            // Link Google to existing user
            user = await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    accounts: {
                        create: {
                            provider: 'google',
                            providerAccountId: profile.id,
                            type: 'oauth',
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        },
                    },
                },
            });
        }
        else {
            // Create new user + account
            user = await prisma.user.create({
                data: {
                    email,
                    emailVerified: emailVerified ? new Date() : null,
                    name: profile.displayName,
                    image: profile.photos?.[0]?.value ?? null,
                    accounts: {
                        create: {
                            provider: 'google',
                            providerAccountId: profile.id,
                            type: 'oauth',
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        },
                    },
                }
            });
        }
        return done(null, user);
    }
    catch (error) {
        console.error(error);
        return done(error, undefined);
    }
});
//# sourceMappingURL=google.js.map