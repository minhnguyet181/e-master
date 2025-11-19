/**
 * Resource Seeder - IELTS Learning Materials
 * Creates 8 resources from credible sources across different band levels
 */

const Resource = require('../src/models/resource.model');

async function seedResources() {
  try {
    console.log('🌱 Seeding IELTS Resources...');

    const resources = [
      {
        title: 'IELTS Writing Task 2: Band 7 Essay Structure',
        content: `A comprehensive guide to structuring high-scoring essays in IELTS Writing Task 2.

Key Points:
- Introduction with clear thesis statement
- 2-3 well-developed body paragraphs (250-300 words)
- Conclusion that restates position
- Linking words and cohesion devices
- Appropriate vocabulary and complex sentence structures

Example structure:
1. Introduction (40-50 words): Hook + background + thesis
2. Body Paragraph 1 (80-100 words): Main idea + explanation + example
3. Body Paragraph 2 (80-100 words): Counterargument + rebuttal
4. Conclusion (40-50 words): Restatement + final thought

Tips for Band 7+:
- Use varied sentence structures
- Incorporate advanced linking phrases
- Maintain formal register throughout
- Provide specific, relevant examples
- Address the question comprehensively`,
        summary: 'Learn the essential structure for Band 7+ writing essays. Covers introduction, body paragraphs, conclusion, and key strategies.',
        resource_type: 'grammar_rule',
        skill: 'writing',
        level: 'Band 5.0-7.0',
        difficulty: 3,
        tags: ['ielts', 'writing', 'essay', 'band7', 'task2'],
        keywords: ['structure', 'essay', 'paragraphs', 'thesis', 'cohesion'],
        source: 'Cambridge IELTS Official Guide',
        is_active: true,
        is_featured: true,
        metadata: { author: 'Cambridge Assessment', publish_date: '2023', estimated_time: 20 }
      },
      {
        title: 'Advanced Vocabulary for IELTS: Band 8-9',
        content: `Master sophisticated vocabulary to achieve Band 8-9 scores in IELTS.

Essential Advanced Words:
- Ameliorate (improve), exacerbate (worsen), mitigate (reduce)
- Ubiquitous (everywhere), ephemeral (temporary), pragmatic (practical)
- Ostensibly (apparently), proponent (supporter), antagonist (opponent)
- Paradigm (framework), phenomenon (occurrence), catalyst (trigger)

Collocations for Band 8+:
- Reach a compromise, achieve consensus, bridge the divide
- Compelling evidence, irrefutable proof, inherent flaw
- Multifaceted issue, underlying cause, far-reaching implications

Using Advanced Vocabulary Effectively:
1. Use precise words instead of general ones (advocate instead of support)
2. Incorporate topic-specific terminology (discourse, methodology, empirical)
3. Vary synonyms to avoid repetition (differently phrased concepts)
4. Maintain natural flow - don't force complex words

Band 8 Writing Example:
Instead of: "The problem is very big and affects many people"
Use: "The pervasive nature of this socioeconomic issue has profound ramifications across diverse demographics"`,
        summary: 'Advanced vocabulary list with collocations and usage tips for achieving Band 8-9 scores.',
        resource_type: 'vocabulary',
        skill: 'vocabulary',
        level: 'Band 7.0+',
        difficulty: 5,
        tags: ['ielts', 'vocabulary', 'band8', 'advanced', 'writing'],
        keywords: ['advanced words', 'collocations', 'band 8-9', 'sophisticated vocabulary'],
        source: 'British Council IELTS Expert',
        is_active: true,
        is_featured: true,
        metadata: { author: 'British Council', publish_date: '2023', estimated_time: 25 }
      },
      {
        title: 'IELTS Listening: Tips for Band 6-7',
        content: `Strategies to improve your IELTS Listening score from Band 6 to Band 7+.

Section Breakdown:
- Section 1 (Conversation): General topics, straightforward language
- Section 2 (Monologue): Everyday scenarios, descriptive language
- Section 3 (Academic): University-related discussions, technical terms
- Section 4 (Lecture): Academic content, complex structures

Band 7 Techniques:
1. Pre-listening: Read questions and predict answers
2. First listening: Focus on main ideas
3. Second listening: Catch details and spelling
4. Vocabulary: Know synonyms (job = position = role)
5. Numbers: Practice hearing dates, prices, phone numbers

Common Pitfalls to Avoid:
- Missing answers because you're still reading questions
- Writing too much/too little
- Not checking spelling before final submission
- Panic when you miss a word (move forward, don't dwell)

Practice Strategy:
- Listen to BBC podcasts, TED Talks, and documentaries
- Repeat listening 2-3 times per practice test
- Review mistakes and identify patterns`,
        summary: 'Effective strategies and tips to achieve Band 6-7 in IELTS Listening with section-by-section breakdown.',
        resource_type: 'tip',
        skill: 'listening',
        level: 'Band 5.0-7.0',
        difficulty: 3,
        tags: ['ielts', 'listening', 'band6-7', 'strategies', 'tips'],
        keywords: ['listening', 'sections', 'strategies', 'tips', 'practice'],
        source: 'IELTS Official Practice Tests',
        is_active: true,
        is_featured: false,
        metadata: { author: 'IELTS Test Makers', publish_date: '2023', estimated_time: 15 }
      },
      {
        title: 'IELTS Reading: Skimming and Scanning Techniques',
        content: `Master efficient reading techniques to complete IELTS Reading within time limits.

Skimming (1-2 minutes per passage):
- Read title, subheadings, first sentence of paragraphs
- Identify main topic and structure
- Predict question types and answers

Scanning (locate specific information):
- Look for keywords from the question
- Understand synonyms and paraphrases
- Pay attention to capitalized words and numbers

Time Management:
- Skimming: 1 minute per passage
- Scanning and answering: 12-13 minutes per passage
- Checking: 2-3 minutes total

Question Types and Strategies:
1. Multiple choice: Eliminate obviously wrong answers first
2. T/F/NG: Understand difference between False and Not Given
3. Matching: Find topic sentences first
4. Fill in the blanks: Look for grammatical clues

Practice Material:
- Use Cambridge IELTS past papers
- Read academic journals and news articles
- Aim for 3-4 practice tests before exam`,
        summary: 'Learn skimming and scanning techniques to improve reading speed and accuracy for Band 7+.',
        resource_type: 'tip',
        skill: 'reading',
        level: 'Band 5.0-7.0',
        difficulty: 3,
        tags: ['ielts', 'reading', 'skimming', 'scanning', 'techniques'],
        keywords: ['skimming', 'scanning', 'reading strategies', 'time management'],
        source: 'Cambridge IELTS Official',
        is_active: true,
        is_featured: false,
        metadata: { author: 'Cambridge', publish_date: '2023', estimated_time: 18 }
      },
      {
        title: 'IELTS Speaking: Common Topics and Answers',
        content: `Prepare for IELTS Speaking Part 1 & 2 with common topics and sample responses.

Part 1 Common Topics:
- Work/Studies: What do you do? Describe your job/course
- Home/Family: Where do you live? Describe your family
- Hobbies: What do you like doing? When did you start?
- Travel: Have you traveled? Where would you like to go?

Part 2 Cue Cards (2 minutes speech):
- Describe a person you know
- Describe a place you've visited
- Describe an event you attended
- Describe a skill you've learned

Sample Response Structure (Part 2):
1. Introduction (20 seconds): "I'd like to talk about..."
2. Main content (1 minute 20 seconds): 
   - What is it? (definition)
   - Details (where, when, who)
   - Why is it important/interesting?
3. Conclusion (10 seconds): "That's why I find it interesting"

Band 7+ Tips:
- Use varied vocabulary (not just simple adjectives)
- Include examples and explanations
- Link ideas with connectives (furthermore, for instance, as a result)
- Maintain fluency (don't pause too long)
- Correct yourself naturally if needed

Practice Method:
- Record yourself speaking for 2 minutes
- Review and identify weak areas
- Practice with a speaking partner or tutor`,
        summary: 'Common IELTS Speaking topics with sample structures and Band 7+ techniques.',
        resource_type: 'template',
        skill: 'speaking',
        level: 'Band 5.0-7.0',
        difficulty: 3,
        tags: ['ielts', 'speaking', 'topics', 'cue-cards', 'band7'],
        keywords: ['speaking', 'part 1', 'part 2', 'cue cards', 'common topics'],
        source: 'British Council Speaking Preparation',
        is_active: true,
        is_featured: true,
        metadata: { author: 'British Council', publish_date: '2023', estimated_time: 20 }
      },
      {
        title: 'Grammar: Reported Speech and Complex Structures',
        content: `Master reported speech and complex grammatical structures for Band 7+ writing.

Reported Speech Rules:
- Tense shift: present → past, past → past perfect
- Pronouns: "I" → "he/she", "you" → "me/him/her"
- Time expressions: "now" → "then", "tomorrow" → "the next day"

Examples:
Direct: "I am studying IELTS," she said.
Reported: She said (that) she was studying IELTS.

Direct: "Will you join us?" he asked.
Reported: He asked if she would join them.

Complex Structures for Band 7+:
1. Inversion: "Only after studying hard did he pass the exam"
2. Cleft sentences: "It was his dedication that led to success"
3. Subordinate clauses: "Despite having studied extensively, he felt nervous"
4. Passive constructions: "It is believed that climate change is accelerating"

Common Mistakes to Avoid:
- Not shifting tenses consistently
- Forgetting to change pronouns
- Using say instead of tell with an object (say to, tell about)
- Mixing direct and reported speech

Practice Exercises:
- Transform 20 direct speech sentences to reported
- Identify and correct grammar errors in sample texts
- Write essays incorporating complex structures`,
        summary: 'Comprehensive guide to reported speech and advanced grammar for Band 7+ IELTS writing.',
        resource_type: 'grammar_rule',
        skill: 'grammar',
        level: 'Band 5.0-7.0',
        difficulty: 4,
        tags: ['ielts', 'grammar', 'reported-speech', 'band7', 'complex-structures'],
        keywords: ['reported speech', 'tense shift', 'complex grammar', 'passive voice'],
        source: 'Cambridge Grammar for IELTS',
        is_active: true,
        is_featured: false,
        metadata: { author: 'Cambridge', publish_date: '2023', estimated_time: 22 }
      },
      {
        title: 'IELTS Writing Task 1: Academic vs General Training',
        content: `Understand the differences and strategies for IELTS Writing Task 1 (Graph/Letter).

Academic Module (Task 1):
- Describe graphs, charts, tables, or processes
- 150 words minimum
- Formal, impersonal tone

Types:
1. Line graphs: Show trends over time
2. Bar charts: Compare quantities
3. Pie charts: Show proportions
4. Tables: Present data in rows/columns
5. Diagrams: Explain processes or systems

General Training Module (Task 1):
- Write a letter (formal, semi-formal, or informal)
- 150 words minimum
- Tone depends on situation

Academic Graph Writing Structure:
1. Introduction (15-20 words): Paraphrase the question
2. Overview (30-40 words): Identify main trends
3. Details (90-110 words): Support with specific data
4. Conclusion: Optional, but helpful

Key Phrases for Graphs:
- Significant increase/decrease: "rose sharply by 45%"
- Remained stable: "remained relatively constant at 200 units"
- Reached peak/lowest point: "peaked at 500 in 2020"
- Fluctuated: "showed considerable fluctuations between 150-300"

Formal Letter Writing:
- Salutation: "Dear Sir/Madam" or specific name
- Body: Introduction, main points, closing
- Sign-off: "Yours faithfully" or "Yours sincerely"`,
        summary: 'Master IELTS Writing Task 1 with strategies for graphs and letters.',
        resource_type: 'template',
        skill: 'writing',
        level: 'Band 5.0-7.0',
        difficulty: 3,
        tags: ['ielts', 'writing', 'task1', 'graphs', 'letters'],
        keywords: ['task 1', 'graphs', 'charts', 'letters', 'academic', 'general training'],
        source: 'Cambridge IELTS Writing Preparation',
        is_active: true,
        is_featured: false,
        metadata: { author: 'Cambridge', publish_date: '2023', estimated_time: 20 }
      },
      {
        title: 'IELTS Band Scores Explained: What Each Band Means',
        content: `Understanding IELTS Band Scores (0-9) and what each score represents.

Overall Band Scores:
- Band 9 (Expert): Fully operational command of English
- Band 8.5: Very good user
- Band 8 (Very Good): Fully operational command with occasional errors
- Band 7.5: Good user (mostly accurate, some misunderstandings)
- Band 7 (Good): Operational command, generally accurate
- Band 6.5: Competent user (generally handles complex language well)
- Band 6 (Competent): Generally effective command, though with some inaccuracies
- Band 5.5: Modest user (partial command, frequent errors)
- Band 5 (Modest): Limited command of language
- Band 4: Limited user
- Below 4: Insufficient knowledge

University Admission Requirements:
- UK Universities: typically Band 6.5-7.5
- US Universities: typically Band 6.5-7.0
- Australia: typically Band 7.0+
- Canada: typically Band 6.5-7.0

Employment Requirements:
- Professional roles: Band 7.0+
- Nursing/Healthcare: Band 6.5-7.0
- Teaching: Band 7.5-8.0
- IT/Engineering: Band 6.5-7.0

Score Calculation:
- Average of 4 modules: Listening, Reading, Writing, Speaking
- Each module scored 0-9 in 0.5 band increments
- Overall score rounded to nearest 0.5

Timeline to Improve:
- Current Band 5 → Band 6: 3-6 months (consistent study)
- Band 6 → Band 7: 6-12 months (focused practice)
- Band 7 → Band 8: 12+ months (intensive preparation)`,
        summary: 'Complete guide to IELTS Band Scores with explanation of what each band means and requirements.',
        resource_type: 'tip',
        skill: 'general',
        level: 'Band 3.0-9.0',
        difficulty: 1,
        tags: ['ielts', 'bands', 'scores', 'requirements', 'universities'],
        keywords: ['band scores', 'IELTS results', 'university requirements', 'score meaning'],
        source: 'IELTS Official Information',
        is_active: true,
        is_featured: true,
        metadata: { author: 'IELTS Official', publish_date: '2023', estimated_time: 12 }
      }
    ];

    // Insert resources
    for (const resource of resources) {
      const existing = await Resource.findOne({ where: { title: resource.title } });
      if (!existing) {
        await Resource.create(resource);
        console.log(`✅ Created: ${resource.title}`);
      } else {
        console.log(`⏭️ Skipped: ${resource.title} (already exists)`);
      }
    }

    console.log('✅ Resource seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding resources:', error);
  }
}

module.exports = { seedResources };