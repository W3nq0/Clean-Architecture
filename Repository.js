const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const xlsx = require('xlsx');

async function getNcaStreets(xmlLink, region, district, city) {
    try {
        const response = await axios.get(xmlLink, {
            headers: {
                'Referer': 'https://gzk.nca.by/'
            }
        });

        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);
        const streets = result.response && result.response.street ? result.response.street : [];
        return streets.map(street => ({
            id: street.$.id,
            name: street._,
            region: region,
            district: district,
            city: city
        }));
    } catch (error) {
        throw new Error('Не удалось получить данные из API NCA');
    }
}

async function getLinksForRequest() {
    try {
        const jsonData = fs.readFileSync('jest2.json', 'utf8');
        const data = JSON.parse(jsonData);

        let allStreets = [];

        for (const entry of data) {
            const xmlLink = entry.link;
            const region = entry.region;
            const district = entry.district;
            const city = entry.city;
            const streetNames = await getNcaStreets(xmlLink, region, district, city);

            allStreets = allStreets.concat(streetNames);
            console.log('\n');
        }

        return allStreets;
    } catch (error) {
        throw new Error('Ошибка при получении адресов:', error.message);
    }
}

function getOldExcel() {
    const filePath = 'AdressesExcel.xlsx'; 
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: ["id", "name", "region", "district", "city"]});
        return data;
    } catch (error) {
        throw new Error('Ошибка при чтении Excel файла');
    }
}

module.exports = { getLinksForRequest, getOldExcel };


