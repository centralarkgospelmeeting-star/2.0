import React, { useState, useEffect } from 'react';
import {
  RadarProduct,
  ElevationTilt,
  WorkstationMode,
  PalettePreset,
  RADAR_SITES,
} from './lib/radar-config';
import { ActivePlacefile, PLACEFILE_NATION_CATALOG } from './lib/placefile-catalog';
import { SoundingProfile, generateThermodynamicSounding } from './lib/skewt-engine';

// Components
import { RadarMap, MapBaseStyle, SpotterPin } from './components/RadarMap';
import { TopPillBar } from './components/TopPillBar';
import { WeatherIntelligenceSidebar } from './components/WeatherIntelligenceSidebar';
import { LayerRackSidebar } from './components/LayerRackSidebar';
import { PlaybackTimelineBar } from './components/PlaybackTimelineBar';
import { SynchronizedQuadView } from './components/SynchronizedQuadView';
import { SkewTSoundingModal } from './components/SkewTSoundingModal';
import { WeatherAssistantModal } from './components/WeatherAssistantModal';
import { ThreatMatrixModal } from './components/ThreatMatrixModal';
import { METARPanel } from './components/METARPanel';
import { MarineAgriModal } from './components/MarineAgriModal';
import { PlacefileManagerModal } from './components/PlacefileManagerModal';
import { PalColorTableModal } from './components/PalColorTableModal';
import { SpotterReportModal } from './components/SpotterReportModal';
import { EmergencyAlertTone } from './components/EmergencyAlertTone';
import { BroadcastToolsOverlay } from './components/BroadcastToolsOverlay';

export default function App() {
  // Navigation & Primary Workstation State
  const [mode, setMode] = useState<WorkstationMode>('Radar');
  const [product, setProduct] = useState<RadarProduct>('ref');
  const [tilt, setTilt] = useState<ElevationTilt>('0.5');
  const [radarSite, setRadarSite] = useState<string>('KLZK');
  const [palette, setPalette] = useState<PalettePreset>('radarscope');
  const [baseStyle, setBaseStyle] = useState<MapBaseStyle>('dark');
  const [fastScan, setFastScan] = useState<boolean>(true);

  // Sidebars (adaptive default: both open on large desktop, clean view on mobile)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1200;
    }
    return true;
  });
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && window.innerWidth < 768) {
        setRightSidebarOpen(false);
      }
      return next;
    });
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen((prev) => {
      const next = !prev;
      if (next && typeof window !== 'undefined' && window.innerWidth < 768) {
        setLeftSidebarOpen(false);
      }
      return next;
    });
  };

  // Overlays
  const [showWarnings, setShowWarnings] = useState<boolean>(true);
  const [showOutlooks, setShowOutlooks] = useState<boolean>(true);
  const [showWatches, setShowWatches] = useState<boolean>(true);
  const [showLightning, setShowLightning] = useState<boolean>(true);
  const [showMetars, setShowMetars] = useState<boolean>(true);
  const [showLSR, setShowLSR] = useState<boolean>(true);
  const [showRadarPills, setShowRadarPills] = useState<boolean>(true);
  const [showSpotters, setShowSpotters] = useState<boolean>(true);

  // Telestrator & Broadcast
  const [isTelestratorActive, setIsTelestratorActive] = useState<boolean>(false);
  const [telestratorColor, setTelestratorColor] = useState<string>('#ef4444');
  const [isBroadcastMode, setIsBroadcastMode] = useState<boolean>(false);

  // Modals
  const [isQuadOpen, setIsQuadOpen] = useState<boolean>(false);
  const [isSoundingOpen, setIsSoundingOpen] = useState<boolean>(false);
  const [currentSounding, setCurrentSounding] = useState<SoundingProfile | null>(null);
  const [isThreatMatrixOpen, setIsThreatMatrixOpen] = useState<boolean>(false);
  const [isWeatherAssistantOpen, setIsWeatherAssistantOpen] = useState<boolean>(false);
  const [isPlacefilesOpen, setIsPlacefilesOpen] = useState<boolean>(false);
  const [isColorTableOpen, setIsColorTableOpen] = useState<boolean>(false);
  const [isMetarOpen, setIsMetarOpen] = useState<boolean>(false);
  const [isMarineAgriOpen, setIsMarineAgriOpen] = useState<boolean>(false);
  const [isSpotterFormOpen, setIsSpotterFormOpen] = useState<boolean>(false);
  const [spotterFormCoords, setSpotterFormCoords] = useState<[number, number]>([-92.262, 34.836]);

  // Placefiles
  const [activePlacefiles, setActivePlacefiles] = useState<ActivePlacefile[]>(
    PLACEFILE_NATION_CATALOG.filter((p) => p.defaultEnabled).map((p) => ({
      id: p.id,
      name: p.name,
      url: p.url,
      category: p.category,
      enabled: true,
    }))
  );

  // Community Spotter Reports
  const [spotterReports, setSpotterReports] = useState<SpotterPin[]>([
    {
      id: 'spot-01',
      hazardType: 'Tornado',
      description: 'Confirmed multi-vortex tornado on ground crossing I-30',
      lat: 34.72,
      lon: -92.42,
      timestamp: '5:42 PM',
      callsign: 'CHASER-AR-01',
    },
    {
      id: 'spot-02',
      hazardType: 'Large Hail',
      hailSize: '2.75" (Baseball)',
      description: 'Vehicle windshield smashed by baseball hail core',
      lat: 34.89,
      lon: -92.15,
      timestamp: '5:51 PM',
      callsign: 'SPOTTER-LZK-14',
    },
  ]);

  // Alerts & Frames
  const [alerts, setAlerts] = useState<any[]>([]);
  const [frames, setFrames] = useState<any[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Fetch active alerts
  useEffect(() => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => setAlerts(data.alerts || []))
      .catch((err) => console.warn('Alerts fetch notice:', err));
  }, []);

  // Fetch radar frames whenever radar site, product, or tilt changes
  useEffect(() => {
    fetch(`/api/nexrad/frames?site=${radarSite}&product=${product}&tilt=${tilt}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.frames && data.frames.length > 0) {
          setFrames(data.frames);
          setCurrentFrameIndex(data.frames.length - 1); // point to live frame
        }
      })
      .catch((err) => console.warn('Radar frames fetch notice:', err));
  }, [radarSite, product, tilt]);

  // Open default sounding for active radar site
  const handleOpenDefaultSounding = () => {
    const site =
      RADAR_SITES.find((s) => s.id === radarSite || s.radarId === radarSite) ||
      RADAR_SITES[0];
    const sounding = generateThermodynamicSounding(site.lat, site.lon);
    setCurrentSounding(sounding);
    setIsSoundingOpen(true);
  };

  const handleOpenSoundingProfile = (profile: SoundingProfile) => {
    setCurrentSounding(profile);
    setIsSoundingOpen(true);
  };

  const handleOpenSpotterForm = (coords: [number, number]) => {
    setSpotterFormCoords(coords);
    setIsSpotterFormOpen(true);
  };

  const handleAddSpotterReport = (report: SpotterPin) => {
    setSpotterReports((prev) => [report, ...prev]);
  };

  const activeFrame = frames[currentFrameIndex];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#070b13] text-slate-100 font-sans select-none">
      {/* 1. Top Emergency Alert Banner & 1050 Hz Siren Chime */}
      <EmergencyAlertTone alerts={alerts} />

      {/* 2. Top WeatherWise Pro Floating Pill Bar */}
      <TopPillBar
        mode={mode}
        setMode={setMode}
        radarSite={radarSite}
        setRadarSite={setRadarSite}
        fastScan={fastScan}
        setFastScan={setFastScan}
        onOpenQuad={() => setIsQuadOpen(true)}
        onOpenSounding={handleOpenDefaultSounding}
        onOpenThreatMatrix={() => setIsThreatMatrixOpen(true)}
        onOpenWeatherAssistant={() => setIsWeatherAssistantOpen(true)}
        onOpenPlacefiles={() => setIsPlacefilesOpen(true)}
        onOpenMetar={() => setIsMetarOpen(true)}
        onOpenMarineAgri={() => setIsMarineAgriOpen(true)}
        isTelestratorActive={isTelestratorActive}
        setIsTelestratorActive={setIsTelestratorActive}
        isBroadcastMode={isBroadcastMode}
        setIsBroadcastMode={setIsBroadcastMode}
        leftSidebarOpen={leftSidebarOpen}
        onToggleLeftSidebar={toggleLeftSidebar}
        rightSidebarOpen={rightSidebarOpen}
        onToggleRightSidebar={toggleRightSidebar}
        alertsCount={alerts.length}
      />

      {/* 3. Main Radar Map Viewport */}
      <main className="absolute inset-0">
        <RadarMap
          product={product}
          radarSite={radarSite}
          tilt={tilt}
          palette={palette}
          baseStyle={baseStyle}
          activeFrameUrl={activeFrame?.tileUrl}
          fastScan={fastScan}
          showWarnings={showWarnings}
          showOutlooks={showOutlooks}
          showWatches={showWatches}
          showLightning={showLightning}
          showMetars={showMetars}
          showLSR={showLSR}
          showRadarPills={showRadarPills}
          showSpotters={showSpotters}
          spotterReports={spotterReports}
          isTelestratorActive={isTelestratorActive}
          telestratorColor={telestratorColor}
          onSelectSite={(siteId) => setRadarSite(siteId)}
          onOpenSounding={handleOpenSoundingProfile}
          onOpenSpotterForm={handleOpenSpotterForm}
        />
      </main>

      {/* 4. Left Weather Intelligence Sidebar (Collapsible) */}
      <WeatherIntelligenceSidebar
        isOpen={leftSidebarOpen}
        onToggle={toggleLeftSidebar}
        radarSite={radarSite}
        alerts={alerts}
        onSelectWarning={(w) => {
          // Centering or selecting warning
          console.log('Selected warning:', w);
        }}
      />

      {/* 5. Right Workstation Layer Rack Sidebar (Collapsible) */}
      <LayerRackSidebar
        isOpen={rightSidebarOpen}
        onToggle={toggleRightSidebar}
        product={product}
        setProduct={setProduct}
        tilt={tilt}
        setTilt={setTilt}
        palette={palette}
        setPalette={setPalette}
        baseStyle={baseStyle}
        setBaseStyle={setBaseStyle}
        showWarnings={showWarnings}
        setShowWarnings={setShowWarnings}
        showOutlooks={showOutlooks}
        setShowOutlooks={setShowOutlooks}
        showWatches={showWatches}
        setShowWatches={setShowWatches}
        showLightning={showLightning}
        setShowLightning={setShowLightning}
        showMetars={showMetars}
        setShowMetars={setShowMetars}
        showLSR={showLSR}
        setShowLSR={setShowLSR}
        showRadarPills={showRadarPills}
        setShowRadarPills={setShowRadarPills}
        showSpotters={showSpotters}
        setShowSpotters={setShowSpotters}
        onOpenColorPaletteModal={() => setIsColorTableOpen(true)}
      />

      {/* 6. Bottom Floating Playback & Timeline Scrubber */}
      <PlaybackTimelineBar
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        setCurrentFrameIndex={setCurrentFrameIndex}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />

      {/* 7. Broadcast Studio Mode & Telestrator Controls */}
      <BroadcastToolsOverlay
        isBroadcastMode={isBroadcastMode}
        setIsBroadcastMode={setIsBroadcastMode}
        isTelestratorActive={isTelestratorActive}
        setIsTelestratorActive={setIsTelestratorActive}
        telestratorColor={telestratorColor}
        setTelestratorColor={setTelestratorColor}
        radarSite={radarSite}
      />

      {/* 8. Modals & Overlay Workstations */}
      {isQuadOpen && (
        <SynchronizedQuadView radarSite={radarSite} onClose={() => setIsQuadOpen(false)} />
      )}

      {isSoundingOpen && currentSounding && (
        <SkewTSoundingModal sounding={currentSounding} onClose={() => setIsSoundingOpen(false)} />
      )}

      {isWeatherAssistantOpen && (
        <WeatherAssistantModal
          radarSite={radarSite}
          product={product}
          alerts={alerts}
          onClose={() => setIsWeatherAssistantOpen(false)}
        />
      )}

      {isThreatMatrixOpen && (
        <ThreatMatrixModal onClose={() => setIsThreatMatrixOpen(false)} />
      )}

      {isMetarOpen && (
        <METARPanel onClose={() => setIsMetarOpen(false)} />
      )}

      {isMarineAgriOpen && (
        <MarineAgriModal onClose={() => setIsMarineAgriOpen(false)} />
      )}

      {isPlacefilesOpen && (
        <PlacefileManagerModal
          activePlacefiles={activePlacefiles}
          setActivePlacefiles={setActivePlacefiles}
          onClose={() => setIsPlacefilesOpen(false)}
        />
      )}

      {isColorTableOpen && (
        <PalColorTableModal
          onClose={() => setIsColorTableOpen(false)}
          onApplyPalette={(palName) => setPalette(palName as PalettePreset)}
        />
      )}

      {isSpotterFormOpen && (
        <SpotterReportModal
          currentCoords={spotterFormCoords}
          onClose={() => setIsSpotterFormOpen(false)}
          onSubmit={handleAddSpotterReport}
        />
      )}
    </div>
  );
}
