var express = require('express');
var router = express.Router();
var Zillow = require('../code/node-zillow-custom');
var _ = require('underscore');
//https://www.zillow.com/howto/api/APIOverview.htm
//https://github.com/ralucas/node-zillow

var zwsId = 'X1-ZWz19d11j4co3v_67ceq';
var zOptions = {};
var zillow = new Zillow(zwsId, zOptions);

router.all('/getzestimate',function(req,res,next){
    //http://www.zillow.com/webservice/GetZestimate.htm
        var parameters = _.pick(_.extend(req.query,req.body),['zpid','rentzestimate']);
        zillow.get('GetZestimate', parameters).then(function(results) {
            return res.json(results.response);
        });
        
});

router.all('/getsearchresults',function(req,res,next){
    //https://www.zillow.com/howto/api/GetSearchResults.htm
   var parameters = _.pick(_.extend(req.query,req.body),['address','citystatezip']);
        zillow.get('GetSearchResults', parameters).then(function(results) {
            if(results.response)
            {
                return res.json(results.response.results.result);
            }
            else{
                // there was an error or it couldn't find the address;
                res.json(results);
            }
        });
});
router.all('/getchart',function(req,res,next){
    //https://www.zillow.com/howto/api/GetChart.htm
   var parameters = _.pick(_.extend(req.query,req.body),['zpid','unit-type','width','height','chartDuration']);
        zillow.get('GetChart', parameters).then(function(results) {
            return res.json(results.response);
        });
});
router.all('/getcomps',function(req,res,next){
    //https://www.zillow.com/howto/api/GetComps.htm
  var parameters = _.pick(_.extend(req.query,req.body),['zpid','count','rentzestimate']);
        zillow.get('GetComps', parameters).then(function(results) {
            return res.json(results.response);
        });
});
router.all('/getdeepcomps',function(req,res,next){
    //https://www.zillow.com/howto/api/GetDeepComps.htm
 var parameters = _.pick(_.extend(req.query,req.body),['zpid','count','rentzestimate']);
       try{
        zillow.get('GetDeepComps', parameters).then(function(results) {
            return res.json(results.response);
        });
       }
       catch(err)
       {
            return res.json(err);
       }
});
router.all('/getdeepsearchresults',function(req,res,next){
    //https://www.zillow.com/howto/api/GetDeepSearchResults.htm
    // citystatezip: 'Boulder, CO'  // Can be city + state, or zip, or both
   var parameters = _.pick(_.extend(req.query,req.body),['address','citystatezip','rentzestimate']);
        zillow.get('GetDeepSearchResults', parameters).then(function(results) {
            if(results.response)
            {
                return res.json(results.response.results.result);
            }
            else{
                // there was an error or it couldn't find the address;
                res.json(results);
            }
        });
});
router.all('/getupdatedpropertydetails',function(req,res,next){
    //https://www.zillow.com/howto/api/GetUpdatedPropertyDetails.htm
   var parameters = _.pick(_.extend(req.query,req.body),['zpid']);
        zillow.get('GetUpdatedPropertyDetails', parameters).then(function(results) {
             if(results.response)
            {
                return res.json(results.response);
            }
            else{
                // there was an error or it couldn't find the address;
                res.json(results);
            }
        });
});
router.all('/getregionchildren',function(req,res,next){
    //https://www.zillow.com/howto/api/GetRegionChildren.htm
 var parameters = _.pick(_.extend(req.query,req.body),['regionId','state','county','city','childtype']);
        zillow.get('GetRegionChildren', parameters).then(function(results) {
            return res.json(results.response);
        });
});
router.all('/getregionchart',function(req,res,next){
        //can't get to the api documentation url for GetRegionChart.
        //It keeps redirecting back to the main page
        //will assume it takes the same parameters as getregionchildren + getchart
         var parameters = _.pick(_.extend(req.query,req.body),['regionId','state','county','city','childtype','unit-type','width','height','chartDuration']);
        zillow.get('GetRegionChart', parameters).then(function(results) {
            return res.json(results.response);
        });
});
router.all('/getdemographics',function(req,res,next){
    //this api endpoint may have been deprecated. I don't see documentation for it on their site.
        var parameters = _.pick(_.extend(req.query,req.body),['zip']);
        zillow.get('GetDemographics', parameters).then(function(results) {
            return res.json(results.response);
        });
        
});
module.exports = router;