const SparseMatrix = require('./sparseMatrix');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function getUniqueFilename(prefix = 'result') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}-${timestamp}.txt`;
}

async function main() {
    try {
        // Ask the user for the operations
        // and the paths to the input files the user wants to work on
        console.log('Please provide the paths to the input files containing two matrices.');
        const operation = (await askQuestion('Enter the operation (add, subtract, multiply): ')).toLowerCase();
        let filePath1 = await askQuestion('Enter the path for the first input file: ');
        let filePath2 = await askQuestion('Enter the path for the second input file: ');

        // Normalize paths
        filePath1 = path.resolve(filePath1.trim());
        filePath2 = path.resolve(filePath2.trim());

        if (!fs.existsSync(filePath1)) {
            throw new Error(`File not found: ${filePath1}`);
        }
        if (!fs.existsSync(filePath2)) {
            throw new Error(`File not found: ${filePath2}`);
        }

        // Load and operate on the matrices according to the users input operation
        const matrix1 = new SparseMatrix(filePath1);
        const matrix2 = new SparseMatrix(filePath2);

        let result;
        if (operation === 'add') {
            result = matrix1.add(matrix2);
        } else if (operation === 'subtract') {
            result = matrix1.subtract(matrix2);
        } else if (operation === 'multiply') {
            result = matrix1.multiply(matrix2);
        } else {
            throw new Error('Invalid operation');
        }

        result.print();

        const outputDirectory = path.join(__dirname, '..', 'sample_results'); // Path to sample_results folder
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory); // Create the directory if it doesn't exist
        }

        //Write the resultant matrix to a file

        const outputFile = path.join(outputDirectory, getUniqueFilename('result'));
        const writeStream = fs.createWriteStream(outputFile);
        writeStream.write(`rows=${result.numRows}\n`);
        writeStream.write(`cols=${result.numCols}\n`);
        for (let key in result.data) {
            const [row, col] = key.split(',').map(Number);
            writeStream.write(`(${row}, ${col}, ${result.data[key]})\n`);
        }
        writeStream.end();

        console.log(`Result saved to ${outputFile}`);
    } catch (error) {
        console.error(error.message);
    } finally {
        rl.close();
    }
}

main();