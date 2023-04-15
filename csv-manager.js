// FILE: csv-manager.js
// PROVIDES: A class to write to CSV files
// CLASS: CSVManager
// WRITTEN BY: Josh Kindarara
//
// CONSTRUCTOR
//  constructor(filename)
//      Precondition: A string must be passed in.
//      Postcondition: Appends string argument to the directory from which 
//      the program is being run. If the file does not exist, a new empty
//      one will be created.
//
// PRIVATE METHODS
//  _referenceToIndices(parts)
//      Precondition: The argument must be an array of two elements where the first element
//      is a string that represents the column letters of a cell, and the second element is a
//      string that represents the row number of the cell. The column letters must only contain
//      capital letters.
//      Postcondition: Converts column letter into a valid index for an array. Converts
//      row number string to its respective number. It returns an array of two elements, where
//      the first element is a number that represents the row index of the cell, and the second
//      element is a number that represents the column index of the cell.
//
//  _splitCellReference(cell)
//      Precondition: The argument must be a string that represents a valid cell reference
//      (column letters followed by row numbers)
//      Postcondition: Splits cell into 2 strings of letters and numbers and returns an 
//      array holding them. The first element represents the column letters, and the second
//      element represents the row number. The column letters will be capitalized.
//
// PUBLIC METHODS
//  writeRow(data)
//      Precondition: The argument must be an array. Each element of the inner array
//      should contain a string that represents the value in the cell.
//      Postcondition: Each element of the array is written into a row of the CSV file.
//
//  writeRows(arr)
//      Precondition: The argument must be an array of arrays. The elements of the inner
//      arrays represent the rows of a CSV file. Each element of the inner arrays should
//      contain a string that represents the value in the cell.
//      Postcondition: Appends the contents of each inner array on each row with double
//      line breaks between them.
//
//  writeFile(arr)
//      Precondition: The argument must be an array of arrays. The elements of the inner
//      arrays represent the rows of a CSV file. Each element of the inner arrays should
//      contain a string that represents the value in the cell.
//      Postcondition: Clears file and writes the contents of each inner array on each row 
//      with double line breaks between them.
//
//  parseFile()
//      Precondition: The file must contain rows of data separated by double line breaks
//      and fields/cells separated by commas.
//      Postcondition: Returns an array of arrays where each inner array represents a
//      row of data in the CSV file, and each element in the inner array represents a
//      field in the CSV row. This method does not modify the contents of the file.
//
//  getCell(cell)
//      Precondition: The argument must be a string that represents a valid cell reference
//      (column letters followed by row numbers)
//      Postcondition: The value in the cell that is specified by the cell argument is
//      returned if it exists. If it doesn't exist, an empty string is returned.
//
//  getRow(rowNum)
//      Precondition: The argument must be a positive integer. It can be passed as a string
//      or number. 
//      Postcondition: Returns the row to which rowNum refers to as an array. If the index
//      is out of range, an empty array is returned. 
//
//  clear()
//      Postcondition: The CSV file is cleared.
//
//  deleteRow(rowNum)
//      Precondition: The argument must be a positive integer. It can be passed as a string
//      or number.
//      Postcondition: The row to which rowNum refers to will be removed from the CSV file.
//
//  deleteRowAndShift(rowNum)
//      Precondition: The argument must be a positive integer. It can be passed as a string
//      or number.
//      Postcondition: The row to which rowNum refers to will be removed from the CSV file.
//      All rows below the deleted row will be shifted up.
//
//  rename(filename)
//      Precondition: A string must be passed in.
//      Postcondition: The CSV file is renamed to the new filename. If no errors occur,
//      _filename and _filepath will be updated to reflect the filename and path.
//
//  filename()
//      Postcondition: Returns the name of the CSV file with the extension.
//
//  filename(filename)
//      Precondition: A string must be passed in.
//      Postcondition: Sets the name of the CSV file to string passed in and changes
//      the _filepath to point to the new location.
//
//  filepath()
//      Postcondition: Returns the full path of the CSV file.
//
// OPERATIONS
//  copy(obj)
//      Precondition: An instance of the CSVManager must be passed in as the argument.
//      Postcondition: Copies the file pointed to by obj's filepath to the file pointed
//      to by the instance calling the function. The file pointed to by the current
//      instance of the object will be overwritten.
//
// INVARIANT
//      1. _filename must be a string that ends with the extension ".csv".
//      2. _filepath must be a string that ends with _filename.
//
// CURRENT ISSUES / KNOWN BUGS
//  1.  If the CSV file was written in a Windows text editor, parseFile() won't detect
//      multiple rows because Windows makes a double line break '\r\n\r\n' while for 
//      Linux and macOS, '\n\n' is a double line break. || A possible fix is changing
//      to single line breaks and just splitting at '\n' which should work on all
//      platforms. 
//
// FUTURE ADDITIONS
//  1.  A non-member function to compare two CSVManager objects
//

const fs = require('fs');
const path = require('path');

class CSVManager {
    constructor(filename) {
        this._filename = `${filename}.csv`;
        this._filepath = path.join(__dirname, this._filename);

        // Creates an empty file if the file doesn't exist
        try {
            fs.accessSync(this._filepath, fs.constants.F_OK);
        } catch (err) {
            fs.writeFileSync(this._filepath, '');
        }
    }

    writeRow(data) {
        let csv = '';
        
        if (data) {
            data.forEach((item, i) => {
                if (item.includes(',')) {
                    data[i] = `"${item}"`;
                }
            }); 
            csv += data.join(',') + '\n\n';
        } else {
            csv += '\n\n';
        }

        fs.appendFileSync(this._filepath, csv);
    }

    writeRows(arr) {
        for (let i = 0; i < arr.length; i++) {
            this.writeRow(arr[i]);
        }
    }

    writeFile(arr) {
        this.clear();
        this.writeRows(arr);
    }

    parseFile() {
        const data = fs.readFileSync(this._filepath, 'utf8');

        const rows = data.trim().split('\n\n');
        const regex = /("[^"]*"|[^,"]+)/g;
        let rowsResult = [];
        rows.forEach((row) => {
            const rowResult = [];
            if (row) {
                row.match(regex).forEach((value) => {
                    rowResult.push(value.trim().replace(/"/g, ''));
                });
            }
            rowsResult.push(rowResult);
        });
        
        return rowsResult;
    }

    _referenceToIndices(parts) {
        const rowIndex = Number(parts[1]) - 1;
        let colIndex = 0;

        for (let i = 0; i < parts[0].length; i++) {
            colIndex *= 26;
            colIndex += parts[0].charCodeAt(i) - 64; // 64 is 'A'.charCodeAt(0) - 1
        }

        colIndex--;
        return [rowIndex,colIndex];
    }

    _splitCellReference(cell) {
        const regex = /(([A-Z]|[a-z])+[1-9]\d*)/;
        const regex2 = /(([A-Z]|[a-z])+)/;
        
        const matches = cell.match(regex);
        if (matches && matches['index'] === 0) {
            const splits = cell.split(regex2);
            const parts = [splits[1].toUpperCase(), splits[3]];
            return parts;
        } else {
            throw Error('The cell reference passed into getCell() is not valid.');
        }
    }

    getCell(cell) {
        const csvArray = this.parseFile();

        const parts = this._splitCellReference(cell);
        const indices = this._referenceToIndices(parts);

        if (!csvArray[indices[0]]) {
            return '';
        } else if (!csvArray[indices[0]][indices[1]]) {
            return '';
        }

        return csvArray[indices[0]][indices[1]];
    }

    getRow(rowNum) {
        const csvArray = this.parseFile();
        const index = Number(rowNum) - 1;
        if (index < 0 || index === NaN) {
            throw Error('The row number must be a positive integer.');
        }

        return csvArray[index] ? csvArray[index]: [];
    }

    clear() {
        fs.truncateSync(this._filepath, 0);
    }

    rename(filename) {
        filename = `${filename}.csv`;
        const filepath = path.join(__dirname, filename);

        try {
            fs.renameSync(this._filepath, filepath);
        } catch(err) {
            switch (err.code) {
                case 'ENOENT':
                    console.error('File not found.');
                    break;
                case 'EACCES':
                    console.error('The user does not have permission to modify the file.');
                    break;
                case 'EBUSY':
                    console.error('The file is being used by another program.');
                    break;
                default:
                    console.error('Error: ', err);
            }

            return;
        }

        this._filename = filename;
        this._filepath = filepath;
    }
    
    deleteRow(rowNum) {
        let csvArray = this.parseFile();
        const index = Number(rowNum) - 1;
        if (index < 0 || index === NaN) {
            throw Error('The row number must be a positive integer.');
        }
        csvArray[index] = []
        this.writeFile(csvArray);
    }

    deleteRowAndShift(rowNum) {
        let csvArray = this.parseFile();
        const index = Number(rowNum) - 1;
        if (index < 0 || index === NaN) {
            throw Error('The row number must be a positive integer.');
        }
        csvArray[index] = []
        this.clear();
        for (let i = index; i < csvArray.length - 1; i++) {
            csvArray[i] = csvArray[i+1];
        }
        csvArray[csvArray.length - 1] = [];
        this.writeFile(csvArray);
    }

    get filename() {
        return this._filename;
    }

    set filename(filename) {
        this._filename = `${filename}.csv`;
        this._filepath = path.join(__dirname, this._filename);
    }

    get filepath() {
        return this._filepath;
    }

    copy(obj) {
        if (obj instanceof CSVManager) {
            throw Error('The object passed into .copy() must be of type CSVManager');
        }

        fs.copyFileSync(obj.filepath, this._filepath);
    }
}

module.exports = CSVManager;