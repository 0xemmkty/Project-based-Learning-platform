const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
require('dotenv').config();

// 验证所有必需的环境变量
const requiredEnvVars = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION?.toLowerCase() || 'us-east-2',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME
};

// 检查是否所有必需的环境变量都存在
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

console.log('AWS Configuration Status:');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '✓ Set' : '✗ Missing'}`);
});

// 创建 S3 客户端
const s3Client = new S3Client({
  region: requiredEnvVars.AWS_REGION,
  credentials: {
    accessKeyId: requiredEnvVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: requiredEnvVars.AWS_SECRET_ACCESS_KEY,
  }
});

const uploadToS3 = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('Invalid file object');
    }

    console.log('Uploading file:', {
      fileName: file.originalname,
      contentType: file.mimetype,
      bucket: requiredEnvVars.AWS_S3_BUCKET_NAME,
      size: file.size
    });

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: requiredEnvVars.AWS_S3_BUCKET_NAME,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      }
    });
    
    const result = await upload.done();
    return result;

  } catch (error) {
    console.error('S3 upload error details:', {
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack
    });
    throw new Error('Error uploading file to S3');
  }
};

module.exports = {
  uploadToS3
};