"use strict";
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var orm = require('orm');
var connString = 'mysql://testuser:p@ssw0rd@18.220.214.73/friendsmgmt'
var app = express();
app.disable('x-powered-by');
app.use(compression());

var PORT = process.env.PORT || 80;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var handlebars = require('express-handlebars').create({defaultLayout:'main'}); 
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.use(orm.express(connString, {
        define: function (db, models) {        
            models.User = db.define("user_info", {
                name: String,
                watch_history: String,
                create_timestamp: { type: "date", time: true }, 
                update_timestamp: { type: "date", time: true }
            });;
        }
    })); 

app.listen(PORT, function() {
    console.log('Server Running in PORT=' + PORT)
});

app.use(require('./controllers'))

app.get('/',function(req,res){        
    req.models.User.find({ id: 1}, 1, function (err, data) {   
        res.render('index', {
            layout: false, 
            data: JSON.stringify(data[0])
        });                          
    });     
});    