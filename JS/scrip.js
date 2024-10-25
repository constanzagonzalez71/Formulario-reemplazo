const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Configuración de Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS = require('./credentials.json'); // Asegúrate de tener tu archivo credentials.json

app.use(cors());
app.use(bodyParser.json());

async function authorize() {
    const { client_secret, client_id, redirect_uris } = CREDENTIALS.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Carga el token
    try {
        const token = require('./token.json');
        oAuth2Client.setCredentials(token);
    } catch (error) {
        console.log('Error loading token:', error);
    }

    return oAuth2Client;
}

app.post('/submit', async (req, res) => {
    const auth = await authorize();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const values = [
        [
            req.body.teacherName,
            req.body.assistantName,
            req.body.principalName,
            req.body.secretaryName,
            req.body.licenseArticle,
            req.body.shift,
            req.body.grade,
            req.body.startDate,
            req.body.endDate,
            req.body.replacementName,
            req.body.dni,
        ],
    ];

    const resource = {
        values,
    };

    sheets.spreadsheets.values.append({
        spreadsheetId: '1O_DjYP17QrleHFY-rJaHgfRJ5s1t4mxid2bMHYgn0z0', // Reemplaza con tu ID de hoja
        range: 'Sheet1!A1', // Cambia según tu hoja
        valueInputOption: 'RAW',
        resource,
    }).then((response) => {
        res.status(200).send('Datos enviados con éxito a Google Sheets.');
    }).catch((error) => {
        console.error('Error al escribir en Google Sheets:', error);
        res.status(500).send('Error al enviar datos a Google Sheets.');
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
