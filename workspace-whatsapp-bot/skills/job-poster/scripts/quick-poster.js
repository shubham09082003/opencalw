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
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f093fb"/>
      <stop offset="100%" style="stop-color:#f5576c"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
  </defs>
  
  <!-- Gradient Background -->
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <!-- Decorative shapes -->
  <circle cx="900" cy="100" r="150" fill="rgba(255,255,255,0.1)"/>
  <circle cx="100" cy="900" r="200" fill="rgba(255,255,255,0.08)"/>
  
  <!-- Main Content Card -->
  <rect x="60" y="60" width="904" height="904" fill="white" rx="20" filter="url(#shadow)"/>
  
  <!-- Top accent bar -->
  <rect x="60" y="60" width="904" height="8" fill="url(#accent)" rx="20"/>
  
  <!-- Content -->
  <g transform="translate(100, 100)">
    
    <!-- WE ARE HIRING Badge -->
    <rect x="0" y="0" width="220" height="50" fill="url(#accent)" rx="25"/>
    <text x="110" y="34" font-family="Arial, sans-serif" font-size="16" fill="white" font-weight="bold" text-anchor="middle">WE ARE HIRING</text>
    
    <!-- Company -->
    <text x="0" y="110" font-family="Arial, sans-serif" font-size="22" fill="#6b7280" font-weight="500">Excellence Technologies</text>
    
    <!-- Job Title - Large -->
    <text x="0" y="200" font-family="Arial, sans-serif" font-size="58" fill="#1f2937" font-weight="bold">Full Stack</text>
    <text x="0" y="270" font-family="Arial, sans-serif" font-size="58" fill="#1f2937" font-weight="bold">Developer</text>
    
    <!-- Details Pills -->
    <g transform="translate(0, 320)">
      <rect x="0" y="0" width="260" height="42" fill="#f3f4f6" rx="21"/>
      <text x="20" y="28" font-family="Arial, sans-serif" font-size="15" fill="#374151">📍 ${job.location}</text>
    </g>
    
    <g transform="translate(280, 320)">
      <rect x="0" y="0" width="140" height="42" fill="#f3f4f6" rx="21"/>
      <text x="18" y="28" font-family="Arial, sans-serif" font-size="15" fill="#374151">💼 ${job.type}</text>
    </g>
    
    <g transform="translate(440, 320)">
      <rect x="0" y="0" width="150" height="42" fill="#f3f4f6" rx="21"/>
      <text x="18" y="28" font-family="Arial, sans-serif" font-size="15" fill="#374151">👤 ${job.experience}</text>
    </g>
    
    <!-- Salary Box -->
    <rect x="0" y="400" width="200" height="50" fill="#ecfdf5" rx="25" stroke="#10b981" stroke-width="2"/>
    <text x="25" y="433" font-family="Arial, sans-serif" font-size="18" fill="#059669" font-weight="bold">💰 ${job.salary}</text>
    
    <!-- Skills -->
    <text x="0" y="510" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" font-weight="600">KEY SKILLS</text>
    
    <g transform="translate(0, 530)">
      ${job.skills.map((skill, i) => {
        const icons = {'React.js': '⚛️', 'Node.js': '⬢', 'MongoDB': '🍃', 'AWS': '☁️', 'Docker': '🐳'};
        const colors = ['#3b82f6', '#22c55e', '#22c55e', '#f97316', '#3b82f6'];
        const xPos = (i % 3) * 270;
        const yPos = Math.floor(i / 3) * 55;
        return `
          <rect x="${xPos}" y="${yPos}" width="250" height="45" fill="#f9fafb" rx="10" stroke="${colors[i]}" stroke-width="1"/>
          <text x="${xPos + 15}" y="${yPos + 32}" font-family="Arial, sans-serif" font-size="18">${icons[skill] || '⚡'}</text>
          <text x="${xPos + 45}" y="${yPos + 30}" font-family="Arial, sans-serif" font-size="14" fill="#374151" font-weight="500">${skill}</text>
        `;
      }).join('')}
    </g>
    
    <!-- Apply Button -->
    <rect x="0" y="680" width="280" height="60" fill="url(#bg)" rx="30"/>
    <text x="140" y="720" font-family="Arial, sans-serif" font-size="22" fill="white" font-weight="bold" text-anchor="middle">Apply Now →</text>
    
    <!-- Footer -->
    <text x="0" y="790" font-family="Arial, sans-serif" font-size="14" fill="#9ca3b">careers@excellencetech.com | www.excellencetech.com</text>
    
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