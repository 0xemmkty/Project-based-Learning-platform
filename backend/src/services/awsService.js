const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

const uploadToS3 = async (file, folder = 'general') => {
  const key = `${folder}/${uuidv4()}-${file.originalname}`;
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      url: result.Location,
      key
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Error uploading file to S3');
  }
};

const deleteFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Error deleting file from S3');
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3
}; 