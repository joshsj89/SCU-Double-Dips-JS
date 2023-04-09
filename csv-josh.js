// FILE: csv-josh.js
// PROVIDES: A class to write to CSV files
// WRITTEN BY: Josh Kindarara
//
// CONSTRUCTOR
//  constructor(filename)
//      Precondition: A non-empty string must be passed in.
//      Postcondition: Appends string argument to the directory from which 
//      the program is being run. If the file already exits, it will be
//      cleared. If the file does not exist, a new empty one will be created.
//
// METHODS
//  write()
//      Precondition: The argument must be an array.
//      Postcondition: Each element of the array is written into a row of the CSV file.
//
//  clear()
//      Postcondition: The CSV file is cleared.
//
//  filename()
//      Postcondition: Returns the name of the CSV file with the extension.
//
//  filename(filename)
//      Precondition: A non-empty string must be passed in.
//      Postcondition: Sets the name of the CSV file to string passed in and changes
//      the _filepath to point to the new location.
//
//  filepath()
//      Postcondition: Returns the full path of the CSV file.
//
// INVARIANT
//      1. _filename must be a string that ends with the extension ".csv".
//      2. _filepath must be a string that ends with _filename.
//

const fs = require('fs');
const path = require('path');

class Csv {
    constructor(filename) {
        this._filename = `${filename}.csv`;
        this._filepath = path.join(__dirname, this._filename);

        // Creates an empty file or clears file if it's already created
        fs.writeFile(this._filepath, '', (err) => {
            if (err) {
                throw err;
            }
        });
    }

    write(data) {
        let csv = '';

        data.forEach((item, i) => {
            if (item.includes(',')) {
                data[i] = `"${item}"`;
            }
        });
        
        csv += data.join(',') + '\n\n';

        fs.appendFile(this._filepath, csv, (err) => {
            if (err) {
                throw err;
            }
        });
    }

    clear() {
        //clear file
        fs.truncate(this._filepath, 0, (err) => {
            if (err) {
                throw err;
            }
        });
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
}

module.exports = Csv;