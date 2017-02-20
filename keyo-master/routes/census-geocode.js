var express = require('express');
var router = express.Router();
var  http = require('http');
var CensusGeocoder = require('../code/census-geocode');
var censusApiKey = '45f5418f9ec047b91b5a4037d3a80124edb2f2a5';
var _ = require('underscore');

router.post('/single',function(req,res,next){

    var address = req.body.address;

    //pick the parameters we want out of the body using underscore.pick
    var options = _.pick(req.body,'searchtype','returntype','benchmark','vintage');

        var censusGeoCode =  new CensusGeocoder(options);
        censusGeoCode.geocode(req.body.address,function(err,result){
                if(err)
                {
                    return res.json(result);
                }
                {
                    if(result.addressMatches.length)
                    {
                        return res.json(result.addressMatches[0]);
                    }
                    return res.json(null);
                }
           

        });

    
});


module.exports = router;