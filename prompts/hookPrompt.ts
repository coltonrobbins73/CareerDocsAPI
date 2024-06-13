import { dedent } from "ts-dedent";

export const generateHookPrompt = (resumeSummary: string, jobSummary: string) => dedent(`
    Using the provided job summary and resume details, write a compelling opening paragraph (hook) for the cover letter. The hook should:
    - Be less than 100 words.
    - Directly address why the candidate is perfect for the most important day-to-day challenge stated in the job summary.
    - Use keywords that will resonate with ATS scans.
    - Incorporate total years experience from the applicant if it appears in the resume.

    Resume details: ${resumeSummary}
    Job summary: ${jobSummary}

    expected_output: >
    An attention-grabbing cover letter hook (less than 100 words).
    The hook should start with:

    I was thrilled to see your listing for [role mentioned above], because it is exactly the job I've been looking for."

    Do not include explanations, reasoning, or additional commentary.
`);
