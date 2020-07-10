const {readFileAsync} = require('./shared')

const countErrors = async (path, args) =>{
    console.log(`Reading error instance output from  ${path}...`)
    let errors = JSON.parse(await readFileAsync(path))
    console.log("Finished.")

    console.log(`Found ${errors.length} entries`)
}
module.exports = {
    countErrors
}