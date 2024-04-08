const xlsx = require('xlsx');
const fs = require('fs');
const repository = require('./Repository');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

class Street {
    constructor() { }

    async getStreets() {
        try {
            const streetsData = await repository.getOldExcel();

            if (streetsData && streetsData.length > 0) {
                console.log('Адреса успешно получены');
                return streetsData;
            } else {
                throw new Error('Не удалось получить адреса');
            }
        } catch (error) {
            console.error('Ошибка при получении адресов:', error.message);
            throw new Error('Ошибка при получении адресов');
        }
    }

    async getDiff() {
        try {
            const streetsData = await repository.getLinksForRequest();
            console.log('Данные из API NCA:', streetsData);
    
            const oldExcelData = await repository.getOldExcel();
            console.log('Данные из Excel:', oldExcelData);
    
            const formattedOldExcelData = oldExcelData.map(row => ({
                id: row.id,
                name: row.name,
                region: row.region,
                district: row.district,
                city: row.city
            }));
    
            const difference = streetsData.filter(newItem => {
                return !formattedOldExcelData.some(oldItem => {
                    return oldItem.id === newItem.id &&
                           oldItem.name === newItem.name &&
                           oldItem.region === newItem.region &&
                           oldItem.district === newItem.district &&
                           oldItem.city === newItem.city;
                });
            });
    
            if (difference.length === 0) {
                console.log('Ничего не изменилось.');
                return null;
            }
    
            const jsonString = JSON.stringify(streetsData, null, 2);
            await writeFileAsync('mergedData.json', jsonString);
    
            const differenceJsonString = JSON.stringify(difference, null, 2);
            await writeFileAsync('difference.json', differenceJsonString);
    
            console.log('Данные успешно сохранены в файл mergedData.json');
            console.log('Разница сохранена в файл difference.json');
    
            const workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.json_to_sheet(difference);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Difference Data');
            xlsx.writeFile(workbook, 'difference.xlsx');
    
            console.log('Разница сохранена в файл difference.xlsx');
    
            return difference;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    }
    
    async GeneratorExcel() {
        try {
            const mergedData = require('../mergedData.json');
            const differences = require('../difference.json');
            
            const mergedWorkbook = xlsx.utils.book_new();
            const mergedWorksheet = xlsx.utils.json_to_sheet(mergedData);
            xlsx.utils.book_append_sheet(mergedWorkbook, mergedWorksheet, "Merged Data");
            
            const mergedFileName = '123.xlsx';
            xlsx.writeFile(mergedWorkbook, mergedFileName);
    
            console.log(`Файл Excel с объединенными данными успешно создан: ${mergedFileName}`);
            const differenceWorkbook = xlsx.utils.book_new();
            const differenceWorksheet = xlsx.utils.json_to_sheet(differences);
            xlsx.utils.book_append_sheet(differenceWorkbook, differenceWorksheet, "Difference Data");
    
            const diffFileName = "difference.xlsx";
            xlsx.writeFile(differenceWorkbook, diffFileName);
    
            console.log(`Файл Excel с разницей данных успешно создан: ${diffFileName}`);
    
            return { mergedFileName, diffFileName };
        } catch (error) {
            console.error('Ошибка при создании файлов Excel:', error.message);
            throw new Error('Ошибка при создании файлов Excel');
        }
    }
}



module.exports = Street;





