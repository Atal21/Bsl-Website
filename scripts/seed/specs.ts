// Starter spec tables transcribed from the catalogue. Used ONLY by `npm run seed`.
import type { SpecTableData } from "../../lib/specs";

export const hydraulicScissorSpecs: SpecTableData = {
  title: "Hydraulic Scissor Lift – Model Chart",
  columns: [
    "Model",
    "Load Capacity (kg)",
    "Lifting Height H2 (mm)",
    "Rated Height H1 (mm)",
    "Min. Height H1 (mm)",
    "Platform L × B (mm)",
    "Motor (kW)",
  ],
  groups: [
    {
      label: "Single Scissor",
      rows: [
        ["BSLS 1-1.6", 1000, 1600, 2050, 450, "2500 × 2000", 2.2],
        ["BSLS 2-1.6", 2000, 1600, 2050, 450, "2500 × 2000", 3.7],
        ["BSLS 3-1.6", 3000, 1600, 2100, 500, "2500 × 2000", 3.7],
        ["BSLS 4-1.8", 4000, 1800, 2400, 600, "3000 × 2000", 7.5],
        ["BSLS 5-2.2", 5000, 2200, 2800, 600, "4000 × 2000", 5.5],
        ["BSLS 5-3", 5000, 3000, 3650, 650, "5000 × 2000", 5.5],
        ["BSLS 6-3", 6000, 3000, 3650, 650, "5000 × 2000", 7.5],
        ["BSLS 8-2.5", 8000, 2500, 3200, 700, "4000 × 2000", 7.5],
        ["BSLS 10-1.7", 10000, 1700, 2300, 600, "5500 × 2500", 7.5],
      ],
    },
    {
      label: "Double Scissor",
      rows: [
        ["BSLS 1-2.5", 1000, 2500, 3150, 650, "2000 × 2000", 2.2],
        ["BSLS 2-3", 2000, 3000, 3700, 700, "2500 × 2000", 3.7],
        ["BSLS 3-3.5", 3000, 3500, 4200, 700, "3000 × 2000", 3.7],
        ["BSLS 4-4.5", 4000, 4500, 5300, 800, "4500 × 2000", 5.5],
        ["BSLS 4-5.5", 4000, 5500, 6400, 900, "5000 × 2000", 5.5],
        ["BSLS 5-6.5", 5000, 6500, 7500, 1000, "6000 × 2000", 7.5],
      ],
    },
    {
      label: "Three Scissor",
      rows: [
        ["BSLS 1-3.6", 1000, 3600, 4400, 800, "2000 × 2000", 3.7],
        ["BSLS 2-3.6", 2000, 3600, 4500, 900, "2000 × 2000", 3.7],
        ["BSLS 2.5-3.6", 2500, 3600, 4600, 1000, "2000 × 2000", 5.5],
        ["BSLS 1-5.5", 1000, 5500, 6500, 1000, "3000 × 2000", 3.7],
        ["BSLS 2-5.5", 2000, 5500, 6700, 1200, "3000 × 2000", 5.5],
        ["BSLS 2-7.5", 2000, 7500, 8700, 1200, "4000 × 2000", 5.5],
        ["BSLS 3-7.5", 3000, 7500, 8700, 1200, "4000 × 2000", 7.5],
        ["BSLS 3-9", 3000, 9000, 10200, 1200, "5000 × 2500", 7.5],
        ["BSLS 3.5-10.5", 3500, 10500, 11700, 1200, "5500 × 2500", 7.5],
      ],
    },
    {
      label: "Four Scissor",
      rows: [
        ["BSLS 1-4.5", 1000, 4500, 5700, 1200, "2000 × 2000", 3.7],
        ["BSLS 1.5-5", 1500, 5000, 6400, 1400, "2500 × 2000", 5.5],
        ["BSLS 2-6.5", 2000, 6500, 8000, 1500, "3000 × 2000", 5.5],
        ["BSLS 1-6", 1000, 6000, 7200, 1200, "3000 × 2500", 5.5],
        ["BSLS 1.5-6", 1500, 8000, 9500, 1500, "3500 × 2000", 5.5],
        ["BSLS 1-9.5", 1000, 9500, 10700, 1200, "4000 × 2000", 5.5],
      ],
    },
    {
      label: "Five Scissor",
      rows: [
        ["BSLS .5-1.2", 500, 13200, 12000, 1200, "4000 × 2000", 3.7],
        ["BSLS 1.1.3", 1000, 13400, 12500, 1400, "4000 × 2000", 5.5],
        ["BSLS 1.1.3", 1500, 13400, 12500, 1400, "5000 × 2500", 5.5],
      ],
    },
  ],
  note: "Standard models shown. Platform size, height, capacity and power supply can be customised to your requirement.",
};

export const mobileScissorSpecs: SpecTableData = {
  title: "Mobile Scissor Lift – Model Chart",
  columns: [
    "Model",
    "Load Capacity (kg)",
    "Max. Height H1 (mm)",
    "Min. Height H1 (mm)",
    "Platform L × B (mm)",
    "Elevating Speed (mm/s)",
    "Self Weight (kg)",
  ],
  groups: [
    {
      rows: [
        ["BSL 0.3-6", 300, 6000, 1250, "2000 × 1200", "60-70", 1100],
        ["BSL 0.5-6", 500, 6000, 1300, "2000 × 1200", "60-70", 1250],
        ["BSL 1-6", 1000, 6000, 1450, "2000 × 1200", "60-70", 1600],
        ["BSL 0.3-9", 300, 9000, 1650, "2000 × 1200", "60-70", 1850],
        ["BSL 0.5-9", 500, 9000, 1700, "2000 × 1200", "60-70", 2050],
        ["BSL 1-9", 1000, 9000, 1500, "2500 × 1200", "60-70", 2250],
        ["BSL 0.3-11", 300, 11000, 1650, "2500 × 1200", "60-70", 2800],
        ["BSL 0.5-11", 500, 11000, 1650, "2500 × 1200", "60-70", 3000],
        ["BSL 0.3-12", 300, 12000, 1650, "2600 × 1200", "60-70", 3000],
        ["BSL 0.5-12", 500, 12000, 1650, "2600 × 1200", "60-70", 3200],
        ["BSL 0.3-14", 300, 14000, 1850, "2800 × 1200", "60-70", 3400],
        ["BSL 0.5-14", 500, 14000, 1850, "2800 × 1200", "60-70", 3600],
      ],
    },
  ],
  note: "Available with single-phase 220 V, three-phase 380 V AC or DC (12–60 V) power options.",
};

export const aerialSingleSpecs: SpecTableData = {
  title: "Single Mast Aerial Platform – Model Chart",
  columns: [
    "Model",
    "Load Capacity (kg)",
    "Max. Platform Height (m)",
    "Max. Working Height (m)",
    "Platform L × B (m)",
    "Motor (kW)",
    "Power Supply",
    "Overall Dimension (m)",
    "Self Weight (kg)",
  ],
  groups: [
    {
      rows: [
        ["BSL-WP-4", 150, 4, 5.7, "0.63 × 0.64", 0.75, "AC 220/50 Hz", "1.42 × 0.84 × 1.92", 385],
        ["BSL-WP-6", 150, 6, 7.7, "0.63 × 0.64", 0.75, "AC 220/50 Hz", "1.42 × 0.84 × 1.92", 415],
        ["BSL-WP-8", 150, 8, 9.7, "0.63 × 0.64", 0.75, "AC 220/50 Hz", "1.42 × 0.84 × 1.92", 450],
        ["BSL-WP-9", 125, 9, 10.7, "0.63 × 0.64", 0.75, "AC 220/50 Hz", "1.42 × 0.84 × 1.92", 490],
        ["BSL-WP-10", 125, 10, 11.7, "0.63 × 0.64", 0.75, "AC 220/50 Hz", "1.42 × 0.84 × 1.92", 490],
      ],
    },
  ],
};

export const aerialDoubleSpecs: SpecTableData = {
  title: "Double Mast Aerial Platform – Model Chart",
  columns: [
    "Model",
    "Load Capacity (kg)",
    "Max. Platform Height (m)",
    "Max. Working Height (m)",
    "Platform L × B (m)",
    "Motor (kW)",
    "Power Supply",
    "Overall Dimension (m)",
    "Self Weight (kg)",
  ],
  groups: [
    {
      rows: [
        ["BSL-DM-4-100", 150, 4, 5.7, "0.63 × 0.64", 0.75, "AC 200/50 Hz", "1.42 × 0.84 × 1.92", 385],
        ["BSL-DM-6-100", 150, 6, 7.7, "0.63 × 0.64", 0.75, "AC 200/50 Hz", "1.42 × 0.84 × 1.92", 415],
        ["BSL-DM-8-100", 150, 8, 9.7, "0.63 × 0.64", 0.75, "AC 200/50 Hz", "1.42 × 0.84 × 1.92", 450],
        ["BSL-DM-9-100", 125, 9, 10.7, "0.63 × 0.64", 0.75, "AC 200/50 Hz", "1.42 × 0.84 × 1.92", 490],
        ["BSL-DM-10-100", 125, 10, 11.7, "0.63 × 0.64", 0.75, "AC 200/50 Hz", "1.42 × 0.84 × 1.92", 490],
        ["BSL-DM-6-200", 300, 6, 7.7, "1.23 × 0.61", 1.6, "AC 200/50 Hz", "1.54 × 0.82 × 1.81", 530],
        ["BSL-DM-8-200", 300, 8, 9.7, "1.23 × 0.61", 1.6, "AC 200/50 Hz", "1.54 × 0.82 × 1.81", 570],
        ["BSL-DM-9-200", 250, 9, 10.7, "1.38 × 0.61", 1.6, "AC 200/50 Hz", "1.80 × 0.86 × 1.85", 728],
        ["BSL-DM-10-200", 250, 10, 11.7, "1.38 × 0.61", 1.6, "AC 200/50 Hz", "1.80 × 0.86 × 1.85", 728],
        ["BSL-DM-12-200", 200, 12, 13.7, "1.38 × 0.61", 1.6, "AC 200/50 Hz", "1.80 × 0.86 × 2.10", 825],
        ["BSL-DM-12-300", 200, 12, 13.7, "1.53 × 0.88", 1.5, "AC 200/50 Hz", "1.78 × 1.10 × 2.32", 960],
        ["BSL-DM-14-300", 250, 14, 15.7, "1.53 × 0.88", 1.5, "AC 200/50 Hz", "1.90 × 1.10 × 2.32", 980],
        ["BSL-DM-15-300", 250, 15, 16.7, "1.53 × 0.88", 1.5, "AC 200/50 Hz", "2.00 × 1.25 × 2.68", 1065],
        ["BSL-DM-14-400", 250, 14, 15.7, "1.40 × 0.88", 1.5, "AC 200/50 Hz", "1.90 × 1.10 × 2.52", 1360],
        ["BSL-DM-16-400", 250, 16, 17.7, "1.45 × 0.90", 1.5, "AC 200/50 Hz", "2.28 × 1.35 × 2.82", 1520],
      ],
    },
  ],
};

const goodsColumns = ["Model", "Mast Type", "Load Capacity (kg)", "Lifting Height (mm)", "Platform Size (mm)", "Motor (kW)"];

export const goodsSingleSpecs: SpecTableData = {
  title: "Goods Lift – Single Mast Model Chart",
  columns: goodsColumns,
  groups: [
    {
      rows: [
        ["BSL-SM 0.5-3", "Single", 500, 3000, "1200 × 1600", 2.2],
        ["BSL-SM 0.5-4", "Single", 500, 4000, "1200 × 1600", 2.2],
        ["BSL-SM 0.5-5", "Single", 500, 5000, "1500 × 1500", 3.7],
        ["BSL-SM 0.5-7", "Single", 500, 7000, "1500 × 2000", 3.7],
        ["BSL-SM 0.5-9", "Single", 500, 9000, "1500 × 1500", 3.7],
        ["BSL-SM 1-3", "Single", 1000, 3000, "1500 × 1500", 3.7],
      ],
    },
  ],
};

export const goodsDoubleSpecs: SpecTableData = {
  title: "Goods Lift – Double Mast Model Chart",
  columns: goodsColumns,
  groups: [
    {
      rows: [
        ["BSL-DM 1-5", "Double", 1000, 5000, "2000 × 2000", 5.5],
        ["BSL-DM 1-7", "Double", 1000, 7000, "2000 × 3000", 7.5],
        ["BSL-DM 1-9", "Double", 1000, 9000, "2000 × 3000", 5.5],
        ["BSL-DM 2-4", "Double", 2000, 4000, "2000 × 2000", 3.7],
        ["BSL-DM 2-6", "Double", 2000, 6000, "2500 × 2000", 5.5],
        ["BSL-DM 2-8", "Double", 2000, 8000, "2500 × 4000", 7.5],
        ["BSL-DM 2-10", "Double", 2000, 10000, "2000 × 2500", 7.5],
        ["BSL-DM 3-4.5", "Double", 3000, 4500, "2000 × 3000", 5.5],
        ["BSL-DM 3-6", "Double", 3000, 6000, "2000 × 3000", 7.5],
        ["BSL-DM 3-8", "Double", 3000, 8000, "2500 × 5000", 11],
        ["BSL-DM 3-12", "Double", 3000, 12000, "2500 × 5500", 11],
        ["BSL-DM 4-5", "Double", 4000, 5000, "2500 × 5000", 5.5],
        ["BSL-DM 4-12", "Double", 1000, 14000, "2000 × 2000", 11],
        ["BSL-DM 5-5", "Double", 5000, 5000, "2500 × 5500", 7.5],
      ],
    },
  ],
};

export const dockLevelerSpecs: SpecTableData = {
  title: "Fixed Dock Leveler – Model Chart",
  columns: ["Model", "Load Capacity (kg)", "Platform L × B (mm)", "Motor (kW)", "Lip Board Size (mm)"],
  groups: [
    {
      rows: [
        ["BSL-SD-06", 6000, "2500 × 2100", 0.75, 400],
        ["BSL-SD-08", 8000, "2500 × 2100", 0.75, 400],
        ["BSL-SD-10", 10000, "2500 × 2100", 1.5, 400],
        ["BSL-SD-12", 12000, "2500 × 2100", 1.5, 400],
      ],
    },
  ],
};

export const dockRampSpecs: SpecTableData = {
  title: "Movable Dock Ramp – Model Chart",
  columns: ["Model", "Load Capacity (kg)", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  groups: [
    {
      rows: [
        ["BSL-06", 6000, 6000, 3000, 1000, 300, 10300, 1800, 2100, 1200, 400, 1600],
        ["BSL-08", 8000, 6000, 3000, 1000, 300, 10300, 1800, 2100, 1200, 400, 1600],
        ["BSL-10", 10000, 7000, 3000, 1000, 300, 11300, 1800, 2100, 1200, 400, 1600],
      ],
    },
  ],
  note: "Dimensions A–J in mm, as per the ramp drawing.",
};
