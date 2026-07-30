"use strict";

const { query } = require('./db');

async function seedPastPapers() {
  console.log('Seeding past papers...');
  console.log('Database connection configured:', {
    host: process.env.PGHOST || 'NOT_SET',
    port: process.env.PGPORT || 'NOT_SET',
    user: process.env.PGUSER || 'NOT_SET',
    database: process.env.PGDATABASE || 'NOT_SET',
    hasPassword: !!process.env.PGPASSWORD
  });

  const pastPapers = [
    {
      id: '1',
      subject: 'physics',
      year: 2023,
      paper_number: 1,
      exam_body: 'NEET',
      title: 'Physics Practical Assessment',
      title_sw: 'Maadun Tukufu wa Physics',
      is_premium: false,
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      subject: 'chemistry',
      year: 2023,
      paper_number: 1,
      exam_body: 'NEET',
      title: 'Chemistry Practical Assessment',
      title_sw: 'Maadun Tukufu wa Chemistry',
      is_premium: false,
      sort_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      subject: 'biology',
      year: 2023,
      paper_number: 1,
      exam_body: 'NEET',
      title: 'Biology Practical Assessment',
      title_sw: 'Maadun Tukufu wa Biology',
      is_premium: false,
      sort_order: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      subject: 'physics',
      year: 2022,
      paper_number: 1,
      exam_body: 'WASSCE',
      title: 'Physics Practical Assessment',
      title_sw: 'Maadun Tukufu wa Physics',
      is_premium: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      subject: 'chemistry',
      year: 2022,
      paper_number: 1,
      exam_body: 'WASSCE',
      title: 'Chemistry Practical Assessment',
      title_sw: 'Maadun Tukufu wa Chemistry',
      is_premium: false,
      sort_order: 5,
      created_at: new Date().toISOString(),
    },
  ];

  try {
    for (const paper of pastPapers) {
      await query(
        `INSERT INTO past_papers (id, subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          paper.id,
          paper.subject,
          paper.year,
          paper.paper_number,
          paper.exam_body,
          paper.title,
          paper.title_sw,
          paper.is_premium,
          paper.sort_order,
          paper.created_at,
        ]
      );
    }
    console.log(`Successfully seeded ${pastPapers.length} past papers.`);
  } catch (error) {
    console.error('Error seeding past papers:', error);
    throw error;
  }
}

if (require.main === module) {
  seedPastPapers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedPastPapers };
