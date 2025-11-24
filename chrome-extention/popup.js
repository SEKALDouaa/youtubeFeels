let allComments = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');

    analyzeBtn.addEventListener('click', analyzeComments);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            displayComments(allComments);
        });
    });
});

async function analyzeComments() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    analyzeBtn.disabled = true;
    resultsDiv.style.display = 'block';
    resultsDiv.textContent = 'Analyzing comments...';
    errorDiv.style.display = 'none';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.url.includes('youtube.com/watch')) throw new Error('Please open a YouTube video');

        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const comments = [];
                document.querySelectorAll('ytd-comment-thread-renderer').forEach(el => {
                    const t = el.querySelector('#content-text');
                    if (t) comments.push(t.innerText.trim());
                });
                return comments;
            }
        });

        if (!result || result.length === 0) throw new Error('No comments found. Scroll to load more comments.');

        const apiUrl = "https://d0senzy-YoutubeFeels.hf.space/predict_batch"; // your backend URL
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comments: result })
        });

        if (!response.ok) throw new Error('API error: ' + response.status);

        const data = await response.json();

        // Map comments to predictions
        allComments = result.map((text, idx) => ({
            text,
            sentiment: data.sentiments[idx],         // -1, 0, 1
            confidence: data.confidences[idx] * 100  // convert to %
        }));

        displayStatistics(allComments);
        displayComments(allComments);

    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    } finally {
        analyzeBtn.disabled = false;
    }
}

function displayStatistics(comments) {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    comments.forEach(c => {
        if (c.sentiment === 1) counts.positive++;
        else if (c.sentiment === 0) counts.neutral++;
        else if (c.sentiment === -1) counts.negative++;
    });

    const total = comments.length;
    const statsHtml = `
        Positive: ${counts.positive} (${((counts.positive/total)*100).toFixed(1)}%)\n
        Neutral: ${counts.neutral} (${((counts.neutral/total)*100).toFixed(1)}%)\n
        Negative: ${counts.negative} (${((counts.negative/total)*100).toFixed(1)}%)
    `;
    document.getElementById('results').textContent = statsHtml;
}

function displayComments(comments) {
    let commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    commentsList.innerHTML = '';

    const filtered = comments.filter(c => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'positive') return c.sentiment === 1;
        if (currentFilter === 'neutral') return c.sentiment === 0;
        if (currentFilter === 'negative') return c.sentiment === -1;
    });

    if (filtered.length === 0) {
        commentsList.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">No comments in this filter</p>';
        return;
    }

    filtered.forEach(c => {
        const div = document.createElement('div');
        div.className = `comment-item sentiment-${c.sentiment}`;
        div.innerHTML = `
            <div class="comment-header">
                <span class="comment-sentiment">${c.sentiment}</span>
                <span class="comment-confidence">${c.confidence.toFixed(1)}%</span>
            </div>
            <div class="comment-text">${escapeHtml(c.text)}</div>
        `;
        commentsList.appendChild(div);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
