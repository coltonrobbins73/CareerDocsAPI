import { dedent } from "ts-dedent";

export const generateReviewPrompt = (resumeSummary: string, jobSummary: string, body: string) => dedent(`
    The 2 provided paragraphs from a cover letter are very poorly written because they \
    do not align the applicants skills to the needs of the job.

    Rewrite the 2 paragraphs ensuring that the applicant's skills match perfectly \
    with the requirements of job. 

    Make sure you include quantifiable metrics if they are present in the resume.

    Body: ${body}
    Resume details: ${resumeSummary}
    Job summary: ${jobSummary}


    expected_output:
    2 paragraph cover letter body that that aligns the applicants skills with the job requirements.
    Do not include explanations, reasoning, or additional commentary.
    Only output the raw text response.
`);
