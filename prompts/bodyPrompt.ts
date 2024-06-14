import { dedent } from "ts-dedent";

export const generateBodyPrompt = (resumeSummary: string, jobSummary: string, hook: string) => dedent(`
    Based on the provided hook, resume details, and job summary write a cover letter body with a \
    strong focus on the company's future needs and how the applicant can fulfill those needs.

    Take a deep breath and think through the writing process step by step.

    - Output the body as TWO paragraphs.
    - Make sure you include quantifiable metrics if they are present in the resume.
    - Ensure that every chosen skill from the resume aligns extremely well with the job requirements.
    - Ensure the entire length is around 200 words.

    Resume details: ${resumeSummary}
    Job summary: ${jobSummary}
    Hook: ${hook}

    expected_output:
    2 paragraph cover letter body with a strong focus on the company's future needs and how the applicant can fulfill those needs.
    DO NOT output the provided hook.
    Do NOT include explanations, reasoning, or additional commentary.
`);
