import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: email, // Using email as the unique identifier for credentials
          }
        }
      },
    });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login after register failed' });
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal error', error: err });
  }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Login failed' });
  }
  const { password, ...safeUser } = req.user as any;

  res.status(200).json(safeUser);
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.status(200).json({ message: 'Logged out' });
  });
});


router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));


// Get current session user
router.get('/session', (req: express.Request, res: express.Response) => {
  if (req.user) {
    // @ts-ignore
    const { password, ...safeUser } = req.user;
    res.json(safeUser);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

router.get('/google/callback', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  passport.authenticate('google', (err: Error | null, user: Express.User | false | null, info: { message: string } | undefined) => {
    if (err) {
      console.error('Google auth error:', err);
      return res.redirect('http://localhost:5173/login?error=' + encodeURIComponent('Authentication failed'));
    }
    
    if (!user) {
      console.error('No user from Google auth:', info);
      return res.redirect('http://localhost:5173/login?error=' + encodeURIComponent(info?.message || 'Login failed'));
    }

    req.logIn(user, (err: Error | null) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('http://localhost:5173/login?error=' + encodeURIComponent('Login failed'));
      }
      return res.redirect('http://localhost:5173/dashboard');
    });
  })(req, res, next);
});

export default router;
