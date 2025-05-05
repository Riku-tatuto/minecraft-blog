import { db } from './firebase.js';
import { doc, getDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function renderPosts(posts) {
  const c = document.getElementById('posts-container'); c.innerHTML='';
  const likesSnap = await getDoc(doc(db,'likes','_all')).catch(()=>({exists:()=>false}));
  const allLikes = likesSnap.exists()?likesSnap.data():{};

  posts.forEach(p=>{
    const count = allLikes[p.slug]||0;
    const card = document.createElement('div'); card.className='post-card';
    card.innerHTML = `
      <h2><a href="${p.url}">${p.title}</a></h2>
      <small>${p.date}</small>
      <div><button class="like-btn" data-slug="${p.slug}">👍</button>
      <span id="like-${p.slug}">${count}</span></div>`;
    c.appendChild(card);
  });

  c.addEventListener('click', async e=>{
    if(!e.target.classList.contains('like-btn')) return;
    const slug=e.target.dataset.slug;
    const el=document.getElementById(`like-${slug}`);
    await updateDoc(doc(db,'likes','_all'),{[slug]:increment(1)});
    el.textContent = parseInt(el.textContent)+1;
  });
}

export async function fetchAndRender({searchTerm='',sortByLikes=false}={}){
  const res = await fetch('/minecraft-blog/posts.json');
  let posts=await res.json();
  if(searchTerm) posts=posts.filter(p=>p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  if(sortByLikes){
    const snap=await getDoc(doc(db,'likes','_all')); const likes=snap.exists()?snap.data():{};
    posts.sort((a,b)=>(likes[b.slug]||0)-(likes[a.slug]||0));
  }
  await renderPosts(posts);
}
