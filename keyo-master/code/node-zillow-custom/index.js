// this file is created to parse the zillow api response better than the package does

'use strict';

var helpers = require('../../node_modules/node-zillow/lib/helpers'),
    apiList = require('../../node_modules/node-zillow/lib/api-list'),
    assign  = require('object-assign'),
    customHelper = require('./custom-helper');

var ROOT_URL = '://www.zillow.com/webservice/';

/**
 * @class Zillow
 *
 * @param {string} id - your zillow api id
 * @param {object} options - options for additional settings
 */
function Zillow(id, options) {
    this.id = id;
    this.options = assign({
      https: false
    }, options);
}

/**
 * Get method to make any 'GET' Zillow Api call
 * @memberof Zillow
 *
 * @param {string} name of the api -- refer to the zillow api doc or the api-list.js
 * @param {object} params - object that takes parameters for call
 */
Zillow.prototype.get = function(apiName, params) {
  if (!this.id) throw new Error('Missing the zws-id');

  helpers.checkParams(params, apiList[apiName]['requiredParams']);

  var paramsString = helpers.toQueryString(params, this.id);

  var protocol = this.options.https ? 'https' : 'http';

  var requestUrl = protocol + ROOT_URL + apiName + '.htm?' + paramsString;

  return helpers.httpRequest(requestUrl)
    .then(customHelper.toJson)
    .then(customHelper.handleResponse)
    .catch(helpers.handleError);
};

module.exports = Zillow;

