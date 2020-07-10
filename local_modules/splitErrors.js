const Path = require('path');
const cliProgress = require('cli-progress');
const {writeFile, readFileAsync} = require('./shared')

const splitErrors = async (path, args) =>{
    console.log(`Reading error instance output from  ${path}...`)
    let errors = JSON.parse(await readFileAsync(path))
    console.log("Finished.")

    console.log('Splitting into chunks...')
    let chunk = []
    const split = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    split.start(errors.length, 0);
    for(let i = 0; i< errors.length; i++){
        chunk.push(errors[i])
        if(chunk.length == 100 || i == errors.length-1){
            var chunkPath = Path.join(args.outputdir, `${i}.json`);
            writeFile(JSON.stringify(chunk), chunkPath);
            chunk = []
        }
        split.update(i+1);
    }
    split.stop()
    console.log("Finished.")

}
module.exports = {
    splitErrors
}