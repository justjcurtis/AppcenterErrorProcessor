const fs = require('fs');
const npath = require('path');

const getFilesInFolder = async (dir) =>{
    return new Promise((resolve, reject) => {
        fs.readdir(dir, function (err, files) {
            //handling error
            if (err) {
                reject('failed to scan dir')
            } 
            let paths = [];
            //listing all files using forEach
            files.forEach(function (file) {
                paths.push(npath.join(dir, file));
            });
            resolve(paths)
        });
    });
}
const readFile = (path, input_delimiter) => {
    let raw = fs.readFileSync(path, {
        encoding: 'utf-8'
    });
    return raw
}

const readFileAsync = async (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, {
            encoding: 'utf-8'
        }, (err, data) => {
            resolve(data)
        });
    });
}
const writeFile = (data, path) => {
    fs.writeFileSync(path, data)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

module.exports = {
    writeFile,
    readFile,
    readFileAsync, 
    sleep,
    getFilesInFolder
}