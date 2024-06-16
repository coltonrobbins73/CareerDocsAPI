import { z } from 'zod';
import fs from 'fs';
import url from 'url';
import path from 'path'; // Import the path module
import { Routing, defaultEndpointsFactory, createResultHandler, ez, EndpointsFactory } from 'express-zod-api';
import { oauth2Client, authorizeUrl, verifyJWT, generateJWT } from './googleAuth';
import { google } from 'googleapis';

import dotenv from 'dotenv';
import {GPT} from '../models/OpenAIClient';
import {StringifyTxt, StringifyPdf} from '../utils/DocumentLoader';
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
import {Gemini} from '../models/Gemini';

dotenv.config();

// --- Persona Definitions ---
const talentAcquisitionExpertPersona : string = `You are an expert in talent acquisition \
and workforce optimization with 20 years of experience summarizing job descriptions.`;

const coverLetterWriterPersona : string = `You are an expert cover letter writer with a \
comprehensive understanding of Applicant Tracking Systems (ATS) and keyword optimization.`;


const resume : string = StringifyPdf("public/secure/Ivan Pedroza Resume.pdf");

const generateLetter = async ({url}: {url: string}) => {
  const jobListing = await fetchListing(url);
  const jobListingPrompt = generateJobListingPrompt(jobListing);

  // Initiate jobSummary and resumeSummary in parallel
  const [jobSummary, resumeSummary] = await Promise.all([
      GPT([
          { role: "system", content: talentAcquisitionExpertPersona },
          { role: "user", content: jobListingPrompt }
      ]),
      GPT([
          { role: "system", content: talentAcquisitionExpertPersona },
          { role: "user", content: generateResumePrompt(resume) }
      ])
  ]);


  const hook = await GPT([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateHookPrompt(resumeSummary, jobSummary) }
  ]);

  const body = await GPT([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateBodyPrompt(resumeSummary, jobSummary, hook) }
  ]);

  const review = await GPT([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateReviewPrompt(resumeSummary, jobSummary, body) }
  ]);

  const conclusion = await GPT([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateConclusionPrompt(hook, body) }
  ]);

  const final = await GPT([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateFinalPrompt(resumeSummary, hook, body, conclusion) }
  ]);

  console.log('\n\nModel:', process.env.OPENAI_MODEL);

  console.log('\n\nfinal:', final);

  return writeCoverLetterPDF({final});
};


const geminiGenerate = async ({url}: {url: string}) => {
  const jobListing = await fetchListing(url);
  const jobListingPrompt = generateJobListingPrompt(jobListing);

  // Initiate jobSummary and resumeSummary in parallel
  const [jobSummary, resumeSummary] = await Promise.all([
      Gemini([
          { role: "system", content: talentAcquisitionExpertPersona },
          { role: "user", content: jobListingPrompt }
      ]),
      Gemini([
          { role: "system", content: talentAcquisitionExpertPersona },
          { role: "user", content: generateResumePrompt(resume) }
      ])
  ]);


  const hook = await Gemini([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateHookPrompt(resumeSummary, jobSummary) }
  ]);

  const body = await Gemini([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateBodyPrompt(resumeSummary, jobSummary, hook) }
  ]);

  const review = await Gemini([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateReviewPrompt(resumeSummary, jobSummary, body) }
  ]);

  const conclusion = await Gemini([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateConclusionPrompt(hook, body) }
  ]);

  const final = await Gemini([
      { role: "system", content: coverLetterWriterPersona },
      { role: "user", content: generateFinalPrompt(resumeSummary, hook, body, conclusion) }
  ]);

  console.log('\n\nModel:', process.env.GEMINI_MODEL);

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

const job = defaultEndpointsFactory.build({
  shortDescription: "fetches job listing",
  description: 'retrieves text from job listing',
  method: 'post',
  input: z.object({ url: z.string() }),
  output: z.object({ text: z.string() }),
  handler: async ({ input: { url } }) => {
    const jobListing = await fetchListing(url);
    return { text: (jobListing) };
  },
});

// Endpoint to fetch job listing
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
    const filePath = `public/secure/Ivan Pedroza Resume.pdf`;
    return { filename: filePath };
  },
});

const coverLetterEndpoint = pdfEndpoint.build({
  shortDescription: "Fetches cover letter files",
  description: 'Retrieves most up-to-date general cover letter',
  method: 'post',
  input: z.object({
    name: z.string().optional(),
    jobUrl: z.string(),
    model: z.enum(['gpt', 'gemini']) // Add model choice
  }),  
  output: z.object({ file: z.instanceof(Buffer) }),
  handler: async ({ input: { name, jobUrl, model } }): Promise<{ file: Buffer }> => {
    let pdfDocument: React.ReactElement<ReactPDF.DocumentProps> | undefined;
    if (model === 'gemini') {
      pdfDocument = await geminiGenerate({ url: jobUrl });
    } else if (model === 'gpt') {
      pdfDocument = await generateLetter({ url: jobUrl });
    }

    if (!pdfDocument) {
      throw new Error('Failed to generate PDF document');
    }

    const file = await renderToBuffer(pdfDocument);
    return { file };
  },
});



export const appRouter: Routing = {
  job: job,
  test: test,
  resume: resumeEndpoint,
  cover: coverLetterEndpoint,
};
