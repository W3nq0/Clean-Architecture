const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const archiver = require('archiver');
const Street = require('./UseCases');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/getStreets', async (req, res) => {
    try {
        const streetInstance = new Street();
        const streetsData = await streetInstance.getStreets();
        res.json(streetsData);
    } catch (error) {
        console.error('Ошибка:', error.message);
        res.status(500).json({ error: 'Ошибка при получении списка улиц' });
    }
});

app.get('/getDiff', async (req, res) => {
    try {
        const streetInstance = new Street();
        const diffData = await streetInstance.getDiff();
        res.json(diffData);
    } catch (error) {
        console.error('Ошибка:', error.message);
        res.status(500).json({ error: 'Ошибка при получении разницы данных' });
    }
});

app.get('/downloadExcel', async (req, res) => {
    try {
        const streetInstance = new Street();
        const { mergedFileName, diffFileName } = await streetInstance.GeneratorExcel();

        const archive = archiver('zip', {
            zlib: { level: 9 } 
        });

        res.attachment('excel_files.zip');
        archive.pipe(res);

        archive.file(mergedFileName, { name: '123.xlsx' });
        archive.file(diffFileName, { name: 'difference.xlsx' });

        archive.finalize();
    } catch (error) {
        console.error('Ошибка:', error.message);
        res.status(500).json({ error: 'Ошибка при генерации и скачивании файлов Excel' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
