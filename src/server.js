const express = require('express');
const bodyParser = require('body-parser');
const getRecordings = require('./getRecordings');
const transcribeAudio = require('./transcribeAudio');
const summarizeText = require('./openaiClient');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function processCall(callSid) {
    try {
        const recordings = await getRecordings(callSid);

        for (const recording of recordings) {
            const audioUri = `https://api.twilio.com${recording}.wav`; // Ensure the correct format
            const transcription = await transcribeAudio(audioUri);
            const summary = await summarizeText(transcription);

            console.log('Summary:', summary);
        }
    } catch (error) {
        console.error('Error processing call:', error);
    }
}

app.post('/twilio-webhook', (req, res) => {
    const callSid = req.body.CallSid;

    if (callSid) {
        processCall(callSid);
        res.status(200).send('Webhook received');
    } else {
        res.status(400).send('Missing CallSid');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
