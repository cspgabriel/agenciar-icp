const fs = require('fs');
const path = './src/pages/ICPPublicPage.tsx';

if (!fs.existsSync(path)) {
  console.error("File not found");
  process.exit(1);
}

let c = fs.readFileSync(path, 'utf8');

// The Lock Screen gradients and Tailwind classes
c = c.replace(/bg-blue-600\/20/g, 'bg-rose-600/20');
c = c.replace(/bg-purple-600\/20/g, 'bg-pink-600/20');
c = c.replace(/from-blue-500 to-purple-500/g, 'from-rose-500 to-pink-500');
c = c.replace(/shadow-blue-500/g, 'shadow-rose-500');
c = c.replace(/from-blue-600 to-indigo-600/g, 'from-rose-600 to-pink-600');
c = c.replace(/hover:from-blue-500 hover:to-indigo-500/g, 'hover:from-rose-500 hover:to-pink-500');
c = c.replace(/border-t-blue-500/g, 'border-t-rose-500');
c = c.replace(/bg-blue-500\/10/g, 'bg-rose-500/10');
c = c.replace(/text-blue-400/g, 'text-rose-400');
c = c.replace(/bg-blue-600 hover:bg-blue-500/g, 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500');
c = c.replace(/focus:ring-blue-500/g, 'focus:ring-rose-500');

// Pitch Section Gradient background
c = c.replace(/linear-gradient\(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%\)/g, 'linear-gradient(135deg, #9d174d 0%, #e11d48 50%, #f472b6 100%)');

// Hex colors and RGB values for #864df9 (Purple) -> #e11d48 (Rose)
c = c.replace(/#864df9/gi, '#e11d48');
c = c.replace(/134,77,249/g, '225,29,72');

// Hex colors and RGB values for #3B82F6 (Blue 500) -> #f43f5e (Rose 500)
c = c.replace(/#3B82F6/gi, '#f43f5e');
c = c.replace(/59,130,246/g, '244,63,94');

// Hex colors and RGB values for #1E40AF (Blue 800) -> #be185d (Pink 700)
c = c.replace(/#1E40AF/gi, '#be185d');
c = c.replace(/30,64,175/g, '190,24,93');

// Lighter shades / Off-colors
c = c.replace(/#EFF6FF/gi, '#fff1f2');
c = c.replace(/#f0eaff/gi, '#fff1f2');
c = c.replace(/#f3f0ff/gi, '#ffe4e6');
c = c.replace(/#e0d4ff/gi, '#fecdd3');
c = c.replace(/#4b2a9c/gi, '#9d174d');
c = c.replace(/#4c1d95/gi, '#831843');

fs.writeFileSync(path, c);
console.log('Colors replaced successfully!');
