import { VisaKnowledge, SOPDocument, LearningGuideline, RejectionTip } from '../models/KnowledgeBase';
import { dbConnect } from '../lib/db';

async function seedKnowledgeHelp() {
  await dbConnect();

  try {
    // Clear existing SOP, Learning Guidelines, and Rejection Tips data
    await SOPDocument.deleteMany({});
    await LearningGuideline.deleteMany({});
    await RejectionTip.deleteMany({});

    // Keep existing visa knowledge data but add more entries if needed
    const existingVisaKnowledgeCount = await VisaKnowledge.countDocuments();
    console.log(`Found ${existingVisaKnowledgeCount} existing visa knowledge entries`);

    // Add SOP Documents Data
    const sopDocumentsData = [
      {
        title: 'Standard Tourist Visa Application Process',
        type: 'Standard Operating Procedure',
        country: 'United States',
        version: '2.1',
        content: 'This SOP outlines the complete process for handling standard tourist visa applications. It includes document verification, interview preparation, and client communication protocols.',
        lastUpdated: new Date(),
        author: 'Visa Processing Team'
      },
      {
        title: 'Business Visa Processing Guidelines',
        type: 'Internal Guidelines',
        country: 'Canada',
        version: '1.8',
        content: 'Detailed procedures for business visa applications including corporate documentation requirements, invitation letter verification, and processing timelines.',
        lastUpdated: new Date(),
        author: 'Business Visa Team'
      },
      {
        title: 'Student Visa Application Checklist',
        type: 'Checklist',
        country: 'United Kingdom',
        version: '3.2',
        content: 'Comprehensive checklist for student visa applications covering academic documentation, financial evidence, and accommodation proof requirements.',
        lastUpdated: new Date(),
        author: 'Education Visa Team'
      },
      {
        title: 'Work Permit Visa Processing',
        type: 'Standard Operating Procedure',
        country: 'Australia',
        version: '2.5',
        content: 'Step-by-step guide for work permit visa applications including employer verification, skill assessment requirements, and documentation standards.',
        lastUpdated: new Date(),
        author: 'Employment Visa Team'
      },
      {
        title: 'Transit Visa Documentation',
        type: 'Internal Memo',
        country: 'Germany',
        version: '1.3',
        content: 'Special procedures for transit visa applications including layover duration requirements, airport transit rules, and emergency documentation.',
        lastUpdated: new Date(),
        author: 'Transit Visa Team'
      }
    ];

    // Add Learning Guidelines Data
    const learningGuidelinesData = [
      {
        title: 'Mastering Visa Documentation',
        category: 'Document Processing',
        duration: '45 min',
        level: 'Beginner',
        completed: false,
        rating: 4.5,
        enrolled: 245
      },
      {
        title: 'Interview Preparation Techniques',
        category: 'Client Interaction',
        duration: '30 min',
        level: 'Intermediate',
        completed: true,
        rating: 4.8,
        enrolled: 189
      },
      {
        title: 'Financial Documentation Analysis',
        category: 'Document Verification',
        duration: '60 min',
        level: 'Advanced',
        completed: false,
        rating: 4.2,
        enrolled: 156
      },
      {
        title: 'Country-Specific Requirements',
        category: 'Geographic Knowledge',
        duration: '90 min',
        level: 'Intermediate',
        completed: false,
        rating: 4.6,
        enrolled: 312
      },
      {
        title: 'Rejection Analysis and Prevention',
        category: 'Quality Assurance',
        duration: '75 min',
        level: 'Advanced',
        completed: false,
        rating: 4.9,
        enrolled: 203
      }
    ];

    // Add Rejection Prevention Tips Data
    const rejectionTipsData = [
      {
        country: 'United States',
        visaType: 'Tourist Visa',
        tipCategory: 'Documentation',
        title: 'Incomplete Financial Documentation',
        description: 'Applicants often provide insufficient financial evidence or documents that are not recent enough to demonstrate current financial status.',
        solution: 'Require bank statements for the last 6 months, employment letters with current salary details, and property ownership documents. Verify all documents are within 30 days of submission.',
        example: 'Client A was rejected due to providing only 2 months of bank statements. After resubmitting with 6 months of comprehensive financial documentation, the visa was approved within 2 weeks.'
      },
      {
        country: 'Canada',
        visaType: 'Visitor Visa',
        tipCategory: 'Travel History',
        title: 'Weak Travel History',
        description: 'First-time travelers or those with limited international travel history often face additional scrutiny and higher rejection rates.',
        solution: 'Encourage clients to travel to neighboring countries first to build travel history. Provide detailed explanations for any gaps in travel history and emphasize strong ties to home country.',
        example: 'Client B, a first-time traveler, was initially rejected. After taking a short trip to Dubai and providing detailed explanations of family and business ties, the second application was successful.'
      },
      {
        country: 'United Kingdom',
        visaType: 'Standard Visitor',
        tipCategory: 'Application Timing',
        title: 'Last-Minute Applications',
        description: 'Applications submitted less than 2 weeks before intended travel date are frequently rejected due to insufficient processing time and perceived lack of planning.',
        solution: 'Implement a policy requiring applications to be submitted at least 4-6 weeks before travel. Educate clients about processing times and the importance of early planning.',
        example: 'Client C applied 10 days before travel and was rejected. The same client applied 5 weeks in advance with identical documentation and was approved without issues.'
      },
      {
        country: 'Australia',
        visaType: 'Visitor Visa',
        tipCategory: 'Health Insurance',
        title: 'Inadequate Health Coverage',
        description: 'Health insurance that doesn\'t meet Australian requirements or covers insufficient duration leads to visa rejections.',
        solution: 'Mandate Australian-approved health insurance covering the entire stay duration plus 30 days. Verify coverage amounts meet minimum requirements for the visa type.',
        example: 'Client D\'s application was rejected due to $50,000 coverage limit. After switching to a policy with $200,000 coverage for the full duration, approval was granted.'
      },
      {
        country: 'Germany',
        visaType: 'Schengen Visa',
        tipCategory: 'Itinerary Clarity',
        title: 'Unclear Travel Plans',
        description: 'Vague or inconsistent travel itineraries raise suspicions about genuine visitor intentions and lead to visa denials.',
        solution: 'Require detailed day-by-day itineraries with confirmed bookings, clear purpose of each location visit, and logical travel flow. Include return flight confirmations.',
        example: 'Client E provided only a general statement about visiting Europe. After submitting a detailed 15-day itinerary with hotel confirmations and specific activities, the visa was approved.'
      }
    ];

    // Insert data
    await SOPDocument.insertMany(sopDocumentsData);
    await LearningGuideline.insertMany(learningGuidelinesData);
    await RejectionTip.insertMany(rejectionTipsData);

    console.log('Knowledge Help System data seeded successfully!');
    console.log(`Inserted ${sopDocumentsData.length} SOP documents`);
    console.log(`Inserted ${learningGuidelinesData.length} learning guidelines`);
    console.log(`Inserted ${rejectionTipsData.length} rejection tips`);

  } catch (error) {
    console.error('Error seeding data:', error);
  }
  // Note: Don't close the connection as it's managed by the app
}

seedKnowledgeHelp();