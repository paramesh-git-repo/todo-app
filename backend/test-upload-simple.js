const fs = require('fs');
const http = require('http');

// Create a test file
const testContent = 'This is a test file for upload API\nCreated at: ' + new Date().toISOString();
fs.writeFileSync('test-file.txt', testContent);

console.log('Test file created: test-file.txt');
console.log('Testing upload to S3 bucket: todo-app-paramesh');

// Test the upload endpoint
const postData = `--boundary\r
Content-Disposition: form-data; name="file"; filename="test-file.txt"\r
Content-Type: text/plain\r
\r
${testContent}\r
--boundary--\r
`;

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=boundary',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    // Clean up test file
    fs.unlinkSync('test-file.txt');
    console.log('Test file cleaned up');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  // Clean up test file on error
  if (fs.existsSync('test-file.txt')) {
    fs.unlinkSync('test-file.txt');
  }
});

req.write(postData);
req.end();
