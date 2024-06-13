import { dedent } from "ts-dedent";

export const generateCoverLetterPrompt = (resumeSummary: string, jobSummary: string, hook: string) => dedent(`
    Based on the provided hook, resume details, and job summary write a cover letter body and conclusion with a strong focus on the company's future needs and how the applicant can fulfill those needs.

    - Output the body as two paragraphs.
    - For each paragraph, use 1-2 relevant quantifiable metrics from the provided resume that align with the top skills outlined in the job summary.
    - Explicitly write why each chosen applicant skill is important for the job summary.
    - Explain in great detail why the applicant's skills match the job description.
    - Output the conclusion as a single paragraph at the end.
    - Ensure the entire length is around 250 words.
    - Heavily prioritize unique descriptors and unconventional writing style.

    Resume details: ${resumeSummary}
    Job summary: ${jobSummary}
    Hook: ${hook}

    expected_output:
    2 paragraph cover letter body and 1 paragraph conclusion with a strong focus on the company's future needs and how the applicant can fulfill those needs.
    Do not include explanations, reasoning, or additional commentary.
`);
