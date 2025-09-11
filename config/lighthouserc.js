module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run serve',
      url: [
        'http://localhost:8080/',
        'http://localhost:8080/weeks/week-01.html',
        'http://localhost:8080/weeks/week-02.html'
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--disable-gpu --no-sandbox --disable-dev-shm-usage',
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        // Specific performance metrics for physics calculations
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 500 }],
        // Animation and interaction metrics
        'interactive': ['error', { maxNumericValue: 3000 }],
        'speed-index': ['error', { maxNumericValue: 3000 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}