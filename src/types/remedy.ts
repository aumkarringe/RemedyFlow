export interface Remedy {
  "Name of Item": string;
  "Health Issue": string;
  "Home Remedy": string;
  "Yogasan"?: string;
}

export interface AIRemedy {
  name: string;
  healthIssue: string;
  remedy: string;
  yogasan?: string;
  acupressure?: string;
  benefits?: string;
  precautions?: string;
  duration?: string;
  source: "AI-Generated";
}

export type CombinedRemedy = Remedy | AIRemedy;

export function isAIRemedy(remedy: CombinedRemedy): remedy is AIRemedy {
  return 'source' in remedy && remedy.source === 'AI-Generated';
}
