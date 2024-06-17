import { z } from 'zod';
import fs from 'fs';
import url from 'url';
import { Routing, defaultEndpointsFactory, createResultHandler, ez, EndpointsFactory } from 'express-zod-api';
import { oauth2Client, authorizeUrl, verifyJWT, generateJWT } from './googleAuth';
import { google } from 'googleapis';

import dotenv from 'dotenv';
import {openAiClient} from '../models/OpenAIClient';
import {StringifyTxt, StringifyPdf} from './utils/DocumentLoader';
import { generatePDFDocument } from './utils/writePDF';
import { generateJobListingPrompt } from './prompts/jobListingPrompt';
import { generateResumePrompt } from './prompts/resumePrompt';
import { generateHookPrompt } from './prompts/hookPrompt';
import { generateCoverLetterPrompt } from './prompts/coverLetterPrompt';
import { generateRequirementsPrompt } from './prompts/requirementsPrompt';
import ReactPDF, { PDFRenderer, renderToBuffer } from '@react-pdf/renderer';
import {fetchListing} from './utils/jobs';

dotenv.config();



const resume : string = StringifyPdf("public/Ivan Pedroza Resume.pdf");

const generateLetter = async ({ url }: { url: string }) => {
  // Fetch the job listing
  const jobListing = await fetchListing(url);
  const jobListingPrompt = generateJobListingPrompt(jobListing);

  // Define the prompts
  const jobSummaryPrompt = [
    { role: "system", content: "You are an expert in talent acquisition and workforce optimization with 20 years of experience summarizing job descriptions." },
    { role: "user", content: jobListingPrompt }
  ];

  const resumePrompt = generateResumePrompt(resume);
  const resumeSummaryPrompt = [
    { role: "system", content: "You are an expert in talent acquisition and workforce optimization with 20 years of experience summarizing job descriptions." },
    { role: "user", content: resumePrompt }
  ];

  const requirementsPrompt = generateRequirementsPrompt(resume, jobListing);
  const requirementsSummaryPrompt = [
    { role: "system", content: "You are an expert in talent acquisition and workforce optimization with 20 years of experience summarizing job descriptions." },
    { role: "user", content: requirementsPrompt }
  ];

  const hookPrompt = (resumeSummary: string, jobSummary: string) => [
    { role: "system", content: "You are an expert cover letter writer with a comprehensive understanding of Applicant Tracking Systems (ATS) and keyword optimization." },
    { role: "user", content: generateHookPrompt(resumeSummary, jobSummary) }
  ];

  const coverLetterPrompt = (resumeSummary: string, jobSummary: string, hook: string) => [
    { role: "system", content: "You are an expert cover letter writer with a comprehensive understanding of Applicant Tracking Systems (ATS) and keyword optimization." },
    { role: "user", content: generateCoverLetterPrompt(resumeSummary, jobSummary, hook) }
  ];

  // Execute OpenAI calls in parallel
  const [jobSummary, resumeSummary, requirementsSummary] = await Promise.all([
    openAiClient(jobSummaryPrompt),
    openAiClient(resumeSummaryPrompt),
    openAiClient(requirementsSummaryPrompt)
  ]);

  // Generate hook and body sequentially as they depend on previous results
  const hook = await openAiClient(hookPrompt(resumeSummary, jobSummary));
  const body = await openAiClient(coverLetterPrompt(resumeSummary, jobSummary, hook));

  const paragraphParts = body.split(/(?=Thank you)/);
  const requirementsPromptParts = requirementsSummary.split(/- [^\r\n]+/);

  return generatePDFDocument({ hook, body: paragraphParts[0] || "", closing: paragraphParts[1] || "" });
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
