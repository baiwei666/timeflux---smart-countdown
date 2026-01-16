
import { GoogleGenAI, Type } from "@google/genai";
import { CountdownEvent } from "../types";

const HOLIDAY_COLORS: Record<string, string> = {
  "春节": "from-red-600 to-amber-500",
  "元宵节": "from-orange-500 to-yellow-400",
  "清明节": "from-emerald-500 to-green-400",
  "劳动节": "from-blue-500 to-cyan-400",
  "端午节": "from-teal-500 to-emerald-400",
  "中秋节": "from-amber-500 to-orange-400",
  "国庆节": "from-red-500 to-pink-500",
  "元旦": "from-indigo-500 to-purple-400",
  "default": "from-violet-500 to-purple-400"
};

export const fetchUpcomingHolidays = async (): Promise<CountdownEvent[]> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found, returning mock data.");
    return getMockHolidays();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const today = new Date().toISOString().split('T')[0];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helpful Chinese calendar expert. Identify the next 5 major Chinese holidays (public holidays and traditional festivals) occurring strictly after today's date: ${today}. 
      
      For each holiday, provide:
      - name: Official Chinese name (Simplified Chinese)
      - date: The start date in YYYY-MM-DD format
      - description: A brief description explaining the significance (in Chinese, 20-40 characters)
      - holidayType: One of "public" (法定假日), "traditional" (传统节日), or "memorial" (纪念日)
      - daysOff: Number of official days off (0 if not a public holiday)
      - traditions: Array of 2-3 key traditions/customs (in Chinese, each 4-8 characters)
      - greetings: A common greeting/blessing phrase for this holiday (in Chinese)
      
      Return a JSON array sorted by date.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              date: { type: Type.STRING, description: "YYYY-MM-DD format" },
              description: { type: Type.STRING },
              holidayType: { type: Type.STRING, description: "public, traditional, or memorial" },
              daysOff: { type: Type.NUMBER },
              traditions: { type: Type.ARRAY, items: { type: Type.STRING } },
              greetings: { type: Type.STRING }
            },
            required: ["name", "date", "description", "holidayType", "daysOff", "traditions", "greetings"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any, index: number) => ({
      id: `holiday-${index}-${Date.now()}`,
      title: item.name,
      date: `${item.date}T00:00:00`,
      description: item.description,
      type: 'holiday',
      color: HOLIDAY_COLORS[item.name] || HOLIDAY_COLORS["default"],
      createdAt: Date.now(),
      holidayType: item.holidayType,
      daysOff: item.daysOff,
      traditions: item.traditions,
      greetings: item.greetings
    } as CountdownEvent));

  } catch (error) {
    console.error("Failed to fetch holidays via AI:", error);
    return getMockHolidays();
  }
};

const getMockHolidays = (): CountdownEvent[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const timestamp = Date.now();

  // Helper to find the next occurrence of a fixed date holiday
  const getNextFixedDate = (month: number, day: number): string => {
    // Month is 0-indexed in JS Date, but inputs here are 1-12
    const thisYearDate = new Date(currentYear, month - 1, day);

    // If the date has already passed today, use next year
    if (thisYearDate.getTime() < now.getTime()) {
      return `${currentYear + 1}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
    }
    return `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
  };

  // Helper for variable holidays (Spring Festival)
  const springFestivals: Record<number, string> = {
    2024: '02-10',
    2025: '01-29',
    2026: '02-17',
    2027: '02-06'
  };

  const getNextSpringFestival = (): string => {
    const thisYearDateStr = springFestivals[currentYear];
    if (thisYearDateStr) {
      const date = new Date(`${currentYear}-${thisYearDateStr}T00:00:00`);
      if (date.getTime() > now.getTime()) {
        return `${currentYear}-${thisYearDateStr}T00:00:00`;
      }
    }
    const nextYearDateStr = springFestivals[currentYear + 1] || '01-29';
    return `${currentYear + 1}-${nextYearDateStr}T00:00:00`;
  };

  const events: CountdownEvent[] = [
    {
      id: 'mock-sf',
      title: '春节',
      date: getNextSpringFestival(),
      type: 'holiday',
      color: HOLIDAY_COLORS["春节"],
      description: "中国农历新年，是中华民族最重要的传统节日",
      createdAt: timestamp,
      holidayType: 'public',
      daysOff: 7,
      traditions: ['贴春联', '放鞭炮', '吃年夜饭', '发红包'],
      greetings: '恭喜发财，新年快乐！'
    },
    {
      id: 'mock-ld',
      title: '劳动节',
      date: getNextFixedDate(5, 1),
      type: 'holiday',
      color: HOLIDAY_COLORS["劳动节"],
      description: "国际劳动节，纪念全世界劳动人民的节日",
      createdAt: timestamp,
      holidayType: 'public',
      daysOff: 5,
      traditions: ['休假出游', '劳动表彰'],
      greetings: '劳动节快乐！'
    },
    {
      id: 'mock-nd',
      title: '国庆节',
      date: getNextFixedDate(10, 1),
      type: 'holiday',
      color: HOLIDAY_COLORS["国庆节"],
      description: "中华人民共和国国庆节，庆祝新中国成立",
      createdAt: timestamp,
      holidayType: 'public',
      daysOff: 7,
      traditions: ['升国旗', '阅兵', '国庆出游'],
      greetings: '国庆节快乐，祖国万岁！'
    },
    {
      id: 'mock-zq',
      title: '中秋节',
      date: getNextFixedDate(9, 17), // Approximate for 2026
      type: 'holiday',
      color: HOLIDAY_COLORS["中秋节"],
      description: "团圆佳节，寄托着对家人团聚的美好祝愿",
      createdAt: timestamp,
      holidayType: 'public',
      daysOff: 3,
      traditions: ['赏月', '吃月饼', '猜灯谜'],
      greetings: '中秋快乐，阖家团圆！'
    },
    {
      id: 'mock-dw',
      title: '端午节',
      date: getNextFixedDate(5, 31), // Approximate for 2026
      type: 'holiday',
      color: HOLIDAY_COLORS["端午节"],
      description: "纪念屈原的传统节日，驱邪避瘟保健康",
      createdAt: timestamp,
      holidayType: 'public',
      daysOff: 3,
      traditions: ['赛龙舟', '吃粽子', '挂艾草'],
      greetings: '端午安康！'
    }
  ];

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
