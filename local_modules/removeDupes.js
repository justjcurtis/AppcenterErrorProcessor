const cliProgress = require('cli-progress');
const {writeFile, readFileAsync} = require('./shared')

const removeDupes = async (path, args) => {
    console.log(`Reading error instance output from  ${path}...`)
    let errors = JSON.parse(await readFileAsync(path))
    console.log("Finished.")

    console.log('Removing duplicates...')
    let knownErrorIds = []
    let result = []
    const dedupe = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    dedupe.start(errors.length, 0);
    for(let i = 0; i< errors.length; i++){
        let current = errors[i];
        if(knownErrorIds.includes(current.errorId)){
            dedupe.update(i+1)
            continue;
        }else{
            knownErrorIds.push(current.errorId)
            result.push(current)
            dedupe.update(i+1)
        }
    }
    dedupe.stop()
    console.log("Finished.")

    console.log(`Saving file to ${args.output}...`)
    writeFile(JSON.stringify(result), args.output);
    console.log("Finished.")
}

module.exports = {
    removeDupes
}