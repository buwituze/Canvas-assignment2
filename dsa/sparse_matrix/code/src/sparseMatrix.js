const fs = require('fs');

class SparseMatrix {
    constructor(matrixFilePath = null, numRows = null, numCols = null) {
        if (matrixFilePath) {
            this.loadFromFile(matrixFilePath);
        } else if (numRows !== null && numCols !== null) {
            this.numRows = numRows;
            this.numCols = numCols;
            this.data = {};
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    loadFromFile(matrixFilePath) {
        const fileContent = fs.readFileSync(matrixFilePath, 'utf8');
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== '');
        if (lines.length < 2) throw new Error('Input file has wrong format');

        const numRowsLine = lines[0].match(/rows=(\d+)/);
        const numColsLine = lines[1].match(/cols=(\d+)/);

        if (!numRowsLine || !numColsLine) {
            throw new Error('Input file has wrong format');
        }

        this.numRows = parseInt(numRowsLine[1]);
        this.numCols = parseInt(numColsLine[1]);
        this.data = {};

        for (let i = 2; i < lines.length; i++) {
            const match = lines[i].match(/\((\d+),\s*(\d+),\s*(-?\d+)\)/);
            if (!match) {
                throw new Error('Input file has wrong format');
            }
            const row = parseInt(match[1]);
            const col = parseInt(match[2]);
            const value = parseInt(match[3]);
            this.setElement(row, col, value);
        }
    }

    getElement(row, col) {
        return this.data[`${row},${col}`] || 0;
    }

    setElement(row, col, value) {
        if (value === 0) {
            delete this.data[`${row},${col}`];
        } else {
            this.data[`${row},${col}`] = value;
        }
    }

    add(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error('Matrices must have the same dimensions for addition');
        }
        
        const result = new SparseMatrix(null, this.numRows, this.numCols);
        
        // Add operands from the 1st matrices
        for (let key in this.data) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, result.getElement(row, col) + this.data[key]);
        }
        
        // Add operands from the 2nd matrices
        for (let key in other.data) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, result.getElement(row, col) + other.data[key]);
        }
        
        return result;
    }

    subtract(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error('Matrices must have the same dimensions for subtraction');
        }
        const result = new SparseMatrix(null, this.numRows, this.numCols);
        for (let key in this.data) {
            result.setElement(...key.split(',').map(Number), this.data[key]);
        }
        for (let key in other.data) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, result.getElement(row, col) - other.data[key]);
        }
        return result;
    }

    multiply(other) {
        // multiply operands from the 2 matrices
        if (this.numCols !== other.numRows) {
            throw new Error('Number of columns of the first matrix must equal the number of rows of the second matrix');
        }
        const result = new SparseMatrix(null, this.numRows, other.numCols);
        for (let keyA in this.data) {
            const [rowA, colA] = keyA.split(',').map(Number);
            for (let keyB in other.data) {
                const [rowB, colB] = keyB.split(',').map(Number);
                if (colA === rowB) {
                    const value = this.data[keyA] * other.data[keyB];
                    result.setElement(rowA, colB, result.getElement(rowA, colB) + value);
                }
            }
        }
        return result;
    }

    print() {
        console.log(`rows=${this.numRows}`);
        console.log(`cols=${this.numCols}`);
        for (let key in this.data) {
            const [row, col] = key.split(',').map(Number);
            console.log(`(${row}, ${col}, ${this.data[key]})`);
        }
    }
}

module.exports = SparseMatrix;