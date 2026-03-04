async function analyze() {

  const jd = document.getElementById("jobDesc").value.toLowerCase();
  const files = document.getElementById("resumeUpload").files;

  let results = [];

  for (let file of files) {

    let text = await extractText(file);
    text = text.toLowerCase();

    let score = calculateScore(jd, text);

    results.push({
      name: file.name,
      score: score
    });
  }

  results.sort((a,b) => b.score - a.score);

  displayResults(results);
}

async function extractText(file) {

  if (file.name.endsWith(".pdf")) {

    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ");
    }

    return text;
  }

  if (file.name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({arrayBuffer: await file.arrayBuffer()});
    return result.value;
  }
}

function calculateScore(jd, resume) {

  let matchCount = 0;
  let totalSkills = 0;

  for (let category in skillDB) {
    skillDB[category].forEach(skill => {
      if (jd.includes(skill)) {
        totalSkills++;
        if (resume.includes(skill)) {
          matchCount++;
        }
      }
    });
  }

  if (totalSkills === 0) return 0;

  return Math.round((matchCount / totalSkills) * 100);
}

function displayResults(results) {

  let html = "<h2>Ranking</h2>";

  results.forEach((r, i) => {
    html += `<p>#${i+1} - ${r.name} → ${r.score}%</p>`;
  });

  document.getElementById("results").innerHTML = html;
}
