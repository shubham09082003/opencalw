/**
 * LinkedIn UGC Poster - Using legacy UGC Posts API
 */

const axios = require('axios');
const fs = require('fs');

const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;

async function postToLinkedIn(imagePath, caption) {
  // Step 1: Get user URN
  const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
  });
  const personUrn = `urn:li:person:${profileRes.data.sub}`;
  console.log('User URN:', personUrn);

  // Step 2: Register upload
  const registerRes = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      registerUploadRequest: {
        owner: personUrn,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }]
      }
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const uploadUrl = registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const assetUrn = registerRes.data.value.asset;
  console.log('Upload URL obtained');
  console.log('Asset URN:', assetUrn);

  // Step 3: Upload image
  const imageBuffer = fs.readFileSync(imagePath);
  await axios.post(uploadUrl, imageBuffer, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'image/png'
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });
  console.log('Image uploaded');

  // Step 4: Wait for processing
  console.log('Waiting for image processing...');
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const assetId = assetUrn.split(':').pop();
      const assetRes = await axios.get(`https://api.linkedin.com/v2/assets/${assetId}`, {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
      });
      const status = assetRes.data?.recipes?.[0]?.status || assetRes.data?.status;
      console.log(`Check ${i + 1}:`, status);
      if (status === 'ALLOWED' || status?.code === 'ALLOWED') {
        console.log('Image ready!');
        break;
      }
    } catch (e) {
      console.log('Check error:', e.message);
    }
  }

  // Step 5: Create UGC Post
  const ugcPost = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: caption },
        shareMediaCategory: 'IMAGE',
        media: [{
          status: 'READY',
          description: { text: caption.substring(0, 200) },
          media: assetUrn,
          title: { text: 'Job Opening' }
        }]
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  console.log('Creating post...');
  const postRes = await axios.post('https://api.linkedin.com/v2/ugcPosts', ugcPost, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    }
  });

  const postId = postRes.headers['x-restli-id'] || postRes.data.id;
  const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

  console.log('Post created!');
  console.log('Post ID:', postId);
  console.log('Post URL:', postUrl);

  return { success: true, postId, postUrl };
}

// Run
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node linkedin-ugc.js <image-path> <caption>');
  process.exit(1);
}

postToLinkedIn(args[0], args[1]).catch(e => {
  console.error('Error:', e.response?.data || e.message);
  process.exit(1);
});