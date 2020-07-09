const {
    aepGet,
} = require('./index.js')

let key = "apikey"
let owner = "ideagen-plc"
let app = "Coruson-Mobile-iOS"
let output = "~/errors.json"
let from = "2020%2F04%2F10"
let to = "2020%2F07%2F09"
let ErrorGroupId = "2491346219"
aepGet(ErrorGroupId, {key, owner, app, output, from, to})