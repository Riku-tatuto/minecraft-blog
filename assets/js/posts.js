import { fetchAndRender, renderPosts } from './posts.js'; // 既存呼び出し箇所

// renderPosts を下記のように置き換え
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

// fetchAndRender は URL 二重付与を避け、キャッシュバスティングはそのまま利用
export async function fetchAndRender({searchTerm='',sortByLikes=false}={}) {
  const res = await fetch(`/minecraft-blog/posts.json?ts=${Date.now()}`);
  let posts = await res.json();
  if (searchTerm) {
    posts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if(sortByLikes) {
    const likesRef = doc(db,'likes','_all');
    const snap = await getDoc(likesRef).catch(()=>({exists:()=>false}));
    const allLikes = snap.exists()?snap.data():{};
    posts.sort((a,b)=>(allLikes[b.slug]||0)-(allLikes[a.slug]||0));
  }
  await renderPosts(posts);
}
