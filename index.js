require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------

function unwrap(value) {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.length > 0 ? String(value[0]) : undefined;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? (parsed.length > 0 ? String(parsed[0]) : undefined)
        : value;
    } catch {
      return value;
    }
  }
  return String(value);
}

function isEmpty(value) {
  if (value == null) return true;
  const str = String(value).trim().toLowerCase();
  return (
    str === '' ||
    str === 'null' ||
    str === 'undefined' ||
    str === '[]' ||
    str === '[""]' ||
    str === 'nan'
  );
}

function ensureOffset(value, offset) {
  if (isEmpty(value)) return undefined;
  const str = String(value);
  if (/[+-]\d{2}:\d{2}$/.test(str) || str.endsWith('Z')) {
    return str;
  }
  return `${str}${offset}`;
}

function getCalendarAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
}

function extractOffsetPart(isoStr) {
  const match = String(isoStr || '').match(/([+-]\d{2}:\d{2}|Z)$/);
  return match ? match[0] : null;
}

function mergeReminderDateTime(existingStartISO, existingEndISO, newDate, newStartClock, newEndClock, defaultOffset) {
  const offset = extractOffsetPart(existingStartISO) || defaultOffset || '+07:00';
  const oldStartDate = String(existingStartISO).slice(0, 10);
  const oldStartClock = String(existingStartISO).slice(11, 19);

  const finalDate = !isEmpty(newDate) ? newDate : oldStartDate;
  const finalStartClock = !isEmpty(newStartClock) ? newStartClock : oldStartClock;
  const newStartISO = `${finalDate}T${finalStartClock}${offset}`;

  let newEndISO;
  if (!isEmpty(newEndClock)) {
    newEndISO = `${finalDate}T${newEndClock}${offset}`;
  } else {
    const oldStartMs = new Date(existingStartISO).getTime();
    const oldEndMs = new Date(existingEndISO).getTime();
    const durationMs = Math.max(oldEndMs - oldStartMs, 15 * 60 * 1000); // floor at 15 min
    const newStartMs = new Date(newStartISO).getTime();
    newEndISO = new Date(newStartMs + durationMs).toISOString();
  }

  return { newStartISO, newEndISO };
}

function mapEventToReminder(event) {
  return {
    id: event.id,
    summary: event.summary || '(No title)',
    start: event.start?.dateTime || event.start?.date || null,
    end: event.end?.dateTime || event.end?.date || null,
    timeZone: event.start?.timeZone || null,
    status: event.status,
    created: event.created || null,
    updated: event.updated || null,
    html_link: event.htmlLink,
  };
}

// ---------------------------------------------------------
// Create Reminder
// ---------------------------------------------------------

app.post('/api/reminder/create-reminder', async (req, res) => {
  try {
    const { start_time, end_time, summary, timeZone } = req.body;

    const cleanStartTime = unwrap(start_time);
    const cleanEndTime = unwrap(end_time);

    if (isEmpty(cleanStartTime) || isEmpty(cleanEndTime)) {
      return res.status(400).json({ success: false, error: 'Missing start_time or end_time' });
    }

    const cleanSummaryRaw = summary != null ? unwrap(summary) : '';
    const cleanSummary = isEmpty(cleanSummaryRaw) ? 'Reminder' : cleanSummaryRaw;

    const calendar = google.calendar({ version: 'v3', auth: getCalendarAuth() });

    const event = {
      summary: cleanSummary,
      start: { dateTime: cleanStartTime, timeZone: timeZone || 'Asia/Jakarta' },
      end: { dateTime: cleanEndTime, timeZone: timeZone || 'Asia/Jakarta' },
    };

    const calendarRes = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });

    return res.json({
      success: true,
      event_id: calendarRes.data.id,
      html_link: calendarRes.data.htmlLink,
    });
  } catch (error) {
    console.error('Calendar insert error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// Edit Reminder
// ---------------------------------------------------------

app.post('/api/reminder/edit-reminder', async (req, res) => {
  try {
    const id = unwrap(req.body.id);
    const newSummary = unwrap(req.body.new_summary);
    const newDate = unwrap(req.body.new_date);
    const newStartClock = unwrap(req.body.new_start_clock);
    const newEndClock = unwrap(req.body.new_end_clock);
    const timeZone = unwrap(req.body.timeZone) || 'Asia/Jakarta';

    if (isEmpty(id)) {
      return res.status(400).json({ success: false, error: 'Missing or invalid reminder id' });
    }

    if (isEmpty(newSummary) && isEmpty(newDate) && isEmpty(newStartClock) && isEmpty(newEndClock)) {
      return res.status(400).json({ success: false, error: 'No changes provided — nothing to update' });
    }

    const calendar = google.calendar({ version: 'v3', auth: getCalendarAuth() });

    let existing;
    try {
      const getRes = await calendar.events.get({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        eventId: id,
      });
      existing = getRes.data;
    } catch (err) {
      if (err.code === 404) {
        return res.status(404).json({ success: false, error: 'Reminder not found' });
      }
      throw err;
    }

    const patchBody = {};

    if (!isEmpty(newSummary)) {
      patchBody.summary = newSummary;
    }

    const wantsDateTimeChange = !isEmpty(newDate) || !isEmpty(newStartClock) || !isEmpty(newEndClock);
    if (wantsDateTimeChange) {
      const existingStartISO = existing.start?.dateTime || existing.start?.date;
      const existingEndISO = existing.end?.dateTime || existing.end?.date;

      const { newStartISO, newEndISO } = mergeReminderDateTime(
        existingStartISO,
        existingEndISO,
        newDate,
        newStartClock,
        newEndClock,
        ensureOffset('', '+07:00') 
      );

      patchBody.start = { dateTime: newStartISO, timeZone };
      patchBody.end = { dateTime: newEndISO, timeZone };
    }

    const calendarRes = await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: id,
      requestBody: patchBody,
    });

    return res.json({
      success: true,
      edited: true,
      event_id: calendarRes.data.id,
      summary: calendarRes.data.summary,
      start: calendarRes.data.start,
      end: calendarRes.data.end,
      html_link: calendarRes.data.htmlLink,
      fields_updated: Object.keys(patchBody),
    });
  } catch (error) {
    console.error('Calendar edit error:', error);
    if (error.code === 404) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// Search Edit
// ---------------------------------------------------------

app.post('/api/reminder/search-edit-reminder', async (req, res) => {
  try {
    const searchKeyword = unwrap(req.body.search_keyword);
    const searchDate = unwrap(req.body.search_date);
    const searchStartClock = unwrap(req.body.search_start_clock);

    const newSummary = unwrap(req.body.new_summary);
    const newDate = unwrap(req.body.new_date);
    const newStartClock = unwrap(req.body.new_start_clock);
    const newEndClock = unwrap(req.body.new_end_clock);
    const timeZone = unwrap(req.body.timeZone) || 'Asia/Jakarta';

    if (isEmpty(searchKeyword) && isEmpty(searchDate) && isEmpty(searchStartClock)) {
      return res.status(400).json({
        success: false,
        error: 'At least one search criterion (search_keyword, search_date, or search_start_clock) is required',
      });
    }

    if (isEmpty(newSummary) && isEmpty(newDate) && isEmpty(newStartClock) && isEmpty(newEndClock)) {
      return res.status(400).json({ success: false, error: 'No changes provided — nothing to update' });
    }

    const calendar = google.calendar({ version: 'v3', auth: getCalendarAuth() });

    const now = new Date();
    const timeMin = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const listRes = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin,
      timeMax,
      maxResults: 2500,
      singleEvents: true,
      showDeleted: false,
    });

    const items = listRes.data.items || [];

    const matches = items.filter((event) => {
      let ok = true;

      if (!isEmpty(searchKeyword)) {
        const summary = (event.summary || '').toLowerCase();
        ok = ok && summary.includes(String(searchKeyword).toLowerCase());
      }

      if (!isEmpty(searchDate)) {
        const startStr = event.start?.dateTime || event.start?.date || '';
        ok = ok && startStr.startsWith(searchDate);
      }

      if (!isEmpty(searchStartClock)) {
        const startDateTime = event.start?.dateTime || '';
        const clockPart = startDateTime.slice(11, 19);
        ok = ok && clockPart === searchStartClock;
      }

      return ok;
    });

    if (matches.length === 0) {
      return res.json({
        success: true,
        found: false,
        ambiguous: false,
        edited: false,
        candidates: [],
      });
    }

    if (matches.length > 1) {
      return res.json({
        success: true,
        found: false,
        ambiguous: true,
        edited: false,
        candidates: matches.map(mapEventToReminder),
      });
    }

    const matched = matches[0];
    const patchBody = {};

    if (!isEmpty(newSummary)) {
      patchBody.summary = newSummary;
    }

    const wantsDateTimeChange = !isEmpty(newDate) || !isEmpty(newStartClock) || !isEmpty(newEndClock);
    if (wantsDateTimeChange) {
      const existingStartISO = matched.start?.dateTime || matched.start?.date;
      const existingEndISO = matched.end?.dateTime || matched.end?.date;

      const { newStartISO, newEndISO } = mergeReminderDateTime(
        existingStartISO,
        existingEndISO,
        newDate,
        newStartClock,
        newEndClock
      );

      patchBody.start = { dateTime: newStartISO, timeZone };
      patchBody.end = { dateTime: newEndISO, timeZone };
    }

    const patchRes = await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: matched.id,
      requestBody: patchBody,
    });

    return res.json({
      success: true,
      found: true,
      ambiguous: false,
      edited: true,
      event: mapEventToReminder(patchRes.data),
      fields_updated: Object.keys(patchBody),
    });
  } catch (error) {
    console.error('Search-edit reminder error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// Delete Reminder
// ---------------------------------------------------------

app.post('/api/reminder/delete-reminder', async (req, res) => {
  try {
    const id = unwrap(req.body.id);

    if (isEmpty(id)) {
      return res.status(400).json({ success: false, error: 'Missing or invalid reminder id' });
    }

    const calendar = google.calendar({ version: 'v3', auth: getCalendarAuth() });

    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: id,
    });

    return res.json({ success: true, deleted_id: id });
  } catch (error) {
    console.error('Calendar delete error:', error);
    if (error.code === 410 || error.code === 404) {
      return res.status(404).json({ success: false, error: 'Reminder not found or already deleted' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------
// List Reminder
// ---------------------------------------------------------

app.post('/api/reminder/list-reminder', async (req, res) => {
  try {
    const body = req.body || {};
    const DEFAULT_OFFSET = '+07:00';

    const queryModeRaw = unwrap(body.query_mode);
    const queryMode = isEmpty(queryModeRaw) ? 'event_time' : String(queryModeRaw);

    const timeMinRaw = unwrap(body.timeMin);
    const timeMaxRaw = unwrap(body.timeMax);
    const createdMinRaw = unwrap(body.createdMin);
    const createdMaxRaw = unwrap(body.createdMax);
    const updatedMinRaw = unwrap(body.updatedMin);
    const updatedMaxRaw = unwrap(body.updatedMax);
    const keywordRaw = unwrap(body.keyword);
    const maxResultsRaw = unwrap(body.maxResults);

    const requestedMaxResults = isEmpty(maxResultsRaw) ? 20 : parseInt(String(maxResultsRaw), 10);
    const keyword = isEmpty(keywordRaw) ? undefined : String(keywordRaw);

    const timeMin = ensureOffset(timeMinRaw, DEFAULT_OFFSET);
    const timeMax = ensureOffset(timeMaxRaw, DEFAULT_OFFSET);
    const createdMin = ensureOffset(createdMinRaw, DEFAULT_OFFSET);
    const createdMax = ensureOffset(createdMaxRaw, DEFAULT_OFFSET);
    const updatedMinFilter = ensureOffset(updatedMinRaw, DEFAULT_OFFSET);
    const updatedMaxFilter = ensureOffset(updatedMaxRaw, DEFAULT_OFFSET);

    const calendar = google.calendar({ version: 'v3', auth: getCalendarAuth() });
    let items = [];

    if (queryMode === 'created_time' || queryMode === 'updated_time') {
      const nativeUpdatedMin = queryMode === 'created_time' ? createdMin : updatedMinFilter;

      const calendarRes = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        timeMin: '2000-01-01T00:00:00Z',
        updatedMin: nativeUpdatedMin || undefined,
        maxResults: 2500,
        singleEvents: true,
        showDeleted: false,
        q: keyword,
      });

      items = calendarRes.data.items || [];

      if (queryMode === 'created_time') {
        items = items.filter((e) => {
          if (!e.created) return false;
          const createdTime = new Date(e.created).getTime();
          if (createdMin && createdTime < new Date(createdMin).getTime()) return false;
          if (createdMax && createdTime > new Date(createdMax).getTime()) return false;
          return true;
        });
        items.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      } else {
        items = items.filter((e) => {
          if (!e.updated) return false;
          const updatedTime = new Date(e.updated).getTime();
          if (updatedMinFilter && updatedTime < new Date(updatedMinFilter).getTime()) return false;
          if (updatedMaxFilter && updatedTime > new Date(updatedMaxFilter).getTime()) return false;
          return true;
        });
        items.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
      }

      items = items.slice(0, isNaN(requestedMaxResults) ? 20 : requestedMaxResults);
    } else {
      const calendarRes = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || undefined,
        maxResults: isNaN(requestedMaxResults) ? 20 : requestedMaxResults,
        singleEvents: true,
        showDeleted: false,
        orderBy: 'startTime',
        q: keyword,
      });
      items = calendarRes.data.items || [];
    }

    const events = items.map(mapEventToReminder);

    return res.json({
      success: true,
      count: events.length,
      query_mode: queryMode,
      reminders: events,
    });
  } catch (error) {
    console.error('Calendar list error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback
app.get('/api/reminder/ping', (req, res) => res.json({ message: 'Express Serverless Function is running!' }));

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;