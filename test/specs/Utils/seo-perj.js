/* eslint-disable no-template-curly-in-string */
/* eslint-disable prettier/prettier */
const axios = require('axios');
const fs = require('fs');
const percentile = require('percentile');

const psiApi = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const perfScoreMultiplier = 100;
const clsScoreMultiplier = 10;
const perc = 95;

let hitError = false;
if (!process.env.BASE_URL) {
  console.error('Missing BASE_URL parameter');
  hitError = true;
}
if (!process.env.TEST_URL_FILE) {
  console.error('Missing TEST_URL_FILE parameter');
  hitError = true;
}
if (!process.env.KEY) {
  console.error('Missing KEY parameter');
  hitError = true;
}
if (hitError) {
  return;
}

const baseUrl = process.env.BASE_URL;
const testUrlFile = require(process.env.TEST_URL_FILE);
const key = process.env.KEY;
const urlCount = process.env.COUNT || 3;

console.log('Running SEO Performance test for:', baseUrl);

const round10 = (num) => Math.round(num * 10) / 10;

const computePercentiles = (num, sumArray) => {
  return {
    performance: percentile(num, sumArray.map((a) => a.performance)),
    fcp: percentile(num, sumArray.map((a) => a.fcp)),
    fid: percentile(num, sumArray.map((a) => a.fid)),
    lcp: percentile(num, sumArray.map((a) => a.lcp)),
    cls: percentile(num, sumArray.map((a) => a.cls)),
  };
};

const run = (subUrl, mobile = false) => {
  const url = setUpQuery(subUrl, mobile);
  return axios
    .get(url)
    .then((response) => response.data)
    .then((json) => {
      const lighthouse = json.lighthouseResult;
      const results = {
        url: json.id,
        success: true,
        date: new Date().toUTCString(),
        userAgent: lighthouse.userAgent,
        summary: {
          performance: lighthouse.categories.performance.score * perfScoreMultiplier,
          fcp: Number(lighthouse.audits['first-contentful-paint'].numericValue),
          fid: Number(lighthouse.audits['max-potential-fid'].numericValue),
          lcp: Number(lighthouse.audits['largest-contentful-paint'].numericValue),
          cls: Number(lighthouse.audits['cumulative-layout-shift'].numericValue * clsScoreMultiplier),
        },
        audits: lighthouse.audits,
      };
      return results;
    })
    .catch((error) => {
      console.log('ERROR:', error.message);
      return { url: subUrl, success: false, error };
    });
};

const setUpQuery = (subUrl, mobile = false) => {
  const parameters = new URLSearchParams({
    url: baseUrl + subUrl,
    key,
    strategy: mobile ? 'mobile' : 'desktop'
  });

  return `${psiApi}?${parameters.toString()}`;
};

let fullResults = [];
const promises = [];

// prettier-ignore
testUrlFile.slice(0, urlCount).forEach((url) => {
  promises.push(
    run(url).then((results) => {
      fullResults.push({ data: results, mobile: false });
    }),
    run(url, true).then((results) => {
      fullResults.push({ data: results, mobile: true });
    })
  );
});

Promise.all(promises).then(() => {
  fullResults = fullResults.filter((a) => a.data.summary).filter((a) => a.data.summary.performance);

  const desktopAverages = computePercentiles(perc, fullResults.filter((a) => !a.mobile).map((b) => b.data.summary));
  const mobileAverages = computePercentiles(perc, fullResults.filter((a) => a.mobile).map((b) => b.data.summary));

  const htmlOut = `
  <html>
    <h2>Mobile</h2>
    <div>Performance score: ${Math.round(mobileAverages.performance)}</div>
    <div>FCP: ${Math.round(mobileAverages.fcp)}ms</div>
    <div>FID: ${Math.round(mobileAverages.fid)}ms</div>
    <div>LCP: ${Math.round(mobileAverages.lcp)}ms</div>
    <div>CLS: ${round10(mobileAverages.cls)}</div>
    <h2>Desktop</h2>
    <div>Performance score: ${desktopAverages.performance}</div>
    <div>FCP: ${Math.round(desktopAverages.fcp)}ms</div>
    <div>FID: ${Math.round(desktopAverages.fid)}ms</div>
    <div>LCP: ${Math.round(desktopAverages.lcp)}ms</div>
    <div>CLS: ${round10(desktopAverages.cls)}</div>
  </html>
  `;

  fs.writeFile('seo-perf-report/seo-perf.html', htmlOut, 'utf8', () => {});
  fs.writeFile('seo-perf-report/seo-perf.json', JSON.stringify({summary: { mobileAverages, desktopAverages }, fullResults}), 'utf8', () => {});
});