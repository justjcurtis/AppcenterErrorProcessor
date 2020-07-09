const cliProgress = require('cli-progress');
const {writeFile, readFileAsync} = require('./shared')
const { errorGroup, errorInstance } = require('./appcenterAPI')

const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

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
    let chunks = [[]]
    let chunksize = 10;
    for(let i = 0; i < errorGroupResponse.length; i++){
        if(i%chunksize == 0){
            chunks.push([])
        }
        chunks[chunks.length-1].push(errorGroupResponse[i]);
        chunking.update(i+1)
    }
    chunking.stop()
    console.log('Finished.')
    errorGroupResponse = undefined;

    resultingChunks = [];
    for(let i = 0; i< chunks.length; i++){
        console.log(`Processing chunk ${i+1} of ${chunks.length}`)
        resultingChunks.push(await processChunk(chunks[i].slice(0), egID, args));
    }
    chunks = undefined

    console.log('Aggregating chunks...');
    const aggregate = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    aggregate.start(resultingChunks.length, 0);
    let result = []
    for(let i = 0; i< resultingChunks.length; i++){
        for(let j = 0; j< resultingChunks[i].length; j++){
            result.push(resultingChunks[i][j]);
        }
        aggregate.update(i+1);
    }
    aggregate.stop();
    console.log('Finished.')

    console.log(`Writing output to ${args.output}...`)
    writeFile(JSON.stringify(errorGroupResponse), args.output)
    console.log('Finished.')
}

const processChunk = async (chunk, egID, args) =>{
    console.log('Enumerating individual error responses...')
    const enumerate = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    enumerate.start(chunk.length, 0);
    let downloadTasks = []
    for(let i = 0; i < chunk.length; i++){
        downloadTasks.push(getErrorResponse(egID, chunk[i], args.key, args.owner, args.app))
        enumerate.update(i+1)
    }
    enumerate.stop()
    console.log('Finished.')

    console.log('Downloading individual error responses...')
    progress.start(chunk.length, 0);
    let downloadResults = await Promise.allSettled(downloadTasks);
    progress.stop();
    console.log('Finished.')

    console.log('Injecting individual error responses...')
    const inject = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    inject.start(chunk.length, 0);
    for(let i = 0; i < chunk.length; i++){
        let errorID = chunk[i].errorId;
        for(let j = 0; j < downloadResults.length; j++){
            if(downloadResults[j]!= undefined){
                if(downloadResults[j].errorId == errorID){
                    chunk[i].reasonFrames = downloadResults[j].reasonFrames
                    chunk[i].carrierName = downloadResults[j].carrierName
                    chunk[i].jailbreak = downloadResults[j].jailbreak
                    chunk[i].properties = downloadResults[j].properties
                }
            }
        }
        inject.update(i+1)
    }
    inject.stop()
    console.log('Finished.')
    return chunk;
}

const getErrorResponse = async (groupID, errorID, key, owner, app) => {
    let errorResponse = await errorInstance(groupID, errorID, key, owner, app);
    if(errorResponse == undefined){
        return undefined;
    }
    progress.update(i+1);
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