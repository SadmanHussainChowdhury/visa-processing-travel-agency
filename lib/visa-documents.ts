// Standard document requirements for different visa types
export const getStandardDocuments = (visaType: string) => {
  const baseDocuments = [
    {
      name: 'Passport Copy',
      type: 'identity',
      required: true,
      uploaded: false
    },
    {
      name: 'Passport Size Photos',
      type: 'photos',
      required: true,
      uploaded: false
    },
    {
      name: 'Application Form',
      type: 'forms',
      required: true,
      uploaded: false
    }
  ];

  const visaSpecificDocuments: Record<string, any[]> = {
    tourist: [
      {
        name: 'Travel Itinerary',
        type: 'travel',
        required: true,
        uploaded: false
      },
      {
        name: 'Hotel Reservation',
        type: 'accommodation',
        required: true,
        uploaded: false
      },
      {
        name: 'Proof of Financial Means',
        type: 'financial',
        required: true,
        uploaded: false
      },
      {
        name: 'Travel Insurance',
        type: 'insurance',
        required: true,
        uploaded: false
      }
    ],
    business: [
      {
        name: 'Invitation Letter',
        type: 'business',
        required: true,
        uploaded: false
      },
      {
        name: 'Company Registration',
        type: 'business',
        required: true,
        uploaded: false
      },
      {
        name: 'Business License',
        type: 'business',
        required: true,
        uploaded: false
      },
      {
        name: 'Proof of Employment',
        type: 'employment',
        required: true,
        uploaded: false
      }
    ],
    student: [
      {
        name: 'Admission Letter',
        type: 'education',
        required: true,
        uploaded: false
      },
      {
        name: 'Academic Transcripts',
        type: 'education',
        required: true,
        uploaded: false
      },
      {
        name: 'Proof of Financial Support',
        type: 'financial',
        required: true,
        uploaded: false
      },
      {
        name: 'Language Proficiency Certificate',
        type: 'education',
        required: true,
        uploaded: false
      }
    ],
    work: [
      {
        name: 'Job Offer Letter',
        type: 'employment',
        required: true,
        uploaded: false
      },
      {
        name: 'Employment Contract',
        type: 'employment',
        required: true,
        uploaded: false
      },
      {
        name: 'Qualification Certificates',
        type: 'education',
        required: true,
        uploaded: false
      },
      {
        name: 'Professional Experience Letters',
        type: 'employment',
        required: true,
        uploaded: false
      }
    ]
  };

  return [
    ...baseDocuments,
    ...(visaSpecificDocuments[visaType] || [])
  ];
};

// Checklist items organized by category
export const getChecklistItems = (visaType: string) => {
  const baseChecklist = [
    {
      category: 'Documentation',
      item: 'Gather all required documents',
      completed: false
    },
    {
      category: 'Documentation',
      item: 'Scan/copy documents',
      completed: false
    },
    {
      category: 'Documentation',
      item: 'Translate documents if required',
      completed: false
    },
    {
      category: 'Application',
      item: 'Fill application form completely',
      completed: false
    },
    {
      category: 'Application',
      item: 'Review application for accuracy',
      completed: false
    },
    {
      category: 'Payment',
      item: 'Calculate visa fees',
      completed: false
    },
    {
      category: 'Payment',
      item: 'Make payment',
      completed: false
    }
  ];

  const visaSpecificChecklist: Record<string, any[]> = {
    tourist: [
      {
        category: 'Travel Planning',
        item: 'Book flights',
        completed: false
      },
      {
        category: 'Travel Planning',
        item: 'Book accommodation',
        completed: false
      },
      {
        category: 'Insurance',
        item: 'Purchase travel insurance',
        completed: false
      }
    ],
    business: [
      {
        category: 'Business Preparation',
        item: 'Prepare company documents',
        completed: false
      },
      {
        category: 'Business Preparation',
        item: 'Obtain invitation letter',
        completed: false
      },
      {
        category: 'Meetings',
        item: 'Schedule business meetings',
        completed: false
      }
    ],
    student: [
      {
        category: 'Academic Preparation',
        item: 'Accept admission offer',
        completed: false
      },
      {
        category: 'Academic Preparation',
        item: 'Arrange accommodation',
        completed: false
      },
      {
        category: 'Financial',
        item: 'Secure funding/scholarship',
        completed: false
      }
    ],
    work: [
      {
        category: 'Employment',
        item: 'Sign employment contract',
        completed: false
      },
      {
        category: 'Relocation',
        item: 'Plan relocation logistics',
        completed: false
      },
      {
        category: 'Housing',
        item: 'Arrange temporary housing',
        completed: false
      }
    ]
  };

  return [
    ...baseChecklist,
    ...(visaSpecificChecklist[visaType] || [])
  ];
};

// Standard reminders for visa applications
export const getStandardReminders = (visaType: string) => {
  return [
    {
      type: 'document-deadline',
      message: 'Submit required documents within 30 days',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      completed: false
    },
    {
      type: 'follow-up',
      message: 'Follow up on application status after 2 weeks',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      completed: false
    },
    {
      type: 'interview-prep',
      message: 'Prepare for visa interview (if required)',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      completed: false
    }
  ];
};