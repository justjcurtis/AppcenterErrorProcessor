const cliProgress = require('cli-progress');
const {writeFile} = require('./shared')
const { errorGroup, errorInstance } = require('./appcenterAPI')

const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const aepGet = async (egID, args) =>{
    console.log(`Getting error group ${egID}...`)
    let errorGroupResponse = await errorGroup(egID, args.key, args.from, args.to, args.owner, args.app);
    writeFile(JSON.stringify(errorGroupResponse), args.output+'.bak')
    if(errorGroupResponse == undefined){
        console.log('error getting error groups')
        return;
    }
    console.log('Finished.')

    console.log('Enumerating individual error responses')
    let downloadTasks = []
    for(let i = 0; i < errorGroupResponse.length; i++){
        downloadTasks.push(getErrorResponse(egID, errorGroupResponse[i], args.key, args.owner, args.app))
    }
    console.log('Finished.')
    console.log('Downloading individual error responses')
    progress.start(errorGroupResponse.length, 0);
    let downloadResults = await Promise.allSettled(downloadTasks);
    progress.stop();
    console.log('Finished.')

    console.log(`Writing output to ${args.output}`)
    writeFile(JSON.stringify(errorGroupResponse), args.output)
    console.log('Finished.')
}

const getErrorResponse = async (groupID, errorID, key, owner, app) => {
    let errorResponse = await errorInstance(groupID, errorID, key, owner, app);
    if(errorResponse == undefined){
        continue;
    }
    progress.update(i+1);
    return {
        'reasonFrames':errorResponse.reasonFrames,
        'carrierName':errorResponse.carrierName,
        'jailbreak':errorResponse.jailbreak,
        'properties':errorResponse.properties
    } 
}

module.exports = {
    aepGet
}