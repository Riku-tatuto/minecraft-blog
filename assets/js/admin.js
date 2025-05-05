import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

// UTF-8 → Base64 エンコード
function utf8ToBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p) =>
      String.fromCharCode(parseInt(p, 16))
    )
  );
}

document.getElementById("postForm").addEventListener("submit", async e => {
  e.preventDefault();
  const token = document.getElementById("token").value.trim();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const body = document.getElementById("body").value;
  // ← permalinkInput を必ず定義
  const permalinkInputElem = document.getElementById("permalink");
  const permalinkInput = permalinkInputElem ? permalinkInputElem.value.trim() : "";

  const octokit = new Octokit({ auth: token });
  const date = new Date().toISOString().slice(0, 10);
  const slugBase = permalinkInput
    ? permalinkInput.replace(/^\//, "").replace(/\.html$/, "")
    : title.replace(/\s+/g, "-").toLowerCase();
  const clean = slugBase.replace(/\//g, "-");
  const slug = `${date}-${clean}`;
  const filename = `_posts/${slug}.html`;

  let fm = `---\nlayout: post\ntitle: "${title}"\ndate: ${date}\ncategory: ${category}\n`;
  if (permalinkInput) fm += `permalink: "${permalinkInput}"\n`;
  // ファイル入力要素の id=thumbnailFile を参照
  const thumbElem = document.getElementById("thumbnailFile");
  let thumbPath = "";
  if (thumbElem && thumbElem.files.length) {
    // 既存ロジックでアップロード→thumbPath をセットしている想定
    thumbPath = uploadedThumbnailPath; 
  }
  fm += `thumbnail: "${thumbPath}"\n`;
  fm += `---\n`;

  const content = utf8ToBase64(fm + body);

  try {
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: "Riku-tatuto",
      repo: "minecraft-blog",
      path: filename,
      message: `Add post: ${title}`,
      content,
      branch: "main"
    });
    alert("記事をコミットしました");
    e.target.reset();
  } catch (err) {
    console.error(err);
    alert("投稿エラー：コンソールを確認してください");
  }
});
