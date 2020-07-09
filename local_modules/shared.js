const fs = require('fs');

const writeFile = (data, path) => {
    fs.writeFileSync(path, data)
}

module.exports = {
    writeFile
}