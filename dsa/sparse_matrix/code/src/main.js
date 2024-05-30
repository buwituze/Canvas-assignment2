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

async function main() {
    // try and catch errors to maximize smooth operation
    try {
        // Ask the user for instruction on preffered operation 
        //and the files they wan to work with

        console.log('Please provide the paths to the matrix files relative to the current directory or as absolute paths.');
        const operation = (await askQuestion('Enter the operation (add, subtract, multiply): ')).toLowerCase();
        let file1 = await askQuestion('Enter the path for the first matrix file: ');
        let file2 = await askQuestion('Enter the path for the second matrix file: ');

        // normalize paths
        file1 = path.resolve(file1.trim());
        file2 = path.resolve(file2.trim());

        if (!fs.existsSync(file1)) {
            throw new Error(`File not found: ${file1}`);
        }
        if (!fs.existsSync(file2)) {
            throw new Error(`File not found: ${file2}`);
        }

        const matrix1 = new SparseMatrix(file1);
        const matrix2 = new SparseMatrix(file2);

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

        const outputDirectory = path.join(__dirname, '..', 'sample_results'); // path to sample_results folder
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory); // create the directory if it doesn't exist
        }
        
        // Write the result to a file
        const outputFile = path.join(outputDirectory, 'result.txt');
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