import { dedent } from "ts-dedent";

export const generateRequirementsPrompt= (resume: string, job: string) => dedent(`
    Given the following job listing requirements and a candidate's resume, generate a message that includes:

    A "You Want" section that pulls the requirements verbatim from the job listing.
    An "I Bring" section that summarizes the candidate's qualifications, showcasing how they meet or exceed each of the job requirements.

    Job listing: ${job}

    Candidate's Resume: ${resume}

    Expected Output:
    You Want:

    - requirement 1 copied verbatim from the job listing
    - requirement 2 copied verbatim from the job listing
    - requirement 3 copied verbatim from the job listing

    I Bring:

    - 1 sentence regarding how the applicant can fulfill those needs requirement 1
    - 1 sentence regarding how the applicant can fulfill those needs requirement 2
    - 1 sentence regarding how the applicant can fulfill those needs requirement 3
    Do not include explanations, reasoning, or additional commentary. The output shuld only include the requested "you want" and "I bring" sections with three bullet points in each section.
`);