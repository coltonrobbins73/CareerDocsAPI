import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import deasync from 'deasync';

export const StringifyPdf = (filePath: string) : string =>{
  const dataBuffer = fs.readFileSync(filePath);
  let done = false;
  let result = "";

  pdf(dataBuffer).then(data => {
    result = data.text;
    done = true;
  }).catch(err => {
    console.error('Error reading PDF file:', err);
    done = true;
  });

  // Wait for the asynchronous operation to complete
  while (!done) {
    deasync.sleep(100);
  }

  return result;
}



export const StringifyTxt = (filePath: string) : string => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error('Error reading file:', err);
    return "";
  }
}

