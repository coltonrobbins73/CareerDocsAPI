// import { fuzzy } from 'fuzzywuzzy';

// export function fuzzySplit(text: string, pattern: string, threshold: number = 50): string[] {
//     const bestMatchIndex = Array.from(text).reduce((bestIndex, _, i) => {
//         const similarity = fuzzy.partial_ratio(text.slice(i, i + pattern.length), pattern);
//         return similarity > threshold && similarity > bestIndex.similarity ? { index: i, similarity } : bestIndex;
//     }, { index: -1, similarity: 0 }).index;

//     if (bestMatchIndex !== -1) {
//         return [text.slice(0, bestMatchIndex), text.slice(bestMatchIndex + pattern.length)];
//     } else {
//         return [text];
//     }
// }
