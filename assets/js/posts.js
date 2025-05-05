import { db } from './firebase.js';
import { doc, getDoc, setDoc, increment } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

/**
 * 指定記事リストをレンダリングし、いいね機能を付与
 * @param {{title:string,url:string,date:string,slug:string,category:string}[]} posts
 */
export async function renderPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = '';

  // 現在のいいね数を一括取得
  const likesRef = doc(db, 'likes', '_all');
  const likesSnap = await getDoc(likesRef).catch(() => ({ exists: () => false }));
  const allLikes = likesSnap.exists() ? likesSnap.data() : {};

  // 各記事カードを生成
  posts.forEach(post => {
    const count = allLikes[post.slug] || 0;
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
      <h2><a href="${post.url}">${post.title}</a></h2>
      <small>${post.date}</small>
      <div>
        <button class="like-btn" data-slug="${post.slug}">👍</button>
        <span id="like-${post.slug}">${count}</span>
      </div>
    `;
    container.appendChild(card);
  });

  // いいねボタンクリック時の処理
  container.addEventListener('click', async e => {
    if (!e.target.classList.contains('like-btn')) return;
    const slug = e.target.dataset.slug;
    const span = document.getElementById(`like-${slug}`);
    // Firestore の likes/_all ドキュメントをマージで更新
    await setDoc(likesRef, { [slug]: increment(1) }, { merge: true });
    span.textContent = (parseInt(span.textContent) || 0) + 1;
  });
}

/**
 * 記事メタ JSON を取得し、検索・ソートを適用してレンダリング
 * @param {{searchTerm?:string,sortByLikes?:boolean}} options
 */
export async function fetchAndRender({ searchTerm = '', sortByLikes = false } = {}) {
  // JSON 取得
  const res = await fetch('posts.json');
  let posts = await res.json();

  // タイトル検索フィルタ
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    posts = posts.filter(p => p.title.toLowerCase().includes(term));
  }

  // いいね順ソート
  if (sortByLikes) {
    const likesRef = doc(db, 'likes', '_all');
    const snap = await getDoc(likesRef).catch(() => ({ exists: () => false }));
    const allLikes = snap.exists() ? snap.data() : {};
    posts.sort((a, b) => (allLikes[b.slug] || 0) - (allLikes[a.slug] || 0));
  }

  // レンダリング
  await renderPosts(posts);
}
