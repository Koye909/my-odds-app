const express = require('express');
const path = require('path'); // <--- ဒီစာကြောင်းကို အပေါ်ဆုံးမှာ ထည့်ပါ
const app = express();

app.use(express.static('public'));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ကျန်တဲ့ တွက်ချက်မှုဆိုင်ရာ Code များ (getZeroMarginOdds, calculateMyanmarUltimate)
// ...

// ဒီအပိုင်းလေးကို app.listen ရဲ့ အပေါ်မှာ ထည့်ပေးပါ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/convert', (req, res) => {
    // ... သင်ရေးထားတဲ့ /convert code များ
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));