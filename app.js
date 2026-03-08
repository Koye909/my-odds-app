const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json());

function getZeroMarginOdds(o1, o2) {
    if (o1 === o2) return [2.000, 2.000];
    const p1 = 1 / o1;
    const p2 = 1 / o2;
    const totalP = p1 + p2;
    return [1 / (p1 / totalP), 1 / (p2 / totalP)];
}

function calculateMyanmarUltimate(line, rawO1, rawO2, profitPercent, label) {
    const o1 = parseFloat(rawO1 || 0);
    const o2 = parseFloat(rawO2 || 0);
    const multiplier = (100 - parseFloat(profitPercent)) / 100;
    
    let currentLine = 0;
    if (typeof line === 'string' && line.includes(',')) {
        const parts = line.split(',').map(p => parseFloat(p.trim()));
        currentLine = (parts[0] + parts[1]) / 2;
    } else {
        currentLine = parseFloat(line);
    }

    const [fairO1, fairO2] = getZeroMarginOdds(o1, o2);
    let rawSpread = Math.abs(2 - fairO1) * 100 * multiplier;
    let spread = Math.round(rawSpread / 5) * 5; 
    
    const base = Math.floor(currentLine);
    const dec = currentLine % 1;
    const isFirstHigher = o1 > o2;
    let finalVal = "";

    if (dec === 0.5) {
        finalVal = isFirstHigher ? `${base} - ${100 - spread}` : `${base + 1} + ${100 - spread}`;
    } else if (dec === 0.25) {
        finalVal = isFirstHigher ? `${base} - ${50 - spread}` : `${base} - ${50 + spread}`;
    } else if (dec === 0.75) {
        finalVal = isFirstHigher ? `${base + 1} + ${50 - spread}` : `${base + 1} + ${50 + spread}`;
    } else if (Number.isInteger(currentLine)) {
        finalVal = isFirstHigher ? `${currentLine} - ${spread}` : `${currentLine} + ${spread}`;
    } else {
        finalVal = `${currentLine}`;
    }

    // ဒီနေရာမှာ colon ( : ) ကို ဖြုတ်ပြီး space ပဲ ခြားပေးထားပါတယ်
    return {
        display: `${label} ${finalVal}`, 
        raw: `(Spread: ${rawSpread.toFixed(1)})`
    };
}

app.post('/convert', (req, res) => {
    try {
        const { hdpLine, home, away, goalLine, over, under, profit } = req.body;
        const bodyRes = calculateMyanmarUltimate(hdpLine, home, away, profit, "ဘော်ဒီ");
        const goalRes = calculateMyanmarUltimate(goalLine, over, under, profit, "ဂိုးပေါင်း");
        const fairBody = getZeroMarginOdds(parseFloat(home), parseFloat(away));
        const fairGoal = getZeroMarginOdds(parseFloat(over), parseFloat(under));
        
        res.json({
            body: bodyRes.display,
            bodyRaw: bodyRes.raw,
            goal: goalRes.display,
            goalRaw: goalRes.raw,
            zmBody: `${fairBody[0].toFixed(3)} / ${fairBody[1].toFixed(3)}`,
            zmGoal: `${fairGoal[0].toFixed(3)} / ${fairGoal[1].toFixed(3)}`
        });
    } catch (err) {
        res.status(400).send("Error");
    }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});