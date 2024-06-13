import { z } from 'zod';
import fs from 'fs';
import url from 'url';
import { Routing, defaultEndpointsFactory, createResultHandler, ez, EndpointsFactory } from 'express-zod-api';
import e, { Request, Response, NextFunction } from 'express';
import { oauth2Client, authorizeUrl, verifyJWT, generateJWT } from './googleAuth';
import { google } from 'googleapis';

import dotenv from 'dotenv';
import {openAiClient} from '../models/OpenAIClient';
import {StringifyTxt, StringifyPdf} from '../utils/DocumentLoader';
// import { fuzzySplit } from '../utils/fuzzySplit';
import { writeCoverLetterPDF } from '../utils/writePDF';
import { generateJobListingPrompt } from '../prompts/jobListingPrompt';
import { generateResumePrompt } from '../prompts/resumePrompt';
import { generateHookPrompt } from '../prompts/hookPrompt';
import { generateCoverLetterPrompt } from '../prompts/coverLetterPrompt';
import ReactPDF from '@react-pdf/renderer';

dotenv.config();



const jobListing : string= StringifyTxt("public/job_listing.txt");
const resume : string = StringifyPdf("public/Ivan Pedroza Resume.pdf");

const generateLetter = async () => {
    // Generate job summary
    const jobListingPrompt = generateJobListingPrompt(jobListing);
    const jobSummary = await openAiClient([
        { role: "system", content: "You are an expert in talent acquisition and workforce optimization with 20 years of experience summarizing job descriptions." },
        { role: "user", content: jobListingPrompt }
    ]);
    console.log(jobSummary);

    // Generate resume summary
    const resumePrompt = generateResumePrompt(resume);
    const resumeSummary = await openAiClient([
        { role: "system", content: "You are an expert in talent acquisition and workforce optimization with 20 years of experience summarizing job descriptions." },
        { role: "user", content: resumePrompt }
    ]);
    console.log(resumeSummary);

  //   // Split resume summary to extract contact info
  //   const pattern = "Previous work experience";
  //   const splitParts = fuzzySplit

  //   let contactInfo = "";
  // if (splitParts.length === 2) {
  //   contactInfo = splitParts[0].trim();
  //   resumeSummary = splitParts[1].trim();
  //   console.log('Contact info split successful\n\n');
  // } else {
  //   console.log("Pattern not found or similarity too low.");
  // }


  let hook = "";
  let body = "";

  hook = await openAiClient([
    { role: "system", content: "You are an expert cover letter writer with a comprehensive understanding of Applicant Tracking Systems (ATS) and keyword optimization." },
    { role: "user", content: generateHookPrompt(resumeSummary, jobSummary) }
  ]);


  body = await openAiClient([
    { role: "system", content: "You are an expert cover letter writer with a comprehensive understanding of Applicant Tracking Systems (ATS) and keyword optimization." },
    { role: "user", content: generateCoverLetterPrompt(resumeSummary, jobSummary, hook) }
  ]);


  const outputFilePath = "dist/cover_letterz.pdf";
  const content = `Dear Hiring Manager, ${hook} ${body} Sincerely, Ivan Pedroza`;

  console.log("FINAL CONTENT", content);
  
  ReactPDF.render(writeCoverLetterPDF({hook, body}), outputFilePath);
};



// const secure = (req: Request, res: Response, next: NextFunction) => {
//     res.redirect(authorizeUrl);
//     req.get('/oauthcallback')
//     res.get
//     return next();
// }


const pdfEndpoint = new EndpointsFactory(
  createResultHandler({
    getPositiveResponse: () => ({
      schema: ez.file("buffer"),
      mimeType: "application/pdf",
    }),
    getNegativeResponse: () => ({ schema: z.string(), mimeType: "text/plain" }),
    handler: ({ response, error, output }) => {
      if (error) {
        response.status(500).send(error.message);
        return;
      }
      if (output && typeof output.filename === 'string') {
        const filename = output.filename;
        fs.createReadStream(filename).pipe(response.type('application/pdf'));
      } else {
        response.status(400).send("No file found");
      }
    },
  })
);

// Endpoint to fetch resume
const resumeEndpoint = pdfEndpoint.build({
  shortDescription: "Fetches resume files",
  description: 'Retrieves most up-to-date resume',
  method: 'get',
  input: z.object({ name: z.string().optional() }),
  output: z.object({ filename: z.string() }),
  handler: async ({ input: { name }, logger }) => {
    const filePath = `public/Ivan Pedroza Resume.pdf`;
    return { filename: filePath };
  },
});

// Endpoint to fetch cover letter
const coverLetterEndpoint = pdfEndpoint.build({
  shortDescription: "Fetches cover letter files",
  description: 'Retrieves most up-to-date general cover letter',
  method: 'get',
  input: z.object({ name: z.string().optional() }),
  output: z.object({ filename: z.string() }),
  handler: async ({ input: { name }, logger }) => {
    await generateLetter();
    const filePath = `public/Cover Letter.pdf`;
    return { filename: filePath };
  },
});

export const appRouter: Routing = {
  resume: resumeEndpoint,
  coverLetter: coverLetterEndpoint,
};
