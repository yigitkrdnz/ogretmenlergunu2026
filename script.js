
/* =========================================
   24 KASIM ÖĞRETMENLER GÜNÜ
   ÖĞRETMEN MEKTUP SİSTEMİ
========================================= */


/* API BAĞLANTISI */

const API_URL = "https://script.google.com/macros/s/AKfycbwz5M-cbtk-kKiux-smXtsBKGXuNpFeqUpUTHv5X0ItB7aZslI98Uz_2vo0E0aLW8L/exec";


/* HTML ELEMENTLERİ */

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


/* DEĞİŞKENLER */

let currentTeacher = null;
let selectedLetter = null;
let requestInProgress = false;


/* EKRAN YÖNETİMİ */

function hideAllScreens() {
    welcome.hidden = true;
    letterSection.hidden = true;
    finalScreen.hidden = true;
    ataturkScreen.hidden = true;

    welcome.style.display = "none";
    letterSection.style.display = "none";
    finalScreen.style.display = "none";
    ataturkScreen.style.display = "none";
}


function showScreen(screen) {
    hideAllScreens();

    screen.hidden = false;
    screen.style.display = "";
}


/* QR KODU / TOKEN OKUMA */

function getTeacherToken() {
    const params = new URLSearchParams(window.location.search);

    return (
        params.get("ogretmen") ||
        params.get("token") ||
        ""
    ).trim().toLowerCase();
}


/* ERİŞİM UYARISI */

function showAccessMessage(message) {
    hideAllScreens();

    let accessScreen = document.getElementById("accessScreen");

    if (!accessScreen) {
        accessScreen = document.createElement("section");

        accessScreen.id = "accessScreen";

        accessScreen.style.cssText = `
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 25px;
            box-sizing: border-box;
            background: #15120f;
            color: #F2E8D5;
            text-align: center;
            font-family: 'Cormorant Garamond', serif;
        `;

        document.body.appendChild(accessScreen);
    }

    accessScreen.innerHTML = `
    <div style="max-width:600px;">

        <div style="
            display:inline-block;
            padding:12px 16px;
            margin-bottom:30px;
            border:1px solid #a83232;
            border-radius:5px;
            background:rgba(168,50,50,0.13);
            color:#e05252;
            font-family:Arial,sans-serif;
            font-size:15px;
            font-weight:bold;
            letter-spacing:3px;
        ">
         ⚠ GİRİŞ TALEBİNİZ ENGELLENDİ ⚠
        </div>

        <div style="
            color:#B08D45;
            font-size:32px;
            margin-bottom:20px;
        ">
            ˚⊱─── ⋆⋅☆⋅⋆ ───⊰˚
        </div>

        <h1 style="
            color:#D4AF65;
            font-size:36px;
            margin-bottom:15px;
        ">
            Özel Davet
        </h1>

        <p style="
            font-size:21px;
            line-height:1.6;
            color:#F2E8D5;
        ">
            ${escapeHTML(message)}
        </p>

        <div style="
            color:#B08D45;
            font-size:25px;
            margin-top:25px;
        ">
            ⚚ ════════ ⚚
        </div>

    </div>
`;

    accessScreen.hidden = false;
    accessScreen.style.display = "flex";
}


/* ÖĞRETMEN VERİLERİNİ GETİRME */

async function getTeacherLetters(slug) {

    const url = `${API_URL}?ogretmen=${encodeURIComponent(slug)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Sunucuya bağlanılamadı.");
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Öğretmen bulunamadı.");
    }

    return {
        name: result.teacher,
        letters: Array.isArray(result.letters) ? result.letters : [],
        principalMessage: result.ataturkMessage || ""
    };
}


/* QR KODU DOĞRULAMA */

async function verifyTeacherAccess() {

    const token = getTeacherToken();

    // QR kodu yoksa hiçbir açılış ekranını gösterme.

    if (!token) {
        showAccessMessage(
            "Bu sayfaya erişebilmek için size özel QR kodu okutmanız gerekiyor."
        );

        return;
    }

    if (requestInProgress) return;

    requestInProgress = true;

    try {

        const data = await getTeacherLetters(token);

        currentTeacher = data;

        // Öğretmen bilgileri geldiyse açılış ekranını göster.

        if (displayTeacherName) {
            displayTeacherName.textContent = data.name;
        }

        // Açılış ekranı ancak geçerli öğretmen bulunduğunda açılır.

        showScreen(welcome);

    } catch (error) {
    console.error("Öğretmen doğrulama hatası:", error);
    showAccessMessage(
        "Bağlantı doğrulanamadı: " + error.message
    );
} finally {

        requestInProgress = false;

    }
}


/* MEKTUP LİSTESİNİ OLUŞTURMA */

function createLetterCards() {

    letterGrid.innerHTML = "";

    const letters = currentTeacher.letters;

    if (!letters || letters.length === 0) {

        emptyLettersMessage.hidden = false;
        return;

    }

    emptyLettersMessage.hidden = true;

    letters.forEach((letter, index) => {

        const card = document.createElement("div");

        card.className = "letter-card";

        card.innerHTML = `
            <div class="letter-envelope">

                <div class="letter-number">
                    ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="letter-card-title">
                    Bir Öğrencinizden
                </div>

                <div class="letter-card-subtitle">
                    Sevgi ve saygıyla...
                </div>

                <div class="letter-card-decoration">
                    ❧
                </div>

            </div>
        `;

        card.addEventListener("click", () => {
            openLetter(letter);
        });

        letterGrid.appendChild(card);

    });

}


/* MEKTUP AÇMA */

function openLetter(letter) {

    selectedLetter = letter;

    letterTeacherName.textContent = currentTeacher.name;

    letterContent.textContent = letter.content;

    letterListScreen.hidden = true;
    letterListScreen.style.display = "none";

    letterDetailScreen.hidden = false;
    letterDetailScreen.style.display = "";

    letterFooter.style.display = "none";

}


/* MEKTUP LİSTESİNE DÖNME */

function closeLetter() {

    selectedLetter = null;

    letterDetailScreen.hidden = true;
    letterDetailScreen.style.display = "none";

    letterListScreen.hidden = false;
    letterListScreen.style.display = "";

    letterFooter.style.display = "";

}


/* PDF OLARAK KAYDETME */

function saveLetterAsPDF() {

    if (!selectedLetter || !currentTeacher) {
        return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("PDF kaydetmek için açılır pencereye izin vermelisiniz.");
        return;
    }

    const teacherName = currentTeacher.name;
    const content = selectedLetter.content;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="tr">

        <head>

            <meta charset="UTF-8">

            <title>${teacherName} - Öğretmenler Günü Mektubu</title>

            <style>

                body {
                    background: #fff;
                    color: #222;
                    font-family: Georgia, serif;
                    padding: 55px;
                    line-height: 1.8;
                }

                .paper {
                    max-width: 750px;
                    margin: auto;
                }

                .eyebrow {
                    text-align: center;
                    color: #9b793d;
                    letter-spacing: 2px;
                    font-size: 12px;
                    margin-bottom: 45px;
                }

                h1 {
                    text-align: center;
                    font-weight: normal;
                    margin-bottom: 40px;
                }

                .content {
                    white-space: pre-wrap;
                    font-size: 16px;
                }

                .footer {
                    margin-top: 60px;
                    text-align: right;
                }

                @media print {
                    body {
                        padding: 20px;
                    }
                }

            </style>

        </head>

        <body>

            <div class="paper">

                <div class="eyebrow">
                    24 KASIM · ÖĞRETMENLER GÜNÜ
                </div>

                <h1>${escapeHTML(teacherName)}</h1>

                <div class="content">${escapeHTML(content)}</div>

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


/* HTML GÜVENLİ METİN */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* MÜDÜR MESAJI */

function openPrincipalMessage() {

    if (!currentTeacher) return;

    principalMessage.textContent =
        currentTeacher.principalMessage ||
        "Henüz müdürümüzün mesajı eklenmemiştir.";

    showScreen(finalScreen);

}


/* ATATÜRK MESAJI */

function openAtaturkMessage() {

    showScreen(ataturkScreen);

}


/* MEKTUP EKRANINA DÖNÜŞ */

function returnToLetters() {

    showScreen(letterSection);

    letterListScreen.hidden = false;
    letterListScreen.style.display = "";

    letterDetailScreen.hidden = true;
    letterDetailScreen.style.display = "none";

    letterFooter.style.display = "";

    selectedLetter = null;

}


/* AÇILIŞ EKRANINDAN MEKTUPLARA GEÇİŞ */

function openTeacherLetters() {

    if (!currentTeacher) return;

    displayTeacherName.textContent = currentTeacher.name;

    createLetterCards();

    showScreen(letterSection);

    letterListScreen.hidden = false;
    letterListScreen.style.display = "";

    letterDetailScreen.hidden = true;
    letterDetailScreen.style.display = "none";

    letterFooter.style.display = "";

}


/* BUTONLAR */

continueButton.addEventListener("click", openTeacherLetters);

backButton.addEventListener("click", closeLetter);

saveLetterPdfButton.addEventListener("click", saveLetterAsPDF);

finalButton.addEventListener("click", openPrincipalMessage);

finalBackButton.addEventListener("click", returnToLetters);

ataturkLetterButton.addEventListener("click", openAtaturkMessage);

ataturkBackButton.addEventListener("click", returnToLetters);


/* SAYFA AÇILDIĞINDA */

hideAllScreens();

verifyTeacherAccess();
