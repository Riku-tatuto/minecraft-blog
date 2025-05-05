// assets/js/admin.js
import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

// UTF-8 → Base64 エンコード
function utf8ToBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p) =>
      String.fromCharCode(parseInt(p, 16))
    )
  );
}

document.getElementById('postForm').addEventListener('submit', async e => {
  e.preventDefault();
  const token = document.getElementById('token').value.trim();
  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const body  = document.getElementById('body').value;
  const permalinkInput = document.getElementById('permalink').value.trim();

  const octokit = new Octokit({ auth: token });
  const date = new Date().toISOString().slice(0, 10);

  // スラッグ正規化: フォルダ区切り(/)はハイフンに
  const raw = permalinkInput
    ? permalinkInput.replace(/^\//, '').replace(/\.html$/, '')
    : `${date}-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const slug = raw.replace(/\//g, '-');
  const filename = `_posts/${slug}.html`;

  // front matter 組み立て
  let fm = `---\nlayout: post\ntitle: "${title}"\ndate: ${date}\ncategory: ${category}\n`;
  if (permalinkInput) fm += `permalink: ${permalinkInput}\n`;
  fm += `---\n`;

  const content = utf8ToBase64(fm + body);

  try {
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Riku-tatuto',
      repo: 'minecraft-blog',
      path: filename,
      message: `Add post: ${title}`,
      content,
      branch: 'main'
    });
    alert('記事をコミットしました');
    e.target.reset();
  } catch (err) {
    console.error(err);
    alert('投稿エラー: コンソールを確認してください');
  }
});
