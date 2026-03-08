const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function calculateMyanmarUltimate(line, o1, o2, label) {
    const p1 = parseFloat(o1 || 0); 
    const p2 = parseFloat(o2 || 0); 
    
    let rawLineValue = (typeof line === 'string' && line.includes(',')) 
        ? line.split(',').map(p => parseFloat(p.trim())).reduce((a, b) => (a + b) / 2) 
        : parseFloat(line || 0);

    // ဘော်ဒီအတွက် Home/Away ခွဲခြားခြင်း Logic
    let sideLabel = label;
    let sideClass = "";
    if (label === "ဘော်ဒီ") {
        if (rawLineValue < 0) {
            sideLabel = "ဘော်ဒီ (H)";
            sideClass = "home-green"; // အိမ်ကွင်း အစိမ်းရောင်
        } else if (rawLineValue > 0) {
            sideLabel = "ဘော်ဒီ (A)";
            sideClass = "away-red"; // အဝေးကွင်း အနီရောင်
        }
    }

    let absLine = Math.abs(rawLineValue);
    let base = Math.floor(absLine);
    let dec = absLine % 1;
    let myanmarBaseValue = 0;
    let initialSign = "-";

    if (dec === 0.5) { myanmarBaseValue = 100; } 
    else if (dec === 0.25) { myanmarBaseValue = 50; } 
    else if (dec === 0.75) { 
        myanmarBaseValue = 50; 
        base = base + 1;
        initialSign = "+";
    }

    // Odds တူလျှင် တိုက်ရိုက်ပြသည်
    if (p1 === p2 || !p1 || !p2) {
        let suffix = (myanmarBaseValue === 0) ? "" : ` ${initialSign} ${myanmarBaseValue}`;
        return { text: `${sideLabel} ${base}${suffix}`, className: sideClass };
    }

    let spread = Math.round((Math.abs(2 - p1) + Math.abs(2 - p2)) * 100 / 5) * 5; 
    let finalValue = (p1 > p2) ? (myanmarBaseValue - spread) : (myanmarBaseValue + spread);

    let displaySign = initialSign;
    let displaySpread = Math.abs(finalValue);
    if (finalValue < 0) { displaySign = (initialSign === "-") ? "+" : "-"; }

    let resultText = (displaySpread === 0) ? `${sideLabel} ${base}` : `${sideLabel} ${base} ${displaySign} ${displaySpread}`;
    return { text: resultText, className: sideClass };
}

app.post('/convert', (req, res) => {
    try {
        const { hdpLine, home, away, goalLine, over, under } = req.body;
        const bodyRes = calculateMyanmarUltimate(hdpLine, home, away, "ဘော်ဒီ");
        const goalRes = calculateMyanmarUltimate(goalLine, over, under, "ဂိုးပေါင်း");
        res.json({ body: bodyRes, goal: goalRes });
    } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));