import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

// UTF-8 文字列を Base64 に変換する関数
function utf8ToBase64(str) {
  // encodeURIComponent で UTF-8 にエンコードし、%xx を文字に戻してから btoa
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

document.getElementById('postForm').addEventListener('submit', async e => {
  e.preventDefault();
  const token = document.getElementById('token').value.trim();
  const title = document.getElementById('title').value.trim();
  const body  = document.getElementById('body').value.trim();

  const octokit = new Octokit({ auth: token });
  const date = new Date().toISOString().slice(0,10);
  const slug = title.replace(/\s+/g, '-').toLowerCase();
  const path = `_posts/${date}-${slug}.md`;

  // フロントマター付き Markdown テキスト
  const markdown = `---\ntitle: "${title}"\ndate: ${date}\n---\n\n${body}`;
  // Latin1 外文字を回避して Base64 化
  const content = utf8ToBase64(markdown);

  try {
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Riku-tatuto', repo: 'minecraft-blog', path,
      message: `Add post: ${title}`, content, branch: 'main'
    });
    alert('記事をコミットしました！');
    e.target.reset();
  } catch (err) {
    console.error(err);
    alert('エラーが発生しました。コンソールをご確認ください。');
  }
});
