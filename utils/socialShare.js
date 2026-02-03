const axios = require('axios');
const Settings = require('../models/Settings');

// Get settings from database
const getSettings = async () => {
  const settings = await Settings.findOne();
  return settings;
};

// Share to Facebook (requires Facebook Graph API)
const shareToFacebook = async (title, description, url, imageUrl) => {
  try {
    const settings = await getSettings();
    
    if (!settings?.enableSocialSharing || !settings?.facebookPageAccessToken || !settings?.facebookPageId) {
      console.log('Facebook credentials not configured');
      return null;
    }

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${settings.facebookPageId}/feed`,
      {
        message: `${title}\n\n${description}`,
        link: url,
        access_token: settings.facebookPageAccessToken
      }
    );

    return response.data;
  } catch (error) {
    console.error('Facebook share error:', error.response?.data || error.message);
    return null;
  }
};

// Share to Twitter (requires Twitter API v2)
const shareToTwitter = async (title, description, url) => {
  try {
    const settings = await getSettings();
    
    if (!settings?.enableSocialSharing || !settings?.twitterApiKey || !settings?.twitterApiSecret || 
        !settings?.twitterAccessToken || !settings?.twitterAccessSecret) {
      console.log('Twitter credentials not configured');
      return null;
    }

    const OAuth = require('oauth-1.0a');
    const crypto = require('crypto');

    const oauth = OAuth({
      consumer: {
        key: settings.twitterApiKey,
        secret: settings.twitterApiSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });

    const token = {
      key: settings.twitterAccessToken,
      secret: settings.twitterAccessSecret
    };

    const tweetText = `${title}\n\n${description.substring(0, 150)}...\n\n${url}`;

    const request_data = {
      url: 'https://api.twitter.com/2/tweets',
      method: 'POST'
    };

    const response = await axios.post(
      request_data.url,
      { text: tweetText },
      {
        headers: oauth.toHeader(oauth.authorize(request_data, token))
      }
    );

    return response.data;
  } catch (error) {
    console.error('Twitter share error:', error.response?.data || error.message);
    return null;
  }
};

// Share to LinkedIn (requires LinkedIn API)
const shareToLinkedIn = async (title, description, url, imageUrl) => {
  try {
    const settings = await getSettings();
    
    if (!settings?.enableSocialSharing || !settings?.linkedinAccessToken || !settings?.linkedinPersonUrn) {
      console.log('LinkedIn credentials not configured');
      return null;
    }

    const shareData = {
      author: `urn:li:person:${settings.linkedinPersonUrn}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${title}\n\n${description}`
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              originalUrl: url,
              title: {
                text: title
              },
              description: {
                text: description
              }
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      shareData,
      {
        headers: {
          'Authorization': `Bearer ${settings.linkedinAccessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('LinkedIn share error:', error.response?.data || error.message);
    return null;
  }
};

// Main function to share to all platforms
const shareToSocialMedia = async (type, data) => {
  const settings = await getSettings();
  
  if (!settings?.enableSocialSharing) {
    console.log('Social sharing is disabled in settings');
    return { facebook: null, twitter: null, linkedin: null };
  }

  const { title, description, slug, imageUrl } = data;
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  let url;
  if (type === 'job') {
    url = `${baseUrl}/careers/${slug}`;
  } else if (type === 'blog') {
    url = `${baseUrl}/blog/${slug}`;
  }

  const results = {
    facebook: null,
    twitter: null,
    linkedin: null
  };

  // Share to all platforms concurrently
  const [facebookResult, twitterResult, linkedinResult] = await Promise.allSettled([
    shareToFacebook(title, description, url, imageUrl),
    shareToTwitter(title, description, url),
    shareToLinkedIn(title, description, url, imageUrl)
  ]);

  if (facebookResult.status === 'fulfilled') results.facebook = facebookResult.value;
  if (twitterResult.status === 'fulfilled') results.twitter = twitterResult.value;
  if (linkedinResult.status === 'fulfilled') results.linkedin = linkedinResult.value;

  return results;
};

module.exports = {
  shareToFacebook,
  shareToTwitter,
  shareToLinkedIn,
  shareToSocialMedia
};
