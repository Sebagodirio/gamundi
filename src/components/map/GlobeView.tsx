import { useRef } from "react";
import { ActivityIndicator, Dimensions, Pressable, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { UnlockResult } from "../../types";

const { width } = Dimensions.get("window");
const GLOBE_SIZE = Math.min(width - 32, 340);

// ISO 3166-1 alpha-2 → numeric mapping (used by world-atlas topojson)
const ALPHA2_TO_NUMERIC: Record<string, number> = {
  AF: 4, AL: 8, DZ: 12, AO: 24, AR: 32, AU: 36, AT: 40, AZ: 31,
  BS: 44, BH: 48, BD: 50, BE: 56, BJ: 204, BT: 64, BO: 68, BA: 70,
  BW: 72, BR: 76, BN: 96, BG: 100, BF: 854, BI: 108, KH: 116, CM: 120,
  CA: 124, CV: 132, CF: 140, TD: 148, CL: 152, CN: 156, CO: 170, KM: 174,
  CG: 178, CD: 180, CR: 188, HR: 191, CU: 192, CY: 196, CZ: 203, DK: 208,
  DJ: 262, DO: 214, EC: 218, EG: 818, SV: 222, GQ: 226, ER: 232, EE: 233,
  SZ: 748, ET: 231, FJ: 242, FI: 246, FR: 250, GA: 266, GM: 270, GE: 268,
  DE: 276, GH: 288, GR: 300, GT: 320, GN: 324, GW: 624, GY: 328, HT: 332,
  HN: 340, HU: 348, IS: 352, IN: 356, ID: 360, IR: 364, IQ: 368, IE: 372,
  IL: 376, IT: 380, JM: 388, JP: 392, JO: 400, KZ: 398, KE: 404, KI: 296,
  KP: 408, KR: 410, KW: 414, KG: 417, LA: 418, LV: 428, LB: 422, LS: 426,
  LR: 430, LY: 434, LI: 438, LT: 440, LU: 442, MG: 450, MW: 454, MY: 458,
  MV: 462, ML: 466, MT: 470, MH: 584, MR: 478, MU: 480, MX: 484, FM: 583,
  MD: 498, MC: 492, MN: 496, ME: 499, MA: 504, MZ: 508, MM: 104, NA: 516,
  NR: 520, NP: 524, NL: 528, NZ: 554, NI: 558, NE: 562, NG: 566, NO: 578,
  OM: 512, PK: 586, PW: 585, PS: 275, PA: 591, PG: 598, PY: 600, PE: 604,
  PH: 608, PL: 616, PT: 620, QA: 634, RO: 642, RU: 643, RW: 646, KN: 659,
  LC: 662, VC: 670, WS: 882, ST: 678, SA: 682, SN: 686, RS: 688, SC: 690,
  SL: 694, SG: 702, SK: 703, SI: 705, SB: 90, SO: 706, ZA: 710, SS: 728,
  ES: 724, LK: 144, SD: 729, SR: 740, SE: 752, CH: 756, SY: 760, TW: 158,
  TJ: 762, TZ: 834, TH: 764, TL: 626, TG: 768, TO: 776, TT: 780, TN: 788,
  TR: 792, TM: 795, TV: 798, UG: 800, UA: 804, AE: 784, GB: 826, US: 840,
  UY: 858, UZ: 860, VU: 548, VE: 862, VN: 704, YE: 887, ZM: 894, ZW: 716,
};

function buildGlobeHtml(unlockedCodes: string[], size: number): string {
  const unlockedNumeric = unlockedCodes
    .map((c) => ALPHA2_TO_NUMERIC[c])
    .filter(Boolean);

  // Viewport width is pinned to the actual pixel size so window.innerWidth === size
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=${size}, initial-scale=1, user-scalable=no"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: #0f172a; }
  canvas { position: absolute; top: 0; left: 0; }
</style>
</head>
<body>
<canvas id="g"></canvas>
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>
<script>
(function() {
  const UNLOCKED = new Set(${JSON.stringify(unlockedNumeric)});
  const SIZE = ${size};
  const DPR = Math.min(devicePixelRatio || 1, 2);

  const canvas = document.getElementById('g');
  canvas.width  = SIZE * DPR;
  canvas.height = SIZE * DPR;
  canvas.style.width  = SIZE + 'px';
  canvas.style.height = SIZE + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  const R = SIZE / 2 - 1;
  const cx = SIZE / 2, cy = SIZE / 2;

  const projection = d3.geoOrthographic()
    .scale(R)
    .translate([cx, cy])
    .clipAngle(90)
    .precision(0.3);

  const path = d3.geoPath(projection, ctx);
  const sphere   = { type: 'Sphere' };
  const graticule = d3.geoGraticule()();

  let countries = null, borders = null;
  let rotate = [20, -30, 0];   // [lambda, phi, gamma]
  let dragging = false;
  let lastX = 0, lastY = 0;
  let autoRotate = true;
  let resumeTimer = null;

  // ── Render ──────────────────────────────────────────────────────────────
  function render() {
    projection.rotate(rotate);
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Ocean fill
    ctx.beginPath(); path(sphere);
    ctx.fillStyle = '#0f172a'; ctx.fill();

    // Graticule lines
    ctx.beginPath(); path(graticule);
    ctx.strokeStyle = 'rgba(99,102,241,0.10)';
    ctx.lineWidth = 0.4; ctx.stroke();

    if (countries) {
      // Country fills
      for (const f of countries) {
        ctx.beginPath(); path(f);
        ctx.fillStyle = UNLOCKED.has(+f.id) ? '#7c3aed' : '#1e293b';
        ctx.fill();
      }
      // Internal borders
      ctx.beginPath(); path(borders);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.3; ctx.stroke();
    }

    // Outer ring
    ctx.beginPath(); path(sphere);
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 1.5; ctx.stroke();
  }

  // ── Animation loop ───────────────────────────────────────────────────────
  let lastTs = 0;
  function frame(ts) {
    if (autoRotate && !dragging) {
      rotate[0] += (ts - lastTs) * 0.013;
      render();
    }
    lastTs = ts;
    requestAnimationFrame(frame);
  }

  // ── Drag handlers (pixel-delta, attached to document) ───────────────────
  function getXY(e) {
    const src = e.touches ? e.touches[0] : e;
    return [src.clientX, src.clientY];
  }

  function onStart(e) {
    e.preventDefault();
    dragging = true;
    autoRotate = false;
    if (resumeTimer) clearTimeout(resumeTimer);
    [lastX, lastY] = getXY(e);
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const [x, y] = getXY(e);
    rotate[0] += (x - lastX) * 0.35;
    rotate[1]  = Math.max(-85, Math.min(85, rotate[1] - (y - lastY) * 0.35));
    lastX = x; lastY = y;
    render();
  }

  function onEnd() {
    dragging = false;
    resumeTimer = setTimeout(() => { autoRotate = true; }, 2500);
  }

  // touchstart on canvas (needs passive:false to allow preventDefault)
  canvas.addEventListener('touchstart', onStart, { passive: false });
  canvas.addEventListener('mousedown', onStart);
  // move/end on document so dragging outside the element works
  document.addEventListener('touchmove',  onMove,  { passive: false });
  document.addEventListener('touchend',   onEnd);
  document.addEventListener('mousemove',  onMove);
  document.addEventListener('mouseup',    onEnd);

  // ── Country tap ──────────────────────────────────────────────────────────
  canvas.addEventListener('click', function(e) {
    if (!countries) return;
    const coords = projection.invert([e.clientX, e.clientY]);
    if (!coords) return;
    for (const f of countries) {
      if (d3.geoContains(f, coords)) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'country_tap', numericId: +f.id, visited: UNLOCKED.has(+f.id)
          }));
        }
        break;
      }
    }
  });

  // ── Load world data then start ───────────────────────────────────────────
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(w => {
      countries = topojson.feature(w, w.objects.countries).features;
      borders   = topojson.mesh(w, w.objects.countries, (a, b) => a !== b);
    })
    .catch(() => {})
    .finally(() => { render(); requestAnimationFrame(frame); });
})();
</script>
</body>
</html>`;
}

interface GlobeViewProps {
  unlockedCount: number;
  totalChallenges: number;
  unlockedCountryCodes: string[];
  onScanPress: () => Promise<UnlockResult[]>;
  onManualPress: () => void;
  recentUnlocks: UnlockResult[];
  isScanning: boolean;
  lastScanEmpty: boolean;
}

export function GlobeView({
  unlockedCount,
  totalChallenges,
  unlockedCountryCodes,
  onScanPress,
  onManualPress,
  recentUnlocks,
  isScanning,
  lastScanEmpty,
}: GlobeViewProps) {
  const percentage =
    totalChallenges > 0 ? Math.round((unlockedCount / totalChallenges) * 100) : 0;

  const htmlContent = buildGlobeHtml(unlockedCountryCodes, GLOBE_SIZE);
  const webviewRef = useRef(null);

  return (
    <View className="flex-1">
      {/* Globe — circular clip; the d3 canvas draws its own purple ring */}
      <View
        style={{
          width: GLOBE_SIZE,
          height: GLOBE_SIZE,
          alignSelf: "center",
          marginTop: 8,
          borderRadius: GLOBE_SIZE / 2,
          overflow: "hidden",
        }}
      >
        <WebView
          ref={webviewRef}
          source={{ html: htmlContent }}
          style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, backgroundColor: "#0f172a" }}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled
          originWhitelist={["*"]}
          allowsInlineMediaPlayback
          renderLoading={() => (
            <View
              style={{ width: GLOBE_SIZE, height: GLOBE_SIZE }}
              className="items-center justify-center bg-brand-surface"
            >
              <ActivityIndicator color="#7c3aed" />
            </View>
          )}
          startInLoadingState
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === "country_tap") {
                // Future: show country detail sheet
              }
            } catch {}
          }}
        />
      </View>

      {/* Stats row */}
      <View className="flex-row justify-center gap-10 mt-5 mb-4">
        <View className="items-center">
          <Text className="text-white font-bold text-2xl">{unlockedCount}</Text>
          <Text className="text-brand-muted text-xs">Unlocked</Text>
        </View>
        <View className="items-center">
          <Text className="text-brand-primary font-bold text-2xl">{percentage}%</Text>
          <Text className="text-brand-muted text-xs">Explored</Text>
        </View>
        <View className="items-center">
          <Text className="text-white font-bold text-2xl">{totalChallenges}</Text>
          <Text className="text-brand-muted text-xs">Total</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row px-6 gap-3">
        <Pressable
          onPress={onScanPress}
          disabled={isScanning}
          className="flex-1 bg-brand-primary py-4 rounded-2xl items-center active:opacity-80"
          style={{ opacity: isScanning ? 0.6 : 1 }}
        >
          <Text className="text-white font-bold text-sm">
            {isScanning ? "⏳ Scanning…" : "📍 Scan GPS"}
          </Text>
        </Pressable>
        <Pressable
          onPress={onManualPress}
          disabled={isScanning}
          className="flex-1 bg-brand-surface border border-brand-border py-4 rounded-2xl items-center active:opacity-80"
          style={{ opacity: isScanning ? 0.6 : 1 }}
        >
          <Text className="text-white font-bold text-sm">✈️ Log Manually</Text>
        </Pressable>
      </View>

      {/* Scan feedback */}
      {lastScanEmpty && recentUnlocks.length === 0 && (
        <View className="mt-4 mx-6 bg-brand-surface border border-brand-border rounded-xl px-4 py-3">
          <Text className="text-brand-muted text-sm text-center">
            🗺️ No new locations found. Try another country or get closer to a wonder.
          </Text>
        </View>
      )}

      {/* Recent unlocks */}
      {recentUnlocks.length > 0 && (
        <View className="mt-4 px-6">
          {recentUnlocks.map((r, i) => {
            if (!r.success) return null;
            const isContinent = r.type === "CONTINENT";
            return (
              <View
                key={i}
                className={`border rounded-xl px-4 py-3 mb-2 ${
                  isContinent
                    ? "bg-yellow-500/20 border-yellow-400/50"
                    : "bg-brand-accent/20 border-brand-accent/50"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    isContinent ? "text-yellow-400" : "text-brand-accent"
                  }`}
                >
                  {isContinent ? "🌍 Continent unlocked!" : "🎉 Achievement unlocked!"}
                  {r.title ? ` ${r.title}` : ""} +{r.points_earned} pts
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
