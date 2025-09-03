const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Test file upload
async function testUpload() {
  try {
    // Create a test file
    const testContent = 'This is a test file for upload API';
    fs.writeFileSync('test-file.txt', testContent);
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream('test-file.txt'));
    
    // Upload file
    const response = await axios.post('http://localhost:5001/api/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    console.log('Upload successful:', response.data);
    
    // Test listing files
    const filesResponse = await axios.get('http://localhost:5001/api/files');
    console.log('Files in bucket:', filesResponse.data);
    
    // Clean up test file
    fs.unlinkSync('test-file.txt');
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Test the API
testUpload();
