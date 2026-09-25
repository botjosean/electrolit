import { useEffect } from 'react';
import { GlossaryScreen } from './components/GlossaryScreen';
import { ObjectViewer } from './components/ObjectViewer';
import { MainMenu } from './components/MainMenu';
import { MissionScreen } from './components/MissionScreen';
import { ModuleScreen } from './components/ModuleScreen';
import { useRoute } from './components/router';
import { TermCard } from './components/hud/TermCard';
import { installDebugHook } from './engine/debug';
import { useSettings } from './engine/store';

export default function App() {
  const route = useRoute();
  const lang = useSettings((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => installDebugHook(), []);
  return (
    <>
      {route.name === 'menu' ? <MainMenu /> : null}
      {route.name === 'module' ? <ModuleScreen id={route.id} /> : null}
      {route.name === 'mission' ? <MissionScreen key={route.id} id={route.id} /> : null}
      {route.name === 'glossary' ? <GlossaryScreen /> : null}
      <TermCard />
      <ObjectViewer />
    </>
  );
}
