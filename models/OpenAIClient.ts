import { OpenAI } from 'openai'; // Adjust the import according to your setup

interface Message {
    role: string;
    content: string;
}

const config = {
    apiKey: process.env.OPENAI_API_KEY
};

const client = new OpenAI(config);

export const openAiClient = async (messages: Message[]): Promise<string> => {
    if (!process.env.OPENAI_MODEL) {
        throw new Error("OPENAI_MODEL environment variable is not defined");
    }

    const chatMessages: any = messages.map((message) => ({
        role: message.role,
        content: message.content,
    }));

    const stream = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: chatMessages,
        stream: true,
    });

    let responseText = '';
    for await (const chunk of stream) {
        responseText += chunk.choices[0]?.delta?.content || "";
    }

    return responseText;
};
