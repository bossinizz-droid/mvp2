
export enum InsuranceType {
  HEALTH = '건강보험',
  LIFE = '생명보험',
  CAR = '자동차보험',
  TRAVEL = '여행자보험',
  PENSION = '연금보험'
}

export interface UserData {
  age: number;
  gender: '남성' | '여성';
  isSmoker: boolean;
  occupation: string;
  annualIncome: number;
  insuranceType: InsuranceType;
  location?: string;
}

export interface AnalysisResult {
  estimatedPremium: number;
  riskScore: number;
  recommendations: string[];
  comparativeInsights: string;
  sources: { title: string; uri: string }[];
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
}

export interface InsuranceReview {
  id: number;
  productName: string;
  userName: string;
  rating: number;
  content: string;
  views: number;
  date: string;
  isPositive: boolean;
}

export interface MarketBuzz {
  id: number;
  title: string;
  summary: string;
  url: string;
  views: number;
  tag: string;
  category: InsuranceType;
}

export interface TopProduct {
  id: number;
  name: string;
  company: string;
  count: number;
  reason: string;
  avgPremium?: number; 
  link?: string;
  category: InsuranceType;
}
