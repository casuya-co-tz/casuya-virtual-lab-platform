const express = require('express');
const { query } = require('../db');
const { apiKeyAuth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/casuya/labs - Get all published labs for CASUYA
router.get('/labs', apiKeyAuth, async (req, res) => {
  try {
    const { subject, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 50));
    const offset = (pageNum - 1) * limitNum;

    let sql = `
      SELECT l.id, l.title, l.title_sw, l.subject, l.description, l.description_sw,
             l.is_premium, l.current_version, l.updated_at,
             lv.html_code, lv.scoring_config
      FROM labs l
      JOIN lab_versions lv ON lv.lab_id = l.id AND lv.version_number = l.current_version
      WHERE l.is_published = true
    `;
    const params = [];

    if (subject) {
      params.push(subject);
      sql += ` AND l.subject = $${params.length}`;
    }

    sql += ' ORDER BY l.subject, l.title';

    let countSql = 'SELECT COUNT(*) FROM labs l WHERE l.is_published = true';
    const countParams = [];
    if (subject) {
      countParams.push(subject);
      countSql += ` AND l.subject = $${countParams.length}`;
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    params.push(limitNum, offset);
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(sql, params);
    res.json({
      data: result.rows,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('CASUYA labs error:', err.message);
    res.status(500).json({ error: 'Failed to fetch labs for CASUYA' });
  }
});

// GET /api/casuya/labs/:id - Get single lab for CASUYA
router.get('/labs/:id', apiKeyAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT l.id, l.title, l.title_sw, l.subject, l.description, l.description_sw,
              l.is_premium, l.current_version, l.updated_at,
              lv.html_code, lv.scoring_config
       FROM labs l
       JOIN lab_versions lv ON lv.lab_id = l.id AND lv.version_number = l.current_version
       WHERE l.id = $1 AND l.is_published = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lab not found or not published' });
    }

    // Track access (fire and forget)
    query(
      `INSERT INTO lab_access_log (lab_id, endpoint, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, `/api/casuya/labs/${req.params.id}`, req.ip, req.get('user-agent')]
    ).catch(() => {});

    res.json(result.rows[0]);
  } catch (err) {
    console.error('CASUYA lab error:', err.message);
    res.status(500).json({ error: 'Failed to fetch lab for CASUYA' });
  }
});

// GET /api/casuya/subjects - Get all subjects with lab counts
router.get('/subjects', apiKeyAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT subject, COUNT(*) as lab_count
       FROM labs WHERE is_published = true
       GROUP BY subject ORDER BY subject`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('CASUYA subjects error:', err.message);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/casuya/search - Search published labs (for CASUYA)
router.get('/search', apiKeyAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const result = await query(
      `SELECT l.id, l.title, l.title_sw, l.subject, l.description, l.description_sw,
              l.is_premium, l.current_version, l.updated_at,
              ts_rank(l.search_vector, plainto_tsquery('english', $1)) AS rank
       FROM labs l
       WHERE l.search_vector @@ plainto_tsquery('english', $1)
         AND l.is_published = true
       ORDER BY rank DESC, l.title
       LIMIT 50`,
      [q.trim()]
    );

    res.json({ query: q, results: result.rows });
  } catch (err) {
    console.error('CASUYA search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// PUT /api/casuya/labs/:id - Update lab metadata (from CASUYA admin)
router.put('/labs/:id', apiKeyAuth, async (req, res) => {
  try {
    const { title, title_sw, subject, description, description_sw, is_premium, is_published, html_code, scoring_config, subtopic_id } = req.body;

    const labResult = await query(
      `UPDATE labs SET
        title = COALESCE($1, title),
        title_sw = COALESCE($2, title_sw),
        subject = COALESCE($3, subject),
        description = COALESCE($4, description),
        description_sw = COALESCE($5, description_sw),
        is_premium = COALESCE($6, is_premium),
        is_published = COALESCE($7, is_published),
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [title, title_sw, subject, description, description_sw, is_premium, is_published, req.params.id]
    );

    if (labResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lab not found' });
    }

    if (html_code) {
      const lab = labResult.rows[0];
      const newVersion = lab.current_version + 1;
      const { sanitizeHtml } = require('../sanitize');
      const cleanHtml = await sanitizeHtml(html_code);
      await query(
        `INSERT INTO lab_versions (lab_id, version_number, html_code, scoring_config, changelog, created_by)
         VALUES ($1, $2, $3, $4, $5, 'casuya')`,
        [lab.id, newVersion, cleanHtml, scoring_config ? JSON.stringify(scoring_config) : '{}', `Updated from CASUYA`]
      );
      await query('UPDATE labs SET current_version = $1 WHERE id = $2', [newVersion, lab.id]);
      labResult.rows[0].current_version = newVersion;
    }

    const lab = labResult.rows[0];
    res.json({
      id: lab.id, title: lab.title, title_sw: lab.title_sw, subject: lab.subject,
      description: lab.description, description_sw: lab.description_sw,
      is_premium: lab.is_premium, is_published: lab.is_published,
      current_version: lab.current_version, updated_at: lab.updated_at,
      subtopic_id: subtopic_id || null,
      html_code: html_code || null, scoring_config: scoring_config || null,
    });
  } catch (err) {
    console.error('CASUYA update lab error:', err.message);
    res.status(500).json({ error: 'Failed to update lab' });
  }
});

// DELETE /api/casuya/labs/:id - Delete lab (from CASUYA admin)
router.delete('/labs/:id', apiKeyAuth, async (req, res) => {
  try {
    const result = await query('DELETE FROM labs WHERE id = $1 RETURNING id, title', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json({ deleted: true, id: result.rows[0].id });
  } catch (err) {
    console.error('CASUYA delete lab error:', err.message);
    res.status(500).json({ error: 'Failed to delete lab' });
  }
});

// POST /api/casuya/labs/:id/versions - Create new version (from CASUYA)
router.post('/labs/:id/versions', apiKeyAuth, async (req, res) => {
  try {
    const { html_code, scoring_config, changelog } = req.body;
    if (!html_code) return res.status(400).json({ error: 'html_code is required' });

    const labResult = await query('SELECT current_version, title FROM labs WHERE id = $1', [req.params.id]);
    if (labResult.rows.length === 0) return res.status(404).json({ error: 'Lab not found' });

    const { sanitizeHtml } = require('../sanitize');
    const cleanHtml = await sanitizeHtml(html_code);
    const newVersion = labResult.rows[0].current_version + 1;

    const vResult = await query(
      `INSERT INTO lab_versions (lab_id, version_number, html_code, scoring_config, changelog, created_by)
       VALUES ($1, $2, $3, $4, $5, 'casuya') RETURNING *`,
      [req.params.id, newVersion, cleanHtml, scoring_config ? JSON.stringify(scoring_config) : '{}', changelog || `Version ${newVersion}`]
    );

    await query('UPDATE labs SET current_version = $1, updated_at = NOW() WHERE id = $2', [newVersion, req.params.id]);
    res.status(201).json(vResult.rows[0]);
  } catch (err) {
    console.error('CASUYA create version error:', err.message);
    res.status(500).json({ error: 'Failed to create version' });
  }
});

// POST /api/casuya/labs/:id/duplicate - Duplicate lab (from CASUYA admin)
router.post('/labs/:id/duplicate', apiKeyAuth, async (req, res) => {
  try {
    const existing = await query(
      `SELECT l.*, lv.html_code, lv.scoring_config
       FROM labs l
       LEFT JOIN lab_versions lv ON lv.lab_id = l.id AND lv.version_number = l.current_version
       WHERE l.id = $1`, [req.params.id]
    );
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Lab not found' });

    const src = existing.rows[0];
    const { title } = req.body;
    const labResult = await query(
      `INSERT INTO labs (title, title_sw, subject, description, description_sw, is_premium)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title || src.title + ' (copy)', src.title_sw, src.subject, src.description, src.description_sw, src.is_premium]
    );
    const lab = labResult.rows[0];
    await query(
      `INSERT INTO lab_versions (lab_id, version_number, html_code, scoring_config, changelog, created_by)
       VALUES ($1, 1, $2, $3, $4, 'casuya')`,
      [lab.id, src.html_code || '', JSON.stringify(src.scoring_config || {}), 'Duplicated from: ' + src.title]
    );
    res.status(201).json(lab);
  } catch (err) {
    console.error('CASUYA duplicate lab error:', err.message);
    res.status(500).json({ error: 'Failed to duplicate lab' });
  }
});

// GET /api/casuya/analytics - Get lab access analytics (admin)
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT l.id, l.title, l.subject,
              COUNT(al.id) as access_count,
              MAX(al.created_at) as last_accessed
       FROM labs l
       LEFT JOIN lab_access_log al ON al.lab_id = l.id
       WHERE l.is_published = true
       GROUP BY l.id, l.title, l.subject
       ORDER BY access_count DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('CASUYA analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/casuya/analytics/timeseries - Daily access counts for last 30 days
router.get('/analytics/timeseries', adminAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as access_count
       FROM lab_access_log
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('CASUYA timeseries error:', err.message);
    res.status(500).json({ error: 'Failed to fetch timeseries' });
  }
});

// GET /api/casuya/analytics/top-labs - Most accessed labs this week
router.get('/analytics/top-labs', adminAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT l.id, l.title, l.subject, COUNT(al.id) as access_count
       FROM labs l
       JOIN lab_access_log al ON al.lab_id = l.id
       WHERE al.created_at >= NOW() - INTERVAL '7 days'
       GROUP BY l.id, l.title, l.subject
       ORDER BY access_count DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('CASUYA top labs error:', err.message);
    res.status(500).json({ error: 'Failed to fetch top labs' });
  }
});

module.exports = router;
