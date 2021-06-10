let apiKey = "";

function setAPIKey(oldkey, key) {
    if(apiKey == oldkey) {
        apiKey = key;
    }
}

function getAPIKey() {
    return apiKey;
}

function checkAPIKey(key) {
    return apiKey == key;
}

module.exports = {
    getAPIKey: getAPIKey,
    setAPIKey: setAPIKey,
    checkApiKey: checkAPIKey
}