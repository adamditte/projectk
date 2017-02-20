var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
    res.render('address-search',{title:'Address Search', name:'Nathan'})
});

module.exports = router;