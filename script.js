document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('dataset-list');
    const categoryContainer = document.getElementById('category-container');
    const languageContainer = document.getElementById('language-container');

    let allData = [];
    let currentLang = 'all';
    let currentCat = 'all';

    fetch('data.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load data.json: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (!Array.isArray(data)) {
                throw new Error('data.json must contain an array.');
            }

            allData = data;
            generateLanguageButtons(allData);
            generateCategoryButtons(allData);
            renderData();
        })
        .catch((error) => {
            console.error('Error loading data:', error);
            listContainer.innerHTML =
                '<p style="color:#999; width:100%;">Failed to load datasets. Please check data.json.</p>';
        });

    function generateLanguageButtons(data) {
        const languages = [
            'all',
            ...new Set(
                data
                    .map((item) => (item.language ?? '').toString().trim())
                    .filter((lang) => lang.length > 0)
            ),
        ];

        languageContainer.innerHTML =
            '<span class="filter-label">Language:</span>';

        languages.forEach((lang) => {
            const btn = document.createElement('button');
            btn.className = `filter-btn lang-btn ${lang === 'all' ? 'active' : ''}`;
            btn.textContent = lang === 'all' ? 'All' : lang;
            btn.setAttribute('data-lang', lang);

            btn.addEventListener('click', () => {
                document.querySelectorAll('.lang-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                currentLang = lang;
                renderData();
            });

            languageContainer.appendChild(btn);
        });
    }

    function generateCategoryButtons(data) {
        const categories = [
            'all',
            ...new Set(
                data
                    .map((item) => (item.category ?? '').toString().trim())
                    .filter((cat) => cat.length > 0)
            ),
        ];

        categoryContainer.innerHTML =
            '<span class="filter-label">Category:</span>';

        categories.forEach((cat) => {
            const btn = document.createElement('button');
            btn.className = `filter-btn cat-btn ${cat === 'all' ? 'active' : ''}`;
            btn.textContent = cat === 'all' ? 'All Topics' : cat;
            btn.setAttribute('data-cat', cat);

            btn.addEventListener('click', () => {
                document.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                currentCat = cat;
                renderData();
            });

            categoryContainer.appendChild(btn);
        });
    }

    function renderData() {
        listContainer.innerHTML = '';

        const filteredData = allData.filter((item) => {
            const lang = (item.language ?? '').toString().trim();
            const cat = (item.category ?? '').toString().trim();

            const langMatch = currentLang === 'all' || lang === currentLang;
            const catMatch = currentCat === 'all' || cat === currentCat;

            return langMatch && catMatch;
        });

        if (filteredData.length === 0) {
            listContainer.innerHTML =
                '<p style="color:#999; width:100%;">No datasets found for this combination.</p>';
            return;
        }

        filteredData.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'card';

            const title = escapeHtml(item.title ?? 'Untitled');
            const language = escapeHtml(item.language ?? 'Unknown');
            const category = escapeHtml(item.category ?? 'Unknown');
            const year = escapeHtml(item.year ?? 'Unknown');
            const description = escapeHtml(item.description ?? '');
            const filename = encodeURI(item.filename ?? '#');

            card.innerHTML = `
                <span class="card-tag">${language} · ${category}</span>
                <h2>${title}</h2>
                <div class="card-meta">Year: ${year}</div>
                <p class="card-desc">${description}</p>
                <a href="${filename}" class="download-btn" download>↓ Download Data</a>
            `;

            listContainer.appendChild(card);
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
});