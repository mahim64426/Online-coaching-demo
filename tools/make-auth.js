const c=require("crypto");const [e,p]=process.argv.slice(2);
if(!e||!p){console.log('Usage: node tools/make-auth.js "email" "password"');process.exit(1)}
const salt=c.randomBytes(8).toString("hex"),h=x=>c.createHash("sha256").update(salt+x).digest("hex");
console.log(`window.DEMO_AUTH = { salt: "${salt}", emailHash: "${h(e.trim().toLowerCase())}", passHash: "${h(p)}" };`);
