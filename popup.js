// ---------- TABS ----------
document.querySelectorAll(".tab").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
        if (btn.dataset.tab === "saved") loadSaved();
    };
});

// ---------- FIELD TYPE ----------
const fieldType = document.getElementById("fieldType");
const countryWrap = document.getElementById("countryWrap");

fieldType.onchange = () => {
    countryWrap.classList.toggle("hidden", fieldType.value !== "phone");
};

// ---------- GENERATE ----------
document.getElementById("generateBtn").onclick = generateRegex;
document.getElementById("saveBtn").onclick = saveCurrentRegex;
document.getElementById("copyBtn").onclick = copyRegex;

let currentRegex = "";

function generateRegex() {
    const type = fieldType.value;
    const starts = document.getElementById("startsWith").value;
    const len = document.getElementById("length").value || 1;
    const country = document.getElementById("country").value;

    let pattern = "";

    if (type === "phone") {
        pattern = country === "IN" ? "^[6-9]\\d{9}$" :
            country === "US" ? "^\\d{10}$" :
                "^\\d{10,11}$";
    } else {
        const base = {
            email: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
            username: "[A-Za-z0-9_]",
            name: "[A-Za-z ]",
            number: "\\d",
            alphanumeric: "[A-Za-z0-9]"
        };

        if (type === "email") {
            pattern = `^${base.email}$`;
        } else {
            pattern = `^${starts ? escape(starts) : ""}${base[type]}{${len}}$`;
        }
    }

    currentRegex = `/${pattern}/`;
    document.getElementById("generatedRegex").value = currentRegex;
}

// ---------- SAVE ----------
function saveCurrentRegex() {
    if (!currentRegex) return;

    const name = document.getElementById("regexName").value || "Untitled Regex";
    const type = fieldType.value;

    chrome.storage.local.get("regexes", res => {
        const list = res.regexes || [];
        list.push({ name, type, regex: currentRegex });
        chrome.storage.local.set({ regexes: list });
    });
}

// ---------- COPY ----------
function copyRegex() {
    if (!currentRegex) return;
    navigator.clipboard.writeText(currentRegex);
}

// ---------- TEST ----------
document.getElementById("testBtn").onclick = () => {
    const regexText = document.getElementById("testRegex").value;
    const input = document.getElementById("testInput").value;
    const result = document.getElementById("testResult");

    try {
        const r = new RegExp(regexText.replace(/^\/|\/$/g, ""));
        result.innerHTML = r.test(input)
            ? input.replace(r, `<span class="match">$&</span>`)
            : "❌ No match";
    } catch {
        result.textContent = "Invalid regex";
    }
};

// ---------- SAVED ----------
// function loadSaved() {
//     const ul = document.getElementById("savedList");
//     ul.innerHTML = "";

//     chrome.storage.local.get("regexes", res => {
//         (res.regexes || []).forEach((r, i) => {
//             const li = document.createElement("li");
//             li.innerHTML = `
//                 <strong>${r.name}</strong><br>
//                 <small>${r.regex}</small>
//                 <div class="saved-actions">
//                 <button onclick="editRegex(${i})">Edit</button>
//                 <button onclick="deleteRegex(${i})">Delete</button>
//                 </div>
//             `;
//             ul.appendChild(li);
//         });
//     });
// }

// window.editRegex = (i) => {
//     chrome.storage.local.get("regexes", res => {
//         const r = res.regexes[i];
//         document.querySelector('[data-tab="generate"]').click();
//         document.getElementById("generatedRegex").value = r.regex;
//         currentRegex = r.regex;
//         document.getElementById("regexName").value = r.name;
//     });
// };

// window.deleteRegex = (i) => {
//     chrome.storage.local.get("regexes", res => {
//         const list = res.regexes || [];
//         list.splice(i, 1);
//         chrome.storage.local.set({ regexes: list }, loadSaved);
//     });
// };

function loadSaved() {
    const ul = document.getElementById("savedList");
    ul.innerHTML = "";

    chrome.storage.local.get("regexes", res => {
        (res.regexes || []).forEach((r, i) => {
            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${r.name}</strong><br>
                <small>${r.regex}</small>
                <div class="saved-actions">
                <button data-action="edit" data-index="${i}">Edit</button>
                <button data-action="delete" data-index="${i}">Delete</button>
                </div>
            `;

            ul.appendChild(li);
        });

        attachSavedEvents();
    });
}

function attachSavedEvents() {
    document.querySelectorAll("[data-action='edit']").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            editRegex(index);
        });
    });

    document.querySelectorAll("[data-action='delete']").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index;
            deleteRegex(index);
        });
    });
}

function editRegex(index) {
    chrome.storage.local.get("regexes", res => {
        const r = res.regexes[index];
        document.querySelector('[data-tab="generate"]').click();
        document.getElementById("generatedRegex").value = r.regex;
        document.getElementById("regexName").value = r.name;
        currentRegex = r.regex;
    });
}

function deleteRegex(index) {
    chrome.storage.local.get("regexes", res => {
        const list = res.regexes || [];
        list.splice(index, 1);
        chrome.storage.local.set({ regexes: list }, loadSaved);
    });
}


// ---------- UTILS ----------
function escape(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- COPY FEEDBACK ----------
const copyBtn = document.getElementById("copyBtn");
const copyMsg = document.getElementById("copyMsg");

copyBtn.addEventListener("click", () => {
    if (!currentRegex) return;

    navigator.clipboard.writeText(currentRegex);
    copyMsg.style.display = "block";

    setTimeout(() => {
        copyMsg.style.display = "none";
    }, 1200);
});
