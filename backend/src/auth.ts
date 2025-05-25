import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from './lib/prisma';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserPayload } from './types/express';
import config from './Config';

const ACCESS_TOKEN_EXPIRY = '1m'; // Access token expiry
const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh token expiry

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    name: string | null;
    id: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export async function signup(email: string, password: string, name: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: Prisma.UserCreateInput = {
      email,
      name,
      password: hashedPassword,
    };

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await generateAndSaveRefreshToken(user.id);

    return { accessToken, refreshToken, user };
  } catch (error: any) {
    throw new Error(error.message || 'Signup failed');
  }
}

export async function login(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error('User not found');
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) throw new Error('Invalid password');

    const { password: _, ...userWithoutPassword } = user;
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await generateAndSaveRefreshToken(user.id);

    return { accessToken, refreshToken, user: userWithoutPassword };
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
}

function generateAccessToken(userId: number, email: string) {
  return jwt.sign({ id: userId, email }, config.JWT.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

async function generateAndSaveRefreshToken(userId: number) {
  const refreshToken = jwt.sign({ id: userId }, config.JWT.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,  // Store the raw refresh token directly in the DB
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  return refreshToken;
}



// export const authenticate: RequestHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const accessToken = req.cookies.accessToken;
//     const refreshToken = req.cookies.refreshToken;

//     console.log('[DEBUG] Cookies received:', {
//       accessToken: accessToken ? 'present' : 'missing',
//       refreshToken: refreshToken ? 'present' : 'missing',
//     });

//     if (!accessToken && refreshToken) {
//       console.log('[DEBUG] Access token missing, refresh token available. Attempting refresh flow...');
//     }

//     if (!accessToken) {
//       if (!refreshToken) {
//         console.log('[DEBUG] No tokens provided');
//         res.status(401).json({ error: 'No tokens provided' });
//         return;
//       }

//       console.log('[DEBUG] Refresh token detected. Validating...');
//       try {
//         const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
//         console.log('[DEBUG] Hashed refresh token for DB check:', hashedRefreshToken);

//         const storedToken = await prisma.refreshToken.findFirst({
//           where: {
//             expiresAt: { gt: new Date() },
//           },
//           include: { user: true },
//         });

//         console.log('[DEBUG] Stored token found:', !!storedToken);
//         if (storedToken) {
//           console.log('[DEBUG] Stored token details:', {
//             token: storedToken.token,
//             userId: storedToken.userId,
//             expiresAt: storedToken.expiresAt,
//           });
//         }

//         if (!storedToken || !(await bcrypt.compare(refreshToken, storedToken.token))) {
//           console.log('[DEBUG] Refresh token validation failed');
//           res.status(401).json({ error: 'Invalid refresh token' });
//           return;
//         }

//         console.log('[DEBUG] Refresh token validated successfully');
//         const decodedRefresh = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as UserPayload;

//         console.log('[DEBUG] Refresh token decoded:', decodedRefresh);
//         const newAccessToken = generateAccessToken(decodedRefresh.id, storedToken.user.email);

//         console.log('[DEBUG] New access token generated:', newAccessToken);

//         res.cookie('accessToken', newAccessToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'PRODUCTION',
//           maxAge: 60 * 1000, // 1 minute for testing
//         });

//         req.user = {
//           id: storedToken.user.id,
//           email: storedToken.user.email,
//         };

//         next();
//       } catch (refreshError) {
//         console.log('[DEBUG] Error validating refresh token:', refreshError);
//         res.status(401).json({ error: 'Invalid or expired refresh token' });
//       }
//     } else {
//       try {
//         console.log('[DEBUG] Attempting to verify access token...');
//         const decoded = jwt.verify(accessToken, JWT_SECRET) as UserPayload;

//         console.log('[DEBUG] Access token verified successfully:', decoded);
//         req.user = decoded;
//         next();
//       } catch (error) {
//         console.log('[DEBUG] Access token verification failed:', error);
//         res.status(401).json({ error: 'Invalid or expired access token' });
//       }
//     }
//   } catch (error) {
//     console.error('[DEBUG] Middleware error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    console.log("[DEBUG] Cookies received:", {
      accessToken: accessToken ? "present" : "missing",
      refreshToken: refreshToken ? "present" : "missing",
    });

    if (!accessToken && !refreshToken) {
      console.log("[DEBUG] No tokens provided, skipping user attachment.");
      return next();
    }

    if (!accessToken && refreshToken) {
      console.log("[DEBUG] Access token missing, refresh token available. Attempting refresh flow...");
      
      try {
        // Find refresh token in database
        const storedToken = await prisma.refreshToken.findFirst({
          where: {
            token: refreshToken,
            expiresAt: { gt: new Date() },
            revoked: false,
          },
          include: { user: true },
        });

        if (!storedToken) {
          console.log("[DEBUG] Refresh token not found or invalid.");
          return next(); // Skip user attachment
        }

        console.log("[DEBUG] Refresh token validated successfully.");

        // Decode refresh token
        const decodedRefresh = jwt.verify(refreshToken, config.JWT.REFRESH_TOKEN_SECRET) as UserPayload;

        if (!decodedRefresh.id) {
          console.log("[DEBUG] Refresh token missing user ID, skipping user attachment.");
          return next();
        }

        console.log("[DEBUG] Refresh token decoded:", decodedRefresh);

        // Generate new access token
        const newAccessToken = jwt.sign(
          { id: decodedRefresh.id, email: storedToken.user.email },
          config.JWT.JWT_SECRET,
          { expiresIn: "1h" }
        );

        console.log("[DEBUG] New access token generated:", newAccessToken);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: config.NODE_ENV === "PRODUCTION",  
          maxAge: 60 * 1000, // 1 minute for testing
        });

        req.user = {
          id: storedToken.user.id,
          email: storedToken.user.email,
        };

        // Attach user ID to headers if not already set
        if (!req.headers["x-user-id"]) {
          req.headers["x-user-id"] = storedToken.user.id.toString();
          console.log("[DEBUG] Attached X-User-Id to headers:", req.headers["x-user-id"]);
        } else {
          console.log("[DEBUG] X-User-Id already exists in headers, skipping...");
        }

        return next();
      } catch (refreshError) {
        console.log("[DEBUG] Error validating refresh token:", refreshError);
        return next(); // Skip user attachment on refresh failure
      }
    }

    try {
      console.log("[DEBUG] Attempting to verify access token...");
      const decoded = jwt.verify(accessToken!, config.JWT.JWT_SECRET) as UserPayload;

      console.log("[DEBUG] Access token verified successfully:", decoded);

      if (!decoded.id) {
        console.log("[DEBUG] Access token does not contain user ID, skipping user attachment.");
        return next();
      }

      req.user = decoded;

      // Attach user ID to headers if not already set
      if (!req.headers["x-user-id"]) {
        req.headers["x-user-id"] = decoded.id.toString();
        console.log("[DEBUG] Attached X-User-Id to headers:", req.headers["x-user-id"]);
      } else {
        console.log("[DEBUG] X-User-Id already exists in headers, skipping...");
      }

      next();
    } catch (error) {
      console.log("[DEBUG] Access token verification failed:", error);
      return next(); // Skip user attachment on token failure
    }
  } catch (error) {
    console.error("[DEBUG] Middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const adminAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies.adminAccessToken;
    const refreshToken = req.cookies.adminRefreshToken;

    console.log('[DEBUG] Incoming cookies:', {
      adminAccessToken: accessToken ? 'present' : 'missing',
      adminRefreshToken: refreshToken ? 'present' : 'missing',
    });

    if (!accessToken) {
      if (!refreshToken) {
        console.log('[DEBUG] No tokens provided');
        res.status(401).json({ error: 'No tokens provided' });
        return;
      }

      console.log('[DEBUG] Access token missing, attempting to validate refresh token...');
      try {
        // Fetch the hashed refresh token from the database
        const storedToken = await prisma.adminRefreshToken.findFirst({
          where: {
            expiresAt: { gt: new Date() }, // Check if the token is not expired
          },
          include: { admin: true },
        });

        console.log('[DEBUG] Stored refresh token found:', !!storedToken);

        if (!storedToken) {
          console.log('[DEBUG] Refresh token not found or expired in the database');
          res.status(401).json({ error: 'Invalid or expired refresh token' });
          return;
        }

        // Compare the plain refresh token with the hashed version in the database
        const isTokenValid = await bcrypt.compare(refreshToken, storedToken.token);
        if (!isTokenValid) {
          console.log('[DEBUG] Refresh token validation failed');
          res.status(401).json({ error: 'Invalid or expired refresh token' });
          return;
        }

        console.log('[DEBUG] Refresh token validated successfully');
        const decodedRefresh = jwt.verify(refreshToken, config.JWT.REFRESH_TOKEN_SECRET) as { id: number };

        console.log('[DEBUG] Decoded refresh token payload:', decodedRefresh);

        const newAccessToken = jwt.sign(
          { id: decodedRefresh.id, role: storedToken.admin.role },
          config.JWT.JWT_SECRET,
          { expiresIn: '15m' } // New access token expiry
        );

        console.log('[DEBUG] New access token generated:', newAccessToken);

        res.cookie('adminAccessToken', newAccessToken, {
          httpOnly: true,
          secure: config.NODE_ENV === 'PRODUCTION',
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        req.admin = { id: storedToken.admin.id, email: storedToken.admin.email };
        console.log('[DEBUG] Request admin details set:', req.admin);
        return next();
      } catch (error) {
        console.error('[DEBUG] Error during refresh token validation:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
      }
    }

    console.log('[DEBUG] Access token present, attempting to validate...');
    try {
      const decoded = jwt.verify(accessToken, config.JWT.JWT_SECRET) as { id: number, role: string };
      console.log('[DEBUG] Access token validated successfully:', decoded);

      req.admin = { id: decoded.id };
      console.log('[DEBUG] Request admin details set:', req.admin);
      return next();
    } catch (error) {
      console.error('[DEBUG] Invalid or expired access token:', error);
      res.status(401).json({ error: 'Invalid or expired access token' });
      return;
    }
  } catch (error) {
    console.error('[DEBUG] Middleware encountered an error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logAdminRole = (req: Request, res: Response): void => {
  try {
    // Retrieve the access token from cookies
    const accessToken = req.cookies.adminAccessToken;

    if (!accessToken) {
      console.log('[DEBUG] No access token provided');
      res.status(400).json({ error: 'Access token is missing' });
      return;
    }

    // Verify and decode the token
    const decoded = jwt.verify(accessToken, config.JWT.JWT_SECRET) as { role: string };

    // Log the role
    console.log('[DEBUG] Admin Role:', decoded.role);

    // Respond with success or proceed as needed
    res.status(200).json({ message: 'Role logged successfully', role: decoded.role });
  } catch (error:any) {
    console.error('[DEBUG] Error decoding token:', error.message);
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
};


