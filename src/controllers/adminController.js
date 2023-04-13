import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

import BaseModel from "../models/BaseModel.js";
import { Admin } from "../models/AdminModel.js";
import { validatePassword } from "../utils/validation/ValidatorUtil.js";
import LOGGER from "../utils/logger.js";
import { userIsLoggedIn } from "../config/auth.js";
import { hashPassword } from "../config/auth.js";


export const renderAdmin = (req, res) => {
  if (userIsLoggedIn(req)) {
    return res.render('admin', {
      successMsg: 'Already Logged In!'
    })
  }
  return res.render('admin');
}

export const createAdmin = async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(500).send(`ACTION NOT PERMITTED`);
  const docCount = await BaseModel.getDocumentCount('admin');
  if (docCount > 0) return res.status(400).send('Resource ADMIN already exists');

  const username = req?.body?.username;
  const password = req?.body?.password;
  if (username && password) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors);

    const admin = new Admin();
    const pass = await hashPassword(password);
    admin.username = username;
    admin.password = pass;
    await admin.save();
    LOGGER.info(`Created admin successfully`);
    res.send(`Created admin successfully`);
  } else {
    res.status(400).send('Username and or password not found');
  }
}

export const loginAdmin = async (req, res) => {
  try {

    const username = req?.body?.username;
    const password = req?.body?.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      return res.render('admin', {
        username, alert
      })
    }

    const admin = await BaseModel.getByKeyAndValue('admin', 'username', username);
    const authenticated = await validatePassword(admin?.password, password);
    if (admin && authenticated) {

      const sessionToken = jwt.sign({ _id: admin._id }, process.env.TOKEN_SECRET);
      res.cookie("session_token", sessionToken, {
        maxAge: 90000000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      })

      return res.render('admin', {
        successMsg: 'You are logged in'
      })
    } 

    return res.render('admin', {
      username,
      alert: [{ msg: 'Invalid Creds' }]
    })

  } catch (err) {
    const errorMsg = 'Unknown error occured from login attempt';
    LOGGER.error(`${errorMsg} \n${err}`);
    return res.render('admin', {
      alert: [{ msg: errorMsg }]
    })
  }
}

export const logoutAdmin = (req, res) => {
  res.clearCookie('session_token');
  res.render('admin', {
    successMsg: 'You are logged out!'
  });
}
