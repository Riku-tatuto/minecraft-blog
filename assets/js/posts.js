import { db } from './firebase.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

/**
 * posts: { title, url, date, slug } の配列を受け取り、
 * #posts-container 要素内にリストを表示する。
 * 各記事に「いいね」ボタンとカウントを付与。
 */
export async function renderPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = '';

  // Firebase から全記事のいいね数をまとめて取得
  const likesSnapshot = await getDoc(doc(db, 'likes', '_all'))
    .catch(()=>({ exists:()=>false }));
  const allLikes = likesSnapshot.exists() ? likesSnapshot.data() : {};

  for (const post of posts) {
    const count = allLikes[post.slug] || 0;
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
      <h2><a href="${post.url}">${post.title}</a></h2>
      <small>${post.date}</small>
      <div>
        <button class="like-btn" data-slug="${post.slug}">👍</button>
        <span class="like-count" id="like-${post.slug}">${count}</span>
      </div>
    `;
    container.appendChild(card);
  }

  // いいねボタンクリック時のハンドラ
  container.addEventListener('click', async e => {
    if (!e.target.classList.contains('like-btn')) return;
    const slug = e.target.dataset.slug;
    const countEl = document.getElementById(`like-${slug}`);
    // Firestore の likes/_all ドキュメントをインクリメント
    await updateDoc(doc(db, 'likes', '_all'), { [slug]: increment(1) });
    countEl.textContent = parseInt(countEl.textContent) + 1;
  });
}

/**
 * JSON から記事を取得し、オプションでソート／フィルタ
 */
export async function fetchAndRender({ searchTerm = '', sortByLikes = false } = {}) {
  const res = await fetch('/minecraft-blog/posts.json');
  let posts = await res.json();

  // 検索フィルタ
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    posts = posts.filter(p => p.title.toLowerCase().includes(term));
  }

  // いいね順ソート
  if (sortByLikes) {
    // Firestore から取得
    const likesSnap = await getDoc(doc(db, 'likes', '_all')); 
    const allLikes = likesSnap.exists() ? likesSnap.data() : {};
    posts.sort((a,b) => (allLikes[b.slug]||0) - (allLikes[a.slug]||0));
  }

  await renderPosts(posts);
}
