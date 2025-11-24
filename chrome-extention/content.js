function extractComments() {
    const comments = [];
    const commentElements = document.querySelectorAll('ytd-comment-thread-renderer');

    commentElements.forEach(element => {
        const textElement = element.querySelector('#content-text');
        if (textElement) {
            const text = textElement.innerText.trim();
            if (text) comments.push(text);
        }
    });

    return comments;
}

// Wait until comments exist
function waitForComments(maxRetries = 20, interval = 500) {
    return new Promise(resolve => {
        let attempts = 0;
        const timer = setInterval(() => {
            const comments = extractComments();
            if (comments.length > 0 || attempts >= maxRetries) {
                clearInterval(timer);
                resolve(comments);
            }
            attempts++;
        }, interval);
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract_comments") {
        waitForComments().then(comments => sendResponse({ comments }));
        return true; // keep messaging channel open for async
    }
});
