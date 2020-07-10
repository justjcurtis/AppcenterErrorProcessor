const fetch = require("node-fetch");
const { sleep } = require('./shared')
const url = "https://api.appcenter.ms/v0.1/apps";

const errorGroup = async (groupID, apiKey, from, to, owner, app) => {
    path = `/${owner}/${app}/errors/errorGroups/${groupID}/errors?start=${from}&end=${to}&%24top=0`
    let response = await appcenterRequest(path, apiKey);
    
    if(response != undefined && response.nextLink){
        let nextPath = response.nextLink.substring(14)
        let extra = await recursiveErrorGroup(nextPath, apiKey);
        if(extra != undefined){
            response.errors = response.errors.concat(extra.errors)
        }
    }
    let result = response.errors;

    return result;
}

const recursiveErrorGroup = async (nextPath, apiKey, page=2) =>{
    console.log(page)
    let response = await appcenterRequest(nextPath, apiKey)
    if(response != undefined){

        if(response.nextLink){
            let nextPath = response.nextLink.substring(14)
            let extra = await recursiveErrorGroup(nextPath, apiKey, page + 1);
            if(extra != undefined){
                response.errors = response.errors.concat(extra.errors)
            }
        }
    }
    return response;
}

const errorInstance = async (groupID, errorID, apiKey, owner, app) =>{
    // return;
    path = `/${owner}/${app}/errors/errorGroups/${groupID}/errors/${errorID}`
    return await appcenterRequest(path, apiKey);
}

const appcenterRequest = async (path, key, attempt=0) => {
    try {
        let response = await fetch(url+path, {
            method: 'get',
            headers: { 'Content-Type': 'application/json', 'X-API-Token': key},
        })
        const json = await response.json();
        return json;
    } catch (error) {
        if(attempt < 10){
            await sleep(1000)
            return await appcenterRequest(path, key, attempt + 1)
        }
        else{
            console.log(`Skipping ${url}${path} after 10 attempts...`)
            return undefined
        }
    }
}

module.exports = {
    errorGroup,
    errorInstance
}