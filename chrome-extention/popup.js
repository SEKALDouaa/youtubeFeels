let allComments = [];
let currentFilter = 'all';
let statsChart = null;
let darkMode = false;

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

    const darkModeBtn = document.getElementById('darkModeBtn');
    darkModeBtn.addEventListener('click', () => {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
    });
});

async function analyzeComments() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.getElementById('loading');

    analyzeBtn.disabled = true;
    loadingDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.url.includes('youtube.com/watch')) throw new Error('Please open a YouTube video');

        const [{ result: comments }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const comments = [];
                document.querySelectorAll('ytd-comment-thread-renderer').forEach(el => {
                    const t = el.querySelector('#content-text');
                    if (t?.innerText.trim()) comments.push(t.innerText.trim());
                });
                return comments;
            }
        });

        if (!comments || comments.length === 0) throw new Error('No comments found. Scroll to load more comments.');

        const apiUrl = document.getElementById('apiUrl').value;
        const response = await fetch(`${apiUrl}/predict_batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comments })
        });

        if (!response.ok) throw new Error('API error: ' + response.status);
        const data = await response.json();

        allComments = comments.map((text, idx) => ({
            text,
            sentiment: data.sentiments[idx],
            confidence: data.confidences[idx] * 100
        }));

        displayStatistics(allComments);
        displayComments(allComments);
        resultsDiv.style.display = 'block';

    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    } finally {
        analyzeBtn.disabled = false;
        loadingDiv.style.display = 'none';
    }
}

function displayStatistics(comments) {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    comments.forEach(c => {
        if (c.sentiment === 1) counts.positive++;
        else if (c.sentiment === 0) counts.neutral++;
        else if (c.sentiment === -1) counts.negative++;
    });

    // Graphique Chart.js
    const ctx = document.getElementById('statsChart').getContext('2d');
    const total = comments.length;

    const data = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
            label: 'Comments Distribution',
            data: [counts.positive, counts.neutral, counts.negative],
            backgroundColor: ['#4caf50', '#999', '#f44336']
        }]
    };

    if (statsChart) statsChart.destroy();
    statsChart = new Chart(ctx, {
        type: 'bar',
        data,
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { precision:0 } }
            }
        }
    });
}

function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';

    const filtered = comments.filter(c => {
        if (currentFilter === 'all') return true;
        return String(c.sentiment) === currentFilter;
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
