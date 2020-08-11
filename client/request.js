const https = require('https');
const http = require('http');
const url = require('url');
const querystring = require('querystring');

/** @function _gets
 *  Requests a webressource using https.get
 *  @param {string} url - The URL to request
 *  @param {object} options - Options element passed to https.get
 *  @returns {Promise}
 */
function _gets(url, options) {
    return new Promise((resolve, reject) => {
        let req = https.get(url, options, (res) => {
            var raw = [];

            res.on('data', (data) => {
                raw.push(data);
            });

            res.on('end', () => {
                let result = Buffer.concat(raw);
                resolve({statusCode:res.statusCode,headers:res.headers,body:result.toString()});
            });

            res.on('error', reject);
        });
        req.on('error', reject);
    });
}

/** @function _get
 *  Requests a webressource using http.get
 *  @param {string} url - The URL to request
 *  @param {object} options - Options element passed to http.get
 *  @returns {Promise}
 */
function _get(url, options) {
    return new Promise((resolve, reject) => {
        let req = http.get(url, options, (res) => {
            var raw = [];

            res.on('data', (data) => {
                raw.push(data);
            });

            res.on('end', () => {
                let result = Buffer.concat(raw);
                resolve({statusCode:res.statusCode,headers:res.headers,body:result});
            });

            res.on('error', reject);
        });
        req.on('error', reject);
    });
}

/** @function _posts
 *  Requests a webressource using https.request using POST as method
 *  @param {string} url - The URL to request
 *  @param {object} data - The data to send along
 *  @param {object} options - Options element passed to https.get
 *  @returns {Promise}
 */
function _posts(url, data, options) {
    options.method = 'POST';
    data = JSON.stringify(data);
    options.headers = options.headers || {};
    options.headers['Content-Length'] = Buffer.byteLength(data)
    options.headers['Content-Type'] = 'application/json; charset=utf-8';

    return new Promise((resolve, reject) => {
        req = https.request(url, options, (res) => {
            var raw = [];

            res.on('data', (data) => {
                raw.push(data);
            });

            res.on('end', () => {
                let result = Buffer.concat(raw);
                resolve({statusCode:res.statusCode,headers:res.headers,body:result});
            });

            res.on('error', reject);
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

/** @function _post
 *  Requests a webressource using http.request using POST as method
 *  @param {string} url - The URL to request
 *  @param {object} data - The data to send along
 *  @param {object} options - Options element passed to http.get
 *  @returns {Promise}
 */
function _post(url, data, options) {
    options.method = 'POST';
    data = JSON.stringify(data);
    options.headers = options.headers || {};
    options.headers['Content-Length'] = Buffer.byteLength(data)
    options.headers['Content-Type'] = 'application/json; charset=utf-8';
    return new Promise((resolve, reject) => {
        req = http.request(url, options, (res) => {
            var raw = [];

            res.on('data', (data) => {
                raw.push(data);
            });

            res.on('end', () => {
                let result = Buffer.concat(raw);
                resolve({statusCode:res.statusCode,headers:res.headers,body:result});
            });

            res.on('error', reject);
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

/** @function post
 *  Requests a webressource using HTTP or HTTPS depending on the URL using POST method
 *  @param {string} url - The URL to request
 *  @param {object} data - The data to send along
 *  @param {object} [options] - Options element passed to http(s).get
 *  @returns {Promise}
 */
function post(url, data, options) {
    options = options || {};
    let urlCheck = new URL(url);
    if(urlCheck.protocol == "https:") {
        return _posts(url, data, options);
    } else {
        return _post(url, data, options);
    }
}

/** @function get
 *  Requests a webressource using HTTP or HTTPS depending on the URL using GET method
 *  @param {string} url - The URL to request
 *  @param {object} [options] - Options element passed to http(s).get
 *  @returns {Promise}
 */
function get(url, options) {
    options = options || {};
    let urlCheck = new URL(url);
    if(urlCheck.protocol == "https:") {
        return _gets(url, options);
    } else {
        return _get(url, options);
    }
}

module.exports = {
    _gets: _gets,
    _get: _get,
    _posts: _posts,
    _post: _post,
    get: get,
    post: post
}