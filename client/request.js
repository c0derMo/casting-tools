const https = require('https');
const http = require('http');

/** @function gets
 *  Requests a webressource using https.get
 *  @param {string} url - The URL to request
 *  @param {object} options - Options element passed to https.get
 *  @returns {Promise}
 */
function gets(url, options) {
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

/** @function get
 *  Requests a webressource using http.get
 *  @param {string} url - The URL to request
 *  @param {object} options - Options element passed to http.get
 *  @returns {Promise}
 */
function get(url, options) {
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

/** @function posts
 *  Requests a webressource using https.request using POST as method
 *  @param {string} url - The URL to request
 *  @param {object} data - The data to send along
 *  @param {object} options - Options element passed to https.get
 *  @returns {Promise}
 */
function posts(url, data, options) {
    options.method = 'POST';
    return new Promise((resolve, reject) => {
        req = https.get(url, options, (res) => {
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
        req.write(JSON.stringify(data));
        req.end();
    });
}

/** @function post
 *  Requests a webressource using http.request using POST as method
 *  @param {string} url - The URL to request
 *  @param {object} data - The data to send along
 *  @param {object} options - Options element passed to http.get
 *  @returns {Promise}
 */
function post(url, data, options) {
    options.method = 'POST';
    return new Promise((resolve, reject) => {
        req = https.get(url, options, (res) => {
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
        req.write(JSON.stringify(data));
        req.end();
    });
}

module.exports = {
    gets: gets,
    get: get,
    posts: posts,
    post: post
}