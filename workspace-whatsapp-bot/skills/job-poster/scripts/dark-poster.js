const sharp = require('sharp');
const path = require('path');

const job = {
  company: 'Excellence Technologies',
  title: 'Full Stack Developer',
  location: 'Noida, Uttar Pradesh',
  type: 'Full-Time',
  experience: '2-4 Years',
  salary: '3-4 LPA',
  skills: ['React.js', 'Node.js', 'MongoDB', 'AWS', 'Docker']
};

const width = 1024;
const height = 1024;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="50%" style="stop-color:#16213e"/>
      <stop offset="100%" style="stop-color:#0f0f23"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(30,30,50,0.95)"/>
      <stop offset="100%" style="stop-color:rgba(20,20,35,0.98)"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="shadow">
      <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
  </defs>
  
  <!-- Dark Background -->
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <!-- Decorative Glow Circles -->
  <circle cx="150" cy="150" r="250" fill="rgba(99,102,241,0.08)" filter="url(#glow)"/>
  <circle cx="900" cy="900" r="300" fill="rgba(139,92,246,0.06)" filter="url(#glow)"/>
  <circle cx="800" cy="200" r="180" fill="rgba(99,102,241,0.04)"/>
  
  <!-- Main Card -->
  <rect x="50" y="50" width="924" height="924" fill="url(#card)" rx="24" filter="url(#shadow)" stroke="rgba(99,102,241,0.2)" stroke-width="1"/>
  
  <!-- Top Accent Line -->
  <rect x="50" y="50" width="924" height="5" fill="url(#accent)" rx="24"/>
  
  <!-- Content -->
  <g transform="translate(90, 100)">
    
    <!-- WE ARE HIRING Badge -->
    <rect x="0" y="0" width="200" height="48" fill="url(#accent)" rx="24"/>
    <text x="100" y="32" font-family="Arial, sans-serif" font-size="15" fill="white" font-weight="bold" text-anchor="middle">WE ARE HIRING</text>
    
    <!-- Company -->
    <text x="0" y="100" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af" font-weight="500">${job.company}</text>
    <text x="0" y="125" font-family="Arial, sans-serif" font-size="13" fill="#6b7280">Information Technology</text>
    
    <!-- Job Title -->
    <text x="0" y="200" font-family="Arial, sans-serif" font-size="52" fill="white" font-weight="bold">Full Stack</text>
    <text x="0" y="260" font-family="Arial, sans-serif" font-size="52" fill="white" font-weight="bold">Developer</text>
    
    <!-- Details Row -->
    <g transform="translate(0, 310)">
      <rect x="0" y="0" width="270" height="42" fill="rgba(99,102,241,0.15)" rx="21" stroke="rgba(99,102,241,0.3)" stroke-width="1"/>
      <text x="18" y="28" font-family="Arial, sans-serif" font-size="14" fill="#a5b4fc">📍 ${job.location}</text>
      
      <rect x="290" y="0" width="145" height="42" fill="rgba(139,92,246,0.15)" rx="21" stroke="rgba(139,92,246,0.3)" stroke-width="1"/>
      <text x="308" y="28" font-family="Arial, sans-serif" font-size="14" fill="#c4b5fd">💼 ${job.type}</text>
      
      <rect x="455" y="0" width="155" height="42" fill="rgba(245,158,11,0.15)" rx="21" stroke="rgba(245,158,11,0.3)" stroke-width="1"/>
      <text x="473" y="28" font-family="Arial, sans-serif" font-size="14" fill="#fcd34d">👤 ${job.experience}</text>
    </g>
    
    <!-- Salary -->
    <rect x="0" y="380" width="190" height="52" fill="rgba(16,185,129,0.15)" rx="26" stroke="rgba(16,185,129,0.4)" stroke-width="1"/>
    <text x="22" y="414" font-family="Arial, sans-serif" font-size="20" fill="#34d399" font-weight="bold">💰 ${job.salary}</text>
    
    <!-- Skills Section -->
    <text x="0" y="490" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" font-weight="600">KEY SKILLS</text>
    
    <g transform="translate(0, 510)">
      <rect x="0" y="0" width="170" height="44" fill="rgba(59,130,246,0.12)" rx="10" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>
      <text x="15" y="30" font-family="Arial, sans-serif" font-size="18">⚛️</text>
      <text x="42" y="30" font-family="Arial, sans-serif" font-size="14" fill="#e2e8f0">React.js</text>
      
      <rect x="185" y="0" width="170" height="44" fill="rgba(34,197,94,0.12)" rx="10" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>
      <text x="200" y="30" font-family="Arial, sans-serif" font-size="18">⬢</text>
      <text x="227" y="30" font-family="Arial, sans-serif" font-size="14" fill="#e2e8f0">Node.js</text>
      
      <rect x="370" y="0" width="170" height="44" fill="rgba(34,197,94,0.12)" rx="10" stroke="rgba(34,197,94,0.3)" stroke-width="1"/>
      <text x="385" y="30" font-family="Arial, sans-serif" font-size="18">🍃</text>
      <text x="412" y="30" font-family="Arial, sans-serif" font-size="14" fill="#e2e8f0">MongoDB</text>
      
      <rect x="555" y="0" width="170" height="44" fill="rgba(249,115,22,0.12)" rx="10" stroke="rgba(249,115,22,0.3)" stroke-width="1"/>
      <text x="570" y="30" font-family="Arial, sans-serif" font-size="18">☁️</text>
      <text x="597" y="30" font-family="Arial, sans-serif" font-size="14" fill="#e2e8f0">AWS</text>
      
      <rect x="740" y="0" width="170" height="44" fill="rgba(59,130,246,0.12)" rx="10" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>
      <text x="755" y="30" font-family="Arial, sans-serif" font-size="18">🐳</text>
      <text x="782" y="30" font-family="Arial, sans-serif" font-size="14" fill="#e2e8f0">Docker</text>
    </g>
    
    <!-- Apply Button -->
    <rect x="0" y="620" width="280" height="58" fill="url(#accent)" rx="29" filter="url(#glow)"/>
    <text x="140" y="658" font-family="Arial, sans-serif" font-size="20" fill="white" font-weight="bold" text-anchor="middle">Apply Now →</text>
    
    <!-- Footer -->
    <text x="380" y="750" font-family="Arial, sans-serif" font-size="13" fill="#4b5563" text-anchor="middle">${job.company} • Excellence in Technology</text>
    <text x="380" y="775" font-family="Arial, sans-serif" font-size="12" fill="#374151" text-anchor="middle">careers@excellencetech.com</text>
    
  </g>
</svg>
`;

const outputPath = path.join(__dirname, 'output', `poster-${Date.now()}.png`);

sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log(JSON.stringify({ success: true, posterPath: outputPath, job }, null, 2));
  })
  .catch(e => console.error('Error:', e));