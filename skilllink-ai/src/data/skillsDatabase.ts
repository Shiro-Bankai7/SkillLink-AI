// Comprehensive Skills Database for SkillLink AI
export interface Skill {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  tools?: string[];
  relatedSkills: string[];
  marketDemand: 'low' | 'medium' | 'high' | 'very-high';
  avgHourlyRate?: number;
  learningTimeWeeks: number;
}

export const skillsDatabase: Skill[] = [
  // Programming & Development
  {
    id: 'react',
    name: 'React.js',
    category: 'Programming',
    subcategory: 'Frontend',
    difficulty: 'intermediate',
    description: 'Build interactive user interfaces with React',
    tools: ['VS Code', 'Node.js', 'npm', 'Webpack'],
    relatedSkills: ['javascript', 'html', 'css', 'typescript'],
    marketDemand: 'very-high',
    avgHourlyRate: 75,
    learningTimeWeeks: 8
  },
  {
    id: 'python',
    name: 'Python Programming',
    category: 'Programming',
    subcategory: 'Backend',
    difficulty: 'beginner',
    description: 'Learn Python for web development, data science, and automation',
    tools: ['PyCharm', 'Jupyter', 'pip', 'virtualenv'],
    relatedSkills: ['django', 'flask', 'data-science', 'machine-learning'],
    marketDemand: 'very-high',
    avgHourlyRate: 70,
    learningTimeWeeks: 6
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Programming',
    subcategory: 'Frontend',
    difficulty: 'beginner',
    description: 'Master the language of the web',
    tools: ['VS Code', 'Chrome DevTools', 'Node.js'],
    relatedSkills: ['react', 'vue', 'angular', 'typescript'],
    marketDemand: 'very-high',
    avgHourlyRate: 65,
    learningTimeWeeks: 4
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Programming',
    subcategory: 'Frontend',
    difficulty: 'intermediate',
    description: 'Add type safety to JavaScript applications',
    tools: ['VS Code', 'TypeScript Compiler', 'ESLint'],
    relatedSkills: ['javascript', 'react', 'angular', 'node'],
    marketDemand: 'high',
    avgHourlyRate: 80,
    learningTimeWeeks: 3
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Programming',
    subcategory: 'Backend',
    difficulty: 'intermediate',
    description: 'Server-side JavaScript development',
    tools: ['VS Code', 'npm', 'Express.js', 'MongoDB'],
    relatedSkills: ['javascript', 'express', 'mongodb', 'api-development'],
    marketDemand: 'very-high',
    avgHourlyRate: 75,
    learningTimeWeeks: 6
  },
  {
    id: 'vue',
    name: 'Vue.js',
    category: 'Programming',
    subcategory: 'Frontend',
    difficulty: 'intermediate',
    description: 'Progressive JavaScript framework',
    tools: ['Vue CLI', 'Vite', 'Vuex', 'Vue Router'],
    relatedSkills: ['javascript', 'html', 'css', 'nuxt'],
    marketDemand: 'high',
    avgHourlyRate: 70,
    learningTimeWeeks: 6
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'Programming',
    subcategory: 'Frontend',
    difficulty: 'advanced',
    description: 'Enterprise-grade frontend framework',
    tools: ['Angular CLI', 'TypeScript', 'RxJS', 'Angular Material'],
    relatedSkills: ['typescript', 'rxjs', 'html', 'css'],
    marketDemand: 'high',
    avgHourlyRate: 85,
    learningTimeWeeks: 10
  },
  {
    id: 'django',
    name: 'Django',
    category: 'Programming',
    subcategory: 'Backend',
    difficulty: 'intermediate',
    description: 'High-level Python web framework',
    tools: ['Django', 'PostgreSQL', 'Redis', 'Celery'],
    relatedSkills: ['python', 'postgresql', 'html', 'css'],
    marketDemand: 'high',
    avgHourlyRate: 75,
    learningTimeWeeks: 8
  },
  {
    id: 'flask',
    name: 'Flask',
    category: 'Programming',
    subcategory: 'Backend',
    difficulty: 'intermediate',
    description: 'Lightweight Python web framework',
    tools: ['Flask', 'SQLAlchemy', 'Jinja2', 'Werkzeug'],
    relatedSkills: ['python', 'sql', 'html', 'css'],
    marketDemand: 'medium',
    avgHourlyRate: 70,
    learningTimeWeeks: 6
  },
  {
    id: 'go',
    name: 'Go Programming',
    category: 'Programming',
    subcategory: 'Backend',
    difficulty: 'intermediate',
    description: 'Fast, statically typed programming language',
    tools: ['Go', 'VS Code', 'Docker', 'Kubernetes'],
    relatedSkills: ['docker', 'kubernetes', 'microservices', 'api-development'],
    marketDemand: 'high',
    avgHourlyRate: 90,
    learningTimeWeeks: 8
  },
  {
    id: 'rust',
    name: 'Rust Programming',
    category: 'Programming',
    subcategory: 'Systems',
    difficulty: 'advanced',
    description: 'Systems programming language focused on safety and performance',
    tools: ['Rust', 'Cargo', 'VS Code', 'rustfmt'],
    relatedSkills: ['c++', 'systems-programming', 'webassembly'],
    marketDemand: 'medium',
    avgHourlyRate: 95,
    learningTimeWeeks: 12
  },
  {
    id: 'swift',
    name: 'Swift',
    category: 'Programming',
    subcategory: 'Mobile',
    difficulty: 'intermediate',
    description: 'iOS and macOS app development',
    tools: ['Xcode', 'Swift Playgrounds', 'Instruments'],
    relatedSkills: ['ios-development', 'xcode', 'objective-c'],
    marketDemand: 'high',
    avgHourlyRate: 85,
    learningTimeWeeks: 10
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    category: 'Programming',
    subcategory: 'Mobile',
    difficulty: 'intermediate',
    description: 'Modern programming language for Android development',
    tools: ['Android Studio', 'IntelliJ IDEA', 'Gradle'],
    relatedSkills: ['android-development', 'java', 'android-studio'],
    marketDemand: 'high',
    avgHourlyRate: 80,
    learningTimeWeeks: 8
  },
  {
    id: 'java',
    name: 'Java',
    category: 'Programming',
    subcategory: 'Backend',
    difficulty: 'intermediate',
    description: 'Enterprise-grade programming language',
    tools: ['IntelliJ IDEA', 'Eclipse', 'Maven', 'Gradle'],
    relatedSkills: ['spring', 'hibernate', 'maven', 'gradle'],
    marketDemand: 'very-high',
    avgHourlyRate: 75,
    learningTimeWeeks: 10
  },
  {
    id: 'csharp',
    name: 'C#',
    category: 'Programming',
    subcategory: 'Backend',
    difficulty: 'intermediate',
    description: 'Microsoft\'s object-oriented programming language',
    tools: ['Visual Studio', '.NET', 'NuGet', 'Azure'],
    relatedSkills: ['dotnet', 'asp-net', 'azure', 'sql-server'],
    marketDemand: 'high',
    avgHourlyRate: 80,
    learningTimeWeeks: 8
  },

  // Design & Creative
  {
    id: 'figma',
    name: 'Figma',
    category: 'Design',
    subcategory: 'UI/UX',
    difficulty: 'beginner',
    description: 'Collaborative interface design tool',
    tools: ['Figma', 'FigJam', 'Figma Plugins'],
    relatedSkills: ['ui-design', 'ux-design', 'prototyping', 'design-systems'],
    marketDemand: 'very-high',
    avgHourlyRate: 65,
    learningTimeWeeks: 4
  },
  {
    id: 'adobe-photoshop',
    name: 'Adobe Photoshop',
    category: 'Design',
    subcategory: 'Graphics',
    difficulty: 'intermediate',
    description: 'Professional image editing and manipulation',
    tools: ['Photoshop', 'Camera Raw', 'Bridge'],
    relatedSkills: ['photo-editing', 'digital-art', 'graphic-design'],
    marketDemand: 'high',
    avgHourlyRate: 55,
    learningTimeWeeks: 8
  },
  {
    id: 'adobe-illustrator',
    name: 'Adobe Illustrator',
    category: 'Design',
    subcategory: 'Graphics',
    difficulty: 'intermediate',
    description: 'Vector graphics and illustration',
    tools: ['Illustrator', 'Adobe Creative Cloud'],
    relatedSkills: ['vector-design', 'logo-design', 'illustration'],
    marketDemand: 'high',
    avgHourlyRate: 60,
    learningTimeWeeks: 6
  },
  {
    id: 'sketch',
    name: 'Sketch',
    category: 'Design',
    subcategory: 'UI/UX',
    difficulty: 'intermediate',
    description: 'Digital design toolkit for Mac',
    tools: ['Sketch', 'Sketch Plugins', 'Abstract'],
    relatedSkills: ['ui-design', 'prototyping', 'design-systems'],
    marketDemand: 'medium',
    avgHourlyRate: 65,
    learningTimeWeeks: 5
  },
  {
    id: 'blender',
    name: 'Blender',
    category: 'Design',
    subcategory: '3D',
    difficulty: 'advanced',
    description: '3D modeling, animation, and rendering',
    tools: ['Blender', 'Cycles', 'Eevee'],
    relatedSkills: ['3d-modeling', '3d-animation', 'rendering'],
    marketDemand: 'medium',
    avgHourlyRate: 70,
    learningTimeWeeks: 16
  },
  {
    id: 'after-effects',
    name: 'Adobe After Effects',
    category: 'Design',
    subcategory: 'Motion',
    difficulty: 'advanced',
    description: 'Motion graphics and visual effects',
    tools: ['After Effects', 'Cinema 4D Lite', 'Element 3D'],
    relatedSkills: ['motion-graphics', 'video-editing', 'animation'],
    marketDemand: 'high',
    avgHourlyRate: 75,
    learningTimeWeeks: 12
  },
  {
    id: 'premiere-pro',
    name: 'Adobe Premiere Pro',
    category: 'Design',
    subcategory: 'Video',
    difficulty: 'intermediate',
    description: 'Professional video editing',
    tools: ['Premiere Pro', 'Media Encoder', 'Audition'],
    relatedSkills: ['video-editing', 'color-grading', 'audio-editing'],
    marketDemand: 'high',
    avgHourlyRate: 65,
    learningTimeWeeks: 8
  },
  {
    id: 'ui-design',
    name: 'UI Design',
    category: 'Design',
    subcategory: 'UI/UX',
    difficulty: 'intermediate',
    description: 'User interface design principles and practices',
    tools: ['Figma', 'Sketch', 'Adobe XD'],
    relatedSkills: ['ux-design', 'prototyping', 'design-systems', 'figma'],
    marketDemand: 'very-high',
    avgHourlyRate: 70,
    learningTimeWeeks: 10
  },
  {
    id: 'ux-design',
    name: 'UX Design',
    category: 'Design',
    subcategory: 'UI/UX',
    difficulty: 'intermediate',
    description: 'User experience research and design',
    tools: ['Figma', 'Miro', 'UserTesting', 'Hotjar'],
    relatedSkills: ['ui-design', 'user-research', 'prototyping', 'usability-testing'],
    marketDemand: 'very-high',
    avgHourlyRate: 80,
    learningTimeWeeks: 12
  },

  // Data Science & AI
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    category: 'Data Science',
    subcategory: 'AI/ML',
    difficulty: 'advanced',
    description: 'Build intelligent systems that learn from data',
    tools: ['Python', 'scikit-learn', 'TensorFlow', 'PyTorch'],
    relatedSkills: ['python', 'statistics', 'data-analysis', 'deep-learning'],
    marketDemand: 'very-high',
    avgHourlyRate: 120,
    learningTimeWeeks: 20
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    category: 'Data Science',
    subcategory: 'Analytics',
    difficulty: 'intermediate',
    description: 'Extract insights from data',
    tools: ['Python', 'R', 'SQL', 'Tableau', 'Power BI'],
    relatedSkills: ['sql', 'statistics', 'python', 'excel'],
    marketDemand: 'very-high',
    avgHourlyRate: 85,
    learningTimeWeeks: 12
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'Data Science',
    subcategory: 'Database',
    difficulty: 'beginner',
    description: 'Query and manage databases',
    tools: ['PostgreSQL', 'MySQL', 'SQL Server', 'BigQuery'],
    relatedSkills: ['database-design', 'data-analysis', 'python'],
    marketDemand: 'very-high',
    avgHourlyRate: 70,
    learningTimeWeeks: 6
  },
  {
    id: 'tableau',
    name: 'Tableau',
    category: 'Data Science',
    subcategory: 'Visualization',
    difficulty: 'intermediate',
    description: 'Data visualization and business intelligence',
    tools: ['Tableau Desktop', 'Tableau Server', 'Tableau Prep'],
    relatedSkills: ['data-analysis', 'sql', 'statistics'],
    marketDemand: 'high',
    avgHourlyRate: 90,
    learningTimeWeeks: 8
  },
  {
    id: 'power-bi',
    name: 'Power BI',
    category: 'Data Science',
    subcategory: 'Visualization',
    difficulty: 'intermediate',
    description: 'Microsoft business analytics solution',
    tools: ['Power BI Desktop', 'Power BI Service', 'DAX'],
    relatedSkills: ['data-analysis', 'sql', 'excel'],
    marketDemand: 'high',
    avgHourlyRate: 80,
    learningTimeWeeks: 6
  },

  // Business & Marketing
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    category: 'Marketing',
    subcategory: 'Strategy',
    difficulty: 'intermediate',
    description: 'Online marketing strategies and tactics',
    tools: ['Google Analytics', 'Facebook Ads', 'Google Ads', 'HubSpot'],
    relatedSkills: ['seo', 'social-media-marketing', 'content-marketing', 'ppc'],
    marketDemand: 'very-high',
    avgHourlyRate: 60,
    learningTimeWeeks: 8
  },
  {
    id: 'seo',
    name: 'SEO',
    category: 'Marketing',
    subcategory: 'Search',
    difficulty: 'intermediate',
    description: 'Search engine optimization',
    tools: ['Google Search Console', 'SEMrush', 'Ahrefs', 'Screaming Frog'],
    relatedSkills: ['content-marketing', 'web-analytics', 'keyword-research'],
    marketDemand: 'very-high',
    avgHourlyRate: 75,
    learningTimeWeeks: 10
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    category: 'Marketing',
    subcategory: 'PPC',
    difficulty: 'intermediate',
    description: 'Pay-per-click advertising on Google',
    tools: ['Google Ads', 'Google Analytics', 'Google Tag Manager'],
    relatedSkills: ['ppc', 'digital-marketing', 'analytics'],
    marketDemand: 'very-high',
    avgHourlyRate: 70,
    learningTimeWeeks: 6
  },
  {
    id: 'facebook-ads',
    name: 'Facebook Ads',
    category: 'Marketing',
    subcategory: 'Social Media',
    difficulty: 'intermediate',
    description: 'Social media advertising on Meta platforms',
    tools: ['Facebook Ads Manager', 'Facebook Analytics', 'Facebook Pixel'],
    relatedSkills: ['social-media-marketing', 'digital-marketing', 'analytics'],
    marketDemand: 'high',
    avgHourlyRate: 65,
    learningTimeWeeks: 6
  },
  {
    id: 'content-marketing',
    name: 'Content Marketing',
    category: 'Marketing',
    subcategory: 'Content',
    difficulty: 'intermediate',
    description: 'Create and distribute valuable content',
    tools: ['WordPress', 'Canva', 'Buffer', 'Mailchimp'],
    relatedSkills: ['copywriting', 'seo', 'social-media-marketing'],
    marketDemand: 'high',
    avgHourlyRate: 55,
    learningTimeWeeks: 8
  },
  {
    id: 'copywriting',
    name: 'Copywriting',
    category: 'Marketing',
    subcategory: 'Content',
    difficulty: 'intermediate',
    description: 'Persuasive writing for marketing',
    tools: ['Google Docs', 'Grammarly', 'Hemingway Editor'],
    relatedSkills: ['content-marketing', 'email-marketing', 'sales'],
    marketDemand: 'high',
    avgHourlyRate: 65,
    learningTimeWeeks: 6
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    category: 'Marketing',
    subcategory: 'Email',
    difficulty: 'beginner',
    description: 'Email campaign strategy and execution',
    tools: ['Mailchimp', 'ConvertKit', 'Klaviyo', 'Constant Contact'],
    relatedSkills: ['copywriting', 'marketing-automation', 'analytics'],
    marketDemand: 'high',
    avgHourlyRate: 50,
    learningTimeWeeks: 4
  },

  // Languages
  {
    id: 'spanish',
    name: 'Spanish',
    category: 'Languages',
    subcategory: 'Romance',
    difficulty: 'beginner',
    description: 'Learn Spanish language and culture',
    tools: ['Duolingo', 'Babbel', 'italki', 'SpanishDict'],
    relatedSkills: ['portuguese', 'italian', 'french'],
    marketDemand: 'high',
    avgHourlyRate: 30,
    learningTimeWeeks: 52
  },
  {
    id: 'french',
    name: 'French',
    category: 'Languages',
    subcategory: 'Romance',
    difficulty: 'beginner',
    description: 'Learn French language and culture',
    tools: ['Duolingo', 'Babbel', 'italki', 'Reverso'],
    relatedSkills: ['spanish', 'italian', 'portuguese'],
    marketDemand: 'medium',
    avgHourlyRate: 35,
    learningTimeWeeks: 52
  },
  {
    id: 'mandarin',
    name: 'Mandarin Chinese',
    category: 'Languages',
    subcategory: 'Sino-Tibetan',
    difficulty: 'advanced',
    description: 'Learn Mandarin Chinese',
    tools: ['HelloChinese', 'Pleco', 'ChineseSkill', 'italki'],
    relatedSkills: ['cantonese', 'japanese', 'korean'],
    marketDemand: 'high',
    avgHourlyRate: 40,
    learningTimeWeeks: 104
  },
  {
    id: 'japanese',
    name: 'Japanese',
    category: 'Languages',
    subcategory: 'Japonic',
    difficulty: 'advanced',
    description: 'Learn Japanese language and culture',
    tools: ['Duolingo', 'WaniKani', 'Anki', 'italki'],
    relatedSkills: ['korean', 'mandarin', 'hiragana', 'katakana'],
    marketDemand: 'medium',
    avgHourlyRate: 35,
    learningTimeWeeks: 104
  },

  // Music & Audio
  {
    id: 'guitar',
    name: 'Guitar',
    category: 'Music',
    subcategory: 'Instruments',
    difficulty: 'beginner',
    description: 'Learn acoustic and electric guitar',
    tools: ['Guitar', 'Metronome', 'Guitar Tuner', 'Amplifier'],
    relatedSkills: ['bass-guitar', 'music-theory', 'songwriting'],
    marketDemand: 'medium',
    avgHourlyRate: 40,
    learningTimeWeeks: 26
  },
  {
    id: 'piano',
    name: 'Piano',
    category: 'Music',
    subcategory: 'Instruments',
    difficulty: 'beginner',
    description: 'Learn piano and keyboard',
    tools: ['Piano/Keyboard', 'Metronome', 'Sheet Music'],
    relatedSkills: ['music-theory', 'composition', 'jazz'],
    marketDemand: 'medium',
    avgHourlyRate: 45,
    learningTimeWeeks: 52
  },
  {
    id: 'music-production',
    name: 'Music Production',
    category: 'Music',
    subcategory: 'Production',
    difficulty: 'intermediate',
    description: 'Create and produce music digitally',
    tools: ['Ableton Live', 'Logic Pro', 'Pro Tools', 'FL Studio'],
    relatedSkills: ['audio-engineering', 'mixing', 'mastering'],
    marketDemand: 'medium',
    avgHourlyRate: 60,
    learningTimeWeeks: 16
  },
  {
    id: 'singing',
    name: 'Singing',
    category: 'Music',
    subcategory: 'Vocal',
    difficulty: 'beginner',
    description: 'Vocal technique and performance',
    tools: ['Microphone', 'Audio Interface', 'Recording Software'],
    relatedSkills: ['music-theory', 'performance', 'songwriting'],
    marketDemand: 'medium',
    avgHourlyRate: 50,
    learningTimeWeeks: 26
  },

  // Photography & Video
  {
    id: 'photography',
    name: 'Photography',
    category: 'Photography',
    subcategory: 'General',
    difficulty: 'beginner',
    description: 'Digital photography techniques',
    tools: ['DSLR Camera', 'Lightroom', 'Photoshop'],
    relatedSkills: ['photo-editing', 'lightroom', 'portrait-photography'],
    marketDemand: 'medium',
    avgHourlyRate: 75,
    learningTimeWeeks: 12
  },
  {
    id: 'lightroom',
    name: 'Adobe Lightroom',
    category: 'Photography',
    subcategory: 'Editing',
    difficulty: 'beginner',
    description: 'Photo editing and organization',
    tools: ['Lightroom Classic', 'Lightroom CC', 'Camera Raw'],
    relatedSkills: ['photography', 'photo-editing', 'color-grading'],
    marketDemand: 'medium',
    avgHourlyRate: 50,
    learningTimeWeeks: 6
  },
  {
    id: 'videography',
    name: 'Videography',
    category: 'Video',
    subcategory: 'Production',
    difficulty: 'intermediate',
    description: 'Video production and cinematography',
    tools: ['Camera', 'Tripod', 'Microphone', 'Lighting'],
    relatedSkills: ['video-editing', 'cinematography', 'audio-recording'],
    marketDemand: 'high',
    avgHourlyRate: 85,
    learningTimeWeeks: 16
  },

  // Communication & Soft Skills
  {
    id: 'public-speaking',
    name: 'Public Speaking',
    category: 'Communication',
    subcategory: 'Speaking',
    difficulty: 'intermediate',
    description: 'Effective presentation and speaking skills',
    tools: ['PowerPoint', 'Keynote', 'Teleprompter', 'Recording Equipment'],
    relatedSkills: ['presentation-design', 'storytelling', 'confidence-building'],
    marketDemand: 'high',
    avgHourlyRate: 100,
    learningTimeWeeks: 8
  },
  {
    id: 'presentation-design',
    name: 'Presentation Design',
    category: 'Communication',
    subcategory: 'Visual',
    difficulty: 'beginner',
    description: 'Create compelling presentations',
    tools: ['PowerPoint', 'Keynote', 'Canva', 'Figma'],
    relatedSkills: ['public-speaking', 'graphic-design', 'storytelling'],
    marketDemand: 'medium',
    avgHourlyRate: 55,
    learningTimeWeeks: 4
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    category: 'Communication',
    subcategory: 'Narrative',
    difficulty: 'intermediate',
    description: 'Craft compelling narratives',
    tools: ['Storyboard', 'Writing Software', 'Voice Recorder'],
    relatedSkills: ['public-speaking', 'writing', 'presentation-design'],
    marketDemand: 'medium',
    avgHourlyRate: 70,
    learningTimeWeeks: 8
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    category: 'Business',
    subcategory: 'Skills',
    difficulty: 'intermediate',
    description: 'Effective negotiation strategies',
    tools: ['Role-playing', 'Case Studies', 'Communication Tools'],
    relatedSkills: ['sales', 'communication', 'psychology'],
    marketDemand: 'high',
    avgHourlyRate: 120,
    learningTimeWeeks: 6
  },
  {
    id: 'leadership',
    name: 'Leadership',
    category: 'Business',
    subcategory: 'Management',
    difficulty: 'advanced',
    description: 'Lead and inspire teams effectively',
    tools: ['Assessment Tools', 'Feedback Systems', 'Project Management'],
    relatedSkills: ['management', 'communication', 'emotional-intelligence'],
    marketDemand: 'very-high',
    avgHourlyRate: 150,
    learningTimeWeeks: 12
  },

  // DevOps & Cloud
  {
    id: 'docker',
    name: 'Docker',
    category: 'DevOps',
    subcategory: 'Containerization',
    difficulty: 'intermediate',
    description: 'Containerization and deployment',
    tools: ['Docker', 'Docker Compose', 'Docker Hub'],
    relatedSkills: ['kubernetes', 'linux', 'cloud-computing'],
    marketDemand: 'very-high',
    avgHourlyRate: 95,
    learningTimeWeeks: 6
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'DevOps',
    subcategory: 'Orchestration',
    difficulty: 'advanced',
    description: 'Container orchestration platform',
    tools: ['kubectl', 'Helm', 'Minikube', 'Docker'],
    relatedSkills: ['docker', 'cloud-computing', 'linux'],
    marketDemand: 'very-high',
    avgHourlyRate: 110,
    learningTimeWeeks: 10
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    category: 'Cloud',
    subcategory: 'Platform',
    difficulty: 'intermediate',
    description: 'Cloud computing with AWS',
    tools: ['AWS Console', 'AWS CLI', 'CloudFormation', 'Terraform'],
    relatedSkills: ['cloud-computing', 'docker', 'linux'],
    marketDemand: 'very-high',
    avgHourlyRate: 100,
    learningTimeWeeks: 12
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    category: 'Cloud',
    subcategory: 'Platform',
    difficulty: 'intermediate',
    description: 'Cloud computing with Azure',
    tools: ['Azure Portal', 'Azure CLI', 'ARM Templates', 'PowerShell'],
    relatedSkills: ['cloud-computing', 'csharp', 'powershell'],
    marketDemand: 'very-high',
    avgHourlyRate: 95,
    learningTimeWeeks: 12
  },

  // Blockchain & Web3
  {
    id: 'solidity',
    name: 'Solidity',
    category: 'Blockchain',
    subcategory: 'Smart Contracts',
    difficulty: 'advanced',
    description: 'Smart contract development for Ethereum',
    tools: ['Remix', 'Truffle', 'Hardhat', 'MetaMask'],
    relatedSkills: ['blockchain', 'ethereum', 'web3'],
    marketDemand: 'high',
    avgHourlyRate: 120,
    learningTimeWeeks: 16
  },
  {
    id: 'web3',
    name: 'Web3 Development',
    category: 'Blockchain',
    subcategory: 'DApps',
    difficulty: 'advanced',
    description: 'Decentralized application development',
    tools: ['Web3.js', 'Ethers.js', 'IPFS', 'MetaMask'],
    relatedSkills: ['solidity', 'javascript', 'blockchain'],
    marketDemand: 'high',
    avgHourlyRate: 130,
    learningTimeWeeks: 20
  }
];

export const skillCategories = [
  'All Skills',
  'Programming',
  'Design',
  'Data Science',
  'Marketing',
  'Languages',
  'Music',
  'Photography',
  'Video',
  'Communication',
  'Business',
  'DevOps',
  'Cloud',
  'Blockchain'
];

export const getSkillsByCategory = (category: string): Skill[] => {
  if (category === 'All Skills') return skillsDatabase;
  return skillsDatabase.filter(skill => skill.category === category);
};

export const getSkillById = (id: string): Skill | undefined => {
  return skillsDatabase.find(skill => skill.id === id);
};

export const searchSkills = (query: string): Skill[] => {
  const lowercaseQuery = query.toLowerCase();
  return skillsDatabase.filter(skill => 
    skill.name.toLowerCase().includes(lowercaseQuery) ||
    skill.description.toLowerCase().includes(lowercaseQuery) ||
    skill.category.toLowerCase().includes(lowercaseQuery) ||
    skill.tools?.some(tool => tool.toLowerCase().includes(lowercaseQuery)) ||
    skill.relatedSkills.some(related => related.toLowerCase().includes(lowercaseQuery))
  );
};

export const getPopularSkills = (): Skill[] => {
  return skillsDatabase
    .filter(skill => skill.marketDemand === 'very-high')
    .sort((a, b) => (b.avgHourlyRate || 0) - (a.avgHourlyRate || 0))
    .slice(0, 10);
};

export const getTrendingSkills = (): Skill[] => {
  // Skills that are trending in 2025
  const trendingIds = [
    'machine-learning', 'react', 'python', 'figma', 'aws', 
    'kubernetes', 'solidity', 'web3', 'typescript', 'go'
  ];
  return skillsDatabase.filter(skill => trendingIds.includes(skill.id));
};