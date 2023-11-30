const path = require('path');

const multer = require('multer');
const MulterAzureStorage = require('multer-azure-blob-storage').MulterAzureStorage;

const getBlobName = (req, file) => {
    const ext = path.extname(file.originalname);
    console.log(path.basename(file.originalname, ext));
    const blobName = path.basename(file.originalname, ext) + Date.now() + ext; // 파일명과 확장자 분리 후 현재시각을 붙임
    console.log(blobName);
    return path.basename(file.originalname, ext) + Date.now() + ext; // 파일명과 확장자 분리 후 현재시각을 붙임
};

const azureStorage = new MulterAzureStorage({
    connectionString: process.env.CONNECTION_STRING,
    accessKey: process.env.AZURE_KEY,
    accountName: process.env.ACCOUNT_NAME,
    containerName: 'images', 
    blobName: getBlobName,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const upload = multer({
    storage: azureStorage
});

module.exports = upload;