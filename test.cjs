const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.evaluate(async () => {
    const { Peer } = await import('https://esm.sh/peerjs@1.5.5');
    
    // Test 0.peerjs.com
    const peer1 = new Peer({ host: '0.peerjs.com', port: 443, secure: true });
    peer1.on('open', id => console.log('0.peerjs.com OPEN:', id));
    peer1.on('error', err => console.log('0.peerjs.com ERROR:', err.type, err.message));
    
    // Test pingpong.gg
    const peer2 = new Peer({ host: 'pingpong.gg', port: 443, secure: true });
    peer2.on('open', id => console.log('pingpong.gg OPEN:', id));
    peer2.on('error', err => console.log('pingpong.gg ERROR:', err.type, err.message));
  });
  
  page.on('console', msg => console.log(msg.text()));
  await page.waitForTimeout(5000);
  await browser.close();
})();
