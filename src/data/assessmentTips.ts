import { AssessmentType, AssessmentLevel } from './assessments';

export interface AssessmentTip {
  id: number;
  text: string;
}

export const ASSESSMENT_TIPS: Record<AssessmentType, Record<AssessmentLevel, AssessmentTip[]>> = {
  anxiety: {
    Low: [
      {
        id: 1,
        text: 'Maintain your current healthy habits and continue practicing anxiety management techniques regularly.'
      },
      {
        id: 2,
        text: 'Practice deep breathing exercises and mindfulness meditation to keep anxiety levels low.'
      },
      {
        id: 3,
        text: 'Stay physically active and maintain a regular sleep schedule to support your mental well-being.'
      },
      {
        id: 4,
        text: 'Continue monitoring your anxiety levels and seek support if you notice any changes.'
      },
      {
        id: 5,
        text: 'Engage in activities you enjoy and maintain social connections to support your mental health.'
      }
    ],
    Moderate: [
      {
        id: 1,
        text: 'Practice daily relaxation techniques such as deep breathing, progressive muscle relaxation, or guided meditation.'
      },
      {
        id: 2,
        text: 'Establish a consistent sleep routine and aim for 7-9 hours of quality sleep each night.'
      },
      {
        id: 3,
        text: 'Engage in regular physical activity, even if it\'s just a 20-minute walk, to help reduce anxiety symptoms.'
      },
      {
        id: 4,
        text: 'Limit caffeine and alcohol intake, as these can exacerbate anxiety symptoms.'
      },
      {
        id: 5,
        text: 'Consider talking to TARA or booking a session with a mental health professional for personalized support.'
      }
    ],
    High: [
      {
        id: 1,
        text: 'Prioritize immediate self-care: ensure adequate sleep, nutrition, and hydration to support your body during high anxiety.'
      },
      {
        id: 2,
        text: 'Practice stress-reduction techniques multiple times daily, such as box breathing or 4-7-8 breathing.'
      },
      {
        id: 3,
        text: 'Reach out to your support network immediately - don\'t hesitate to ask for help from friends, family, or professionals.'
      },
      {
        id: 4,
        text: 'Consider speaking with TARA right away or booking an appointment with a mental health professional for urgent support.'
      },
      {
        id: 5,
        text: 'Identify and reduce sources of anxiety where possible, and develop a plan to manage unavoidable stressors more effectively.'
      }
    ]
  },
  depression: {
    Low: [
      {
        id: 1,
        text: 'Maintain your current healthy habits and continue engaging in activities that bring you joy.'
      },
      {
        id: 2,
        text: 'Stay connected with your support network and continue practicing self-care routines.'
      },
      {
        id: 3,
        text: 'Keep a regular sleep schedule and maintain a balanced diet to support your overall well-being.'
      },
      {
        id: 4,
        text: 'Continue monitoring your mood and seek support if you notice any changes.'
      },
      {
        id: 5,
        text: 'Engage in regular physical activity and maintain social connections to support your mental health.'
      }
    ],
    Moderate: [
      {
        id: 1,
        text: 'Establish a daily routine with regular sleep, meals, and activities to provide structure and stability.'
      },
      {
        id: 2,
        text: 'Engage in regular physical activity, even light exercise, as it can help improve mood and energy levels.'
      },
      {
        id: 3,
        text: 'Practice self-compassion and challenge negative thought patterns with positive affirmations.'
      },
      {
        id: 4,
        text: 'Stay connected with supportive friends and family members, and don\'t isolate yourself.'
      },
      {
        id: 5,
        text: 'Consider talking to TARA or booking a session with a mental health professional for personalized support and treatment options.'
      }
    ],
    High: [
      {
        id: 1,
        text: 'Prioritize immediate self-care: ensure adequate sleep, nutrition, and hydration to support your body during this difficult time.'
      },
      {
        id: 2,
        text: 'Reach out to your support network immediately - don\'t hesitate to ask for help from friends, family, or professionals.'
      },
      {
        id: 3,
        text: 'Consider speaking with TARA right away or booking an appointment with a mental health professional for urgent support.'
      },
      {
        id: 4,
        text: 'If you\'re having thoughts of self-harm, contact a crisis helpline or emergency services immediately.'
      },
      {
        id: 5,
        text: 'Engage in small, manageable activities each day, even if you don\'t feel like it, to help maintain routine and purpose.'
      }
    ]
  },
  stress: {
    Low: [
      {
        id: 1,
        text: 'Maintain your current healthy habits and continue practicing stress management techniques regularly.'
      },
      {
        id: 2,
        text: 'Stay connected with your support network and continue engaging in activities you enjoy.'
      },
      {
        id: 3,
        text: 'Practice mindfulness and deep breathing exercises to maintain your low stress levels.'
      },
      {
        id: 4,
        text: 'Keep a regular sleep schedule and maintain a balanced diet to support your overall well-being.'
      },
      {
        id: 5,
        text: 'Continue monitoring your stress levels and seek support if you notice any changes.'
      }
    ],
    Moderate: [
      {
        id: 1,
        text: 'Practice daily relaxation techniques such as deep breathing, meditation, or progressive muscle relaxation.'
      },
      {
        id: 2,
        text: 'Establish a consistent sleep routine and aim for 7-9 hours of quality sleep each night.'
      },
      {
        id: 3,
        text: 'Engage in regular physical activity, even if it\'s just a 20-minute walk, to help reduce stress hormones.'
      },
      {
        id: 4,
        text: 'Set clear boundaries and learn to say no to additional commitments when you feel overwhelmed.'
      },
      {
        id: 5,
        text: 'Consider talking to TARA or booking a session with a mental health professional for personalized support.'
      }
    ],
    High: [
      {
        id: 1,
        text: 'Prioritize immediate self-care: ensure adequate sleep, nutrition, and hydration to support your body during high stress.'
      },
      {
        id: 2,
        text: 'Practice stress-reduction techniques multiple times daily, such as box breathing or guided meditation.'
      },
      {
        id: 3,
        text: 'Reach out to your support network immediately - don\'t hesitate to ask for help from friends, family, or professionals.'
      },
      {
        id: 4,
        text: 'Consider speaking with TARA right away or booking an appointment with a mental health professional for urgent support.'
      },
      {
        id: 5,
        text: 'Identify and reduce sources of stress where possible, and develop a plan to manage unavoidable stressors more effectively.'
      }
    ]
  },
  ptsd: {
    Low: [
      {
        id: 1,
        text: 'Continue practicing grounding techniques and maintaining your support network.'
      },
      {
        id: 2,
        text: 'Engage in regular physical activity and maintain a consistent daily routine.'
      },
      {
        id: 3,
        text: 'Practice mindfulness and relaxation techniques to help manage any triggers that arise.'
      },
      {
        id: 4,
        text: 'Stay connected with trusted friends, family, or support groups who understand your experience.'
      },
      {
        id: 5,
        text: 'Continue monitoring your symptoms and seek professional help if you notice any changes.'
      }
    ],
    Moderate: [
      {
        id: 1,
        text: 'Practice grounding techniques regularly, such as the 5-4-3-2-1 method, to help manage flashbacks and anxiety.'
      },
      {
        id: 2,
        text: 'Establish a safe and consistent daily routine to help create a sense of stability and control.'
      },
      {
        id: 3,
        text: 'Engage in trauma-informed therapy or counseling to process your experiences in a safe environment.'
      },
      {
        id: 4,
        text: 'Build a support network of trusted individuals who understand trauma and can provide emotional support.'
      },
      {
        id: 5,
        text: 'Consider talking to TARA or booking a session with a trauma-informed mental health professional for specialized support.'
      }
    ],
    High: [
      {
        id: 1,
        text: 'Seek immediate professional help from a trauma-informed therapist or mental health professional.'
      },
      {
        id: 2,
        text: 'Practice grounding techniques multiple times daily to help manage intense flashbacks, nightmares, or dissociation.'
      },
      {
        id: 3,
        text: 'Reach out to your support network immediately - don\'t hesitate to ask for help from trusted friends, family, or professionals.'
      },
      {
        id: 4,
        text: 'Consider speaking with TARA right away or booking an appointment with a trauma specialist for urgent support.'
      },
      {
        id: 5,
        text: 'If you\'re having thoughts of self-harm, contact a crisis helpline or emergency services immediately.'
      }
    ]
  },
  relationship: {
    Low: [
      {
        id: 1,
        text: 'Continue nurturing your relationships and maintaining healthy communication patterns.'
      },
      {
        id: 2,
        text: 'Practice active listening and empathy in your interactions with others.'
      },
      {
        id: 3,
        text: 'Maintain healthy boundaries while staying open to connection and intimacy.'
      },
      {
        id: 4,
        text: 'Continue building trust through consistent, reliable behavior in your relationships.'
      },
      {
        id: 5,
        text: 'Engage in activities that strengthen your relationships and create positive shared experiences.'
      }
    ],
    Moderate: [
      {
        id: 1,
        text: 'Practice open and honest communication with your loved ones about your needs and feelings.'
      },
      {
        id: 2,
        text: 'Work on building trust gradually through consistent, reliable actions and follow-through on commitments.'
      },
      {
        id: 3,
        text: 'Learn to express your emotions healthily and set appropriate boundaries in relationships.'
      },
      {
        id: 4,
        text: 'Consider relationship counseling or therapy to address attachment patterns and communication issues.'
      },
      {
        id: 5,
        text: 'Consider talking to TARA or booking a session with a relationship counselor for personalized guidance.'
      }
    ],
    High: [
      {
        id: 1,
        text: 'Seek professional help from a relationship counselor or therapist to address significant attachment and trust issues.'
      },
      {
        id: 2,
        text: 'Practice self-compassion and work on building self-esteem, as this forms the foundation for healthy relationships.'
      },
      {
        id: 3,
        text: 'Learn healthy communication skills and conflict resolution strategies to improve your relationships.'
      },
      {
        id: 4,
        text: 'Consider speaking with TARA right away or booking an appointment with a relationship specialist for urgent support.'
      },
      {
        id: 5,
        text: 'Focus on understanding your attachment style and how it affects your relationships, then work on developing secure attachment patterns.'
      }
    ]
  },
  ocd: {
    Low: [
      {
        id: 1,
        text: 'Continue practicing healthy coping strategies and maintaining your current management techniques.'
      },
      {
        id: 2,
        text: 'Stay aware of your thoughts and behaviors, and continue monitoring for any changes in patterns.'
      },
      {
        id: 3,
        text: 'Engage in regular physical activity and maintain a balanced lifestyle to support your mental well-being.'
      },
      {
        id: 4,
        text: 'Practice mindfulness and relaxation techniques to help manage any intrusive thoughts that arise.'
      },
      {
        id: 5,
        text: 'Continue monitoring your symptoms and seek professional help if you notice any worsening.'
      }
    ],
    Moderate: [
      {
        id: 1,
        text: 'Practice exposure and response prevention (ERP) techniques with guidance from a mental health professional.'
      },
      {
        id: 2,
        text: 'Learn to identify and challenge obsessive thoughts using cognitive-behavioral strategies.'
      },
      {
        id: 3,
        text: 'Establish a structured daily routine to help manage compulsive behaviors and reduce anxiety.'
      },
      {
        id: 4,
        text: 'Work with a therapist specializing in OCD to develop personalized treatment strategies.'
      },
      {
        id: 5,
        text: 'Consider talking to TARA or booking a session with an OCD specialist for evidence-based treatment support.'
      }
    ],
    High: [
      {
        id: 1,
        text: 'Seek immediate professional help from an OCD specialist or therapist trained in exposure and response prevention (ERP) therapy.'
      },
      {
        id: 2,
        text: 'Work with a mental health professional to develop a comprehensive treatment plan, which may include therapy and medication.'
      },
      {
        id: 3,
        text: 'Practice grounding techniques to help manage intense anxiety and prevent compulsive behaviors when possible.'
      },
      {
        id: 4,
        text: 'Consider speaking with TARA right away or booking an appointment with an OCD specialist for urgent support.'
      },
      {
        id: 5,
        text: 'Build a support network of understanding friends and family, and consider joining an OCD support group for additional resources.'
      }
    ]
  }
};

export const getAssessmentTips = (assessmentType: AssessmentType, level: AssessmentLevel): AssessmentTip[] => {
  return ASSESSMENT_TIPS[assessmentType]?.[level] || ASSESSMENT_TIPS[assessmentType]?.Moderate || [];
};

