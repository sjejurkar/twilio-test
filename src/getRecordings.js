const client = require('./twilioClient');

async function getRecordings(callSid) {
    try {
        const recordings = await client.recordings.list({ callSid });
        return recordings.map(recording => recording.uri);
    } catch (error) {
        console.error('Error fetching recordings:', error);
        throw error;
    }
}

module.exports = getRecordings;
