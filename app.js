const express = require('express');
const path = require('path');
const app = express();

// Middleware များ
app.use(express.static('public'));
app.use(express.json());

// Server နားထောင်မည့် Port
const PORT = process.env.PORT || 3000;

// Home Page (index.html) ကို ခေါ်ယူခြင်း
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Odds တွက်ချက်သည့် Function
function getZeroMarginOdds(o1, o2) {
    if (o1 === o2) return [2.000, 2.000];
    const p1 = 1 / o1;
    const p2 = 1 / o2;
    const totalP = p1 + p2;
    return [1 / (p1 / totalP), 1 / (p2 / totalP)];
}

// မြန်မာပေါက်ကြေး တွက်ချက်သည့် Function
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
        final