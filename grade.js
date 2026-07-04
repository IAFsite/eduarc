console.log("LOAD JALAN");

const params = new URLSearchParams(location.search);
const gradeId = params.get("id") || "";

let subjects = [];
let meta = {};

/* =========================
   LOAD SINGLE JSON
========================= */
async function load() {

    try {

        const res = await fetch(`https://raw.githubusercontent.com/IAFsite/eddb/main//${gradeId}/index.json`);
        const json = await res.json();

meta = json ?? {};
subjects = json.subject ?? [];

// =========================
// PAGE TITLE FIX
// =========================
const titleEl = document.getElementById("pageTitle");

if (titleEl) {
    titleEl.textContent = json?.show_as ?? "IAF Archive";
    document.title = `IAF | EDUARC ${json?.show_as ?? "IAF"}`;
}
        render();

    } catch (err) {
        console.error("LOAD ERROR:", err);
    }
}

/* =========================
   RENDER
========================= */
function render(list = subjects) {

    const wrap = document.getElementById("list");
    wrap.innerHTML = "";

    if (!list.length) {
        wrap.innerHTML = `
            <div style="text-align:center;color:#777;padding:50px;">
                No subject found
            </div>
        `;
        return;
    }

    list.forEach(subject => {

        const card = document.createElement("div");
        card.className = "unit";

        card.style.setProperty(
            "--bg",
            `url(https://raw.githubusercontent.com/IAFsite/eddb/main//${gradeId}/${subject.wp || ""})`
        );

        card.innerHTML = `
            <div class="unit-info">

                <h3>${subject.show_as}</h3>

                <div class="reg">
                    ${gradeId}${subject.id}
                </div>

                <div class="meta">
                    ${subject.short || ""}
                </div>

            </div>
        `;

        card.onclick = () => {
            location.href = `find.html?id=${gradeId}${subject.id}`;
        };

        wrap.appendChild(card);
    });
}

/* =========================
   FILTER
========================= */
function applyFilter() {

    const q = document
        .getElementById("search")
        .value
        .toLowerCase();

    render(
        subjects.filter(s =>
            (
                (s.show_as || "") +
                (s.short || "") +
                (s.id || "")
            )
            .toLowerCase()
            .includes(q)
        )
    );
}

load();