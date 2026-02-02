import { Groq } from 'groq-sdk';
import { AssessmentType, AssessmentLevel } from '../data/assessments';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Required for browser usage - API key will be exposed in client bundle
});

export interface AITip {
  id: number;
  text: string;
  category?: string;
}

const ASSESSMENT_TYPE_NAMES: Record<AssessmentType, string> = {
  anxiety: 'Anxiety',
  depression: 'Depression',
  stress: 'Stress',
  ptsd: 'PTSD',
  relationship: 'Relationship Issues',
  ocd: 'OCD'
};

export const generateAITips = async (
  assessmentType: AssessmentType,
  level: AssessmentLevel,
  score: number,
  maxScore: number
): Promise<AITip[]> => {
  const assessmentName = ASSESSMENT_TYPE_NAMES[assessmentType];
  const percentage = Math.round((score / maxScore) * 100);

  const prompt = `You are a mental health expert. Generate exactly 3 practical, actionable, and personalized tips for managing ${assessmentName} at a ${level} level. 

The user scored ${score} out of ${maxScore} (${percentage}%), indicating ${level} ${assessmentName}.

Requirements:
- Provide exactly 3 tips
- Each tip should be specific, actionable, and evidence-based
- Tips should be appropriate for ${level} severity level
- Keep each tip concise (1-2 sentences)
- Focus on practical strategies the user can implement immediately
- Use a supportive and encouraging tone
- Format as a JSON array with objects containing "id" (1-3) and "text" fields

Return ONLY a valid JSON array, no other text. Example format:
[
  {"id": 1, "text": "Practice deep breathing exercises for 5 minutes twice daily to help regulate your nervous system."},
  {"id": 2, "text": "Establish a consistent sleep schedule, aiming for 7-9 hours of quality sleep each night."},
  {"id": 3, "text": "Engage in regular physical activity, even a 20-minute walk, to boost mood-regulating neurotransmitters."}
]`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-70b-versatile', // Using Groq's optimized model (faster than gpt-oss-20b)
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      stream: false
    });

    const content = chatCompletion.choices[0]?.message?.content || '';

    // Try to parse JSON from the response
    let tips: AITip[] = [];

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      tips = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: try to parse the entire content
      tips = JSON.parse(content);
    }

    // Ensure we have exactly 3 tips
    if (tips.length > 3) {
      tips = tips.slice(0, 3);
    }

    // Validate and format tips
    return tips.map((tip: any, index: number) => ({
      id: tip.id || index + 1,
      text: tip.text || tip.content || String(tip)
    })).slice(0, 3);

  } catch (error) {
    console.error('Error generating AI tips:', error);

    // Fallback to default tips if AI fails
    return getFallbackTips(assessmentType, level);
  }
};

const getFallbackTips = (assessmentType: AssessmentType, level: AssessmentLevel): AITip[] => {
  const fallbackTips: Record<AssessmentType, Record<AssessmentLevel, string[]>> = {
    anxiety: {
      Low: [
        'Continue practicing your current healthy habits and maintain regular anxiety management techniques.',
        'Practice mindfulness and deep breathing exercises to keep anxiety levels low.',
        'Stay physically active and maintain a consistent sleep schedule.'
      ],
      Moderate: [
        'Practice daily relaxation techniques such as deep breathing or progressive muscle relaxation.',
        'Establish a consistent sleep routine and aim for 7-9 hours of quality sleep each night.',
        'Limit caffeine and alcohol intake, as these can exacerbate anxiety symptoms.'
      ],
      High: [
        'Prioritize immediate self-care: ensure adequate sleep, nutrition, and hydration.',
        'Practice stress-reduction techniques multiple times daily, such as box breathing.',
        'Consider speaking with a mental health professional for personalized support.'
      ]
    },
    depression: {
      Low: [
        'Maintain your current healthy habits and continue engaging in activities that bring you joy.',
        'Stay connected with your support network and continue practicing self-care routines.',
        'Keep a regular sleep schedule and maintain a balanced diet.'
      ],
      Moderate: [
        'Establish a daily routine with regular sleep, meals, and activities.',
        'Engage in regular physical activity, even light exercise, to improve mood.',
        'Practice self-compassion and challenge negative thought patterns.'
      ],
      High: [
        'Prioritize immediate self-care: ensure adequate sleep, nutrition, and hydration.',
        'Reach out to your support network immediately for help.',
        'Consider speaking with a mental health professional for urgent support.'
      ]
    },
    stress: {
      Low: [
        'Maintain your current healthy habits and continue practicing stress management techniques.',
        'Practice mindfulness and deep breathing exercises regularly.',
        'Keep a regular sleep schedule and maintain a balanced diet.'
      ],
      Moderate: [
        'Practice daily relaxation techniques such as deep breathing or meditation.',
        'Establish a consistent sleep routine and aim for 7-9 hours of quality sleep.',
        'Set clear boundaries and learn to say no to additional commitments when overwhelmed.'
      ],
      High: [
        'Prioritize immediate self-care: ensure adequate sleep, nutrition, and hydration.',
        'Practice stress-reduction techniques multiple times daily.',
        'Consider speaking with a mental health professional for urgent support.'
      ]
    },
    ptsd: {
      Low: [
        'Continue practicing grounding techniques and maintaining your support network.',
        'Engage in regular physical activity and maintain a consistent daily routine.',
        'Practice mindfulness and relaxation techniques to help manage triggers.'
      ],
      Moderate: [
        'Practice grounding techniques regularly, such as the 5-4-3-2-1 method.',
        'Establish a safe and consistent daily routine to create stability.',
        'Engage in trauma-informed therapy or counseling to process your experiences.'
      ],
      High: [
        'Seek immediate professional help from a trauma-informed therapist.',
        'Practice grounding techniques multiple times daily to manage flashbacks.',
        'Reach out to your support network immediately for help.'
      ]
    },
    relationship: {
      Low: [
        'Continue nurturing your relationships and maintaining healthy communication patterns.',
        'Practice active listening and empathy in your interactions with others.',
        'Maintain healthy boundaries while staying open to connection.'
      ],
      Moderate: [
        'Practice open and honest communication with your loved ones about your needs.',
        'Work on building trust gradually through consistent, reliable actions.',
        'Learn to express your emotions healthily and set appropriate boundaries.'
      ],
      High: [
        'Seek professional help from a relationship counselor or therapist.',
        'Practice self-compassion and work on building self-esteem.',
        'Learn healthy communication skills and conflict resolution strategies.'
      ]
    },
    ocd: {
      Low: [
        'Continue practicing healthy coping strategies and maintaining your current management techniques.',
        'Stay aware of your thoughts and behaviors, and continue monitoring for changes.',
        'Engage in regular physical activity and maintain a balanced lifestyle.'
      ],
      Moderate: [
        'Practice exposure and response prevention (ERP) techniques with professional guidance.',
        'Learn to identify and challenge obsessive thoughts using cognitive-behavioral strategies.',
        'Establish a structured daily routine to help manage compulsive behaviors.'
      ],
      High: [
        'Seek immediate professional help from an OCD specialist or therapist.',
        'Work with a mental health professional to develop a comprehensive treatment plan.',
        'Practice grounding techniques to help manage intense anxiety.'
      ]
    }
  };

  const tips = fallbackTips[assessmentType]?.[level] || fallbackTips[assessmentType]?.Moderate || [];
  return tips.map((text, index) => ({
    id: index + 1,
    text
  }));
};

