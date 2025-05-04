import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

const form = document.getElementById('postForm');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const token = document.getElementById('token').value.trim();
  const title = document.getElementById('title').value.trim();
  const body  = document.getElementById('body').value.trim();

  const octokit = new Octokit({ auth: token });
  const date = new Date().toISOString().slice(0,10);
  const slug = title.replace(/\s+/g, '-').toLowerCase();
  const path = `_posts/${date}-${slug}.md`;
  const content = btoa(`---\ntitle: "${title}"\ndate: ${date}\n---\n\n${body}`);

  try {
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Riku-tatuto', repo: 'minecraft-blog', path,
      message: `Add post: ${title}`, content, branch: 'main'
    });
    alert('記事をコミットしました！');
    form.reset();
  } catch (err) {
    console.error(err);
    alert('エラーが発生しました。コンソールをご確認ください。');
  }
});
