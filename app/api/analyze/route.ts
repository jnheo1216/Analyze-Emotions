import { NextResponse } from "next/server";
const emotionQuestions = {
 joy:{type:"noul",instructions:"Does the writer express joy, happiness, delight, or gratitude in this text? Judge the writer's own emotion."},
 sadness:{type:"noul",instructions:"Does the writer express sadness, grief, or disappointment in this text? Judge the writer's own emotion."},
 anger:{type:"noul",instructions:"Does the writer express anger, irritation, or resentment in this text? Judge the writer's own emotion."},
 anxiety:{type:"noul",instructions:"Does the writer express anxiety, worry, fear, or unease in this text? Judge the writer's own emotion."},
 surprise:{type:"noul",instructions:"Does the writer express surprise, shock, or astonishment in this text? Judge the writer's own emotion."},
 disgust:{type:"noul",instructions:"Does the writer express disgust, aversion, or revulsion in this text? Judge the writer's own emotion."},
 calm:{type:"noul",instructions:"Does the writer express calm, serenity, contentment, or emotional ease in this text? Judge the writer's own emotion."},
 anticipation:{type:"noul",instructions:"Does the writer express anticipation, eagerness, hope, or excitement about something forthcoming in this text? Judge the writer's own emotion."},
 loneliness:{type:"noul",instructions:"Does the writer feel lonely, socially isolated, disconnected from others, or longing for companionship in this text? Judge the writer's own emotion."},
 affection:{type:"noul",instructions:"Does the writer express love, affection, tenderness, or caring attachment toward someone or an animal in this text? Judge the writer's own emotion."},
 frustration:{type:"noul",instructions:"Does the writer feel frustrated, thwarted, or discouraged because efforts or a desired goal are blocked in this text? Judge the writer's own emotion."},
} as const;
const sinQuestions = {
 pride:{type:"noul",instructions:"Does the writer express arrogant superiority, vanity, or excessive self-importance? Do not count healthy confidence alone. Judge the writer's own attitude."},
 greed:{type:"noul",instructions:"Does the writer express an excessive desire to acquire or keep money, possessions, or power? Do not count ordinary ambition or practical need alone. Judge the writer's own attitude."},
 lust:{type:"noul",instructions:"Does the writer express intense sexual desire or objectifying attraction? Do not count ordinary affection or love alone. Judge the writer's own attitude."},
 envy:{type:"noul",instructions:"Does the writer resentfully long for another person's success, possessions, status, or relationship? Do not count admiration alone. Judge the writer's own attitude."},
 gluttony:{type:"noul",instructions:"Does the writer express excessive indulgence in food, drink, or consumption beyond need? Do not count ordinary hunger or enjoyment alone. Judge the writer's own attitude."},
 wrath:{type:"noul",instructions:"Does the writer express intense rage, vindictiveness, or a desire to punish or retaliate? Do not count mild irritation alone. Judge the writer's own attitude."},
 sloth:{type:"noul",instructions:"Does the writer knowingly avoid responsibilities through apathy or unwillingness to act? Do not count fatigue, illness, or needed rest alone. Judge the writer's own attitude."},
} as const;
export async function POST(request:Request){
 let body:{text?:unknown;mode?:unknown};try{body=await request.json()}catch{return NextResponse.json({error:"올바른 요청이 아닙니다."},{status:400})}
 const text=typeof body.text==="string"?body.text.trim():"";
 if(!text||text.length>2000)return NextResponse.json({error:"1~2,000자의 텍스트를 입력해 주세요."},{status:400});
 if(body.mode!==undefined&&body.mode!=="emotion"&&body.mode!=="sin")return NextResponse.json({error:"올바른 분석 모드가 아닙니다."},{status:400});
 const questions=body.mode==="sin"?sinQuestions:emotionQuestions;
 const apiKey=process.env.TYPESAFE_API_KEY;
 if(!apiKey)return NextResponse.json({error:"Jev 분석 연결이 아직 준비되지 않았습니다.",code:"missing_key"},{status:503});
 try{
  const upstream=await fetch("https://api.typesafe.ai/v1/systemone",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:"jev-latest",state:text,questions}),signal:AbortSignal.timeout(15000),cache:"no-store"});
  if(!upstream.ok)return NextResponse.json({error:upstream.status===401?"Jev API 키를 확인해 주세요.":"Jev 분석 서버에서 응답하지 않았습니다. 잠시 후 다시 시도해 주세요."},{status:502});
  const result=await upstream.json() as {answers?:Record<string,{type?:string;noul?:number}>};
  const scores:Record<string,number>={};
  for(const key of Object.keys(questions)){const answer=result.answers?.[key];if(answer?.type!=="noul"||typeof answer.noul!=="number"||!Number.isFinite(answer.noul))throw new Error("Invalid Jev response");scores[key]=Math.max(0,Math.min(1,answer.noul))}
  return NextResponse.json({scores});
 }catch{return NextResponse.json({error:"분석 연결에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요."},{status:502})}
}
