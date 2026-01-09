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
    const likeBtn = document.getElementById('like-btn');
    const likeCount = document.getElementById('like-count');
    
    // 【重要】请将 'everything-about-words-user' 替换为您自己的GitHub用户名或其他唯一字符串
    // 这样可以确保您的计数器是独一无二的，不会跟别人的混在一起。
    const NAMESPACE = 'everything-about-words-v1'; 
    const KEY = 'likes';

    // 1. 初始化：获取当前点赞数
    fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`)
        .then(res => res.json())
        .then(res => {
            likeCount.innerText = res.value || 0;
        })
        .catch(() => {
            likeCount.innerText = '0'; // 如果API挂了，显示0
        });

    // 2. 检查本地存储：用户是否已经点过赞？
    const hasLiked = localStorage.getItem('hasLiked');
    if (hasLiked) {
        likeBtn.classList.add('liked');
        likeBtn.disabled = true; // 禁用按钮
    }

    // 3. 点击事件
    likeBtn.addEventListener('click', () => {
        // 如果已经点过，直接返回
        if (likeBtn.classList.contains('liked')) return;

        // UI 立即反馈（增加动画类）
        likeBtn.classList.add('animating');
        
        // 调用 API 进行 +1 操作
        fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`)
            .then(res => res.json())
            .then(res => {
                // 更新数字
                likeCount.innerText = res.value;
                
                // 改变按钮样式
                likeBtn.classList.add('liked');
                likeBtn.disabled = true;
                
                // 记录到本地，防止刷新后重复点赞
                localStorage.setItem('hasLiked', 'true');
            })
            .catch(err => {
                console.error('Like failed:', err);
                alert('Connection error. Please try again later.');
            });
    });
});