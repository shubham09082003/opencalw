/**
 * AI Job Poster Generator
 * Uses Replicate SDK with openai/gpt-image-1.5 to generate recruitment posters
 * Falls back to template-based generation if AI fails
 */

const fs = require('fs');
const path = require('path');
const { writeFile } = require('fs/promises');
const Replicate = require('replicate');

// Default output directory
const OUTPUT_DIR = process.env.JOB_POSTER_OUTPUT_DIR || path.join(__dirname, 'output');

// Replicate SDK — automatically reads REPLICATE_API_TOKEN from env
const replicate = new Replicate();

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Lazy-load template fallback
let templateModule = null;
function getTemplateModule() {
  if (!templateModule) {
    templateModule = require('./poster-template.js');
  }
  return templateModule;
}

/**
 * Generate AI-based recruitment poster using Replicate (openai/gpt-image-1.5)
 * @param {Object} job - Job details
 * @returns {Promise<Buffer|null>} Generated image buffer
 */
async function generateAIPoster(job) {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.warn('REPLICATE_API_TOKEN not set, cannot generate AI poster');
    return null;
  }

  const prompt = buildAIPrompt(job);
  console.log('Generating AI poster with prompt:\n', prompt);

  try {
    const input = {
      prompt,
      quality: 'high'
    };

    const output = await replicate.run('openai/gpt-image-1.5', { input });

    // output is an array of file-like objects with a .url() method
    const imageUrl = output[0].url();
    console.log('Image generated at URL:', imageUrl);

    // Download the image into a buffer
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    console.log('AI poster downloaded, size:', imageBuffer.length, 'bytes');
    return imageBuffer;

  } catch (error) {
    console.error('AI generation failed:', error.message);
    return null;
  }
}

/**
 * Build a direct instructional prompt for gpt-image-1.5
 * Tells the model exactly what text to render and where
 */
function buildAIPrompt(job) {
  const {
    title = 'Job Opening',
    company = 'Company',
    location = 'Remote',
    type = 'FULL_TIME',
    salary = 'Competitive',
    skills = []
  } = job;

  const typeDisplay = {
    'FULL_TIME': 'Full-time',
    'PART_TIME': 'Part-time',
    'CONTRACT': 'Contract',
    'INTERNSHIP': 'Internship'
  }[type?.toUpperCase()] || type;

  const topSkills = skills.slice(0, 4);

  return (
    `Create a professional job recruitment poster with the following text displayed exactly:\n` +
    `- Top badge: "WE ARE HIRING"\n` +
    `- Company name: "${company}"\n` +
    `- Job title (large, bold): "${title}"\n` +
    `- Location: "${location}"\n` +
    `- Job type: "${typeDisplay}"\n` +
    `- Salary: "${salary}"\n` +
    (topSkills.length ? `- Skills (as tag chips): ${topSkills.map(s => `"${s}"`).join(', ')}\n` : '') +
    `- Bottom CTA button: "Apply Now"\n` +
    `\n` +
    `Design style: dark deep-purple gradient background, glassmorphism white card in the lower half, ` +
    `neon indigo glowing accents, modern sans-serif typography, clean layout, print-ready poster.`
  );
}

/**
 * Generate and save the poster
 * Falls back to template-based generation if AI fails
 * @param {Object} job - Job details
 * @param {string|null} outputPath - Optional custom output path
 * @returns {Promise<Object>} Result with posterPath and metadata
 */
async function generatePoster(job, outputPath = null) {
  const { title = 'Job Opening' } = job;

  if (!outputPath) {
    const timestamp = Date.now();
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 30);
    outputPath = path.join(OUTPUT_DIR, `poster-${slug}-${timestamp}.webp`);
  }

  // Try AI generation first
  if (process.env.REPLICATE_API_TOKEN) {
    console.log('Attempting AI poster generation via Replicate SDK...');
    
    try {
      const imageBuffer = await generateAIPoster(job);

      if (imageBuffer) {
        // Save image to disk
        await writeFile(outputPath, imageBuffer);

        // Save job metadata
        const jobDataPath = outputPath.replace(/\.(webp|png)$/, '.json');
        await writeFile(jobDataPath, JSON.stringify({
          ...job,
          posterPath: outputPath,
          aiGenerated: true,
          model: 'openai/gpt-image-1.5',
          createdAt: new Date().toISOString()
        }, null, 2));

        console.log('AI poster saved to:', outputPath);

        return {
          posterPath: outputPath,
          jobDataPath,
          job,
          aiGenerated: true,
          model: 'openai/gpt-image-1.5'
        };
      }
    } catch (error) {
      console.log('AI generation failed, falling back to template:', error.message);
    }
  } else {
    console.log('REPLICATE_API_TOKEN not set, using template fallback');
  }

  // Fallback to template-based generation
  console.log('Using template-based poster generation...');
  const template = getTemplateModule();
  
  // Template always generates PNG, adjust output path
  const templateOutputPath = outputPath.replace(/\.webp$/, '.png');
  
  const result = await template.generatePoster({ ...job, outputPath: templateOutputPath });
  
  // Copy the result path if we used template's default
  if (!outputPath || outputPath.endsWith('.webp')) {
    // Read the generated file info
    const stats = fs.statSync(result.posterPath);
    console.log('Template poster saved:', result.posterPath, `(${stats.size} bytes)`);
  }
  
  return result;
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage:');
    console.error('  node poster.js <job-json> [output-path]');
    console.error('  node poster.js --test \'{"title":"...","company":"..."}\'');
    console.error('');
    console.error('Example:');
    console.error('  node poster.js \'{"title":"Full Stack Developer","company":"Excellence Technologies","location":"Noida","type":"FULL_TIME","salary":"3-4 LPA","skills":["React","Node.js"]}\'');
    console.error('');
    console.error('Set REPLICATE_API_TOKEN for AI generation, or it will fallback to template');
    process.exit(1);
  }

  // Test mode — job JSON must be passed dynamically
  if (args[0] === '--test') {
    if (!args[1]) {
      console.error('Usage: node poster.js --test \'{"title":"...","company":"...","location":"..."}\'');
      console.error('Job data must be provided dynamically.');
      process.exit(1);
    }
    const testJob = JSON.parse(args[1]);
    console.log('Testing poster generation with job:', testJob);
    console.log('REPLICATE_API_TOKEN set:', !!process.env.REPLICATE_API_TOKEN);
    const result = await generatePoster(testJob);
    console.log('Result:', JSON.stringify(result, null, 2));
    return;
  }

  const [jobJson, outputPath] = args;
  const job = JSON.parse(jobJson);

  try {
    const result = await generatePoster(job, outputPath || null);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error generating poster:', error.message);
    process.exit(1);
  }
}

module.exports = {
  generatePoster,
  generateAIPoster,
  buildAIPrompt
};

// Run CLI if called directly
if (require.main === module) {
  main();
}