const cliProgress = require('cli-progress');
const {writeFile, readFileAsync, readFile} = require('./shared')
const { errorGroup, errorInstance } = require('./appcenterAPI')

const aepGet = async (egID, args) =>{
    let errorGroupResponse;
    if(args.input == undefined){
        console.log(`Getting error group ${egID}...`)
        errorGroupResponse = await errorGroup(egID, args.key, args.from, args.to, args.owner, args.app);
        writeFile(JSON.stringify(errorGroupResponse), args.output+'.bak')
        if(errorGroupResponse == undefined){
            console.log('error getting error groups')
            return;
        }
    }else{
        console.log(`Reading error group backup ${args.input}...`)
        errorGroupResponse = JSON.parse(await readFileAsync(args.input))
    }
    console.log('Finished.')


    console.log('Chunking workload...')
    const chunking = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    chunking.start(errorGroupResponse.length, 0);
    let chunks = []
    let chunksize = 10;
    for(let i = 0; i < errorGroupResponse.length; i++){
        if(i == 0 || i%chunksize == 0){
            chunks.push([])
        }
        chunks[chunks.length-1].push(errorGroupResponse[i]);
        chunking.update(i+1)
    }
    chunking.stop()
    console.log('Finished.')
    errorGroupResponse = undefined;
    
    console.log('Processing chunks...')
    const processing = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let chunkIndex = 0
    let result = []
    if(args.chunkfile){ 
        try {
            chunkIndex = parseInt(readFile(args.chunkfile)) + 1
        } catch (error) {
            writeFile('0', args.chunkfile);
        }
    }
    processing.start(chunks.length, chunkIndex);
    for(let i = chunkIndex; i< chunks.length; i++){
        let currentChunk = await processChunk(chunks[i].slice(0), egID, args);
        for(let j = 0; j< currentChunk.length; j++){
            result.push(currentChunk[j]);
            if(result.length == chunksize*10 || i == chunks.length-1){
                writeFile(JSON.stringify(result), `${args.output}.${i}`)
                if(args.chunkfile){
                    writeFile(`${i}`, args.chunkfile);
                }
                result = [];
            }
        }
        processing.update(i+1);
    }
    processing.stop()
    chunks = undefined
}

const processChunk = async (chunk, egID, args) =>{
    downloadIndex = 0;
    let downloadTasks = []
    for(let i = 0; i < chunk.length; i++){
        downloadTasks.push(getErrorResponse(egID, chunk[i].errorId, args.key, args.owner, args.app))
    }

    let downloadResults = await Promise.allSettled(downloadTasks);

    for(let i = 0; i < chunk.length; i++){
        let errorID = chunk[i].errorId;
        for(let j = 0; j < downloadResults.length; j++){
            if(downloadResults[j]!= undefined){
                if(downloadResults[j].value.errorId == errorID){
                    chunk[i].reasonFrames = downloadResults[j].value.reasonFrames
                    chunk[i].carrierName = downloadResults[j].value.carrierName
                    chunk[i].jailbreak = downloadResults[j].value.jailbreak
                    chunk[i].properties = downloadResults[j].value.properties
                }
            }
        }
    }

    return chunk;
}

const getErrorResponse = async (groupID, errorID, key, owner, app) => {
    let errorResponse = await errorInstance(groupID, errorID, key, owner, app);
    if(errorResponse == undefined){
        return undefined;
    }
    return {
        'errorId':errorResponse.errorId,
        'reasonFrames':errorResponse.reasonFrames,
        'carrierName':errorResponse.carrierName,
        'jailbreak':errorResponse.jailbreak,
        'properties':errorResponse.properties
    } 
}

module.exports = {
    aepGet
}