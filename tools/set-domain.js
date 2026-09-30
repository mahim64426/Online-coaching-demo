// Usage: node tools/set-domain.js https://USERNAME.github.io/REPO   (no trailing slash)
const fs=require("fs"),path=require("path");const d=(process.argv[2]||"").replace(/\/+$/,"");
if(!/^https:\/\/[^/]+/.test(d)){console.log("Usage: node tools/set-domain.js https://USERNAME.github.io/REPO");process.exit(1)}
const from="https://example.com";let n=0;
(function walk(dir){for(const f of fs.readdirSync(dir)){if(f===".git"||f==="tools"||f==="node_modules")continue;const p=path.join(dir,f);
if(fs.statSync(p).isDirectory())walk(p);else if(/\.(html|xml|txt|json|webmanifest|md)$/.test(f)){const s=fs.readFileSync(p,"utf8");if(s.includes(from)){fs.writeFileSync(p,s.split(from).join(d));n++}}}})(".");
console.log("Updated "+n+" files -> "+d);
