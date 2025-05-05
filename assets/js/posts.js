// assets/js/posts.js

import { db } from './firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// 記事一覧を描画（サムネイル＋タイトル）
export async function renderPosts(posts) {
  const c = document.getElementById('posts-container');
  c.innerHTML = '';
  posts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
      <a href="${p.url}">
        <img src="${p.thumbnail}" class="post-thumb" alt="サムネイル">
        <h2>${p.title}</h2>
      </a>`;
    c.appendChild(card);
  });
}

// JSON を取得し検索・ソート・描画
export async function fetchAndRender({ searchTerm = '', sortByLikes = false } = {}) {
  const res = await fetch(`/minecraft-blog/posts.json?ts=${Date.now()}`);
  let posts = await res.json();

  // 検索フィルタ
  if (searchTerm) {
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // いいねソート（不要なら削除）
  if (sortByLikes) {
    const likesRef = doc(db, 'likes', '_all');
    const snap = await getDoc(likesRef).catch(() => ({ exists: () => false }));
    const allLikes = snap.exists() ? snap.data() : {};
    posts.sort((a, b) => (allLikes[b.slug] || 0) - (allLikes[a.slug] || 0));
  }

  await renderPosts(posts);
}
