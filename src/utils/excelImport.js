import * as XLSX from 'xlsx';
import { assetSchemas } from '../schemas/assetSchemas';

export const importFromExcel = (file, category, callback) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    
    // Map data to the specific schema
    const schema = assetSchemas[category];
    const validKeys = schema.map(s => s.key);
    
    const parsedData = jsonData.map((row, index) => {
      const newRow = { id: Date.now() + index };
      validKeys.forEach(key => {
        newRow[key] = row[key] || "";
      });
      return newRow;
    });

    callback(parsedData);
  };
  
  reader.readAsArrayBuffer(file);
};
