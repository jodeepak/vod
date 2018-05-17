var express = require('express')
var router = express.Router()  
var orm = require('orm');
var connString = 'mysql://testuser:p@ssw0rd@18.220.214.73/friendsmgmt'

/**
POST Request http://localhost/api/user/:Id/storeHistory
Request:
{
  "watch_history": []
}
Response Success: 
{"status":"success","info":"Watch History Updated!"}
*/
router.post('/:Id/storeHistory',function(req,res){
    const body = req.body;    
    var jsonResp = {};
    res.set('Content-Type', 'text/plain');
    req.models.User.find({ id: req.params.Id},1, function (err, data) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }else{
            data[0].save({
                watch_history: body.watch_history,
            },function (err) {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                console.log("updated!");
                jsonResp.status = "success";     
                jsonResp.info = "Watch History Updated!";                     
                res.send(JSON.stringify(jsonResp));       
            });
        }
    });
});

module.exports = router