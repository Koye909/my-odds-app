const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Home Page လမ်းကြောင်းကို တိတိကျကျ သတ်မှတ်ခြင်း
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ကျန်သော တွက်ချက်မှု Code များ...
function getZeroMarginOdds(o1, o2) {
    if (o1 === o2) return [2.000, 2.000];
    const p1 = 1 / o1; const p2 = 1 / o2;
    const totalP = p1 + p2;
    return [1 / (p1 / totalP), 1 / (p2 / totalP)];
}

function calculateMyanmarUltimate(line, rawO1, rawO2, profitPercent, label) {
    const o1 = parseFloat(rawO1 || 0);
    const o2 = parseFloat(rawO2 || 0);
    const multiplier = (100 - parseFloat(profitPercent)) / 100;
    let currentLine = (typeof line === 'string' && line.includes(',')) ? line.split(',').map(p => parseFloat(p.trim())).reduce((a, b) => (a + b) / 2) : parseFloat(line);
    const [fairO1, fairO2] = getZeroMarginOdds(o1, o2);
    let rawSpread = Math.abs(2 - fairO1) * 100 * multiplier;
    let spread = Math.round(rawSpread / 5) * 5; 
    const base = Math.floor(currentLine);
    const dec = currentLine % 1;
    const isFirstHigher = o1 > o2;
    let finalVal = (dec === 0.5) ? (isFirstHigher ? `${base} - ${100 - spread}` : `${base + 1} + ${100 - spread}`) : (dec === 0.25) ? (isFirstHigher ? `${base} - ${50 - spread}` : `${base} - ${50 + spread}`) : (dec === 0.75) ? (isFirstHigher ? `${base + 1} + ${50 - spread}` : `${base + 1} + ${50 + spread}`) : (Number.isInteger(currentLine)) ? (isFirstHigher ? `${currentLine} - ${spread}` : `${currentLine} + ${spread}`) : `${currentLine}`;
    return { display: `${label} ${finalVal}`, raw: `(Spread: ${rawSpread.toFixed(1)})` };
}

app.post('/convert', (req, res) => {
    try {
        const { hdpLine, home, away, goalLine, over, under, profit } = req.body;
        const bodyRes = calculateMyanmarUltimate(hdpLine, home, away, profit, "ဘော်ဒီ");
        const goalRes = calculateMyanmarUltimate(goalLine, over, under, profit, "ဂိုးပေါင်း");
        res.json({
            body: bodyRes.display, bodyRaw: bodyRes.raw,
            goal: goalRes.display, goalRaw: goalRes.raw,
            zmBody: getZeroMarginOdds(parseFloat(home), parseFloat(away)).map(n => n.toFixed(3)).join(' / '),
            zmGoal: getZeroMarginOdds(parseFloat(over), parseFloat(under)).map(n => n.toFixed(3)).join(' / ')
        });
    } catch (err) { res.status(500).send("Server Calculation Error"); }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));