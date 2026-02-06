
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, AnalysisResult, TopProduct } from "../types";

// DO NOT define API_KEY as a separate variable; use process.env.API_KEY directly in the constructor.
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
    // Removed googleSearch because it is incompatible with reliable JSON parsing per guidelines
    const response = await ai.models.generateContent({
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
    });

    // Directly access response.text property
    const result = JSON.parse(response.text || "{}");
    // Sources are empty as googleSearch was removed for JSON compatibility
    const sources: { title: string; uri: string }[] = [];

    return {
      ...result,
      sources
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("보험 분석을 생성하지 못했습니다. 다시 시도해주세요.");
  }
};

export const getRecommendedProducts = async (userData: UserData): Promise<TopProduct[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    대한민국 보험 시장에서 ${userData.age}대 ${userData.gender}에게 가장 인기 있는 ${userData.insuranceType} 상품 20개를 찾아주세요.
    실제 판매 중인 상품명과 보험사명을 정확히 포함해야 합니다.
    각 상품에 대해 다음 정보를 JSON 배열 형식으로 제공하세요:
    1. name: 상품명
    2. company: 보험사명
    3. reason: 추천 사유 (한 문장)
    4. avgPremium: 해당 연령대 평균 월 보험료 (숫자)
    5. link: 해당 상품 검색을 위한 구글 검색 URL (https://www.google.com/search?q=보험사+상품명 형태)
    
    반드시 20개를 채워서 응답하세요.
  `;

  try {
    // Removed googleSearch to ensure consistent JSON array output as requested
    const response = await ai.models.generateContent({
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
    });

    const products = JSON.parse(response.text || "[]");
    return products.map((p: any, index: number) => ({
      ...p,
      id: index + 1,
      category: userData.insuranceType,
      count: Math.floor(Math.random() * 500000) + 100000 // 시뮬레이션된 가입자 수
    }));
  } catch (error) {
    console.error("Gemini Recommendations Error:", error);
    return [];
  }
};
