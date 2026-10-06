import urllib.request
import re

try:
    req = urllib.request.Request('https://html.duckduckgo.com/html/?q=public+peerjs+server', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    html = urllib.request.urlopen(req).read().decode()
    matches = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
    for m in matches:
        print(re.sub(r'<[^>]+>', '', m).strip())
except Exception as e:
    print(e)
