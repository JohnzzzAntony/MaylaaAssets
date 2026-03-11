import * as XLSX from 'xlsx';

/**
 * Exports all assets into a single Excel file.
 * Each Entity gets its own sheet.
 * Inside each sheet, assets are grouped/ordered by Category.
 * @param {Array} allAssets - Array of asset objects from /api/assets/all 
 */
export const exportAllToExcel = (allAssets) => {
    if (!allAssets || allAssets.length === 0) {
        alert("No data available to export.");
        return;
    }

    // Group assets by Entity
    const assetsByEntity = allAssets.reduce((acc, asset) => {
        const entity = asset.Entity || 'Unassigned';
        if (!acc[entity]) acc[entity] = [];
        acc[entity].push(asset);
        return acc;
    }, {});

    // Create a new Workbook
    const wb = XLSX.utils.book_new();

    // Create a Summary Sheet
    const summaryData = Object.keys(assetsByEntity).map(entity => ({
        Entity: entity,
        'Total Assets': assetsByEntity[entity].length,
        'Categories': [...new Set(assetsByEntity[entity].map(a => a.category))].join(', ')
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "OVERVIEW");

    // For each Entity, create a Sheet
    Object.keys(assetsByEntity).forEach(entityName => {
        const entityAssets = assetsByEntity[entityName];
        
        // Sort assets by Category then by first column key if possible
        const sortedAssets = entityAssets.sort((a, b) => {
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            return 0;
        });

        // Flatten objects for Excel (remove system fields like id, is_deleted)
        const excelData = sortedAssets.map(asset => {
            const { id, is_deleted, ...displayData } = asset;
            return displayData;
        });

        // Create Worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Add Worksheet to Workbook
        XLSX.utils.book_append_sheet(wb, ws, entityName.substring(0, 31)); // sheet names limited to 31 chars
    });

    // Generate filename with timestamp
    const date = new Date().toISOString().split('T')[0];
    const filename = `Asset_Snapshot_Global_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
};
