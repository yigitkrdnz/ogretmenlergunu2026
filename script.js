
/* =========================================
   24 KASIM ÖĞRETMENLER GÜNÜ
   ANA JAVASCRIPT DOSYASI
========================================= */


/* 1. API BAĞLANTISI */

const API_URL = "https://script.google.com/macros/s/AKfycbwz5M-cbtk-kKiux-smXtsBKGXuNpFeqUpUTHv5X0ItB7aZslI98Uz_2vo0E0aLW8LZ/exec";


/* 2. HTML ELEMANLARI */

const welcome = document.getElementById("welcome");
const letterSection = document.getElementById("letterSection");
const continueButton = document.getElementById("continueButton");

const displayTeacherName = document.getElementById("displayTeacherName");

const letterListScreen = document.getElementById("letterListScreen");
const letterGrid = document.getElementById("letterGrid");
const emptyLettersMessage = document.getElementById("emptyLettersMessage");

const letterDetailScreen = document.getElementById("letterDetailScreen");
const letterTeacherName = document.getElementById("letterTeacherName");
const letterContent = document.getElementById("letterContent");

const backButton = document.getElementById("backButton");
const saveLetterPdfButton = document.getElementById("saveLetterPdfButton");

const letterFooter = document.getElementById("letterFooter");

const finalButton = document.getElementById("finalButton");
const finalScreen = document.getElementById("finalScreen");
const finalBackButton = document.getElementById("finalBackButton");
const principalMessage = document.getElementById("principalMessage");

const ataturkLetterButton = document.getElementById("ataturkLetterButton");
const ataturkScreen = document.getElementById("ataturkScreen");
const ataturkBackButton = document.getElementById("ataturkBackButton");


/* 3. UYGULAMA DEĞİŞKENLERİ */

let currentTeacher = null;
let selectedLetter = null;
let requestInProgress = false;


/* 4. EKRAN YÖNETİMİ */

function hideAllScreens() {

    const screens = [
        welcome,
        letterSection,
        finalScreen,
        ataturkScreen
    ];

    screens.forEach(screen => {

        if (!screen) return;

        screen.hidden = true;
        screen.style.display = "none";

    });

}


function showScreen(screen) {

    if (!screen) return;

    hideAllScreens();

    screen.hidden = false;
    screen.style.display = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* 5. QR KODU OKUMA */

function getTeacherToken() {

    const params = new URLSearchParams(window.location.search);

    return (
        params.get("ogretmen") ||
        params.get("token") ||
        ""
    ).trim().toLowerCase();

}


/* 6. ERİŞİM UYARISI */

function showAccessMessage(message) {

    hideAllScreens();

    let accessScreen = document.getElementById("accessScreen");

    if (!accessScreen) {

        accessScreen = document.createElement("section");

        accessScreen.id = "accessScreen";

        accessScreen.style.cssText = `
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:25px;
            box-sizing:border-box;
            background:#15120f;
            color:#F2E8D5;
            text-align:center;
            font-family:'Cormorant Garamond',serif;
        `;

        document.body.appendChild(accessScreen);

    }

    accessScreen.innerHTML = "";

    const content = document.createElement("div");

    content.style.maxWidth = "600px";

    const ornament = document.createElement("div");

    ornament.textContent = "˚⊱─── ⋆⋅☆⋅⋆ ───⊰˚";
    ornament.style.cssText = `
        color:#B08D45;
        font-size:30px;
        margin-bottom:20px;
    `;

    const heading = document.createElement("h1");

    heading.textContent = "Özel Davet";
    heading.style.cssText = `
        color:#D4AF65;
        font-size:36px;
    `;

    const description = document.createElement("p");

    description.textContent = message;
    description.style.cssText = `
        font-size:21px;
        line-height:1.6;
        color:#F2E8D5;
    `;

    content.append(ornament, heading, description);
    accessScreen.appendChild(content);

    accessScreen.hidden = false;
    accessScreen.style.display = "flex";

}


/* 7. ÖĞRETMEN VERİLERİNİ GETİRME */

async function getTeacherLetters(slug) {

    const url =
        `${API_URL}?ogretmen=${encodeURIComponent(slug)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Sunucuya bağlanılamadı.");
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(
            result.message || "Öğretmen bulunamadı."
        );
    }

    return {

        name: result.teacher,

        letters: Array.isArray(result.letters)
            ? result.letters
            : [],

        principalMessage: result.ataturkMessage || ""

    };

}


/* 8. QR KODU DOĞRULAMA */

async function verifyTeacherAccess() {

    const token = getTeacherToken();

    if (!token) {

        showAccessMessage(
            "Bu sayfaya erişebilmek için size özel QR kodunu okutmanız gerekiyor."
        );

        return;

    }

    if (requestInProgress) return;

    requestInProgress = true;

    try {

        const data = await getTeacherLetters(token);

        currentTeacher = data;

        displayTeacherName.textContent = data.name;

        showScreen(welcome);

    } catch (error) {

        console.error(
            "Öğretmen doğrulama hatası:",
            error
        );

        showAccessMessage(
            "Bağlantı doğrulanamadı: " + error.message
        );

    } finally {

        requestInProgress = false;

    }

}


/* 9. MÜHÜRLÜ ZARF OLUŞTURMA */

function createLetterCards() {

    letterGrid.innerHTML = "";

    const letters = currentTeacher?.letters || [];

    if (letters.length === 0) {

        emptyLettersMessage.hidden = false;
        return;

    }

    emptyLettersMessage.hidden = true;

    letters.forEach((letter, index) => {

        const card = document.createElement("button");

        card.type = "button";
        card.className = "letter-card";

        card.setAttribute(
            "aria-label",
            `${index + 1}. mektubu aç`
        );

        const envelope = document.createElement("div");

        envelope.className = "letter-envelope";

        const number = document.createElement("div");

        number.className = "letter-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const title = document.createElement("div");

        title.className = "letter-card-title";
        title.textContent = "Bir Öğrencinizden";

        const subtitle = document.createElement("div");

        subtitle.className = "letter-card-subtitle";
        subtitle.textContent = "Sevgi ve saygıyla...";

        const seal = document.createElement("div");

        seal.className = "letter-seal";
        seal.textContent = "✦";

        const decoration = document.createElement("div");

        decoration.className = "letter-card-decoration";
        decoration.textContent = "❧";

        envelope.append(
            number,
            title,
            subtitle,
            seal,
            decoration
        );

        card.appendChild(envelope);

        card.addEventListener("click", () => {

            openLetter(letter);

        });

        letterGrid.appendChild(card);

    });

}


/* 10. MEKTUP AÇMA */

function openLetter(letter) {

    if (!currentTeacher || !letter) return;

    selectedLetter = letter;

    letterTeacherName.textContent = currentTeacher.name;

    letterContent.textContent = letter.content || "";

    letterListScreen.hidden = true;
    letterListScreen.style.display = "none";

    letterDetailScreen.hidden = false;
    letterDetailScreen.style.display = "";

    letterFooter.hidden = true;
    letterFooter.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* 11. MEKTUPLARA GERİ DÖN */

function closeLetter() {

    selectedLetter = null;

    letterDetailScreen.hidden = true;
    letterDetailScreen.style.display = "none";

    letterListScreen.hidden = false;
    letterListScreen.style.display = "";

    letterFooter.hidden = false;
    letterFooter.style.display = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* 12. PDF OLARAK KAYDETME */

function saveLetterAsPDF() {

    if (!selectedLetter || !currentTeacher) {

        alert("Önce bir mektup seçmelisiniz.");
        return;

    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {

        alert("PDF kaydetmek için açılır pencereye izin vermelisiniz.");
        return;

    }

    const teacherName = escapeHTML(currentTeacher.name);
    const content = escapeHTML(selectedLetter.content || "");

    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="tr">

        <head>

            <meta charset="UTF-8">

            <title>${teacherName} - Öğretmenler Günü</title>

            <style>

                body {
                    background:#fff;
                    color:#222;
                    font-family:Georgia,serif;
                    padding:55px;
                    line-height:1.8;
                }

                .paper {
                    max-width:750px;
                    margin:auto;
                }

                .eyebrow {
                    text-align:center;
                    color:#9b793d;
                    letter-spacing:2px;
                    margin-bottom:45px;
                }

                h1 {
                    text-align:center;
                    font-weight:normal;
                    margin-bottom:40px;
                }

                .content {
                    white-space:pre-wrap;
                    font-size:16px;
                }

                .footer {
                    margin-top:60px;
                    text-align:right;
                }

                @media print {
                    body {
                        padding:20px;
                    }
                }

            </style>

        </head>

        <body>

            <div class="paper">

                <div class="eyebrow">
                    24 KASIM · ÖĞRETMENLER GÜNÜ
                </div>

                <h1>${teacherName}</h1>

                <div class="content">${content}</div>

                <div class="footer">
                    Saygı ve sevgilerimle...
                </div>

            </div>

        </body>

        </html>

    `);

    printWindow.document.close();

    printWindow.onload = function () {

        printWindow.focus();
        printWindow.print();

    };

}


/* 13. GÜVENLİ METİN */

function escapeHTML(text) {

    return String(text)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* 14. OKUL MÜDÜRÜNÜN MESAJI */

function openPrincipalMessage() {

    if (!currentTeacher) return;

    principalMessage.textContent =
        currentTeacher.principalMessage ||
        "Henüz müdürümüzün mesajı eklenmemiştir.";

    showScreen(finalScreen);

}


/* 15. ATATÜRK'ÜN MESAJI */

function openAtaturkMessage() {

    showScreen(ataturkScreen);

}


/* 16. MEKTUPLAR EKRANINA DÖNÜŞ */

function returnToLetters() {

    selectedLetter = null;

    showScreen(letterSection);

    letterListScreen.hidden = false;
    letterListScreen.style.display = "";

    letterDetailScreen.hidden = true;
    letterDetailScreen.style.display = "none";

    letterFooter.hidden = false;
    letterFooter.style.display = "";

}


/* 17. MEKTUP LİSTESİNİ AÇMA */

function openTeacherLetters() {

    if (!currentTeacher) return;

    displayTeacherName.textContent = currentTeacher.name;

    createLetterCards();

    showScreen(letterSection);

    letterListScreen.hidden = false;
    letterListScreen.style.display = "";

    letterDetailScreen.hidden = true;
    letterDetailScreen.style.display = "none";

    letterFooter.hidden = false;
    letterFooter.style.display = "";

}


/* 18. BUTONLAR */

continueButton.addEventListener(
    "click",
    openTeacherLetters
);

backButton.addEventListener(
    "click",
    closeLetter
);

saveLetterPdfButton.addEventListener(
    "click",
    saveLetterAsPDF
);

finalButton.addEventListener(
    "click",
    openPrincipalMessage
);

finalBackButton.addEventListener(
    "click",
    returnToLetters
);

ataturkLetterButton.addEventListener(
    "click",
    openAtaturkMessage
);

ataturkBackButton.addEventListener(
    "click",
    returnToLetters
);


/* 19. SAYFA AÇILIŞI */

hideAllScreens();

verifyTeacherAccess();
