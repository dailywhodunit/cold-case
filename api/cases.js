// /api/cases.js — Vercel serverless function
// Returns a sorted list of all dated case files in the /cases folder
// by reading the GitHub Contents API. Zero maintenance required.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  try {
    const owner  = process.env.GITHUB_OWNER  || 'dailywhodunit';
    const repo   = process.env.GITHUB_REPO   || 'cold-case';
    const branch = process.env.GITHUB_BRANCH || 'main';

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/cases?ref=${branch}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DailyWhodunit/1.0',
        ...(process.env.GITHUB_TOKEN
          ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
          : {})
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}`);
    }

    const files = await response.json();

    // Only YYYY-MM-DD.json files, newest first
    const dates = files
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f.name))
      .map(f => f.name.replace('.json', ''))
      .sort((a, b) => b.localeCompare(a));

    res.status(200).json(dates);

  } catch (err) {
    console.error('cases API error:', err.message);
    res.status(200).json([]); // graceful fallback
  }
}
