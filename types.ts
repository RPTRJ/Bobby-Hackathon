export enum IssueStatus {
  UNRESOLVED = 'UNRESOLVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum MachineStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR'
}

export interface MachineInfo {
  id: string;
  name: string;
  status: MachineStatus;
  warrantyExpiration: Date;
  model: string;
}

export interface RepairGuide {
  steps: string[];
  tools: string[];
}

export interface Issue {
  id: string;
  machineId: string;
  description: string; // Detected by AI
  detectedAt: Date;
  status: IssueStatus;
  snapshotUrl?: string; // Base64 image
  
  // Repair Details
  partsRequired: string[];
  estimatedCostSelf: number;
  estimatedCostOutsourced: number;
  repairGuide?: RepairGuide;
  
  // Warranty Logic
  warrantyClaimDate?: Date; // If user selects warranty
}