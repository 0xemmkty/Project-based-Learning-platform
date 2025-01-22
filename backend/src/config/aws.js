// Update your AWS config
const AWS = require('aws-sdk');

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  params: {
    Bucket: process.env.AWS_BUCKET_NAME
  }
};

if (process.env.NODE_ENV === 'production') {
  // Add production-specific configurations
  awsConfig.endpoint = process.env.AWS_ENDPOINT;
}

AWS.config.update(awsConfig);