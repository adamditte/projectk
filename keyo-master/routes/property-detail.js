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
    var address = req.query.address;   //if sata were posted, you would use req.body in place of req.query

    var prom = loadPropertyDetails(address);

    prom.done(function (propertyData) {                         //this is where the rendered property details are returned
        return res.render('property-detail', { title: 'JADE-Bootstrap', propertyData: propertyData, propertyJson: JSON.stringify(propertyData, false, 2) });
    });

});

function loadPropertyDetails(address) {

    //https://github.com/then/promise
    //Wrap the functions that normally take a callback in a promise so we have more control      
    var censusGeoCode = new CensusGeocoder({ returntype: 'geographies' });

    var prom = new Promise(function (mainResolve, mainReject) {
        var resultData = {};
        try {
            googleGeoCoder.geocode({ address: address }, function (err, googleResponse) {
                var gAddr = googleResponse[0];
                var zillAddrSearch = gAddr.streetNumber + ' ' + gAddr.streetName;
                resultData.googleResult = gAddr;
                var censusProm = new Promise(function (resolve, reject) {
                    censusGeoCode.geocode({ address: gAddr.formattedAddress }, function (err, censusResult) {
                        resolve(censusResult);
                    });
                });
                var zillowProm = new Promise(function (resolve, reject) {
                    zillow.get('GetDeepSearchResults', { address: zillAddrSearch, citystatezip: gAddr.zipcode }).then(function (zillowResult) {
                        resolve(zillowResult);
                    });
                });
                Promise.all([censusProm, zillowProm]).then(function (allRes) {
                    try {
                        var censusResult = allRes[0].addressMatches[0];
                        var zillowResult = allRes[1];
                        resultData.zillowSearchResult = zillowResult;
                        resultData.censusResult = censusResult;
                        var myResult = {
                            countyName: censusResult.geographies.Counties[0].NAME,
                            censusTract: censusResult.geographies["2010 Census Blocks"][0].TRACT,
                            censusBlock: censusResult.geographies["2010 Census Blocks"][0].BLOCK,
                            zip: censusResult.addressComponents.zip,
                            threeDigitZip: censusResult.addressComponents.zip.toString().substring(0, 3),
                            stateName: censusResult.geographies.States[0].BASENAME,
                            cityName: censusResult.addressComponents.city
                        };
                         resultData = _.extend(resultData, gAddr, myResult);
                        if (zillowResult.response) {
                            var zillowData = {
                            bathrooms: zillowResult.bathrooms,
                            bedrooms: zillowResult.bedrooms,
                            squareFeet: zillowResult.finishedSqFt,
                            price: (zillowResult.lastSoldPrice)?zillowResult.lastSoldPrice._ : 'unknown'
                        };
                            resultData = _.extend(resultData, zillowData);

                            mainResolve(resultData);

                            // zillow.get('GetUpdatedPropertyDetails', { zpid: zillowResult.response.results.result.zpid }).then(function (zUpdatedPropResult) {
                            //     resultData.zillowUpdatedPropertyDetailsResult = zUpdatedPropResult;
                            //     if (zUpdatedPropResult.response) {
                            //         //set resultData stuff
                            //     }
                            //     mainResolve(resultData);
                            // });

                        }
                        else {
                            mainResolve(resultData);
                        }
                    }
                    catch (err) {
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
