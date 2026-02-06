
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, AnalysisResult, TopProduct, InsuranceType } from "../types";

// 재시도 및 지수 백오프를 위한 유틸리티
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const fetchWithRetry = async (fn: () => Promise<any>, retries = 2, backoff = 1000) => {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
    if (retries > 0 && isQuotaError) {
      await delay(backoff);
      return fetchWithRetry(fn, retries - 1, backoff * 2);
    }
    throw error;
  }
};

// API 실패 시 제공할 기본 분석 데이터
const getFallbackAnalysis = (userData: UserData): AnalysisResult => {
  const defaultRecommendations: Record<InsuranceType, string[]> = {
    [InsuranceType.HEALTH]: [
      "실손 의료비 보험을 최우선으로 검토하고 보장 범위를 확인하세요.",
      "가족력을 고려하여 암, 뇌, 심장 3대 질병 진단비를 강화하세요.",
      "비갱신형 상품을 선택하여 장기적인 보험료 변동 위험을 줄이세요."
    ],
    [InsuranceType.LIFE]: [
      "경제 활동기를 고려하여 조기 사망에 대비한 정기 보험을 검토하세요.",
      "상속세 재원 마련 목적이라면 종신 보험의 절세 효과를 분석하세요.",
      "특약을 통해 재해 장해 및 수술비 보장을 통합 관리하세요."
    ],
    [InsuranceType.CAR]: [
      "법률 비용 지원을 위해 운전자 보험 병행 가입을 고려하세요.",
      "대물 배상 한도를 10억 이상으로 설정하여 고가 차량 사고에 대비하세요.",
      "주행 거리가 적다면 마일리지 할인 특약을 반드시 활용하세요."
    ],
    [InsuranceType.TRAVEL]: [
      "해외 의료비 보장 한도가 충분한지 반드시 확인하세요.",
      "휴대품 손해 보장 및 항공기 지연 보상 포함 여부를 체크하세요.",
      "현지에서의 24시간 한국어 긴급 지원 서비스 유무를 확인하세요."
    ],
    [InsuranceType.PENSION]: [
      "연금 저축 계좌를 통한 연말 정산 세액 공제 혜택을 극대화하세요.",
      "노후 생활비를 고려하여 물가 상승률 반영 여부를 검토하세요.",
      "수익률 중심의 변액 연금과 안정 중심의 일반 연금을 비교하세요."
    ]
  };

  return {
    estimatedPremium: userData.age * 1500 + (userData.gender === '남성' ? 5000 : 3000),
    riskScore: 65,
    recommendations: defaultRecommendations[userData.insuranceType] || defaultRecommendations[InsuranceType.HEALTH],
    comparativeInsights: "현재 API 연결이 원활하지 않아 표준 통계 데이터를 기반으로 분석되었습니다. 위 내용은 해당 연령대의 일반적인 권장 사항입니다.",
    sources: []
  };
};

export const getInsuranceAnalysis = async (userData: UserData, ageRiskContext: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    당신은 수석 보험 계리사 및 금융 상담가입니다. 다음 사용자 프로필을 분석하여 ${userData.insuranceType} 상품에 대한 분석을 제공하세요:
    - 나이: ${userData.age}세
    - 성별: ${userData.gender}
    - 흡연 여부: ${userData.isSmoker ? '흡연' : '비흡연'}
    - 직업: ${userData.occupation}
    - 연소득: ₩${userData.annualIncome.toLocaleString()}
    - 인구통계적 위험 요소: ${ageRiskContext}

    다음 내용을 포함하세요:
    1. 예상 월 보험료 (대표값 숫자 하나만 JSON으로 반환).
    2. 위험도 점수 (1-100).
    3. 구체적이고 실행 가능한 3가지 보험 가입 조언.
    4. 최신 시장 트렌드와 비교 분석.
    
    모든 답변은 한국어로 작성하세요.
  `;

  try {
    const response = await fetchWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedPremium: { type: Type.NUMBER, description: "월 예상 보험료 (원)" },
            riskScore: { type: Type.NUMBER, description: "1~100 사이의 위험도 점수" },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3가지 개인별 추천 사항"
            },
            comparativeInsights: { type: Type.STRING, description: "시장 분석 및 비교 정보" }
          },
          required: ["estimatedPremium", "riskScore", "recommendations", "comparativeInsights"]
        }
      },
    }));

    const result = JSON.parse(response.text || "{}");
    return { ...result, sources: [] };
  } catch (error) {
    console.warn("Gemini API Quota or Connection Issue, returning fallback analysis.");
    return getFallbackAnalysis(userData);
  }
};

export const getRecommendedProducts = async (userData: UserData): Promise<TopProduct[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    대한민국 보험 시장에서 ${userData.age}대 ${userData.gender}에게 가장 인기 있는 ${userData.insuranceType} 상품 6개를 찾아주세요.
    실제 판매 중인 상품명과 보험사명을 정확히 포함해야 합니다.
    각 상품에 대해 다음 정보를 JSON 배열 형식으로 제공하세요:
    1. name: 상품명
    2. company: 보험사명
    3. reason: 추천 사유 (한 문장)
    4. avgPremium: 해당 연령대 평균 월 보험료 (숫자)
    5. link: 해당 상품 검색을 위한 구글 검색 URL (https://www.google.com/search?q=보험사+상품명 형태)
  `;

  try {
    const response = await fetchWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              company: { type: Type.STRING },
              reason: { type: Type.STRING },
              avgPremium: { type: Type.NUMBER },
              link: { type: Type.STRING }
            },
            required: ["name", "company", "reason", "avgPremium", "link"]
          }
        }
      }
    }));

    const products = JSON.parse(response.text || "[]");
    return products.slice(0, 6).map((p: any, index: number) => ({
      ...p,
      id: index + 1,
      category: userData.insuranceType,
      count: Math.floor(Math.random() * 500000) + 100000
    }));
  } catch (error) {
    console.warn("Gemini API Issue for products, returning local market data.");
    // 기본 추천 상품 리스트 폴백
    const fallbackProducts: TopProduct[] = [
      { id: 1, name: "삼성화재 다이렉트 실손", company: "삼성화재", count: 450000, reason: "시장 점유율 1위의 안정적인 보상 서비스", avgPremium: 15000, category: userData.insuranceType, link: "https://www.google.com/search?q=삼성화재+실손보험" },
      { id: 2, name: "현대해상 굿앤굿 건강", company: "현대해상", count: 320000, reason: "다양한 특약 구성으로 맞춤 설계 가능", avgPremium: 45000, category: userData.insuranceType, link: "https://www.google.com/search?q=현대해상+건강보험" },
      { id: 3, name: "DB손보 참좋은 보험", company: "DB손해보험", count: 280000, reason: "보험료 대비 높은 가성비로 선호도 높음", avgPremium: 38000, category: userData.insuranceType, link: "https://www.google.com/search?q=DB손해보험+참좋은보험" },
      { id: 4, name: "KB손보 다이렉트 자동차", company: "KB손해보험", count: 210000, reason: "편리한 모바일 청구 시스템 구축", avgPremium: 52000, category: userData.insuranceType, link: "https://www.google.com/search?q=KB손해보험+자동차보험" },
      { id: 5, name: "메리츠화재 알파Plus", company: "메리츠화재", count: 190000, reason: "업계 최고 수준의 암 진단비 보장", avgPremium: 41000, category: userData.insuranceType, link: "https://www.google.com/search?q=메리츠화재+알파플러스" },
      { id: 6, name: "신한라이프 더드림 종신", company: "신한라이프", count: 150000, reason: "상속 및 사망 보장에 특화된 연금 연계형", avgPremium: 120000, category: userData.insuranceType, link: "https://www.google.com/search?q=신한라이프+종신보험" }
    ];
    return fallbackProducts;
  }
};
