    var xml2js  = require('xml2js'),
    _ = require('underscore'),
      Q       = require('q');
module.exports = {
         toJson: function toJson(xml) {
    var deferred = Q.defer();
    var parser = new xml2js.Parser({explicitArray:false});
    parser.parseString(xml, function(err, result) {
      if (err) {
        deferred.reject(new Error(err));
      } else {
        deferred.resolve(result);
      }
    });
    return deferred.promise;
  },

  handleResponse: function handleResponse(res) {
    var resultTag = Object.keys(res)[0];
    var result = res[resultTag];
    return _.omit(result, '$');
    
  },
    };