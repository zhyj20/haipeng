(function () {
  const articles = Array.isArray(window.HAIPENG_ARTICLES) ? window.HAIPENG_ARTICLES : [];
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const formatDate = (date) => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${date}T00:00:00`));
  const articleUrl = (article) => `article.html?slug=${encodeURIComponent(article.slug)}`;

  function articleCard(article, compact) {
    const tagList = article.tags.slice(0, compact ? 2 : 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `<article class="article-card${compact ? " article-card-compact" : ""}">
      <div class="article-card-meta"><span>${escapeHtml(article.category)}</span><time datetime="${article.date}">${formatDate(article.date)}</time></div>
      <h3><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h3>
      <p>${escapeHtml(article.excerpt)}</p>
      <div class="article-card-bottom"><div class="tag-list">${tagList}</div><a class="article-arrow" href="${articleUrl(article)}" aria-label="阅读${escapeHtml(article.title)}">阅读全文</a></div>
    </article>`;
  }

  function renderHomeArticles() {
    const target = document.querySelector("[data-home-articles]");
    if (!target) return;
    target.innerHTML = articles.slice(0, 3).map((article) => articleCard(article, true)).join("");
  }

  function renderArchive() {
    const archive = document.querySelector("[data-article-archive]");
    if (!archive) return;
    const search = document.querySelector("[data-article-search]");
    const categoryButtons = Array.from(document.querySelectorAll("[data-category]"));
    const pageStatus = document.querySelector("[data-archive-status]");
    const pagination = document.querySelector("[data-pagination]");
    let activeCategory = "全部";
    let query = "";
    let page = 1;
    const perPage = 6;

    function filteredArticles() {
      const normalized = query.trim().toLowerCase();
      return articles.filter((article) => {
        const categoryMatch = activeCategory === "全部" || article.category === activeCategory;
        const text = [article.title, article.category, article.excerpt, ...article.tags].join(" ").toLowerCase();
        return categoryMatch && (!normalized || text.includes(normalized));
      });
    }

    function render() {
      const list = filteredArticles();
      const totalPages = Math.max(1, Math.ceil(list.length / perPage));
      page = Math.min(page, totalPages);
      const visible = list.slice((page - 1) * perPage, page * perPage);
      archive.innerHTML = visible.length ? visible.map((article) => articleCard(article, false)).join("") : `<div class="archive-empty"><strong>没有找到对应文章。</strong><p>换一个词试试，或回到全部分类。</p></div>`;
      pageStatus.textContent = `共 ${list.length} 篇，当前第 ${page} / ${totalPages} 页`;
      pagination.innerHTML = totalPages > 1 ? `<button type="button" data-page="prev" ${page === 1 ? "disabled" : ""}>上一页</button><span>${page} / ${totalPages}</span><button type="button" data-page="next" ${page === totalPages ? "disabled" : ""}>下一页</button>` : "";
      pagination.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        page += button.dataset.page === "next" ? 1 : -1;
        render();
        archive.scrollIntoView({ behavior: "smooth", block: "start" });
      }));
    }

    categoryButtons.forEach((button) => button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      page = 1;
      categoryButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    }));
    if (search) search.addEventListener("input", () => { query = search.value; page = 1; render(); });
    render();
  }

  function renderArticle() {
    const target = document.querySelector("[data-article-detail]");
    if (!target) return;
    const slug = new URLSearchParams(window.location.search).get("slug");
    const article = articles.find((item) => item.slug === slug);
    if (!article) {
      document.title = "文章未找到｜海朋赛道智略";
      target.innerHTML = `<section class="article-not-found"><p class="eyebrow">内容中心</p><h1>这篇文章暂时不在这里。</h1><p>可以回到内容中心继续浏览。</p><a class="button button-dark" href="articles.html">返回内容中心</a></section>`;
      return;
    }
    document.title = `${article.title}｜海朋赛道智略`;
    document.querySelector("meta[name='description']")?.setAttribute("content", article.excerpt);
    target.innerHTML = `<article class="article-detail">
      <div class="article-detail-head">
        <a class="back-link" href="articles.html">返回内容中心</a>
        <div class="article-card-meta"><span>${escapeHtml(article.category)}</span><time datetime="${article.date}">${formatDate(article.date)}</time></div>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="article-dek">${escapeHtml(article.excerpt)}</p>
        <div class="tag-list article-tags">${article.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      </div>
      <div class="article-detail-body">${article.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      <aside class="source-note"><strong>阅读说明</strong><p>本文依据公开原始页面整理，只提供阅读线索；人物、项目和产业事实请以原始页面为准。</p><a class="button button-outline" href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noopener">查看原始页面</a><span>${escapeHtml(article.sourceName)}</span></aside>
    </article>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderHomeArticles();
    renderArchive();
    renderArticle();
  });
})();
