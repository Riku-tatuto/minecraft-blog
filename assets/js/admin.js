// assets/js/admin.js
import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";

// UTF-8 → Base64
function utf8ToBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p) =>
      String.fromCharCode(parseInt(p, 16))
    )
  );
}
// ArrayBuffer → Base64 (画像用)
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

document.getElementById("postForm").addEventListener("submit", async e => {
  e.preventDefault();
  const token   = document.getElementById("token").value.trim();
  const title   = document.getElementById("title").value.trim();
  const category= document.getElementById("category").value;
  const body    = document.getElementById("body").value;
  const fileIn  = document.getElementById("thumbnailFile");
  const octokit = new Octokit({ auth: token });
  const date    = new Date().toISOString().slice(0,10);

  // １）サムネイルを先にアップロード（assets/thumbnails/YYYYMMDD-slug.ext）
  let thumbPath = "";
  if(fileIn.files.length){
    const file = fileIn.files[0];
    const ext  = file.name.split(".").pop();
    const slugBase = title.replace(/\s+/g,"-").toLowerCase();
    const thumbName= `${date}-${slugBase}.${ext}`;
    const path = `assets/thumbnails/${thumbName}`;

    // ファイル読み込み
    const arrayBuffer = await file.arrayBuffer();
    const content     = arrayBufferToBase64(arrayBuffer);

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: "Riku-tatuto",
      repo:  "minecraft-blog",
      path,
      message: `Add thumbnail: ${thumbName}`,
      content,
      branch: "main"
    });
    thumbPath = `/minecraft-blog/${path}`;
  }

  // ２）記事ファイルを投稿
  const slug = `${date}-${title.replace(/\s+/g,'-').toLowerCase()}`;
  const filename = `_posts/${slug}.html`;

 let fm = `---\nlayout: post\ntitle: "${title}"\ndate: ${date}\ncategory: ${category}\n`;
 if (permalinkInput) {
   // permalink 値をクォートで囲む
   fm += `permalink: "${permalinkInput}"\n`;
 }
  fm += `---\n`;

  const content = utf8ToBase64(fm + body);
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: "Riku-tatuto", repo: "minecraft-blog",
    path: filename, message: `Add post: ${title}`, content, branch: "main"
  });

  alert("記事とサムネイルをコミットしました");
  e.target.reset();
});
