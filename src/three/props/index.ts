import type { ComponentType } from 'react';
import type { PropProps } from './common';
import * as ppe from './ppe';
import * as tools from './tools';
import * as mat from './materials';
import * as site from './site';

/** kind (used in mission JSON) → procedural component */
export const propRegistry: Record<string, ComponentType<PropProps>> = {
  // PPE
  hardhat: ppe.HardHat,
  cap: ppe.BaseballCap,
  'safety-glasses': ppe.SafetyGlasses,
  vest: ppe.Vest,
  gloves: ppe.Gloves,
  boots: ppe.Boots,
  sneakers: ppe.Sneakers,
  // tools
  'lineman-pliers': tools.LinemanPliers,
  'needle-nose': tools.NeedleNose,
  dikes: tools.Dikes,
  strippers: tools.Strippers,
  screwdriver: tools.Screwdriver,
  ncvt: tools.NonContactTester,
  multimeter: tools.Multimeter,
  'tape-measure': tools.TapeMeasure,
  'torpedo-level': tools.TorpedoLevel,
  'fish-tape': tools.FishTape,
  'cable-ripper': tools.CableRipper,
  'utility-knife': tools.UtilityKnife,
  hammer: tools.Hammer,
  'tool-bag': tools.ToolBag,
  drill: tools.Drill,
  // materials
  'nm-roll': mat.NmRoll,
  'thhn-spool': mat.ThhnSpool,
  'box-single-gang': mat.BoxSingleGang,
  'box-4sq': mat.Box4Square,
  carton: mat.Carton,
  breaker: mat.Breaker,
  clipboard: mat.Clipboard,
  'extension-cord': mat.ExtensionCord,
  'zone-pad': mat.ZonePad,
  sign: mat.Sign,
  'wire-piece': mat.WirePiece,
  'nm-cable': mat.NmCable,
  'probe-point': mat.ProbePoint,
  // site
  table: site.FoldingTable,
  workbench: site.Workbench,
  pegboard: site.Pegboard,
  'box-truck': site.BoxTruck,
  pickup: site.Pickup,
  'stud-wall': site.StudWall,
  pallet: site.Pallet,
  cone: site.Cone,
  'porta-john': site.PortaJohn,
  sawhorse: site.Sawhorse,
  shelf: site.Shelf,
  dumpster: site.Dumpster,
  'wood-stack': site.WoodStack,
};
