import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const authorizeUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true,
  response_type: 'code',
});

const generateJWT = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

const verifyJWT = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

export { oauth2Client, authorizeUrl, generateJWT, verifyJWT };
