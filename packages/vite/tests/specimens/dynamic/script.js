const aEl = document.querySelector("#a");
const bEl = document.querySelector("#b");

(async function() {
    const a = await import("./a.mcss");
    const b = await import("./b.mcss");
    
    console.log({ a, b });

    aEl.className = a.a;
    bEl.className = b.b;
}());

