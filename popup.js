// ---------- TAB LOGIC ----------
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

function generateRegex() {
    const type = fieldType.value;
    const starts = document.getElementById("startsWith").value;
    const len = document.getElementById("length").value;
    const name = document.getElementById("regexName").value || "Untitled Regex";
    const country = document.getElementById("country").value;

    let pattern = "";

    if (type === "phone") {
        pattern = country === "IN" ? "^[6-9]\\d{9}$" :
            country === "US" ? "^\\d{10}$" :
                "^\\d{10,11}$";
    } else {
        const baseMap = {
            email: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
            username: "[A-Za-z0-9_]",
            name: "[A-Za-z ]",
            number: "\\d",
            alphanumeric: "[A-Za-z0-9]"
        };

        if (type === "email") {
            pattern = `^${baseMap.email}$`;
        } else {
            pattern = `^${starts ? escape(starts) : ""}${baseMap[type]}{${len || 1}}$`;
        }
    }

    document.getElementById("generatedRegex").value = `/${pattern}/`;
    saveRegex(name, type, pattern);
}

// ---------- SAVE ----------
function saveRegex(name, type, pattern) {
    chrome.storage.local.get("regexes", res => {
        const list = res.regexes || [];
        list.push({ name, type, pattern });
        chrome.storage.local.set({ regexes: list });
    });
}

// ---------- TEST ----------
document.getElementById("testInput").oninput = testRegex;
document.getElementById("testRegex").oninput = testRegex;

function testRegex() {
    const regexInput = document.getElementById("testRegex").value;
    const text = document.getElementById("testInput").value;
    const result = document.getElementById("testResult");

    try {
        const r = new RegExp(regexInput.replace(/^\/|\/$/g, ""));
        result.innerHTML = r.test(text)
            ? text.replace(r, `<span class="match">$&</span>`)
            : "❌ No match";
    } catch {
        result.textContent = "Invalid regex";
    }
}

// ---------- SAVED ----------
function loadSaved() {
    const ul = document.getElementById("savedList");
    ul.innerHTML = "";

    chrome.storage.local.get("regexes", res => {
        (res.regexes || []).forEach((r, i) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${r.name}</strong><br>
                <small>${r.pattern}</small>
                <div class="saved-actions">
                <button onclick="loadToTest(${i})">Test</button>
                <button onclick="deleteRegex(${i})">Delete</button>
                </div>
            `;
            ul.appendChild(li);
        });
    });
}

window.loadToTest = (i) => {
    chrome.storage.local.get("regexes", res => {
        const r = res.regexes[i];
        document.querySelector('[data-tab="test"]').click();
        document.getElementById("testRegex").value = `/${r.pattern}/`;
    });
};

window.deleteRegex = (i) => {
    chrome.storage.local.get("regexes", res => {
        const list = res.regexes || [];
        list.splice(i, 1);
        chrome.storage.local.set({ regexes: list }, loadSaved);
    });
};

// ---------- UTILS ----------
function escape(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
