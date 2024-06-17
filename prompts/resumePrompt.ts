import { dedent } from "ts-dedent";

export const generateResumePrompt = (resume: string) => dedent(`
    Your task is to extract information from the resume and output in JSON format.

    Extract the name and overall title of the applicant.
    Also, extract ALL previous work experiences, including company name, job title,
    and the word for word description of job duties found in the resume.

    Resume: ${resume}

    expected_output:
    A JSON file with the following format:

    Applicant name:
    Applicant title:
    Applicant email:
    Applicant residence:
    Applicant portfolio website:
    Applicant github:

    Previous work experience:
    [
    {
        "company": "",
        "title": "",
        "responsibilities": ""
    },
    # ... more work experiences as needed
    ]

    Do not include explanations, reasoning, or additional commentary and make sure \
    the company names are Capitalized correctly.
`);
