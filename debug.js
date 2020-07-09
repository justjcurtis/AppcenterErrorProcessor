const {
    aepGet,
} = require('./index.js')

let key = "apikey"
let owner = "ownerName"
let app = "appName"
let output = "~/errors.json"
let from = "2020%2F04%2F10"
let to = "2020%2F07%2F09"
let ErrorGroupId = "appcenterErrorGroupId"
let input = undefined
let chunkfile = undefined
aepGet(ErrorGroupId, {key, owner, app, output, from, to, input, chunkfile})