import fs from 'fs';
import { Transform, pipeline } from 'stream';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'output.txt';

if (!inputFile) {
    console.error('Usage: node index.js <input-file> [output-file]');
    process.exit(1);
}

const wordProcessor = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        const text = chunk instanceof Buffer ? chunk.toString('utf8') : chunk;
        
        const words = text
            .toLowerCase()
            .replace(/[^a-zа-яё\s]/gi, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
        
        this.push(words);
        callback();
    }
});


const wordStats = {};
const wordsList = [];

const statsCollector = new Transform({
    objectMode: true,
    transform(words, encoding, callback) {
        words.forEach(word => {
            if (!wordStats[word]) {
                wordStats[word] = 0;
                wordsList.push(word);
            }
            wordStats[word]++;
        });
        callback();
    },
    flush(callback) {

        wordsList.sort();
        
        const resultVector = wordsList.map(word => wordStats[word]);
        
        this.push(resultVector.join(' ') + '\n');
        callback();
    }
});

const writer = fs.createWriteStream(outputFile);

const handleError = (err) => {
    console.error('Pipeline failed:', err);
};

pipeline(
    fs.createReadStream(inputFile, { encoding: 'utf8' }),
    wordProcessor,
    statsCollector,
    writer,
    handleError
);

console.log(`Processing ${inputFile}, results will be written to ${outputFile}`);