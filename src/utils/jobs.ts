import axios from 'axios';
import * as cheerio from 'cheerio';

export const fetchListing = async ( url: string): Promise<string>=> {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const bodyText = $('body').text().trim();
        return bodyText;
    } catch (error) {
        console.error('Error fetching the URL:', error);
        throw error;
    }
};
