import { useState, useEffect, useMemo } from 'react';
import AnimatedList from './AnimatedList';
import { useTheme } from '../contexts/ThemeContext';

interface ArticlesScreenProps {
  isVisible: boolean;
  onBack?: () => void;
  initialCategory?: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  content: string;
  date: string;
}

export default function ArticlesScreen({ isVisible, onBack, initialCategory }: ArticlesScreenProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { theme } = useTheme();

  // Generate random star positions (memoized for performance)
  const stars = useMemo(() => {
    if (theme !== 'dark') return [];
    const starArray = [];
    const starCount = 20;
    for (let i = 0; i < starCount; i++) {
      const size = Math.random() < 0.33 ? 'small' : Math.random() < 0.66 ? 'medium' : 'large';
      starArray.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: size,
        delay: Math.random() * 2
      });
    }
    return starArray;
  }, [theme]);

  if (!isVisible) return null;

  // Theme-aware colors
  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const bgHeader = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(162, 173, 156, 0.4)';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';

  const articles: Article[] = [
    {
      id: '1',
      title: 'Understanding Anxiety: A Comprehensive Guide',
      excerpt: 'Learn about anxiety, its symptoms, and effective coping strategies to manage daily stress and worry.',
      readTime: '5 min read',
      category: 'Mental Health',
      content: 'Anxiety is a natural response to stress, but when it becomes overwhelming, it can significantly impact daily life. This article explores the different types of anxiety, common symptoms, and evidence-based strategies for management. We\'ll cover techniques like deep breathing, progressive muscle relaxation, and cognitive reframing that can help you regain control and find peace in challenging moments.',
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'The Power of Mindfulness in Daily Life',
      excerpt: 'Discover how mindfulness practices can improve your mental well-being and help you stay present.',
      readTime: '4 min read',
      category: 'Wellness',
      content: 'Mindfulness is the practice of being fully present in the moment, without judgment. Research shows that regular mindfulness practice can reduce stress, improve focus, and enhance overall well-being. Learn simple techniques you can incorporate into your daily routine, from mindful breathing to body scans, that will help you cultivate a greater sense of calm and awareness.',
      date: '2024-01-12'
    },
    {
      id: '3',
      title: 'Building Resilience: Strategies for Tough Times',
      excerpt: 'Learn practical techniques to build emotional resilience and navigate life\'s challenges with strength.',
      readTime: '6 min read',
      category: 'Self-Care',
      content: 'Resilience is the ability to bounce back from adversity. This article provides actionable strategies for developing resilience, including building a support network, practicing self-compassion, and maintaining perspective. Discover how to reframe setbacks as opportunities for growth and develop the mental fortitude needed to thrive in difficult circumstances.',
      date: '2024-01-10'
    },
    {
      id: '4',
      title: 'Managing Depression: A Holistic Approach',
      excerpt: 'Explore comprehensive strategies for managing depression, from therapy to lifestyle changes.',
      readTime: '7 min read',
      category: 'Mental Health',
      content: 'Depression affects millions of people worldwide, but there are many effective ways to manage it. This article covers evidence-based treatments, lifestyle modifications, and self-care practices that can help. Learn about the importance of social connection, regular exercise, proper sleep, and when to seek professional help.',
      date: '2024-01-08'
    },
    {
      id: '5',
      title: 'Digital Wellness: Finding Balance in a Connected World',
      excerpt: 'Learn how to maintain healthy relationships with technology and protect your mental health online.',
      readTime: '5 min read',
      category: 'Wellness',
      content: 'In our hyper-connected world, digital wellness has become crucial for mental health. Discover strategies for setting healthy boundaries with technology, managing screen time, and creating digital detox routines. Learn how to use social media mindfully and protect your peace in the digital age.',
      date: '2024-01-05'
    },
    {
      id: '6',
      title: 'The Science of Sleep: Improving Your Rest Quality',
      excerpt: 'Understand the connection between sleep and mental health, and learn techniques for better rest.',
      readTime: '6 min read',
      category: 'Wellness',
      content: 'Quality sleep is foundational to mental health and well-being. This article explores the science behind sleep, common sleep disorders, and practical strategies for improving your sleep hygiene. Learn about creating the perfect sleep environment, establishing healthy bedtime routines, and managing sleep-related anxiety.',
      date: '2024-01-03'
    },
    {
      id: '7',
      title: 'Effective Communication in Relationships',
      excerpt: 'Master the art of healthy communication to strengthen your relationships and reduce conflict.',
      readTime: '5 min read',
      category: 'Self-Care',
      content: 'Healthy communication is the cornerstone of strong relationships. Learn active listening techniques, how to express your needs clearly, and strategies for navigating difficult conversations. Discover how to set boundaries, practice empathy, and build deeper connections with those you care about.',
      date: '2024-01-01'
    },
    {
      id: '8',
      title: 'Stress Management Techniques That Actually Work',
      excerpt: 'Discover proven methods for managing stress and preventing burnout in your daily life.',
      readTime: '6 min read',
      category: 'Mental Health',
      content: 'Chronic stress can take a significant toll on your mental and physical health. This article provides evidence-based stress management techniques, including time management strategies, relaxation exercises, and lifestyle modifications. Learn how to identify your stress triggers and develop a personalized stress management plan.',
      date: '2023-12-28'
    },
    {
      id: '9',
      title: 'The Art of Self-Compassion',
      excerpt: 'Learn how to treat yourself with kindness and understanding, especially during difficult times.',
      readTime: '4 min read',
      category: 'Self-Care',
      content: 'Self-compassion involves treating yourself with the same kindness and understanding you would offer a good friend. Research shows that self-compassion is linked to greater emotional resilience, reduced anxiety, and improved well-being. Discover practical exercises for cultivating self-compassion and quieting your inner critic.',
      date: '2023-12-25'
    },
    {
      id: '10',
      title: 'Meditation for Beginners: A Step-by-Step Guide',
      excerpt: 'Start your meditation journey with simple, accessible techniques for daily practice.',
      readTime: '5 min read',
      category: 'Wellness',
      content: 'Meditation doesn\'t have to be complicated. This beginner-friendly guide introduces you to various meditation techniques, from focused attention to loving-kindness meditation. Learn how to start a daily practice, overcome common obstacles, and experience the mental clarity and peace that meditation can bring.',
      date: '2023-12-22'
    },
    {
      id: '11',
      title: 'Understanding and Managing Panic Attacks',
      excerpt: 'Learn about panic attacks, their symptoms, and effective strategies for managing them.',
      readTime: '6 min read',
      category: 'Mental Health',
      content: 'Panic attacks can be frightening and overwhelming experiences. This article explains what panic attacks are, their common symptoms, and evidence-based techniques for managing them. Learn grounding exercises, breathing techniques, and cognitive strategies that can help you regain control during a panic attack.',
      date: '2023-12-20'
    },
    {
      id: '12',
      title: 'Creating Healthy Boundaries in Your Life',
      excerpt: 'Learn how to set and maintain healthy boundaries to protect your mental and emotional well-being.',
      readTime: '5 min read',
      category: 'Self-Care',
      content: 'Healthy boundaries are essential for maintaining your mental health and preserving your energy. This article teaches you how to identify when boundaries are needed, communicate them effectively, and handle pushback. Discover how setting boundaries can actually improve your relationships and reduce stress.',
      date: '2023-12-18'
    },
    {
      id: '13',
      title: 'The Benefits of Journaling for Mental Health',
      excerpt: 'Discover how regular journaling can improve your mental well-being and emotional processing.',
      readTime: '4 min read',
      category: 'Wellness',
      content: 'Journaling is a powerful tool for mental health that can help you process emotions, reduce stress, and gain clarity. Learn different journaling techniques, from gratitude journaling to stream-of-consciousness writing. Discover prompts and exercises that can help you get started and maintain a consistent practice.',
      date: '2023-12-15'
    },
    {
      id: '14',
      title: 'Coping with Grief and Loss',
      excerpt: 'Navigate the grieving process with compassion and understanding for yourself and others.',
      readTime: '7 min read',
      category: 'Mental Health',
      content: 'Grief is a natural response to loss, but it can be one of the most challenging emotional experiences. This article explores the stages of grief, common reactions, and healthy coping strategies. Learn how to support yourself through the grieving process and when to seek additional help.',
      date: '2023-12-12'
    },
    {
      id: '15',
      title: 'Building Healthy Habits for Long-Term Wellness',
      excerpt: 'Learn how to create sustainable habits that support your mental and physical health.',
      readTime: '6 min read',
      category: 'Wellness',
      content: 'Building healthy habits is key to long-term wellness, but it can be challenging to make lasting changes. This article provides evidence-based strategies for habit formation, including the importance of starting small, creating environmental cues, and maintaining consistency. Learn how to break old patterns and build new ones that serve your well-being.',
      date: '2023-12-10'
    },
    {
      id: '16',
      title: 'Understanding PTSD and Trauma Recovery',
      excerpt: 'Learn about PTSD, its symptoms, and pathways to healing and recovery.',
      readTime: '7 min read',
      category: 'Mental Health',
      content: 'Post-traumatic stress disorder (PTSD) can develop after experiencing or witnessing a traumatic event. This article explains PTSD symptoms, common triggers, and evidence-based treatments. Learn about trauma-informed approaches to healing and the importance of professional support in the recovery process.',
      date: '2023-12-08'
    },
    {
      id: '17',
      title: 'The Mind-Body Connection: How Physical Health Affects Mental Health',
      excerpt: 'Explore the powerful connection between physical and mental well-being.',
      readTime: '5 min read',
      category: 'Wellness',
      content: 'The mind and body are deeply interconnected. This article explores how physical health impacts mental health, from the role of exercise and nutrition to the effects of chronic illness. Learn practical ways to support both your physical and mental well-being through integrated lifestyle choices.',
      date: '2023-12-05'
    },
    {
      id: '18',
      title: 'Managing Work-Life Balance for Better Mental Health',
      excerpt: 'Learn strategies for creating healthy boundaries between work and personal life.',
      readTime: '6 min read',
      category: 'Self-Care',
      content: 'Achieving work-life balance is crucial for mental health, but it can be challenging in our fast-paced world. This article provides practical strategies for setting boundaries, managing time effectively, and preventing burnout. Learn how to prioritize self-care while maintaining professional responsibilities.',
      date: '2023-12-03'
    }
  ];

  if (selectedArticle) {
    return (
      <>
      {/* Sun/Moon - Fixed position, outside scrollable container */}
      {theme === 'dark' ? (
        <div className="moon-container">
          <div className="moon-glow"></div>
          <div className="moon"></div>
        </div>
      ) : (
        <div className="sun-container">
          <div className="sun-glow"></div>
          <div className="sun"></div>
        </div>
      )}
      
      {/* Twinkling Stars - Only in dark theme */}
      {theme === 'dark' && (
        <div className="stars-container">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`star star-${star.size}`}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Multiple organic clouds - Fixed position, outside scrollable container */}
      <div className="cloud-wrapper">
        <img src="/assets/cloud.png" alt="" className="cloud" />
        <img src="/assets/cloud.png" alt="" className="cloud-middle" />
        <img src="/assets/cloud.png" alt="" className="cloud-lower" />
      </div>
      
      <div className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-20 theme-transition scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', backgroundColor: bgColor }}>

        {/* Header */}
        <div className="backdrop-blur-md border-b px-4 py-4 shadow-sm safe-top relative z-20 theme-transition" style={{ backgroundColor: bgHeader, borderColor: borderColor }}>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setSelectedArticle(null)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target flex-shrink-0 theme-transition"
              style={{ activeBackgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Back to articles"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={iconColor} />
              </svg>
            </button>
            <div className="flex-1">
              <h1
                className="text-[24px] font-medium theme-transition"
                style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
              >
                Article
              </h1>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="py-6 safe-bottom relative z-10">
          <div className="mb-4 px-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium theme-transition"
              style={{ 
                      fontFamily: "'Fira Sans', sans-serif",
                backgroundColor: theme === 'dark' ? `${accentColor}20` : `${accentColor}20`,
                color: accentColor
              }}
            >
              {selectedArticle.category}
            </span>
          </div>

          <h2
            className="text-[24px] font-medium mb-3 px-4 theme-transition"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
          >
            {selectedArticle.title}
          </h2>

          <div className="flex items-center gap-3 mb-4 text-sm px-4 theme-transition" style={{ color: textSecondary }}>
            <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
              {selectedArticle.readTime}
            </span>
            <span>•</span>
            <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
              {new Date(selectedArticle.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="mx-4 backdrop-blur-sm border rounded-2xl p-5 theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <p
              className="text-sm font-light leading-relaxed whitespace-pre-line theme-transition"
              style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
            >
              {selectedArticle.content}
            </p>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {/* Sun/Moon - Fixed position, outside scrollable container */}
      {theme === 'dark' ? (
        <div className="moon-container">
          <div className="moon-glow"></div>
          <div className="moon"></div>
        </div>
      ) : (
        <div className="sun-container">
          <div className="sun-glow"></div>
          <div className="sun"></div>
        </div>
      )}
      
      {/* Twinkling Stars - Only in dark theme */}
      {theme === 'dark' && (
        <div className="stars-container">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`star star-${star.size}`}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Multiple organic clouds - Fixed position, outside scrollable container */}
      <div className="cloud-wrapper">
        <img src="/assets/cloud.png" alt="" className="cloud" />
        <img src="/assets/cloud.png" alt="" className="cloud-middle" />
        <img src="/assets/cloud.png" alt="" className="cloud-lower" />
      </div>
      
    <div className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-20 theme-transition scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', backgroundColor: bgColor }}>

      {/* Header */}
      <div className="backdrop-blur-xl border-b px-4 py-3 shadow-sm safe-top relative z-20 theme-transition" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 245, 242, 0.8)', borderColor: borderColor }}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target flex-shrink-0 theme-transition"
              style={{ activeBackgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={iconColor} />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <h1
              className="text-[20px] font-medium theme-transition"
              style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
            >
              Mindful Articles
            </h1>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="py-6 pb-24 safe-bottom relative z-10" style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom) + 60px)' }}>
        {articles.length === 0 ? (
          <div className="mx-4 backdrop-blur-sm border rounded-2xl p-8 text-center theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
            <p
              className="font-light theme-transition"
              style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
            >
              No articles available yet.
            </p>
          </div>
        ) : (
          <AnimatedList
            items={articles.map(article => ({
              title: article.title,
              readTime: article.readTime,
              category: article.category,
              excerpt: article.excerpt
            }))}
            onItemSelect={(item, index) => {
              const selectedArticle = articles[index];
              if (selectedArticle) {
                setSelectedArticle(selectedArticle);
              }
            }}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={false}
            className="w-full"
          />
        )}
      </div>
    </div>
    </>
  );
}

