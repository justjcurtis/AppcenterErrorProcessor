const fs = require('fs');

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

module.exports = {
    writeFile,
    readFile,
    readFileAsync
}