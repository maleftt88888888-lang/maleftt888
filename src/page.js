export function getPageHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
  <title>iOS Location Spoofer</title>
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    :root {
      --bg: #0a0c11; --card: #12161d; --card2: #191e28; --line: #242b38;
      --cyan: #17c3cf; --txt: #eef2f8; --muted: #8a93a5; --red: #ff5b60;
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: -apple-system, system-ui, "SF Pro", "Helvetica Neue", sans-serif;
      color: var(--txt); background: var(--bg);
      padding: 20px; max-width: 800px; margin: 0 auto;
    }
    h1 { font-size: 20px; margin-bottom: 15px; color: var(--cyan); text-align: center; }
    .box { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    textarea {
      width: 100%; height: 80px; background: var(--card2); border: 1px solid var(--line);
      border-radius: 8px; color: var(--txt); padding: 10px; font-size: 14px; resize: none; outline: none;
    }
    textarea:focus { border-color: var(--cyan); }
    .btns { display: flex; gap: 10px; margin-top: 10px; }
    button {
      flex: 1; padding: 10px; border: none; border-radius: 8px; background: var(--cyan);
      color: #000; font-weight: bold; cursor: pointer; transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
    button.clear { background: var(--card2); color: var(--muted); border: 1px solid var(--line); flex: 0.3; }
    .result-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .result-item span { color: var(--muted); }
    .result-val { font-weight: bold; font-family: monospace; }
    #map { height: 300px; border-radius: 8px; border: 1px solid var(--line); margin-top: 10px; }
    .error { color: var(--red); font-size: 14px; margin-top: 8px; display: none; }
  </style>
</head>
<body>

  <h1>iOS Location Spoofer</h1>

  <div class="box">
    <textarea id="input" placeholder="粘贴高德/苹果/百度/谷歌地图链接或纯坐标..."></textarea>
    <div class="btns">
      <button onclick="doParse()">解析坐标</button>
      <button class="clear" onclick="clearAll()">清空</button>
    </div>
    <div id="error" class="error"></div>
  </div>

  <div class="box" id="resultBox" style="display:none;">
    <div class="result-item"><span>地点名称:</span><div class="result-val" id="resName">-</div></div>
    <div class="result-item"><span>WGS84 纬度 (Lat):</span><div class="result-val" id="resLat">-</div></div>
    <div class="result-item"><span>WGS84 经度 (Lon):</span><div class="result-val" id="resLon">-</div></div>
    <div class="btns" style="margin-top:12px;">
      <button onclick="copyCoords()">复制经纬度 (Lat,Lon)</button>
    </div>
    <div id="map"></div>
  </div>

  <script>
    let map, marker;

    function initMap(lat, lon) {
      if (!map) {
        map = L.map('map').setView([lat, lon], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map);
      } else {
        map.setView([lat, lon], 15);
        marker.setLatLng([lat, lon]);
      }
      setTimeout(() => map.invalidateSize(), 200);
    }

    async function doParse() {
      const text = document.getElementById('input').value.trim();
      const errEl = document.getElementById('error');
      const resBox = document.getElementById('resultBox');
      
      errEl.style.display = 'none';
      if (!text) {
        errEl.innerText = '请输入有效内容';
        errEl.style.display = 'block';
        return;
      }

      try {
        const res = await fetch('/api/parse?format=json&u=' + encodeURIComponent(text));
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        document.getElementById('resName').innerText = data.name || '(未知地点)';
        document.getElementById('resLat').innerText = data.lat;
        document.getElementById('resLon').innerText = data.lon;
        
        resBox.style.display = 'block';
        initMap(data.lat, data.lon);

      } catch (err) {
        errEl.innerText = err.message || '解析失败';
        errEl.style.display = 'block';
        resBox.style.display = 'none';
      }
    }

    function copyCoords() {
      const lat = document.getElementById('resLat').innerText;
      const lon = document.getElementById('resLon').innerText;
      navigator.clipboard.writeText(\`\${lat},\${lon}\`);
      alert('已复制: ' + lat + ',' + lon);
    }

    function clearAll() {
      document.getElementById('input').value = '';
      document.getElementById('resultBox').style.display = 'none';
      document.getElementById('error').style.display = 'none';
    }
  </script>
</body>
</html>`;
}
