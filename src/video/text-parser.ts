import { split, SentenceSplitterSyntax } from "sentence-splitter";

type TextArray = {
    text: string;
    start: number;
    end: number;
}[];

type Sentence = {
    start: number;
    end: number;
    text: string;
    words: TextArray;
}

export default function parseSentences(textArray: TextArray) {
    const combinedText = textArray.map(item => item.text).join(' ');

    const sentencesNode = split(combinedText)
    
    const sentences: Sentence[] = [];
    let wordIndex = 0;

    sentencesNode.forEach(sentenceNode => {
        if (sentenceNode.type !== SentenceSplitterSyntax.Sentence) return;
        
        const sentence: Sentence = {
            start: 0,
            end: 0,
            text: '',
            words: []
        }

        const wordCount = sentenceNode.raw.split(' ').filter(Boolean).length;
        const wordsSlice = textArray.slice(wordIndex, wordIndex + wordCount);

        sentence.text += sentenceNode.raw;
        sentence.start = wordsSlice.at(0)!.start;
        sentence.end = wordsSlice.at(-1)!.end;

        const sentenceStartTime = sentence.start;
        sentence.words.push(...wordsSlice.map(word => ({
            ...word,
            start: word.start - sentenceStartTime,
            end: word.end - sentenceStartTime,
        })));

        wordIndex += wordCount;

        sentences.push(sentence);
    });

    return sentences;
}
