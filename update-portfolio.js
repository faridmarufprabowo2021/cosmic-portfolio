/**
 * update-portfolio.js
 * Tool to safely update portfolio profile, experience, projects, and contact data
 * into the 1:1 cosmic portfolio mirror bundle without breaking WebGL or hydration.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'portfolio-data.json');
const HTML_FILE = path.join(__dirname, 'mirror', 'index.html');
const JS_FILE = path.join(__dirname, 'mirror', '_next', 'static', 'chunks', 'app', 'page-b4f6f9b11c8b3e50.js');

function update() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ portfolio-data.json not found!');
    return;
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log('🔄 Updating Cosmic Portfolio with data for:', data.profile.name);

  // 1. Update JS Chunk
  let js = fs.readFileSync(JS_FILE, 'utf8');

  // Replace profile object
  const profileRegex = /name:"[^"]*",headline:"[^"]*",subheadline:"[^"]*",email:"[^"]*",location:"[^"]*",city:"[^"]*",country:"[^"]*",coordinates:"[^"]*",github:"[^"]*",linkedin:"[^"]*"/;
  if (profileRegex.test(js)) {
    js = js.replace(profileRegex,
      `name:${JSON.stringify(data.profile.name)},headline:${JSON.stringify(data.profile.headline)},subheadline:${JSON.stringify(data.profile.subheadline)},email:${JSON.stringify(data.profile.email)},location:${JSON.stringify(data.profile.location)},city:${JSON.stringify(data.profile.city)},country:${JSON.stringify(data.profile.country)},coordinates:${JSON.stringify(data.profile.coordinates)},github:${JSON.stringify(data.profile.github)},linkedin:${JSON.stringify(data.profile.linkedin)}`
    );
    console.log('  ✓ Updated profile meta in JS');
  }

  // Replace experiences array
  const expMatch = js.match(/,i=\[(\{title:[^\]]+(?:\}[^\]]*)*\]),s=\[/);
  if (expMatch) {
    const startIdx = expMatch.index + 3; // right after ',i='
    const endIdx = startIdx + expMatch[1].length;
    js = js.slice(0, startIdx) + JSON.stringify(data.experiences) + js.slice(endIdx);
    console.log('  ✓ Updated experiences list in JS (' + data.experiences.length + ' items)');
  } else {
    // Exact location fallback
    const sStart = js.indexOf(',s=[{slug:');
    if (sStart !== -1) {
      const expStart = js.lastIndexOf(',i=[{title:', sStart);
      if (expStart !== -1) {
        js = js.slice(0, expStart + 3) + JSON.stringify(data.experiences) + js.slice(sStart);
        console.log('  ✓ Updated experiences list in JS (fallback match)');
      }
    }
  }

  // Replace projects array
  const lStart = js.indexOf(',l=[{id:');
  const sStart = js.lastIndexOf(',s=[{slug:', lStart);
  if (sStart !== -1 && lStart !== -1) {
    js = js.slice(0, sStart + 3) + JSON.stringify(data.projects) + js.slice(lStart);
    console.log('  ✓ Updated projects list in JS (' + data.projects.length + ' items)');
  }

  fs.writeFileSync(JS_FILE, js, 'utf8');

  // 2. Update HTML
  let html = fs.readFileSync(HTML_FILE, 'utf8');

  // Title & Headings
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${data.profile.name} — ${data.profile.headline}</title>`);
  html = html.replace(/<h1[^>]*id="hero-heading"[^>]*>[^<]*<\/h1>/, `<h1 id="hero-heading" tabindex="-1" class="sr-only">${data.profile.name}</h1>`);

  // Email link in contact
  html = html.replace(/href="mailto:[^"]*"/, `href="mailto:${data.profile.email}"`);
  html = html.replace(/<span class="contact-value">[^<]*@[^<]*<\/span>/, `<span class="contact-value">${data.profile.email}</span>`);

  // GitHub & LinkedIn links
  if (data.profile.github) {
    html = html.replace(/href="https:\/\/github\.com\/[^"]*"/, `href="${data.profile.github}"`);
  }
  if (data.profile.linkedin) {
    html = html.replace(/href="https:\/\/www\.linkedin\.com\/in\/[^"]*"/, `href="${data.profile.linkedin}"`);
  }

  // Ensure motion-ok is always in HTML
  if (!html.includes('class="__variable_7347c0 __variable_5acc54 motion-ok"')) {
    html = html.replace('class="__variable_7347c0 __variable_5acc54"', 'class="__variable_7347c0 __variable_5acc54 motion-ok"');
  }

  fs.writeFileSync(HTML_FILE, html, 'utf8');
  console.log('  ✓ Updated index.html');

  console.log('\n✨ Berhasil diperbarui 100%! Buka http://localhost:3000 untuk melihat perubahannya.');
}

update();
