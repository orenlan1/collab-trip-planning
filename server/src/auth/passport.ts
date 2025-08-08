import passport from 'passport';
import { localStrategy } from './strategies/local.js';
import { prisma } from '../prisma/client.js';
import { googleStrategy } from './strategies/google.js';


passport.use(localStrategy);
passport.use(googleStrategy)

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true
    } });
    if (!user) {
      return done(new Error('User not found'), null);
    }
  
    done(null, user as Express.User);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
