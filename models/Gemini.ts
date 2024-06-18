import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
    role: string;
    content: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL! });

export const Gemini = async (messages: Message[]): Promise<string> => {

    const prompt: any = messages.map(message => `${message.role}: ${message.content}`).join('\n');

    try {

        const result = await model.generateContent(prompt);
        return await result.response.text();
        
    } catch (error) {
        console.error('Error making Gemini API request:', error);
        throw error;
    }
};
