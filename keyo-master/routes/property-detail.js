var express = require('express');
var router = express.Router();
var CensusGeocoder = require('../code/census-geocode');
var censusApiKey = '45f5418f9ec047b91b5a4037d3a80124edb2f2a5';
var Zillow = require('../code/node-zillow-custom');
var Promise = require('promise');
var NodeGeocoder = require('node-geocoder');


var _ = require('underscore');
var zwsId = 'X1-ZWz19d11j4co3v_67ceq';
var zOptions = {};
var zillow = new Zillow(zwsId, zOptions);

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyBBqoKA5F1E5_MR427Z1kyGwMP5zNGjejQ',
    formatter: null
};

var googleGeoCoder = NodeGeocoder(options);
router.get('/', function (req, res, next) {
    var googlePlaceId = req.query.googlePlaceId;


    var prom = loadPropertyDetails(googlePlaceId);

    prom.done(function (propertyData) {
        return res.render('property-detail', { title: 'JADE-Bootstrap', propertyData: propertyData, propertyJson: JSON.stringify(propertyData, false, 2) });
    });

});

function loadPropertyDetails(googlePlaceId) {

    //https://github.com/then/promise
    //Wrap the functions that normally take a callback in a promise so we have more control      
    var censusGeoCode = new CensusGeocoder({ returntype: 'geographies' });


    var prom = new Promise(function (mainResolve, mainReject) {
        var resultData = {};
        try {
            googleGeoCoder.geocode({ googlePlaceId: googlePlaceId }, function (err, googleResponse) {
                var gAddr = googleResponse[0];
                var zillAddrSearch = gAddr.streetNumber + ' ' + gAddr.streetName;
                resultData.googleResult = gAddr;
                var censusProm = new Promise(function (resolve, reject) {
                    censusGeoCode.geocode({ address: gAddr.formattedAddress }, function (err,censusResult) {
                        resolve(censusResult);
                    });
                });
                var zillowProm = new Promise(function (resolve, reject) {
                    zillow.get('GetDeepSearchResults', { address: zillAddrSearch, citystatezip: gAddr.zipcode }).then(function (zillowResult) {
                        resolve(zillowResult);
                    });
                });
                Promise.all([censusProm, zillowProm]).then(function (allRes) {
                    try{
                    var censusResult = allRes[0];
                    var zillowResult = allRes[1];
                    resultData.zillowSearchResult = zillowResult;
                    resultData.censusResult = censusResult;
                    if (zillowResult.response) {


                        zillow.get('GetUpdatedPropertyDetails', { zpid: zillowResult.response.results.result.zpid }).then( function (zUpdatedPropResult) {
                            resultData.zillowUpdatedPropertyDetailsResult = zUpdatedPropResult;
                            if (zUpdatedPropResult.response) {
                               //set resultData stuff
                            }
                            mainResolve(resultData);
                        });

                    }
                    else {
                        mainResolve(resultData);
                    }
                }
                catch(err)
                {
                    mainReject(err);
                }
                });
            });
        }
        catch (err) {
            mainReject(err);
        }

    });



    return prom;
}

module.exports = router;
