const Path = require('path');
const fs = require('fs');
const cliProgress = require('cli-progress');
const {writeFile, readFileAsync, getFilesInFolder} = require('./shared')

const joinErrors = async(dir, args) =>{
    console.log(`Reading error instance output chunks from  ${dir}...`)
    let paths = await getFilesInFolder(dir);
    const read = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    read.start(paths.length, 0);
    let chunks = []
    for(let i = 0; i< paths.length; i++){
        if(!paths[i].includes('.json')){
            read.update(i+1)
            continue;
        }
        let raw = await readFileAsync(paths[i])
        chunks.push(JSON.parse(raw));
        read.update(i+1)
    }
    read.stop();
    console.log("Finished.")

    console.log('Joining chunks...')
    let result = []
    const joinProgress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    joinProgress.start(chunks.length, 0);
    for(let i = 0; i< chunks.length; i++){
        for(let j = 0; j<chunks[i].length; j++){
            result.push(chunks[i][j]);
        }
        joinProgress.update(i+1);
    }
    joinProgress.stop()
    console.log("Finished.")

    console.log(`Saving file to ${args.output}...`)
    writeFile(JSON.stringify(result), args.output);
    console.log("Finished.")
}
module.exports = {
  joinErrors
}