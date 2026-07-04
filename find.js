const params = new URLSearchParams(location.search);

const archiveId = params.get("id") || "";

const grade = archiveId.slice(0, 3);
const subject = archiveId.slice(3, 4);

let database = [];
let meta = {};

/* =========================
   BACK BUTTON
========================= */

const backBtn = document.getElementById("backBtn");

if (backBtn) {

    backBtn.href = `grade.html?id=${grade}`;

}

/* =========================
   LOAD DATA
========================= */

async function load() {

    try {

        const res = await fetch(`https://raw.githubusercontent.com/IAFsite/eduarc/main/entry/${grade}/${subject}/data.json`);

        if (!res.ok) throw new Error("File not found");

        const json = await res.json();

        meta = json.meta || json;
        database = json.data || json.subject || [];

        const title = meta.show_as || "IAF Archive";

        document.title = `IAF | EDUARC ${title}`;

        document.getElementById("pageTitle").textContent = title;

        render(database);

    } catch (err) {

        console.error(err);

        document.getElementById("pageTitle").textContent = "IAF Archive";

        document.getElementById("list").innerHTML = `
            <div style="padding:50px;text-align:center;color:#777;">
                Failed to load data
            </div>
        `;

    }

}

/* =========================
   REG PARSER
========================= */

function parseReg(reg) {

    return {

        grade: reg.slice(0,3),

        subject: reg.slice(3,4),

        number: reg.slice(4,7),

        date:
            reg.slice(7,9)+"/"+
            reg.slice(9,11)+"/"+
            reg.slice(11,15)

    };

}

/* =========================
   EDUARC PARSER
========================= */

function parseContent(text=""){

    const lines = text.split("\n");

    let html = "";

    let code = false;

    for(let raw of lines){

        const line = raw.trim();

        /* CODE */

        if(line=="#code"){

            code = true;

            html += "<pre><code>";

            continue;

        }

        if(line=="#endcode"){

            code = false;

            html += "</code></pre>";

            continue;

        }

        if(code){

            html += line
                .replace(/</g,"&lt;")
                .replace(/>/g,"&gt;")+"\n";

            continue;

        }

        /* LINE */

        if(line=="___"){

            html += "<hr>";

            continue;

        }

        /* NOTE */

        if(line.startsWith("#note")){

            html += `
                <div class="edu-note">
                    ${line.replace("#note","").trim()}
                </div>
            `;

            continue;

        }

        /* IMAGE */

        if(line.startsWith("#image")){

            const src = line.replace("#image","").trim();

            html += `
                <img
                    class="edu-image"
                    src="${src}"
                    loading="lazy">
            `;

            continue;

        }

        /* VIDEO */

        if(line.startsWith("#video")){

            const src = line.replace("#video","").trim();

            html += `
                <video
                    class="edu-video"
                    controls
                    src="${src}">
                </video>
            `;

            continue;

        }

        /* PDF */

        if(line.startsWith("#pdf")){

            const src = line.replace("#pdf","").trim();

            html += `
                <iframe
                    class="edu-pdf"
                    src="${src}">
                </iframe>
            `;

            continue;

        }

        /* AUDIO */

        if(line.startsWith("#audio")){

            const src = line.replace("#audio","").trim();

            html += `
                <audio
                    controls
                    src="${src}">
                </audio>
            `;

            continue;

        }

        /* FILE */

        if(line.startsWith("#file")){

            const src = line.replace("#file","").trim();

            const name = src.split("/").pop();

            html += `
                <a
                    class="edu-file"
                    href="${src}"
                    download>
                    📦 ${name}
                </a>
            `;

            continue;

        }

        /* NORMAL TEXT */

        if(line!=""){

            html += `<p>${line}</p>`;

        }

    }

    return html;

}

/* =========================
   RENDER LIST
========================= */

function render(data){

    const wrap = document.getElementById("list");

    wrap.innerHTML = "";

    if(!data.length){

        wrap.innerHTML=`
            <div style="padding:50px;text-align:center;color:#777;">
                No document found
            </div>
        `;

        return;

    }

    data.forEach(file=>{

        const info = parseReg(file.reg_id);

        const card = document.createElement("div");

        card.className = "unit";

        card.style.setProperty("--bg",`url(${meta.wp||""})`);

        card.innerHTML=`

            <div class="unit-info">

                <h3>${file.title}</h3>

                <div class="reg">
                    REG-ID : ${file.reg_id}
                </div>

                <div class="meta">
                    ${meta.show_as||""}
                    •
                    #${info.number}
                    •
                    ${info.date}
                </div>

            </div>

        `;

        card.onclick=()=>{

            if(window.innerWidth<900){

                location.href=`read.html?id=${encodeURIComponent(file.reg_id)}`;

                return;

            }

            select(file);

        };

        wrap.appendChild(card);

    });

}

/* =========================
   SELECT
========================= */

function select(file){

    const info = parseReg(file.reg_id);

    document.getElementById("bg").src = meta.wp || "";

    document.getElementById("title").textContent =
        file.title || "UNKNOWN";

    document.getElementById("desc").textContent =
        meta.show_as || "";

    const infoBox =
        document.getElementById("info");

    infoBox.innerHTML="";

    [

        ["REG-ID",file.reg_id],

        ["Subject",meta.show_as||""],

        ["https://raw.githubusercontent.com/IAFsite/eduarc/main/entry",info.number],

        ["Date",info.date]

    ].forEach(item=>{

        const div=document.createElement("div");

        div.className="info-box";

        div.textContent=`${item[0]}: ${item[1]}`;

        infoBox.appendChild(div);

    });

const content = Array.isArray(file.content)
    ? file.content.join("\n")
    : (file.content || "");

document.getElementById("content").innerHTML =
    parseContent(content);

}

/* =========================
   SEARCH
========================= */

function applyFilter(){

    const q=document
        .getElementById("search")
        .value
        .toLowerCase();



}

load();