import { dedent } from "ts-dedent";

export const generateConclusionPrompt = (hook: string, body: string) => dedent(`
    Based on the provided cover letter hook and body, write a conclusion paragraph that summarizes why the applicant is a great fit for the job.

    - Output the conclusion as ONE paragraph.
    - Summarize why the applicant's strengths align with the job requirements.
    - Include a call to action at the end of the paragraph.
    - Ensure the entire length is under 75 words.
    - Heavily prioritize unique descriptors and unconventional writing style.

    Hook: ${hook}
    Body: ${body}

    expected_output:
    1 paragraph cover letter conclusion.
    DO NOT output the provided hook or body.
    Do not include explanations, reasoning, or additional commentary.
    Only output the raw text response.
`);
