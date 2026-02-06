
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Car, 
  Plane, 
  Heart, 
  ChevronRight, 
  Loader2, 
  ExternalLink,
  AlertCircle,
  Zap,
  LayoutGrid,
  Newspaper,
  Sparkles,
  ShoppingBag,
  Wallet,
  ThumbsUp,
  MessageSquareWarning,
  Star,
  Eye,
  Clock,
  Mail,
  X,
  Send,
  User,
  Phone,
  MessageSquare
} from 'lucide-react';
import { UserData, InsuranceType, NewsArticle, TopProduct, InsuranceReview } from './types';
import { getRecommendedProducts } from './services/geminiService';
import { 
  ResponsiveContainer, 
  Treemap,
  Tooltip
} from 'recharts';

const AGE_GROUPS = [20, 30, 40, 50, 60];
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간 (밀리초 단위)

const TREEMAP_COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', 
  '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4',
  '#2dd4bf', '#fb923c', '#fb7185', '#818cf8', '#c084fc'
];

const INQUIRY_TYPES = [
  "신규 가입 상담",
  "기존 보험 분석",
  "보험료 비교 견적",
  "보장 범위 문의",
  "전문가 심층 분석",
  "기타 문의"
];

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [marketLoading, setMarketLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const [allProducts, setAllProducts] = useState<TopProduct[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<TopProduct[]>([]);

  const [userData, setUserData] = useState<UserData>({
    age: 30,
    gender: '남성',
    isSmoker: false,
    occupation: '사무직',
    annualIncome: 50000000,
    insuranceType: InsuranceType.HEALTH,
  });

  // 문의 폼 상태
  const [contactForm, setContactForm] = useState({
    type: INQUIRY_TYPES[0],
    message: '',
    phone: ''
  });

  // 초기 마켓 데이터 로드 (고정 시뮬레이션 데이터)
  useEffect(() => {
    const fetchMarketData = async () => {
      setMarketLoading(true);
      setTimeout(() => {
        const products: TopProduct[] = [
          { id: 1, name: "다이렉트 실손보험", company: "삼성화재", count: 450000, avgPremium: 15000, category: InsuranceType.HEALTH, reason: "점유율 1위" },
          { id: 2, name: "굿앤굿 어린이보험", company: "현대해상", count: 320000, avgPremium: 42000, category: InsuranceType.HEALTH, reason: "부모 선호도 1위" },
          { id: 3, name: "참좋은 건강보험", company: "DB손보", count: 280000, avgPremium: 55000, category: InsuranceType.HEALTH, reason: "가성비 우수" },
          { id: 4, name: "무배당 종신플랜", company: "한화생명", count: 150000, avgPremium: 120000, category: InsuranceType.LIFE, reason: "안정성" },
          { id: 5, name: "다이렉트 자동차", company: "KB손보", count: 600000, avgPremium: 850000, category: InsuranceType.CAR, reason: "보상 서비스" },
          { id: 6, name: "원데이 자동차", company: "메리츠화재", count: 210000, avgPremium: 5000, category: InsuranceType.CAR, reason: "간편가입" },
          { id: 7, name: "Global 여행보험", company: "AIG", count: 180000, avgPremium: 25000, category: InsuranceType.TRAVEL, reason: "해외보장" },
          { id: 8, name: "평생 연금보험", company: "교보생명", count: 140000, avgPremium: 300000, category: InsuranceType.PENSION, reason: "공시이율" },
          { id: 9, name: "비갱신 암보험", company: "신한라이프", count: 240000, avgPremium: 35000, category: InsuranceType.HEALTH, reason: "비갱신형" },
          { id: 10, name: "해외여행 안심플랜", company: "카카오페이", count: 290000, avgPremium: 8000, category: InsuranceType.TRAVEL, reason: "간편결제" },
        ];
        setAllProducts(products);
        setMarketLoading(false);
      }, 600);
    };
    fetchMarketData();
  }, []);

  // 추천 상품 캐싱 및 업데이트 로직
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (step !== 4) return;
      
      const cacheKey = `recommendations_${userData.age}_${userData.gender}_${userData.insuranceType}`;
      const cachedStr = localStorage.getItem(cacheKey);
      
      if (cachedStr) {
        try {
          const cachedData = JSON.parse(cachedStr);
          const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION;
          
          if (!isExpired) {
            setRecommendedProducts(cachedData.data);
            setRecommendationsLoading(false);
            return;
          }
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }

      setRecommendationsLoading(true);
      setError(null);
      try {
        const products = await getRecommendedProducts(userData);
        setRecommendedProducts(products);
        
        // 캐시 저장
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: products
        }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, [userData.age, userData.gender, userData.insuranceType, step]);

  const dynamicNews = useMemo(() => {
    const { age, gender, insuranceType } = userData;
    const items: NewsArticle[] = [];
    if (insuranceType === InsuranceType.HEALTH) {
      items.push({ title: `[단독] ${age}대 ${gender} 가입자 급증하는 건강보험 특약은?`, source: "금융포커스", url: `https://www.google.com/search?q=${age}대+${gender}+건강보험+인기+특약` });
      items.push({ title: `${age}세 맞춤 건강관리 서비스, 보험 가입만 해도 '무료'`, source: "헬스데일리", url: "https://www.google.com/search?q=보험사+건강관리+서비스" });
      items.push({ title: "실손보험 청구 간소화 서비스, 2030 이용률 압도적 1위", source: "경제투데이", url: "https://www.google.com/search?q=실손보험+청구+간소화" });
    } else if (insuranceType === InsuranceType.CAR) {
      items.push({ title: `[속보] ${age}대 ${gender} 운전자, 보험료 아끼는 '퍼마일' 방식 인기`, source: "모빌리티뉴스", url: "https://www.google.com/search?q=캐롯+퍼마일+자동차보험+후기" });
      items.push({ title: "블랙박스·T맵 점수 할인... 내 차 보험료 얼마나 깎일까?", source: "카리포트", url: "https://www.google.com/search?q=자동차보험+T맵+할인" });
      items.push({ title: `최근 ${age}대 사고 데이터 분석: ${gender === '남성' ? '과속' : '접촉'} 사고 주의보`, source: "안전포럼", url: "https://www.google.com/search?q=연령별+사고+데이터" });
    } else {
      items.push({ title: `[기획] ${age}대 가정을 위한 '가성비' 종신보험 가이드`, source: "금융위클리", url: "https://www.google.com/search?q=가성비+종신보험" });
      items.push({ title: "사망 보장만? No! 상속세 재원 마련용 종신보험 인기", source: "세무저널", url: "https://www.google.com/search?q=종신보험+상속세+활용" });
      items.push({ title: `정기보험 vs 종신보험: ${age}대 ${gender}에게 유리한 선택은?`, source: "보험의정석", url: "https://www.google.com/search?q=정기보험+종신보험+비교" });
    }
    return items;
  }, [userData.age, userData.gender, userData.insuranceType]);

  const marketMapData = useMemo(() => {
    const filteredByCategory = allProducts.filter(p => p.category === userData.insuranceType);
    return filteredByCategory.map((p, index) => {
      let weight = 1.0;
      if (userData.age <= 20) { if (p.company === "카카오페이" || p.company === "캐롯") weight *= 1.5; }
      else if (userData.age >= 50) { if (p.company === "삼성화재" || p.company === "교보생명") weight *= 1.4; }
      if (userData.gender === '여성') { if (p.name.includes("어린이") || p.name.includes("실손")) weight *= 1.2; }
      else { if (p.name.includes("자동차") || p.name.includes("종신")) weight *= 1.2; }
      return {
        name: p.name,
        size: Math.max(100, Math.round(p.count * weight)),
        company: p.company,
        avgPremium: p.avgPremium,
        color: TREEMAP_COLORS[index % TREEMAP_COLORS.length]
      };
    }).sort((a, b) => b.size - a.size).slice(0, 10);
  }, [allProducts, userData.insuranceType, userData.age, userData.gender]);

  const top3Products = useMemo(() => marketMapData.slice(0, 3), [marketMapData]);

  const reviews = useMemo(() => {
    const positiveReviews: InsuranceReview[] = top3Products.map((p, i) => ({
      id: i,
      productName: p.name,
      userName: `리뷰어_${Math.floor(Math.random() * 9999)}`,
      rating: 5,
      content: `${p.name} 가입했는데 보상 처리가 진짜 빠르네요. 상담사분도 너무 친절하셔서 믿고 추천합니다.`,
      views: 12000 - (i * 2500),
      date: "2024-05-15",
      isPositive: true
    }));

    const negativeReviews: InsuranceReview[] = top3Products.map((p, i) => ({
      id: i + 10,
      productName: p.name,
      userName: `익명_${Math.floor(Math.random() * 9999)}`,
      rating: 2,
      content: `${p.name} 가입 시 고지 의무가 너무 까다롭네요. 나중에 문제 생길까 봐 걱정되긴 합니다. 가입 전 약관 꼭 확인하세요.`,
      views: 1200 - (i * 200),
      date: new Date().toISOString().split('T')[0],
      isPositive: false
    }));

    return { positive: positiveReviews, negative: negativeReviews };
  }, [top3Products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setUserData(prev => ({ ...prev, [name]: type === 'number' ? Number(val) : val }));
  };

  const handleShowRecommendations = () => {
    setStep(4);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[DS보험상담] 문의: ${contactForm.type}`);
    const body = encodeURIComponent(
      `연령: ${userData.age}대\n` +
      `성별: ${userData.gender}\n` +
      `관심상품: ${userData.insuranceType}\n` +
      `문의종류: ${contactForm.type}\n` +
      `연락처: ${contactForm.phone}\n\n` +
      `상세내용:\n${contactForm.message}`
    );
    // bossiniz@naver.com과 bossini@shinhan.com 두 곳으로 전송
    window.location.href = `mailto:bossiniz@naver.com,bossini@shinhan.com?subject=${subject}&body=${body}`;
    setShowContactModal(false);
  };

  const reset = () => { setStep(1); };

  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, company, size, avgPremium, color } = props;
    if (width < 30 || height < 20) return null;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} style={{ fill: color, stroke: '#fff', strokeWidth: 2, strokeOpacity: 0.8 }} />
        {width > 80 && height > 50 && (
          <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8}>
            <div className="flex flex-col items-center justify-center h-full w-full pointer-events-none overflow-hidden space-y-0.5">
              <span className="text-white text-[8px] sm:text-[9px] font-bold opacity-80 truncate w-full text-center uppercase">{company || ''}</span>
              <span className="text-white text-[10px] sm:text-[11px] font-black leading-tight text-center break-keep w-full">{name || ''}</span>
              <div className="flex flex-col items-center pt-1 border-t border-white/20 mt-1 w-full">
                <span className="text-white text-[8px] sm:text-[9px] opacity-90 truncate">{(size || 0).toLocaleString()}명 가입</span>
                <span className="text-white text-[9px] sm:text-[10px] font-black truncate">₩{(avgPremium || 0).toLocaleString()}</span>
              </div>
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={reset}>
              <ShieldCheck className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">DS보험상담</span>
            </div>
            <div className="flex gap-4 sm:gap-6 text-sm font-medium text-slate-600 items-center">
              <button 
                onClick={handleShowRecommendations}
                className={`hover:text-blue-600 transition-colors ${step === 4 ? 'text-blue-600 font-bold underline underline-offset-8' : ''}`}
              >
                실시간분석
              </button>
              <button 
                onClick={() => setShowContactModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-xs font-bold"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {(step === 1 || step === 4) && (
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-4 sm:p-2 mb-10 shadow-xl shadow-slate-200/50 animate-fadeIn overflow-hidden">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
              <div className="flex flex-col px-4 py-1 min-w-[200px]">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">연령대</span>
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {AGE_GROUPS.map((age) => (
                    <button key={age} onClick={() => setUserData(prev => ({ ...prev, age }))}
                      className={`px-3 py-2 rounded-xl text-[11px] font-black transition-all border ${userData.age === age ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}>
                      {age === 60 ? '60대+' : `${age}대`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-[2rem] border border-slate-100 mx-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">성별</span>
                  <select name="gender" value={userData.gender} onChange={handleInputChange} className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer">
                    <option value="남성">남성</option><option value="여성">여성</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-1.5 p-1 overflow-x-auto no-scrollbar">
                {[
                  { type: InsuranceType.HEALTH, icon: Heart, label: "건강" },
                  { type: InsuranceType.LIFE, icon: Activity, label: "생명" },
                  { type: InsuranceType.CAR, icon: Car, label: "자동차" },
                  { type: InsuranceType.TRAVEL, icon: Plane, label: "여행" },
                  { type: InsuranceType.PENSION, icon: Wallet, label: "연금" },
                ].map((cat) => (
                  <button key={cat.type} onClick={() => setUserData(prev => ({ ...prev, insuranceType: cat.type }))}
                    className={`flex-1 min-w-[90px] group flex items-center justify-center gap-2 py-3 px-4 rounded-[1.5rem] transition-all duration-300 ${userData.insuranceType === cat.type ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
                    <cat.icon className={`w-4 h-4 ${userData.insuranceType === cat.type ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold whitespace-nowrap">{cat.label}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={handleShowRecommendations}
                className={`bg-blue-600 text-white px-6 py-4 lg:py-3 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ml-2 shadow-lg shadow-blue-200 ${recommendationsLoading ? 'opacity-50 cursor-wait' : ''}`}
                disabled={recommendationsLoading}
              >
                {recommendationsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '상품추천'} <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </section>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{userData.insuranceType} 마켓 맵 (Top 10)</h2>
                </div>
              </div>
              <div className="h-80 sm:h-[500px] w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap data={marketMapData} dataKey="size" aspectRatio={4/3} content={<CustomizedContent />} animationDuration={1000} animationEasing="ease-out">
                    <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xl">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{data.company}</p>
                              <p className="text-sm font-black text-slate-900">{data.name}</p>
                              <p className="text-xs font-bold text-blue-600 mt-1">{(data.size || 0).toLocaleString()}명 이용 중</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </section>
            
            <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2"><Newspaper className="w-4 h-4" /> 실시간 맞춤 리서치</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dynamicNews.map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="group p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{item.source}</span>
                    <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors h-10 line-clamp-2">{item.title}</p>
                    <div className="flex items-center mt-4 text-[10px] font-black text-blue-500 uppercase">기사 보기 <ChevronRight className="w-3 h-3 ml-1" /></div>
                  </a>
                ))}
              </div>

              {/* 후기 섹션 */}
              <div className="mt-12 space-y-10">
                <div>
                  <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" /> 마켓 Top 3 인기 긍정 리서치
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.positive.map((review) => (
                      <div key={review.id} className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex flex-col hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase tracking-tighter">BEST</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-blue-500 text-blue-500" />)}
                          </div>
                        </div>
                        <p className="text-xs font-black text-slate-800 mb-2 truncate">{review.productName}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-4 line-clamp-3">"{review.content}"</p>
                        <div className="mt-auto flex items-center justify-between border-t border-blue-100 pt-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <Eye className="w-3 h-3" /> {review.views.toLocaleString()}회
                          </div>
                          <span className="text-[10px] font-black text-blue-600">{review.userName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4" /> 최근 접수된 실시간 주의 분석
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.negative.map((review) => (
                      <div key={review.id} className="bg-red-50/50 rounded-2xl p-5 border border-red-100 flex flex-col hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded uppercase tracking-tighter">RECENT</span>
                          <span className="text-[9px] font-bold text-red-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {review.date}
                          </span>
                        </div>
                        <p className="text-xs font-black text-slate-800 mb-2 truncate">{review.productName}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-4 line-clamp-3">"{review.content}"</p>
                        <div className="mt-auto flex items-center justify-between border-t border-red-100 pt-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                             주의 등급: <span className="text-red-600">높음</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{review.userName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <ShoppingBag className="w-7 h-7 text-blue-600" />
                  {userData.age}대 {userData.gender} 맞춤 {userData.insuranceType} 추천 20선
                </h2>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">최신 시장 트렌드를 반영한 실시간 맞춤 리스트 (24시간 캐시 적용)</p>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                 <Loader2 className={`w-4 h-4 text-blue-600 ${recommendationsLoading ? 'animate-spin' : ''}`} />
                 <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                   {recommendationsLoading ? '데이터 갱신 중...' : '데이터 활성'}
                 </span>
              </div>
            </div>

            {recommendationsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-72 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
                    <div className="h-10 bg-slate-100 rounded mb-4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2 mt-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProducts.map((p, idx) => (
                  <div key={p.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-200/50 transition-all hover:scale-[1.03] flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-bl-2xl opacity-10 group-hover:opacity-100 transition-opacity">
                      RANK #{idx + 1}
                    </div>
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-lg mb-2 uppercase tracking-tighter">
                        {p.company}
                      </span>
                      <h3 className="text-base font-black text-slate-900 leading-tight h-12 line-clamp-2">{p.name}</h3>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed line-clamp-2 h-8 italic">"{p.reason}"</p>
                    <div className="mt-auto flex flex-col gap-4">
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">예상 월 보험료</span>
                          <span className="text-lg font-black text-blue-600">₩{(p.avgPremium || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">인기도</span>
                          <span className="text-xs font-bold text-slate-700">{(p.count || 0).toLocaleString()}명+</span>
                        </div>
                      </div>
                      <a 
                        href={p.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                      >
                        가입/상세 정보 <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!recommendationsLoading && recommendedProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-bold">추천 상품을 불러오지 못했습니다.</p>
                <button onClick={() => setStep(4)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">다시 시도</button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 animate-shake shadow-lg shadow-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
      </main>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowContactModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">보험 상담 문의</h2>
              <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="p-8 space-y-6">
              {/* 유저 정보 요약 (Read Only) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">연령</span>
                  <span className="text-xs font-bold text-slate-800">{userData.age}대</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">성별</span>
                  <span className="text-xs font-bold text-slate-800">{userData.gender}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">관심분야</span>
                  <span className="text-xs font-bold text-blue-600 truncate">{userData.insuranceType}</span>
                </div>
              </div>

              {/* 문의 종류 선택 */}
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">문의 종류 (6가지)</label>
                <div className="grid grid-cols-2 gap-2">
                  {INQUIRY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setContactForm(prev => ({ ...prev, type }))}
                      className={`px-4 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${contactForm.type === type ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 연락처 입력 */}
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">연락처 (이메일 또는 전화번호)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="상담 받으실 연락처를 입력해주세요"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* 문의 내용 */}
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">문의 내용</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea 
                    required
                    rows={4}
                    placeholder="궁금하신 내용을 자세히 적어주시면 정확한 상담이 가능합니다."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none resize-none"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                상담 신청하기 <Send className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold">신청 시 담당자가 확인 후 영업일 기준 1일 이내에 연락 드립니다.</p>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-20 py-16 border-t border-slate-200 bg-white text-center">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-center gap-2 mb-6 opacity-30">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-black text-slate-500">DS보험상담</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            본 서비스는 Gemini AI 엔진을 기반으로 실시간 정보를 분석하여 제공하는 시뮬레이션이며, <br/> 가입 전 반드시 해당 보험사의 상품 설명서를 확인하시기 바랍니다.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
