
var fs = require('fs');


var users = require('./files/users.json');

function blockContact(req, res) {
    var username = req.body.username;
    var blockedContact = req.body.blockedContact;
    if (users.hasOwnProperty(username)) {
        var user = users[username];
        bool = true;
        let arr = user['blockedContacts'];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === blockedContact) {
                bool = false;
                break;
            }
        }
        if (bool) {
            user['blockedContacts'].push(blockedContact);
            fs.writeFileSync('./files/users.json', JSON.stringify(users));
        }
        res.json(true);
    }
}
function unblockContact(req, res) {
    var username = req.body.username;
    var unBlockedContact = req.body.unBlockedContact;
    var blockedArray = Array.from(users[username].blockedContacts);
    var i = -1
    i = blockedArray.indexOf(unBlockedContact);
    found = false;
    if (i>-1) {
        users[username].blockedContacts.splice(i, 1);
        fs.writeFileSync('./files/users.json', JSON.stringify(users));
        found = true;
    }
    res.json(found);
}

function isBlocked(req, res) {
    var username = req.body.username;
    var blockedContact = req.body.blockedContact;
    var bool = false;
    if (users.hasOwnProperty(username)) {
        var user = users[username];
        let arr =Array.from(user['blockedContacts']);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === blockedContact) {
                bool = true;
                break;
            }
        }
    }
    res.send(bool);
}

module.exports = (app) => {
    app.post("/blockContact", (req, res) => {
        blockContact(req, res);
    });
    app.post("/unblockContact", (req, res) => {
        unblockContact(req, res);
    });
    app.post("/isBlocked", (req, res) => {
        isBlocked(req, res);
    });
}
