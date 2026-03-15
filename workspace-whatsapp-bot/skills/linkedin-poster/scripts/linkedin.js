/**
 * LinkedIn Feed Poster
 * Post job posters as LinkedIn feed posts with images
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// LinkedIn API endpoints
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_UPLOAD_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';
const LINKEDIN_POSTS_URL = 'https://api.linkedin.com/v2/posts';
const LINKEDIN_UGCY_URL = 'https://api.linkedin.com/v2/ugcPosts';

// Configuration
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const ORGANIZATION_URN = process.env.LINKEDIN_ORGANIZATION_URN;
const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN; // For personal posts

// Token cache
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Get OAuth 2.0 access token
 * Supports both client credentials (for company posts) and member token
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  // If personal access token is provided, use it
  if (ACCESS_TOKEN) {
    return ACCESS_TOKEN;
  }

  // Otherwise, get from client credentials flow
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET (or LINKEDIN_ACCESS_TOKEN) are required');
  }

  const response = await axios.post(LINKEDIN_TOKEN_URL,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000);

  return cachedToken;
}

/**
 * Register an image upload and get upload URL
 * @param {string} token - Access token
 * @param {string} ownerUrn - Person or organization URN
 * @returns {Promise<Object>} Upload URL and asset URN
 */
async function registerImageUpload(token, ownerUrn) {
  const response = await axios.post(LINKEDIN_UPLOAD_URL,
    {
      registerUploadRequest: {
        owner: ownerUrn,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }]
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const uploadUrl = response.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const assetUrn = response.data.value.asset;

  return { uploadUrl, assetUrn };
}

/**
 * Upload image to LinkedIn
 * @param {string} uploadUrl - Upload URL from registerImageUpload
 * @param {string} imagePath - Path to image file
 * @param {string} token - Access token
 */
async function uploadImage(uploadUrl, imagePath, token) {
  const imageBuffer = fs.readFileSync(imagePath);
  const imageStats = fs.statSync(imagePath);
  
  await axios.post(uploadUrl, imageBuffer, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'image/png',
      'Content-Length': imageStats.size
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });
}

/**
 * Wait for image processing
 * @param {string} assetUrn - Asset URN
 * @param {string} token - Access token
 * @param {number} maxRetries - Maximum retries
 */
async function waitForImageProcessing(assetUrn, token, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/v2/assets/${assetUrn.split(':').pop()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const status = response.data?.status?.code || response.data?.recipes?.[0]?.status;
      if (status === 'READY' || status === 'ALLOWED') {
        return true;
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      // Asset might not be ready yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
}

/**
 * Post an image to LinkedIn feed
 * @param {Object} options - Post options
 * @param {string} options.imagePath - Path to image file
 * @param {string} options.text - Post text/caption
 * @param {string} options.ownerUrn - Person or organization URN (optional)
 * @param {boolean} options.isCompany - Post as company page (default: false, post as person)
 * @returns {Promise<Object>} Post result with URL
 */
async function postImageToLinkedIn({ imagePath, text, ownerUrn, isCompany = false }) {
  const token = await getAccessToken();

  // Validate image exists
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  // Determine owner URN
  let finalOwnerUrn = ownerUrn;
  if (!finalOwnerUrn) {
    if (isCompany && ORGANIZATION_URN) {
      finalOwnerUrn = ORGANIZATION_URN;
    } else {
      // Get current user's URN
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      finalOwnerUrn = `urn:li:person:${profileResponse.data.sub}`;
    }
  }

  console.log(`Posting image to LinkedIn for: ${finalOwnerUrn}`);

  // Step 1: Register upload
  const { uploadUrl, assetUrn } = await registerImageUpload(token, finalOwnerUrn);
  console.log(`Upload URL obtained, asset: ${assetUrn}`);

  // Step 2: Upload image
  await uploadImage(uploadUrl, imagePath, token);
  console.log('Image uploaded');

  // Step 3: Wait for processing
  const isReady = await waitForImageProcessing(assetUrn, token);
  if (!isReady) {
    console.warn('Image processing timeout, proceeding anyway...');
  } else {
    console.log('Image processed');
  }

  // Step 4: Create post with image
  const postData = {
    author: finalOwnerUrn,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    content: {
      media: {
        altText: text.substring(0, 100),
        id: assetUrn
      }
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false
  };

  const response = await axios.post(LINKEDIN_POSTS_URL, postData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    }
  });

  // Extract post ID and construct URL
  const postId = response.data.id || response.headers['x-restli-id']?.split(':').pop();
  const postUrl = postId ? `https://www.linkedin.com/posts/${postId}` : 'Posted successfully';

  return {
    success: true,
    postId,
    postUrl,
    assetUrn,
    ownerUrn: finalOwnerUrn
  };
}

/**
 * Post a simple text post to LinkedIn (no image)
 * @param {Object} options - Post options
 * @param {string} options.text - Post text
 * @param {string} options.ownerUrn - Person or organization URN (optional)
 * @param {boolean} options.isCompany - Post as company page
 * @returns {Promise<Object>} Post result
 */
async function postTextToLinkedIn({ text, ownerUrn, isCompany = false }) {
  const token = await getAccessToken();

  // Determine owner URN
  let finalOwnerUrn = ownerUrn;
  if (!finalOwnerUrn) {
    if (isCompany && ORGANIZATION_URN) {
      finalOwnerUrn = ORGANIZATION_URN;
    } else {
      // Get current user's URN
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      finalOwnerUrn = `urn:li:person:${profileResponse.data.sub}`;
    }
  }

  const postData = {
    author: finalOwnerUrn,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false
  };

  const response = await axios.post(LINKEDIN_POSTS_URL, postData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202501'
    }
  });

  const postId = response.data.id || response.headers['x-restli-id']?.split(':').pop();
  const postUrl = postId ? `https://www.linkedin.com/feed/update/${postId}` : 'Posted successfully';

  return {
    success: true,
    postId,
    postUrl,
    ownerUrn: finalOwnerUrn
  };
}

/**
 * Post a job poster image to LinkedIn with job details as caption
 * @param {Object} job - Job details
 * @param {string} posterPath - Path to generated poster image
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Post result
 */
async function postJobPoster(job, posterPath, options = {}) {
  // Build caption from job details
  const caption = buildJobCaption(job);
  
  return postImageToLinkedIn({
    imagePath: posterPath,
    text: caption,
    ownerUrn: options.ownerUrn,
    isCompany:  false
  });
}

/**
 * Build LinkedIn caption from job details
 * @param {Object} job - Job details
 * @returns {string} Formatted caption
 */
function buildJobCaption(job) {
  const {
    title = 'Job Opening',
    company = '',
    location = '',
    type = '',
    salary = '',
    description = '',
    requirements = '',
    applyUrl = '',
    hashtags = []
  } = job;

  // Employment type display
  const typeDisplay = {
    'FULL_TIME': 'Full-time',
    'PART_TIME': 'Part-time',
    'CONTRACT': 'Contract',
    'INTERNSHIP': 'Internship'
  }[type?.toUpperCase()] || type;

  // Build caption
  let caption = `🚀 We're Hiring! ${title}`;
  
  if (company) caption += ` at ${company}`;
  caption += '\n\n';
  
  if (location) caption += `📍 Location: ${location}\n`;
  if (typeDisplay) caption += `💼 Type: ${typeDisplay}\n`;
  if (salary) caption += `💰 Salary: ${salary}\n`;
  
  caption += '\n';
  
  if (description) {
    const shortDesc = description.length > 200 
      ? description.substring(0, 200) + '...'
      : description;
    caption += `${shortDesc}\n\n`;
  }
  
  if (requirements) {
    const reqList = requirements.split(',').map(r => r.trim()).filter(r => r).slice(0, 5);
    if (reqList.length > 0) {
      caption += '✅ Requirements:\n';
      reqList.forEach(req => {
        caption += `   • ${req}\n`;
      });
      caption += '\n';
    }
  }
  
  if (applyUrl) {
    caption += `👉 Apply here: ${applyUrl}\n\n`;
  }
  
  // Add hashtags
  const defaultHashtags = ['hiring', 'jobopening', 'career', 'jobs'];
  const allHashtags = [...new Set([...hashtags, ...defaultHashtags])];
  caption += allHashtags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ');
  
  return caption;
}

/**
 * Get current user's LinkedIn profile
 * @returns {Promise<Object>} Profile info
 */
async function getCurrentProfile() {
  const token = await getAccessToken();
  
  const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return {
    id: response.data.sub,
    name: response.data.name,
    firstName: response.data.given_name,
    lastName: response.data.family_name,
    email: response.data.email,
    picture: response.data.picture,
    urn: `urn:li:person:${response.data.sub}`
  };
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage:');
    console.error('  node linkedin.js <image-path> --text "Post text" [--company]');
    console.error('  node linkedin.js --text-only "Post text" [--company]');
    console.error('  node linkedin.js --profile');
    process.exit(1);
  }

  // Parse args
  const isTextOnly = args.includes('--text-only');
  const isCompany = args.includes('--company');
  const isProfile = args.includes('--profile');

  if (isProfile) {
    const profile = await getCurrentProfile();
    console.log(JSON.stringify(profile, null, 2));
    return;
  }

  const textIndex = args.indexOf('--text');
  const text = textIndex >= 0 ? args[textIndex + 1] : 'Check out this job opening!';

  try {
    if (isTextOnly) {
      const result = await postTextToLinkedIn({
        text,
        isCompany
      });
      console.log('Text post published!');
      console.log(JSON.stringify(result, null, 2));
    } else {
      const imagePath = args[0];
      const result = await postImageToLinkedIn({
        imagePath,
        text,
        isCompany
      });
      console.log('Image post published!');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Error posting to LinkedIn:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

module.exports = {
  postImageToLinkedIn,
  postTextToLinkedIn,
  postJobPoster,
  buildJobCaption,
  getAccessToken,
  getCurrentProfile
};

// Run CLI if called directly
if (require.main === module) {
  main();
}