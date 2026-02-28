function sendMessageToService(message, onResponse) {
    chrome.runtime.sendMessage(message, (response) => {
        if (onResponse && response) {
            onResponse(response);
        }
    });
}

function sendPacketToService(action, data, onResponse = null) {
    sendMessageToService({ action: action, data: data }, onResponse);
}