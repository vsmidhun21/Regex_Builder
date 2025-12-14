const generateBtn = document.getElementById("generate");
const output = document.getElementById("output");
const result = document.getElementById("result");

generateBtn.onclick = generateRegex;

function generateRegex() {
    const type = document.getElementById("matchType").value;
    const starts = document.getElementById("startsWith").value;
    const contains = document.getElementById("contains").value;
    const ends = document.getElementById("endsWith").value;
    const testInput = document.getElementById("testInput").value;
    const language = document.getElementById("language").value;

    // let pattern = buildBasePattern(type);
    let pattern = buildBasePattern(type, starts);


    // if (starts) pattern = "^" + escape(starts) + pattern;
    // if (contains) pattern = "(?=.*" + escape(contains) + ")" + pattern;
    // if (ends) pattern = pattern + escape(ends) + "$";

    if (type !== "phone") {
        if (starts) pattern = "^" + escape(starts) + pattern;
        if (contains) pattern = "(?=.*" + escape(contains) + ")" + pattern;
        if (ends) pattern = pattern + escape(ends) + "$";
    }


    const regex = new RegExp(pattern);
    result.textContent = regex.test(testInput)
        ? "✅ Match Found"
        : "❌ No Match";

    output.value = formatRegex(pattern, language);
}

// ---------------- HELPERS ----------------

// function buildBasePattern(type) {
//     switch (type) {
//         case "email":
//             return "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
//         case "phone":
//             return "\\d{10}";
//         case "url":
//             return "https?:\\/\\/[^\\s]+";
//         case "number":
//             return "\\d+";
//         default:
//             return ".*";
//     }
// }

function buildBasePattern(type, starts) {
    if (type === "phone") {
        return buildIndianPhoneRegex(starts);
    }

    switch (type) {
        case "email":
            return "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
        case "url":
            return "https?:\\/\\/[^\\s]+";
        case "number":
            return "\\d+";
        default:
            return ".*";
    }
}

function buildIndianPhoneRegex(startsWith) {
    let startPattern = "[6-9]"; // default

    if (startsWith) {
        // 6-9 → [6-9]
        if (/^\d-\d$/.test(startsWith)) {
            startPattern = `[${startsWith}]`;
        }
        // 6,7,8,9 → [6789]
        else if (/^\d(,\d)+$/.test(startsWith)) {
            startPattern = `[${startsWith.replace(/,/g, "")}]`;
        }
        // 6987 → [6987]
        else if (/^\d+$/.test(startsWith)) {
            startPattern = `[${startsWith}]`;
        }
        // single digit
        else if (/^\d$/.test(startsWith)) {
            startPattern = `[${startsWith}]`;
        }
    }

    return `^${startPattern}\\d{9}$`;
}


function escape(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatRegex(pattern, lang) {
    switch (lang) {
        case "js":
            return `/${pattern}/`;
        case "python":
            return `r"${pattern}"`;
        case "java":
            return `"${pattern.replace(/\\/g, "\\\\")}"`;
        case "php":
            return `"/${pattern}/"`;
        case "go":
            return `"${pattern}"`;
        default:
            return pattern;
    }
}
