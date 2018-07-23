

//files
var defaults = require("./files/defaults.json");
var users = require("./files/users.json");
var usersByPIN = require("./files/usersByPIN.json");
var usersProfileImages = require("./files/usersProfileImage.json");
var usersEmails = require("./files/usersEmails.json");

module.exports = (app) => {
    app.get("/users", (req, res) => {
        res.json(users);
    });
    app.get("/usersByPin", (req, res) => {
        res.json(usersByPIN)
    });
    app.get("/usersEmails",(req,res)=>{
        res.json(usersEmails);
    });
    app.get("/usersProfileImages", (req, res) => {
        res.json(usersProfileImages);
    });
    app.get("/defaults",(req,res)=>{
        res.json(defaults);
    });
}