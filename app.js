const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// မြန်မာကြေး တွက်ချက်မှု Function
function calculateMyanmarUltimate(line, o1, o2, label) {
    const p1 = parseFloat(o1 || 0); // Home
    const p2 = parseFloat(o2 || 0); // Away
    
    let rawLineValue = (typeof line === 'string' && line.includes(',')) 
        ? line.split(',').map(p => parseFloat(p.trim())).reduce((a, b) => (a + b) / 2) 
        : parseFloat(line || 0);

    let sideLabel = label;
    let sideClass = "";

    // ၁။ Body Line 0 Logic (Odds နည်းသူ အကြိုက်ပေးခြင်း)
    if (label === "ဘော်ဒီ" && rawLineValue === 0) {
        let spread0 = Math.round((Math.abs(2 - p1) + Math.abs(2 - p2)) * 100 / 5) * 5;
        if (p1 < p2) return { text: `ဘော်ဒီ (H) 0 - ${spread0}`, className: "home-green" };
        if (p2 < p1) return { text: `ဘော်ဒီ (A) 0 - ${spread0}`, className: "away-red" };
        return { text: `ဘော်ဒီ 0`, className: "" };
    }

    if (label === "ဘော်ဒီ") {
        if (rawLineValue < 0) { sideLabel = "ဘော်ဒီ (H)"; sideClass = "home-green"; }
        else if (rawLineValue > 0) { sideLabel = "ဘော်ဒီ (A)"; sideClass = "away-red"; }
    }

    let absLine = Math.abs(rawLineValue);
    let base = Math.floor(absLine);
    let dec = Number((absLine % 1).toFixed(2));
    let myanmarBaseValue = 0;
    let initialSign = "-";

    // ၂။ Myanmar Base သတ်မှတ်ခြင်း (.25, .5, .75)
    if (dec === 0.5) { myanmarBaseValue = 100; } 
    else if (dec === 0.25) { myanmarBaseValue = 50; } 
    else if (dec === 0.75) { myanmarBaseValue = 50; base++; initialSign = "+"; }

    if (p1 === p2 || !p1 || !p2) {
        let suffix = (myanmarBaseValue === 0) ? "" : ` ${initialSign} ${myanmarBaseValue}`;
        return { text: `${sideLabel} ${base}${suffix}`, className: sideClass };
    }

    // ၃။ Spread နှင့် Next Level Logic
    let spread = Math.round((Math.abs(2 - p1) + Math.abs(2 - p2)) * 100 / 5) * 5; 
    let finalValue;
    
    if (initialSign === "+") {
        // .75 flow: Odds နည်းသူ (အကြိုက်) က နှုတ်ရမည်
        finalValue = (p1 < p2) ? (myanmarBaseValue - spread) : (myanmarBaseValue + spread);
    } else {
        // အခြား flow: Odds နည်းသူက ပေါင်းရမည်
        finalValue = (p1 < p2) ? (myanmarBaseValue + spread) : (myanmarBaseValue - spread);
    }

    let displayBase = base;
    let displaySign = initialSign;
    let displaySpread = finalValue;

    if (displaySpread > 100) {
        displaySpread = 200 - displaySpread;
        displayBase = (initialSign === "-") ? displayBase + 1 : displayBase; 
        displaySign = (initialSign === "-") ? "+" : "-";
    } else if (displaySpread < 0) {
        displaySpread = Math.abs(displaySpread);
        displaySign = (initialSign === "-") ? "+" : "-";
    }

    let resultText = (displaySpread === 0) ? `${sideLabel} ${displayBase}` : `${sideLabel} ${displayBase} ${displaySign} ${displaySpread}`;
    return { text: resultText, className: sideClass };
}

app.post('/convert', (req, res) => {
    const { hdpLine, home, away, goalLine, over, under } = req.body;
    res.json({ 
        body: calculateMyanmarUltimate(hdpLine, home, away, "ဘော်ဒီ"),
        goal: calculateMyanmarUltimate(goalLine, over, under, "ဂိုးပေါင်း")
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));