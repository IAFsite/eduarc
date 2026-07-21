const params = new URLSearchParams(location.search);

const reg_id = params.get("id") || "";

const grade = reg_id.slice(0,3);
const subject = reg_id.slice(3,4);

let meta = {};
let database = [];

/* =========================
   BACK BUTTON
========================= */

const backBtn = document.getElementById("backBtn");

if(backBtn){

    backBtn.href = `find.html?id=${grade}${subject}`;

}

/* =========================
   LOAD
========================= */

async function load(){

    try{

        const res = await fetch(`https://raw.githubusercontent.com/IAFsite/dbea/main/${grade}/${subject}/data.json`);

        if(!res.ok) throw new Error("File not found");

        const json = await res.json();

        meta = json.meta || {};
        database = json.data || [];

        const file = database.find(item => item.reg_id === reg_id);

        if(!file)
            throw new Error("Document not found");

        select(file);

    }catch(err){

        console.error(err);

        document.title = "IAF | EDUARC";

        document.getElementById("title").textContent =
            "Document Not Found";

        document.getElementById("content").innerHTML =
            "<p>Failed to load document.</p>";

    }

}

/* =========================
   REG PARSER
========================= */

function parseReg(reg){

    return{

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

const ASSET_BASE = "https://raw.githubusercontent.com/IAFsite/dbea/main/";

function asset(path){
    return `${ASSET_BASE}${path}`;
}

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
                    src="${asset(src)}"
                    loading="lazy">
            `;

            continue;

        }

        /* eror */

        if(line.startsWith("#empty")){

            const src = line.replace("#empty","").trim();

            html += `
                <img
                    class="edu-image"
                    src="${asset("empty.png")}"
                    loading="lazy">
            `;

            continue;

        }    

        if(line.startsWith("#404")){

            const src = line.replace("#404","").trim();

            html += `
                <img
                    class="edu-image"
                    src="${asset("404.png")}"
                    loading="lazy">
            `;

            continue;

        }   

        if(line.startsWith("#delet")){

            const src = line.replace("#delet","").trim();

            html += `
                <img
                    class="edu-image"
                    src="${asset("delet.png")}"
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
                    src="${asset(src)}">
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
                    src="${asset(src)}">
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
                    src="${asset(src)}">
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
                    href="${asset(src)}"
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
   SELECT
========================= */

function select(file){

    const info=parseReg(file.reg_id);

    document.title=`IAF | EDUARC ${file.title}`;

    if(document.getElementById("bg"))
        document.getElementById("bg").src=meta.wp||"";

    document.getElementById("title").textContent=
        file.title||"UNKNOWN";

    if(document.getElementById("desc"))
        document.getElementById("desc").textContent=
            meta.show_as||"";

    const infoBox=document.getElementById("info");

    if(infoBox){

        infoBox.innerHTML="";

        [

            ["REG-ID",file.reg_id],

            ["Subject",meta.show_as||""],

            ["Entry",info.number],

            ["Date",info.date]

        ].forEach(item=>{

            const div=document.createElement("div");

            div.className="info-box";

            div.textContent=`${item[0]}: ${item[1]}`;

            infoBox.appendChild(div);

        });

    }

    const content=Array.isArray(file.content)
        ? file.content.join("\n")
        : (file.content||"");

    document.getElementById("content").innerHTML=
        parseContent(content);

}

load();