const { aepGet } = require('./local_modules/aepGet')
const { removeDupes } = require('./local_modules/removeDupes')
const { splitErrors } = require('./local_modules/splitErrors')
const { joinErrors } = require('./local_modules/joinErrors')

module.exports = {
    aepGet,
    removeDupes,
    splitErrors,
    joinErrors
}