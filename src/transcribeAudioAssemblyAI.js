const axios = require('axios');

async function transcribeAudio(audioUri) {
    try {
        // Step 1: Upload the audio file to AssemblyAI
        const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', null, {
            headers: {
                'authorization': 'YOUR_ASSEMBLYAI_API_KEY',
                'content-type': 'application/json',
                'transfer-encoding': 'chunked',
                'Content-Type': 'audio/wav'
            },
            data: {
                url: audioUri
            }
        });

        const uploadUrl = uploadResponse.data.upload_url;

        // Step 2: Request transcription
        const transcriptResponse = await axios.post('https://api.assemblyai.com/v2/transcript', {
            audio_url: uploadUrl
        }, {
            headers: {
                'authorization': 'YOUR_ASSEMBLYAI_API_KEY',
                'content-type': 'application/json'
            }
        });

        const transcriptId = transcriptResponse.data.id;

        // Step 3: Poll for transcription result
        let transcriptStatus = 'queued';
        let transcriptResult;

        while (transcriptStatus !== 'completed') {
            const resultResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                headers: {
                    'authorization': 'YOUR_ASSEMBLYAI_API_KEY'
                }
            });

            transcriptStatus = resultResponse.data.status;

            if (transcriptStatus === 'completed') {
                transcriptResult = resultResponse.data.text;
            } else if (transcriptStatus === 'failed') {
                throw new Error('Transcription failed');
            } else {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before polling again
            }
        }

        return transcriptResult;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}

module.exports = transcribeAudio;
