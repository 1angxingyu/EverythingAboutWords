document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('dataset-list');
    const categoryContainer = document.getElementById('category-container');
    const langBtns = document.querySelectorAll('.lang-btn');
    
    let allData = [];
    let currentLang = 'all';
    let currentCat = 'all';

    // 1. 读取数据
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            generateCategoryButtons(allData); // 自动生成类别按钮
            renderData(); // 初始渲染
        })
        .catch(error => console.error('Error loading data:', error));

    // 2. 自动生成类别按钮 Logic
    function generateCategoryButtons(data) {
        // 提取所有不重复的 category
        const categories = ['all', ...new Set(data.map(item => item.category))];
        
        // 清空现有的（保留 label）
        categoryContainer.innerHTML = '<span class="filter-label">Category:</span>';

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `filter-btn cat-btn ${cat === 'all' ? 'active' : ''}`;
            btn.textContent = cat === 'all' ? 'All Topics' : cat;
            btn.setAttribute('data-cat', cat);
            
            // 绑定点击事件
            btn.addEventListener('click', () => {
                // UI 更新
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 逻辑更新
                currentCat = cat;
                renderData();
            });

            categoryContainer.appendChild(btn);
        });
    }

    // 3. 语言按钮监听
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentLang = btn.getAttribute('data-lang');
            renderData();
        });
    });

    // 4. 核心渲染函数 (取交集)
    function renderData() {
        listContainer.innerHTML = '';
        
        // 筛选逻辑：同时满足 语言 和 类别
        const filteredData = allData.filter(item => {
            const langMatch = (currentLang === 'all') || (item.language === currentLang);
            const catMatch = (currentCat === 'all') || (item.category === currentCat);
            return langMatch && catMatch;
        });

        if (filteredData.length === 0) {
            listContainer.innerHTML = '<p style="color:#999; width:100%;">No datasets found for this combination.</p>';
            return;
        }

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <span class="card-tag">${item.language} · ${item.category}</span>
                <h2>${item.title}</h2>
                <div class="card-meta">Year: ${item.year}</div>
                <p class="card-desc">${item.description}</p>
                <a href="${item.filename}" class="download-btn" download>↓ Download Data</a>
            `;
            
            listContainer.appendChild(card);
        });
    }
    // ================= 点赞功能逻辑 =================
    const likeBtn = document.getElementById('like-btn');
    const likeCount = document.getElementById('like-count');

    // 【重要】请修改 NAMESPACE 为你自己的独特名字（比如你的 github 用户名）
    // 必须是英文，不要有空格
    const NAMESPACE = 'everything-about-words-v1'; 
    const KEY = 'likes';

    // 1. 初始化：获取当前点赞数
    // 注意：使用的是 api.counterapi.dev
    fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/`)
        .then(res => res.json())
        .then(res => {
            // 注意：这个新API返回的字段叫 count，不是 value
            likeCount.innerText = res.count || 0;
        })
        .catch((err) => {
            console.error('Counter load failed:', err);
            likeCount.innerText = '0'; 
        });

    // 2. 检查本地存储
    const hasLiked = localStorage.getItem('hasLiked');
    if (hasLiked) {
        likeBtn.classList.add('liked');
        likeBtn.disabled = true;
    }

    // 3. 点击事件
    likeBtn.addEventListener('click', () => {
        if (likeBtn.classList.contains('liked')) return;

        likeBtn.classList.add('animating');
        
        // 注意：新API的增加计数端点最后有个 /up
        fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/up`)
            .then(res => res.json())
            .then(res => {
                // 更新数字 (字段是 count)
                likeCount.innerText = res.count;
                
                likeBtn.classList.add('liked');
                likeBtn.disabled = true;
                localStorage.setItem('hasLiked', 'true');
            })
            .catch(err => {
                console.error('Like failed:', err);
                // 即使网络失败，为了用户体验，也可以假装点赞成功（可选）
                // likeBtn.classList.add('liked'); 
                alert('Connection error. Please try again later.');
            });
    });
});