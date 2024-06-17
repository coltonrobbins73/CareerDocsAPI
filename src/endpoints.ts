import { z } from 'zod';
import fs from 'fs';
import url from 'url';
import path from 'path'; // Import the path module
import { Routing, defaultEndpointsFactory, createResultHandler, ez, EndpointsFactory } from 'express-zod-api';
import { oauth2Client, authorizeUrl, verifyJWT, generateJWT } from './googleAuth';
import { google } from 'googleapis';

import dotenv from 'dotenv';
import {openAiClient} from '../models/OpenAIClient';
import {StringifyTxt, StringifyPdf} from '../utils/DocumentLoader';
// import { fuzzySplit } from '../utils/fuzzySplit';
import { generatePDFDocument, writeCoverLetterPDF } from '../utils/writePDF';
import { generateJobListingPrompt } from '../prompts/jobListingPrompt';
import { generateResumePrompt } from '../prompts/resumePrompt';
import { generateHookPrompt } from '../prompts/hookPrompt';
import { generateBodyPrompt } from '../prompts/bodyPrompt';
import { generateReviewPrompt } from '../prompts/reviewPrompt';
import { generateConclusionPrompt } from '../prompts/conclusionPrompt';
import { generateFinalPrompt } from '../prompts/truthPrompt';
import ReactPDF, {renderToBuffer} from '@react-pdf/renderer';
import {fetchListing} from '../utils/jobs';

dotenv.config();

// --- Persona Definitions ---
const talentAcquisitionExpertPersona : string = `You are an expert in talent acquisition \
and workforce optimization with 20 years of experience summarizing job descriptions.`;

const coverLetterWriterPersona : string = `You are an expert cover letter writer with a \
comprehensive understanding of Applicant Tracking Systems (ATS) and keyword optimization.`;


const resume : string = StringifyPdf("public/Ivan Pedroza Resume.pdf");

const generateLetter = async ({url}: {url: string}) => {
    // Generate job summary
    const jobListingPrompt = generateJobListingPrompt( await fetchListing(url));
    const jobSummary = await openAiClient([
        { role: "system", content: talentAcquisitionExpertPersona },
        { role: "user", content: jobListingPrompt }
    ]);
    console.log(jobSummary);
    // Generate resume summary
    const resumePrompt = generateResumePrompt(resume);
    const resumeSummary = await openAiClient([
        { role: "system", content: talentAcquisitionExpertPersona },
        { role: "user", content: resumePrompt }
    ]);


  let hook = await openAiClient([
    { role: "system", content: coverLetterWriterPersona },
    { role: "user", content: generateHookPrompt(resumeSummary, jobSummary) }
  ]);

  console.log('\nhook:', hook);

  let body = await openAiClient([
    { role: "system", content: coverLetterWriterPersona },
    { role: "user", content: generateBodyPrompt(resumeSummary, jobSummary, hook) }
  ]);

  console.log('\nbody:', body);
  

  let review = await openAiClient([
    { role: "system", content: coverLetterWriterPersona },
    { role: "user", content: generateReviewPrompt(resumeSummary, jobSummary, body) }
  ]);

  console.log('\nrevised:', review);

  let conclusion = await openAiClient([
    { role: "system", content: coverLetterWriterPersona },
    { role: "user", content: generateConclusionPrompt(hook, body) }
  ]);

  console.log('\nconclusion:', conclusion);

  let final = await openAiClient([
    { role: "system", content: coverLetterWriterPersona },
    { role: "user", content: generateFinalPrompt(resumeSummary, hook, body, conclusion) }
  ]);

  console.log('\nfinal:', final);


  return writeCoverLetterPDF({final});
};


const pdfEndpoint = new EndpointsFactory(
  createResultHandler({
    getPositiveResponse: () => ({
      schema: z.instanceof(Buffer),
      mimeType: "application/pdf",
    }),
    getNegativeResponse: () => ({ schema: z.string(), mimeType: "text/plain" }),
    handler: ({ response, error, output }) => {
      if (error) {
        response.status(500).send(error.message);
        return;
      }
      if (output && output.file) {
        const pdfBuffer = output.file as Buffer;
        response
          .status(200)
          .type('application/pdf')
          .send(pdfBuffer);
      } else {
        response.status(400).send("No file found");
      }
    },
  })
);

// Endpoint to fetch resume
const job = pdfEndpoint.build({
  shortDescription: "fetches job listing",
  description: 'retrieves text from job listing',
  method: 'post',
  input: z.object({ url: z.string() }),
  output: z.object({ text: z.string() }),
  handler: async ({ input: { url } }) => {
    return { text: ((await fetchListing(url))) };
  },
});

// Endpoint to fetch resume
const test = pdfEndpoint.build({
  shortDescription: "fetches job listing",
  description: 'retrieves text from job listing',
  method: 'post',
  input: z.object({ jobUrl: z.string()}),
  output: z.object({ text: z.string() }),
  handler: async ({ input: { jobUrl } }) => {
    return { text: "" };
  },
});



// Endpoint to fetch resume
const resumeEndpoint = pdfEndpoint.build({
  shortDescription: "Fetches resume files",
  description: 'Retrieves most up-to-date resume',
  method: 'post',
  input: z.object({ name: z.string().optional() }),
  output: z.object({ filename: z.string() }),
  handler: async ({ input: { name }, logger }) => {
    const filePath = `public/Ivan Pedroza Resume.pdf`;
    return { filename: filePath };
  },
});

const coverLetterEndpoint = pdfEndpoint.build({
  shortDescription: "Fetches cover letter files",
  description: 'Retrieves most up-to-date general cover letter',
  method: 'post',
  input: z.object({ name: z.string().optional(), jobUrl: z.string() }),
  output: z.object({ file: z.instanceof(Buffer) }),
  handler: async ({ input: { name, jobUrl }, logger }): Promise<{ file: Buffer }> => {
    const pdfBuffer = await generateLetter({ url: jobUrl });
    const file = renderToBuffer(pdfBuffer);
    return { file: await file };
  },
});

export const appRouter: Routing = {
  job: job,
  test: test,
  resume: resumeEndpoint,
  cover: coverLetterEndpoint,
};
