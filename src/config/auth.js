import jwt from 'jsonwebtoken';
import { hash } from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

export const sessionAuth = (req, res, next) => {
  try {
    const token = req?.cookies?.session_token;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
      const data = jwt.verify(token, process.env.TOKEN_SECRET);
      req.userId = data._id;
      return next();
    } catch {
      return res.sendStatus(403);
    }
  } catch {
    LOGGER.error(`Unknown error occured while performing sessionAuth`);
    res.status(500).send(`Unknown Error Occured`);
  }
}

export const userIsLoggedIn = (req) => {
  const token = req.cookies.session_token;
  if (token) {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = data._id;
    return true;
  }
  return false;
}

export const hashPassword = async (password) => {
  return await hash(password, 10);
}