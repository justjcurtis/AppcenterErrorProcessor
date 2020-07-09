const cliProgress = require('cli-progress');
const {writeFile, readFileAsync, readFile} = require('./shared')
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

    console.log('Enumerating individual error responses')
    const enumerate = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    enumerate.start(errorGroupResponse.length, 0);

    let downloadTasks = []
    for(let i = 0; i < errorGroupResponse.length; i++){
        downloadTasks.push(getErrorResponse(egID, errorGroupResponse[i], args.key, args.owner, args.app))
        enumerate.update(i+1)
    }
    enumerate.stop()
    console.log('Finished.')

    console.log('Downloading individual error responses')
    progress.start(errorGroupResponse.length, 0);
    let downloadResults = await Promise.allSettled(downloadTasks);
    progress.stop();
    console.log('Finished.')

    console.log('Injecting individual error responses')
    const inject = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    inject.start(errorGroupResponse.length, 0);
    for(let i = 0; i < errorGroupResponse.length; i++){
        let errorID = errorGroupResponse[i].errorId;
        for(let j = 0; j < downloadResults.length; j++){
            if(downloadResults[j]!= undefined){
                if(downloadResults[j].errorId == errorID){
                    errorGroupResponse[i].reasonFrames = downloadResults[j].reasonFrames
                    errorGroupResponse[i].carrierName = downloadResults[j].carrierName
                    errorGroupResponse[i].jailbreak = downloadResults[j].jailbreak
                    errorGroupResponse[i].properties = downloadResults[j].properties
                }
            }
        }
        inject.update[i+1]
    }
    inject.stop()
    console.log('Finished.')

    console.log(`Writing output to ${args.output}`)
    writeFile(JSON.stringify(errorGroupResponse), args.output)
    console.log('Finished.')
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