const moment = require('moment');

function toMessage(user, msg, room) {
    return {
        user,
        msg,
        time: moment().format('H:mm'),
        room
    }
}

module.exports = toMessage;