var url = require('url');
var util = require('util');
var HttpsAdapter = require('./httpadapter/httpsadapter.js');
var RequestAdapter = require('./httpadapter/requestadapter.js');
var _ = require('underscore');

var _singleRecordUrl = 'https://geocoding.geo.census.gov/geocoder/{returntype}/{searchtype}';
var CensusGeocoder = function CensusGeocoder(options)
{
    this.options = _.extend({},options,{   
      searchtype :'onelineaddress',
      returntype : 'locations'});
    this.apiKey = options.apiKey;
    this.httpAdapter = new HttpsAdapter(null,{});
    
}
CensusGeocoder.prototype.geocode = function (value, callback)
{
  var url = this._prepareUrl(_singleRecordUrl);
  var _this = this;
  var params = this._prepareQueryString();

  if (value.address) {    
    params.address = this._encodeSpecialChars(value.address);
  } else {
    params.address = this._encodeSpecialChars(value);
  }

  this.httpAdapter.get(url, params, function (err, result) {
    if (err) {
      return callback(err);
    } else {
   
      // status can be "OK", "ZERO_RESULTS", "OVER_QUERY_LIMIT", "REQUEST_DENIED", "INVALID_REQUEST", or "UNKNOWN_ERROR"
      // error_message may or may not be present
      if (result.errors) {
     
        return callback(result.errors);
      }


    
      callback(false, result.result);
    }

  });
}
var rxToken = /(\{)([^\}]*)(\})/g
CensusGeocoder.prototype._prepareUrl = function (urlTemplate) {
   for(var name in this.options)
   {
       urlTemplate = urlTemplate.replace('{'+name.toLowerCase()+'}',this.options[name]);
   }
    return urlTemplate;
}
CensusGeocoder.prototype._prepareQueryString = function () {
  var params = {

   benchmark :'Public_AR_Current',
   vintage : 'Current_Current',
   format:'json'
  };
 params= _.extend(params,_.pick(this.options,'benchmark','vintage','format'));
 

  return params;

};
CensusGeocoder.prototype._encodeSpecialChars = function(value) {
  if (typeof value === 'string') {
    return value.replace(/\u001a/g, ' ');
  }

  return value;
};
module.exports = CensusGeocoder;