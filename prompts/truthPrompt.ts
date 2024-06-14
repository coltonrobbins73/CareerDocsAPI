import { dedent } from "ts-dedent";

export const generateFinalPrompt = (resumeSummary: string, hook: string, body: string, conclusion: string) => dedent(`
    Analyze the provided cover letter hook and body and compare them against the provided resume. 
    Identify any statements in the cover letter that are inconsistent with, or not supported by, \
    the details in the resume. 
    Rewrite the false statements so that they are accurately represented .

    Hook: ${hook}
    Body: ${body}
    Conclusion: ${conclusion}
    Resume details: ${resumeSummary}

    expected_output:
    A finalized and truthful cover letter.
    Do not include explanations, reasoning, or additional commentary.
`);
