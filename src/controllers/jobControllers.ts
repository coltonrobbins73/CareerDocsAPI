// import { Request, Response } from 'express';
// import { client } from '../server';
// import { parse } from 'url';

// // Upload Resume
// export const uploadResume = async (req: Request, res: Response) => {
//   const { originalname, filename, path } = req.file;
//   const { userId } = req.body;

//   await client.query('INSERT INTO resumes (user_id, filename, path) VALUES ($1, $2, $3)', [userId, filename, path]);

//   res.status(200).json({ message: 'Resume uploaded successfully.' });
// };

// // Submit Job Application
// export const submitJob = async (req: Request, res: Response) => {
//   const { userId, url, resumeId } = req.body;
//   const { hostname, pathname } = parse(url);

//   await client.query(
//     'INSERT INTO job_applications (user_id, url, hostname, pathname, resume_id, application_date) VALUES ($1, $2, $3, $4, $5, NOW())',
//     [userId, url, hostname, pathname, resumeId]
//   );

//   res.status(200).json({ message: 'Job application submitted successfully.' });
// };

// // Get Dashboard Stats
// export const getDashboardStats = async (req: Request, res: Response) => {
//   const { userId } = req.query;

//   const stats = await client.query('SELECT * FROM get_dashboard_stats($1)', [userId]);

//   res.status(200).json(stats.rows);
// };

// // Get All Job Entries
// export const getAllJobEntries = async (req: Request, res: Response) => {
//   const { userId } = req.query;

//   const jobs = await client.query('SELECT * FROM job_applications WHERE user_id = $1', [userId]);

//   res.status(200).json(jobs.rows);
// };
