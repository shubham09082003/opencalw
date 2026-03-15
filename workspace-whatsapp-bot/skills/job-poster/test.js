const { generatePoster, buildAIPrompt } = require('./scripts/poster.js');

const testJob = {
  title: 'Full Stack Developer',
  company: 'Excellence Technologies',
  location: 'Noida, India',
  type: 'FULL_TIME',
  salary: '3-4 LPA',
  skills: ['JavaScript', 'React.js', 'Node.js', 'MongoDB']
};

console.log('Testing poster generation...');
console.log('REPLICATE_API_TOKEN set:', !!process.env.REPLICATE_API_TOKEN);
console.log('Prompt:', buildAIPrompt(testJob));

generatePoster(testJob)
  .then(result => {
    console.log('Result:', JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });