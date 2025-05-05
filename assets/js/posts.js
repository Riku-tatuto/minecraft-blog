import { db } from './firebase.js';
import { doc, getDoc, setDoc, increment } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function renderPosts(posts) {
  const c = document.getElementById('posts-container');
  c.innerHTML = '';
  const likesRef = doc(db,'likes','_all');
  const likesSnap = await getDoc(likesRef).catch(()=>({exists:()=>false}));
  const allLikes = likesSnap.exists()?likesSnap.data():{};

  posts.forEach(p=>{
    const count = allLikes[p.slug]||0;
    const card = document.createElement('div'); card.className='post-card';
    card.innerHTML = `
      <h2><a href="/minecraft-blog/${p.url}">${p.title}</a></h2>
      <small>${p.date}</small>
      <div><button class="like-btn" data-slug="${p.slug}">👍</button>
      <span id="like-${p.slug}">${count}</span></div>`;
    c.appendChild(card);
  });

  c.addEventListener('click', async e=>{
    if(!e.target.classList.contains('like-btn')) return;
    const slug = e.target.dataset.slug;
    const span = document.getElementById(`like-${slug}`);
    // setDoc を使い merge: true で不足ドキュメントも作成
    await setDoc(likesRef, {[slug]: increment(1)}, {merge: true});
    span.textContent = (parseInt(span.textContent)||0) + 1;
  });
}

export async function fetchAndRender({searchTerm='',sortByLikes=false}={}){
  const res = await fetch(`/minecraft-blog/posts.json?ts=${Date.now()}`);
  let posts = await res.json();
  if(searchTerm) posts = posts.filter(p=>p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  if(sortByLikes) {
    const likesRef = doc(db,'likes','_all');
    const snap = await getDoc(likesRef).catch(()=>({exists:()=>false}));
    const allLikes = snap.exists()?snap.data():{};
    posts.sort((a,b)=>(allLikes[b.slug]||0)-(allLikes[a.slug]||0));
  }
  await renderPosts(posts);
}
